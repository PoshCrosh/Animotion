'use client';
import { useState, useEffect } from 'react';
import AppShell  from '../../components/layout/AppShell';
import Spinner   from '../../components/ui/Spinner';
import { useApp }    from '../../lib/store';
import { useAuth }   from '../../hooks/useAuth';
import { sanitize, fmtXP } from '../../lib/utils';

function TimeLeft({ endDate }) {
  const end  = new Date(endDate);
  const now  = new Date();
  const diff = Math.max(0, end - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hrs  = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return <span>{days}d {hrs}h remaining</span>;
}

function SubmissionCard({ sub, isUser }) {
  const initials = (sub.display_name ?? 'A').slice(0, 2).toUpperCase();
  const colors   = ['#5B9CF6', '#FF8FAB', '#52C97C', '#FFB347', '#9B7FEA'];
  const color    = colors[sub.display_name?.charCodeAt(0) % colors.length] ?? colors[0];

  return (
    <div className={`card p-4 transition-all ${isUser ? 'ring-2 ring-primary' : 'hover:shadow-medium'}`}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
          style={{ background: color }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-black text-xs">{sub.display_name ?? 'Animator'}</span>
            {isUser && <span className="tag bg-primary text-white text-[9px]">YOU</span>}
            <span className="text-[9px] text-gray-400 font-semibold ml-auto">
              {new Date(sub.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold leading-relaxed line-clamp-3">
            {sub.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ChallengesPage() {
  const { user, loading: authLoading } = useAuth();
  const { state, gainXP, dispatch }    = useApp();

  const [challenge,    setChallenge]    = useState(null);
  const [submissions,  setSubmissions]  = useState([]);
  const [fetching,     setFetching]     = useState(true);
  const [description,  setDescription]  = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const [submitted,    setSubmitted]    = useState(false);
  const [error,        setError]        = useState(null);
  const [tab,          setTab]          = useState('challenge');

  useEffect(() => {
    async function load() {
      setFetching(true);
      try {
        const res  = await fetch('/api/challenges');
        const data = await res.json();
        setChallenge(data.challenge);
        setSubmissions(data.submissions ?? []);
      } catch {
        setError('Could not load the weekly challenge.');
      } finally {
        setFetching(false);
      }
    }
    load();
  }, []);

  const handleSubmit = async () => {
    if (description.trim().length < 10) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/challenges', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ description: sanitize(description) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);

      setSubmitted(true);
      gainXP(challenge?.xp ?? 200, 700, 300);
      dispatch({ type: 'COMPLETE_QUEST', id: 7 });

      // Refresh submissions
      const r2   = await fetch('/api/challenges');
      const d2   = await r2.json();
      setSubmissions(d2.submissions ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const alreadySubmitted = submitted ||
    submissions.some((s) => s.user_id === user?.id);

  if (authLoading || fetching) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size={10} /></div>;
  }

  return (
    <AppShell user={user}>
      <div className="page">
        <h1 className="font-black text-2xl tracking-tight mb-1">⚔️ Weekly Challenge</h1>
        <p className="text-gray-500 text-[13px] font-semibold mb-6">
          A new animation challenge every week. Describe your submission to earn XP.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['challenge', 'community'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-1.5 rounded-full text-xs font-black capitalize transition-all ${
                tab === t ? 'bg-primary text-white shadow-soft' : 'bg-white dark:bg-gray-900 text-gray-500 border border-gray-200 dark:border-gray-700 hover:border-primary'
              }`}>
              {t === 'challenge' ? '⚔️ This Week' : `👥 Community (${submissions.length})`}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 rounded-xl px-4 py-3 mb-5">
            <p className="text-red-600 text-xs font-bold">{error}</p>
          </div>
        )}

        {tab === 'challenge' && challenge && (
          <div className="grid gap-5" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
            {/* Challenge card */}
            <div className="card p-6"
              style={{ background: 'linear-gradient(135deg,#5B9CF6,#9B7FEA)', color: 'white' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">{challenge.icon}</span>
                <div>
                  <p className="text-[10px] font-black opacity-70 uppercase tracking-widest">Weekly Challenge</p>
                  <h2 className="font-black text-xl">{challenge.title}</h2>
                </div>
              </div>
              <p className="text-sm opacity-90 font-semibold leading-relaxed mb-4">{challenge.desc}</p>
              <div className="flex items-center justify-between">
                <span className="tag bg-white/20 text-white text-xs">
                  ⭐ {fmtXP(challenge.xp)} XP reward
                </span>
                <span className="text-xs opacity-70 font-semibold">
                  ⏱ <TimeLeft endDate={challenge.endDate} />
                </span>
              </div>
            </div>

            {/* Submission form */}
            <div className="card p-6">
              {alreadySubmitted ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-3">🎉</div>
                  <h3 className="font-black text-lg mb-2">Submitted!</h3>
                  <p className="text-xs text-gray-500 font-semibold mb-4">
                    You've submitted to this week's challenge. Come back next week!
                  </p>
                  <button onClick={() => setTab('community')}
                    className="btn btn-primary text-xs">
                    See Community Submissions →
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="font-black text-sm mb-1">Your Submission</h3>
                  <p className="text-xs text-gray-500 font-semibold mb-4 leading-relaxed">
                    Describe your animation attempt. Be specific about what you tried and what you learned.
                  </p>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={`Describe your ${challenge.title} attempt in detail…`}
                    rows={6}
                    disabled={submitting}
                    className="field resize-none mb-3"
                  />
                  <button onClick={handleSubmit}
                    disabled={description.trim().length < 10 || submitting}
                    className={`btn btn-primary w-full justify-center ${description.trim().length < 10 || submitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {submitting
                      ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Submitting…</>
                      : `Submit & Earn ${fmtXP(challenge?.xp ?? 200)} XP →`}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {tab === 'community' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-base">
                Community Submissions
                <span className="ml-2 text-gray-400 font-normal text-sm">({submissions.length})</span>
              </h2>
            </div>

            {submissions.length === 0 ? (
              <div className="card p-16 text-center">
                <div className="text-4xl mb-3">🌱</div>
                <h3 className="font-black text-lg mb-2">No submissions yet</h3>
                <p className="text-gray-400 text-sm font-semibold">
                  Be the first to submit this week's challenge!
                </p>
                <button onClick={() => setTab('challenge')}
                  className="btn btn-primary mt-4">
                  Submit Now →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {submissions.map((sub) => (
                  <SubmissionCard
                    key={sub.id}
                    sub={sub}
                    isUser={sub.user_id === user?.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
