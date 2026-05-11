'use client';
import AppShell from '../../components/layout/AppShell';
import { useApp }  from '../../lib/store';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../../components/ui/Spinner';

export default function QuestsPage() {
  const { user, loading } = useAuth();
  const { state, completeQuest } = useApp();
  const { quests = [] } = state;
  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background:'#EAF6FB' }}><Spinner size={10}/></div>;

  const done  = quests.filter(q => q.done).length;
  const total = quests.length;
  const totalXP = quests.filter(q => q.done).reduce((s, q) => s + q.xp, 0);

  return (
    <AppShell user={user}>
      <div className="page" style={{ maxWidth:600 }}>
        {/* Header */}
        <div className="wii-card p-5 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background:'linear-gradient(135deg,#52C97C,#3DAD65)', boxShadow:'0 4px 16px rgba(82,201,124,0.4)' }}>🎯</div>
          <div className="flex-1">
            <h1 className="font-black text-2xl" style={{ color:'#1E3A4A' }}>Daily Quests</h1>
            <p className="text-[13px] font-semibold" style={{ color:'#7A9BAA' }}>Complete quests to earn bonus XP every day</p>
            <div className="wii-progress-track mt-2">
              <div className="wii-progress-fill" style={{ width:`${(done/total)*100}%` }}/>
            </div>
          </div>
          <div className="text-center px-3 py-2 rounded-2xl" style={{ background:'rgba(255,179,71,0.1)', border:'1px solid rgba(255,179,71,0.25)' }}>
            <p className="font-black text-lg" style={{ color:'#D4831A' }}>+{totalXP}</p>
            <p className="text-[10px] font-bold" style={{ color:'#D4831A', opacity:0.7 }}>XP earned</p>
          </div>
        </div>

        {/* Progress summary */}
        <div className="wii-card p-4 mb-5 flex items-center gap-4"
          style={{ background:'rgba(82,201,124,0.06)', border:'1px solid rgba(82,201,124,0.2)' }}>
          <div className="text-3xl">{done === total ? '🏆' : '⚡'}</div>
          <div>
            <p className="font-black text-[14px]" style={{ color:'#1E3A4A' }}>
              {done === total ? 'All quests done! Come back tomorrow.' : `${done} of ${total} quests complete`}
            </p>
            <p className="text-[11px] font-semibold" style={{ color:'#7A9BAA' }}>
              {done === total ? 'Amazing work today! 🎉' : `${total - done} remaining — keep going!`}
            </p>
          </div>
        </div>

        {/* Quest list */}
        <div className="space-y-3">
          {quests.map(q => (
            <div key={q.id} className="wii-card p-5 flex items-center gap-4"
              style={{ opacity: q.done ? 0.75 : 1 }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background:q.done?'rgba(82,201,124,0.12)':'rgba(0,154,199,0.08)', border:`1.5px solid ${q.done?'rgba(82,201,124,0.3)':'rgba(0,154,199,0.2)'}` }}>
                {q.done ? '✅' : q.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-[13px]" style={{ color:'#1E3A4A' }}>{q.title}</p>
                <p className="text-[11px] font-semibold" style={{ color:'#9AB5C0' }}>
                  {q.done ? 'Completed!' : 'Tap to complete'}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="font-black text-[13px]" style={{ color: q.done?'#52C97C':'#D4831A' }}>+{q.xp} XP</span>
                {!q.done && (
                  <button onClick={() => completeQuest(q.id, q.xp)}
                    className="wii-btn wii-btn-primary text-xs px-4">
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] font-semibold mt-5" style={{ color:'#9AB5C0' }}>
          Quests reset every 24 hours. Check back tomorrow!
        </p>
      </div>
    </AppShell>
  );
}
