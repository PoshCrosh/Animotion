// lib/wiiTheme.js — Wii U design tokens for Animotion
// ─────────────────────────────────────────────────────
// Import this in any component that needs the Wii U palette.

export const WII = {
  // Core palette
  blue:        '#009AC7',
  blueDark:    '#007AAA',
  blueLight:   '#E1F5FB',
  blueMid:     '#B8E4F2',
  bg:          '#EAF6FB',
  bgPanel:     'rgba(255,255,255,0.82)',
  bgCard:      'rgba(255,255,255,0.92)',
  white:       '#FFFFFF',

  // Text
  textPrimary:   '#1E3A4A',
  textSecondary: '#5A7A8A',
  textMuted:     '#9AB5C0',

  // Borders
  border:        'rgba(0,154,199,0.18)',
  borderHover:   'rgba(0,154,199,0.40)',
  borderActive:  '#009AC7',

  // Shadows
  shadow:        '0 4px 16px rgba(0,120,180,0.12), 0 1px 4px rgba(0,0,0,0.05)',
  shadowHover:   '0 8px 28px rgba(0,120,180,0.20), 0 2px 8px rgba(0,0,0,0.07)',
  shadowGlow:    '0 0 0 3px rgba(0,154,199,0.35), 0 4px 20px rgba(0,154,199,0.25)',

  // Accent colors (for tiles/sections)
  accents: {
    blue:   '#5B9CF6',
    purple: '#9B7FEA',
    pink:   '#FF8FAB',
    green:  '#52C97C',
    orange: '#FFB347',
    red:    '#FF5757',
    teal:   '#4ECDC4',
    gray:   '#9CA3AF',
    cyan:   '#009AC7',
  },

  // Radii
  radiusTile:  22,
  radiusCard:  18,
  radiusBtn:   12,
  radiusPill:  999,

  // Transitions
  transition: 'all 0.18s cubic-bezier(0.34,1.26,0.64,1)',
  transitionFast: 'all 0.12s ease',
};

// Shared tile/card style helper
export const wiiCard = (opts = {}) => ({
  background:        opts.selected ? `linear-gradient(145deg,rgba(255,255,255,0.99),rgba(225,248,255,0.96))` : WII.bgCard,
  border:            `1.5px solid ${opts.selected ? WII.blue : WII.border}`,
  borderRadius:      opts.radius ?? WII.radiusCard,
  boxShadow:         opts.selected ? WII.shadowGlow : opts.hovered ? WII.shadowHover : WII.shadow,
  backdropFilter:    'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  transition:        WII.transition,
  transform:         opts.selected ? 'scale(1.03)' : opts.hovered ? 'scale(1.04) translateY(-2px)' : 'scale(1)',
});

// Section header style
export const wiiSectionHeader = {
  fontSize:    10,
  fontWeight:  900,
  color:       WII.blue,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  marginBottom: 10,
};
