import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
import { sendCustomerQuoteEmail } from '@/lib/email-service';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      quote_id,
      customer_name,
      customer_email,
      customer_phone,
      project_address,
      skip_email, // Optional - if true, don't send email, just create token
    } = body;

    // Validate required fields
    if (!quote_id || !customer_name || !project_address) {
      return NextResponse.json(
        { error: 'Missing required fields: quote_id, customer_name, project_address' },
        { status: 400 }
      );
    }

    // Email is required only if not skipping email
    if (!skip_email && !customer_email) {
      return NextResponse.json(
        { error: 'customer_email is required when sending email' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch the quote to ensure it exists and belongs to the user's org
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quote_id)
      .single();

    if (quoteError || !quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Generate secure token (64 character hex string)
    const token = crypto.randomBytes(32).toString('hex');

    // Create customer access token record
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

    const { data: tokenRecord, error: tokenError } = await supabase
      .from('customer_quote_tokens')
      .insert({
        quote_id: quote_id,
        token: token,
        customer_email: customer_email || null,
        customer_name: customer_name,
        customer_phone: customer_phone || null,
        project_address: project_address,
        expires_at: expiresAt.toISOString(),
        status: skip_email ? 'active' : 'pending',
      })
      .select()
      .single();

    if (tokenError) {
      console.error('Error creating token:', tokenError);
      return NextResponse.json(
        { error: 'Failed to create customer access token', details: tokenError.message },
        { status: 500 }
      );
    }

    // Update quote status (only if sending email)
    if (!skip_email) {
      await supabase
        .from('quotes')
        .update({
          status: 'sent_to_customer',
          sent_to_customer_at: new Date().toISOString(),
        })
        .eq('id', quote_id);
    }

    // If skip_email is true, return token immediately without sending email
    if (skip_email) {
      return NextResponse.json({
        success: true,
        message: 'Token created successfully',
        token: token,
        expires_at: expiresAt.toISOString(),
      });
    }

    // Send email to customer
    try {
      // Format bathroom type for display
      const bathroomTypeDisplay = quote.bathroom_type
        ?.replace(/_/g, ' ')
        ?.replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Bathroom';

      await sendCustomerQuoteEmail({
        customerName: customer_name,
        customerEmail: customer_email,
        projectAddress: project_address,
        quoteName: quote.quote_name || 'Bathroom Renovation',
        bathroomType: bathroomTypeDisplay,
        laborTotal: quote.labour_grand_total || 0,
        token: token,
        expiresAt: expiresAt,
      });

      // Create notification for contractor
      await supabase
        .from('quote_notifications')
        .insert({
          quote_id: quote_id,
          contractor_user_id: user.id,
          notification_type: 'quote_sent',
          metadata: {
            customer_email: customer_email,
            sent_at: new Date().toISOString(),
          },
        });

      return NextResponse.json({
        success: true,
        message: 'Quote sent to customer successfully',
        token: token,
        expires_at: expiresAt.toISOString(),
      });

    } catch (emailError) {
      console.error('Error sending email:', emailError);

      // Email failed, but token was created - mark token as error
      await supabase
        .from('customer_quote_tokens')
        .update({ status: 'email_failed' })
        .eq('id', tokenRecord.id);

      return NextResponse.json(
        { error: 'Quote saved but failed to send email', details: emailError instanceof Error ? emailError.message : 'Unknown error' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Send quote error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send quote',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
