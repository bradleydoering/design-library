import { login, signup, resetPassword } from '@/app/auth/actions'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string }
}) {
  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-navy mb-2">
            Contractor Login
          </h1>
          <p className="text-gray-600">
            Sign in to access the CloudReno Quote App
          </p>
        </div>

        {searchParams.error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{searchParams.error}</p>
          </div>
        )}

        {searchParams.message && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-800 text-sm">{searchParams.message}</p>
          </div>
        )}

        <form className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral text-base"
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral text-base"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <button
            formAction={login}
            className="w-full bg-coral text-white py-3 px-4 rounded-lg font-semibold hover:bg-coral/90 transition-colors"
          >
            Sign In
          </button>
        </form>

        <div className="mt-4 text-center">
          <details className="mt-2">
            <summary className="text-sm text-navy cursor-pointer hover:underline">
              Forgot your password?
            </summary>
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <form className="space-y-3">
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Enter your email for password reset"
                />
                <button
                  formAction={resetPassword}
                  className="w-full bg-gray-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Send Reset Email
                </button>
              </form>
            </div>
          </details>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-navy mb-4">Create Account</h2>

          <form className="space-y-4">
            <div>
              <label htmlFor="signup-full-name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="signup-full-name"
                name="full_name"
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral text-base"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="signup-company" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name (Optional)
              </label>
              <input
                id="signup-company"
                name="company_name"
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral text-base"
                placeholder="Enter company name"
              />
            </div>

            <div>
              <input
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral text-base"
                placeholder="Email address"
              />
            </div>

            <div>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral text-base"
                placeholder="Password (min 6 characters)"
              />
            </div>

            <button
              formAction={signup}
              className="w-full bg-navy text-white py-3 px-4 rounded-lg font-semibold hover:bg-navy/90 transition-colors"
            >
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
