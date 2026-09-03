import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { tokenStorage, StoredUser } from '@/lib/tokenStorage';
import { apiService } from '@/services/api';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

/**
 * AuthContext powered by Supabase Auth.
 *
 * Tokens, refresh, and session persistence are handled by supabase-js.
 * The local backend receives the Supabase JWT in the Authorization header,
 * verifies it against the project's JWKS, and resolves the local User row
 * (which carries the role assignment used for backend authorization).
 *
 * We still keep tokenStorage around so api.ts can read the current token
 * synchronously — supabase.auth.getSession() is async — but it's only a
 * cache of what Supabase already owns.
 */
interface AuthContextType {
  isAuthenticated: boolean;
  user: StoredUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    name: string;
    phoneNumber?: string;
  }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  /** True only during in-flight actions (login, register, logout). Components
   *  should use this for "Sign in" button busy spinners, NOT for gating
   *  whole-page rendering — toggling it would unmount the form mid-submit. */
  loading: boolean;
  /** True until the very first session-check completes. Use this for full-page
   *  spinners and to delay routing decisions in ProtectedRoute. Goes false
   *  once we know whether the user has a session (regardless of result). */
  initializing: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Default a Supabase user to CUSTOMER. The local backend authoritatively
 * stamps the real role on first auth (admin can promote via DB / future UI).
 * We rehydrate the real role by calling /api/auth/me after authenticating.
 */
function supabaseUserToStored(u: SupabaseUser, fallbackRole: StoredUser['role'] = 'CUSTOMER'): StoredUser {
  const meta = u.user_metadata || {};
  return {
    email: u.email || '',
    name: (meta.full_name as string) || (meta.name as string) || u.email || 'User',
    phoneNumber: (meta.phone as string) || '',
    role: fallbackRole,
  };
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false);       // in-flight actions
  const [initializing, setInitializing] = useState<boolean>(true); // first session check
  const [error, setError] = useState<string | null>(null);

  // Apply a Supabase session to local state. Resolves the real role from
  // /api/auth/me BEFORE setting user state, so components like ProtectedRoute
  // never see the CUSTOMER fallback role for what is actually an ADMIN user.
  const applySession = async (session: Session | null) => {
    if (!session || !session.user) {
      tokenStorage.clearSession();
      setUser(null);
      setIsAuthenticated(false);
      return;
    }
    const baseUser = supabaseUserToStored(session.user);
    const expiresInSec = session.expires_at
      ? Math.max(60, session.expires_at - Math.floor(Date.now() / 1000))
      : 3600;
    // Store the token first so api.ts can authenticate the /me call.
    tokenStorage.storeSession(session.access_token, 'Bearer', baseUser, expiresInSec);

    // Resolve role from backend before publishing user state. If /me fails
    // (network blip, backend down) we fall back to the Supabase-derived
    // CUSTOMER profile so the app stays usable.
    let finalUser: StoredUser = baseUser;
    try {
      const me = await apiService.getCurrentUser();
      if (me && me.role) {
        finalUser = { ...baseUser, ...me };
        tokenStorage.updateUserData(finalUser);
      }
    } catch (err) {
      console.warn('[auth] /api/auth/me lookup failed; using Supabase fallback', err);
    }

    setUser(finalUser);
    setIsAuthenticated(true);
  };

  useEffect(() => {
    let mounted = true;
    setInitializing(true);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      applySession(session).finally(() => mounted && setInitializing(false));
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        // INITIAL_SESSION is already handled by getSession() above.
        if (event === 'INITIAL_SESSION') return;
        // For SIGNED_IN / SIGNED_OUT / TOKEN_REFRESHED / USER_UPDATED, just
        // re-apply the session quietly. Don't toggle a loading flag — that
        // would unmount in-flight forms (the wrong-password Alert race).
        applySession(session);
      }
    );

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
      await applySession(data.session);
    } catch (e: any) {
      const msg = e?.message || 'Login failed';
      setError(msg);
      throw new Error(msg, { cause: e });
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    phoneNumber?: string;
  }): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.name,
            phone: userData.phoneNumber || '',
          },
        },
      });
      if (err) throw err;
      // If email confirmation is enabled in Supabase, session will be null
      // until the user clicks the link. Don't fail — just leave them at the
      // current screen with a hint.
      if (data.session) {
        await applySession(data.session);
      } else {
        setError('Check your email to confirm your account.');
      }
    } catch (e: any) {
      const msg = e?.message || 'Registration failed';
      setError(msg);
      throw new Error(msg, { cause: e });
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    setError(null);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (err) {
      setError(err.message);
      throw new Error(err.message);
    }
  };

  const refreshUser = async (): Promise<void> => {
    const { data: { session } } = await supabase.auth.getSession();
    await applySession(session);
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    tokenStorage.clearSession();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    register,
    loginWithGoogle,
    logout,
    loading,
    initializing,
    error,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
