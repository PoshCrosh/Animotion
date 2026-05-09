'use client';
import AppShell from '../../components/layout/AppShell';
import Spinner  from '../../components/ui/Spinner';
import Toggle   from '../../components/ui/Toggle';
import { useApp }  from '../../lib/store';
import { useAuth } from '../../hooks/useAuth';

function SettingRow({ icon, label, desc, children }) {
  return (
    <div className="flex items-center justify-between py-4" style={{ borderBottom:'1px solid rgba(0,154,199,0.1)' }}>
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
      <h2 className="wii-section-label mb-3">{title}</h2>
      <div>{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const { state, dispatch } = useApp();
  const { dark, focusMode } = state;

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background:'#EAF6FB' }}><Spinner size={10}/></div>;

  return (
    <AppShell user={user}>
      <div className="page" style={{ maxWidth: 640 }}>
        {/* Header */}
        <div className="wii-card p-5 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background:'linear-gradient(135deg,#9CA3AF,#6B7280)', boxShadow:'0 4px 16px rgba(156,163,175,0.35)' }}>⚙️</div>
          <div>
            <h1 className="font-black text-2xl" style={{ color:'#1E3A4A' }}>Settings</h1>
            <p className="text-[13px] font-semibold" style={{ color:'#7A9BAA' }}>Customise your Animotion experience</p>
          </div>
        </div>

        <SectionCard title="🎨 APPEARANCE">
          <SettingRow icon="🌙" label="Dark Mode" desc="Easy on the eyes at night">
            <Toggle value={dark} onChange={v => dispatch({ type:'SET_DARK', v })}/>
          </SettingRow>
          <SettingRow icon="🎯" label="Focus Mode" desc="Dims the sidebar for distraction-free work">
            <Toggle value={focusMode} onChange={v => dispatch({ type:'SET_FOCUS', v })}/>
          </SettingRow>
        </SectionCard>

        <SectionCard title="📖 LEARNING">
          <SettingRow icon="🔔" label="Quest Reminders" desc="Daily nudges to keep your streak going">
            <Toggle value={false} onChange={() => {}}/>
          </SettingRow>
          <SettingRow icon="🎵" label="Sound Effects" desc="XP and level-up sounds">
            <Toggle value={false} onChange={() => {}}/>
          </SettingRow>
          <SettingRow icon="⚡" label="Auto-advance Lessons" desc="Skip intros on revisit">
            <Toggle value={false} onChange={() => {}}/>
          </SettingRow>
        </SectionCard>

        <SectionCard title="💾 DATA">
          <SettingRow icon="☁️" label="Cloud Sync" desc="Progress saved to Supabase automatically">
            <span className="text-[11px] font-black px-2 py-1 rounded-full" style={{ background:'rgba(82,201,124,0.15)', color:'#52C97C' }}>Active</span>
          </SettingRow>
          <SettingRow icon="📤" label="Export Progress" desc="Download your animation stats">
            <button className="wii-btn wii-btn-secondary text-xs">Export</button>
          </SettingRow>
          <SettingRow icon="🗑️" label="Reset Progress" desc="Clear all XP, lessons and skills">
            <button className="wii-btn text-xs"
              style={{ background:'rgba(255,87,87,0.1)', color:'#FF5757', border:'1.5px solid rgba(255,87,87,0.2)' }}>
              Reset
            </button>
          </SettingRow>
        </SectionCard>

        <SectionCard title="ℹ️ ABOUT">
          <SettingRow icon="📦" label="Version" desc="Animotion v1.0">
            <span className="text-[11px] font-bold" style={{ color:'#9AB5C0' }}>1.0.0</span>
          </SettingRow>
          <SettingRow icon="💬" label="Feedback" desc="Help make Animotion better">
            <a href="mailto:takuwhy@gmail.com" className="wii-btn wii-btn-secondary text-xs">Send ↗</a>
          </SettingRow>
          <SettingRow icon="❤️" label="Made by" desc="Made by Posh :)">
            <span className="text-[11px] font-black" style={{ color:'#009AC7' }}>Posh</span>
          </SettingRow>
        </SectionCard>
      </div>
    </AppShell>
  );
}
