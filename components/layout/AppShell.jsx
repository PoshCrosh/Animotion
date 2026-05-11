'use client';
import { useState, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar          from './Sidebar';
import TopBar           from './TopBar';
import Footer           from './Footer';
import FeedbackModal    from '../ui/FeedbackModal';
import LevelUpModal     from '../ui/LevelUpModal';
import DiagnosticsPanel from '../ui/DiagnosticsPanel';
import OnboardingModal  from '../ui/OnboardingModal';
import XPToast          from '../ui/XPToast';
import { useApp }       from '../../lib/store';

// Map pathname → page name for per-page backgrounds
function getPageName(pathname) {
  if (pathname === '/dashboard')    return 'dashboard';
  if (pathname.startsWith('/lesson')) return 'lessons';
  if (pathname.startsWith('/coach'))  return 'coach';
  if (pathname.startsWith('/editor')) return 'editor';
  if (pathname.startsWith('/progress')) return 'progress';
  if (pathname.startsWith('/leaderboard')) return 'leaderboard';
  if (pathname.startsWith('/profile')) return 'profile';
  if (pathname.startsWith('/settings')) return 'settings';
  if (pathname.startsWith('/video')) return 'videos';
  if (pathname.startsWith('/creator')) return 'creators';
  if (pathname.startsWith('/community')) return 'community';
  if (pathname.startsWith('/shop')) return 'shop';
  if (pathname.startsWith('/skills')) return 'skills';
  if (pathname.startsWith('/quests')) return 'quests';
  return 'default';
}

export default function AppShell({ children, user }) {
  const { state, dispatch, removeToast, markTutorialSeen } = useApp();
  const pathname = usePathname();
  const [showFeedback, setShowFeedback] = useState(false);
  const [showDiag,     setShowDiag]     = useState(false);

  // Set data-page attribute on body for CSS background targeting
  useEffect(() => {
    document.body.setAttribute('data-page', getPageName(pathname));
  }, [pathname]);

  const closeLevelUp       = useCallback(() => dispatch({ type: 'CLOSE_LEVELUP' }), [dispatch]);
  const handleTutorialDone = useCallback(() => markTutorialSeen(), [markTutorialSeen]);

  return (
    <div className="min-h-screen">
      <Sidebar user={user} />
      <TopBar onFeedback={() => setShowFeedback(true)} onDiag={() => setShowDiag(true)} />

      <main style={{ marginLeft: 250, paddingTop: 54 }} className="min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6 py-7">
          {children}
        </div>
      </main>

      <Footer />

      <button
        onClick={() => setShowFeedback(true)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-95"
        style={{ background:'linear-gradient(135deg,#009AC7,#007AAA)', boxShadow:'0 4px 18px rgba(0,154,199,0.45)' }}>
        💬
      </button>

      {state.focusMode && (
        <svg className="focus-wave" viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden>
          <path d="M0,50 C240,90 480,10 720,50 C960,90 1200,10 1440,50 L1440,100 L0,100 Z" fill="rgba(0,154,199,0.06)"/>
        </svg>
      )}

      {state.xpToasts.map(t => <XPToast key={t.id} {...t} onDone={() => removeToast(t.id)} />)}
      {state.levelUpModal && <LevelUpModal level={state.level} onClose={closeLevelUp} />}
      {!state.hasSeenTutorial && user && <OnboardingModal onDone={handleTutorialDone} />}
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
      {showDiag     && <DiagnosticsPanel onClose={() => setShowDiag(false)} />}
    </div>
  );
}
