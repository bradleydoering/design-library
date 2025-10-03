import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Dashboard() {
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
    redirect('/login?error=' + encodeURIComponent('Account not active'))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard
              </h1>
              <p className="text-gray-600">Welcome back, {profile.full_name}</p>
              {profile.company_name && (
                <p className="text-sm text-gray-500">{profile.company_name}</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 capitalize">
                {profile.role}
              </span>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Quote App Dashboard
              </h2>
              <p className="text-gray-600 mb-6">
                Welcome to your contractor dashboard. Your authentication system has been rebuilt and simplified!
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <Link
                    href="/intake"
                    className="bg-coral text-white px-6 py-3 rounded-lg font-medium hover:bg-coral/90 transition-colors block text-center"
                  >
                    Create Quote
                  </Link>
                  <Link
                    href="/quotes"
                    className="bg-navy text-white px-6 py-3 rounded-lg font-medium hover:bg-navy/90 transition-colors block text-center"
                  >
                    View Quotes
                  </Link>
                  <Link
                    href="/admin/rate-cards"
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors block text-center"
                  >
                    Rate Cards
                  </Link>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  User ID: {user.id}<br />
                  Email: {user.email}<br />
                  Profile Status: {profile.status}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}