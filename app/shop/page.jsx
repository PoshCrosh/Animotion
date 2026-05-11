'use client';
import AppShell from '../../components/layout/AppShell';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../../components/ui/Spinner';

const COMING_SOON = [
  { icon:'🖌️', name:'Custom Brushes',     desc:'Premium brush packs for your animation editor.',          color:'#5B9CF6' },
  { icon:'🎨', name:'UI Themes',           desc:'Unlock special colour themes for the whole app.',         color:'#9B7FEA' },
  { icon:'🏆', name:'Exclusive Ranks',     desc:'Special rank badges not available anywhere else.',        color:'#FFB347' },
  { icon:'🤖', name:'Ani Costumes',        desc:'Dress up your AI coach Ani with different looks.',        color:'#FF8FAB' },
  { icon:'✨', name:'XP Boosters',         desc:'Temporarily double your XP gains for a set period.',     color:'#52C97C' },
  { icon:'🎞️', name:'Animation Packs',     desc:'Pre-made templates and starter projects for the editor.', color:'#4ECDC4' },
];

export default function ShopPage() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background:'#EAF6FB' }}><Spinner size={10}/></div>;

  return (
    <AppShell user={user}>
      <div className="page">
        {/* Header */}
        <div className="wii-card p-5 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background:'linear-gradient(135deg,#FFB347,#D4831A)', boxShadow:'0 4px 16px rgba(255,179,71,0.4)' }}>🛍️</div>
          <div>
            <h1 className="font-black text-2xl" style={{ color:'#1E3A4A' }}>Shop</h1>
            <p className="text-[13px] font-semibold" style={{ color:'#7A9BAA' }}>Customise your Animotion experience</p>
          </div>
        </div>

        {/* Coming soon banner */}
        <div className="wii-card p-8 mb-6 text-center"
          style={{ background:'linear-gradient(135deg,rgba(255,179,71,0.08),rgba(155,127,234,0.06))', border:'1.5px solid rgba(255,179,71,0.25)' }}>
          <div className="text-5xl mb-4">🚧</div>
          <h2 className="font-black text-2xl mb-2" style={{ color:'#1E3A4A' }}>Coming Soon!</h2>
          <p className="text-[13px] font-semibold max-w-md mx-auto" style={{ color:'#7A9BAA' }}>
            The Animotion Shop is under construction. Soon you'll be able to unlock exclusive items,
            themes, and boosts. Stay tuned!
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background:'rgba(255,179,71,0.12)', border:'1px solid rgba(255,179,71,0.3)' }}>
            <span className="text-[11px] font-black" style={{ color:'#D4831A' }}>🔔 Launching soon</span>
          </div>
        </div>

        {/* Preview grid */}
        <p className="wii-section-label mb-4">SNEAK PEEK — WHAT'S COMING</p>
        <div className="grid grid-cols-3 gap-4">
          {COMING_SOON.map(item => (
            <div key={item.name} className="wii-card p-5 flex flex-col items-center text-center opacity-60">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3"
                style={{ background:`${item.color}15`, border:`1.5px solid ${item.color}30` }}>
                {item.icon}
              </div>
              <h3 className="font-black text-[13px] mb-1" style={{ color:'#1E3A4A' }}>{item.name}</h3>
              <p className="text-[11px] font-semibold mb-3" style={{ color:'#7A9BAA' }}>{item.desc}</p>
              <span className="text-[10px] font-black px-3 py-1 rounded-full"
                style={{ background:'rgba(0,0,0,0.05)', color:'#9AB5C0' }}>Coming Soon</span>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
