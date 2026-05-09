'use client';

import { useReducer, useCallback } from 'react';

const MAX_FRAMES   = 48;
const HISTORY_SIZE = 20;

const INIT = {
  tool:   'brush',
  color:  '#5B9CF6',
  size:   6,
  frames: [
    { id: 1, keyframe: true  },
    { id: 2, keyframe: false },
    { id: 3, keyframe: false },
  ],
  // frameData: maps frame id → base64 PNG data URL (captured on frame switch)
  frameData:    {},
  currentFrame: 0,
  playing:      false,
  fps:          12,
  onion:        true,
  layers: [
    { id: 1, name: 'Layer 1', visible: true },
    { id: 2, name: 'Layer 2', visible: true },
  ],
  activeLayer: 0,
  history: [],
  future:  [],
  // Project metadata
  projectId:   null,
  projectName: 'Untitled Project',
};

function editorReducer(s, a) {
  switch (a.type) {
    case 'SET_TOOL':    return { ...s, tool:  a.v };
    case 'SET_COLOR':   return { ...s, color: a.v };
    case 'SET_SIZE':    return { ...s, size:  a.v };
    case 'SET_FPS':     return { ...s, fps:   a.v };
    case 'SET_ONION':   return { ...s, onion: a.v };
    case 'SET_PLAYING': return { ...s, playing: a.v };
    case 'SET_FRAME':
      return { ...s, currentFrame: Math.max(0, Math.min(a.v, s.frames.length - 1)) };

    // ── Frame pixel data ─────────────────────────────────────────────────
    case 'SAVE_FRAME_DATA': {
      const frameId = s.frames[s.currentFrame]?.id;
      if (!frameId || !a.dataUrl) return s;
      return { ...s, frameData: { ...s.frameData, [frameId]: a.dataUrl } };
    }
    case 'SET_FRAME_DATA':  // bulk set (used when loading a project)
      return { ...s, frameData: a.data ?? {} };

    // ── Frame management ─────────────────────────────────────────────────
    case 'ADD_FRAME': {
      if (s.frames.length >= MAX_FRAMES) return s;
      const next = [...s.frames];
      next.splice(s.currentFrame + 1, 0, { id: Date.now(), keyframe: false });
      return { ...s, frames: next, currentFrame: s.currentFrame + 1 };
    }
    case 'DEL_FRAME': {
      if (s.frames.length <= 1) return s;
      const delId  = s.frames[a.idx]?.id;
      const frames = s.frames.filter((_, i) => i !== a.idx);
      const fd     = { ...s.frameData };
      if (delId) delete fd[delId];
      return { ...s, frames, frameData: fd, currentFrame: Math.min(s.currentFrame, frames.length - 1) };
    }
    case 'TOGGLE_KEYFRAME':
      return { ...s, frames: s.frames.map((f, i) => i === s.currentFrame ? { ...f, keyframe: !f.keyframe } : f) };

    // ── Undo / Redo ──────────────────────────────────────────────────────
    case 'PUSH_HISTORY':
      return {
        ...s,
        history: [...s.history.slice(-HISTORY_SIZE), { frames: [...s.frames], frameData: { ...s.frameData } }],
        future:  [],
      };
    case 'UNDO': {
      if (!s.history.length) return s;
      const prev = s.history[s.history.length - 1];
      return {
        ...s,
        frames:    prev.frames,
        frameData: prev.frameData,
        history:   s.history.slice(0, -1),
        future:    [{ frames: [...s.frames], frameData: { ...s.frameData } }, ...s.future],
        currentFrame: Math.min(s.currentFrame, prev.frames.length - 1),
      };
    }
    case 'REDO': {
      if (!s.future.length) return s;
      const nxt = s.future[0];
      return {
        ...s,
        frames:    nxt.frames,
        frameData: nxt.frameData,
        history:   [...s.history, { frames: [...s.frames], frameData: { ...s.frameData } }],
        future:    s.future.slice(1),
        currentFrame: Math.min(s.currentFrame, nxt.frames.length - 1),
      };
    }

    // ── Layers ───────────────────────────────────────────────────────────
    case 'ADD_LAYER':
      return {
        ...s,
        layers: [...s.layers, { id: Date.now(), name: `Layer ${s.layers.length + 1}`, visible: true }],
        activeLayer: s.layers.length,
      };
    case 'SET_LAYER':          return { ...s, activeLayer: a.idx };
    case 'TOGGLE_LAYER_VIS':
      return { ...s, layers: s.layers.map((l, i) => i === a.idx ? { ...l, visible: !l.visible } : l) };
    case 'RENAME_LAYER':
      return { ...s, layers: s.layers.map((l, i) => i === a.idx ? { ...l, name: String(a.name).slice(0, 40) } : l) };
    case 'DEL_LAYER':
      if (s.layers.length <= 1) return s;
      return { ...s, layers: s.layers.filter((_, i) => i !== a.idx), activeLayer: Math.min(s.activeLayer, s.layers.length - 2) };

    // ── Project metadata ─────────────────────────────────────────────────
    case 'SET_PROJECT_ID':   return { ...s, projectId: a.id };
    case 'SET_PROJECT_NAME': return { ...s, projectName: a.name };

    // ── Load full project ────────────────────────────────────────────────
    case 'LOAD_PROJECT':
      return {
        ...s,
        frames:       a.project.frames   || INIT.frames,
        frameData:    a.project.frameData || {},
        layers:       a.project.layers   || INIT.layers,
        fps:          a.project.fps      || 12,
        projectId:    a.project.id       || null,
        projectName:  a.project.name     || 'Untitled Project',
        currentFrame: 0,
        playing:      false,
        history:      [],
        future:       [],
      };

    // ── Clear canvas (new project) ───────────────────────────────────────
    case 'NEW_PROJECT':
      return { ...INIT, dark: s.dark, sound: s.sound }; // keep prefs

    default: return s;
  }
}

