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

const WII_BLUE  = '#009AC7';
const WII_SHADOW = '0 4px 16px rgba(0,120,180,0.12), 0 1px 4px rgba(0,0,0,0.06)';
const WII_GLOW   = '0 0 0 3px #009AC7, 0 0 16px rgba(0,154,199,0.45)';

function useTiles(state, rank) {
  const { completedLessons, xp, level, skills, quests } = state;
  const merged = { ...DEFAULT_SKILLS, ...(skills ?? {}) };
  const doneQ  = (quests ?? []).filter(q => q.done).length;
  const weakSkill = [...SKILLS].sort((a, b) => (merged[a.id] ?? 0) - (merged[b.id] ?? 0))[0];

  return [
    // Row 1 — Learning
    { id:'lessons',     icon:'📖', label:'Lessons',      color:'#5B9CF6', href:'/lessons',      badge:null,        desc:`${completedLessons.length}/${ALL_LESSONS.length} done` },
    { id:'editor',      icon:'✏️',  label:'Editor',       color:'#FF8FAB', href:'/editor',       badge:null,        desc:'Animate freely' },
    { id:'coach',       icon:'🤖', label:'AI Coach',     color:'#9B7FEA', href:'/coach',        badge:'AI',        desc:'Chat with Ani' },
    { id:'progress',    icon:'🗺️', label:'Progress',     color:'#52C97C', href:'/lessons',      badge:null,        desc:'Your path' },  // ← prank: leads to google
    { id:'videos',      icon:'▶️',  label:'Videos',       color:'#FF5757', href:'/videos',       badge:null,        desc:'Tutorials' },
    // Row 2 — Community & tools
    { id:'leaderboard', icon:'🏆', label:'Leaderboard',  color:'#FFB347', href:'/leaderboard',  badge:null,        desc:`Rank: ${rank?.name}` },
    { id:'skills',      icon:'📊', label:'Skills',       color:'#9B7FEA', href:'/skills',       badge:null,        desc:`${weakSkill?.label?.split(' ')[0]} needs work` },
    { id:'community',   icon:'👥', label:'Community',    color:'#5B9CF6', href:'/community',    badge:'NEW',       desc:'Share & connect' },
    { id:'shop',        icon:'🛍️', label:'Shop',         color:'#FFB347', href:'/shop',         badge:'SOON',      desc:'Coming soon' },
    { id:'creators',    icon:'🎬', label:'Creators',     color:'#9B7FEA', href:'/creator-hub',  badge:null,        desc:'Learn from pros' },
    // Row 3 — Account
    { id:'quests',      icon:'🎯', label:'Daily Quests', color:'#52C97C', href:'/quests',       badge:`${doneQ}/${(quests??[]).length}`, desc:'Earn XP today' },
    { id:'profile',     icon:'👤', label:'Profile',      color:'#4ECDC4', href:'/profile',      badge:null,        desc:`Level ${level}` },
    { id:'settings',    icon:'⚙️', label:'Settings',     color:'#9CA3AF', href:'/settings',     badge:null,        desc:'Preferences' },
    { id:'empty1',      icon:null, label:'',             color:null,      href:null,            badge:null,        desc:'' },
    { id:'empty2',      icon:null, label:'',             color:null,      href:null,            badge:null,        desc:'' },
  ];
}

function WiiTile({ tile, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false);
  if (!tile.icon) {
    return <div className="rounded-[22px] border-2 border-dashed" style={{ borderColor:'rgba(0,154,199,0.15)', background:'rgba(255,255,255,0.25)', aspectRatio:'1' }} />;
  }
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="relative flex flex-col items-center justify-center rounded-[22px] transition-all duration-200 select-none outline-none"
      style={{
        aspectRatio: '1',
        background:  isSelected ? 'linear-gradient(145deg,rgba(255,255,255,0.98),rgba(235,248,255,0.95))' : 'rgba(255,255,255,0.88)',
        border:      isSelected ? `2.5px solid ${WII_BLUE}` : '1.5px solid rgba(0,154,199,0.2)',
        boxShadow:   isSelected ? WII_GLOW : hovered ? '0 6px 24px rgba(0,120,180,0.18)' : WII_SHADOW,
        transform:   hovered && !isSelected ? 'scale(1.06) translateY(-2px)' : isSelected ? 'scale(1.03)' : 'scale(1)',
        backdropFilter: 'blur(8px)',
      }}>
      {isSelected && (
        <div className="absolute inset-0 rounded-[20px] pointer-events-none"
          style={{ border:`2px dashed ${WII_BLUE}`, opacity:0.6, animation:'wii-dash 1.6s linear infinite' }} />
      )}
      {tile.badge && (
        <div className="absolute top-2 right-2 text-[9px] font-black text-white px-1.5 py-0.5 rounded-full z-10"
          style={{ background: tile.badge==='AI'?'#9B7FEA':tile.badge==='SOON'?'#9CA3AF':tile.badge.includes('/')? '#52C97C':'#5B9CF6' }}>
          {tile.badge}
        </div>
      )}
      <div className="text-3xl mb-1.5" style={{ filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.12))' }}>{tile.icon}</div>
      <span className="text-[11px] font-black text-center leading-tight px-1" style={{ color:isSelected?WII_BLUE:'#4A5568' }}>{tile.label}</span>
      {tile.desc && <span className="text-[9px] font-semibold mt-0.5" style={{ color:isSelected?WII_BLUE:'#9CA3AF' }}>{tile.desc}</span>}
      {tile.color && <div className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full" style={{ background:tile.color, opacity:isSelected||hovered?1:0.4 }} />}
    </button>
  );
}

