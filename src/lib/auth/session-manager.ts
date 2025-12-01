// src/lib/auth/session-manager.ts

import type {
  SupabaseClient,
  Session,
  AuthChangeEvent,
  User,
  Provider,
} from "@supabase/supabase-js";
import { LeaderElection } from "./leader-election";
import { TabSync } from "./tab-sync";
import { TokenRefreshOrchestrator } from "./token-refresh";
import { SessionManagerConfig, SessionState } from "./types";

/**
 * SessionManager - Central coordinator for session state, leader election, cross-tab sync, and token refresh.
 */
export class SessionManager {
  private static instance: SessionManager | null = null;
  private state: SessionState;
  private leaderElection: LeaderElection;
  private tabSync: TabSync;
  private tokenRefresh: TokenRefreshOrchestrator;
  private supabase: SupabaseClient;
  private config: SessionManagerConfig;
  private listeners: Set<(state: SessionState) => void> = new Set();
  private authSubscription: { unsubscribe: () => void } | null = null;
  private isClosing: boolean = false; // Track if tab is closing
  private isFetchingSession: boolean = false; // Prevent concurrent session fetches
  private visibilityChangeTimeout: NodeJS.Timeout | null = null; // Debounce visibility changes
  private isIntentionalLogout: boolean = false; // Track if user clicked sign out

