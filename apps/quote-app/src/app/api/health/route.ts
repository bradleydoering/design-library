import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Check database connectivity
    const { error: dbError } = await supabase
      .from('rate_lines')
      .select('count')
      .limit(1);

    if (dbError) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          checks: {
            database: 'fail',
            error: dbError.message
          }
        },
        { status: 503 }
      );
    }

    // All checks passed
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'pass',
        server: 'pass'
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
        checks: {
          database: 'fail',
          server: 'fail'
        }
      },
      { status: 503 }
    );
  }
}

export const dynamic = 'force-dynamic';