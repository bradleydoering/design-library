"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface SmartLoginFormProps {
  mode?: 'signin' | 'signup';
  redirectTo?: string;
}

export default function SmartLoginForm({ mode = 'signin', redirectTo = '/dashboard' }: SmartLoginFormProps) {
  const [currentMode, setCurrentMode] = useState(mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    content: string;
    action?: () => void;
    actionText?: string;
  } | null>(null);

  const { signIn, signUp, resetPassword } = useAuth();
  const router = useRouter();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check for remember me preference after hydration
  useEffect(() => {
    if (mounted) {
      const remembered = localStorage.getItem('cloudReno_rememberMe');
      if (remembered === 'true') {
        setRememberMe(true);
      }
    }
  }, [mounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (currentMode === 'signin') {
      const { error, errorType } = await signIn(email, password, rememberMe);

      if (error) {
        handleSignInError(error.message, errorType);
      } else {
        setMessage({
          type: 'success',
          title: 'Welcome back!',
          content: 'Redirecting to your dashboard...'
        });
        setTimeout(() => router.push(redirectTo), 1500);
      }
    } else if (currentMode === 'signup') {
      const { error, errorType } = await signUp(email, password, {
        full_name: fullName,
        company_name: companyName
      });

      if (error) {
        handleSignUpError(error.message, errorType);
      } else {
        setMessage({
          type: 'success',
          title: 'Account created successfully!',
          content: 'Please check your email for a verification link to complete your account setup.'
        });
      }
    }

    setLoading(false);
  };

  const handleSignInError = (errorMessage: string, errorType?: string) => {
    switch (errorType) {
      case 'user_not_found':
        setMessage({
          type: 'info',
          title: 'Account not found',
          content: `We don't have an account with ${email}. Would you like to create one?`,
          action: () => {
            setCurrentMode('signup');
            setMessage(null);
          },
          actionText: 'Create Account'
        });
        break;

      case 'invalid_credentials':
        setMessage({
          type: 'error',
          title: 'Incorrect password',
          content: 'The password you entered is incorrect. Forgot your password?',
          action: () => setShowPasswordReset(true),
          actionText: 'Reset Password'
        });
        break;

      case 'email_not_verified':
        setMessage({
          type: 'info',
          title: 'Email not verified',
          content: 'Please check your email and click the verification link before signing in.',
          action: () => handleResendVerification(),
          actionText: 'Resend Email'
        });
        break;

      case 'rate_limited':
        setMessage({
          type: 'error',
          title: 'Too many attempts',
          content: 'Please wait a few minutes before trying again.'
        });
        break;

      default:
        setMessage({
          type: 'error',
          title: 'Sign-in failed',
          content: errorMessage
        });
    }
  };

  const handleSignUpError = (errorMessage: string, errorType?: string) => {
    switch (errorType) {
      case 'user_exists':
        setMessage({
          type: 'info',
          title: 'Account already exists',
          content: `An account with ${email} already exists. Would you like to sign in instead?`,
          action: () => {
            setCurrentMode('signin');
            setMessage(null);
          },
          actionText: 'Sign In'
        });
        break;

      case 'weak_password':
        setMessage({
          type: 'error',
          title: 'Password too weak',
          content: 'Please choose a stronger password with at least 8 characters.'
        });
        break;

      case 'invalid_email':
        setMessage({
          type: 'error',
          title: 'Invalid email',
          content: 'Please enter a valid email address.'
        });
        break;

      case 'rate_limited':
        setMessage({
          type: 'error',
          title: 'Too many attempts',
          content: 'Please wait a few minutes before trying again.'
        });
        break;

      default:
        setMessage({
          type: 'error',
          title: 'Sign-up failed',
          content: errorMessage
        });
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setMessage({
        type: 'error',
        title: 'Email required',
        content: 'Please enter your email address first.'
      });
      return;
    }

    setLoading(true);
    const { error, errorType } = await resetPassword(email);

    if (error) {
      if (errorType === 'user_not_found') {
        setMessage({
          type: 'info',
          title: 'Account not found',
          content: `We don't have an account with ${email}. Would you like to create one?`,
          action: () => {
            setCurrentMode('signup');
            setShowPasswordReset(false);
            setMessage(null);
          },
          actionText: 'Create Account'
        });
      } else {
        setMessage({
          type: 'error',
          title: 'Reset failed',
          content: error.message
        });
      }
    } else {
      setMessage({
        type: 'success',
        title: 'Reset email sent!',
        content: `Check your email at ${email} for password reset instructions.`
      });
      setShowPasswordReset(false);
    }

    setLoading(false);
  };

  const handleResendVerification = async () => {
    if (!email) {
      setMessage({
        type: 'error',
        title: 'Email required',
        content: 'Please enter your email address first.'
      });
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to resend verification email');
      }
      setMessage({
        type: 'info',
        title: 'Verification email resent',
        content: `Check your inbox at ${email} for a new verification link.`
      });
    } catch (err) {
      setMessage({
        type: 'error',
        title: 'Resend failed',
        content: err instanceof Error ? err.message : 'Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (showPasswordReset) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-navy mb-2">Reset Password</h1>
            <p className="text-gray-600">Enter your email to receive reset instructions</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handlePasswordReset(); }}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            {message && (
              <div className={`mb-4 p-4 rounded-lg ${
                message.type === 'success' ? 'bg-green-50 border border-green-200' :
                message.type === 'error' ? 'bg-red-50 border border-red-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <h3 className={`font-semibold ${
                  message.type === 'success' ? 'text-green-800' :
                  message.type === 'error' ? 'text-red-800' :
                  'text-blue-800'
                }`}>
                  {message.title}
                </h3>
                <p className={`text-sm mt-1 ${
                  message.type === 'success' ? 'text-green-700' :
                  message.type === 'error' ? 'text-red-700' :
                  'text-blue-700'
                }`}>
                  {message.content}
                </p>
                {message.action && (
                  <button
                    onClick={message.action}
                    className={`mt-2 text-sm font-medium underline ${
                      message.type === 'success' ? 'text-green-800' :
                      message.type === 'error' ? 'text-red-800' :
                      'text-blue-800'
                    }`}
                  >
                    {message.actionText}
                  </button>
                )}
              </div>
            )}

            <div className="space-y-3">
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Sending...' : 'Send Reset Email'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPasswordReset(false);
                  setMessage(null);
                }}
                className="w-full"
              >
                Back to Sign In
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-navy mb-2">
            {currentMode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-600">
            {currentMode === 'signin'
              ? 'Sign in to access your contractor dashboard'
              : 'Join CloudReno as a contractor'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {currentMode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent"
                    placeholder="Enter your company name"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent"
                placeholder="Enter your password"
                required
                minLength={currentMode === 'signup' ? 8 : undefined}
              />
              {currentMode === 'signup' && (
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 characters long
                </p>
              )}
            </div>

            {currentMode === 'signin' && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-coral focus:ring-coral border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Remember me on this device
                </label>
              </div>
            )}
          </div>

          {message && (
            <div className={`mt-4 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 border border-green-200' :
              message.type === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              <h3 className={`font-semibold ${
                message.type === 'success' ? 'text-green-800' :
                message.type === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {message.title}
              </h3>
              <p className={`text-sm mt-1 ${
                message.type === 'success' ? 'text-green-700' :
                message.type === 'error' ? 'text-red-700' :
                'text-blue-700'
              }`}>
                {message.content}
              </p>
              {message.action && (
                <button
                  onClick={message.action}
                  className={`mt-2 text-sm font-medium underline ${
                    message.type === 'success' ? 'text-green-800' :
                    message.type === 'error' ? 'text-red-800' :
                    'text-blue-800'
                  }`}
                >
                  {message.actionText}
                </button>
              )}
            </div>
          )}

          <div className="mt-6 space-y-3">
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Processing...' : (currentMode === 'signin' ? 'Sign In' : 'Create Account')}
            </Button>

            {currentMode === 'signin' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordReset(true)}
                className="w-full"
              >
                Forgot Password?
              </Button>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setCurrentMode(currentMode === 'signin' ? 'signup' : 'signin');
                  setMessage(null);
                }}
                className="text-sm text-coral hover:text-coral/80 font-medium"
              >
                {currentMode === 'signin'
                  ? "Don't have an account? Create one"
                  : 'Already have an account? Sign in'
                }
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
