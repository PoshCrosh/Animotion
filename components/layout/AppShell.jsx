'use client';
import { useState, useCallback } from 'react';
import Sidebar          from './Sidebar';
import TopBar           from './TopBar';
import Footer           from './Footer';
import FeedbackModal    from '../ui/FeedbackModal';
import LevelUpModal     from '../ui/LevelUpModal';
import DiagnosticsPanel from '../ui/DiagnosticsPanel';
import OnboardingModal  from '../ui/OnboardingModal';
import XPToast          from '../ui/XPToast';
import { useApp }       from '../../lib/store';

export default function AppShell({ children, user }) {
  const { state, dispatch, removeToast, markTutorialSeen } = useApp();
  const [showFeedback, setShowFeedback] = useState(false);
  const [showDiag,     setShowDiag]     = useState(false);

  const closeLevelUp       = useCallback(() => dispatch({ type: 'CLOSE_LEVELUP' }), [dispatch]);
  const handleTutorialDone = useCallback(() => markTutorialSeen(), [markTutorialSeen]);

  return (
    <div className="min-h-screen" style={{ background: '#EAF6FB' }}>
      <Sidebar user={user} />

      <TopBar
        onFeedback={() => setShowFeedback(true)}
        onDiag={() => setShowDiag(true)}
      />

      {/* Main content */}
      <main style={{ marginLeft: 250, paddingTop: 54 }} className="min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6 py-7">
          {children}
        </div>
      </main>

      <Footer />

      {/* Floating feedback */}
      <button
        onClick={() => setShowFeedback(true)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-95"
        style={{
          background: 'linear-gradient(135deg,#009AC7,#007AAA)',
          boxShadow: '0 4px 18px rgba(0,154,199,0.45)',
        }}
        aria-label="Send feedback"
      >
        💬
      </button>

      {/* Focus wave */}
      {state.focusMode && (
        <svg className="focus-wave" viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden>
          <path d="M0,50 C240,90 480,10 720,50 C960,90 1200,10 1440,50 L1440,100 L0,100 Z"
            fill="rgba(0,154,199,0.06)" />
        </svg>
      )}

      {/* XP toasts */}
      {state.xpToasts.map((t) => (
        <XPToast key={t.id} {...t} onDone={() => removeToast(t.id)} />
      ))}

      {/* Level-up */}
      {state.levelUpModal && <LevelUpModal level={state.level} onClose={closeLevelUp} />}

      {/* Onboarding */}
      {!state.hasSeenTutorial && user && <OnboardingModal onDone={handleTutorialDone} />}

      {/* Modals */}
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
      {showDiag     && <DiagnosticsPanel onClose={() => setShowDiag(false)} />}
    </div>
  );
}
