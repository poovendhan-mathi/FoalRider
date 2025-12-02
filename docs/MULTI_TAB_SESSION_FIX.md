# Multi-Tab Session Management Fix

## Date: December 2, 2025

## Problem

When multiple tabs were open and one or more tabs were closed, switching between the remaining tabs would cause all tabs to get logged out.

## Root Cause

The **critical bug** was in `leader-election.ts`:

```typescript
// WRONG: Using localStorage for tab ID
let id = localStorage.getItem(STORAGE_KEYS.TAB_ID);
```

**localStorage is SHARED across ALL tabs in the same origin.** This means every tab was getting the **same tab ID**, which completely broke the multi-tab session management:

1. Tab 1 opens → Creates tab ID "ABC" in localStorage
2. Tab 2 opens → Gets the SAME tab ID "ABC" from localStorage
3. Tab 3 opens → Gets the SAME tab ID "ABC" from localStorage
4. All tabs think they are the same tab!
5. When Tab 1 closes and calls `destroy()`, it removes leader info
6. When you switch to Tab 2, the session sync gets confused and logs everyone out

## The Fix

### 1. Use `sessionStorage` instead of `localStorage` for Tab IDs

```typescript
// CORRECT: Using sessionStorage for tab ID (unique per tab)
let id = sessionStorage.getItem(STORAGE_KEYS.TAB_ID);
if (!id) {
  id = crypto.randomUUID();
  sessionStorage.setItem(STORAGE_KEYS.TAB_ID, id);
}
```

**`sessionStorage` is unique per tab/window.** This is how major companies (Google, Facebook, Amazon, etc.) handle multi-tab sessions.

### 2. Don't call `destroy()` on tab close

Previously, the AuthProvider was calling `managerRef.current?.destroy()` on `beforeunload`. This would:

- Unsubscribe from auth events
- Clear the leader election
- Close the BroadcastChannel

This is wrong! When a tab closes:

- The session should persist (it's in cookies/localStorage)
- Other tabs should continue working
- Another tab should take over as leader (via the heartbeat mechanism)

### 3. Only broadcast logout on INTENTIONAL logout

The `handleAuthStateChange` now checks `isIntentionalLogout` flag before broadcasting:

```typescript
case "SIGNED_OUT":
  if (this.isIntentionalLogout) {
    // User clicked sign out - broadcast to all tabs
    this.tabSync.broadcastLogout();
  } else {
    // Tab closing or automatic - only update local state
    // Do NOT broadcast
  }
```

## How It Works Now

### Session Storage (Per-Tab)

- `auth_tab_id` → Unique identifier for THIS tab only

### Local Storage (Shared)

- `auth_leader_tab` → Which tab ID is the current leader
- `auth_leader_heartbeat` → Timestamp of last leader heartbeat
- Supabase session data (cookies/localStorage) → The actual auth session

### BroadcastChannel Messages

- `LOGIN` → User logged in (broadcast to all tabs)
- `LOGOUT` → User explicitly logged out (broadcast to all tabs)
- `TOKEN_REFRESH` → Leader refreshed the token (broadcast to all tabs)
- `SESSION_UPDATE` → Session was updated (broadcast to all tabs)

### Leader Election

1. Each tab has a unique ID (from sessionStorage)
2. Leader stores its ID and heartbeat timestamp in localStorage
3. Other tabs check if leader is alive every 3 seconds
4. If leader dies (heartbeat too old), another tab takes over
5. Only the leader refreshes tokens (prevents race conditions)

## Testing

1. Open 5 tabs while logged in
2. Close tab 1 → Switch between remaining tabs → Should stay logged in ✓
3. Close tab 2 → Switch between remaining tabs → Should stay logged in ✓
4. Click "Sign Out" in any tab → ALL tabs should log out ✓
5. Log in on one tab → ALL tabs should log in ✓

## Files Changed

- `src/lib/auth/leader-election.ts` - Use sessionStorage for tab ID
- `src/lib/auth/session-manager.ts` - Don't broadcast on destroy
- `src/contexts/AuthProvider.tsx` - Don't destroy on beforeunload
- `contexts/AuthProvider.tsx` - Don't destroy on beforeunload
