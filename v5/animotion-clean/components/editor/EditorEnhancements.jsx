'use client';
import { useState, useRef, useCallback } from 'react';

// ── Time Scrubber ─────────────────────────────────────────────────────────────
export function TimeScrubber({ frames, frameData, fps, currentFrame, onScrub }) {
  const trackRef  = useRef(null);
  const dragging  = useRef(false);
  const [preview, setPreview] = useState(null); // { x, frameIdx }

  const getFrameFromX = useCallback((clientX) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(pct * (frames.length - 1));
  }, [frames.length]);

  const handleMouseDown = (e) => {
    dragging.current = true;
    const idx = getFrameFromX(e.clientX);
    onScrub(idx);
  };

  const handleMouseMove = (e) => {
    const idx = getFrameFromX(e.clientX);
    const rect = trackRef.current?.getBoundingClientRect();
    if (rect) setPreview({ x: e.clientX - rect.left, frameIdx: idx });
    if (dragging.current) onScrub(idx);
  };

  const handleMouseUp   = () => { dragging.current = false; };
  const handleMouseLeave = () => { setPreview(null); if (dragging.current) dragging.current = false; };

  const totalTime = frames.length / fps;
  const currentTime = currentFrame / fps;

  return (
    <div className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 py-2">
      <div className="flex items-center gap-3 mb-1.5">
        <span className="text-[10px] font-black text-gray-400 w-10">
          {currentTime.toFixed(2)}s
        </span>

        {/* Track */}
        <div
          ref={trackRef}
          className="flex-1 h-6 relative cursor-pointer select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            {/* Fill */}
            <div
              className="absolute left-0 top-0 h-full bg-primary/30 rounded-l-lg transition-none"
              style={{ width: `${(currentFrame / Math.max(1, frames.length - 1)) * 100}%` }}
            />

            {/* Frame ticks */}
            {frames.map((frame, i) => {
              const pct = (i / Math.max(1, frames.length - 1)) * 100;
              return (
                <div key={frame.id}
                  className="absolute top-0 bottom-0 w-px"
                  style={{
                    left: `${pct}%`,
                    background: frame.keyframe ? '#5B9CF6' : 'rgba(0,0,0,0.08)',
                  }}
                />
              );
            })}

            {/* Current frame indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
              style={{ left: `${(currentFrame / Math.max(1, frames.length - 1)) * 100}%` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary shadow-soft" />
            </div>
          </div>

          {/* Hover preview */}
          {preview && (
            <div
              className="absolute -top-8 z-20 bg-gray-900 text-white text-[9px] font-black px-2 py-1 rounded pointer-events-none"
              style={{ left: Math.max(20, Math.min(preview.x, (trackRef.current?.offsetWidth ?? 0) - 20)) - 20 }}
            >
              F{preview.frameIdx + 1} · {(preview.frameIdx / fps).toFixed(2)}s
            </div>
          )}
        </div>

        <span className="text-[10px] font-black text-gray-400 w-10 text-right">
          {totalTime.toFixed(2)}s
        </span>
      </div>

      {/* Frame info row */}
      <div className="flex items-center gap-4 px-1">
        <span className="text-[9px] text-gray-400 font-semibold">
          Frame {currentFrame + 1} / {frames.length}
        </span>
        {frames[currentFrame]?.keyframe && (
          <span className="tag bg-primary-light text-primary-dark text-[9px]">🔑 Keyframe</span>
        )}
        <span className="text-[9px] text-gray-400 font-semibold ml-auto">{fps} fps</span>
      </div>
    </div>
  );
}

