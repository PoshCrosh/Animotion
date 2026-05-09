'use client';
import { useApp }        from '../../lib/store';
import { fmtXP }         from '../../lib/utils';
import StreakIndicator   from '../ui/StreakIndicator';

export default function TopBar({ onFeedback, onDiag }) {
  const { state, dispatch } = useApp();
  const { dark, focusMode, xp } = state;

  return (
    <header
      className="fixed top-0 right-0 z-40 flex items-center justify-end gap-2.5 px-5 border-b border-gray-100 dark:border-gray-800 transition-colors"
      style={{
        left: 250,
        height: 54,
        background: dark ? 'rgba(17,24,39,.94)' : 'rgba(255,255,255,.94)',
        backdropFilter: 'blur(14px)',
      }}
    >
      {/* Focus mode */}
      <button
        onClick={() => dispatch({ type: 'SET_FOCUS', v: !focusMode })}
        className="btn btn-secondary text-xs px-3 py-1.5"
      >
        {focusMode ? '☀️ Exit Focus' : '🎯 Focus Mode'}
      </button>

      {/* Streak indicator */}
      <StreakIndicator />

      {/* XP badge */}
      <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-full">
        <span className="text-xs">⭐</span>
        <span className="font-black text-amber-700 dark:text-amber-400 text-xs">{fmtXP(xp)} XP</span>
      </div>

      {/* Feedback */}
      <button
        onClick={onFeedback}
        className="btn text-xs px-3 py-1.5 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
      >
        💬 Feedback
      </button>

      {/* Diagnostics */}
      <button
        onClick={onDiag}
        className="btn text-xs px-3 py-1.5 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400"
        title="Diagnostics panel"
      >
        🔧
      </button>

      {/* Dark mode */}
      <button
        onClick={() => dispatch({ type: 'SET_DARK', v: !dark })}
        className="w-9 h-9 rounded-full bg-primary-light dark:bg-gray-800 flex items-center justify-center text-lg transition-colors"
        aria-label="Toggle dark mode"
      >
        {dark ? '☀️' : '🌙'}
      </button>
    </header>
  );
}
