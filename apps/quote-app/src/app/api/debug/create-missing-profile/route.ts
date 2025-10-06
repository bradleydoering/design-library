import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { userId, email, fullName, companyName } = await request.json();

    if (!userId || !email || !fullName) {
      return NextResponse.json({
        error: 'Missing required fields: userId, email, fullName'
      }, { status: 400 });
    }

    // Create Supabase service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create contractor profile
    const { data: profile, error: profileError } = await supabase
      .from('contractor_profiles')
      .insert([
        {
          id: userId,
          email: email,
          full_name: fullName,
          company_name: companyName || '',
          status: 'active' // Since email is already verified
        }
      ])
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return NextResponse.json({
        error: 'Failed to create contractor profile',
        details: profileError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Contractor profile created successfully',
      profile
    });

  } catch (error) {
    console.error('Create profile error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}