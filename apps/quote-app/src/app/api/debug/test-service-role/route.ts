import { NextRequest, NextResponse } from 'next/server';
import { createContractorProfile } from '@/lib/auth-service';

export async function POST(req: NextRequest) {
  try {
    const { email, full_name, company_name } = await req.json();

    if (!email || !full_name) {
      return NextResponse.json({ error: 'Email and full_name are required' }, { status: 400 });
    }

    // Test the service role profile creation function
    const { data, error } = await createContractorProfile({
      id: crypto.randomUUID(), // Generate a UUID for testing
      email: email,
      full_name: full_name,
      company_name: company_name || undefined,
      role: 'contractor',
      status: 'active' // Set as active for testing
    });

    return NextResponse.json({
      success: !error,
      profile: data,
      error: error?.message || null,
      message: error ? 'Profile creation failed' : 'Profile created successfully with service role'
    });
  } catch (error) {
    console.error('Service role test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}