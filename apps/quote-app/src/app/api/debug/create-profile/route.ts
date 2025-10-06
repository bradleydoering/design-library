import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email, full_name, company_name } = await req.json();

    if (!email || !full_name) {
      return NextResponse.json({ error: 'Email and full_name are required' }, { status: 400 });
    }

    // Try to create a contractor profile directly
    const { data, error } = await supabase
      .from('contractor_profiles')
      .insert({
        id: crypto.randomUUID(), // Generate a UUID for testing
        email: email,
        full_name: full_name,
        company_name: company_name || null,
        role: 'contractor',
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Profile creation error:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profile: data,
      message: 'Contractor profile created successfully'
    });
  } catch (error) {
    console.error('Create profile error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}