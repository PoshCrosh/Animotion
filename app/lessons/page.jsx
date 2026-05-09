'use client';
import { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import ActiveLesson from '../../components/lessons/ActiveLesson';
import Spinner from '../../components/ui/Spinner';
import { useApp } from '../../lib/store';
import { useAuth } from '../../hooks/useAuth';
import { WORLDS, ALL_LESSONS } from '../../lib/curriculum';

function LessonCard({ lesson, world, isCompleted, isLocked, onStart }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={() => !isLocked && onStart(lesson, world)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      role={isLocked ? undefined : 'button'}
      tabIndex={isLocked ? -1 : 0}
      onKeyDown={(e) => !isLocked && e.key === 'Enter' && onStart(lesson, world)}
      className="wii-card p-4 flex flex-col"
      style={{
        opacity: isLocked ? 0.5 : 1,
        cursor: isLocked ? 'not-allowed' : 'pointer',
        transform: hov && !isLocked ? 'translateY(-3px) scale(1.02)' : 'none',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-2xl">{isLocked ? '🔒' : isCompleted ? '✅' : lesson.icon}</div>
        <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
          style={{ background: isCompleted ? '#52C97C' : '#FFB347' }}>
          {isCompleted ? '✓ Done' : `+${lesson.xp} XP`}
        </span>
      </div>
      <h3 className="font-black text-[13px] mb-1 leading-snug" style={{ color: '#1E3A4A' }}>{lesson.title}</h3>
      <p className="text-[11px] font-semibold leading-relaxed mb-3 flex-1 line-clamp-2" style={{ color: '#7A9BAA' }}>{lesson.desc}</p>
      <div className="flex gap-1.5 flex-wrap mb-3">
        <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background:`${world.color}22`, color:world.color }}>{lesson.diff}</span>
        <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background:'rgba(0,154,199,0.08)', color:'#009AC7' }}>⏱ {lesson.time}</span>
        {lesson.videoId && <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background:'rgba(255,87,87,0.1)', color:'#FF5757' }}>▶ Video</span>}
      </div>
      <button disabled={isLocked} className="w-full py-2 rounded-2xl text-[11px] font-black transition-all"
        style={{
          background: isLocked ? 'rgba(0,0,0,0.06)' : isCompleted ? 'rgba(82,201,124,0.12)' : 'linear-gradient(135deg,#009AC7,#007AAA)',
          color: isLocked ? '#9AB5C0' : isCompleted ? '#52C97C' : 'white',
          boxShadow: !isLocked && !isCompleted ? '0 4px 12px rgba(0,154,199,0.3)' : 'none',
        }}>
        {isLocked ? '🔒 Locked' : isCompleted ? 'Review ↩' : 'Start Mission →'}
      </button>
    </div>
  );
}

