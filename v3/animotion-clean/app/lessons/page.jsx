'use client';
import { useState } from 'react';
import AppShell      from '../../components/layout/AppShell';
import ActiveLesson  from '../../components/lessons/ActiveLesson';
import Spinner       from '../../components/ui/Spinner';
import YouTubeEmbed  from '../../components/ui/YouTubeEmbed';
import { useApp }    from '../../lib/store';
import { useAuth }   from '../../hooks/useAuth';
import { WORLDS, ALL_LESSONS } from '../../lib/curriculum';

// ── Lesson card ───────────────────────────────────────────────────────────────
function LessonCard({ lesson, world, isCompleted, isLocked, onStart }) {
  return (
    <div
      onClick={() => !isLocked && onStart(lesson, world)}
      role={isLocked ? undefined : 'button'}
      tabIndex={isLocked ? -1 : 0}
      onKeyDown={(e) => !isLocked && e.key === 'Enter' && onStart(lesson, world)}
      className={`card p-4 transition-all duration-200 ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-medium cursor-pointer'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-2xl">{isLocked ? '🔒' : isCompleted ? '✅' : lesson.icon}</div>
        <span className="tag text-[10px] text-white" style={{ background: isCompleted ? '#2DA05A' : '#D4831A' }}>
          {isCompleted ? '✓ Done' : `+${lesson.xp} XP`}
        </span>
      </div>
      <h3 className="font-black text-[13px] mb-1 leading-snug">{lesson.title}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold leading-relaxed mb-3 line-clamp-2">{lesson.desc}</p>
      <div className="flex gap-2 flex-wrap mb-3">
        <span className="tag text-[10px]" style={{ background:`${world.color}22`, color:world.color }}>{lesson.diff}</span>
        <span className="tag bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px]">⏱ {lesson.time}</span>
        {lesson.videoId && <span className="tag bg-red-50 dark:bg-red-950/30 text-red-600 text-[10px]">▶ Video</span>}
      </div>
      <button disabled={isLocked}
        className={`w-full py-2 rounded-xl text-xs font-black transition-all ${isLocked ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed' : isCompleted ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200' : 'bg-primary text-white hover:bg-primary-dark shadow-soft'}`}>
        {isLocked ? '🔒 Locked' : isCompleted ? 'Review ↩' : 'Start →'}
      </button>
    </div>
  );
}

export default function LessonsPage() {
  const { user, loading }          = useAuth();
  const { state, completeLesson }  = useApp();
  const { completedLessons }       = state;

  const [activeLesson,  setActiveLesson]  = useState(null);
  const [activeWorld,   setActiveWorld]   = useState(null);
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [selectedSect,  setSelectedSect]  = useState(null);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size={10} /></div>;

  // Active lesson
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

  // Section detail
  if (selectedWorld && selectedSect) {
    const wi = WORLDS.indexOf(selectedWorld);
    const isUnlocked = wi === 0 || WORLDS[wi-1].sections.every(s => s.lessons.every(l => completedLessons.includes(l.id)));
    return (
      <AppShell user={user}>
        <div className="page">
          <button onClick={() => setSelectedSect(null)} className="flex items-center gap-2 text-gray-400 font-bold text-[13px] mb-5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            ← Back to {selectedWorld.title}
          </button>
          <h2 className="font-black text-xl mb-1">{selectedSect.title}</h2>
          <p className="text-gray-500 text-sm font-semibold mb-6">{selectedSect.lessons.length} lessons</p>
          <div className="grid grid-cols-3 gap-4">
            {selectedSect.lessons.map((lesson, i) => {
              const isDone   = completedLessons.includes(lesson.id);
              const prevDone = i === 0 || completedLessons.includes(selectedSect.lessons[i-1].id);
              return (
                <LessonCard key={lesson.id} lesson={lesson} world={selectedWorld}
                  isCompleted={isDone}
                  isLocked={!isUnlocked || (!isDone && !prevDone)}
                  onStart={(l,w) => { setActiveLesson(l); setActiveWorld(w); }} />
              );
            })}
          </div>
        </div>
      </AppShell>
    );
  }

  // World detail (sections list)
  if (selectedWorld) {
    const wi = WORLDS.indexOf(selectedWorld);
    const isUnlocked = wi === 0 || WORLDS[wi-1].sections.every(s => s.lessons.every(l => completedLessons.includes(l.id)));
    const totalDone  = selectedWorld.sections.flatMap(s => s.lessons).filter(l => completedLessons.includes(l.id)).length;
    const totalAll   = selectedWorld.sections.flatMap(s => s.lessons).length;

    return (
      <AppShell user={user}>
        <div className="page">
          <button onClick={() => setSelectedWorld(null)} className="flex items-center gap-2 text-gray-400 font-bold text-[13px] mb-5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            ← All Worlds
          </button>
          <div className="flex items-center gap-4 mb-7">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background:selectedWorld.color }}>
              {selectedWorld.icon}
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tight">{selectedWorld.title}</h1>
              <p className="text-gray-500 text-sm font-semibold">{selectedWorld.desc}</p>
            </div>
          </div>

          <div className="space-y-4">
            {selectedWorld.sections.map((section) => {
              const secDone = section.lessons.filter(l => completedLessons.includes(l.id)).length;
              const secPct  = (secDone / section.lessons.length) * 100;
              return (
                <div key={section.id}
                  className={`card overflow-hidden transition-shadow ${isUnlocked ? 'hover:shadow-medium cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
                  onClick={() => isUnlocked && setSelectedSect(section)}>
                  <div className="flex items-center gap-5 p-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-black text-base">{section.title}</h3>
                        {secDone === section.lessons.length && <span className="tag bg-green-100 dark:bg-green-950/30 text-green-700 text-[10px]">✓ Complete</span>}
                      </div>
                      <p className="text-xs text-gray-400 font-semibold mb-3">{section.lessons.length} lessons</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-[width] duration-700" style={{ width:`${secPct}%`, background:selectedWorld.color }} />
                        </div>
                        <span className="text-xs font-black text-gray-400">{secDone}/{section.lessons.length}</span>
                      </div>
                    </div>
                    {isUnlocked && <span className="text-2xl text-gray-300 dark:text-gray-600">›</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AppShell>
    );
  }

  // World overview
  return (
    <AppShell user={user}>
      <div className="page">
        <h1 className="font-black text-2xl tracking-tight mb-1">📖 Learning Paths</h1>
        <p className="text-gray-500 text-[13px] font-semibold mb-7">
          {completedLessons.length} / {ALL_LESSONS.length} lessons complete across 5 worlds
        </p>

        <div className="space-y-4">
          {WORLDS.map((world, wi) => {
            const allLessons = world.sections.flatMap(s => s.lessons);
            const done       = allLessons.filter(l => completedLessons.includes(l.id)).length;
            const pct        = (done / allLessons.length) * 100;
            const isUnlocked = wi === 0 || WORLDS[wi-1].sections.every(s => s.lessons.every(l => completedLessons.includes(l.id)));

            return (
              <div key={world.id}
                className={`card overflow-hidden transition-shadow ${isUnlocked ? 'hover:shadow-medium cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
                onClick={() => isUnlocked && setSelectedWorld(world)}>
                <div className="flex items-center gap-5 p-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: isUnlocked ? world.color : '#D1D5DB' }}>
                    {isUnlocked ? world.icon : '🔒'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="font-black text-base">{world.title}</h2>
                      {!isUnlocked && <span className="tag bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px]">LOCKED</span>}
                      {done === allLessons.length && isUnlocked && <span className="tag bg-green-100 dark:bg-green-950/30 text-green-700 text-[10px]">✓ COMPLETE</span>}
                    </div>
                    <p className="text-xs text-gray-500 font-semibold mb-3">{world.desc}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-[width] duration-700"
                          style={{ width:`${pct}%`, background:world.color }} />
                      </div>
                      <span className="text-xs font-black text-gray-400">{done}/{allLessons.length}</span>
                    </div>
                  </div>
                  {isUnlocked && <span className="text-2xl text-gray-300 dark:text-gray-600 flex-shrink-0">›</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
