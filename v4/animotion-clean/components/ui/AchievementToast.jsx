'use client';
import { useState, useEffect, useRef } from 'react';
import { useApp }                from '../../lib/store';
import { getEarnedAchievements } from '../../lib/rewards';

export default function AchievementToast() {
  const { state }     = useApp();
  const [queue,  setQueue]  = useState([]);
  const [active, setActive] = useState(null);
  const prevEarned = useRef(new Set());

  // Watch state for new achievements
  useEffect(() => {
    const earned = getEarnedAchievements(state);
    const earnedIds = new Set(earned.map((a) => a.id));
    const newOnes   = earned.filter((a) => !prevEarned.current.has(a.id));
    prevEarned.current = earnedIds;

    if (newOnes.length > 0) {
      setQueue((q) => [...q, ...newOnes]);
    }
  }, [state.xp, state.completedLessons, state.completedBosses, state.skills]); // eslint-disable-line

  // Process queue
  useEffect(() => {
    if (queue.length === 0 || active) return;
    const [next, ...rest] = queue;
    setActive(next);
    setQueue(rest);
    const t = setTimeout(() => setActive(null), 3500);
    return () => clearTimeout(t);
  }, [queue, active]);

  if (!active) return null;

  return (
    <div
      className="fixed bottom-20 right-6 z-[9999] animate-fade-up"
      style={{ maxWidth: 280 }}
    >
      <div className="card p-4 shadow-strong border-amber-200 dark:border-amber-800"
        style={{ background: 'linear-gradient(135deg,#FFF8ED,#FFFBF0)' }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-2xl flex-shrink-0">
            {active.icon}
          </div>
          <div>
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
              🏅 Achievement Unlocked!
            </p>
            <p className="font-black text-sm text-gray-800">{active.name}</p>
            <p className="text-[11px] text-gray-500 font-semibold">{active.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
