"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

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

    // User exists but no profile - might be still loading
    if (!profile) {
      // Give it a moment to load profile
      setTimeout(() => {
        if (!profile) {
          console.error('User has no contractor profile');
          router.push('/login?error=no-profile');
        }
      }, 2000);
      return;
    }

    // Check profile status
    if (profile.status !== 'active') {
      router.push('/account-inactive');
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
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto mb-4"></div>
          <p className="text-navy font-semibold">Authenticating...</p>
        </div>
      </div>
    );
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