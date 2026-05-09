'use client';

export default function LessonCard({ lesson, world, isCompleted, isLocked, onStart }) {
  return (
    <div
      onClick={() => !isLocked && onStart(lesson, world)}
      role={isLocked ? undefined : 'button'}
      tabIndex={isLocked ? -1 : 0}
      onKeyDown={(e) => !isLocked && e.key === 'Enter' && onStart(lesson, world)}
      className={`card p-5 transition-all duration-200 ${
        isLocked
          ? 'opacity-55 cursor-not-allowed'
          : 'hover:-translate-y-1 hover:shadow-medium cursor-pointer'
      }`}
    >
      {/* Top */}
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl">{isLocked ? '🔒' : isCompleted ? '✅' : lesson.icon}</div>
        <div className="flex gap-2 flex-wrap justify-end">
          <span
            className="tag text-white text-[10px]"
            style={{ background: isCompleted ? '#2DA05A' : '#D4831A' }}
          >
            {isCompleted ? '✓ DONE' : `+${lesson.xp} XP`}
          </span>
        </div>
      </div>

      {/* Info */}
      <h3 className="font-black text-[14px] mb-1 leading-snug">{lesson.title}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold leading-relaxed mb-3 line-clamp-2">
        {lesson.desc}
      </p>

      {/* Tags */}
      <div className="flex gap-2 flex-wrap mb-4">
        <span className="tag text-[10px]" style={{ background: `${world.color}22`, color: world.color }}>
          {lesson.diff}
        </span>
        <span className="tag bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px]">
          ⏱ {lesson.time}
        </span>
      </div>

      {/* CTA */}
      <button
        disabled={isLocked}
        className={`w-full py-2.5 rounded-xl text-xs font-black transition-all ${
          isLocked
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
            : isCompleted
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            : 'bg-primary text-white hover:bg-primary-dark shadow-soft'
        }`}
      >
        {isLocked ? '🔒 Locked' : isCompleted ? 'Review Lesson ↩' : 'Start Lesson →'}
      </button>
    </div>
  );
}
