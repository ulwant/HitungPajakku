import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env');
}

// If the environment variables are present, create a real Supabase client.
// Otherwise export a safe noop client that won't throw at import/runtime so
// the app can run in development without the Supabase configuration.
let client: any = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  // lightweight noop implementation matching the small subset of the
  // Supabase client API that this app uses (auth.getUser, from(...).insert/delete/select)
  const noopResponse = (data: any = null) => Promise.resolve({ data, error: null });

  client = {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: (_cb: any) => ({ data: null, error: null }),
    },
    from: (_table: string) => ({
      insert: (_payload: any) => Promise.resolve({ data: null, error: null }),
      delete: () => ({ eq: (_col: string, _val: any) => Promise.resolve({ data: null, error: null }) }),
      select: (_sel?: string) => ({
        order: (_col: string, _opts?: any) => ({
          limit: (_n: number) => Promise.resolve({ data: [], error: null }),
        }),
      }),
    }),
  } as any;
}

export const supabase = client;
export default supabase;
