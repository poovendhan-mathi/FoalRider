Enterprise-Grade Session Management Architecture for Next.js + Supabase
The Core Problem
Your issue stems from race conditions and lack of cross-tab synchronization when Supabase refreshes tokens. Here's the robust solution.

Architecture Overview

┌─────────────────────────────────────────────────────────────────┐
│ BROWSER TABS │
├─────────────┬─────────────┬─────────────┬─────────────────────────┤
│ Tab 1 │ Tab 2 │ Tab 3 │ Tab N │
│ (Leader) │ (Follower) │ (Follower) │ (Follower) │
└──────┬──────┴──────┬──────┴──────┬──────┴──────┬────────────────┘
│ │ │ │
└─────────────┴──────┬──────┴─────────────┘
│
┌────────▼────────┐
│ BroadcastChannel │ ← Cross-tab communication
│ "auth-channel" │
└────────┬─────────┘
│
┌────────▼────────┐
│ Session Manager │ ← Single source of truth
│ (Singleton) │
└────────┬─────────┘
│
┌─────────────┼─────────────┐
│ │ │
┌──────▼──────┐ ┌────▼────┐ ┌──────▼──────┐
│ Supabase │ │ Cookie │ │ localStorage │
│ Auth Client │ │ Storage │ │ (Tab Leader) │
└─────────────┘ └─────────┘ └──────────────┘

       src/

├── lib/
│ ├── supabase/
│ │ ├── client.ts # Browser Supabase client (singleton)
│ │ ├── server.ts # Server Supabase client
│ │ ├── middleware.ts # Middleware client
│ │ └── config.ts # Supabase configuration
│ │
│ ├── auth/
│ │ ├── session-manager.ts # Core session management logic
│ │ ├── tab-sync.ts # BroadcastChannel cross-tab sync
│ │ ├── leader-election.ts # Tab leader election system
│ │ ├── token-refresh.ts # Token refresh orchestration
│ │ └── types.ts # TypeScript types
│ │
│ └── utils/
│ ├── storage.ts # Storage abstraction layer
│ └── events.ts # Custom event system
│
├── hooks/
│ ├── useSession.ts # Main session hook
│ ├── useAuthState.ts # Auth state subscription
│ └── useTabSync.ts # Tab synchronization hook
│
├── providers/
│ ├── AuthProvider.tsx # Root auth context provider
│ └── SessionSyncProvider.tsx # Cross-tab sync provider
│
├── components/
│ └── auth/
│ ├── AuthGuard.tsx # Protected route wrapper
│ ├── SessionMonitor.tsx # Dev tools for session debugging
│ └── LogoutAllTabs.tsx # Logout across all tabs
│
├── middleware.ts # Next.js middleware for auth
│
└── app/
├── layout.tsx # Root layout with providers
├── (auth)/
│ ├── login/page.tsx
│ ├── register/page.tsx
│ └── callback/route.ts # OAuth callback handler
└── (protected)/
└── dashboard/page.tsx

Detailed Implementation Skeleton

1. Types Definition (lib/auth/types.ts)

// Define all types first for type safety

export interface SessionState {
status: 'loading' | 'authenticated' | 'unauthenticated';
user: User | null;
session: Session | null;
error: AuthError | null;
lastRefreshed: number | null;
}

export interface TabInfo {
tabId: string;
isLeader: boolean;
lastActive: number;
createdAt: number;
}

export interface AuthMessage {
type: 'SESSION_UPDATE' | 'LOGOUT' | 'LOGIN' | 'TOKEN_REFRESH' | 'LEADER_CHANGE' | 'HEARTBEAT';
payload: any;
tabId: string;
timestamp: number;
}

export interface SessionManagerConfig {
refreshThreshold: number; // ms before expiry to trigger refresh (e.g., 60000 = 1 min)
heartbeatInterval: number; // ms between leader heartbeats (e.g., 5000 = 5 sec)
leaderTimeout: number; // ms before leader considered dead (e.g., 15000 = 15 sec)
maxRetries: number; // max token refresh retries
retryDelay: number; // ms between retries
}