  static getInstance(
    supabase: SupabaseClient,
    config?: Partial<SessionManagerConfig>
  ): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager(supabase, config);
    }
    return SessionManager.instance;
  }

  private constructor(
    supabase: SupabaseClient,
    config?: Partial<SessionManagerConfig>
  ) {
    this.supabase = supabase;
    this.config = {
      refreshThreshold: 60000,
      heartbeatInterval: 5000,
      leaderTimeout: 15000,
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    };
    this.state = {
      status: "loading",
      user: null,
      session: null,
      error: null,
      lastRefreshed: null,
    };
    this.leaderElection = new LeaderElection(this.config);
    this.tabSync = new TabSync(this.leaderElection.getTabId());
    this.tokenRefresh = new TokenRefreshOrchestrator({
      leaderElection: this.leaderElection,
      tabSync: this.tabSync,
      supabase: this.supabase,
      config: this.config,
    });
    this.setupTabSyncHandlers();
    if (typeof document !== "undefined") {
      document.addEventListener(
        "visibilitychange",
        this.handleVisibilityChange
      );

      // Track when the tab is being closed
      window.addEventListener("beforeunload", () => {
        this.isClosing = true;
      });

      // Also use pagehide for iOS Safari support
      window.addEventListener("pagehide", () => {
        this.isClosing = true;
      });
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((cb) => cb(this.state));
  }

  async initialize(): Promise<SessionState> {
    const sessionResult = await this.supabase.auth.getSession();
    const { data, error } = sessionResult;
    if (data.session) {
      this.state = {
        status: "authenticated",
        user: data.session.user,
        session: data.session,
        error: null,
        lastRefreshed: Date.now(),
      };
      this.tokenRefresh.scheduleRefresh(data.session);
    } else {
      this.state = {
        status: "unauthenticated",
        user: null,
        session: null,
        error: error ?? null,
        lastRefreshed: null,
      };
    }
    this.notifyListeners();
    const {
      data: { subscription },
    } = this.supabase.auth.onAuthStateChange((event, session) => {
      this.handleAuthStateChange(event, session);
    });
    this.authSubscription = {
      unsubscribe: () => subscription.unsubscribe(),
    };
    return this.state;
  }

  subscribe(listener: (state: SessionState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private handleAuthStateChange = (
    event: AuthChangeEvent,
    session: Session | null
  ) => {
    switch (event) {
      case "SIGNED_IN":
        this.state = {
          status: "authenticated",
          user: session?.user ?? null,
          session,
          error: null,
          lastRefreshed: Date.now(),
        };
        this.tabSync.broadcastLogin(session);
        this.tabSync.broadcastSessionUpdate(session);
        this.tokenRefresh.scheduleRefresh(session);
        break;
      case "SIGNED_OUT":
        // Only broadcast logout if this is an INTENTIONAL logout (user clicked sign out)
        // NOT when tab is closing or other automatic events
        if (this.isIntentionalLogout) {
          this.state = {
            status: "unauthenticated",
            user: null,
            session: null,
            error: null,
            lastRefreshed: null,
          };
          this.tabSync.broadcastLogout();
          this.tabSync.broadcastSessionUpdate(null);
          this.tokenRefresh.scheduleRefresh(null);
          this.isIntentionalLogout = false; // Reset flag
        } else {
          // Tab closing or automatic signout - only update local state, don't broadcast
          this.state = {
            status: "unauthenticated",
            user: null,
            session: null,
            error: null,
            lastRefreshed: null,
          };
        }
        break;
      case "TOKEN_REFRESHED":
        this.state = {
          ...this.state,
          session,
          lastRefreshed: Date.now(),
        };
        this.tabSync.broadcastTokenRefresh(session);
        this.tabSync.broadcastSessionUpdate(session);
        this.tokenRefresh.scheduleRefresh(session);
        break;
      case "USER_UPDATED":
        this.state = {
          ...this.state,
          user: session?.user ?? null,
        };
        this.tabSync.broadcastSessionUpdate(session);
        break;
    }
    this.notifyListeners();
  };

  private setupTabSyncHandlers(): void {
    this.tabSync.on("SESSION_UPDATE", (session) => {
      // Only update if we receive a valid session
      if (session) {
        this.state = {
          ...this.state,
          session: session as Session,
          user: (session as Session)?.user ?? null,
          status: "authenticated",
        };
        this.tokenRefresh.scheduleRefresh(session as Session);
        this.notifyListeners();
      }
      // If session is null, ignore it - don't log out based on cross-tab null
      // Only explicit LOGOUT messages should trigger logout
    });
    this.tabSync.on("LOGOUT", () => {
      // Explicit logout message from another tab
      this.state = {
        status: "unauthenticated",
        user: null,
        session: null,
        error: null,
        lastRefreshed: null,
      };
      this.notifyListeners();
    });
    this.tabSync.on("LOGIN", (session) => {
      // Explicit login message from another tab
      this.state = {
        status: "authenticated",
        user: (session as Session)?.user ?? null,
        session: session as Session,
        error: null,
        lastRefreshed: Date.now(),
      };
      this.notifyListeners();
    });
    this.tabSync.on("TOKEN_REFRESH", (session) => {
      // Token was refreshed in another tab
      if (session) {
        this.state = {
          ...this.state,
          session: session as Session,
          user: (session as Session)?.user ?? null,
          lastRefreshed: Date.now(),
        };
        this.tokenRefresh.scheduleRefresh(session as Session);
        this.notifyListeners();
      }
    });
  }

  private handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      // Debounce visibility changes to prevent rapid tab switching issues
      if (this.visibilityChangeTimeout) {
        clearTimeout(this.visibilityChangeTimeout);
      }

      this.visibilityChangeTimeout = setTimeout(() => {
        this.syncSessionOnVisibility();
      }, 300); // 300ms debounce
    }
  };

  private async syncSessionOnVisibility(): Promise<void> {
    // Prevent concurrent session fetches
    if (this.isFetchingSession) {
      return;
    }

    this.isFetchingSession = true;

    try {
      // Re-fetch current session from Supabase when tab becomes visible
      const {
        data: { session },
      } = await this.supabase.auth.getSession();

      if (session) {
        // Only update if session is different or state is not authenticated
        const shouldUpdate =
          this.state.status !== "authenticated" ||
          this.state.session?.access_token !== session.access_token;

        if (shouldUpdate) {
          this.state = {
            status: "authenticated",
            user: session.user,
            session,
            error: null,
            lastRefreshed: Date.now(),
          };
          this.notifyListeners();
          this.leaderElection.tryBecomeLeader();
          this.tabSync.broadcastSessionUpdate(session);
          this.tokenRefresh.scheduleRefresh(session);
        }
      }
      // REMOVED: Do NOT log out on visibility change session fetch failure
      // Visibility changes should only SYNC sessions, not trigger logouts
      // Only explicit LOGOUT messages or intentional signOut() should log out
    } catch (error) {
      console.error("Error syncing session on visibility:", error);
      // Do NOT log out on error - just log it
    } finally {
      this.isFetchingSession = false;
    }
  }

  async signIn(credentials: {
    email: string;
    password: string;
  }): Promise<SessionState> {
    const { data, error } = await this.supabase.auth.signInWithPassword(
      credentials
    );
    if (data.session) {
      this.state = {
        status: "authenticated",
        user: data.session.user,
        session: data.session,
        error: null,
        lastRefreshed: Date.now(),
      };
      this.tabSync.broadcastLogin(data.session);
      this.tokenRefresh.scheduleRefresh(data.session);
    } else {
      this.state = {
        status: "unauthenticated",
        user: null,
        session: null,
        error: error ?? null,
        lastRefreshed: null,
      };
    }
    this.notifyListeners();
    return this.state;
  }

  async signUp(credentials: {
    email: string;
    password: string;
  }): Promise<SessionState> {
    const { data, error } = await this.supabase.auth.signUp(credentials);
    if (data.session) {
      this.state = {
        status: "authenticated",
        user: data.session.user,
        session: data.session,
        error: null,
        lastRefreshed: Date.now(),
      };
      this.tabSync.broadcastLogin(data.session);
      this.tokenRefresh.scheduleRefresh(data.session);
    } else {
      this.state = {
        status: "unauthenticated",
        user: null,
        session: null,
        error: error ?? null,
        lastRefreshed: null,
      };
    }
    this.notifyListeners();
    return this.state;
  }

  async signInWithOAuth(provider: Provider): Promise<void> {
    await this.supabase.auth.signInWithOAuth({ provider });
  }

  async signOut(): Promise<void> {
    // Set flag to indicate this is an intentional logout
    this.isIntentionalLogout = true;
    
    await this.supabase.auth.signOut();
    this.state = {
      status: "unauthenticated",
      user: null,
      session: null,
      error: null,
      lastRefreshed: null,
    };
    // The SIGNED_OUT event will trigger and broadcast to other tabs
    this.notifyListeners();
    this.tokenRefresh.scheduleRefresh(null);
    this.notifyListeners();
  }

  async signOutAllTabs(): Promise<void> {
    await this.signOut();
    this.tabSync.broadcastLogout();
  }

  getState(): SessionState {
    return this.state;
  }
  getSession(): Session | null {
    return this.state.session;
  }
  getUser(): User | null {
    return this.state.user;
  }
  isAuthenticated(): boolean {
    return this.state.status === "authenticated";
  }

  destroy(): void {
    this.authSubscription?.unsubscribe();
    this.leaderElection.destroy();
    this.tabSync.destroy();
    this.tokenRefresh.destroy();
    if (typeof document !== "undefined") {
      document.removeEventListener(
        "visibilitychange",
        this.handleVisibilityChange
      );
    }
    SessionManager.instance = null;
    this.listeners.clear();
  }
}
