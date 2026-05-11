'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../../components/layout/AppShell';
import Mascot   from '../../components/ui/Mascot';
import Spinner  from '../../components/ui/Spinner';
import { useApp }  from '../../lib/store';
import { useAuth } from '../../hooks/useAuth';
import { RANKS, ALL_LESSONS, SKILLS, DEFAULT_SKILLS } from '../../lib/curriculum';
import { getRank, fmtXP, xpProgress } from '../../lib/utils';

const WII_BLUE   = '#009AC7';
const WII_SHADOW = '0 4px 16px rgba(0,120,180,0.12), 0 1px 4px rgba(0,0,0,0.06)';
const WII_GLOW   = '0 0 0 3px #009AC7, 0 0 20px rgba(0,154,199,0.5)';

function useTiles(state, rank) {
  const { completedLessons, xp, level, skills } = state;
  const merged    = { ...DEFAULT_SKILLS, ...(skills ?? {}) };
  const weakSkill = [...SKILLS].sort((a, b) => (merged[a.id] ?? 0) - (merged[b.id] ?? 0))[0];
  return [
    { id:'lessons',     icon:'📖', label:'Lessons',      color:'#5B9CF6', href:'/lessons',     desc:`${completedLessons.length}/${ALL_LESSONS.length} done` },
    { id:'editor',      icon:'✏️',  label:'Editor',       color:'#FF8FAB', href:'/editor',      desc:'Animate freely' },
    { id:'coach',       icon:'🤖', label:'AI Coach',     color:'#9B7FEA', href:'/coach',       badge:'SOON', desc:'Coming soon' },
    { id:'progress',    icon:'🗺️', label:'Progress',     color:'#52C97C', href:'https://google.com', external:true, desc:'Easter egg 🥚' },
    { id:'videos',      icon:'▶️',  label:'Videos',       color:'#FF5757', href:'/videos',      desc:'Tutorials' },
    { id:'leaderboard', icon:'🏆', label:'Leaderboard',  color:'#FFB347', href:'/leaderboard', desc:`Rank: ${rank?.name}` },
    { id:'skills',      icon:'📊', label:'Skills',       color:'#9B7FEA', href:'/skills',      desc:`${weakSkill?.label?.split(' ')[0]} needs work` },
    { id:'community',   icon:'👥', label:'Community',    color:'#5B9CF6', href:'/community',   badge:'NEW', desc:'Share & connect' },
    { id:'shop',        icon:'🛍️', label:'Shop',         color:'#FFB347', href:'/shop',        badge:'SOON', desc:'Coming soon' },
    { id:'creators',    icon:'🎬', label:'Creators',     color:'#9B7FEA', href:'/creator-hub', desc:'Learn from pros' },
    { id:'quests',      icon:'🎯', label:'Daily Quests', color:'#52C97C', href:'/quests',      desc:'Earn XP today' },
    { id:'profile',     icon:'👤', label:'Profile',      color:'#4ECDC4', href:'/profile',     desc:`Level ${level}` },
    { id:'settings',    icon:'⚙️', label:'Settings',     color:'#9CA3AF', href:'/settings',    desc:'Preferences' },
    { id:'e1', icon:null, label:'', color:null, href:null, desc:'' },
    { id:'e2', icon:null, label:'', color:null, href:null, desc:'' },
  ];
}

