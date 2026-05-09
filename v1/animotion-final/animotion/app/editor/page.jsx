'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import AppShell from '../../components/layout/AppShell';
import Spinner from '../../components/ui/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { useEditor } from '../../hooks/useEditor';

const W = 580, H = 360;
const PALETTE = ['#1A1D2E','#5B9CF6','#FF8FAB','#52C97C','#FFB347','#9B7FEA','#4ECDC4','#FF5757','#FFFFFF','#000000'];
const TOOLS = [
  { id:'brush',  icon:'🖊️', tip:'Brush'  },
  { id:'eraser', icon:'⬜', tip:'Eraser' },
];

export default function EditorPage() {
  const { user, loading } = useAuth();
  const ed = useEditor();
  const { state } = ed;

  const canvasRef  = useRef(null);
  const drawRef    = useRef(false);
  const lastPosRef = useRef(null);
  const playRef    = useRef(null);

  const [renaming,    setRenaming]    = useState(null);
  const [renameVal,   setRenameVal]   = useState('');
  const [showFbPanel, setShowFbPanel] = useState(false);

  // Init canvas white
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
  }, []);

  // Playback
  useEffect(() => {
    clearInterval(playRef.current);
    if (state.playing) {
      playRef.current = setInterval(
        () => ed.setFrame((state.currentFrame + 1) % state.frames.length),
        1000 / state.fps
      );
    }
    return () => clearInterval(playRef.current);
  }, [state.playing, state.fps, state.currentFrame, state.frames.length]); // eslint-disable-line

  // Keyboard shortcuts
  useEffect(() => {
    const handle = (e) => {
      if (['INPUT','TEXTAREA'].includes(e.target.tagName)) return;
      if (e.code === 'Space') { e.preventDefault(); ed.setPlaying(!state.playing); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); ed.undo(); }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); ed.redo(); }
      if (e.key === 'ArrowRight') ed.setFrame(Math.min(state.frames.length - 1, state.currentFrame + 1));
      if (e.key === 'ArrowLeft')  ed.setFrame(Math.max(0, state.currentFrame - 1));
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [state.playing, state.currentFrame, state.frames.length]); // eslint-disable-line

  const getPos = useCallback((e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
  }, []);

  const drawStroke = useCallback((e) => {
    if (!drawRef.current) return;
    const ctx = canvasRef.current?.getContext('2d'); if (!ctx) return;
    const pos = getPos(e), last = lastPosRef.current ?? pos;
    ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = state.tool === 'eraser' ? '#fff' : state.color;
    ctx.lineWidth   = state.tool === 'eraser' ? state.size * 5 : state.size;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
    lastPosRef.current = pos;
  }, [state.tool, state.color, state.size, getPos]);

  const startDraw = useCallback((e) => {
    drawRef.current = true; lastPosRef.current = null; ed.pushHistory(); drawStroke(e);
  }, [drawStroke, ed]);

  const endDraw = useCallback(() => { drawRef.current = false; lastPosRef.current = null; }, []);

  const clearCanvas = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d'); if (!ctx) return;
    ed.pushHistory(); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
  }, [ed]);

  const dur = (state.frames.length / state.fps).toFixed(1);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size={10} /></div>;

  return (
    <AppShell user={user}>
      <div className="page">
        <h1 className="font-black text-2xl tracking-tight mb-1">✏️ Animation Editor</h1>
        <p className="text-gray-400 text-xs font-semibold mb-5">
          <kbd className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] font-black">Space</kbd> Play/Pause &nbsp;·&nbsp;
          <kbd className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] font-black">← →</kbd> Navigate &nbsp;·&nbsp;
          <kbd className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] font-black">Ctrl+Z</kbd> Undo &nbsp;·&nbsp;
          <kbd className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] font-black">Ctrl+Y</kbd> Redo
        </p>

        <div className="grid gap-3" style={{ gridTemplateColumns: '48px 1fr 196px' }}>

          {/* Tool palette */}
          <div className="card p-2 flex flex-col items-center gap-2">
            {TOOLS.map((t) => (
              <button key={t.id} title={t.tip} onClick={() => ed.setTool(t.id)}
                className={`w-9 h-9 rounded-xl text-lg transition-all ${state.tool === t.id ? 'bg-primary-light border-2 border-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                {t.icon}
              </button>
            ))}
            <div className="w-full h-px bg-gray-100 dark:bg-gray-800 my-1" />
            {PALETTE.map((c) => (
              <button key={c} onClick={() => ed.setColor(c)} aria-label={c}
                className="rounded-full transition-transform"
                style={{ width:22, height:22, background:c, border: state.color === c ? '3px solid #5B9CF6' : '2px solid #E5E7EB',
                  transform: state.color === c ? 'scale(1.25)' : 'scale(1)' }} />
            ))}
            <input type="color" value={state.color} onChange={(e) => ed.setColor(e.target.value)}
              className="w-6 h-6 rounded-full border-none cursor-pointer mt-1" title="Custom colour" />
            <div className="w-full h-px bg-gray-100 dark:bg-gray-800 my-1" />
            <span className="text-[9px] font-black text-gray-400">SIZE</span>
            <input type="range" min="1" max="30" value={state.size} onChange={(e) => ed.setSize(+e.target.value)}
              className="h-16" style={{ writingMode:'vertical-lr', direction:'rtl', width:20 }} />
            <span className="text-xs font-black text-primary">{state.size}</span>
          </div>

          {/* Canvas area */}
          <div className="space-y-3">
            {/* Controls */}
            <div className="card px-4 py-2.5 flex items-center gap-3 flex-wrap">
              <button onClick={() => ed.setPlaying(!state.playing)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                style={{ background: state.playing ? '#FF8FAB' : '#5B9CF6' }}>
                {state.playing ? '⏸' : '▶'}
              </button>
              <button onClick={() => ed.setFrame(0)} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm">⏮</button>
              <button onClick={clearCanvas}      className="btn btn-secondary text-xs py-1.5 px-3">🗑 Clear</button>
              <button onClick={() => ed.addFrame()} className="btn btn-secondary text-xs py-1.5 px-3">+ Frame</button>
              <button onClick={() => ed.toggleKeyframe()}
                className={`btn text-xs py-1.5 px-3 ${state.frames[state.currentFrame]?.keyframe ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 border border-amber-300' : 'btn-secondary'}`}>
                🔑 Keyframe
              </button>
              <div className="ml-auto flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1.5 font-bold text-gray-500">
                  Onion
                  <button onClick={() => ed.setOnion(!state.onion)}
                    className={`relative w-9 h-5 rounded-full transition-colors ${state.onion ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${state.onion ? 'left-[18px]' : 'left-0.5'}`} />
                  </button>
                </label>
                <label className="flex items-center gap-1.5 font-bold text-gray-500">
                  FPS:{state.fps}
                  <input type="range" min="1" max="24" value={state.fps} onChange={(e) => ed.setFps(+e.target.value)} className="w-16" />
                </label>
                <span className="font-black text-gray-400">{state.currentFrame + 1}/{state.frames.length}</span>
              </div>
            </div>

            {/* Canvas */}
            <div className="rounded-2xl overflow-hidden bg-[#D0DCF0] p-4 flex justify-center">
              <div className="relative rounded-lg overflow-hidden shadow-strong">
                <canvas ref={canvasRef} width={W} height={H}
                  className={`block ${state.tool === 'eraser' ? 'cursor-eraser' : 'cursor-brush'}`}
                  style={{ width: W, height: H }}
                  onMouseDown={startDraw} onMouseMove={drawStroke} onMouseUp={endDraw} onMouseLeave={endDraw} />
                <div className="absolute top-2 right-3 bg-black/50 text-white text-[10px] font-black px-2 py-1 rounded-md pointer-events-none">
                  {state.currentFrame + 1}/{state.frames.length}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="card px-4 py-3">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2.5">
                Timeline — {dur}s at {state.fps} fps
              </p>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {state.frames.map((frame, i) => (
                  <div key={frame.id} className="flex flex-col items-center gap-1 flex-shrink-0">
                    <button onClick={() => ed.setFrame(i)}
                      className={`w-11 h-9 rounded-xl flex flex-col items-center justify-center transition-all ${
                        i === state.currentFrame ? 'bg-primary-light border-2 border-primary'
                        : frame.keyframe ? 'bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300'
                        : 'bg-gray-100 dark:bg-gray-800 border-2 border-transparent hover:border-gray-300'}`}>
                      <span className={`text-xs font-black ${i === state.currentFrame ? 'text-primary-dark' : 'text-gray-400'}`}>{i + 1}</span>
                      {frame.keyframe && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5" />}
                    </button>
                    {state.frames.length > 1 && (
                      <button onClick={() => ed.delFrame(i)}
                        className="text-[9px] text-gray-300 dark:text-gray-700 hover:text-red-400 transition-colors">✕</button>
                    )}
                  </div>
                ))}
                <button onClick={() => ed.addFrame()}
                  className="w-11 h-9 rounded-xl bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center text-xl text-gray-400 hover:border-primary hover:text-primary transition-all flex-shrink-0">
                  +
                </button>
              </div>
            </div>

            {/* AI feedback CTA */}
            <div className="flex gap-3">
              <button onClick={() => setShowFbPanel(!showFbPanel)}
                className="btn flex-1 text-white text-sm"
                style={{ background: 'linear-gradient(135deg,#5B9CF6,#9B7FEA)' }}>
                🤖 Get AI Feedback on This Animation
              </button>
              <button className="btn btn-secondary text-xs">💾 Export GIF</button>
            </div>
            {showFbPanel && (
              <div className="card p-5 animate-fade-up" style={{ background:'linear-gradient(135deg,#EBF2FF,#F3EFFE)' }}>
                <div className="flex gap-3 items-start">
                  <div className="text-3xl">🤖</div>
                  <div>
                    <h3 className="font-black text-[13px] mb-1">AI Feedback Panel</h3>
                    <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                      Export your animation and upload it to the <strong className="text-primary">AI Coach</strong> page for detailed frame-by-frame analysis on timing, spacing, weight, arcs, and more.
                    </p>
                    <button onClick={() => setShowFbPanel(false)} className="btn btn-primary text-xs py-1.5 px-3 mt-3">Got it ✓</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Layers panel */}
          <div className="space-y-3">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black text-[13px]">Layers</h3>
                <button onClick={() => ed.addLayer()} className="text-primary text-xl font-black hover:text-primary-dark">+</button>
              </div>
              <div className="space-y-1.5">
                {state.layers.map((layer, i) => (
                  <div key={layer.id} onClick={() => ed.setLayer(i)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                      i === state.activeLayer ? 'bg-primary-light border-primary' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-primary'}`}>
                    <button onClick={(e) => { e.stopPropagation(); ed.toggleLayerVis(i); }}
                      className={`text-sm flex-shrink-0 ${layer.visible ? '' : 'opacity-25'}`}>👁</button>
                    {renaming === i ? (
                      <input autoFocus value={renameVal}
                        onChange={(e) => setRenameVal(e.target.value)}
                        onBlur={() => { ed.renameLayer(i, renameVal); setRenaming(null); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { ed.renameLayer(i, renameVal); setRenaming(null); } if (e.key === 'Escape') setRenaming(null); }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 text-xs font-bold bg-transparent outline-none border-b border-primary min-w-0" maxLength={40} />
                    ) : (
                      <span onDoubleClick={(e) => { e.stopPropagation(); setRenaming(i); setRenameVal(layer.name); }}
                        className="flex-1 text-xs font-bold truncate" title="Double-click to rename">
                        {layer.name}
                      </span>
                    )}
                    {state.layers.length > 1 && (
                      <button onClick={(e) => { e.stopPropagation(); ed.delLayer(i); }}
                        className="text-[10px] text-gray-300 dark:text-gray-700 hover:text-red-400 flex-shrink-0 transition-colors">✕</button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-2 font-semibold">Double-click to rename</p>
            </div>

            <div className="card p-4">
              <h3 className="font-black text-xs mb-3">Shortcuts</h3>
              {[['Space','Play/Pause'],['← →','Navigate'],['Ctrl+Z','Undo'],['Ctrl+Y','Redo']].map(([k,d]) => (
                <div key={k} className="flex items-center justify-between mb-2">
                  <kbd className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[10px] font-black">{k}</kbd>
                  <span className="text-[10px] text-gray-400 font-semibold">{d}</span>
                </div>
              ))}
            </div>

            <div className="card p-4">
              <h3 className="font-black text-xs mb-3">Canvas Info</h3>
              {[['Dimensions',`${W}×${H}px`],['Frames',state.frames.length],['Layers',state.layers.length],['FPS',state.fps],['Duration',`${dur}s`]].map(([k,v]) => (
                <div key={k} className="flex justify-between mb-1.5">
                  <span className="text-[11px] text-gray-400 font-bold">{k}</span>
                  <span className="text-[11px] font-black">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
