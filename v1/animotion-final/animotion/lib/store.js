'use client';

import {
  createContext, useContext, useReducer, useEffect, useRef, useCallback,
} from 'react';
import { QUESTS } from './curriculum';
import { levelFromXP, store } from './utils';

// ─── Initial state ─────────────────────────────────────────────────────────
const INIT = {
  xp:               1240,
  level:            8,
  dark:             false,
  focusMode:        false,
  sound:            true,
  completedLessons: [],          // array of lesson IDs
  quests:           QUESTS.map((q) => ({ ...q, done: false, progress: 0 })),
  xpToasts:         [],
  levelUpModal:     false,
};

// ─── Reducer ───────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {

    case 'HYDRATE':
      return { ...state, ...action.payload, xpToasts: [], levelUpModal: false };

    case 'GAIN_XP': {
      const newXP    = state.xp + action.amount;
      const newLevel = levelFromXP(newXP);
      const leveled  = newLevel > state.level;
      const toast    = { id: Date.now() + Math.random(), amount: action.amount, x: action.x ?? 600, y: action.y ?? 300 };
      return {
        ...state,
        xp:           newXP,
        level:        newLevel,
        levelUpModal: leveled ? true : state.levelUpModal,
        xpToasts:     [...state.xpToasts, toast],
      };
    }

    case 'REMOVE_TOAST':
      return { ...state, xpToasts: state.xpToasts.filter((t) => t.id !== action.id) };

    case 'CLOSE_LEVELUP':
      return { ...state, levelUpModal: false };

    case 'COMPLETE_LESSON':
      if (state.completedLessons.includes(action.id)) return state;
      return { ...state, completedLessons: [...state.completedLessons, action.id] };

    case 'COMPLETE_QUEST':
      return {
        ...state,
        quests: state.quests.map((q) =>
          q.id === action.id ? { ...q, done: true, progress: q.max } : q
        ),
      };

    case 'SET_DARK':     return { ...state, dark: action.v };
    case 'SET_FOCUS':    return { ...state, focusMode: action.v };
    case 'SET_SOUND':    return { ...state, sound: action.v };

    default: return state;
  }
}

// ─── Context ───────────────────────────────────────────────────────────────
const Ctx = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INIT);
  const hydrated = useRef(false);

  // Hydrate once from localStorage
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const saved = store.get('animotion_v2');
    if (saved) dispatch({ type: 'HYDRATE', payload: saved });
  }, []);

  // Persist on every change (skip transient fields)
  useEffect(() => {
    if (!hydrated.current) return;
    const { xpToasts, levelUpModal, ...persist } = state; // eslint-disable-line
    store.set('animotion_v2', persist);
  }, [state]);

  // Sync dark mode class
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', state.dark);
    }
  }, [state.dark]);

  const gainXP = useCallback((amount, x, y) => {
    dispatch({ type: 'GAIN_XP', amount, x, y });
  }, []);

  const completeLesson = useCallback((id, xp, x, y) => {
    dispatch({ type: 'COMPLETE_LESSON', id });
    dispatch({ type: 'GAIN_XP', amount: xp, x: x ?? 600, y: y ?? 300 });
    dispatch({ type: 'COMPLETE_QUEST', id: 1 }); // "complete a lesson"
    dispatch({ type: 'COMPLETE_QUEST', id: 6 }); // "pass a quiz"
  }, []);

  const completeQuest = useCallback((id, xp) => {
    dispatch({ type: 'COMPLETE_QUEST', id });
    dispatch({ type: 'GAIN_XP', amount: xp, x: 600, y: 300 });
  }, []);

  const removeToast = useCallback((id) => {
    dispatch({ type: 'REMOVE_TOAST', id });
  }, []);

  return (
    <Ctx.Provider value={{ state, dispatch, gainXP, completeLesson, completeQuest, removeToast }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be inside <AppProvider>');
  return ctx;
}
