'use client';
import { useState, useMemo } from 'react';
import Mascot            from '../ui/Mascot';
import InteractiveContent from './InteractiveContent';
import MiniCanvasChallenge from './exercises/MiniCanvasChallenge';
import { sanitize }      from '../../lib/utils';
import { useApp }        from '../../lib/store';

const STEPS = ['intro', 'content', 'quiz', 'task', 'done'];

export default function ActiveLesson({ lesson, world, onComplete, onBack }) {
  const { dispatch } = useApp();

  const questions = useMemo(() => {
    if (!lesson.quiz) return [];
    if (Array.isArray(lesson.quiz)) return lesson.quiz;
    return [lesson.quiz];
  }, [lesson.quiz]);

  const [step,             setStep]           = useState(0);
  const [qIdx,             setQIdx]           = useState(0);
  const [answers,          setAnswers]         = useState([]);
  const [checked,          setChecked]         = useState(false);
  const [taskText,         setTaskText]        = useState('');
  const [taskDone,         setTaskDone]        = useState(false);
  const [quizDone,         setQuizDone]        = useState(false);
  const [exerciseDone,     setExerciseDone]    = useState(false);

  const current    = STEPS[step];
  const currentQ   = questions[qIdx] ?? null;
  const currentAns = answers[qIdx] ?? null;
  const isCorrect  = currentAns === currentQ?.correct;
  const correctCount  = answers.filter((a, i) => a === questions[i]?.correct).length;
  const quizScore  = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 100;

  // Task can be completed via the mini canvas OR text submission
  const hasCanvasTask = lesson.interactive?.taskType === 'canvas';

  const canAdvance = () => {
    if (current === 'quiz') return quizDone;
    if (current === 'task') return taskDone;
    return true;
  };

  const handleAnswer = (idx) => {
    if (checked) return;
    setAnswers((prev) => { const a = [...prev]; a[qIdx] = idx; return a; });
  };

  const handleCheck = () => {
    if (currentAns === null || currentAns === undefined) return;
    setChecked(true);
  };

  const handleNextQ = () => {
    if (qIdx < questions.length - 1) {
      setQIdx(qIdx + 1);
      setChecked(false);
    } else {
      setQuizDone(true);
      const quizXP = Math.round((lesson.xp * 0.3) * (quizScore / 100));
      if (quizXP > 0) dispatch({ type: 'GAIN_XP', amount: quizXP, x: 700, y: 350 });
      dispatch({ type: 'COMPLETE_QUEST', id: 6 });
    }
  };

  const goNext = () => {
    if (!canAdvance()) return;
    setStep((s) => s + 1);
  };

  const goPrev = () => {
    if (step === 0) { onBack(); return; }
    setStep((s) => s - 1);
    setChecked(false);
  };

  const handleComplete = () => onComplete(lesson);

  // Step label map
  const STEP_LABELS = ['Intro', 'Content', 'Quiz', 'Task', 'Done'];

  return (
    <div className="page max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 font-bold text-[13px] mb-5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        ← Back to Lessons
      </button>

      <div className="card p-8">
        {/* Progress bar with step labels */}
        <div className="mb-7">
          <div className="flex gap-1.5 mb-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className="flex-1 h-1.5 rounded-full transition-colors duration-300"
                style={{ background: i <= step ? world.color : '#E5E7EB' }} />
            ))}
          </div>
          <div className="flex justify-between">
            {STEP_LABELS.map((label, i) => (
              <span key={i} className="text-[9px] font-black"
                style={{ color: i === step ? world.color : '#D1D5DB' }}>
                {label}
              </span>
            ))}
          </div>
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

        {/* ── INTRO ──────────────────────────────────────────────────────── */}
        {current === 'intro' && (
          <div>
            <div className="rounded-xl px-5 py-4 mb-5 border-l-4"
              style={{ background: '#EBF2FF', borderColor: '#5B9CF6' }}>
              <p className="text-xs font-black mb-1" style={{ color: '#3B7DE0' }}>LEARNING OBJECTIVE</p>
              <p className="text-[14px] font-semibold text-gray-800 leading-relaxed">{lesson.desc}</p>
            </div>

            {/* What's inside this lesson */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { icon: '📖', label: 'Content', desc: 'Learn the concept' },
                { icon: '🧠', label: `${questions.length} Questions`, desc: 'Test your knowledge' },
                { icon: lesson.interactive?.taskType === 'canvas' ? '🎨' : '✏️',
                  label: 'Task', desc: lesson.interactive?.taskType === 'canvas' ? 'Draw your answer' : 'Written practice' },
              ].map(({ icon, label, desc }) => (
                <div key={label} className="bg-blue-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                  <div className="text-xl mb-1">{icon}</div>
                  <div className="font-black text-xs">{label}</div>
                  <div className="text-[10px] text-gray-400 font-semibold">{desc}</div>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-3">
              <Mascot size={44} mood="happy" animate={false} />
              <div className="flex-1 bg-blue-50 dark:bg-gray-800 rounded-xl px-4 py-3">
                <p className="text-[13px] text-gray-600 dark:text-gray-300 font-semibold leading-relaxed">
                  Hey! I'm Ani. This lesson has{' '}
                  <strong>{questions.length} quiz question{questions.length !== 1 ? 's' : ''}</strong>
                  {lesson.interactive && <span> and an <strong>interactive exercise</strong></span>}.
                  Take your time — animation is about understanding, not speed! 🎬
                </p>
              </div>
            </div>

            {lesson.xp > 0 && (
              <div className="flex gap-3 mt-4 text-xs font-black flex-wrap">
                <span className="tag bg-amber-50 dark:bg-amber-950/30 text-amber-700">+{lesson.xp} XP on completion</span>
                <span className="tag bg-blue-50 dark:bg-blue-950/30 text-blue-700">+{Math.round(lesson.xp * 0.3)} bonus XP for quiz</span>
                {lesson.interactive && (
                  <span className="tag bg-purple-50 dark:bg-purple-950/30 text-purple-700">🎮 Interactive exercise</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── CONTENT (now interactive) ────────────────────────────────── */}
        {current === 'content' && (
          <InteractiveContent
            lesson={lesson}
            world={world}
            onExerciseComplete={(correct) => setExerciseDone(true)}
          />
        )}

        {/* ── QUIZ (multi-question) ─────────────────────────────────────── */}
        {current === 'quiz' && !quizDone && currentQ && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-base">Quiz 🧠</h3>
              <div className="flex items-center gap-1.5">
                {questions.map((_, i) => (
                  <div key={i} className="w-2.5 h-2.5 rounded-full transition-colors"
                    style={{
                      background: i < qIdx ? world.color : i === qIdx ? '#5B9CF6' : '#E5E7EB'
                    }} />
                ))}
                <span className="text-xs text-gray-400 font-bold ml-2">{qIdx + 1}/{questions.length}</span>
              </div>
            </div>

            <p className="text-[14px] font-semibold text-gray-700 dark:text-gray-300 mb-5 leading-snug">
              {currentQ.q}
            </p>

            <div className="space-y-2.5">
              {currentQ.opts.map((opt, i) => {
                let cls = 'bg-blue-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200';
                if (checked) {
                  if (i === currentQ.correct)
                    cls = 'bg-green-50 dark:bg-green-950/30 border-green-400 text-green-800 dark:text-green-300';
                  else if (i === currentAns)
                    cls = 'bg-red-50 dark:bg-red-950/30 border-red-400 text-red-700 dark:text-red-300';
                } else if (currentAns === i) {
                  cls = 'bg-primary-light border-primary text-primary-dark';
                }
                return (
                  <button key={i} onClick={() => handleAnswer(i)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 font-bold text-[13px] transition-all ${cls} ${
                      !checked ? 'hover:border-primary cursor-pointer' : 'cursor-default'
                    }`}>
                    <span className="opacity-50 mr-2">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                    {checked && i === currentQ.correct && ' ✓'}
                    {checked && i === currentAns && currentAns !== currentQ.correct && ' ✗'}
                  </button>
                );
              })}
            </div>

            {currentAns !== null && currentAns !== undefined && !checked && (
              <button onClick={handleCheck} className="btn btn-primary w-full mt-4 justify-center">
                Check Answer
              </button>
            )}

            {checked && (
              <div className={`mt-4 px-4 py-3 rounded-xl text-[13px] font-bold ${
                isCorrect
                  ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
              }`}>
                {isCorrect
                  ? '🎉 Correct!'
                  : `💡 The correct answer is "${currentQ.opts[currentQ.correct]}"`}
              </div>
            )}

            {checked && (
              <button onClick={handleNextQ} className="btn btn-primary w-full mt-3 justify-center">
                {qIdx < questions.length - 1 ? 'Next Question →' : 'Finish Quiz ✓'}
              </button>
            )}
          </div>
        )}

        {/* ── QUIZ RESULTS ─────────────────────────────────────────────── */}
        {current === 'quiz' && quizDone && (
          <div className="text-center py-4">
            <div className="text-5xl mb-3">
              {quizScore >= 80 ? '🏆' : quizScore >= 60 ? '👍' : '💪'}
            </div>
            <h3 className="font-black text-xl mb-2">Quiz Complete!</h3>
            <div className="text-4xl font-black mb-2"
              style={{ color: quizScore >= 80 ? '#52C97C' : quizScore >= 60 ? '#FFB347' : '#FF5757' }}>
              {quizScore}%
            </div>
            <p className="text-gray-500 text-sm font-semibold mb-4">
              {correctCount} of {questions.length} questions correct
            </p>
            {/* Per-question results */}
            <div className="flex justify-center gap-3 mb-2">
              {questions.map((q, i) => (
                <div key={i}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black ${
                    answers[i] === q.correct ? 'bg-green-400' : 'bg-red-400'
                  }`}>
                  {answers[i] === q.correct ? '✓' : '✗'}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TASK ─────────────────────────────────────────────────────── */}
        {current === 'task' && (
          <div>
            <h3 className="font-black text-base mb-1">Practical Task ✏️</h3>
            <div className="rounded-xl px-5 py-4 border-l-4 mb-4"
              style={{ background: '#FFF8ED', borderColor: '#FFB347' }}>
              <p className="text-xs font-black text-amber-700 mb-1">YOUR TASK</p>
              <p className="text-[13px] font-bold text-gray-800 leading-relaxed">{lesson.task}</p>
            </div>

            {/* Canvas task for drawing-type exercises */}
            {hasCanvasTask ? (
              <MiniCanvasChallenge
                prompt={lesson.task}
                onComplete={() => setTaskDone(true)}
              />
            ) : (
              <>
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
                    className={`btn btn-primary w-full justify-center ${
                      taskText.trim().length < 5 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}>
                    Submit Task ✓
                  </button>
                ) : (
                  <div className="px-4 py-3 rounded-xl bg-green-50 dark:bg-green-950/30 text-[13px] font-bold text-green-700 dark:text-green-400">
                    🎉 Task submitted! Great work. Keep practising this concept.
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── DONE ─────────────────────────────────────────────────────── */}
        {current === 'done' && (
          <div className="text-center py-4">
            <div className="text-6xl mb-4 animate-level-up inline-block">🎉</div>
            <h3 className="font-black text-2xl mb-2">Lesson Complete!</h3>
            <p className="text-gray-500 text-[13px] font-semibold leading-relaxed mb-5 max-w-xs mx-auto">
              You've completed{' '}
              <strong className="text-gray-700 dark:text-gray-300">"{lesson.title}"</strong>.
              Your skills have been updated!
            </p>
            <div className="flex gap-3 justify-center mb-4">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-lg"
                style={{ background: '#FFF8ED', color: '#D4831A' }}>
                +{lesson.xp} XP ⭐
              </div>
            </div>
            {lesson.skills && Object.entries(lesson.skills).filter(([, v]) => v > 0).length > 0 && (
              <div className="bg-blue-50 dark:bg-gray-800 rounded-xl px-4 py-3 mb-4 inline-block">
                <p className="text-xs font-black text-gray-400 mb-2 uppercase">Skills Improved</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {Object.entries(lesson.skills).filter(([, v]) => v > 0).map(([k, v]) => (
                    <span key={k} className="tag bg-green-100 dark:bg-green-950/30 text-green-700 text-[10px]">
                      +{v} {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <Mascot size={80} mood="excited" animate className="mx-auto" />
          </div>
        )}

        {/* Nav buttons */}
        <div className="flex justify-between mt-8 pt-5 border-t border-gray-100 dark:border-gray-800">
          <button onClick={goPrev} className="btn btn-secondary">
            ← {step === 0 ? 'Exit' : 'Back'}
          </button>

          {current === 'quiz' && !quizDone ? (
            <span />
          ) : step < STEPS.length - 1 ? (
            <button onClick={goNext} disabled={!canAdvance()}
              className={`btn btn-primary ${!canAdvance() ? 'opacity-50 cursor-not-allowed' : ''}`}>
              Continue →
            </button>
          ) : (
            <button onClick={handleComplete}
              className="btn text-white font-black"
              style={{ background: 'linear-gradient(135deg,#52C97C,#5B9CF6)' }}>
              🎬 Complete &amp; Earn XP!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
