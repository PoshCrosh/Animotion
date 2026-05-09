// lib/templates.js — Pre-built animation templates that load into the editor

export const TEMPLATES = [
  {
    id: 'bouncing-ball',
    name: 'Bouncing Ball',
    icon: '⚽',
    category: '2D Basics',
    desc: 'Classic rubber ball with squash & stretch across 12 frames. Perfect for learning timing.',
    difficulty: 'Beginner',
    frameCount: 12,
    fps: 12,
    color: '#5B9CF6',
    frames: [
      { id: 101, keyframe: true  },
      { id: 102, keyframe: false },
      { id: 103, keyframe: false },
      { id: 104, keyframe: true  },
      { id: 105, keyframe: false },
      { id: 106, keyframe: false },
      { id: 107, keyframe: true  },
      { id: 108, keyframe: false },
      { id: 109, keyframe: false },
      { id: 110, keyframe: true  },
      { id: 111, keyframe: false },
      { id: 112, keyframe: false },
    ],
    layers: [
      { id: 1, name: 'Ball', visible: true },
      { id: 2, name: 'Shadow', visible: true },
    ],
    // frameData is generated procedurally on load
    generateFrames: true,
    generatorType: 'bouncingBall',
    skills: ['timing', 'squash', 'weight'],
  },
  {
    id: 'walk-cycle-base',
    name: 'Walk Cycle Base',
    icon: '🚶',
    category: '2D Character',
    desc: '8-frame walk cycle skeleton with key contact, down, pass, and up positions marked.',
    difficulty: 'Intermediate',
    frameCount: 8,
    fps: 12,
    color: '#9B7FEA',
    frames: [
      { id: 201, keyframe: true  }, // Contact
      { id: 202, keyframe: false }, // Down
      { id: 203, keyframe: true  }, // Passing
      { id: 204, keyframe: false }, // Up
      { id: 205, keyframe: true  }, // Contact (2nd step)
      { id: 206, keyframe: false }, // Down
      { id: 207, keyframe: true  }, // Passing
      { id: 208, keyframe: false }, // Up
    ],
    layers: [
      { id: 1, name: 'Body', visible: true },
      { id: 2, name: 'Arms', visible: true },
      { id: 3, name: 'Legs', visible: true },
    ],
    generateFrames: true,
    generatorType: 'walkCycleGuide',
    skills: ['timing', 'consistency', 'weight'],
  },
  {
    id: 'anticipation-snap',
    name: 'Anticipation Snap',
    icon: '⚡',
    category: '2D Principles',
    desc: 'A snapping motion with full anticipation wind-up and follow-through settle. Study the timing.',
    difficulty: 'Intermediate',
    frameCount: 10,
    fps: 24,
    color: '#FFB347',
    frames: [
      { id: 301, keyframe: true  }, // Hold
      { id: 302, keyframe: false }, // Start anticipation
      { id: 303, keyframe: true  }, // Full anticipation
      { id: 304, keyframe: false }, // Release
      { id: 305, keyframe: true  }, // Impact (fast)
      { id: 306, keyframe: false }, // Overshoot
      { id: 307, keyframe: true  }, // Settle 1
      { id: 308, keyframe: false }, // Settle 2
      { id: 309, keyframe: false }, // Settle 3
      { id: 310, keyframe: true  }, // Final hold
    ],
    layers: [
      { id: 1, name: 'Main Shape', visible: true },
      { id: 2, name: 'Impact Lines', visible: true },
    ],
    generateFrames: true,
    generatorType: 'anticipationSnap',
    skills: ['anticipation', 'followThrough', 'timing'],
  },
  {
    id: 'camera-pan',
    name: 'Camera Pan',
    icon: '📹',
    category: 'Camera',
    desc: 'Smooth horizontal camera pan with ease-in and ease-out. Background layer included.',
    difficulty: 'Beginner',
    frameCount: 16,
    fps: 24,
    color: '#4ECDC4',
    frames: Array.from({ length: 16 }, (_, i) => ({
      id: 401 + i,
      keyframe: i === 0 || i === 7 || i === 15,
    })),
    layers: [
      { id: 1, name: 'Foreground', visible: true },
      { id: 2, name: 'Background', visible: true },
    ],
    generateFrames: true,
    generatorType: 'cameraPan',
    skills: ['cinematography', 'smoothness'],
  },
  {
    id: 'particle-burst',
    name: 'Particle Burst',
    icon: '✨',
    category: 'VFX',
    desc: 'Radial particle burst effect — 8 frames of expanding dots with fade. Great for impact effects.',
    difficulty: 'Intermediate',
    frameCount: 8,
    fps: 24,
    color: '#FF5757',
    frames: [
      { id: 501, keyframe: true  },
      { id: 502, keyframe: false },
      { id: 503, keyframe: false },
      { id: 504, keyframe: true  },
      { id: 505, keyframe: false },
      { id: 506, keyframe: false },
      { id: 507, keyframe: false },
      { id: 508, keyframe: true  },
    ],
    layers: [
      { id: 1, name: 'Particles', visible: true },
      { id: 2, name: 'Core Flash', visible: true },
    ],
    generateFrames: true,
    generatorType: 'particleBurst',
    skills: ['vfx', 'timing', 'creativity'],
  },
  {
    id: 'logo-reveal',
    name: 'Logo Reveal',
    icon: '✨',
    category: 'Motion Graphics',
    desc: 'Clean scale + fade logo reveal with overshoot settle. Modify the shape for your own logo.',
    difficulty: 'Beginner',
    frameCount: 18,
    fps: 30,
    color: '#52C97C',
    frames: Array.from({ length: 18 }, (_, i) => ({
      id: 601 + i,
      keyframe: i === 0 || i === 8 || i === 12 || i === 17,
    })),
    layers: [
      { id: 1, name: 'Logo Shape', visible: true },
      { id: 2, name: 'Background', visible: true },
    ],
    generateFrames: true,
    generatorType: 'logoReveal',
    skills: ['motionDesign', 'smoothness', 'timing'],
  },
  {
    id: 'blank-canvas',
    name: 'Blank Canvas',
    icon: '⬜',
    category: 'Start Fresh',
    desc: 'A clean 12-frame project with 2 layers. Your blank slate.',
    difficulty: 'Beginner',
    frameCount: 12,
    fps: 12,
    color: '#9CA3AF',
    frames: Array.from({ length: 12 }, (_, i) => ({
      id: 701 + i,
      keyframe: i === 0,
    })),
    layers: [
      { id: 1, name: 'Layer 1', visible: true },
      { id: 2, name: 'Layer 2', visible: true },
    ],
    generateFrames: false,
    skills: [],
  },
];

