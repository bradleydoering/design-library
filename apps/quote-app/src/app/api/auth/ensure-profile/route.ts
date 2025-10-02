import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getContractorProfile, createContractorProfile, updateContractorProfileStatus } from '@/lib/auth-service';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });

  const supabase = createServerClient(url, anon, {
    cookies: {
      get(name: string) { return req.cookies.get(name)?.value; },
      set(name: string, value: string, options: any) { res.cookies.set({ name, value, ...options }); },
      remove(name: string, options: any) { res.cookies.set({ name, value: '', ...options, maxAge: 0 }); },
    },
  });

  try {
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (!user?.id || !user.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const existing = await getContractorProfile(user.id);
    if (!existing.data) {
      const fullName = (user.user_metadata as any)?.full_name || (user.email.split('@')[0] ?? 'New User');
      const company = (user.user_metadata as any)?.company_name || undefined;
      const created = await createContractorProfile({
        id: user.id,
        email: user.email,
        full_name: fullName,
        company_name: company,
        status: 'active',
      });
      if (created.error) throw created.error;
      return NextResponse.json({ profile: created.data });
    } else {
      if (existing.data.status !== 'active') {
        await updateContractorProfileStatus(user.id, 'active');
      }
      return NextResponse.json({ profile: existing.data });
    }
  } catch (e) {
    console.error('ensure-profile error', e);
    return NextResponse.json({ error: 'Failed to ensure profile' }, { status: 500 });
  }
}

