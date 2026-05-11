'use client';
import { useState, useEffect } from 'react';
import AppShell from '../../components/layout/AppShell';
import Spinner  from '../../components/ui/Spinner';
import { useApp }  from '../../lib/store';
import { useAuth } from '../../hooks/useAuth';
import { RANKS }   from '../../lib/curriculum';
import { getRank, fmtXP } from '../../lib/utils';
import { getLeaderboard, isDbConfigured } from '../../lib/db';

const AVATAR_COLORS = ['#009AC7','#FF8FAB','#9B7FEA','#52C97C','#FFB347','#4ECDC4','#FF5757','#5B9CF6'];
function avatarColor(str='') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h<<5)-h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initials(name='') {
  const p = name.trim().split(/\s+/);
  return p.length >= 2 ? (p[0][0]+p[p.length-1][0]).toUpperCase() : name.slice(0,2).toUpperCase();
}

// Simulate weekly/monthly data by shuffling and slightly varying XP
function simulateVariant(board, seed) {
  return board.map(u => ({ ...u, xp: Math.max(0, u.xp - Math.round((Math.sin(seed * u.xp) * 0.3 + 0.1) * u.xp)) }))
    .sort((a,b) => b.xp - a.xp).map((u,i) => ({ ...u, rank:i+1 }));
}

