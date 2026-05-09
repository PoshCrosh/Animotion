'use client';
import { useState } from 'react';
import Mascot from './Mascot';

const STEPS = [
  {
    icon: '🏠',
    title: 'Welcome to Animotion!',
    body: "You're now in your personal animation learning studio. This is your Dashboard — your home base for tracking progress, completing daily quests, and resuming lessons.",
    hint: 'Check back every day to complete your daily quests and earn bonus XP!',
  },
  {
    icon: '📖',
    title: 'Learn Through Lessons',
    body: 'The Lessons section contains 20 in-depth lessons across 4 worlds — from Animation Foundations to Advanced Techniques. Each lesson has content, a quiz, and a practical task.',
    hint: 'Complete worlds in order to unlock the next one. Start with Animation Foundations!',
  },
  {
    icon: '✏️',
    title: 'The Animation Editor',
    body: "The Animation Editor lets you create frame-by-frame 2D animations. Draw on the canvas, manage layers, set keyframes, and export your work as a GIF to share with the world.",
    hint: 'Press Space to play/pause. Use Ctrl+Z to undo. Add frames with the + button.',
  },
  {
    icon: '⭐',
    title: 'XP & Ranking System',
    body: 'Everything you do earns XP — completing lessons, passing quizzes, submitting tasks, and chatting with Ani. XP levels you up and climbs the leaderboard.',
    hint: 'Your current rank is Bronze. Earn 1,000 XP to reach Silver!',
  },
  {
    icon: '🤖',
    title: 'Meet Ani — Your AI Coach',
    body: "Ani is your personal animation mentor, powered by Claude AI. Ask Ani anything about animation principles, timing, weight, arcs — or describe what you're working on for specific feedback.",
    hint: 'The more specific your question, the better Ani\'s advice will be.',
  },
];

export default function OnboardingModal({ onDone }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)' }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-strong w-full max-w-[500px] overflow-hidden animate-level-up">

        {/* Top progress bar */}
        <div className="flex gap-1 p-4 pb-0">
          {STEPS.map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full transition-colors duration-400"
              style={{ background: i <= step ? '#5B9CF6' : '#E5E7EB' }} />
          ))}
        </div>

        {/* Content */}
        <div className="px-8 py-7 text-center">
          <Mascot size={72} mood={isLast ? 'excited' : 'happy'} animate className="mx-auto mb-4" />

          <div className="text-4xl mb-3">{current.icon}</div>
          <h2 className="font-black text-xl mb-3 tracking-tight">{current.title}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-[13.5px] leading-relaxed font-semibold mb-4">
            {current.body}
          </p>

          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl px-4 py-3 border-l-4 border-primary mb-6 text-left">
            <p className="text-[11px] font-black text-primary mb-0.5">💡 TIP</p>
            <p className="text-xs text-primary-dark dark:text-blue-300 font-semibold">{current.hint}</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onDone}
              className="btn btn-secondary flex-1 text-xs"
            >
              Skip Tour
            </button>
            {isLast ? (
              <button
                onClick={onDone}
                className="btn btn-primary flex-[2] text-sm"
                style={{ background: 'linear-gradient(135deg,#52C97C,#5B9CF6)' }}
              >
                Let's Animate! 🎬
              </button>
            ) : (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="btn btn-primary flex-[2] text-sm"
              >
                Next →
              </button>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-3 font-semibold">
            Step {step + 1} of {STEPS.length}
          </p>
        </div>
      </div>
    </div>
  );
}
