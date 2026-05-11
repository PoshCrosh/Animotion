'use client';
import AppShell from '../../components/layout/AppShell';
import { useApp }  from '../../lib/store';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../../components/ui/Spinner';
import { useRouter } from 'next/navigation';

// Quest completion is now tied to real actions in the store.
// Users can no longer manually mark quests complete — the buttons
// just redirect them to the relevant page to actually do the action.
const QUEST_ACTIONS = {
  1: { label:'Go to Lessons',   href:'/lessons'     }, // Complete a lesson
  2: { label:'Open Editor',     href:'/editor'      }, // Open the editor
  3: { label:'View Skills',     href:'/skills'      }, // Chat with Ani (now shows skills)
  4: { label:'Start Learning',  href:'/lessons'     }, // Earn 50 XP
  5: { label:'Watch a Video',   href:'/videos'      }, // Watch a video
  6: { label:'Start a Lesson',  href:'/lessons'     }, // Pass a quiz
  7: { label:'Open Editor',     href:'/editor'      }, // Save a project
};

export default function QuestsPage() {
  const { user, loading } = useAuth();
  const { state } = useApp();
  const { quests = [] } = state;
  const router = useRouter();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:'#EAF6FB' }}>
      <Spinner size={10}/>
    </div>
  );

  const done     = quests.filter(q => q.done).length;
  const total    = quests.length;
  const totalXP  = quests.filter(q => q.done).reduce((s, q) => s + q.xp, 0);
  const maxXP    = quests.reduce((s, q) => s + q.xp, 0);

  return (
    <AppShell user={user}>
      <div className="page" style={{ maxWidth:600 }}>
        {/* Header */}
        <div className="wii-card p-5 mb-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background:'linear-gradient(135deg,#52C97C,#3DAD65)', boxShadow:'0 4px 16px rgba(82,201,124,0.4)' }}>🎯</div>
          <div className="flex-1">
            <h1 className="font-black text-2xl" style={{ color:'#1E3A4A' }}>Daily Quests</h1>
            <p className="text-[13px] font-semibold" style={{ color:'#7A9BAA' }}>Complete real actions to earn XP</p>
            <div className="wii-progress-track mt-2">
              <div className="wii-progress-fill" style={{ width:`${(done/total)*100}%` }}/>
            </div>
          </div>
          <div className="text-center px-3 py-2 rounded-2xl" style={{ background:'rgba(255,179,71,0.1)', border:'1px solid rgba(255,179,71,0.25)' }}>
            <p className="font-black text-lg" style={{ color:'#D4831A' }}>+{totalXP}</p>
            <p className="text-[10px] font-bold" style={{ color:'#D4831A', opacity:0.7 }}>of {maxXP} XP</p>
          </div>
        </div>

        {/* How it works note */}
        <div className="wii-card p-4 mb-5 flex items-center gap-3"
          style={{ background:'rgba(0,154,199,0.06)', border:'1px solid rgba(0,154,199,0.15)' }}>
          <div className="text-2xl">💡</div>
          <p className="text-[12px] font-semibold" style={{ color:'#5A7A8A' }}>
            Quests complete automatically when you do the real action — complete a lesson, open the editor, watch a video, etc. XP is awarded on completion.
          </p>
        </div>

        {/* Status summary */}
        <div className="wii-card p-4 mb-5 flex items-center gap-4"
          style={{ background:done===total?'rgba(82,201,124,0.06)':'rgba(255,179,71,0.06)', border:`1px solid ${done===total?'rgba(82,201,124,0.2)':'rgba(255,179,71,0.2)'}` }}>
          <div className="text-3xl">{done === total ? '🏆' : '⚡'}</div>
          <div>
            <p className="font-black text-[14px]" style={{ color:'#1E3A4A' }}>
              {done === total ? 'All quests done! Come back tomorrow.' : `${done} of ${total} quests complete`}
            </p>
            <p className="text-[11px] font-semibold" style={{ color:'#7A9BAA' }}>
              {done === total ? 'Amazing work today! 🎉' : `${total - done} quests remaining`}
            </p>
          </div>
        </div>

        {/* Quest list */}
        <div className="space-y-3">
          {quests.map(q => {
            const action = QUEST_ACTIONS[q.id];
            return (
              <div key={q.id} className="wii-card p-5 flex items-center gap-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{
                    background: q.done ? 'rgba(82,201,124,0.12)' : 'rgba(0,154,199,0.08)',
                    border: `1.5px solid ${q.done ? 'rgba(82,201,124,0.3)' : 'rgba(0,154,199,0.2)'}`,
                  }}>
                  {q.done ? '✅' : q.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-black text-[13px]" style={{ color:'#1E3A4A' }}>{q.title}</p>
                  <p className="text-[11px] font-semibold" style={{ color:'#9AB5C0' }}>
                    {q.done ? '✓ Completed automatically' : 'Complete the action below to earn this'}
                  </p>
                </div>

                {/* XP + action */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="font-black text-[13px]" style={{ color:q.done?'#52C97C':'#D4831A' }}>
                    +{q.xp} XP
                  </span>
                  {!q.done && action && (
                    <button onClick={() => router.push(action.href)}
                      className="wii-btn wii-btn-primary text-xs px-3">
                      {action.label} →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-[11px] font-semibold mt-5" style={{ color:'#9AB5C0' }}>
          Quests reset every 24 hours. Come back tomorrow for new ones!
        </p>
      </div>
    </AppShell>
  );
}
