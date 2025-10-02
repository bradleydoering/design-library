import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!url || !anon) {
  throw new Error('Missing Supabase environment variables');
}

// Pure browser client using localStorage for session persistence.
// This avoids relying on HttpOnly cookies and makes setSession via the bridge reliable.
export const supabaseBrowser = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