// Storage keys as constants to prevent typos
export const STORAGE_KEYS = {
TAB_ID: 'auth_tab_id',
LEADER_TAB: 'auth_leader_tab',
LEADER_HEARTBEAT: 'auth_leader_heartbeat',
SESSION_CACHE: 'auth_session_cache',
REFRESH_LOCK: 'auth_refresh_lock',
} as const;

2. Tab Leader Election (lib/auth/leader-election.ts)
   /\*\*

- Leader Election System
-
- WHY: Only ONE tab should refresh tokens to prevent race conditions.
- When multiple tabs try to refresh simultaneously, you get:
- - Token invalidation conflicts
- - Session state inconsistencies
- - The "stuck loading" issue you're experiencing
-
- HOW: Uses localStorage + heartbeat pattern
- - Each tab has unique ID
- - Leader writes heartbeat timestamp every N seconds
- - If heartbeat is stale, another tab becomes leader
- - Leader election happens on tab open/close/visibility change
    \*/

export class LeaderElection {
private tabId: string;
private heartbeatInterval: NodeJS.Timeout | null;
private config: SessionManagerConfig;
private listeners: Set<(isLeader: boolean) => void>;

constructor(config: SessionManagerConfig) {
// Initialize with config
// Generate unique tabId using crypto.randomUUID() or fallback
// Set up storage event listener for cross-tab communication
}

/\*\*

- Try to become the leader
- Called on: tab initialization, leader timeout detection, visibility change
  \*/
  async tryBecomeLeader(): Promise<boolean> {
  // 1. Check if current leader is alive (heartbeat not stale)
  // 2. If leader dead or no leader, attempt to claim leadership
  // 3. Use localStorage with timestamp to handle race conditions
  // 4. Start heartbeat if became leader
  // 5. Notify listeners of leadership change
  }

/\*\*

- Start sending heartbeats (only called by leader)
  \*/
  private startHeartbeat(): void {
  // Write current timestamp to localStorage every heartbeatInterval
  // Other tabs check this to know leader is alive
  }

/\*\*

- Check if current leader is still alive
  \*/
  private isLeaderAlive(): boolean {
  // Read leader heartbeat from localStorage
  // Compare with current time
  // Return false if difference > leaderTimeout
  }

/\*\*

- Handle storage events from other tabs
  \*/
  private handleStorageEvent(event: StorageEvent): void {
  // If leader changed, update local state
  // If leader heartbeat stopped, try to become leader
  }

/\*\*

- Clean up when tab closes
  \*/
  destroy(): void {
  // Stop heartbeat
  // If this tab was leader, clear leader claim
  // Remove event listeners
  }

// Public methods
isLeader(): boolean { }
getTabId(): string { }
onLeaderChange(callback: (isLeader: boolean) => void): () => void { }
}

3. Cross-Tab Synchronization (lib/auth/tab-sync.ts)
   /\*\*

- Cross-Tab Synchronization using BroadcastChannel API
-
- WHY: When auth state changes in one tab, ALL tabs need to know immediately
-
- FALLBACK: For browsers without BroadcastChannel, use localStorage events
  \*/

export class TabSync {
private channel: BroadcastChannel | null;
private tabId: string;
private listeners: Map<AuthMessage['type'], Set<(payload: any) => void>>;

constructor(tabId: string) {
// Create BroadcastChannel named 'auth-channel'
// Set up message listener
// Fallback to localStorage if BroadcastChannel not supported
}

/\*\*

- Broadcast message to all other tabs
  \*/
  broadcast(type: AuthMessage['type'], payload: any): void {
  // Create AuthMessage with type, payload, tabId, timestamp
  // Post to channel
  // Fallback: write to localStorage with unique key, then delete
  }

/\*\*

- Listen for specific message types
  \*/
  on(type: AuthMessage['type'], callback: (payload: any) => void): () => void {
  // Add callback to listeners map
  // Return unsubscribe function
  }

/\*\*

- Handle incoming messages
  \*/
  private handleMessage(message: AuthMessage): void {
  // Ignore messages from self (same tabId)
  // Call all registered listeners for this message type
  }

// Convenience methods
broadcastSessionUpdate(session: Session | null): void { }
broadcastLogout(): void { }
broadcastLogin(session: Session): void { }
broadcastTokenRefresh(session: Session): void { }

destroy(): void {
// Close channel
// Clear listeners
}
}

