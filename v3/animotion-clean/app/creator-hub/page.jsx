'use client';
import { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import Spinner  from '../../components/ui/Spinner';
import { useAuth }    from '../../hooks/useAuth';
import { CREATORS }   from '../../lib/curriculum';

const CATS = ['All', '2D', '3D', 'Motion', 'VFX', 'General'];

function CreatorCard({ creator }) {
  return (
    <div className="card p-5 hover:-translate-y-1 hover:shadow-medium transition-all duration-200 flex flex-col">
      {/* Avatar */}
      <div className="flex items-center gap-4 mb-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black text-white flex-shrink-0 shadow-soft"
          style={{ background: `linear-gradient(135deg,${creator.color},${creator.color}99)` }}
        >
          {creator.thumb ?? creator.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-base truncate">{creator.name}</h3>
          <span
            className="tag text-[10px]"
            style={{ background:`${creator.color}22`, color:creator.color }}
          >
            {creator.category}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold leading-relaxed flex-1 mb-4">
        {creator.desc}
      </p>

      {/* CTA */}
      <a
        href={creator.channel}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary w-full text-xs justify-center"
        style={{ background: creator.color }}
      >
        ▶ Watch on YouTube
      </a>
    </div>
  );
}

export default function CreatorHubPage() {
  const { user, loading } = useAuth();
  const [cat, setCat] = useState('All');

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size={10} /></div>;

  const filtered = cat === 'All' ? CREATORS : CREATORS.filter((c) => c.category === cat);

  return (
    <AppShell user={user}>
      <div className="page">
        {/* Header */}
        <div className="mb-7">
          <h1 className="font-black text-2xl tracking-tight mb-1">🎬 Creator Hub</h1>
          <p className="text-gray-500 text-[13px] font-semibold">
            Learn from the best animation educators on YouTube — hand-picked for Animotion students
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-7">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${
                cat === c
                  ? 'bg-primary text-white shadow-soft'
                  : 'bg-white dark:bg-gray-900 text-gray-500 border border-gray-200 dark:border-gray-700 hover:border-primary'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-5">
          {filtered.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">🎬</div>
            <p className="text-gray-400 font-bold">No creators in this category yet.</p>
          </div>
        )}

        {/* Suggest section */}
        <div className="mt-10 card p-6 text-center" style={{ background:'linear-gradient(135deg,#EBF2FF,#F3EFFE)' }}>
          <div className="text-3xl mb-3">💡</div>
          <h3 className="font-black text-base mb-2">Know a great creator we missed?</h3>
          <p className="text-sm text-gray-500 font-semibold mb-4">
            Send a suggestion to <a href="mailto:takuwhy@gmail.com" className="text-primary font-black hover:underline">takuwhy@gmail.com</a>
          </p>
          <a
            href="mailto:takuwhy@gmail.com?subject=Creator Hub Suggestion"
            className="btn btn-primary text-sm"
          >
            Suggest a Creator →
          </a>
        </div>
      </div>
    </AppShell>
  );
}
