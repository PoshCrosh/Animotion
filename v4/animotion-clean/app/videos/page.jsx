'use client';
import { useState, useMemo } from 'react';
import AppShell      from '../../components/layout/AppShell';
import YouTubeEmbed  from '../../components/ui/YouTubeEmbed';
import Spinner       from '../../components/ui/Spinner';
import { useApp }    from '../../lib/store';
import { useAuth }   from '../../hooks/useAuth';
import { WORLDS, ALL_LESSONS } from '../../lib/curriculum';

const WORLD_ORDER = ['2d-animation','3d-animation','vfx','cinematography','motion-graphics'];
const WORLD_LABEL = {
  '2d-animation':   '2D Animation',
  '3d-animation':   '3D Animation',
  'vfx':            'VFX',
  'cinematography': 'Cinematography',
  'motion-graphics':'Motion Graphics',
};
const CATS = ['All', '2D Animation', '3D Animation', 'VFX', 'Cinematography', 'Motion Graphics'];

export default function VideosPage() {
  const { user, loading } = useAuth();
  const { state, gainXP } = useApp();
  const { completedLessons } = state;

  const [cat, setCat]     = useState('All');
  const [watched, setWatched] = useState(new Set());

  // Pull all lessons that have a videoId from the curriculum
  const allVideoLessons = useMemo(() => {
    return ALL_LESSONS.filter((l) => l.videoId);
  }, []);

  const filtered = useMemo(() => {
    if (cat === 'All') return allVideoLessons;
    return allVideoLessons.filter((l) => {
      const worldLabel = WORLD_LABEL[l.worldId];
      return worldLabel === cat;
    });
  }, [allVideoLessons, cat]);

  const handleWatch = (lessonId) => {
    if (!watched.has(lessonId)) {
      setWatched((prev) => new Set([...prev, lessonId]));
      gainXP(20);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"><Spinner size={10} /></div>
  );

  const totalVideos  = allVideoLessons.length;
  const watchedCount = watched.size;

  return (
    <AppShell user={user}>
      <div className="page">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="font-black text-2xl tracking-tight mb-1">▶️ Video Library</h1>
            <p className="text-gray-500 text-[13px] font-semibold">
              {totalVideos} tutorial videos across all specialisations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 dark:bg-gray-800 rounded-xl px-3 py-2 text-center">
              <p className="font-black text-lg text-primary">{watchedCount}</p>
              <p className="text-[10px] text-gray-400 font-bold">Watched</p>
            </div>
            <div className="bg-blue-50 dark:bg-gray-800 rounded-xl px-3 py-2 text-center">
              <p className="font-black text-lg text-primary">{totalVideos - watchedCount}</p>
              <p className="text-[10px] text-gray-400 font-bold">Remaining</p>
            </div>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-7">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${
                cat === c
                  ? 'bg-primary text-white shadow-soft'
                  : 'bg-white dark:bg-gray-900 text-gray-500 border border-gray-200 dark:border-gray-700 hover:border-primary'
              }`}>
              {c}
              {c !== 'All' && (
                <span className="ml-1.5 opacity-60">
                  ({allVideoLessons.filter(l => WORLD_LABEL[l.worldId] === c).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Video grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">🎥</div>
            <p className="text-gray-400 font-bold">No videos in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {filtered.map((lesson) => {
              const isWatched   = watched.has(lesson.id);
              const isCompleted = completedLessons.includes(lesson.id);
              return (
                <div key={lesson.id}
                  className={`card overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-medium ${isWatched ? 'ring-2 ring-green-400/50' : ''}`}>
                  <div onClick={() => handleWatch(lesson.id)}>
                    <YouTubeEmbed videoId={lesson.videoId} title={lesson.title} />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="tag bg-primary-light text-primary-dark text-[10px]">
                        {WORLD_LABEL[lesson.worldId] ?? lesson.worldTitle}
                      </span>
                      {lesson.sectionTitle && (
                        <span className="tag bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px]">
                          {lesson.sectionTitle}
                        </span>
                      )}
                      {isCompleted && (
                        <span className="tag bg-green-100 dark:bg-green-950/30 text-green-700 text-[10px]">
                          ✓ Lesson Done
                        </span>
                      )}
                      {isWatched && !isCompleted && (
                        <span className="tag bg-blue-100 dark:bg-blue-950/30 text-blue-700 text-[10px]">
                          👀 Watched
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-[13px] leading-snug mb-1">{lesson.title}</h3>
                    <p className="text-xs text-gray-500 font-semibold leading-relaxed mb-3 line-clamp-2">
                      {lesson.desc}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5">
                        <span className="tag bg-amber-50 dark:bg-amber-950/30 text-amber-700 text-[10px]">
                          +{lesson.xp} XP
                        </span>
                        <span className="tag bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px]">
                          ⏱ {lesson.time}
                        </span>
                      </div>
                      {!isWatched && (
                        <button
                          onClick={() => handleWatch(lesson.id)}
                          className="text-[10px] font-black text-primary hover:underline">
                          +20 XP to watch →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