4. Token Refresh Orchestration (lib/auth/token-refresh.ts)
   /\*\*

- Token Refresh Orchestration
-
- WHY: Coordinates token refresh to ensure:
- - Only leader refreshes tokens
- - Refresh happens before token expires
- - All tabs get the new session
- - Handles failures gracefully
    \*/

export class TokenRefreshOrchestrator {
private leaderElection: LeaderElection;
private tabSync: TabSync;
private supabase: SupabaseClient;
private config: SessionManagerConfig;
private refreshTimer: NodeJS.Timeout | null;
private isRefreshing: boolean;

constructor(deps: {
leaderElection: LeaderElection;
tabSync: TabSync;
supabase: SupabaseClient;
config: SessionManagerConfig;
}) {
// Store dependencies
// Listen for leader changes
// Listen for token refresh broadcasts from other tabs
}

/\*\*

- Schedule next refresh based on session expiry
  \*/
  scheduleRefresh(session: Session | null): void {
  // Clear existing timer
  // If no session, return
  // Calculate time until refresh needed (expiry - threshold)
  // Set timeout to call performRefresh
  }

/\*\*

- Perform the actual token refresh
- Only called by leader tab
  \*/
  async performRefresh(): Promise<Session | null> {
  // 1. Check if this tab is leader
  if (!this.leaderElection.isLeader()) {
  // Not leader, wait for broadcast from leader
  return null;
  }


    // 2. Acquire refresh lock (prevent double refresh)
    if (this.isRefreshing) return null;
    this.isRefreshing = true;

    try {
      // 3. Call Supabase refreshSession with retry logic
      // 4. On success, broadcast new session to all tabs
      // 5. Schedule next refresh
      // 6. Return new session
    } catch (error) {
      // Handle refresh failure
      // If max retries exceeded, broadcast logout
    } finally {
      this.isRefreshing = false;
    }

}

/\*\*

- Handle token refresh broadcast from leader
- Called in follower tabs
  \*/
  handleRefreshBroadcast(session: Session): void {
  // Update local Supabase client session
  // Schedule next refresh (in case this tab becomes leader)
  }

/\*\*

- Force immediate refresh (e.g., when tab becomes leader)
  \*/
  async forceRefresh(): Promise<Session | null> {
  // Clear scheduled refresh
  // Check if refresh actually needed
  // Call performRefresh
  }

destroy(): void {
// Clear timers
// Remove listeners
}
}

5. Core Session Manager (lib/auth/session-manager.ts)
   /\*\*

- Session Manager - The Central Coordinator
-
- This is the single source of truth for session state.
- Coordinates all the pieces: leader election, tab sync, token refresh
  \*/

