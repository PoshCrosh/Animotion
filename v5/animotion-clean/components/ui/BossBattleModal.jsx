'use client';
import { useState, useCallback } from 'react';
import Mascot   from './Mascot';
import Spinner  from './Spinner';
import { useApp }    from '../../lib/store';
import { sanitize }  from '../../lib/utils';

// ── Rank config ───────────────────────────────────────────────────────────────
const RANK_CONFIG = {
  S: { color: '#FFD700', bg: '#FFF8ED', border: '#FFD700', label: 'S RANK', emoji: '👑', glow: '0 0 32px rgba(255,215,0,0.55)' },
  A: { color: '#52C97C', bg: '#EDFBF3', border: '#52C97C', label: 'A RANK', emoji: '🏆', glow: '0 0 24px rgba(82,201,124,0.45)' },
  B: { color: '#5B9CF6', bg: '#EBF2FF', border: '#5B9CF6', label: 'B RANK', emoji: '⭐', glow: '0 0 20px rgba(91,156,246,0.40)' },
  C: { color: '#FFB347', bg: '#FFF8ED', border: '#FFB347', label: 'C RANK', emoji: '💪', glow: '0 0 16px rgba(255,179,71,0.35)' },
};

const SKILL_LABELS = {
  timing: 'Timing & Spacing', squash: 'Squash & Stretch', anticipation: 'Anticipation',
  followThrough: 'Follow Through', weight: 'Weight & Physics', smoothness: 'Smoothness',
  creativity: 'Creativity', consistency: 'Consistency', cinematography: 'Cinematography',
  motionDesign: 'Motion Design', vfx: 'VFX Understanding', storytelling: 'Storytelling',
};

