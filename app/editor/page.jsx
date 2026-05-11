'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import AppShell            from '../../components/layout/AppShell';
import Spinner             from '../../components/ui/Spinner';
import ProjectsModal       from '../../components/ui/ProjectsModal';
import ExportModal         from '../../components/editor/ExportModal';
import ProjectSettingsPanel from '../../components/editor/ProjectSettingsPanel';
import { useAuth }         from '../../hooks/useAuth';
import { useEditor }       from '../../hooks/useEditor';
import { useApp }          from '../../lib/store';
import { saveProject, getProject, isDbConfigured } from '../../lib/db';
import { sanitize }        from '../../lib/utils';

const W = 580, H = 360;

// ─── Colour palette ──────────────────────────────────────────────────────────
const BASE_PALETTE = [
  '#000000','#FFFFFF','#FF5757','#FF8FAB','#FFB347','#FFD700',
  '#52C97C','#4ECDC4','#009AC7','#5B9CF6','#9B7FEA','#1E3A4A',
];

export default function EditorPage() {
  const { user, loading } = useAuth();
  const { gainXP }        = useApp();
  const ed                = useEditor();
  const { state }         = ed;

  const canvasRef   = useRef(null);
  const drawRef     = useRef(false);
  const lastPosRef  = useRef(null);
  const playRef     = useRef(null);
  const prevFrameId = useRef(null);
  const autoSaveRef = useRef(null);
  const lastSaveRef = useRef(0);

  const [renaming,     setRenaming]     = useState(null);
  const [renameVal,    setRenameVal]    = useState('');
  const [showProjects, setShowProjects] = useState(false);
  const [showExport,   setShowExport]   = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [saveMsg,      setSaveMsg]      = useState('');
  const [projNameEdit, setProjNameEdit] = useState(false);
  const [projNameVal,  setProjNameVal]  = useState('');
  // User's saved recent colours (persisted in localStorage)
  const [recentColors, setRecentColors] = useState(() => {
    try { return JSON.parse(localStorage.getItem('animotion_recent_colors') ?? '[]'); } catch { return []; }
  });

  const getCtx = useCallback(() => canvasRef.current?.getContext('2d'), []);

  // ── Capture current frame to state ────────────────────────────────────────
  const captureCurrentFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ed.saveFrameData(canvas.toDataURL('image/png'));
    prevFrameId.current = state.frames[state.currentFrame]?.id ?? null;
  }, [ed, state.frames, state.currentFrame]);

  // ── Render a frame onto canvas ─────────────────────────────────────────────
  const renderFrame = useCallback((frameId) => {
    const ctx = getCtx();
    if (!ctx) return;
    // Always clear to white first — ensures frame isolation
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);
    const dataUrl = state.frameData[frameId];
    if (dataUrl) {
      const img = new Image();
      img.onload = () => { ctx.drawImage(img, 0, 0); };
      img.src = dataUrl;
    }
    prevFrameId.current = frameId;
  }, [getCtx, state.frameData]);

  // Init canvas on mount
  useEffect(() => {
    const ctx = getCtx();
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);
    prevFrameId.current = state.frames[0]?.id ?? null;
  }, []); // eslint-disable-line

  // Frame switching — ALWAYS capture before switching, then render new
  useEffect(() => {
    const newId = state.frames[state.currentFrame]?.id;
    if (!newId) return;
    if (prevFrameId.current === newId) return; // same frame, no change needed

    // Save current frame FIRST before switching
    const canvas = canvasRef.current;
    if (canvas && prevFrameId.current !== null) {
      ed.saveFrameData(canvas.toDataURL('image/png'));
    }

    // Small delay to let state settle before rendering new frame
    const timer = setTimeout(() => renderFrame(newId), 30);
    return () => clearTimeout(timer);
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

  // Auto-save every 30s (no XP awarded — was exploitable)
  useEffect(() => {
    clearInterval(autoSaveRef.current);
    if (!user) return;
    autoSaveRef.current = setInterval(() => handleSave(true), 30_000);
    return () => clearInterval(autoSaveRef.current);
  }, [user, state.frames, state.layers, state.fps, state.projectName]); // eslint-disable-line

  // ── KEYBINDS ──────────────────────────────────────────────────────────────
  // Changed: Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z for undo/redo (standard across all apps)
  // Q = brush, E = eraser, Space = play
  useEffect(() => {
    const handle = (e) => {
      const tag = e.target.tagName;
      if (['INPUT','TEXTAREA'].includes(tag)) return;

      // ── Ctrl/Cmd shortcuts (standard undo/redo) ──
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && !e.shiftKey && e.key === 'z') { e.preventDefault(); ed.undo(); return; }
      if (ctrl && e.shiftKey  && e.key === 'z') { e.preventDefault(); ed.redo(); return; }
      if (ctrl && !e.shiftKey && e.key === 'y') { e.preventDefault(); ed.redo(); return; }
      if (ctrl && e.key === 's') { e.preventDefault(); handleSave(false); return; }

      // ── Alt shortcuts ──
      if (e.altKey) {
        e.preventDefault();
        const k = e.key.toLowerCase();
        if (k === 'e') { setShowExport(true); return; }
        if (k === 'n') { captureCurrentFrame(); ed.addFrame(); return; }
        if (k === 'o') { ed.setOnion(!state.onion); return; }
      }

      // ── Single key shortcuts (no modifier) ──
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'q' || e.key === 'Q') ed.setTool('brush');
      if (e.key === 'e' || e.key === 'E') ed.setTool('eraser');
      if (e.code === 'Space') { e.preventDefault(); ed.setPlaying(!state.playing); }
      if (e.key === 'ArrowRight') ed.setFrame(Math.min(state.frames.length-1, state.currentFrame+1));
      if (e.key === 'ArrowLeft')  ed.setFrame(Math.max(0, state.currentFrame-1));
      if ((e.key === 'Delete' || e.key === 'Backspace') && state.frames.length > 1) {
        captureCurrentFrame();
        ed.delFrame(state.currentFrame);
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [state.playing, state.currentFrame, state.frames.length, state.onion, ed, captureCurrentFrame]); // eslint-disable-line

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

  // ── Colour picking — saves to recent palette ──────────────────────────────
  const pickColor = useCallback((c) => {
    ed.setColor(c);
    // Add to recent colors, no duplicates, max 8
    setRecentColors(prev => {
      const next = [c, ...prev.filter(x => x !== c)].slice(0, 8);
      localStorage.setItem('animotion_recent_colors', JSON.stringify(next));
      return next;
    });
  }, [ed]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async (silent = false) => {
    if (!user) return;
    // Throttle: 5 seconds minimum between saves
    const now = Date.now();
    if (now - lastSaveRef.current < 5000 && silent) return;
    lastSaveRef.current = now;

    if (!silent) setSaving(true);
    captureCurrentFrame();
    await new Promise(r => setTimeout(r, 80));

    const project = await saveProject(user.id, {
      id: state.projectId, name: state.projectName || 'Untitled Project',
      frames: state.frames, layers: state.layers, fps: state.fps,
    });

    if (project) {
      ed.setProjectId(project.id);
      if (!silent) { setSaveMsg('Saved ✓'); setTimeout(() => setSaveMsg(''), 3000); }
    } else if (!silent) {
      setSaveMsg(isDbConfigured() ? 'Save failed' : 'DB not configured');
      setTimeout(() => setSaveMsg(''), 3000);
    }
    if (!silent) setSaving(false);
    // NOTE: No gainXP here — was exploitable by spam-clicking save
  };

  const handleLoad = async (projectId) => {
    if (!user) return;
    setShowProjects(false);
    const project = await getProject(user.id, projectId);
    if (!project) return;
    ed.loadProject(project);
    setTimeout(() => { const firstId = project.frames?.[0]?.id; if (firstId) renderFrame(firstId); }, 50);
  };

  const duplicateFrame = useCallback(() => {
    captureCurrentFrame();
    const prevData = state.frameData[state.frames[state.currentFrame]?.id];
    ed.addFrame();
    setTimeout(() => {
      if (!prevData) return;
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      const img = new Image();
      img.onload = () => { ctx.drawImage(img, 0, 0); captureCurrentFrame(); };
      img.src = prevData;
    }, 60);
  }, [captureCurrentFrame, ed, state.frameData, state.frames, state.currentFrame]);

  const dur = (state.frames.length / state.fps).toFixed(1);
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size={10}/></div>;

  return (
    <AppShell user={user}>
      <div className="page">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              {projNameEdit ? (
                <input autoFocus value={projNameVal} onChange={e => setProjNameVal(sanitize(e.target.value))}
                  onBlur={() => { ed.setProjectName(projNameVal||'Untitled Project'); setProjNameEdit(false); }}
                  onKeyDown={e => { if(e.key==='Enter'){ed.setProjectName(projNameVal||'Untitled Project');setProjNameEdit(false);} if(e.key==='Escape')setProjNameEdit(false); }}
                  className="font-black text-2xl bg-transparent border-b-2 outline-none" style={{ borderColor:'#009AC7' }} maxLength={60}/>
              ) : (
                <h1 className="font-black text-2xl cursor-pointer hover:text-[#009AC7] transition-colors"
                  onDoubleClick={() => { setProjNameVal(state.projectName); setProjNameEdit(true); }}
                  style={{ color:'#1E3A4A' }} title="Double-click to rename">
                  ✏️ {state.projectName}
                </h1>
              )}
              {state.projectId && <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background:'rgba(82,201,124,0.15)', color:'#52C97C' }}>Saved</span>}
            </div>
            <p className="text-[11px] font-semibold" style={{ color:'#9AB5C0' }}>
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-black" style={{ background:'rgba(0,154,199,0.1)', color:'#009AC7' }}>Space</kbd> Play ·
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-black mx-1" style={{ background:'rgba(0,154,199,0.1)', color:'#009AC7' }}>← →</kbd> Frames ·
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-black mr-1" style={{ background:'rgba(0,154,199,0.1)', color:'#009AC7' }}>Ctrl+Z</kbd> Undo ·
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-black mr-1" style={{ background:'rgba(0,154,199,0.1)', color:'#009AC7' }}>Ctrl+Y</kbd> Redo ·
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-black mr-1" style={{ background:'rgba(0,154,199,0.1)', color:'#009AC7' }}>Q</kbd> Brush ·
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-black" style={{ background:'rgba(0,154,199,0.1)', color:'#009AC7' }}>E</kbd> Eraser
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0 items-center">
            {saveMsg && <span className="text-xs font-black" style={{ color:saveMsg.includes('fail')?'#FF5757':'#52C97C' }}>{saveMsg}</span>}
            <button onClick={() => setShowSettings(!showSettings)} className="wii-btn wii-btn-ghost text-xs py-2 px-3">⚙️</button>
            <button onClick={() => setShowProjects(true)} className="wii-btn wii-btn-ghost text-xs py-2 px-3">📁 Projects</button>
            <button onClick={() => handleSave(false)} disabled={saving} className="wii-btn wii-btn-ghost text-xs py-2 px-3">
              {saving ? '…' : '💾 Save (Ctrl+S)'}
            </button>
          </div>
        </div>

        {showSettings && <div className="mb-4"><ProjectSettingsPanel state={state} ed={ed} onClose={() => setShowSettings(false)}/></div>}

        <div className="grid gap-3" style={{ gridTemplateColumns:'220px 1fr 200px' }}>

          {/* ── Left: Tools + Palette ─────────────────────────────────── */}
          <div className="space-y-3">
            {/* Tool selector */}
            <div className="wii-card p-4">
              <p className="wii-section-label mb-3">TOOLS</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id:'brush',  icon:'🖊️', label:'Brush', key:'Q' },
                  { id:'eraser', icon:'⬜', label:'Eraser', key:'E' },
                ].map(t => (
                  <button key={t.id} onClick={() => ed.setTool(t.id)}
                    className="flex flex-col items-center gap-1 p-3 rounded-2xl transition-all"
                    style={{
                      background: state.tool===t.id ? 'linear-gradient(135deg,#009AC7,#007AAA)' : 'rgba(0,154,199,0.06)',
                      border: `1.5px solid ${state.tool===t.id?'#009AC7':'rgba(0,154,199,0.15)'}`,
                      color: state.tool===t.id ? 'white' : '#5A7A8A',
                    }}>
                    <span className="text-xl">{t.icon}</span>
                    <span className="text-[10px] font-black">{t.label}</span>
                    <span className="text-[9px] font-bold opacity-70">[{t.key}]</span>
                  </button>
                ))}
              </div>

              {/* Brush size */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="wii-section-label">SIZE</p>
                  <span className="text-[12px] font-black" style={{ color:'#009AC7' }}>{state.size}px</span>
                </div>
                <input type="range" min={1} max={30} value={state.size}
                  onChange={e => ed.setSize(+e.target.value)}
                  className="w-full accent-[#009AC7]"/>
                {/* Size preview dot */}
                <div className="flex justify-center mt-2">
                  <div className="rounded-full" style={{ width:Math.max(4,state.size*0.8), height:Math.max(4,state.size*0.8), background:state.color, transition:'all 0.15s' }}/>
                </div>
              </div>
            </div>

            {/* Colour palette */}
            <div className="wii-card p-4">
              <p className="wii-section-label mb-3">COLOUR</p>

              {/* Current colour + picker */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl border-2 flex-shrink-0"
                  style={{ background:state.color, borderColor:'rgba(0,154,199,0.3)' }}/>
                <div className="flex-1">
                  <p className="text-[10px] font-black" style={{ color:'#9AB5C0' }}>Current</p>
                  <code className="text-[11px] font-black" style={{ color:'#1E3A4A' }}>{state.color}</code>
                </div>
                <label className="cursor-pointer">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all hover:scale-110"
                    style={{ background:'rgba(0,154,199,0.1)', border:'1px solid rgba(0,154,199,0.2)' }} title="Custom colour">
                    🎨
                  </div>
                  <input type="color" value={state.color} onChange={e => pickColor(e.target.value)} className="sr-only"/>
                </label>
              </div>

              {/* Base palette */}
              <p className="text-[9px] font-black uppercase tracking-wider mb-2" style={{ color:'#9AB5C0' }}>Palette</p>
              <div className="grid grid-cols-6 gap-1.5 mb-3">
                {BASE_PALETTE.map(c => (
                  <button key={c} onClick={() => pickColor(c)}
                    className="rounded-lg transition-all hover:scale-125"
                    style={{ width:28, height:28, background:c, border:state.color===c?'3px solid #009AC7':'2px solid rgba(0,0,0,0.08)', transform:state.color===c?'scale(1.2)':'scale(1)' }}
                    title={c}/>
                ))}
              </div>

              {/* Recent colours */}
              {recentColors.length > 0 && (
                <>
                  <p className="text-[9px] font-black uppercase tracking-wider mb-2" style={{ color:'#9AB5C0' }}>Recent</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {recentColors.map((c,i) => (
                      <button key={i} onClick={() => pickColor(c)}
                        className="rounded-lg transition-all hover:scale-125"
                        style={{ width:24, height:24, background:c, border:state.color===c?'2px solid #009AC7':'1.5px solid rgba(0,0,0,0.1)', transform:state.color===c?'scale(1.2)':'scale(1)' }}
                        title={c}/>
                    ))}
                    <button onClick={() => { setRecentColors([]); localStorage.removeItem('animotion_recent_colors'); }}
                      className="text-[9px] font-black px-1.5 rounded" style={{ color:'#FF5757', background:'rgba(255,87,87,0.08)' }}>
                      clear
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Canvas area ───────────────────────────────────────────── */}
          <div className="space-y-3">
            {/* Controls bar */}
            <div className="wii-card px-4 py-2.5 flex items-center gap-3 flex-wrap">
              <button onClick={() => ed.setPlaying(!state.playing)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                style={{ background:state.playing?'#FF8FAB':'#009AC7' }}>
                {state.playing ? '⏸' : '▶'}
              </button>
              <button onClick={() => ed.setFrame(0)} className="wii-btn wii-btn-ghost text-xs px-2 py-1.5" title="Go to start">⏮</button>
              <button onClick={clearCanvas} className="wii-btn wii-btn-ghost text-xs">🗑 Clear</button>
              <button onClick={() => { captureCurrentFrame(); ed.addFrame(); }} className="wii-btn wii-btn-ghost text-xs">+ Frame</button>
              <button onClick={duplicateFrame} className="wii-btn wii-btn-ghost text-xs">⧉ Dupe</button>
              <div className="ml-auto flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1.5 font-bold" style={{ color:'#9AB5C0' }}>
                  Onion
                  <button onClick={() => ed.setOnion(!state.onion)}
                    className="relative w-9 h-5 rounded-full transition-colors"
                    style={{ background:state.onion?'#009AC7':'rgba(0,154,199,0.15)' }}>
                    <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ left:state.onion?'18px':'2px' }}/>
                  </button>
                </label>
                <label className="flex items-center gap-1.5 font-bold" style={{ color:'#9AB5C0' }}>
                  FPS:{state.fps}
                  <input type="range" min={1} max={60} value={state.fps} onChange={e => ed.setFps(+e.target.value)} className="w-16 accent-[#009AC7]"/>
                </label>
                <span className="font-black" style={{ color:'#9AB5C0' }}>{state.currentFrame+1}/{state.frames.length}</span>
              </div>
            </div>

            {/* Canvas */}
            <div className="wii-card p-4 flex justify-center" style={{ background:'rgba(255,255,255,0.95)' }}>
              <div className="relative rounded-xl overflow-hidden shadow-lg">
                <canvas ref={canvasRef} width={W} height={H}
                  style={{ display:'block', width:W, height:H, cursor:state.tool==='eraser'?'cell':'crosshair' }}
                  onMouseDown={startDraw} onMouseMove={drawStroke} onMouseUp={endDraw} onMouseLeave={endDraw}/>
                <div className="absolute top-2 right-2 text-[10px] font-black px-2 py-1 rounded pointer-events-none"
                  style={{ background:'rgba(0,0,0,0.5)', color:'white' }}>
                  {state.currentFrame+1}/{state.frames.length}
                </div>
                {state.playing && (
                  <div className="absolute top-2 left-2 text-[9px] font-black px-2 py-1 rounded flex items-center gap-1 pointer-events-none"
                    style={{ background:'rgba(255,87,87,0.8)', color:'white' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-white" style={{ animation:'wii-float 0.5s ease-in-out infinite' }}/> PLAYING
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="wii-card px-4 py-3">
              <p className="wii-section-label mb-2">Timeline — {dur}s · {state.frames.length} frames · {state.fps}fps</p>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {state.frames.map((frame, i) => (
                  <div key={frame.id} className="flex flex-col items-center gap-1 flex-shrink-0">
                    <button onClick={() => ed.setFrame(i)}
                      className="w-11 h-9 rounded-xl flex flex-col items-center justify-center transition-all"
                      style={{
                        background: i===state.currentFrame ? 'linear-gradient(135deg,#009AC7,#007AAA)' : frame.keyframe ? 'rgba(255,179,71,0.15)' : 'rgba(0,154,199,0.06)',
                        border: i===state.currentFrame ? '2px solid #009AC7' : frame.keyframe ? '2px solid rgba(255,179,71,0.6)' : '1.5px solid rgba(0,154,199,0.15)',
                        color: i===state.currentFrame ? 'white' : '#5A7A8A',
                      }}>
                      <span className="text-xs font-black">{i+1}</span>
                      {frame.keyframe && <div className="w-1.5 h-1.5 rounded-full" style={{ background:i===state.currentFrame?'rgba(255,255,255,0.8)':'#FFB347' }}/>}
                    </button>
                    {state.frames.length > 1 && (
                      <button onClick={() => { captureCurrentFrame(); ed.delFrame(i); }}
                        className="text-[9px] transition-colors" style={{ color:'rgba(255,87,87,0.4)' }}
                        onMouseEnter={e => e.target.style.color='#FF5757'}
                        onMouseLeave={e => e.target.style.color='rgba(255,87,87,0.4)'}>✕</button>
                    )}
                  </div>
                ))}
                <button onClick={() => { captureCurrentFrame(); ed.addFrame(); }}
                  className="w-11 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-all hover:scale-105"
                  style={{ background:'rgba(0,154,199,0.06)', border:'1.5px dashed rgba(0,154,199,0.3)', color:'#009AC7' }}>+</button>
              </div>
            </div>

            {/* Export */}
            <button onClick={() => setShowExport(true)}
              className="w-full wii-btn wii-btn-primary text-sm"
              style={{ background:'linear-gradient(135deg,#52C97C,#009AC7)', boxShadow:'0 4px 16px rgba(0,154,199,0.3)' }}>
              🎬 Export Animation (Alt+E)
            </button>
          </div>

          {/* ── Right: Layers + Info ──────────────────────────────────── */}
          <div className="space-y-3">
            <div className="wii-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black text-[13px]" style={{ color:'#1E3A4A' }}>Layers</h3>
                <button onClick={() => ed.addLayer()} className="font-black text-xl" style={{ color:'#009AC7' }}>+</button>
              </div>
              <div className="space-y-1.5">
                {state.layers.map((layer, i) => (
                  <div key={layer.id} onClick={() => ed.setLayer(i)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all"
                    style={{ background:i===state.activeLayer?'rgba(0,154,199,0.1)':'rgba(255,255,255,0.6)', borderColor:i===state.activeLayer?'#009AC7':'rgba(0,154,199,0.15)', color:i===state.activeLayer?'#009AC7':'#5A7A8A' }}>
                    <button onClick={e => { e.stopPropagation(); ed.toggleLayerVis(i); }} className="text-sm flex-shrink-0" style={{ opacity:layer.visible?1:0.3 }}>👁</button>
                    {renaming === i ? (
                      <input autoFocus value={renameVal}
                        onChange={e => setRenameVal(e.target.value)}
                        onBlur={() => { ed.renameLayer(i,renameVal); setRenaming(null); }}
                        onKeyDown={e => { if(e.key==='Enter'){ed.renameLayer(i,renameVal);setRenaming(null);} if(e.key==='Escape')setRenaming(null); }}
                        onClick={e => e.stopPropagation()}
                        className="flex-1 text-xs font-bold bg-transparent outline-none border-b" style={{ borderColor:'#009AC7' }} maxLength={40}/>
                    ) : (
                      <span onDoubleClick={e => { e.stopPropagation(); setRenaming(i); setRenameVal(layer.name); }}
                        className="flex-1 text-xs font-bold truncate" title="Double-click to rename">{layer.name}</span>
                    )}
                    {state.layers.length > 1 && (
                      <button onClick={e => { e.stopPropagation(); ed.delLayer(i); }}
                        className="text-[10px] flex-shrink-0 transition-colors" style={{ color:'rgba(255,87,87,0.4)' }}
                        onMouseEnter={e => e.target.style.color='#FF5757'}
                        onMouseLeave={e => e.target.style.color='rgba(255,87,87,0.4)'}>✕</button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[10px] mt-2 font-semibold" style={{ color:'#9AB5C0' }}>Double-click layer to rename</p>
            </div>

            <div className="wii-card p-4">
              <h3 className="font-black text-xs mb-3" style={{ color:'#1E3A4A' }}>Shortcuts</h3>
              {[
                ['Ctrl+Z',  'Undo'],
                ['Ctrl+Y',  'Redo'],
                ['Ctrl+S',  'Save'],
                ['Alt+E',   'Export'],
                ['Q',       'Brush tool'],
                ['E',       'Eraser tool'],
                ['Space',   'Play/Pause'],
                ['← →',    'Navigate frames'],
                ['Del',     'Delete frame'],
              ].map(([k,d]) => (
                <div key={k} className="flex items-center justify-between mb-1.5">
                  <kbd className="px-1.5 py-0.5 rounded text-[10px] font-black" style={{ background:'rgba(0,154,199,0.1)', color:'#009AC7' }}>{k}</kbd>
                  <span className="text-[10px] font-semibold" style={{ color:'#9AB5C0' }}>{d}</span>
                </div>
              ))}
            </div>

            <div className="wii-card p-4">
              <h3 className="font-black text-xs mb-3" style={{ color:'#1E3A4A' }}>Canvas Info</h3>
              {[['Size',`${W}×${H}px`],['Frames',state.frames.length],['Layers',state.layers.length],['FPS',state.fps],['Duration',`${dur}s`]].map(([k,v]) => (
                <div key={k} className="flex justify-between mb-1.5">
                  <span className="text-[11px] font-bold" style={{ color:'#9AB5C0' }}>{k}</span>
                  <span className="text-[11px] font-black" style={{ color:'#1E3A4A' }}>{v}</span>
                </div>
              ))}
            </div>

            <button onClick={() => ed.newProject()} className="wii-btn wii-btn-ghost w-full justify-center text-xs">+ New Project</button>
          </div>
        </div>
      </div>

      {showProjects && user && <ProjectsModal userId={user.id} onLoad={handleLoad} onClose={() => setShowProjects(false)}/>}
      {showExport && <ExportModal frames={state.frames} frameData={state.frameData} canvasFps={state.fps} onClose={() => setShowExport(false)}/>}
    </AppShell>
  );
}
