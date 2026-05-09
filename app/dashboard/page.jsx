'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../../components/layout/AppShell';
import Mascot   from '../../components/ui/Mascot';
import Spinner  from '../../components/ui/Spinner';
import { useApp }   from '../../lib/store';
import { useAuth }  from '../../hooks/useAuth';
import { RANKS, ALL_LESSONS, WORLDS, SKILLS, DEFAULT_SKILLS } from '../../lib/curriculum';
import { getRank, fmtXP, xpProgress } from '../../lib/utils';

// ── Wii U colour palette ──────────────────────────────────────────────────────
const WII_BLUE      = '#009AC7';
const WII_LIGHT_BG  = '#E8F4F8';
const WII_TILE_BG   = 'rgba(255,255,255,0.85)';
const WII_BORDER    = 'rgba(0,154,199,0.25)';
const WII_SHADOW    = '0 4px 16px rgba(0,120,180,0.12), 0 1px 4px rgba(0,0,0,0.06)';
const WII_GLOW      = '0 0 0 3px #009AC7, 0 0 16px rgba(0,154,199,0.45)';

// ── App tile definitions ───────────────────────────────────────────────────────
function useTiles(state, rank) {
  const { completedLessons, xp, level, skills, quests } = state;
  const merged   = { ...DEFAULT_SKILLS, ...(skills ?? {}) };
  const doneQ    = quests.filter((q) => q.done).length;
  const weakSkill = [...SKILLS].sort((a, b) => (merged[a.id] ?? 0) - (merged[b.id] ?? 0))[0];

  return [
    // Row 1
    { id: 'lessons',     icon: '📖', label: 'Lessons',        color: '#5B9CF6', href: '/lessons',      badge: null,        desc: `${completedLessons.length}/${ALL_LESSONS.length} done` },
    { id: 'editor',      icon: '✏️',  label: 'Editor',         color: '#FF8FAB', href: '/editor',       badge: null,        desc: 'Animate freely' },
    { id: 'coach',       icon: '🤖', label: 'AI Coach',       color: '#9B7FEA', href: '/coach',        badge: 'AI',        desc: 'Chat with Ani' },
    { id: 'progress',    icon: '🗺️', label: 'Progress',       color: '#52C97C', href: '/progress',     badge: null,        desc: 'Your path' },
    { id: 'videos',      icon: '▶️',  label: 'Videos',         color: '#FF5757', href: '/videos',       badge: null,        desc: 'Tutorials' },
    // Row 2
    { id: 'leaderboard', icon: '🏆', label: 'Leaderboard',    color: '#FFB347', href: '/leaderboard',  badge: null,        desc: `Rank: ${rank?.name}` },
    { id: 'profile',     icon: '👤', label: 'Profile',        color: '#4ECDC4', href: '/profile',      badge: null,        desc: `Level ${level}` },
    { id: 'challenges',  icon: '⚔️', label: 'Challenges',     color: '#FF5757', href: '/challenges',   badge: 'NEW',       desc: 'Weekly battle' },
    { id: 'roadmap',     icon: '🧭', label: 'Roadmap',        color: '#5B9CF6', href: '/roadmap',      badge: 'AI',        desc: 'Your path' },
    { id: 'creators',    icon: '🎬', label: 'Creators',       color: '#9B7FEA', href: '/creator-hub',  badge: null,        desc: 'Learn from pros' },
    // Row 3
    { id: 'quests',      icon: '🎯', label: 'Daily Quests',   color: '#52C97C', href: '/dashboard#quests', badge: `${doneQ}/${quests.length}`, desc: 'Earn XP today' },
    { id: 'skills',      icon: weakSkill?.icon ?? '📊', label: 'Skills',  color: weakSkill ? SKILLS.find(s=>s.id===weakSkill.id)?.color ?? '#5B9CF6' : '#5B9CF6', href: '/profile', badge: null, desc: `Focus: ${weakSkill?.label?.split(' ')[0]}` },
    { id: 'settings',    icon: '⚙️', label: 'Settings',       color: '#9CA3AF', href: '/settings',     badge: null,        desc: 'Preferences' },
    { id: 'empty1',      icon: null, label: '',               color: null,      href: null,            badge: null,        desc: '' },
    { id: 'empty2',      icon: null, label: '',               color: null,      href: null,            badge: null,        desc: '' },
  ];
}

