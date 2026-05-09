'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import AppShell from '../../components/layout/AppShell';
import Mascot   from '../../components/ui/Mascot';
import Spinner  from '../../components/ui/Spinner';
import { useApp }  from '../../lib/store';
import { useAuth } from '../../hooks/useAuth';
import { sanitize } from '../../lib/utils';
import { SKILLS, ALL_LESSONS } from '../../lib/curriculum';

const SYSTEM_PROMPT = `You are Ani, a friendly expert animation coach inside Animotion. Tone: warm, encouraging, slightly playful, never robotic. You're an expert in all 12 Disney principles, timing, spacing, arcs, weight, squash/stretch, anticipation, follow-through, 2D/3D animation, VFX, character acting, and cinematography.

When analyzing animations or giving feedback, you MUST return a JSON block at the end of your response in this exact format (do not skip it):
<skillUpdate>{"timing":0,"squash":0,"anticipation":0,"followThrough":0,"weight":0,"smoothness":0,"creativity":0,"consistency":0,"cinematography":0,"motionDesign":0,"vfx":0,"storytelling":0,"xp":20}</skillUpdate>

Only increase skills that are relevant to what was discussed. Use values from 0-15 for skill increases. The "xp" field is the XP to award (10-50).

Give specific, actionable advice in 2-4 short paragraphs.`;

const WELCOME = "Hey! 👋 I'm Ani, your AI animation coach. I analyse your work and track your skill progression across 12 areas. Ask me anything about animation — or describe an animation you're working on for specific feedback and skill improvements! 🎬";

const QUICK_PROMPTS = [
  'How do I make animations feel heavier?',
  'Explain slow in and slow out',
  "What's the most important principle for beginners?",
  'How do I improve my walk cycles?',
  'What makes a great anticipation pose?',
  'How do I improve my timing?',
];

function parseSkillUpdate(text) {
  const match = text.match(/<skillUpdate>([\s\S]*?)<\/skillUpdate>/);
  if (!match) return null;
  try { return JSON.parse(match[1]); }
  catch { return null; }
}

function cleanMessage(text) {
  return text.replace(/<skillUpdate>[\s\S]*?<\/skillUpdate>/g, '').trim();
}

// ── Animated skill bar ────────────────────────────────────────────────────────
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
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width:`${pct}%`, background: skill.color }}
        />
      </div>
    </div>
  );
}

