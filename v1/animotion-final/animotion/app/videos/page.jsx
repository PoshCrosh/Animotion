'use client';
import { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import YouTubeEmbed from '../../components/ui/YouTubeEmbed';
import Spinner from '../../components/ui/Spinner';
import { useAuth } from '../../hooks/useAuth';

/**
 * VIDEO LIBRARY
 * To embed a real YouTube video, replace null with the 11-character ID from the URL.
 * Example: https://www.youtube.com/watch?v=YOHp9Dj4jMs  →  videoId: 'YOHp9Dj4jMs'
 */
const VIDEOS = [
  { id:1,  cat:'2D',             title:'Bouncing Ball Masterclass',      channel:'Animation Island',   desc:'Learn timing and spacing through the classic bouncing ball exercise.',              videoId:'YOHp9Dj4jMs' },
  { id:2,  cat:'2D',             title:'Walk Cycle Breakdown',           channel:'Bloop Animation',    desc:'Step-by-step guide to creating a believable walk cycle from scratch.',              videoId:'mHEPGwQbZy4' },
  { id:3,  cat:'2D',             title:'12 Principles Explained',        channel:'Alan Becker',        desc:'All 12 Disney animation principles demonstrated in one comprehensive video.',        videoId:'haa7n3UGyDc' },
  { id:4,  cat:'3D',             title:'Blender Character Animation',    channel:'Blender Guru',       desc:'Complete guide to animating characters in Blender for absolute beginners.',         videoId:null },
  { id:5,  cat:'3D',             title:'Maya Rigging Basics',            channel:'CGCircuit',          desc:'Set up a proper character rig in Maya with IK/FK controls.',                       videoId:null },
  { id:6,  cat:'VFX',            title:'Particle Effects in After Effects', channel:'Video Copilot',   desc:'Create stunning particle simulations using After Effects built-in effects.',        videoId:null },
  { id:7,  cat:'VFX',            title:'Fire & Smoke Simulation',        channel:'FlippedNormals',     desc:'Realistic fire and smoke simulation workflow in Houdini.',                          videoId:null },
  { id:8,  cat:'Cinematography', title:'Camera Angles That Tell Stories',channel:'Film Riot',          desc:'Use camera angles purposefully to create emotion and communicate meaning.',          videoId:'mQqvIv8zLN8' },
  { id:9,  cat:'Cinematography', title:'Cinematic Lighting for Animators',channel:'Corridor Crew',    desc:'Lighting principles from cinematography applied to 3D animation.',                  videoId:null },
  { id:10, cat:'Motion Graphics', title:'Shape Animation Basics',        channel:'Motion Array',       desc:'Everything you need to know about animating shapes in After Effects.',              videoId:null },
];

const CATS = ['All','2D','3D','VFX','Cinematography','Motion Graphics'];

export default function VideosPage() {
  const { user, loading } = useAuth();
  const [cat, setCat] = useState('All');

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"><Spinner size={10} /></div>
  );

  const filtered = cat === 'All' ? VIDEOS : VIDEOS.filter((v) => v.cat === cat);

  return (
    <AppShell user={user}>
      <div className="page">
        <h1 className="font-black text-2xl tracking-tight mb-1">▶️ Video Library</h1>
        <p className="text-gray-500 text-[13px] font-semibold mb-6">
          Curated tutorials from the best animation educators
        </p>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-7">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${
                cat === c
                  ? 'bg-primary text-white shadow-soft'
                  : 'bg-white dark:bg-gray-900 text-gray-500 border border-gray-200 dark:border-gray-700 hover:border-primary'
              }`}>
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-5">
          {filtered.map((vid) => (
            <div key={vid.id}
              className="card overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-medium">
              <YouTubeEmbed videoId={vid.videoId} title={vid.title} />
              <div className="p-4">
                <span className="tag bg-primary-light text-primary-dark mb-2 inline-block text-[10px]">
                  {vid.cat}
                </span>
                <h3 className="font-black text-[13px] leading-snug mb-1">{vid.title}</h3>
                <p className="text-[11px] text-gray-400 font-bold mb-2">{vid.channel}</p>
                <p className="text-xs text-gray-500 font-semibold leading-relaxed">{vid.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">🎥</div>
            <p className="text-gray-400 font-bold">No videos in this category yet.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
