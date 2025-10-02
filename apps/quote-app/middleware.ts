import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function middleware(req: NextRequest) {
  // Prepare response so we can mutate cookies
  const res = NextResponse.next({ request: { headers: req.headers } });

  // Honor remember_me cookie by extending auth cookie lifetime
  const remember = req.cookies.get('remember_me')?.value === 'true';

  const supabase = createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        const base = { name, value, ...options } as any;
        if (remember) {
          base.maxAge = 60 * 60 * 24 * 30; // 30 days
        }
        res.cookies.set(base);
      },
      remove(name: string, options: any) {
        res.cookies.set({ name, value: '', ...options, maxAge: 0 });
      },
    },
  });

  // Touch the session to refresh cookies (no redirect decisions here)
  await supabase.auth.getUser();

  return res;
}

// Run on most routes except static assets
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

