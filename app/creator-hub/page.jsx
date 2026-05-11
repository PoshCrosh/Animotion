'use client';
import { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import Spinner  from '../../components/ui/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { CREATORS } from '../../lib/curriculum';

const CATS = ['All', '2D', '3D', 'VFX', 'Motion', 'General'];
const CAT_COLORS = { '2D':'#5B9CF6','3D':'#9B7FEA','VFX':'#FF5757','Motion':'#FFB347','General':'#52C97C' };

export default function CreatorHubPage() {
  const { user, loading } = useAuth();
  const [cat, setCat] = useState('All');

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:'#EAF6FB' }}>
      <Spinner size={10}/>
    </div>
  );

  const creators = CREATORS ?? [];
  const filtered = cat === 'All' ? creators : creators.filter(c => c.category === cat);

  return (
    <AppShell user={user}>
      <div className="page">
        <div className="wii-card p-5 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background:'linear-gradient(135deg,#9B7FEA,#7C5FD4)', boxShadow:'0 4px 16px rgba(155,127,234,0.4)' }}>🎬</div>
          <div>
            <h1 className="font-black text-2xl" style={{ color:'#1E3A4A' }}>Creator Hub</h1>
            <p className="text-[13px] font-semibold" style={{ color:'#7A9BAA' }}>Learn from the best animation educators on YouTube</p>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)} className="wii-btn text-xs"
              style={{
                background: cat === c ? 'linear-gradient(135deg,#009AC7,#007AAA)' : 'rgba(255,255,255,0.85)',
                color: cat === c ? 'white' : '#5A7A8A',
                border: cat === c ? 'none' : '1.5px solid rgba(0,154,199,0.18)',
                boxShadow: cat === c ? '0 4px 12px rgba(0,154,199,0.3)' : '0 2px 8px rgba(0,120,180,0.08)',
              }}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filtered.map(creator => {
            // ← Use `channel` field (correct field name in curriculum.js)
            // Fall back to `url` if it exists for older data
            const youtubeUrl = creator.channel ?? creator.url ?? '#';
            const accentColor = CAT_COLORS[creator.category] ?? '#009AC7';

            return (
              <div key={creator.id ?? creator.name} className="wii-card p-5 flex flex-col">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background:`${accentColor}15`, border:`1.5px solid ${accentColor}30` }}>
                    🎥
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-[14px] mb-0.5" style={{ color:'#1E3A4A' }}>{creator.name}</h3>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                      style={{ background:`${accentColor}15`, color:accentColor }}>
                      {creator.category}
                    </span>
                  </div>
                </div>

                <p className="text-[12px] font-semibold leading-relaxed flex-1 mb-4" style={{ color:'#7A9BAA' }}>
                  {creator.desc}
                </p>

                {/* ← href uses the channel URL directly, opens in new tab */}
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wii-btn wii-btn-primary w-full justify-center text-xs"
                  style={{ display:'flex' }}
                >
                  ▶ Watch on YouTube ↗
                </a>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="wii-card p-12 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-black text-[14px]" style={{ color:'#1E3A4A' }}>No creators in this category yet</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
