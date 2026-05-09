// ─── BOSS BATTLES ─────────────────────────────────────────────────────────────
// Add this export to lib/curriculum.js at the bottom, before ALL_LESSONS
//
// Each boss maps to a section ID. After all lessons in that section are
// completed, the boss battle unlocks. Boss IDs must be unique.

export const BOSSES = [
  // ── World 1: 2D Animation ─────────────────────────────────────────────────
  {
    id:        '2d-fundamentals-boss',
    sectionId: '2d-fundamentals',
    worldId:   '2d',
    name:      'The Timing Titan',
    icon:      '⏱️',
    color:     '#5B9CF6',
    section:   '2D Fundamentals',
    desc:      'Prove you understand the foundational principles that drive all animation.',
    skills:    ['timing', 'squash', 'weight'],
    challenge: `You are animating a rubber ball dropping from shoulder height onto a hardwood floor, bouncing 3 times before settling. 
    
Describe in detail:
1. How timing changes across the 3 bounces (frame counts, speed)
2. How the squash/stretch values change across each bounce
3. What happens to the spacing between frames at the peak vs impact
4. How you would communicate the ball's weight through animation choices

Be as specific as possible — mention frame counts, ratios, and proportions.`,
    tips: [
      'Mention specific frame counts for each bounce',
      'Describe how squash percentage decreases with each bounce',
      'Talk about slow-in and slow-out at the peak',
      'Compare a heavy ball vs light ball to show understanding',
    ],
  },
  {
    id:        '2d-movement-boss',
    sectionId: '2d-movement',
    worldId:   '2d',
    name:      'The Motion Master',
    icon:      '🚶',
    color:     '#9B7FEA',
    section:   '2D Movement',
    skills:    ['timing', 'anticipation', 'followThrough', 'weight'],
    desc:      'Demonstrate mastery of character movement and body mechanics.',
    challenge: `Design a complete animation sequence for: A character who is terrified sees something they want desperately across the room — they freeze, then sprint toward it.

Describe in detail:
1. The anticipation poses and their timing before movement
2. The sprint's key poses (contact, down, passing, up) and timing
3. How follow-through applies to hair, clothing, and arms
4. How you would show the emotional shift from fear to desire through body language
5. The exact moment they reach the object — how do they stop?`,
    tips: [
      'Name the 4 key walk/run cycle positions',
      'Describe overlapping action on secondary elements',
      'Explain the anticipation timing ratio (anticipation vs main action)',
      'Discuss how weight affects the stop at the end',
    ],
  },
  {
    id:        '2d-advanced-boss',
    sectionId: '2d-advanced',
    worldId:   '2d',
    name:      'The Performance Director',
    icon:      '🎭',
    color:     '#FF8FAB',
    section:   '2D Advanced',
    skills:    ['storytelling', 'creativity', 'consistency', 'smoothness'],
    desc:      'Show you can direct a performance with nuance and storytelling depth.',
    challenge: `A character receives a letter. They pick it up, read it, and their expression changes — but we don't know if the news is good or bad until the very last moment.

Design this complete performance:
1. How does the character pick up the letter? (weight, anticipation)
2. What is their neutral reading posture and expression?
3. Frame by frame — how does the realisation spread across their face and body?
4. The final hold pose — describe it in complete detail (eyes, mouth, posture, hands)
5. What specific animation techniques make this moment feel emotionally true?`,
    tips: [
      'Use the silhouette test to ensure every pose reads clearly',
      'Describe subtle secondary actions (breathing, blinking)',
      'Discuss the "moment of realisation" timing precisely',
      'Reference specific Disney principles by name',
    ],
  },

  // ── World 2: 3D Animation ──────────────────────────────────────────────────
  {
    id:        '3d-fundamentals-boss',
    sectionId: '3d-fundamentals',
    worldId:   '3d',
    name:      'The Graph Editor Guardian',
    icon:      '📈',
    color:     '#9B7FEA',
    section:   '3D Fundamentals',
    skills:    ['timing', 'smoothness', 'consistency'],
    desc:      'Prove your command of 3D animation tools and the Graph Editor.',
    challenge: `You are animating a 3D door swinging open dramatically. In Blender, describe:

1. How you would set up the keyframes (which frames, what values)
2. What the Graph Editor curves look like for a dramatic swing (fast open, slow settle)
3. How you use bezier handles to create the overshooting effect as the door reaches open position
4. The secondary motion you'd add (door handle, hinges, room elements reacting)
5. How you'd check and correct the arc of motion in the viewport`,
    tips: [
      'Reference specific Blender keyboard shortcuts',
      'Describe the bezier curve shape in the Graph Editor',
      'Explain what "overshooting" looks like as a curve value',
      'Mention what happens to objects attached to the door',
    ],
  },
  {
    id:        '3d-movement-boss',
    sectionId: '3d-movement',
    worldId:   '3d',
    name:      'The Camera Commander',
    icon:      '📹',
    color:     '#4ECDC4',
    section:   '3D Movement',
    skills:    ['cinematography', 'timing', 'storytelling'],
    desc:      'Command camera and character movement in 3D space.',
    challenge: `Design a 10-second 3D camera shot that reveals a character discovering an ancient ruin for the first time.

Describe:
1. The starting camera position and what it shows
2. The camera movement type(s) used and their exact motivation
3. How the character's position and movement is blocked within the shot
4. How you ensure the camera movement has natural weight and easing in Blender
5. What the shot communicates emotionally by the end`,
    tips: [
      'Name specific camera movement types (dolly, crane, orbit)',
      'Describe the easing curve in the Graph Editor for camera',
      'Explain how character and camera work together',
      'Discuss depth of field choices',
    ],
  },

  // ── World 3: VFX ──────────────────────────────────────────────────────────
  {
    id:        'vfx-fundamentals-boss',
    sectionId: 'vfx-fundamentals',
    worldId:   'vfx',
    name:      'The Compositor',
    icon:      '🎞️',
    color:     '#FF5757',
    section:   'VFX Fundamentals',
    skills:    ['vfx', 'consistency', 'creativity'],
    desc:      'Show you understand the fundamentals of visual effects production.',
    challenge: `You need to composite a dragon flying over a real cityscape filmed on a handheld camera.

Walk through your complete workflow:
1. What reference and pre-production work do you do before compositing?
2. How do you match the lighting on the CGI dragon to the real footage?
3. How do you handle camera shake matching?
4. What atmospheric effects do you add to integrate the dragon?
5. What are the 3 most common mistakes beginners make in this type of shot?`,
    tips: [
      'Reference specific After Effects or compositing tools',
      'Describe colour matching methodology',
      'Explain depth integration (atmospheric haze)',
      'Mention motion blur matching',
    ],
  },

  // ── World 4: Cinematography ────────────────────────────────────────────────
  {
    id:        'cin-fundamentals-boss',
    sectionId: 'cin-fundamentals',
    worldId:   'cinematography',
    name:      'The Visual Storyteller',
    icon:      '🎥',
    color:     '#FFB347',
    section:   'Cinematography Fundamentals',
    skills:    ['cinematography', 'storytelling', 'creativity'],
    desc:      'Demonstrate your ability to tell stories purely through visual choices.',
    challenge: `Without any dialogue, design a 30-second scene that communicates: a character realises they have been betrayed by their closest friend.

For each shot, specify:
1. Shot type (ECU, CU, MS, Wide, etc.) and why
2. Camera angle (high, low, eye-level, dutch) and why
3. Lighting setup and emotional intent
4. Character blocking and positioning
5. How the sequence builds to the emotional reveal`,
    tips: [
      'Use at least 3 different shot types',
      'Explain the rule of thirds in your compositions',
      'Describe how lighting changes to reflect mood shift',
      'Reference the 180-degree rule',
    ],
  },

  // ── World 5: Motion Graphics ───────────────────────────────────────────────
  {
    id:        'mg-fundamentals-boss',
    sectionId: 'mg-fundamentals',
    worldId:   'motion-graphics',
    name:      'The Motion Architect',
    icon:      '🎯',
    color:     '#4ECDC4',
    section:   'Motion Graphics Fundamentals',
    skills:    ['motionDesign', 'timing', 'creativity', 'smoothness'],
    desc:      'Prove your mastery of motion design principles and After Effects.',
    challenge: `Design a complete 5-second logo reveal animation for a brand called "APEX" — a modern, premium athletic brand.

Specify:
1. The animation style and how it reflects the brand personality
2. The easing curves used (describe the bezier shape) and why
3. How you achieve hierarchy — what the viewer sees first, second, third
4. The typography animation technique and timing
5. What After Effects features/expressions you use and why`,
    tips: [
      'Reference specific After Effects tools and shortcuts',
      'Describe easing as bezier curve shapes',
      'Explain overshoot and settle timing',
      'Connect every visual choice to brand personality',
    ],
  },
];

// ─── HELPER: Get boss for a section ──────────────────────────────────────────
export function getBossForSection(sectionId) {
  return BOSSES.find((b) => b.sectionId === sectionId) ?? null;
}
