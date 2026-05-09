// lib/streak.js — Daily streak tracking logic

const STREAK_KEY = (uid) => `animotion_streak_${uid}`;

export function getStreakData(uid) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STREAK_KEY(uid));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveStreakData(uid, data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STREAK_KEY(uid), JSON.stringify(data));
  } catch {}
}

export function getTodayStr() {
  return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

export function getYesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Calculate updated streak on login/activity.
 * Returns { streak, longestStreak, lastActiveDate, freezesAvailable, multiplier, isNewDay }
 */
export function calculateStreak(existing) {
  const today     = getTodayStr();
  const yesterday = getYesterdayStr();

  const defaults = {
    streak:          0,
    longestStreak:   0,
    lastActiveDate:  null,
    freezesAvailable: 1,
    freezeUsedDate:  null,
  };

  const data = existing ?? defaults;

  // Already active today — return current state
  if (data.lastActiveDate === today) {
    return { ...data, isNewDay: false, multiplier: getMultiplier(data.streak) };
  }

  let newStreak = data.streak;

  if (data.lastActiveDate === yesterday) {
    // Continued streak
    newStreak = data.streak + 1;
  } else if (data.lastActiveDate && data.freezesAvailable > 0 && data.freezeUsedDate !== yesterday) {
    // Missed one day but has a freeze — use it
    newStreak = data.streak;
    data.freezesAvailable -= 1;
    data.freezeUsedDate = yesterday;
  } else if (data.lastActiveDate !== today) {
    // Streak broken
    newStreak = 1;
  }

  const longestStreak = Math.max(data.longestStreak ?? 0, newStreak);

  // Award a freeze every 7 days
  const freezesAvailable = newStreak % 7 === 0 && newStreak > 0
    ? Math.min((data.freezesAvailable ?? 0) + 1, 3)
    : data.freezesAvailable ?? 1;

  return {
    streak:          newStreak,
    longestStreak,
    lastActiveDate:  today,
    freezesAvailable,
    freezeUsedDate:  data.freezeUsedDate ?? null,
    isNewDay:        true,
    multiplier:      getMultiplier(newStreak),
  };
}

export function getMultiplier(streak) {
  if (streak >= 30) return 2.0;
  if (streak >= 14) return 1.75;
  if (streak >= 7)  return 1.5;
  if (streak >= 3)  return 1.25;
  return 1.0;
}

export function getStreakBonusXP(baseXP, streak) {
  const mult = getMultiplier(streak);
  return mult > 1 ? Math.round(baseXP * (mult - 1)) : 0;
}

export function getStreakLabel(streak) {
  if (streak >= 30) return '🔥 Legendary';
  if (streak >= 14) return '🔥 On Fire';
  if (streak >= 7)  return '🔥 Hot Streak';
  if (streak >= 3)  return '🔥 Warming Up';
  return '🌱 Getting Started';
}
