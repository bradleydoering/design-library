import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch universal bathroom configuration from database
    const { data, error } = await supabase
      .from('universal_bath_config')
      .select('config')
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching universal config:', error);
      return NextResponse.json(
        { error: 'Failed to fetch configuration' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    // Return the config object
    return NextResponse.json(data.config);

  } catch (error) {
    console.error('Universal config API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
