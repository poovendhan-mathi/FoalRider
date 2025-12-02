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
 * Adidas-style Product Card
 * - Clean, borderless design
 * - Large product image (4:5 aspect ratio)
 * - Minimal wishlist heart icon
 * - Price below image with sale styling
 * - No description on card
 */
export function ProductCard({ product }: ProductCardProps) {
  const { formatPrice } = useCurrency();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const imageUrl = getProductImageUrl(product);
  const isOutOfStock = product.inventory <= 0;
  const inWishlist = isInWishlist(product.id);

  // Calculate if on sale (example: 20% off for demo)
  const originalPrice = product.price * 1.25;
  const isOnSale = false; // Set to true to show sale styling
  const discountPercent = isOnSale
    ? Math.round((1 - product.price / originalPrice) * 100)
    : 0;

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product.id, product.name);
  };

  return (
    <article className="group relative">
      {/* Image Container - Full width, no border, flat bg */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] bg-[#F5F5F5] overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Wishlist Button - Top right, minimal outline style */}
          <button
            onClick={handleWishlistClick}
            className="absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-200 bg-white/80 hover:bg-white"
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-5 h-5 transition-all duration-200 ${
                inWishlist
                  ? "fill-black stroke-black"
                  : "stroke-black stroke-[1.5] fill-transparent hover:fill-black/10"
              }`}
            />
          </button>

          {/* Stock Badge - Only show for out of stock or low stock */}
          {isOutOfStock && (
            <span className="absolute top-3 left-3 fr-label bg-black text-white px-2 py-1">
              SOLD OUT
            </span>
          )}

          {product.inventory <= 5 && product.inventory > 0 && (
            <span className="absolute top-3 left-3 fr-label bg-[#FF6B00] text-white px-2 py-1">
              ONLY {product.inventory} LEFT
            </span>
          )}

          {/* Discount Badge */}
          {isOnSale && (
            <span className="absolute bottom-3 left-3 fr-label bg-[#CF0000] text-white px-2 py-1">
              -{discountPercent}%
            </span>
          )}
        </div>
      </Link>

      {/* Product Info - Minimal padding, clean layout */}
      <div className="pt-3 pb-2">
        {/* Price Row */}
        <div className="flex items-center gap-2 mb-1">
          {isOnSale ? (
            <>
              <span className="fr-price-sale">
                {formatPrice(product.price)}
              </span>
              <span className="fr-price-original">
                {formatPrice(originalPrice)}
              </span>
            </>
          ) : (
            <span className="fr-price">{formatPrice(product.price)}</span>
          )}
        </div>

        {/* Product Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="fr-product-name line-clamp-2 group-hover:underline">
            {product.name}
          </h3>
        </Link>

        {/* Category - Small gray text */}
        {product.categories && (
          <p className="fr-meta mt-1">{product.categories.name}</p>
        )}
      </div>
    </article>
  );
}
