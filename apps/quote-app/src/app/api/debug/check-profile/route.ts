import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check auth.users table
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    const user = authUsers?.users?.find(u => u.email === email);

    // Check contractor_profiles table
    const { data: profiles, error: profileError } = await supabase
      .from('contractor_profiles')
      .select('*')
      .eq('email', email);

    return NextResponse.json({
      email,
      authUser: user ? {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at
      } : null,
      contractorProfiles: profiles || [],
      errors: {
        authError: authError?.message || null,
        profileError: profileError?.message || null
      }
    });

  } catch (error) {
    console.error('Profile check error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}