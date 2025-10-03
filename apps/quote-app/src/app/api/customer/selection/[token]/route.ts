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

    // Fetch token with selection data
    const { data: tokenRecord, error: tokenError } = await supabase
      .from('customer_quote_tokens')
      .select(`
        *,
        customer_package_selections (
          package_name,
          pricing_snapshot,
          selected_at
        )
      `)
      .eq('token', token)
      .single();

    if (tokenError || !tokenRecord) {
      return NextResponse.json(
        { error: 'Selection not found' },
        { status: 404 }
      );
    }

    // Check if customer has made a selection
    const selections = Array.isArray(tokenRecord.customer_package_selections)
      ? tokenRecord.customer_package_selections
      : tokenRecord.customer_package_selections ? [tokenRecord.customer_package_selections] : [];

    if (selections.length === 0) {
      return NextResponse.json(
        { error: 'No package selection found' },
        { status: 404 }
      );
    }

    const selection = selections[0];
    const pricing = selection.pricing_snapshot;

    return NextResponse.json({
      customer_name: tokenRecord.customer_name,
      customer_email: tokenRecord.customer_email,
      project_address: tokenRecord.project_address,
      package_name: selection.package_name,
      pricing_snapshot: {
        package_id: pricing.package_id || '',
        package_name: pricing.package_name || selection.package_name,
        materials_total: pricing.materials_total || 0,
        labor_total: pricing.labor_total || 0,
        grand_total: pricing.grand_total || 0,
        is_estimate: pricing.is_estimate || false
      },
      selected_at: selection.selected_at
    });

  } catch (error) {
    console.error('Selection fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to load selection',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
