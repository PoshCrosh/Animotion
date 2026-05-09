// lib/animationKnowledge.js
// ─────────────────────────────────────────────────────────────────────────────
// Deep animation knowledge distilled from:
//   • "The Illusion of Life: Disney Animation" — Frank Thomas & Ollie Johnston
//   • "The Animator's Survival Kit" — Richard Williams
//
// Used by:
//   1. AI Coach system prompt (Ani gets expert-level context)
//   2. Lesson content expansion in curriculum.js
//   3. Frame breakdown data for interactive lessons
//   4. Quiz question pools
// ─────────────────────────────────────────────────────────────────────────────

// ── CORE PRINCIPLE DEEP KNOWLEDGE ─────────────────────────────────────────────
export const PRINCIPLE_KNOWLEDGE = {

  timingAndSpacing: {
    summary: `Timing is WHERE the action happens — the rhythm, the beats, the "boinks". Spacing is HOW the drawings are distributed between those beats. Together they are the two fundamental elements of all animation.`,
    
    williams: `Richard Williams explains it with the bouncing ball: the "boinks" — where the ball hits the ground — that's the timing. The spacing is how close or far apart the individual position drawings are clustered. The ball overlaps itself at the slow part of the arc (clustered drawings) and is spaced far apart during the fast drop. As Williams writes: "Good animation spacing is a rare commodity."

The critical insight: timing alone is only half the battle. You can have a natural feel for timing, but spacing must be learned. A coin pushed across a surface can be filmed in stages — plot the timing first (where it hits beats), then experiment with spacing to find what feels right.

Williams' frame formula for walks:
• 4 frames = very fast run (6 steps/second)
• 8 frames = slow run or cartoon walk (3 steps/second)  
• 12 frames = brisk, business-like, "natural" walk (2 steps/second)
• 16 frames = strolling walk, more leisurely
• 20 frames = elderly or tired person
• 24 frames = slow step (one step per second)
• 32 frames = dragging walk

Milt Kahl at Disney's first week: bought a stopwatch, went downtown and timed people walking. They were invariably on 12 exposures. He made 12fps his reference point for everything.`,

    thomasJohnston: `The number of drawings used in any move determines how long that action takes on screen. If drawings are simple, clear, and expressive, the story point can be put over quickly. Timing in early animation was limited to fast and slow moves. But personalities were defined more by the varying speed of movements than their appearance — whether a character was lethargic, excited, nervous, relaxed. Neither acting nor attitude could be portrayed without very close attention to timing.

Just two drawings of a head — one leaning right, one over to the left with chin raised — can communicate a multitude of ideas depending entirely on the timing used. Each inbetween drawing added between those extremes gives a new meaning to the action.`,

    frameBreakdown: [
      { title: 'Slow spacing — peak of arc', desc: 'Drawings clustered together at the top of the arc. The ball appears to hang momentarily before falling.', principle: 'Spacing', visual: '⚪⚪⚪', bg: '#EBF2FF' },
      { title: 'Fast spacing — mid fall', desc: 'Drawings spread far apart as the ball accelerates downward. Wide gaps = fast movement.', principle: 'Spacing', visual: '⚪    ⚪    ⚪', bg: '#F5F9FF' },
      { title: 'Contact (timing beat)', desc: 'The "boink" — where the ball hits ground. This is the timing: the beat, the accent, the rhythm.', principle: 'Timing', visual: '⚡', bg: '#FFF8ED' },
      { title: 'Even spacing — robotic', desc: 'Equal gaps between every drawing. Nothing accelerates or decelerates. Looks mechanical.', principle: 'Spacing (wrong)', visual: '⚪ ⚪ ⚪ ⚪ ⚪', bg: '#FFF0F0' },
    ],

    practicePrompt: `Richard Williams' exercise: Take a coin and film it in stages under a camera. First plot the timing (where it hits the ground). Then push the coin around frame by frame and experiment with spacing. You're already animating — dealing with the fundamental elements — without making a single drawing.`,
  },

  squashAndStretch: {
    summary: `The illusion of flexibility and weight. The most fundamental principle — it brings inanimate objects to life by suggesting they have mass, elasticity, and physical reality.`,

    thomasJohnston: `Squash and stretch is what makes things feel alive versus mechanical. When a rubber ball hits the ground it squashes (flattens and widens). As it bounces up it stretches (elongates in the direction of travel). The critical rule: VOLUME must stay constant. If you squash something wider, it cannot also get taller — the mass is the same, only the shape changes. This is like clay — you can reshape it but the amount never changes.

Even rigid objects can suggest squash and stretch subtly to imply weight. The principle communicates mass and flexibility simultaneously. It works even on objects that realistically wouldn't deform — a slight stretch on a jumping character's body during fast movement, a slight squash on landing.

The "Moving Hold" technique: make two drawings, one more extreme than the other, yet both containing all elements of the pose. The character goes beyond the pose and then returns. As Frank Thomas wrote: "You hit the pose, then drift on beyond to an even stronger pose — everything goes further, the cheeks go up, the ears fly out, the hands rise; but essentially he's still in his pose." This gives squash and stretch to held poses.`,

    williams: `A rigid coin sliding across a surface can achieve convincing animation through spacing alone — the squash/stretch technique, while useful, is not always necessary. As Williams writes: if you do the "squishy squashy thing" too much, everything comes out 'sploopy', like it's made of rubber. Real life isn't usually like that. The spacing must be right first. Squash/stretch without correct spacing is just rubber-looking.`,

    frameBreakdown: [
      { title: 'Normal — at rest', desc: 'Ball is perfectly round. No force acting on it. Volume is at baseline.', principle: 'Volume preservation', visual: '⚽', bg: '#F5F9FF' },
      { title: 'Stretch — falling fast', desc: 'Ball elongates in direction of travel. Feels like it has velocity and mass.', principle: 'Squash & Stretch', visual: '🏈', bg: '#EBF2FF' },
      { title: 'Squash — impact', desc: 'Ball flattens and widens on ground contact. More squash = softer ball. Width compensates for lost height.', principle: 'Squash & Stretch', visual: '🥞', bg: '#FFF8ED' },
      { title: 'Stretch — bouncing up', desc: 'Elongated again as it leaves ground. Now stretched upward. Energy is escaping.', principle: 'Squash & Stretch', visual: '🏈', bg: '#EBF2FF' },
      { title: 'Normal — at peak', desc: 'Returns to round at the top of the arc. Almost no velocity. Volume preserved throughout.', principle: 'Volume preservation', visual: '⚽', bg: '#F5F9FF' },
    ],
  },

  anticipation: {
    summary: `Preparation before a main action. It signals what is about to happen AND makes the main action more powerful through contrast. Without anticipation, audiences miss the action entirely.`,

    thomasJohnston: `Anticipation was discovered when a character entering a scene often came to a sudden and complete stop. Walt Disney said: "Things don't come to a stop all at once, guys; first there's one part and then another." 

The size of the anticipation should match the size of the main action. A tiny anticipation before a large action creates a disconnected, weak result. A large anticipation before a small action is comic. The rule: the bigger the action, the bigger the winding-up movement before it.

Anticipation also works psychologically — it prepares the audience's eye. A character looking at something before picking it up tells the audience where to look. A golfer taking a mighty swing that covers only a few frames: what happens afterward (the follow-through, the look of anguish or triumph) is often more entertaining than the swing itself.`,

    williams: `Anticipation works because it creates contrast. The opposite extreme of the coming action means the movement will feel more powerful. Without anticipation, the audience literally misses the action — the eye can't process what it wasn't prepared for.

The practical test: cover up the anticipation drawing. Does the main action still read? If yes, the anticipation wasn't needed. If the action suddenly feels weak or missed, the anticipation was doing real work.`,

    pauseQuestions: [
      { question: 'A character is about to throw a ball. They pull their arm WAY back. This preparation is called...', opts: ['Follow Through', 'Anticipation', 'Secondary Action', 'Staging'], correct: 1, atSecond: 8 },
      { question: 'The size of the anticipation should match...', opts: ['The character\'s size', 'The scene\'s mood', 'The size of the main action', 'The frame count'], correct: 2, atSecond: 25 },
    ],
  },

  followThrough: {
    summary: `After the main body stops, parts continue moving before settling. The body doesn't stop all at once — it stops in stages, with different parts lagging behind others.`,

    thomasJohnston: `Thomas and Johnston identified five categories of Follow Through and Overlapping Action:

1. APPENDAGES (ears, tail, coat): Parts attached to the main body continue to move after the body stops. Each must be timed carefully to communicate the correct weight. A dog's ear vs. a weighted earring follow through very differently — because they have different weight.

2. BODY PARTS WORKING AGAINST EACH OTHER: The body stretches, catches up, twists, turns, and contracts as forms work against each other. As one part arrives at the stopping point, others may still be in movement; an arm may continue its action even after the body is in its final pose.

3. TEXTURE AND FLESHY PARTS: Soft, loose parts (Peg Leg Pete's belly) continue to bounce and sag. This reveals character — a confident walk has minimal belly jiggle; a heavy exhausted character has exaggerated settling.

4. THE FOLLOW-THROUGH TELLS THE STORY: The way an action is completed tells us more about the person than the movement itself. A golfer takes a mighty swing — what happens to him afterward is far more revealing. The anticipation sets up the action we expect; the action whizzes past; the follow-through is the "punch line" of the gag.

5. THE MOVING HOLD: When a drawing is held on screen for 8-16 frames, the flow of action was broken and the drawing began to look flat. The solution: make two drawings, one going beyond the extreme pose, to keep the character feeling alive and dimensional even while holding a pose.`,

    williams: `Overlapping action means different body parts don't start and stop simultaneously. In a run or walk, the arms, head, torso, and legs are all on different timing offsets. The shoulders oppose the hips. The head leads slightly into a turn. When everything moves at once and stops at once, the result looks mechanical and robotic.

The "drag" principle: heavier or floppier parts lag behind the main movement and settle after it. In a run, the head goes last in a turn. In a stop, the hair continues for several frames after the body halts.`,
  },

  weight: {
    summary: `Weight is the single quality that separates beginner animation from professional work. Everything else being equal, an animation that communicates weight correctly will feel real; one that doesn't will feel hollow.`,

    thomasJohnston: `Weight comes from understanding physics — how the body responds to gravity, momentum, and the effort required to overcome them. Study how your own body responds differently when picking up a 1kg object vs. a 30kg object. ALL of that difference is animation data.

Key weight indicators:
• Timing: heavy things accelerate slowly and stop slowly. A bowling ball rolling to a stop takes many more frames than a tennis ball.
• Squash on impact: heavy objects deform more when they hit something, and the surface they hit also reacts.
• Anticipation: lifting a heavy object requires more preparation. Watch someone about to lift a heavy box vs. a feather — the body setup is completely different.
• Follow-through: weight creates secondary motion. Parts lag and settle proportional to their mass.
• Reaction: surfaces and objects react to weight. A wooden floor under a heavy character should show subtle vibration.`,

    williams: `The bouncing ball communicates weight purely through spacing. A heavy ball (bowling ball) takes more frames — it accelerates slowly and decelerates slowly. A light ball (ping pong) takes fewer frames — faster acceleration, quicker stop. Same spacing pattern, just compressed or expanded.

Walk weight formula:
• The DOWN position (where the bent leg takes the weight) shows how much the body absorbs the impact. A heavy character's DOWN goes deeper.
• The PASSING POSITION being higher than the DOWN shows the body recovering from impact. The amount of difference communicates weight.
• The UP position (slight elevation) shows momentum carrying the body. Heavy characters have a smaller UP-DOWN difference — they don't bounce as much.`,
  },

  arcs: {
    summary: `Natural movement follows arcs. Very few living organisms are capable of mechanical in-and-out, up-and-down precision. Most movements follow slightly circular paths because of the way joints work.`,

    thomasJohnston: `The action of a woodpecker might be an exception. The restrictions of an external skeleton create some straight-line insect movements. But the movements of most living creatures will follow a slightly circular path. The head seldom thrusts straight out then back again; it lifts slightly, or drops as it returns.

A hand gesture with a pointing finger follows a circular path. The animator charts positions along this arc when making key drawings, indicating where inbetweens should be placed to keep the line of action on the arc. Inbetweens done without following this arc change the action radically — they create a strange angular path that reads as robotic or inhuman.`,

    williams: `Watch your arcs. Most actions are in a wavelike arc or a figure-8 pattern. Short distances may go straight, but long distances go in an arc. The path of action is either in a wave or a figure-8.

The most common beginner mistake: inbetweening straight across between two positions instead of following the arc. The foot, the hand, the head — they all follow curved paths through space, not straight lines. The inbetween should be LOWER (or higher, or to the side) than the straight line between two extremes — it should be on the arc.`,
  },

  stagingAndSilhouette: {
    summary: `Present each idea so it is unmistakably clear. Work in silhouette. Walt Disney's rule: if you can't read the action as a pure black shape, the staging has failed.`,

    thomasJohnston: `Walt was direct: "Work in silhouette so that everything can be seen clearly. Don't have a hand come over a face so that you can't see what's happening. Put it away from the face and make it clear."

Charlie Chaplin maintained that if an actor knew his emotion thoroughly, he could show it in silhouette. This became Disney's litmus test for every key pose. Mickey's body was black, his arms and hands all black — there was no way to stage an action except in silhouette. This limitation was more helpful than realized: it forced every pose to be readable as a pure shape.

The close-up is animation's most powerful tool for directing attention. When showing a character's expression, you do not do it in a long shot where the figure is lost in the background. Make sure the camera is the right distance from the character to show what it is doing.`,
  },

  actingAndEmotion: {
    summary: `Animation acting is about truth. The audience must believe in the character's inner life — not just the outer movement. The animator is an actor who acts with drawings.`,

    thomasJohnston: `The most important advice from Marc Davis: "Disney animation is just very different. Nobody, I don't care who he is, can come from outside and draw a Disney character without a full understanding of what it's all about."

Good acting comes from:
• CLARITY: Every emotion must be readable. Apply the silhouette test.
• SPECIFICITY: This character's specific reaction to this specific situation — not a generic "happy" or "sad" expression.  
• EXAGGERATION: Push the emotion further than feels comfortable. Walt would say to animators: "Will you do something for me? Will you make it so extreme that you make me mad?" Dave Hand said the only way to find the right level was to push so far beyond that Walt would say "I didn't mean THAT much!" — and then work back from there.
• THE EYES: Eyes carry the soul of a character. Blinks communicate thought. The direction of the gaze communicates attention and intention. Two drawings of a head can communicate completely different things depending on where the eyes are focused.
• RESTRAINT: Sometimes stillness is more powerful than movement. The "Moving Hold" — subtle life in a held pose — can be more emotionally powerful than continuous motion. Sometimes the most effective acting is what a character does NOT do.
• SECONDARY ACTION: When a character is sad and wipes a tear, the hand must support, not compete with, the expression. The secondary action is always subordinate to the primary action.`,
  },

  straightAheadVsPoseToPose: {
    summary: `Two methods of animation with different strengths. Most professional work combines both.`,

    thomasJohnston: `STRAIGHT AHEAD: The animator literally works from the first drawing to the last, one drawing after another, getting new ideas as they go. The drawings and action have a fresh, slightly zany look — spontaneous and creative. But it can get out of hand, losing track of size, volume, and spatial relationships.

POSE TO POSE: The animator plans the action, figures out which drawings are needed, makes the key poses, and has an assistant draw the inbetweens. Always easy to follow, works well because relationships were carefully considered before getting too far into the drawings. More time spent improving key poses.

The choice of method matters. Pose to Pose works for clear, planned emotional acting where each pose must communicate distinctly. Straight Ahead is better for wild, scrambling action where spontaneity matters more than control. Most professional work is Pose to Pose for structure, with Straight Ahead sensibility for texture and surprise.`,
  },
};

