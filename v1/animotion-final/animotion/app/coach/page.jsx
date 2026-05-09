'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import AppShell from '../../components/layout/AppShell';
import Mascot from '../../components/ui/Mascot';
import Spinner from '../../components/ui/Spinner';
import { useApp } from '../../lib/store';
import { useAuth } from '../../hooks/useAuth';
import { sanitize } from '../../lib/utils';

const WELCOME = "Hey! 👋 I'm Ani, your personal animation coach. Ask me anything about animation principles, timing, spacing, weight — or describe what you're working on for specific feedback. What's on your mind? 🎬";

const QUICK_PROMPTS = [
  'How do I make animations feel heavier?',
  'Explain slow in and slow out simply',
  "What's the most important principle for beginners?",
  'How do I improve my walk cycles?',
  'What makes a great anticipation pose?',
  'How should I start my first character animation?',
];

export default function CoachPage() {
  const { user, loading } = useAuth();
  const { gainXP } = useApp();

  const [messages,  setMessages]  = useState([{ role:'assistant', content:WELCOME }]);
  const [input,     setInput]     = useState('');
  const [thinking,  setThinking]  = useState(false);
  const [mood,      setMood]      = useState('happy');
  const [xpGiven,   setXpGiven]   = useState(false);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages, thinking]);

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
      // Calls our server-side API route — keeps Anthropic key secret
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role:'user', content:msg }].map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      setMessages((m) => [...m, { role:'assistant', content: data.reply || 'I had trouble with that — please try again! 😊' }]);
      setMood('excited');
      setTimeout(() => setMood('happy'), 2500);
    } catch (err) {
      const isConfig = err.message?.includes('ANTHROPIC_API_KEY') || err.message?.includes('503');
      setMessages((m) => [...m, {
        role: 'assistant',
        content: isConfig
          ? "I can't connect right now — the ANTHROPIC_API_KEY hasn't been set in the server environment yet. Add it to your .env.local file (no NEXT_PUBLIC_ prefix) and restart the dev server. I'm still here to help though! 😊"
          : "Oops! Connection trouble. Check your internet and try again — I'll be right here. 😊",
      }]);
      setMood('sad');
      setTimeout(() => setMood('happy'), 3000);
    } finally {
      setThinking(false);
      inputRef.current?.focus();
    }
  }, [input, thinking, messages, gainXP, xpGiven]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"><Spinner size={10} /></div>
  );

  const initials = user?.user_metadata?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'Y';

  return (
    <AppShell user={user}>
      <div className="page" style={{ display:'grid', gridTemplateColumns:'1fr 256px', gap:16, height:'calc(100vh - 140px)' }}>

        {/* Chat window */}
        <div className="card flex flex-col overflow-hidden">

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
            <Mascot size={44} mood={mood} animate />
            <div>
              <h2 className="font-black text-[14px]">Ani — AI Animation Coach</h2>
              <p className="text-[11px] font-bold text-green-500">● Online · Powered by Claude AI</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2.5 items-end ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {m.role === 'assistant' && (
                  <Mascot size={32} mood="happy" animate={false} className="flex-shrink-0 mb-0.5" />
                )}
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
                  {[0,1,2].map((j) => (
                    <div key={j} className="w-2 h-2 rounded-full bg-primary"
                      style={{ animation:`pulse 1.2s ease-in-out ${j*0.22}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 flex gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask Ani anything about animation… (Enter to send)"
              rows={1}
              disabled={thinking}
              className="field flex-1 resize-none py-2.5"
              style={{ minHeight:42, maxHeight:120 }}
            />
            <button
              onClick={() => send()}
              disabled={thinking || !input.trim()}
              className="btn btn-primary px-4 self-end"
            >
              Send
            </button>
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

          {/* Upload zone */}
          <div className="card p-4" style={{ background:'linear-gradient(135deg,#EBF2FF,#F3EFFE)' }}>
            <h3 className="font-black text-xs mb-2">📎 Upload for Analysis</h3>
            <p className="text-xs text-gray-500 font-semibold mb-3 leading-relaxed">
              Drop an MP4 or GIF to get frame-by-frame AI feedback on timing, spacing, and more.
            </p>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-5 text-center cursor-pointer hover:border-primary transition-colors">
              <div className="text-2xl mb-1.5">🎬</div>
              <p className="text-[11px] font-bold text-gray-400">Drop MP4 / GIF here</p>
              <p className="text-[10px] text-gray-400 mt-1">or click to browse</p>
            </div>
          </div>

          {/* Skill bars */}
          <div className="card p-4">
            <h3 className="font-black text-xs mb-3 text-gray-400 uppercase tracking-wider">Your Skill Levels</h3>
            <div className="space-y-2.5">
              {[
                ['Timing',  '72%', '#5B9CF6'],
                ['Spacing', '58%', '#9B7FEA'],
                ['Weight',  '81%', '#52C97C'],
                ['Appeal',  '45%', '#FF8FAB'],
                ['Arcs',    '63%', '#4ECDC4'],
              ].map(([k, p, c]) => (
                <div key={k}>
                  <div className="flex justify-between text-[11px] font-black mb-1">
                    <span>{k}</span><span style={{ color:c }}>{p}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-[width] duration-700" style={{ width:p, background:c }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tip */}
          <div className="card p-4 border-amber-200 dark:border-amber-800" style={{ background:'#FFF8ED' }}>
            <h3 className="font-black text-xs mb-2 text-amber-700">💡 Pro Tip</h3>
            <p className="text-xs text-amber-700 font-semibold leading-relaxed">
              Be specific when describing your animation! Instead of "it doesn't look right", try
              "the ball feels floaty when it lands." Specific problems get specific solutions.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
