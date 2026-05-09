'use client';
import { useState, useRef, useCallback } from 'react';

const RESOLUTIONS = [
  { label: '720p', w: 1280, h: 720 },
  { label: '1080p', w: 1920, h: 1080 },
  { label: '2K', w: 2048, h: 1024 },
  { label: 'Custom', w: null, h: null },
];

const FPS_OPTIONS = [24, 30, 60];

const QUALITY_MAP = {
  low:    { bitrate: 500_000,   gifQuality: 15 },
  medium: { bitrate: 2_000_000, gifQuality: 8  },
  high:   { bitrate: 5_000_000, gifQuality: 4  },
};

function estimateSize(frames, fps, format, quality) {
  const duration = frames / fps;
  const bitrate  = QUALITY_MAP[quality]?.bitrate ?? QUALITY_MAP.medium.bitrate;
  if (format === 'gif') {
    const kb = frames * 20; // rough: 20KB per frame for GIF
    return kb > 1000 ? `~${(kb / 1024).toFixed(1)} MB` : `~${kb} KB`;
  }
  const bytes = (bitrate / 8) * duration;
  return bytes > 1_000_000
    ? `~${(bytes / 1_000_000).toFixed(1)} MB`
    : `~${(bytes / 1_000).toFixed(0)} KB`;
}

