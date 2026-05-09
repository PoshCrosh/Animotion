'use client';
import { useState } from 'react';
import { SKILLS }   from '../../lib/curriculum';
import { useApp }   from '../../lib/store';

const CONTRACT_DURATION_DAYS = 7;
const CONTRACT_XP_BOOST      = 1.5;  // 50% more XP for contracted skill
const CONTRACT_SKILL_BOOST   = 1.4;  // 40% more skill gain

function getDaysLeft(startDate) {
  if (!startDate) return 0;
  const end = new Date(startDate);
  end.setDate(end.getDate() + CONTRACT_DURATION_DAYS);
  const now = new Date();
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

export function isContractActive(contract) {
  if (!contract?.skillId || !contract?.startDate) return false;
  return getDaysLeft(contract.startDate) > 0;
}

export function applyContractBoost(skillDeltas, contract) {
  if (!isContractActive(contract)) return skillDeltas;
  return Object.fromEntries(
    Object.entries(skillDeltas).map(([k, v]) =>
      k === contract.skillId ? [k, Math.round(v * CONTRACT_SKILL_BOOST)] : [k, v]
    )
  );
}

// ── Contract Modal ────────────────────────────────────────────────────────────
export default function SkillContractModal({ onClose }) {
  const { state, dispatch } = useApp();
  const contract = state.skillContract ?? null;
  const active   = isContractActive(contract);

  const [selected, setSelected] = useState(contract?.skillId ?? null);
  const [confirmed, setConfirmed] = useState(false);

  const handleActivate = () => {
    if (!selected) return;
    const newContract = {
      skillId:   selected,
      startDate: new Date().toISOString(),
    };
    dispatch({ type: 'SET_SKILL_CONTRACT', contract: newContract });
    setConfirmed(true);
  };

  const handleCancel = () => {
    dispatch({ type: 'SET_SKILL_CONTRACT', contract: null });
    onClose();
  };

  const selectedSkill = SKILLS.find((s) => s.id === selected);
  const daysLeft = active ? getDaysLeft(contract.startDate) : 0;
  const activeSkill = active ? SKILLS.find((s) => s.id === contract.skillId) : null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.60)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card w-full max-w-[500px] max-h-[85vh] overflow-y-auto animate-fade-up shadow-strong">

        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-black text-lg">📜 Skill Contract</h3>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">
              Focus on one skill for 7 days and earn boosted rewards.
            </p>
          </div>
          <button onClick={onClose} className="text-2xl text-gray-400 w-8 h-8 flex items-center justify-center">×</button>
        </div>

        <div className="p-6">
          {confirmed ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">📜</div>
              <h3 className="font-black text-xl mb-2">Contract Activated!</h3>
              <p className="text-gray-500 text-sm font-semibold mb-4">
                Focus skill: <strong className="text-primary">{selectedSkill?.label}</strong>
              </p>
              <div className="bg-primary-light dark:bg-blue-950/20 rounded-xl px-4 py-3 mb-4 text-sm">
                <p className="font-black text-primary-dark dark:text-primary mb-1">For the next 7 days:</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
                  • {Math.round((CONTRACT_SKILL_BOOST - 1) * 100)}% more {selectedSkill?.label} skill gain<br />
                  • AI Coach prioritises {selectedSkill?.label} lessons<br />
                  • Dashboard shows contract progress
                </p>
              </div>
              <button onClick={onClose} className="btn btn-primary w-full justify-center">
                Let's Go! 🎯
              </button>
            </div>
          ) : active ? (
            // Active contract display
            <div>
              <div className="text-center mb-5">
                <div className="text-4xl mb-2">{activeSkill?.icon}</div>
                <h3 className="font-black text-lg">{activeSkill?.label}</h3>
                <p className="text-gray-500 text-sm font-semibold">Current contract</p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Days Left', value: daysLeft, icon: '📅' },
                  { label: 'Skill Boost', value: `+${Math.round((CONTRACT_SKILL_BOOST - 1) * 100)}%`, icon: '📈' },
                  { label: 'Current Level', value: state.skills[contract.skillId] ?? 0, icon: '⭐' },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="bg-blue-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                    <div className="text-xl mb-1">{icon}</div>
                    <div className="font-black text-sm text-primary">{value}</div>
                    <div className="text-[9px] text-gray-400 font-bold uppercase">{label}</div>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="mb-5">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-gray-500">Contract Progress</span>
                  <span style={{ color: activeSkill?.color }}>{state.skills[contract.skillId] ?? 0}/100</span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-[width] duration-700"
                    style={{ width: `${state.skills[contract.skillId] ?? 0}%`, background: activeSkill?.color }} />
                </div>
              </div>

              <button onClick={handleCancel}
                className="btn btn-danger w-full justify-center text-sm">
                Cancel Contract
              </button>
            </div>
          ) : (
            // Skill selection
            <div>
              <p className="text-[13px] font-semibold text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Choose a skill to focus on. For 7 days, you'll earn <strong>{Math.round((CONTRACT_SKILL_BOOST - 1) * 100)}% more</strong> of that skill from lessons and AI coaching.
              </p>

              <div className="grid grid-cols-2 gap-2 mb-5">
                {SKILLS.map((skill) => {
                  const value = state.skills[skill.id] ?? 0;
                  const isSelected = selected === skill.id;
                  return (
                    <button key={skill.id} onClick={() => setSelected(skill.id)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-primary bg-primary-light dark:bg-blue-950/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary bg-white dark:bg-gray-900'
                      }`}>
                      <span className="text-xl flex-shrink-0">{skill.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black truncate">{skill.label}</p>
                        <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-1">
                          <div className="h-full rounded-full" style={{ width: `${value}%`, background: skill.color }} />
                        </div>
                      </div>
                      <span className="text-xs font-black flex-shrink-0" style={{ color: skill.color }}>{value}</span>
                    </button>
                  );
                })}
              </div>

              {selectedSkill && (
                <div className="bg-primary-light dark:bg-blue-950/20 rounded-xl px-4 py-3 mb-4 animate-fade-up">
                  <p className="text-xs font-black text-primary-dark dark:text-primary mb-1">
                    Contracting: {selectedSkill.icon} {selectedSkill.label}
                  </p>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 font-semibold">
                    +{Math.round((CONTRACT_SKILL_BOOST - 1) * 100)}% skill gain · 7 days · AI suggestions prioritised
                  </p>
                </div>
              )}

              <button onClick={handleActivate} disabled={!selected}
                className={`btn btn-primary w-full justify-center ${!selected ? 'opacity-50 cursor-not-allowed' : ''}`}>
                Activate Contract 📜
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