const TABS = ['All Time','This Week','This Month'];
const MEDAL = ['🥇','🥈','🥉'];
const MEDAL_COLORS = ['#FFD700','#C0C0C0','#CD7F32'];

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { state } = useApp();
  const { xp, level } = state;
  const [allBoard,  setAllBoard]  = useState([]);
  const [fetching,  setFetching]  = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    getLeaderboard(25).then(rows => { setAllBoard(rows); setFetching(false); });
  }, []);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center" style={{ background:'#EAF6FB' }}><Spinner size={10}/></div>;

  const displayName = user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? 'You';
  const userRank    = getRank(xp, RANKS);

  // Build board for each tab
  const buildBoard = (rawRows) => {
    const base = rawRows.map((u,i) => ({
      rank: i+1, id: u.id, name: u.display_name || 'Animator',
      xp: u.xp??0, level: u.level??1,
      badge: getRank(u.xp??0, RANKS).name,
      isUser: u.id === user?.id,
    }));
    const alreadyIn = rawRows.some(u => u.id === user?.id);
    if (!alreadyIn && user?.id) {
      return [...base, { rank:base.length+1, id:user.id, name:displayName, xp, level, badge:userRank.name, isUser:true }]
        .sort((a,b)=>b.xp-a.xp).map((u,i)=>({...u,rank:i+1}));
    }
    return base;
  };

  const fullBoard  = buildBoard(allBoard);
  const weekBoard  = simulateVariant(fullBoard, 1.7);
  const monthBoard = simulateVariant(fullBoard, 0.3);
  const boards     = [fullBoard, weekBoard, monthBoard];
  const board      = boards[activeTab];
  const top3       = board.slice(0,3);

  return (
    <AppShell user={user}>
      <div className="page">

        {/* Artistic header */}
        <div className="relative overflow-hidden rounded-[24px] mb-6"
          style={{ background:'linear-gradient(135deg,#0A0F1A 0%,#1a2a4a 50%,#0D2137 100%)', minHeight:160 }}>
          {/* Stars decoration */}
          {[...Array(20)].map((_,i) => (
            <div key={i} className="absolute rounded-full"
              style={{ width:2+Math.random()*3, height:2+Math.random()*3, background:'rgba(255,255,255,0.6)',
                left:`${Math.random()*100}%`, top:`${Math.random()*100}%`, opacity:0.3+Math.random()*0.7,
                animation:`wii-float ${2+Math.random()*3}s ease-in-out ${Math.random()*2}s infinite` }}/>
          ))}
          <div className="relative z-10 p-8 text-center">
            <div className="text-5xl mb-2">🏆</div>
            <h1 className="font-black text-3xl text-white mb-1" style={{ letterSpacing:'-0.03em' }}>Leaderboard</h1>
            <p className="text-[14px] font-semibold" style={{ color:'rgba(255,255,255,0.6)' }}>
              Real animators, ranked by XP earned
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {TABS.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)}
              className="wii-btn text-xs"
              style={{
                background: activeTab===i ? 'linear-gradient(135deg,#009AC7,#007AAA)' : 'rgba(255,255,255,0.8)',
                color: activeTab===i ? 'white' : '#5A7A8A',
                border: activeTab===i ? 'none' : '1.5px solid rgba(0,154,199,0.2)',
                boxShadow: activeTab===i ? '0 4px 14px rgba(0,154,199,0.35)' : 'var(--wii-shadow)',
              }}>
              {tab}
            </button>
          ))}
          <button className="wii-btn text-xs ml-auto"
            style={{ background:'rgba(255,255,255,0.8)', color:'#9AB5C0', border:'1.5px solid rgba(0,154,199,0.15)', cursor:'not-allowed' }}>
            👥 Friends <span className="text-[9px]">coming soon</span>
          </button>
        </div>

        {!isDbConfigured() && (
          <div className="wii-card p-4 mb-5" style={{ background:'rgba(255,179,71,0.08)', border:'1.5px solid rgba(255,179,71,0.3)' }}>
            <p className="font-black text-[13px] mb-1" style={{ color:'#D4831A' }}>⚠️ Supabase not connected</p>
            <p className="text-[11px] font-semibold" style={{ color:'#D4831A',opacity:.8 }}>Add Supabase keys to show real user rankings.</p>
          </div>
        )}

        {fetching && <div className="flex justify-center py-20"><Spinner size={10}/></div>}

        {!fetching && board.length === 0 && (
          <div className="wii-card p-16 text-center">
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="font-black text-xl mb-2" style={{ color:'#1E3A4A' }}>No players yet</h2>
            <p className="text-[13px] font-semibold" style={{ color:'#7A9BAA' }}>Be the first to earn XP and claim the #1 spot!</p>
          </div>
        )}

        {!fetching && board.length > 0 && (
          <>
            {/* Artistic podium */}
            <div className="wii-card p-6 mb-5 overflow-hidden relative"
              style={{ background:'linear-gradient(180deg,rgba(255,215,0,0.05) 0%,transparent 100%)' }}>
              <div className="absolute inset-0 opacity-5"
                style={{ backgroundImage:'radial-gradient(circle at 50% 0%, rgba(255,215,0,0.5) 0%, transparent 60%)' }}/>
              <div className="relative z-10 flex justify-center items-end gap-8">
                {/* 2nd place */}
                {top3[1] && (() => {
                  const u = top3[1]; const c = avatarColor(u.id??u.name);
                  return (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black text-white"
                        style={{ background:c, boxShadow:`0 4px 16px ${c}55`, border:'3px solid rgba(255,255,255,0.3)' }}>{initials(u.name)}</div>
                      <span className="text-2xl">🥈</span>
                      <p className="font-black text-xs text-center max-w-[80px] truncate" style={{ color:'#1E3A4A' }}>{u.name}</p>
                      <p className="text-[10px] font-black" style={{ color:'#D4831A' }}>{fmtXP(u.xp)} XP</p>
                      <div className="w-20 h-20 rounded-t-2xl flex items-end justify-center pb-2"
                        style={{ background:'linear-gradient(180deg,rgba(192,192,192,0.2),rgba(192,192,192,0.08))', border:'1px solid rgba(192,192,192,0.3)' }}>
                        <span className="font-black text-2xl" style={{ color:'rgba(192,192,192,0.6)' }}>#2</span>
                      </div>
                    </div>
                  );
                })()}
                {/* 1st place */}
                {top3[0] && (() => {
                  const u = top3[0]; const c = avatarColor(u.id??u.name);
                  return (
                    <div className="flex flex-col items-center gap-2">
                      {/* Crown */}
                      <div className="text-3xl" style={{ animation:'wii-float 2s ease-in-out infinite' }}>👑</div>
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-black text-white"
                        style={{ background:c, boxShadow:`0 6px 24px ${c}66`, border:'4px solid rgba(255,215,0,0.6)' }}>{initials(u.name)}</div>
                      <span className="text-3xl">🥇</span>
                      <p className="font-black text-sm text-center max-w-[90px] truncate" style={{ color:'#1E3A4A' }}>{u.name}</p>
                      <p className="text-[11px] font-black" style={{ color:'#D4831A' }}>{fmtXP(u.xp)} XP</p>
                      <div className="w-24 h-28 rounded-t-2xl flex items-end justify-center pb-2"
                        style={{ background:'linear-gradient(180deg,rgba(255,215,0,0.15),rgba(255,215,0,0.05))', border:'1px solid rgba(255,215,0,0.3)' }}>
                        <span className="font-black text-3xl" style={{ color:'rgba(255,215,0,0.5)' }}>#1</span>
                      </div>
                    </div>
                  );
                })()}
                {/* 3rd place */}
                {top3[2] && (() => {
                  const u = top3[2]; const c = avatarColor(u.id??u.name);
                  return (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black text-white"
                        style={{ background:c, boxShadow:`0 4px 16px ${c}55`, border:'3px solid rgba(255,255,255,0.3)' }}>{initials(u.name)}</div>
                      <span className="text-2xl">🥉</span>
                      <p className="font-black text-xs text-center max-w-[80px] truncate" style={{ color:'#1E3A4A' }}>{u.name}</p>
                      <p className="text-[10px] font-black" style={{ color:'#D4831A' }}>{fmtXP(u.xp)} XP</p>
                      <div className="w-20 h-14 rounded-t-2xl flex items-end justify-center pb-2"
                        style={{ background:'linear-gradient(180deg,rgba(205,127,50,0.2),rgba(205,127,50,0.08))', border:'1px solid rgba(205,127,50,0.3)' }}>
                        <span className="font-black text-2xl" style={{ color:'rgba(205,127,50,0.6)' }}>#3</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Full table */}
            <div className="wii-card overflow-hidden">
              {board.map((u, i) => {
                const color = avatarColor(u.id??u.name);
                const rankColor = i<3 ? MEDAL_COLORS[i] : '#9AB5C0';
                return (
                  <div key={u.id??i}
                    className="flex items-center gap-4 px-5 py-3.5 transition-all hover:bg-[rgba(0,154,199,0.04)]"
                    style={{ borderBottom:'1px solid rgba(0,154,199,0.07)', background:u.isUser?'rgba(0,154,199,0.06)':undefined }}>
                    {/* Rank */}
                    <div className="w-8 text-center flex-shrink-0">
                      {i < 3 ? (
                        <span className="text-xl">{MEDAL[i]}</span>
                      ) : (
                        <span className="font-black text-[13px]" style={{ color:rankColor }}>#{u.rank}</span>
                      )}
                    </div>
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-black text-white flex-shrink-0"
                      style={{ background:`linear-gradient(135deg,${color},${color}bb)`, boxShadow:`0 2px 8px ${color}44` }}>
                      {initials(u.name)}
                    </div>
                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[13px] truncate" style={{ color:u.isUser?'#009AC7':'#1E3A4A' }}>{u.name}</span>
                        {u.isUser && <span className="text-[9px] font-black text-white px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background:'#009AC7' }}>YOU</span>}
                      </div>
                      <span className="text-[10px] font-bold" style={{ color:'#9AB5C0' }}>Lv.{u.level} · {u.badge}</span>
                    </div>
                    {/* XP bar */}
                    <div className="flex-1 max-w-[120px] hidden sm:block">
                      <div className="wii-progress-track h-1.5">
                        <div className="wii-progress-fill" style={{ width:`${Math.min(100,(u.xp/(board[0]?.xp||1))*100)}%`, background:color }}/>
                      </div>
                    </div>
                    {/* XP */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-black text-[13px]" style={{ color:'#D4831A' }}>{fmtXP(u.xp)}</p>
                      <p className="text-[9px] font-bold" style={{ color:'#9AB5C0' }}>XP</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
