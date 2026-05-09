'use client';
import { useApp }  from '../../lib/store';
import { fmtXP }   from '../../lib/utils';

export default function TopBar({ onFeedback, onDiag }) {
  const { state, dispatch } = useApp();
  const { dark, focusMode, xp } = state;

  return (
    <header
      className="fixed top-0 right-0 z-40 flex items-center justify-between px-5"
      style={{
        left:      250,
        height:    54,
        background: 'linear-gradient(180deg,rgba(255,255,255,0.95) 0%,rgba(224,246,253,0.92) 100%)',
        borderBottom: '1.5px solid rgba(0,154,199,0.15)',
        boxShadow: '0 2px 12px rgba(0,120,180,0.08)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Left — page breadcrumb area (empty, placeholder for future) */}
      <div />

      {/* Right — controls */}
      <div className="flex items-center gap-2">

        {/* Focus mode */}
        <button
          onClick={() => dispatch({ type: 'SET_FOCUS', v: !focusMode })}
          className="wii-btn wii-btn-ghost text-xs px-3 py-1.5 h-8"
          style={{ fontSize: 11 }}
        >
          {focusMode ? '☀️ Exit Focus' : '🎯 Focus'}
        </button>

        {/* XP badge */}
        <div className="wii-xp-pill flex items-center gap-1">
          <span style={{ fontSize: 12 }}>⭐</span>
          <span>{fmtXP(xp)} XP</span>
        </div>

        {/* Feedback */}
        <button
          onClick={onFeedback}
          className="wii-btn wii-btn-ghost h-8 px-3"
          style={{ fontSize: 11 }}
        >
          💬
        </button>

        {/* Diagnostics */}
        <button
          onClick={onDiag}
          className="wii-btn wii-btn-ghost h-8 px-3"
          style={{ fontSize: 11 }}
          title="Diagnostics"
        >
          🔧
        </button>

        {/* Dark mode */}
        <button
          onClick={() => dispatch({ type: 'SET_DARK', v: !dark })}
          className="w-8 h-8 rounded-full flex items-center justify-center text-base transition-all hover:scale-110 active:scale-95"
          style={{
            background: 'rgba(0,154,199,0.08)',
            border: '1.5px solid rgba(0,154,199,0.18)',
          }}
          aria-label="Toggle dark mode"
        >
          {dark ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}
