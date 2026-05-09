'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../../components/layout/AppShell';
import Toggle from '../../components/ui/Toggle';
import Spinner from '../../components/ui/Spinner';
import { useApp } from '../../lib/store';
import { useAuth } from '../../hooks/useAuth';
import { getSupabase } from '../../lib/supabase';
import { store } from '../../lib/utils';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const { state, dispatch } = useApp();
  const { dark, sound } = state;
  const router = useRouter();
  const supabase = getSupabase();

  const [notifs,     setNotifs]     = useState(true);
  const [focusPref,  setFocusPref]  = useState(false);
  const [path,       setPath]       = useState('Foundations');
  const [saved,      setSaved]      = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"><Spinner size={10} /></div>
  );

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const handleResetProgress = () => {
    if (confirm('This will erase all your XP, levels, and completed lessons. This cannot be undone. Continue?')) {
      store.del('animotion_v2');
      window.location.reload();
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    await supabase.auth.resetPasswordForEmail(user.email);
    alert(`Password reset email sent to ${user.email}`);
  };

  const GROUPS = [
    {
      section: 'Appearance',
      items: [
        { label:'Dark Mode',             desc:'Switch to a dark colour theme',                ctrl:<Toggle value={dark}      onChange={(v) => dispatch({ type:'SET_DARK',  v })} label="Dark mode"  /> },
      ],
    },
    {
      section: 'Experience',
      items: [
        { label:'Sound Effects',         desc:'Play sounds for XP gains and level-ups',       ctrl:<Toggle value={sound}     onChange={(v) => dispatch({ type:'SET_SOUND', v })} label="Sound"      /> },
        { label:'Daily Reminders',       desc:'Receive a reminder to practise every day',     ctrl:<Toggle value={notifs}    onChange={setNotifs}    label="Reminders"  /> },
        { label:'Focus Mode as Default', desc:'Auto-enable focus mode when you start',        ctrl:<Toggle value={focusPref} onChange={setFocusPref} label="Focus mode" /> },
      ],
    },
    {
      section: 'Learning Path',
      items: [
        {
          label: 'Current Specialisation',
          desc:  'Your active learning focus area',
          ctrl: (
            <select value={path} onChange={(e) => setPath(e.target.value)}
              className="field w-auto py-1.5 text-xs font-black">
              {['Foundations','2D Animation','3D Animation','VFX','Cinematography','Motion Graphics','Character Acting'].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          ),
        },
      ],
    },
    {
      section: 'Account',
      items: [
        { label:'Email Address',   desc:'Your Supabase login email',  ctrl:<span className="text-xs font-bold text-gray-400 truncate max-w-[200px]">{user?.email ?? '—'}</span> },
        { label:'Change Password', desc:'Send a password reset email', ctrl:<button onClick={handlePasswordReset} className="btn btn-secondary text-xs py-1.5 px-3">Reset</button> },
      ],
    },
  ];

  return (
    <AppShell user={user}>
      <div className="page max-w-[680px]">
        <h1 className="font-black text-2xl tracking-tight mb-6">⚙️ Settings</h1>

        <div className="space-y-4">
          {GROUPS.map((group) => (
            <div key={group.section} className="card p-6">
              <h2 className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">
                {group.section}
              </h2>
              {group.items.map((item, idx) => (
                <div key={item.label}
                  className={`flex items-center justify-between py-3.5 ${idx < group.items.length - 1 ? 'border-b border-gray-50 dark:border-gray-800' : ''}`}>
                  <div className="flex-1 pr-4">
                    <p className="font-black text-[13px]">{item.label}</p>
                    <p className="text-xs text-gray-400 font-semibold mt-0.5">{item.desc}</p>
                  </div>
                  {item.ctrl}
                </div>
              ))}
            </div>
          ))}

          <button onClick={handleSave} className="btn btn-primary">
            {saved ? '✓ Saved!' : 'Save Settings'}
          </button>

          {/* Danger zone */}
          <div className="card p-6 border-red-200 dark:border-red-900">
            <h2 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4">⚠️ Danger Zone</h2>
            <div className="flex gap-3 flex-wrap">
              <button onClick={handleResetProgress} className="btn btn-danger text-xs">
                Reset All Progress
              </button>
              <button onClick={handleLogout} disabled={loggingOut} className="btn btn-danger text-xs">
                {loggingOut
                  ? <span className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                  : 'Log Out'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
