// src/lib/auth/tab-sync.ts

import { AuthMessage } from "./types";

/**
 * TabSync - Cross-tab synchronization using BroadcastChannel (with localStorage fallback).
 * Ensures all tabs are notified of auth/session changes instantly.
 */
export class TabSync {
  private channel: BroadcastChannel | null = null;
  private tabId: string;
  private listeners: Map<AuthMessage["type"], Set<(payload: unknown) => void>> =
    new Map();
  private static FALLBACK_KEY = "auth-broadcast-fallback";

  constructor(tabId: string) {
    this.tabId = tabId;
    if (typeof BroadcastChannel !== "undefined") {
      this.channel = new BroadcastChannel("auth-channel");
      this.channel.onmessage = (event) => this.handleMessage(event.data);
    } else {
      window.addEventListener("storage", this.handleStorageEvent);
    }
  }

  broadcast(type: AuthMessage["type"], payload: unknown): void {
    const message: AuthMessage = {
      type,
      payload,
      tabId: this.tabId,
      timestamp: Date.now(),
    };
    if (this.channel) {
      this.channel.postMessage(message);
    } else {
      // Fallback: Write to localStorage (triggers storage event)
      localStorage.setItem(TabSync.FALLBACK_KEY, JSON.stringify(message));
      // Remove after short delay to avoid clutter
      setTimeout(() => localStorage.removeItem(TabSync.FALLBACK_KEY), 100);
    }
  }

  on(
    type: AuthMessage["type"],
    callback: (payload: unknown) => void
  ): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);
    return () => {
      this.listeners.get(type)?.delete(callback);
    };
  }

  private handleMessage = (message: AuthMessage) => {
    if (message.tabId === this.tabId) return; // Ignore self
    const cbs = this.listeners.get(message.type);
    if (cbs) {
      cbs.forEach((cb) => cb(message.payload));
    }
  };

  private handleStorageEvent = (event: StorageEvent) => {
    if (event.key === TabSync.FALLBACK_KEY && event.newValue) {
      try {
        const message: AuthMessage = JSON.parse(event.newValue);
        this.handleMessage(message);
      } catch {}
    }
  };

  // Convenience methods
  broadcastSessionUpdate(session: unknown): void {
    this.broadcast("SESSION_UPDATE", session);
  }
  broadcastLogout(): void {
    this.broadcast("LOGOUT", null);
  }
  broadcastLogin(session: unknown): void {
    this.broadcast("LOGIN", session);
  }
  broadcastTokenRefresh(session: unknown): void {
    this.broadcast("TOKEN_REFRESH", session);
  }

  destroy(): void {
    if (this.channel) {
      this.channel.close();
    } else {
      window.removeEventListener("storage", this.handleStorageEvent);
    }
    this.listeners.clear();
  }
}
