'use client';
import { useState, useCallback } from 'react';
import Sidebar         from './Sidebar';
import TopBar          from './TopBar';
import Footer          from './Footer';
import FeedbackModal   from '../ui/FeedbackModal';
import LevelUpModal    from '../ui/LevelUpModal';
import DiagnosticsPanel from '../ui/DiagnosticsPanel';
import XPToast         from '../ui/XPToast';
import { useApp }      from '../../lib/store';

export default function AppShell({ children, user }) {
  const { state, dispatch, removeToast } = useApp();
  const [showFeedback, setShowFeedback]  = useState(false);
  const [showDiag,     setShowDiag]      = useState(false);

  const closeLevelUp = useCallback(() => dispatch({ type: 'CLOSE_LEVELUP' }), [dispatch]);

  return (
    <div className="min-h-screen bg-primary-xl dark:bg-gray-950">
      <Sidebar user={user} />

      <TopBar
        onFeedback={() => setShowFeedback(true)}
        onDiag={() => setShowDiag(true)}
      />

      {/* Main content — offset for sidebar + topbar */}
      <main style={{ marginLeft: 250, paddingTop: 54 }} className="min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6 py-7">
          {children}
        </div>
      </main>

      <Footer />

      {/* Focus mode animated wave */}
      {state.focusMode && (
        <svg className="focus-wave" viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,50 C240,90 480,10 720,50 C960,90 1200,10 1440,50 L1440,100 L0,100 Z" />
        </svg>
      )}

      {/* XP floating toasts */}
      {state.xpToasts.map((t) => (
        <XPToast key={t.id} {...t} onDone={() => removeToast(t.id)} />
      ))}

      {/* Level-up modal */}
      {state.levelUpModal && (
        <LevelUpModal level={state.level} onClose={closeLevelUp} />
      )}

      {/* Feedback modal */}
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}

      {/* Diagnostics panel */}
      {showDiag && <DiagnosticsPanel onClose={() => setShowDiag(false)} />}
    </div>
  );
}
