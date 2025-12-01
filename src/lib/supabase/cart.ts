import { getSupabaseBrowserClient } from "./client";

export interface CartItem {
  id: string;
  user_id: string | null;
  session_id: string | null;
  product_id: string;
  quantity: number;
  variant_id: string | null;
  created_at: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image_url: string;
    category_id: string;
    inventory: number;
  };
}

/**
 * Get cart items for authenticated user
 */
export async function getUserCart(userId: string): Promise<CartItem[]> {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("cart_items")
    .select(
      `
      *,
      product:products(
        id,
        name,
        slug,
        price,
        image_url,
        category_id,
        inventory
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user cart:", error);
    return [];
  }

  return data || [];
}

/**
 * Clean up expired guest carts (older than 30 days)
 * Called automatically during cart operations to avoid resource-heavy cron jobs
 */
async function cleanupExpiredGuestCarts(): Promise<void> {
  try {
    const supabase = getSupabaseBrowserClient();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Silent cleanup - don't throw errors
    await supabase
      .from("cart_items")
      .delete()
      .is("user_id", null)
      .lt("created_at", thirtyDaysAgo.toISOString());
  } catch (error) {
    // Silent fail - cleanup is not critical
    console.error("Error cleaning up expired carts:", error);
  }
}

/**
 * Get cart items for guest user by session ID
 * Only returns items created within last 30 days
 * Automatically cleans up old carts
 */
export async function getGuestCart(sessionId: string): Promise<CartItem[]> {
  const supabase = getSupabaseBrowserClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Trigger cleanup in background (no await to avoid blocking)
  cleanupExpiredGuestCarts();

  const { data, error } = await supabase
    .from("cart_items")
    .select(
      `
      *,
      product:products(
        id,
        name,
        slug,
        price,
        image_url,
        category_id,
        inventory
      )
    `
    )
    .eq("session_id", sessionId)
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching guest cart:", error);
    return [];
  }

  return data || [];
}

/**
 * Add item to cart for authenticated user
 */
export async function addToUserCart(
  userId: string,
  productId: string,
  quantity: number,
  variantId?: string | null
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();

  try {
    // Check if item already exists
    let query = supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", userId)
      .eq("product_id", productId);

    // Handle variant_id correctly - check if it's null or has a value
    if (variantId) {
      query = query.eq("variant_id", variantId);
    } else {
      query = query.is("variant_id", null);
    }

    const { data: existing, error: fetchError } = await query.maybeSingle();

    if (fetchError) {
      console.error("Error fetching existing cart item:", fetchError);
      return false;
    }

    if (existing) {
      // Update quantity
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id);

      if (error) {
        console.error("Error updating cart:", error);
        return false;
      }
    } else {
      // Insert new item - use direct insert, not upsert
      // If duplicate occurs, we'll catch it and update
      const { error } = await supabase.from("cart_items").insert({
        user_id: userId,
        product_id: productId,
        quantity,
        variant_id: variantId || null,
      });

      if (error) {
        // If duplicate error (23505), fetch existing and update
        if (error.code === "23505") {
          console.log("Duplicate detected, updating quantity instead");
          const { data: existingItem } = await query.maybeSingle();
          if (existingItem) {
            const { error: updateError } = await supabase
              .from("cart_items")
              .update({ quantity: existingItem.quantity + quantity })
              .eq("id", existingItem.id);

            if (updateError) {
              console.error(
                "Error updating cart after duplicate:",
                updateError
              );
              return false;
            }
            return true;
          }
        }

        console.error("Error adding to cart:", error.message || error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Unexpected error in addToUserCart:", error);
    return false;
  }
}

/**
 * Add item to cart for guest user
 */
export async function addToGuestCart(
  sessionId: string,
  productId: string,
  quantity: number,
  variantId?: string | null
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();

  try {
    // Check if item already exists
    let query = supabase
      .from("cart_items")
      .select("id, quantity")
      .is("user_id", null)
      .eq("session_id", sessionId)
      .eq("product_id", productId);

    // Handle variant_id correctly - check if it's null or has a value
    if (variantId) {
      query = query.eq("variant_id", variantId);
    } else {
      query = query.is("variant_id", null);
    }

    const { data: existing, error: fetchError } = await query.maybeSingle();

    if (fetchError) {
      console.error("Error fetching existing cart item:", fetchError);
      return false;
    }

    if (existing) {
      // Update quantity
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id);

      if (error) {
        console.error("Error updating guest cart:", error);
        return false;
      }
    } else {
      // Insert new item with upsert to handle race conditions
      const { error } = await supabase.from("cart_items").upsert(
        {
          user_id: null,
          session_id: sessionId,
          product_id: productId,
          quantity,
          variant_id: variantId || null,
        },
        {
          onConflict: "user_id,product_id,variant_id",
          ignoreDuplicates: false,
        }
      );

      if (error) {
        // If still duplicate, try to update instead
        if (error.code === "23505") {
          console.log("Duplicate detected, updating quantity instead");
          const { data: existingItem } = await query.maybeSingle();
          if (existingItem) {
            const { error: updateError } = await supabase
              .from("cart_items")
              .update({ quantity: existingItem.quantity + quantity })
              .eq("id", existingItem.id);

            if (updateError) {
              console.error(
                "Error updating cart after duplicate:",
                updateError
              );
              return false;
            }
            return true;
          }
        }

        console.error("Error adding to guest cart:", error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Unexpected error in addToGuestCart:", error);
    return false;
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartQuantity(
  cartItemId: string,
  quantity: number
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();

  if (quantity <= 0) {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId);

    if (error) {
      console.error("Error removing cart item:", error);
      return false;
    }
  } else {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", cartItemId);

    if (error) {
      console.error("Error updating quantity:", error);
      return false;
    }
  }

  return true;
}

/**
 * Remove item from cart
 */
export async function removeFromCart(cartItemId: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", cartItemId);

  if (error) {
    console.error("Error removing from cart:", error);
    return false;
  }

  return true;
}

/**
 * Clear cart for user
 */
export async function clearUserCart(userId: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("Error clearing cart:", error);
    return false;
  }

  return true;
}

/**
 * Clear cart for guest
 */
export async function clearGuestCart(sessionId: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("session_id", sessionId);

  if (error) {
    console.error("Error clearing guest cart:", error);
    return false;
  }

  return true;
}

/**
 * Sync guest cart to user account after login
 */
export async function syncGuestCart(
  sessionId: string,
  userId: string
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();

  // Get guest cart items
  const { data: guestItems, error: fetchError } = await supabase
    .from("cart_items")
    .select("product_id, quantity, variant_id")
    .eq("session_id", sessionId);

  if (fetchError || !guestItems || guestItems.length === 0) {
    return true; // Nothing to sync
  }

  // Get existing user cart items
  const { data: userItems, error: userFetchError } = await supabase
    .from("cart_items")
    .select("product_id, variant_id, id, quantity")
    .eq("user_id", userId);

  if (userFetchError) {
    console.error("Error fetching user cart:", userFetchError);
    return false;
  }

  // Merge guest items with user cart
  for (const guestItem of guestItems) {
    const existingItem = userItems?.find(
      (item: { product_id: string; variant_id: string | null }) =>
        item.product_id === guestItem.product_id &&
        ((item.variant_id === null && guestItem.variant_id === null) ||
          item.variant_id === guestItem.variant_id)
    );

    if (existingItem) {
      // Update quantity
      await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + guestItem.quantity })
        .eq("id", existingItem.id);
    } else {
      // Add new item
      await supabase.from("cart_items").insert({
        user_id: userId,
        product_id: guestItem.product_id,
        quantity: guestItem.quantity,
        variant_id: guestItem.variant_id,
        session_id: null,
      });
    }
  }

  // Delete guest cart items
  await supabase.from("cart_items").delete().eq("session_id", sessionId);

  return true;
}
