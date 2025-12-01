import { supabase } from './supabaseClient';

export async function getCurrentUser() {
  try {
    const res = await supabase.auth.getUser();
    return res?.data?.user ?? null;
  } catch (err) {
    console.warn('getCurrentUser error', err);
    return null;
  }
}

export async function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export function onAuthChange(callback: (event: string, session: any) => void) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  return () => data.subscription?.unsubscribe();
}
