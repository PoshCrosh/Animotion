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

    case 'ADD_FRAME': {
      if (s.frames.length >= MAX_FRAMES) return s;
      const next = [...s.frames];
      next.splice(s.currentFrame + 1, 0, { id: Date.now(), keyframe: false });
      return { ...s, frames: next, currentFrame: s.currentFrame + 1 };
    }
    case 'DEL_FRAME': {
      if (s.frames.length <= 1) return s;
      const f = s.frames.filter((_, i) => i !== a.idx);
      return { ...s, frames: f, currentFrame: Math.min(s.currentFrame, f.length - 1) };
    }
    case 'TOGGLE_KEYFRAME':
      return { ...s, frames: s.frames.map((f, i) => i === s.currentFrame ? { ...f, keyframe: !f.keyframe } : f) };

    case 'PUSH_HISTORY':
      return { ...s, history: [...s.history.slice(-HISTORY_SIZE), [...s.frames]], future: [] };
    case 'UNDO': {
      if (!s.history.length) return s;
      const prev = s.history[s.history.length - 1];
      return { ...s, frames: prev, history: s.history.slice(0, -1), future: [[...s.frames], ...s.future], currentFrame: Math.min(s.currentFrame, prev.length - 1) };
    }
    case 'REDO': {
      if (!s.future.length) return s;
      const nxt = s.future[0];
      return { ...s, frames: nxt, history: [...s.history, [...s.frames]], future: s.future.slice(1), currentFrame: Math.min(s.currentFrame, nxt.length - 1) };
    }

    case 'ADD_LAYER':
      return { ...s, layers: [...s.layers, { id: Date.now(), name: `Layer ${s.layers.length + 1}`, visible: true }], activeLayer: s.layers.length };
    case 'SET_LAYER':   return { ...s, activeLayer: a.idx };
    case 'TOGGLE_LAYER_VIS':
      return { ...s, layers: s.layers.map((l, i) => i === a.idx ? { ...l, visible: !l.visible } : l) };
    case 'RENAME_LAYER':
      return { ...s, layers: s.layers.map((l, i) => i === a.idx ? { ...l, name: String(a.name).slice(0, 40) } : l) };
    case 'DEL_LAYER':
      if (s.layers.length <= 1) return s;
      return { ...s, layers: s.layers.filter((_, i) => i !== a.idx), activeLayer: Math.min(s.activeLayer, s.layers.length - 2) };

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

  return { state, setTool, setColor, setSize, setFps, setOnion, setPlaying, setFrame,
           addFrame, delFrame, toggleKeyframe, pushHistory, undo, redo,
           addLayer, setLayer, toggleLayerVis, renameLayer, delLayer };
}
