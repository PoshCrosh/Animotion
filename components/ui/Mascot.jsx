'use client';
import { useState, useEffect } from 'react';

export default function Mascot({ size = 48, mood = 'happy', animate = true, className = '' }) {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (!animate) return;
    const schedule = () => {
      const t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 120);
        schedule();
      }, 2200 + Math.random() * 2000);
      return t;
    };
    const t = schedule();
    return () => clearTimeout(t);
  }, [animate]);

  const eyeH = blink ? 1.5 : 7;

  return (
    <svg
      width={size} height={size} viewBox="0 0 48 48"
      className={`${animate ? 'animate-float' : ''} ${className}`}
      aria-label="Ani mascot"
    >
      <defs>
        <radialGradient id={`mascot-grad-${size}`} cx="38%" cy="32%">
          <stop offset="0%"   stopColor="#7BBCFF" />
          <stop offset="100%" stopColor="#4A8AEA" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="20" fill={`url(#mascot-grad-${size})`} />
      <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      {/* Eye whites */}
      <circle cx="17" cy="21" r="5.5" fill="white" />
      <circle cx="31" cy="21" r="5.5" fill="white" />
      {/* Pupils */}
      <rect x="14" y={21 - eyeH / 2} width="6" height={eyeH} rx="3" fill="#1A1D2E" />
      <rect x="28" y={21 - eyeH / 2} width="6" height={eyeH} rx="3" fill="#1A1D2E" />
      {/* Eye shine */}
      <circle cx="14.5" cy="18.5" r="1.4" fill="white" opacity="0.9" />
      <circle cx="28.5" cy="18.5" r="1.4" fill="white" opacity="0.9" />
      {/* Cheeks */}
      <circle cx="11.5" cy="24.5" r="4.5" fill="#FF8FAB" opacity="0.42" />
      <circle cx="36.5" cy="24.5" r="4.5" fill="#FF8FAB" opacity="0.42" />
      {/* Mouths */}
      {mood === 'happy'    && <path d="M18 29 Q24 34 30 29" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" />}
      {mood === 'thinking' && <path d="M18 30 Q24 28 30 30" stroke="white" strokeWidth="2"   strokeLinecap="round" fill="none" />}
      {mood === 'excited'  && <path d="M16 28 Q24 36 32 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />}
      {mood === 'sad'      && <path d="M18 31 Q24 27 30 31" stroke="white" strokeWidth="2"   strokeLinecap="round" fill="none" />}
      {/* Decorators */}
      {mood === 'thinking' && <text x="35" y="10" fontSize="10">💭</text>}
      {mood === 'excited'  && <text x="36" y="10" fontSize="10">✨</text>}
    </svg>
  );
}
