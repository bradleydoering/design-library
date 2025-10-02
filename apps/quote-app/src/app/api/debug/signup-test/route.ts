import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, companyName } = await req.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({
        error: 'email, password, and fullName are required'
      }, { status: 400 });
    }

    // IMPORTANT: Only allow bradley.doering@gmail.com to prevent email bounces
    if (email !== 'bradley.doering@gmail.com') {
      return NextResponse.json({
        error: 'Testing restricted to bradley.doering@gmail.com only to prevent email bounces'
      }, { status: 403 });
    }

    console.log('🧪 Testing Supabase signup for:', email);

    // Test direct Supabase signup
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName
        },
        emailRedirectTo: `${process.env.NEXTAUTH_URL || 'http://localhost:3333'}/auth/verify`
      },
    });

    console.log('🧪 Supabase signup result:', {
      user: authData.user ? {
        id: authData.user.id,
        email: authData.user.email,
        emailConfirmed: authData.user.email_confirmed_at,
        created: authData.user.created_at
      } : null,
      session: authData.session ? 'created' : null,
      error: signUpError?.message || null
    });

    if (signUpError) {
      return NextResponse.json({
        success: false,
        error: signUpError.message,
        step: 'supabase_signup'
      });
    }

    // If user created, try to create profile
    if (authData.user) {
      console.log('🧪 User created, attempting profile creation...');

      const profileResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3333'}/api/auth/create-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: authData.user.id,
          email: email,
          full_name: fullName,
          company_name: companyName || null
        })
      });

      const profileResult = await profileResponse.json();

      console.log('🧪 Profile creation result:', profileResult);

      return NextResponse.json({
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          emailConfirmed: authData.user.email_confirmed_at,
        },
        profileCreation: {
          success: profileResponse.ok,
          result: profileResult
        },
        message: 'Signup test completed. Check email for verification link.'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'User creation returned no data',
      step: 'user_data_missing'
    });

  } catch (error) {
    console.error('🧪 Signup test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      step: 'exception'
    }, { status: 500 });
  }
}