export function useEditor() {
  const [state, dispatch] = useReducer(editorReducer, INIT);

  const setTool         = useCallback((v)   => dispatch({ type: 'SET_TOOL',         v }), []);
  const setColor        = useCallback((v)   => dispatch({ type: 'SET_COLOR',        v }), []);
  const setSize         = useCallback((v)   => dispatch({ type: 'SET_SIZE',         v }), []);
  const setFps          = useCallback((v)   => dispatch({ type: 'SET_FPS',          v }), []);
  const setOnion        = useCallback((v)   => dispatch({ type: 'SET_ONION',        v }), []);
  const setPlaying      = useCallback((v)   => dispatch({ type: 'SET_PLAYING',      v }), []);
  const setFrame        = useCallback((v)   => dispatch({ type: 'SET_FRAME',        v }), []);
  const addFrame        = useCallback(()    => dispatch({ type: 'ADD_FRAME'              }), []);
  const delFrame        = useCallback((idx) => dispatch({ type: 'DEL_FRAME',       idx }), []);
  const toggleKeyframe  = useCallback(()    => dispatch({ type: 'TOGGLE_KEYFRAME'       }), []);
  const pushHistory     = useCallback(()    => dispatch({ type: 'PUSH_HISTORY'          }), []);
  const undo            = useCallback(()    => dispatch({ type: 'UNDO'                  }), []);
  const redo            = useCallback(()    => dispatch({ type: 'REDO'                  }), []);
  const addLayer        = useCallback(()    => dispatch({ type: 'ADD_LAYER'             }), []);
  const setLayer        = useCallback((idx) => dispatch({ type: 'SET_LAYER',       idx }), []);
  const toggleLayerVis  = useCallback((idx) => dispatch({ type: 'TOGGLE_LAYER_VIS',idx }), []);
  const renameLayer     = useCallback((idx, name) => dispatch({ type: 'RENAME_LAYER', idx, name }), []);
  const delLayer        = useCallback((idx) => dispatch({ type: 'DEL_LAYER',       idx }), []);
  const saveFrameData   = useCallback((dataUrl) => dispatch({ type: 'SAVE_FRAME_DATA', dataUrl }), []);
  const setFrameData    = useCallback((data)    => dispatch({ type: 'SET_FRAME_DATA',  data   }), []);
  const setProjectId    = useCallback((id)      => dispatch({ type: 'SET_PROJECT_ID',  id     }), []);
  const setProjectName  = useCallback((name)    => dispatch({ type: 'SET_PROJECT_NAME',name   }), []);
  const loadProject     = useCallback((project) => dispatch({ type: 'LOAD_PROJECT',   project }), []);
  const newProject      = useCallback(()        => dispatch({ type: 'NEW_PROJECT'             }), []);

  return {
    state,
    setTool, setColor, setSize, setFps, setOnion, setPlaying, setFrame,
    addFrame, delFrame, toggleKeyframe,
    pushHistory, undo, redo,
    addLayer, setLayer, toggleLayerVis, renameLayer, delLayer,
    saveFrameData, setFrameData,
    setProjectId, setProjectName, loadProject, newProject,
  };
}
