import { NextRequest, NextResponse } from 'next/server';
import { sendEmailVerification } from '@/lib/email-service';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    console.log('📧 Send verification API called');
    console.log('SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);
    console.log('FROM_EMAIL:', process.env.FROM_EMAIL);

    const { email } = await req.json();
    console.log('📧 Email to verify:', email);

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Use Supabase's built-in resend email verification
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXTAUTH_URL || 'http://localhost:3333'}/auth/verify`
      }
    });

    if (error) {
      console.error('Supabase resend error:', error);
      
      // If resend fails, try to use our custom email system
      try {
        // Create a simple verification URL
        const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3333'}/auth/verify?email=${encodeURIComponent(email)}`;
        
        // Send the verification email
        const emailResult = await sendEmailVerification(email, verificationUrl);

        if (!emailResult.success) {
          console.error('Failed to send verification email:', emailResult.error);
          return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Verification email sent successfully (custom)' });
      } catch (customError) {
        console.error('Custom email also failed:', customError);
        return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
      }
    }

    return NextResponse.json({ message: 'Verification email sent successfully' });

  } catch (error) {
    console.error('Error in send-verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}