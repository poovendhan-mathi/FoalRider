// src/lib/auth/leader-election.ts

import { SessionManagerConfig, STORAGE_KEYS } from "./types";

/**
 * LeaderElection - Ensures only one tab is the leader for session refresh.
 * Uses localStorage heartbeat pattern for cross-tab coordination.
 */
export class LeaderElection {
  private tabId: string;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private checkLeaderInterval: ReturnType<typeof setInterval> | null = null;
  private config: SessionManagerConfig;
  private listeners: Set<(isLeader: boolean) => void> = new Set();
  private isLeaderTab: boolean = false;

  constructor(config: SessionManagerConfig) {
    this.config = config;
    this.tabId = this.getOrCreateTabId();
    window.addEventListener("storage", this.handleStorageEvent);
    this.tryBecomeLeader();

    // Periodically check if leader is still alive
    this.startLeaderCheck();
  }

  private getOrCreateTabId(): string {
    let id = localStorage.getItem(STORAGE_KEYS.TAB_ID);
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
      localStorage.setItem(STORAGE_KEYS.TAB_ID, id);
    }
    return id;
  }

  async tryBecomeLeader(): Promise<boolean> {
    const now = Date.now();
    const leaderId = localStorage.getItem(STORAGE_KEYS.LEADER_TAB);
    const lastHeartbeat = parseInt(
      localStorage.getItem(STORAGE_KEYS.LEADER_HEARTBEAT) || "0",
      10
    );
    const leaderAlive =
      leaderId && now - lastHeartbeat < this.config.leaderTimeout;

    if (!leaderAlive || leaderId === this.tabId) {
      // Claim leadership
      localStorage.setItem(STORAGE_KEYS.LEADER_TAB, this.tabId);
      this.isLeaderTab = true;
      this.startHeartbeat();
      this.notifyListeners(true);
      return true;
    } else {
      this.isLeaderTab = false;
      this.stopHeartbeat();
      this.notifyListeners(false);
      return false;
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      localStorage.setItem(
        STORAGE_KEYS.LEADER_HEARTBEAT,
        Date.now().toString()
      );
    }, this.config.heartbeatInterval);
    // Initial heartbeat
    localStorage.setItem(STORAGE_KEYS.LEADER_HEARTBEAT, Date.now().toString());
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private startLeaderCheck(): void {
    // Check every 3 seconds if the leader is still alive
    this.checkLeaderInterval = setInterval(() => {
      if (!this.isLeaderTab) {
        // If we're not the leader, check if current leader is still alive
        const leaderId = localStorage.getItem(STORAGE_KEYS.LEADER_TAB);
        const lastHeartbeat = parseInt(
          localStorage.getItem(STORAGE_KEYS.LEADER_HEARTBEAT) || "0",
          10
        );
        const now = Date.now();

        // If no leader or leader is dead, try to become leader
        if (!leaderId || now - lastHeartbeat > this.config.leaderTimeout) {
          this.tryBecomeLeader();
        }
      }
    }, 3000); // Check every 3 seconds
  }

  private stopLeaderCheck(): void {
    if (this.checkLeaderInterval) {
      clearInterval(this.checkLeaderInterval);
      this.checkLeaderInterval = null;
    }
  }

  private handleStorageEvent = (event: StorageEvent) => {
    if (
      event.key === STORAGE_KEYS.LEADER_TAB ||
      event.key === STORAGE_KEYS.LEADER_HEARTBEAT
    ) {
      this.tryBecomeLeader();
    }
  };

  destroy(): void {
    this.stopHeartbeat();
    this.stopLeaderCheck();
    if (
      this.isLeaderTab &&
      localStorage.getItem(STORAGE_KEYS.LEADER_TAB) === this.tabId
    ) {
      localStorage.removeItem(STORAGE_KEYS.LEADER_TAB);
      localStorage.removeItem(STORAGE_KEYS.LEADER_HEARTBEAT);
    }
    window.removeEventListener("storage", this.handleStorageEvent);
    this.listeners.clear();
  }

  isLeader(): boolean {
    return this.isLeaderTab;
  }

  getTabId(): string {
    return this.tabId;
  }

  onLeaderChange(callback: (isLeader: boolean) => void): () => void {
    this.listeners.add(callback);
    // Call immediately with current state
    callback(this.isLeaderTab);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(isLeader: boolean) {
    this.listeners.forEach((cb) => cb(isLeader));
  }
}
