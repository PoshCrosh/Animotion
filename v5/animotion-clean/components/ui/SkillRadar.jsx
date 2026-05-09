'use client';
import { useMemo } from 'react';
import { SKILLS } from '../../lib/curriculum';

export default function SkillRadar({ skills, size = 300 }) {
  const cx = size / 2;
  const cy = size / 2;
  const r  = (size / 2) * 0.72;
  const count = SKILLS.length;

  const points = useMemo(() => {
    return SKILLS.map((skill, i) => {
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
      const value = Math.min(100, skills[skill.id] ?? 0) / 100;
      return {
        skill,
        angle,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        vx: cx + Math.cos(angle) * r * value,
        vy: cy + Math.sin(angle) * r * value,
        value: skills[skill.id] ?? 0,
      };
    });
  }, [skills, cx, cy, r, count]);

  // Polygon path for skill area
  const skillPath = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'}${p.vx.toFixed(2)},${p.vy.toFixed(2)}`
  ).join(' ') + ' Z';

  // Grid rings (20%, 40%, 60%, 80%, 100%)
  const rings = [0.2, 0.4, 0.6, 0.8, 1.0].map((pct) => {
    const ringPoints = SKILLS.map((_, i) => {
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
      return {
        x: cx + Math.cos(angle) * r * pct,
        y: cy + Math.sin(angle) * r * pct,
      };
    });
    return ringPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ') + ' Z';
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Grid rings */}
        {rings.map((d, i) => (
          <path key={i} d={d} fill="none"
            stroke={i === 4 ? '#D1D5DB' : '#E5E7EB'}
            strokeWidth={i === 4 ? 1.5 : 1}
            className="dark:stroke-gray-700"
          />
        ))}

        {/* Grid spokes */}
        {points.map((p, i) => (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y}
            stroke="#E5E7EB" strokeWidth="1" className="dark:stroke-gray-700" />
        ))}

        {/* Skill area fill */}
        <path d={skillPath} fill="rgba(91,156,246,0.18)" stroke="#5B9CF6" strokeWidth="2" strokeLinejoin="round" />

        {/* Skill value dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.vx} cy={p.vy} r={p.value > 0 ? 4 : 2}
            fill={p.value > 0 ? p.skill.color : '#D1D5DB'}
            stroke="white" strokeWidth="1.5"
          />
        ))}

        {/* Labels */}
        {points.map((p, i) => {
          const labelR = r + 22;
          const lx = cx + Math.cos(p.angle) * labelR;
          const ly = cy + Math.sin(p.angle) * labelR;
          const anchor = lx < cx - 5 ? 'end' : lx > cx + 5 ? 'start' : 'middle';
          return (
            <g key={i}>
              <text x={lx} y={ly - 4} textAnchor={anchor}
                fontSize="9" fontWeight="900" fill={p.skill.color}>
                {p.skill.icon}
              </text>
              <text x={lx} y={ly + 7} textAnchor={anchor}
                fontSize="7.5" fontWeight="700" fill="#9CA3AF">
                {p.skill.label.split(' ')[0]}
              </text>
              {p.value > 0 && (
                <text x={lx} y={ly + 17} textAnchor={anchor}
                  fontSize="7" fontWeight="900" fill={p.skill.color}>
                  {p.value}
                </text>
              )}
            </g>
          );
        })}

        {/* Center label */}
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fontWeight="900" fill="#5B9CF6">
          {Object.values(skills).reduce((a, b) => a + b, 0)}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="7" fontWeight="700" fill="#9CA3AF">
          pts
        </text>
      </svg>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-x-4 gap-y-1 mt-2 max-w-xs">
        {SKILLS.map((skill) => (
          <div key={skill.id} className="flex items-center gap-1">
            <span className="text-xs">{skill.icon}</span>
            <span className="text-[9px] font-bold text-gray-500 truncate">{skill.label.split(' ')[0]}</span>
            <span className="text-[9px] font-black ml-auto" style={{ color: skill.color }}>
              {skills[skill.id] ?? 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