export class SessionManager {
private static instance: SessionManager | null = null;

private state: SessionState;
private leaderElection: LeaderElection;
private tabSync: TabSync;
private tokenRefresh: TokenRefreshOrchestrator;
private supabase: SupabaseClient;
private config: SessionManagerConfig;
private listeners: Set<(state: SessionState) => void>;
private authSubscription: { unsubscribe: () => void } | null;

// Singleton pattern - only one instance per tab
static getInstance(supabase: SupabaseClient, config?: Partial<SessionManagerConfig>): SessionManager {
if (!SessionManager.instance) {
SessionManager.instance = new SessionManager(supabase, config);
}
return SessionManager.instance;
}

private constructor(supabase: SupabaseClient, config?: Partial<SessionManagerConfig>) {
// 1. Merge config with defaults
// 2. Initialize leader election
// 3. Initialize tab sync
// 4. Initialize token refresh orchestrator
// 5. Set up Supabase auth state listener
// 6. Set up cross-tab message handlers
// 7. Set up visibility change handler
// 8. Initialize session state
}

/\*\*

- Initialize the session manager
- Call this once on app startup
  \*/
  async initialize(): Promise<SessionState> {
  // 1. Try to get existing session from Supabase
  // 2. If session exists, validate it's not expired
  // 3. Try to become leader
  // 4. If leader and session needs refresh, refresh it
  // 5. Schedule future refreshes
  // 6. Set state to authenticated/unauthenticated
  // 7. Notify listeners
  }

/\*\*

- Subscribe to session state changes
  \*/
  subscribe(listener: (state: SessionState) => void): () => void {
  // Add listener to set
  // Immediately call with current state
  // Return unsubscribe function
  }

/\*\*

- Handle Supabase auth state changes
- This is triggered by Supabase internally
  \*/
  private handleAuthStateChange(event: AuthChangeEvent, session: Session | null): void {
  // Map Supabase events to our state updates
  switch (event) {
  case 'SIGNED_IN':
  // Update state, broadcast to tabs, schedule refresh
  break;
  case 'SIGNED_OUT':
  // Update state, broadcast to tabs, clear refresh timer
  break;
  case 'TOKEN_REFRESHED':
  // If this tab triggered it, broadcast to others
  // Update state
  break;
  case 'USER_UPDATED':
  // Update user in state, broadcast
  break;
  }
  }

/\*\*

- Handle messages from other tabs
  \*/
  private setupTabSyncHandlers(): void {
  this.tabSync.on('SESSION_UPDATE', (session) => {
  // Update local state without triggering Supabase listener
  });


    this.tabSync.on('LOGOUT', () => {
      // Sign out locally
    });

    this.tabSync.on('LOGIN', (session) => {
      // Update local session
    });

    this.tabSync.on('TOKEN_REFRESH', (session) => {
      // Update local session
      // Reschedule refresh timer
    });

}

/\*\*

- Handle visibility changes
- When tab becomes visible, verify session is still valid
  \*/
  private handleVisibilityChange(): void {
  if (document.visibilityState === 'visible') {
  // 1. Check if session is still valid
  // 2. If near expiry and leader, refresh
  // 3. If leader dead, try to become leader
  }
  }

// Public methods for auth actions
async signIn(credentials: { email: string; password: string }): Promise<SessionState> { }
async signUp(credentials: { email: string; password: string }): Promise<SessionState> { }
async signInWithOAuth(provider: Provider): Promise<void> { }
async signOut(): Promise<void> {
// Sign out from Supabase
// Broadcast logout to all tabs
// Clear state
}
async signOutAllTabs(): Promise<void> {
// Same as signOut but emphasizes cross-tab behavior
}

getState(): SessionState { }
getSession(): Session | null { }
getUser(): User | null { }
isAuthenticated(): boolean { }

destroy(): void {
// Clean up everything
// Unsubscribe from Supabase
// Destroy leader election
// Destroy tab sync
// Destroy token refresh
// Clear singleton instance
}
}

6. Supabase Client Setup (lib/supabase/client.ts)
   /\*\*

- Browser Supabase Client
-
- CRITICAL: Must be a singleton to prevent multiple GoTrue instances
- Multiple instances = multiple auth state listeners = chaos
  \*/

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
if (supabaseInstance) {
return supabaseInstance;
}

supabaseInstance = createBrowserClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
{
auth: {
// IMPORTANT: Let us handle persistence
persistSession: true,

        // Use cookies for SSR compatibility
        storage: {
          // Custom storage implementation using cookies
          // This ensures session is available on server
          getItem: (key) => { /* Read from cookie */ },
          setItem: (key, value) => { /* Write to cookie */ },
          removeItem: (key) => { /* Remove cookie */ },
        },

        // Auto refresh handled by our TokenRefreshOrchestrator
        autoRefreshToken: false,

        // Detect session from URL (OAuth callback)
        detectSessionInUrl: true,

        // Flow type
        flowType: 'pkce',
      },

      global: {
        headers: {
          'x-client-info': 'nextjs-client',
        },
      },
    }

);

return supabaseInstance;
}

// For testing - reset singleton
export function resetSupabaseClient(): void {
supabaseInstance = null;
}

6. Supabase Client Setup (lib/supabase/client.ts)
   /\*\*

