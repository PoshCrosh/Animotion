'use client';
import AppShell from '../../components/layout/AppShell';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../../components/ui/Spinner';

const FAKE_POSTS = [
  { user:'AnimatorAlex', avatar:'🧑‍🎨', time:'2h ago',  title:'My first walk cycle!',        desc:'Finally got the passing position right. Milt Kahl was right — 12fps is the magic number.', likes:24, comments:7,  color:'#5B9CF6' },
  { user:'PixelPosh',    avatar:'👩‍💻', time:'5h ago',  title:'Squash & stretch practice',    desc:'Trying to nail the volume preservation. The bowling ball vs rubber ball difference is wild.', likes:41, comments:12, color:'#9B7FEA' },
  { user:'FrameByFrame', avatar:'🎬', time:'1d ago',  title:'Anticipation experiment',       desc:'Added a bigger wind-up before the throw and the action reads SO much better. Thomas & Johnston were right.', likes:18, comments:4,  color:'#52C97C' },
  { user:'TweenMaster',  avatar:'✨', time:'1d ago',  title:'Bouncing ball — 3 materials!',  desc:'Did the same bounce timing with 3 different spacings — rubber, wood, and lead. The spacing really does say it all.', likes:56, comments:15, color:'#FFB347' },
  { user:'ArcArtist',    avatar:'🌀', time:'2d ago',  title:'Arc paths make all the diff',   desc:'Fixed my inbetweens to follow the arc instead of going straight. Night and day difference.', likes:33, comments:9,  color:'#FF8FAB' },
  { user:'LayerLila',    avatar:'🖌️', time:'3d ago',  title:'Editor tip: Onion skin!',       desc:'Using the onion skin feature in the editor changed everything for my frame-by-frame work.', likes:29, comments:6,  color:'#4ECDC4' },
];

export default function CommunityPage() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background:'#EAF6FB' }}><Spinner size={10}/></div>;

  return (
    <AppShell user={user}>
      <div className="page">
        {/* Header */}
        <div className="wii-card p-5 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background:'linear-gradient(135deg,#5B9CF6,#3B7DE0)', boxShadow:'0 4px 16px rgba(91,156,246,0.4)' }}>👥</div>
          <div>
            <h1 className="font-black text-2xl" style={{ color:'#1E3A4A' }}>Community</h1>
            <p className="text-[13px] font-semibold" style={{ color:'#7A9BAA' }}>Share animations and connect with fellow learners</p>
          </div>
        </div>

        {/* Coming soon banner */}
        <div className="wii-card p-6 mb-6 text-center"
          style={{ background:'linear-gradient(135deg,rgba(91,156,246,0.08),rgba(155,127,234,0.06))', border:'1.5px solid rgba(91,156,246,0.2)' }}>
          <div className="text-4xl mb-3">🚧</div>
          <h2 className="font-black text-xl mb-2" style={{ color:'#1E3A4A' }}>Social features coming soon!</h2>
          <p className="text-[13px] font-semibold" style={{ color:'#7A9BAA' }}>
            Upload animations, get community feedback, and follow other animators. Here's a preview of what's coming.
          </p>
        </div>

        {/* Preview posts */}
        <p className="wii-section-label mb-4">PREVIEW — RECENT COMMUNITY POSTS</p>
        <div className="space-y-3">
          {FAKE_POSTS.map(post => (
            <div key={post.user} className="wii-card p-5 flex gap-4 opacity-80 hover:opacity-100 transition-opacity">
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background:`${post.color}15`, border:`1.5px solid ${post.color}30` }}>
                {post.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-[13px]" style={{ color:'#1E3A4A' }}>{post.user}</span>
                  <span className="text-[10px] font-semibold" style={{ color:'#9AB5C0' }}>{post.time}</span>
                </div>
                <p className="font-black text-[13px] mb-1" style={{ color: post.color }}>{post.title}</p>
                <p className="text-[12px] font-semibold leading-relaxed" style={{ color:'#7A9BAA' }}>{post.desc}</p>
                <div className="flex gap-4 mt-3">
                  <span className="text-[11px] font-bold" style={{ color:'#9AB5C0' }}>❤️ {post.likes}</span>
                  <span className="text-[11px] font-bold" style={{ color:'#9AB5C0' }}>💬 {post.comments}</span>
                  <span className="text-[11px] font-black" style={{ color:'#009AC7', cursor:'not-allowed' }}>🔒 Coming soon</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="wii-card p-5 mt-5 text-center"
          style={{ background:'rgba(91,156,246,0.06)', border:'1px solid rgba(91,156,246,0.15)' }}>
          <p className="font-black text-[14px] mb-2" style={{ color:'#1E3A4A' }}>Want to be notified when Community launches?</p>
          <p className="text-[12px] font-semibold mb-4" style={{ color:'#7A9BAA' }}>Send us a message and we'll let you know first.</p>
          <a href="mailto:poshcrosh@gmail.com" className="wii-btn wii-btn-primary text-xs inline-flex">
            ✉️ Notify me
          </a>
        </div>
      </div>
    </AppShell>
  );
}
