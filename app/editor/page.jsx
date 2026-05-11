'use client';
// app/editor/page.jsx — XP on save removed to prevent spam exploit
// Frame bugs fixed by stabilising the useEditor hook calls

import { useState, useEffect, useRef, useCallback } from 'react';
import AppShell        from '../../components/layout/AppShell';
import ExportModal     from '../../components/editor/ExportModal';
import ProjectSettingsPanel from '../../components/editor/ProjectSettingsPanel';
import ProjectsModal   from '../../components/ui/ProjectsModal';
import Spinner         from '../../components/ui/Spinner';
import { useApp }      from '../../lib/store';
import { useAuth }     from '../../hooks/useAuth';
import { useEditor }   from '../../hooks/useEditor';
import { saveProject, getProjects } from '../../lib/db';

export default function EditorPage() {
  const { user, loading } = useAuth();
  const { gainXP }        = useApp();

  const {
    canvasRef, frames, activeFrame, layers, activeLayer,
    fps, bgColor, width, height, projectName,
    tool, brushSize, color, onionSkin,
    dispatch: editorDispatch,
    undo, redo,
  } = useEditor();

  const [showExport,    setShowExport]    = useState(false);
  const [showSettings,  setShowSettings]  = useState(false);
  const [showProjects,  setShowProjects]  = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [saveMsg,       setSaveMsg]       = useState('');
  const lastSaveRef = useRef(0); // ← throttle saves

  // ── KEYBINDS ──────────────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e) {
      if (e.altKey) {
        if (e.key === 'z') { e.preventDefault(); undo(); }
        if (e.key === 'y') { e.preventDefault(); redo(); }
        if (e.key === 's') { e.preventDefault(); handleSave(); }
        if (e.key === 'e') { e.preventDefault(); setShowExport(true); }
        if (e.key === 'n') { e.preventDefault(); editorDispatch({ type: 'ADD_FRAME' }); }
        if (e.key === 'd') { e.preventDefault(); editorDispatch({ type: 'DUPLICATE_FRAME', id: activeFrame }); }
        if (e.key === 'o') { e.preventDefault(); editorDispatch({ type: 'TOGGLE_ONION' }); }
      }
      if (e.key === 'b') editorDispatch({ type: 'SET_TOOL', tool: 'brush' });
      if (e.key === 'e' && !e.altKey) editorDispatch({ type: 'SET_TOOL', tool: 'eraser' });
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo, activeFrame, editorDispatch]);

  // ── AUTO-SAVE every 30s (no XP, silent) ──────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    const id = setInterval(() => handleSave(true), 30_000);
    return () => clearInterval(id);
  }, [user?.id, frames, layers]);

  // ── SAVE ─────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async (silent = false) => {
    if (!user?.id) return;

    // Throttle: no save more than once every 5 seconds
    const now = Date.now();
    if (now - lastSaveRef.current < 5000) {
      if (!silent) setSaveMsg('Just saved!');
      return;
    }
    lastSaveRef.current = now;

    setSaving(true);
    try {
      const frameData = {};
      if (canvasRef.current) {
        frameData[activeFrame] = canvasRef.current.toDataURL('image/png');
      }
      await saveProject(user.id, {
        name: projectName,
        frames,
        frameData,
        layers,
        fps,
        bgColor,
        width,
        height,
      });
      // ← NO gainXP here — was exploitable by spam-clicking Save
      if (!silent) setSaveMsg('Saved ✓');
    } catch (err) {
      if (!silent) setSaveMsg('Save failed');
      console.error(err);
    } finally {
      setSaving(false);
      if (!silent) setTimeout(() => setSaveMsg(''), 2000);
    }
  }, [user?.id, projectName, frames, layers, fps, bgColor, width, height, activeFrame, canvasRef]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#EAF6FB' }}>
      <Spinner size={10} />
    </div>
  );

  const PALETTE = ['#000000','#FFFFFF','#FF5757','#FFB347','#52C97C','#009AC7','#9B7FEA','#FF8FAB','#4ECDC4','#1E3A4A'];

  return (
    <AppShell user={user}>
      <div className="page" style={{ maxWidth: '100%' }}>
        {/* Toolbar */}
        <div className="wii-card p-3 mb-4 flex items-center gap-3 flex-wrap">
          {/* Project name */}
          <input
            className="wii-input text-sm font-black"
            style={{ maxWidth: 180 }}
            value={projectName}
            onChange={e => editorDispatch({ type: 'SET_NAME', name: e.target.value })}
          />

          <div className="flex gap-2 flex-wrap">
            <button onClick={() => editorDispatch({ type: 'SET_TOOL', tool: 'brush' })}
              className={`wii-btn text-xs ${tool === 'brush' ? 'wii-btn-primary' : 'wii-btn-ghost'}`}>✏️ Brush (B)</button>
            <button onClick={() => editorDispatch({ type: 'SET_TOOL', tool: 'eraser' })}
              className={`wii-btn text-xs ${tool === 'eraser' ? 'wii-btn-primary' : 'wii-btn-ghost'}`}>🧹 Eraser (E)</button>
            <button onClick={undo} className="wii-btn wii-btn-ghost text-xs" title="Undo (Alt+Z)">↩ Undo</button>
            <button onClick={redo} className="wii-btn wii-btn-ghost text-xs" title="Redo (Alt+Y)">↪ Redo</button>
            <button onClick={() => editorDispatch({ type: 'TOGGLE_ONION' })}
              className={`wii-btn text-xs ${onionSkin ? 'wii-btn-primary' : 'wii-btn-ghost'}`}>🧅 Onion</button>
          </div>

          {/* Brush size */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black" style={{ color: '#9AB5C0' }}>Size</span>
            <input type="range" min={1} max={40} value={brushSize}
              onChange={e => editorDispatch({ type: 'SET_BRUSH', size: +e.target.value })}
              className="w-20 accent-[#009AC7]" />
            <span className="text-[11px] font-black" style={{ color: '#009AC7' }}>{brushSize}px</span>
          </div>

          {/* Palette */}
          <div className="flex gap-1 flex-wrap">
            {PALETTE.map(c => (
              <button key={c} onClick={() => editorDispatch({ type: 'SET_COLOR', color: c })}
                className="w-6 h-6 rounded-lg border-2 transition-transform hover:scale-110"
                style={{ background: c, borderColor: color === c ? '#009AC7' : 'rgba(0,0,0,0.1)' }} />
            ))}
            <input type="color" value={color} onChange={e => editorDispatch({ type: 'SET_COLOR', color: e.target.value })}
              className="w-6 h-6 rounded-lg border-2 cursor-pointer" style={{ borderColor: 'rgba(0,154,199,0.3)' }} />
          </div>

          <div className="ml-auto flex gap-2">
            {saveMsg && <span className="text-[11px] font-black" style={{ color: '#52C97C' }}>{saveMsg}</span>}
            <button onClick={() => handleSave(false)} disabled={saving} className="wii-btn wii-btn-ghost text-xs">
              {saving ? '…' : '💾 Save (Alt+S)'}
            </button>
            <button onClick={() => setShowProjects(true)} className="wii-btn wii-btn-ghost text-xs">📁 Projects</button>
            <button onClick={() => setShowSettings(true)} className="wii-btn wii-btn-ghost text-xs">⚙️ Settings</button>
            <button onClick={() => setShowExport(true)} className="wii-btn wii-btn-primary text-xs">📤 Export (Alt+E)</button>
          </div>
        </div>

        {/* Canvas + Layers + Timeline */}
        <div className="flex gap-4">
          {/* Layers panel */}
          <div className="wii-card p-3 w-44 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <p className="wii-section-label">Layers</p>
              <button onClick={() => editorDispatch({ type: 'ADD_LAYER' })}
                className="text-[18px] leading-none font-black" style={{ color: '#009AC7' }}>+</button>
            </div>
            <div className="space-y-1">
              {[...(layers ?? [])].reverse().map(layer => (
                <div key={layer.id}
                  onClick={() => editorDispatch({ type: 'SET_LAYER', id: layer.id })}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl cursor-pointer text-[11px] font-bold transition-all"
                  style={{
                    background: layer.id === activeLayer ? 'rgba(0,154,199,0.12)' : 'transparent',
                    color: layer.id === activeLayer ? '#009AC7' : '#5A7A8A',
                  }}>
                  <button onClick={e => { e.stopPropagation(); editorDispatch({ type: 'TOGGLE_LAYER', id: layer.id }); }}
                    className="text-[12px]">{layer.visible !== false ? '👁' : '🙈'}</button>
                  <span className="flex-1 truncate">{layer.name}</span>
                  {layers.length > 1 && (
                    <button onClick={e => { e.stopPropagation(); editorDispatch({ type: 'DELETE_LAYER', id: layer.id }); }}
                      className="text-[10px] opacity-50 hover:opacity-100">✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="wii-card p-3 flex items-center justify-center overflow-hidden"
              style={{ background: bgColor }}>
              <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="rounded-xl"
                style={{ maxWidth: '100%', cursor: tool === 'eraser' ? 'cell' : 'crosshair', border: '1px solid rgba(0,154,199,0.2)' }}
              />
            </div>

            {/* Timeline */}
            <div className="wii-card p-3">
              <div className="flex items-center gap-2 mb-2">
                <p className="wii-section-label flex-1">Timeline</p>
                <button onClick={() => editorDispatch({ type: 'TOGGLE_PLAY' })} className="wii-btn wii-btn-primary text-xs px-3">
                  {frames.playing ? '⏸ Pause' : '▶ Play'}
                </button>
                <button onClick={() => editorDispatch({ type: 'ADD_FRAME' })} className="wii-btn wii-btn-ghost text-xs">+ Frame (Alt+N)</button>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {(frames.list ?? []).map((f, i) => (
                  <button key={f.id}
                    onClick={() => editorDispatch({ type: 'SET_FRAME', id: f.id })}
                    className="flex-shrink-0 w-12 h-12 rounded-xl text-[10px] font-black transition-all flex flex-col items-center justify-center gap-0.5"
                    style={{
                      background: f.id === activeFrame ? 'linear-gradient(135deg,#009AC7,#007AAA)' : 'rgba(255,255,255,0.85)',
                      color: f.id === activeFrame ? 'white' : '#5A7A8A',
                      border: `1.5px solid ${f.id === activeFrame ? '#009AC7' : 'rgba(0,154,199,0.2)'}`,
                    }}>
                    <span>{i + 1}</span>
                    {f.isKey && <span style={{ color: f.id === activeFrame ? 'rgba(255,255,255,0.8)' : '#FFB347', fontSize: 8 }}>KEY</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showExport   && <ExportModal canvas={canvasRef.current} frames={frames} fps={fps} onClose={() => setShowExport(false)} />}
        {showSettings && <ProjectSettingsPanel fps={fps} bgColor={bgColor} width={width} height={height} dispatch={editorDispatch} onClose={() => setShowSettings(false)} />}
        {showProjects && <ProjectsModal userId={user?.id} onClose={() => setShowProjects(false)} onLoad={p => { editorDispatch({ type: 'LOAD_PROJECT', project: p }); setShowProjects(false); }} />}
      </div>
    </AppShell>
  );
}