function WiiTile({ tile, isSelected, onClick }) {
  const [hov, setHov] = useState(false);
  if (!tile.icon) return (
    <div style={{ aspectRatio:'1', borderRadius:24, border:'2px dashed rgba(0,154,199,0.12)', background:'rgba(255,255,255,0.2)' }}/>
  );
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="relative flex flex-col items-center justify-center select-none outline-none transition-all duration-200"
      style={{
        aspectRatio:'1',
        borderRadius:24,
        background: isSelected
          ? 'linear-gradient(145deg,rgba(255,255,255,0.99),rgba(230,248,255,0.96))'
          : hov ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.85)',
        border: `${isSelected?2.5:1.5}px solid ${isSelected?WII_BLUE:'rgba(0,154,199,0.2)'}`,
        boxShadow: isSelected ? WII_GLOW : hov ? '0 8px 28px rgba(0,120,180,0.2)' : WII_SHADOW,
        transform: hov ? 'scale(1.06) translateY(-3px)' : isSelected ? 'scale(1.04)' : 'scale(1)',
        backdropFilter:'blur(12px)',
        cursor:'pointer',
      }}>
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ borderRadius:22, border:`2px dashed ${WII_BLUE}`, opacity:0.5, animation:'wii-dash 1.6s linear infinite' }}/>
      )}
      {tile.badge && (
        <div className="absolute top-2.5 right-2.5 text-[9px] font-black text-white px-1.5 py-0.5 rounded-full z-10"
          style={{ background:tile.badge==='SOON'?'#9CA3AF':tile.badge==='NEW'?'#52C97C':'#9B7FEA' }}>
          {tile.badge}
        </div>
      )}
      <div className="text-4xl mb-2" style={{ filter:'drop-shadow(0 2px 6px rgba(0,0,0,0.15))' }}>{tile.icon}</div>
      <span className="text-[12px] font-black text-center px-2 leading-tight" style={{ color:isSelected?WII_BLUE:'#3A5A6A' }}>{tile.label}</span>
      <span className="text-[10px] font-semibold mt-1 text-center px-2" style={{ color:isSelected?WII_BLUE:'#9AB5C0' }}>{tile.desc}</span>
      {tile.color && <div className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full" style={{ background:tile.color, opacity:isSelected||hov?1:0.35 }}/>}
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

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { state } = useApp();
  const { xp, level } = state;
  const router    = useRouter();
  const audioRef  = useRef(null);

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [musicVol,    setMusicVol]    = useState(0.4);
  const [musicMuted,  setMusicMuted]  = useState(false);

  const rank  = getRank(xp, RANKS);
  const tiles = useTiles(state, rank);
  const name  = user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? 'Animator';
  const { pct } = xpProgress(xp);
  const activeTiles = tiles.filter(t => t.icon);

  // Background music — dashboard only
  useEffect(() => {
    const audio = new Audio('/audio/main-menu.mp3');
    audio.loop   = true;
    const savedVol    = parseFloat(localStorage.getItem('animotion_music_vol') ?? '0.4');
    const savedMuted  = JSON.parse(localStorage.getItem('animotion_music_muted') ?? 'false');
    audio.volume = savedMuted ? 0 : savedVol;
    setMusicVol(savedVol); setMusicMuted(savedMuted);
    audio.play().catch(() => {});
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ''; };
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = musicMuted ? 0 : musicVol;
  }, [musicVol, musicMuted]);

  const navigateTo = useCallback((tile) => {
    if (!tile?.href) return;
    if (tile.external) { window.open(tile.href, '_blank'); return; }
    router.push(tile.href);
  }, [router]);

  useEffect(() => {
    const COLS = 5;
    function handleKey(e) {
      setSelectedIdx(prev => {
        if (e.key==='ArrowRight') return Math.min(prev+1, activeTiles.length-1);
        if (e.key==='ArrowLeft')  return Math.max(prev-1, 0);
        if (e.key==='ArrowDown')  return Math.min(prev+COLS, activeTiles.length-1);
        if (e.key==='ArrowUp')    return Math.max(prev-COLS, 0);
        return prev;
      });
      if (e.key==='Enter') navigateTo(activeTiles[selectedIdx]);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeTiles, selectedIdx, navigateTo]);

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background:'#EAF6FB' }}><Spinner size={10}/></div>;

  return (
    <AppShell user={user}>
      {/* Full-width dashboard — uses all available space */}
      <div style={{ maxWidth:'100%' }}>

        {/* Music controls */}
        <div className="flex justify-end mb-4 gap-2 items-center">
          <span className="text-[10px] font-black" style={{ color:'#9AB5C0' }}>🎵 Music</span>
          <button onClick={() => { const v=!musicMuted; setMusicMuted(v); localStorage.setItem('animotion_music_muted',JSON.stringify(v)); }}
            className="wii-btn wii-btn-ghost text-xs px-2 py-1 h-7">{musicMuted?'🔇':'🔊'}</button>
          <input type="range" min={0} max={1} step={0.05} value={musicMuted?0:musicVol}
            onChange={e => { const v=+e.target.value; setMusicVol(v); setMusicMuted(false); localStorage.setItem('animotion_music_vol',String(v)); }}
            className="w-20 accent-[#009AC7]"/>
        </div>

        {/* Wii U Panel — full width, scaled up */}
        <div className="rounded-[32px] overflow-hidden"
          style={{ background:'linear-gradient(180deg,rgba(255,255,255,0.78) 0%,rgba(225,248,255,0.88) 100%)', border:'1.5px solid rgba(0,154,199,0.2)', boxShadow:'0 12px 60px rgba(0,120,180,0.16)', backdropFilter:'blur(24px)' }}>

          {/* Top banner */}
          <div className="flex items-center gap-5 px-7 py-4" style={{ borderBottom:'1px solid rgba(0,154,199,0.12)' }}>
            <div style={{ animation:'wii-float 3.5s ease-in-out infinite' }}><Mascot size={52} mood="happy" animate /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-black text-base" style={{ color:'#2D3748' }}>{name}</span>
                <span className="text-[11px] font-black px-2.5 py-1 rounded-full text-white" style={{ background:rank?.color??WII_BLUE }}>{rank?.icon} {rank?.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background:'rgba(0,154,199,0.12)' }}>
                  <div className="h-full rounded-full transition-[width] duration-700" style={{ width:`${pct}%`, background:`linear-gradient(90deg,${WII_BLUE},#52C97C)` }}/>
                </div>
                <span className="text-[11px] font-black" style={{ color:WII_BLUE }}>Lv.{level}</span>
              </div>
              <p className="text-[10px] font-semibold mt-0.5" style={{ color:'#9AB5C0' }}>{Math.round(pct)}% to next level</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <div className="text-center px-4 py-2 rounded-2xl" style={{ background:'rgba(255,179,71,0.12)', border:'1px solid rgba(255,179,71,0.3)' }}>
                <div className="font-black text-base" style={{ color:'#D4831A' }}>⭐ {fmtXP(xp)}</div>
                <div className="text-[10px] font-bold" style={{ color:'#D4831A',opacity:.7 }}>Total XP</div>
              </div>
              <div className="text-center px-4 py-2 rounded-2xl" style={{ background:'rgba(0,154,199,0.08)', border:'1px solid rgba(0,154,199,0.18)' }}>
                <div className="font-black text-base" style={{ color:WII_BLUE }}>📖 {state.completedLessons?.length??0}</div>
                <div className="text-[10px] font-bold" style={{ color:WII_BLUE,opacity:.7 }}>Missions</div>
              </div>
            </div>
          </div>

          {/* Pagination dots */}
          <div className="flex items-center justify-center gap-2 py-2.5">
            <div style={{ width:16, height:9, borderRadius:999, background:WII_BLUE }}/>
            {[1,2,3,4,5].map(i=><div key={i} style={{ width:9, height:9, borderRadius:999, background:'rgba(0,154,199,0.25)' }}/>)}
          </div>

          {/* Tile grid — full width, bigger tiles */}
          <div className="flex items-center gap-3 px-6 pb-4">
            <div className="w-8 flex-shrink-0 opacity-20 flex items-center justify-center">
              <svg width="20" height="38" viewBox="0 0 20 38"><path d="M16 4 L5 19 L16 34" stroke={WII_BLUE} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            </div>
            <div className="flex-1 grid gap-4" style={{ gridTemplateColumns:'repeat(5,1fr)' }}>
              {tiles.map(tile => {
                const ai = activeTiles.indexOf(tile);
                return (
                  <WiiTile key={tile.id} tile={tile} isSelected={ai===selectedIdx&&!!tile.icon}
                    onClick={() => {
                      if (!tile.href) return;
                      setSelectedIdx(ai);
                      navigateTo(tile); // ← single click opens directly
                    }}/>
                );
              })}
            </div>
            <div className="w-8 flex-shrink-0 opacity-60 flex items-center justify-center">
              <svg width="20" height="38" viewBox="0 0 20 38"><path d="M4 4 L15 19 L4 34" stroke={WII_BLUE} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            </div>
          </div>

          {/* Wave */}
          <div className="relative h-12 overflow-hidden">
            <svg viewBox="0 0 1200 48" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
              <path d="M0,24 C200,44 400,4 600,24 C800,44 1000,4 1200,24 L1200,48 L0,48 Z" fill="rgba(0,154,199,0.07)"/>
              <path d="M0,32 C200,12 400,44 600,32 C800,20 1000,44 1200,32 L1200,48 L0,48 Z" fill="rgba(0,154,199,0.04)"/>
            </svg>
          </div>

          {/* Bottom nav */}
          <div className="flex items-center justify-center gap-4 px-8 py-4"
            style={{ background:'linear-gradient(180deg,rgba(255,255,255,0.65) 0%,rgba(235,248,255,0.88) 100%)', borderTop:'1px solid rgba(0,154,199,0.12)' }}>
            {NAV_ITEMS.map(item => {
              const active = item.href==='/dashboard';
              return (
                <button key={item.href} onClick={() => router.push(item.href)} className="flex flex-col items-center gap-1 transition-all group">
                  <div className="w-13 h-13 rounded-full flex items-center justify-center text-2xl transition-all duration-200"
                    style={{ width:48, height:48, background:active?`linear-gradient(145deg,${WII_BLUE},#007AAA)`:'rgba(255,255,255,0.85)', border:`1.5px solid ${active?WII_BLUE:'rgba(0,154,199,0.2)'}`, boxShadow:active?'0 4px 16px rgba(0,154,199,0.45)':WII_SHADOW, transform:active?'scale(1.1)':'scale(1)' }}>
                    <span style={{ filter:active?'brightness(0) invert(1)':'none' }}>{item.icon}</span>
                  </div>
                  <span className="text-[10px] font-black" style={{ color:active?WII_BLUE:'#9CA3AF' }}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        {/* ← No quests strip below — removed as requested */}
      </div>
    </AppShell>
  );
}
