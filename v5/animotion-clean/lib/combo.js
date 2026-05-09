// lib/combo.js — Combo system: consecutive actions boost XP

const COMBO_KEY = (uid) => `animotion_combo_${uid}`;
const COMBO_TIMEOUT_MS = 30 * 60 * 1000; // 30 minute window

export function getComboData(uid) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(COMBO_KEY(uid));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveComboData(uid, data) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(COMBO_KEY(uid), JSON.stringify(data)); } catch {}
}

/**
 * Actions: 'lesson' | 'practice' | 'feedback' | 'quiz' | 'editor'
 * Returns { combo, multiplier, isNewCombo, message }
 */
export function recordAction(uid, action) {
  const now  = Date.now();
  const data = getComboData(uid) ?? { combo: 0, lastAction: null, lastTime: 0, chain: [] };

  // Reset if timeout exceeded
  const expired = now - data.lastTime > COMBO_TIMEOUT_MS;
  if (expired) {
    data.combo = 0;
    data.chain = [];
  }

  // Combo chain: lesson → practice → feedback = max combo
  const CHAIN_BONUS = ['lesson', 'quiz', 'practice', 'feedback'];
  const isChainAction = CHAIN_BONUS.includes(action);

  let newCombo = expired ? 1 : data.combo + 1;
  const chain  = expired ? [action] : [...(data.chain ?? []), action];

  // Max combo cap
  newCombo = Math.min(newCombo, 10);

  const updated = { combo: newCombo, lastAction: action, lastTime: now, chain };
  saveComboData(uid, updated);

  return {
    combo:      newCombo,
    multiplier: getComboMultiplier(newCombo),
    message:    getComboMessage(newCombo),
    isNewCombo: newCombo > (data.combo ?? 0),
  };
}

export function getComboMultiplier(combo) {
  if (combo >= 8) return 2.0;
  if (combo >= 5) return 1.5;
  if (combo >= 3) return 1.25;
  return 1.0;
}

export function getComboMessage(combo) {
  if (combo >= 8) return '🔥🔥🔥 UNSTOPPABLE!';
  if (combo >= 5) return '🔥🔥 ON FIRE!';
  if (combo >= 3) return '🔥 Combo!';
  if (combo >= 2) return '⚡ Keep going!';
  return null;
}
