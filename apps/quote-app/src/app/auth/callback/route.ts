import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { updateContractorProfileStatus, getContractorProfile, createContractorProfile } from '@/lib/auth-service';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type') || 'signup';

  // Prepare a redirect response up front and let Supabase set cookies on it
  // We will redirect to a small client bridge page with tokens in URL fragment
  const baseTarget = type === 'recovery' ? '/auth/bridge#next=/auth/reset-password' : '/auth/bridge#next=/dashboard';
  const redirectResponse = NextResponse.redirect(new URL(baseTarget, requestUrl.origin));

  const supabase = createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        redirectResponse.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        redirectResponse.cookies.set({ name, value: '', ...options, maxAge: 0 });
      },
    },
  });

  // If no code was provided (hash-link flow), send to bridge so the client can set session from fragment
  if (!code) {
    redirectResponse.headers.set('Location', new URL('/auth/bridge', requestUrl.origin).toString());
    return redirectResponse;
  }

  try {
    // Exchange the code for a session (cookies set on redirectResponse)
    const { data: exchangeData, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('Auth callback exchange error:', error);
      redirectResponse.headers.set('Location', new URL('/login?error=invalid-link', requestUrl.origin).toString());
      return redirectResponse;
    }

    // Ensure contractor profile exists and is active (best-effort)
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      const userId = user?.id;
      if (userId && user?.email) {
        const existing = await getContractorProfile(userId);
        if (!existing.data) {
          const fullName = (user.user_metadata as any)?.full_name || (user.email?.split('@')[0] ?? 'New User');
          const company = (user.user_metadata as any)?.company_name || undefined;
          await createContractorProfile({
            id: userId,
            email: user.email,
            full_name: fullName,
            company_name: company,
            status: 'active',
          });
        } else if (existing.data.status !== 'active') {
          await updateContractorProfileStatus(userId, 'active');
        }
      }
    } catch (e) {
      console.warn('Profile ensure/activation failed in callback:', e);
    }

    // Also include tokens in the fragment so the browser client can set its session
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const at = sessionData?.session?.access_token;
      const rt = sessionData?.session?.refresh_token;
      if (at && rt) {
        const currentLoc = new URL(redirectResponse.headers.get('Location')!, requestUrl.origin);
        // Append tokens to fragment
        const frag = currentLoc.hash ? currentLoc.hash.substring(1) : '';
        const params = new URLSearchParams(frag);
        params.set('access_token', at);
        params.set('refresh_token', rt);
        currentLoc.hash = '#' + params.toString();
        redirectResponse.headers.set('Location', currentLoc.toString());
      }
    } catch (e) {
      console.warn('Failed to attach tokens to bridge URL', e);
    }

    // Return the redirect response with cookies and bridge tokens
    return redirectResponse;
  } catch (e) {
    console.error('Auth callback exception:', e);
    redirectResponse.headers.set('Location', new URL('/login?error=callback-failed', requestUrl.origin).toString());
    return redirectResponse;
  }
}
