'use client';
import { useState } from 'react';
import { validate, sanitize } from '../../lib/utils';

const TYPES = [
  { id: 'feedback', label: '💬 Feedback', ph: 'Share your thoughts about Animotion…' },
  { id: 'bug',      label: '🐛 Bug',      ph: 'What happened? What did you expect to happen?' },
  { id: 'idea',     label: '💡 Idea',     ph: 'Describe your idea for improving Animotion…' },
];

export default function FeedbackModal({ onClose }) {
  const [type, setType] = useState('feedback');
  const [msg,  setMsg]  = useState('');
  const [err,  setErr]  = useState(null);
  const [sent, setSent] = useState(false);

  const ph = TYPES.find((t) => t.id === type)?.ph ?? '';

  const handleSend = () => {
    const e = validate.feedback(msg);
    if (e) { setErr(e); return; }
    setErr(null);
    setSent(true);
    // Production: POST to /api/feedback or send email via Supabase Edge Function
  };

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.50)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card p-7 w-full max-w-[440px] animate-fade-up shadow-strong">
        {sent ? (
          <div className="text-center py-4">
            <div className="text-5xl mb-4">💌</div>
            <h3 className="font-black text-xl mb-2">Message Sent!</h3>
            <p className="text-gray-500 text-sm font-semibold mb-6">
              Thanks for reaching out — Posh will get back to you soon.
            </p>
            <button onClick={onClose} className="btn btn-primary mx-auto">Close</button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-black text-lg">💬 Send Feedback</h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">
                  Found a bug or have a suggestion? We'd love to hear it!
                </p>
              </div>
              <button onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 w-8 h-8 flex items-center justify-center" aria-label="Close">×</button>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 bg-primary-light dark:bg-blue-950/30 rounded-xl px-4 py-3 mb-5">
              <span className="text-xl">📧</span>
              <div>
                <p className="text-xs font-black text-primary-dark mb-0.5">Direct Email</p>
                <a href="mailto:takuwhy@gmail.com" className="text-sm font-black text-primary hover:underline">
                  takuwhy@gmail.com
                </a>
              </div>
            </div>

            {/* Type tabs */}
            <div className="flex gap-2 mb-4">
              {TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${type === t.id ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              value={msg}
              onChange={(e) => { setMsg(sanitize(e.target.value)); setErr(null); }}
              placeholder={ph}
              rows={4}
              className={`field resize-none mb-1 ${err ? 'field-error' : ''}`}
            />
            {err && <p className="text-red-500 text-xs font-bold mb-3">{err}</p>}

            <div className="flex gap-3 mt-3">
              <button onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
              <button onClick={handleSend} className="btn btn-primary flex-[2]">Send Message →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
