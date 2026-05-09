'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import AppShell            from '../../components/layout/AppShell';
import ExportModal         from '../../components/editor/ExportModal';
import ProjectSettingsPanel from '../../components/editor/ProjectSettingsPanel';
import ProjectsModal       from '../../components/ui/ProjectsModal';
import TemplatesModal      from '../../components/ui/TemplatesModal';
import { TimeScrubber, GhostReferencePanel, TweenAssist } from '../../components/editor/EditorEnhancements';
import Spinner             from '../../components/ui/Spinner';
import { useApp }          from '../../lib/store';
import { useAuth }         from '../../hooks/useAuth';
import { useEditor }       from '../../hooks/useEditor';
import { saveProject, getProject } from '../../lib/db';
import { clamp }           from '../../lib/utils';

const CANVAS_W = 580;
const CANVAS_H = 360;

const PALETTE_DEFAULTS = [
  '#1A1D2E','#5B9CF6','#FF8FAB','#52C97C',
  '#FFB347','#9B7FEA','#FF5757','#FFFFFF',
  '#000000','#4ECDC4','#FFD700','#A0A0A0',
];

export default function EditorPage() {
  const { user, loading: authLoading } = useAuth();
  const { state: appState, dispatch: appDispatch, gainXP } = useApp();
  const ed = useEditor();
  const { state } = ed;

  const canvasRef      = useRef(null);
  const drawing        = useRef(false);
  const lastPos        = useRef(null);
  const playRef        = useRef(null);
  const ghostRef       = useRef(null); // ghost reference image element

  const [showExport,    setShowExport]    = useState(false);
  const [showSettings,  setShowSettings]  = useState(false);
  const [showProjects,  setShowProjects]  = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showGhost,     setShowGhost]     = useState(false);
  const [showTween,     setShowTween]     = useState(false);
  const [ghostConfig,   setGhostConfig]   = useState(null);
  const [saving,        setSaving]        = useState(false);
  const [saveMsg,       setSaveMsg]       = useState('');
  const [keybindPanel,  setKeybindPanel]  = useState(false);
  const [editingName,   setEditingName]   = useState(false);
  const [nameInput,     setNameInput]     = useState('');
  const [customPalette, setCustomPalette] = useState(PALETTE_DEFAULTS);

  // ── Canvas helpers ─────────────────────────────────────────────────────────
  const getCtx = useCallback(() => canvasRef.current?.getContext('2d'), []);

  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect   = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clamp((clientX - rect.left) * scaleX, 0, CANVAS_W),
      y: clamp((clientY - rect.top)  * scaleY, 0, CANVAS_H),
    };
  }, []);

  const renderFrame = useCallback((frameIdx) => {
    const ctx = getCtx();
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const frame = state.frames[frameIdx];
    if (!frame) return;
    const dataUrl = state.frameData[frame.id];
    if (!dataUrl) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.drawImage(img, 0, 0);
      // Re-draw ghost overlay if active
      if (ghostRef.current && ghostConfig?.mode === 'overlay') {
        ctx.globalAlpha = (ghostConfig.opacity ?? 40) / 100;
        ctx.drawImage(ghostRef.current, 0, 0, CANVAS_W, CANVAS_H);
        ctx.globalAlpha = 1;
      }
    };
    img.src = dataUrl;
  }, [state.frames, state.frameData, ghostConfig, getCtx]);

  const captureFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ed.saveFrameData(canvas.toDataURL('image/png'));
  }, [ed]);

  // ── Drawing ────────────────────────────────────────────────────────────────
  const startDraw = useCallback((e) => {
    e.preventDefault();
    if (state.playing) return;
    drawing.current = true;
    ed.pushHistory();
    lastPos.current = getPos(e);
  }, [state.playing, ed, getPos]);

  const draw = useCallback((e) => {
    e.preventDefault();
    if (!drawing.current || state.playing) return;
    const ctx = getCtx();
    if (!ctx) return;
    const pos = getPos(e);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = state.tool === 'eraser' ? '#FFFFFF' : state.color;
    ctx.lineWidth   = state.tool === 'eraser' ? state.size * 3 : state.size;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.stroke();
    lastPos.current = pos;
  }, [state.playing, state.tool, state.color, state.size, getCtx, getPos]);

  const endDraw = useCallback(() => {
    if (drawing.current) captureFrame();
    drawing.current = false;
    lastPos.current = null;
  }, [captureFrame]);

  // ── Frame navigation ───────────────────────────────────────────────────────
  const goToFrame = useCallback((idx) => {
    if (idx === state.currentFrame) return;
    captureFrame();
    ed.setFrame(idx);
    setTimeout(() => renderFrame(idx), 20);
  }, [state.currentFrame, captureFrame, ed, renderFrame]);

  // ── Onion skin ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!state.onion || state.playing) return;
    const ctx = getCtx();
    if (!ctx) return;
    const prevIdx = state.currentFrame - 1;
    if (prevIdx < 0) return;
    const prevFrame = state.frames[prevIdx];
    if (!prevFrame) return;
    const prevData = state.frameData[prevFrame.id];
    if (!prevData) return;
    const img = new Image();
    img.onload = () => {
      ctx.globalAlpha = 0.22;
      ctx.drawImage(img, 0, 0);
      ctx.globalAlpha = 1;
    };
    img.src = prevData;
  }, [state.currentFrame, state.onion]); // eslint-disable-line

  // ── Playback ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (state.playing) {
      let idx = state.currentFrame;
      playRef.current = setInterval(() => {
        idx = (idx + 1) % state.frames.length;
        ed.setFrame(idx);
        renderFrame(idx);
      }, 1000 / state.fps);
    } else {
      clearInterval(playRef.current);
    }
    return () => clearInterval(playRef.current);
  }, [state.playing, state.fps, state.frames.length]); // eslint-disable-line

  // ── Render on frame change ─────────────────────────────────────────────────
  useEffect(() => {
    if (!state.playing) renderFrame(state.currentFrame);
  }, [state.currentFrame]); // eslint-disable-line

  // ── Init canvas ───────────────────────────────────────────────────────────
  useEffect(() => {
    const ctx = getCtx();
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }, [getCtx]);

  // ── Ghost reference setup ─────────────────────────────────────────────────
  useEffect(() => {
    if (!ghostConfig) { ghostRef.current = null; return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { ghostRef.current = img; renderFrame(state.currentFrame); };
    img.src = ghostConfig.src;
  }, [ghostConfig]); // eslint-disable-line

  // ── Keybinds ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const handle = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') { e.preventDefault(); ed.setPlaying(!state.playing); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goToFrame(Math.min(state.frames.length - 1, state.currentFrame + 1)); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goToFrame(Math.max(0, state.currentFrame - 1)); }
      if (e.key === 'b' || e.key === 'B') ed.setTool('brush');
      if (e.key === 'e' || e.key === 'E') ed.setTool('eraser');
      if ((e.key === 'Delete' || e.key === 'Backspace') && !e.altKey) {
        e.preventDefault();
        if (state.frames.length > 1) { captureFrame(); ed.delFrame(state.currentFrame); }
      }
      if (e.altKey) {
        if (e.key === 'z' || e.key === 'Z') { e.preventDefault(); ed.undo(); setTimeout(() => renderFrame(state.currentFrame), 20); }
        if (e.key === 'y' || e.key === 'Y') { e.preventDefault(); ed.redo(); setTimeout(() => renderFrame(state.currentFrame), 20); }
        if (e.key === 's' || e.key === 'S') { e.preventDefault(); handleSave(); }
        if (e.key === 'n' || e.key === 'N') { e.preventDefault(); captureFrame(); ed.addFrame(); }
        if (e.key === 'o' || e.key === 'O') { e.preventDefault(); ed.setOnion(!state.onion); }
        if (e.key === 'e' || e.key === 'E') { e.preventDefault(); setShowExport(true); }
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [state, ed, goToFrame, captureFrame]); // eslint-disable-line

  // ── Auto-save ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => {
      if (user?.id) handleSave(true);
    }, 15000);
    return () => clearInterval(t);
  }, [user, state]); // eslint-disable-line

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async (silent = false) => {
    if (!user?.id) return;
    captureFrame();
    if (!silent) setSaving(true);
    const result = await saveProject(user.id, {
      id:        state.projectId,
      name:      state.projectName,
      frames:    state.frames,
      frameData: state.frameData,
      layers:    state.layers,
      fps:       state.fps,
      bgColor:   '#FFFFFF',
      width:     CANVAS_W,
      height:    CANVAS_H,
    });
    if (result?.id && !state.projectId) ed.setProjectId(result.id);
    if (!silent) {
      setSaving(false);
      setSaveMsg('Saved!');
      gainXP(10, 700, 300);
      appDispatch({ type: 'COMPLETE_QUEST', id: 7 });
      setTimeout(() => setSaveMsg(''), 2000);
    }
  }, [user, state, ed, captureFrame, gainXP, appDispatch]);

  // ── Load project ──────────────────────────────────────────────────────────
  const handleLoadProject = useCallback(async (projectId) => {
    if (!user?.id) return;
    const project = await getProject(user.id, projectId);
    if (!project) return;
    ed.loadProject({
      id:        project.id,
      name:      project.name,
      frames:    project.frames   || [],
      frameData: project.frame_data || {},
      layers:    project.layers   || [],
      fps:       project.fps      || 12,
    });
    setTimeout(() => renderFrame(0), 100);
  }, [user, ed, renderFrame]);

  // ── Load template ─────────────────────────────────────────────────────────
  const handleLoadTemplate = useCallback((project) => {
    ed.loadProject(project);
    setTimeout(() => {
      const firstFrame = project.frames?.[0];
      if (firstFrame && project.frameData?.[firstFrame.id]) {
        const img = new Image();
        img.onload = () => {
          const ctx = getCtx();
          if (ctx) ctx.drawImage(img, 0, 0);
        };
        img.src = project.frameData[firstFrame.id];
      }
    }, 100);
  }, [ed, getCtx]);

  // ── Tween generation ──────────────────────────────────────────────────────
  const handleTweenGenerate = useCallback(({ startFrame, endFrame, tweens, steps }) => {
    // Insert tween frames between start and end
    const newFrames = [...state.frames];
    const newFrameData = { ...state.frameData };

    for (let i = 0; i < tweens.length; i++) {
      const newFrame = { id: Date.now() + i, keyframe: false };
      newFrameData[newFrame.id] = tweens[i];
      newFrames.splice(startFrame + 1 + i, 0, newFrame);
    }

    ed.loadProject({
      ...state,
      frames:    newFrames,
      frameData: newFrameData,
    });
  }, [state, ed]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner size={10} /></div>;

  const currentFrameObj = state.frames[state.currentFrame];

  return (
    <AppShell user={user}>
      <div className="page" style={{ maxWidth: '100%' }}>

        {/* ── Toolbar ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {/* Project name */}
          {editingName ? (
            <input
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={() => { ed.setProjectName(nameInput || 'Untitled Project'); setEditingName(false); }}
              onKeyDown={(e) => e.key === 'Enter' && (ed.setProjectName(nameInput || 'Untitled Project'), setEditingName(false))}
              className="field py-1.5 text-sm font-black w-48"
            />
          ) : (
            <button onDoubleClick={() => { setNameInput(state.projectName); setEditingName(true); }}
              className="font-black text-sm text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
              title="Double-click to rename">
              {state.projectName}
            </button>
          )}

          <div className="flex-1" />

          {/* Tool buttons */}
          <div className="flex gap-1.5">
            {[{ id: 'brush', icon: '✏️', tip: 'Brush (B)' }, { id: 'eraser', icon: '◻', tip: 'Eraser (E)' }].map(({ id, icon, tip }) => (
              <button key={id} onClick={() => ed.setTool(id)} title={tip}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all ${state.tool === id ? 'bg-primary text-white shadow-soft' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-primary'}`}>
                {icon}
              </button>
            ))}
          </div>

          {/* Brush size */}
          <input type="range" min={1} max={32} value={state.size}
            onChange={(e) => ed.setSize(+e.target.value)}
            className="w-20 accent-primary h-1.5 rounded-full" title="Brush size" />
          <span className="text-[10px] font-black text-gray-400 w-5">{state.size}</span>

          {/* Separator */}
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

          {/* Action buttons */}
          {[
            { icon: '↩', label: 'Undo',   action: () => { ed.undo(); setTimeout(() => renderFrame(state.currentFrame), 20); }, tip: 'Alt+Z' },
            { icon: '↪', label: 'Redo',   action: () => { ed.redo(); setTimeout(() => renderFrame(state.currentFrame), 20); }, tip: 'Alt+Y' },
          ].map(({ icon, label, action, tip }) => (
            <button key={label} onClick={action} title={`${label} (${tip})`}
              className="btn btn-secondary text-xs py-1.5 px-2.5">
              {icon}
            </button>
          ))}

          <button onClick={() => ed.setOnion(!state.onion)}
            className={`btn text-xs py-1.5 px-2.5 ${state.onion ? 'btn-primary' : 'btn-secondary'}`}
            title="Onion Skin (Alt+O)">
            👻 Onion
          </button>

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

          {/* Ghost reference & Tween */}
          <button onClick={() => setShowGhost((s) => !s)}
            className={`btn text-xs py-1.5 px-2.5 ${ghostConfig ? 'btn-primary' : 'btn-secondary'}`}
            title="Ghost Reference Mode">
            {ghostConfig ? '👻 Ref Active' : '👻 Reference'}
          </button>
          <button onClick={() => setShowTween((s) => !s)}
            className="btn btn-secondary text-xs py-1.5 px-2.5" title="Smart Tween Assist">
            ✨ Tween
          </button>

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

          {/* Project management */}
          <button onClick={() => setShowTemplates(true)} className="btn btn-secondary text-xs py-1.5 px-3" title="Templates">
            🎨 Templates
          </button>
          <button onClick={() => setShowProjects(true)} className="btn btn-secondary text-xs py-1.5 px-3" title="Open project">
            📁 Projects
          </button>
          <button onClick={() => handleSave()} disabled={saving}
            className="btn btn-secondary text-xs py-1.5 px-3 disabled:opacity-50" title="Save (Alt+S)">
            {saving ? '…' : saveMsg || '💾 Save'}
          </button>
          <button onClick={() => setShowExport(true)} className="btn btn-primary text-xs py-1.5 px-3" title="Export (Alt+E)">
            📤 Export
          </button>
        </div>

        {/* ── Main layout ──────────────────────────────────────────────── */}
        <div className="flex gap-4" style={{ height: 'calc(100vh - 260px)', minHeight: 480 }}>

          {/* Left: Layers */}
          <div className="w-44 flex-shrink-0 card p-3 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-gray-400 uppercase">Layers</span>
              <button onClick={ed.addLayer}
                className="w-5 h-5 rounded bg-primary-light text-primary font-black text-sm flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                +
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1">
              {[...state.layers].reverse().map((layer, ri) => {
                const i = state.layers.length - 1 - ri;
                const active = i === state.activeLayer;
                return (
                  <div key={layer.id}
                    onClick={() => ed.setLayer(i)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors group ${active ? 'bg-primary-light dark:bg-blue-950/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                    <button onClick={(e) => { e.stopPropagation(); ed.toggleLayerVis(i); }}
                      className="text-sm flex-shrink-0 opacity-70 hover:opacity-100" title="Toggle visibility">
                      {layer.visible ? '👁' : '🙈'}
                    </button>
                    <span className={`text-[11px] font-bold flex-1 truncate ${active ? 'text-primary-dark dark:text-primary' : 'text-gray-600 dark:text-gray-400'}`}>
                      {layer.name}
                    </span>
                    {state.layers.length > 1 && (
                      <button onClick={(e) => { e.stopPropagation(); ed.delLayer(i); }}
                        className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center: Canvas + side panel */}
          <div className="flex-1 flex gap-4 overflow-hidden">
            {/* Canvas area */}
            <div className="flex-1 flex flex-col">
              <div className="card overflow-hidden flex-1 flex flex-col">
                {/* Canvas */}
                <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 p-4">
                  <div className="relative" style={{ display: 'inline-block' }}>
                    <canvas
                      ref={canvasRef}
                      width={CANVAS_W}
                      height={CANVAS_H}
                      onMouseDown={startDraw}
                      onMouseMove={draw}
                      onMouseUp={endDraw}
                      onMouseLeave={endDraw}
                      onTouchStart={startDraw}
                      onTouchMove={draw}
                      onTouchEnd={endDraw}
                      className={`rounded-lg shadow-medium touch-none ${state.tool === 'eraser' ? 'cursor-cell' : 'cursor-crosshair'}`}
                      style={{ maxWidth: '100%', maxHeight: '100%', display: 'block' }}
                    />

                    {/* Side-by-side ghost reference */}
                    {ghostConfig?.mode === 'side' && ghostConfig?.src && (
                      <div className="absolute top-0 left-full ml-4 rounded-lg overflow-hidden shadow-medium"
                        style={{ width: CANVAS_W, height: CANVAS_H, opacity: (ghostConfig.opacity ?? 40) / 100 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={ghostConfig.src} alt="Reference" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Time Scrubber */}
                <TimeScrubber
                  frames={state.frames}
                  frameData={state.frameData}
                  fps={state.fps}
                  currentFrame={state.currentFrame}
                  onScrub={goToFrame}
                />
              </div>

              {/* Timeline */}
              <div className="card mt-3 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <button onClick={() => ed.setPlaying(!state.playing)}
                    className="btn btn-primary text-xs py-1.5 px-4" title="Space">
                    {state.playing ? '⏸ Pause' : '▶ Play'}
                  </button>

                  {/* FPS */}
                  <div className="flex gap-1">
                    {[8, 12, 24].map((f) => (
                      <button key={f} onClick={() => ed.setFps(f)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${state.fps === f ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200'}`}>
                        {f}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1" />

                  <button onClick={() => { captureFrame(); ed.addFrame(); }}
                    className="btn btn-secondary text-[10px] py-1 px-2.5" title="Add Frame (Alt+N)">
                    + Frame
                  </button>
                  <button onClick={() => ed.toggleKeyframe()}
                    className={`btn text-[10px] py-1 px-2.5 ${currentFrameObj?.keyframe ? 'btn-primary' : 'btn-secondary'}`}>
                    🔑 Key
                  </button>
                  <button onClick={() => setShowSettings((s) => !s)}
                    className="btn btn-secondary text-[10px] py-1 px-2.5">
                    ⚙️
                  </button>
                </div>

                {/* Frame strip */}
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {state.frames.map((frame, i) => (
                    <button
                      key={frame.id}
                      onClick={() => goToFrame(i)}
                      className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all ${i === state.currentFrame ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                      style={{ minWidth: 36 }}
                    >
                      <span className="text-[10px] font-black">{i + 1}</span>
                      {frame.keyframe && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side panel: color palette + tool panels */}
            <div className="w-44 flex-shrink-0 space-y-3 overflow-y-auto">
              {/* Color picker */}
              <div className="card p-3">
                <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Color</p>
                <input type="color" value={state.color}
                  onChange={(e) => ed.setColor(e.target.value)}
                  className="w-full h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5 mb-2" />
                <div className="grid grid-cols-4 gap-1">
                  {customPalette.map((c) => (
                    <button key={c} onClick={() => ed.setColor(c)}
                      className="w-full aspect-square rounded-lg border-2 transition-transform hover:scale-110"
                      style={{
                        background: c,
                        borderColor: state.color === c ? '#5B9CF6' : 'transparent',
                        boxShadow: state.color === c ? `0 0 0 2px #5B9CF6` : 'none',
                      }} />
                  ))}
                </div>
              </div>

              {/* Ghost reference panel */}
              {showGhost && (
                <GhostReferencePanel
                  onApply={(cfg) => { setGhostConfig(cfg); setShowGhost(false); }}
                  onClose={() => { setShowGhost(false); setGhostConfig(null); }}
                />
              )}

              {/* Tween assist panel */}
              {showTween && (
                <TweenAssist
                  frames={state.frames}
                  frameData={state.frameData}
                  currentFrame={state.currentFrame}
                  onGenerate={handleTweenGenerate}
                  onClose={() => setShowTween(false)}
                />
              )}

              {/* Project settings */}
              {showSettings && (
                <ProjectSettingsPanel
                  state={state}
                  ed={ed}
                  onClose={() => setShowSettings(false)}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showExport && (
        <ExportModal
          frames={state.frames}
          frameData={state.frameData}
          canvasFps={state.fps}
          onClose={() => setShowExport(false)}
        />
      )}
      {showProjects && user?.id && (
        <ProjectsModal
          userId={user.id}
          onLoad={(id) => { handleLoadProject(id); setShowProjects(false); }}
          onClose={() => setShowProjects(false)}
        />
      )}
      {showTemplates && (
        <TemplatesModal
          onLoad={handleLoadTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </AppShell>
  );
}
