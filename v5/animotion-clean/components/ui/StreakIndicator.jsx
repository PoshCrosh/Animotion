'use client';
import { useState, useEffect, useCallback } from 'react';
import { calculateStreak, getStreakData, saveStreakData, getMultiplier } from '../../lib/streak';
import { useApp }  from '../../lib/store';
import { useAuth } from '../../hooks/useAuth';

function StreakPopover({ data, onClose }) {
  const mult = getMultiplier(data.streak);
  return (
    <div
      className="absolute top-full right-0 mt-2 w-64 card p-4 shadow-strong z-50 animate-fade-up"
      style={{ minWidth: 220 }}
    >
      {/* Streak count */}
      <div className="text-center mb-3">
        <div className="text-4xl font-black text-amber-500 leading-none">{data.streak}</div>
        <div className="text-xs font-black text-gray-500">Day Streak 🔥</div>
      </div>

      {/* XP multiplier */}
      {mult > 1 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl px-3 py-2 mb-3 text-center">
          <p className="text-xs font-black text-amber-700">
            {mult}× XP Multiplier Active!
          </p>
          <p className="text-[10px] text-amber-600 font-semibold">All XP boosted by {Math.round((mult - 1) * 100)}%</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-blue-50 dark:bg-gray-800 rounded-xl p-2 text-center">
          <p className="font-black text-sm text-primary">{data.longestStreak}</p>
          <p className="text-[9px] text-gray-400 font-bold">Best Streak</p>
        </div>
        <div className="bg-blue-50 dark:bg-gray-800 rounded-xl p-2 text-center">
          <p className="font-black text-sm text-amber-500">{data.freezesAvailable}</p>
          <p className="text-[9px] text-gray-400 font-bold">Freezes Left</p>
        </div>
      </div>

      {/* Freeze info */}
      <p className="text-[10px] text-gray-400 font-semibold text-center">
        ❄️ Freeze saves your streak if you miss a day. Earn one every 7 days.
      </p>

      <button onClick={onClose}
        className="btn btn-secondary w-full text-xs mt-2 justify-center">
        Got it
      </button>
    </div>
  );
}

export default function StreakIndicator() {
  const { user }    = useAuth();
  const { gainXP }  = useApp();
  const [data,      setData]      = useState(null);
  const [showPopover, setShowPopover] = useState(false);
  const [bonusShown,  setBonusShown]  = useState(false);

  const initStreak = useCallback(() => {
    if (!user?.id) return;
    const existing  = getStreakData(user.id);
    const updated   = calculateStreak(existing);
    saveStreakData(user.id, updated);
    setData(updated);

    // Award streak bonus XP once per new day
    if (updated.isNewDay && !bonusShown) {
      setBonusShown(true);
      if (updated.streak > 1) {
        const bonusXP = Math.min(updated.streak * 5, 100);
        setTimeout(() => gainXP(bonusXP, 900, 60), 1500);
      }
    }
  }, [user, gainXP, bonusShown]);

  useEffect(() => {
    initStreak();
  }, [user?.id]); // eslint-disable-line

  if (!data) return null;

  const isHot   = data.streak >= 7;
  const isWarm  = data.streak >= 3;
  const fireColor = isHot ? '#FF5757' : isWarm ? '#FFB347' : '#D1D5DB';

  return (
    <div className="relative">
      <button
        onClick={() => setShowPopover((s) => !s)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all hover:scale-105"
        style={{
          background: data.streak > 0 ? `${fireColor}18` : 'transparent',
          border: `1.5px solid ${data.streak > 0 ? fireColor + '55' : '#E5E7EB'}`,
        }}
        title={`${data.streak} day streak`}
      >
        <span
          className="text-base leading-none"
          style={{
            filter: data.streak >= 7 ? 'drop-shadow(0 0 6px rgba(255,87,87,0.7))' : 'none',
            animation: isHot ? 'floatY 1.5s ease-in-out infinite' : 'none',
          }}
        >
          🔥
        </span>
        <span className="font-black text-xs" style={{ color: fireColor }}>
          {data.streak}
        </span>
      </button>

      {showPopover && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowPopover(false)} />
          <div className="z-50 relative">
            <StreakPopover data={data} onClose={() => setShowPopover(false)} />
          </div>
        </>
      )}
    </div>
  );
}
