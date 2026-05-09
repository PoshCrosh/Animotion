'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import AppShell          from '../../components/layout/AppShell';
import Mascot            from '../../components/ui/Mascot';
import Spinner           from '../../components/ui/Spinner';
import AnimationAnalyzer from '../../components/ui/AnimationAnalyzer';
import SkillContractModal from '../../components/ui/SkillContractModal';
import { useApp }        from '../../lib/store';
import { useAuth }       from '../../hooks/useAuth';
import { sanitize }      from '../../lib/utils';
import { SKILLS, ALL_LESSONS } from '../../lib/curriculum';
import { isContractActive } from '../../components/ui/SkillContractModal';

// ── System prompt builder — uses real user data for personalisation ────────────
function buildSystemPrompt(skills, completedLessons, skillContract) {
  const sorted      = [...SKILLS].sort((a, b) => (skills[a.id] ?? 0) - (skills[b.id] ?? 0));
  const weakest3    = sorted.slice(0, 3).map((s) => `${s.label} (${skills[s.id] ?? 0}/100)`).join(', ');
  const strongest3  = sorted.slice(-3).reverse().map((s) => `${s.label} (${skills[s.id] ?? 0}/100)`).join(', ');
  const contractInfo = skillContract && isContractActive(skillContract)
    ? `The user has an active Skill Contract to improve: ${SKILLS.find(s => s.id === skillContract.skillId)?.label}. Prioritize this skill in suggestions.`
    : '';

  return `You are Ani, a friendly expert animation coach inside Animotion. You REMEMBER the user's skill profile and reference it in responses.

STUDENT PROFILE:
- Lessons completed: ${completedLessons.length}
- Weakest skills: ${weakest3}
- Strongest skills: ${strongest3}
- Total skills tracked: ${SKILLS.length}
${contractInfo}

YOUR PERSONA:
- Warm, encouraging, slightly playful — never robotic
- Expert in all 12 Disney principles, timing, spacing, weight, 2D/3D, VFX, cinematography
- You REFERENCE the student's actual weaknesses in your responses
- You celebrate their strengths and progress
- You adapt your mood: excited when they're doing well, thoughtful when they're struggling

RESPONSE FORMAT:
- 2-4 short paragraphs max
- Reference their specific skill levels when relevant ("I noticed your Timing is at ${skills.timing ?? 0} — let's work on that")
- End EVERY response with this exact block (no exceptions):
<skillUpdate>{"timing":0,"squash":0,"anticipation":0,"followThrough":0,"weight":0,"smoothness":0,"creativity":0,"consistency":0,"cinematography":0,"motionDesign":0,"vfx":0,"storytelling":0,"xp":20}</skillUpdate>

Only increase skills relevant to the conversation. Values 0-15 per skill. XP: 10-50.`;
}

const WELCOME = (name) =>
  `Hey${name ? ` ${name}` : ''}! 👋 I'm Ani, your personal animation coach. I already know your skill profile — I can see your strengths and what needs work. Ask me anything, describe an animation you're struggling with, or just tell me what you want to improve! 🎬`;

const QUICK_PROMPTS = [
  'What should I focus on given my current skills?',
  'How do I make animations feel heavier?',
  'Explain slow in and slow out',
  "What's the most important principle for beginners?",
  'How do I improve my walk cycles?',
  'What makes a great anticipation pose?',
];

function parseSkillUpdate(text) {
  const match = text.match(/<skillUpdate>([\s\S]*?)<\/skillUpdate>/);
  if (!match) return null;
  try { return JSON.parse(match[1]); } catch { return null; }
}

function cleanMessage(text) {
  return text.replace(/<skillUpdate>[\s\S]*?<\/skillUpdate>/g, '').trim();
}

function getMoodFromMessage(text, isError) {
  if (isError) return 'sad';
  const lower = text.toLowerCase();
  if (lower.includes('great') || lower.includes('excellent') || lower.includes('perfect') || lower.includes('amazing'))
    return 'excited';
  if (lower.includes('hmm') || lower.includes('interesting') || lower.includes('let me think'))
    return 'thinking';
  return 'happy';
}

