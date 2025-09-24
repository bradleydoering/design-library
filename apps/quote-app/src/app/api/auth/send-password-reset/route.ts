import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordReset } from '@/lib/email-service';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Use Supabase's built-in password reset
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXTAUTH_URL || 'http://localhost:3333'}/auth/reset-password`
    });

    if (error) {
      console.error('Supabase password reset error:', error);
      
      // If Supabase fails, try to use our custom email system
      try {
        // Create a simple reset URL
        const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3333'}/auth/reset-password?email=${encodeURIComponent(email)}`;
        
        // Send the password reset email
        const emailResult = await sendPasswordReset(email, resetUrl);

        if (!emailResult.success) {
          console.error('Failed to send password reset email:', emailResult.error);
          return NextResponse.json({ error: 'Failed to send password reset email' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Password reset email sent successfully (custom)' });
      } catch (customError) {
        console.error('Custom password reset also failed:', customError);
        return NextResponse.json({ error: 'Failed to send password reset email' }, { status: 500 });
      }
    }

    return NextResponse.json({ message: 'Password reset email sent successfully' });

  } catch (error) {
    console.error('Error in send-password-reset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}