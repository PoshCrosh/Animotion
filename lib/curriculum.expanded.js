// lib/curriculum.expanded.js
// ─────────────────────────────────────────────────────────────────────────────
// EXPANDED LESSON CONTENT — replaces the `content` field and adds
// `frameBreakdown`, `pauseQuestions`, `practice`, `variation`, and
// expanded `quiz` arrays for all 2D Animation World lessons.
//
// HOW TO INTEGRATE:
// In lib/curriculum.js, import these and spread them into the matching
// lesson objects. Example:
//
//   import { EXPANDED_2D } from './curriculum.expanded';
//   // Then in the lesson: { ...EXPANDED_2D['2d-f2'], ...existingLesson }
//   // Or manually copy each lesson's fields below into the matching lesson.
//
// ─────────────────────────────────────────────────────────────────────────────

export const EXPANDED_2D = {

  // ── Lesson: The 12 Principles ──────────────────────────────────────────────
  '2d-f1': {
    variation: 'breakdown',
    content: `The 12 Principles of Animation were developed by Disney animators Ollie Johnston and Frank Thomas and published in "The Illusion of Life: Disney Animation" — the definitive bible of animation. These principles didn't come from a theory class. They emerged from years of trial and error, Walt Disney's relentless demands for believability, and thousands of hours studying how things actually move.

Frank Thomas and Ollie Johnston write: "Our work must have a foundation of fact in order to have sincerity. The most hilarious comedy is always based on things actual." This is the key insight behind all 12 principles — they aren't invented rules, they are observations about physical reality, translated into drawing.

THE 12 PRINCIPLES:

1. SQUASH & STRETCH — The illusion of flexibility and mass. Every living thing deforms under force. Volume stays constant — if wider, not taller.

2. ANTICIPATION — Preparation before a main action. Without it, audiences miss the action. The bigger the coming action, the bigger the anticipation required.

3. STAGING — Present each idea so it is unmistakably clear. Work in silhouette. Walt's rule: if it doesn't read as a pure black shape, the staging has failed.

4. STRAIGHT AHEAD & POSE-TO-POSE — Two methods. Straight Ahead: draw one after another, spontaneous and wild. Pose-to-Pose: plan key poses first, fill in between. Most professional work uses both.

5. FOLLOW THROUGH & OVERLAPPING ACTION — Things don't stop all at once. Walt: "Things don't come to a stop all at once, guys; first there's one part and then another." Appendages, fleshy parts, secondary elements all continue and settle at different rates.

6. SLOW IN & SLOW OUT (EASING) — Drawings cluster near the extreme poses and spread in the middle. Creates organic acceleration and deceleration. Ken Harris called it "cushioning." Nothing in nature moves at constant speed.

7. ARCS — Natural movement follows curved paths. A hand gesture traces a circular arc through space. Straight-line inbetweens break this arc and look robotic and inhuman.

8. SECONDARY ACTION — Supporting action that enriches the main action. Always subordinate — if the secondary action becomes more interesting, it was the wrong choice or staged improperly.

9. TIMING — How many frames an action takes determines its speed, weight, and personality. Two drawings of a head can communicate completely different emotions depending entirely on the timing used between them.

10. EXAGGERATION — Push reality further than it feels comfortable. Walt would say: "Will you make it so extreme that you make me mad?" Dave Hand pushed his animation so far past the mark that Walt said "I didn't mean THAT much!" — then worked back from there.

11. SOLID DRAWING — Understanding form, weight, and three-dimensionality in drawings. Marc Davis: "Drawing is giving a performance; an artist is an actor not limited by his body, only by ability and experience."

12. APPEAL — Designs that are interesting, engaging, and worth watching. Not necessarily cute — but compelling.

Remember: these principles apply to ALL animation — 2D, 3D, VFX, motion graphics. They are not 2D-only concepts. They are observations about physics, psychology, and visual communication that transcend any particular medium.`,

    frameBreakdown: [
      { title: 'Principle 1: Squash & Stretch', desc: 'Ball deforms under force — squashes wide on impact, stretches tall when fast. Volume never changes. This communicates mass, flexibility, and physical reality.', principle: 'Squash & Stretch', visual: '🥞→⚽→🏈', bg: '#EBF2FF' },
      { title: 'Principle 2: Anticipation', desc: 'Before throwing right, pull LEFT. The opposite direction of the coming action. Without this, the main action is missed.', principle: 'Anticipation', visual: '💨⬅️ then ➡️⚡', bg: '#FFF8ED' },
      { title: 'Principle 6: Slow In/Slow Out', desc: 'Drawings cluster near extreme poses (slow) and spread out in the middle (fast). Nothing moves at constant speed in nature.', principle: 'Easing', visual: '⚪⚪⚪   ⚪   ⚪⚪⚪', bg: '#EDFBF3' },
      { title: 'Principle 7: Arcs', desc: 'The hand traces a curved path — not a straight line. Inbetweens placed on the arc look natural. Straight-line inbetweens look robotic.', principle: 'Arcs', visual: '〜〜〜', bg: '#F3EFFE' },
      { title: 'Principle 5: Follow Through', desc: 'After the body stops, the hair, coat, ears continue moving — then settle. Different parts stop at different moments.', principle: 'Follow Through', visual: '🌊', bg: '#EBF2FF' },
    ],

    quiz: [
      { q: 'The 12 Principles were published in which book?', opts: ['"The Animator\'s Survival Kit"', '"The Illusion of Life: Disney Animation"', '"Character Animation Crash Course"', '"Cartoon Animation"'], correct: 1, type: 'knowledge', explanation: 'Frank Thomas and Ollie Johnston, two of Disney\'s "Nine Old Men," published The Illusion of Life in 1981.' },
      { q: 'Walt Disney\'s rule for staging: if it doesn\'t read as what, the staging has failed?', opts: ['A beautiful painting', 'A clear diagram', 'A pure black silhouette shape', 'A simple sketch'], correct: 2, type: 'knowledge', explanation: 'Walt was direct: "Work in silhouette so everything can be seen clearly." Charlie Chaplin said the same — know your emotion, show it in silhouette.' },
      { q: 'The 12 Principles apply to...', opts: ['Only traditional 2D animation', 'Only Disney films', 'All animation — 2D, 3D, VFX, motion graphics', 'Only character animation'], correct: 2, type: 'knowledge', explanation: 'These principles are observations about physics, psychology, and visual communication. They transcend medium entirely.' },
      { q: 'Marc Davis said: "Drawing is giving a performance; an artist is an actor not limited by their body, only by..."', opts: ['Their budget', 'Their software', 'Their ability and experience', 'Their imagination alone'], correct: 2, type: 'knowledge', explanation: 'This quote underpins Solid Drawing — the animator as performer. The drawing is the body, the animator is the actor.' },
      { q: 'SCENARIO: A character runs and suddenly stops. Their coat continues to swing forward past the stopping point. This is which principle?', opts: ['Anticipation', 'Squash & Stretch', 'Follow Through & Overlapping Action', 'Secondary Action'], correct: 2, type: 'scenario', explanation: 'The coat continuing after the body stops is classic Follow Through. Walt: "Things don\'t come to a stop all at once."' },
      { q: 'Dave Hand pushed his animation "so extreme that Walt would say I didn\'t mean THAT much!" This illustrates which principle?', opts: ['Staging', 'Exaggeration', 'Appeal', 'Timing'], correct: 1, type: 'knowledge', explanation: 'Thomas & Johnston recount this story to demonstrate how exaggeration is found — by exceeding it first, then working back to the right level.' },
      { q: 'Slow In and Slow Out means drawings are...', opts: ['Evenly spaced throughout', 'Clustered near extreme poses, spread in the middle', 'Clustered in the middle, spread near extremes', 'All spaced the same distance apart'], correct: 1, type: 'knowledge', explanation: 'Drawings cluster near the "extremes" (key poses) and spread in the middle of the action. This creates the organic acceleration/deceleration of natural movement.' },
      { q: 'Which approach gives the animator "spontaneity" but can lose track of size and volume?', opts: ['Pose-to-Pose', 'Straight Ahead Action', 'The X-Sheet method', 'The inbetween method'], correct: 1, type: 'knowledge', explanation: 'Straight Ahead: draw one frame after another without planning. Spontaneous and wild, but can go off model. Pose-to-Pose gives control but requires more planning.' },
    ],

    practice: `Apply the silhouette test: Draw or describe the 4 strongest key poses from a character performing ONE of these actions — jumping over an obstacle, picking up something very heavy, or reacting to a surprise. For each pose: what does it communicate in pure silhouette? Which of the 12 principles is most active in each pose?`,
  },

  // ── Lesson: Timing & Spacing ──────────────────────────────────────────────
  '2d-f2': {
    variation: 'breakdown',
    content: `Richard Williams opens his chapter on timing and spacing with a simple demonstration: the bouncing ball. "The bouncing ball says it all," he writes. "The old bouncing-ball example is often used because it shows so many different aspects of animation."

THE FUNDAMENTAL DISTINCTION:

TIMING is WHERE the action happens. The impacts — where the ball hits the ground — are the timing. These are the rhythm, the beats, the accents. Think of it like music: the timing is where the notes fall on the beat.

SPACING is HOW the drawings are distributed between those beats. Look at the individual ball positions drawn along the arc: at the peak of the arc, the ball is moving slowly — the drawings are clustered tightly together. As the ball falls, it accelerates — the drawings spread further and further apart. At impact, they cluster again as the ball squashes, then spread as it shoots up.

Williams writes: "The ball overlaps itself when it's at the slow part of its arc, but when it drops fast, it's spaced further apart. That's the spacing. The spacing is how close or far apart those clusters are. That's it. It's simple, but it's important. The spacing is the tricky part. Good animation spacing is a rare commodity."

THE CRITICAL INSIGHT — TIMING ALONE ISN'T ENOUGH:

"Certainly for a film director, timing is the most important thing. For an animator, it's only half the battle. We need the spacing as well. We can have a natural feel for timing, but we have to learn the spacing of things."

HOW THEY WORK TOGETHER:

Imagine two balls bouncing at exactly the same timing (same beats, same rhythm). But one has evenly-spaced drawings (mechanical robot movement) and one has clustered-then-spread drawings (natural organic movement). They hit the ground at the same moment — same timing — but feel completely different because the spacing is different.

REAL-WORLD TEMPO REFERENCE (Williams):
Milt Kahl, one of Disney's greatest animators, bought a stopwatch on his first week at Disney and went downtown during lunch. He timed people walking. They were "invariably on twelve exposures — right on the nose. March time." He used 12fps as his eternal reference point. Everything was "about 8s" or "about 16s" relative to that baseline.

THE PRACTICAL EXERCISE:
Williams suggests: take a coin, film it in stages under a camera. First plot the timing — where you want it to hit the ground. Then push the coin around, taking a picture at each position. Find what spacing looks right through experimentation. You're already animating — dealing with the fundamental elements — without making a single drawing.

Thomas & Johnston add the human dimension: "The number of drawings used in any move determines the amount of time that action will take on the screen. If the drawings are simple, clear, and expressive, the story point can be put over quickly." Just two drawings of a head — one leaning right, one tilted left — can communicate a multitude of ideas depending entirely on the timing used between them.`,

    frameBreakdown: [
      { title: 'Peak of arc — slow spacing', desc: 'Ball has almost zero velocity here. Drawings clustered tightly — the ball appears to "hang" for a moment before gravity takes over. This is Slow In.', principle: 'Spacing: clustered = slow', visual: '⚪⚪⚪', bg: '#EBF2FF' },
      { title: 'Mid-fall — accelerating', desc: 'Gravity is pulling. Each frame the ball moves further than the last. The gap between drawings INCREASES as speed increases.', principle: 'Spacing: spreading = accelerating', visual: '⚪  ⚪   ⚪', bg: '#F5F9FF' },
      { title: 'Near impact — maximum speed', desc: 'Drawings at maximum distance from each other. Ball traveling fastest. This is the widest spacing in the entire arc.', principle: 'Spacing: maximum gap = maximum speed', visual: '⚪     ⚪     ⚪', bg: '#EBF2FF' },
      { title: 'BOINK — the timing beat', desc: 'The impact. This is the TIMING — the beat, the accent. Where it hits the ground is the rhythm of the action. Now drawings cluster suddenly on squash.', principle: 'Timing: the beat', visual: '💥🥞', bg: '#FFF8ED' },
      { title: 'Even spacing — WRONG', desc: 'Compare: equal gaps between every drawing. No acceleration, no deceleration. Looks mechanical and lifeless. This is what to AVOID.', principle: 'Wrong spacing = robotic', visual: '⚪ ⚪ ⚪ ⚪ ⚪ ⚪', bg: '#FFF0F0' },
    ],

    pauseQuestions: [
      { question: 'The ball is at the TOP of its arc. How should the drawings be spaced here?', opts: ['Far apart — it\'s moving fast', 'Clustered closely together — it\'s almost stopped', 'Evenly spaced', 'Only one drawing needed'], correct: 1, atSecond: 12 },
      { question: 'Williams says timing is only "half the battle" for an animator. What\'s the other half?', opts: ['Drawing ability', 'The spacing of things', 'Color and design', 'Story understanding'], correct: 1, atSecond: 35 },
    ],

    quiz: [
      { q: 'Richard Williams says "The bouncing ball says it all" because it demonstrates...', opts: ['Only squash and stretch', 'Many aspects of animation — timing, spacing, arcs, squash/stretch', 'Only timing basics', 'Only how to draw circles'], correct: 1, type: 'knowledge', explanation: 'The bouncing ball is the complete animation exercise — it demonstrates timing, spacing, arcs, squash/stretch, slow in/out, and weight all at once.' },
      { q: 'What is SPACING in animation?', opts: ['How many frames are between keyframes', 'How close or far apart the individual drawing positions are clustered', 'The distance between characters on screen', 'The gaps between animation shots'], correct: 1, type: 'knowledge', explanation: 'Spacing is the distribution of drawings along the path of action. Clustered = slow. Spread apart = fast. This controls feel and weight independent of timing.' },
      { q: 'Milt Kahl discovered that people walking are invariably on what timing?', opts: ['8 frames per step', '10 frames per step', '12 frames per step', '16 frames per step'], correct: 2, type: 'knowledge', explanation: 'Kahl timed hundreds of real walkers downtown. 12 exposures per step — "right on the nose, March time." He used this as his eternal reference baseline.' },
      { q: 'SCENARIO: A heavy rock and a feather fall the same height. The rock should have...', opts: ['More frames and tighter spacing throughout the fall', 'Fewer frames and wider spacing gaps as it falls', 'The same timing as the feather', 'No spacing variation'], correct: 1, type: 'scenario', context: 'Think about how gravity and air resistance affect each object.', explanation: 'The rock accelerates fast — fewer frames, quickly widening spacing. The feather drifts — more frames, gentler spacing changes, with air-resistance fluctuations.' },
      { q: 'Even spacing between all drawings creates what type of motion?', opts: ['Natural, organic motion', 'Heavy, powerful motion', 'Mechanical, robotic motion — constant velocity', 'Energetic, lively motion'], correct: 2, type: 'knowledge', explanation: 'Constant spacing = constant velocity. Nothing in nature moves this way. It reads immediately as artificial and mechanical.' },
      { q: 'Thomas & Johnston write that two drawings of a head can communicate many different things depending on...', opts: ['The drawing style', 'The timing used between them', 'The background color', 'The character\'s expression'], correct: 1, type: 'knowledge', explanation: 'With the same two extreme positions, you can create completely different emotional content by varying the number and placement of inbetween drawings.' },
      { q: 'SCENARIO: An animator has great natural rhythm and beat sense. What does Williams say they still must learn?', opts: ['More drawing technique', 'The spacing of things', 'Sound synchronization', 'Color theory'], correct: 1, type: 'scenario', explanation: 'Williams: "We can have a natural feel for timing, but we have to learn the spacing of things." They are separate skills — timing feels natural, spacing is technical craft.' },
      { q: 'Ken Harris called Slow In/Slow Out by what term that captures its physical feeling?', opts: ['Easing', 'Cushioning', 'Damping', 'Ramping'], correct: 1, type: 'knowledge', explanation: 'Williams quotes Ken Harris calling it "cushioning" — which perfectly describes the physical sensation: the drawing cushions into and out of the extreme pose.' },
    ],

    practice: `Williams' coin exercise, adapted: Describe in frame-by-frame detail a rubber ball dropped from shoulder height bouncing TWICE. For each bounce: specify frame count per bounce, where the drawings cluster (slow), where they spread (fast), and how the squash changes between bounce 1 and bounce 2. Focus on the SPACING, not just the timing beats.`,
  },

  // ── Lesson: Squash & Stretch ──────────────────────────────────────────────
  '2d-f3': {
    variation: 'build',
    content: `Squash and stretch is the most fundamental of all the Disney principles. It is what separates animation from "illustrated radio" — the flat, mechanical drawings that characterized early cartoons before the principles were discovered.

FROM THOMAS & JOHNSTON:

The principle gives the illusion of flexibility and mass. When a rubber ball hits the ground it squashes — flattens and widens. As it bounces up it stretches — elongates in the direction of travel. This tells the audience two things simultaneously: this object has MASS (it deforms under force) and FLEXIBILITY (it can recover from deformation).

THE IRON LAW: VOLUME MUST STAY CONSTANT.

This cannot be stressed enough. If you squash something wider, it cannot also be taller. If you stretch it taller, it cannot also be wider. Think of it like a balloon full of water — you can squeeze one end and it bulges at the other, but the total water volume never changes. This law applies whether you're animating rubber, flesh, muscle, or even rigid objects like cars and houses.

Thomas & Johnston on rigid objects: "Even rigid objects can use subtle squash and stretch to imply weight." A door slamming shut has a slight bend at the hinge. A character's rigid boot has subtle compression when it lands. Rigidity is on a spectrum — almost nothing is perfectly stiff.

FROM WILLIAMS:

Williams adds a critical warning: "I've found that you can get a good enough effect with a rigid coin — provided the spacing of it was right — so this added technique is not always necessary." If you do the "squishy squashy thing" too much, everything comes out "sploopy" — like it's made of rubber. Life isn't usually like that.

The lesson: SPACING communicates weight first. Squash and stretch is a tool to add physical reality on top of good spacing — not a replacement for it.

THE MOVING HOLD (Thomas & Johnston):

This is one of the most powerful applications of squash and stretch. When a character needs to hold a pose for 8-16 frames, the flow of action stops and the drawing begins to look flat and 2D. The solution: make TWO drawings.

The first drawing is the key pose. The second drawing goes BEYOND the pose — a slightly more extreme version where everything pushes further. "You hit the pose, then drift on beyond to an even stronger pose — everything goes further, the cheeks go up, the ears fly out, the hands rise; but essentially he's still in his pose." Then the character settles back from the second drawing to the first.

This gives squash and stretch to held poses — keeping them dimensional and alive even without movement.

WHAT SQUASH/STRETCH COMMUNICATES:
• Degree of squash = softness of material AND weight of impact
• More squash on a hit = softer object or harder surface
• Less squash = harder material, or lighter impact
• Stretch during fast movement = speed and direction of travel
• Amount of stretch = velocity (faster = more elongation)

APPLYING IT TO CHARACTERS:
Facial squash and stretch is the most powerful acting tool available. The face is pure soft material — cheeks, lips, brow. A massive smile squashes the cheeks upward and widens the face. Shock stretches the face vertically — eyes wide, jaw dropping. Study faces in real life and ask: what is the squash/stretch doing here?`,

    frameBreakdown: [
      { title: 'At rest — normal shape', desc: 'Ball is perfectly round. No force acting on it. This is the baseline volume that must be preserved throughout all deformation.', principle: 'Volume baseline', visual: '⚽', bg: '#F5F9FF' },
      { title: 'Falling — beginning stretch', desc: 'Ball begins to elongate slightly in direction of travel. The faster it goes, the more it stretches. Width decreases as height increases — volume preserved.', principle: 'Stretch: direction of travel', visual: '🏈', bg: '#EBF2FF' },
      { title: 'Maximum stretch — just before impact', desc: 'Ball at peak velocity just before contact. Maximum elongation in fall direction. Width at minimum. Volume exactly the same as at rest.', principle: 'Stretch: maximum velocity', visual: '🏈↑', bg: '#EBF2FF' },
      { title: 'SQUASH — impact moment', desc: 'Contact with ground. Ball squashes WIDE and FLAT. Height dramatically reduced, width dramatically increased. Volume: still constant! The degree of squash = softness of ball and hardness of impact.', principle: 'Squash: volume preserved', visual: '🥞', bg: '#FFF8ED' },
      { title: 'Rising stretch — leaving ground', desc: 'Ball shoots upward. Elongated again — now in upward direction. Energy from the squash releases. Width returns to minimum.', principle: 'Stretch: upward direction', visual: '🏈↑', bg: '#EBF2FF' },
      { title: 'Returning to round', desc: 'Ball decelerates near the top. Returns to round as velocity decreases. Drawings cluster together here — Slow In. Same round shape as frame 1.', principle: 'Round at slow speed', visual: '⚽', bg: '#F5F9FF' },
    ],

    quiz: [
      { q: 'The Iron Law of Squash & Stretch: if you squash something wider, it cannot also be...', opts: ['Faster', 'Taller', 'More colorful', 'Older'], correct: 1, type: 'knowledge', explanation: 'Volume must stay constant. Like a water balloon — squeeze one end and the other bulges. Width and height are inverse when deforming.' },
      { q: 'Williams warns that too much squash and stretch makes everything look...', opts: ['Too heavy', '"Sploopy" — like rubber. Life usually isn\'t like that.', 'Too fast', 'Too flat'], correct: 1, type: 'knowledge', explanation: 'Squash/stretch is a tool to enhance good spacing — not a replacement for it. Overuse creates a rubbery world that reads as artificial.' },
      { q: 'The "Moving Hold" technique uses squash and stretch to...', opts: ['Make characters jump higher', 'Keep held poses feeling alive and dimensional', 'Speed up animation', 'Add weight to landings'], correct: 1, type: 'knowledge', explanation: 'Thomas & Johnston: make TWO drawings for a held pose. One is the key pose; the second goes beyond it slightly. The character drifts to the extreme and settles back — giving life to what would be a flat hold.' },
      { q: 'A LOT of squash on a ball impact communicates that the ball is...', opts: ['Very fast', 'Very heavy', 'Soft — either a soft ball or hitting a soft surface', 'Made of metal'], correct: 2, type: 'scenario', explanation: 'Degree of squash = softness of material AND hardness of impact force. A golf ball barely squashes; a stress ball squashes dramatically.' },
      { q: 'SCENARIO: You\'re animating a rigid wooden box landing. Should you use squash and stretch?', opts: ['No — rigid objects cannot squash or stretch', 'Yes — even rigid objects use SUBTLE squash/stretch to imply weight and impact', 'Only if the box is heavy', 'Only on the shadow, not the box itself'], correct: 1, type: 'scenario', context: 'Thomas & Johnston address this directly.', explanation: 'Thomas & Johnston: "Even rigid objects can use subtle squash and stretch to imply weight." A slight compression on the landing frame, a slight vibration after — this is enough.' },
      { q: 'When a ball is at the top of its arc, moving slowly, its shape should be...', opts: ['Stretched vertically', 'Squashed flat', 'Normal/round — close to its rest shape', 'Stretched horizontally'], correct: 2, type: 'visual', explanation: 'At slow speed (near the peak), the ball returns to its natural round shape. Stretch appears during FAST travel. At near-zero velocity, no deformation occurs.' },
    ],

    practice: `Build task: Describe or sketch (in the canvas) the squash and stretch stages for ONE of these scenarios — choose the most challenging one: A) A water balloon hitting a floor, B) A stiff plastic toy falling off a table, C) A character's face going from shock to delight. For each stage: specify the shape change AND confirm why the volume is still preserved.`,
  },

  // ── Lesson: Bouncing Ball ─────────────────────────────────────────────────
  '2d-f4': {
    variation: 'build',
    content: `The bouncing ball is the "Hello World" of animation. Every student of animation does this exercise. Every master animator has done it hundreds of times. Richard Williams calls it the exercise that "shows so many different aspects of animation" simultaneously.

Here is exactly what the bouncing ball teaches — and WHY each part matters:

1. TIMING (where the beats fall)
The moment the ball hits the ground is the timing. This establishes the rhythm of the whole piece. Two balls with identical arcs but different timing feel completely different — one might feel like a heavy basketball, the other a ping-pong ball.

2. SPACING (how drawings are distributed)
• At the PEAK of the arc: drawings cluster tightly — the ball appears to hang. This is Slow In.
• During the FALL: drawings spread progressively further apart as gravity accelerates the ball.
• At MAXIMUM SPEED (just before impact): widest gap between consecutive drawings.
• After IMPACT: drawings cluster again as ball decelerates going up.

Williams' key phrase: "The ball overlaps itself when it's at the slow part of its arc."

3. SQUASH ON IMPACT
The ball flattens and widens when it hits the ground. The degree of squash tells the audience:
• How soft the ball is (rubber ball: lots of squash / golf ball: barely any)
• How hard the impact is (dropped from high: more squash / rolled gently: less)
Remember: volume stays constant. Squash wide = not as tall.

4. STRETCH DURING TRAVEL
The ball elongates in the direction of travel during fast movement. More stretch = more velocity. The ball stretches most just before impact (fastest point) and just after leaving the ground.

5. ARCS (the parabolic path)
The ball never travels in a straight line. It follows a parabolic arc — curved, not straight. The arc changes shape with each bounce as energy is lost. Early Disney animators discovered that inbetweens placed straight across between two extremes (not following the arc) completely destroyed the feeling of natural movement.

6. ENERGY LOSS (each bounce smaller)
With each bounce, the ball loses energy to heat and sound. So:
• Each successive bounce is LOWER than the last
• Each successive bounce has LESS squash (less impact force)
• The timing between bounces gets SHORTER (less height = less time in air)
• The final "bounces" become tiny hops, then the ball rolls to a stop

GETTING IT RIGHT:
Williams' advice: work out the timing FIRST (where do the "boinks" fall?), then figure out the spacing. Think of a coin being pushed along a table — you're plotting points in time and space before worrying about the shape of anything.

The difference between a heavy bowling ball bouncing and a light ping-pong ball bouncing is almost entirely TIMING and SPACING — not the drawing of the ball itself. The heavy ball: takes more frames to fall, deeper squash, fewer bounces. The light ball: snappier timing, less squash, more bounces before stopping.`,

    frameBreakdown: [
      { title: 'Frame 1: Release', desc: 'Ball released from shoulder height. Drawings begin to spread immediately as gravity accelerates it. Slight stretch begins downward.', principle: 'Spacing begins to spread', visual: '⚽⬇️', bg: '#EBF2FF' },
      { title: 'Frame 5: Mid-fall', desc: 'Drawings significantly spread apart. Ball is at half-speed. Stretch increasing in direction of fall. About 5 frames into the fall.', principle: 'Spacing: acceleration', visual: '🏈⬇️', bg: '#F5F9FF' },
      { title: 'Frame 8: Just before impact', desc: 'Maximum spacing — drawings furthest apart. Ball at peak velocity. Maximum stretch downward. This is the fastest moment of the entire animation.', principle: 'Maximum spacing = maximum speed', visual: '🏈⬇️⬇️', bg: '#EBF2FF' },
      { title: 'Frame 9: SQUASH', desc: 'Contact! The timing beat — the "boink." Ball squashes wide and flat. Volume preserved. For a rubber ball: dramatic squash. For a golf ball: barely any.', principle: 'Timing beat + Squash', visual: '💥🥞', bg: '#FFF8ED' },
      { title: 'Frame 10: Stretch up', desc: 'Ball rebounds. Elongated upward. Drawings begin to cluster as ball decelerates against gravity. Less height than original drop — energy was lost.', principle: 'Stretch + energy loss', visual: '🏈⬆️', bg: '#EBF2FF' },
      { title: 'Frame 14: Second peak', desc: 'LOWER than first peak. Drawings very clustered — slow, almost hanging. Notice: shorter time in air than first bounce because it didn\'t go as high.', principle: 'Energy loss in timing', visual: '⚽ (lower)', bg: '#F5F9FF' },
    ],

    quiz: [
      { q: 'The bouncing ball exercise simultaneously teaches which combination of principles?', opts: ['Only timing and spacing', 'Timing, spacing, squash/stretch, arcs, and weight', 'Only squash and stretch', 'Only arc paths'], correct: 1, type: 'knowledge', explanation: 'Williams calls it "the exercise that shows so many different aspects of animation." It\'s the complete foundation exercise.' },
      { q: 'With each successive bounce, the ball bounces LOWER because...', opts: ['The animator draws it that way', 'Energy is lost to heat and sound on each impact', 'Gravity gets stronger', 'The ball gets heavier'], correct: 1, type: 'knowledge', explanation: 'Physics: each impact converts kinetic energy to heat and sound. Less energy remains to propel the ball upward. This is why timing between bounces also gets shorter.' },
      { q: 'SCENARIO: You animate two balls dropping the same height. Ball A has 3 frames between the "boinks." Ball B has 12 frames. Which ball seems heavier?', opts: ['Ball A — faster = more force', 'Ball B — slower = more weight and mass', 'Both feel the same', 'Neither — timing doesn\'t affect perceived weight'], correct: 1, type: 'scenario', explanation: 'More frames = slower movement = more mass. Ball B\'s slower descent and longer time in air communicates greater weight.' },
      { q: 'The path of a bouncing ball should follow what kind of shape?', opts: ['Straight lines between each impact', 'A perfect circle', 'Parabolic arcs — curves, not straight lines', 'Random directions'], correct: 2, type: 'knowledge', explanation: 'Gravity creates a parabolic arc — curved on both sides of the peak. Inbetweens placed straight between two positions break this arc and look wrong.' },
      { q: 'When should the stretch be at its MAXIMUM on a falling ball?', opts: ['At the very top of the arc', 'Halfway down', 'Just before impact — the fastest point', 'Just after leaving the ground going up'], correct: 2, type: 'visual', explanation: 'Just before impact is the fastest point of the entire fall. Maximum velocity = maximum stretch. The elongation reflects the speed.' },
      { q: 'A ball dropped from very low height (about 5cm) hits the ground. How much squash should it have?', opts: ['Same as a ball dropped from 2 metres', 'Dramatic squash — all balls squash the same', 'Very little squash — the impact force was minimal', 'Maximum squash — it hit the ground'], correct: 2, type: 'scenario', explanation: 'Squash reflects impact FORCE, not just the fact of contact. A low-energy impact produces minimal deformation. The squash is proportional to the velocity at impact.' },
    ],

    practice: `Build challenge: Using the mini canvas, animate (or sketch) a rubber ball making exactly TWO bounces across the canvas. Requirements: 1) Clear arc paths (no straight lines), 2) Second bounce visibly lower than first, 3) Squash on each impact, 4) Some stretch during travel. Focus on getting the arc right first — then add squash/stretch. Draw the arc path lightly first as a guide.`,
  },

  // ── Lesson: Walk Cycles ────────────────────────────────────────────────────
  '2d-m1': {
    variation: 'breakdown',
    content: `Richard Williams opens his walk chapter with this observation: "Why is it that we recognize our Uncle Charlie even though we haven't seen him for ten years — walking — back view — out of focus — far away? Because everyone's walk is as individual and distinctive as their face. And one tiny detail will alter everything. There is a massive amount of information in a walk and we read it instantly."

This is why walk cycles are the animator's rite of passage. Master the walk and you understand character, weight, timing, rhythm, and mechanics — all simultaneously.

ART BABBITT'S METHOD (as taught by Williams):
Before drawing a single frame, observe a person walking from the BACK VIEW. Follow them and ask yourself:
— Are they old? Young?
— What's their financial position?
— State of health?
— Strict? Permissive?
— Depressed? Hopeful? Sad? Happy?

Then run around to see the front and verify your reading. Every one of those qualities is transmitted through the walk — before you see their face.

THE 4 KEY POSITIONS:

1. CONTACT POSITION (EXTREME #1)
The heel of the leading foot touches the ground. This is one of your two key drawings. The arms are always opposite to the legs for balance and thrust — right leg leads, left arm leads. At contact, the body is at roughly mid-height.

2. DOWN POSITION
The body is at its LOWEST point as the full weight transfers to the front foot. The knee bends to absorb the impact. Critically: the arm swing reaches its WIDEST here — not at the contact position as you might expect. This is the weight beat of the walk.

3. PASSING POSITION (THE BREAKDOWN)
The free leg passes beneath the body, level with the weight-bearing leg. The body rises to slightly HIGHER than the midpoint between the two contact positions. Why higher? Because the weight-bearing leg is now straight, which lifts the pelvis, body, and head. This is the breakdown drawing — the middle position — and it determines the CHARACTER of the walk.

4. UP POSITION  
The body is at its HIGHEST as it rides over the straight weight leg and the free leg swings forward. Then it falls into the next contact.

WILLIAMS' TIMING FORMULA:
Milt Kahl timed hundreds of real people walking and found they were "invariably on twelve exposures — right on the nose. March time." So:
• 12 frames per step = natural, business-like walk (the standard)
• 8 frames per step = cartoon or slow run
• 16 frames per step = strolling, leisurely
• 20 frames per step = elderly or tired person

THE ARMS:
Arms are ALWAYS opposite to the legs. When the right leg leads, the left arm swings forward. This gives balance and forward momentum. The arm swing reaches its widest at the DOWN position — not at contact.

THE HEAD:
The head bobs counter to the hip movement. As hips go down (DOWN position), the head resists slightly and continues upward for a frame before following. This creates the natural "bounce" of a walk.

WALK CHARACTER:
The passing position is where you inject the personality. Change how high or low it is, how much the hips tilt, how the arms swing, and the entire character of the walk changes:
• Very low passing position = heavy, tired, defeated
• Very high passing position = light, bouncy, energetic  
• Stiff passing position = formal, uptight, nervous
• Loose, swinging hips = relaxed, confident

Thomas & Johnston: "Walk cycles reveal character. A bouncy walk = happy/energetic. A slouched walk = tired/defeated. Long strides = confident. Short, quick steps = nervous or excited."`,

    frameBreakdown: [
      { title: 'Contact position (Extreme #1)', desc: 'Heel of leading foot hits ground. Right leg leads → left arm leads (opposite). Arms at a medium position. Body at mid-height. This is your first key drawing.', principle: 'Extremes: Arm-leg opposition', visual: '🚶→', bg: '#EBF2FF' },
      { title: 'Down position', desc: 'Body at LOWEST point — knee absorbs the weight transfer. Arm swing is WIDEST here (not at contact!). The weight beat. Character feels grounded.', principle: 'Weight: DOWN is the lowest point', visual: '⬇️🚶', bg: '#FFF8ED' },
      { title: 'Passing position (Breakdown)', desc: 'Free leg passes weight-bearing leg. Body HIGHER than midpoint because weight leg is straight. This is the breakdown. Its height and style define the character of the walk.', principle: 'Breakdown: slightly above midpoint', visual: '🚶⬆️slight', bg: '#EBF2FF' },
      { title: 'Up position', desc: 'Body at HIGHEST — rides over straight weight leg. Free leg swings forward to become next contact foot. Sets up the rhythm for the next step.', principle: 'Up: momentum carries body high', visual: '⬆️🚶', bg: '#F5F9FF' },
      { title: 'Contact position 2 (Extreme #2)', desc: 'Opposite foot now leads. Mirror of position 1. One complete step = 8-12 frames at natural walk pace. Cycle then repeats from here.', principle: 'Cycle: complete step', visual: '←🚶', bg: '#EBF2FF' },
    ],

    pauseQuestions: [
      { question: 'The arm swing reaches its WIDEST on which position?', opts: ['The Contact position', 'The Down position', 'The Passing position', 'The Up position'], correct: 1, atSecond: 10 },
      { question: 'The Passing position is HIGHER than the midpoint between Down positions. Why?', opts: ['To make the walk look bouncy', 'Because the weight leg is straight, lifting the pelvis and body', 'Because the arms swing up', 'It\'s not higher — it\'s at the midpoint'], correct: 1, atSecond: 28 },
    ],

    quiz: [
      { q: 'Williams says everyone\'s walk is "as individual and distinctive as..." what?', opts: ['Their personality', 'Their face', 'Their clothing', 'Their height'], correct: 1, type: 'knowledge', explanation: 'One tiny detail alters everything. The walk communicates age, health, emotional state, confidence — all before seeing the face.' },
      { q: 'The arm swing is WIDEST on which position?', opts: ['Contact', 'Down', 'Passing', 'Up'], correct: 1, type: 'knowledge', explanation: 'Williams: "The arm swing is at its widest on the DOWN position — not on the contact position as you might prefer." This is one of the subtleties that beginners miss.' },
      { q: 'SCENARIO: Your walk cycle looks "floaty" with no sense of weight. What is most likely wrong?', opts: ['Too many frames per step', 'The DOWN position isn\'t low enough — insufficient weight absorption', 'The arms aren\'t swinging', 'The head isn\'t bobbing'], correct: 1, type: 'scenario', explanation: 'Weight in a walk comes primarily from the DOWN position. The deeper and more deliberate the absorption, the heavier the character feels.' },
      { q: 'At 20 frames per step, a character feels like...', opts: ['An energetic runner', 'A business professional', 'An elderly or very tired person', 'A cartoon character'], correct: 2, type: 'knowledge', explanation: 'Williams\' formula: 20fps = elderly or tired person, almost one step per second. Compare to 12fps = natural business walk.' },
      { q: 'The Passing position is higher than the midpoint between Downs. The reason is...', opts: ['To create a bouncy walk feel', 'The weight-bearing leg is straight, lifting the whole body', 'The arms swing up at this point', 'It\'s just convention with no physical reason'], correct: 1, type: 'knowledge', explanation: 'When the support leg is fully straight (Passing position), it lifts the pelvis, body, and head to above the midpoint. A physically correct insight from Williams.' },
      { q: 'Art Babbitt taught watching people walk from the BACK view first. Why?', opts: ['To avoid embarrassing the person', 'To observe the walk without being biased by the face', 'To see the feet more clearly', 'To measure stride length'], correct: 1, type: 'knowledge', explanation: 'By observing from the back — no face visible — you\'re forced to read the walk itself. Age, emotion, confidence, health all read through body language alone.' },
      { q: 'SCENARIO: A character is sad and defeated. How should the Passing position be adjusted?', opts: ['Very high — for energy', 'At exactly the midpoint — neutral', 'Very low — reflecting the heaviness and lack of energy', 'The same as a normal walk — only the face changes'], correct: 2, type: 'scenario', explanation: 'The passing position height IS the character. Low = heavy/defeated. High = energetic/light. The walk communicates the emotional state through mechanics.' },
      { q: 'In a normal walk, when the RIGHT leg leads at contact, where is the LEFT arm?', opts: ['Pulled back behind the body', 'At the same position as the right leg', 'Leading forward — opposite to the legs', 'Hanging straight down'], correct: 2, type: 'knowledge', explanation: 'Arms are ALWAYS opposite to legs. Right leg leads = left arm leads. This is for balance and forward thrust — it mimics how humans naturally counterbalance while walking.' },
    ],

    practice: `Walk observation exercise (the Babbitt method): Go to a window, YouTube, or memory. Observe someone walking. WITHOUT seeing their face, identify: Are they old or young? What is their energy level? Are they confident or insecure? Then verify by seeing their face. Now describe the walk cycle in terms of the 4 positions — what made the DOWN position heavy or light? Was the passing position high or low? How did the arm swing behave?`,
  },

  // ── Lesson: Anticipation & Follow Through ─────────────────────────────────
  '2d-m2': {
    variation: 'breakdown',
    content: `Anticipation and Follow Through are two sides of the same coin — they are what happens BEFORE and AFTER the main action. Together with the main action itself, they form a complete movement that has beginning, middle, and end.

ANTICIPATION — Thomas & Johnston:

When early Disney characters entered a scene and came to a sudden, complete stop, Walt was concerned. He said: "Things don't come to a stop all at once, guys; first there's one part and then another."

But the same principle applies to starting actions. Before a pitcher throws, they wind up. Before a dog runs, it crouches. Before a character jumps, they squat. This preparation — the ANTICIPATION — does two things:

1. It SIGNALS what's coming. The audience's eye knows where to look and what to expect. Without anticipation, the main action happens before the audience's brain has registered it.

2. It makes the main action MORE POWERFUL through CONTRAST. Going to the opposite extreme first makes the eventual direction feel faster and more forceful by comparison.

THE SIZE RULE:
The size of the anticipation must match the size of the main action. A tiny anticipation before a massive throw creates a disconnected, weak result. A huge anticipation before a small action is comic. Equal and opposite.

THE TEST:
Cover the anticipation drawing. Does the main action still read with the same impact? If the action suddenly feels weak or hard to read, the anticipation was doing real work. If nothing changes, it was unnecessary.

Walt's story (Thomas & Johnston): Dave Hand corrected and recorrected a Mickey animation six times. Each version was rejected. Finally, in frustration, he made it "so extreme that Walt would say 'I didn't mean THAT much!'" Walt loved it immediately. That's how you find exaggeration — by exceeding it. The right level is past where you're comfortable.

FOLLOW THROUGH — Thomas & Johnston's Five Categories:

1. APPENDAGES: Ears, tails, long coats, hair — continue moving after the main body stops. Each must be timed to its own weight. A long floppy ear takes many more frames to settle than a short stiff ear. A heavy coat takes longer than a light shirt.

2. BODY PARTS WORKING AGAINST EACH OTHER: The body doesn't stop all at once. Shoulders and hips stop first. Then the chest catches up. Then the head. Each part has its own momentum. As Thomas & Johnston write: "An arm or hand may continue its action even after the body is in its final pose."

3. FLESHY PARTS: Peg Leg Pete's belly famously continued to bounce and sag interminably. This communicates mass and softness. The more flesh, the more follow-through. This reveals character.

4. THE FOLLOW-THROUGH TELLS THE STORY: Thomas & Johnston: "The way in which an action is completed often tells us more about the person than the drawings of the movement itself. A golfer takes a mighty swing — what happens to him afterward is far more revealing." The follow-through is the "punch line." Early animators would just do the reach, the throw, the kick — and stop. The ending was never developed. The follow-through is where character lives.

5. THE MOVING HOLD: "Parts of all the other elements of Overlapping Action and Follow Through employed to achieve a new feeling of life and clarity." When a drawing must be held on screen for 8-16+ frames, it begins to look flat. Two drawings — one beyond the extreme — keep it dimensional. At least 8 frames in the hold, maybe 16.

OVERLAPPING ACTION:
Different body parts move at different rates. In a run, the torso leads the hips which lead the legs. In a turn, the eyes go first, then the head, then the shoulders, then the body. Not everything starts and stops simultaneously. This is what Williams means by "ones" — putting animation on every single frame to handle fast overlapping action.`,

    frameBreakdown: [
      { title: 'Setup — neutral hold', desc: 'Character at rest. Audience has no information about what\'s coming. This is the setup before the anticipation.', principle: 'Setup', visual: '😐', bg: '#F5F9FF' },
      { title: 'ANTICIPATION — opposite direction', desc: 'Character goes OPPOSITE to the coming action. Throwing right → pull hard left first. The bigger the coming action, the bigger this preparation must be.', principle: 'Anticipation: opposite extreme', visual: '💨⬅️', bg: '#EBF2FF' },
      { title: 'Main action — fast (few frames)', desc: 'The actual action is very fast — often only 2-4 frames. The anticipation prepared the audience\'s eye, so even at high speed, they track it perfectly.', principle: 'Main action: speed by contrast', visual: '⚡➡️', bg: '#FFF8ED' },
      { title: 'Follow through — appendages continue', desc: 'After the throw, the arm continues past the final pose. Hair, clothing, secondary elements all lag behind and continue moving in the original direction of force.', principle: 'Follow Through: lag and continue', visual: '🌊', bg: '#EBF2FF' },
      { title: 'Parts settling — different rates', desc: 'Different body parts settle at different speeds. Shoulder stops first, then elbow, then wrist, then fingers. Each part has its own weight and momentum.', principle: 'Overlapping action: staged settling', visual: '〰️', bg: '#F5F9FF' },
      { title: 'Moving Hold — final pose with life', desc: 'Character has settled into final pose. But to keep it alive: two drawings, one going slightly past the final extreme, drift in and settle. The pose is "alive" even without movement.', principle: 'Moving Hold', visual: '😤 → 😤 (subtle drift)', bg: '#EBF2FF' },
    ],

    quiz: [
      { q: 'Anticipation makes the main action more powerful through...', opts: ['Speed alone', 'Contrast — going to the opposite extreme first', 'More frames', 'Louder sound effects'], correct: 1, type: 'knowledge', explanation: 'Going to the opposite direction first creates contrast. The main action reverses this, and the reversal feels more forceful by comparison.' },
      { q: 'Thomas & Johnston\'s TEST for anticipation: cover the anticipation drawing. If the main action feels weaker, what does that tell you?', opts: ['The anticipation was unnecessary', 'The anticipation was doing real work and is needed', 'The drawing is wrong', 'The timing is off'], correct: 1, type: 'knowledge', explanation: 'If covering the anticipation weakens the main action, the anticipation was earning its place. If nothing changes, it was unnecessary.' },
      { q: 'The size of anticipation should always match...', opts: ['The character\'s physical size', 'The size of the main action — equal and opposite', 'Half the size of the main action', 'Whatever feels comfortable'], correct: 1, type: 'knowledge', explanation: 'Small anticipation before large action = disconnected and weak. Large anticipation before small action = comic. Equal and opposite is the rule.' },
      { q: 'Dave Hand\'s lesson about exaggeration teaches us to first...', opts: ['Be subtle and build carefully', 'Research reference footage thoroughly', 'Push SO far past the target that the director rejects it, then work back', 'Ask the director what level they want first'], correct: 2, type: 'knowledge', explanation: 'Thomas & Johnston: Dave pushed Mickey so extreme Walt said "I didn\'t mean THAT much!" — then loved that he found the right spirit. Exceed the target first to find the correct level.' },
      { q: 'SCENARIO: A character throws a baseball. After the throw, their arm continues swinging past the final position and their hair whips forward. This is...', opts: ['Anticipation', 'Follow Through — appendages and hair continuing past the stop', 'Secondary Action', 'Slow In/Slow Out'], correct: 1, type: 'scenario', explanation: 'Follow Through category 1: appendages (hair) and body parts continue after the main action stops. Each settles at its own rate based on weight.' },
      { q: 'The "punch line" of any animated action, according to Thomas & Johnston, is...', opts: ['The anticipation', 'The main action itself', 'The follow-through — what happens after the action completes', 'The setup pose'], correct: 2, type: 'knowledge', explanation: 'Thomas & Johnston: "The way in which an action is completed often tells us more about the person." The follow-through is where personality and the conclusion of the story live.' },
      { q: 'The Moving Hold requires making how many drawings to keep a held pose alive?', opts: ['One very strong drawing, held for many frames', 'Two drawings — one at the pose, one going slightly beyond', 'Three drawings minimum', 'As many as the scene is long'], correct: 1, type: 'knowledge', explanation: 'Thomas & Johnston: two drawings. One is the key pose; the second goes past it to a slightly stronger extreme. The character drifts and settles — giving the illusion of life in a still.' },
      { q: 'In Overlapping Action, which body part typically moves FIRST when a character turns their head?', opts: ['The shoulders', 'The chest', 'The eyes, then the head, then the shoulders, then the body', 'All parts simultaneously'], correct: 2, type: 'knowledge', explanation: 'The eyes go first — they find the target. Then the head follows, then shoulders, then body. This staged sequence is what makes turns feel natural rather than mechanical.' },
    ],

    practice: `Design a complete action sequence using ALL elements: A character reaches into a bag, pulls out something surprisingly heavy, and holds it at arm's length. Break it into: 1) Setup, 2) Anticipation (reaching in), 3) Main action (pulling out), 4) Follow-through (arm pulled down by weight, secondary elements lagging), 5) Settling. For each phase: which principles are active? Which body parts move first vs last?`,
  },
};
