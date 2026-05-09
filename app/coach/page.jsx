'use client';
import { useState, useRef, useEffect } from 'react';
import AppShell from '../../components/layout/AppShell';
import Mascot   from '../../components/ui/Mascot';
import Spinner  from '../../components/ui/Spinner';
import { useApp }  from '../../lib/store';
import { useAuth } from '../../hooks/useAuth';
import { SKILLS, DEFAULT_SKILLS, ALL_LESSONS } from '../../lib/curriculum';

const QUICK_PROMPTS = [
  'Explain timing vs spacing',
  'How do I make a walk cycle?',
  'What is squash and stretch?',
  'Help me with follow through',
  'How do I add weight to my animation?',
  'What is anticipation in animation?',
];

function SkillBarMini({ skill, value, delta }) {
  const pct = Math.min(100, Math.max(0, value ?? 0));
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px]">{skill.icon}</span>
          <span className="text-[10px] font-black" style={{ color:'#1E3A4A' }}>{skill.label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {delta > 0 && <span className="text-[9px] font-black text-white px-1.5 py-0.5 rounded-full" style={{ background:'#52C97C' }}>+{delta}</span>}
          <span className="text-[10px] font-black" style={{ color:skill.color }}>{pct}</span>
        </div>
      </div>
      <div className="wii-skill-track">
        <div className="wii-skill-fill" style={{ width:`${pct}%`, background:skill.color }} />
      </div>
    </div>
  );
}

