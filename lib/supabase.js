import { createBrowserClient } from '@supabase/ssr';

// These come from .env.local
const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? 'https://placeholder.supabase.co';
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder';

// Returns a Supabase client safe to use in Client Components
export function getSupabase() {
  return createBrowserClient(url, key);
}