// ── Single Wii U tile ─────────────────────────────────────────────────────────
function WiiTile({ tile, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false);

  if (!tile.icon) {
    return (
      <div className="rounded-[22px] border-2 border-dashed"
        style={{ borderColor: 'rgba(0,154,199,0.15)', background: 'rgba(255,255,255,0.25)', aspectRatio: '1' }} />
    );
  }

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex flex-col items-center justify-center rounded-[22px] transition-all duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      style={{
        aspectRatio:   '1',
        background:    isSelected
          ? `linear-gradient(145deg, rgba(255,255,255,0.98), rgba(235,248,255,0.95))`
          : WII_TILE_BG,
        border:        isSelected
          ? `2.5px solid ${WII_BLUE}`
          : `1.5px solid ${WII_BORDER}`,
        boxShadow:     isSelected
          ? WII_GLOW
          : hovered
          ? '0 6px 24px rgba(0,120,180,0.18), 0 2px 8px rgba(0,0,0,0.08)'
          : WII_SHADOW,
        transform:     hovered && !isSelected ? 'scale(1.06) translateY(-2px)' : isSelected ? 'scale(1.03)' : 'scale(1)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {/* Selection dashed ring animation */}
      {isSelected && (
        <div className="absolute inset-0 rounded-[20px] pointer-events-none"
          style={{
            border: `2px dashed ${WII_BLUE}`,
            opacity: 0.6,
            animation: 'wiiDash 1.2s linear infinite',
          }} />
      )}

      {/* Badge */}
      {tile.badge && (
        <div className="absolute top-2 right-2 text-[9px] font-black text-white px-1.5 py-0.5 rounded-full z-10"
          style={{ background: tile.badge === 'AI' ? '#9B7FEA' : tile.badge === 'NEW' ? '#52C97C' : '#5B9CF6', letterSpacing: '0.02em' }}>
          {tile.badge}
        </div>
      )}

      {/* Icon */}
      <div className="text-3xl mb-1.5 transition-transform duration-200"
        style={{ transform: hovered ? 'scale(1.12)' : 'scale(1)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))' }}>
        {tile.icon}
      </div>

      {/* Label */}
      <span className="text-[11px] font-black text-center leading-tight px-1"
        style={{ color: isSelected ? WII_BLUE : '#4A5568', letterSpacing: '-0.01em' }}>
        {tile.label}
      </span>

      {/* Desc */}
      {tile.desc && (
        <span className="text-[9px] font-semibold mt-0.5"
          style={{ color: isSelected ? WII_BLUE : '#9CA3AF' }}>
          {tile.desc}
        </span>
      )}

      {/* Color accent bar at bottom */}
      {tile.color && (
        <div className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full transition-opacity duration-200"
          style={{ background: tile.color, opacity: isSelected || hovered ? 1 : 0.4 }} />
      )}
    </button>
  );
}

// ── Bottom nav bar ─────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: '🏠', label: 'Home',      href: '/dashboard' },
  { icon: '👥', label: 'Community', href: '/leaderboard' },
  { icon: '🛍', label: 'Shop',      href: '/creator-hub' },
  { icon: '🌐', label: 'Explore',   href: '/progress' },
  { icon: '💬', label: 'Coach',     href: '/coach' },
  { icon: '📥', label: 'Download',  href: '/videos' },
];