// ── Ghost Reference Mode ──────────────────────────────────────────────────────
export function GhostReferencePanel({ onApply, onClose }) {
  const [referenceUrl, setReferenceUrl] = useState('');
  const [opacity,      setOpacity]      = useState(40);
  const [mode,         setMode]         = useState('overlay'); // overlay | side-by-side
  const [position,     setPosition]     = useState({ x: 0, y: 0 });
  const fileInputRef   = useRef(null);
  const [imageData,    setImageData]    = useState(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageData(ev.target.result);
      setReferenceUrl('');
    };
    reader.readAsDataURL(file);
  };

  const handleApply = () => {
    const src = imageData || referenceUrl;
    if (!src) return;
    onApply({ src, opacity, mode, position });
  };

  return (
    <div className="card p-5 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-sm">👻 Ghost Reference Mode</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl w-6 h-6 flex items-center justify-center">×</button>
      </div>

      <p className="text-[11px] text-gray-500 font-semibold mb-4 leading-relaxed">
        Overlay a reference image on the canvas at reduced opacity. Trace or study it while drawing.
      </p>

      {/* Upload or URL */}
      <div className="space-y-3 mb-4">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase mb-1.5">Upload Image</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
          <button onClick={() => fileInputRef.current?.click()}
            className={`btn text-xs py-2 px-4 w-full justify-center ${imageData ? 'btn-primary' : 'btn-secondary'}`}>
            {imageData ? '✓ Image Loaded' : '📁 Choose Image'}
          </button>
        </div>

        {!imageData && (
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1.5">Or Image URL</p>
            <input
              type="url"
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
              placeholder="https://…"
              className="field text-xs"
            />
          </div>
        )}
      </div>

      {/* Opacity slider */}
      <div className="mb-4">
        <div className="flex justify-between mb-1.5">
          <p className="text-[10px] font-black text-gray-400 uppercase">Opacity</p>
          <span className="text-[10px] font-black text-primary">{opacity}%</span>
        </div>
        <input type="range" min={5} max={80} value={opacity}
          onChange={(e) => setOpacity(+e.target.value)}
          className="w-full accent-primary h-1.5 rounded-full" />
        <div className="flex justify-between text-[9px] text-gray-400 font-semibold mt-0.5">
          <span>Ghost</span><span>Visible</span>
        </div>
      </div>

      {/* Mode */}
      <div className="mb-4">
        <p className="text-[10px] font-black text-gray-400 uppercase mb-1.5">Display Mode</p>
        <div className="flex gap-2">
          {[
            { id: 'overlay', label: '⬛ Overlay', desc: 'On top of canvas' },
            { id: 'side',    label: '◱ Side by Side', desc: 'Next to canvas' },
          ].map(({ id, label, desc }) => (
            <button key={id} onClick={() => setMode(id)}
              className={`flex-1 py-2 px-2 rounded-xl border-2 text-left transition-all ${
                mode === id ? 'border-primary bg-primary-light' : 'border-gray-200 dark:border-gray-700'
              }`}>
              <p className="text-[10px] font-black">{label}</p>
              <p className="text-[9px] text-gray-400">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      {(imageData || referenceUrl) && (
        <div className="mb-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
          style={{ height: 80 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageData || referenceUrl}
            alt="Reference preview"
            className="w-full h-full object-cover"
            style={{ opacity: opacity / 100 }}
          />
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={onClose} className="btn btn-secondary flex-1 text-xs">Cancel</button>
        <button
          onClick={handleApply}
          disabled={!imageData && !referenceUrl}
          className="btn btn-primary flex-1 text-xs disabled:opacity-50"
        >
          Apply Reference
        </button>
      </div>
    </div>
  );
}

// ── Smart Tween Assist ────────────────────────────────────────────────────────
// Generates in-between frames between two keyframes
export function TweenAssist({ frames, frameData, currentFrame, onGenerate, onClose }) {
  const [startFrame, setStartFrame] = useState(Math.max(0, currentFrame - 1));
  const [endFrame,   setEndFrame]   = useState(Math.min(frames.length - 1, currentFrame + 1));
  const [steps,      setSteps]      = useState(2);
  const [easing,     setEasing]     = useState('ease');
  const [generating, setGenerating] = useState(false);

  const keyframes = frames
    .map((f, i) => ({ ...f, idx: i }))
    .filter((f) => f.keyframe || frameData[f.id]);

  const handleGenerate = async () => {
    if (startFrame >= endFrame) return;
    setGenerating(true);

    try {
      const startData = frameData[frames[startFrame]?.id];
      const endData   = frameData[frames[endFrame]?.id];

      if (!startData || !endData) {
        alert('Both start and end frames need content to tween.');
        setGenerating(false);
        return;
      }

      // Generate in-betweens by alpha-blending on a canvas
      const offscreen = document.createElement('canvas');
      offscreen.width  = 580;
      offscreen.height = 360;
      const ctx = offscreen.getContext('2d');

      const tweens = [];

      for (let i = 1; i <= steps; i++) {
        let t = i / (steps + 1);

        // Apply easing
        if (easing === 'ease')     t = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        if (easing === 'ease-in')  t = t * t * t;
        if (easing === 'ease-out') t = 1 - Math.pow(1 - t, 3);

        ctx.clearRect(0, 0, 580, 360);

        // Draw start frame
        await new Promise((resolve) => {
          const imgA = new Image();
          imgA.onload = () => {
            ctx.globalAlpha = 1 - t;
            ctx.drawImage(imgA, 0, 0);
            resolve();
          };
          imgA.src = startData;
        });

        // Blend end frame on top
        await new Promise((resolve) => {
          const imgB = new Image();
          imgB.onload = () => {
            ctx.globalAlpha = t;
            ctx.drawImage(imgB, 0, 0);
            ctx.globalAlpha = 1;
            resolve();
          };
          imgB.src = endData;
        });

        tweens.push(offscreen.toDataURL('image/png'));
      }

      onGenerate({ startFrame, endFrame, tweens, steps });
    } finally {
      setGenerating(false);
      onClose();
    }
  };

  return (
    <div className="card p-5 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-sm">✨ Smart Tween Assist</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl w-6 h-6 flex items-center justify-center">×</button>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl px-3 py-2 mb-4">
        <p className="text-[10px] font-black text-amber-700 mb-0.5">⚠️ Assistive Only</p>
        <p className="text-[10px] text-amber-600 font-semibold">
          Tween generates blended frames as a starting point. Always refine manually — the best inbetweens come from understanding, not automation.
        </p>
      </div>

      <div className="space-y-4 mb-4">
        {/* Frame range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Start Frame</p>
            <select value={startFrame} onChange={(e) => setStartFrame(+e.target.value)}
              className="field text-xs py-2">
              {frames.map((_, i) => (
                <option key={i} value={i} disabled={i >= endFrame}>Frame {i + 1}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">End Frame</p>
            <select value={endFrame} onChange={(e) => setEndFrame(+e.target.value)}
              className="field text-xs py-2">
              {frames.map((_, i) => (
                <option key={i} value={i} disabled={i <= startFrame}>Frame {i + 1}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Steps */}
        <div>
          <div className="flex justify-between mb-1.5">
            <p className="text-[10px] font-black text-gray-400 uppercase">Inbetween Frames</p>
            <span className="text-[10px] font-black text-primary">{steps}</span>
          </div>
          <input type="range" min={1} max={6} value={steps}
            onChange={(e) => setSteps(+e.target.value)}
            className="w-full accent-primary h-1.5 rounded-full" />
        </div>

        {/* Easing */}
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase mb-1.5">Easing</p>
          <div className="flex gap-2">
            {[
              { id: 'linear',   label: 'Linear'   },
              { id: 'ease',     label: 'Ease'     },
              { id: 'ease-in',  label: 'Ease In'  },
              { id: 'ease-out', label: 'Ease Out' },
            ].map(({ id, label }) => (
              <button key={id} onClick={() => setEasing(id)}
                className={`flex-1 py-1.5 rounded-lg border text-[10px] font-black transition-all ${
                  easing === id
                    ? 'border-primary bg-primary-light text-primary-dark'
                    : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-primary'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={onClose} className="btn btn-secondary flex-1 text-xs">Cancel</button>
        <button onClick={handleGenerate} disabled={generating || startFrame >= endFrame}
          className="btn btn-primary flex-1 text-xs disabled:opacity-50">
          {generating
            ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Generating…</>
            : `Generate ${steps} Frame${steps > 1 ? 's' : ''} →`}
        </button>
      </div>
    </div>
  );
}
