import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role client for admin operations
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function POST(req: NextRequest) {
  try {
    const { id, email, full_name, company_name } = await req.json();
    if (!id || !email) {
      return NextResponse.json({ error: 'id and email are required' }, { status: 400 });
    }

    // Check existing profile
    const { data: existing, error: selErr } = await supabaseServiceRole
      .from('contractor_profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (selErr) {
      return NextResponse.json({ error: selErr.message }, { status: 500 });
    }

    if (!existing) {
      const { data, error } = await supabaseServiceRole
        .from('contractor_profiles')
        .insert({
          id,
          email,
          full_name: full_name || email.split('@')[0],
          company_name: company_name || null,
          role: 'contractor',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ profile: data, created: true });
    }

    if (existing.status !== 'active') {
      const { data, error } = await supabaseServiceRole
        .from('contractor_profiles')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ profile: data, updated: true });
    }

    return NextResponse.json({ profile: existing, ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}

