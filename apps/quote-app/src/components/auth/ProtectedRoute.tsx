"use client";

import { useEffect, useState } from 'react';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || loading) return; // Wait for mount and auth to initialize

    // No user - redirect to login
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // User exists but no profile: allow AuthContext to ensure/create profile
    if (!profile) {
      // Stay on page and let upstream logic populate profile
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

  // Ensure identical SSR/first CSR markup to avoid hydration mismatch
  if (!mounted) {
    return <div data-booting />;
  }
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
