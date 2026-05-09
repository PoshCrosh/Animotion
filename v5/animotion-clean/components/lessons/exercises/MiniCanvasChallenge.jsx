'use client';
import { useRef, useState, useEffect, useCallback } from 'react';

export default function MiniCanvasChallenge({ prompt, onComplete }) {
  const canvasRef  = useRef(null);
  const drawing    = useRef(false);
  const lastPos    = useRef(null);
  const [tool,     setTool]     = useState('brush');
  const [color,    setColor]    = useState('#1A1D2E');
  const [size,     setSize]     = useState(4);
  const [strokes,  setStrokes]  = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const COLORS = ['#1A1D2E','#5B9CF6','#FF8FAB','#52C97C','#FFB347','#9B7FEA','#FF5757','#FFFFFF'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top)  * scaleY,
    };
  };

  const startDraw = useCallback((e) => {
    e.preventDefault();
    drawing.current = true;
    const canvas = canvasRef.current;
    lastPos.current = getPos(e, canvas);
  }, []);

  const draw = useCallback((e) => {
    e.preventDefault();
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const pos    = getPos(e, canvas);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === 'eraser' ? '#FAFAFA' : color;
    ctx.lineWidth   = tool === 'eraser' ? size * 4 : size;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.stroke();

    lastPos.current = pos;
  }, [tool, color, size]);

  const endDraw = useCallback(() => {
    if (drawing.current) setStrokes((s) => s + 1);
    drawing.current = false;
    lastPos.current = null;
  }, []);

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setStrokes(0);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (onComplete) onComplete(true);
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div>
          <p className="font-black text-xs text-primary">🎮 Mini Editor Challenge</p>
          <p className="text-[11px] text-gray-500 font-semibold">Draw your answer</p>
        </div>
        <span className="tag bg-green-50 dark:bg-green-950/30 text-green-600 text-[9px]">DRAW</span>
      </div>

      <div className="p-5">
        {/* Prompt */}
        <div className="rounded-xl px-4 py-3 border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-950/20 mb-4">
          <p className="text-[10px] font-black text-amber-700 mb-0.5">✏️ YOUR TASK</p>
          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-relaxed">{prompt}</p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {/* Tools */}
          <div className="flex gap-1.5">
            {[{ id:'brush', icon:'✏️' }, { id:'eraser', icon:'◻' }].map(({ id, icon }) => (
              <button key={id} onClick={() => setTool(id)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${
                  tool === id ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'
                }`}>
                {icon}
              </button>
            ))}
          </div>

          {/* Colors */}
          <div className="flex gap-1.5 flex-wrap">
            {COLORS.map((c) => (
              <button key={c} onClick={() => { setColor(c); setTool('brush'); }}
                className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  background: c,
                  borderColor: color === c ? '#5B9CF6' : '#E5E7EB',
                  boxShadow: color === c ? `0 0 0 2px #5B9CF6` : 'none',
                }} />
            ))}
          </div>

          {/* Size */}
          <input type="range" min={2} max={20} value={size}
            onChange={(e) => setSize(+e.target.value)}
            className="w-20 accent-primary h-1.5 rounded-full cursor-pointer" />

          <button onClick={clear}
            className="btn btn-secondary text-[10px] py-1 px-2 ml-auto">
            Clear
          </button>
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={480} height={200}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 cursor-crosshair touch-none"
          style={{ background: '#FAFAFA' }}
        />

        <div className="flex items-center justify-between mt-3">
          <p className="text-[10px] text-gray-400 font-semibold">
            {strokes === 0 ? 'Start drawing above…' : `${strokes} stroke${strokes !== 1 ? 's' : ''}`}
          </p>
          {!submitted ? (
            <button onClick={handleSubmit} disabled={strokes < 2}
              className={`btn btn-primary text-xs py-2 px-4 ${strokes < 2 ? 'opacity-50 cursor-not-allowed' : ''}`}>
              Submit Drawing ✓
            </button>
          ) : (
            <span className="tag bg-green-100 dark:bg-green-950/30 text-green-700 text-[10px]">
              ✓ Submitted!
            </span>
          )}
        </div>

        {submitted && (
          <div className="mt-3 bg-green-50 dark:bg-green-950/30 rounded-xl px-4 py-3 text-xs font-bold text-green-700 dark:text-green-400">
            🎨 Great work! The act of drawing forces your brain to think in frames. Keep practising!
          </div>
        )}
      </div>
    </div>
  );
}
