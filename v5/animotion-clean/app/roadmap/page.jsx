'use client';
import { useState } from 'react';
import AppShell  from '../../components/layout/AppShell';
import Mascot    from '../../components/ui/Mascot';
import Spinner   from '../../components/ui/Spinner';
import { useApp }  from '../../lib/store';
import { useAuth } from '../../hooks/useAuth';
import { ALL_LESSONS, SKILLS } from '../../lib/curriculum';
import { sanitize } from '../../lib/utils';

const SPECIALIZATIONS = [
  { id: 'general',    label: 'General Animation',  icon: '🎬' },
  { id: '2d',         label: '2D Character',        icon: '✏️' },
  { id: '3d',         label: '3D Animation',        icon: '🧊' },
  { id: 'vfx',        label: 'Visual Effects',      icon: '💥' },
  { id: 'cinema',     label: 'Cinematography',      icon: '🎥' },
  { id: 'motion',     label: 'Motion Graphics',     icon: '🎯' },
];

const SKILL_LABEL = Object.fromEntries(SKILLS.map((s) => [s.id, s.label]));

function WeekCard({ week, allLessons, completedLessons }) {
  const [expanded, setExpanded] = useState(false);
  const weekLessons = week.lessons
    .map((id) => allLessons.find((l) => l.id === id))
    .filter(Boolean);

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black flex-shrink-0">
          {week.week}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-black text-sm">{week.theme}</h3>
            <span className="tag bg-primary-light text-primary-dark text-[9px]">{week.focus}</span>
          </div>
          <p className="text-xs text-gray-500 font-semibold truncate">{week.milestone}</p>
        </div>
        <span className="text-gray-300 text-xl">{expanded ? '↑' : '↓'}</span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-800 pt-4 animate-fade-up">
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl px-3 py-2 mb-4">
            <p className="text-[10px] font-black text-amber-700 mb-0.5">📅 Daily Goal</p>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{week.dailyGoal}</p>
          </div>

          <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Lessons This Week</p>
          <div className="space-y-2">
            {weekLessons.map((lesson) => {
              const done = completedLessons.includes(lesson.id);
              return (
                <div key={lesson.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${
                    done
                      ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20'
                      : 'border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-gray-800'
                  }`}>
                  <span className="text-xl flex-shrink-0">{done ? '✅' : lesson.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black truncate">{lesson.title}</p>
                    <p className="text-[9px] text-gray-400 font-semibold">{lesson.time} · +{lesson.xp} XP</p>
                  </div>
                  {done && <span className="tag bg-green-100 dark:bg-green-950/30 text-green-700 text-[9px]">Done</span>}
                </div>
              );
            })}
          </div>

          <div className="mt-3 bg-green-50 dark:bg-green-950/20 rounded-xl px-3 py-2">
            <p className="text-[10px] font-black text-green-700 mb-0.5">🏁 Week Goal</p>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{week.milestone}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RoadmapPage() {
  const { user, loading } = useAuth();
  const { state }         = useApp();
  const { skills, completedLessons } = state;

  const [goal,     setGoal]     = useState('');
  const [spec,     setSpec]     = useState('general');
  const [roadmap,  setRoadmap]  = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error,    setError]    = useState(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setRoadmap(null);

    try {
      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal:             sanitize(goal) || undefined,
          specialization:  spec,
          skills,
          completedLessons,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? `HTTP ${res.status}`);
      setRoadmap(data.roadmap);
    } catch (err) {
      setError(err.message?.includes('ANTHROPIC')
        ? 'Roadmap generation requires ANTHROPIC_API_KEY in .env.local.'
        : err.message ?? 'Generation failed. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size={10} /></div>;

  return (
    <AppShell user={user}>
      <div className="page max-w-[800px]">
        <h1 className="font-black text-2xl tracking-tight mb-1">🗺️ Smart Roadmap</h1>
        <p className="text-gray-500 text-[13px] font-semibold mb-6">
          Tell Ani your goal — get a personalised week-by-week learning plan.
        </p>

        {/* Generator form */}
        {!roadmap && (
          <div className="card p-6 mb-6">
            <div className="flex items-start gap-4 mb-5">
              <Mascot size={52} mood="thinking" animate />
              <div>
                <p className="font-black text-sm mb-1">What do you want to achieve?</p>
                <p className="text-xs text-gray-500 font-semibold">
                  Ani will look at your current skills, completed lessons, and goals to build a realistic plan.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">
                  Your Goal (optional)
                </label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. I want to animate a character walk cycle, learn VFX basics, get a job in motion graphics..."
                  className="field"
                  disabled={generating}
                />
              </div>

              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">
                  Specialization Focus
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SPECIALIZATIONS.map((s) => (
                    <button key={s.id} onClick={() => setSpec(s.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${
                        spec === s.id
                          ? 'border-primary bg-primary-light text-primary-dark'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary text-gray-600 dark:text-gray-400'
                      }`}>
                      <span className="text-lg">{s.icon}</span>
                      <span className="text-xs font-black">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Current skill summary */}
              <div className="bg-blue-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Ani will use your current profile:</p>
                <div className="flex gap-4 text-xs">
                  <div><span className="font-black text-primary">{completedLessons.length}</span> <span className="text-gray-500">lessons done</span></div>
                  <div><span className="font-black text-primary">{Object.values(skills).reduce((a, b) => a + b, 0)}</span> <span className="text-gray-500">skill points</span></div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-red-600 text-xs font-bold">{error}</p>
                </div>
              )}

              <button onClick={handleGenerate} disabled={generating}
                className="btn btn-primary w-full justify-center py-3 text-sm disabled:opacity-50">
                {generating
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Generating your roadmap…</>
                  : '✨ Generate My Roadmap →'}
              </button>
            </div>
          </div>
        )}

        {/* Roadmap display */}
        {roadmap && (
          <div className="animate-fade-up">
            {/* Header */}
            <div className="card p-6 mb-5"
              style={{ background: 'linear-gradient(135deg,#5B9CF6,#9B7FEA)', color: 'white' }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-black opacity-70 uppercase tracking-widest mb-1">Your Personalised Roadmap</p>
                  <h2 className="font-black text-xl mb-2">{roadmap.title}</h2>
                  <p className="text-sm opacity-90 font-semibold leading-relaxed mb-3">{roadmap.goal}</p>
                  <span className="tag bg-white/20 text-white text-xs">⏱ {roadmap.duration}</span>
                </div>
                <Mascot size={60} mood="excited" animate={false} />
              </div>

              {roadmap.skillPriorities?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-[10px] font-black opacity-70 uppercase mb-2">Priority Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {roadmap.skillPriorities.map((sk) => (
                      <span key={sk} className="tag bg-white/20 text-white text-[10px]">
                        {SKILL_LABEL[sk] ?? sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tips */}
            {roadmap.tips?.length > 0 && (
              <div className="card p-4 mb-5 border-amber-200 dark:border-amber-800"
                style={{ background: '#FFF8ED' }}>
                <p className="text-[10px] font-black text-amber-700 uppercase mb-2">💡 Ani's Tips For You</p>
                {roadmap.tips.map((tip, i) => (
                  <p key={i} className="text-xs text-amber-700 font-semibold mb-1">• {tip}</p>
                ))}
              </div>
            )}

            {/* Weeks */}
            <div className="space-y-3 mb-5">
              {roadmap.weeks?.map((week) => (
                <WeekCard key={week.week} week={week} allLessons={ALL_LESSONS} completedLessons={completedLessons} />
              ))}
            </div>

            <button onClick={() => setRoadmap(null)}
              className="btn btn-secondary w-full justify-center">
              ← Generate a Different Roadmap
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
