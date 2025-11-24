'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import type { Product } from '@/lib/products';
import {
  getUserCart,
  getGuestCart,
  addToUserCart,
  addToGuestCart,
  updateCartQuantity,
  removeFromCart as removeFromCartDB,
  clearUserCart,
  clearGuestCart,
  syncGuestCart,
  CartItem as DBCartItem,
} from '@/lib/supabase/cart';
import { toast } from 'sonner';

interface CartItem {
  product: Product;
  quantity: number;
  variantId?: string;
  size?: string;
  color?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Generate or retrieve session ID for guest users
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('cart_session_id');
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('cart_session_id', sessionId);
  }
  return sessionId;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string>('');
  const [hasLoadedInitialCart, setHasLoadedInitialCart] = useState(false);

  // Get user safely
  const user = auth?.user ?? null;

  // Initialize sessionId on client side only
  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  // Load cart on mount and when user changes
  useEffect(() => {
    if ((sessionId || user) && !hasLoadedInitialCart) {
      loadCart();
      setHasLoadedInitialCart(true);
    }
  }, [user, sessionId, hasLoadedInitialCart]);

  // Sync guest cart when user logs in
  useEffect(() => {
    if (user && sessionId && hasLoadedInitialCart) {
      handleUserLogin();
    }
  }, [user, sessionId, hasLoadedInitialCart]);

  async function loadCart() {
    // Skip loading during SSR
    if (typeof window === 'undefined') return;
    
    setLoading(true);
    try {
      let cartData: DBCartItem[] = [];
      
      if (user) {
        cartData = await getUserCart(user.id);
      } else if (sessionId) {
        cartData = await getGuestCart(sessionId);
      }

      // Ensure cartData is always an array
      if (!Array.isArray(cartData)) {
        cartData = [];
      }

      // Transform DB cart items to CartItem format
      const transformedItems: CartItem[] = cartData
        .filter(item => item && item.product) // Filter out items with deleted products
        .map(item => ({
          product: {
            id: item.product!.id,
            name: item.product!.name,
            slug: item.product!.slug,
            description: null,
            price: item.product!.price,
            inventory: item.product!.inventory,
            is_active: true,
            category_id: item.product!.category_id,
            image_url: item.product!.image_url,
            created_at: new Date().toISOString(),
          },
          quantity: item.quantity,
          variantId: item.variant_id || undefined,
        }));

      setItems(transformedItems);
    } catch (error) {
      console.error('Error loading cart:', error);
      // Only show toast if user is actively interacting
      if (hasLoadedInitialCart) {
        toast.error('Failed to load cart');
      }
      setItems([]); // Set empty cart on error
    } finally {
      setLoading(false);
    }
  }

  async function handleUserLogin() {
    try {
      // Sync guest cart to user account
      await syncGuestCart(sessionId, user!.id);
      // Reload cart
      await loadCart();
    } catch (error) {
      console.error('Error syncing cart:', error);
    }
  }

  const addToCart = async (product: Product, quantity: number = 1) => {
    // Optimistic update
    const existingItem = items.find((item) => item.product.id === product.id);
    
    if (existingItem) {
      setItems(prevItems =>
        prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setItems(prevItems => [...prevItems, { product, quantity }]);
    }

    // Update database
    try {
      const success = user
        ? await addToUserCart(user.id, product.id, quantity)
        : await addToGuestCart(sessionId, product.id, quantity);

      if (!success) {
        // Rollback optimistic update
        await loadCart();
        toast.error('Failed to add to cart');
      } else {
        toast.success('Added to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      await loadCart(); // Reload to sync
      toast.error('Failed to add to cart');
    }
  };

  const removeFromCart = async (productId: string) => {
    // Find the cart item
    const item = items.find(i => i.product.id === productId);
    if (!item) return;

    // Optimistic update
    const previousItems = items;
    setItems(prevItems => prevItems.filter((item) => item.product.id !== productId));

    try {
      // Get the database cart item ID
      const cartData = user 
        ? await getUserCart(user.id)
        : await getGuestCart(sessionId);
      
      const dbItem = cartData.find(c => c.product_id === productId);
      
      if (dbItem) {
        const success = await removeFromCartDB(dbItem.id);
        if (!success) {
          // Rollback
          setItems(previousItems);
          toast.error('Failed to remove from cart');
        }
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      setItems(previousItems);
      toast.error('Failed to remove from cart');
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    // Optimistic update
    const previousItems = items;
    setItems(prevItems =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );

    try {
      // Get the database cart item ID
      const cartData = user 
        ? await getUserCart(user.id)
        : await getGuestCart(sessionId);
      
      const dbItem = cartData.find(c => c.product_id === productId);
      
      if (dbItem) {
        const success = await updateCartQuantity(dbItem.id, quantity);
        if (!success) {
          // Rollback
          setItems(previousItems);
          toast.error('Failed to update quantity');
        }
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      setItems(previousItems);
      toast.error('Failed to update quantity');
    }
  };

  const clearCart = async () => {
    const previousItems = items;
    setItems([]);

    try {
      const success = user
        ? await clearUserCart(user.id)
        : await clearGuestCart(sessionId);

      if (!success) {
        setItems(previousItems);
        toast.error('Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      setItems(previousItems);
      toast.error('Failed to clear cart');
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
