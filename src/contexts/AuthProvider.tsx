"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { SessionManager } from "@/lib/auth/session-manager";
import type { SessionState } from "@/lib/auth/types";
import type { Session, Provider } from "@supabase/supabase-js";

interface AuthContextValue {
  state: SessionState;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  initialSession,
}: {
  children: ReactNode;
  initialSession?: Session | null;
}) {
  const [state, setState] = useState<SessionState>({
    status: "loading",
    user: initialSession?.user ?? null,
    session: initialSession ?? null,
    error: null,
    lastRefreshed: null,
  });

  const managerRef = useRef<SessionManager | null>(null);

  useEffect(() => {
    // Initialize SessionManager
    const supabase = getSupabaseBrowserClient();
    const manager = SessionManager.getInstance(supabase, {
      refreshThreshold: 60 * 1000, // 1 minute before expiry
      heartbeatInterval: 5 * 1000, // 5 seconds
      leaderTimeout: 15 * 1000, // 15 seconds
      maxRetries: 3,
      retryDelay: 1000,
    });

    managerRef.current = manager;

    // Subscribe to session state changes
    const unsubscribe = manager.subscribe((newState) => {
      setState(newState);
    });

    // Initialize session
    manager.initialize().then((initialState) => {
      setState(initialState);
    });

    return () => {
      unsubscribe();
      // Don't destroy the SessionManager on component unmount
      // Only destroy on actual window close (handled by beforeunload)
    };
  }, []);

  // Handle page unload
  useEffect(() => {
    const handleUnload = () => {
      managerRef.current?.destroy();
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!managerRef.current) throw new Error("Auth not initialized");
    await managerRef.current.signIn({ email, password });
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!managerRef.current) throw new Error("Auth not initialized");
    await managerRef.current.signUp({ email, password });
  }, []);

  const signOut = useCallback(async () => {
    if (!managerRef.current) throw new Error("Auth not initialized");
    await managerRef.current.signOut();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!managerRef.current) throw new Error("Auth not initialized");
    await managerRef.current.signInWithOAuth("google" as Provider);
  }, []);

  const signInWithGithub = useCallback(async () => {
    if (!managerRef.current) throw new Error("Auth not initialized");
    await managerRef.current.signInWithOAuth("github" as Provider);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error as Error | null };
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error as Error | null };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        state,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        signInWithGithub,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function useSession() {
  const { state } = useAuth();
  return {
    session: state.session,
    user: state.user,
    loading: state.status === "loading",
    isAuthenticated: state.status === "authenticated",
  };
}
