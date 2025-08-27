import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser, AuthService } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: { first_name?: string; last_name?: string }) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  hasRole: (accountId: string, role: 'super_admin' | 'account_admin' | 'account_user') => boolean;
  isSuperAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Defer user data fetching to prevent auth state deadlock
          setTimeout(async () => {
            const authUser = await AuthService.getCurrentUser();
            setUser(authUser);
          }, 0);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setTimeout(async () => {
          const authUser = await AuthService.getCurrentUser();
          setUser(authUser);
          setLoading(false);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await AuthService.signIn(email, password);
    return { error };
  };

  const signUp = async (email: string, password: string, metadata?: { first_name?: string; last_name?: string }) => {
    const { error } = await AuthService.signUp(email, password, metadata);
    return { error };
  };

  const signOut = async () => {
    const { error } = await AuthService.signOut();
    return { error };
  };

  const hasRole = (accountId: string, role: 'super_admin' | 'account_admin' | 'account_user') => {
    if (!user) return false;
    return user.roles.some(r => r.account_id === accountId && r.role === role);
  };

  const isSuperAdmin = () => {
    if (!user) return false;
    return user.roles.some(r => r.role === 'super_admin');
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole,
    isSuperAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}