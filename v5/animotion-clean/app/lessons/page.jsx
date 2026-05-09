'use client';
import { useState, useMemo } from 'react';
import AppShell      from '../../components/layout/AppShell';
import ActiveLesson  from '../../components/lessons/ActiveLesson';
import Spinner       from '../../components/ui/Spinner';
import { useApp }    from '../../lib/store';
import { useAuth }   from '../../hooks/useAuth';
import { WORLDS, ALL_LESSONS, SKILLS, DEFAULT_SKILLS } from '../../lib/curriculum';

// ── Helpers ───────────────────────────────────────────────────────────────────
function worldLessons(world) {
  return world.sections.flatMap((s) => s.lessons);
}

function getDiffColor(diff) {
  return diff === 'Beginner' ? '#52C97C'
    : diff === 'Intermediate' ? '#FFB347'
    : '#FF5757';
}

// ── Lesson Mission Card ───────────────────────────────────────────────────────
function MissionCard({ lesson, world, isCompleted, isLocked, onStart }) {
  const topSkills = lesson.skills
    ? Object.entries(lesson.skills).filter(([, v]) => v > 0).slice(0, 3)
    : [];

  return (
    <div
      onClick={() => !isLocked && onStart(lesson, world)}
      role={isLocked ? undefined : 'button'}
      tabIndex={isLocked ? -1 : 0}
      onKeyDown={(e) => !isLocked && e.key === 'Enter' && onStart(lesson, world)}
      className={`card p-4 transition-all duration-200 group ${
        isLocked
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:-translate-y-1 hover:shadow-medium cursor-pointer'
      } ${isCompleted ? 'border-green-200 dark:border-green-800' : ''}`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: isLocked ? '#F3F4F6' : `${world.color}22` }}>
          {isLocked ? '🔒' : isCompleted ? '✅' : lesson.icon}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="tag text-[10px] text-white"
            style={{ background: isCompleted ? '#2DA05A' : world.color }}>
            {isCompleted ? '✓ Done' : `+${lesson.xp} XP`}
          </span>
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
            style={{ background: `${getDiffColor(lesson.diff)}22`, color: getDiffColor(lesson.diff) }}>
            {lesson.diff}
          </span>
        </div>
      </div>

      {/* Title & desc */}
      <h3 className="font-black text-[13px] mb-1 leading-snug">{lesson.title}</h3>
      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold leading-relaxed mb-3 line-clamp-2">
        {lesson.desc}
      </p>

      {/* Meta row */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className="tag bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px]">⏱ {lesson.time}</span>
        {lesson.videoId && <span className="tag bg-red-50 dark:bg-red-950/30 text-red-600 text-[10px]">▶ Video</span>}
        {lesson.interactive && <span className="tag bg-purple-50 dark:bg-purple-950/30 text-purple-600 text-[10px]">🎮 Interactive</span>}
      </div>

      {/* Skills improved */}
      {topSkills.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-3">
          {topSkills.map(([skill, val]) => {
            const sk = SKILLS.find((s) => s.id === skill);
            return sk ? (
              <span key={skill} className="flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full"
                style={{ background: `${sk.color}18`, color: sk.color }}>
                {sk.icon} +{val}
              </span>
            ) : null;
          })}
        </div>
      )}

      {/* CTA */}
      <button disabled={isLocked}
        className={`w-full py-2.5 rounded-xl text-xs font-black transition-all ${
          isLocked
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
            : isCompleted
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
            : 'text-white shadow-soft group-hover:opacity-90'
        }`}
        style={!isLocked && !isCompleted ? { background: `linear-gradient(135deg, ${world.color}, ${world.color}cc)` } : {}}>
        {isLocked ? '🔒 Locked' : isCompleted ? '↩ Review Mission' : '🚀 Start Mission'}
      </button>
    </div>
  );
}

