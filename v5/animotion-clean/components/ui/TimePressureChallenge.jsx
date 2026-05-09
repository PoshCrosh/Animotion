'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import MiniCanvasChallenge from '../lessons/exercises/MiniCanvasChallenge';
import { useApp }   from '../../lib/store';

const CHALLENGES = [
  { id: 'tp-1', title: 'Quick Bounce', prompt: 'Draw a ball bouncing once — squash on impact, stretch going up. GO!', timeSeconds: 45, xp: 60, skills: { timing: 8, squash: 10 } },
  { id: 'tp-2', title: 'Anticipation Pose', prompt: 'Draw a character in a full anticipation wind-up pose. Clock is ticking!', timeSeconds: 60, xp: 70, skills: { anticipation: 12 } },
  { id: 'tp-3', title: 'Impact Frame', prompt: 'Draw a fast impact frame — motion blur, smear, speed lines. Fast!', timeSeconds: 30, xp: 80, skills: { timing: 10, creativity: 8 } },
  { id: 'tp-4', title: 'Follow Through', prompt: 'Draw hair/clothing still moving after a character has stopped. Go!', timeSeconds: 50, xp: 65, skills: { followThrough: 12 } },
  { id: 'tp-5', title: 'Weight Study', prompt: 'Draw a character lifting something very heavy — show the strain!', timeSeconds: 55, xp: 70, skills: { weight: 12, creativity: 5 } },
];

function TimerRing({ seconds, total, size = 80 }) {
  const r    = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct  = seconds / total;
  const fill = circ * (1 - pct);
  const color = pct > 0.5 ? '#52C97C' : pct > 0.25 ? '#FFB347' : '#FF5757';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E5E7EB" strokeWidth="5" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={circ} strokeDashoffset={fill}
        strokeLinecap="round"
        style={{ transformOrigin: 'center', transform: 'rotate(-90deg)', transition: 'stroke-dashoffset 0.5s linear' }} />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fontSize={size * 0.24} fontWeight="900" fill={color}>
        {seconds}
      </text>
    </svg>
  );
}

export default function TimePressureChallenge({ onClose }) {
  const { gainXP, gainSkills, dispatch } = useApp();
  const [phase,      setPhase]     = useState('select');   // select | countdown | drawing | results
  const [challenge,  setChallenge] = useState(null);
  const [timeLeft,   setTimeLeft]  = useState(0);
  const [countdown,  setCountdown] = useState(3);
  const [done,       setDone]      = useState(false);
  const [submitted,  setSubmitted] = useState(false);
  const timerRef = useRef(null);

  // Countdown before drawing starts
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) { setPhase('drawing'); setTimeLeft(challenge.timeSeconds); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown, challenge]);

  // Drawing timer
  useEffect(() => {
    if (phase !== 'drawing') return;
    if (timeLeft <= 0) { setPhase('results'); return; }
    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [phase, timeLeft]);

  const handleStart = (ch) => {
    setChallenge(ch);
    setCountdown(3);
    setPhase('countdown');
  };

  const handleDrawSubmit = () => {
    clearTimeout(timerRef.current);
    setSubmitted(true);
    setPhase('results');

    // Award XP and skills
    const timeBonus = Math.round((timeLeft / challenge.timeSeconds) * 20);
    gainXP(challenge.xp + timeBonus, 700, 300);
    gainSkills(challenge.skills);
    dispatch({ type: 'COMPLETE_QUEST', id: 4 });
  };

  return (
    <div className="fixed inset-0 z-[9997] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.70)' }}
      onClick={(e) => e.target === e.currentTarget && phase === 'select' && onClose()}>
      <div className="card w-full max-w-[520px] max-h-[88vh] overflow-y-auto animate-fade-up shadow-strong">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-black text-base">⏱️ Time Pressure Challenge</h3>
            <p className="text-xs text-gray-400 font-semibold">Draw fast. Learn faster.</p>
          </div>
          {phase === 'select' && (
            <button onClick={onClose} className="text-xl text-gray-400 w-8 h-8 flex items-center justify-center">×</button>
          )}
        </div>

        <div className="p-6">

          {/* Select */}
          {phase === 'select' && (
            <div>
              <p className="text-[13px] font-semibold text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                Choose a challenge. You'll have limited time to draw your answer. Speed forces instinct — instinct reveals what you've truly learned.
              </p>
              <div className="space-y-3">
                {CHALLENGES.map((ch) => (
                  <button key={ch.id} onClick={() => handleStart(ch)}
                    className="w-full card p-4 text-left hover:-translate-y-0.5 hover:shadow-medium transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/20 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-lg">⏱️</span>
                        <span className="text-[9px] font-black text-red-500">{ch.timeSeconds}s</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-sm">{ch.title}</p>
                        <p className="text-[11px] text-gray-500 font-semibold leading-snug">{ch.prompt}</p>
                      </div>
                      <span className="tag bg-amber-50 text-amber-700 text-[10px] flex-shrink-0">+{ch.xp} XP</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Countdown */}
          {phase === 'countdown' && (
            <div className="text-center py-10">
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Get Ready!</p>
              <div className="text-8xl font-black text-primary animate-level-up">{countdown}</div>
              <p className="text-[13px] font-semibold text-gray-600 mt-6 leading-relaxed max-w-xs mx-auto">{challenge?.prompt}</p>
            </div>
          )}

          {/* Drawing */}
          {phase === 'drawing' && challenge && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-black text-base">{challenge.title}</p>
                  <p className="text-xs text-gray-500 font-semibold">{challenge.prompt}</p>
                </div>
                <TimerRing seconds={timeLeft} total={challenge.timeSeconds} size={70} />
              </div>

              {/* Urgency bar */}
              <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-4">
                <div className="h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${(timeLeft / challenge.timeSeconds) * 100}%`,
                    background: timeLeft / challenge.timeSeconds > 0.5 ? '#52C97C'
                      : timeLeft / challenge.timeSeconds > 0.25 ? '#FFB347' : '#FF5757',
                  }} />
              </div>

              <MiniCanvasChallenge prompt={challenge.prompt} onComplete={handleDrawSubmit} />

              <button onClick={handleDrawSubmit}
                className="btn btn-primary w-full justify-center mt-3 text-sm">
                ✓ Submit Early ({timeLeft}s remaining)
              </button>
            </div>
          )}

          {/* Results */}
          {phase === 'results' && challenge && (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">{submitted ? '🎉' : '⏰'}</div>
              <h3 className="font-black text-xl mb-2">
                {submitted ? 'Challenge Complete!' : "Time's Up!"}
              </h3>
              <p className="text-gray-500 text-sm font-semibold mb-4 leading-relaxed">
                {submitted
                  ? "Great work! Drawing under pressure trains your animation instincts."
                  : "Even unfinished drawings teach you something. Try again to beat the clock!"}
              </p>
              {submitted && (
                <div className="flex gap-3 justify-center mb-4 flex-wrap">
                  <span className="tag bg-amber-50 text-amber-700 font-black">+{challenge.xp} XP</span>
                  {Object.entries(challenge.skills).map(([k, v]) => (
                    <span key={k} className="tag bg-green-100 text-green-700 font-black text-[10px]">+{v} {k}</span>
                  ))}
                </div>
              )}
              <div className="flex gap-3 justify-center">
                <button onClick={() => { setPhase('select'); setChallenge(null); setDone(false); setSubmitted(false); }}
                  className="btn btn-secondary">Try Another</button>
                <button onClick={onClose} className="btn btn-primary">Done ✓</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
