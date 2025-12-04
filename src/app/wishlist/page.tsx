"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Bell,
  BellOff,
  TrendingDown,
  Share2,
  Grid,
  LayoutList,
  X,
  AlertTriangle,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import type { WishlistItem } from "@/lib/supabase/wishlist";

/**
 * Enhanced Wishlist Card with Price Tracking
 */
function WishlistItemCard({
  item,
  viewMode,
  onRemove,
  onAddToCart,
  onToggleNotification,
}: {
  item: WishlistItem;
  viewMode: "grid" | "list";
  onRemove: () => void;
  onAddToCart: () => void;
  onToggleNotification: () => void;
}) {
  const { formatPrice } = useCurrency();
  const [notifyOnSale, setNotifyOnSale] = useState(
    item.notify_on_sale || false
  );

  const product = item.product;
  if (!product) return null;

  const priceAtAdd = item.price_at_add || product.price;
  const currentPrice = product.price;
  const priceDropped = currentPrice < priceAtAdd;
  const priceDrop = priceAtAdd - currentPrice;
  const priceDropPercent = Math.round((priceDrop / priceAtAdd) * 100);

  const handleToggleNotify = () => {
    setNotifyOnSale(!notifyOnSale);
    onToggleNotification();
  };

  const imageUrl =
    product.image_url || "/assets/images/product-placeholder.svg";

  if (viewMode === "list") {
    return (
      <div className="flex gap-4 p-4 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
        {/* Image */}
        <Link href={`/products/${product.slug}`} className="flex-shrink-0">
          <div className="relative w-24 h-32 md:w-32 md:h-40 bg-gray-100 rounded-md overflow-hidden">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover"
            />
            {priceDropped && (
              <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                -{priceDropPercent}%
              </div>
            )}
          </div>
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-medium text-black hover:underline line-clamp-2 mb-1">
              {product.name}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-black">
              {formatPrice(currentPrice)}
            </span>
            {priceDropped && (
              <>
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(priceAtAdd)}
                </span>
                <span className="text-xs text-green-600 font-medium flex items-center">
                  <TrendingDown className="h-3 w-3 mr-0.5" />
                  Price dropped!
                </span>
              </>
            )}
          </div>

          {/* Added date */}
          <p className="text-xs text-gray-400 mb-3">
            Added {new Date(item.created_at).toLocaleDateString()}
          </p>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="bg-black text-white hover:bg-gray-800 h-8 text-xs"
              onClick={onAddToCart}
            >
              <ShoppingCart className="h-3 w-3 mr-1" />
              Add to Cart
            </Button>
            <Button
              size="sm"
              variant="outline"
              className={`h-8 text-xs ${
                notifyOnSale ? "border-[#C5A572] text-[#C5A572]" : ""
              }`}
              onClick={handleToggleNotify}
            >
              {notifyOnSale ? (
                <>
                  <Bell className="h-3 w-3 mr-1 fill-current" />
                  Notifying
                </>
              ) : (
                <>
                  <BellOff className="h-3 w-3 mr-1" />
                  Notify on Sale
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Remove button */}
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 transition-colors p-1"
          aria-label="Remove from wishlist"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    );
  }

  // Grid view
  return (
    <div className="group bg-white rounded-lg border border-gray-100 overflow-hidden hover:border-gray-200 transition-colors">
      {/* Image */}
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {priceDropped && (
            <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center">
              <TrendingDown className="h-3 w-3 mr-1" />-{priceDropPercent}% OFF
            </div>
          )}

          {/* Quick actions overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
            <Button
              size="sm"
              className="bg-white text-black hover:bg-gray-100 shadow-lg"
              onClick={(e) => {
                e.preventDefault();
                onAddToCart();
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>

          {/* Remove button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onRemove();
            }}
            className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Remove from wishlist"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        {/* Price */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-black">
            {formatPrice(currentPrice)}
          </span>
          {priceDropped && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(priceAtAdd)}
            </span>
          )}
        </div>

        {/* Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-black hover:underline line-clamp-2 text-sm mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Notification toggle */}
        <button
          onClick={handleToggleNotify}
          className={`text-xs flex items-center gap-1 transition-colors ${
            notifyOnSale
              ? "text-[#C5A572]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          {notifyOnSale ? (
            <>
              <Bell className="h-3 w-3 fill-current" />
              Price alerts on
            </>
          ) : (
            <>
              <BellOff className="h-3 w-3" />
              Get price alerts
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const { items, totalItems, clearWishlist, removeFromWishlist, loading } =
    useWishlist();
  const { addToCart } = useCart();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showClearDialog, setShowClearDialog] = useState(false);

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
          inventory: 999,
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

  const handleAddToCart = async (item: WishlistItem) => {
    if (!item.product) return;

    const product = {
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      description: null,
      price: item.product.price,
      inventory: 999,
      is_active: true,
      category_id: item.product.category_id,
      image_url: item.product.image_url,
      created_at: new Date().toISOString(),
    };
    await addToCart(product, 1);
    toast.success(`${item.product.name} added to cart`);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleToggleNotification = async (_productId: string) => {
    // TODO: Implement API call to update notification preference
    toast.success("Notification preference updated");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Wishlist - Foal Rider",
          text: "Check out my wishlist!",
          url: window.location.href,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const handleClearAll = async () => {
    setShowClearDialog(true);
  };

  const confirmClearAll = async () => {
    await clearWishlist();
    setShowClearDialog(false);
    toast.success("Wishlist cleared");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] pt-16">
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
      <div className="min-h-screen bg-[#FAFAFA] pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <Badge variant="outline-gold" className="mb-4">
              WISHLIST
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-black">
              My Wishlist
            </h1>
          </div>

          <Card className="max-w-lg mx-auto rounded-2xl">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-[#C5A572]/10 flex items-center justify-center mb-6">
                <Heart className="h-12 w-12 text-[#C5A572] stroke-[1.5]" />
              </div>
              <h2 className="text-2xl font-semibold mb-4 text-black">
                Your wishlist is empty
              </h2>
              <p className="text-gray-500 mb-8">
                Save your favorite items to your wishlist and shop them later!
              </p>
              <Link href="/products">
                <Button
                  size="lg"
                  className="bg-black text-white hover:bg-gray-800"
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
    <div className="min-h-screen bg-[#FAFAFA] pt-16">
      {/* Clear Confirmation Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-center">Clear Wishlist?</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to remove all items from your wishlist? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setShowClearDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmClearAll}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <Badge variant="outline-gold" className="mb-2">
                WISHLIST
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-black">
                My Wishlist
              </h1>
              <p className="text-gray-500 mt-2">
                {totalItems} {totalItems === 1 ? "item" : "items"} saved
              </p>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                className="bg-black text-white hover:bg-gray-800"
                onClick={handleMoveAllToCart}
                disabled={items.length === 0}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add All to Cart
              </Button>
              <Button
                variant="outline"
                onClick={handleClearAll}
                disabled={items.length === 0}
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>

          {/* View Toggle & Mobile Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${
                  viewMode === "grid"
                    ? "bg-black text-white"
                    : "text-gray-500 hover:text-black"
                }`}
                aria-label="Grid view"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${
                  viewMode === "list"
                    ? "bg-black text-white"
                    : "text-gray-500 hover:text-black"
                }`}
                aria-label="List view"
              >
                <LayoutList className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                className="bg-black text-white hover:bg-gray-800"
                onClick={handleMoveAllToCart}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add All
              </Button>
            </div>
          </div>
        </div>

        {/* Items */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {items.map((item) => (
              <WishlistItemCard
                key={item.id}
                item={item}
                viewMode={viewMode}
                onRemove={() => removeFromWishlist(item.product_id)}
                onAddToCart={() => handleAddToCart(item)}
                onToggleNotification={() =>
                  handleToggleNotification(item.product_id)
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <WishlistItemCard
                key={item.id}
                item={item}
                viewMode={viewMode}
                onRemove={() => removeFromWishlist(item.product_id)}
                onAddToCart={() => handleAddToCart(item)}
                onToggleNotification={() =>
                  handleToggleNotification(item.product_id)
                }
              />
            ))}
          </div>
        )}

        {/* Mobile Clear All */}
        <div className="mt-8 md:hidden">
          <Button
            variant="outline"
            className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-300"
            onClick={handleClearAll}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Wishlist
          </Button>
        </div>
      </div>
    </div>
  );
}
