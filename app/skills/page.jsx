'use client';
import AppShell from '../../components/layout/AppShell';
import { useApp }  from '../../lib/store';
import { useAuth } from '../../hooks/useAuth';
import { SKILLS, DEFAULT_SKILLS, ALL_LESSONS } from '../../lib/curriculum';
import { useRouter } from 'next/navigation';
import Spinner from '../../components/ui/Spinner';

const LEVEL_LABELS = ['Novice','Beginner','Intermediate','Advanced','Master'];
function getLevel(v) {
  if (v >= 80) return 4;
  if (v >= 60) return 3;
  if (v >= 40) return 2;
  if (v >= 20) return 1;
  return 0;
}

export default function SkillsPage() {
  const { user, loading } = useAuth();
  const { state } = useApp();
  const { skills } = state;
  const router = useRouter();
  const merged = { ...DEFAULT_SKILLS, ...(skills ?? {}) };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background:'#EAF6FB' }}><Spinner size={10}/></div>;

  const totalPts = SKILLS.reduce((s, sk) => s + (merged[sk.id] ?? 0), 0);
  const sorted   = [...SKILLS].sort((a, b) => (merged[b.id] ?? 0) - (merged[a.id] ?? 0));

  return (
    <AppShell user={user}>
      <div className="page">
        {/* Header */}
        <div className="wii-card p-5 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background:'linear-gradient(135deg,#9B7FEA,#7C5FD4)', boxShadow:'0 4px 16px rgba(155,127,234,0.4)' }}>📊</div>
          <div className="flex-1">
            <h1 className="font-black text-2xl" style={{ color:'#1E3A4A' }}>Skills</h1>
            <p className="text-[13px] font-semibold" style={{ color:'#7A9BAA' }}>
              Track your growth across all 12 animation principles
            </p>
          </div>
          <div className="text-center px-4 py-2 rounded-2xl" style={{ background:'rgba(155,127,234,0.1)', border:'1px solid rgba(155,127,234,0.2)' }}>
            <p className="font-black text-xl" style={{ color:'#9B7FEA' }}>{totalPts}</p>
            <p className="text-[10px] font-bold uppercase" style={{ color:'#9AB5C0' }}>Total Pts</p>
          </div>
        </div>

        {/* Tip */}
        {totalPts === 0 && (
          <div className="wii-card p-4 mb-5" style={{ background:'rgba(0,154,199,0.06)', border:'1px solid rgba(0,154,199,0.15)' }}>
            <p className="font-black text-[13px] mb-1" style={{ color:'#009AC7' }}>🌱 Just getting started!</p>
            <p className="text-[11px] font-semibold" style={{ color:'#7A9BAA' }}>
              Complete lessons and chat with Ani to grow your skills. Each skill tracks a real animation principle.
            </p>
          </div>
        )}

        {/* Skill cards */}
        <div className="grid grid-cols-2 gap-4">
          {sorted.map(skill => {
            const val     = merged[skill.id] ?? 0;
            const pct     = Math.min(100, val);
            const lvlIdx  = getLevel(val);
            const lvlName = LEVEL_LABELS[lvlIdx];

            // Find a lesson related to this skill
            const relatedLesson = ALL_LESSONS.find(l => l.skills?.[skill.id] > 0);

            return (
              <div key={skill.id} className="wii-card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background:`${skill.color}15`, border:`1.5px solid ${skill.color}30` }}>
                    {skill.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-[13px]" style={{ color:'#1E3A4A' }}>{skill.label}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                        style={{ background:`${skill.color}15`, color:skill.color }}>{lvlName}</span>
                      <span className="text-[11px] font-black" style={{ color:skill.color }}>{val}</span>
                    </div>
                  </div>
                </div>

                {/* Skill bar */}
                <div className="wii-progress-track mb-3">
                  <div className="wii-progress-fill" style={{ width:`${pct}%`, background:skill.color }} />
                </div>

                {/* Level milestones */}
                <div className="flex justify-between mb-3">
                  {LEVEL_LABELS.map((lbl, i) => (
                    <span key={lbl} className="text-[8px] font-bold"
                      style={{ color: lvlIdx >= i ? skill.color : '#C8D8E0' }}>
                      {lbl.slice(0,3)}
                    </span>
                  ))}
                </div>

                {/* Related lesson */}
                {relatedLesson && val < 80 && (
                  <button onClick={() => router.push('/lessons')}
                    className="w-full text-left rounded-xl px-3 py-2 text-[11px] font-bold transition-all hover:opacity-80"
                    style={{ background:'rgba(0,154,199,0.06)', border:'1px solid rgba(0,154,199,0.12)', color:'#009AC7' }}>
                    📖 Try: {relatedLesson.title}
                  </button>
                )}

                {val >= 80 && (
                  <div className="rounded-xl px-3 py-2 text-center"
                    style={{ background:'rgba(82,201,124,0.1)', border:'1px solid rgba(82,201,124,0.2)' }}>
                    <span className="text-[11px] font-black" style={{ color:'#52C97C' }}>✨ Master level!</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Coach tip */}
        <div className="wii-card p-5 mt-5 flex items-center gap-4">
          <div className="text-3xl">🤖</div>
          <div className="flex-1">
            <p className="font-black text-[13px] mb-1" style={{ color:'#1E3A4A' }}>Chat with Ani to grow faster</p>
            <p className="text-[11px] font-semibold" style={{ color:'#7A9BAA' }}>
              Every conversation with your AI coach awards skill points based on what you discuss.
            </p>
          </div>
          <button onClick={() => router.push('/coach')} className="wii-btn wii-btn-primary text-xs flex-shrink-0">
            Open Coach →
          </button>
        </div>
      </div>
    </AppShell>
  );
}
