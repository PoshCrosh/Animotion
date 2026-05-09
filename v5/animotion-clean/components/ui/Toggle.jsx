'use client';

export default function Toggle({ value, onChange, label }) {
  return (
    <button
      type="button" role="switch" aria-checked={value} aria-label={label}
      onClick={() => onChange(!value)}
      className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${value ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${value ? 'left-[18px]' : 'left-0.5'}`} />
    </button>
  );
}
