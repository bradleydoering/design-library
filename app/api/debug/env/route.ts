import { NextResponse } from 'next/server';

// DEBUG ENDPOINT - Remove this after fixing the issue
export async function GET() {
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    // Show existence without showing the actual keys
    HAS_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    HAS_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    // Show first few chars to verify they're correct
    URL_PREFIX: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20),
    KEY_PREFIX: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20),
  };

  return NextResponse.json(envVars);
}