'use client';
import { useState } from 'react';

/**
 * YouTubeEmbed — lazy thumbnail, plays on click.
 *
 * To add real videos: open lib/curriculum.js, find the lesson or video entry,
 * and set videoId to the 11-char YouTube ID from the URL.
 * e.g. youtube.com/watch?v=YOHp9Dj4jMs  →  videoId: "YOHp9Dj4jMs"
 */
export default function YouTubeEmbed({ videoId, title = 'Animation Tutorial' }) {
  const [active, setActive] = useState(false);

  if (!videoId) {
    return (
      <div className="relative bg-primary-light dark:bg-gray-800 rounded-xl overflow-hidden aspect-video flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-gray-700">
        <span className="text-3xl">🎥</span>
        <p className="text-sm font-black text-gray-400">Video Coming Soon</p>
        <p className="text-[11px] text-gray-300 dark:text-gray-600 px-6 text-center">
          Add a YouTube video ID in lib/curriculum.js to embed here
        </p>
      </div>
    );
  }

  if (active) {
    return (
      <div className="relative rounded-xl overflow-hidden aspect-video bg-black">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div
      className="relative rounded-xl overflow-hidden aspect-video cursor-pointer group bg-gray-900"
      onClick={() => setActive(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && setActive(true)}
      aria-label={`Play: ${title}`}
    >
      {/* Thumbnail via YouTube API */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
        alt={title}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-colors" />
      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center group-hover:scale-110 transition-transform shadow-medium">
          <span className="text-2xl ml-1">▶</span>
        </div>
      </div>
      {/* Title bar */}
      <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-white text-xs font-black line-clamp-1">{title}</p>
      </div>
    </div>
  );
}
