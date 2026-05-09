import { NextResponse } from 'next/server';

const ROADMAP_SYSTEM = `You are Ani, an expert animation learning coach inside Animotion. Generate a personalized learning roadmap.

You MUST respond with ONLY valid JSON:
{
  "title": "Roadmap title",
  "goal": "One sentence description of the end goal",
  "duration": "e.g. 4 weeks",
  "weeks": [
    {
      "week": 1,
      "theme": "Week theme",
      "focus": "Primary skill focus",
      "lessons": ["lesson_id_1", "lesson_id_2"],
      "dailyGoal": "What to do each day this week",
      "milestone": "What you'll be able to do by end of week"
    }
  ],
  "skillPriorities": ["skill1", "skill2", "skill3"],
  "tips": ["personalized tip 1", "personalized tip 2"]
}

Lesson IDs available (use ONLY these exact IDs):
2d-f1, 2d-f2, 2d-f3, 2d-f4, 2d-m1, 2d-m2, 2d-m3, 2d-a1, 2d-a2, 2d-a3, 2d-b1, 2d-b2, 2d-b3, 2d-b4,
3d-f1, 3d-f2, 3d-f3, 3d-f4, 3d-m1, 3d-m2, 3d-m3, 3d-a1, 3d-a2, 3d-a3, 3d-b1, 3d-b2, 3d-b3,
vfx-f1, vfx-f2, vfx-f3, vfx-f4, vfx-m1, vfx-m2, vfx-m3, vfx-a1, vfx-a2, vfx-a3, vfx-b1, vfx-b2, vfx-b3,
cin-f1, cin-f2, cin-f3, cin-f4, cin-t1, cin-t2, cin-t3, cin-a1, cin-a2, cin-a3, cin-b1, cin-b2, cin-b3,
mg-f1, mg-f2, mg-f3, mg-f4, mg-t1, mg-t2, mg-t3, mg-a1, mg-a2, mg-a3, mg-b1, mg-b2, mg-b3

Create a realistic, achievable roadmap. Max 6 weeks. 2-4 lessons per week.`;

export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your-anthropic-key-here') {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured.' }, { status: 503 });
  }

  let body;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { goal, skills, completedLessons, specialization } = body;

  const prompt = `Generate a personalized learning roadmap for an animation student.

GOAL: ${goal ?? 'Become a well-rounded animator'}
SPECIALIZATION INTEREST: ${specialization ?? 'General animation'}
COMPLETED LESSONS: ${(completedLessons ?? []).join(', ') || 'None yet'}
CURRENT SKILL LEVELS: ${JSON.stringify(skills ?? {})}

Create a roadmap that:
1. Starts from where they are (skip already-completed lessons)
2. Addresses their weakest skills first
3. Builds progressively toward their goal
4. Is achievable (not overwhelming)`;

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
        max_tokens: 1500,
        system:     ROADMAP_SYSTEM,
        messages:   [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return NextResponse.json({ error: d.error?.message ?? `Anthropic ${res.status}` }, { status: res.status });
    }

    const data  = await res.json();
    const text  = data.content?.find((b) => b.type === 'text')?.text ?? '';
    const clean = text.replace(/```json|```/g, '').trim();

    let roadmap;
    try { roadmap = JSON.parse(clean); }
    catch { return NextResponse.json({ error: 'AI returned invalid format' }, { status: 500 }); }

    return NextResponse.json({ roadmap });
  } catch (err) {
    console.error('[api/roadmap]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
