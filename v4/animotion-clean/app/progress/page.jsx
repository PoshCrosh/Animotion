'use client';
import { useState } from 'react';
import AppShell      from '../../components/layout/AppShell';
import ActiveLesson  from '../../components/lessons/ActiveLesson';
import Spinner       from '../../components/ui/Spinner';
import { useApp }    from '../../lib/store';
import { useAuth }   from '../../hooks/useAuth';
import { WORLDS, ALL_LESSONS } from '../../lib/curriculum';

// Get all lessons from a world (which has sections not flat lessons)
function worldLessons(world) {
  return world.sections.flatMap((s) => s.lessons);
}

export default function ProgressPage() {
  const { user, loading } = useAuth();
  const { state, completeLesson } = useApp();
  const { completedLessons } = state;

  const [hovered,      setHovered]      = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeWorld,  setActiveWorld]  = useState(null);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"><Spinner size={10} /></div>
  );

  if (activeLesson && activeWorld) {
    return (
      <AppShell user={user}>
        <ActiveLesson
          lesson={activeLesson} world={activeWorld}
          onComplete={(l) => { completeLesson(l.id, l.xp, l.skills); setActiveLesson(null); setActiveWorld(null); }}
          onBack={() => { setActiveLesson(null); setActiveWorld(null); }}
        />
      </AppShell>
    );
  }

  const totalDone = completedLessons.length;

  const nodes = ALL_LESSONS.map((lesson, idx) => {
    const world  = WORLDS.find((w) => w.id === lesson.worldId);
    const isDone = completedLessons.includes(lesson.id);
    const prev   = idx === 0 || completedLessons.includes(ALL_LESSONS[idx - 1].id);
    return { ...lesson, world, isDone, isLocked: !isDone && !prev };
  });

  // Rows of 3, zigzag
  const rows = [];
  for (let i = 0; i < nodes.length; i += 3) rows.push(nodes.slice(i, i + 3));

  return (
    <AppShell user={user}>
      <div className="page">
        <h1 className="font-black text-2xl tracking-tight mb-1">🗺️ Progress Map</h1>
        <p className="text-gray-500 text-[13px] font-semibold mb-6">
          {totalDone} of {ALL_LESSONS.length} lessons complete · Follow the path!
        </p>

        <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 276px' }}>

          {/* Map */}
          <div className="card p-8 relative overflow-hidden" style={{ minHeight: 680 }}>
            <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle,#5B9CF6 1px,transparent 1px)', backgroundSize: '28px 28px' }} />

            <div className="relative space-y-4">
              {rows.map((row, ri) => {
                const reversed = ri % 2 !== 0;
                const display  = reversed ? [...row].reverse() : row;
                return (
                  <div key={ri}>
                    {ri > 0 && (
                      <div className="flex justify-center my-1">
                        <svg width="32" height="28" viewBox="0 0 32 28" fill="none" aria-hidden="true">
                          <path d={`M16 0 C${reversed ? '2' : '30'} 0 ${reversed ? '2' : '30'} 28 16 28`}
                            stroke="#E5E7EB" strokeWidth="2.5" strokeDasharray="5 3" className="dark:stroke-gray-700" />
                        </svg>
                      </div>
                    )}
                    <div className="flex items-center gap-3 justify-center">
                      {display.map((node, ni) => {
                        const isHov = hovered?.id === node.id;
                        return (
                          <div key={node.id} className="flex items-center gap-3">
                            <div className="flex flex-col items-center gap-1.5"
                              onMouseEnter={() => setHovered(node)}
                              onMouseLeave={() => setHovered(null)}>
                              <button
                                onClick={() => !node.isLocked && (setActiveLesson(node), setActiveWorld(node.world))}
                                disabled={node.isLocked}
                                aria-label={`${node.title}${node.isLocked ? ' (locked)' : ''}`}
                                className="rounded-full transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                style={{
                                  width: 68, height: 68, borderRadius: '50%',
                                  background: node.isDone ? node.world.color : node.isLocked ? '#F3F4F6' : '#FFFFFF',
                                  border: `3px solid ${node.isDone ? node.world.color : node.isLocked ? '#E5E7EB' : node.world.color}`,
                                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                  cursor: node.isLocked ? 'not-allowed' : 'pointer',
                                  opacity: node.isLocked ? 0.5 : 1,
                                  transform: isHov && !node.isLocked ? 'scale(1.12)' : 'scale(1)',
                                  boxShadow: node.isDone
                                    ? `0 4px 16px ${node.world.color}55`
                                    : isHov && !node.isLocked ? '0 6px 24px rgba(91,156,246,0.28)'
                                    : '0 2px 8px rgba(0,0,0,0.07)',
                                  animation: !node.isDone && !node.isLocked && !isHov ? 'nodeGlow 3s ease infinite' : 'none',
                                }}>
                                <span className="text-xl leading-none">
                                  {node.isLocked ? '🔒' : node.isDone ? '✓' : node.icon}
                                </span>
                                <span className="text-[8px] font-black text-center leading-tight mt-0.5 px-1"
                                  style={{ color: node.isDone ? 'white' : node.isLocked ? '#9CA3AF' : node.world.color, maxWidth: 56 }}>
                                  {node.title.length > 9 ? node.title.slice(0, 9) + '…' : node.title}
                                </span>
                              </button>
                              <span className="text-[9px] font-black text-gray-400">+{node.xp}xp</span>
                            </div>
                            {ni < display.length - 1 && (
                              <svg width="36" height="6" viewBox="0 0 36 6" fill="none" aria-hidden="true">
                                <line x1="0" y1="3" x2="36" y2="3"
                                  stroke={node.isDone ? node.world.color : '#E5E7EB'}
                                  strokeWidth="2.5" strokeDasharray={node.isDone ? 'none' : '5 3'}
                                  className={node.isDone ? '' : 'dark:stroke-gray-700'} />
                              </svg>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-5 flex gap-4">
              {[
                ['Completed', { background:'#5B9CF6', border:'2px solid #5B9CF6' }],
                ['Available',  { background:'#fff',    border:'2px solid #5B9CF6' }],
                ['Locked',     { background:'#F3F4F6', border:'2px solid #E5E7EB' }],
              ].map(([label, style]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full" style={style} />
                  <span className="text-[10px] font-bold text-gray-400">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Side */}
          <div className="space-y-4">
            {hovered ? (
              <div className="card p-5 animate-fade-up">
                <div className="text-3xl mb-3">{hovered.icon}</div>
                <h3 className="font-black text-[13px] mb-1">{hovered.title}</h3>
                <p className="text-xs text-gray-500 font-semibold leading-relaxed mb-3">{hovered.desc}</p>
                <div className="flex gap-2 flex-wrap mb-4">
                  <span className="tag text-[10px]"
                    style={{ background:`${hovered.world.color}22`, color:hovered.world.color }}>
                    {hovered.diff}
                  </span>
                  <span className="tag bg-amber-50 dark:bg-amber-950/30 text-amber-700 text-[10px]">+{hovered.xp} XP</span>
                  <span className="tag bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px]">⏱ {hovered.time}</span>
                </div>
                <button
                  onClick={() => !hovered.isLocked && (setActiveLesson(hovered), setActiveWorld(hovered.world))}
                  disabled={hovered.isLocked}
                  className={`btn w-full text-xs justify-center ${hovered.isLocked ? 'btn-secondary opacity-50 cursor-not-allowed' : 'btn-primary'}`}>
                  {hovered.isDone ? 'Review Lesson ↩' : hovered.isLocked ? '🔒 Locked' : 'Start Lesson →'}
                </button>
              </div>
            ) : (
              <div className="card p-5 text-center">
                <div className="text-3xl mb-2">👆</div>
                <p className="text-[13px] font-bold text-gray-400">Hover a node to preview the lesson</p>
              </div>
            )}

            {/* World progress — using sections */}
            <div className="card p-5">
              <h3 className="font-black text-xs mb-4 text-gray-400 uppercase tracking-wider">World Progress</h3>
              <div className="space-y-3">
                {WORLDS.map((w) => {
                  const wLessons = worldLessons(w);
                  const done = wLessons.filter((l) => completedLessons.includes(l.id)).length;
                  return (
                    <div key={w.id} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                        style={{ background: w.color }}>
                        {w.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] font-black truncate">{w.title}</span>
                          <span className="text-[10px] font-black text-gray-400 ml-1">{done}/{wLessons.length}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-[width] duration-700"
                            style={{ width:`${wLessons.length > 0 ? (done/wLessons.length)*100 : 0}%`, background:w.color }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total */}
            <div className="card p-5">
              <h3 className="font-black text-xs mb-3 text-gray-400 uppercase tracking-wider">Overall</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-black text-4xl text-primary">{totalDone}</span>
                <span className="text-gray-400 text-sm font-bold">/ {ALL_LESSONS.length}</span>
              </div>
              <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-[width] duration-700"
                  style={{ width:`${ALL_LESSONS.length > 0 ? (totalDone/ALL_LESSONS.length)*100 : 0}%`, background:'linear-gradient(90deg,#5B9CF6,#9B7FEA)' }} />
              </div>
              <p className="text-xs text-gray-400 font-semibold mt-2">{ALL_LESSONS.length - totalDone} lessons remaining</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