// ── WALK CYCLE DEEP KNOWLEDGE ──────────────────────────────────────────────────
export const WALK_KNOWLEDGE = {
  coreInsight: `Richard Williams: "Why is it that we recognize our Uncle Charlie even though we haven't seen him for ten years — walking — back view — out of focus — far away? Because everyone's walk is as individual and distinctive as their face. And one tiny detail will alter everything. There is a massive amount of information in a walk and we read it instantly."`,

  keyPositions: {
    contact: `The heel of the leading foot touches the ground. This is an EXTREME — one of the two key drawings. The arms are at their widest opposition to the legs. In a normal walk, when the right leg leads, the left arm leads.`,
    down: `The body is at its LOWEST point, absorbing the impact of the weight transferring to the front foot. The knee bends to cushion. The arm swing is at its WIDEST on the DOWN position (not the contact, as you might expect). This is the WEIGHT beat.`,
    passing: `The free leg passes the weight-bearing leg. The body is slightly HIGHER than the midpoint because the weight-bearing leg is straight. This is the BREAKDOWN drawing — the middle position that determines the character of the movement. It goes slightly HIGHER than the mid-point between down positions.`,
    up: `The body is at its HIGHEST point as the body rides up over the straight weight-bearing leg and the free leg swings forward. The body's momentum carries it upward.`,
  },

  formula: `Williams' walk recipe:
1. Make the 2 CONTACT positions first (the extremes)
2. Add the PASSING POSITION (the breakdown — slightly higher than mid-point)
3. Add the DOWN position (lower than contact, the weight absorption)
4. The arm swing is OPPOSITE to the legs — always — for balance and thrust
5. The head bobs COUNTER to the hip movement`,

  characterization: `Art Babbitt's method: observe a person walking from the back view. Ask yourself — are they old? Young? What's their financial position? State of health? Strict? Permissive? Depressed? Hopeful? Sad? Happy? Drunk? Then run around and check from the front. The walk communicates all of this character information before a single word is spoken or a face is seen.`,

  frameTiming: `Williams' tempo chart (per step):
• 4 frames = very fast run (6 steps/second)
• 6 frames = run or very fast walk (4 steps/second)
• 8 frames = slow run or "cartoon walk" (3 steps/second)
• 12 frames = brisk business-like "natural" walk (2 steps/second) ← THE STANDARD
• 16 frames = strolling walk (¾ step/second)
• 20 frames = elderly or tired person (almost 1 step/second)
• 24 frames = very slow step (1 step/second)
• 32 frames = "show me the way to go home"`,
};

