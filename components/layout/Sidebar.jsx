'use client';
import Link             from 'next/link';
import { usePathname }  from 'next/navigation';
import Mascot           from '../ui/Mascot';
import { useApp }       from '../../lib/store';
import { getRank, xpProgress } from '../../lib/utils';
import { RANKS }        from '../../lib/curriculum';

const NAV = [
  { section: 'LEARN', items: [
    { href: '/dashboard',   label: 'Dashboard',  icon: '🏠' },
    { href: '/lessons',     label: 'Lessons',    icon: '📖' },
    { href: '/progress',    label: 'Progress',   icon: '🗺️' },
    { href: '/videos',      label: 'Videos',     icon: '▶️' },
    { href: '/creator-hub', label: 'Creators',   icon: '🎬', badge: 'NEW' },
  ]},
  { section: 'CREATE', items: [
    { href: '/editor',      label: 'Editor',     icon: '✏️' },
    { href: '/coach',       label: 'AI Coach',   icon: '🤖', badge: 'AI' },
    { href: '/roadmap',     label: 'Roadmap',    icon: '🧭', badge: 'AI' },
    { href: '/challenges',  label: 'Challenges', icon: '⚔️', badge: 'NEW' },
  ]},
  { section: 'ACCOUNT', items: [
    { href: '/leaderboard', label: 'Leaderboard',icon: '🏆' },
    { href: '/profile',     label: 'Profile',    icon: '👤' },
    { href: '/settings',    label: 'Settings',   icon: '⚙️' },
  ]},
];

const BADGE_BG = {
  AI:  'linear-gradient(135deg,#9B7FEA,#7C5FD4)',
  NEW: 'linear-gradient(135deg,#52C97C,#3DAD65)',
};

export default function Sidebar({ user }) {
  const pathname      = usePathname();
  const { state }     = useApp();
  const { xp, level, focusMode } = state;
  const { pct }       = xpProgress(xp);
  const rank          = getRank(xp, RANKS);
  const name = user?.user_metadata?.name ?? user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Animator';
  const initials = name[0]?.toUpperCase() ?? 'A';

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col z-50 overflow-y-auto"
      style={{
        width: 250,
        opacity: focusMode ? 0.15 : 1,
        transition: 'opacity 0.3s ease',
        background: 'linear-gradient(180deg,rgba(255,255,255,0.97) 0%,rgba(224,246,253,0.97) 100%)',
        borderRight: '1.5px solid rgba(0,154,199,0.15)',
        boxShadow: '4px 0 24px rgba(0,120,180,0.08)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4 flex-shrink-0">
        <div style={{ animation: 'wii-float 3.5s ease-in-out infinite' }}>
          <Mascot size={36} mood="happy" animate />
        </div>
        <div>
          <div className="font-black text-[17px] leading-none" style={{ color: '#009AC7', letterSpacing: '-0.02em' }}>
            Animotion
          </div>
          <div className="text-[9px] font-black uppercase tracking-[0.14em] mt-0.5" style={{ color: '#9AB5C0' }}>
            Animation Studio
          </div>
        </div>
      </div>

      {/* XP strip */}
      <div className="mx-3 mb-3 px-3 py-2.5 rounded-2xl flex-shrink-0"
        style={{ background: 'rgba(0,154,199,0.06)', border: '1px solid rgba(0,154,199,0.12)' }}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-black" style={{ color: '#009AC7' }}>Level {level}</span>
          <span className="text-[9px] font-black px-2 py-0.5 rounded-full text-white"
            style={{ background: rank?.color ?? '#009AC7' }}>
            {rank?.icon} {rank?.name}
          </span>
        </div>
        <div className="wii-progress-track">
          <div className="wii-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="text-[9px] font-semibold mt-1" style={{ color: '#9AB5C0' }}>{Math.round(pct)}% to next level</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 pb-2">
        {NAV.map((group) => (
          <div key={group.section} className="mb-2">
            <p className="wii-section-label px-2 py-1">{group.section}</p>
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-[12.5px] font-bold mb-0.5 transition-all duration-150 group relative"
                  style={{
                    background: active ? 'linear-gradient(135deg,rgba(0,154,199,0.12),rgba(0,154,199,0.05))' : 'transparent',
                    color: active ? '#009AC7' : '#5A7A8A',
                    border: active ? '1px solid rgba(0,154,199,0.18)' : '1px solid transparent',
                  }}>
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                      style={{ background: '#009AC7' }} />
                  )}
                  <span className="text-[15px] leading-none group-hover:scale-110 transition-transform duration-150">{item.icon}</span>
                  <span className="flex-1 font-black">{item.label}</span>
                  {item.badge && (
                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full text-white"
                      style={{ background: BADGE_BG[item.badge] ?? '#009AC7' }}>
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
      <div className="flex-shrink-0 p-3 m-2 rounded-2xl"
        style={{ background: 'rgba(0,154,199,0.05)', border: '1px solid rgba(0,154,199,0.12)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#009AC7,#007AAA)' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-black truncate" style={{ color: '#1E3A4A' }}>{name}</p>
            <p className="text-[9px] font-semibold" style={{ color: '#9AB5C0' }}>✨ Free forever</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
