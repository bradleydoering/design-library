import { NextRequest, NextResponse } from 'next/server';

interface UniversalToggles {
  bathroomType: "Bathtub" | "Walk-in Shower" | "Tub & Shower" | "Sink & Toilet";
  wallTileCoverage: "None" | "Half way up" | "Floor to ceiling";
  bathroomSize: "small" | "normal" | "large";
  includedItems: {
    [key: string]: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { universalToggles }: { universalToggles: UniversalToggles } = await request.json();

    if (!universalToggles) {
      return NextResponse.json({ error: 'Missing universal toggles' }, { status: 400 });
    }

    // Debug logging
    console.log('=== APPLY-UNIVERSAL-TOGGLES ENDPOINT DEBUG ===');
    console.log('Received universalToggles:', JSON.stringify(universalToggles, null, 2));
    console.log('Since we use database as single source of truth, this endpoint just returns success');
    console.log('============================================');

    // Since we're using Supabase database as the single source of truth,
    // we don't need to modify static files. The database configuration
    // is already being used by the pricing calculations and UI filtering.
    // This endpoint now just returns success to maintain compatibility.
    
    return NextResponse.json({
      success: true,
      message: 'Universal toggles applied to all packages',
      packagesUpdated: 0, // Not applicable since we use database
      appliedSettings: universalToggles
    });

  } catch (error) {
    console.error('Error in apply-universal-toggles endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}