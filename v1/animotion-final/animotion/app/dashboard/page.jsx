'use client';
import { useRouter } from 'next/navigation';
import AppShell from '../../components/layout/AppShell';
import Mascot from '../../components/ui/Mascot';
import XPBar from '../../components/ui/XPBar';
import Spinner from '../../components/ui/Spinner';
import { useApp } from '../../lib/store';
import { useAuth } from '../../hooks/useAuth';
import { getRank, fmtXP } from '../../lib/utils';
import { RANKS, ALL_LESSONS } from '../../lib/curriculum';

function StatCard({ icon, value, label, color }) {
  return (
    <div className="card p-5">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-black text-2xl leading-none mb-1" style={{ color }}>{value}</div>
      <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wide">{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { state, completeQuest } = useApp();
  const { xp, level, quests, completedLessons } = state;
  const router = useRouter();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-primary-xl dark:bg-gray-950">
      <Spinner size={10} />
    </div>
  );

  const rank     = getRank(xp, RANKS);
  const nextRank = RANKS[RANKS.indexOf(rank) + 1];
  const rankPct  = Math.min(100, ((xp - rank.min) / (rank.max - rank.min)) * 100);
  const doneQ    = quests.filter((q) => q.done).length;
  const doneL    = completedLessons.length;
  const name     = user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? 'Animator';

  return (
    <AppShell user={user}>
      <div className="page space-y-6">

        {/* Hero */}
        <div
          className="rounded-3xl p-8 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#5B9CF6 0%,#9B7FEA 100%)' }}
        >
          <div className="absolute right-6 inset-y-0 flex items-center text-[100px] opacity-10 pointer-events-none select-none">🎬</div>
          <div className="flex items-center gap-5 relative">
            <Mascot size={72} mood="excited" animate />
            <div>
              <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">WELCOME BACK!</p>
              <h1 className="font-black text-2xl tracking-tight leading-tight mb-2">
                Ready to animate, {name}? 🎉
              </h1>
              <p className="text-sm opacity-85 font-semibold">
                {nextRank
                  ? <>Need <strong>{fmtXP(nextRank.min - xp)} XP</strong> to reach {nextRank.icon} {nextRank.name}</>
                  : "You've reached the highest rank! 🏆"}
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

        {/* Stat grid */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard icon="⭐" value={fmtXP(xp)}                       label="Total XP"      color="#D4831A" />
          <StatCard icon="🎯" value={level}                             label="Level"         color="#5B9CF6" />
          <StatCard icon={rank.icon} value={rank.name}                  label="Current Rank"  color="#9B7FEA" />
          <StatCard icon="✅" value={`${doneQ}/${quests.length}`}       label="Quests Today"  color="#2DA05A" />
        </div>

        {/* Main */}
        <div className="grid gap-5" style={{ gridTemplateColumns: '1.6fr 1fr' }}>

          {/* Quests */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-base">🎯 Daily Quests</h2>
              <span className="text-xs text-gray-400 font-bold">{doneQ}/{quests.length} complete</span>
            </div>
            <div className="space-y-2">
              {quests.map((q) => (
                <button
                  key={q.id}
                  onClick={() => !q.done && completeQuest(q.id, q.xp)}
                  disabled={q.done}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                    q.done
                      ? 'bg-green-50 dark:bg-green-950/20 border-green-400 cursor-default'
                      : 'bg-blue-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary-light cursor-pointer'
                  }`}
                >
                  <span className="text-lg">{q.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-bold ${q.done ? 'text-green-700 dark:text-green-400 line-through' : 'text-gray-800 dark:text-gray-200'}`}>
                      {q.title}
                    </p>
                    {q.max > 1 && (
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1.5">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(q.progress / q.max) * 100}%` }} />
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-black text-amber-600 whitespace-nowrap">+{q.xp} XP</span>
                  {q.done && <span className="text-base">✅</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Right col */}
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-black text-[13px] mb-4">📅 Recent Activity</h3>
              {[
                { label:'Last Lesson',    value:'Timing — The Heartbeat', icon:'📖' },
                { label:'Last Animation', value:'ball_bounce_v2.gif',     icon:'✏️'  },
                { label:'Last Feedback',  value:'Score: 78/100',          icon:'🤖' },
              ].map((a) => (
                <div key={a.label} className="flex items-center gap-3 mb-3">
                  <span className="text-xl">{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{a.label}</p>
                    <p className="text-[12px] font-bold truncate">{a.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push('/lessons')}
              className="w-full card p-5 text-left hover:shadow-medium transition-shadow group"
            >
              <div className="text-2xl mb-2">🎓</div>
              <h3 className="font-black text-[13px] mb-1">Continue Learning</h3>
              <p className="text-xs text-gray-400 font-semibold mb-3">Squash &amp; Stretch · 6 min</p>
              <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-3">
                <div className="h-full w-2/5 bg-primary rounded-full" />
              </div>
              <span className="btn btn-primary text-xs py-2 px-4">Resume ▶</span>
            </button>

            <div className="card p-5">
              <h3 className="font-black text-[13px] mb-3">📊 Lesson Progress</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-black text-3xl text-primary">{doneL}</span>
                <span className="text-gray-400 text-sm font-bold">/ {ALL_LESSONS.length} lessons</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-[width] duration-700"
                  style={{ width: `${(doneL / ALL_LESSONS.length) * 100}%`, background: 'linear-gradient(90deg,#5B9CF6,#9B7FEA)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
