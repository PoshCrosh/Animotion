'use client';
import { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import Spinner  from '../../components/ui/Spinner';
import { useApp }  from '../../lib/store';
import { useAuth } from '../../hooks/useAuth';
import { RANKS, ALL_LESSONS, SKILLS, DEFAULT_SKILLS } from '../../lib/curriculum';
import { getRank, fmtXP, sanitize } from '../../lib/utils';

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
      <div className="wii-skill-track">
        <div className="wii-skill-fill" style={{ width:`${pct}%`, background:skill.color }} />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const { state } = useApp();
  const { xp, level, completedLessons, skills } = state;
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [bioInput, setBioInput] = useState('');
  const [savedName, setSavedName] = useState(null);
  const [savedBio, setSavedBio] = useState('Aspiring animator learning the craft one frame at a time 🎬');

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background:'#EAF6FB' }}><Spinner size={10}/></div>;

  const rank     = getRank(xp, RANKS);
  const nextRank = RANKS[RANKS.indexOf(rank)+1];
  const baseN    = user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? 'Animator';
  const displayName = savedName ?? baseN;
  const ini      = displayName[0]?.toUpperCase() ?? 'A';

  const mergedSkills   = { ...DEFAULT_SKILLS, ...(skills??{}) };
  const sortedSkills   = SKILLS.slice().sort((a,b)=>(mergedSkills[b.id]??0)-(mergedSkills[a.id]??0));
  const strongest      = sortedSkills.slice(0,3);
  const weakest        = sortedSkills.slice(-3).reverse();
  const totalSkillPts  = SKILLS.reduce((s,sk)=>s+(mergedSkills[sk.id]??0),0);

  const ACHIEVEMENTS = [
    { icon:'🎬', name:'First Frame',  desc:'Completed first lesson',   earned:completedLessons.length>=1 },
    { icon:'⏱️', name:'Time Keeper',  desc:'Timing skill >= 20',       earned:(mergedSkills.timing??0)>=20 },
    { icon:'🔥', name:'On Fire',      desc:'5 lessons complete',        earned:completedLessons.length>=5 },
    { icon:'🧠', name:'Quiz Wizard',  desc:'10 lessons complete',       earned:completedLessons.length>=10 },
    { icon:'🚀', name:'Animator',     desc:'Reached 500 XP',            earned:xp>=500 },
    { icon:'💎', name:'Dedicated',    desc:'15 lessons complete',        earned:completedLessons.length>=15 },
    { icon:'⭐', name:'Skilled',      desc:'Any skill reached 50+',      earned:SKILLS.some(s=>(mergedSkills[s.id]??0)>=50) },
    { icon:'🏆', name:'Master',       desc:'Reached Gold rank',          earned:xp>=1500 },
  ];

  const STATS = [
    { l:'Total XP',     v:fmtXP(xp),              c:'#D4831A' },
    { l:'Level',        v:level,                   c:'#009AC7' },
    { l:'Missions',     v:completedLessons.length, c:'#52C97C' },
    { l:'Skill Points', v:totalSkillPts,            c:'#9B7FEA' },
    { l:'Rank',         v:rank.name,               c:rank.color },
    { l:'Next Rank',    v:nextRank?.name??'—',      c:'#FF8FAB' },
  ];

  return (
    <AppShell user={user}>
      <div className="page grid gap-5" style={{ gridTemplateColumns:'290px 1fr' }}>

        {/* Left */}
        <div className="space-y-4">
          {/* Profile card */}
          <div className="wii-card p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-white mx-auto"
                style={{ background:'linear-gradient(135deg,#009AC7,#007AAA)', boxShadow:'0 4px 20px rgba(0,154,199,0.45)' }}>
                {ini}
              </div>
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white" style={{ background:'#52C97C' }} />
            </div>

            {editing ? (
              <div className="space-y-2 text-left">
                <input className="wii-input text-center font-black text-sm" value={nameInput} onChange={e=>setNameInput(e.target.value)} placeholder="Display name" maxLength={40}/>
                <textarea className="wii-input resize-none text-xs" rows={3} value={bioInput} onChange={e=>setBioInput(e.target.value)} placeholder="Short bio…" maxLength={150}/>
                <button onClick={() => { if(nameInput.trim().length>=2) setSavedName(sanitize(nameInput.trim())); if(bioInput.trim()) setSavedBio(sanitize(bioInput.trim())); setEditing(false); }} className="wii-btn wii-btn-primary w-full text-xs justify-center">Save ✓</button>
                <button onClick={() => setEditing(false)} className="wii-btn wii-btn-ghost w-full text-xs justify-center">Cancel</button>
              </div>
            ) : (
              <>
                <h2 className="font-black text-lg mb-1" style={{ color:'#1E3A4A' }}>{displayName}</h2>
                <p className="text-xs font-semibold mb-4" style={{ color:'#7A9BAA' }}>{savedBio}</p>
                <div className="rounded-2xl px-3 py-2.5 mb-4 text-center" style={{ background:'rgba(0,154,199,0.07)', border:'1px solid rgba(0,154,199,0.15)' }}>
                  <p className="wii-section-label mb-0.5">Current Rank</p>
                  <p className="font-black text-base" style={{ color:'#1E3A4A' }}>{rank.icon} {rank.name}</p>
                  <p className="text-[10px] font-semibold mt-0.5" style={{ color:'#9AB5C0' }}>{rank.desc}</p>
                </div>
                {/* Mini XP bar */}
                <div className="wii-progress-track mb-1"><div className="wii-progress-fill" style={{ width:`${Math.min(100,((xp-(rank.min??0))/((rank.max??xp+1)-(rank.min??0)))*100)}%` }}/></div>
                <p className="text-[10px] font-semibold mb-4" style={{ color:'#9AB5C0' }}>
                  {nextRank ? `${fmtXP(nextRank.min-xp)} XP to ${nextRank.name}` : 'Max rank reached!'}
                </p>
                <button onClick={() => { setNameInput(displayName); setBioInput(savedBio); setEditing(true); }} className="wii-btn wii-btn-secondary w-full text-xs justify-center">✏️ Edit Profile</button>
              </>
            )}
          </div>

          {/* Achievements */}
          <div className="wii-card p-5">
            <h3 className="font-black text-[13px] mb-4" style={{ color:'#1E3A4A' }}>🏅 Achievements</h3>
            <div className="space-y-3">
              {ACHIEVEMENTS.map(a => (
                <div key={a.name} className="flex items-center gap-3 transition-opacity" style={{ opacity:a.earned?1:0.35 }}>
                  <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background:a.earned?'rgba(255,179,71,0.12)':'rgba(0,0,0,0.04)', border:`1px solid ${a.earned?'rgba(255,179,71,0.3)':'rgba(0,0,0,0.06)'}` }}>
                    {a.icon}
                  </div>
                  <div>
                    <p className="font-black text-xs" style={{ color:'#1E3A4A' }}>{a.name}</p>
                    <p className="text-[10px] font-semibold" style={{ color:'#9AB5C0' }}>{a.earned?a.desc:'🔒 '+a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="wii-card p-6">
            <h3 className="font-black text-[14px] mb-5" style={{ color:'#1E3A4A' }}>📊 Statistics</h3>
            <div className="grid grid-cols-3 gap-3">
              {STATS.map(s => (
                <div key={s.l} className="rounded-2xl p-4" style={{ background:'rgba(0,154,199,0.05)', border:'1px solid rgba(0,154,199,0.12)' }}>
                  <p className="font-black text-xl leading-none mb-1 truncate" style={{ color:s.c }}>{s.v}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color:'#9AB5C0' }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="wii-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-[14px]" style={{ color:'#1E3A4A' }}>🎯 Skill Profile</h3>
              <span className="text-xs font-bold" style={{ color:'#9AB5C0' }}>Total: <span className="font-black" style={{ color:'#009AC7' }}>{totalSkillPts}</span> pts</span>
            </div>

            {totalSkillPts > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-2xl p-3" style={{ background:'rgba(82,201,124,0.08)', border:'1px solid rgba(82,201,124,0.2)' }}>
                  <p className="text-[10px] font-black mb-2 uppercase" style={{ color:'#52C97C' }}>💪 Strongest</p>
                  {strongest.map(s => (
                    <div key={s.id} className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">{s.icon}</span>
                      <span className="text-[11px] font-bold flex-1 truncate" style={{ color:'#1E3A4A' }}>{s.label}</span>
                      <span className="text-[11px] font-black" style={{ color:s.color }}>{mergedSkills[s.id]??0}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl p-3" style={{ background:'rgba(255,179,71,0.08)', border:'1px solid rgba(255,179,71,0.2)' }}>
                  <p className="text-[10px] font-black mb-2 uppercase" style={{ color:'#D4831A' }}>🎯 To Improve</p>
                  {weakest.map(s => (
                    <div key={s.id} className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">{s.icon}</span>
                      <span className="text-[11px] font-bold flex-1 truncate" style={{ color:'#1E3A4A' }}>{s.label}</span>
                      <span className="text-[11px] font-black" style={{ color:'#9AB5C0' }}>{mergedSkills[s.id]??0}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-x-6">
              {SKILLS.map(skill => <SkillBar key={skill.id} skill={skill} value={mergedSkills[skill.id]??0}/>)}
            </div>

            {totalSkillPts === 0 && (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">🌱</div>
                <p className="text-xs font-bold" style={{ color:'#9AB5C0' }}>Skills grow as you learn and chat with Ani.</p>
              </div>
            )}
          </div>

          {/* Rank journey */}
          <div className="wii-card p-6">
            <h3 className="font-black text-[14px] mb-5" style={{ color:'#1E3A4A' }}>🗺️ Rank Journey</h3>
            <div className="space-y-3">
              {RANKS.map(r => {
                const isCurr = rank.name===r.name;
                const isDone = xp>=r.max;
                const pct = isCurr?Math.min(100,((xp-r.min)/(r.max-r.min))*100):isDone?100:0;
                return (
                  <div key={r.name} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 border-2"
                      style={{ background:isCurr?'rgba(0,154,199,0.1)':isDone?'rgba(82,201,124,0.1)':'rgba(0,0,0,0.04)', borderColor:isCurr?'#009AC7':isDone?'#52C97C':'rgba(0,0,0,0.1)' }}>
                      {isDone&&!isCurr?'✓':r.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-black text-xs" style={{ color:'#1E3A4A' }}>
                          {r.name}
                          {isCurr && <span className="ml-2 text-[9px] text-white px-1.5 py-0.5 rounded-full font-black" style={{ background:'#009AC7' }}>Current</span>}
                        </span>
                        <span className="text-[10px] font-bold" style={{ color:'#9AB5C0' }}>{r.min?.toLocaleString()} XP</span>
                      </div>
                      <div className="wii-progress-track h-1.5">
                        <div className="wii-progress-fill" style={{ width:`${pct}%` }}/>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
