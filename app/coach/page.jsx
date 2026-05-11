'use client';
import AppShell from '../../components/layout/AppShell';
import { useAuth } from '../../hooks/useAuth';
import { useApp }  from '../../lib/store';
import { SKILLS, DEFAULT_SKILLS } from '../../lib/curriculum';
import Spinner from '../../components/ui/Spinner';
import { useRouter } from 'next/navigation';

function SkillBarMini({ skill, value }) {
  const pct = Math.min(100, Math.max(0, value ?? 0));
  return (
    <div className="mb-2.5">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{skill.icon}</span>
          <span className="text-[11px] font-black" style={{ color: '#1E3A4A' }}>{skill.label}</span>
        </div>
        <span className="text-[11px] font-black" style={{ color: skill.color }}>{pct}</span>
      </div>
      <div className="wii-skill-track">
        <div className="wii-skill-fill" style={{ width: `${pct}%`, background: skill.color }} />
      </div>
    </div>
  );
}

const PRINCIPLES = [
  { icon: '🏀', name: 'Squash & Stretch',          desc: 'Volume stays constant as objects deform under force. More squash = softer material.' },
  { icon: '💨', name: 'Anticipation',               desc: 'Go opposite before the main action. Bigger action = bigger wind-up needed.' },
  { icon: '🎭', name: 'Staging',                    desc: "Walt's rule: if it doesn't read as a black silhouette, the staging has failed." },
  { icon: '➡️', name: 'Straight Ahead & Pose to Pose', desc: 'Straight Ahead = spontaneous. Pose to Pose = controlled. Pros use both.' },
  { icon: '🌊', name: 'Follow Through',             desc: "Things don't stop all at once. Walt: \"First one part, then another.\"" },
  { icon: '🐢', name: 'Slow In & Slow Out',         desc: 'Drawings cluster near extremes and spread in the middle. Ken Harris called it cushioning.' },
  { icon: '⭕', name: 'Arcs',                       desc: 'Nearly all living movement follows curved paths. Straight inbetweens look robotic.' },
  { icon: '🎬', name: 'Secondary Action',           desc: 'Always subordinate to primary action. If it competes, it\'s staged wrong.' },
  { icon: '⏱️', name: 'Timing',                     desc: 'More frames = heavier, slower. Milt Kahl timed real walkers: invariably 12fps.' },
  { icon: '💥', name: 'Exaggeration',               desc: 'Push until Walt says "I didn\'t mean THAT much!" then work back from there.' },
  { icon: '✏️', name: 'Solid Drawing',              desc: 'Marc Davis: "Drawing is a performance. An artist is an actor not limited by their body."' },
  { icon: '✨', name: 'Appeal',                     desc: 'Designs that are compelling and worth watching. Not necessarily cute — just interesting.' },
];

export default function CoachPage() {
  const { user, loading } = useAuth();
  const { state } = useApp();
  const { skills } = state;
  const router = useRouter();
  const merged = { ...DEFAULT_SKILLS, ...(skills ?? {}) };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#EAF6FB' }}>
      <Spinner size={10} />
    </div>
  );

  return (
    <AppShell user={user}>
      <div className="page flex gap-5">

        {/* ── Main panel ── */}
        <div className="flex-1 space-y-5">

          {/* Coming soon hero */}
          <div className="wii-card p-8 text-center"
            style={{ background: 'linear-gradient(135deg,rgba(155,127,234,0.08),rgba(0,154,199,0.06))', border: '1.5px solid rgba(155,127,234,0.2)' }}>
            <div className="text-6xl mb-4" style={{ animation: 'wii-float 3.5s ease-in-out infinite', display: 'inline-block' }}>🤖</div>
            <h1 className="font-black text-2xl mb-2" style={{ color: '#1E3A4A' }}>AI Coach — Coming Soon!</h1>
            <p className="text-[14px] font-semibold mb-4 max-w-md mx-auto" style={{ color: '#7A9BAA' }}>
              Ani, your personal animation coach powered by Claude AI, is temporarily offline while we set up billing.
              She'll be back soon — and when she is, she'll know everything from Thomas & Johnston and Richard Williams.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: 'rgba(155,127,234,0.12)', border: '1px solid rgba(155,127,234,0.3)' }}>
              <span className="text-[11px] font-black" style={{ color: '#9B7FEA' }}>🔔 Launching soon — check back!</span>
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={() => router.push('/lessons')} className="wii-btn wii-btn-primary">
                📖 Study Lessons Instead →
              </button>
              <button onClick={() => router.push('/skills')} className="wii-btn wii-btn-secondary">
                📊 View Your Skills
              </button>
            </div>
          </div>

          {/* What Ani will do */}
          <div className="wii-card p-6">
            <h2 className="font-black text-[15px] mb-4" style={{ color: '#1E3A4A' }}>🎓 What Ani will teach you</h2>
            <p className="text-[12px] font-semibold mb-5" style={{ color: '#7A9BAA' }}>
              Ani is trained on the two most important animation books ever written — The Illusion of Life by Frank Thomas & Ollie Johnston, and The Animator's Survival Kit by Richard Williams.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {PRINCIPLES.map(p => (
                <div key={p.name} className="rounded-2xl p-3"
                  style={{ background: 'rgba(0,154,199,0.05)', border: '1px solid rgba(0,154,199,0.12)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{p.icon}</span>
                    <span className="font-black text-[12px]" style={{ color: '#1E3A4A' }}>{p.name}</span>
                  </div>
                  <p className="text-[10px] font-semibold leading-relaxed" style={{ color: '#7A9BAA' }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Study tip */}
          <div className="wii-card p-5 flex items-center gap-4"
            style={{ background: 'rgba(82,201,124,0.06)', border: '1px solid rgba(82,201,124,0.2)' }}>
            <div className="text-3xl">💡</div>
            <div>
              <p className="font-black text-[13px] mb-1" style={{ color: '#1E3A4A' }}>While you wait — study the principles!</p>
              <p className="text-[11px] font-semibold" style={{ color: '#7A9BAA' }}>
                Every lesson in World 1 covers one of the 12 principles with book-level depth from both Thomas/Johnston and Williams.
              </p>
            </div>
            <button onClick={() => router.push('/lessons')} className="wii-btn wii-btn-primary text-xs flex-shrink-0">
              Go →
            </button>
          </div>
        </div>

        {/* ── Skills sidebar ── */}
        <div className="w-64 flex-shrink-0">
          <div className="wii-card p-4">
            <p className="wii-section-label mb-3">🎯 YOUR SKILLS</p>
            {SKILLS.map(skill => (
              <SkillBarMini key={skill.id} skill={skill} value={merged[skill.id] ?? 0} />
            ))}
            <button onClick={() => router.push('/skills')} className="wii-btn wii-btn-secondary w-full justify-center text-xs mt-3">
              View all skills →
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
