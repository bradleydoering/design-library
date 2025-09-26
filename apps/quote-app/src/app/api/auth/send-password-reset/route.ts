import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Use Supabase's built-in password reset
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXTAUTH_URL || window.location.origin}/auth/reset-password`
    });

    if (error) {
      console.error('Failed to send password reset email:', error);
      return NextResponse.json({ error: 'Failed to send password reset email. Please try again later.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Password reset email sent successfully' });

  } catch (error) {
    console.error('Error in send-password-reset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}