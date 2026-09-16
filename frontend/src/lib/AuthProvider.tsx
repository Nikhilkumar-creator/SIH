import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { Profile, UserRole } from '../types/domain';

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isDemoUser: boolean;
  signOut: () => Promise<void>;
  loginAsDemoRole: (role: UserRole) => void;
  setManualRole: (role: UserRole) => void;
}

const DEMO_PROFILES: Record<UserRole, Profile> = {
  admin: {
    id: 'demo-admin-01',
    full_name: 'Dr. Anand Sharma (NCPOR Admin)',
    role: 'admin',
    department: 'Polar Operations & Governance',
    created_at: new Date().toISOString(),
  },
  editor: {
    id: 'demo-editor-01',
    full_name: 'Priya Narayanan (Senior Science Editor)',
    role: 'editor',
    department: 'Science Outreach & Communications',
    created_at: new Date().toISOString(),
  },
  researcher: {
    id: 'demo-researcher-01',
    full_name: 'Dr. Rajesh Patel (Lead Glaciologist)',
    role: 'researcher',
    department: 'Cryospheric Sciences & Deep Drilling',
    created_at: new Date().toISOString(),
  },
  visitor: {
    id: 'demo-visitor-01',
    full_name: 'Science Enthusiast / Student',
    role: 'visitor',
    department: 'Public Outreach Visitor',
    created_at: new Date().toISOString(),
  },
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);

  // Check localStorage for persisted demo session
  useEffect(() => {
    const savedDemoRole = localStorage.getItem('ncpor_demo_role') as UserRole | null;
    if (savedDemoRole && DEMO_PROFILES[savedDemoRole]) {
      const demoProf = DEMO_PROFILES[savedDemoRole];
      setProfile(demoProf);
      setIsDemoUser(true);
      // Create a mock session object
      setSession({
        access_token: 'demo-jwt-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'demo-refresh-token',
        user: {
          id: demoProf.id,
          email: `${savedDemoRole}@ncpor.res.in`,
          role: 'authenticated',
          aud: 'authenticated',
          created_at: demoProf.created_at || '',
          app_metadata: {},
          user_metadata: { full_name: demoProf.full_name },
        } as unknown as User,
      });
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured) {
      // Default to researcher role for convenient local testing if no demo role was selected
      loginAsDemoRole('researcher');
      setLoading(false);
      return;
    }

    // Live Supabase initialization
    let isMounted = true;
    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const currentSession = data?.session ?? null;

        if (isMounted) {
          setSession(currentSession);
          if (currentSession?.user) {
            const { data: profData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentSession.user.id)
              .maybeSingle();

            if (profData) {
              setProfile(profData as Profile);
            } else {
              setProfile({
                id: currentSession.user.id,
                full_name: currentSession.user.email || 'User',
                role: 'researcher',
              });
            }
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      if (newSession?.user) {
        const { data: profData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', newSession.user.id)
          .maybeSingle();
        if (profData) setProfile(profData as Profile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const loginAsDemoRole = (role: UserRole) => {
    localStorage.setItem('ncpor_demo_role', role);
    const demoProf = DEMO_PROFILES[role];
    setProfile(demoProf);
    setIsDemoUser(true);
    setSession({
      access_token: `demo-jwt-${role}`,
      token_type: 'bearer',
      expires_in: 86400,
      refresh_token: `demo-refresh-${role}`,
      user: {
        id: demoProf.id,
        email: `${role}@ncpor.res.in`,
        role: 'authenticated',
        aud: 'authenticated',
        created_at: demoProf.created_at || '',
        app_metadata: {},
        user_metadata: { full_name: demoProf.full_name },
      } as unknown as User,
    });
  };

  const setManualRole = (role: UserRole) => {
    loginAsDemoRole(role);
  };

  const signOut = async () => {
    localStorage.removeItem('ncpor_demo_role');
    setIsDemoUser(false);
    setProfile(null);
    setSession(null);
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Sign out error:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading,
        isDemoUser,
        signOut,
        loginAsDemoRole,
        setManualRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
