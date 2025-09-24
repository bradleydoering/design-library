"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      
      if (!token || type !== 'signup') {
        setError('Invalid verification link');
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup'
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Redirect to dashboard after successful verification
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
      
      setLoading(false);
    };

    verifyEmail();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto mb-4"></div>
          <p className="text-navy font-semibold">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {success ? (
          <>
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-navy mb-2">Email Verified!</h1>
            <p className="text-gray-600 mb-6">
              Your account has been successfully verified. You will be redirected to your dashboard in a few seconds.
            </p>
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Continue to Dashboard
            </Button>
          </>
        ) : (
          <>
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-navy mb-2">Verification Failed</h1>
            <p className="text-gray-600 mb-6">
              {error || 'Unable to verify your email. The link may be expired or invalid.'}
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/login')}
                className="w-full"
              >
                Back to Login
              </Button>
              <Button 
                onClick={() => {
                  // Could implement resend verification here
                  router.push('/login');
                }}
                variant="outline"
                className="w-full"
              >
                Request New Verification Link
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}