// ── Step: Intro ───────────────────────────────────────────────────────────────
function BossIntro({ boss, onStart, onClose }) {
  return (
    <div className="text-center">
      {/* Boss icon */}
      <div className="relative inline-block mb-5">
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mx-auto shadow-strong"
          style={{ background: `linear-gradient(135deg, ${boss.color}, ${boss.color}99)`,
                   boxShadow: `0 8px 32px ${boss.color}55` }}
        >
          {boss.icon}
        </div>
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-soft animate-pulse">
          BOSS
        </div>
      </div>

      <p className="text-[10px] font-black text-gray-400 tracking-[3px] uppercase mb-2">Section Boss Battle</p>
      <h2 className="font-black text-2xl tracking-tight mb-2">{boss.name}</h2>
      <p className="text-gray-500 text-[13px] font-semibold leading-relaxed mb-5 max-w-sm mx-auto">
        {boss.desc}
      </p>

      {/* Stakes */}
      <div className="grid grid-cols-3 gap-3 mb-6 max-w-xs mx-auto">
        {[
          { label: 'Max XP', value: '150', icon: '⭐' },
          { label: 'Skills', value: boss.skills.length, icon: '📊' },
          { label: 'Best Rank', value: 'S', icon: '👑' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-blue-50 dark:bg-gray-800 rounded-xl p-3">
            <div className="text-xl mb-1">{icon}</div>
            <div className="font-black text-base text-primary">{value}</div>
            <div className="text-[9px] text-gray-400 font-bold uppercase">{label}</div>
          </div>
        ))}
      </div>

      {/* Skills being tested */}
      <div className="mb-6">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Skills Being Tested</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {boss.skills.map((sk) => (
            <span key={sk} className="tag bg-primary-light text-primary-dark text-[10px]">
              {SKILL_LABELS[sk] ?? sk}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={onClose} className="btn btn-secondary px-6">Not Yet</button>
        <button onClick={onStart} className="btn btn-primary px-8"
          style={{ background: `linear-gradient(135deg, ${boss.color}, ${boss.color}cc)` }}>
          Accept Challenge →
        </button>
      </div>
    </div>
  );
}

// ── Step: Challenge ────────────────────────────────────────────────────────────
function BossChallenge({ boss, onSubmit, submitting }) {
  const [answer, setAnswer] = useState('');
  const minLength = 30;
  const canSubmit = answer.trim().length >= minLength && !submitting;

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: `${boss.color}22` }}>
          {boss.icon}
        </div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Boss Challenge</p>
          <h3 className="font-black text-lg leading-tight">{boss.name}</h3>
        </div>
      </div>

      {/* Challenge prompt */}
      <div className="rounded-xl px-5 py-4 border-l-4 mb-5"
        style={{ background: `${boss.color}12`, borderColor: boss.color }}>
        <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: boss.color }}>
          ⚔️ YOUR CHALLENGE
        </p>
        <p className="text-[14px] font-semibold text-gray-800 dark:text-gray-200 leading-relaxed">
          {boss.challenge}
        </p>
      </div>

      {/* Tips */}
      {boss.tips && (
        <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl px-4 py-3 border-l-4 border-amber-400 mb-4">
          <p className="text-[10px] font-black text-amber-700 mb-1">💡 TIPS FOR S RANK</p>
          <ul className="space-y-1">
            {boss.tips.map((tip, i) => (
              <li key={i} className="text-xs text-amber-700 dark:text-amber-400 font-semibold">• {tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Answer textarea */}
      <textarea
        value={answer}
        onChange={(e) => setAnswer(sanitize(e.target.value))}
        placeholder="Write your detailed response here. Be specific — the AI evaluates depth and understanding..."
        rows={7}
        disabled={submitting}
        className="field resize-none mb-2"
      />
      <div className="flex justify-between items-center mb-4">
        <p className="text-[10px] text-gray-400 font-semibold">
          {answer.trim().length < minLength
            ? `${minLength - answer.trim().length} more characters needed`
            : '✓ Ready to submit'}
        </p>
        <p className="text-[10px] text-gray-400 font-semibold">{answer.trim().length} chars</p>
      </div>

      <button
        onClick={() => onSubmit(answer)}
        disabled={!canSubmit}
        className={`btn btn-primary w-full justify-center py-3 text-sm ${!canSubmit ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={canSubmit ? { background: `linear-gradient(135deg, ${boss.color}, ${boss.color}cc)` } : {}}>
        {submitting
          ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Evaluating…</>
          : '⚔️ Submit for Evaluation →'}
      </button>
    </div>
  );
}

// ── Step: Results ──────────────────────────────────────────────────────────────
function BossResults({ boss, evaluation, onClose, onRetry }) {
  const rank   = RANK_CONFIG[evaluation.rank] ?? RANK_CONFIG.C;
  const gained = Object.entries(evaluation.skillDeltas ?? {}).filter(([, v]) => v > 0);

  return (
    <div className="text-center">
      {/* Rank display */}
      <div className="mb-6">
        <div
          className="w-28 h-28 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-level-up"
          style={{ background: rank.bg, border: `3px solid ${rank.border}`, boxShadow: rank.glow }}>
          <div>
            <div className="text-4xl">{rank.emoji}</div>
            <div className="font-black text-lg tracking-widest" style={{ color: rank.color }}>{rank.label}</div>
          </div>
        </div>

        {/* Score bar */}
        <div className="max-w-xs mx-auto mb-2">
          <div className="flex justify-between text-xs font-black mb-1">
            <span className="text-gray-400">Score</span>
            <span style={{ color: rank.color }}>{evaluation.score}/100</span>
          </div>
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-1000"
              style={{ width: `${evaluation.score}%`, background: `linear-gradient(90deg, ${rank.color}, ${rank.color}99)` }}
            />
          </div>
        </div>
        <p className="font-black text-2xl text-primary animate-fade-up">+{evaluation.xp} XP ⭐</p>
      </div>

      {/* Feedback */}
      <div className="text-left mb-5 space-y-3">
        <div className="card p-4">
          <div className="flex items-start gap-3">
            <Mascot size={36} mood="excited" animate={false} className="flex-shrink-0" />
            <p className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 leading-relaxed">
              {evaluation.feedback}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-3">
            <p className="text-[9px] font-black text-green-600 uppercase mb-1">💪 Strength</p>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{evaluation.strength}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3">
            <p className="text-[9px] font-black text-amber-600 uppercase mb-1">🎯 Work On</p>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{evaluation.improvement}</p>
          </div>
        </div>
      </div>

      {/* Skills gained */}
      {gained.length > 0 && (
        <div className="mb-5">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Skills Gained</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {gained.map(([skill, delta]) => (
              <span key={skill} className="tag bg-green-100 dark:bg-green-950/30 text-green-700 text-[10px]">
                +{delta} {SKILL_LABELS[skill] ?? skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        {evaluation.rank !== 'S' && (
          <button onClick={onRetry} className="btn btn-secondary">Try Again</button>
        )}
        <button onClick={onClose} className="btn btn-primary px-8"
          style={{ background: `linear-gradient(135deg, ${boss.color}, ${boss.color}cc)` }}>
          {evaluation.rank === 'S' ? '🏆 Claim Victory!' : 'Continue →'}
        </button>
      </div>
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────────────────────
export default function BossBattleModal({ boss, onClose }) {
  const { state, gainXP, gainSkills } = useApp();

  const [phase,       setPhase]       = useState('intro');    // intro | challenge | evaluating | results
  const [evaluation,  setEvaluation]  = useState(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState(null);

  const handleStart = () => setPhase('challenge');

  const handleSubmit = useCallback(async (answer) => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/boss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge:  boss.challenge,
          submission: answer,
          skills:     state.skills,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? `HTTP ${res.status}`);

      const ev = data.evaluation;
      setEvaluation(ev);

      // Dispatch rewards
      if (ev.xp > 0) gainXP(ev.xp, 700, 300);
      const filteredDeltas = Object.fromEntries(
        Object.entries(ev.skillDeltas ?? {}).filter(([, v]) => v > 0)
      );
      if (Object.keys(filteredDeltas).length > 0) gainSkills(filteredDeltas);

      setPhase('results');
    } catch (err) {
      const isConfig = err.message?.includes('ANTHROPIC') || err.message?.includes('503');
      setError(isConfig
        ? 'AI evaluation requires ANTHROPIC_API_KEY. Set it in .env.local.'
        : err.message ?? 'Evaluation failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  }, [boss, state.skills, gainXP, gainSkills]);

  const handleRetry = () => {
    setPhase('challenge');
    setEvaluation(null);
    setError(null);
  };

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.70)' }}
      onClick={(e) => e.target === e.currentTarget && phase !== 'evaluating' && onClose()}
    >
      <div className="card w-full max-w-[560px] max-h-[90vh] overflow-y-auto animate-fade-up shadow-strong">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚔️</span>
            <span className="font-black text-sm">Boss Battle</span>
            <span className="tag bg-red-100 dark:bg-red-950/30 text-red-600 text-[9px]">
              {boss.section}
            </span>
          </div>
          {phase !== 'evaluating' && (
            <button onClick={onClose}
              className="text-xl text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center">
              ×
            </button>
          )}
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mb-4">
              <p className="text-red-600 text-xs font-bold">{error}</p>
            </div>
          )}

          {phase === 'intro'      && <BossIntro      boss={boss} onStart={handleStart} onClose={onClose} />}
          {phase === 'challenge'  && <BossChallenge  boss={boss} onSubmit={handleSubmit} submitting={submitting} />}
          {phase === 'results'    && evaluation && (
            <BossResults boss={boss} evaluation={evaluation} onClose={onClose} onRetry={handleRetry} />
          )}
        </div>
      </div>
    </div>
  );
}
