'use client';

import {
  createContext, useContext, useReducer, useEffect, useRef, useCallback,
} from 'react';
import { QUESTS, DEFAULT_SKILLS } from './curriculum';
import { levelFromXP, store }     from './utils';
import { getProfile, createProfile, updateProfile, isDbConfigured } from './db';
import { getStreakData, calculateStreak, saveStreakData, getMultiplier } from './streak';

export const FRESH_STATE = {
  xp:               0,
  level:            1,
  dark:             false,
  focusMode:        false,
  sound:            true,
  completedLessons: [],
  completedBosses:  [],
  hasSeenTutorial:  false,
  skills:           { ...DEFAULT_SKILLS },
  quests:           QUESTS.map((q) => ({ ...q, done: false, progress: 0 })),
  skillContract:    null,   // { skillId, startDate }
  // transient
  xpToasts:         [],
  levelUpModal:     false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return {
        ...state,
        ...action.payload,
        skills:          { ...DEFAULT_SKILLS, ...(action.payload.skills ?? {}) },
        completedBosses: Array.isArray(action.payload.completedBosses) ? action.payload.completedBosses : [],
        skillContract:   action.payload.skillContract ?? null,
        xpToasts:        [],
        levelUpModal:    false,
      };

    case 'GAIN_XP': {
      const newXP    = state.xp + action.amount;
      const newLevel = levelFromXP(newXP);
      const leveled  = newLevel > state.level;
      return {
        ...state,
        xp:           newXP,
        level:        newLevel,
        levelUpModal: leveled ? true : state.levelUpModal,
        xpToasts: [...state.xpToasts, {
          id:     Date.now() + Math.random(),
          amount: action.amount,
          x:      action.x ?? 600,
          y:      action.y ?? 300,
        }],
      };
    }

    case 'GAIN_SKILLS': {
      const updated  = { ...state.skills };
      const contract = state.skillContract;
      const contractActive = contract?.skillId &&
        contract?.startDate &&
        (() => {
          const end = new Date(contract.startDate);
          end.setDate(end.getDate() + 7);
          return new Date() < end;
        })();

      Object.entries(action.deltas).forEach(([key, delta]) => {
        if (key in updated) {
          // Apply contract boost if active for this skill
          const boostedDelta = contractActive && key === contract.skillId
            ? Math.round(delta * 1.4)
            : delta;
          updated[key] = Math.min(100, Math.max(0, (updated[key] ?? 0) + boostedDelta));
        }
      });
      return { ...state, skills: updated };
    }

    case 'REMOVE_TOAST':
      return { ...state, xpToasts: state.xpToasts.filter((t) => t.id !== action.id) };

    case 'CLOSE_LEVELUP':
      return { ...state, levelUpModal: false };

    case 'COMPLETE_LESSON':
      if (state.completedLessons.includes(action.id)) return state;
      return { ...state, completedLessons: [...state.completedLessons, action.id] };

    case 'COMPLETE_BOSS':
      if (state.completedBosses.includes(action.id)) return state;
      return { ...state, completedBosses: [...state.completedBosses, action.id] };

    case 'COMPLETE_QUEST':
      return {
        ...state,
        quests: state.quests.map((q) =>
          q.id === action.id ? { ...q, done: true, progress: q.max } : q
        ),
      };

    case 'MARK_TUTORIAL_SEEN':
      return { ...state, hasSeenTutorial: true };

    case 'SET_SKILL_CONTRACT':
      return { ...state, skillContract: action.contract };

    case 'SET_DARK':  return { ...state, dark:      action.v };
    case 'SET_FOCUS': return { ...state, focusMode: action.v };
    case 'SET_SOUND': return { ...state, sound:     action.v };

    default: return state;
  }
}

const Ctx = createContext(null);