// ── AI COACH ENHANCED SYSTEM PROMPT ───────────────────────────────────────────
export const ENHANCED_AI_CONTEXT = `
DEEP ANIMATION KNOWLEDGE (from The Illusion of Life & The Animator's Survival Kit):

TIMING & SPACING (Williams):
- Timing = WHERE actions happen (the beats, boinks, accents)
- Spacing = HOW drawings are distributed between those beats
- These are the two fundamental elements of ALL animation
- Walk tempo reference: 12fps = natural walk, 8fps = cartoon walk, 4fps = very fast run
- Milt Kahl: timed people walking on his first Disney week — invariably 12 exposures
- "Good animation spacing is a rare commodity" — Williams

SQUASH & STRETCH (Thomas & Johnston):
- Volume MUST stay constant — if wider, cannot be taller
- Works on rigid objects too (subtle, implied)
- The "Moving Hold": make two drawings, one going beyond the extreme, to keep held poses alive
- Over-use creates "sploopy" rubber look — use judiciously

ANTICIPATION (Thomas & Johnston):
- Size of anticipation must match size of main action
- Without it, the audience literally misses the action
- Test: cover the anticipation drawing — if action weakens, it was doing real work

FOLLOW THROUGH (Thomas & Johnston — 5 categories):
1. Appendages (ears, tails, coats) continue after body stops
2. Body parts work against each other, settling in stages
3. Fleshy/soft parts (belly, cheeks) continue bouncing
4. The follow-through TELLS THE STORY — it's the "punch line"
5. Moving Hold — subtle life in held poses prevents flatness

WEIGHT (Williams + Thomas & Johnston):
- Heavy = slow acceleration, slow deceleration, deeper DOWN position in walk
- Walk DOWN position shows weight absorption — heavier = deeper bend
- Timing is the #1 communicator of weight
- Surface reaction: floors, objects react to heavy impacts

ARCS (both books):
- Most living movement follows arcs — not straight lines
- Inbetweens done straight across break the arc and look robotic
- Short distances may be straight; long distances always arc
- Foot, hand, head all follow curved paths through space

STAGING/SILHOUETTE (Thomas & Johnston):
- Walt's rule: "Work in silhouette so everything can be seen clearly"
- If it doesn't read as a black shape, the staging has failed
- One action at a time — don't confuse the audience

ACTING (Thomas & Johnston):
- Clarity: silhouette test every key pose
- Specificity: this character's reaction, not a generic one
- Exaggeration: push until Walt says "I didn't mean THAT much!"
- Eyes carry the soul — blinks communicate thought
- Secondary action ALWAYS subordinate to primary action
- Restraint: stillness can be more powerful than movement

WALKS (Williams):
- Every person's walk is as individual as their face
- 4 key positions: Contact → Down → Passing → Up
- Arms ALWAYS opposite to legs
- Passing position is HIGHER than the mid-point between downs
- Tempo: 12fps per step = natural walk reference
`;