export default function CoachPage() {
  const { user, loading }        = useAuth();
  const { state, gainXP, gainSkills } = useApp();

  const [messages,    setMessages]    = useState([{ role:'assistant', content:WELCOME }]);
  const [input,       setInput]       = useState('');
  const [thinking,    setThinking]    = useState(false);
  const [mood,        setMood]        = useState('happy');
  const [xpGiven,     setXpGiven]     = useState(false);
  const [skillDeltas, setSkillDeltas] = useState({});

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, thinking]);

  const send = useCallback(async (overrideText) => {
    const raw = (overrideText ?? input).trim();
    const msg = sanitize(raw);
    if (!msg || thinking) return;

    setInput('');
    setMessages((m) => [...m, { role:'user', content:msg }]);
    setThinking(true);
    setMood('thinking');
    if (!xpGiven) { gainXP(40, 900, 200); setXpGiven(true); }

    try {
      const res = await fetch('/api/chat', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role:'user', content:msg }].map(({ role, content }) => ({ role, content })),
          system: SYSTEM_PROMPT,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? `HTTP ${res.status}`);

      const rawReply = data.reply || "I had trouble with that — try again! 😊";
      const skillUp  = parseSkillUpdate(rawReply);
      const cleanRep = cleanMessage(rawReply);

      setMessages((m) => [...m, { role:'assistant', content:cleanRep }]);

      if (skillUp) {
        const { xp: xpAward, ...deltas } = skillUp;
        // Only apply non-zero deltas
        const filtered = Object.fromEntries(Object.entries(deltas).filter(([,v]) => v > 0));
        if (Object.keys(filtered).length > 0) {
          gainSkills(filtered);
          setSkillDeltas(filtered);
          setTimeout(() => setSkillDeltas({}), 3000);
        }
        if (xpAward > 0) gainXP(xpAward, 900, 200);
      }

      setMood('excited');
      setTimeout(() => setMood('happy'), 2500);
    } catch (err) {
      const isConfig = err.message?.includes('ANTHROPIC') || err.message?.includes('503');
      setMessages((m) => [...m, {
        role:'assistant',
        content: isConfig
          ? "I can't connect right now — the ANTHROPIC_API_KEY needs to be set in your server environment (no NEXT_PUBLIC_ prefix). Add it to .env.local and restart. I'm still here though! 😊"
          : "Oops! Connection trouble. Try again in a moment. 😊",
      }]);
      setMood('sad');
      setTimeout(() => setMood('happy'), 3000);
    } finally {
      setThinking(false);
      inputRef.current?.focus();
    }
  }, [input, thinking, messages, gainXP, gainSkills, xpGiven]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  // Smart suggestions: find weakest skills and map to lessons
  const weakestSkills = [...SKILLS].sort((a,b) => (state.skills[a.id]??0) - (state.skills[b.id]??0)).slice(0,3);
  const suggestions   = weakestSkills.map(skill => {
    const lesson = ALL_LESSONS.find(l => l.skills && l.skills[skill.id]);
    return { skill, lesson };
  }).filter(s => s.lesson);

  const initials = user?.user_metadata?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'Y';

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size={10} /></div>;

  return (
    <AppShell user={user}>
      <div className="page" style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:16, height:'calc(100vh - 140px)' }}>

        {/* Chat */}
        <div className="card flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
            <Mascot size={44} mood={mood} animate />
            <div>
              <h2 className="font-black text-[14px]">Ani — AI Animation Coach</h2>
              <p className="text-[11px] font-bold text-green-500">● Online · Skills tracking active</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2.5 items-end ${m.role==='user' ? 'flex-row-reverse' : ''}`}>
                {m.role === 'assistant' && <Mascot size={32} mood="happy" animate={false} className="flex-shrink-0 mb-0.5" />}
                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-black text-white flex-shrink-0 mb-0.5">{initials}</div>
                )}
                <div className={`max-w-[74%] px-4 py-3 text-[13px] font-medium leading-relaxed whitespace-pre-wrap ${
                  m.role==='user'
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
                  {[0,1,2].map((j) => (
                    <div key={j} className="w-2 h-2 rounded-full bg-primary"
                      style={{ animation:`pulse 1.2s ease-in-out ${j*0.22}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 flex gap-3">
            <textarea ref={inputRef} value={input}
              onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey}
              placeholder="Ask Ani anything about animation… (Enter to send)"
              rows={1} disabled={thinking}
              className="field flex-1 resize-none py-2.5"
              style={{ minHeight:42, maxHeight:120 }} />
            <button onClick={() => send()} disabled={thinking || !input.trim()}
              className="btn btn-primary px-4 self-end disabled:opacity-50">Send</button>
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4 overflow-y-auto">
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
              <span className="text-[10px] text-gray-400 font-semibold">Chat to level up →</span>
            </div>
            {SKILLS.map((skill) => (
              <SkillBar key={skill.id} skill={skill}
                value={state.skills[skill.id] ?? 0}
                delta={skillDeltas[skill.id] ?? 0} />
            ))}
          </div>

          {/* Smart suggestions */}
          {suggestions.length > 0 && (
            <div className="card p-4" style={{ background:'linear-gradient(135deg,#EBF2FF,#F3EFFE)' }}>
              <h3 className="font-black text-xs mb-3">💡 Recommended for You</h3>
              <p className="text-[10px] text-gray-500 font-semibold mb-3">Based on your weakest skills:</p>
              <div className="space-y-2">
                {suggestions.map(({ skill, lesson }) => (
                  <div key={skill.id} className="flex items-center gap-3 bg-white/60 dark:bg-gray-900/60 rounded-xl px-3 py-2.5">
                    <span className="text-lg">{skill.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black truncate">{lesson.title}</p>
                      <p className="text-[9px] text-gray-400 font-semibold">{skill.label} · +{lesson.xp} XP</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tip */}
          <div className="card p-4 border-amber-200 dark:border-amber-800" style={{ background:'#FFF8ED' }}>
            <h3 className="font-black text-xs mb-2 text-amber-700">💡 How Skills Work</h3>
            <p className="text-xs text-amber-700 font-semibold leading-relaxed">
              Describe your animations or ask specific questions. Ani analyses your responses and increases the relevant skills. More specific questions = better skill gains!
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
