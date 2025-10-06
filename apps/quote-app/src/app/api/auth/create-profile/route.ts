import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role client for admin operations (server-side only)
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(req: NextRequest) {
  try {
    const { id, email, full_name, company_name } = await req.json();

    if (!id || !email || !full_name) {
      return NextResponse.json({
        error: 'id, email, and full_name are required'
      }, { status: 400 });
    }

    console.log('Creating contractor profile via API for:', email);

    const { data, error } = await supabaseServiceRole
      .from('contractor_profiles')
      .insert({
        id,
        email,
        full_name,
        company_name: company_name || null,
        role: 'contractor',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Profile creation error:', error);
      return NextResponse.json({
        error: `Failed to create contractor profile: ${error.message}`
      }, { status: 500 });
    }

    console.log('Contractor profile created successfully:', data.email);
    return NextResponse.json({
      success: true,
      profile: data
    });

  } catch (error) {
    console.error('Create profile API error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}