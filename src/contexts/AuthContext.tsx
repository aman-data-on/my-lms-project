import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { pushLoginHistory } from '../lib/reportData';

interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  employee_id: string;
  department: string;
  job_title: string;
  avatar_url: string | null;
  onboarding_batch: string | null;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (data: SignUpData) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface SignUpData {
  full_name: string;
  employee_id: string;
  department: string;
  job_title: string;
  email: string;
  password: string;
}

const RESERVED_EMAILS = ['admin@company.com', 'alex.johnson@company.com'];

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (data && !error) {
      setUser(data as AuthUser);
      // setCurrentUser(data as AuthUser);
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener first, before any async work
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    const init = async () => {
      // Seed admin and demo accounts via edge function (server-side, no session side-effects)
      try {
        const { data: { session: existing } } = await supabase.auth.getSession();
        // Only seed if nobody is currently logged in to avoid disrupting active sessions
        if (!existing) {
          const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
          await fetch(`${supabaseUrl}/functions/v1/seed-users`, { method: 'POST' });
        }
      } catch {
        // Seeding is best-effort — never block login
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    init();

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
        return { error: 'Incorrect email or password. Please double-check and try again.' };
      }
      if (msg.includes('email not confirmed')) {
        return { error: 'Your email address has not been confirmed. Please check your inbox or contact support.' };
      }
      if (msg.includes('too many requests')) {
        return { error: 'Too many login attempts. Please wait a moment and try again.' };
      }
      return { error: error.message };
    }
    if (data.user) {
      pushLoginHistory(data.user.id);
    }
    return { error: null };
  };

  const signUp = async (data: SignUpData) => {
    if (RESERVED_EMAILS.includes(data.email.toLowerCase())) {
      return { error: 'This email address is reserved. Please use a different email.' };
    }

    const { error: authError, data: authData } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    if (authError) {
      if (authError.message.toLowerCase().includes('user already registered')) {
        return { error: 'An account with this email already exists. Please sign in instead.' };
      }
      return { error: authError.message };
    }
    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        full_name: data.full_name,
        employee_id: data.employee_id,
        department: data.department,
        job_title: data.job_title,
        email: data.email,
        role: 'employee',
        onboarding_batch: `Batch ${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}`,
      });
      if (profileError) return { error: profileError.message };
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshUser = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
