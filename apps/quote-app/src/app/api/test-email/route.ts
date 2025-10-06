import { NextRequest, NextResponse } from 'next/server'
import { sendEmailVerification } from '@/lib/email-service'

export async function GET(request: NextRequest) {
  try {
    // Test email configuration
    const testEmail = 'bradley.doering@gmail.com'
    const testUrl = 'https://cloudrenovation.ca/test-verification'

    console.log('Testing SendGrid with:', {
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? 'Set' : 'Missing',
      FROM_EMAIL: process.env.FROM_EMAIL,
      testEmail,
    })

    const result = await sendEmailVerification(testEmail, testUrl)

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Test email sent successfully!' : 'Failed to send test email',
      error: result.error || null,
      config: {
        from: process.env.FROM_EMAIL,
        apiKeySet: !!process.env.SENDGRID_API_KEY,
      }
    })
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({
      success: false,
      message: 'Error testing email service',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}