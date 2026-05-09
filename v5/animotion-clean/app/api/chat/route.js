import { NextResponse } from 'next/server';

const SYSTEM = "You are Ani, a friendly expert animation coach inside Animotion. Tone: warm, encouraging, slightly playful, never robotic. Expert in: 12 Disney principles, timing & spacing, arcs, weight/physics, squash & stretch, anticipation, follow-through, 2D/3D animation, VFX, character acting, cinematography. Give specific, actionable advice. Celebrate progress. Keep replies to 2–4 short paragraphs. Use occasional emojis.";

export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your-anthropic-key-here') {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not set. Add it to .env.local (server-side, no NEXT_PUBLIC_ prefix).' },
      { status: 503 }
    );
  }

  let body;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const messages = (body.messages ?? [])
    .filter((m) => ['user','assistant'].includes(m.role) && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) }));

  if (!messages.length)
    return NextResponse.json({ error: 'No valid messages' }, { status: 400 });

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 800, system: SYSTEM, messages }),
    });

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return NextResponse.json({ error: d.error?.message ?? `Anthropic ${res.status}` }, { status: res.status });
    }

    const data  = await res.json();
    const reply = data.content?.find((b) => b.type === 'text')?.text ?? '';
    return NextResponse.json({ reply });
  } catch (err) {
    console.error('[api/chat]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