function WiiNavBar({ router, activeHref }) {
  return (
    <div className="flex items-center justify-center gap-3 px-6 py-3"
      style={{
        background:   'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(240,250,255,0.9) 100%)',
        borderTop:    '1px solid rgba(0,154,199,0.15)',
        backdropFilter: 'blur(12px)',
      }}>
      {NAV_ITEMS.map((item) => {
        const active = activeHref === item.href;
        return (
          <button key={item.icon}
            onClick={() => router.push(item.href)}
            className="flex flex-col items-center gap-1 transition-all duration-150 group"
            title={item.label}>
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all duration-200"
              style={{
                background: active
                  ? `linear-gradient(145deg, ${WII_BLUE}, #007AAA)`
                  : 'rgba(255,255,255,0.8)',
                border:  `1.5px solid ${active ? WII_BLUE : 'rgba(0,154,199,0.2)'}`,
                boxShadow: active
                  ? `0 4px 12px rgba(0,154,199,0.4), 0 0 0 2px rgba(0,154,199,0.15)`
                  : WII_SHADOW,
                transform: active ? 'scale(1.08)' : 'scale(1)',
              }}>
              <span style={{ filter: active ? 'brightness(0) invert(1)' : 'none', fontSize: active ? 18 : 20 }}>
                {item.icon}
              </span>
            </div>
            <span className="text-[9px] font-black"
              style={{ color: active ? WII_BLUE : '#9CA3AF' }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── XP / Rank banner (top of panel) ───────────────────────────────────────────
function WiiTopBanner({ xp, level, rank, name }) {
  const { curr, needed, pct } = xpProgress(xp);

  return (
    <div className="flex items-center gap-4 px-5 py-3"
      style={{
        background:   'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(240,250,255,0.6) 100%)',
        borderBottom: '1px solid rgba(0,154,199,0.12)',
      }}>
      {/* Mascot */}
      <div className="flex-shrink-0">
        <Mascot size={44} mood="happy" animate />
      </div>

      {/* Name + Rank */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-black text-sm" style={{ color: '#2D3748' }}>
            {name}
          </span>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
            style={{ background: rank?.color ?? WII_BLUE }}>
            {rank?.icon} {rank?.name}
          </span>
        </div>
        {/* XP bar — Wii-style pill */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full overflow-hidden"
            style={{ background: 'rgba(0,154,199,0.12)' }}>
            <div className="h-full rounded-full transition-[width] duration-700"
              style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${WII_BLUE}, #52C97C)` }} />
          </div>
          <span className="text-[10px] font-black flex-shrink-0" style={{ color: WII_BLUE }}>
            Lv.{level}
          </span>
        </div>
        <div className="text-[9px] font-semibold mt-0.5" style={{ color: '#9CA3AF' }}>
          {fmtXP(curr)} / {fmtXP(needed)} XP to next level
        </div>
      </div>

      {/* Total XP badge */}
      <div className="flex-shrink-0 text-center px-3 py-1.5 rounded-2xl"
        style={{ background: 'rgba(255,179,71,0.12)', border: '1px solid rgba(255,179,71,0.3)' }}>
        <div className="font-black text-sm" style={{ color: '#D4831A' }}>⭐ {fmtXP(xp)}</div>
        <div className="text-[9px] font-bold" style={{ color: '#D4831A', opacity: 0.7 }}>Total XP</div>
      </div>
    </div>
  );
}

// ── Pagination dots ────────────────────────────────────────────────────────────
function WiiDots({ total, current }) {
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width:      i === current ? 14 : 8,
            height:     8,
            background: i === current ? WII_BLUE : 'rgba(0,154,199,0.25)',
          }} />
      ))}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { state, completeQuest } = useApp();
  const { xp, level, quests, skills } = state;
  const router = useRouter();

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [page,        setPage]        = useState(0);
  const containerRef  = useRef(null);
  const TILES_PER_PAGE = 15;
  const PAGES = 1; // single page for now, extendable

  const rank     = getRank(xp, RANKS);
  const tiles    = useTiles(state, rank);
  const name     = user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? 'Animator';

  // Keyboard navigation
  const handleKey = useCallback((e) => {
    const COLS = 5;
    setSelectedIdx((prev) => {
      if (e.key === 'ArrowRight') return Math.min(prev + 1, tiles.filter(t => t.icon).length - 1);
      if (e.key === 'ArrowLeft')  return Math.max(prev - 1, 0);
      if (e.key === 'ArrowDown')  return Math.min(prev + COLS, tiles.filter(t => t.icon).length - 1);
      if (e.key === 'ArrowUp')    return Math.max(prev - COLS, 0);
      return prev;
    });
    if (e.key === 'Enter') {
      const tile = tiles.filter(t => t.icon)[selectedIdx];
      if (tile?.href) router.push(tile.href);
    }
  }, [tiles, selectedIdx, router]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: WII_LIGHT_BG }}>
      <Spinner size={10} />
    </div>
  );

  const activeTiles = tiles.filter(t => t.icon);
  const selectedTile = activeTiles[selectedIdx];

  return (
    <AppShell user={user}>
      <div className="page" style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* ── Wii U GamePad Panel ───────────────────────────────────────── */}
        <div className="rounded-[28px] overflow-hidden"
          style={{
            background:   'linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(235,247,255,0.85) 100%)',
            border:       '1.5px solid rgba(0,154,199,0.18)',
            boxShadow:    '0 8px 40px rgba(0,120,180,0.14), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}>

          {/* Top banner */}
          <WiiTopBanner xp={xp} level={level} rank={rank} name={name} />

          {/* Pagination dots */}
          <WiiDots total={PAGES} current={page} />

          {/* Tile grid + side arrow */}
          <div className="flex items-center gap-2 px-4 pb-2">
            {/* Left arrow (future: prev page) */}
            <button className="w-8 flex-shrink-0 flex items-center justify-center opacity-25 cursor-default">
              <svg width="24" height="40" viewBox="0 0 24 40">
                <path d="M20 4 L6 20 L20 36" stroke={WII_BLUE} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </button>

            {/* Grid */}
            <div className="flex-1 grid gap-3" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
              {tiles.map((tile, i) => {
                const activeIdx = activeTiles.indexOf(tile);
                return (
                  <WiiTile
                    key={tile.id}
                    tile={tile}
                    isSelected={activeIdx === selectedIdx && tile.icon}
                    onClick={() => {
                      if (!tile.href) return;
                      if (activeIdx === selectedIdx) {
                        router.push(tile.href);
                      } else {
                        setSelectedIdx(activeIdx);
                      }
                    }}
                  />
                );
              })}
            </div>

            {/* Right arrow */}
            <button
              className="w-8 flex-shrink-0 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
              style={{ opacity: 0.6 }}>
              <svg width="24" height="40" viewBox="0 0 24 40">
                <path d="M4 4 L18 20 L4 36" stroke={WII_BLUE} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </button>
          </div>

          {/* Selected tile info bar */}
          <div className="mx-4 mb-3 px-4 py-2.5 rounded-2xl flex items-center gap-3"
            style={{
              background: selectedTile ? `linear-gradient(135deg, ${selectedTile.color}15, ${selectedTile.color}08)` : 'transparent',
              border:     selectedTile ? `1px solid ${selectedTile.color}33` : '1px solid transparent',
              minHeight:  44,
              transition: 'all 0.2s ease',
            }}>
            {selectedTile ? (
              <>
                <span className="text-2xl">{selectedTile.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm" style={{ color: selectedTile.color }}>{selectedTile.label}</p>
                  <p className="text-xs font-semibold" style={{ color: '#9CA3AF' }}>{selectedTile.desc}</p>
                </div>
                <button
                  onClick={() => selectedTile.href && router.push(selectedTile.href)}
                  className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-black text-white transition-all hover:scale-105 active:scale-95"
                  style={{ background: `linear-gradient(135deg, ${selectedTile.color}, ${selectedTile.color}cc)`,
                           boxShadow: `0 4px 12px ${selectedTile.color}44` }}>
                  Open →
                </button>
              </>
            ) : (
              <p className="text-xs font-semibold" style={{ color: '#9CA3AF' }}>
                Select a tile to navigate
              </p>
            )}
          </div>

          {/* Wii wave decoration */}
          <div className="relative h-10 overflow-hidden">
            <svg viewBox="0 0 900 40" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
              <path d="M0,20 C150,40 300,0 450,20 C600,40 750,0 900,20 L900,40 L0,40 Z"
                fill="rgba(0,154,199,0.08)" />
              <path d="M0,28 C150,8 300,38 450,28 C600,18 750,38 900,28 L900,40 L0,40 Z"
                fill="rgba(0,154,199,0.05)" />
            </svg>
          </div>

          {/* Bottom nav */}
          <WiiNavBar router={router} activeHref="/dashboard" />
        </div>

        {/* ── Quests strip below panel ──────────────────────────────────── */}
        <div className="mt-4 rounded-[20px] overflow-hidden"
          style={{
            background:   'rgba(255,255,255,0.75)',
            border:       '1.5px solid rgba(0,154,199,0.15)',
            boxShadow:    WII_SHADOW,
            backdropFilter: 'blur(12px)',
          }}>
          <div className="px-5 py-3 border-b" style={{ borderColor: 'rgba(0,154,199,0.1)' }}>
            <h2 className="font-black text-sm" style={{ color: WII_BLUE }}>🎯 Daily Quests</h2>
          </div>
          <div className="flex gap-2 px-4 py-3 overflow-x-auto">
            {state.quests.map((q) => (
              <button
                key={q.id}
                onClick={() => !q.done && completeQuest(q.id, q.xp)}
                disabled={q.done}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-2xl transition-all hover:scale-105 active:scale-95"
                style={{
                  background: q.done
                    ? 'linear-gradient(145deg, rgba(82,201,124,0.15), rgba(82,201,124,0.08))'
                    : 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(235,248,255,0.8))',
                  border:  q.done
                    ? '1.5px solid rgba(82,201,124,0.4)'
                    : '1.5px solid rgba(0,154,199,0.2)',
                  boxShadow: q.done ? 'none' : WII_SHADOW,
                  minWidth: 72,
                }}>
                <span className="text-xl">{q.done ? '✅' : q.icon}</span>
                <span className="text-[9px] font-black text-center leading-tight" style={{ color: q.done ? '#52C97C' : '#4A5568', maxWidth: 64 }}>
                  {q.title}
                </span>
                <span className="text-[9px] font-black" style={{ color: q.done ? '#52C97C' : '#D4831A' }}>
                  +{q.xp} XP
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes wiiDash {
          0%   { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -60; }
        }
        @keyframes wiiPulse {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 1; }
        }
      `}</style>
    </AppShell>
  );
}
