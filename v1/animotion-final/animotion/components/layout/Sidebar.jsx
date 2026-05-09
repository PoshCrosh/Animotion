'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Mascot from '../ui/Mascot';
import XPBar from '../ui/XPBar';
import { useApp } from '../../lib/store';

const NAV = [
  { section: 'Learning', items: [
    { href: '/dashboard',   label: 'Dashboard',         icon: '🏠' },
    { href: '/lessons',     label: 'Lessons',           icon: '📖' },
    { href: '/videos',      label: 'Video Library',     icon: '▶️' },
    { href: '/progress',    label: 'Progress Map',      icon: '🗺️' },
  ]},
  { section: 'Practice', items: [
    { href: '/editor',      label: 'Animation Editor',  icon: '✏️' },
    { href: '/coach',       label: 'AI Coach',          icon: '🤖', badge: 'AI' },
  ]},
  { section: 'Personal', items: [
    { href: '/leaderboard', label: 'Leaderboard',       icon: '🏆' },
    { href: '/profile',     label: 'Profile',           icon: '👤' },
    { href: '/settings',    label: 'Settings',          icon: '⚙️' },
  ]},
];

export default function Sidebar({ user }) {
  const pathname   = usePathname();
  const { state }  = useApp();
  const { xp, level, focusMode } = state;

  const displayName = user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? 'Animator';
  const initials    = displayName[0]?.toUpperCase() ?? 'A';

  return (
    <aside
      className="fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col z-50 shadow-soft transition-opacity duration-300"
      style={{ width: 250, opacity: focusMode ? 0.18 : 1 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-3">
        <Mascot size={38} mood="happy" animate />
        <div>
          <div className="font-black text-[17px] text-primary leading-none tracking-tight">Animotion</div>
          <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Animation Studio</div>
        </div>
      </div>

      {/* XP bar */}
      <div className="px-4 pb-4"><XPBar xp={xp} level={level} /></div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-1">
        {NAV.map((group) => (
          <div key={group.section} className="mb-1">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[1.2px] px-2 py-2">
              {group.section}
            </p>
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-bold mb-0.5 transition-all duration-150 ${
                    active
                      ? 'bg-primary-light text-primary-dark'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="text-[15px] leading-none">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-black bg-pink text-white px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#5B9CF6,#9B7FEA)' }}
        >
          {initials}
        </div>
        <div className="overflow-hidden flex-1 min-w-0">
          <p className="text-[12px] font-black truncate">{displayName}</p>
          <p className="text-[10px] text-gray-400">✨ Free forever</p>
        </div>
      </div>
    </aside>
  );
}
