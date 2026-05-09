'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Mascot from '../../components/ui/Mascot';
import { getSupabase } from '../../lib/supabase';
import { validate, sanitize } from '../../lib/utils';

export default function LoginPage() {
  const router   = useRouter();
  const supabase = getSupabase();

  const [mode,     setMode]     = useState('login');   // 'login' | 'signup'
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [errors,   setErrors]   = useState({});
  const [authErr,  setAuthErr]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [shaking,  setShaking]  = useState(false);
  const [success,  setSuccess]  = useState(false);

  // Already logged in? Go straight to dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard');
    });
  }, []); // eslint-disable-line

  const shake = () => { setShaking(true); setTimeout(() => setShaking(false), 420); };

  // ── Email / Password ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e?.preventDefault();
    setAuthErr(null);

    const errs = {};
    if (mode === 'signup') {
      const ne = validate.name(name);
      if (ne) errs.name = ne;
    }
    const ee = validate.email(email);    if (ee) errs.email    = ee;
    const pe = validate.password(password); if (pe) errs.password = pe;

    if (Object.keys(errs).length) { setErrors(errs); shake(); return; }
    setErrors({});
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: sanitize(email),
          password,
          options: { data: { name: sanitize(name) } },
        });
        if (error) throw error;
        setSuccess(true);
        setTimeout(() => router.replace('/dashboard'), 1600);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: sanitize(email),
          password,
        });
        if (error) throw error;
        router.replace('/dashboard');
      }
    } catch (err) {
      setAuthErr(err.message ?? 'Authentication failed. Please try again.');
      shake();
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth ─────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setAuthErr(null);
    setLoading(true);
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${siteUrl}/auth/callback` },
      });
      if (error) throw error;
    } catch (err) {
      setAuthErr(err.message ?? 'Google sign-in failed.');
      setLoading(false);
    }
  };

  const switchMode = () => { setMode((m) => m === 'login' ? 'signup' : 'login'); setErrors({}); setAuthErr(null); };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-primary-light via-purple-50 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="w-full max-w-[420px] animate-fade-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <Mascot size={72} mood={success ? 'excited' : 'happy'} animate className="mx-auto mb-3" />
          <h1 className="font-black text-3xl text-primary tracking-tight">Animotion</h1>
          <p className="text-[13px] text-gray-500 font-semibold mt-1">Your animation learning studio 🎬</p>
        </div>

        {/* Card */}
        <div className={`card p-8 ${shaking ? 'animate-shake' : ''}`}>
          {success ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="font-black text-xl mb-2">Account Created!</h2>
              <p className="text-gray-500 text-sm font-semibold mb-4">Welcome to Animotion. Getting your studio ready…</p>
              <div className="w-10 h-10 border-4 border-primary-light border-t-primary rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <>
              {/* Mode tabs */}
              <div className="flex gap-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
                {['login', 'signup'].map((m) => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`flex-1 py-2 rounded-lg text-sm font-black capitalize transition-all ${mode === m ? 'bg-white dark:bg-gray-900 text-primary shadow-soft' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                    {m === 'login' ? 'Log In' : 'Sign Up'}
                  </button>
                ))}
              </div>

              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 font-bold text-sm bg-white dark:bg-gray-900 hover:border-primary transition-all mb-5 disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <span className="text-xs text-gray-400 font-bold">OR</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                {mode === 'signup' && (
                  <div>
                    <input className={`field ${errors.name ? 'field-error' : ''}`}
                      placeholder="Your display name" value={name}
                      onChange={(e) => setName(e.target.value)} autoComplete="name" disabled={loading} />
                    {errors.name && <p className="text-red-500 text-xs font-bold mt-1">{errors.name}</p>}
                  </div>
                )}
                <div>
                  <input className={`field ${errors.email ? 'field-error' : ''}`}
                    type="email" placeholder="Email address" value={email}
                    onChange={(e) => setEmail(e.target.value)} autoComplete="email" disabled={loading} />
                  {errors.email && <p className="text-red-500 text-xs font-bold mt-1">{errors.email}</p>}
                </div>
                <div>
                  <input className={`field ${errors.password ? 'field-error' : ''}`}
                    type="password" placeholder="Password (min 8 characters)" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} disabled={loading} />
                  {errors.password && <p className="text-red-500 text-xs font-bold mt-1">{errors.password}</p>}
                </div>

                {authErr && (
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                    <p className="text-red-600 dark:text-red-400 text-xs font-bold">{authErr}</p>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="btn btn-primary w-full py-3 text-[15px] mt-1 disabled:opacity-50">
                  {loading
                    ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : mode === 'login' ? 'Log In →' : 'Create Account →'}
                </button>
              </form>

              {mode === 'login' && (
                <div className="text-center mt-3">
                  <button className="text-xs text-primary font-bold hover:underline">Forgot password?</button>
                </div>
              )}
              <p className="text-center text-xs text-gray-400 mt-4 font-semibold">
                {mode === 'login' ? 'New here? ' : 'Already have an account? '}
                <button onClick={switchMode} className="text-primary font-black hover:underline">
                  {mode === 'login' ? 'Sign up free' : 'Log in'}
                </button>
              </p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 opacity-45 mt-4 font-bold">Made by Posh :)</p>
      </div>
    </div>
  );
}
