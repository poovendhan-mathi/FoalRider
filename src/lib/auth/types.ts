// src/lib/auth/types.ts

import type { User, Session, AuthError } from "@supabase/supabase-js";

/**
 * SessionState - Represents the current authentication/session state for the app.
 */
export interface SessionState {
  status: "loading" | "authenticated" | "unauthenticated";
  user: User | null;
  session: Session | null;
  error: AuthError | null;
  lastRefreshed: number | null;
}

/**
 * TabInfo - Metadata about the current browser tab for leader election.
 */
export interface TabInfo {
  tabId: string;
  isLeader: boolean;
  lastActive: number;
  createdAt: number;
}

/**
 * AuthMessage - Message format for cross-tab communication.
 */
export interface AuthMessage {
  type:
    | "SESSION_UPDATE"
    | "LOGOUT"
    | "LOGIN"
    | "TOKEN_REFRESH"
    | "LEADER_CHANGE"
    | "HEARTBEAT";
  payload: unknown;
  tabId: string;
  timestamp: number;
}

/**
 * SessionManagerConfig - Configurable options for session management.
 */
export interface SessionManagerConfig {
  refreshThreshold: number; // ms before expiry to trigger refresh (e.g., 60000 = 1 min)
  heartbeatInterval: number; // ms between leader heartbeats (e.g., 5000 = 5 sec)
  leaderTimeout: number; // ms before leader considered dead (e.g., 15000 = 15 sec)
  maxRetries: number; // max token refresh retries
  retryDelay: number; // ms between retries
}

/**
 * STORAGE_KEYS - Constants for localStorage/cookie keys used in session management.
 */
export const STORAGE_KEYS = {
  TAB_ID: "auth_tab_id",
  LEADER_TAB: "auth_leader_tab",
  LEADER_HEARTBEAT: "auth_leader_heartbeat",
  SESSION_CACHE: "auth_session_cache",
  REFRESH_LOCK: "auth_refresh_lock",
} as const;
