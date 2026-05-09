'use client';
import { useState, useCallback } from 'react';
import { TEMPLATES, TEMPLATE_CATEGORIES, generateTemplateFrameData } from '../../lib/templates';
import { useApp } from '../../lib/store';

function DifficultyBadge({ diff }) {
  const colors = {
    Beginner:     'bg-green-100 dark:bg-green-950/30 text-green-700',
    Intermediate: 'bg-amber-100 dark:bg-amber-950/30 text-amber-700',
    Advanced:     'bg-red-100 dark:bg-red-950/30 text-red-600',
  };
  return (
    <span className={`tag text-[9px] ${colors[diff] ?? colors.Beginner}`}>{diff}</span>
  );
}

export default function TemplatesModal({ onLoad, onClose }) {
  const { gainXP } = useApp();
  const [cat,     setCat]     = useState('All');
  const [loading, setLoading] = useState(null);
  const [preview, setPreview] = useState(null);

  const filtered = cat === 'All'
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category === cat);

  const handleLoad = useCallback(async (template) => {
    setLoading(template.id);

    // Generate frame data on the client (canvas API)
    const frameData = template.generateFrames
      ? generateTemplateFrameData(template, 580, 360)
      : {};

    const project = {
      id:          null,            // new project, not saved yet
      name:        template.name,
      frames:      template.frames,
      frameData,
      layers:      template.layers,
      fps:         template.fps,
      bgColor:     '#FFFFFF',
      width:       580,
      height:      360,
    };

    // Small XP reward for trying a template
    gainXP(15, 700, 300);

    setLoading(null);
    onLoad(project);
    onClose();
  }, [gainXP, onLoad, onClose]);

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-strong w-full max-w-[720px] max-h-[85vh] flex flex-col animate-fade-up">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-black text-lg">🎨 Animation Templates</h3>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">
              Start from a pre-built animation — modify, remix, learn.
            </p>
          </div>
          <button onClick={onClose}
            className="text-2xl text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center">
            ×
          </button>
        </div>

        {/* Category filter */}
        <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800 flex gap-2 flex-wrap">
          {TEMPLATE_CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
                cat === c
                  ? 'bg-primary text-white shadow-soft'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}>
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4">
            {filtered.map((template) => (
              <div
                key={template.id}
                onClick={() => setPreview(preview?.id === template.id ? null : template)}
                className={`card p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium ${
                  preview?.id === template.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                {/* Preview area */}
                <div
                  className="h-28 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${template.color}22, ${template.color}08)`,
                           border: `1.5px solid ${template.color}44` }}
                >
                  {/* Animated preview dots */}
                  <div className="flex gap-1 absolute bottom-3 left-3">
                    {template.frames.slice(0, 8).map((f, i) => (
                      <div key={i}
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: f.keyframe ? template.color : `${template.color}66`,
                          width: f.keyframe ? 8 : 6,
                          height: f.keyframe ? 8 : 6,
                        }} />
                    ))}
                    {template.frameCount > 8 && (
                      <span className="text-[9px] font-black ml-0.5" style={{ color: template.color }}>
                        +{template.frameCount - 8}
                      </span>
                    )}
                  </div>

                  {/* Icon */}
                  <div className="text-5xl">{template.icon}</div>

                  {/* FPS badge */}
                  <div className="absolute top-2 right-2 tag text-[9px] bg-white/70 dark:bg-gray-900/70 text-gray-600">
                    {template.fps}fps
                  </div>
                </div>

                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-black text-[13px]">{template.name}</h4>
                  <DifficultyBadge diff={template.difficulty} />
                </div>
                <p className="text-xs text-gray-500 font-semibold leading-relaxed mb-3 line-clamp-2">
                  {template.desc}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className="tag bg-gray-100 dark:bg-gray-800 text-gray-500 text-[9px]">
                      {template.frameCount} frames
                    </span>
                    <span className="tag text-[9px]"
                      style={{ background: `${template.color}22`, color: template.color }}>
                      {template.category}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleLoad(template); }}
                    disabled={loading === template.id}
                    className="btn btn-primary text-[10px] py-1.5 px-3 disabled:opacity-60"
                    style={{ background: template.color }}
                  >
                    {loading === template.id
                      ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      : 'Load →'}
                  </button>
                </div>

                {/* Skills this teaches */}
                {preview?.id === template.id && template.skills.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 animate-fade-up">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1.5">Skills Practiced</p>
                    <div className="flex flex-wrap gap-1">
                      {template.skills.map((s) => (
                        <span key={s} className="tag bg-primary-light text-primary-dark text-[9px]">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <p className="text-xs text-gray-400 font-semibold">
            💡 Templates load into the editor — modify freely, save as your own project.
          </p>
          <button onClick={onClose} className="btn btn-secondary text-sm">Close</button>
        </div>
      </div>
    </div>
  );
}
