'use client';
import { useState, useEffect } from 'react';
import AppShell from '../../components/layout/AppShell';
import Spinner  from '../../components/ui/Spinner';
import { useApp }          from '../../lib/store';
import { useAuth }         from '../../hooks/useAuth';
import { RANKS }           from '../../lib/curriculum';
import { getRank, fmtXP }  from '../../lib/utils';
import { getLeaderboard, isDbConfigured } from '../../lib/db';

const BADGE_CLS = {
  'Master Animator': 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400',
  Platinum:          'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400',
  Gold:              'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-600',
  Silver:            'bg-primary-light text-primary-dark',
  Bronze:            'bg-orange-50 dark:bg-orange-950/30 text-orange-600',
};
const BADGE_ICON = { 'Master Animator':'🏆', Platinum:'💎', Gold:'🥇', Silver:'🥈', Bronze:'🥉' };

function getUserInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// Deterministic colour from user id or name
const AVATAR_COLORS = ['#5B9CF6','#FF8FAB','#9B7FEA','#52C97C','#FFB347','#4ECDC4','#FF5757'];
function avatarColor(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { state } = useApp();
  const { xp, level } = state;

  const [board,    setBoard]    = useState([]);
  const [fetching, setFetching] = useState(true);
  const [tab,      setTab]      = useState('global');

  useEffect(() => {
    async function load() {
      setFetching(true);
      const rows = await getLeaderboard(25);
      setBoard(rows);
      setFetching(false);
    }
    load();
  }, []);

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center"><Spinner size={10} /></div>
  );

  const displayName = user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? 'You';
  const userRank    = getRank(xp, RANKS);

  // Build the full board: real users from DB + current user (always shown)
  const boardWithUser = (() => {
    // Check if the current user is already in the board
    const alreadyIn = board.some((u) => u.id === user?.id);
    const base = board.map((u, i) => ({
      rank:       i + 1,
      id:         u.id,
      name:       u.display_name || 'Animator',
      xp:         u.xp  ?? 0,
      level:      u.level ?? 1,
      badge:      getRank(u.xp ?? 0, RANKS).name,
      isUser:     u.id === user?.id,
    }));

    if (!alreadyIn && user?.id) {
      // Inject the current user at the correct position
      const userEntry = { id: user.id, name: displayName, xp, level, badge: userRank.name, isUser: true };
      const merged    = [...base, userEntry].sort((a, b) => b.xp - a.xp).map((u, i) => ({ ...u, rank: i + 1 }));
      return merged;
    }
    return base;
  })();

  const top3        = boardWithUser.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const podiumH     = [88, 114, 68];

  return (
    <AppShell user={user}>
      <div className="page">
        <h1 className="font-black text-2xl tracking-tight mb-1">🏆 Leaderboard</h1>
        <p className="text-gray-500 text-[13px] font-semibold mb-6">Real animators — ranked by XP</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {['global','weekly','friends'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-1.5 rounded-full text-xs font-black capitalize transition-all ${
                tab === t ? 'bg-primary text-white shadow-soft' : 'bg-white dark:bg-gray-900 text-gray-500 border border-gray-200 dark:border-gray-700 hover:border-primary'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* DB not configured notice */}
        {!isDbConfigured() && (
          <div className="mb-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-4">
            <p className="font-black text-sm text-amber-700 dark:text-amber-400 mb-1">⚠️ Leaderboard requires Supabase</p>
            <p className="text-xs text-amber-600 dark:text-amber-500 font-semibold">
              Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to show real user rankings.
            </p>
          </div>
        )}

        {fetching && (
          <div className="flex justify-center py-20"><Spinner size={10} /></div>
        )}

        {!fetching && boardWithUser.length === 0 && (
          <div className="card p-16 text-center">
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="font-black text-xl mb-2">No users yet</h2>
            <p className="text-gray-400 font-semibold text-sm">
              Be the first to earn XP and claim the top spot! Start a lesson to begin.
            </p>
          </div>
        )}

        {!fetching && boardWithUser.length > 0 && (
          <>
            {/* Podium — only show if ≥ 1 user */}
            {top3.length > 0 && (
              <div className="flex justify-center items-end gap-6 mb-10">
                {podiumOrder.map((u, i) => {
                  const medal = i === 0 ? '🥈' : i === 1 ? '🥇' : '🥉';
                  const color = avatarColor(u.id ?? u.name);
                  return (
                    <div key={u.id ?? i} className="flex flex-col items-center gap-2">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-black text-white border-4 border-white dark:border-gray-900"
                        style={{ background: color, boxShadow: `0 4px 18px ${color}55` }}>
                        {getUserInitials(u.name)}
                      </div>
                      <p className="font-black text-xs max-w-[80px] truncate text-center">{u.name}</p>
                      <p className="text-[10px] font-black text-amber-600">{fmtXP(u.xp)} XP</p>
                      <div className="w-20 flex items-start justify-center pt-3 rounded-t-xl"
                        style={{ height: podiumH[i], background: i === 1 ? '#5B9CF6' : '#EBF2FF', fontSize: i === 1 ? 28 : 22 }}>
                        {medal}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

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
                  {boardWithUser.map((u, i) => {
                    const color = avatarColor(u.id ?? u.name);
                    return (
                      <tr key={u.id ?? i}
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
                              style={{ background: color }}>
                              {getUserInitials(u.name)}
                            </div>
                            <span className={`font-bold text-[13px] ${u.isUser ? 'text-primary-dark dark:text-primary' : ''}`}>
                              {u.name}
                              {u.isUser && <span className="ml-2 text-[9px] bg-primary text-white px-1.5 py-0.5 rounded-full font-black">YOU</span>}
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
