import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendPackageSelectionConfirmation } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, package_id, package_name, pricing_snapshot, customer_notes } = body;

    // Validate required fields
    if (!token || !package_id || !package_name || !pricing_snapshot) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch and validate token
    const { data: tokenRecord, error: tokenError } = await supabase
      .from('customer_quote_tokens')
      .select('*, quotes(id, created_by)')
      .eq('token', token)
      .single();

    if (tokenError || !tokenRecord) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 404 }
      );
    }

    // Check if token is expired
    const expiresAt = new Date(tokenRecord.expires_at);
    if (new Date() > expiresAt || tokenRecord.status === 'expired') {
      return NextResponse.json(
        { error: 'Quote has expired' },
        { status: 410 }
      );
    }

    // Save package selection (will update if already exists due to UNIQUE constraint)
    const { data: selection, error: selectionError } = await supabase
      .from('customer_package_selections')
      .upsert({
        quote_id: tokenRecord.quote_id,
        token_id: tokenRecord.id,
        package_id: package_id,
        package_name: package_name,
        pricing_snapshot: pricing_snapshot,
        customer_notes: customer_notes || null,
        selected_at: new Date().toISOString()
      }, {
        onConflict: 'quote_id' // Update if selection already exists for this quote
      })
      .select()
      .single();

    if (selectionError) {
      console.error('Selection save error:', selectionError);
      return NextResponse.json(
        { error: 'Failed to save selection', details: selectionError.message },
        { status: 500 }
      );
    }

    // Update token status
    await supabase
      .from('customer_quote_tokens')
      .update({ status: 'selected' })
      .eq('id', tokenRecord.id);

    // Update quote status
    await supabase
      .from('quotes')
      .update({
        status: 'customer_viewable',
        materials_subtotal_cents: Math.round(pricing_snapshot.materials_total * 100),
        grand_total_cents: Math.round(pricing_snapshot.grand_total * 100)
      })
      .eq('id', tokenRecord.quote_id);

    // Create notification for contractor
    const quoteInfo = Array.isArray(tokenRecord.quotes) ? tokenRecord.quotes[0] : tokenRecord.quotes;
    if (quoteInfo?.created_by) {
      await supabase
        .from('quote_notifications')
        .insert({
          quote_id: tokenRecord.quote_id,
          contractor_user_id: quoteInfo.created_by,
          notification_type: 'customer_selected',
          metadata: {
            customer_name: tokenRecord.customer_name,
            package_name: package_name,
            total_cost: pricing_snapshot.grand_total,
            selected_at: new Date().toISOString()
          }
        });
    }

    // Send confirmation email to customer
    try {
      await sendPackageSelectionConfirmation(
        tokenRecord.customer_name,
        tokenRecord.customer_email,
        package_name,
        pricing_snapshot.grand_total
      );
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Package selection saved successfully',
      selection_id: selection.id
    });

  } catch (error) {
    console.error('Select package error:', error);
    return NextResponse.json(
      {
        error: 'Failed to save package selection',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
