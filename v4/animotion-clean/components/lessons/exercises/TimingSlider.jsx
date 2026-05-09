'use client';
import { useState, useEffect, useRef } from 'react';

// Animates a ball with configurable timing to teach slow-in/slow-out
export default function TimingSlider({ onComplete }) {
  const canvasRef  = useRef(null);
  const animRef    = useRef(null);
  const [easing,   setEasing]   = useState(50);   // 0=linear, 100=heavy ease
  const [weight,   setWeight]   = useState(50);   // ball weight
  const [playing,  setPlaying]  = useState(false);
  const [answered, setAnswered] = useState(null);  // which scenario is heavier
  const [confirmed, setConfirmed] = useState(false);

  const CANVAS_W = 480;
  const CANVAS_H = 120;
  const BALL_R   = 16;

  // Easing function based on slider
  const ease = (t, strength) => {
    if (strength < 10) return t; // linear
    const s = strength / 100;
    return t < 0.5
      ? 4 * t * t * t * s + t * (1 - s)
      : (1 - Math.pow(-2 * t + 2, 3) / 2) * s + (1 - (1 - t) * (1 - s));
  };

  const drawFrame = (progress) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Ground
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(32, CANVAS_H - 20);
    ctx.lineTo(CANVAS_W - 32, CANVAS_H - 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // Trail dots (show spacing = principle)
    const steps = 12;
    for (let i = 0; i < steps; i++) {
      const t   = i / steps;
      const et  = ease(t, easing);
      const x   = 32 + BALL_R + et * (CANVAS_W - 64 - BALL_R * 2);
      const alpha = (i / steps) * 0.3;
      ctx.beginPath();
      ctx.arc(x, CANVAS_H - 20 - BALL_R, BALL_R * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(91,156,246,${alpha})`;
      ctx.fill();
    }

    // Ball
    const ep = ease(progress, easing);
    const x  = 32 + BALL_R + ep * (CANVAS_W - 64 - BALL_R * 2);
    const y  = CANVAS_H - 20 - BALL_R;

    // Squash based on weight at endpoints
    const nearEdge = Math.min(progress, 1 - progress) < 0.08;
    const squashX  = nearEdge ? 1 + (weight / 100) * 0.3 : 1;
    const squashY  = nearEdge ? 1 - (weight / 100) * 0.2 : 1;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(squashX, squashY);
    const grad = ctx.createRadialGradient(-BALL_R * 0.3, -BALL_R * 0.3, 2, 0, 0, BALL_R);
    grad.addColorStop(0, '#7BBCFF');
    grad.addColorStop(1, '#3B7DE0');
    ctx.beginPath();
    ctx.arc(0, 0, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // Shadow
    const shadowScale = 0.4 + ep * 0.6;
    ctx.beginPath();
    ctx.ellipse(x, CANVAS_H - 16, BALL_R * shadowScale, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fill();
  };

  const animate = () => {
    let start = null;
    const duration = 800 + (weight / 100) * 800; // heavier = slower

    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      drawFrame(progress);
      if (progress < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        setPlaying(false);
      }
    };
    animRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    drawFrame(0);
  }, [easing, weight]); // eslint-disable-line

  const handlePlay = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setPlaying(true);
    animate();
  };

  const handleAnswer = (answer) => {
    setAnswered(answer);
  };

  const handleConfirm = () => {
    // Correct: heavy ball (high weight) moves slower
    const correct = answered === 'heavy';
    setConfirmed(true);
    if (onComplete) onComplete(correct);
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div>
          <p className="font-black text-xs text-primary">🎮 Interactive Exercise</p>
          <p className="text-[11px] text-gray-500 font-semibold">Timing & Spacing Demonstrator</p>
        </div>
        <div className="flex gap-2">
          <span className="tag bg-blue-50 dark:bg-blue-950/30 text-blue-600 text-[9px]">DRAG SLIDERS</span>
        </div>
      </div>

      <div className="p-5">
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 mb-4"
          style={{ maxWidth: CANVAS_W }}
        />

        {/* Controls */}
        <div className="space-y-4 mb-5">
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-xs font-black text-gray-600 dark:text-gray-400">
                Easing Strength
              </label>
              <span className="text-xs font-black text-primary">
                {easing < 20 ? 'Linear (Robotic)' : easing < 60 ? 'Some Ease' : 'Heavy Ease (Natural)'}
              </span>
            </div>
            <input type="range" min={0} max={100} value={easing}
              onChange={(e) => { setEasing(+e.target.value); if (!playing) drawFrame(0); }}
              className="w-full accent-primary h-2 rounded-full cursor-pointer" />
            <div className="flex justify-between text-[9px] text-gray-400 font-bold mt-0.5">
              <span>Linear</span><span>Natural Ease</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-xs font-black text-gray-600 dark:text-gray-400">Ball Weight</label>
              <span className="text-xs font-black text-primary">
                {weight < 30 ? 'Ping Pong Ball' : weight < 65 ? 'Tennis Ball' : 'Bowling Ball'}
              </span>
            </div>
            <input type="range" min={0} max={100} value={weight}
              onChange={(e) => { setWeight(+e.target.value); if (!playing) drawFrame(0); }}
              className="w-full accent-primary h-2 rounded-full cursor-pointer" />
            <div className="flex justify-between text-[9px] text-gray-400 font-bold mt-0.5">
              <span>Light</span><span>Heavy</span>
            </div>
          </div>
        </div>

        <button onClick={handlePlay} disabled={playing}
          className="btn btn-primary w-full justify-center mb-5 disabled:opacity-50">
          {playing ? '▶ Playing…' : '▶ Play Animation'}
        </button>

        {/* Quick quiz built into exercise */}
        {!confirmed && (
          <div className="bg-blue-50 dark:bg-gray-800 rounded-xl p-4">
            <p className="text-xs font-black text-gray-700 dark:text-gray-300 mb-3">
              🧠 Which ball takes longer to cross the screen?
            </p>
            <div className="flex gap-3">
              {[
                { id: 'heavy', label: '🎳 Bowling Ball (heavy)', correct: true },
                { id: 'light', label: '🏓 Ping Pong (light)', correct: false },
              ].map(({ id, label }) => (
                <button key={id} onClick={() => handleAnswer(id)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-xs font-black transition-all ${
                    answered === id
                      ? 'border-primary bg-primary-light text-primary-dark'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary text-gray-600 dark:text-gray-400'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
            {answered && (
              <button onClick={handleConfirm}
                className="btn btn-primary w-full justify-center mt-3 text-xs">
                Confirm Answer →
              </button>
            )}
          </div>
        )}

        {confirmed && (
          <div className={`rounded-xl px-4 py-3 text-xs font-bold ${
            answered === 'heavy'
              ? 'bg-green-50 dark:bg-green-950/30 text-green-700'
              : 'bg-red-50 dark:bg-red-950/30 text-red-600'
          }`}>
            {answered === 'heavy'
              ? '🎉 Correct! Heavier objects take more frames — more timing = more weight.'
              : '💡 Heavy objects are slower! Set weight to max and watch the ball crawl. That\'s timing communicating mass.'}
          </div>
        )}
      </div>
    </div>
  );
}
