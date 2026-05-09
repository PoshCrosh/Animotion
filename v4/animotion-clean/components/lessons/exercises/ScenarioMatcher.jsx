'use client';
import { useState } from 'react';

export default function ScenarioMatcher({ pairs, instruction, onComplete }) {
  // pairs: [{ scenario, principleId, principleLabel, icon }]
  const [matches,   setMatches]   = useState({});   // scenarioIdx → principleId
  const [dragging,  setDragging]  = useState(null);  // principleId
  const [submitted, setSubmitted] = useState(false);
  const [results,   setResults]   = useState({});

  const principles = pairs.map((p) => ({ id: p.principleId, label: p.principleLabel, icon: p.icon }));
  const usedPrinciples = new Set(Object.values(matches));

  const handleDrop = (e, scenarioIdx) => {
    e.preventDefault();
    if (!dragging || submitted) return;
    setMatches((prev) => ({ ...prev, [scenarioIdx]: dragging }));
    setDragging(null);
  };

  const handleRemoveMatch = (scenarioIdx) => {
    if (submitted) return;
    setMatches((prev) => { const n = { ...prev }; delete n[scenarioIdx]; return n; });
  };

  const handleSubmit = () => {
    const res = {};
    pairs.forEach((pair, idx) => {
      res[idx] = matches[idx] === pair.principleId;
    });
    setResults(res);
    setSubmitted(true);
    const allCorrect = Object.values(res).every(Boolean);
    if (onComplete) onComplete(allCorrect);
  };

  const allMatched = Object.keys(matches).length === pairs.length;
  const correctCount = Object.values(results).filter(Boolean).length;

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div>
          <p className="font-black text-xs text-primary">🎮 Interactive Exercise</p>
          <p className="text-[11px] text-gray-500 font-semibold">Match the Principle</p>
        </div>
        <span className="tag bg-amber-50 dark:bg-amber-950/30 text-amber-600 text-[9px]">DRAG & MATCH</span>
      </div>

      <div className="p-5">
        <p className="text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-4">{instruction}</p>

        <div className="grid grid-cols-2 gap-4">
          {/* Left: Scenarios (drop targets) */}
          <div className="space-y-2">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Scenarios</p>
            {pairs.map((pair, idx) => {
              const matched    = matches[idx];
              const matchLabel = principles.find((p) => p.id === matched);
              const isCorrect  = results[idx];
              const isWrong    = submitted && results[idx] === false;

              return (
                <div
                  key={idx}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, idx)}
                  className={`min-h-[64px] rounded-xl border-2 p-3 transition-all ${
                    submitted
                      ? isCorrect
                        ? 'border-green-400 bg-green-50 dark:bg-green-950/20'
                        : 'border-red-400 bg-red-50 dark:bg-red-950/20'
                      : matched
                      ? 'border-primary bg-primary-light dark:bg-blue-950/20'
                      : 'border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 leading-snug">
                    {pair.scenario}
                  </p>
                  {matched && matchLabel && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{matchLabel.icon}</span>
                      <span
                        className="text-[10px] font-black text-primary-dark dark:text-primary cursor-pointer hover:line-through"
                        onClick={() => handleRemoveMatch(idx)}
                        title="Click to remove">
                        {matchLabel.label}
                        {!submitted && ' ×'}
                      </span>
                    </div>
                  )}
                  {!matched && !submitted && (
                    <p className="text-[9px] text-gray-400 font-semibold">Drop a principle here</p>
                  )}
                  {submitted && (
                    <p className="text-[10px] font-black mt-1" style={{ color: isCorrect ? '#2DA05A' : '#FF5757' }}>
                      {isCorrect ? '✓ Correct!' : `✗ Should be: ${pair.principleLabel}`}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Principles (drag sources) */}
          <div className="space-y-2">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Principles</p>
            {principles.map((p) => {
              const isUsed = usedPrinciples.has(p.id);
              return (
                <div
                  key={p.id}
                  draggable={!isUsed && !submitted}
                  onDragStart={() => setDragging(p.id)}
                  onDragEnd={() => setDragging(null)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all select-none ${
                    isUsed || submitted
                      ? 'opacity-40 cursor-default border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                      : dragging === p.id
                      ? 'border-primary bg-primary-light opacity-60 cursor-grabbing'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 cursor-grab hover:border-primary hover:bg-primary-light dark:hover:bg-blue-950/20'
                  }`}
                >
                  <span className="text-lg">{p.icon}</span>
                  <span className="text-xs font-black text-gray-700 dark:text-gray-300">{p.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4">
          {!submitted ? (
            <button onClick={handleSubmit} disabled={!allMatched}
              className={`btn btn-primary w-full justify-center text-sm ${!allMatched ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {allMatched ? 'Check Matches →' : `Match ${pairs.length - Object.keys(matches).length} more…`}
            </button>
          ) : (
            <div className={`rounded-xl px-4 py-3 text-sm font-bold text-center ${
              correctCount === pairs.length
                ? 'bg-green-50 dark:bg-green-950/30 text-green-700'
                : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700'
            }`}>
              {correctCount === pairs.length
                ? '🎉 Perfect! All principles matched correctly.'
                : `${correctCount}/${pairs.length} correct. Study the feedback above!`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
