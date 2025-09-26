"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

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
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: { full_name: string; company_name?: string }) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
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
          fetchProfile(currentSession.user.id).then(contractorProfile => {
            if (mounted) {
              setProfile(contractorProfile);
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

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  // Sign up function
  const signUp = async (
    email: string,
    password: string,
    userData: { full_name: string; company_name?: string }
  ) => {
    try {
      // Create user account (they won't be able to sign in until verified)
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/auth/verify`,
        },
      });

      if (signUpError) {
        return { error: signUpError };
      }

      // Create contractor profile if user was created successfully
      if (authData.user && !authData.user.email_confirmed_at) {
        try {
          const { error: profileError } = await supabase
            .from('contractor_profiles')
            .insert({
              id: authData.user.id,
              email: email,
              full_name: userData.full_name,
              company_name: userData.company_name || null,
              role: 'contractor',
              status: 'pending', // Set to pending until email verified
            });

          if (profileError) {
            console.error('Failed to create contractor profile:', profileError);
            // Don't fail signup, profile can be created later
          }
        } catch (profileCreationError) {
          console.error('Error creating contractor profile:', profileCreationError);
          // Don't fail signup, profile can be created later
        }
      }

      // Verification email is automatically sent by Supabase
      // User will receive email and can resend if needed via the login form

      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error };
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
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};