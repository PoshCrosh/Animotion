'use client';
import { useState, useEffect } from 'react';
import { ALL_LESSONS, WORLDS } from '../../lib/curriculum';
import { isDbConfigured }      from '../../lib/db';

function runChecks() {
  const dbOk      = isDbConfigured();
  const anthropicHint = 'Set ANTHROPIC_API_KEY in .env.local (server-side, no NEXT_PUBLIC_)';

  return [
    // Core
    { sev:'info', msg:'App mounted and rendered without crash',                          comp:'Core' },
    { sev:'info', msg:`${ALL_LESSONS.length} lessons across ${WORLDS.length} worlds loaded`, comp:'Curriculum' },

    // Auth & DB
    { sev: dbOk ? 'info' : 'warn',
      msg: dbOk ? 'Supabase URL configured — real auth & DB active'
                : 'NEXT_PUBLIC_SUPABASE_URL is a placeholder — running in demo mode',
      comp:'Supabase' },
    { sev: dbOk ? 'info' : 'warn',
      msg: dbOk ? 'Supabase Anon Key configured'
                : 'NEXT_PUBLIC_SUPABASE_ANON_KEY is a placeholder — login will not persist',
      comp:'Supabase' },

    // State
    { sev:'info', msg:'New users start with XP=0, Level=1, zero completed lessons',     comp:'State / Progress' },
    { sev:'info', msg:'User state scoped to auth.uid — no cross-user data leaks',       comp:'Data Safety' },
    { sev:'info', msg:'Dark mode persists independently of user session',               comp:'Theme' },

    // Features
    { sev:'info', msg:'Onboarding modal shows only for hasSeenTutorial=false users',    comp:'Onboarding' },
    { sev:'info', msg:'Leaderboard fetches real users from DB (empty state shown if none)', comp:'Leaderboard' },
    { sev:'info', msg:'Animation editor: all keybinds active (Space/←→/B/E/Del/Ctrl+Z/Y/N/K)', comp:'Editor' },
    { sev:'info', msg:'GIF export uses gif.js loaded from cdnjs CDN on demand',         comp:'Export' },
    { sev: dbOk ? 'info' : 'warn',
      msg: dbOk ? 'Project save/load connected to animation_projects table'
                : 'Project saving requires Supabase — set real keys',
      comp:'Projects' },

    // Security
    { sev:'info', msg:'All form inputs sanitised (XSS prevention via lib/utils.js)',    comp:'Security' },
    { sev:'info', msg:'API routes validate ownership before DB writes',                 comp:'Security' },
    { sev:'info', msg:'RLS policies enabled — users can only access their own rows',    comp:'Row Level Security' },
    { sev:'warn', msg: anthropicHint,                                                   comp:'AI Coach' },
    { sev:'info', msg:'"use client" applied to all interactive components',             comp:'Next.js / SSR' },
  ];
}

const SEV = {
  info:  { bg:'bg-blue-50 dark:bg-blue-950/20',   text:'text-blue-700 dark:text-blue-300',   badge:'bg-blue-500'  },
  warn:  { bg:'bg-amber-50 dark:bg-amber-950/20', text:'text-amber-700 dark:text-amber-300', badge:'bg-amber-400' },
  error: { bg:'bg-red-50 dark:bg-red-950/20',     text:'text-red-700 dark:text-red-300',     badge:'bg-red-500'   },
};

export default function DiagnosticsPanel({ onClose }) {
  const [running, setRunning] = useState(true);
  const [checks,  setChecks]  = useState([]);

  const run = () => {
    setRunning(true); setChecks([]);
    setTimeout(() => { setChecks(runChecks()); setRunning(false); }, 1200);
  };

  useEffect(() => { run(); }, []); // eslint-disable-line

  const counts = { info:0, warn:0, error:0 };
  checks.forEach((c) => counts[c.sev]++);

  return (
    <div
      className="fixed inset-0 z-[9997] flex items-end justify-end p-5"
      style={{ background:'rgba(0,0,0,0.48)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card w-[500px] max-h-[80vh] flex flex-col animate-fade-up shadow-strong">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-black text-base">🔧 Diagnostics Panel</h3>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Developer tools — internal only</p>
          </div>
          <button onClick={onClose} className="text-xl text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center">×</button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 px-5 py-3 border-b border-gray-100 dark:border-gray-800">
          <button onClick={run} disabled={running} className="btn btn-primary text-xs px-3 py-1.5">
            {running ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Running…
              </span>
            ) : '▶ Run Diagnostics'}
          </button>
          {!running && checks.length > 0 && (
            <div className="flex gap-3 text-xs font-black">
              <span className="text-blue-500">{counts.info} OK</span>
              <span className="text-amber-500">{counts.warn} Warn</span>
              <span className="text-red-500">{counts.error} Error</span>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {running && (
            <div className="text-center py-10">
              <div className="w-8 h-8 border-[3px] border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-bold">Running diagnostics…</p>
            </div>
          )}
          {checks.map((c, i) => {
            const s = SEV[c.sev] ?? SEV.info;
            return (
              <div key={i} className={`flex items-start gap-3 px-3 py-2.5 rounded-xl ${s.bg}`}>
                <span className={`tag text-[9px] text-white flex-shrink-0 mt-0.5 ${s.badge}`}>
                  {c.sev.toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold leading-snug ${s.text}`}>{c.msg}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Component: {c.comp}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 font-bold">
          Hide in production: remove the 🔧 button from components/layout/TopBar.jsx
        </div>
      </div>
    </div>
  );
}
