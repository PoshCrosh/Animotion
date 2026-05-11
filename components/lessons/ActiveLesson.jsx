'use client';
import { useState } from 'react';
import YouTubeEmbed from '../ui/YouTubeEmbed';
import { useApp } from '../../lib/store';

const STEPS = ['intro', 'content', 'quiz', 'task', 'done'];

export default function ActiveLesson({ lesson, world, onComplete, onBack }) {
  const { gainXP } = useApp();
  const [current,     setCurrent]     = useState('intro');
  const [qIdx,        setQIdx]        = useState(0);
  const [selected,    setSelected]    = useState(null);
  const [score,       setScore]       = useState(0);
  const [quizDone,    setQuizDone]    = useState(false);
  const [taskText,    setTaskText]    = useState('');   // ← plain string, NO sanitize
  const [taskDone,    setTaskDone]    = useState(false);
  const [wrongAns,    setWrongAns]    = useState(false);

  const questions = lesson.quiz ?? [];
  const stepIdx   = STEPS.indexOf(current);

  const canNext = () => {
    if (current === 'quiz') return quizDone;
    if (current === 'task') return taskDone;
    return true;
  };

  function goNext() {
    const next = STEPS[stepIdx + 1];
    if (!next) return;
    if (next === 'done') { onComplete(lesson); return; }
    setCurrent(next);
    setSelected(null);
    setWrongAns(false);
  }

  function handleAnswer(idx) {
    if (quizDone || selected !== null) return;
    setSelected(idx);
    const correct = questions[qIdx]?.correct === idx;
    setWrongAns(!correct);
    if (correct) {
      const newScore = score + 1;
      setScore(newScore);
      setTimeout(() => {
        if (qIdx + 1 < questions.length) {
          setQIdx(qIdx + 1);
          setSelected(null);
          setWrongAns(false);
        } else {
          setQuizDone(true);
          gainXP(Math.round((newScore / questions.length) * 20));
        }
      }, 700);
    }
  }

  function handleTaskSubmit() {
    if (taskText.trim().length < 5) return;
    setTaskDone(true);
  }

  // ── PROGRESS BAR ─────────────────────────────────────────────────────────────
  const pct = ((stepIdx) / (STEPS.length - 1)) * 100;

  return (
    <div className="page max-w-2xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center gap-4 mb-5">
        <button onClick={onBack} className="wii-btn wii-btn-ghost text-xs">← Back</button>
        <div className="flex-1 wii-progress-track">
          <div className="wii-progress-fill" style={{ width: `${pct}%`, background: world.color }} />
        </div>
        <span className="text-[11px] font-black" style={{ color: '#9AB5C0' }}>
          Step {stepIdx + 1} / {STEPS.length}
        </span>
      </div>

      {/* Card */}
      <div className="wii-card p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: world.color, boxShadow: `0 4px 12px ${world.color}55` }}>
            {lesson.icon}
          </div>
          <div>
            <p className="wii-section-label">{world.title} · Step {stepIdx + 1} / {STEPS.length}</p>
            <h1 className="font-black text-lg leading-snug" style={{ color: '#1E3A4A' }}>{lesson.title}</h1>
          </div>
        </div>

        {/* ── INTRO ── */}
        {current === 'intro' && (
          <div className="space-y-4">
            <div className="rounded-2xl p-4" style={{ background: 'rgba(0,154,199,0.07)', border: '1px solid rgba(0,154,199,0.15)' }}>
              <p className="text-[13px] font-semibold leading-relaxed" style={{ color: '#1E3A4A' }}>{lesson.desc}</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <span className="wii-badge" style={{ background: `${world.color}18`, color: world.color }}>⭐ +{lesson.xp} XP</span>
              <span className="wii-badge" style={{ background: 'rgba(0,154,199,0.08)', color: '#009AC7' }}>⏱ {lesson.time}</span>
              <span className="wii-badge" style={{ background: 'rgba(255,179,71,0.12)', color: '#D4831A' }}>{lesson.diff}</span>
              {questions.length > 0 && <span className="wii-badge" style={{ background: 'rgba(155,127,234,0.1)', color: '#9B7FEA' }}>❓ {questions.length} questions</span>}
            </div>
            <p className="text-[12px] font-semibold" style={{ color: '#9AB5C0' }}>
              Hey! I'm Ani. This lesson has <strong style={{ color: '#009AC7' }}>{questions.length} quiz question{questions.length !== 1 ? 's' : ''}</strong> and a practical task.
            </p>
          </div>
        )}

        {/* ── CONTENT ── */}
        {current === 'content' && (
          <div className="space-y-4">
            {lesson.videoId && (
              <div className="rounded-2xl overflow-hidden">
                <YouTubeEmbed videoId={lesson.videoId} title={lesson.title} onPlay={() => gainXP(5)} />
              </div>
            )}
            <div className="prose prose-sm max-w-none">
              {(lesson.content ?? '').split('\n\n').map((para, i) => (
                <p key={i} className="text-[13px] font-semibold leading-relaxed mb-3" style={{ color: '#1E3A4A' }}>{para}</p>
              ))}
            </div>
          </div>
        )}

        {/* ── QUIZ ── */}
        {current === 'quiz' && (
          <div className="space-y-4">
            {!quizDone ? (
              <>
                <div className="flex items-center justify-between mb-1">
                  <p className="wii-section-label">Question {qIdx + 1} of {questions.length}</p>
                  <span className="text-[11px] font-black" style={{ color: '#52C97C' }}>{score} correct</span>
                </div>
                <div className="wii-progress-track mb-4">
                  <div className="wii-progress-fill" style={{ width: `${((qIdx) / questions.length) * 100}%` }} />
                </div>
                <p className="font-black text-[15px] mb-4" style={{ color: '#1E3A4A' }}>
                  {questions[qIdx]?.q}
                </p>
                <div className="space-y-2">
                  {questions[qIdx]?.opts?.map((opt, i) => {
                    const isSelected = selected === i;
                    const isCorrect  = questions[qIdx].correct === i;
                    const showResult = selected !== null;
                    return (
                      <button key={i} onClick={() => handleAnswer(i)}
                        disabled={selected !== null}
                        className="w-full text-left px-4 py-3 rounded-2xl text-[13px] font-bold transition-all"
                        style={{
                          background: showResult
                            ? isCorrect ? 'rgba(82,201,124,0.15)' : isSelected ? 'rgba(255,87,87,0.12)' : 'rgba(255,255,255,0.85)'
                            : 'rgba(255,255,255,0.85)',
                          border: showResult
                            ? isCorrect ? '1.5px solid #52C97C' : isSelected ? '1.5px solid #FF5757' : '1.5px solid rgba(0,154,199,0.15)'
                            : '1.5px solid rgba(0,154,199,0.15)',
                          color: showResult ? isCorrect ? '#52C97C' : isSelected ? '#FF5757' : '#5A7A8A' : '#1E3A4A',
                        }}>
                        <span className="font-black mr-2" style={{ color: '#009AC7' }}>{String.fromCharCode(65 + i)}.</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {wrongAns && (
                  <p className="text-[12px] font-black" style={{ color: '#FF5757' }}>❌ Not quite — try again!</p>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <div className="text-5xl mb-3">🎉</div>
                <h3 className="font-black text-xl mb-2" style={{ color: '#1E3A4A' }}>Quiz Complete!</h3>
                <p className="font-black text-3xl mb-2" style={{ color: '#009AC7' }}>{score}/{questions.length}</p>
                <p className="text-[13px] font-semibold" style={{ color: '#7A9BAA' }}>
                  {score === questions.length ? 'Perfect score! 🌟' : score >= questions.length / 2 ? 'Great job! Keep going.' : 'Keep practising — you\'ve got this!'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── TASK ── */}
        {current === 'task' && (
          <div className="space-y-4">
            <h3 className="font-black text-base mb-1" style={{ color: '#1E3A4A' }}>Practical Task ✏️</h3>
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,179,71,0.08)', border: '1px solid rgba(255,179,71,0.25)' }}>
              <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: '#D4831A' }}>Your Task</p>
              {/* ← Plain text render, no sanitize, so & shows correctly */}
              <p className="text-[13px] font-bold leading-relaxed" style={{ color: '#1E3A4A' }}>{lesson.task}</p>
            </div>

            {!taskDone ? (
              <>
                {/* ← Plain onChange, NO sanitize — sanitize was converting & to &amp; in real-time */}
                <textarea
                  className="wii-input resize-none"
                  rows={5}
                  placeholder="Write your answer here (minimum 5 characters)…"
                  value={taskText}
                  onChange={(e) => setTaskText(e.target.value)}
                />
                <button
                  onClick={handleTaskSubmit}
                  disabled={taskText.trim().length < 5}
                  className="wii-btn wii-btn-primary w-full justify-center"
                  style={{ opacity: taskText.trim().length < 5 ? 0.5 : 1 }}>
                  Submit Task ✓
                </button>
              </>
            ) : (
              <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(82,201,124,0.1)', border: '1px solid rgba(82,201,124,0.3)' }}>
                <p className="text-2xl mb-2">🎉</p>
                <p className="font-black text-[14px]" style={{ color: '#52C97C' }}>Task submitted! Great work.</p>
                <p className="text-[12px] font-semibold mt-1" style={{ color: '#7A9BAA' }}>Keep practising this concept.</p>
              </div>
            )}
          </div>
        )}

        {/* ── DONE ── */}
        {current === 'done' && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="font-black text-2xl mb-2" style={{ color: '#1E3A4A' }}>Lesson Complete!</h2>
            <p className="font-black text-xl mb-4" style={{ color: '#D4831A' }}>+{lesson.xp} XP earned</p>
            <p className="text-[13px] font-semibold mb-6" style={{ color: '#7A9BAA' }}>You finished <strong>{lesson.title}</strong>. Keep going!</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4" style={{ borderTop: '1px solid rgba(0,154,199,0.1)' }}>
          <button
            onClick={() => { const prev = STEPS[stepIdx - 1]; if (prev) setCurrent(prev); }}
            disabled={stepIdx === 0}
            className="wii-btn wii-btn-ghost text-xs"
            style={{ opacity: stepIdx === 0 ? 0.3 : 1 }}>
            ← Previous
          </button>
          <button
            onClick={current === 'done' ? () => onComplete(lesson) : goNext}
            disabled={!canNext()}
            className="wii-btn wii-btn-primary text-xs"
            style={{ opacity: !canNext() ? 0.4 : 1 }}>
            {current === 'task' && !taskDone ? 'Submit task to continue'
              : current === 'done' ? 'Finish 🎉'
              : current === 'quiz' && !quizDone ? 'Answer all questions'
              : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
