'use client';
import { useState, useMemo } from 'react';
import Mascot            from '../ui/Mascot';
import InteractiveContent from './InteractiveContent';
import MiniCanvasChallenge from './exercises/MiniCanvasChallenge';
import { sanitize }      from '../../lib/utils';
import { useApp }        from '../../lib/store';

const STEPS        = ['intro', 'learn', 'visual', 'quiz', 'practice', 'reflection', 'done'];
const STEP_LABELS  = ['Intro', 'Learn', 'Visual', 'Quiz', 'Practice', 'Reflect', 'Done'];
const STEP_ICONS   = ['🎯', '📖', '🎬', '🧠', '✏️', '💭', '🏆'];

const VARIATION_CONFIG = {
  breakdown: { label: 'Breakdown Lesson', icon: '🔍', color: '#5B9CF6' },
  build:     { label: 'Build Lesson',     icon: '🔨', color: '#52C97C' },
  fix:       { label: 'Fix Lesson',       icon: '🔧', color: '#FFB347' },
  compare:   { label: 'Compare Lesson',   icon: '⚖️', color: '#9B7FEA' },
  story:     { label: 'Story Lesson',     icon: '📖', color: '#FF8FAB' },
};

// ── Frame-by-frame breakdown ──────────────────────────────────────────────────
function FrameBreakdown({ frames }) {
  const [active, setActive] = useState(0);
  if (!frames?.length) return null;
  const frame = frames[active];
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 mb-5">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div>
          <p className="font-black text-xs text-primary">🎬 Frame-by-Frame Breakdown</p>
          <p className="text-[10px] text-gray-400 font-semibold">Scrub through to see the principle in action</p>
        </div>
        <span className="tag bg-primary-light text-primary-dark text-[9px]">Frame {active + 1}/{frames.length}</span>
      </div>
      <div className="p-5">
        <div className="rounded-xl mb-4 flex items-center justify-center text-5xl py-8"
          style={{ background: frame.bg ?? '#F5F9FF', minHeight: 120 }}>
          {frame.visual ?? '🎬'}
        </div>
        <div className="bg-blue-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
          <p className="font-black text-sm mb-1">{frame.title}</p>
          <p className="text-[13px] font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{frame.desc}</p>
          {frame.principle && (
            <span className="inline-block mt-2 text-[9px] font-black text-primary bg-primary-light px-2 py-0.5 rounded-full uppercase">
              {frame.principle}
            </span>
          )}
        </div>
        <input type="range" min={0} max={frames.length - 1} value={active}
          onChange={(e) => setActive(+e.target.value)}
          className="w-full accent-primary h-2 rounded-full cursor-pointer mb-2" />
        <div className="flex justify-between">
          {frames.map((_, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`flex flex-col items-center gap-0.5 transition-all ${active === i ? 'opacity-100' : 'opacity-35'}`}>
              <div className={`rounded-full transition-all ${active === i ? 'bg-primary w-3 h-3' : 'bg-gray-300 w-2 h-2'}`} />
              <span className="text-[8px] font-bold text-gray-400">{i + 1}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Interactive video with pause questions ────────────────────────────────────
function InteractiveVideo({ videoId, title, pauseQuestions }) {
  const [active,   setActive]   = useState(false);
  const [qIdx,     setQIdx]     = useState(0);
  const [showQ,    setShowQ]    = useState(false);
  const [answered, setAnswered] = useState({});

  if (!videoId) return (
    <div className="text-center py-10 text-gray-400 mb-5">
      <div className="text-4xl mb-3">🎬</div>
      <p className="font-bold text-sm">No video for this lesson yet.</p>
    </div>
  );

  const handleVideoClick = () => {
    setActive(true);
    if (pauseQuestions?.[0]) {
      setTimeout(() => setShowQ(true), (pauseQuestions[0].atSecond ?? 8) * 1000);
    }
  };

  const handleAnswer = (qi, answer) => {
    setAnswered((prev) => ({ ...prev, [qi]: answer }));
    setShowQ(false);
    const next = pauseQuestions?.[qi + 1];
    if (next) setTimeout(() => { setQIdx(qi + 1); setShowQ(true); }, next.atSecond * 1000);
  };

  const currentQ = pauseQuestions?.[qIdx];

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <p className="font-black text-xs text-primary">▶ Interactive Video</p>
        {pauseQuestions?.length > 0 && (
          <span className="tag bg-amber-50 text-amber-700 text-[9px]">⏸ {pauseQuestions.length} pause questions</span>
        )}
      </div>
      <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 relative">
        {active ? (
          <>
            <div className="relative aspect-video bg-black">
              <iframe className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen />
            </div>
            {showQ && currentQ && (
              <div className="absolute inset-0 bg-black/75 flex items-center justify-center p-6 z-10 animate-fade-up">
                <div className="card p-5 max-w-sm w-full">
                  <p className="text-[10px] font-black text-primary uppercase mb-2">⏸ Pause & Think</p>
                  <p className="font-semibold text-[14px] text-gray-800 dark:text-gray-200 mb-4 leading-snug">{currentQ.question}</p>
                  <div className="space-y-2">
                    {currentQ.opts.map((opt, i) => (
                      <button key={i} onClick={() => handleAnswer(qIdx, i)}
                        className="w-full text-left px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-gray-800 text-[13px] font-bold hover:border-primary transition-all">
                        <span className="opacity-50 mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="relative aspect-video cursor-pointer group bg-gray-900" onClick={handleVideoClick}>
            <img src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} alt={title}
              className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center group-hover:scale-110 transition-transform shadow-medium">
                <span className="text-2xl ml-1">▶</span>
              </div>
            </div>
            {pauseQuestions?.length > 0 && (
              <div className="absolute bottom-3 left-3 bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded-lg">
                ⏸ {pauseQuestions.length} questions will pause this video
              </div>
            )}
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-black px-2 py-1 rounded-lg">
              {title}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Quiz step ─────────────────────────────────────────────────────────────────
function QuizStep({ questions, world, lesson, onComplete }) {
  const [qIdx,    setQIdx]    = useState(0);
  const [answers, setAnswers] = useState([]);
  const [checked, setChecked] = useState(false);
  const [done,    setDone]    = useState(false);
  const { dispatch } = useApp();

  const currentQ   = questions[qIdx];
  const currentAns = answers[qIdx] ?? null;
  const isCorrect  = currentAns === currentQ?.correct;
  const correctCount = answers.filter((a, i) => a === questions[i]?.correct).length;
  const quizScore    = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 100;

  const handleNextQ = () => {
    if (qIdx < questions.length - 1) { setQIdx(qIdx + 1); setChecked(false); }
    else {
      setDone(true);
      const bonus = Math.round((lesson.xp * 0.3) * (quizScore / 100));
      if (bonus > 0) dispatch({ type: 'GAIN_XP', amount: bonus, x: 700, y: 350 });
      dispatch({ type: 'COMPLETE_QUEST', id: 6 });
      onComplete(quizScore);
    }
  };

  if (done) return (
    <div className="text-center py-4">
      <div className="text-5xl mb-3">{quizScore >= 80 ? '🏆' : quizScore >= 60 ? '👍' : '💪'}</div>
      <h3 className="font-black text-xl mb-2">Quiz Complete!</h3>
      <div className="text-4xl font-black mb-2" style={{ color: quizScore >= 80 ? '#52C97C' : quizScore >= 60 ? '#FFB347' : '#FF5757' }}>
        {quizScore}%
      </div>
      <p className="text-gray-500 text-sm font-semibold mb-4">{correctCount} of {questions.length} correct</p>
      <div className="flex justify-center gap-2 flex-wrap">
        {questions.map((q, i) => (
          <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black ${answers[i] === q.correct ? 'bg-green-400' : 'bg-red-400'}`}>
            {answers[i] === q.correct ? '✓' : '✗'}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-base">Quiz 🧠</h3>
        <div className="flex items-center gap-1.5">
          {questions.map((_, i) => (
            <div key={i} className="rounded-full transition-all"
              style={{ background: i < qIdx ? world.color : i === qIdx ? '#5B9CF6' : '#E5E7EB',
                       width: i === qIdx ? 10 : 8, height: i === qIdx ? 10 : 8 }} />
          ))}
          <span className="text-xs text-gray-400 font-bold ml-1">{qIdx + 1}/{questions.length}</span>
        </div>
      </div>

      {currentQ?.type && (
        <span className="tag bg-primary-light text-primary-dark text-[9px] mb-3 inline-block">
          {currentQ.type === 'scenario' ? '🎬 Scenario' : currentQ.type === 'visual' ? '🖼 Visual' : '📝 Knowledge'}
        </span>
      )}

      <p className="text-[14px] font-semibold text-gray-700 dark:text-gray-300 mb-5 leading-snug">{currentQ?.q}</p>

      {currentQ?.context && (
        <div className="bg-blue-50 dark:bg-gray-800 rounded-xl px-4 py-3 mb-4 text-xs font-semibold text-gray-600 dark:text-gray-400 italic leading-relaxed">
          "{currentQ.context}"
        </div>
      )}

      <div className="space-y-2.5">
        {currentQ?.opts.map((opt, i) => {
          let cls = 'bg-blue-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200';
          if (checked) {
            if (i === currentQ.correct) cls = 'bg-green-50 dark:bg-green-950/30 border-green-400 text-green-800 dark:text-green-300';
            else if (i === currentAns)  cls = 'bg-red-50 dark:bg-red-950/30 border-red-400 text-red-700 dark:text-red-300';
          } else if (currentAns === i) cls = 'bg-primary-light border-primary text-primary-dark';
          return (
            <button key={i} onClick={() => { if (!checked) setAnswers((p) => { const a = [...p]; a[qIdx] = i; return a; }); }}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 font-bold text-[13px] transition-all ${cls} ${!checked ? 'hover:border-primary cursor-pointer' : 'cursor-default'}`}>
              <span className="opacity-50 mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
              {checked && i === currentQ.correct && ' ✓'}
              {checked && i === currentAns && currentAns !== currentQ.correct && ' ✗'}
            </button>
          );
        })}
      </div>

      {currentQ?.explanation && checked && (
        <div className="mt-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-gray-800 text-[12px] font-semibold text-gray-600 dark:text-gray-400 leading-relaxed">
          💡 {currentQ.explanation}
        </div>
      )}

      {currentAns !== null && !checked && (
        <button onClick={() => setChecked(true)} className="btn btn-primary w-full mt-4 justify-center">Check Answer</button>
      )}
      {checked && (
        <>
          <div className={`mt-3 px-4 py-3 rounded-xl text-[13px] font-bold ${isCorrect ? 'bg-green-50 dark:bg-green-950/30 text-green-700' : 'bg-red-50 dark:bg-red-950/30 text-red-600'}`}>
            {isCorrect ? '🎉 Correct!' : `💡 Answer: "${currentQ?.opts[currentQ?.correct]}"`}
          </div>
          <button onClick={handleNextQ} className="btn btn-primary w-full mt-3 justify-center">
            {qIdx < questions.length - 1 ? `Next (${qIdx + 2}/${questions.length}) →` : 'Finish Quiz ✓'}
          </button>
        </>
      )}
    </div>
  );
}

// ── Practice step ─────────────────────────────────────────────────────────────
function PracticeStep({ lesson, world, onComplete }) {
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);
  const variation = lesson.variation ?? 'breakdown';
  const isCanvas  = variation === 'build' || variation === 'fix';

  const handleSubmit = () => {
    if (text.trim().length < 10) return;
    setDone(true); onComplete();
  };

  return (
    <div>
      <div className="rounded-xl px-5 py-4 border-l-4 mb-4"
        style={{ background: '#FFF8ED', borderColor: '#FFB347' }}>
        <p className="text-[10px] font-black text-amber-700 mb-1 uppercase">
          {variation === 'fix' ? '🔧 Fix This Animation' : variation === 'build' ? '🔨 Build Challenge' : variation === 'compare' ? '⚖️ Compare & Contrast' : '✏️ Practice Task'}
        </p>
        <p className="text-[13px] font-bold text-gray-800 leading-relaxed">{lesson.practice ?? lesson.task}</p>
      </div>

      {isCanvas ? (
        <MiniCanvasChallenge prompt={lesson.practice ?? lesson.task} onComplete={() => { setDone(true); onComplete(); }} />
      ) : !done ? (
        <>
          <textarea value={text} onChange={(e) => setText(sanitize(e.target.value))}
            placeholder="Write your detailed response — be specific about frames, timing, principles used..."
            rows={6} className="field resize-none mb-3" />
          <div className="flex justify-between items-center mb-3">
            <p className="text-[10px] text-gray-400 font-semibold">
              {text.trim().length < 10 ? `${10 - text.trim().length} more chars needed` : '✓ Ready'}
            </p>
            <p className="text-[10px] text-gray-400">{text.trim().length} chars</p>
          </div>
          <button onClick={handleSubmit} disabled={text.trim().length < 10}
            className={`btn btn-primary w-full justify-center ${text.trim().length < 10 ? 'opacity-50 cursor-not-allowed' : ''}`}>
            Submit Practice ✓
          </button>
        </>
      ) : (
        <div className="bg-green-50 dark:bg-green-950/30 rounded-xl px-4 py-3 text-[13px] font-bold text-green-700">
          🎉 Practice submitted! Excellent work.
        </div>
      )}
    </div>
  );
}

// ── Reflection step ───────────────────────────────────────────────────────────
function ReflectionStep({ lesson, onComplete }) {
  const [learned,    setLearned]    = useState('');
  const [difficult,  setDifficult]  = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback,   setFeedback]   = useState(null);
  const { gainXP, gainSkills } = useApp();

  const handleSubmit = async () => {
    if (learned.trim().length < 10) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: `You are Ani, a warm animation coach. A student just completed "${lesson.title}". Give 2-3 sentences of specific encouraging feedback on their reflection. End with: <skillUpdate>{"timing":0,"squash":0,"anticipation":0,"followThrough":0,"weight":0,"smoothness":0,"creativity":0,"consistency":0,"cinematography":0,"motionDesign":0,"vfx":0,"storytelling":0,"xp":15}</skillUpdate>`,
          messages: [{ role: 'user', content: `What I learned: ${sanitize(learned)}\nWhat was difficult: ${sanitize(difficult)}` }],
        }),
      });
      const data = await res.json();
      const raw  = data.reply ?? "Great reflection! That kind of self-awareness is exactly how great animators grow. 🎬";
      const match = raw.match(/<skillUpdate>([\s\S]*?)<\/skillUpdate>/);
      if (match) {
        try {
          const { xp: xpAward, ...deltas } = JSON.parse(match[1]);
          const filtered = Object.fromEntries(Object.entries(deltas).filter(([, v]) => v > 0));
          if (Object.keys(filtered).length > 0) gainSkills(filtered);
          if (xpAward > 0) gainXP(xpAward, 700, 400);
        } catch {}
      }
      setFeedback(raw.replace(/<skillUpdate>[\s\S]*?<\/skillUpdate>/g, '').trim());
      onComplete();
    } catch {
      setFeedback("Excellent reflection! Self-awareness is what separates good animators from great ones. 🎬");
      onComplete();
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="flex items-start gap-3 mb-5">
        <Mascot size={44} mood={feedback ? 'excited' : 'thinking'} animate={false} />
        <div className="flex-1 bg-blue-50 dark:bg-gray-800 rounded-xl px-4 py-3">
          <p className="text-[13px] text-gray-600 dark:text-gray-300 font-semibold leading-relaxed">
            {feedback ? "Here's my feedback on your reflection:" : "Before we finish — take a moment to reflect. This is how professionals grow. 💭"}
          </p>
        </div>
      </div>

      {feedback ? (
        <div className="card p-5" style={{ background: 'linear-gradient(135deg,#EBF2FF,#F3EFFE)' }}>
          <div className="flex items-start gap-3">
            <Mascot size={36} mood="excited" animate={false} className="flex-shrink-0" />
            <div>
              <p className="text-[10px] font-black text-primary uppercase mb-2">Ani's Feedback</p>
              <p className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 leading-relaxed">{feedback}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">What did you learn? *</label>
            <textarea value={learned} onChange={(e) => setLearned(e.target.value)}
              placeholder="e.g. I learned that timing communicates weight — more frames means heavier..."
              rows={3} className="field resize-none" />
          </div>
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">What was difficult? (optional)</label>
            <textarea value={difficult} onChange={(e) => setDifficult(e.target.value)}
              placeholder="e.g. I found it hard to visualise the spacing at the arc peak..."
              rows={3} className="field resize-none" />
          </div>
          <button onClick={handleSubmit} disabled={learned.trim().length < 10 || submitting}
            className={`btn btn-primary w-full justify-center ${learned.trim().length < 10 || submitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {submitting
              ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Ani is thinking…</>
              : '💭 Submit Reflection →'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ActiveLesson({ lesson, world, onComplete, onBack }) {
  const { dispatch } = useApp();
  const [step,         setStep]         = useState(0);
  const [quizScore,    setQuizScore]    = useState(null);
  const [practiceOk,   setPracticeOk]   = useState(false);
  const [reflectionOk, setReflectionOk] = useState(false);

  const current   = STEPS[step];
  const questions = useMemo(() => {
    if (!lesson.quiz) return [];
    return Array.isArray(lesson.quiz) ? lesson.quiz : [lesson.quiz];
  }, [lesson.quiz]);

  const variation = lesson.variation ?? 'breakdown';
  const varConfig = VARIATION_CONFIG[variation] ?? VARIATION_CONFIG.breakdown;

  const canAdvance = () => {
    if (current === 'quiz')       return quizScore !== null;
    if (current === 'practice')   return practiceOk;
    if (current === 'reflection') return reflectionOk;
    return true;
  };

  return (
    <div className="page max-w-2xl mx-auto">
      <button onClick={onBack}
        className="flex items-center gap-2 text-gray-400 font-bold text-[13px] mb-5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
        ← Back to Lessons
      </button>

      <div className="card p-8">
        {/* Progress bar */}
        <div className="mb-7">
          <div className="flex gap-1.5 mb-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className="flex-1 h-1.5 rounded-full transition-colors duration-300"
                style={{ background: i <= step ? world.color : '#E5E7EB' }} />
            ))}
          </div>
          <div className="flex justify-between">
            {STEPS.map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <span className="text-sm" style={{ opacity: i === step ? 1 : 0.35 }}>{STEP_ICONS[i]}</span>
                <span className="text-[8px] font-black" style={{ color: i === step ? world.color : '#D1D5DB' }}>{STEP_LABELS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: `${world.color}22` }}>{lesson.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{world.title} · Step {step + 1}/{STEPS.length}</p>
              <span className="tag text-[9px]" style={{ background: `${varConfig.color}18`, color: varConfig.color }}>
                {varConfig.icon} {varConfig.label}
              </span>
            </div>
            <h2 className="font-black text-xl leading-tight">{lesson.title}</h2>
          </div>
        </div>

        {/* Step content */}
        {current === 'intro' && (
          <div>
            <div className="rounded-xl px-5 py-4 mb-5 border-l-4" style={{ background: '#EBF2FF', borderColor: '#5B9CF6' }}>
              <p className="text-xs font-black mb-1 text-primary">LEARNING OBJECTIVE</p>
              <p className="text-[14px] font-semibold text-gray-800 leading-relaxed">{lesson.desc}</p>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-5">
              {[
                { icon: '📖', label: 'Learn', desc: 'Deep content' },
                { icon: '🎬', label: 'Visual', desc: lesson.frameBreakdown ? 'Breakdown' : 'Video' },
                { icon: '🧠', label: `${questions.length}Q`, desc: 'Quiz' },
                { icon: varConfig.icon, label: 'Practice', desc: varConfig.label },
              ].map(({ icon, label, desc }) => (
                <div key={label} className="bg-blue-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                  <div className="text-xl mb-1">{icon}</div>
                  <div className="font-black text-xs">{label}</div>
                  <div className="text-[9px] text-gray-400 font-semibold">{desc}</div>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-3">
              <Mascot size={44} mood="happy" animate={false} />
              <div className="flex-1 bg-blue-50 dark:bg-gray-800 rounded-xl px-4 py-3">
                <p className="text-[13px] text-gray-600 dark:text-gray-300 font-semibold leading-relaxed">
                  This is a <strong>{varConfig.label}</strong>. You'll learn, see it in action, test your knowledge, practice, and reflect with AI feedback. Let's go! 🎬
                </p>
              </div>
            </div>
            {lesson.xp > 0 && (
              <div className="flex gap-3 mt-4 text-xs font-black flex-wrap">
                <span className="tag bg-amber-50 dark:bg-amber-950/30 text-amber-700">+{lesson.xp} XP</span>
                <span className="tag bg-blue-50 dark:bg-blue-950/30 text-blue-700">+{Math.round(lesson.xp * 0.3)} quiz bonus</span>
                <span className="tag bg-purple-50 dark:bg-purple-950/30 text-purple-700">🤖 AI reflection</span>
              </div>
            )}
          </div>
        )}

        {current === 'learn' && (
          <InteractiveContent lesson={lesson} world={world} onExerciseComplete={() => {}} />
        )}

        {current === 'visual' && (
          <div>
            {lesson.frameBreakdown && <FrameBreakdown frames={lesson.frameBreakdown} />}
            <InteractiveVideo videoId={lesson.videoId} title={lesson.title} pauseQuestions={lesson.pauseQuestions} />
          </div>
        )}

        {current === 'quiz' && (
          <QuizStep questions={questions} world={world} lesson={lesson} onComplete={(score) => setQuizScore(score)} />
        )}

        {current === 'practice' && (
          <PracticeStep lesson={lesson} world={world} onComplete={() => setPracticeOk(true)} />
        )}

        {current === 'reflection' && (
          <ReflectionStep lesson={lesson} onComplete={() => setReflectionOk(true)} />
        )}

        {current === 'done' && (
          <div className="text-center py-4">
            <div className="text-6xl mb-4 animate-level-up inline-block">🎉</div>
            <h3 className="font-black text-2xl mb-2">Mission Complete!</h3>
            {quizScore !== null && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3 font-black text-sm"
                style={{ background: quizScore >= 80 ? '#EDFBF3' : '#FFF8ED', color: quizScore >= 80 ? '#2DA05A' : '#D4831A' }}>
                Quiz: {quizScore}% {quizScore >= 80 ? '🏆' : ''}
              </div>
            )}
            <p className="text-gray-500 text-[13px] font-semibold leading-relaxed mb-5 max-w-xs mx-auto">
              You've completed <strong className="text-gray-700 dark:text-gray-300">"{lesson.title}"</strong>. Skills updated. XP earned. 🚀
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-lg mb-4"
              style={{ background: '#FFF8ED', color: '#D4831A' }}>+{lesson.xp} XP ⭐</div>
            {lesson.skills && Object.entries(lesson.skills).filter(([, v]) => v > 0).length > 0 && (
              <div className="bg-blue-50 dark:bg-gray-800 rounded-xl px-4 py-3 mb-4 inline-block">
                <p className="text-xs font-black text-gray-400 mb-2 uppercase">Skills Improved</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {Object.entries(lesson.skills).filter(([, v]) => v > 0).map(([k, v]) => (
                    <span key={k} className="tag bg-green-100 dark:bg-green-950/30 text-green-700 text-[10px]">+{v} {k}</span>
                  ))}
                </div>
              </div>
            )}
            <Mascot size={80} mood="excited" animate className="mx-auto" />
          </div>
        )}

        {/* Nav */}
        <div className="flex justify-between mt-8 pt-5 border-t border-gray-100 dark:border-gray-800">
          <button onClick={() => { if (step === 0) onBack(); else setStep((s) => s - 1); }} className="btn btn-secondary">
            ← {step === 0 ? 'Exit' : 'Back'}
          </button>
          {current === 'quiz' && quizScore === null ? <span /> :
           step < STEPS.length - 1 ? (
            <button onClick={() => canAdvance() && setStep((s) => s + 1)} disabled={!canAdvance()}
              className={`btn btn-primary ${!canAdvance() ? 'opacity-50 cursor-not-allowed' : ''}`}>
              Continue →
            </button>
          ) : (
            <button onClick={() => onComplete(lesson)}
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
