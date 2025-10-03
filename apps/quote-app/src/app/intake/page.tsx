import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { QuoteForm } from "@/components/QuoteForm/QuoteForm"

export default async function QuotePage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Get contractor profile
  const { data: profile } = await supabase
    .from('contractor_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login?error=' + encodeURIComponent('Profile not found'))
  }

  if (profile.status !== 'active') {
    redirect('/login?error=' + encodeURIComponent('Please verify your email to access this page'))
  }

  return <QuoteForm />
}
