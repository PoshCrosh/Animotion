import { NextResponse } from 'next/server';

const ANALYZER_SYSTEM = `You are Ani, an expert animation coach inside Animotion. The user has uploaded or described an animation for you to analyze.

Provide structured, specific, actionable feedback as if you are a professional animation director reviewing a student's work.

You MUST respond with ONLY valid JSON — no markdown, no preamble:
{
  "overallScore": 0-100,
  "summary": "2-3 sentence overall impression",
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "improvements": [
    { "principle": "principle name", "issue": "what's wrong", "fix": "how to fix it specifically" },
    { "principle": "principle name", "issue": "what's wrong", "fix": "how to fix it specifically" }
  ],
  "skillFeedback": {
    "timing": { "score": 0-100, "note": "one sentence" },
    "squash": { "score": 0-100, "note": "one sentence" },
    "anticipation": { "score": 0-100, "note": "one sentence" },
    "followThrough": { "score": 0-100, "note": "one sentence" },
    "weight": { "score": 0-100, "note": "one sentence" },
    "smoothness": { "score": 0-100, "note": "one sentence" },
    "creativity": { "score": 0-100, "note": "one sentence" },
    "consistency": { "score": 0-100, "note": "one sentence" }
  },
  "nextSteps": ["most important thing to work on next", "second priority", "third priority"],
  "skillDeltas": {
    "timing": 0, "squash": 0, "anticipation": 0, "followThrough": 0,
    "weight": 0, "smoothness": 0, "creativity": 0, "consistency": 0,
    "cinematography": 0, "motionDesign": 0, "vfx": 0, "storytelling": 0
  },
  "xp": 0
}

For skillDeltas: award based on what's demonstrated. Max 20 per skill. XP: 30-80 based on effort and quality.
Be honest but encouraging. Reference specific frames or moments when possible.`;

export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your-anthropic-key-here') {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured.' }, { status: 503 });
  }

  let body;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { description, frameCount, fps, context, skills } = body;

  if (!description) {
    return NextResponse.json({ error: 'description is required' }, { status: 400 });
  }

  const userMessage = `ANIMATION SUBMISSION FOR ANALYSIS:

Description: "${String(description).slice(0, 3000)}"
Frame count: ${frameCount ?? 'unknown'}
FPS: ${fps ?? 'unknown'}
Context: ${context ?? 'General animation practice'}

Student's current skill levels:
${JSON.stringify(skills ?? {}, null, 2)}

Please analyze this animation and return the JSON evaluation.`;

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
        max_tokens: 1200,
        system:     ANALYZER_SYSTEM,
        messages:   [{ role: 'user', content: userMessage }],
      }),
    });

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return NextResponse.json({ error: d.error?.message ?? `Anthropic ${res.status}` }, { status: res.status });
    }

    const data   = await res.json();
    const text   = data.content?.find((b) => b.type === 'text')?.text ?? '';
    const clean  = text.replace(/```json|```/g, '').trim();

    let analysis;
    try { analysis = JSON.parse(clean); }
    catch { return NextResponse.json({ error: 'AI returned invalid format' }, { status: 500 }); }

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error('[api/analyze]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
