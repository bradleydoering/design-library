import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role client for admin operations (server-side only)
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(req: NextRequest) {
  try {
    const { userId, status } = await req.json();

    if (!userId || !status) {
      return NextResponse.json({
        error: 'userId and status are required'
      }, { status: 400 });
    }

    if (!['active', 'inactive', 'pending'].includes(status)) {
      return NextResponse.json({
        error: 'Invalid status. Must be active, inactive, or pending'
      }, { status: 400 });
    }

    console.log(`Updating contractor profile status to ${status} for user:`, userId);

    const { data, error } = await supabaseServiceRole
      .from('contractor_profiles')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Profile status update error:', error);
      return NextResponse.json({
        error: `Failed to update profile status: ${error.message}`
      }, { status: 500 });
    }

    console.log(`Profile status updated to ${status} successfully for:`, data.email);
    return NextResponse.json({
      success: true,
      profile: data
    });

  } catch (error) {
    console.error('Update profile status API error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}