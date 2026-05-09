'use client';
import { useState, useEffect, useRef } from 'react';
import { useApp }    from '../../lib/store';
import { recordAction, getComboMessage } from '../../lib/combo';

// Drop-in component — place in AppShell.
// Listens for lesson/quiz completions and shows combo toast.
export default function ComboToast() {
  const { state }      = useApp();
  const [toast,  setToast]  = useState(null);
  const prevLessons = useRef(state.completedLessons.length);

  useEffect(() => {
    const curr = state.completedLessons.length;
    if (curr > prevLessons.current) {
      prevLessons.current = curr;
      // Get user id from localStorage key (best available without auth hook)
      const uid = Object.keys(localStorage).find((k) => k.startsWith('animotion_u_'))?.replace('animotion_u_', '');
      if (!uid) return;
      const result = recordAction(uid, 'lesson');
      if (result.combo >= 2 && result.message) {
        setToast({ combo: result.combo, message: result.message, mult: result.multiplier });
        setTimeout(() => setToast(null), 3000);
      }
    }
  }, [state.completedLessons.length]);

  if (!toast) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] animate-fade-up pointer-events-none">
      <div className="card px-6 py-4 shadow-strong text-center border-amber-200 dark:border-amber-800"
        style={{ background: 'linear-gradient(135deg,#FFF8ED,#FFFBF0)', minWidth: 200 }}>
        <div className="text-2xl mb-1 animate-float">{toast.message.split(' ')[0]}</div>
        <p className="font-black text-base text-amber-700">{toast.message}</p>
        <p className="text-[11px] text-amber-600 font-semibold">
          {toast.combo}× Combo · {toast.mult}× XP Multiplier!
        </p>
      </div>
    </div>
  );
}
