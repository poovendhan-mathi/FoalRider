"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import {
  getUserWishlist,
  getGuestWishlist,
  addToWishlist as addToWishlistDB,
  addToGuestWishlist,
  removeFromWishlist as removeFromWishlistDB,
  removeFromGuestWishlist,
  syncGuestWishlist,
  clearWishlist as clearWishlistDB,
  clearGuestWishlist,
  WishlistItem,
} from "@/lib/supabase/wishlist";
import { toast } from "sonner";

interface WishlistContextType {
  items: WishlistItem[];
  totalItems: number;
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (productId: string, productName?: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string, productName?: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

// Generate or retrieve session ID for guest users
function getSessionId(): string {
  if (typeof window === "undefined") return "";

  let sessionId = localStorage.getItem("wishlist_session_id");
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    localStorage.setItem("wishlist_session_id", sessionId);
  }
  return sessionId;
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();
  const user = state.user;
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string>("");

  // Initialize sessionId on client side only
  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  // Load wishlist on mount and when user changes
  useEffect(() => {
    if (sessionId || user) {
      loadWishlist();
    }
  }, [user, sessionId]);

  // Sync guest wishlist when user logs in
  useEffect(() => {
    if (user) {
      handleUserLogin();
    }
  }, [user]);

  async function loadWishlist() {
    // Skip loading during SSR
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let wishlistItems: WishlistItem[] = [];

      if (user) {
        wishlistItems = await getUserWishlist(user.id);
      } else if (sessionId) {
        wishlistItems = await getGuestWishlist(sessionId);
      }

      // Ensure wishlistItems is always an array
      if (!Array.isArray(wishlistItems)) {
        console.warn("Wishlist items not an array, setting empty array");
        wishlistItems = [];
      }

      setItems(wishlistItems);
    } catch (error) {
      console.error("Error loading wishlist:", error);
      setItems([]); // Set empty wishlist on error
      // Don't show error toast on initial load
    } finally {
      setLoading(false);
    }
  }

  async function handleUserLogin() {
    try {
      // Sync guest wishlist to user account
      await syncGuestWishlist(sessionId, user!.id);
      // Reload wishlist
      await loadWishlist();
    } catch (error) {
      console.error("Error syncing wishlist:", error);
    }
  }

  function isInWishlist(productId: string): boolean {
    return items.some((item) => item.product_id === productId);
  }

  async function addToWishlist(productId: string, productName?: string) {
    // Optimistic update
    const tempItem: WishlistItem = {
      id: `temp_${Date.now()}`,
      user_id: user?.id || null,
      session_id: user ? null : sessionId,
      product_id: productId,
      created_at: new Date().toISOString(),
    };
    setItems((prev) => [tempItem, ...prev]);

    try {
      const success = user
        ? await addToWishlistDB(user.id, productId)
        : await addToGuestWishlist(sessionId, productId);

      if (success) {
        toast.success(
          productName ? `${productName} added to wishlist` : "Added to wishlist"
        );
        // Reload to get the actual item with product data
        await loadWishlist();
      } else {
        // Rollback optimistic update
        setItems((prev) => prev.filter((item) => item.id !== tempItem.id));
        toast.error("Failed to add to wishlist");
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      // Rollback optimistic update
      setItems((prev) => prev.filter((item) => item.id !== tempItem.id));
      toast.error("Failed to add to wishlist");
    }
  }

  async function removeFromWishlist(productId: string) {
    // Optimistic update
    const previousItems = items;
    setItems((prev) => prev.filter((item) => item.product_id !== productId));

    try {
      const success = user
        ? await removeFromWishlistDB(user.id, productId)
        : await removeFromGuestWishlist(sessionId, productId);

      if (success) {
        toast.success("Removed from wishlist");
      } else {
        // Rollback optimistic update
        setItems(previousItems);
        toast.error("Failed to remove from wishlist");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      // Rollback optimistic update
      setItems(previousItems);
      toast.error("Failed to remove from wishlist");
    }
  }

  async function toggleWishlist(productId: string, productName?: string) {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId, productName);
    }
  }

  async function clearWishlist() {
    // Optimistic update
    const previousItems = items;
    setItems([]);

    try {
      const success = user
        ? await clearWishlistDB(user.id)
        : await clearGuestWishlist(sessionId);

      if (success) {
        toast.success("Wishlist cleared");
      } else {
        // Rollback optimistic update
        setItems(previousItems);
        toast.error("Failed to clear wishlist");
      }
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      // Rollback optimistic update
      setItems(previousItems);
      toast.error("Failed to clear wishlist");
    }
  }

  const value: WishlistContextType = {
    items,
    totalItems: items.length,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    loading,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
