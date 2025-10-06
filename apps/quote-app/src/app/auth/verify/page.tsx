"use client";

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

function VerifyInfo() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">📧</div>
        <h1 className="text-2xl font-bold text-navy mb-2">Check Your Email</h1>
        <p className="text-gray-600 mb-6">
          We’ve sent you a verification link. Please open it to finish setting up your account.
        </p>
        <div className="space-y-3">
          <Button onClick={() => router.push('/login')} className="w-full">
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto mb-4"></div>
          <p className="text-navy font-semibold">Loading...</p>
        </div>
      </div>
    }>
      <VerifyInfo />
    </Suspense>
  );
}
