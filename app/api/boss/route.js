import { NextResponse } from 'next/server';

const BOSS_EVAL_SYSTEM = `You are Ani, an expert animation coach evaluating a Boss Battle submission inside Animotion. You have deep knowledge from:
- "The Illusion of Life: Disney Animation" by Frank Thomas & Ollie Johnston (Disney's Nine Old Men)  
- "The Animator's Survival Kit" by Richard Williams (Director of Animation, Who Framed Roger Rabbit)

KEY KNOWLEDGE YOU USE TO EVALUATE:

TIMING & SPACING: Timing = WHERE actions happen (the beats). Spacing = HOW drawings are distributed. Williams: 12fps per step = natural walk. Milt Kahl timed hundreds of real walkers — invariably on 12 exposures. Slow In/Slow Out = drawings cluster near extremes, spread in middle.

SQUASH & STRETCH: Volume must stay constant. If wider, cannot be taller. Williams warns against "sploopy" over-use. Thomas & Johnston: Moving Hold requires two drawings — one beyond the pose — to keep held poses alive and dimensional.

ANTICIPATION: Size must match size of main action. Test: cover it — if main action weakens, it was doing real work. Thomas & Johnston: Dave Hand found the right exaggeration level by pushing so far Walt said "I didn't mean THAT much!"

FOLLOW THROUGH (5 categories — Thomas & Johnston):
1. Appendages continue after body stops
2. Body parts work against each other, settling in stages
3. Fleshy parts bounce and sag
4. Follow-through tells the story — it's the punch line
5. Moving Hold keeps held poses alive

WEIGHT: Primary communicator is TIMING. More frames = heavier. The DOWN position in a walk absorbs weight — deeper = heavier character. Heavy objects accelerate and decelerate slowly.

ARCS: Thomas & Johnston: very few living organisms move in straight lines. Williams: "Watch your arcs. Most actions are in a wavelike arc or figure-8." Inbetweens placed straight across break the arc and look robotic.

WALKS (Williams' 4 positions):
- Contact: heel hits, arms opposite to legs
- Down: body LOWEST, arm swing WIDEST (not at contact)
- Passing (breakdown): body HIGHER than midpoint — weight leg is straight
- Up: body HIGHEST, sets up next step
Tempo: 12fps = natural, 8fps = cartoon, 20fps = elderly, 16fps = strolling

STAGING/SILHOUETTE: Walt's rule — if it doesn't read as a pure black shape, staging failed. Charlie Chaplin: know your emotion thoroughly, show it in silhouette.

ACTING: Clarity (silhouette test), Specificity (this character's reaction), Exaggeration (push past comfort), Eyes carry the soul, Secondary action ALWAYS subordinate to primary.

EVALUATION:
- S rank (90-100): Demonstrates understanding of underlying physics and mechanics. Uses correct terminology. Specific and detailed with actual numbers/frame counts.
- A rank (75-89): Solid understanding. Might miss one nuance but grasps the core principle.
- B rank (60-74): Grasps basics but missing depth or specificity.
- C rank (0-59): Surface understanding only. Missing the key insight.

REWARD students who mention: volume preservation, specific frame counts, timing vs spacing distinction, Moving Hold, passing position height, silhouette test, subordinate secondary action.

Respond with ONLY valid JSON — no markdown, no preamble, no code fences:
{
  "rank": "S" | "A" | "B" | "C",
  "score": 0-100,
  "feedback": "2-3 sentences referencing their actual answer AND book knowledge. Be specific.",
  "strength": "One specific thing they demonstrated correctly — be precise",
  "improvement": "One specific principle or concept to study next — reference the book if relevant",
  "skillDeltas": {
    "timing": 0, "squash": 0, "anticipation": 0, "followThrough": 0,
    "weight": 0, "smoothness": 0, "creativity": 0, "consistency": 0,
    "cinematography": 0, "motionDesign": 0, "vfx": 0, "storytelling": 0
  },
  "xp": 0
}

SkillDeltas by rank: S=20-25 per relevant skill, A=15-18, B=10-12, C=5-8.
XP: S=150, A=100, B=65, C=35.`;

export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your-anthropic-key-here') {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured.' },
      { status: 503 }
    );
  }

  let body;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { challenge, submission, skills } = body;

  if (!challenge || !submission) {
    return NextResponse.json(
      { error: 'challenge and submission are required' },
      { status: 400 }
    );
  }

  const userMessage = `BOSS CHALLENGE: "${challenge}"

STUDENT SUBMISSION:
"${String(submission).slice(0, 2500)}"

STUDENT'S CURRENT SKILL LEVELS (for context):
${JSON.stringify(skills ?? {}, null, 2)}

Evaluate this submission using your deep animation knowledge. Return the JSON evaluation.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 700,
        system:     BOSS_EVAL_SYSTEM,
        messages:   [{ role: 'user', content: userMessage }],
      }),
    });

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: d.error?.message ?? `Anthropic ${res.status}` },
        { status: res.status }
      );
    }

    const data  = await res.json();
    const text  = data.content?.find((b) => b.type === 'text')?.text ?? '';
    const clean = text.replace(/```json|```/g, '').trim();

    let evaluation;
    try {
      evaluation = JSON.parse(clean);
    } catch {
      return NextResponse.json(
        { error: 'AI returned invalid evaluation format' },
        { status: 500 }
      );
    }

    if (!evaluation.rank || evaluation.score === undefined || !evaluation.feedback) {
      return NextResponse.json(
        { error: 'Incomplete evaluation from AI' },
        { status: 500 }
      );
    }

    // Cap XP by rank
    const XP_CAPS = { S: 150, A: 100, B: 65, C: 35 };
    evaluation.xp = Math.min(
      evaluation.xp ?? XP_CAPS[evaluation.rank],
      XP_CAPS[evaluation.rank]
    );

    return NextResponse.json({ evaluation });
  } catch (err) {
    console.error('[api/boss]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