const NAV_ITEMS = [
  { icon:'🏠', label:'Home',      href:'/dashboard' },
  { icon:'👥', label:'Community', href:'/community' },
  { icon:'🛍️', label:'Shop',      href:'/shop' },
  { icon:'🌐', label:'Progress',  href:'/progress' },
  { icon:'💬', label:'Coach',     href:'/coach' },
  { icon:'🏆', label:'Rankings',  href:'/leaderboard' },
];

function WiiNavBar({ router, activeHref }) {
  return (
    <div className="flex items-center justify-center gap-3 px-6 py-3"
      style={{ background:'linear-gradient(180deg,rgba(255,255,255,0.7) 0%,rgba(240,250,255,0.9) 100%)', borderTop:'1px solid rgba(0,154,199,0.15)', backdropFilter:'blur(12px)' }}>
      {NAV_ITEMS.map(item => {
        const active = activeHref === item.href;
        return (
          <button key={item.href} onClick={() => router.push(item.href)} className="flex flex-col items-center gap-1 transition-all duration-150" title={item.label}>
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all duration-200"
              style={{
                background: active ? `linear-gradient(145deg,${WII_BLUE},#007AAA)` : 'rgba(255,255,255,0.8)',
                border: `1.5px solid ${active?WII_BLUE:'rgba(0,154,199,0.2)'}`,
                boxShadow: active ? '0 4px 12px rgba(0,154,199,0.4)' : WII_SHADOW,
                transform: active ? 'scale(1.08)' : 'scale(1)',
              }}>
              <span style={{ filter:active?'brightness(0) invert(1)':'none', fontSize:active?18:20 }}>{item.icon}</span>
            </div>
            <span className="text-[9px] font-black" style={{ color:active?WII_BLUE:'#9CA3AF' }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { state, completeQuest } = useApp();
  const { xp, level, quests } = state;
  const router = useRouter();
  const [selectedIdx, setSelectedIdx] = useState(0);

  const rank = getRank(xp, RANKS);
  const tiles = useTiles(state, rank);
  const name  = user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? 'Animator';
  const { pct } = xpProgress(xp);
  const activeTiles = tiles.filter(t => t.icon);
  const selectedTile = activeTiles[selectedIdx];

  const handleKey = useCallback((e) => {
    const COLS = 5;
    setSelectedIdx(prev => {
      if (e.key === 'ArrowRight') return Math.min(prev + 1, activeTiles.length - 1);
      if (e.key === 'ArrowLeft')  return Math.max(prev - 1, 0);
      if (e.key === 'ArrowDown')  return Math.min(prev + COLS, activeTiles.length - 1);
      if (e.key === 'ArrowUp')    return Math.max(prev - COLS, 0);
      return prev;
    });
    if (e.key === 'Enter') {
      const tile = activeTiles[selectedIdx];
      if (tile?.href) {
        // Easter egg: Progress tile goes to Google
        if (tile.id === 'progress') { window.open('https://google.com', '_blank'); return; }
        router.push(tile.href);
      }
    }
  }, [activeTiles, selectedIdx, router]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background:'#EAF6FB' }}><Spinner size={10}/></div>;

  return (
    <AppShell user={user}>
      <div className="page" style={{ maxWidth:900, margin:'0 auto' }}>
        <div className="rounded-[28px] overflow-hidden"
          style={{ background:'linear-gradient(180deg,rgba(255,255,255,0.72) 0%,rgba(235,247,255,0.85) 100%)', border:'1.5px solid rgba(0,154,199,0.18)', boxShadow:'0 8px 40px rgba(0,120,180,0.14)', backdropFilter:'blur(20px)' }}>

          {/* Top banner */}
          <div className="flex items-center gap-4 px-5 py-3" style={{ borderBottom:'1px solid rgba(0,154,199,0.12)' }}>
            <div style={{ animation:'wii-float 3.5s ease-in-out infinite' }}><Mascot size={44} mood="happy" animate /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-black text-sm" style={{ color:'#2D3748' }}>{name}</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ background:rank?.color??WII_BLUE }}>{rank?.icon} {rank?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background:'rgba(0,154,199,0.12)' }}>
                  <div className="h-full rounded-full transition-[width] duration-700" style={{ width:`${pct}%`, background:`linear-gradient(90deg,${WII_BLUE},#52C97C)` }} />
                </div>
                <span className="text-[10px] font-black" style={{ color:WII_BLUE }}>Lv.{level}</span>
              </div>
            </div>
            <div className="flex-shrink-0 text-center px-3 py-1.5 rounded-2xl" style={{ background:'rgba(255,179,71,0.12)', border:'1px solid rgba(255,179,71,0.3)' }}>
              <div className="font-black text-sm" style={{ color:'#D4831A' }}>⭐ {fmtXP(xp)}</div>
              <div className="text-[9px] font-bold" style={{ color:'#D4831A', opacity:0.7 }}>Total XP</div>
            </div>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 py-2">
            <div className="rounded-full" style={{ width:14, height:8, background:WII_BLUE }} />
            {[1,2,3,4,5].map(i => <div key={i} className="rounded-full" style={{ width:8, height:8, background:'rgba(0,154,199,0.25)' }} />)}
          </div>

          {/* Tile grid */}
          <div className="flex items-center gap-2 px-4 pb-2">
            <div className="w-8 flex-shrink-0 opacity-20"><svg width="18" height="34" viewBox="0 0 18 34" fill="none"><path d="M15 3 L4 17 L15 31" stroke={WII_BLUE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
            <div className="flex-1 grid gap-3" style={{ gridTemplateColumns:'repeat(5,1fr)' }}>
              {tiles.map((tile) => {
                const activeIdx = activeTiles.indexOf(tile);
                return (
                  <WiiTile key={tile.id} tile={tile} isSelected={activeIdx === selectedIdx && !!tile.icon}
                    onClick={() => {
                      if (!tile.href) return;
                      if (activeIdx !== selectedIdx) { setSelectedIdx(activeIdx); return; }
                      // Easter egg on progress tile
                      if (tile.id === 'progress') { window.open('https://google.com', '_blank'); return; }
                      router.push(tile.href);
                    }} />
                );
              })}
            </div>
            <button className="w-8 flex-shrink-0 flex items-center justify-center" style={{ opacity:0.6 }}>
              <svg width="18" height="34" viewBox="0 0 18 34" fill="none"><path d="M3 3 L14 17 L3 31" stroke={WII_BLUE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          {/* Info bar */}
          {selectedTile && (
            <div className="mx-4 mb-3 px-4 py-2.5 rounded-2xl flex items-center gap-3"
              style={{ background:`linear-gradient(135deg,${selectedTile.color}15,${selectedTile.color}08)`, border:`1px solid ${selectedTile.color}33`, minHeight:44, transition:'all 0.2s ease' }}>
              <span className="text-2xl">{selectedTile.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm" style={{ color:selectedTile.color }}>{selectedTile.label}</p>
                <p className="text-xs font-semibold" style={{ color:'#9CA3AF' }}>{selectedTile.desc}</p>
              </div>
              <button
                onClick={() => {
                  if (selectedTile.id === 'progress') { window.open('https://google.com', '_blank'); return; }
                  if (selectedTile.href) router.push(selectedTile.href);
                }}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-black text-white transition-all hover:scale-105"
                style={{ background:`linear-gradient(135deg,${selectedTile.color},${selectedTile.color}cc)`, boxShadow:`0 4px 12px ${selectedTile.color}44` }}>
                Open →
              </button>
            </div>
          )}

          {/* Wave */}
          <div className="relative h-10 overflow-hidden">
            <svg viewBox="0 0 900 40" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
              <path d="M0,16 C150,32 300,0 450,16 C600,32 750,0 900,16 L900,40 L0,40 Z" fill="rgba(0,154,199,0.07)"/>
            </svg>
          </div>

          <WiiNavBar router={router} activeHref="/dashboard" />
        </div>

        {/* Quests strip */}
        <div className="mt-4 rounded-[20px] overflow-hidden"
          style={{ background:'rgba(255,255,255,0.82)', border:'1.5px solid rgba(0,154,199,0.15)', boxShadow:WII_SHADOW, backdropFilter:'blur(12px)' }}>
          <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor:'rgba(0,154,199,0.1)' }}>
            <h2 className="font-black text-sm" style={{ color:WII_BLUE }}>🎯 Daily Quests</h2>
            <button onClick={() => router.push('/quests')} className="text-[11px] font-black" style={{ color:WII_BLUE }}>View all →</button>
          </div>
          <div className="flex gap-2 px-4 py-3 overflow-x-auto">
            {(state.quests ?? []).map(q => (
              <button key={q.id} onClick={() => !q.done && completeQuest(q.id, q.xp)} disabled={q.done}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-2xl transition-all hover:scale-105"
                style={{ background:q.done?'rgba(82,201,124,0.1)':'rgba(255,255,255,0.9)', border:`1.5px solid ${q.done?'rgba(82,201,124,0.35)':'rgba(0,154,199,0.2)'}`, minWidth:72 }}>
                <span className="text-xl">{q.done?'✅':q.icon}</span>
                <span className="text-[9px] font-black text-center leading-tight" style={{ color:q.done?'#52C97C':'#4A5568', maxWidth:64 }}>{q.title}</span>
                <span className="text-[9px] font-black" style={{ color:q.done?'#52C97C':'#D4831A' }}>+{q.xp} XP</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
