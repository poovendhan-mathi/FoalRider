"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { Product } from "@/lib/products";

interface ProductCardProps {
  product: Product;
}

function getProductImageUrl(product: Product): string {
  // First, try to get image from product_images relation
  if (product.product_images && product.product_images.length > 0) {
    const sortedImages = [...product.product_images].sort(
      (a, b) => a.sort_order - b.sort_order
    );
    return sortedImages[0].url;
  }

  // Fallback to image_url field
  if (product.image_url) {
    return product.image_url;
  }

  // Fallback to placeholder
  return "/assets/images/product-placeholder.jpg";
}

/**
 * Levi's-style Product Card
 * - Clean, minimal design
 * - White background
 * - Large product image with model
 * - Wishlist heart icon
 * - Product name and price only
 */
export function ProductCard({ product }: ProductCardProps) {
  const { formatPrice } = useCurrency();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const imageUrl = getProductImageUrl(product);
  const isOutOfStock = product.inventory <= 0;
  const inWishlist = isInWishlist(product.id);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product.id, product.name);
  };

  return (
    <article className="group relative">
      {/* Image Container */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            className="absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-200 bg-white hover:bg-gray-100 shadow-sm"
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-4 h-4 transition-all duration-200 ${
                inWishlist
                  ? "fill-red-500 stroke-red-500"
                  : "stroke-gray-600 fill-transparent"
              }`}
            />
          </button>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="bg-black text-white text-xs font-semibold px-3 py-1 uppercase">
                Sold Out
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info - Simple and clean like Levi's */}
      <div className="pt-3">
        {/* Product Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-black line-clamp-2 hover:underline leading-tight">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <p className="text-sm font-semibold text-black mt-1">
          {formatPrice(product.price)}
        </p>
      </div>
    </article>
  );
}
