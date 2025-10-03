'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { sendEmailVerification, sendPasswordReset } from '@/lib/email-service'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error('Login error:', error)
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const full_name = formData.get('full_name') as string
  const company_name = formData.get('company_name') as string || null

  // Create user account - Supabase will send verification email via SendGrid
  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
      data: {
        full_name,
        company_name,
      },
    },
  })

  if (error) {
    console.error('Signup error:', error)
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  // Check if user was created successfully
  if (!authData.user) {
    redirect('/login?error=' + encodeURIComponent('Failed to create account. Please try again.'))
  }

  // Create contractor profile (in case database trigger doesn't exist)
  // Profile will be pending until email is verified
  try {
    const { error: profileError } = await supabase
      .from('contractor_profiles')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: full_name,
        company_name: company_name,
        role: 'contractor',
        status: 'pending', // Will be set to 'active' after email verification
      })

    if (profileError) {
      // Ignore if profile already exists (database trigger may have created it)
      if (profileError.code !== '23505') { // 23505 is unique violation
        console.error('Profile creation error:', profileError)
      }
    }
  } catch (profileError) {
    console.error('Error creating contractor profile:', profileError)
    // Don't fail signup if profile creation fails - trigger might handle it
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=' + encodeURIComponent('Account created! Check your email to verify your account.'))
}

export async function signOut() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Sign out error:', error)
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  // Generate password reset token but don't let Supabase send email
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  })

  if (error) {
    console.error('Password reset error:', error)
    redirect('/login?error=' + encodeURIComponent('Failed to generate password reset. Please check if the email exists.'))
  }

  // Send password reset email ONLY via SendGrid
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?email=${encodeURIComponent(email)}`
    const emailResult = await sendPasswordReset(email, resetUrl)

    if (!emailResult.success) {
      console.error('Failed to send password reset email via SendGrid:', emailResult.error)
      redirect('/login?error=' + encodeURIComponent('Failed to send password reset email. Please try again.'))
    }
  } catch (emailError) {
    console.error('Password reset email service error:', emailError)
    redirect('/login?error=' + encodeURIComponent('Email service error. Please try again.'))
  }

  redirect('/login?message=' + encodeURIComponent('Password reset email sent! Check your inbox.'))
}