// ── FRAME BREAKDOWN DATA FOR LESSONS ──────────────────────────────────────────
// These are added to specific lessons in curriculum.js as lesson.frameBreakdown
export const FRAME_BREAKDOWNS = {
  bouncingBall: [
    { title: 'Frame 1 — Release point', desc: 'Ball at full height. Round shape. Drawings clustered tightly here — ball appears to hang momentarily. This is the slow-in.', principle: 'Timing: Slow-in at peak', visual: '⚽', bg: '#EBF2FF' },
    { title: 'Frame 2 — Accelerating down', desc: 'Drawings begin to spread apart as gravity accelerates the ball. The spacing increases with each frame. Ball begins slight stretch downward.', principle: 'Spacing: Increasing gaps', visual: '🏈', bg: '#F5F9FF' },
    { title: 'Frame 3 — Mid-fall (fast)', desc: 'Maximum spacing — drawings furthest apart here. Ball traveling at peak velocity. Strongest stretch in direction of travel.', principle: 'Spacing: Maximum gap = maximum speed', visual: '🏈', bg: '#EBF2FF' },
    { title: 'Frame 4 — Impact squash', desc: 'Contact with ground. Ball squashes — flattens and widens. Volume stays the same. More squash = softer ball. This is the timing "beat" — the boink.', principle: 'Squash & Timing beat', visual: '🥞', bg: '#FFF8ED' },
    { title: 'Frame 5 — Rising stretch', desc: 'Ball leaves ground. Elongated upward in direction of travel. Energy released from the squash launches it. Drawings beginning to cluster again.', principle: 'Stretch + Slow-out', visual: '🏈', bg: '#EBF2FF' },
    { title: 'Frame 6 — Deceleration', desc: 'Drawings cluster more tightly as ball decelerates against gravity. Slow-out. Ball returning toward round shape.', principle: 'Timing: Slow-out = deceleration', visual: '⚽', bg: '#F5F9FF' },
  ],

  walkCycle: [
    { title: 'Contact position', desc: 'Heel of leading foot touches ground. This is EXTREME #1. Arms at widest — opposite to legs. Left arm leads when right leg leads.', principle: 'Extremes', visual: '🚶', bg: '#EBF2FF' },
    { title: 'Down position', desc: 'Body at LOWEST point, absorbing weight transfer. Knee bends. Arm swing reaches WIDEST here (not at contact). The weight beat.', principle: 'Weight & Timing', visual: '⬇️', bg: '#FFF8ED' },
    { title: 'Passing position (breakdown)', desc: 'Free leg passes weight-bearing leg. Body HIGHER than mid-point because weight leg is straight. This breakdown drawing determines the character of the walk.', principle: 'Breakdown: Higher than midpoint', visual: '🚶', bg: '#EBF2FF' },
    { title: 'Up position', desc: 'Body at HIGHEST point. Rides over straight weight leg. Momentum carries it upward. Sets up for next contact.', principle: 'Rhythm & Momentum', visual: '⬆️', bg: '#F5F9FF' },
    { title: 'Contact position 2', desc: 'EXTREME #2. Opposite foot now leads. Pattern repeats. One complete step = 8 frames at 12fps natural walk pace.', principle: 'Cycle: repeat', visual: '🚶', bg: '#EBF2FF' },
  ],

  anticipation: [
    { title: 'Hold — neutral pose', desc: 'Character is at rest. Audience has no information about what will happen next.', principle: 'Setup', visual: '😐', bg: '#F5F9FF' },
    { title: 'Anticipation wind-up', desc: 'Character goes OPPOSITE to the coming action. Throwing right? Pull arm hard left and back. Jumping up? Crouch down first. The bigger the coming action, the bigger this preparation.', principle: 'Anticipation', visual: '💨', bg: '#EBF2FF' },
    { title: 'Main action (fast)', desc: 'Very few frames. The actual action is fast — often only 2-4 frames. The audience was prepared by the anticipation so they can process it even at high speed.', principle: 'Main action: contrast with anticipation', visual: '⚡', bg: '#FFF8ED' },
    { title: 'Follow-through settle', desc: 'After the main action, parts continue moving. Hair, clothing, appendages lag behind. The body settles, parts catching up in sequence.', principle: 'Follow Through', visual: '🌊', bg: '#EBF2FF' },
    { title: 'Final hold', desc: 'Character settles into final pose. The Moving Hold: make two drawings — one slightly beyond the final pose — so the held pose still has subtle life.', principle: 'Moving Hold', visual: '😌', bg: '#F5F9FF' },
  ],
};

