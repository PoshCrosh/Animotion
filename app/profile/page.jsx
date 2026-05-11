'use client';
import { useState, useEffect, useRef } from 'react';
import AppShell from '../../components/layout/AppShell';
import Spinner  from '../../components/ui/Spinner';
import { useApp }  from '../../lib/store';
import { useAuth } from '../../hooks/useAuth';
import { RANKS, ALL_LESSONS, SKILLS, DEFAULT_SKILLS } from '../../lib/curriculum';
import { getRank, fmtXP } from '../../lib/utils';
import { updateProfile } from '../../lib/db';

// Persist profile customisation to localStorage (survives refresh)
const STORAGE_KEY = (uid) => `animotion_profile_${uid}`;

function loadProfileData(uid) {
  if (!uid) return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY(uid)) ?? '{}'); }
  catch { return {}; }
}

function saveProfileData(uid, data) {
  if (!uid) return;
  localStorage.setItem(STORAGE_KEY(uid), JSON.stringify(data));
}

// Preset banner gradients
const BANNERS = [
  { id:'blue',    label:'Ocean',   style:'linear-gradient(135deg,#1a6b8a 0%,#009AC7 50%,#4ECDC4 100%)' },
  { id:'purple',  label:'Galaxy',  style:'linear-gradient(135deg,#1a1040 0%,#6b3fa0 50%,#FF8FAB 100%)' },
  { id:'sunset',  label:'Sunset',  style:'linear-gradient(135deg,#FF5757 0%,#FFB347 50%,#FF8FAB 100%)' },
  { id:'forest',  label:'Forest',  style:'linear-gradient(135deg,#134e1a 0%,#52C97C 50%,#4ECDC4 100%)' },
  { id:'night',   label:'Night',   style:'linear-gradient(135deg,#0A0F1A 0%,#1E3A4A 50%,#009AC7 100%)' },
  { id:'gold',    label:'Gold',    style:'linear-gradient(135deg,#7d4e00 0%,#FFB347 50%,#FFD700 100%)' },
  { id:'rose',    label:'Rose',    style:'linear-gradient(135deg,#6b2040 0%,#FF8FAB 50%,#FFD6E0 100%)' },
  { id:'ink',     label:'Ink',     style:'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)' },
];

// Preset avatar icons
const AVATARS = ['🎬','🎨','✏️','🖌️','⭐','🚀','🎯','🏆','💎','🔥','⚡','🌊','🎭','👾','🦊','🐉'];

