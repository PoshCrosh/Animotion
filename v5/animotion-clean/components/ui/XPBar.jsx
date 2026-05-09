'use client';
import { xpProgress } from '../../lib/utils';

export default function XPBar({ xp, level }) {
  const { curr, needed, pct } = xpProgress(xp);
  return (
    <div className="flex items-center gap-2">
      <span className="tag bg-primary-light text-primary-dark flex-shrink-0">Lv.{level}</span>
      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#5B9CF6,#9B7FEA)' }}
        />
      </div>
      <span className="text-[11px] text-gray-400 font-bold flex-shrink-0">{curr}/{needed}</span>
    </div>
  );
}
