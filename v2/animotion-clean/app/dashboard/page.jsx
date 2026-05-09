'use client';
import { useRouter } from 'next/navigation';
import AppShell from '../../components/layout/AppShell';
import Mascot   from '../../components/ui/Mascot';
import XPBar    from '../../components/ui/XPBar';
import Spinner  from '../../components/ui/Spinner';
import { useApp }  from '../../lib/store';
import { useAuth } from '../../hooks/useAuth';
import { getRank, fmtXP } from '../../lib/utils';
import { RANKS, ALL_LESSONS, WORLDS, SKILLS, DEFAULT_SKILLS } from '../../lib/curriculum';

function StatCard({ icon, value, label, color }) {
  return (
    <div className="card p-5">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-black text-2xl leading-none mb-1" style={{ color }}>{value}</div>
      <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wide">{label}</div>
    </div>
  );
}

// Helper: get all lessons from a world (which has sections)
function worldLessons(world) {
  return world.sections.flatMap((s) => s.lessons);
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { state, completeQuest } = useApp();
  const { xp, level, quests, completedLessons, skills } = state;
  const router = useRouter();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-primary-xl dark:bg-gray-950">
      <Spinner size={10} />
    </div>
  );

  const rank     = getRank(xp, RANKS);
  const nextRank = RANKS[RANKS.indexOf(rank) + 1];
  const rankPct  = rank.max === 999999 ? 100 : Math.min(100, ((xp - rank.min) / (rank.max - rank.min)) * 100);
  const doneQ    = quests.filter((q) => q.done).length;
  const doneL    = completedLessons.length;
  const name     = user?.user_metadata?.name ?? user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Animator';

  const lastLesson = completedLessons.length > 0
    ? ALL_LESSONS.find((l) => l.id === completedLessons[completedLessons.length - 1])
    : null;

  const nextLesson = ALL_LESSONS.find((l) => !completedLessons.includes(l.id));
  const nextWorld  = nextLesson ? WORLDS.find((w) => w.id === nextLesson.worldId) : null;

  // Fix: use sections to get world lessons
  const currentWorld = WORLDS.find((w) =>
    worldLessons(w).some((l) => !completedLessons.includes(l.id))
  ) ?? WORLDS[WORLDS.length - 1];

  const allCurrLessons = worldLessons(currentWorld);
  const worldDone  = allCurrLessons.filter((l) => completedLessons.includes(l.id)).length;
  const worldTotal = allCurrLessons.length;
  const worldPct   = worldTotal > 0 ? Math.round((worldDone / worldTotal) * 100) : 0;

  // Weakest skills for tip section
  const merged = { ...DEFAULT_SKILLS, ...(skills ?? {}) };
  const weakestSkill = SKILLS.slice().sort((a, b) => (merged[a.id] ?? 0) - (merged[b.id] ?? 0))[0];

  return (
    <AppShell user={user}>
      <div className="page space-y-6">

        {/* Hero */}
        <div className="rounded-3xl p-8 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#5B9CF6 0%,#9B7FEA 100%)' }}>
          <div className="absolute right-6 inset-y-0 flex items-center text-[100px] opacity-10 pointer-events-none select-none">🎬</div>
          <div className="flex items-center gap-5 relative">
            <Mascot size={72} mood={xp === 0 ? 'happy' : 'excited'} animate />
            <div>
              <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">WELCOME BACK!</p>
              <h1 className="font-black text-2xl tracking-tight leading-tight mb-2">
                {xp === 0 ? `Let's start animating, ${name}! 🎬` : `Great work, ${name}! 🎉`}
              </h1>
              <p className="text-sm opacity-85 font-semibold">
                {nextRank
                  ? <>Need <strong>{fmtXP(nextRank.min - xp)} XP</strong> to reach {nextRank.icon} {nextRank.name}</>
                  : "You've reached God-like rank — legendary! ✨"}
              </p>
            </div>
          </div>
          <div className="mt-5 bg-white/25 rounded-full h-2.5 overflow-hidden">
            <div className="h-full bg-white rounded-full transition-[width] duration-1000" style={{ width: `${rankPct}%` }} />
          </div>
          <div className="flex justify-between mt-1.5 text-xs font-bold opacity-70">
            <span>{rank.icon} {rank.name}</span>
            {nextRank && <span>{nextRank.icon} {nextRank.name}</span>}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard icon="⭐" value={fmtXP(xp)}                         label="Total XP"    color="#D4831A" />
          <StatCard icon="🎯" value={`Level ${level}`}                   label="Level"       color="#5B9CF6" />
          <StatCard icon={rank.icon} value={rank.name}                    label="Rank"        color={rank.color} />
          <StatCard icon="📚" value={`${doneL} / ${ALL_LESSONS.length}`}  label="Lessons"    color="#2DA05A" />
        </div>

        {/* Main grid */}
        <div className="grid gap-5" style={{ gridTemplateColumns: '1.6fr 1fr' }}>

          {/* Daily quests */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-base">🎯 Daily Quests</h2>
              <span className="text-xs text-gray-400 font-bold">{doneQ}/{quests.length} done</span>
            </div>
            <div className="space-y-2">
              {quests.map((q) => (
                <button key={q.id}
                  onClick={() => !q.done && completeQuest(q.id, q.xp)}
                  disabled={q.done}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                    q.done
                      ? 'bg-green-50 dark:bg-green-950/20 border-green-400 cursor-default'
                      : 'bg-blue-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary-light cursor-pointer'
                  }`}>
                  <span className="text-lg flex-shrink-0">{q.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-bold truncate ${q.done ? 'text-green-700 dark:text-green-400 line-through opacity-70' : 'text-gray-800 dark:text-gray-200'}`}>
                      {q.title}
                    </p>
                    {q.max > 1 && (
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1.5">
                        <div className="h-full bg-primary rounded-full transition-[width]"
                          style={{ width: `${Math.min(100, (q.progress / q.max) * 100)}%` }} />
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-black text-amber-600 whitespace-nowrap flex-shrink-0">+{q.xp} XP</span>
                  {q.done && <span className="text-base flex-shrink-0">✅</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">

            {/* Continue learning */}
            {nextLesson ? (
              <button onClick={() => router.push('/lessons')}
                className="w-full card p-5 text-left hover:shadow-medium transition-shadow group">
                <div className="text-xl mb-2">{nextWorld?.icon ?? '📖'}</div>
                <h3 className="font-black text-[13px] mb-0.5">
                  {doneL === 0 ? 'Start Your Journey' : 'Continue Learning'}
                </h3>
                <p className="text-xs text-gray-400 font-semibold mb-3 truncate">
                  {nextLesson.title} · {nextLesson.time}
                </p>
                {nextWorld && (
                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-1">
                      <span>{nextWorld.title}</span>
                      <span>{worldDone}/{worldTotal}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-[width]"
                        style={{ width: `${worldPct}%`, background: nextWorld.color }} />
                    </div>
                  </div>
                )}
                <span className="btn btn-primary text-xs py-2 px-4 group-hover:bg-primary-dark">
                  {doneL === 0 ? 'Begin →' : 'Resume →'}
                </span>
              </button>
            ) : (
              <div className="card p-5 text-center">
                <div className="text-3xl mb-2">🏆</div>
                <h3 className="font-black text-[13px] mb-1">All Lessons Complete!</h3>
                <p className="text-xs text-gray-400 font-semibold">Keep practising in the editor!</p>
              </div>
            )}

            {/* Recent activity */}
            <div className="card p-5">
              <h3 className="font-black text-[13px] mb-4">📅 Activity</h3>
              {doneL === 0 ? (
                <div className="text-center py-3">
                  <div className="text-2xl mb-2">🌱</div>
                  <p className="text-xs text-gray-400 font-semibold">Start your first lesson!</p>
                </div>
              ) : lastLesson && (
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">{lastLesson.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Last Lesson</p>
                    <p className="text-[12px] font-bold truncate">{lastLesson.title}</p>
                  </div>
                  <span className="tag bg-green-100 dark:bg-green-950/30 text-green-700 text-[10px]">✓</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <span className="text-xl">✏️</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Editor</p>
                  <p className="text-[12px] font-bold">Create animations</p>
                </div>
                <button onClick={() => router.push('/editor')}
                  className="tag bg-primary-light text-primary-dark text-[10px] cursor-pointer hover:bg-primary hover:text-white transition-colors">
                  Open
                </button>
              </div>
            </div>

            {/* Skill tip */}
            {weakestSkill && (
              <div className="card p-5" style={{ background: 'linear-gradient(135deg,#EBF2FF,#F3EFFE)' }}>
                <h3 className="font-black text-[12px] mb-2">💡 Ani Suggests</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold leading-relaxed mb-3">
                  Your weakest skill is <strong className="text-primary">{weakestSkill.label}</strong> ({merged[weakestSkill.id] ?? 0}/100).
                  Chat with Ani to improve it!
                </p>
                <button onClick={() => router.push('/coach')}
                  className="btn btn-primary text-xs py-1.5 px-3 w-full justify-center">
                  Ask Ani →
                </button>
              </div>
            )}

            {/* XP bar */}
            <div className="card p-5">
              <h3 className="font-black text-[13px] mb-3">⭐ XP Progress</h3>
              <XPBar xp={xp} level={level} />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="bg-blue-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                  <p className="font-black text-lg text-primary">{fmtXP(xp)}</p>
                  <p className="text-[10px] text-gray-400 font-bold">Total XP</p>
                </div>
                <div className="bg-blue-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                  <p className="font-black text-lg text-primary">{level}</p>
                  <p className="text-[10px] text-gray-400 font-bold">Level</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
