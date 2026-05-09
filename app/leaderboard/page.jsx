'use client';
import { useState, useEffect } from 'react';
import AppShell from '../../components/layout/AppShell';
import Spinner  from '../../components/ui/Spinner';
import { useApp }  from '../../lib/store';
import { useAuth } from '../../hooks/useAuth';
import { RANKS }   from '../../lib/curriculum';
import { getRank, fmtXP } from '../../lib/utils';
import { getLeaderboard, isDbConfigured } from '../../lib/db';

const AVATAR_COLORS = ['#009AC7','#FF8FAB','#9B7FEA','#52C97C','#FFB347','#4ECDC4','#FF5757'];
function avatarColor(str='') { let h=0; for(let i=0;i<str.length;i++) h=str.charCodeAt(i)+((h<<5)-h); return AVATAR_COLORS[Math.abs(h)%AVATAR_COLORS.length]; }
function initials(name) { if(!name) return '?'; const p=name.trim().split(/\s+/); return p.length>=2?(p[0][0]+p[p.length-1][0]).toUpperCase():name.slice(0,2).toUpperCase(); }

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { state } = useApp();
  const { xp, level } = state;
  const [board, setBoard] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    getLeaderboard(25).then(rows => { setBoard(rows); setFetching(false); });
  }, []);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center" style={{background:'#EAF6FB'}}><Spinner size={10}/></div>;

  const displayName = user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? 'You';
  const userRank = getRank(xp, RANKS);

  const boardWithUser = (() => {
    const alreadyIn = board.some(u => u.id === user?.id);
    const base = board.map((u,i) => ({ rank:i+1, id:u.id, name:u.display_name||'Animator', xp:u.xp??0, level:u.level??1, badge:getRank(u.xp??0,RANKS).name, isUser:u.id===user?.id }));
    if (!alreadyIn && user?.id) {
      const merged = [...base, {id:user.id, name:displayName, xp, level, badge:userRank.name, isUser:true}].sort((a,b)=>b.xp-a.xp).map((u,i)=>({...u,rank:i+1}));
      return merged;
    }
    return base;
  })();

  const top3 = boardWithUser.slice(0,3);
  const podiumOrder = [top3[1],top3[0],top3[2]].filter(Boolean);
  const podiumH = [88,114,68];
  const medals = ['🥈','🥇','🥉'];

  return (
    <AppShell user={user}>
      <div className="page">
        {/* Header */}
        <div className="wii-card p-5 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background:'linear-gradient(135deg,#FFB347,#D4831A)', boxShadow:'0 4px 16px rgba(255,179,71,0.4)' }}>🏆</div>
          <div>
            <h1 className="font-black text-2xl" style={{ color:'#1E3A4A' }}>Leaderboard</h1>
            <p className="text-[13px] font-semibold" style={{ color:'#7A9BAA' }}>Real animators, ranked by XP</p>
          </div>
        </div>

        {!isDbConfigured() && (
          <div className="wii-card p-4 mb-5" style={{ border:'1.5px solid rgba(255,179,71,0.4)', background:'rgba(255,179,71,0.08)' }}>
            <p className="font-black text-[13px] mb-1" style={{ color:'#D4831A' }}>⚠️ Supabase not configured</p>
            <p className="text-[11px] font-semibold" style={{ color:'#D4831A', opacity:0.8 }}>Add NEXT_PUBLIC_SUPABASE_URL and ANON_KEY to .env.local to show real rankings.</p>
          </div>
        )}

        {fetching && <div className="flex justify-center py-20"><Spinner size={10}/></div>}

        {!fetching && boardWithUser.length === 0 && (
          <div className="wii-card p-16 text-center">
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="font-black text-xl mb-2" style={{ color:'#1E3A4A' }}>No players yet</h2>
            <p className="text-[13px] font-semibold" style={{ color:'#7A9BAA' }}>Be the first to earn XP and claim the top spot!</p>
          </div>
        )}

        {!fetching && boardWithUser.length > 0 && (
          <>
            {/* Podium */}
            {top3.length > 0 && (
              <div className="wii-card p-6 mb-5 flex justify-center items-end gap-6">
                {podiumOrder.map((u,i) => {
                  const color = avatarColor(u.id??u.name);
                  return (
                    <div key={u.id??i} className="flex flex-col items-center gap-2">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-black text-white border-4 border-white"
                        style={{ background:color, boxShadow:`0 4px 18px ${color}55` }}>
                        {initials(u.name)}
                      </div>
                      <p className="font-black text-xs max-w-[80px] truncate text-center" style={{ color:'#1E3A4A' }}>{u.name}</p>
                      <p className="text-[10px] font-black" style={{ color:'#D4831A' }}>{fmtXP(u.xp)} XP</p>
                      <div className="w-20 flex items-start justify-center pt-3 rounded-t-2xl"
                        style={{ height:podiumH[i], background:i===1?'rgba(0,154,199,0.15)':'rgba(0,154,199,0.07)', fontSize:i===1?28:22 }}>
                        {medals[i]}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Table */}
            <div className="wii-card overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ borderBottom:'1.5px solid rgba(0,154,199,0.12)', background:'rgba(0,154,199,0.05)' }}>
                    {['Rank','Animator','Level','XP','Badge'].map(h => (
                      <th key={h} className="text-left px-4 py-3 wii-section-label">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {boardWithUser.map((u,i) => {
                    const color = avatarColor(u.id??u.name);
                    const rankColors = ['#FFD700','#A8A8A8','#CD7F32'];
                    return (
                      <tr key={u.id??i} style={{ borderBottom:'1px solid rgba(0,154,199,0.08)', background:u.isUser?'rgba(0,154,199,0.06)':'transparent' }}>
                        <td className="px-4 py-3">
                          <span className="font-black text-[13px]" style={{ color:rankColors[i]??'#9AB5C0' }}>#{u.rank}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{ background:color }}>{initials(u.name)}</div>
                            <span className="font-bold text-[13px]" style={{ color:u.isUser?'#009AC7':'#1E3A4A' }}>
                              {u.name}
                              {u.isUser && <span className="ml-2 text-[9px] text-white px-1.5 py-0.5 rounded-full font-black" style={{ background:'#009AC7' }}>YOU</span>}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-bold text-[13px]" style={{ color:'#7A9BAA' }}>Lv.{u.level}</td>
                        <td className="px-4 py-3 font-black text-[13px]" style={{ color:'#D4831A' }}>{fmtXP(u.xp)}</td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-black px-2 py-1 rounded-full" style={{ background:'rgba(0,154,199,0.1)', color:'#009AC7' }}>{u.badge}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