function toPersist({ xpToasts, levelUpModal, ...rest }) {
  return rest;
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, FRESH_STATE);
  const hydrated   = useRef(false);
  const currentUid = useRef(null);
  const dbTimer    = useRef(null);

  const hydrateForUser = useCallback(async (uid, displayName) => {
    currentUid.current = uid;

    if (isDbConfigured() && uid) {
      let profile = await getProfile(uid);
      if (!profile) profile = await createProfile(uid, displayName);
      if (profile) {
        dispatch({
          type: 'HYDRATE',
          payload: {
            xp:               Number(profile.xp)   || 0,
            level:            Number(profile.level) || 1,
            completedLessons: Array.isArray(profile.completed_lessons) ? profile.completed_lessons : [],
            completedBosses:  Array.isArray(profile.completed_bosses)  ? profile.completed_bosses  : [],
            hasSeenTutorial:  Boolean(profile.has_seen_tutorial),
            skills:           (typeof profile.skills === 'object' && profile.skills) ? profile.skills : DEFAULT_SKILLS,
            skillContract:    profile.skill_contract ?? null,
          },
        });
        hydrated.current = true;
        return;
      }
    }

    const saved = store.get(`animotion_u_${uid}`);
    if (saved) dispatch({ type: 'HYDRATE', payload: saved });
    else        dispatch({ type: 'HYDRATE', payload: {} });
    hydrated.current = true;
  }, []);

  // Persist on state change
  useEffect(() => {
    if (!hydrated.current) return;
    const uid = currentUid.current;
    if (uid) store.set(`animotion_u_${uid}`, toPersist(state));

    if (isDbConfigured() && uid) {
      clearTimeout(dbTimer.current);
      dbTimer.current = setTimeout(() => {
        updateProfile(uid, {
          xp:                state.xp,
          level:             state.level,
          completed_lessons: state.completedLessons,
          completed_bosses:  state.completedBosses,
          has_seen_tutorial: state.hasSeenTutorial,
          skills:            state.skills,
          skill_contract:    state.skillContract,
        });
      }, 400);
    }
  }, [state]); // eslint-disable-line

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', state.dark);
    }
    store.set('animotion_dark', state.dark);
  }, [state.dark]);

  useEffect(() => {
    const d = store.get('animotion_dark');
    if (d !== null) dispatch({ type: 'SET_DARK', v: d });
  }, []); // eslint-disable-line

  const gainXP = useCallback((amount, x, y) => {
    // Apply streak multiplier to XP gains
    const uid = currentUid.current;
    let finalAmount = amount;
    if (uid) {
      const streakData = getStreakData(uid);
      if (streakData?.streak > 0) {
        const mult = getMultiplier(streakData.streak);
        finalAmount = Math.round(amount * mult);
      }
    }
    dispatch({ type: 'GAIN_XP', amount: finalAmount, x, y });
  }, []);

  const gainSkills = useCallback((deltas) => {
    dispatch({ type: 'GAIN_SKILLS', deltas });
  }, []);

  const completeLesson = useCallback((id, xp, skillDeltas, x, y) => {
    dispatch({ type: 'COMPLETE_LESSON', id });
    dispatch({ type: 'GAIN_XP', amount: xp, x: x ?? 600, y: y ?? 300 });
    if (skillDeltas) dispatch({ type: 'GAIN_SKILLS', deltas: skillDeltas });
    dispatch({ type: 'COMPLETE_QUEST', id: 1 });
    dispatch({ type: 'COMPLETE_QUEST', id: 6 });
  }, []);

  const completeQuest = useCallback((id, xp) => {
    dispatch({ type: 'COMPLETE_QUEST', id });
    dispatch({ type: 'GAIN_XP', amount: xp, x: 600, y: 300 });
  }, []);

  const removeToast = useCallback((id) => {
    dispatch({ type: 'REMOVE_TOAST', id });
  }, []);

  const markTutorialSeen = useCallback(() => {
    dispatch({ type: 'MARK_TUTORIAL_SEEN' });
  }, []);

  return (
    <Ctx.Provider value={{
      state, dispatch,
      gainXP, gainSkills, completeLesson, completeQuest, removeToast,
      markTutorialSeen, hydrateForUser,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be inside <AppProvider>');
  return ctx;
}
