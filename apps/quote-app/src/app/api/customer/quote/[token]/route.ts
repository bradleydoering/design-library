import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token || token.length < 32) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch token record with quote data
    const { data: tokenRecord, error: tokenError } = await supabase
      .from('customer_quote_tokens')
      .select(`
        *,
        quotes (
          id,
          quote_name,
          bathroom_type,
          building_type,
          year_built,
          floor_sqft,
          wet_wall_sqft,
          labour_grand_total
        )
      `)
      .eq('token', token)
      .single();

    if (tokenError || !tokenRecord) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Check if token is expired
    const expiresAt = new Date(tokenRecord.expires_at);
    const now = new Date();

    if (now > expiresAt || tokenRecord.status === 'expired') {
      // Update status if not already marked as expired
      if (tokenRecord.status !== 'expired') {
        await supabase
          .from('customer_quote_tokens')
          .update({ status: 'expired' })
          .eq('id', tokenRecord.id);
      }

      return NextResponse.json(
        { error: 'Quote has expired' },
        { status: 410 } // 410 Gone - indicates the resource is no longer available
      );
    }

    // Update accessed_at timestamp and status to 'viewed'
    const isFirstView = !tokenRecord.accessed_at;
    await supabase
      .from('customer_quote_tokens')
      .update({
        accessed_at: new Date().toISOString(),
        status: tokenRecord.status === 'pending' ? 'viewed' : tokenRecord.status
      })
      .eq('id', tokenRecord.id);

    // Create notification for contractor on first view
    if (isFirstView) {
      const { data: quote } = await supabase
        .from('quotes')
        .select('created_by')
        .eq('id', tokenRecord.quote_id)
        .single();

      if (quote?.created_by) {
        await supabase
          .from('quote_notifications')
          .insert({
            quote_id: tokenRecord.quote_id,
            contractor_user_id: quote.created_by,
            notification_type: 'customer_viewed',
            metadata: {
              customer_name: tokenRecord.customer_name,
              viewed_at: new Date().toISOString()
            }
          });
      }
    }

    // Return quote data
    const quoteInfo = Array.isArray(tokenRecord.quotes) ? tokenRecord.quotes[0] : tokenRecord.quotes;

    return NextResponse.json({
      quote_id: tokenRecord.quote_id,
      quote_name: quoteInfo?.quote_name || 'Bathroom Renovation',
      customer_name: tokenRecord.customer_name,
      project_address: tokenRecord.project_address,
      bathroom_type: quoteInfo?.bathroom_type || '',
      building_type: quoteInfo?.building_type || '',
      year_built: quoteInfo?.year_built || '',
      floor_sqft: quoteInfo?.floor_sqft || 0,
      wet_wall_sqft: quoteInfo?.wet_wall_sqft || 0,
      labour_grand_total: quoteInfo?.labour_grand_total || 0,
      expires_at: tokenRecord.expires_at,
      status: tokenRecord.status,
      token_status: tokenRecord.status,
    });

  } catch (error) {
    console.error('Customer quote fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to load quote',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
