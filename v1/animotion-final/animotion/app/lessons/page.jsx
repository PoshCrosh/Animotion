'use client';
import { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import LessonCard from '../../components/lessons/LessonCard';
import ActiveLesson from '../../components/lessons/ActiveLesson';
import Spinner from '../../components/ui/Spinner';
import { useApp } from '../../lib/store';
import { useAuth } from '../../hooks/useAuth';
import { WORLDS, ALL_LESSONS } from '../../lib/curriculum';

export default function LessonsPage() {
  const { user, loading } = useAuth();
  const { state, completeLesson } = useApp();
  const { completedLessons } = state;

  const [activeLesson,   setActiveLesson]   = useState(null);
  const [activeWorld,    setActiveWorld]    = useState(null);
  const [selectedWorld,  setSelectedWorld]  = useState(null);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"><Spinner size={10} /></div>
  );

  // ── Active lesson view ───────────────────────────────────────────────────
  if (activeLesson && activeWorld) {
    return (
      <AppShell user={user}>
        <ActiveLesson
          lesson={activeLesson} world={activeWorld}
          onComplete={(lesson) => { completeLesson(lesson.id, lesson.xp); setActiveLesson(null); setActiveWorld(null); }}
          onBack={() => { setActiveLesson(null); setActiveWorld(null); }}
        />
      </AppShell>
    );
  }

  // ── World detail view ────────────────────────────────────────────────────
  if (selectedWorld) {
    // A world is unlocked when it's the first world, OR the previous world is fully complete
    const wi = WORLDS.indexOf(selectedWorld);
    const isUnlocked = wi === 0 || WORLDS[wi - 1].lessons.every((l) => completedLessons.includes(l.id));

    return (
      <AppShell user={user}>
        <div className="page">
          <button onClick={() => setSelectedWorld(null)}
            className="flex items-center gap-2 text-gray-400 font-bold text-[13px] mb-6 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            ← All Worlds
          </button>
          <div className="flex items-center gap-4 mb-7">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: selectedWorld.color }}>
              {selectedWorld.icon}
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tight">{selectedWorld.title}</h1>
              <p className="text-gray-500 text-[13px] font-semibold">{selectedWorld.desc}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {selectedWorld.lessons.map((lesson, i) => {
              const isDone   = completedLessons.includes(lesson.id);
              const prevDone = i === 0 || completedLessons.includes(selectedWorld.lessons[i - 1].id);
              return (
                <LessonCard key={lesson.id} lesson={lesson} world={selectedWorld}
                  isCompleted={isDone} isLocked={!isUnlocked || (!isDone && !prevDone)}
                  onStart={(l, w) => { setActiveLesson(l); setActiveWorld(w); }} />
              );
            })}
          </div>
        </div>
      </AppShell>
    );
  }

  // ── World overview ────────────────────────────────────────────────────────
  return (
    <AppShell user={user}>
      <div className="page">
        <h1 className="font-black text-2xl tracking-tight mb-1">📖 Your Learning Path</h1>
        <p className="text-gray-500 text-[13px] font-semibold mb-7">
          {completedLessons.length} / {ALL_LESSONS.length} lessons complete
        </p>

        <div className="space-y-4">
          {WORLDS.map((world, wi) => {
            const done = world.lessons.filter((l) => completedLessons.includes(l.id)).length;
            const pct  = (done / world.lessons.length) * 100;
            const isUnlocked = wi === 0 || WORLDS[wi - 1].lessons.every((l) => completedLessons.includes(l.id));

            return (
              <div key={world.id}
                className={`card overflow-hidden transition-shadow ${isUnlocked ? 'hover:shadow-medium cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
                onClick={() => isUnlocked && setSelectedWorld(world)}
              >
                <div className="flex items-center gap-5 p-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: isUnlocked ? world.color : '#D1D5DB' }}>
                    {isUnlocked ? world.icon : '🔒'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="font-black text-base">{world.title}</h2>
                      {!isUnlocked && <span className="tag bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px]">LOCKED</span>}
                      {done === world.lessons.length && isUnlocked && <span className="tag bg-green-100 dark:bg-green-950/30 text-green-700 text-[10px]">✓ COMPLETE</span>}
                    </div>
                    <p className="text-xs text-gray-500 font-semibold mb-3">{world.desc}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-[width] duration-700"
                          style={{ width: `${pct}%`, background: world.color }} />
                      </div>
                      <span className="text-xs font-black text-gray-400 flex-shrink-0">{done}/{world.lessons.length}</span>
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