export const TEMPLATE_CATEGORIES = ['All', '2D Basics', '2D Character', '2D Principles', 'Camera', 'VFX', 'Motion Graphics', 'Start Fresh'];

// ── Frame generator ───────────────────────────────────────────────────────────
// Generates base64 PNG data for template frames on a canvas
export function generateTemplateFrameData(template, canvasWidth = 580, canvasHeight = 360) {
  if (!template.generateFrames || typeof document === 'undefined') return {};

  const offscreen = document.createElement('canvas');
  offscreen.width  = canvasWidth;
  offscreen.height = canvasHeight;
  const ctx = offscreen.getContext('2d');
  const frameData = {};

  const W = canvasWidth;
  const H = canvasHeight;
  const CX = W / 2;
  const CY = H / 2;

  template.frames.forEach((frame, idx) => {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

    const t = template.frames.length > 1 ? idx / (template.frames.length - 1) : 0;

    switch (template.generatorType) {

      case 'bouncingBall': {
        // Parabolic arc with squash/stretch
        const bounces = 3;
        const period  = 1 / bounces;
        const phase   = (t % period) / period;
        const bounce  = Math.floor(t * bounces);
        const decay   = 1 - bounce * 0.28;

        // Ball y: parabolic within bounce
        const peakH  = H * 0.7 * decay;
        const groundY = H - 60;
        const ballY  = groundY - peakH * 4 * phase * (1 - phase);
        const ballX  = 80 + t * (W - 160);

        // Squash near ground
        const distFromGround = groundY - ballY;
        const nearGround = distFromGround < 30;
        const squashX = nearGround ? 1 + (1 - distFromGround / 30) * 0.5 : 1;
        const squashY = nearGround ? 1 - (1 - distFromGround / 30) * 0.35 : 1;
        const stretchY = phase > 0.1 && phase < 0.9 ? 1 + Math.abs(0.5 - phase) * 0.3 : 1;

        // Shadow
        ctx.beginPath();
        ctx.ellipse(ballX, groundY + 8, 22 * squashX * decay, 6, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,0,0,${0.15 * decay})`;
        ctx.fill();

        // Ground line
        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 5]);
        ctx.beginPath();
        ctx.moveTo(40, groundY + 14); ctx.lineTo(W - 40, groundY + 14);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ball
        ctx.save();
        ctx.translate(ballX, ballY);
        ctx.scale(squashX, nearGround ? squashY : stretchY);
        const g = ctx.createRadialGradient(-8, -8, 2, 0, 0, 22);
        g.addColorStop(0, '#7BBCFF');
        g.addColorStop(1, '#3B7DE0');
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.restore();
        break;
      }

      case 'walkCycleGuide': {
        // Draw guide circles + labels for walk cycle positions
        const labels  = ['CONTACT', 'DOWN', 'PASSING', 'UP', 'CONTACT', 'DOWN', 'PASSING', 'UP'];
        const heights = [0, -20, 10, 20, 0, -20, 10, 20];
        const label   = labels[idx] ?? '';
        const yOff    = heights[idx] ?? 0;

        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(40, H - 80); ctx.lineTo(W - 40, H - 80);
        ctx.stroke();
        ctx.setLineDash([]);

        // Body
        const bodyY = H / 2 + yOff;
        ctx.beginPath();
        ctx.arc(CX, bodyY - 60, 24, 0, Math.PI * 2);
        ctx.strokeStyle = '#5B9CF6';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(CX, bodyY - 36);
        ctx.lineTo(CX, bodyY + 20);
        ctx.stroke();
        // Arms (opposite swing)
        const armSwing = Math.sin(idx * Math.PI / 2) * 40;
        ctx.beginPath();
        ctx.moveTo(CX, bodyY - 20);
        ctx.lineTo(CX - armSwing, bodyY + 10);
        ctx.moveTo(CX, bodyY - 20);
        ctx.lineTo(CX + armSwing, bodyY + 10);
        ctx.stroke();
        // Legs
        const legSwing = Math.cos(idx * Math.PI / 2) * 35;
        ctx.beginPath();
        ctx.moveTo(CX, bodyY + 20);
        ctx.lineTo(CX - legSwing, H - 80);
        ctx.moveTo(CX, bodyY + 20);
        ctx.lineTo(CX + legSwing, H - 80);
        ctx.stroke();

        // Label
        ctx.fillStyle = '#5B9CF6';
        ctx.font = 'bold 11px Nunito, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, CX, 30);
        break;
      }

      case 'anticipationSnap': {
        const phases = ['hold','wind1','wind2','release','impact','over','settle1','settle2','settle3','hold2'];
        const phase2 = phases[idx] ?? 'hold';
        const scaleMap = { hold:1, wind1:0.85, wind2:0.7, release:0.72, impact:1.4, over:1.15, settle1:1.05, settle2:0.98, settle3:1.01, hold2:1 };
        const s = scaleMap[phase2] ?? 1;

        ctx.save();
        ctx.translate(CX, CY);
        ctx.scale(s, 1 / s);
        const g = ctx.createRadialGradient(-15, -15, 4, 0, 0, 50);
        g.addColorStop(0, '#FFD700');
        g.addColorStop(1, '#FFB347');
        ctx.beginPath();
        ctx.arc(0, 0, 50, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.restore();

        if (phase2 === 'impact') {
          // Impact lines
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(CX + Math.cos(angle) * 60, CY + Math.sin(angle) * 60);
            ctx.lineTo(CX + Math.cos(angle) * 90, CY + Math.sin(angle) * 90);
            ctx.strokeStyle = '#FFB347';
            ctx.lineWidth = 3;
            ctx.stroke();
          }
        }
        break;
      }

      case 'cameraPan': {
        // Eased pan: background moves right-to-left
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const panX = ease * (W * 0.4);

        // Sky gradient
        const sky = ctx.createLinearGradient(0, 0, 0, H * 0.6);
        sky.addColorStop(0, '#87CEEB');
        sky.addColorStop(1, '#E0F4FF');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, W, H * 0.6);

        // Ground
        ctx.fillStyle = '#7CB87C';
        ctx.fillRect(0, H * 0.6, W, H * 0.4);

        // Mountains (background, slow pan)
        const mPanX = panX * 0.3;
        ctx.fillStyle = '#A8C5A8';
        [[CX - 200 - mPanX, H * 0.6, 180], [CX - mPanX, H * 0.6, 220], [CX + 200 - mPanX, H * 0.6, 160]].forEach(([x, y, size]) => {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - size / 2, y - size * 0.7);
          ctx.lineTo(x + size / 2, y);
          ctx.fill();
        });

        // Trees (foreground, fast pan)
        [-panX, 120 - panX, 260 - panX, 400 - panX, 540 - panX].forEach((tx) => {
          if (tx < -40 || tx > W + 40) return;
          ctx.fillStyle = '#2D6A2D';
          ctx.beginPath();
          ctx.arc(tx, H * 0.6, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#5C4033';
          ctx.fillRect(tx - 4, H * 0.6, 8, 30);
        });

        // Pan direction indicator
        ctx.fillStyle = 'rgba(91,156,246,0.7)';
        ctx.font = 'bold 10px Nunito, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`← Pan ${Math.round(ease * 100)}%`, 16, 20);
        break;
      }

      case 'particleBurst': {
        const progress = t;
        const count = 12;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const dist  = progress * 140;
          const alpha = 1 - progress;
          const size  = 8 * (1 - progress * 0.7);
          const px = CX + Math.cos(angle) * dist;
          const py = CY + Math.sin(angle) * dist;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,87,87,${alpha})`;
          ctx.fill();
        }
        // Core
        if (progress < 0.4) {
          const coreR = 40 * (1 - progress / 0.4);
          ctx.beginPath();
          ctx.arc(CX, CY, coreR, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,215,0,${1 - progress / 0.4})`;
          ctx.fill();
        }
        break;
      }

      case 'logoReveal': {
        // Scale + fade with overshoot
        const easeOvershoot = (t) => {
          if (t < 0.5) return 4 * t * t * t;
          const f = 2 * t - 2;
          return 0.5 * f * f * f + 1;
        };
        const phaseIn  = Math.min(t / 0.5, 1);
        const scale    = easeOvershoot(phaseIn) * (phaseIn >= 1 ? 1 : 1 + Math.sin(phaseIn * Math.PI) * 0.08);
        const alpha    = Math.min(t * 3, 1);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(CX, CY);
        ctx.scale(scale, scale);
        const g = ctx.createLinearGradient(-60, -60, 60, 60);
        g.addColorStop(0, '#5B9CF6');
        g.addColorStop(1, '#9B7FEA');
        ctx.beginPath();
        ctx.roundRect(-60, -60, 120, 120, 24);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 32px Nunito, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('A', 0, 0);
        ctx.restore();
        break;
      }

      default:
        break;
    }

    frameData[frame.id] = offscreen.toDataURL('image/png');
  });

  return frameData;
}
