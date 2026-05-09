'use client';
import { useState, useRef } from 'react';
import AppShell      from '../../components/layout/AppShell';
import YouTubeEmbed  from '../../components/ui/YouTubeEmbed';
import Spinner       from '../../components/ui/Spinner';
import { useApp }    from '../../lib/store';
import { useAuth }   from '../../hooks/useAuth';
import { WORLDS }    from '../../lib/curriculum';

const CATS = [{ id:'all', label:'All Videos', icon:'🎬' }, ...WORLDS.map(w=>({ id:w.id, label:w.title, icon:w.icon }))];

export default function VideosPage() {
  const { user, loading } = useAuth();
  const { state, gainXP } = useApp();
  const [cat, setCat] = useState('all');
  const watched = useRef(new Set());

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background:'#EAF6FB' }}><Spinner size={10}/></div>;

  const allVideos = WORLDS.flatMap(w =>
    w.sections.flatMap(s => s.lessons.filter(l=>l.videoId).map(l=>({ ...l, worldId:w.id, worldTitle:w.title, worldColor:w.color, worldIcon:w.icon })))
  );
  const filtered = cat==='all' ? allVideos : allVideos.filter(v=>v.worldId===cat);

  return (
    <AppShell user={user}>
      <div className="page">
        {/* Header */}
        <div className="wii-card p-5 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background:'linear-gradient(135deg,#FF5757,#C93535)', boxShadow:'0 4px 16px rgba(255,87,87,0.4)' }}>▶️</div>
          <div>
            <h1 className="font-black text-2xl" style={{ color:'#1E3A4A' }}>Video Library</h1>
            <p className="text-[13px] font-semibold" style={{ color:'#7A9BAA' }}>{allVideos.length} tutorial videos — watch and earn XP</p>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {CATS.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)}
              className="wii-btn text-xs"
              style={{
                background: cat===c.id ? 'linear-gradient(135deg,#009AC7,#007AAA)' : 'rgba(255,255,255,0.85)',
                color: cat===c.id ? 'white' : '#5A7A8A',
                border: cat===c.id ? 'none' : '1.5px solid rgba(0,154,199,0.18)',
                boxShadow: cat===c.id ? '0 4px 12px rgba(0,154,199,0.3)' : '0 2px 8px rgba(0,120,180,0.08)',
              }}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="wii-card p-12 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-black text-[14px]" style={{ color:'#1E3A4A' }}>No videos in this category yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filtered.map(v => (
              <div key={v.id} className="wii-card overflow-hidden">
                <YouTubeEmbed
                  videoId={v.videoId}
                  title={v.title}
                  onPlay={() => {
                    if (!watched.current.has(v.id)) {
                      watched.current.add(v.id);
                      gainXP(20, 'Watched: ' + v.title);
                    }
                  }}
                />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full mr-2"
                        style={{ background:`${v.worldColor}18`, color:v.worldColor }}>
                        {v.worldIcon} {v.worldTitle}
                      </span>
                    </div>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background:'rgba(255,179,71,0.15)', color:'#D4831A' }}>+20 XP</span>
                  </div>
                  <h3 className="font-black text-[13px] mb-1 leading-snug" style={{ color:'#1E3A4A' }}>{v.title}</h3>
                  <p className="text-[11px] font-semibold line-clamp-2" style={{ color:'#7A9BAA' }}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
