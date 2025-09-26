"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'contractor' | 'admin' | 'manager';
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requireRole,
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth to initialize

    // No user - redirect to login
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // User exists but no profile - this should not happen with proper signup
    if (!profile) {
      console.error('User authenticated but no contractor profile found');
      router.push('/login?error=no-profile');
      return;
    }

    // Check profile status
    if (profile.status !== 'active') {
      if (profile.status === 'pending') {
        router.push('/login?error=email-not-verified');
      } else {
        router.push('/account-inactive');
      }
      return;
    }

    // Check role requirement
    if (requireRole && profile.role !== requireRole) {
      router.push('/unauthorized');
      return;
    }
  }, [user, profile, loading, requireRole, redirectTo, router]);

  // Show loading while authenticating
  if (loading || (user && !profile)) {
    return <LoadingSpinner message="Authenticating..." fullScreen />;
  }

  // Show nothing while redirecting
  if (!user || !profile || profile.status !== 'active') {
    return null;
  }

  // Role check failed
  if (requireRole && profile.role !== requireRole) {
    return null;
  }

  // All checks passed - render children
  return <>{children}</>;
}