// app/api/challenges/route.js
import { createServerClient } from '@supabase/ssr';
import { cookies }            from 'next/headers';
import { NextResponse }       from 'next/server';

function makeClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll()       { return cookieStore.getAll(); },
        setAll(toSet) { toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); },
      },
    }
  );
}

// Current challenge — in production this would rotate weekly via a DB table
// For now it's computed from the current week number
function getCurrentChallenge() {
  const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const challenges = [
    { id: `w${weekNum}`, title: 'Bouncing Ball Mastery', desc: 'Animate a bouncing ball with perfect squash & stretch. Show at least 3 bounces with decreasing height.', skill: 'squash', xp: 200, icon: '⚽', endDate: getWeekEnd() },
    { id: `w${weekNum}`, title: 'Anticipation Challenge', desc: 'Create a snapping action with clear anticipation wind-up and follow-through settle.', skill: 'anticipation', xp: 200, icon: '⚡', endDate: getWeekEnd() },
    { id: `w${weekNum}`, title: 'Walk Cycle Week', desc: 'Animate a complete walk cycle that communicates a clear personality or emotion.', skill: 'timing', xp: 250, icon: '🚶', endDate: getWeekEnd() },
  ];
  return challenges[weekNum % challenges.length];
}

function getWeekEnd() {
  const d = new Date();
  d.setDate(d.getDate() + (7 - d.getDay()));
  d.setHours(23, 59, 59, 0);
  return d.toISOString();
}

/** GET /api/challenges — returns current challenge + submissions */
export async function GET() {
  const challenge = getCurrentChallenge();

  // If DB not configured, return challenge without submissions
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url.includes('placeholder')) {
    return NextResponse.json({ challenge, submissions: [] });
  }

  try {
    const sb = makeClient();
    const { data, error } = await sb
      .from('challenge_submissions')
      .select('id, user_id, display_name, description, xp_earned, created_at')
      .eq('challenge_id', challenge.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return NextResponse.json({ challenge, submissions: data ?? [] });
  } catch (e) {
    return NextResponse.json({ challenge, submissions: [] });
  }
}

/** POST /api/challenges — submit to current challenge */
export async function POST(req) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url.includes('placeholder')) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const sb = makeClient();
  const { data: { user }, error: authErr } = await sb.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { description } = body;
  if (!description || description.trim().length < 10) {
    return NextResponse.json({ error: 'Description required (min 10 chars)' }, { status: 400 });
  }

  const challenge = getCurrentChallenge();

  try {
    // Check if already submitted this week
    const { data: existing } = await sb
      .from('challenge_submissions')
      .select('id')
      .eq('challenge_id', challenge.id)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Already submitted this week' }, { status: 409 });
    }

    const profile = await sb.from('user_profiles').select('display_name').eq('id', user.id).single();
    const displayName = profile.data?.display_name ?? user.email?.split('@')[0] ?? 'Animator';

    const { data, error } = await sb
      .from('challenge_submissions')
      .insert({
        challenge_id: challenge.id,
        user_id:      user.id,
        display_name: displayName,
        description:  String(description).slice(0, 1000),
        xp_earned:    challenge.xp,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ submission: data }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
