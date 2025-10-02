"use client";

import { useEffect } from 'react';
import { supabaseBrowser as supabase } from '@/lib/supabase-browser';

export default function TokenHashBridge() {
  useEffect(() => {
    const run = async () => {
      try {
        const hash = window.location.hash?.substring(1) || '';
        if (!hash) return;
        // Avoid loops on auth routes
        if (window.location.pathname.startsWith('/auth/callback')) return;
        const params = new URLSearchParams(hash);
        const at = params.get('access_token');
        const rt = params.get('refresh_token');
        if (!at || !rt) return;

        // Determine next destination (default dashboard)
        const currentPath = window.location.pathname + window.location.search;
        let next = params.get('next') || (currentPath.startsWith('/auth') || currentPath.startsWith('/login') ? '/dashboard' : currentPath) || '/dashboard';
        if (next.startsWith('/login')) next = '/dashboard';

        // If already authenticated, just navigate
        try {
          const { data: s } = await supabase.auth.getSession();
          if (s?.session?.user) {
            // Ensure profile
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
            try { window.location.hash = ''; } catch {}
            try { window.history.replaceState(null, '', next); } catch {}
            window.location.assign(next);
            return;
          }
        } catch {}

        // Set session from tokens
        const { data, error } = await supabase.auth.setSession({ access_token: at, refresh_token: rt });
        // Ensure profile
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

        // Clear hash and navigate
        try { window.location.hash = ''; } catch {}
        try { window.history.replaceState(null, '', next); } catch {}
        setTimeout(() => window.location.assign(next), 10);
      } catch {}
    };
    run();
  }, []);

  return null;
}
