-- ═══════════════════════════════════════════════════════════════
--  ANIMOTION — Full Database Schema
--  Run this ONCE in your Supabase SQL Editor
--  supabase.com → Your Project → SQL Editor → New Query → Paste → Run
-- ═══════════════════════════════════════════════════════════════

-- ── user_profiles ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id                  UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name        TEXT,
  xp                  INTEGER     DEFAULT 0    NOT NULL,
  level               INTEGER     DEFAULT 1    NOT NULL,
  completed_lessons   TEXT[]      DEFAULT '{}'::TEXT[],
  has_seen_tutorial   BOOLEAN     DEFAULT false NOT NULL,
  skills              JSONB       DEFAULT '{}'::JSONB,
  completed_bosses    TEXT[]      DEFAULT '{}'::TEXT[],
  skill_contract      JSONB       DEFAULT NULL,
  created_at          TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ── animation_projects ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.animation_projects (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        DEFAULT 'Untitled Project',
  frames      JSONB       DEFAULT '[]'::JSONB,
  frame_data  JSONB       DEFAULT '{}'::JSONB,
  layers      JSONB       DEFAULT '[]'::JSONB,
  fps         INTEGER     DEFAULT 12,
  bg_color    TEXT        DEFAULT '#FFFFFF',
  width       INTEGER     DEFAULT 580,
  height      INTEGER     DEFAULT 360,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ── challenge_submissions ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.challenge_submissions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge   TEXT        NOT NULL,
  submission  TEXT        NOT NULL,
  rank        TEXT,
  score       INTEGER,
  feedback    TEXT,
  xp_earned   INTEGER     DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ── Row Level Security ─────────────────────────────────────────
ALTER TABLE public.user_profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animation_projects   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;

-- user_profiles policies
CREATE POLICY "Users can read own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Leaderboard: read display_name, xp, level for all authenticated"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (true);

-- animation_projects policies
CREATE POLICY "Users manage own projects"
  ON public.animation_projects FOR ALL
  USING (auth.uid() = user_id);

-- challenge_submissions policies
CREATE POLICY "Users manage own submissions"
  ON public.challenge_submissions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can read all submissions"
  ON public.challenge_submissions FOR SELECT
  TO authenticated
  USING (true);

-- ── Triggers ──────────────────────────────────────────────────
-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, xp, level, completed_lessons, has_seen_tutorial, skills)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    0, 1, '{}'::TEXT[], false, '{}'::JSONB
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at_user_profiles ON public.user_profiles;
CREATE TRIGGER set_updated_at_user_profiles
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_projects ON public.animation_projects;
CREATE TRIGGER set_updated_at_projects
  BEFORE UPDATE ON public.animation_projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
