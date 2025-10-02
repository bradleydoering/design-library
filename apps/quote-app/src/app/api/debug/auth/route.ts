import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    // Test basic Supabase connection
    const { data: authUser, error: authError } = await supabase.auth.getUser();

    // Test contractor_profiles table access
    const { data: profiles, error: profileError } = await supabase
      .from('contractor_profiles')
      .select('*')
      .limit(5);

    // Test bradley.doering@gmail.com specifically
    const { data: bradProfile, error: bradError } = await supabase
      .from('contractor_profiles')
      .select('*')
      .eq('email', 'bradley.doering@gmail.com')
      .single();

    return NextResponse.json({
      supabase_config: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
        anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing'
      },
      auth_check: {
        user: authUser?.user?.id || null,
        error: authError?.message || null
      },
      profiles_check: {
        count: profiles?.length || 0,
        error: profileError?.message || null,
        data: profiles
      },
      brad_profile: {
        found: !!bradProfile,
        data: bradProfile,
        error: bradError?.message || null
      }
    });
  } catch (error) {
    console.error('Auth debug error:', error);
    return NextResponse.json({
      error: 'Debug check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}