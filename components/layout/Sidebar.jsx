'use client';
import { useState } from 'react';
import Link             from 'next/link';
import { usePathname }  from 'next/navigation';
import Mascot           from '../ui/Mascot';
import { useApp }       from '../../lib/store';
import { getRank, xpProgress } from '../../lib/utils';
import { RANKS }        from '../../lib/curriculum';

const NAV = [
  { section:'LEARN', items:[
    { href:'/dashboard',   label:'Dashboard',   icon:'🏠' },
    { href:'/lessons',     label:'Lessons',     icon:'📖' },
    { href:'/progress',    label:'Progress',    icon:'🗺️' },
    { href:'/videos',      label:'Videos',      icon:'▶️' },
    { href:'/creator-hub', label:'Creators',    icon:'🎬' },
  ]},
  { section:'CREATE', items:[
    { href:'/editor',      label:'Editor',      icon:'✏️' },
    { href:'/coach',       label:'AI Coach',    icon:'🤖', badge:'SOON' },
    { href:'/skills',      label:'Skills',      icon:'📊' },
    { href:'/quests',      label:'Daily Quests',icon:'🎯' },
  ]},
  { section:'COMMUNITY', items:[
    { href:'/leaderboard', label:'Leaderboard', icon:'🏆' },
    { href:'/community',   label:'Community',   icon:'👥', badge:'NEW' },
    { href:'/shop',        label:'Shop',        icon:'🛍️', badge:'SOON' },
  ]},
  { section:'ACCOUNT', items:[
    { href:'/profile',     label:'Profile',     icon:'👤' },
    { href:'/settings',    label:'Settings',    icon:'⚙️' },
  ]},
];

const BADGE_BG = {
  AI:   'linear-gradient(135deg,#9B7FEA,#7C5FD4)',
  NEW:  'linear-gradient(135deg,#52C97C,#3DAD65)',
  SOON: 'linear-gradient(135deg,#9CA3AF,#6B7280)',
};

export default function Sidebar({ user }) {
  const pathname  = usePathname();
  const { state } = useApp();
  const { xp, level, focusMode } = state;
  const [collapsed, setCollapsed] = useState(false);

  const { pct } = xpProgress(xp);
  const rank     = getRank(xp, RANKS);
  const name     = user?.user_metadata?.name ?? user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Animator';
  const initials = name[0]?.toUpperCase() ?? 'A';

  const W = collapsed ? 64 : 250;

  return (
    <>
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 h-screen flex flex-col z-50 overflow-y-auto overflow-x-hidden transition-all duration-300"
        style={{
          width: W,
          opacity: focusMode ? 0.12 : 1,
          transition: 'width 0.3s ease, opacity 0.3s ease',
          background: 'linear-gradient(180deg,rgba(255,255,255,0.97) 0%,rgba(224,246,253,0.97) 100%)',
          borderRight: '1.5px solid rgba(0,154,199,0.15)',
          boxShadow: '4px 0 24px rgba(0,120,180,0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Logo row */}
        <div className="flex items-center gap-3 px-3 pt-4 pb-3 flex-shrink-0">
          <div style={{ flexShrink:0, animation:'wii-float 3.5s ease-in-out infinite' }}>
            <Mascot size={36} mood="happy" animate />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="font-black text-[16px] leading-none whitespace-nowrap" style={{ color:'#009AC7', letterSpacing:'-0.02em' }}>Animotion</div>
              <div className="text-[9px] font-black uppercase tracking-[0.12em] mt-0.5 whitespace-nowrap" style={{ color:'#9AB5C0' }}>Animation Studio</div>
            </div>
          )}
          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background:'rgba(0,154,199,0.1)', border:'1px solid rgba(0,154,199,0.2)', color:'#009AC7', fontSize:14 }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        {/* XP strip - only when expanded */}
        {!collapsed && (
          <div className="mx-3 mb-3 px-3 py-2.5 rounded-2xl flex-shrink-0"
            style={{ background:'rgba(0,154,199,0.06)', border:'1px solid rgba(0,154,199,0.12)' }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-black" style={{ color:'#009AC7' }}>Level {level}</span>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full text-white" style={{ background:rank?.color??'#009AC7' }}>
                {rank?.icon} {rank?.name}
              </span>
            </div>
            <div className="wii-progress-track">
              <div className="wii-progress-fill" style={{ width:`${pct}%` }} />
            </div>
            <div className="text-[9px] font-semibold mt-1" style={{ color:'#9AB5C0' }}>{Math.round(pct)}% to next level</div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 pb-2">
          {NAV.map(group => (
            <div key={group.section} className="mb-2">
              {!collapsed && <p className="wii-section-label px-2 py-1">{group.section}</p>}
              {group.items.map(item => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link key={item.href} href={item.href}
                    className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-2xl font-bold mb-0.5 transition-all duration-150 group relative"
                    style={{
                      background: active ? 'linear-gradient(135deg,rgba(0,154,199,0.12),rgba(0,154,199,0.05))' : 'transparent',
                      color: active ? '#009AC7' : '#5A7A8A',
                      border: active ? '1px solid rgba(0,154,199,0.18)' : '1px solid transparent',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                    }}
                    title={collapsed ? item.label : undefined}
                  >
                    {active && !collapsed && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full" style={{ background:'#009AC7' }} />
                    )}
                    <span className="text-[17px] leading-none group-hover:scale-110 transition-transform duration-150 flex-shrink-0">{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span className="flex-1 font-black text-[12.5px]">{item.label}</span>
                        {item.badge && (
                          <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full text-white" style={{ background:BADGE_BG[item.badge]??'#009AC7' }}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User footer */}
        {!collapsed ? (
          <div className="flex-shrink-0 p-3 m-2 rounded-2xl" style={{ background:'rgba(0,154,199,0.05)', border:'1px solid rgba(0,154,199,0.12)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
                style={{ background:'linear-gradient(135deg,#009AC7,#007AAA)' }}>{initials}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-black truncate" style={{ color:'#1E3A4A' }}>{name}</p>
                <p className="text-[9px] font-semibold" style={{ color:'#9AB5C0' }}>✨ Free forever</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-shrink-0 flex justify-center p-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-black text-white"
              style={{ background:'linear-gradient(135deg,#009AC7,#007AAA)' }}>{initials}</div>
          </div>
        )}
      </aside>

      {/* Spacer div that pushes main content — width matches sidebar */}
      <style>{`
        main { margin-left: ${W}px !important; transition: margin-left 0.3s ease; }
      `}</style>
    </>
  );
}
