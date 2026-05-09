'use client';
import { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import Spinner from '../../components/ui/Spinner';
import { useApp } from '../../lib/store';
import { useAuth } from '../../hooks/useAuth';
import { LEADERBOARD, RANKS } from '../../lib/curriculum';
import { getRank, fmtXP } from '../../lib/utils';

const BADGE_CLS = {
  'Master Animator': 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400',
  Platinum:          'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400',
  Gold:              'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-600',
  Silver:            'bg-primary-light text-primary-dark',
  Bronze:            'bg-orange-50 dark:bg-orange-950/30 text-orange-600',
};
const BADGE_ICON = {
  'Master Animator': '🏆', Platinum:'💎', Gold:'🥇', Silver:'🥈', Bronze:'🥉',
};

export default function LeaderboardPage() {
  const { user, loading } = useAuth();
  const { state } = useApp();
  const { xp, level } = state;
  const [tab, setTab] = useState('global');

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"><Spinner size={10} /></div>
  );

  const displayName = user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? 'You';
  const initials    = displayName[0]?.toUpperCase() ?? 'Y';
  const userRank    = getRank(xp, RANKS);

  // Inject real user into board and sort
  const fullBoard = [
    ...LEADERBOARD,
    { rank:99, name:displayName, xp, level, badge:userRank.name, avatar:initials, color:'#5B9CF6', isUser:true },
  ]
    .sort((a, b) => b.xp - a.xp)
    .map((u, i) => ({ ...u, rank: i + 1 }));

  const top3 = fullBoard.slice(0, 3);
  // Podium order: 2nd place left, 1st place centre, 3rd place right
  const podiumOrder  = [top3[1], top3[0], top3[2]].filter(Boolean);
  const podiumHeight = [88, 114, 68];

  return (
    <AppShell user={user}>
      <div className="page">
        <h1 className="font-black text-2xl tracking-tight mb-1">🏆 Leaderboard</h1>
        <p className="text-gray-500 text-[13px] font-semibold mb-6">Top animators competing worldwide</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {['global','weekly','friends'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-1.5 rounded-full text-xs font-black capitalize transition-all ${
                tab === t
                  ? 'bg-primary text-white shadow-soft'
                  : 'bg-white dark:bg-gray-900 text-gray-500 border border-gray-200 dark:border-gray-700 hover:border-primary'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Podium */}
        <div className="flex justify-center items-end gap-6 mb-10">
          {podiumOrder.map((u, i) => {
            const medal = i === 0 ? '🥈' : i === 1 ? '🥇' : '🥉';
            return (
              <div key={u.rank} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-black text-white border-4 border-white dark:border-gray-900"
                  style={{ background:u.color, boxShadow:`0 4px 18px ${u.color}55` }}>
                  {u.avatar}
                </div>
                <p className="font-black text-xs max-w-[80px] truncate text-center">{u.name}</p>
                <p className="text-[10px] font-black text-amber-600">{fmtXP(u.xp)} XP</p>
                <div className="w-20 flex items-start justify-center pt-3 rounded-t-xl"
                  style={{ height:podiumHeight[i], background: i === 1 ? '#5B9CF6' : '#EBF2FF', fontSize: i === 1 ? 28 : 22 }}>
                  {medal}
                </div>
              </div>
            );
          })}
        </div>

        {/* Full table */}
        <div className="card overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-blue-50/60 dark:bg-gray-800/40">
                {['Rank','Animator','Level','XP','Badge'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fullBoard.map((u, i) => (
                <tr key={u.rank}
                  className={`border-b border-gray-50 dark:border-gray-800/50 last:border-none transition-colors ${
                    u.isUser ? 'bg-primary-xl dark:bg-blue-950/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
                  }`}>
                  <td className="px-4 py-3">
                    <span className="font-black text-[13px]"
                      style={{ color: i===0?'#FFD700':i===1?'#A0A0A0':i===2?'#CD7F32':'#9CA3AF' }}>
                      #{u.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                        style={{ background:u.color }}>{u.avatar}</div>
                      <span className={`font-bold text-[13px] ${u.isUser ? 'text-primary-dark dark:text-primary' : ''}`}>
                        {u.name}
                        {u.isUser && (
                          <span className="ml-2 text-[9px] bg-primary text-white px-1.5 py-0.5 rounded-full font-black">YOU</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-[13px] text-gray-500">Lv.{u.level}</td>
                  <td className="px-4 py-3 font-black text-[13px] text-amber-600 dark:text-amber-400">{fmtXP(u.xp)}</td>
                  <td className="px-4 py-3">
                    <span className={`tag text-[10px] ${BADGE_CLS[u.badge] ?? BADGE_CLS.Bronze}`}>
                      {BADGE_ICON[u.badge] ?? '🥉'} {u.badge}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
