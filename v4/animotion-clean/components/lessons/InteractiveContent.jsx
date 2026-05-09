'use client';
import { useState } from 'react';
import TimingSlider      from './exercises/TimingSlider';
import PrincipleSorter   from './exercises/PrincipleSorter';
import ScenarioMatcher   from './exercises/ScenarioMatcher';
import MiniCanvasChallenge from './exercises/MiniCanvasChallenge';

// ── Exercise registry ─────────────────────────────────────────────────────────
// Each lesson can declare interactive.type in curriculum.js
// This component picks and renders the right one.

const EXERCISE_MAP = {
  timingSlider:     TimingSlider,
  principleSorter:  PrincipleSorter,
  scenarioMatcher:  ScenarioMatcher,
  miniCanvas:       MiniCanvasChallenge,
};

// ── Fallback enhanced content (for lessons without a specific exercise) ────────
function EnhancedContent({ content, world }) {
  const [expanded, setExpanded] = useState(false);

  // Split content into digestible chunks
  const paragraphs = content
    .split('\n\n')
    .filter(Boolean)
    .map((p) => p.trim());

  // Detect numbered lists (1. 2. etc.) and bullet points
  const renderParagraph = (text, idx) => {
    const isNumbered = /^\d+\./.test(text);
    const isBullet   = text.startsWith('•') || text.startsWith('-');

    if (isNumbered || isBullet) {
      const lines = text.split('\n').filter(Boolean);
      return (
        <ul key={idx} className="space-y-1.5 mb-3">
          {lines.map((line, li) => (
            <li key={li} className="flex items-start gap-2.5">
              <span className="text-primary font-black text-sm flex-shrink-0 mt-0.5">
                {line.match(/^\d+/) ? line.match(/^\d+/)[0] + '.' : '•'}
              </span>
              <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                {line.replace(/^\d+\.\s*|^[•\-]\s*/, '')}
              </span>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={idx} className="text-[13.5px] leading-[1.85] text-gray-700 dark:text-gray-300 font-medium mb-3">
        {text}
      </p>
    );
  };

  const visibleParagraphs = expanded ? paragraphs : paragraphs.slice(0, 3);

  return (
    <div>
      {/* Content header card */}
      <div
        className="rounded-xl px-5 py-4 mb-5 border-l-4"
        style={{ background: `${world.color}12`, borderColor: world.color }}
      >
        <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: world.color }}>
          📖 LESSON CONTENT
        </p>
        <p className="text-[11px] text-gray-500 font-semibold">
          Read carefully — the quiz tests this content.
        </p>
      </div>

      {/* Rendered content */}
      <div className="mb-2">
        {visibleParagraphs.map((p, i) => renderParagraph(p, i))}
      </div>

      {paragraphs.length > 3 && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-primary text-xs font-black hover:underline mb-4 block"
        >
          {expanded ? '↑ Show less' : `↓ Show ${paragraphs.length - 3} more sections`}
        </button>
      )}
    </div>
  );
}

// ── Key Takeaway Card ──────────────────────────────────────────────────────────
function KeyTakeaway({ desc, world }) {
  return (
    <div className="rounded-xl px-5 py-4 border-l-4 mt-4"
      style={{ background: `${world.color}18`, borderColor: world.color }}>
      <p className="text-xs font-black mb-1" style={{ color: world.color }}>💡 KEY TAKEAWAY</p>
      <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-200">{desc}</p>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function InteractiveContent({ lesson, world, onExerciseComplete }) {
  const [exerciseDone, setExerciseDone] = useState(false);

  const handleExerciseComplete = (correct) => {
    setExerciseDone(true);
    if (onExerciseComplete) onExerciseComplete(correct);
  };

  // Determine if this lesson has a specific interactive exercise
  const hasExercise = lesson.interactive?.type && EXERCISE_MAP[lesson.interactive.type];
  const ExerciseComponent = hasExercise ? EXERCISE_MAP[lesson.interactive.type] : null;

  return (
    <div>
      {/* Standard lesson content — always shown */}
      <EnhancedContent content={lesson.content} world={world} />

      {/* Interactive exercise — shown when defined in curriculum */}
      {ExerciseComponent && (
        <div className="mt-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
              Interactive Exercise
            </span>
            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
          </div>

          <ExerciseComponent
            {...(lesson.interactive.props ?? {})}
            onComplete={handleExerciseComplete}
          />

          {exerciseDone && (
            <div className="mt-3 bg-green-50 dark:bg-green-950/30 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <span className="text-lg">✅</span>
              <p className="text-xs font-black text-green-700 dark:text-green-400">
                Exercise complete! Continue to the quiz when ready.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Key takeaway — always shown */}
      <KeyTakeaway desc={lesson.desc} world={world} />
    </div>
  );
}
