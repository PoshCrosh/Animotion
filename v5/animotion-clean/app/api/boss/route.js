import { NextResponse } from 'next/server';

const BOSS_EVAL_SYSTEM = `You are Ani, an expert animation coach evaluating a student's Boss Battle submission inside Animotion.

A Boss Battle is a high-stakes animation challenge at the end of a curriculum section. The student has submitted a written description or response to a specific animation challenge.

Your job is to evaluate their response and return a structured JSON evaluation. Be encouraging but honest. Push students to grow.

EVALUATION CRITERIA:
- Understanding of the core principle being tested
- Application of technique described
- Creativity and problem-solving approach
- Specificity and detail of their response

RANK SYSTEM:
- S rank: Exceptional, demonstrates mastery (90-100%)
- A rank: Strong, shows solid understanding (75-89%)
- B rank: Good, grasps the basics (60-74%)
- C rank: Needs work, surface-level understanding (0-59%)

You MUST respond with ONLY valid JSON in this exact format — no preamble, no markdown, no extra text:
{
  "rank": "S" | "A" | "B" | "C",
  "score": 0-100,
  "feedback": "2-3 sentences of specific, encouraging feedback referencing their answer",
  "strength": "One specific thing they did well",
  "improvement": "One specific thing to work on next",
  "skillDeltas": {
    "timing": 0,
    "squash": 0,
    "anticipation": 0,
    "followThrough": 0,
    "weight": 0,
    "smoothness": 0,
    "creativity": 0,
    "consistency": 0,
    "cinematography": 0,
    "motionDesign": 0,
    "vfx": 0,
    "storytelling": 0
  },
  "xp": 0
}

For skillDeltas: only increase skills relevant to the challenge. Use 5-25 per relevant skill.
For xp: S=150, A=100, B=65, C=35`;

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
    return NextResponse.json({ error: 'challenge and submission are required' }, { status: 400 });
  }

  const userMessage = `BOSS CHALLENGE: "${challenge}"

STUDENT SUBMISSION:
"${String(submission).slice(0, 2000)}"

STUDENT'S CURRENT SKILL LEVELS (for context):
${JSON.stringify(skills ?? {}, null, 2)}

Evaluate this submission and return the JSON evaluation.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        system: BOSS_EVAL_SYSTEM,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return NextResponse.json({ error: d.error?.message ?? `Anthropic ${res.status}` }, { status: res.status });
    }

    const data  = await res.json();
    const text  = data.content?.find((b) => b.type === 'text')?.text ?? '';

    // Parse JSON from response
    const clean = text.replace(/```json|```/g, '').trim();
    let evaluation;
    try {
      evaluation = JSON.parse(clean);
    } catch {
      return NextResponse.json({ error: 'AI returned invalid evaluation format' }, { status: 500 });
    }

    // Validate required fields
    if (!evaluation.rank || !evaluation.score || !evaluation.feedback) {
      return NextResponse.json({ error: 'Incomplete evaluation from AI' }, { status: 500 });
    }

    // Cap XP by rank
    const XP_CAPS = { S: 150, A: 100, B: 65, C: 35 };
    evaluation.xp = Math.min(evaluation.xp ?? XP_CAPS[evaluation.rank], XP_CAPS[evaluation.rank]);

    return NextResponse.json({ evaluation });
  } catch (err) {
    console.error('[api/boss]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
