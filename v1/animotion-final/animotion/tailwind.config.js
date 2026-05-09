/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx}',
    './hooks/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary:  '#5B9CF6',
        'primary-dark':  '#3B7DE0',
        'primary-light': '#EBF2FF',
        'primary-xl':    '#F5F9FF',
        accent:   '#9B7FEA',
        success:  '#52C97C',
        warning:  '#FFB347',
        danger:   '#FF5757',
        pink:     '#FF8FAB',
        teal:     '#4ECDC4',
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        soft:   '0 2px 12px rgba(91,156,246,0.10)',
        medium: '0 6px 28px rgba(91,156,246,0.18)',
        strong: '0 12px 48px rgba(91,156,246,0.25)',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)'    },
        },
        floatY: {
          '0%,100%': { transform: 'translateY(0)'   },
          '50%':     { transform: 'translateY(-8px)' },
        },
        levelUp: {
          '0%':  { opacity: '0', transform: 'scale(0.5) rotate(-8deg)' },
          '65%': { transform: 'scale(1.1) rotate(2deg)'                },
          '100%':{ opacity: '1', transform: 'scale(1) rotate(0)'       },
        },
        xpPop: {
          '0%':   { opacity: '1', transform: 'translateY(0) scale(1)'   },
          '100%': { opacity: '0', transform: 'translateY(-48px) scale(1.2)' },
        },
        nodeGlow: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(91,156,246,0.45)' },
          '50%':     { boxShadow: '0 0 0 10px rgba(91,156,246,0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        shake: {
          '0%,100%': { transform: 'translateX(0)'  },
          '20%':     { transform: 'translateX(-6px)' },
          '60%':     { transform: 'translateX(6px)'  },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        waveBg: {
          '0%':   { transform: 'translateX(0)'    },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up':   'fadeUp 0.25s ease both',
        'float':     'floatY 3.5s ease-in-out infinite',
        'level-up':  'levelUp 0.55s ease both',
        'xp-pop':    'xpPop 0.9s ease forwards',
        'node-glow': 'nodeGlow 3s ease infinite',
        'shimmer':   'shimmer 1.5s infinite',
        'shake':     'shake 0.4s ease',
        'spin':      'spin 1s linear infinite',
        'wave-bg':   'waveBg 12s linear infinite',
      },
    },
  },
  plugins: [],
};
