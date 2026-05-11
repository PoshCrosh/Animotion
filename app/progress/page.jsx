'use client';
import { useRouter } from 'next/navigation';
import AppShell from '../../components/layout/AppShell';
import Spinner  from '../../components/ui/Spinner';
import { useApp }  from '../../lib/store';
import { useAuth } from '../../hooks/useAuth';
import { WORLDS }  from '../../lib/curriculum';

// Duolingo-style zigzag positions for nodes
function getZigzagX(i, total) {
  // Alternate left/center/right like Duolingo
  const pattern = [0.5, 0.75, 0.5, 0.25];
  return pattern[i % pattern.length];
}

function LessonNode({ lesson, isDone, isActive, isLocked, index, onClick }) {
  const x = getZigzagX(index);
  const size = isActive ? 72 : 60;

  let bg, border, shadow, icon;
  if (isDone)    { bg='linear-gradient(135deg,#52C97C,#3DAD65)'; border='none'; shadow='0 4px 14px rgba(82,201,124,0.45)'; icon='✓'; }
  else if (isActive) { bg='linear-gradient(135deg,#009AC7,#007AAA)'; border='none'; shadow='0 0 0 6px rgba(0,154,199,0.2), 0 4px 20px rgba(0,154,199,0.4)'; icon=lesson.icon; }
  else if (isLocked) { bg='rgba(200,216,224,0.6)'; border='2px dashed rgba(0,154,199,0.2)'; shadow='none'; icon='🔒'; }
  else               { bg='rgba(255,255,255,0.9)'; border='2px solid rgba(0,154,199,0.25)'; shadow='0 2px 8px rgba(0,120,180,0.1)'; icon=lesson.icon; }

  return (
    <div className="flex flex-col items-center" style={{ marginLeft:`${x * 100}%`, transform:'translateX(-50%)', width:'fit-content', marginBottom:8 }}>
      <button
        onClick={() => !isLocked && onClick()}
        disabled={isLocked}
        className="flex items-center justify-center rounded-full transition-all duration-200 relative"
        style={{ width:size, height:size, background:bg, border, boxShadow:shadow, cursor:isLocked?'not-allowed':'pointer',
          fontSize: isActive ? 28 : 22,
          animation: isActive ? 'node-glow 2s ease-in-out infinite' : 'none',
          transform: isActive ? 'scale(1.0)' : 'scale(1)',
        }}
        title={lesson.title}
      >
        {isDone ? <span style={{ fontSize:24, color:'white' }}>✓</span> : <span>{icon}</span>}
        {/* XP bubble */}
        {!isDone && !isLocked && (
          <div className="absolute -top-2 -right-2 text-[9px] font-black text-white px-1.5 py-0.5 rounded-full"
            style={{ background:'#FFB347', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }}>
            +{lesson.xp}
          </div>
        )}
      </button>
      <p className="text-[10px] font-black text-center mt-2 leading-tight"
        style={{ color:isDone?'#52C97C':isActive?'#009AC7':isLocked?'#C8D8E0':'#5A7A8A', maxWidth:72 }}>
        {lesson.title}
      </p>
    </div>
  );
}

