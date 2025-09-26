import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Use Supabase's built-in resend email verification
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXTAUTH_URL || window.location.origin}/auth/verify`
      }
    });

    if (error) {
      console.error('Failed to send verification email:', error);
      return NextResponse.json({ error: 'Failed to send verification email. Please try again later.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Verification email sent successfully' });

  } catch (error) {
    console.error('Error in send-verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}