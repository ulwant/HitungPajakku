import React, { useEffect, useState } from 'react';
import { signInWithEmail, signUpWithEmail, signOut, getCurrentUser, onAuthChange } from '../services/auth';

const Auth: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getCurrentUser().then(u => { if (mounted) setUser(u); });
    const unsub = onAuthChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => { mounted = false; unsub(); };
  }, []);

  const handleSignIn = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const { data, error } = await signInWithEmail(email, password);
      if (error) setMessage(error.message);
      else setMessage('Signed in');
    } catch (err: any) {
      setMessage(err.message || 'Sign in failed');
    }
    setLoading(false);
  };

  const handleSignUp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const { data, error } = await signUpWithEmail(email, password);
      if (error) setMessage(error.message);
      else setMessage('Check your email to confirm (if enabled)');
    } catch (err: any) {
      setMessage(err.message || 'Sign up failed');
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm text-slate-700">{user.email}</div>
        <button onClick={handleSignOut} className="px-3 py-2 bg-white/90 border border-slate-200 rounded-xl text-sm font-bold">Keluar</button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="flex items-center gap-2">
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email" className="px-3 py-2 rounded-lg border border-slate-200 text-sm" />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="password" type="password" className="px-3 py-2 rounded-lg border border-slate-200 text-sm" />
        <button type="submit" disabled={loading} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold">{mode === 'signin' ? 'Masuk' : 'Daftar'}</button>
      </form>
      <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="text-xs text-slate-500 underline">{mode === 'signin' ? 'Daftar' : 'Sudah punya akun?'}</button>
      {message && <div className="text-xs text-slate-400 ml-2">{message}</div>}
    </div>
  );
};

export default Auth;
