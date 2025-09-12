"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);
  
  // Sign up form fields
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Redirect will happen automatically via AuthProvider
      router.push('/dashboard');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!fullName.trim()) {
      setError('Full name is required');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, {
      full_name: fullName.trim(),
      company_name: companyName.trim() || undefined,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setError(null);
      setShowSignUp(false);
      // Show success message or redirect
      alert('Account created! Please check your email to verify your account.');
    }
  };

  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-navy mb-2">
            {showSignUp ? 'Create Account' : 'Contractor Login'}
          </h1>
          <p className="text-gray-600">
            {showSignUp 
              ? 'Create your contractor account to start generating quotes'
              : 'Sign in to access the CloudReno Quote App'
            }
          </p>
        </div>

        <form onSubmit={showSignUp ? handleSignUp : handleSignIn} className="space-y-6">
          {showSignUp && (
            <>
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral text-base"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral text-base"
                  placeholder="Enter your company name (optional)"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral text-base"
              placeholder="Enter your password"
              autoComplete={showSignUp ? "new-password" : "current-password"}
              minLength={showSignUp ? 6 : undefined}
            />
            {showSignUp && (
              <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-base font-semibold"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {showSignUp ? 'Creating Account...' : 'Signing In...'}
              </div>
            ) : (
              showSignUp ? 'Create Account' : 'Sign In'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setShowSignUp(!showSignUp);
              setError(null);
              setEmail('');
              setPassword('');
              setFullName('');
              setCompanyName('');
            }}
            className="text-coral hover:text-coral/80 font-medium text-sm"
          >
            {showSignUp 
              ? 'Already have an account? Sign in'
              : 'Need an account? Create one'
            }
          </button>
        </div>

        {!showSignUp && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                // TODO: Implement password reset
                alert('Password reset functionality will be implemented soon. Please contact support.');
              }}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Forgot your password?
            </button>
          </div>
        )}
      </div>
    </div>
  );
}