'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '../lib/supabase';
import { useApp } from '../lib/store';

/**
 * useAuth()
 * - Checks Supabase session.
 * - Redirects unauthenticated users to /login.
 * - Calls hydrateForUser() so the store loads the correct profile data.
 * - Returns { user, loading }.
 */
export function useAuth() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const router        = useRouter();
  const { hydrateForUser } = useApp();
  const hydrated = useRef(false);

  useEffect(() => {
    const sb = getSupabase();

    const handleUser = async (sessionUser) => {
      if (!sessionUser) {
        setUser(null);
        setLoading(false);
        router.replace('/login');
        return;
      }
      setUser(sessionUser);
      // Only hydrate once per mount to avoid duplicate DB reads
      if (!hydrated.current) {
        hydrated.current = true;
        const displayName =
          sessionUser.user_metadata?.name ??
          sessionUser.user_metadata?.full_name ??
          sessionUser.email?.split('@')[0] ??
          null;
        await hydrateForUser(sessionUser.id, displayName);
      }
      setLoading(false);
    };

    // Initial session check
    sb.auth.getSession().then(({ data: { session } }) => {
      handleUser(session?.user ?? null);
    });

    // Ongoing auth state changes
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      handleUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { user, loading };
}
