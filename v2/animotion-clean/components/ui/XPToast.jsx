'use client';
import { useEffect } from 'react';

export default function XPToast({ id, amount, x, y, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 900);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      aria-hidden="true"
      className="fixed pointer-events-none z-[9999] font-black text-xl select-none animate-xp-pop"
      style={{ left: x - 20, top: y - 24, color: '#D4831A', textShadow: '0 2px 8px rgba(255,179,71,.45)' }}
    >
      +{amount} XP ⭐
    </div>
  );
}
