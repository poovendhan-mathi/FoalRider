"use client";

import React from "react";
import Link from "next/link";
import { useWishlist } from "@/contexts/WishlistContext";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

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
    if (confirm("Are you sure you want to clear your entire wishlist?")) {
      await clearWishlist();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] pt-24">
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
      <div className="min-h-screen bg-[#FAFAFA] pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <Badge variant="outline-gold" className="mb-4">
              WISHLIST
            </Badge>
            <h1 className="font-['Playfair_Display'] text-4xl font-bold text-black">
              My Wishlist
            </h1>
          </div>

          <Card variant="elevated" className="max-w-lg mx-auto rounded-2xl">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-[#C5A572]/10 flex items-center justify-center mb-6">
                <Heart className="h-12 w-12 text-[#C5A572] stroke-[1.5]" />
              </div>
              <h2 className="font-['Playfair_Display'] text-2xl font-semibold mb-4 text-black">
                Your wishlist is empty
              </h2>
              <p className="font-['Montserrat'] text-[#4B5563] mb-8">
                Save your favorite items to your wishlist and shop them later!
              </p>
              <Link href="/products">
                <Button
                  size="lg"
                  variant="gold"
                  className="font-['Montserrat']"
                >
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <Badge variant="outline-gold" className="mb-2">
              WISHLIST
            </Badge>
            <h1 className="font-['Playfair_Display'] text-4xl font-bold text-black">
              My Wishlist
            </h1>
            <p className="font-['Montserrat'] text-[#9CA3AF] mt-2">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline-gold"
              onClick={handleMoveAllToCart}
              disabled={items.length === 0}
              className="font-['Montserrat']"
            >
              <ShoppingCart className="h-4 w-4 mr-2 stroke-[1.5]" />
              Move All to Cart
            </Button>
            <Button
              variant="outline"
              onClick={handleClearAll}
              disabled={items.length === 0}
              className="font-['Montserrat'] hover:bg-red-50 hover:text-red-600 hover:border-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2 stroke-[1.5]" />
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

            return <ProductCard key={item.id} product={product} />;
          })}
        </div>
      </div>
    </div>
  );
}