export default function LessonsPage() {
  const { user, loading } = useAuth();
  const { state, completeLesson } = useApp();
  const { completedLessons } = state;
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeWorld, setActiveWorld] = useState(null);
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [selectedSect, setSelectedSect] = useState(null);

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background:'#EAF6FB' }}><Spinner size={10} /></div>;

  if (activeLesson && activeWorld) {
    return (
      <AppShell user={user}>
        <ActiveLesson lesson={activeLesson} world={activeWorld}
          onComplete={(l) => { completeLesson(l.id, l.xp, l.skills); setActiveLesson(null); setActiveWorld(null); }}
          onBack={() => { setActiveLesson(null); setActiveWorld(null); }} />
      </AppShell>
    );
  }

  if (selectedWorld && selectedSect) {
    const wi = WORLDS.indexOf(selectedWorld);
    const isUnlocked = wi === 0 || WORLDS[wi-1].sections.every(s => s.lessons.every(l => completedLessons.includes(l.id)));
    return (
      <AppShell user={user}>
        <div className="page">
          <button onClick={() => setSelectedSect(null)} className="wii-btn wii-btn-ghost mb-5 text-xs">← Back to {selectedWorld.title}</button>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg" style={{ background:selectedWorld.color }}>{selectedWorld.icon}</div>
            <div>
              <h2 className="font-black text-xl" style={{ color:'#1E3A4A' }}>{selectedSect.title}</h2>
              <p className="text-[12px] font-semibold" style={{ color:'#7A9BAA' }}>{selectedSect.lessons.length} missions</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {selectedSect.lessons.map((lesson, i) => {
              const isDone = completedLessons.includes(lesson.id);
              const prevDone = i === 0 || completedLessons.includes(selectedSect.lessons[i-1].id);
              return <LessonCard key={lesson.id} lesson={lesson} world={selectedWorld} isCompleted={isDone} isLocked={!isUnlocked || (!isDone && !prevDone)} onStart={(l,w) => { setActiveLesson(l); setActiveWorld(w); }} />;
            })}
          </div>
        </div>
      </AppShell>
    );
  }

  if (selectedWorld) {
    const wi = WORLDS.indexOf(selectedWorld);
    const isUnlocked = wi === 0 || WORLDS[wi-1].sections.every(s => s.lessons.every(l => completedLessons.includes(l.id)));
    return (
      <AppShell user={user}>
        <div className="page">
          <button onClick={() => setSelectedWorld(null)} className="wii-btn wii-btn-ghost mb-5 text-xs">← All Worlds</button>
          <div className="flex items-center gap-4 mb-7">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background:selectedWorld.color, boxShadow:`0 4px 16px ${selectedWorld.color}55` }}>{selectedWorld.icon}</div>
            <div>
              <h1 className="font-black text-2xl" style={{ color:'#1E3A4A' }}>{selectedWorld.title}</h1>
              <p className="text-[13px] font-semibold" style={{ color:'#7A9BAA' }}>{selectedWorld.desc}</p>
            </div>
          </div>
          <div className="space-y-3">
            {selectedWorld.sections.map((section) => {
              const secDone = section.lessons.filter(l => completedLessons.includes(l.id)).length;
              const secPct = (secDone / section.lessons.length) * 100;
              return (
                <div key={section.id} className="wii-card overflow-hidden"
                  style={{ cursor:isUnlocked?'pointer':'not-allowed', opacity:isUnlocked?1:0.6 }}
                  onClick={() => isUnlocked && setSelectedSect(section)}>
                  <div className="flex items-center gap-5 p-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-black text-[14px]" style={{ color:'#1E3A4A' }}>{section.title}</h3>
                        {secDone === section.lessons.length && <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background:'rgba(82,201,124,0.15)', color:'#52C97C' }}>✓ Complete</span>}
                      </div>
                      <p className="text-[11px] font-semibold mb-3" style={{ color:'#7A9BAA' }}>{section.lessons.length} missions</p>
                      <div className="flex items-center gap-3">
                        <div className="wii-progress-track flex-1"><div className="wii-progress-fill" style={{ width:`${secPct}%`, background:selectedWorld.color }} /></div>
                        <span className="text-[11px] font-black" style={{ color:'#9AB5C0' }}>{secDone}/{section.lessons.length}</span>
                      </div>
                    </div>
                    {isUnlocked && <span className="text-2xl" style={{ color:'#C8D8E0' }}>›</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell user={user}>
      <div className="page">
        <div className="wii-card p-5 mb-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background:'linear-gradient(135deg,#009AC7,#007AAA)', boxShadow:'0 4px 16px rgba(0,154,199,0.35)' }}>📖</div>
          <div className="flex-1">
            <h1 className="font-black text-2xl" style={{ color:'#1E3A4A' }}>Learning Worlds</h1>
            <p className="text-[13px] font-semibold mb-2" style={{ color:'#7A9BAA' }}>{completedLessons.length} / {ALL_LESSONS.length} missions complete</p>
            <div className="wii-progress-track"><div className="wii-progress-fill" style={{ width:`${(completedLessons.length/ALL_LESSONS.length)*100}%` }} /></div>
          </div>
        </div>
        <div className="space-y-3">
          {WORLDS.map((world, wi) => {
            const all = world.sections.flatMap(s => s.lessons);
            const done = all.filter(l => completedLessons.includes(l.id)).length;
            const pct = (done / all.length) * 100;
            const isUnlocked = wi === 0 || WORLDS[wi-1].sections.every(s => s.lessons.every(l => completedLessons.includes(l.id)));
            return (
              <div key={world.id} className="wii-card p-5 flex items-center gap-4"
                style={{ cursor:isUnlocked?'pointer':'not-allowed', opacity:isUnlocked?1:0.55 }}
                onClick={() => isUnlocked && setSelectedWorld(world)}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background:isUnlocked?world.color:'#C8D8E0', boxShadow:isUnlocked?`0 4px 14px ${world.color}55`:'none' }}>{isUnlocked?world.icon:'🔒'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-black text-[14px]" style={{ color:'#1E3A4A' }}>{world.title}</h2>
                    {!isUnlocked && <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background:'rgba(0,0,0,0.07)', color:'#9AB5C0' }}>LOCKED</span>}
                    {done===all.length && isUnlocked && <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background:'rgba(82,201,124,0.15)', color:'#52C97C' }}>✓ COMPLETE</span>}
                  </div>
                  <p className="text-[11px] font-semibold mb-2" style={{ color:'#7A9BAA' }}>{world.desc}</p>
                  <div className="flex items-center gap-3">
                    <div className="wii-progress-track flex-1"><div className="wii-progress-fill" style={{ width:`${pct}%`, background:world.color }} /></div>
                    <span className="text-[11px] font-black" style={{ color:'#9AB5C0' }}>{done}/{all.length}</span>
                  </div>
                </div>
                {isUnlocked && <span className="text-2xl flex-shrink-0" style={{ color:'#C8D8E0' }}>›</span>}
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
