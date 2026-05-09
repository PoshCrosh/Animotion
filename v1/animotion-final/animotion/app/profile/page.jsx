'use client';
import { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import XPBar from '../../components/ui/XPBar';
import Spinner from '../../components/ui/Spinner';
import { useApp } from '../../lib/store';
import { useAuth } from '../../hooks/useAuth';
import { RANKS, ALL_LESSONS } from '../../lib/curriculum';
import { getRank, fmtXP, sanitize } from '../../lib/utils';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const { state } = useApp();
  const { xp, level, completedLessons } = state;

  const [editing,    setEditing]    = useState(false);
  const [nameInput,  setNameInput]  = useState('');
  const [bioInput,   setBioInput]   = useState('');
  const [savedName,  setSavedName]  = useState(null);
  const [savedBio,   setSavedBio]   = useState('Aspiring animator learning the craft one frame at a time 🎬');

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"><Spinner size={10} /></div>
  );

  const rank       = getRank(xp, RANKS);
  const nextRank   = RANKS[RANKS.indexOf(rank) + 1];
  const baseN      = user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? 'Animator';
  const displayName = savedName ?? baseN;
  const initials   = displayName[0]?.toUpperCase() ?? 'A';

  const handleSave = () => {
    if (nameInput.trim().length >= 2) setSavedName(sanitize(nameInput.trim()));
    if (bioInput.trim())              setSavedBio(sanitize(bioInput.trim()));
    setEditing(false);
  };

  const ACHIEVEMENTS = [
    { icon:'🎬', name:'First Frame',  desc:'Completed your first lesson',   earned: completedLessons.length >= 1 },
    { icon:'⏱️', name:'Time Keeper',  desc:'Mastered Timing & Spacing',     earned: completedLessons.includes('f2') },
    { icon:'🔥', name:'On Fire',      desc:'7-day streak!',                 earned: true },
    { icon:'🧠', name:'Quiz Wizard',  desc:'Answered 10 quizzes correctly', earned: completedLessons.length >= 5 },
    { icon:'🚀', name:'Animator',     desc:'Exported your first animation', earned: false },
    { icon:'💎', name:'Dedicated',    desc:'Completed 10 lessons',          earned: completedLessons.length >= 10 },
  ];

  const STATS = [
    { l:'Total XP',       v:fmtXP(xp),            c:'#D4831A' },
    { l:'Level',          v:level,                 c:'#5B9CF6' },
    { l:'Lessons Done',   v:completedLessons.length,c:'#2DA05A' },
    { l:'Animations',     v:5,                     c:'#9B7FEA' },
    { l:'Day Streak',     v:'7 🔥',               c:'#FF8FAB' },
    { l:'Quizzes Passed', v:Math.min(completedLessons.length,8), c:'#4ECDC4' },
  ];

  return (
    <AppShell user={user}>
      <div className="page grid gap-5" style={{ gridTemplateColumns:'300px 1fr' }}>

        {/* Left */}
        <div className="space-y-4">
          <div className="card p-6 text-center">
            <div className="relative inline-block mb-3">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-medium mx-auto"
                style={{ background:'linear-gradient(135deg,#5B9CF6,#9B7FEA)' }}>
                {initials}
              </div>
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-green-400 border-2 border-white dark:border-gray-900" />
            </div>

            {editing ? (
              <div className="space-y-2 text-left">
                <input className="field text-center font-black text-sm" value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)} placeholder="Display name" maxLength={40} />
                <textarea className="field resize-none text-xs" rows={3} value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)} placeholder="Short bio…" maxLength={150} />
                <button onClick={handleSave} className="btn btn-primary w-full text-xs justify-center">Save ✓</button>
                <button onClick={() => setEditing(false)} className="btn btn-secondary w-full text-xs justify-center">Cancel</button>
              </div>
            ) : (
              <>
                <h2 className="font-black text-lg leading-tight mb-1">{displayName}</h2>
                <p className="text-xs text-gray-500 font-semibold leading-relaxed mb-4">{savedBio}</p>
                <div className="bg-blue-50 dark:bg-gray-800 rounded-xl px-3 py-2.5 mb-4">
                  <p className="text-[10px] text-gray-400 font-black uppercase mb-0.5">Current Rank</p>
                  <p className="font-black text-base">{rank.icon} {rank.name}</p>
                </div>
                <XPBar xp={xp} level={level} />
                <button onClick={() => { setNameInput(displayName); setBioInput(savedBio); setEditing(true); }}
                  className="btn btn-secondary w-full text-xs justify-center mt-3">
                  ✏️ Edit Profile
                </button>
              </>
            )}
          </div>

          {/* Achievements */}
          <div className="card p-5">
            <h3 className="font-black text-[13px] mb-4">🏅 Achievements</h3>
            <div className="space-y-3">
              {ACHIEVEMENTS.map((a) => (
                <div key={a.name} className={`flex items-center gap-3 transition-opacity ${a.earned ? '' : 'opacity-35'}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${a.earned ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    {a.icon}
                  </div>
                  <div>
                    <p className="font-black text-xs">{a.name}</p>
                    <p className="text-[10px] text-gray-400 font-semibold">{a.earned ? a.desc : '🔒 ' + a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="card p-6">
            <h3 className="font-black text-base mb-5">📊 Statistics</h3>
            <div className="grid grid-cols-3 gap-3">
              {STATS.map((s) => (
                <div key={s.l} className="bg-blue-50 dark:bg-gray-800 rounded-xl p-4">
                  <p className="font-black text-2xl leading-none mb-1" style={{ color:s.c }}>{s.v}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Rank journey */}
          <div className="card p-6">
            <h3 className="font-black text-base mb-5">🗺️ Rank Journey</h3>
            <div className="space-y-4">
              {RANKS.map((r) => {
                const isCurr = rank.name === r.name;
                const isDone = xp >= r.max;
                const pct    = isCurr
                  ? Math.min(100, ((xp - r.min) / (r.max - r.min)) * 100)
                  : isDone ? 100 : 0;
                return (
                  <div key={r.name} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 border-2 transition-all"
                      style={{
                        background: isCurr ? '#EBF2FF' : isDone ? '#EDFBF3' : '#F9FAFB',
                        borderColor: isCurr ? '#5B9CF6' : isDone ? '#52C97C' : '#E5E7EB',
                      }}>
                      {isDone ? '✓' : r.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1.5">
                        <span className="font-black text-xs">
                          {r.name}
                          {isCurr && (
                            <span className="ml-2 text-[9px] bg-primary text-white px-1.5 py-0.5 rounded-full">Current</span>
                          )}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">{r.min.toLocaleString()} XP</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-[width] duration-700"
                          style={{ width:`${pct}%`, background:'linear-gradient(90deg,#5B9CF6,#9B7FEA)' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {nextRank && (
              <div className="mt-4 p-3 rounded-xl bg-primary-xl dark:bg-blue-950/20 text-center">
                <p className="text-xs font-bold text-primary-dark dark:text-primary">
                  {fmtXP(nextRank.min - xp)} XP until {nextRank.icon} {nextRank.name}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
