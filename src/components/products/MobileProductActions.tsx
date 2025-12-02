"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, Heart, Plus, Minus } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";
import type { Product } from "@/lib/products";

interface MobileProductActionsProps {
  product: Product;
}

/**
 * Mobile Sticky Add to Cart Bar
 * Shows at the bottom of the screen on mobile when scrolled past the main CTA
 * Includes: Price, Quantity selector, Add to Cart, Wishlist
 */
export function MobileProductActions({ product }: MobileProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isOutOfStock = product.inventory <= 0;
  const inWishlist = isInWishlist(product.id);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 400px (past the main add to cart button)
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${quantity} × ${product.name} added to cart`);
  };

  const handleWishlistToggle = async () => {
    await toggleWishlist(product.id, product.name);
  };

  // Only show on mobile when visible
  if (!isVisible) return null;

  return (
    <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg safe-area-bottom animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center gap-3 p-3">
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="p-3 rounded-full border border-gray-200 hover:border-gray-300 transition-colors"
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-5 w-5 ${
              inWishlist ? "fill-black stroke-black" : "stroke-gray-600"
            }`}
          />
        </button>

        {/* Quantity Selector */}
        {!isOutOfStock && (
          <div className="flex items-center gap-1 border border-gray-200 rounded-full">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="p-2 disabled:opacity-50"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-[2rem] text-center font-medium">
              {quantity}
            </span>
            <button
              onClick={() =>
                setQuantity(Math.min(product.inventory, quantity + 1))
              }
              disabled={quantity >= product.inventory}
              className="p-2 disabled:opacity-50"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Add to Cart Button with Price */}
        <Button
          className="flex-1 bg-black text-white hover:bg-gray-800 h-12 font-semibold"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isOutOfStock
            ? "Sold Out"
            : `Add • ${formatPrice(product.price * quantity)}`}
        </Button>
      </div>
    </div>
  );
}