- Browser Supabase Client
-
- CRITICAL: Must be a singleton to prevent multiple GoTrue instances
- Multiple instances = multiple auth state listeners = chaos
  \*/

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
if (supabaseInstance) {
return supabaseInstance;
}

supabaseInstance = createBrowserClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
{
auth: {
// IMPORTANT: Let us handle persistence
persistSession: true,

        // Use cookies for SSR compatibility
        storage: {
          // Custom storage implementation using cookies
          // This ensures session is available on server
          getItem: (key) => { /* Read from cookie */ },
          setItem: (key, value) => { /* Write to cookie */ },
          removeItem: (key) => { /* Remove cookie */ },
        },

        // Auto refresh handled by our TokenRefreshOrchestrator
        autoRefreshToken: false,

        // Detect session from URL (OAuth callback)
        detectSessionInUrl: true,

        // Flow type
        flowType: 'pkce',
      },

      global: {
        headers: {
          'x-client-info': 'nextjs-client',
        },
      },
    }

);

return supabaseInstance;
}

// For testing - reset singleton
export function resetSupabaseClient(): void {
supabaseInstance = null;
}

7. Server Supabase Client (lib/supabase/server.ts)
   /\*\*

- Server-side Supabase clients
-
- Different clients for different contexts:
- - Server Components: Read-only, uses cookies
- - Server Actions: Read-write, uses cookies
- - Route Handlers: Read-write, uses cookies
    \*/

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// For Server Components (read-only)
export async function getSupabaseServerClient() {
const cookieStore = await cookies();

return createServerClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
{
cookies: {
getAll() {
return cookieStore.getAll();
},
// Server components can't set cookies
},
}
);
}

// For Server Actions and Route Handlers
export async function getSupabaseServerActionClient() {
const cookieStore = await cookies();

return createServerClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
{
cookies: {
getAll() {
return cookieStore.getAll();
},
setAll(cookiesToSet) {
cookiesToSet.forEach(({ name, value, options }) => {
cookieStore.set(name, value, options);
});
},
},
}
);
}

8. Next.js Middleware (middleware.ts)
   /\*\*

- Middleware for auth protection and session refresh
-
- Runs on every request to protected routes
- Handles:
- - Session validation
- - Token refresh on server
- - Redirect to login if unauthenticated
- - Redirect away from auth pages if authenticated
    \*/

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that don't require authentication
const publicRoutes = ['/login', '/register', '/forgot-password', '/auth/callback'];

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/settings', '/profile'];

export async function middleware(request: NextRequest) {
const response = NextResponse.next({
request: {
headers: request.headers,
},
});

const supabase = createServerClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
{
cookies: {
getAll() {
return request.cookies.getAll();
},
setAll(cookiesToSet) {
// Set cookies on both request and response
cookiesToSet.forEach(({ name, value, options }) => {
request.cookies.set(name, value);
response.cookies.set(name, value, options);
});
},
},
}
);

// This will refresh the session if needed
const { data: { session }, error } = await supabase.auth.getSession();

const path = request.nextUrl.pathname;
const isPublicRoute = publicRoutes.some(route => path.startsWith(route));
const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));

// Redirect logic
if (!session && isProtectedRoute) {
const redirectUrl = new URL('/login', request.url);
redirectUrl.searchParams.set('redirectTo', path);
return NextResponse.redirect(redirectUrl);
}

if (session && isPublicRoute && path !== '/auth/callback') {
return NextResponse.redirect(new URL('/dashboard', request.url));
}

return response;
}

export const config = {
matcher: [
// Match all routes except static files and API routes
'/((?!_next/static|_next/image|favicon.ico|api/).*)',
],
};

9. Auth Provider (providers/AuthProvider.tsx)
   /\*\*

- Auth Provider - React Context for session state
-
- Wraps the app and provides session state to all components
- Initializes SessionManager and handles cleanup
  \*/

