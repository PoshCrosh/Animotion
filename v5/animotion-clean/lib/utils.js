// ─── XP / Level math ──────────────────────────────────────────────────────────
export const xpForLevel   = (l) => l * l * 90;
export const levelFromXP  = (xp) => Math.floor(Math.sqrt(xp / 90));
export const xpProgress   = (xp) => {
  const level  = levelFromXP(xp);
  const curr   = xp - xpForLevel(level);
  const needed = xpForLevel(level + 1) - xpForLevel(level);
  return { level, curr, needed, pct: Math.min(100, (curr / needed) * 100) };
};

// ─── Rank lookup ──────────────────────────────────────────────────────────────
export const getRank = (xp, ranks) =>
  ranks.find((r) => xp >= r.min && xp < r.max) ?? ranks[0];

// ─── Input sanitisation (prevent XSS) ────────────────────────────────────────
export const sanitize = (str) =>
  String(str).replace(/[<>"'&]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' }[c])
  );

// ─── Validation helpers ───────────────────────────────────────────────────────
export const validate = {
  email:    (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Enter a valid email address',
  password: (v) => v.length >= 8 ? null : 'Password must be at least 8 characters',
  name:     (v) => v.trim().length >= 2 ? null : 'Name must be at least 2 characters',
  feedback: (v) => v.trim().length >= 10 ? null : 'Please write at least 10 characters',
};

// ─── Number formatting ────────────────────────────────────────────────────────
export const fmtXP = (n) => Number(n).toLocaleString();

// ─── Safe localStorage (avoids SSR crash) ────────────────────────────────────
export const store = {
  get: (key, fallback = null) => {
    if (typeof window === 'undefined') return fallback;
    try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set: (key, value) => {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
  del: (key) => {
    if (typeof window === 'undefined') return;
    try { localStorage.removeItem(key); } catch {}
  },
};

// ─── Clamp ────────────────────────────────────────────────────────────────────
export const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
