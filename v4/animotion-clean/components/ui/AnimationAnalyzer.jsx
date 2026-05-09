'use client';
import { useState, useRef } from 'react';
import Mascot   from './Mascot';
import Spinner  from './Spinner';
import { useApp }   from '../../lib/store';
import { sanitize } from '../../lib/utils';
import { SKILLS }   from '../../lib/curriculum';

const SKILL_LABELS = Object.fromEntries(SKILLS.map((s) => [s.id, { label: s.label, icon: s.icon, color: s.color }]));

function ScoreRing({ score, color, size = 60 }) {
  const r   = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const fill = circ * (1 - score / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E5E7EB" strokeWidth="4" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={circ} strokeDashoffset={fill}
        strokeLinecap="round"
        style={{ transformOrigin: 'center', transform: 'rotate(-90deg)', transition: 'stroke-dashoffset 1s ease' }} />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fontSize={size * 0.22} fontWeight="900" fill={color}>
        {score}
      </text>
    </svg>
  );
}

function AnalysisResults({ analysis, onClose }) {
  const scoreColor = analysis.overallScore >= 80 ? '#52C97C'
    : analysis.overallScore >= 60 ? '#5B9CF6'
    : analysis.overallScore >= 40 ? '#FFB347' : '#FF5757';

  const skillKeys = Object.keys(analysis.skillFeedback ?? {});

  return (
    <div className="space-y-5">
      {/* Overall score */}
      <div className="card p-5 text-center">
        <ScoreRing score={analysis.overallScore} color={scoreColor} size={80} />
        <p className="font-black text-sm mt-2">Overall Score</p>
        <p className="text-xs text-gray-500 font-semibold mt-1 max-w-xs mx-auto leading-relaxed">
          {analysis.summary}
        </p>
      </div>

      {/* Strengths & improvements */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4">
          <p className="text-[10px] font-black text-green-600 uppercase mb-3">💪 Strengths</p>
          <ul className="space-y-2">
            {analysis.strengths?.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-green-500 font-black text-sm flex-shrink-0">✓</span>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-4">
          <p className="text-[10px] font-black text-amber-600 uppercase mb-3">🎯 To Improve</p>
          <ul className="space-y-2">
            {analysis.improvements?.slice(0, 3).map((item, i) => (
              <li key={i} className="text-xs">
                <p className="font-black text-gray-700 dark:text-gray-300">{item.principle}</p>
                <p className="text-gray-500 font-semibold">{item.fix}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Skill breakdown */}
      <div className="card p-5">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Skill Breakdown</p>
        <div className="grid grid-cols-2 gap-3">
          {skillKeys.map((key) => {
            const skill = SKILL_LABELS[key];
            const data  = analysis.skillFeedback[key];
            if (!skill || !data) return null;
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="text-base flex-shrink-0">{skill.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[10px] font-black truncate">{skill.label}</span>
                    <span className="text-[10px] font-black" style={{ color: skill.color }}>{data.score}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-[width] duration-700"
                      style={{ width: `${data.score}%`, background: skill.color }} />
                  </div>
                  <p className="text-[9px] text-gray-400 font-semibold mt-0.5 leading-tight">{data.note}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next steps */}
      <div className="card p-4" style={{ background: 'linear-gradient(135deg,#EBF2FF,#F3EFFE)' }}>
        <p className="text-[10px] font-black text-primary uppercase mb-3">🚀 Your Next Steps</p>
        <ol className="space-y-2">
          {analysis.nextSteps?.map((step, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex gap-3">
        <button onClick={onClose} className="btn btn-primary flex-1 justify-center">
          Close Analysis
        </button>
      </div>
    </div>
  );
}

export default function AnimationAnalyzer({ onClose }) {
  const { state, gainXP, gainSkills } = useApp();

  const [tab,         setTab]         = useState('describe');  // 'describe' | 'upload'
  const [description, setDescription] = useState('');
  const [context,     setContext]      = useState('');
  const [analyzing,   setAnalyzing]   = useState(false);
  const [analysis,    setAnalysis]    = useState(null);
  const [error,       setError]       = useState(null);

  const handleAnalyze = async () => {
    if (description.trim().length < 20) return;
    setAnalyzing(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: sanitize(description),
          context:     sanitize(context),
          skills:      state.skills,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? `HTTP ${res.status}`);

      const ev = data.analysis;
      setAnalysis(ev);

      if (ev.xp > 0) gainXP(ev.xp, 700, 300);
      const filtered = Object.fromEntries(
        Object.entries(ev.skillDeltas ?? {}).filter(([, v]) => v > 0)
      );
      if (Object.keys(filtered).length > 0) gainSkills(filtered);
    } catch (err) {
      setError(err.message?.includes('ANTHROPIC')
        ? 'AI analysis requires ANTHROPIC_API_KEY in .env.local.'
        : err.message ?? 'Analysis failed. Try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9997] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)' }}
      onClick={(e) => e.target === e.currentTarget && !analyzing && onClose()}
    >
      <div className="card w-full max-w-[600px] max-h-[88vh] flex flex-col animate-fade-up shadow-strong">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Mascot size={36} mood={analyzing ? 'thinking' : analysis ? 'excited' : 'happy'} animate={false} />
            <div>
              <h3 className="font-black text-base">🎬 AI Animation Analyzer</h3>
              <p className="text-xs text-gray-400 font-semibold">Describe your animation — Ani gives detailed feedback</p>
            </div>
          </div>
          {!analyzing && (
            <button onClick={onClose} className="text-xl text-gray-400 w-8 h-8 flex items-center justify-center">×</button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mb-4">
              <p className="text-red-600 text-xs font-bold">{error}</p>
            </div>
          )}

          {analysis ? (
            <AnalysisResults analysis={analysis} onClose={onClose} />
          ) : (
            <div>
              <div className="bg-blue-50 dark:bg-gray-800 rounded-xl px-4 py-3 mb-5">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 leading-relaxed">
                  💡 Describe your animation in detail — what moves, how it moves, timing, and what you were trying to achieve. The more detail, the better the feedback.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">
                    Describe your animation *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. A rubber ball drops from the top of the frame and bounces 3 times. I tried to add squash on impact but the ball feels too stiff. The timing is 12fps across 24 frames..."
                    rows={6}
                    disabled={analyzing}
                    className="field resize-none"
                  />
                  <p className="text-[10px] text-gray-400 font-semibold mt-1">
                    {description.length < 20 ? `${20 - description.length} more characters needed` : '✓ Ready'}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">
                    What were you trying to achieve? (optional)
                  </label>
                  <textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="e.g. I'm practicing squash and stretch for the first time. I want it to feel more alive and heavy..."
                    rows={3}
                    disabled={analyzing}
                    className="field resize-none"
                  />
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={description.trim().length < 20 || analyzing}
                  className={`btn btn-primary w-full justify-center py-3 ${
                    description.trim().length < 20 || analyzing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {analyzing ? (
                    <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Ani is analyzing…</>
                  ) : '🔍 Analyze My Animation →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
