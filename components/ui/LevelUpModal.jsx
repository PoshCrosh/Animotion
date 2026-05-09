'use client';
import Mascot from './Mascot';

export default function LevelUpModal({ level, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.60)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card p-10 text-center max-w-sm w-full animate-level-up shadow-strong">
        <div className="text-6xl mb-3 animate-float inline-block">🎉</div>
        <p className="text-xs font-black text-gray-400 tracking-[3px] uppercase mb-2">Level Up!</p>
        <p className="font-black text-5xl text-primary tracking-tight mb-3">Level {level}!</p>
        <Mascot size={80} mood="excited" animate className="mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 font-semibold">
          You're leveling up fast! Keep animating to unlock more lessons and climb the ranks. 🚀
        </p>
        <button onClick={onClose} className="btn btn-primary w-full py-3 text-base">
          Let's Keep Going! 🎬
        </button>
      </div>
    </div>
  );
}
