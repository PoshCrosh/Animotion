'use client';
import { useState } from 'react';

export default function ProjectSettingsPanel({ state, ed, onClose }) {
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [saved,   setSaved]   = useState(false);

  const apply = () => {
    setSaved(true);
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="card p-5 animate-fade-up">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-black text-base">⚙️ Project Settings</h3>
        <button onClick={onClose}
          className="text-xl text-gray-400 hover:text-gray-600 w-7 h-7 flex items-center justify-center">×</button>
      </div>

      <div className="space-y-4">
        {/* Resolution */}
        <div>
          <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Canvas Resolution</p>
          <div className="grid grid-cols-2 gap-2">
            {[['580×360 (default)', '580', '360'], ['1280×720 (HD)', '1280', '720'], ['1920×1080 (Full HD)', '1920', '1080']].map(([l]) => (
              <button key={l} className="py-2 px-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-left hover:border-primary transition-colors">
                {l}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 font-semibold">Note: changing resolution clears all frames.</p>
        </div>

        {/* FPS */}
        <div>
          <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Frame Rate (FPS)</p>
          <div className="flex gap-2">
            {[12, 24, 30].map((f) => (
              <button key={f} onClick={() => ed.setFps(f)}
                className={`flex-1 py-2 rounded-xl border text-xs font-black transition-all ${
                  state.fps === f
                    ? 'border-primary bg-primary-light text-primary-dark'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary text-gray-600'
                }`}>
                {f} fps
              </button>
            ))}
          </div>
        </div>

        {/* Background colour */}
        <div>
          <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Background Colour</p>
          <div className="flex items-center gap-3">
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
              className="w-12 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5" />
            <span className="text-sm font-bold">{bgColor}</span>
            <div className="flex gap-2 ml-auto">
              {['#FFFFFF', '#000000', '#1A1D2E', '#EBF2FF'].map((c) => (
                <button key={c} onClick={() => setBgColor(c)}
                  className="w-7 h-7 rounded-lg border-2 border-gray-200 dark:border-gray-700 transition-transform hover:scale-110"
                  style={{ background: c }} aria-label={c} />
              ))}
            </div>
          </div>
        </div>

        {/* Duration info */}
        <div className="bg-blue-50 dark:bg-gray-800 rounded-xl px-4 py-3">
          <div className="flex justify-between text-xs font-semibold text-gray-500">
            <span>Current Duration</span>
            <span className="font-black text-gray-700 dark:text-gray-300">
              {(state.frames.length / state.fps).toFixed(2)}s ({state.frames.length} frames)
            </span>
          </div>
        </div>

        {/* ── Undo/Redo tip ─────────────────────────────────────────── */}
        <div className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2.5">
          <span className="text-base flex-shrink-0 mt-0.5">⚠️</span>
          <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 leading-relaxed">
            <strong>Undo/Redo Tip:</strong> Press the shortcut twice (e.g. <kbd className="bg-amber-100 dark:bg-amber-900 px-1 rounded font-black text-[10px]">Alt+Z</kbd> twice) for consistent results.
          </p>
        </div>

        {/* Apply */}
        <button onClick={apply} className="btn btn-primary w-full justify-center">
          {saved ? '✓ Applied!' : 'Apply Settings'}
        </button>
      </div>
    </div>
  );
}
