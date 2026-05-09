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
        getAll()       { return cookieStore.getAll(); },
        setAll(toSet) {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    }
  );
}

/** GET /api/projects — list all projects for the authenticated user */
export async function GET() {
  const sb = makeClient();
  const { data: { user }, error: authErr } = await sb.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await sb
    .from('animation_projects')
    .select('id, name, fps, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ projects: data ?? [] });
}

/** POST /api/projects — create or update an animation project */
export async function POST(req) {
  const sb = makeClient();
  const { data: { user }, error: authErr } = await sb.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { id, name, frames, layers, fps } = body;

  // Validate
  const safeName   = typeof name === 'string' ? name.slice(0, 100) : 'Untitled Project';
  const safeFrames = Array.isArray(frames) ? frames : [];
  const safeLayers = Array.isArray(layers) ? layers : [];
  const safeFps    = Number.isFinite(fps) && fps > 0 && fps <= 60 ? fps : 12;

  // Sanity-check array sizes to prevent abuse
  if (safeFrames.length > 120) {
    return NextResponse.json({ error: 'Too many frames (max 120)' }, { status: 400 });
  }

  if (id) {
    // UPDATE — verify ownership first
    const { data: existing } = await sb
      .from('animation_projects')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Not found or access denied' }, { status: 404 });
    }

    const { data, error } = await sb
      .from('animation_projects')
      .update({ name: safeName, frames: safeFrames, layers: safeLayers, fps: safeFps, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ project: data });
  } else {
    // INSERT
    const { data, error } = await sb
      .from('animation_projects')
      .insert({ user_id: user.id, name: safeName, frames: safeFrames, layers: safeLayers, fps: safeFps })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ project: data }, { status: 201 });
  }
}

/** DELETE /api/projects?id=xxx */
export async function DELETE(req) {
  const sb = makeClient();
  const { data: { user }, error: authErr } = await sb.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const { error } = await sb
    .from('animation_projects')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id); // data safety: scoped to owner

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