'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { SessionManager, SessionState } from '@/lib/auth/session-manager';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface AuthContextValue {
state: SessionState;
signIn: (email: string, password: string) => Promise<void>;
signUp: (email: string, password: string) => Promise<void>;
signOut: () => Promise<void>;
signInWithGoogle: () => Promise<void>;
signInWithGithub: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
children,
initialSession // Passed from server component
}: {
children: React.ReactNode;
initialSession?: Session | null;
}) {
const [state, setState] = useState<SessionState>({
status: 'loading',
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
refreshThreshold: 60 _ 1000, // 1 minute before expiry
heartbeatInterval: 5 _ 1000, // 5 seconds
leaderTimeout: 15 \* 1000, // 15 seconds
maxRetries: 3,
retryDelay: 1000,
});

    managerRef.current = manager;

    // Subscribe to state changes
    const unsubscribe = manager.subscribe(setState);

    // Initialize (check existing session, elect leader, etc.)
    manager.initialize();

    // Cleanup on unmount
    return () => {
      unsubscribe();
      // Don't destroy manager on unmount - it should persist
      // Only destroy on actual page unload
    };

}, []);

// Handle page unload
useEffect(() => {
const handleUnload = () => {
managerRef.current?.destroy();
};

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);

}, []);

const signIn = useCallback(async (email: string, password: string) => {
if (!managerRef.current) throw new Error('Auth not initialized');
await managerRef.current.signIn({ email, password });
}, []);

const signUp = useCallback(async (email: string, password: string) => {
if (!managerRef.current) throw new Error('Auth not initialized');
await managerRef.current.signUp({ email, password });
}, []);

const signOut = useCallback(async () => {
if (!managerRef.current) throw new Error('Auth not initialized');
await managerRef.current.signOut();
}, []);

const signInWithGoogle = useCallback(async () => {
if (!managerRef.current) throw new Error('Auth not initialized');
await managerRef.current.signInWithOAuth('google');
}, []);

const signInWithGithub = useCallback(async () => {
if (!managerRef.current) throw new Error('Auth not initialized');
await managerRef.current.signInWithOAuth('github');
}, []);

return (
<AuthContext.Provider value={{
      state,
      signIn,
      signUp,
      signOut,
      signInWithGoogle,
      signInWithGithub,
    }}>
{children}
</AuthContext.Provider>
);
}

export function useAuth() {
const context = useContext(AuthContext);
if (!context) {
throw new Error('useAuth must be used within AuthProvider');
}
return context;
}

10. Session Hook (hooks/useSession.ts)
    /\*\*

- Main hook for accessing session in components
-
- Provides convenient accessors and loading states
  \*/

'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useMemo } from 'react';

export function useSession() {
const { state } = useAuth();

return useMemo(() => ({
// State
session: state.session,
user: state.user,
status: state.status,
error: state.error,

    // Computed
    isLoading: state.status === 'loading',
    isAuthenticated: state.status === 'authenticated',
    isUnauthenticated: state.status === 'unauthenticated',

    // User details (safe access)
    userId: state.user?.id ?? null,
    userEmail: state.user?.email ?? null,
    userMetadata: state.user?.user_metadata ?? {},

}), [state]);
}

// Typed version for when you know user is authenticated
export function useAuthenticatedSession() {
const session = useSession();

if (!session.isAuthenticated || !session.user) {
throw new Error('useAuthenticatedSession must be used in authenticated context');
}

return {
...session,
user: session.user!, // Non-null assertion safe here
session: session.session!,
};
}

11. Auth Guard Component (components/auth/AuthGuard.tsx)
    /\*\*

- Auth Guard - Protects routes/components
-
- Shows loading state while checking auth
- Redirects or shows fallback for unauthenticated users
  \*/

'use client';

import { useSession } from '@/hooks/useSession';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
children: React.ReactNode;
fallback?: React.ReactNode; // Show while loading
redirectTo?: string; // Redirect if unauthenticated
requiredRole?: string; // Optional role check
}

