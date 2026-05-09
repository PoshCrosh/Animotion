'use client';

import { useEffect, useState } from 'react';
import { useRouter }           from 'next/navigation';
import { getSupabase }         from '../lib/supabase';

/**
 * useAuth()
 * - Checks Supabase session on mount.
 * - Redirects to /login if not authenticated.
 * - Returns { user, loading }.
 *
 * NOTE: If Supabase env vars are placeholders the auth check will fail gracefully
 * and redirect to /login where the user can sign in with the mock/demo path.
 */
export function useAuth() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const sb = getSupabase();

    // Get current session
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        router.replace('/login');
      }
      setLoading(false);
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        router.replace('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { user, loading };
}
