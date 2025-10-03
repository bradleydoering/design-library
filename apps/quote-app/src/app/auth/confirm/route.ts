import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')

  const next = searchParams.get('next') ?? '/dashboard'

  // Debug logging
  console.log('Auth confirm called with params:', {
    code: code ? 'present' : 'missing',
    token_hash: token_hash ? 'present' : 'missing',
    type,
    allParams: Object.fromEntries(searchParams.entries())
  })

  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next
  redirectTo.searchParams.delete('token_hash')
  redirectTo.searchParams.delete('type')
  redirectTo.searchParams.delete('code')
  redirectTo.searchParams.delete('next')

  // Handle code-based verification (Supabase default email format)
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      console.log('Email verification successful (code exchange)!')
      return NextResponse.redirect(redirectTo)
    }

    console.error('Code exchange error:', error)
    redirectTo.pathname = '/login'
    redirectTo.searchParams.set('error', 'Email link is invalid or has expired')
    return NextResponse.redirect(redirectTo)
  }

  // Handle token_hash-based verification (OTP format)
  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      console.log('Email verification successful (OTP)!')
      return NextResponse.redirect(redirectTo)
    }

    console.error('Email verification error:', error)
    redirectTo.pathname = '/login'
    redirectTo.searchParams.set('error', 'Verification failed: ' + error.message)
    return NextResponse.redirect(redirectTo)
  }

  // No valid parameters found
  console.error('Missing required parameters for email verification')
  redirectTo.pathname = '/login'
  redirectTo.searchParams.set('error', 'Invalid verification link')
  return NextResponse.redirect(redirectTo)
}
