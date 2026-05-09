-- ─── ANIMOTION SCHEMA ADDITIONS ──────────────────────────────────────────────
-- Run these in your Supabase SQL Editor to support the new features.
-- These are ADDITIVE — they do not modify existing tables.

-- ── 1. Add new columns to user_profiles ───────────────────────────────────────
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS completed_bosses  text[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS skill_contract    jsonb    DEFAULT NULL;
-- completed_bosses: array of boss IDs the user has beaten
-- skill_contract: { skillId, startDate } or null

-- ── 2. Weekly challenge submissions ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS challenge_submissions (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id   text        NOT NULL,
  user_id        uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name   text        NOT NULL,
  description    text        NOT NULL,
  xp_earned      integer     DEFAULT 0,
  created_at     timestamptz DEFAULT now()
);

-- One submission per user per challenge
CREATE UNIQUE INDEX IF NOT EXISTS challenge_submissions_user_challenge
  ON challenge_submissions (challenge_id, user_id);

-- RLS
ALTER TABLE challenge_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read submissions (community feed)
CREATE POLICY "Read challenge submissions"
  ON challenge_submissions FOR SELECT
  TO authenticated USING (true);

-- Users can only insert their own submissions
CREATE POLICY "Insert own submission"
  ON challenge_submissions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ── 3. Community animation feed (future-ready) ────────────────────────────────
CREATE TABLE IF NOT EXISTS animation_posts (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text        NOT NULL,
  title        text        NOT NULL,
  description  text,
  project_id   uuid        REFERENCES animation_projects(id) ON DELETE SET NULL,
  likes        integer     DEFAULT 0,
  views        integer     DEFAULT 0,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE animation_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read all posts"
  ON animation_posts FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Insert own post"
  ON animation_posts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own post"
  ON animation_posts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Delete own post"
  ON animation_posts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ── 4. Indexes for performance ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS challenge_submissions_challenge_id ON challenge_submissions (challenge_id);
CREATE INDEX IF NOT EXISTS animation_posts_user_id ON animation_posts (user_id);
CREATE INDEX IF NOT EXISTS animation_posts_created_at ON animation_posts (created_at DESC);