export default function CoachPage() {
  const { user, loading } = useAuth();
  const { state, dispatch } = useApp();
  const { skills, xp } = state;
  const merged = { ...DEFAULT_SKILLS, ...(skills ?? {}) };

  const [messages,  setMessages]  = useState([{ role:'assistant', content:"Hey! I'm Ani 👋 I'm your animation coach. Ask me anything about the 12 principles, timing, walk cycles, acting — whatever you're working on!" }]);
  const [input,     setInput]     = useState('');
  const [loading2,  setLoading2]  = useState(false);
  const [deltas,    setDeltas]    = useState({});
  const [mood,      setMood]      = useState('happy');
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const weakestSkills = [...SKILLS].sort((a,b) => (merged[a.id]??0)-(merged[b.id]??0)).slice(0,3);
  const suggestions = weakestSkills.map(s => ALL_LESSONS.find(l => l.skills?.[s.id])).filter(Boolean).slice(0,3);

  const buildSystem = () => `You are Ani, a warm, expert animation coach in Animotion. The student's current skills: ${JSON.stringify(merged)}. Their weakest skills: ${weakestSkills.map(s=>s.label).join(', ')}. Give specific, book-quality advice referencing Thomas & Johnston and Richard Williams when relevant. Keep replies to 2-4 short paragraphs. Always end with the skillUpdate JSON tag.\n\n<skillUpdate>\n{"timing":0,"squash":0,"anticipation":0,"followThrough":0,"weight":0,"smoothness":0,"creativity":0,"consistency":0,"cinematography":0,"motionDesign":0,"vfx":0,"storytelling":0,"xp":20}\n</skillUpdate>`;

  async function send(text) {
    const msg = text ?? input.trim();
    if (!msg || loading2) return;
    setInput('');
    setLoading2(true);
    setMood('thinking');
    const next = [...messages, { role:'user', content:msg }];
    setMessages(next);

    try {
      const res = await fetch('/api/chat', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ system: buildSystem(), messages: next }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Parse skillUpdate
      const raw = data.reply ?? '';
      const tagMatch = raw.match(/<skillUpdate>([\s\S]*?)<\/skillUpdate>/);
      let cleanReply = raw.replace(/<skillUpdate>[\s\S]*?<\/skillUpdate>/g,'').trim();

      if (tagMatch) {
        try {
          const parsed = JSON.parse(tagMatch[1].trim());
          const newDeltas = {};
          Object.entries(parsed).forEach(([k,v]) => { if(k!=='xp'&&v>0) newDeltas[k]=v; });
          setDeltas(newDeltas);
          if (parsed.xp) dispatch({ type:'GAIN_XP', amount:parsed.xp, label:'AI Coach chat' });
          if (Object.keys(newDeltas).length) dispatch({ type:'GAIN_SKILLS', deltas:newDeltas });
          setTimeout(() => setDeltas({}), 3000);
        } catch {}
      }

      setMessages([...next, { role:'assistant', content:cleanReply }]);
      setMood('excited');
      setTimeout(() => setMood('happy'), 3000);
    } catch (err) {
      setMessages([...next, { role:'assistant', content:`⚠️ ${err.message}` }]);
      setMood('sad');
      setTimeout(() => setMood('happy'), 3000);
    } finally {
      setLoading2(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background:'#EAF6FB' }}><Spinner size={10}/></div>;

  return (
    <AppShell user={user}>
      <div className="page flex gap-5" style={{ height:'calc(100vh - 54px - 56px)', minHeight:0 }}>

        {/* ── Chat panel ── */}
        <div className="wii-card flex flex-col flex-1 overflow-hidden" style={{ minHeight:0 }}>
          {/* Chat header */}
          <div className="flex items-center gap-3 p-4" style={{ borderBottom:'1.5px solid rgba(0,154,199,0.12)' }}>
            <Mascot size={40} mood={mood} animate />
            <div>
              <p className="font-black text-[14px]" style={{ color:'#1E3A4A' }}>Ani — Your Animation Coach</p>
              <p className="text-[10px] font-semibold" style={{ color:'#009AC7' }}>● Online · Expert in all 12 principles</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role==='user' ? 'justify-end' : 'justify-start'}`}>
                {m.role==='assistant' && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0 mt-1"
                    style={{ background:'linear-gradient(135deg,#009AC7,#007AAA)' }}>🤖</div>
                )}
                <div className="max-w-[78%] px-4 py-3 rounded-2xl text-[13px] font-semibold leading-relaxed"
                  style={{
                    background: m.role==='user'
                      ? 'linear-gradient(135deg,#009AC7,#007AAA)'
                      : 'rgba(255,255,255,0.9)',
                    color: m.role==='user' ? 'white' : '#1E3A4A',
                    border: m.role==='assistant' ? '1.5px solid rgba(0,154,199,0.15)' : 'none',
                    boxShadow: '0 2px 8px rgba(0,120,180,0.1)',
                    borderRadius: m.role==='user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading2 && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-base" style={{ background:'linear-gradient(135deg,#009AC7,#007AAA)' }}>🤖</div>
                <div className="px-4 py-3 rounded-2xl" style={{ background:'rgba(255,255,255,0.9)', border:'1.5px solid rgba(0,154,199,0.15)' }}>
                  <div className="flex gap-1 items-center h-5">
                    {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full" style={{ background:'#009AC7', animation:`wii-float ${0.6+i*0.15}s ease-in-out infinite` }}/>)}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Quick prompts */}
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
            {QUICK_PROMPTS.map(p => (
              <button key={p} onClick={() => send(p)} disabled={loading2}
                className="wii-btn text-[10px] flex-shrink-0"
                style={{ background:'rgba(0,154,199,0.08)', color:'#009AC7', border:'1px solid rgba(0,154,199,0.2)', padding:'5px 10px' }}>
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 flex gap-2" style={{ borderTop:'1.5px solid rgba(0,154,199,0.12)' }}>
            <input
              className="wii-input flex-1"
              placeholder="Ask Ani anything about animation…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key==='Enter' && !e.shiftKey && (e.preventDefault(), send())}
              disabled={loading2}
            />
            <button onClick={() => send()} disabled={!input.trim()||loading2} className="wii-btn wii-btn-primary px-5">
              {loading2 ? '…' : 'Send →'}
            </button>
          </div>
        </div>

        {/* ── Skills sidebar ── */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-4">
          {/* Skills panel */}
          <div className="wii-card p-4 flex-1 overflow-y-auto">
            <p className="wii-section-label mb-3">🎯 YOUR SKILLS</p>
            {SKILLS.map(skill => (
              <SkillBarMini key={skill.id} skill={skill} value={merged[skill.id]??0} delta={deltas[skill.id]??0}/>
            ))}
          </div>

          {/* Lesson recommendations */}
          {suggestions.length > 0 && (
            <div className="wii-card p-4">
              <p className="wii-section-label mb-3">📖 RECOMMENDED</p>
              <div className="space-y-2">
                {suggestions.map(l => (
                  <div key={l.id} className="rounded-2xl p-3 flex items-center gap-2"
                    style={{ background:'rgba(0,154,199,0.06)', border:'1px solid rgba(0,154,199,0.12)' }}>
                    <span className="text-lg">{l.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-[11px] truncate" style={{ color:'#1E3A4A' }}>{l.title}</p>
                      <p className="text-[9px] font-semibold" style={{ color:'#9AB5C0' }}>+{l.xp} XP</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
