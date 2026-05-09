'use client';
import { useState, useRef } from 'react';

export default function PrincipleSorter({ items, question, onComplete }) {
  const [order,     setOrder]     = useState(() => [...items].sort(() => Math.random() - 0.5));
  const [dragging,  setDragging]  = useState(null);
  const [dragOver,  setDragOver]  = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [correct,   setCorrect]   = useState(false);

  const handleDragStart = (idx) => setDragging(idx);
  const handleDragOver  = (e, idx) => { e.preventDefault(); setDragOver(idx); };
  const handleDrop      = (e, idx) => {
    e.preventDefault();
    if (dragging === null || dragging === idx) return;
    const next = [...order];
    const [moved] = next.splice(dragging, 1);
    next.splice(idx, 0, moved);
    setOrder(next);
    setDragging(null);
    setDragOver(null);
  };
  const handleDragEnd = () => { setDragging(null); setDragOver(null); };

  // Mobile: tap-to-select-then-tap-to-place
  const [selected, setSelected] = useState(null);
  const handleTap = (idx) => {
    if (selected === null) {
      setSelected(idx);
    } else {
      if (selected !== idx) {
        const next = [...order];
        [next[selected], next[idx]] = [next[idx], next[selected]];
        setOrder(next);
      }
      setSelected(null);
    }
  };

  const handleSubmit = () => {
    const isCorrect = order.every((item, i) => item.id === items[i]?.id);
    setCorrect(isCorrect);
    setSubmitted(true);
    if (onComplete) onComplete(isCorrect);
  };

  const handleReset = () => {
    setOrder([...items].sort(() => Math.random() - 0.5));
    setSubmitted(false);
    setCorrect(false);
    setSelected(null);
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div>
          <p className="font-black text-xs text-primary">🎮 Interactive Exercise</p>
          <p className="text-[11px] text-gray-500 font-semibold">Drag to Sort</p>
        </div>
        <span className="tag bg-purple-50 dark:bg-purple-950/30 text-purple-600 text-[9px]">DRAG & DROP</span>
      </div>

      <div className="p-5">
        <p className="text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-4 leading-snug">{question}</p>

        <div className="space-y-2 mb-5">
          {order.map((item, idx) => {
            let borderColor = 'border-gray-200 dark:border-gray-700';
            let bg          = 'bg-blue-50 dark:bg-gray-800';
            if (selected === idx) { borderColor = 'border-primary'; bg = 'bg-primary-light dark:bg-blue-950/30'; }
            if (dragOver === idx) { borderColor = 'border-primary'; bg = 'bg-primary-light dark:bg-blue-950/30'; }
            if (submitted) {
              const isRight = item.id === items[idx]?.id;
              borderColor = isRight ? 'border-green-400' : 'border-red-400';
              bg          = isRight ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20';
            }

            return (
              <div
                key={item.id}
                draggable={!submitted}
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                onClick={() => !submitted && handleTap(idx)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all cursor-grab active:cursor-grabbing select-none ${bg} ${borderColor} ${
                  dragging === idx ? 'opacity-40' : 'opacity-100'
                }`}
              >
                <span className="text-gray-300 dark:text-gray-600 font-black text-sm w-5 flex-shrink-0">
                  {idx + 1}
                </span>
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <span className="font-bold text-[13px] text-gray-700 dark:text-gray-300 flex-1">{item.label}</span>
                {submitted && (
                  <span className="text-lg">
                    {item.id === items[idx]?.id ? '✓' : '✗'}
                  </span>
                )}
                {!submitted && (
                  <span className="text-gray-300 dark:text-gray-600 text-xs">⠿</span>
                )}
              </div>
            );
          })}
        </div>

        {!submitted ? (
          <button onClick={handleSubmit} className="btn btn-primary w-full justify-center text-sm">
            Check Order →
          </button>
        ) : (
          <div>
            <div className={`rounded-xl px-4 py-3 mb-3 text-sm font-bold ${
              correct
                ? 'bg-green-50 dark:bg-green-950/30 text-green-700'
                : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700'
            }`}>
              {correct
                ? '🎉 Perfect order! You understand the workflow.'
                : '💡 Not quite — the correct order is shown. Study the sequence!'}
            </div>
            {!correct && (
              <button onClick={handleReset} className="btn btn-secondary w-full justify-center text-xs">
                Try Again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
