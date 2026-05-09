-- ============================================================
-- ANIMOTION v3 — Complete Database Schema
-- Run in: Supabase Dashboard → SQL Editor → Run All
-- ============================================================

-- ── 1. USER PROFILES ─────────────────────────────────────────
create table if not exists public.user_profiles (
  id                uuid        primary key references auth.users(id) on delete cascade,
  display_name      text,
  xp                integer     not null default 0 check (xp >= 0),
  level             integer     not null default 1 check (level >= 1),
  completed_lessons text[]      not null default '{}',
  has_seen_tutorial boolean     not null default false,
  skills            jsonb       not null default '{}',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists user_profiles_xp_idx on public.user_profiles (xp desc);

-- ── 2. ANIMATION PROJECTS ─────────────────────────────────────
create table if not exists public.animation_projects (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  name        text        not null default 'Untitled Project',
  frames      jsonb       not null default '[]',
  frame_data  jsonb       not null default '{}',
  layers      jsonb       not null default '[]',
  fps         integer     not null default 12 check (fps > 0 and fps <= 60),
  bg_color    text        not null default '#FFFFFF',
  width       integer     not null default 580,
  height      integer     not null default 360,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists animation_projects_user_idx
  on public.animation_projects (user_id, updated_at desc);

-- ── 3. ROW LEVEL SECURITY ─────────────────────────────────────
alter table public.user_profiles      enable row level security;
alter table public.animation_projects enable row level security;

-- Drop old policies
do $$ begin
  drop policy if exists "Users can view own profile"                       on public.user_profiles;
  drop policy if exists "Users can insert own profile"                     on public.user_profiles;
  drop policy if exists "Users can update own profile"                     on public.user_profiles;
  drop policy if exists "Anyone authenticated can view leaderboard data"   on public.user_profiles;
  drop policy if exists "Users can view own projects"                      on public.animation_projects;
  drop policy if exists "Users can insert own projects"                    on public.animation_projects;
  drop policy if exists "Users can update own projects"                    on public.animation_projects;
  drop policy if exists "Users can delete own projects"                    on public.animation_projects;
exception when others then null;
end $$;

-- user_profiles policies
create policy "Users can view own profile"
  on public.user_profiles for select using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.user_profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Leaderboard: authenticated users can see display_name, xp, level
create policy "Authenticated users can view leaderboard"
  on public.user_profiles for select using (auth.role() = 'authenticated');

-- animation_projects policies (owner-only)
create policy "Users can view own projects"
  on public.animation_projects for select using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on public.animation_projects for insert with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.animation_projects for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.animation_projects for delete using (auth.uid() = user_id);

-- ── 4. AUTO-CREATE PROFILE ON SIGNUP ──────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_profiles (
    id, display_name, xp, level, completed_lessons, has_seen_tutorial, skills
  ) values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    ),
    0,    -- XP starts at ZERO
    1,    -- level starts at 1
    '{}', -- no lessons completed
    false,-- tutorial not seen
    '{}'  -- all skills start at 0
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 5. AUTO-UPDATE TIMESTAMPS ─────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists set_user_profiles_updated_at      on public.user_profiles;
drop trigger if exists set_animation_projects_updated_at  on public.animation_projects;

create trigger set_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute procedure public.set_updated_at();

create trigger set_animation_projects_updated_at
  before update on public.animation_projects
  for each row execute procedure public.set_updated_at();

-- ── 6. PERMISSIONS ────────────────────────────────────────────
grant usage on schema public to anon, authenticated;
grant all   on public.user_profiles      to authenticated;
grant all   on public.animation_projects to authenticated;
grant select on public.user_profiles     to anon;

-- ── AFTER RUNNING ─────────────────────────────────────────────
-- 1. Auth → Providers → Google → enable + add credentials
-- 2. Auth → URL Configuration → Site URL = your Vercel URL
-- 3. Auth → URL Configuration → Redirect URLs → add: https://your-app.vercel.app/auth/callback
