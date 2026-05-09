'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../../components/layout/AppShell';
import Spinner  from '../../components/ui/Spinner';
import { useApp }  from '../../lib/store';
import { useAuth } from '../../hooks/useAuth';
import { WORLDS }  from '../../lib/curriculum';

function ProgressNode({ lesson, isDone, isActive, isLocked, onClick, col }) {
  const [hov, setHov] = useState(false);
  return (
    <div className="flex flex-col items-center" style={{ width:88 }}>
      <button
        onClick={() => !isLocked && onClick()}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        disabled={isLocked}
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-all"
        style={{
          background: isDone ? 'linear-gradient(135deg,#52C97C,#3DAD65)' : isActive ? 'linear-gradient(135deg,#009AC7,#007AAA)' : isLocked ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.85)',
          border: isActive ? '3px solid #009AC7' : isDone ? '3px solid #3DAD65' : '1.5px solid rgba(0,154,199,0.2)',
          boxShadow: isActive ? '0 0 0 6px rgba(0,154,199,0.2), 0 4px 16px rgba(0,154,199,0.3)' : isDone ? '0 4px 12px rgba(82,201,124,0.3)' : hov ? '0 6px 20px rgba(0,120,180,0.15)' : '0 2px 8px rgba(0,120,180,0.08)',
          transform: hov && !isLocked ? 'scale(1.08) translateY(-2px)' : 'scale(1)',
          cursor: isLocked ? 'not-allowed' : 'pointer',
          opacity: isLocked ? 0.45 : 1,
          animation: isActive ? 'node-glow 2s ease-in-out infinite' : 'none',
          color: isDone||isActive ? 'white' : '#7A9BAA',
          fontSize: isLocked ? 24 : 22,
        }}>
        {isLocked ? '🔒' : isDone ? '✓' : lesson.icon}
      </button>
      <p className="text-[10px] font-black text-center mt-2 leading-tight" style={{ color:isDone?'#52C97C':isActive?'#009AC7':isLocked?'#C8D8E0':'#5A7A8A', maxWidth:80 }}>
        {lesson.title}
      </p>
    </div>
  );
}

export default function ProgressPage() {
  const { user, loading } = useAuth();
  const { state }         = useApp();
  const { completedLessons } = state;
  const router = useRouter();

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background:'#EAF6FB' }}><Spinner size={10}/></div>;

  const allLessons = WORLDS.flatMap(w => w.sections.flatMap(s => s.lessons.map(l => ({ ...l, worldColor:w.color, worldTitle:w.title }))));
  const firstIncompIdx = allLessons.findIndex(l => !completedLessons.includes(l.id));

  return (
    <AppShell user={user}>
      <div className="page">
        {/* Header */}
        <div className="wii-card p-5 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background:'linear-gradient(135deg,#52C97C,#3DAD65)', boxShadow:'0 4px 16px rgba(82,201,124,0.4)' }}>🗺️</div>
          <div className="flex-1">
            <h1 className="font-black text-2xl" style={{ color:'#1E3A4A' }}>Progress Map</h1>
            <p className="text-[13px] font-semibold mb-2" style={{ color:'#7A9BAA' }}>
              {completedLessons.length} / {allLessons.length} missions complete
            </p>
            <div className="wii-progress-track" style={{ maxWidth:300 }}>
              <div className="wii-progress-fill" style={{ width:`${(completedLessons.length/allLessons.length)*100}%` }}/>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-6 flex-wrap">
          {[
            { color:'#52C97C', label:'Completed', bg:'rgba(82,201,124,0.12)' },
            { color:'#009AC7', label:'Next up',   bg:'rgba(0,154,199,0.12)' },
            { color:'#9AB5C0', label:'Available', bg:'rgba(154,181,192,0.12)' },
            { color:'#C8D8E0', label:'Locked',    bg:'rgba(200,216,224,0.12)' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background:item.bg, border:`1px solid ${item.color}33` }}>
              <div className="w-3 h-3 rounded-full" style={{ background:item.color }}/>
              <span className="text-[11px] font-black" style={{ color:item.color }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* World sections */}
        {WORLDS.map((world, wi) => {
          const isWorldUnlocked = wi===0 || WORLDS[wi-1].sections.every(s=>s.lessons.every(l=>completedLessons.includes(l.id)));
          const worldLessons = world.sections.flatMap(s => s.lessons);
          const worldDone = worldLessons.filter(l=>completedLessons.includes(l.id)).length;

          return (
            <div key={world.id} className="wii-card p-6 mb-4">
              {/* World header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
                  style={{ background:isWorldUnlocked?world.color:'#C8D8E0', boxShadow:isWorldUnlocked?`0 2px 10px ${world.color}55`:'none' }}>
                  {isWorldUnlocked?world.icon:'🔒'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-black text-[14px]" style={{ color:'#1E3A4A' }}>{world.title}</h2>
                    {worldDone===worldLessons.length&&isWorldUnlocked&&(
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background:'rgba(82,201,124,0.15)', color:'#52C97C' }}>✓ Complete</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="wii-progress-track flex-1 h-1.5">
                      <div className="wii-progress-fill" style={{ width:`${(worldDone/worldLessons.length)*100}%`, background:world.color }}/>
                    </div>
                    <span className="text-[10px] font-black" style={{ color:'#9AB5C0' }}>{worldDone}/{worldLessons.length}</span>
                  </div>
                </div>
              </div>

              {/* Zigzag node map */}
              <div className="overflow-x-auto">
                {world.sections.map((section, si) => {
                  const allPrevSections = world.sections.slice(0,si).flatMap(s=>s.lessons);
                  const sectionUnlocked = isWorldUnlocked && allPrevSections.every(l=>completedLessons.includes(l.id));

                  return (
                    <div key={section.id} className="mb-4">
                      <p className="wii-section-label mb-3">{section.title}</p>
                      <div className="flex gap-4 flex-wrap">
                        {section.lessons.map((lesson, li) => {
                          const prevDone = li===0 ? sectionUnlocked : completedLessons.includes(section.lessons[li-1].id);
                          const isDone   = completedLessons.includes(lesson.id);
                          const globalIdx = allLessons.findIndex(l=>l.id===lesson.id);
                          const isActive = globalIdx===firstIncompIdx;
                          const isLocked = !sectionUnlocked || (!isDone&&!prevDone);
                          return (
                            <ProgressNode key={lesson.id} lesson={lesson}
                              isDone={isDone} isActive={isActive} isLocked={isLocked}
                              onClick={() => router.push('/lessons')}
                              col={li} />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
