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
  if (product.product_images && product.product_images.length > 0) {
    const sortedImages = [...product.product_images].sort(
      (a, b) => a.sort_order - b.sort_order
    );
    return sortedImages[0].url;
  }

  if (product.image_url) {
    return product.image_url;
  }

  return "/assets/images/product-placeholder.svg";
}

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
    <article className="group">
      {/* Image Container */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] bg-[#F5F5F5] overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                inWishlist
                  ? "fill-black stroke-black"
                  : "stroke-gray-700 fill-transparent"
              }`}
            />
          </button>

          {/* Out of Stock Badge */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-xs font-medium tracking-wider uppercase text-gray-600">
                Sold Out
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="pt-4 space-y-1">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-normal text-gray-900 line-clamp-1 group-hover:underline underline-offset-2">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm font-medium text-black">
          {formatPrice(product.price)}
        </p>
      </div>
    </article>
  );
}
