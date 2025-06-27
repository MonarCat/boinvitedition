import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  country?: string;
}

interface AuthResponse {
  data: { user: User | null; session: Session | null; } | { user: null; session: null; };
  error: AuthError | null;
}

interface ResetPasswordResponse {
  data: Record<string, never>;
  error: AuthError | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, profile?: UserProfile) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<ResetPasswordResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    console.log('Setting up auth state listener...');

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (event === 'INITIAL_SESSION') {
        console.log('Initial session loaded:', session?.user?.email);
      } else if (event === 'SIGNED_IN') {
        console.log('User signed in:', session?.user?.email);
        if (session?.user && !session.user.email_confirmed_at) {
          console.log('User signed in but email not confirmed yet');
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      }
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, profile?: UserProfile): Promise<AuthResponse> => {
    setLoading(true);
    try {
      console.log('Attempting sign up for:', email, 'with profile:', profile);
      
      const redirectUrl = `${window.location.origin}/`;
      
      // Use Supabase's default email confirmation flow
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: profile ? {
            first_name: profile.firstName,
            last_name: profile.lastName,
            country: profile.country,
          } : undefined,
        },
      });
      
      console.log('Sign up result:', { data, error });
      
      if (error) {
        console.error('Sign up error:', error);
        return { data, error };
      }

      if (data.user && !data.session) {
        console.log('User created successfully, confirmation email sent to:', email);
      }

      return { data, error };
    } catch (error) {
      console.error('Unexpected error in signUp:', error);
      return { data: { user: null, session: null }, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    setLoading(true);
    try {
      console.log('Attempting sign in for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('Sign in result:', { data, error });
      
      if (error) {
        console.error('Sign in error:', error);
        // Enhanced error handling
        if (error.message.includes('Invalid login credentials')) {
          error.message = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          error.message = 'Please check your email and click the confirmation link before signing in.';
        } else if (error.message.includes('Too many requests')) {
          error.message = 'Too many sign-in attempts. Please wait a moment and try again.';
        } else if (error.message.includes('User not found')) {
          error.message = 'No account found with this email address. Please sign up first.';
        }
        return { data, error };
      }

      if (data.user && data.session) {
        console.log('Sign in successful for:', data.user.email);
      }

      return { data, error };
    } catch (error) {
      console.error('Unexpected error in signIn:', error);
      return { data: { user: null, session: null }, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      console.log('Attempting sign out');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('Sign out successful');
    } catch (error) {
      console.error('Error in signOut:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<ResetPasswordResponse> => {
    try {
      console.log('Attempting password reset for:', email);
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });
      console.log('Password reset result:', { data, error });
      if (error) {
        return { data: {}, error };
      }
      return { data: data || {}, error };
    } catch (error) {
      console.error('Error in resetPassword:', error);
      return { data: {}, error: error as AuthError };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
