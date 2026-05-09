'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Mascot from '../../components/ui/Mascot';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [pass,  setPass]  = useState('');
  const [mode,  setMode]  = useState('login');
  const [msg,   setMsg]   = useState('');
  const [busy,  setBusy]  = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL    ?? 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-key'
  );

  async function handleGoogle() {
    setBusy(true);
    await supabase.auth.signInWithOAuth({ provider:'google', options:{ redirectTo:`${location.origin}/auth/callback` } });
  }

  async function handleEmail(e) {
    e.preventDefault(); setBusy(true); setMsg('');
    const fn = mode==='login' ? supabase.auth.signInWithPassword : supabase.auth.signUp;
    const { error } = await fn({ email, password:pass });
    if (error) setMsg(error.message);
    else if (mode==='signup') setMsg('Check your email to confirm your account!');
    setBusy(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background:'linear-gradient(135deg,#EAF6FB 0%,#D4F0F8 50%,#E8F4FA 100%)' }}>

      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full opacity-20"
          style={{ background:'radial-gradient(circle,#009AC7,transparent)', filter:'blur(40px)' }}/>
        <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full opacity-15"
          style={{ background:'radial-gradient(circle,#9B7FEA,transparent)', filter:'blur(30px)' }}/>
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4" style={{ animation:'wii-float 3.5s ease-in-out infinite' }}>
            <Mascot size={64} mood="happy" animate />
          </div>
          <h1 className="font-black text-3xl" style={{ color:'#009AC7', letterSpacing:'-0.03em' }}>Animotion</h1>
          <p className="text-[13px] font-black uppercase tracking-[0.14em] mt-1" style={{ color:'#9AB5C0' }}>Animation Studio</p>
        </div>

        {/* Card */}
        <div className="wii-card p-7">
          <h2 className="font-black text-lg mb-1 text-center" style={{ color:'#1E3A4A' }}>
            {mode==='login' ? 'Welcome back!' : 'Create account'}
          </h2>
          <p className="text-[12px] font-semibold text-center mb-6" style={{ color:'#9AB5C0' }}>
            {mode==='login' ? 'Sign in to continue your journey' : 'Start your animation journey — free forever'}
          </p>

          {/* Google */}
          <button onClick={handleGoogle} disabled={busy}
            className="wii-btn w-full justify-center mb-4"
            style={{ background:'white', color:'#1E3A4A', border:'1.5px solid rgba(0,154,199,0.2)', boxShadow:'0 2px 12px rgba(0,120,180,0.1)', fontSize:13 }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background:'rgba(0,154,199,0.15)' }}/>
            <span className="text-[11px] font-black" style={{ color:'#9AB5C0' }}>OR</span>
            <div className="flex-1 h-px" style={{ background:'rgba(0,154,199,0.15)' }}/>
          </div>

          {/* Email form */}
          <form onSubmit={handleEmail} className="space-y-3">
            <input type="email" className="wii-input" placeholder="Email address" value={email}
              onChange={e => setEmail(e.target.value)} required autoComplete="email"/>
            <input type="password" className="wii-input" placeholder="Password" value={pass}
              onChange={e => setPass(e.target.value)} required minLength={6} autoComplete={mode==='login'?'current-password':'new-password'}/>

            {msg && (
              <div className="rounded-2xl px-4 py-3 text-[12px] font-semibold"
                style={{ background:msg.includes('Check')?'rgba(82,201,124,0.1)':'rgba(255,87,87,0.1)', color:msg.includes('Check')?'#52C97C':'#FF5757', border:`1px solid ${msg.includes('Check')?'rgba(82,201,124,0.3)':'rgba(255,87,87,0.3)'}` }}>
                {msg}
              </div>
            )}

            <button type="submit" disabled={busy} className="wii-btn wii-btn-primary w-full justify-center">
              {busy ? '…' : mode==='login' ? 'Sign In →' : 'Create Account →'}
            </button>
          </form>

          <button onClick={() => { setMode(m => m==='login'?'signup':'login'); setMsg(''); }}
            className="w-full text-center mt-4 text-[12px] font-black transition-colors"
            style={{ color:'#009AC7' }}>
            {mode==='login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>

        <p className="text-center text-[10px] font-bold mt-4" style={{ color:'#9AB5C0' }}>
          Made by Posh :) · Free forever · No ads
        </p>
      </div>
    </div>
  );
}