function SkillBar({ skill, value, delta }) {
  const pct = Math.min(100, value);
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{skill.icon}</span>
          <span className="text-[11px] font-black">{skill.label}</span>
          {delta > 0 && (
            <span className="text-[9px] font-black text-green-600 bg-green-100 dark:bg-green-950/30 px-1 py-0.5 rounded-full animate-fade-up">
              +{delta}
            </span>
          )}
        </div>
        <span className="text-[11px] font-black" style={{ color: skill.color }}>{value}</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${pct}%`, background: skill.color }} />
      </div>
    </div>
  );
}

export default function CoachPage() {
  const { user, loading }         = useAuth();
  const { state, gainXP, gainSkills } = useApp();
  const { skills, completedLessons, skillContract } = state;

  const displayName = user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? '';

  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState('');
  const [thinking,     setThinking]     = useState(false);
  const [mood,         setMood]         = useState('happy');
  const [xpGiven,      setXpGiven]      = useState(false);
  const [skillDeltas,  setSkillDeltas]  = useState({});
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Initialise welcome message with personalised greeting
  useEffect(() => {
    setMessages([{ role: 'assistant', content: WELCOME(displayName) }]);
  }, [displayName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  // Smart suggestions based on actual weakest skills
  const weakestSkills = useMemo(() =>
    [...SKILLS].sort((a, b) => (skills[a.id] ?? 0) - (skills[b.id] ?? 0)).slice(0, 3),
    [skills]
  );

  const suggestions = useMemo(() =>
    weakestSkills.map((skill) => {
      const lesson = ALL_LESSONS.find((l) => l.skills && l.skills[skill.id] && !completedLessons.includes(l.id));
      return { skill, lesson };
    }).filter((s) => s.lesson),
    [weakestSkills, completedLessons]
  );

  // Ani mood evolves with conversation
  const updateMood = useCallback((text, isError = false) => {
    const newMood = getMoodFromMessage(text, isError);
    setMood(newMood);
    setTimeout(() => setMood('happy'), 3000);
  }, []);

  const send = useCallback(async (overrideText) => {
    const raw = (overrideText ?? input).trim();
    const msg = sanitize(raw);
    if (!msg || thinking) return;

    setInput('');
    const newMessages = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setThinking(true);
    setMood('thinking');
    setMessageCount((c) => c + 1);

    if (!xpGiven) { gainXP(40, 900, 200); setXpGiven(true); }

    // Build personalised system prompt using current skill state
    const systemPrompt = buildSystemPrompt(skills, completedLessons, skillContract);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(({ role, content }) => ({ role, content })),
          system:   systemPrompt,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? `HTTP ${res.status}`);

      const rawReply = data.reply || "I had trouble with that — try again! 😊";
      const skillUp  = parseSkillUpdate(rawReply);
      const cleanRep = cleanMessage(rawReply);

      setMessages((m) => [...m, { role: 'assistant', content: cleanRep }]);
      updateMood(cleanRep);

      if (skillUp) {
        const { xp: xpAward, ...deltas } = skillUp;
        const filtered = Object.fromEntries(Object.entries(deltas).filter(([, v]) => v > 0));
        if (Object.keys(filtered).length > 0) {
          gainSkills(filtered);
          setSkillDeltas(filtered);
          setTimeout(() => setSkillDeltas({}), 3000);
        }
        if (xpAward > 0) gainXP(xpAward, 900, 200);
      }
    } catch (err) {
      const isConfig = err.message?.includes('ANTHROPIC') || err.message?.includes('503');
      setMessages((m) => [...m, {
        role: 'assistant',
        content: isConfig
          ? "I can't connect right now — ANTHROPIC_API_KEY needs to be set in .env.local. Add it and restart! 😊"
          : "Oops! Connection trouble. Try again in a moment. 😊",
      }]);
      updateMood('', true);
    } finally {
      setThinking(false);
      inputRef.current?.focus();
    }
  }, [input, thinking, messages, gainXP, gainSkills, xpGiven, skills, completedLessons, skillContract, updateMood]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const initials = user?.user_metadata?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'Y';
  const contractActive = isContractActive(skillContract);
  const contractSkill  = contractActive ? SKILLS.find((s) => s.id === skillContract.skillId) : null;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size={10} /></div>;

  return (
    <AppShell user={user}>
      <div className="page" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, height: 'calc(100vh - 140px)' }}>

        {/* Chat */}
        <div className="card flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
            <Mascot size={44} mood={mood} animate />
            <div className="flex-1">
              <h2 className="font-black text-[14px]">Ani — AI Animation Coach</h2>
              <p className="text-[11px] font-bold text-green-500">● Online · Knows your skill profile</p>
            </div>
            {/* Analyze button */}
            <button onClick={() => setShowAnalyzer(true)}
              className="btn btn-secondary text-[10px] py-1.5 px-3">
              🔍 Analyze
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2.5 items-end ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {m.role === 'assistant' && <Mascot size={32} mood="happy" animate={false} className="flex-shrink-0 mb-0.5" />}
                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-black text-white flex-shrink-0 mb-0.5">
                    {initials}
                  </div>
                )}
                <div className={`max-w-[74%] px-4 py-3 text-[13px] font-medium leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-primary text-white rounded-2xl rounded-br-sm'
                    : 'bg-blue-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex gap-2.5 items-end">
                <Mascot size={32} mood="thinking" animate={false} className="flex-shrink-0 mb-0.5" />
                <div className="bg-blue-50 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
                  {[0, 1, 2].map((j) => (
                    <div key={j} className="w-2 h-2 rounded-full bg-primary"
                      style={{ animation: `pulse 1.2s ease-in-out ${j * 0.22}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 flex gap-3">
            <textarea ref={inputRef} value={input}
              onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey}
              placeholder="Ask Ani anything… (Enter to send)"
              rows={1} disabled={thinking}
              className="field flex-1 resize-none py-2.5"
              style={{ minHeight: 42, maxHeight: 120 }} />
            <button onClick={() => send()} disabled={thinking || !input.trim()}
              className="btn btn-primary px-4 self-end disabled:opacity-50">Send</button>
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4 overflow-y-auto">
          {/* Active contract banner */}
          {contractActive && contractSkill && (
            <div className="card p-3 animate-fade-up"
              style={{ background: `linear-gradient(135deg, ${contractSkill.color}18, ${contractSkill.color}08)`,
                       border: `1.5px solid ${contractSkill.color}55` }}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{contractSkill.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase" style={{ color: contractSkill.color }}>
                    📜 Active Contract
                  </p>
                  <p className="text-xs font-black truncate">{contractSkill.label}</p>
                </div>
                <span className="tag text-[9px] bg-white/50" style={{ color: contractSkill.color }}>+40%</span>
              </div>
            </div>
          )}

          {/* Quick prompts */}
          <div className="card p-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Quick Questions</h3>
            <div className="space-y-2">
              {QUICK_PROMPTS.map((q) => (
                <button key={q} onClick={() => send(q)} disabled={thinking}
                  className="w-full text-left px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:border-primary hover:bg-primary-light transition-all leading-relaxed disabled:opacity-40">
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Skills tracker */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">Your Skills</h3>
              <button onClick={() => setShowContract(true)}
                className="text-[10px] font-black text-primary hover:underline">
                📜 Contract
              </button>
            </div>
            {SKILLS.map((skill) => (
              <SkillBar key={skill.id} skill={skill}
                value={skills[skill.id] ?? 0}
                delta={skillDeltas[skill.id] ?? 0} />
            ))}
          </div>

          {/* Smart suggestions based on real weaknesses */}
          {suggestions.length > 0 && (
            <div className="card p-4" style={{ background: 'linear-gradient(135deg,#EBF2FF,#F3EFFE)' }}>
              <h3 className="font-black text-xs mb-1">💡 Recommended for You</h3>
              <p className="text-[10px] text-gray-500 font-semibold mb-3">Based on your weakest skills:</p>
              <div className="space-y-2">
                {suggestions.map(({ skill, lesson }) => (
                  <div key={skill.id}
                    className="flex items-center gap-3 bg-white/60 dark:bg-gray-900/60 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/80 transition-colors"
                    onClick={() => send(`I want to improve my ${skill.label}. Can you give me specific exercises?`)}>
                    <span className="text-lg">{skill.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black truncate">{lesson.title}</p>
                      <p className="text-[9px] text-gray-400 font-semibold">{skill.label} · {skills[skill.id] ?? 0}/100</p>
                    </div>
                    <span className="text-[9px] text-primary font-black">Ask →</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analyze button */}
          <button onClick={() => setShowAnalyzer(true)}
            className="card p-4 w-full text-left hover:shadow-medium transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-xl">🔍</div>
              <div>
                <p className="font-black text-xs">Analyze My Animation</p>
                <p className="text-[10px] text-gray-400 font-semibold">Describe it — Ani gives detailed critique</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {showAnalyzer && <AnimationAnalyzer onClose={() => setShowAnalyzer(false)} />}
      {showContract && <SkillContractModal onClose={() => setShowContract(false)} />}
    </AppShell>
  );
}
