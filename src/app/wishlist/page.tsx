'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '@/contexts/WishlistContext';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

export default function WishlistPage() {
  const { items, totalItems, clearWishlist, loading } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveAllToCart = async () => {
    if (items.length === 0) return;

    let successCount = 0;
    for (const item of items) {
      if (item.product) {
        const product = {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          description: null,
          price: item.product.price,
          inventory: 999, // Default inventory
          is_active: true,
          category_id: item.product.category_id,
          image_url: item.product.image_url,
          created_at: new Date().toISOString(),
        };
        await addToCart(product, 1);
        successCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} item(s) moved to cart`);
      await clearWishlist();
    }
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear your entire wishlist?')) {
      await clearWishlist();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A572]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
          
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Heart className="h-24 w-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-semibold mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">
              Save your favorite items to your wishlist and shop them later!
            </p>
            <Link href="/products">
              <Button size="lg" className="bg-[#C5A572] hover:bg-[#B89968]">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Wishlist</h1>
            <p className="text-gray-600 mt-2">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleMoveAllToCart}
              disabled={items.length === 0}
              className="hover:bg-[#C5A572] hover:text-white"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Move All to Cart
            </Button>
            <Button
              variant="outline"
              onClick={handleClearAll}
              disabled={items.length === 0}
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => {
            if (!item.product) return null;

            const product = {
              id: item.product.id,
              name: item.product.name,
              slug: item.product.slug,
              description: null,
              price: item.product.price,
              inventory: 999, // Default inventory
              is_active: true,
              category_id: item.product.category_id,
              image_url: item.product.image_url,
              created_at: new Date().toISOString(),
            };

            return (
              <ProductCard
                key={item.id}
                product={product}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
