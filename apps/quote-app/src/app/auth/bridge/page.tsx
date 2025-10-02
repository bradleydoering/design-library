"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser as supabase } from '@/lib/supabase-browser';

export default function AuthBridgePage() {
  const router = useRouter();
  const processedRef = useRef(false);

  useEffect(() => {
    const run = async () => {
      if (processedRef.current) return;
      processedRef.current = true;
      try {
        const href = window.location.href;
        console.log('Auth bridge start', { href });
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const rawNext = params.get('next') || '/dashboard';
        const next = rawNext.startsWith('/login') ? '/dashboard' : rawNext;

        // Also subscribe to auth state changes to force navigation on SIGNED_IN
        const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
          if (sess?.user) {
            try { window.location.hash = ''; } catch {}
            try { window.history.replaceState(null, '', next); } catch {}
            console.log('Auth bridge: auth listener navigating', { next });
            window.location.assign(next);
          }
        });

        // If a session already exists (e.g., auth state change happened), just go
        try {
          const { data: s } = await supabase.auth.getSession();
          if (s?.session?.user) {
            console.log('Auth bridge: session already present, navigating', { next });
            try { window.location.hash = ''; } catch {}
            try { window.history.replaceState(null, '', next); } catch {}
            window.location.assign(next);
            return;
          }
        } catch {}

        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          console.log('Auth bridge setSession result', { hasSession: !!data?.session, error });
          try {
            const u = await supabase.auth.getUser();
            if (u.data.user) {
              await fetch('/api/auth/ensure-profile-client', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: u.data.user.id,
                  email: u.data.user.email,
                  full_name: (u.data.user.user_metadata as any)?.full_name,
                  company_name: (u.data.user.user_metadata as any)?.company_name,
                })
              });
            }
          } catch {}
        } else {
          console.warn('Auth bridge missing tokens in hash');
        }

        try { window.location.hash = ''; } catch {}
        try { window.history.replaceState(null, '', next); } catch {}
        setTimeout(() => { console.log('Auth bridge: navigating', { next }); window.location.assign(next); }, 30);
      } catch {
        window.location.href = '/dashboard';
      }
    };
    run();
  }, [router]);

  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto mb-4"></div>
        <p className="text-navy font-semibold">Finalizing sign-in…</p>
      </div>
    </div>
  );
}