function SkillBar({ skill, value }) {
  const pct = Math.min(100, Math.max(0, value ?? 0));
  const lvl = pct>=80?'Master':pct>=60?'Advanced':pct>=40?'Intermediate':pct>=20?'Beginner':'Novice';
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{skill.icon}</span>
          <span className="text-[11px] font-black" style={{ color:'#1E3A4A' }}>{skill.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold" style={{ color:'#9AB5C0' }}>{lvl}</span>
          <span className="text-[11px] font-black" style={{ color:skill.color }}>{pct}</span>
        </div>
      </div>
      <div className="wii-skill-track"><div className="wii-skill-fill" style={{ width:`${pct}%`, background:skill.color }}/></div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const { state } = useApp();
  const { xp, level, completedLessons, skills } = state;

  // All profile customisation state
  const [displayName,  setDisplayName]  = useState('');
  const [bio,          setBio]          = useState('');
  const [pronouns,     setPronouns]     = useState('');
  const [bannerId,     setBannerId]     = useState('blue');
  const [avatarIcon,   setAvatarIcon]   = useState('🎬');
  const [editing,      setEditing]      = useState(false);

  // Edit buffer
  const [nameEdit,    setNameEdit]    = useState('');
  const [bioEdit,     setBioEdit]     = useState('');
  const [pronounsEdit,setPronounsEdit]= useState('');
  const [bannerEdit,  setBannerEdit]  = useState('blue');
  const [avatarEdit,  setAvatarEdit]  = useState('🎬');
  const [saving,      setSaving]      = useState(false);

  const uid = user?.id;

  // Load from localStorage on mount (so changes survive refresh)
  useEffect(() => {
    if (!uid) return;
    const saved = loadProfileData(uid);
    const fallbackName = user?.user_metadata?.name ?? user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Animator';
    setDisplayName(saved.name     ?? fallbackName);
    setBio(        saved.bio      ?? '');
    setPronouns(   saved.pronouns ?? '');
    setBannerId(   saved.banner   ?? 'blue');
    setAvatarIcon( saved.avatar   ?? '🎬');
  }, [uid]); // eslint-disable-line

  function openEdit() {
    setNameEdit(displayName); setBioEdit(bio); setPronounsEdit(pronouns);
    setBannerEdit(bannerId);  setAvatarEdit(avatarIcon);
    setEditing(true);
  }

  async function saveEdit() {
    if (nameEdit.trim().length < 2) return;
    setSaving(true);

    const newName     = nameEdit.trim();
    const newBio      = bioEdit.trim();
    const newPronouns = pronounsEdit.trim();

    // 1. Save to localStorage immediately → survives refresh
    saveProfileData(uid, { name:newName, bio:newBio, pronouns:newPronouns, banner:bannerEdit, avatar:avatarEdit });

    // 2. Update component state
    setDisplayName(newName); setBio(newBio); setPronouns(newPronouns);
    setBannerId(bannerEdit); setAvatarIcon(avatarEdit);

    // 3. Try to save display_name to Supabase (best-effort)
    if (uid) {
      await updateProfile(uid, { display_name: newName }).catch(() => {});
    }

    setSaving(false);
    setEditing(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background:'#EAF6FB' }}><Spinner size={10}/></div>;

  const rank         = getRank(xp, RANKS);
  const nextRank     = RANKS[RANKS.indexOf(rank) + 1];
  const mergedSkills = { ...DEFAULT_SKILLS, ...(skills ?? {}) };
  const sortedSkills = SKILLS.slice().sort((a,b) => (mergedSkills[b.id]??0)-(mergedSkills[a.id]??0));
  const strongest    = sortedSkills.slice(0,3);
  const weakest      = sortedSkills.slice(-3).reverse();
  const totalPts     = SKILLS.reduce((s,sk)=>s+(mergedSkills[sk.id]??0),0);
  const activeBanner = BANNERS.find(b => b.id === bannerId) ?? BANNERS[0];

  const ACHIEVEMENTS = [
    { icon:'🎬', name:'First Frame',  desc:'Completed first lesson',   earned:completedLessons.length>=1 },
    { icon:'⏱️', name:'Time Keeper',  desc:'Timing skill >= 20',       earned:(mergedSkills.timing??0)>=20 },
    { icon:'🔥', name:'On Fire',      desc:'5 lessons complete',        earned:completedLessons.length>=5 },
    { icon:'🧠', name:'Quiz Wizard',  desc:'10 lessons complete',       earned:completedLessons.length>=10 },
    { icon:'🚀', name:'Animator',     desc:'Reached 500 XP',            earned:xp>=500 },
    { icon:'💎', name:'Dedicated',    desc:'15 lessons complete',       earned:completedLessons.length>=15 },
    { icon:'⭐', name:'Skilled',      desc:'Any skill reached 50+',     earned:SKILLS.some(s=>(mergedSkills[s.id]??0)>=50) },
    { icon:'🏆', name:'Master',       desc:'Reached Gold rank',         earned:xp>=1500 },
  ];

  return (
    <AppShell user={user}>
      <div className="page">

        {/* ── X-style profile header ───────────────────────────────────── */}
        <div className="wii-card overflow-hidden mb-5">
          {/* Banner */}
          <div className="relative h-36" style={{ background: activeBanner.style }}>
            {/* Decorative pattern overlay on banner */}
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize:'20px 20px' }} />
            {/* Edit button */}
            <button onClick={openEdit}
              className="absolute top-3 right-3 px-4 py-1.5 rounded-full text-[12px] font-black text-white transition-all hover:scale-105"
              style={{ background:'rgba(0,0,0,0.45)', border:'1.5px solid rgba(255,255,255,0.3)', backdropFilter:'blur(8px)' }}>
              Edit profile
            </button>
          </div>

          {/* Avatar + info */}
          <div className="px-6 pb-5">
            {/* Avatar overlapping banner */}
            <div className="flex items-end justify-between" style={{ marginTop:-36 }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl border-4 border-white flex-shrink-0"
                style={{ background:'linear-gradient(135deg,#009AC7,#007AAA)', boxShadow:'0 4px 16px rgba(0,0,0,0.2)' }}>
                {avatarIcon}
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="text-center px-3 py-1.5 rounded-2xl" style={{ background:'rgba(255,179,71,0.12)', border:'1px solid rgba(255,179,71,0.3)' }}>
                  <p className="font-black text-sm" style={{ color:'#D4831A' }}>⭐ {fmtXP(xp)}</p>
                  <p className="text-[9px] font-bold" style={{ color:'#D4831A',opacity:.7 }}>Total XP</p>
                </div>
                <div className="text-center px-3 py-1.5 rounded-2xl" style={{ background:`${rank?.color}18`, border:`1px solid ${rank?.color}44` }}>
                  <p className="font-black text-sm" style={{ color:rank?.color }}>{rank?.icon} {rank?.name}</p>
                  <p className="text-[9px] font-bold" style={{ color:rank?.color,opacity:.7 }}>Current rank</p>
                </div>
              </div>
            </div>

            {/* Name, handle, bio */}
            <div className="mt-3">
              <h1 className="font-black text-xl leading-tight" style={{ color:'#1E3A4A' }}>{displayName}</h1>
              <p className="text-[12px] font-semibold" style={{ color:'#9AB5C0' }}>@{(user?.email?.split('@')[0] ?? 'animator').toLowerCase()}</p>
              {pronouns && <p className="text-[12px] font-bold mt-0.5" style={{ color:'#7A9BAA' }}>{pronouns}</p>}
              {bio && <p className="text-[13px] font-semibold mt-2 leading-relaxed" style={{ color:'#5A7A8A' }}>{bio}</p>}
              <div className="flex items-center gap-4 mt-3">
                <span className="text-[12px] font-bold" style={{ color:'#9AB5C0' }}>📅 Level {level} Animator</span>
                <span className="text-[12px] font-bold" style={{ color:'#9AB5C0' }}>📖 {completedLessons.length} missions done</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Edit modal ─────────────────────────────────────────────────── */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:'rgba(0,0,0,0.5)', backdropFilter:'blur(8px)' }}>
            <div className="wii-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-lg" style={{ color:'#1E3A4A' }}>Edit Profile</h2>
                <button onClick={() => setEditing(false)} className="text-2xl" style={{ color:'#9AB5C0' }}>×</button>
              </div>

              {/* Avatar picker */}
              <p className="wii-section-label mb-2">PROFILE ICON</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {AVATARS.map(a => (
                  <button key={a} onClick={() => setAvatarEdit(a)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all hover:scale-110"
                    style={{ background:avatarEdit===a?'rgba(0,154,199,0.15)':'rgba(0,154,199,0.05)', border:`2px solid ${avatarEdit===a?'#009AC7':'transparent'}` }}>
                    {a}
                  </button>
                ))}
              </div>

              {/* Banner picker */}
              <p className="wii-section-label mb-2">BANNER</p>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {BANNERS.map(b => (
                  <button key={b.id} onClick={() => setBannerEdit(b.id)}
                    className="h-12 rounded-xl transition-all hover:scale-105"
                    style={{ background:b.style, border:`3px solid ${bannerEdit===b.id?'#009AC7':'transparent'}`, boxShadow:bannerEdit===b.id?'0 0 0 2px rgba(0,154,199,0.3)':'none' }}
                    title={b.label} />
                ))}
              </div>

              {/* Fields */}
              <p className="wii-section-label mb-2">DISPLAY NAME</p>
              <input className="wii-input mb-3" value={nameEdit} onChange={e => setNameEdit(e.target.value)} placeholder="Your name" maxLength={40}/>

              <p className="wii-section-label mb-2">PRONOUNS</p>
              <input className="wii-input mb-3" value={pronounsEdit} onChange={e => setPronounsEdit(e.target.value)} placeholder="e.g. He/Him, She/Her, They/Them" maxLength={30}/>

              <p className="wii-section-label mb-2">BIO</p>
              <textarea className="wii-input resize-none mb-4" rows={3} value={bioEdit} onChange={e => setBioEdit(e.target.value)} placeholder="Tell the community about yourself…" maxLength={160}/>

              <div className="flex gap-2">
                <button onClick={saveEdit} disabled={saving || nameEdit.trim().length < 2}
                  className="wii-btn wii-btn-primary flex-1 justify-center">
                  {saving ? 'Saving…' : 'Save Profile ✓'}
                </button>
                <button onClick={() => setEditing(false)} className="wii-btn wii-btn-ghost">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Stats + Skills + Achievements ─────────────────────────────── */}
        <div className="grid gap-5" style={{ gridTemplateColumns:'1fr 1fr' }}>

          {/* Stats */}
          <div className="wii-card p-5">
            <h3 className="font-black text-[14px] mb-4" style={{ color:'#1E3A4A' }}>📊 Statistics</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { l:'Total XP',     v:fmtXP(xp),              c:'#D4831A' },
                { l:'Level',        v:level,                   c:'#009AC7' },
                { l:'Missions',     v:completedLessons.length, c:'#52C97C' },
                { l:'Skill Points', v:totalPts,                c:'#9B7FEA' },
              ].map(s => (
                <div key={s.l} className="rounded-2xl p-3 text-center" style={{ background:'rgba(0,154,199,0.05)', border:'1px solid rgba(0,154,199,0.12)' }}>
                  <p className="font-black text-xl leading-none mb-1" style={{ color:s.c }}>{s.v}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color:'#9AB5C0' }}>{s.l}</p>
                </div>
              ))}
            </div>

            {/* Rank progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-black" style={{ color:rank?.color }}>{rank?.icon} {rank?.name}</span>
                {nextRank && <span className="text-[11px] font-semibold" style={{ color:'#9AB5C0' }}>{fmtXP(nextRank.min-xp)} XP to {nextRank.name}</span>}
              </div>
              <div className="wii-progress-track">
                <div className="wii-progress-fill" style={{ width:`${Math.min(100,((xp-(rank?.min??0))/((nextRank?.min??xp+1)-(rank?.min??0)))*100)}%`, background:rank?.color }}/>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="wii-card p-5">
            <h3 className="font-black text-[14px] mb-4" style={{ color:'#1E3A4A' }}>🏅 Achievements</h3>
            <div className="space-y-2.5">
              {ACHIEVEMENTS.map(a => (
                <div key={a.name} className="flex items-center gap-3" style={{ opacity:a.earned?1:0.35 }}>
                  <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background:a.earned?'rgba(255,179,71,0.12)':'rgba(0,0,0,0.04)', border:`1px solid ${a.earned?'rgba(255,179,71,0.3)':'rgba(0,0,0,0.06)'}` }}>
                    {a.icon}
                  </div>
                  <div>
                    <p className="font-black text-xs" style={{ color:'#1E3A4A' }}>{a.name}</p>
                    <p className="text-[10px] font-semibold" style={{ color:'#9AB5C0' }}>{a.earned ? a.desc : '🔒 '+a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="wii-card p-6 mt-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-[14px]" style={{ color:'#1E3A4A' }}>🎯 Skill Profile</h3>
            <div className="flex gap-3">
              <div className="rounded-xl px-3 py-1.5" style={{ background:'rgba(82,201,124,0.08)', border:'1px solid rgba(82,201,124,0.2)' }}>
                <p className="text-[9px] font-black uppercase" style={{ color:'#52C97C' }}>💪 Strongest</p>
                {strongest.map(s => <p key={s.id} className="text-[10px] font-bold" style={{ color:'#1E3A4A' }}>{s.icon} {s.label.split(' ')[0]}: <span style={{ color:s.color }}>{mergedSkills[s.id]??0}</span></p>)}
              </div>
              <div className="rounded-xl px-3 py-1.5" style={{ background:'rgba(255,179,71,0.08)', border:'1px solid rgba(255,179,71,0.2)' }}>
                <p className="text-[9px] font-black uppercase" style={{ color:'#D4831A' }}>🎯 Weakest</p>
                {weakest.map(s => <p key={s.id} className="text-[10px] font-bold" style={{ color:'#1E3A4A' }}>{s.icon} {s.label.split(' ')[0]}: <span style={{ color:'#9AB5C0' }}>{mergedSkills[s.id]??0}</span></p>)}
              </div>
            </div>
          </div>
          {totalPts === 0 && (
            <p className="text-center text-[12px] font-semibold py-4" style={{ color:'#9AB5C0' }}>🌱 Complete lessons and chat with Ani to grow your skills.</p>
          )}
          <div className="grid grid-cols-2 gap-x-6">
            {SKILLS.map(skill => <SkillBar key={skill.id} skill={skill} value={mergedSkills[skill.id]??0}/>)}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