// ── EXPANDED QUIZ QUESTION POOLS ───────────────────────────────────────────────
// These replace/expand the basic questions in curriculum.js lessons
export const EXPANDED_QUIZZES = {

  timingAndSpacing: [
    { q: 'Richard Williams describes timing as the "boinks" of a bouncing ball. What does this mean?', opts: ['The sound the ball makes', 'Where the ball hits the ground — the beats and accents of the action', 'How high the ball bounces', 'The shape of the ball\'s arc'], correct: 1, type: 'knowledge', explanation: 'Timing is WHERE actions happen — the rhythm, the beats. Spacing is HOW the drawings are distributed.' },
    { q: 'A ball is at the top of its arc. How should the drawings be spaced here?', opts: ['Far apart — it\'s traveling fast', 'Evenly spaced throughout', 'Clustered closely together — it\'s decelerating and almost stopped', 'Only one drawing needed'], correct: 2, type: 'scenario', context: 'Think about what the ball is physically doing at the peak of its arc.', explanation: 'At the peak, the ball has almost zero velocity. Closely clustered drawings create the "hanging" effect — slow-in/slow-out.' },
    { q: 'What frame count did Milt Kahl find to be the "natural walk" timing by observing real people?', opts: ['8 frames per step', '10 frames per step', '12 frames per step', '16 frames per step'], correct: 2, type: 'knowledge', explanation: 'Milt Kahl timed hundreds of people walking downtown. They were invariably on 12 exposures — making 12fps his reference standard.' },
    { q: 'According to Williams, you can have a natural feel for timing — but what must be learned?', opts: ['Drawing ability', 'The spacing of things', 'Color theory', 'Character design'], correct: 1, type: 'knowledge', explanation: '"We can have a natural feel for timing, but we have to learn the spacing of things." Good spacing is the harder, rarer skill.' },
    { q: 'A character walks at 20 frames per step. What does this communicate about them?', opts: ['They are athletic and energetic', 'They are elderly, tired, or very heavy', 'They are sneaking', 'They are running late'], correct: 1, type: 'scenario', explanation: 'Williams\' formula: 20fps per step = elderly or tired person, almost one step per second.' },
    { q: 'Even spacing (equal gaps between all drawings) creates what type of motion?', opts: ['Natural, organic motion', 'Heavy, weighted motion', 'Mechanical, robotic motion', 'Fast, energetic motion'], correct: 2, type: 'knowledge', explanation: 'Even spacing means constant velocity — nothing accelerates or decelerates. Nature never moves this way. It reads as mechanical.' },
    { q: 'SCENARIO: You\'re animating a feather falling. Compared to a rock falling the same distance, the feather should have...', opts: ['More frames and closely clustered spacing throughout', 'Fewer frames and widely spaced drawings', 'The same timing as the rock', 'No spacing variation at all'], correct: 0, type: 'scenario', context: 'Think about how a feather moves vs a rock.', explanation: 'A feather is light and drifts slowly — more frames, with gentle spacing changes. The air resistance means it never reaches the speed a rock would.' },
    { q: 'Thomas & Johnston wrote that just two drawings of a head can communicate many different things depending on...', opts: ['The style of drawing', 'The timing used between them', 'The background color', 'The character\'s costume'], correct: 1, type: 'knowledge', explanation: 'The timing — how many inbetween drawings are placed between two extremes — completely changes the meaning and emotion of the action.' },
  ],

  squashAndStretch: [
    { q: 'The most important rule of squash and stretch is that volume must remain...', opts: ['The same shape', 'Constant — it cannot increase or decrease', 'Small', 'Perfectly round'], correct: 1, type: 'knowledge', explanation: 'Like clay: you can reshape it but the amount never changes. If you squash wide, you cannot also be taller.' },
    { q: 'Williams warns that too much squash and stretch makes everything look...', opts: ['Heavier', '"Sploopy" — like it\'s made of rubber', 'More realistic', 'Faster'], correct: 1, type: 'knowledge', explanation: 'Over-use of squash/stretch without correct spacing underneath makes everything look like rubber. Real life is usually more rigid.' },
    { q: 'A character lands from a jump. A LOT of squash on impact tells the audience the character is...', opts: ['Very fast', 'Very heavy or the floor is very soft', 'Angry', 'Surprised'], correct: 1, type: 'scenario', explanation: 'The degree of squash communicates mass and impact force. Heavy characters and soft surfaces produce more deformation.' },
    { q: 'The "Moving Hold" technique involves making how many drawings to keep a held pose alive?', opts: ['One very detailed drawing', 'Two drawings — one going beyond the extreme pose', 'Three drawings minimum', 'As many as needed for the duration'], correct: 1, type: 'knowledge', explanation: 'Thomas & Johnston: make two drawings, one more extreme, so the character drifts beyond the pose and returns — giving subtle life to what would otherwise be a flat hold.' },
    { q: 'SCENARIO: You\'re animating a rubber ball and a bowling ball dropping the same height. Which has more squash on impact?', opts: ['Bowling ball — heavier impact', 'Rubber ball — it\'s more flexible', 'Both exactly the same', 'Neither — rigid surfaces don\'t squash'], correct: 1, type: 'scenario', context: 'Think about material properties, not just weight.', explanation: 'The rubber ball deforms more because of its material flexibility. The bowling ball is rigid. Squash communicates MATERIAL as well as weight.' },
    { q: 'Where does the stretch appear most on a falling ball?', opts: ['At the peak of the arc', 'Just before and just after ground contact', 'At the very bottom of the fall', 'Throughout the entire fall equally'], correct: 1, type: 'visual', explanation: 'The stretch appears during fast travel — just before impact and just after leaving the ground. At the peak and during slow movement, the ball returns to its round shape.' },
  ],

  walkCycles: [
    { q: 'In Williams\' walk method, which position is described as "slightly higher than the mid-point"?', opts: ['The Contact position', 'The Down position', 'The Passing position (breakdown)', 'The Up position'], correct: 2, type: 'knowledge', explanation: 'The Passing position is higher than mid-point because the weight-bearing leg is fully straight — this lifts the pelvis, body, and head.' },
    { q: 'Art Babbitt taught Williams to observe people walking from...', opts: ['The front view, watching the face', 'The back view, asking questions about their personality', 'A bird\'s eye view to see stride length', 'A close-up of the feet only'], correct: 1, type: 'knowledge', explanation: 'Babbitt\'s insight: follow people from the back and ask yourself — old/young? financial position? depressed/hopeful? The walk answers ALL of these.' },
    { q: 'In a standard walk, when the RIGHT leg leads at contact, where is the LEFT arm?', opts: ['Pulled back', 'At the same position as the right leg', 'Leading forward — opposite to the legs', 'Hanging at the side'], correct: 2, type: 'knowledge', explanation: 'Arms are ALWAYS opposite to legs in a normal walk — for balance and forward thrust. Right leg leads = left arm leads.' },
    { q: 'SCENARIO: Your walk cycle looks too "floaty" — the character seems to have no weight. What is the most likely problem?', opts: ['Too many frames per cycle', 'The DOWN position isn\'t low enough — not enough weight absorption', 'The arms are swinging too much', 'The head is bobbing too much'], correct: 1, type: 'scenario', explanation: 'Weight in a walk comes primarily from the DOWN position — how much the body absorbs and sinks on impact. Insufficient DOWN = floaty, weightless movement.' },
    { q: 'A character walks at 32 frames per step. This would suggest...', opts: ['A fast run', 'A normal business walk', 'An extremely slow, dragging walk', 'A cartoon character walk'], correct: 2, type: 'scenario', explanation: 'Williams\' formula: 32fps per step — "show me the way to go home." The absolute slowest walking timing in the formula.' },
    { q: 'The arm swing reaches its WIDEST point on which walk position?', opts: ['The Contact position', 'The Down position', 'The Passing position', 'The Up position'], correct: 1, type: 'knowledge', explanation: 'The arm swing is widest at the DOWN position, not the Contact position as you might expect. This is one of Williams\' key insights about natural walk mechanics.' },
  ],

  actingAndEmotion: [
    { q: 'Thomas & Johnston describe the "silhouette test" as Walt Disney\'s rule. What does it check?', opts: ['Whether the character looks good in black and white', 'Whether the action reads clearly as a pure black shape', 'Whether the character has been traced correctly', 'Whether the lighting is right'], correct: 1, type: 'knowledge', explanation: 'Walt: "Work in silhouette so everything can be seen clearly." If it doesn\'t read as a black shape, the staging and posing have failed.' },
    { q: 'Dave Hand\'s story about exaggeration teaches us that to find the right level, you should first...', opts: ['Be subtle and build up gradually', 'Ask the director for notes', 'Push so far beyond that the director says "I didn\'t mean THAT much!"', 'Study reference footage carefully'], correct: 2, type: 'knowledge', explanation: 'Thomas & Johnston recount: Dave pushed the action so extreme Walt would reject it — then worked back from there. The right level is found by exceeding it first.' },
    { q: 'In animation acting, secondary action should always be...', opts: ['More interesting than the primary action', 'Subordinate to the primary action', 'The same timing as the primary action', 'Avoided whenever possible'], correct: 1, type: 'knowledge', explanation: 'Thomas & Johnston: if the secondary action conflicts with or becomes more interesting than the primary action, it is either the wrong choice or staged improperly.' },
    { q: 'SCENARIO: A character hears devastating news. They go completely still. Is this good animation?', opts: ['No — nothing moving means no animation is happening', 'No — the audience will be bored', 'Yes — stillness after movement can be the most powerful moment', 'Only if the scene is short'], correct: 2, type: 'scenario', context: 'Thomas & Johnston discuss restraint in animation acting.', explanation: 'Thomas & Johnston: "Sometimes stillness is more powerful than movement." A character going still after big news — especially with the Moving Hold subtlety — is strong acting.' },
    { q: 'What part of the face do Thomas & Johnston say "carries the soul of a character"?', opts: ['The mouth — it forms the expression', 'The eyebrows — they show emotion', 'The eyes — blinks communicate thought, gaze communicates attention', 'The cheeks — they react to all expressions'], correct: 2, type: 'knowledge', explanation: 'Thomas & Johnston: eyes carry the soul. Blinks communicate thought. The direction of the gaze communicates attention, intention, and inner life.' },
  ],
};
