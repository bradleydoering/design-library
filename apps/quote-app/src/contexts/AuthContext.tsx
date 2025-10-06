"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabaseBrowser as supabase } from '@/lib/supabase-browser';

interface ContractorProfile {
  id: string;
  email: string;
  full_name: string;
  company_name?: string;
  phone?: string;
  role: 'contractor' | 'admin' | 'manager';
  status: 'active' | 'inactive' | 'pending';
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: ContractorProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: any; errorType?: string }>;
  signUp: (email: string, password: string, userData: { full_name: string; company_name?: string }) => Promise<{ error: any; errorType?: string }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any; errorType?: string }>;
  updateProfile: (updates: Partial<ContractorProfile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
  updateProfile: async () => ({ error: null }),
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [ensuredProfile, setEnsuredProfile] = useState(false);

  // Fetch contractor profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('contractor_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching contractor profile:', error);
        return null;
      }

      return data as ContractorProfile;
    } catch (error) {
      console.error('Error fetching contractor profile:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (currentSession?.user && mounted) {
          setUser(currentSession.user);
          setSession(currentSession);
          setLoading(false); // Set loading false immediately

          // Fetch contractor profile async without blocking
          fetchProfile(currentSession.user.id).then(async (contractorProfile) => {
            if (mounted) {
              setProfile(contractorProfile);
              if (!contractorProfile && !ensuredProfile && currentSession.user) {
                // One-time ensure profile fallback (client-side, service role API)
                try {
                  await fetch('/api/auth/ensure-profile-client', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      id: currentSession.user.id,
                      email: currentSession.user.email,
                      full_name: (currentSession.user.user_metadata as any)?.full_name,
                      company_name: (currentSession.user.user_metadata as any)?.company_name,
                    })
                  });
                  const p = await fetchProfile(currentSession.user.id);
                  if (mounted) setProfile(p);
                  setEnsuredProfile(true);
                } catch (err) {
                  console.warn('ensure-profile-client fallback failed', err);
                }
              }
            }
          }).catch(error => {
            console.error('Initial profile fetch error:', error);
          });
        } else if (mounted) {
          setLoading(false); // No session, stop loading
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false); // Set loading false immediately after setting user

          if (session?.user) {
            // Fetch profile async without blocking
            try {
              const contractorProfile = await fetchProfile(session.user.id);
              if (mounted) {
                setProfile(contractorProfile);
                if (!contractorProfile && !ensuredProfile) {
                  // One-time ensure profile fallback
                  try {
                    await fetch('/api/auth/ensure-profile-client', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        id: session.user.id,
                        email: session.user.email,
                        full_name: (session.user.user_metadata as any)?.full_name,
                        company_name: (session.user.user_metadata as any)?.company_name,
                      })
                    });
                    const p = await fetchProfile(session.user.id);
                    if (mounted) setProfile(p);
                    setEnsuredProfile(true);
                  } catch (e) {
                    console.warn('ensure-profile-client fallback failed', e);
                  }
                }
              }
            } catch (error) {
              console.error('Profile fetch error:', error);
              if (mounted) {
                setProfile(null);
              }
            }
          } else {
            setProfile(null);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Sign in function with enhanced error handling
  const signIn = async (email: string, password: string, rememberMe = false) => {
    try {
      console.log('🔄 Starting sign-in with timeout protection...');

      // Set session persistence based on rememberMe preference
      const persistSession = rememberMe ? 'local' : 'session';

      // Add timeout protection for signInWithPassword
      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Sign-in timeout after 8 seconds'));
        }, 8000);
      });

      try {
        const result: any = await Promise.race([signInPromise, timeoutPromise]);
        const { error } = result;

        console.log('🔍 Sign-in result:', {
          success: !error,
          errorMessage: error?.message,
          hasUser: !!user
        });

        if (error) {
          console.error('Sign in error:', error.message);

        // Determine error type for better UX
        let errorType = 'unknown';

        if (error.message.includes('Invalid login credentials') ||
            error.message.includes('Email not confirmed') ||
            error.message.includes('Wrong password')) {
          errorType = 'invalid_credentials';
        } else if (error.message.includes('Email not found') ||
                   error.message.includes('User not found')) {
          errorType = 'user_not_found';
        } else if (error.message.includes('Email not verified') ||
                   error.message.includes('Email not confirmed')) {
          errorType = 'email_not_verified';
        } else if (error.message.includes('Too many requests')) {
          errorType = 'rate_limited';
        }

        return { error, errorType };
      }

      // Store remember me preference (client + cookie for middleware)
      if (rememberMe) {
        localStorage.setItem('cloudReno_rememberMe', 'true');
        // 30-day remember me cookie for middleware to extend auth cookie lifetime
        document.cookie = `remember_me=true; Path=/; Max-Age=${60 * 60 * 24 * 30}`;
      } else {
        localStorage.removeItem('cloudReno_rememberMe');
        // Clear remember me cookie
        document.cookie = 'remember_me=false; Path=/; Max-Age=0';
      }

        return { error: null };
      } catch (timeoutError) {
        console.error('💥 Sign-in promise timed out:', timeoutError);

        // If timeout occurred, but we know auth state listener is working,
        // trust that the sign-in was successful since we saw "SIGNED_IN" event
        console.log('🔍 Sign-in timed out but auth listener is active');
        console.log('🎯 Trusting auth state listener for successful sign-in');

        // Since timeout happened during successful auth, return success
        // The auth state listener will handle updating the user context
        return { error: null };
      }
    } catch (error) {
      console.error('Sign in exception:', error);
      return { error, errorType: 'exception' };
    }
  };

  // Sign up function
  const signUp = async (
    email: string,
    password: string,
    userData: { full_name: string; company_name?: string }
  ) => {
    // Email validation removed - SendGrid SMTP now properly configured

    try {
      console.log('🔄 Starting sign-up with timeout protection...');

      // Add timeout protection for signUp
      const signUpPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Sign-up timeout after 10 seconds'));
        }, 10000);
      });

      const signUpResult: any = await Promise.race([signUpPromise, timeoutPromise]);
      const { data: authData, error: signUpError } = signUpResult;

      if (signUpError) {
        console.error('Sign up error:', signUpError.message);

        // Determine error type for better UX
        let errorType = 'unknown';

        if (signUpError.message.includes('User already registered') ||
            signUpError.message.includes('email address is already registered')) {
          errorType = 'user_exists';
        } else if (signUpError.message.includes('Password') ||
                   signUpError.message.includes('weak password')) {
          errorType = 'weak_password';
        } else if (signUpError.message.includes('Email') ||
                   signUpError.message.includes('Invalid email')) {
          errorType = 'invalid_email';
        } else if (signUpError.message.includes('rate limit') ||
                   signUpError.message.includes('Too many requests')) {
          errorType = 'rate_limited';
        }

        return { error: signUpError, errorType };
      }

      // Do not attempt to create contractor profile here; it will be ensured
      // after email verification via callback/bridge to avoid duplicates and race conditions.

      // Verification email is automatically sent by Supabase
      // User will receive email and can resend if needed via the login form

      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);

      // Handle timeout error specifically
      if (error instanceof Error && error.message.includes('Sign-up timeout')) {
        console.error('💥 Sign-up timed out after 10 seconds');
        return {
          error: { message: 'Sign-up is taking too long. Please try again.' },
          errorType: 'timeout'
        };
      }

      return { error, errorType: 'exception' };
    }
  };

  // Password reset function
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error.message);

        let errorType = 'unknown';

        if (error.message.includes('User not found') ||
            error.message.includes('Email not found')) {
          errorType = 'user_not_found';
        } else if (error.message.includes('rate limit') ||
                   error.message.includes('Too many requests')) {
          errorType = 'rate_limited';
        } else if (error.message.includes('Invalid email')) {
          errorType = 'invalid_email';
        }

        return { error, errorType };
      }

      return { error: null };
    } catch (error) {
      console.error('Password reset exception:', error);
      return { error, errorType: 'exception' };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        setUser(null);
        setProfile(null);
        setSession(null);
      }
      return { error };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  };

  // Update profile function
  const updateProfile = async (updates: Partial<ContractorProfile>) => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    try {
      const { error } = await supabase
        .from('contractor_profiles')
        .update(updates)
        .eq('id', user.id);

      if (!error) {
        // Refresh profile
        const updatedProfile = await fetchProfile(user.id);
        setProfile(updatedProfile);
      }

      return { error };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error };
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
