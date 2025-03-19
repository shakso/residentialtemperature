import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  role?: 'read_only' | 'regular' | 'superuser';
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  const initAuth = async () => {
    try {
      setLoading(true);
      await supabase.auth.initialize();
    } catch (err) {
      console.error('Error initializing auth:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle auth state changes
  const handleAuthStateChange = (event: string, session: any) => {
    if (event === 'SIGNED_IN' && session) {
      setUser({
        id: session.user.id,
        email: session.user.email || '',
        role: session.user.user_metadata?.role || 'regular',
        first_name: session.user.user_metadata?.first_name,
        last_name: session.user.user_metadata?.last_name
      });
      setToken(session.access_token);
    } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
      setUser(null);
      setToken(null);
    } else if (event === 'TOKEN_REFRESHED' && session) {
      setToken(session.access_token);
    }
  };

  useEffect(() => {
    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      handleAuthStateChange(event, session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Try to sign in with retries
      let attempts = 0;
      const maxAttempts = 3;
      let lastError;

      while (attempts < maxAttempts) {
        try {
          const { data: { session }, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (error) {
            throw error;
          }

          if (!session?.user) {
            throw new Error('Invalid login credentials');
          }

          // Success - update state and return
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role: session.user.user_metadata?.role || 'regular',
            first_name: session.user.user_metadata?.first_name,
            last_name: session.user.user_metadata?.last_name
          });
          setToken(session.access_token);
          return;
        } catch (err: any) {
          lastError = err;
          if (err.message === 'Invalid login credentials') {
            // Don't retry for invalid credentials
            throw err;
          }
          attempts++;
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
            continue;
          }
        }
      }

      // If we get here, all attempts failed
      throw new Error(lastError?.message || 'Network error. Please try again.');
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setUser(null);
    setToken(null);
    await supabase.auth.signOut();
  };

  const value = {
    user,
    token,
    signIn,
    signOut: handleSignOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
