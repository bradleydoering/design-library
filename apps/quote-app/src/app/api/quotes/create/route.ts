import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      quote_name,
      customer_name,
      customer_email,
      customer_phone,
      project_address,
      bathroom_type,
      building_type,
      year_built,
      floor_sqft,
      wet_wall_sqft,
      vanity_width,
      labour_grand_total,
      labour_subtotal_cents,
      materials_subtotal_cents,
      grand_total_cents,
      package_id,
      package_name,
    } = body;

    // Validate required fields
    if (!customer_name || !project_address || !bathroom_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Get user's org_id
    const { data: orgData, error: orgError } = await supabase.rpc('get_user_org_id');
    if (orgError || !orgData) {
      return NextResponse.json(
        { error: 'Failed to get organization' },
        { status: 500 }
      );
    }

    // Create or get project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        org_id: orgData,
        customer_id: null, // We'll create customer records later if needed
        name: quote_name || 'Bathroom Renovation',
        address: { full_address: project_address },
        building_type: building_type || 'house',
      })
      .select()
      .single();

    if (projectError) {
      console.error('Project creation error:', JSON.stringify(projectError, null, 2));
      return NextResponse.json(
        { error: 'Failed to create project', details: projectError.message, code: projectError.code },
        { status: 500 }
      );
    }

    // Generate quote number (simple sequential for now)
    const quoteNumber = `Q-${Date.now()}`;

    // Create quote
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        org_id: orgData,
        project_id: project.id,
        quote_number: quoteNumber,
        status: 'draft',
        quote_name: quote_name,
        bathroom_type: bathroom_type,
        building_type: building_type,
        year_built: year_built,
        floor_sqft: floor_sqft,
        wet_wall_sqft: wet_wall_sqft,
        vanity_width: vanity_width,
        labour_grand_total: labour_grand_total,
        labour_subtotal_cents: labour_subtotal_cents || 0,
        materials_subtotal_cents: materials_subtotal_cents || 0,
        grand_total_cents: grand_total_cents || 0,
        created_by: user.id,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      })
      .select()
      .single();

    if (quoteError) {
      console.error('Quote creation error:', JSON.stringify(quoteError, null, 2));
      return NextResponse.json(
        { error: 'Failed to create quote', details: quoteError.message, code: quoteError.code },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      quote_id: quote.id,
      quote_number: quote.quote_number,
    });

  } catch (error) {
    console.error('Quote creation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create quote',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
