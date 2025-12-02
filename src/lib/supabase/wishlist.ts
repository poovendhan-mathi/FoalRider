import { getSupabaseBrowserClient } from "./client";

export interface WishlistItem {
  id: string;
  user_id: string | null;
  session_id: string | null;
  product_id: string;
  created_at: string;
  // Phase 5 enhancements
  price_at_add?: number;
  notify_on_sale?: boolean;
  notify_on_restock?: boolean;
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image_url: string;
    category_id: string;
  };
}

/**
 * Get wishlist items for authenticated user
 */
export async function getUserWishlist(userId: string): Promise<WishlistItem[]> {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("wishlists")
    .select(
      `
      *,
      product:products(
        id,
        name,
        slug,
        price,
        image_url,
        category_id
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user wishlist:", error);
    return [];
  }

  return data || [];
}

/**
 * Get wishlist items for guest user by session ID
 */
export async function getGuestWishlist(
  sessionId: string
): Promise<WishlistItem[]> {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("wishlists")
    .select(
      `
      *,
      product:products(
        id,
        name,
        slug,
        price,
        image_url,
        category_id
      )
    `
    )
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching guest wishlist:", error);
    return [];
  }

  return data || [];
}

/**
 * Add product to wishlist for authenticated user
 */
export async function addToWishlist(
  userId: string,
  productId: string
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase.from("wishlists").insert({
    user_id: userId,
    product_id: productId,
    session_id: null,
  });

  if (error) {
    console.error("Error adding to wishlist:", error);
    return false;
  }

  return true;
}

/**
 * Add product to wishlist for guest user
 */
export async function addToGuestWishlist(
  sessionId: string,
  productId: string
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase.from("wishlists").insert({
    user_id: null,
    session_id: sessionId,
    product_id: productId,
  });

  if (error) {
    console.error("Error adding to guest wishlist:", error);
    return false;
  }

  return true;
}

/**
 * Remove product from wishlist for authenticated user
 */
export async function removeFromWishlist(
  userId: string,
  productId: string
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) {
    console.error("Error removing from wishlist:", error);
    return false;
  }

  return true;
}

/**
 * Remove product from wishlist for guest user
 */
export async function removeFromGuestWishlist(
  sessionId: string,
  productId: string
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("session_id", sessionId)
    .eq("product_id", productId);

  if (error) {
    console.error("Error removing from guest wishlist:", error);
    return false;
  }

  return true;
}

/**
 * Check if product is in user's wishlist
 */
export async function isInWishlist(
  userId: string,
  productId: string
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error checking wishlist:", error);
    return false;
  }

  return !!data;
}

/**
 * Check if product is in guest's wishlist
 */
export async function isInGuestWishlist(
  sessionId: string,
  productId: string
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("wishlists")
    .select("id")
    .eq("session_id", sessionId)
    .eq("product_id", productId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error checking guest wishlist:", error);
    return false;
  }

  return !!data;
}

/**
 * Sync guest wishlist to user account after login
 */
export async function syncGuestWishlist(
  sessionId: string,
  userId: string
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();

  // Get guest wishlist items
  const { data: guestItems, error: fetchError } = await supabase
    .from("wishlists")
    .select("product_id")
    .eq("session_id", sessionId);

  if (fetchError || !guestItems || guestItems.length === 0) {
    return true; // Nothing to sync
  }

  // Get existing user wishlist items
  const { data: userItems, error: userFetchError } = await supabase
    .from("wishlists")
    .select("product_id")
    .eq("user_id", userId);

  if (userFetchError) {
    console.error("Error fetching user wishlist:", userFetchError);
    return false;
  }

  const existingProductIds = new Set(
    userItems?.map((item: { product_id: string }) => item.product_id) || []
  );

  // Filter out items that already exist in user's wishlist
  const itemsToSync = guestItems
    .filter(
      (item: { product_id: string }) => !existingProductIds.has(item.product_id)
    )
    .map((item: { product_id: string }) => ({
      user_id: userId,
      product_id: item.product_id,
      session_id: null,
    }));

  if (itemsToSync.length > 0) {
    // Insert new items
    const { error: insertError } = await supabase
      .from("wishlists")
      .insert(itemsToSync);

    if (insertError) {
      console.error("Error syncing wishlist:", insertError);
      return false;
    }
  }

  // Delete guest wishlist items
  const { error: deleteError } = await supabase
    .from("wishlists")
    .delete()
    .eq("session_id", sessionId);

  if (deleteError) {
    console.error("Error deleting guest wishlist:", deleteError);
    return false;
  }

  return true;
}

/**
 * Clear all wishlist items for user
 */
export async function clearWishlist(userId: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("Error clearing wishlist:", error);
    return false;
  }

  return true;
}

/**
 * Clear all wishlist items for guest
 */
export async function clearGuestWishlist(sessionId: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("session_id", sessionId);

  if (error) {
    console.error("Error clearing guest wishlist:", error);
    return false;
  }

  return true;
}
