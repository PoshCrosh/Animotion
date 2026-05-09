import { createServerClient } from '@supabase/ssr';
import { cookies }             from 'next/headers';
import { NextResponse }        from 'next/server';

/** GET /api/leaderboard?limit=25 — returns top users by XP */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const limitParam = parseInt(searchParams.get('limit') ?? '25', 10);
  const limit      = Math.min(Math.max(limitParam, 1), 100); // clamp 1–100

  const cookieStore = cookies();
  const sb = createServerClient(
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

  const { data, error } = await sb
    .from('user_profiles')
    .select('id, display_name, xp, level')
    .order('xp', { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data ?? [] });
}