export function AuthGuard({
children,
fallback = <LoadingSpinner />,
redirectTo = '/login',
requiredRole,
}: AuthGuardProps) {
const { isLoading, isAuthenticated, user } = useSession();
const router = useRouter();
const pathname = usePathname();

useEffect(() => {
if (!isLoading && !isAuthenticated) {
const params = new URLSearchParams({ redirectTo: pathname });
router.push(`${redirectTo}?${params}`);
}
}, [isLoading, isAuthenticated, router, pathname, redirectTo]);

// Loading state
if (isLoading) {
return <>{fallback}</>;
}

// Not authenticated - will redirect, show fallback meanwhile
if (!isAuthenticated) {
return <>{fallback}</>;
}

// Role check (if required)
if (requiredRole) {
const userRole = user?.user_metadata?.role;
if (userRole !== requiredRole) {
return <UnauthorizedMessage />;
}
}

// Authenticated - render children
return <>{children}</>;
}

// Loading component
function LoadingSpinner() {
return (
<div className="flex items-center justify-center min-h-screen">
<div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
</div>
);
}

function UnauthorizedMessage() {
return (
<div className="flex items-center justify-center min-h-screen">
<p>You don't have permission to access this page.</p>
</div>
);
}

12. OAuth Callback Handler (app/auth/callback/route.ts)
    /\*\*

- OAuth Callback Route
-
- Handles redirect from OAuth providers (Google, GitHub, etc.)
- Exchanges code for session and redirects to app
  \*/

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
const requestUrl = new URL(request.url);
const code = requestUrl.searchParams.get('code');
const next = requestUrl.searchParams.get('next') ?? '/dashboard';
const error = requestUrl.searchParams.get('error');
const errorDescription = requestUrl.searchParams.get('error_description');

// Handle OAuth errors
if (error) {
console.error('OAuth error:', error, errorDescription);
return NextResponse.redirect(
new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
);
}

if (code) {
const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Code exchange error:', exchangeError);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, request.url)
      );
    }

    // Successful auth - redirect to destination
    return NextResponse.redirect(new URL(next, request.url));

}

// No code provided - redirect to login
return NextResponse.redirect(new URL('/login', request.url));
}

13. Root Layout (app/layout.tsx)
    /\*\*

- Root Layout
-
- Sets up providers and gets initial session from server
  \*/

import { AuthProvider } from '@/providers/AuthProvider';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function RootLayout({
children,
}: {
children: React.ReactNode;
}) {
// Get initial session on server
const supabase = await getSupabaseServerClient();
const { data: { session } } = await supabase.auth.getSession();

return (
<html lang="en">
<body>
<AuthProvider initialSession={session}>
{children}
</AuthProvider>
</body>
</html>
);
}

Key Implementation Details to Remember

1. Prevent Race Conditions
   TypeScript

// In token-refresh.ts - Use mutex/lock pattern
private refreshLock = false;

async performRefresh() {
if (this.refreshLock) return; // Already refreshing
this.refreshLock = true;
try {
// ... refresh logic
} finally {
this.refreshLock = false;
}
} 2. Handle Tab Visibility
TypeScript

// In session-manager.ts
document.addEventListener('visibilitychange', () => {
if (document.visibilityState === 'visible') {
// Tab became active
// 1. Check if we should be leader
// 2. Validate session is still fresh
// 3. Force refresh if needed
}
}); 3. Graceful Degradation
TypeScript

// In tab-sync.ts - Fallback for BroadcastChannel
const channel = typeof BroadcastChannel !== 'undefined'
? new BroadcastChannel('auth-channel')
: null;

if (!channel) {
// Use localStorage events as fallback
window.addEventListener('storage', handleStorageEvent);
} 4. Debug Mode
TypeScript

// Add debug logging that can be enabled
const DEBUG = process.env.NODE_ENV === 'development';

function log(...args: any[]) {
if (DEBUG) {
console.log('[SessionManager]', ...args);
}
}
Testing Checklist
When you implement this, test these scenarios:

Multi-tab login: Open 2 tabs, login in one → other should update
Multi-tab logout: Logout in one tab → all tabs should logout
Token refresh: Wait for token to near-expire → only leader should refresh
Leader failover: Close leader tab → another should become leader
Tab sleep/wake: Background tab for 5+ mins → should recover gracefully
Rapid tab opening: Open 10 tabs quickly → no duplicate refreshes
Network offline/online: Disconnect and reconnect → should recover
OAuth flow: Complete OAuth → should work across all tabs
