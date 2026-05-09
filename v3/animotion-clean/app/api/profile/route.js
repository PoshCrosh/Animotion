import { createServerClient } from '@supabase/ssr';
import { cookies }             from 'next/headers';
import { NextResponse }        from 'next/server';

function makeClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll()                     { return cookieStore.getAll(); },
        setAll(toSet) {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    }
  );
}

/** GET /api/profile — returns the authenticated user's profile */
export async function GET() {
  const sb = makeClient();
  const { data: { user }, error: authErr } = await sb.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await sb.from('user_profiles').select('*').eq('id', user.id).single();
  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ profile: data ?? null });
}

/** PATCH /api/profile — updates allowed fields of the authenticated user's profile */
export async function PATCH(req) {
  const sb = makeClient();
  const { data: { user }, error: authErr } = await sb.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  // Whitelist: only allow these fields to be updated
  const allowed = ['display_name', 'xp', 'level', 'completed_lessons', 'has_seen_tutorial', 'skills'];
  const patch   = {};
  for (const key of allowed) {
    if (key in body) patch[key] = body[key];
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
  }

  // Validate types to prevent XSS / injection
  if ('display_name' in patch && typeof patch.display_name !== 'string') {
    return NextResponse.json({ error: 'display_name must be a string' }, { status: 400 });
  }
  if ('xp' in patch && (!Number.isFinite(patch.xp) || patch.xp < 0)) {
    return NextResponse.json({ error: 'xp must be a non-negative number' }, { status: 400 });
  }
  if ('level' in patch && (!Number.isInteger(patch.level) || patch.level < 1)) {
    return NextResponse.json({ error: 'level must be a positive integer' }, { status: 400 });
  }
  if ('completed_lessons' in patch && !Array.isArray(patch.completed_lessons)) {
    return NextResponse.json({ error: 'completed_lessons must be an array' }, { status: 400 });
  }

  patch.updated_at = new Date().toISOString();

  const { data, error } = await sb
    .from('user_profiles')
    .update(patch)
    .eq('id', user.id)   // scoped to authenticated user only
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}
