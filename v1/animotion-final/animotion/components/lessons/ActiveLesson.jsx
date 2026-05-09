'use client';
import { useState } from 'react';
import Mascot from '../ui/Mascot';
import { sanitize } from '../../lib/utils';

const STEPS = ['intro', 'content', 'quiz', 'task', 'done'];

export default function ActiveLesson({ lesson, world, onComplete, onBack }) {
  const [step,      setStep]      = useState(0);
  const [answer,    setAnswer]    = useState(null);
  const [checked,   setChecked]   = useState(false);
  const [taskText,  setTaskText]  = useState('');
  const [taskDone,  setTaskDone]  = useState(false);

  const current    = STEPS[step];
  const isCorrect  = answer === lesson.quiz.correct;

  const canAdvance = () => {
    if (current === 'quiz') return checked;
    if (current === 'task') return taskDone;
    return true;
  };

  const goNext = () => {
    if (!canAdvance()) return;
    setAnswer(null); setChecked(false);
    setStep((s) => s + 1);
  };

  const goPrev = () => {
    if (step === 0) { onBack(); return; }
    setAnswer(null); setChecked(false);
    setStep((s) => s - 1);
  };

  return (
    <div className="page max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 font-bold text-[13px] mb-5 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
      >
        ← Back to Lessons
      </button>

      <div className="card p-8">
        {/* Progress bar */}
        <div className="flex gap-1.5 mb-7">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1.5 rounded-full transition-colors duration-300"
              style={{ background: i <= step ? world.color : '#E5E7EB' }}
            />
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: `${world.color}22` }}>
            {lesson.icon}
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {world.title} · Step {step + 1} / {STEPS.length}
            </p>
            <h2 className="font-black text-xl leading-tight">{lesson.title}</h2>
          </div>
        </div>

        {/* ── INTRO ─────────────────────────────────────────────────────── */}
        {current === 'intro' && (
          <div>
            <div className="rounded-xl px-5 py-4 mb-5 border-l-4" style={{ background: '#EBF2FF', borderColor: '#5B9CF6' }}>
              <p className="text-xs font-black mb-1" style={{ color: '#3B7DE0' }}>LEARNING OBJECTIVE</p>
              <p className="text-[14px] font-semibold text-gray-800 leading-relaxed">{lesson.desc}</p>
            </div>
            <div className="flex gap-3 items-start">
              <Mascot size={44} mood="happy" animate={false} />
              <div className="flex-1 bg-blue-50 dark:bg-gray-800 rounded-xl px-4 py-3">
                <p className="text-[13px] text-gray-600 dark:text-gray-300 font-semibold leading-relaxed">
                  Hey! I'm Ani. I'll guide you through this lesson step by step. Take your time — animation is about understanding, not speed. Let's go! 🎬
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── CONTENT ───────────────────────────────────────────────────── */}
        {current === 'content' && (
          <div>
            <p className="text-[13.5px] leading-[1.85] text-gray-700 dark:text-gray-300 font-medium whitespace-pre-line mb-5">
              {lesson.content}
            </p>
            <div className="rounded-xl px-5 py-4 border-l-4"
              style={{ background: `${world.color}18`, borderColor: world.color }}>
              <p className="text-xs font-black mb-1" style={{ color: world.color }}>💡 KEY TAKEAWAY</p>
              <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-200">{lesson.desc}</p>
            </div>
          </div>
        )}

        {/* ── QUIZ ──────────────────────────────────────────────────────── */}
        {current === 'quiz' && (
          <div>
            <h3 className="font-black text-base mb-1">Quick Quiz 🧠</h3>
            <p className="text-[13px] text-gray-500 font-semibold mb-5">{lesson.quiz.q}</p>
            <div className="space-y-2.5">
              {lesson.quiz.opts.map((opt, i) => {
                let cls = 'bg-blue-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200';
                if (checked) {
                  if (i === lesson.quiz.correct)
                    cls = 'bg-green-50 dark:bg-green-950/30 border-green-400 text-green-800 dark:text-green-300';
                  else if (i === answer)
                    cls = 'bg-red-50 dark:bg-red-950/30 border-red-400 text-red-700 dark:text-red-300';
                }
                return (
                  <button key={i} onClick={() => !checked && setAnswer(i)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 font-bold text-[13px] transition-all ${cls} ${!checked && answer !== i ? 'hover:border-primary' : ''}`}
                  >
                    <span className="opacity-50 mr-2">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                    {checked && i === lesson.quiz.correct && ' ✓'}
                    {checked && i === answer && answer !== lesson.quiz.correct && ' ✗'}
                  </button>
                );
              })}
            </div>
            {answer !== null && !checked && (
              <button onClick={() => setChecked(true)} className="btn btn-primary w-full mt-4">Check Answer</button>
            )}
            {checked && (
              <div className={`mt-4 px-4 py-3 rounded-xl text-[13px] font-bold ${isCorrect ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'}`}>
                {isCorrect ? '🎉 Correct! Great understanding!' : `💡 Not quite! The answer is "${lesson.quiz.opts[lesson.quiz.correct]}" — keep it in mind!`}
              </div>
            )}
          </div>
        )}

        {/* ── TASK ──────────────────────────────────────────────────────── */}
        {current === 'task' && (
          <div>
            <h3 className="font-black text-base mb-1">Practical Task ✏️</h3>
            <div className="rounded-xl px-5 py-4 border-l-4 mb-4" style={{ background: '#FFF8ED', borderColor: '#FFB347' }}>
              <p className="text-xs font-black text-amber-700 mb-1">YOUR TASK</p>
              <p className="text-[13px] font-bold text-gray-800 leading-relaxed">{lesson.task}</p>
            </div>
            <textarea
              value={taskText}
              onChange={(e) => setTaskText(sanitize(e.target.value))}
              placeholder="Write your answer, sketch description, or notes here…"
              rows={5}
              disabled={taskDone}
              className="field resize-none mb-3"
            />
            {!taskDone ? (
              <button
                onClick={() => taskText.trim().length >= 5 && setTaskDone(true)}
                className={`btn btn-primary w-full ${taskText.trim().length < 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Submit Task ✓
              </button>
            ) : (
              <div className="px-4 py-3 rounded-xl bg-green-50 dark:bg-green-950/30 text-[13px] font-bold text-green-700 dark:text-green-400">
                🎉 Task submitted! Great work. Keep practising this concept.
              </div>
            )}
          </div>
        )}

        {/* ── DONE ──────────────────────────────────────────────────────── */}
        {current === 'done' && (
          <div className="text-center py-4">
            <div className="text-6xl mb-4 animate-level-up inline-block">🎉</div>
            <h3 className="font-black text-2xl mb-2">Lesson Complete!</h3>
            <p className="text-gray-500 text-[13px] font-semibold leading-relaxed mb-5 max-w-xs mx-auto">
              You've completed <strong className="text-gray-700 dark:text-gray-300">"{lesson.title}"</strong>. Keep practising — knowledge compounds over time!
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-lg mb-5"
              style={{ background: '#FFF8ED', color: '#D4831A' }}>
              +{lesson.xp} XP ⭐
            </div>
            <Mascot size={80} mood="excited" animate className="mx-auto" />
          </div>
        )}

        {/* Nav buttons */}
        <div className="flex justify-between mt-8 pt-5 border-t border-gray-100 dark:border-gray-800">
          <button onClick={goPrev} className="btn btn-secondary">
            ← {step === 0 ? 'Exit' : 'Back'}
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={goNext}
              disabled={!canAdvance()}
              className={`btn btn-primary ${!canAdvance() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {current === 'quiz' && !checked ? 'Answer First' : 'Continue →'}
            </button>
          ) : (
            <button
              onClick={() => onComplete(lesson)}
              className="btn text-white font-black"
              style={{ background: 'linear-gradient(135deg,#52C97C,#5B9CF6)' }}
            >
              🎬 Complete &amp; Earn XP!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
