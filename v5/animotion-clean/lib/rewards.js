// lib/rewards.js — Achievement and reward system

export const ACHIEVEMENTS = [
  // Lesson milestones
  { id: 'first-lesson',    icon: '🎬', name: 'First Frame',      desc: 'Completed your first lesson',        check: (s) => s.completedLessons.length >= 1  },
  { id: 'five-lessons',    icon: '🔥', name: 'On Fire',          desc: 'Completed 5 lessons',                check: (s) => s.completedLessons.length >= 5  },
  { id: 'ten-lessons',     icon: '🧠', name: 'Quiz Wizard',      desc: 'Completed 10 lessons',               check: (s) => s.completedLessons.length >= 10 },
  { id: 'twenty-lessons',  icon: '📚', name: 'Scholar',          desc: 'Completed 20 lessons',               check: (s) => s.completedLessons.length >= 20 },
  { id: 'all-2d',          icon: '✏️',  name: '2D Master',        desc: 'Completed all 2D Animation lessons', check: (s) => s.completedLessons.filter(id => id.startsWith('2d')).length >= 14 },
  // XP milestones
  { id: 'xp-500',          icon: '⭐', name: 'Rising Star',      desc: 'Earned 500 XP',                     check: (s) => s.xp >= 500   },
  { id: 'xp-2000',         icon: '🚀', name: 'Animator',         desc: 'Earned 2,000 XP',                   check: (s) => s.xp >= 2000  },
  { id: 'xp-10000',        icon: '💎', name: 'Elite',            desc: 'Earned 10,000 XP',                  check: (s) => s.xp >= 10000 },
  // Skill milestones
  { id: 'skill-50',        icon: '📈', name: 'Skilled',          desc: 'Any skill reached 50',              check: (s) => Object.values(s.skills).some(v => v >= 50) },
  { id: 'skill-100',       icon: '🏆', name: 'Master Skill',     desc: 'Any skill reached 100',             check: (s) => Object.values(s.skills).some(v => v >= 100) },
  { id: 'all-skills-20',   icon: '⚖️', name: 'Well Rounded',     desc: 'All skills above 20',               check: (s) => Object.values(s.skills).every(v => v >= 20) },
  // Streak milestones
  { id: 'streak-3',        icon: '🔥', name: 'Warming Up',       desc: '3-day streak',                      check: (s) => (s.streak ?? 0) >= 3  },
  { id: 'streak-7',        icon: '🔥', name: 'Hot Streak',       desc: '7-day streak',                      check: (s) => (s.streak ?? 0) >= 7  },
  { id: 'streak-30',       icon: '🔥', name: 'Legendary',        desc: '30-day streak',                     check: (s) => (s.streak ?? 0) >= 30 },
  // Boss battles
  { id: 'first-boss',      icon: '⚔️', name: 'Boss Slayer',      desc: 'Defeated your first Boss Battle',   check: (s) => (s.completedBosses ?? []).length >= 1 },
  { id: 'all-bosses',      icon: '👑', name: 'Champion',         desc: 'Defeated all Boss Battles',         check: (s) => (s.completedBosses ?? []).length >= 9 },
];

// ── Avatar system — cosmetic items unlocked by XP ─────────────────────────────
export const AVATAR_ITEMS = [
  // Backgrounds
  { id: 'bg-default',  type: 'bg', name: 'Blue Gradient',  preview: 'linear-gradient(135deg,#5B9CF6,#9B7FEA)', unlockXP: 0    },
  { id: 'bg-sunset',   type: 'bg', name: 'Sunset',         preview: 'linear-gradient(135deg,#FFB347,#FF5757)', unlockXP: 500  },
  { id: 'bg-forest',   type: 'bg', name: 'Forest',         preview: 'linear-gradient(135deg,#52C97C,#4ECDC4)', unlockXP: 1500 },
  { id: 'bg-galaxy',   type: 'bg', name: 'Galaxy',         preview: 'linear-gradient(135deg,#1A1D2E,#9B7FEA)', unlockXP: 5000 },
  { id: 'bg-fire',     type: 'bg', name: 'Fire',           preview: 'linear-gradient(135deg,#FF5757,#FFB347)', unlockXP: 10000 },
  // Titles
  { id: 'title-none',     type: 'title', name: '',               unlockXP: 0    },
  { id: 'title-rookie',   type: 'title', name: 'Rookie',         unlockXP: 0    },
  { id: 'title-animator', type: 'title', name: 'Animator',       unlockXP: 500  },
  { id: 'title-director', type: 'title', name: 'Director',       unlockXP: 2000 },
  { id: 'title-master',   type: 'title', name: 'Master Animator',unlockXP: 5000 },
  { id: 'title-legend',   type: 'title', name: 'Legend',         unlockXP: 15000 },
  // Brush styles (editor unlocks)
  { id: 'brush-basic',  type: 'brush', name: 'Basic',   size: 4,  unlockXP: 0    },
  { id: 'brush-thick',  type: 'brush', name: 'Thick',   size: 10, unlockXP: 200  },
  { id: 'brush-fine',   type: 'brush', name: 'Fine',    size: 2,  unlockXP: 500  },
  { id: 'brush-xl',     type: 'brush', name: 'XL',      size: 20, unlockXP: 1000 },
  // Colour palettes (editor unlocks)
  {
    id: 'palette-default',
    type: 'palette',
    name: 'Default',
    colors: ['#1A1D2E', '#5B9CF6', '#FF8FAB', '#52C97C', '#FFB347', '#9B7FEA', '#FF5757', '#FFFFFF'],
    unlockXP: 0,
  },
  {
    id: 'palette-neon',
    type: 'palette',
    name: 'Neon',
    colors: ['#00FF41', '#FF00FF', '#00FFFF', '#FF4500', '#FFD700', '#7FFF00', '#FF69B4', '#000000'],
    unlockXP: 1000,
  },
  {
    id: 'palette-pastel',
    type: 'palette',
    name: 'Pastel',
    colors: ['#FFB3C6', '#BDE0FE', '#B5EAD7', '#FFDAC1', '#E2C6FF', '#C7F2A4', '#FFF9C4', '#FFFFFF'],
    unlockXP: 2000,
  },
];

export function getUnlockedItems(xp) {
  return AVATAR_ITEMS.filter((item) => xp >= item.unlockXP);
}

export function getEarnedAchievements(state) {
  return ACHIEVEMENTS.filter((a) => {
    try { return a.check(state); }
    catch { return false; }
  });
}

export function getNewAchievements(prevState, newState) {
  const wasEarned = new Set(getEarnedAchievements(prevState).map((a) => a.id));
  return getEarnedAchievements(newState).filter((a) => !wasEarned.has(a.id));
}
