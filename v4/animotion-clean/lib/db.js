/**
 * lib/db.js — All Supabase DB operations with graceful demo-mode fallback.
 */
import { getSupabase } from './supabase';

const IS_PLACEHOLDER =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

export function isDbConfigured() { return !IS_PLACEHOLDER; }

function db() { return getSupabase(); }

// ─── USER PROFILES ────────────────────────────────────────────────────────────
export async function getProfile(userId) {
  if (!isDbConfigured() || !userId) return null;
  try {
    const { data, error } = await db()
      .from('user_profiles').select('*').eq('id', userId).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ?? null;
  } catch (e) { console.warn('[db.getProfile]', e.message); return null; }
}

export async function createProfile(userId, displayName) {
  if (!isDbConfigured() || !userId) return null;
  try {
    const { data, error } = await db()
      .from('user_profiles')
      .upsert({
        id: userId, display_name: displayName ?? null,
        xp: 0, level: 1, completed_lessons: [], has_seen_tutorial: false, skills: {},
      }, { onConflict: 'id', ignoreDuplicates: true })
      .select().single();
    if (error) throw error;
    return data;
  } catch (e) { console.warn('[db.createProfile]', e.message); return null; }
}

export async function updateProfile(userId, patch) {
  if (!isDbConfigured() || !userId) return null;
  try {
    const { data, error } = await db()
      .from('user_profiles')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', userId).select().single();
    if (error) throw error;
    return data;
  } catch (e) { console.warn('[db.updateProfile]', e.message); return null; }
}

// ─── LEADERBOARD ──────────────────────────────────────────────────────────────
export async function getLeaderboard(limit = 25) {
  if (!isDbConfigured()) return [];
  try {
    const { data, error } = await db()
      .from('user_profiles')
      .select('id, display_name, xp, level')
      .order('xp', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  } catch (e) { console.warn('[db.getLeaderboard]', e.message); return []; }
}

// ─── ANIMATION PROJECTS ───────────────────────────────────────────────────────
export async function saveProject(userId, { id, name, frames, frameData, layers, fps, bgColor, width, height }) {
  if (!isDbConfigured() || !userId) return null;
  const safeName   = typeof name === 'string' ? name.slice(0, 100) : 'Untitled';
  const safeFrames = Array.isArray(frames)  ? frames  : [];
  const safeFD     = (frameData && typeof frameData === 'object') ? frameData : {};
  const safeLayers = Array.isArray(layers) ? layers  : [];
  const safeFps    = Number.isFinite(fps) && fps > 0 ? Math.min(fps, 60) : 12;
  const safeBg     = typeof bgColor === 'string' ? bgColor : '#FFFFFF';
  const safeW      = Number.isFinite(width)  ? width  : 580;
  const safeH      = Number.isFinite(height) ? height : 360;

  try {
    if (id) {
      const { data: existing } = await db()
        .from('animation_projects').select('user_id').eq('id', id).single();
      if (!existing || existing.user_id !== userId)
        return null;

      const { data, error } = await db()
        .from('animation_projects')
        .update({
          name: safeName, frames: safeFrames, frame_data: safeFD,
          layers: safeLayers, fps: safeFps, bg_color: safeBg,
          width: safeW, height: safeH,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id).eq('user_id', userId).select().single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await db()
        .from('animation_projects')
        .insert({
          user_id: userId, name: safeName, frames: safeFrames, frame_data: safeFD,
          layers: safeLayers, fps: safeFps, bg_color: safeBg,
          width: safeW, height: safeH,
        })
        .select().single();
      if (error) throw error;
      return data;
    }
  } catch (e) { console.warn('[db.saveProject]', e.message); return null; }
}

export async function getProjects(userId) {
  if (!isDbConfigured() || !userId) return [];
  try {
    const { data, error } = await db()
      .from('animation_projects')
      .select('id, name, fps, width, height, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (e) { console.warn('[db.getProjects]', e.message); return []; }
}

export async function getProject(userId, projectId) {
  if (!isDbConfigured() || !userId || !projectId) return null;
  try {
    const { data, error } = await db()
      .from('animation_projects')
      .select('*')
      .eq('id', projectId).eq('user_id', userId).single();
    if (error) throw error;
    return data;
  } catch (e) { console.warn('[db.getProject]', e.message); return null; }
}

export async function deleteProject(userId, projectId) {
  if (!isDbConfigured() || !userId || !projectId) return false;
  try {
    const { error } = await db()
      .from('animation_projects')
      .delete().eq('id', projectId).eq('user_id', userId);
    if (error) throw error;
    return true;
  } catch (e) { console.warn('[db.deleteProject]', e.message); return false; }
}