// ── MP4 export via MediaRecorder ───────────────────────────────────────────
async function exportMP4(frames, frameData, fps, width, height, quality, onProgress) {
  return new Promise((resolve, reject) => {
    try {
      const offscreen = document.createElement('canvas');
      offscreen.width  = width;
      offscreen.height = height;
      const ctx    = offscreen.getContext('2d');
      const chunks = [];

      if (!offscreen.captureStream) {
        return reject(new Error('MediaRecorder not supported in this browser. Try Chrome or Edge.'));
      }

      const stream   = offscreen.captureStream(fps);
      const { bitrate } = QUALITY_MAP[quality] ?? QUALITY_MAP.medium;

      const mimeType = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')
        ? 'video/mp4;codecs=avc1'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: bitrate,
      });

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `animation.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        resolve();
      };

      recorder.start();
      const delay = 1000 / fps;
      let i = 0;

      const renderNext = () => {
        if (i >= frames.length) {
          // Hold last frame briefly then stop
          setTimeout(() => recorder.stop(), delay);
          return;
        }
        const frame = frames[i];
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        const dataUrl = frameData[frame.id];
        if (dataUrl) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, width, height);
            onProgress(Math.round((i / frames.length) * 100));
            i++;
            setTimeout(renderNext, delay);
          };
          img.src = dataUrl;
        } else {
          onProgress(Math.round((i / frames.length) * 100));
          i++;
          setTimeout(renderNext, delay);
        }
      };

      setTimeout(renderNext, 100);
    } catch (err) {
      reject(err);
    }
  });
}

// ── GIF export via gif.js CDN ──────────────────────────────────────────────
async function exportGIF(frames, frameData, fps, width, height, quality, onProgress) {
  return new Promise((resolve, reject) => {
    const loadScript = (src) =>
      new Promise((res, rej) => {
        if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
        const s = document.createElement('script');
        s.src = src; s.onload = res;
        s.onerror = () => rej(new Error('Failed to load gif.js from CDN'));
        document.head.appendChild(s);
      });

    loadScript('https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js')
      .then(() => {
        const { gifQuality } = QUALITY_MAP[quality] ?? QUALITY_MAP.medium;
        const gif = new window.GIF({
          workers: 2, quality: gifQuality, width, height,
          workerScript: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js',
        });

        const delay    = Math.round(1000 / fps);
        const offscreen = document.createElement('canvas');
        offscreen.width = width; offscreen.height = height;
        const ctx = offscreen.getContext('2d');

        frames.forEach((frame, i) => {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          const dataUrl = frameData[frame.id];
          if (dataUrl) {
            const img = new Image();
            img.src = dataUrl;
            ctx.drawImage(img, 0, 0, width, height);
          }
          gif.addFrame(ctx, { delay, copy: true });
          onProgress(Math.round((i / frames.length) * 50));
        });

        gif.on('progress', (p) => onProgress(50 + Math.round(p * 50)));
        gif.on('finished', (blob) => {
          const url  = URL.createObjectURL(blob);
          const a    = document.createElement('a');
          a.href = url; a.download = 'animation.gif'; a.click();
          setTimeout(() => URL.revokeObjectURL(url), 5000);
          resolve();
        });
        gif.on('error', reject);
        gif.render();
      })
      .catch(reject);
  });
}

export default function ExportModal({ frames, frameData, canvasFps, onClose }) {
  const [format,    setFormat]    = useState('mp4');
  const [resIndex,  setResIndex]  = useState(0);
  const [customW,   setCustomW]   = useState(1280);
  const [customH,   setCustomH]   = useState(720);
  const [fps,       setFps]       = useState(canvasFps ?? 24);
  const [quality,   setQuality]   = useState('medium');
  const [progress,  setProgress]  = useState(0);
  const [exporting, setExporting] = useState(false);
  const [error,     setError]     = useState('');
  const [done,      setDone]      = useState(false);

  const selectedRes = RESOLUTIONS[resIndex];
  const width  = selectedRes.w ?? customW;
  const height = selectedRes.h ?? customH;
  const estSize = estimateSize(frames.length, fps, format, quality);

  const handleExport = async () => {
    setExporting(true);
    setError('');
    setProgress(0);
    setDone(false);
    try {
      if (format === 'mp4') {
        await exportMP4(frames, frameData, fps, width, height, quality, setProgress);
      } else {
        await exportGIF(frames, frameData, fps, width, height, quality, setProgress);
      }
      setProgress(100);
      setDone(true);
    } catch (err) {
      setError(err.message || 'Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => e.target === e.currentTarget && !exporting && onClose()}
    >
      <div className="card w-full max-w-[480px] animate-fade-up shadow-strong overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-black text-lg">🎬 Export Animation</h3>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">{frames.length} frames · {(frames.length / fps).toFixed(1)}s</p>
          </div>
          <button onClick={() => !exporting && onClose()} className="text-2xl text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center disabled:opacity-30">×</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Format */}
          <div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Format</p>
            <div className="flex gap-3">
              {[
                { id:'mp4', label:'MP4 / WebM', desc:'Best quality · Video file' },
                { id:'gif', label:'GIF',        desc:'Animated · Universal' },
              ].map((f) => (
                <button key={f.id} onClick={() => setFormat(f.id)}
                  className={`flex-1 p-3 rounded-xl border-2 text-left transition-all ${format === f.id ? 'border-primary bg-primary-light' : 'border-gray-200 dark:border-gray-700 hover:border-primary'}`}>
                  <p className={`text-sm font-black ${format === f.id ? 'text-primary-dark' : ''}`}>{f.label}</p>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{f.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Resolution */}
          <div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Resolution</p>
            <div className="grid grid-cols-4 gap-2">
              {RESOLUTIONS.map((r, i) => (
                <button key={r.label} onClick={() => setResIndex(i)}
                  className={`py-2 rounded-xl border-2 text-xs font-black transition-all ${resIndex === i ? 'border-primary bg-primary-light text-primary-dark' : 'border-gray-200 dark:border-gray-700 hover:border-primary text-gray-600'}`}>
                  {r.label}
                </button>
              ))}
            </div>
            {selectedRes.w === null && (
              <div className="flex gap-3 mt-3">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-400 mb-1 block">Width (px)</label>
                  <input type="number" value={customW} onChange={(e) => setCustomW(Math.max(1, +e.target.value))}
                    className="field text-sm" min="100" max="4096" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-400 mb-1 block">Height (px)</label>
                  <input type="number" value={customH} onChange={(e) => setCustomH(Math.max(1, +e.target.value))}
                    className="field text-sm" min="100" max="4096" />
                </div>
              </div>
            )}
          </div>

          {/* FPS */}
          <div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Frame Rate</p>
            <div className="flex gap-3">
              {FPS_OPTIONS.map((f) => (
                <button key={f} onClick={() => setFps(f)}
                  className={`flex-1 py-2 rounded-xl border-2 text-sm font-black transition-all ${fps === f ? 'border-primary bg-primary-light text-primary-dark' : 'border-gray-200 dark:border-gray-700 hover:border-primary text-gray-600'}`}>
                  {f} fps
                </button>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Quality</p>
            <div className="flex gap-3">
              {['low','medium','high'].map((q) => (
                <button key={q} onClick={() => setQuality(q)}
                  className={`flex-1 py-2 rounded-xl border-2 text-sm font-black capitalize transition-all ${quality === q ? 'border-primary bg-primary-light text-primary-dark' : 'border-gray-200 dark:border-gray-700 hover:border-primary text-gray-600'}`}>
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Info row */}
          <div className="bg-blue-50 dark:bg-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="text-xs text-gray-500 font-semibold">
              {width}×{height} · {fps}fps · {format.toUpperCase()}
            </div>
            <div className="text-xs font-black text-gray-700 dark:text-gray-300">
              Est. {estSize}
            </div>
          </div>

          {/* Progress */}
          {(exporting || done) && (
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className={done ? 'text-green-600' : 'text-primary'}>{done ? '✓ Export complete!' : 'Exporting…'}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-[width] duration-200"
                  style={{ width: `${progress}%`, background: done ? '#52C97C' : 'linear-gradient(90deg,#5B9CF6,#9B7FEA)' }} />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              <p className="text-red-600 dark:text-red-400 text-xs font-bold">{error}</p>
              {format === 'mp4' && error.includes('not supported') && (
                <p className="text-red-500 text-[10px] font-semibold mt-1">
                  Tip: Use Chrome or Edge. Or switch to GIF format.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={() => !exporting && onClose()} disabled={exporting}
            className="btn btn-secondary flex-1 disabled:opacity-40">
            {done ? 'Close' : 'Cancel'}
          </button>
          {!done && (
            <button onClick={handleExport} disabled={exporting}
              className="btn btn-primary flex-[2] justify-center disabled:opacity-50">
              {exporting
                ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Exporting…</>
                : `Export ${format.toUpperCase()} →`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
