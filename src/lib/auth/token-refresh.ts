// src/lib/auth/token-refresh.ts

import type { SupabaseClient, Session } from "@supabase/supabase-js";
import { LeaderElection } from "./leader-election";
import { TabSync } from "./tab-sync";
import { SessionManagerConfig } from "./types";

/**
 * TokenRefreshOrchestrator - Ensures only the leader tab refreshes tokens, with retries and cross-tab sync.
 */
export class TokenRefreshOrchestrator {
  private leaderElection: LeaderElection;
  private tabSync: TabSync;
  private supabase: SupabaseClient;
  private config: SessionManagerConfig;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private isRefreshing = false;
  private retryCount = 0;

  constructor(deps: {
    leaderElection: LeaderElection;
    tabSync: TabSync;
    supabase: SupabaseClient;
    config: SessionManagerConfig;
  }) {
    this.leaderElection = deps.leaderElection;
    this.tabSync = deps.tabSync;
    this.supabase = deps.supabase;
    this.config = deps.config;
    this.leaderElection.onLeaderChange((isLeader) => {
      if (isLeader) {
        this.forceRefresh();
      }
    });
    this.tabSync.on("TOKEN_REFRESH", (session) => {
      this.handleRefreshBroadcast(session as Session);
    });
  }

  scheduleRefresh(session: Session | null): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    if (!session) return;
    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
    const now = Date.now();
    const refreshIn = Math.max(
      expiresAt - now - this.config.refreshThreshold,
      0
    );
    if (refreshIn > 0) {
      this.refreshTimer = setTimeout(() => this.performRefresh(), refreshIn);
    }
  }

  async performRefresh(): Promise<Session | null> {
    if (!this.leaderElection.isLeader()) return null;
    if (this.isRefreshing) return null;
    this.isRefreshing = true;
    try {
      let session: Session | null = null;
      for (
        this.retryCount = 0;
        this.retryCount < this.config.maxRetries;
        this.retryCount++
      ) {
        const { data } = await this.supabase.auth.refreshSession();
        if (data.session) {
          session = data.session;
          break;
        }
        await new Promise((res) => setTimeout(res, this.config.retryDelay));
      }
      if (session) {
        this.tabSync.broadcastTokenRefresh(session);
        this.scheduleRefresh(session);
        return session;
      } else {
        // DO NOT broadcast logout on token refresh failure
        // Let the session expire naturally - API calls will fail and user will be prompted to re-login
        // This prevents false logouts when tabs are closing or network is temporarily down
        console.warn("Token refresh failed after retries - session will expire");
        return null;
      }
    } finally {
      this.isRefreshing = false;
    }
  }

  handleRefreshBroadcast(session: Session): void {
    // Update local session and reschedule refresh
    this.scheduleRefresh(session);
  }

  async forceRefresh(): Promise<Session | null> {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    return this.performRefresh();
  }

  destroy(): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    // No explicit listeners to remove (handled by TabSync/LeaderElection)
  }
}
