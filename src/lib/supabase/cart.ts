import { createClient } from './client';

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
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
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
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user cart:', error);
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
    const supabase = createClient();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Silent cleanup - don't throw errors
    await supabase
      .from('cart_items')
      .delete()
      .is('user_id', null)
      .lt('created_at', thirtyDaysAgo.toISOString());
  } catch (error) {
    // Silent fail - cleanup is not critical
    console.error('Error cleaning up expired carts:', error);
  }
}

/**
 * Get cart items for guest user by session ID
 * Only returns items created within last 30 days
 * Automatically cleans up old carts
 */
export async function getGuestCart(sessionId: string): Promise<CartItem[]> {
  const supabase = createClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Trigger cleanup in background (no await to avoid blocking)
  cleanupExpiredGuestCarts();
  
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
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
    `)
    .eq('session_id', sessionId)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching guest cart:', error);
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
  const supabase = createClient();
  
  // Check if item already exists
  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .is('variant_id', variantId || null)
    .maybeSingle();

  if (existing) {
    // Update quantity
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id);

    if (error) {
      console.error('Error updating cart:', error);
      return false;
    }
  } else {
    // Insert new item
    const { error } = await supabase
      .from('cart_items')
      .insert({
        user_id: userId,
        product_id: productId,
        quantity,
        variant_id: variantId,
        session_id: null,
      });

    if (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  }

  return true;
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
  const supabase = createClient();
  
  // Check if item already exists
  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('session_id', sessionId)
    .eq('product_id', productId)
    .is('variant_id', variantId || null)
    .maybeSingle();

  if (existing) {
    // Update quantity
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id);

    if (error) {
      console.error('Error updating guest cart:', error);
      return false;
    }
  } else {
    // Insert new item
    const { error } = await supabase
      .from('cart_items')
      .insert({
        user_id: null,
        session_id: sessionId,
        product_id: productId,
        quantity,
        variant_id: variantId,
      });

    if (error) {
      console.error('Error adding to guest cart:', error);
      return false;
    }
  }

  return true;
}

/**
 * Update cart item quantity
 */
export async function updateCartQuantity(
  cartItemId: string,
  quantity: number
): Promise<boolean> {
  const supabase = createClient();
  
  if (quantity <= 0) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) {
      console.error('Error removing cart item:', error);
      return false;
    }
  } else {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId);

    if (error) {
      console.error('Error updating quantity:', error);
      return false;
    }
  }

  return true;
}

/**
 * Remove item from cart
 */
export async function removeFromCart(cartItemId: string): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId);

  if (error) {
    console.error('Error removing from cart:', error);
    return false;
  }

  return true;
}

/**
 * Clear cart for user
 */
export async function clearUserCart(userId: string): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error clearing cart:', error);
    return false;
  }

  return true;
}

/**
 * Clear cart for guest
 */
export async function clearGuestCart(sessionId: string): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('session_id', sessionId);

  if (error) {
    console.error('Error clearing guest cart:', error);
    return false;
  }

  return true;
}

/**
 * Sync guest cart to user account after login
 */
export async function syncGuestCart(sessionId: string, userId: string): Promise<boolean> {
  const supabase = createClient();

  // Get guest cart items
  const { data: guestItems, error: fetchError } = await supabase
    .from('cart_items')
    .select('product_id, quantity, variant_id')
    .eq('session_id', sessionId);

  if (fetchError || !guestItems || guestItems.length === 0) {
    return true; // Nothing to sync
  }

  // Get existing user cart items
  const { data: userItems, error: userFetchError } = await supabase
    .from('cart_items')
    .select('product_id, variant_id, id, quantity')
    .eq('user_id', userId);

  if (userFetchError) {
    console.error('Error fetching user cart:', userFetchError);
    return false;
  }

  // Merge guest items with user cart
  for (const guestItem of guestItems) {
    const existingItem = userItems?.find(
      (item) =>
        item.product_id === guestItem.product_id &&
        ((item.variant_id === null && guestItem.variant_id === null) ||
         (item.variant_id === guestItem.variant_id))
    );

    if (existingItem) {
      // Update quantity
      await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + guestItem.quantity })
        .eq('id', existingItem.id);
    } else {
      // Add new item
      await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: guestItem.product_id,
          quantity: guestItem.quantity,
          variant_id: guestItem.variant_id,
          session_id: null,
        });
    }
  }

  // Delete guest cart items
  await supabase
    .from('cart_items')
    .delete()
    .eq('session_id', sessionId);

  return true;
}