// ── World Card (overview) ─────────────────────────────────────────────────────
function WorldCard({ world, completedLessons, isUnlocked, onClick }) {
  const lessons  = worldLessons(world);
  const done     = lessons.filter((l) => completedLessons.includes(l.id)).length;
  const pct      = lessons.length > 0 ? Math.round((done / lessons.length) * 100) : 0;
  const isComplete = done === lessons.length;

  return (
    <div
      onClick={() => isUnlocked && onClick(world)}
      className={`card overflow-hidden transition-all duration-200 ${
        isUnlocked
          ? 'cursor-pointer hover:-translate-y-1 hover:shadow-medium'
          : 'opacity-60 cursor-not-allowed'
      }`}
    >
      {/* Hero banner */}
      <div className="h-28 relative flex items-center justify-center overflow-hidden"
        style={{ background: isUnlocked ? `linear-gradient(135deg, ${world.color}, ${world.color}99)` : '#D1D5DB' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <span className="text-5xl relative z-10" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}>
          {isUnlocked ? world.icon : '🔒'}
        </span>
        {isComplete && (
          <div className="absolute top-3 right-3 bg-white/90 text-green-600 text-[10px] font-black px-2 py-0.5 rounded-full">
            ✓ Complete
          </div>
        )}
        {!isUnlocked && (
          <div className="absolute top-3 right-3 bg-white/90 text-gray-600 text-[10px] font-black px-2 py-0.5 rounded-full">
            LOCKED
          </div>
        )}
      </div>

      <div className="p-5">
        <h2 className="font-black text-base mb-1">{world.title}</h2>
        <p className="text-xs text-gray-500 font-semibold leading-relaxed mb-4">{world.desc}</p>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-[10px] font-black mb-1.5">
            <span className="text-gray-500">Progress</span>
            <span style={{ color: world.color }}>{done}/{lessons.length} lessons</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-[width] duration-700"
              style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${world.color}, ${world.color}99)` }} />
          </div>
          <div className="text-right text-[10px] text-gray-400 font-bold mt-1">{pct}%</div>
        </div>

        {/* Section count */}
        <div className="flex gap-2 flex-wrap mb-4">
          {world.sections.map((sec) => {
            const secDone = sec.lessons.filter((l) => completedLessons.includes(l.id)).length;
            return (
              <span key={sec.id} className="tag text-[9px]"
                style={{
                  background: secDone === sec.lessons.length ? '#EDFBF3' : '#F3F4F6',
                  color: secDone === sec.lessons.length ? '#2DA05A' : '#9CA3AF',
                }}>
                {secDone === sec.lessons.length ? '✓ ' : ''}{sec.title}
              </span>
            );
          })}
        </div>

        <button disabled={!isUnlocked}
          className="w-full py-2.5 rounded-xl text-xs font-black transition-all text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          style={isUnlocked ? { background: `linear-gradient(135deg, ${world.color}, ${world.color}cc)` } : {}}>
          {!isUnlocked ? '🔒 Complete Previous World'
            : done === 0 ? '🚀 Begin World'
            : isComplete ? '↩ Review World'
            : `▶ Continue — ${lessons.length - done} left`}
        </button>
      </div>
    </div>
  );
}

// ── Section Node Map ──────────────────────────────────────────────────────────
function SectionNodeMap({ world, section, completedLessons, isWorldUnlocked, onStart }) {
  return (
    <div className="space-y-3">
      {section.lessons.map((lesson, i) => {
        const isDone   = completedLessons.includes(lesson.id);
        const prevDone = i === 0 || completedLessons.includes(section.lessons[i - 1].id);
        const isLocked = !isWorldUnlocked || (!isDone && !prevDone);

        return (
          <div key={lesson.id} className="flex items-center gap-4">
            {/* Node connector line */}
            <div className="flex flex-col items-center flex-shrink-0" style={{ width: 32 }}>
              {i > 0 && (
                <div className="w-0.5 h-4 -mt-3 mb-1"
                  style={{ background: completedLessons.includes(section.lessons[i - 1].id) ? world.color : '#E5E7EB' }} />
              )}
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 font-black transition-all"
                style={{
                  background: isDone ? world.color : isLocked ? '#F3F4F6' : 'white',
                  borderColor: isDone ? world.color : isLocked ? '#E5E7EB' : world.color,
                  color: isDone ? 'white' : isLocked ? '#9CA3AF' : world.color,
                }}>
                {isDone ? '✓' : isLocked ? '🔒' : i + 1}
              </div>
            </div>

            {/* Lesson card */}
            <div className="flex-1">
              <MissionCard
                lesson={lesson}
                world={world}
                isCompleted={isDone}
                isLocked={isLocked}
                onStart={onStart}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Smart Recommendations ─────────────────────────────────────────────────────
function SmartRecommendations({ skills, completedLessons, onStart }) {
  const merged = { ...DEFAULT_SKILLS, ...(skills ?? {}) };

  const weakest = [...SKILLS]
    .sort((a, b) => (merged[a.id] ?? 0) - (merged[b.id] ?? 0))
    .slice(0, 3);

  const recommendations = weakest
    .map((skill) => {
      const lesson = ALL_LESSONS.find(
        (l) => l.skills?.[skill.id] > 0 && !completedLessons.includes(l.id)
      );
      if (!lesson) return null;
      const world = WORLDS.find((w) => w.id === lesson.worldId);
      return { skill, lesson, world };
    })
    .filter(Boolean);

  if (recommendations.length === 0) return null;

  return (
    <div className="card p-5 mb-6" style={{ background: 'linear-gradient(135deg,#EBF2FF,#F3EFFE)' }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">💡</span>
        <div>
          <h3 className="font-black text-sm">Recommended for You</h3>
          <p className="text-[11px] text-gray-500 font-semibold">Based on your weakest skills</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {recommendations.map(({ skill, lesson, world }) => (
          <button key={lesson.id}
            onClick={() => world && onStart(lesson, world)}
            className="text-left bg-white/70 dark:bg-gray-900/70 rounded-xl p-3 hover:bg-white dark:hover:bg-gray-900 transition-all hover:-translate-y-0.5 hover:shadow-soft">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{skill.icon}</span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                style={{ background: `${skill.color}22`, color: skill.color }}>
                {merged[skill.id] ?? 0}/100
              </span>
            </div>
            <p className="font-black text-[11px] leading-snug mb-1">{lesson.title}</p>
            <p className="text-[10px] text-gray-500 font-semibold">{skill.label} · +{lesson.xp} XP</p>
            <p className="text-[10px] font-black mt-2" style={{ color: skill.color }}>🚀 Start Mission →</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LessonsPage() {
  const { user, loading }         = useAuth();
  const { state, completeLesson } = useApp();
  const { completedLessons, skills } = state;

  const [activeLesson,  setActiveLesson]  = useState(null);
  const [activeWorld,   setActiveWorld]   = useState(null);
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [selectedSect,  setSelectedSect]  = useState(null);
  const [view,          setView]          = useState('worlds'); // 'worlds' | 'world' | 'section'

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size={10} /></div>;

  // ── Active lesson ────────────────────────────────────────────────────────
  if (activeLesson && activeWorld) {
    return (
      <AppShell user={user}>
        <ActiveLesson
          lesson={activeLesson}
          world={activeWorld}
          onComplete={(l) => {
            completeLesson(l.id, l.xp, l.skills);
            setActiveLesson(null);
            setActiveWorld(null);
          }}
          onBack={() => { setActiveLesson(null); setActiveWorld(null); }}
        />
      </AppShell>
    );
  }

  const handleStart = (lesson, world) => {
    setActiveLesson(lesson);
    setActiveWorld(world);
  };

  // ── Section view ─────────────────────────────────────────────────────────
  if (selectedWorld && selectedSect) {
    const wi = WORLDS.indexOf(selectedWorld);
    const isUnlocked = wi === 0 ||
      WORLDS[wi - 1].sections.every((s) => s.lessons.every((l) => completedLessons.includes(l.id)));
    const secDone = selectedSect.lessons.filter((l) => completedLessons.includes(l.id)).length;

    return (
      <AppShell user={user}>
        <div className="page">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[13px] font-bold text-gray-400 mb-5">
            <button onClick={() => setSelectedSect(null)} className="hover:text-gray-600 transition-colors">
              ← {selectedWorld.title}
            </button>
            <span>/</span>
            <span className="text-gray-700 dark:text-gray-300">{selectedSect.title}</span>
          </div>

          {/* Section header */}
          <div className="card p-5 mb-6 flex items-center gap-4"
            style={{ background: `linear-gradient(135deg, ${selectedWorld.color}12, ${selectedWorld.color}06)`,
                     border: `1.5px solid ${selectedWorld.color}33` }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: selectedWorld.color }}>
              {selectedWorld.icon}
            </div>
            <div className="flex-1">
              <h2 className="font-black text-xl">{selectedSect.title}</h2>
              <p className="text-xs text-gray-500 font-semibold">
                {selectedSect.lessons.length} missions · {secDone} completed
              </p>
            </div>
            <div className="text-right">
              <div className="font-black text-2xl" style={{ color: selectedWorld.color }}>
                {Math.round((secDone / selectedSect.lessons.length) * 100)}%
              </div>
              <div className="text-[10px] text-gray-400 font-bold">complete</div>
            </div>
          </div>

          {/* Node map */}
          <SectionNodeMap
            world={selectedWorld}
            section={selectedSect}
            completedLessons={completedLessons}
            isWorldUnlocked={isUnlocked}
            onStart={handleStart}
          />
        </div>
      </AppShell>
    );
  }

  // ── World view (sections) ─────────────────────────────────────────────────
  if (selectedWorld) {
    const wi = WORLDS.indexOf(selectedWorld);
    const isUnlocked = wi === 0 ||
      WORLDS[wi - 1].sections.every((s) => s.lessons.every((l) => completedLessons.includes(l.id)));
    const allW = worldLessons(selectedWorld);
    const doneW = allW.filter((l) => completedLessons.includes(l.id)).length;

    return (
      <AppShell user={user}>
        <div className="page">
          {/* Breadcrumb */}
          <button onClick={() => setSelectedWorld(null)}
            className="flex items-center gap-2 text-gray-400 font-bold text-[13px] mb-5 hover:text-gray-600 transition-colors">
            ← All Worlds
          </button>

          {/* World hero */}
          <div className="rounded-2xl p-6 mb-6 text-white relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${selectedWorld.color}, ${selectedWorld.color}99)` }}>
            <div className="absolute right-6 inset-y-0 flex items-center text-[80px] opacity-15 pointer-events-none">
              {selectedWorld.icon}
            </div>
            <div className="relative">
              <p className="text-[10px] font-black opacity-70 uppercase tracking-widest mb-1">World</p>
              <h1 className="font-black text-2xl mb-2">{selectedWorld.title}</h1>
              <p className="text-sm opacity-85 font-semibold mb-4">{selectedWorld.desc}</p>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-white/25 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-[width] duration-700"
                    style={{ width: `${allW.length > 0 ? (doneW / allW.length) * 100 : 0}%` }} />
                </div>
                <span className="text-sm font-black opacity-90">{doneW}/{allW.length}</span>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-3">
            {selectedWorld.sections.map((section) => {
              const secDone = section.lessons.filter((l) => completedLessons.includes(l.id)).length;
              const secPct  = Math.round((secDone / section.lessons.length) * 100);
              const isComplete = secDone === section.lessons.length;

              return (
                <div key={section.id}
                  onClick={() => isUnlocked && setSelectedSect(section)}
                  className={`card overflow-hidden transition-all ${
                    isUnlocked ? 'hover:shadow-medium cursor-pointer' : 'opacity-55 cursor-not-allowed'
                  }`}>
                  <div className="flex items-center gap-5 p-5">
                    {/* Section progress ring visual */}
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 relative"
                      style={{ background: isComplete ? selectedWorld.color : `${selectedWorld.color}18` }}>
                      <span style={{ filter: isComplete ? 'none' : 'grayscale(0.4)' }}>
                        {isComplete ? '✅' : '📖'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-black text-base">{section.title}</h3>
                        {isComplete && (
                          <span className="tag bg-green-100 dark:bg-green-950/30 text-green-700 text-[10px]">
                            ✓ Complete
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 font-semibold mb-2">
                        {section.lessons.length} missions · {secDone} done
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-[width] duration-700"
                            style={{ width: `${secPct}%`, background: selectedWorld.color }} />
                        </div>
                        <span className="text-[10px] font-black text-gray-400">{secPct}%</span>
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

  // ── World overview ────────────────────────────────────────────────────────
  const totalDone  = completedLessons.length;
  const totalAll   = ALL_LESSONS.length;
  const overallPct = Math.round((totalDone / totalAll) * 100);

  return (
    <AppShell user={user}>
      <div className="page">

        {/* Page header */}
        <div className="flex items-end justify-between mb-2">
          <div>
            <h1 className="font-black text-2xl tracking-tight mb-1">📖 Learning Worlds</h1>
            <p className="text-gray-500 text-[13px] font-semibold">
              {totalDone} of {totalAll} missions complete
            </p>
          </div>
          {/* Overall progress pill */}
          <div className="flex items-center gap-3 bg-primary-light dark:bg-blue-950/20 px-4 py-2 rounded-2xl">
            <div className="text-right">
              <p className="font-black text-xl text-primary">{overallPct}%</p>
              <p className="text-[10px] text-gray-400 font-bold">Overall</p>
            </div>
            <div className="w-14 h-14">
              <svg viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#EBF2FF" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#5B9CF6" strokeWidth="3"
                  strokeDasharray={`${overallPct} ${100 - overallPct}`}
                  strokeDashoffset="25" strokeLinecap="round"
                  style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }} />
                <text x="18" y="21" textAnchor="middle" fontSize="8" fontWeight="900" fill="#5B9CF6">
                  {overallPct}%
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* Smart recommendations */}
        <div className="mt-6 mb-2">
          <SmartRecommendations
            skills={skills}
            completedLessons={completedLessons}
            onStart={handleStart}
          />
        </div>

        {/* World cards grid */}
        <div className="grid grid-cols-2 gap-5">
          {WORLDS.map((world, wi) => {
            const isUnlocked = wi === 0 ||
              WORLDS[wi - 1].sections.every((s) => s.lessons.every((l) => completedLessons.includes(l.id)));
            return (
              <WorldCard
                key={world.id}
                world={world}
                completedLessons={completedLessons}
                isUnlocked={isUnlocked}
                onClick={() => setSelectedWorld(world)}
              />
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
