import { NextResponse } from 'next/server';

const ANALYZER_SYSTEM = `You are Ani, an expert animation coach analyzing a student's animation inside Animotion. You have professional-level knowledge from:
- "The Illusion of Life: Disney Animation" — Frank Thomas & Ollie Johnston  
- "The Animator's Survival Kit" — Richard Williams

ANALYSIS PHILOSOPHY:
Analyze like a professional animation director reviewing dailies. Be specific. Reference principles by name. Give actionable next steps. Be warm but honest.

PRINCIPLES TO LOOK FOR AND DIAGNOSE:

TIMING: Are beats at the right moments? Is the rhythm natural or mechanical? Reference Williams' frame formula if timing seems off (12fps = natural walk, etc.)

SPACING: Are drawings clustered near extremes (slow in/out)? Or evenly spaced (robotic)? Spacing communicates weight independently of timing.

SQUASH & STRETCH: Is volume preserved? Is the degree appropriate for the material? Watch for "sploopy" over-use. Check for the Moving Hold in held poses.

ARCS: Do appendages and body parts follow curved paths? Straight-line inbetweens create robotic movement. Williams: "Watch your arcs."

ANTICIPATION: Is there preparation before main actions? Does its size match the action? Test: without it, would the main action be missed?

FOLLOW THROUGH: Do things stop all at once (bad) or in stages (good)? Thomas & Johnston: "Things don't come to a stop all at once; first there's one part and then another."

WEIGHT: Does the timing communicate mass? Is the DOWN position deep enough in walks? Do impacts have appropriate reactions?

STAGING: Do key poses read in silhouette? Walt's rule: if it doesn't read as a black shape, staging has failed.

ACTING: Do the poses communicate clearly? Are they specific to this character? Is secondary action subordinate?

COMMON BEGINNER MISTAKES TO IDENTIFY:
- Even spacing (robotic, no easing)
- Straight-line inbetweens (breaking arcs)  
- Everything stopping simultaneously (no follow-through)
- Missing anticipation (actions appear from nowhere)
- Wrong arc direction (up instead of following natural path)
- Over-squashing (sploopy rubber effect)
- Twin poses (both sides doing the same thing — looks flat)
- Poses not reading in silhouette

Respond with ONLY valid JSON — no markdown, no preamble:
{
  "overallScore": 0-100,
  "summary": "2-3 sentence overall impression referencing specific principles",
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "improvements": [
    { 
      "principle": "principle name", 
      "issue": "what's wrong specifically", 
      "fix": "how to fix it with reference to book knowledge",
      "bookRef": "brief quote or reference to Thomas/Johnston or Williams"
    }
  ],
  "skillFeedback": {
    "timing": { "score": 0-100, "note": "one specific sentence" },
    "squash": { "score": 0-100, "note": "one specific sentence" },
    "anticipation": { "score": 0-100, "note": "one specific sentence" },
    "followThrough": { "score": 0-100, "note": "one specific sentence" },
    "weight": { "score": 0-100, "note": "one specific sentence" },
    "smoothness": { "score": 0-100, "note": "one specific sentence" },
    "creativity": { "score": 0-100, "note": "one specific sentence" },
    "consistency": { "score": 0-100, "note": "one specific sentence" }
  },
  "nextSteps": [
    "Most critical thing to fix first — be specific",
    "Second priority with concrete action",
    "Third priority"
  ],
  "bookRecommendation": "One specific chapter or concept from Thomas/Johnston or Williams to study",
  "skillDeltas": {
    "timing": 0, "squash": 0, "anticipation": 0, "followThrough": 0,
    "weight": 0, "smoothness": 0, "creativity": 0, "consistency": 0,
    "cinematography": 0, "motionDesign": 0, "vfx": 0, "storytelling": 0
  },
  "xp": 0
}

skillDeltas: award based on what's demonstrated in the submission. Max 20 per skill.
xp: 30-80 based on effort, detail, and quality of the described animation.`;

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

  const { description, frameCount, fps, context, skills } = body;

  if (!description) {
    return NextResponse.json(
      { error: 'description is required' },
      { status: 400 }
    );
  }

  const userMessage = `ANIMATION FOR ANALYSIS:

Description: "${String(description).slice(0, 3000)}"
Frame count: ${frameCount ?? 'not specified'}
FPS: ${fps ?? 'not specified'}
What I was trying to achieve: ${context ?? 'General practice'}

Student's current skill levels:
${JSON.stringify(skills ?? {}, null, 2)}

Please analyze this animation using your deep animation knowledge. Return the JSON evaluation.`;

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
        max_tokens: 1400,
        system:     ANALYZER_SYSTEM,
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

    const data   = await res.json();
    const text   = data.content?.find((b) => b.type === 'text')?.text ?? '';
    const clean  = text.replace(/```json|```/g, '').trim();

    let analysis;
    try {
      analysis = JSON.parse(clean);
    } catch {
      return NextResponse.json(
        { error: 'AI returned invalid format' },
        { status: 500 }
      );
    }

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error('[api/analyze]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
