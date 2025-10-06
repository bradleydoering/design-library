import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function getBaseUrl(req: NextRequest) {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv && fromEnv.length > 0) return fromEnv.replace(/\/$/, '');
  // Fall back to request origin (local dev: http://localhost:3333)
  const origin = req.nextUrl.origin || 'http://localhost:3333';
  return origin.replace(/\/$/, '');
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Use Supabase's built-in resend email verification
    const baseUrl = getBaseUrl(req);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${baseUrl}/auth/callback`
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