export default function ProgressPage() {
  const { user, loading } = useAuth();
  const { state } = useApp();
  const { completedLessons } = state;
  const router = useRouter();

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background:'#EAF6FB' }}><Spinner size={10}/></div>;

  const allLessons = WORLDS.flatMap(w => w.sections.flatMap(s => s.lessons.map(l => ({ ...l, worldColor:w.color, worldTitle:w.title, worldIcon:w.icon }))));
  const firstIncompIdx = allLessons.findIndex(l => !completedLessons.includes(l.id));
  const totalDone = completedLessons.length;
  const totalAll  = allLessons.length;
  const overallPct = Math.round((totalDone / totalAll) * 100);

  return (
    <AppShell user={user}>
      <div className="page">
        {/* Header */}
        <div className="wii-card p-5 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background:'linear-gradient(135deg,#52C97C,#3DAD65)', boxShadow:'0 4px 16px rgba(82,201,124,0.4)' }}>🗺️</div>
          <div className="flex-1">
            <h1 className="font-black text-2xl" style={{ color:'#1E3A4A' }}>Progress Map</h1>
            <p className="text-[13px] font-semibold mb-2" style={{ color:'#7A9BAA' }}>
              {totalDone} of {totalAll} missions complete — {overallPct}%
            </p>
            <div className="wii-progress-track">
              <div className="wii-progress-fill" style={{ width:`${overallPct}%` }}/>
            </div>
          </div>
          <button onClick={() => router.push('/lessons')} className="wii-btn wii-btn-primary text-xs flex-shrink-0">
            Continue →
          </button>
        </div>

        {/* Legend */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {[
            { color:'#52C97C', label:'Completed', ring:'rgba(82,201,124,0.2)' },
            { color:'#009AC7', label:'Up Next',   ring:'rgba(0,154,199,0.3)' },
            { color:'#5A7A8A', label:'Available', ring:'rgba(0,154,199,0.15)' },
            { color:'#C8D8E0', label:'Locked',    ring:'none' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background:'rgba(255,255,255,0.8)', border:'1px solid rgba(0,154,199,0.15)' }}>
              <div className="w-3 h-3 rounded-full" style={{ background:item.color }}/>
              <span className="text-[11px] font-black" style={{ color:item.color }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* World paths */}
        {WORLDS.map((world, wi) => {
          const worldLessons  = world.sections.flatMap(s => s.lessons);
          const worldDone     = worldLessons.filter(l => completedLessons.includes(l.id)).length;
          const worldPct      = Math.round((worldDone / worldLessons.length) * 100);
          const isUnlocked    = wi === 0 || WORLDS[wi-1].sections.every(s => s.lessons.every(l => completedLessons.includes(l.id)));

          return (
            <div key={world.id} className="wii-card p-6 mb-5 overflow-hidden" style={{ opacity:isUnlocked?1:0.6 }}>
              {/* World header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background:isUnlocked?world.color:'#C8D8E0', boxShadow:isUnlocked?`0 4px 12px ${world.color}55`:'none' }}>
                  {isUnlocked ? world.icon : '🔒'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-black text-[15px]" style={{ color:'#1E3A4A' }}>{world.title}</h2>
                    {worldDone === worldLessons.length && isUnlocked && (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background:'rgba(82,201,124,0.15)', color:'#52C97C' }}>✓ COMPLETE</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="wii-progress-track flex-1">
                      <div className="wii-progress-fill" style={{ width:`${worldPct}%`, background:world.color }}/>
                    </div>
                    <span className="text-[11px] font-black" style={{ color:'#9AB5C0' }}>{worldDone}/{worldLessons.length}</span>
                  </div>
                </div>
              </div>

              {/* Duolingo-style path */}
              <div className="relative" style={{ minHeight: worldLessons.length * 88 }}>
                {/* Connecting path line */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex:0 }}>
                  {worldLessons.map((lesson, li) => {
                    if (li === 0) return null;
                    const x1 = getZigzagX(li - 1) * 100;
                    const x2 = getZigzagX(li) * 100;
                    const y1 = (li - 1) * 88 + 36;
                    const y2 = li * 88 + 36;
                    const isDone = completedLessons.includes(worldLessons[li-1].id);
                    return (
                      <line key={li}
                        x1={`${x1}%`} y1={y1}
                        x2={`${x2}%`} y2={y2}
                        stroke={isDone ? world.color : 'rgba(0,154,199,0.15)'}
                        strokeWidth={isDone ? 4 : 2}
                        strokeDasharray={isDone ? 'none' : '6,4'}
                        opacity={0.6}
                      />
                    );
                  })}
                </svg>

                {/* Nodes */}
                <div className="relative" style={{ zIndex:1 }}>
                  {worldLessons.map((lesson, li) => {
                    const prevLessons = worldLessons.slice(0, li);
                    const isDone   = completedLessons.includes(lesson.id);
                    const prevDone = li === 0 ? isUnlocked : completedLessons.includes(worldLessons[li-1].id);
                    const globalIdx = allLessons.findIndex(l => l.id === lesson.id);
                    const isActive = globalIdx === firstIncompIdx;
                    const isLocked = !isUnlocked || (!isDone && !prevDone);
                    return (
                      <div key={lesson.id} style={{ position:'absolute', top: li * 88, left:0, right:0, display:'flex', justifyContent:'flex-start' }}>
                        <LessonNode lesson={lesson} isDone={isDone} isActive={isActive} isLocked={isLocked}
                          index={li} onClick={() => router.push('/lessons')} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
