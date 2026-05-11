'use client';
import { useState, useEffect } from 'react';
import AppShell from '../../components/layout/AppShell';
import Spinner  from '../../components/ui/Spinner';
import Toggle   from '../../components/ui/Toggle';
import { useApp }  from '../../lib/store';
import { useAuth } from '../../hooks/useAuth';
import { SKILLS, DEFAULT_SKILLS } from '../../lib/curriculum';

function SettingRow({ icon, label, desc, children }) {
  return (
    <div className="flex items-center justify-between py-4" style={{ borderBottom:'1px solid rgba(0,154,199,0.08)' }}>
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <p className="font-black text-[13px]" style={{ color:'#1E3A4A' }}>{label}</p>
          {desc && <p className="text-[11px] font-semibold" style={{ color:'#9AB5C0' }}>{desc}</p>}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="wii-card p-5 mb-4">
      <h2 className="wii-section-label mb-1">{title}</h2>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const { state, dispatch } = useApp();
  const { dark, focusMode, skills } = state;

  const [soundOn,      setSoundOn]      = useState(false);
  const [autoAdvance,  setAutoAdvance]  = useState(false);
  const [reminders,    setReminders]    = useState(false);
  const [musicVol,     setMusicVol]     = useState(0.4);
  const [musicMuted,   setMusicMuted]   = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [exportMsg,    setExportMsg]    = useState('');

  useEffect(() => {
    try {
      setSoundOn(     JSON.parse(localStorage.getItem('animotion_sound')       ?? 'false'));
      setAutoAdvance( JSON.parse(localStorage.getItem('animotion_autoadvance') ?? 'false'));
      setReminders(   JSON.parse(localStorage.getItem('animotion_reminders')   ?? 'false'));
      setMusicVol(    parseFloat(localStorage.getItem('animotion_music_vol')   ?? '0.4'));
      setMusicMuted(  JSON.parse(localStorage.getItem('animotion_music_muted') ?? 'false'));
    } catch {}
  }, []);

  // ── Dark mode: apply to <html> whenever state.dark changes ─────────────
  useEffect(() => {
    document.documentElement.classList.toggle('dark', !!dark);
  }, [dark]);

  function toggleDark(v) { dispatch({ type:'SET_DARK', v }); }

  function toggleSound(v) { setSoundOn(v); localStorage.setItem('animotion_sound', JSON.stringify(v)); }
  function toggleAutoAdvance(v) { setAutoAdvance(v); localStorage.setItem('animotion_autoadvance', JSON.stringify(v)); }
  function toggleReminders(v) { setReminders(v); localStorage.setItem('animotion_reminders', JSON.stringify(v)); }

  function handleMusicVol(v) {
    setMusicVol(v);
    localStorage.setItem('animotion_music_vol', String(v));
    // Dispatch event so Dashboard audio picks it up if open in another tab context
    window.dispatchEvent(new CustomEvent('animotion-music-vol', { detail: { vol: v, muted: musicMuted } }));
  }

  function handleMusicMute(v) {
    setMusicMuted(v);
    localStorage.setItem('animotion_music_muted', JSON.stringify(v));
    window.dispatchEvent(new CustomEvent('animotion-music-vol', { detail: { vol: musicVol, muted: v } }));
  }

  function handleExport() {
    const merged = { ...DEFAULT_SKILLS, ...(skills ?? {}) };
    const blob = new Blob([JSON.stringify({ exportDate: new Date().toISOString(), xp: state.xp, level: state.level, completedLessons: state.completedLessons, skills: merged }, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'animotion-progress.json'; a.click();
    URL.revokeObjectURL(url);
    setExportMsg('Downloaded! ✓');
    setTimeout(() => setExportMsg(''), 3000);
  }

  function handleReset() {
    if (!resetConfirm) { setResetConfirm(true); return; }
    dispatch({ type:'RESET' });
    setResetConfirm(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background:'#EAF6FB' }}><Spinner size={10}/></div>;

  return (
    <AppShell user={user}>
      <div className="page" style={{ maxWidth:640 }}>
        <div className="wii-card p-5 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background:'linear-gradient(135deg,#9CA3AF,#6B7280)', boxShadow:'0 4px 16px rgba(156,163,175,0.35)' }}>⚙️</div>
          <div>
            <h1 className="font-black text-2xl" style={{ color:'#1E3A4A' }}>Settings</h1>
            <p className="text-[13px] font-semibold" style={{ color:'#7A9BAA' }}>Customise your Animotion experience</p>
          </div>
        </div>

        <SectionCard title="🎨 APPEARANCE">
          <SettingRow icon="🌙" label="Dark Mode" desc="Easy on the eyes at night">
            <Toggle value={dark} onChange={toggleDark}/>
          </SettingRow>
          <SettingRow icon="🎯" label="Focus Mode" desc="Dims the sidebar for distraction-free work">
            <Toggle value={focusMode} onChange={v => dispatch({ type:'SET_FOCUS', v })}/>
          </SettingRow>
        </SectionCard>

        <SectionCard title="🎵 MUSIC & SOUND">
          <SettingRow icon="🎵" label="Dashboard Music" desc="Background music plays on the dashboard">
            <Toggle value={!musicMuted} onChange={v => handleMusicMute(!v)}/>
          </SettingRow>
          <SettingRow icon="🔊" label="Music Volume" desc="Controls dashboard background music level">
            <div className="flex items-center gap-3">
              <input type="range" min={0} max={1} step={0.05} value={musicMuted ? 0 : musicVol}
                onChange={e => { handleMusicVol(+e.target.value); setMusicMuted(false); }}
                className="w-28 accent-[#009AC7]" />
              <span className="text-[12px] font-black w-8 text-right" style={{ color:'#009AC7' }}>
                {musicMuted ? '0' : Math.round(musicVol * 100)}%
              </span>
            </div>
          </SettingRow>
          <SettingRow icon="🔔" label="Sound Effects" desc="XP and level-up notification sounds">
            <Toggle value={soundOn} onChange={toggleSound}/>
          </SettingRow>
        </SectionCard>

        <SectionCard title="📖 LEARNING">
          <SettingRow icon="🔔" label="Quest Reminders" desc="Badge when daily quests are incomplete">
            <Toggle value={reminders} onChange={toggleReminders}/>
          </SettingRow>
          <SettingRow icon="⚡" label="Auto-advance Lessons" desc="Skip intro on revisited lessons">
            <Toggle value={autoAdvance} onChange={toggleAutoAdvance}/>
          </SettingRow>
        </SectionCard>

        <SectionCard title="💾 DATA">
          <SettingRow icon="☁️" label="Cloud Sync" desc="Progress saved to your account automatically">
            <span className="text-[11px] font-black px-2 py-1 rounded-full"
              style={{ background:'rgba(82,201,124,0.15)', color:'#52C97C' }}>
              {user ? '✓ Active' : 'Sign in to enable'}
            </span>
          </SettingRow>
          <SettingRow icon="📤" label="Export Progress" desc="Download XP, skills, lessons as JSON">
            <button onClick={handleExport} className="wii-btn wii-btn-secondary text-xs">
              {exportMsg || 'Export JSON'}
            </button>
          </SettingRow>
          <SettingRow icon="🗑️" label="Reset Progress" desc="Permanently wipe all XP, skills, and lessons">
            <button onClick={handleReset} className="wii-btn text-xs"
              style={{ background:resetConfirm?'rgba(255,87,87,0.85)':'rgba(255,87,87,0.1)', color:resetConfirm?'white':'#FF5757', border:'1.5px solid rgba(255,87,87,0.3)' }}>
              {resetConfirm ? '⚠️ Confirm reset' : 'Reset'}
            </button>
          </SettingRow>
          {resetConfirm && (
            <div className="rounded-2xl p-3 mt-2" style={{ background:'rgba(255,87,87,0.06)', border:'1px solid rgba(255,87,87,0.2)' }}>
              <p className="text-[11px] font-bold" style={{ color:'#FF5757' }}>⚠️ This wipes ALL progress permanently. Click "Confirm reset" again to proceed.</p>
            </div>
          )}
        </SectionCard>

        <SectionCard title="ℹ️ ABOUT">
          <SettingRow icon="📦" label="Version" desc="Animotion — Free forever">
            <span className="text-[11px] font-bold" style={{ color:'#9AB5C0' }}>v1.0.0</span>
          </SettingRow>
          <SettingRow icon="💬" label="Feedback" desc="Help make Animotion better">
            <a href="mailto:poshcrosh@gmail.com" className="wii-btn wii-btn-secondary text-xs">Send ↗</a>
          </SettingRow>
          <SettingRow icon="❤️" label="Made by" desc="Built with love">
            <span className="text-[11px] font-black" style={{ color:'#009AC7' }}>Posh :)</span>
          </SettingRow>
        </SectionCard>
      </div>
    </AppShell>
  );
}
