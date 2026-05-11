'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import AppShell           from '../../components/layout/AppShell';
import Spinner            from '../../components/ui/Spinner';
import ProjectsModal      from '../../components/ui/ProjectsModal';
import ExportModal        from '../../components/editor/ExportModal';
import ProjectSettingsPanel from '../../components/editor/ProjectSettingsPanel';
import { useAuth }        from '../../hooks/useAuth';
import { useEditor }      from '../../hooks/useEditor';
import { useApp }         from '../../lib/store';
import { saveProject, getProject, isDbConfigured } from '../../lib/db';
import { sanitize }       from '../../lib/utils';

const W = 580, H = 360;
const PALETTE = ['#1A1D2E','#5B9CF6','#FF8FAB','#52C97C','#FFB347','#9B7FEA','#4ECDC4','#FF5757','#FFFFFF','#000000'];
const TOOLS   = [
  { id:'brush',  icon:'🖊️', tip:'Brush (B)'  },
  { id:'eraser', icon:'⬜', tip:'Eraser (E)' },
];

// Default keybinds (Alt + key)
const DEFAULT_BINDS = {
  undo:      'z',
  redo:      'y',
  save:      's',
  export:    'e',
  newFrame:  'n',
  duplicate: 'd',
  onion:     'o',
};

export default function EditorPage() {
  const { user, loading } = useAuth();
  const { gainXP }        = useApp();
  const ed                = useEditor();
  const { state }         = ed;

  const canvasRef    = useRef(null);
  const drawRef      = useRef(false);
  const lastPosRef   = useRef(null);
  const playRef      = useRef(null);
  const prevFrameId  = useRef(null);
  const autoSaveRef  = useRef(null);

  const [renaming,       setRenaming]       = useState(null);
  const [renameVal,      setRenameVal]      = useState('');
  const [showProjects,   setShowProjects]   = useState(false);
  const [showExport,     setShowExport]     = useState(false);
  const [showSettings,   setShowSettings]   = useState(false);
  const [showKeybinds,   setShowKeybinds]   = useState(false);
  const [keybinds,       setKeybinds]       = useState(DEFAULT_BINDS);
  const [saving,         setSaving]         = useState(false);
  const [saveMsg,        setSaveMsg]        = useState('');
  const [projNameEdit,   setProjNameEdit]   = useState(false);
  const [projNameVal,    setProjNameVal]    = useState('');

  // ── Canvas helpers ────────────────────────────────────────────────────────
  const getCtx = useCallback(() => canvasRef.current?.getContext('2d'), []);

  const captureCurrentFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ed.saveFrameData(canvas.toDataURL('image/png'));
    prevFrameId.current = state.frames[state.currentFrame]?.id ?? null;
  }, [ed, state.frames, state.currentFrame]);

  const renderFrame = useCallback((frameId) => {
    const ctx = getCtx();
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);
    const dataUrl = state.frameData[frameId];
    if (dataUrl) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = dataUrl;
    }
    prevFrameId.current = frameId;
  }, [getCtx, state.frameData]);

  // Init canvas
  useEffect(() => {
    const ctx = getCtx();
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);
    prevFrameId.current = state.frames[0]?.id ?? null;
  }, []); // eslint-disable-line

  // Frame switching
  useEffect(() => {
    const newId = state.frames[state.currentFrame]?.id;
    if (!newId || prevFrameId.current === newId) return;
    if (prevFrameId.current !== null) {
      const canvas = canvasRef.current;
      if (canvas) ed.saveFrameData(canvas.toDataURL('image/png'));
    }
    renderFrame(newId);
  }, [state.currentFrame]); // eslint-disable-line

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

  // Auto-save every 15s
  useEffect(() => {
    clearInterval(autoSaveRef.current);
    if (!user) return;
    autoSaveRef.current = setInterval(() => {
      handleSave(true); // silent save
    }, 15_000);
    return () => clearInterval(autoSaveRef.current);
  }, [user, state.frames, state.layers, state.fps, state.projectName]); // eslint-disable-line

  // ── ALT keybinds ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handle = (e) => {
      if (!e.altKey) return;
      if (['INPUT','TEXTAREA'].includes(e.target.tagName)) return;

      const key = e.key.toLowerCase();
      e.preventDefault();

      if (key === keybinds.undo)      ed.undo();
      if (key === keybinds.redo)      ed.redo();
      if (key === keybinds.save)      handleSave(false);
      if (key === keybinds.export)    setShowExport(true);
      if (key === keybinds.newFrame)  ed.addFrame();
      if (key === keybinds.duplicate) duplicateFrame();
      if (key === keybinds.onion)     ed.setOnion(!state.onion);

      // Tool shortcuts (no Alt required)
    };

    const handleNoAlt = (e) => {
      if (e.altKey || e.metaKey || e.ctrlKey) return;
      if (['INPUT','TEXTAREA'].includes(e.target.tagName)) return;
      if (e.code === 'Space') { e.preventDefault(); ed.setPlaying(!state.playing); }
      if (e.key === 'b' || e.key === 'B') ed.setTool('brush');
      if (e.key === 'e' || e.key === 'E') ed.setTool('eraser');
      if (e.key === 'ArrowRight') ed.setFrame(Math.min(state.frames.length - 1, state.currentFrame + 1));
      if (e.key === 'ArrowLeft')  ed.setFrame(Math.max(0, state.currentFrame - 1));
      if ((e.key === 'Delete' || e.key === 'Backspace') && state.frames.length > 1) {
        ed.delFrame(state.currentFrame);
      }
    };

    window.addEventListener('keydown', handle);
    window.addEventListener('keydown', handleNoAlt);
    return () => {
      window.removeEventListener('keydown', handle);
      window.removeEventListener('keydown', handleNoAlt);
    };
  }, [state.playing, state.currentFrame, state.frames.length, state.onion, keybinds, ed]); // eslint-disable-line

  const duplicateFrame = useCallback(() => {
    captureCurrentFrame();
    ed.addFrame();
    // Copy current frame data to new frame
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const prevData = state.frameData[state.frames[state.currentFrame - 1]?.id];
      if (prevData) {
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => { ctx.drawImage(img, 0, 0); captureCurrentFrame(); };
        img.src = prevData;
      }
    }, 50);
  }, [captureCurrentFrame, ed, state.frameData, state.frames, state.currentFrame]);

  // ── Drawing ───────────────────────────────────────────────────────────────
  const getPos = useCallback((e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x:(e.clientX-r.left)*(W/r.width), y:(e.clientY-r.top)*(H/r.height) };
  }, []);

  const drawStroke = useCallback((e) => {
    if (!drawRef.current) return;
    const ctx = getCtx(); if (!ctx) return;
    const pos = getPos(e), last = lastPosRef.current ?? pos;
    ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = state.tool === 'eraser' ? '#FFFFFF' : state.color;
    ctx.lineWidth   = state.tool === 'eraser' ? state.size * 5 : state.size;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
    lastPosRef.current = pos;
  }, [getCtx, getPos, state.tool, state.color, state.size]);

  const startDraw = useCallback((e) => {
    drawRef.current = true; lastPosRef.current = null;
    ed.pushHistory(); drawStroke(e);
  }, [drawStroke, ed]);

  const endDraw = useCallback(() => {
    drawRef.current = false; lastPosRef.current = null;
    captureCurrentFrame();
  }, [captureCurrentFrame]);

  const clearCanvas = useCallback(() => {
    const ctx = getCtx(); if (!ctx) return;
    ed.pushHistory();
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H);
    captureCurrentFrame();
  }, [getCtx, ed, captureCurrentFrame]);

  // ── Project save ──────────────────────────────────────────────────────────
  const handleSave = async (silent = false) => {
    if (!user) return;
    if (!silent) setSaving(true);
    captureCurrentFrame();
    await new Promise((r) => setTimeout(r, 80));

    const project = await saveProject(user.id, {
      id:     state.projectId,
      name:   state.projectName || 'Untitled Project',
      frames: state.frames,
      layers: state.layers,
      fps:    state.fps,
    });

    if (project) {
      ed.setProjectId(project.id);
      if (!silent) {
        setSaveMsg('Saved ✓');
        
        setTimeout(() => setSaveMsg(''), 3000);
      }
    } else if (!silent) {
      setSaveMsg(isDbConfigured() ? 'Save failed' : 'DB not configured');
      setTimeout(() => setSaveMsg(''), 3000);
    }
    if (!silent) setSaving(false);
  };

  const handleLoad = async (projectId) => {
    if (!user) return;
    setShowProjects(false);
    const project = await getProject(user.id, projectId);
    if (!project) return;
    ed.loadProject(project);
    setTimeout(() => {
      const firstId = project.frames?.[0]?.id;
      if (firstId) renderFrame(firstId);
    }, 50);
  };

  const dur = (state.frames.length / state.fps).toFixed(1);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size={10} /></div>;

  return (
    <AppShell user={user}>
      <div className="page">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              {projNameEdit ? (
                <input autoFocus value={projNameVal}
                  onChange={(e) => setProjNameVal(sanitize(e.target.value))}
                  onBlur={() => { ed.setProjectName(projNameVal || 'Untitled Project'); setProjNameEdit(false); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { ed.setProjectName(projNameVal || 'Untitled Project'); setProjNameEdit(false); } if (e.key === 'Escape') setProjNameEdit(false); }}
                  className="font-black text-2xl tracking-tight bg-transparent border-b-2 border-primary outline-none" maxLength={60} />
              ) : (
                <h1 className="font-black text-2xl tracking-tight cursor-pointer hover:text-primary transition-colors"
                  onDoubleClick={() => { setProjNameVal(state.projectName); setProjNameEdit(true); }}
                  title="Double-click to rename">
                  ✏️ {state.projectName}
                </h1>
              )}
              {state.projectId && <span className="tag bg-green-100 dark:bg-green-950/30 text-green-700 text-[10px]">Saved</span>}
            </div>
            <p className="text-gray-400 text-xs font-semibold">
              <kbd className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] font-black">Space</kbd> Play &nbsp;·&nbsp;
              <kbd className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] font-black">← →</kbd> Frames &nbsp;·&nbsp;
              <kbd className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] font-black">Alt+Z/Y</kbd> Undo/Redo &nbsp;·&nbsp;
              <kbd className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] font-black">Alt+S</kbd> Save &nbsp;·&nbsp;
              <kbd className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] font-black">B/E</kbd> Brush/Eraser
            </p>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setShowKeybinds(!showKeybinds)} className="btn btn-secondary text-xs py-2 px-3">⌨️ Keybinds</button>
            <button onClick={() => setShowSettings(!showSettings)} className="btn btn-secondary text-xs py-2 px-3">⚙️ Settings</button>
            <button onClick={() => setShowProjects(true)} className="btn btn-secondary text-xs py-2 px-3">📁 Projects</button>
            <button onClick={() => handleSave(false)} disabled={saving} className="btn btn-primary text-xs py-2 px-3">
              {saving ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : '💾 Save'}
            </button>
            {saveMsg && <span className={`flex items-center text-xs font-black ${saveMsg.includes('fail') || saveMsg.includes('not') ? 'text-red-500' : 'text-green-600'}`}>{saveMsg}</span>}
          </div>
        </div>

        {/* Settings panels */}
        {showSettings && <div className="mb-4"><ProjectSettingsPanel state={state} ed={ed} onClose={() => setShowSettings(false)} /></div>}

        {/* Keybinds panel */}
        {showKeybinds && (
          <div className="card p-5 mb-4 animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-sm">⌨️ Keybind Settings (Alt + key)</h3>
              <button onClick={() => setShowKeybinds(false)} className="text-xl text-gray-400 hover:text-gray-600 w-7 h-7 flex items-center justify-center">×</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(keybinds).map(([action, key]) => (
                <div key={action} className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400 capitalize">{action.replace(/([A-Z])/g, ' $1')}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-bold">Alt +</span>
                    <input
                      value={key} maxLength={1}
                      onChange={(e) => setKeybinds(b => ({ ...b, [action]: e.target.value.toLowerCase() }))}
                      className="field w-12 text-center text-xs py-1.5 font-black"
                    />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setKeybinds(DEFAULT_BINDS)} className="btn btn-secondary text-xs mt-3 w-full justify-center">Reset to defaults</button>
          </div>
        )}

        <div className="grid gap-3" style={{ gridTemplateColumns:'48px 1fr 196px' }}>

          {/* ── Tool Palette ─────────────────────────────────────────────── */}
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
                style={{ width:22, height:22, background:c, flexShrink:0,
                  border: state.color === c ? '3px solid #5B9CF6' : '2px solid #E5E7EB',
                  transform: state.color === c ? 'scale(1.25)' : 'scale(1)' }} />
            ))}
            <input type="color" value={state.color} onChange={(e) => ed.setColor(e.target.value)}
              className="w-6 h-6 rounded-full border-none cursor-pointer mt-1" title="Custom colour" />
            <div className="w-full h-px bg-gray-100 dark:bg-gray-800 my-1" />
            <span className="text-[9px] font-black text-gray-400">SIZE</span>
            <input type="range" min="1" max="30" value={state.size}
              onChange={(e) => ed.setSize(+e.target.value)}
              className="h-16" style={{ writingMode:'vertical-lr', direction:'rtl', width:20 }} />
            <span className="text-xs font-black text-primary">{state.size}</span>
          </div>

          {/* ── Canvas Area ───────────────────────────────────────────────── */}
          <div className="space-y-3">
            {/* Controls */}
            <div className="card px-4 py-2.5 flex items-center gap-3 flex-wrap">
              <button onClick={() => ed.setPlaying(!state.playing)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                style={{ background: state.playing ? '#FF8FAB' : '#5B9CF6' }}>
                {state.playing ? '⏸' : '▶'}
              </button>
              <button onClick={() => ed.setFrame(0)} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm" title="Go to start">⏮</button>
              <button onClick={clearCanvas}      className="btn btn-secondary text-xs py-1.5 px-3">🗑 Clear</button>
              <button onClick={() => ed.addFrame()} className="btn btn-secondary text-xs py-1.5 px-3" title="Alt+N">+ Frame</button>
              <button onClick={duplicateFrame}   className="btn btn-secondary text-xs py-1.5 px-3" title="Alt+D">⧉ Dupe</button>
              <button onClick={() => ed.toggleKeyframe()}
                className={`btn text-xs py-1.5 px-3 ${state.frames[state.currentFrame]?.keyframe ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 border border-amber-300' : 'btn-secondary'}`}>
                🔑 Key
              </button>
              <div className="ml-auto flex items-center gap-3 text-xs flex-wrap">
                <label className="flex items-center gap-1.5 font-bold text-gray-500">
                  Onion
                  <button onClick={() => ed.setOnion(!state.onion)}
                    className={`relative w-9 h-5 rounded-full transition-colors ${state.onion ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                    title="Alt+O">
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${state.onion ? 'left-[18px]' : 'left-0.5'}`} />
                  </button>
                </label>
                <label className="flex items-center gap-1.5 font-bold text-gray-500">
                  FPS:{state.fps}
                  <input type="range" min="1" max="60" value={state.fps}
                    onChange={(e) => ed.setFps(+e.target.value)} className="w-16" />
                </label>
                <span className="font-black text-gray-400">{state.currentFrame+1}/{state.frames.length}</span>
              </div>
            </div>

            {/* Canvas */}
            <div className="rounded-2xl overflow-hidden bg-[#D0DCF0] p-4 flex justify-center">
              <div className="relative rounded-lg overflow-hidden shadow-strong">
                <canvas ref={canvasRef} width={W} height={H}
                  className={`block ${state.tool === 'eraser' ? 'cursor-eraser' : 'cursor-brush'}`}
                  style={{ width:W, height:H }}
                  onMouseDown={startDraw} onMouseMove={drawStroke} onMouseUp={endDraw} onMouseLeave={endDraw} />
                <div className="absolute top-2 right-3 bg-black/50 text-white text-[10px] font-black px-2 py-1 rounded-md pointer-events-none">
                  {state.currentFrame+1}/{state.frames.length}
                </div>
                {state.playing && (
                  <div className="absolute top-2 left-3 bg-red-500/80 text-white text-[9px] font-black px-2 py-1 rounded-md pointer-events-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> PLAYING
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="card px-4 py-3">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2.5">
                Timeline — {dur}s · {state.frames.length} frames · {state.fps}fps
              </p>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {state.frames.map((frame, i) => (
                  <div key={frame.id} className="flex flex-col items-center gap-1 flex-shrink-0">
                    <button onClick={() => ed.setFrame(i)}
                      className={`w-11 h-9 rounded-xl flex flex-col items-center justify-center transition-all ${
                        i === state.currentFrame ? 'bg-primary-light border-2 border-primary'
                        : frame.keyframe ? 'bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300'
                        : 'bg-gray-100 dark:bg-gray-800 border-2 border-transparent hover:border-gray-300'}`}>
                      <span className={`text-xs font-black ${i === state.currentFrame ? 'text-primary-dark' : 'text-gray-400'}`}>{i+1}</span>
                      {frame.keyframe && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5" />}
                    </button>
                    {state.frames.length > 1 && (
                      <button onClick={() => ed.delFrame(i)}
                        className="text-[9px] text-gray-300 dark:text-gray-700 hover:text-red-400 transition-colors" title="Delete frame">✕</button>
                    )}
                  </div>
                ))}
                <button onClick={() => ed.addFrame()}
                  className="w-11 h-9 rounded-xl bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center text-xl text-gray-400 hover:border-primary hover:text-primary transition-all flex-shrink-0" title="Add frame (Alt+N)">+</button>
              </div>
            </div>

            {/* Export */}
            <div className="flex gap-3">
              <button onClick={() => setShowExport(true)}
                className="btn flex-1 text-white text-sm"
                style={{ background:'linear-gradient(135deg,#52C97C,#5B9CF6)' }}
                title="Alt+E">
                🎬 Export Animation
              </button>
              <button onClick={() => ed.newProject()} className="btn btn-secondary text-xs" title="Start a new empty project">+ New</button>
            </div>
          </div>

          {/* ── Layers & Info ─────────────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black text-[13px]">Layers</h3>
                <button onClick={() => ed.addLayer()} className="text-primary text-xl font-black hover:text-primary-dark">+</button>
              </div>
              <div className="space-y-1.5">
                {state.layers.map((layer, i) => (
                  <div key={layer.id} onClick={() => ed.setLayer(i)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all ${i === state.activeLayer ? 'bg-primary-light border-primary' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-primary'}`}>
                    <button onClick={(e) => { e.stopPropagation(); ed.toggleLayerVis(i); }} className={`text-sm flex-shrink-0 ${layer.visible ? '' : 'opacity-25'}`}>👁</button>
                    {renaming === i ? (
                      <input autoFocus value={renameVal}
                        onChange={(e) => setRenameVal(e.target.value)}
                        onBlur={() => { ed.renameLayer(i, renameVal); setRenaming(null); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { ed.renameLayer(i, renameVal); setRenaming(null); } if (e.key === 'Escape') setRenaming(null); }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 text-xs font-bold bg-transparent outline-none border-b border-primary min-w-0" maxLength={40} />
                    ) : (
                      <span onDoubleClick={(e) => { e.stopPropagation(); setRenaming(i); setRenameVal(layer.name); }}
                        className="flex-1 text-xs font-bold truncate" title="Double-click to rename">{layer.name}</span>
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
              <h3 className="font-black text-xs mb-3">Alt + Key Shortcuts</h3>
              {[['Alt+Z','Undo'],['Alt+Y','Redo'],['Alt+S','Save'],['Alt+E','Export'],['Alt+N','New Frame'],['Alt+D','Duplicate'],['Alt+O','Toggle Onion'],['Space','Play/Pause'],['B / E','Brush / Eraser'],['← →','Navigate'],['Del','Delete frame']].map(([k,d]) => (
                <div key={k} className="flex items-center justify-between mb-1.5">
                  <kbd className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[10px] font-black">{k}</kbd>
                  <span className="text-[10px] text-gray-400 font-semibold">{d}</span>
                </div>
              ))}
            </div>

            <div className="card p-4">
              <h3 className="font-black text-xs mb-3">Canvas Info</h3>
              {[['Dimensions',`${W}×${H}px`],['Frames',state.frames.length],['Keyframes',state.frames.filter(f=>f.keyframe).length],['Layers',state.layers.length],['FPS',state.fps],['Duration',`${dur}s`]].map(([k,v]) => (
                <div key={k} className="flex justify-between mb-1.5">
                  <span className="text-[11px] text-gray-400 font-bold">{k}</span>
                  <span className="text-[11px] font-black">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showProjects && user && <ProjectsModal userId={user.id} onLoad={handleLoad} onClose={() => setShowProjects(false)} />}
      {showExport && (
        <ExportModal
          frames={state.frames}
          frameData={state.frameData}
          canvasFps={state.fps}
          onClose={() => setShowExport(false)}
        />
      )}
    </AppShell>
  );
}
