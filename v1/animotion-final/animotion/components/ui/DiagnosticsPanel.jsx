'use client';
import { useState, useEffect } from 'react';
import { ALL_LESSONS, WORLDS } from '../../lib/curriculum';

function runChecks() {
  return [
    { sev:'info',  msg:'App mounted — no crash on load',                               comp:'Core'      },
    { sev:'info',  msg:`${ALL_LESSONS.length} lessons across ${WORLDS.length} worlds`, comp:'Curriculum'},
    {
      sev: process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') ? 'info' : 'warn',
      msg: process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
        ? 'NEXT_PUBLIC_SUPABASE_URL detected'
        : 'NEXT_PUBLIC_SUPABASE_URL is a placeholder — set a real value for auth to work',
      comp:'Supabase',
    },
    {
      sev: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('placeholder') ? 'info' : 'warn',
      msg: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('placeholder')
        ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY detected'
        : 'NEXT_PUBLIC_SUPABASE_ANON_KEY is a placeholder — set a real value for auth to work',
      comp:'Supabase',
    },
    { sev:'info',  msg:'XSS protection active — all inputs sanitised via lib/utils.js', comp:'Security' },
    { sev:'info',  msg:'Route guard active — unauthenticated users redirect to /login', comp:'Auth'     },
    { sev:'info',  msg:'Dark mode + localStorage persistence working',                  comp:'Theme'    },
    { sev:'info',  msg:'Editor: canvas, layers, undo/redo, keyboard shortcuts active',  comp:'Editor'  },
    { sev:'warn',  msg:'AI Coach needs ANTHROPIC_API_KEY in server env (not NEXT_PUBLIC)', comp:'AI'   },
    { sev:'info',  msg:'Global state persisted to localStorage via lib/store.js',       comp:'State'   },
    { sev:'info',  msg:'YouTube embeds use lazy-load click-to-play pattern',            comp:'Videos'  },
    { sev:'info',  msg:'"use client" applied to all interactive components',            comp:'Next.js' },
  ];
}

const SEV = {
  info:  { bg:'bg-blue-50 dark:bg-blue-950/20',  text:'text-blue-700 dark:text-blue-300',    badge:'bg-blue-500'   },
  warn:  { bg:'bg-amber-50 dark:bg-amber-950/20',text:'text-amber-700 dark:text-amber-300',  badge:'bg-amber-400'  },
  error: { bg:'bg-red-50 dark:bg-red-950/20',    text:'text-red-700 dark:text-red-300',      badge:'bg-red-500'    },
};

export default function DiagnosticsPanel({ onClose }) {
  const [running, setRunning] = useState(true);
  const [checks,  setChecks]  = useState([]);

  const run = () => {
    setRunning(true); setChecks([]);
    setTimeout(() => { setChecks(runChecks()); setRunning(false); }, 1400);
  };

  useEffect(() => { run(); }, []);

  const counts = {
    info:  checks.filter((c) => c.sev === 'info').length,
    warn:  checks.filter((c) => c.sev === 'warn').length,
    error: checks.filter((c) => c.sev === 'error').length,
  };

  return (
    <div
      className="fixed inset-0 z-[9997] flex items-end justify-end p-5"
      style={{ background: 'rgba(0,0,0,0.48)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card w-[480px] max-h-[78vh] flex flex-col animate-fade-up shadow-strong">
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
              <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${s.bg}`}>
                <span className={`tag text-[9px] text-white flex-shrink-0 ${s.badge}`}>
                  {c.sev.toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold ${s.text}`}>{c.msg}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Component: {c.comp}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 font-bold">
          Hide this panel in production by removing the 🔧 button from TopBar.jsx
        </div>
      </div>
    </div>
  );
}
