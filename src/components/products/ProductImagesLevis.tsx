"use client";

import { useState } from "react";
import Image from "next/image";
import { getProductImageUrl } from "@/lib/product-helpers";
import type { Product } from "@/lib/products";
import { Heart, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";

interface ProductImagesLevisProps {
  product: Product;
}

/**
 * Levi's-style Product Images Component
 * Features vertical thumbnail strip on the left side
 * Large main image on the right
 * Wishlist button overlay
 */
export function ProductImagesLevis({ product }: ProductImagesLevisProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  // Get all available images
  const images =
    product.product_images && product.product_images.length > 0
      ? product.product_images
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((img) => img.url)
      : product.image_url
      ? [product.image_url]
      : [getProductImageUrl(product)];

  const maxVisibleThumbnails = 4;
  const canScrollUp = thumbnailStartIndex > 0;
  const canScrollDown =
    thumbnailStartIndex + maxVisibleThumbnails < images.length;

  const scrollThumbnails = (direction: "up" | "down") => {
    if (direction === "up" && canScrollUp) {
      setThumbnailStartIndex((prev) => Math.max(0, prev - 1));
    } else if (direction === "down" && canScrollDown) {
      setThumbnailStartIndex((prev) =>
        Math.min(images.length - maxVisibleThumbnails, prev + 1)
      );
    }
  };

  const visibleThumbnails = images.slice(
    thumbnailStartIndex,
    thumbnailStartIndex + maxVisibleThumbnails
  );

  const handleWishlistClick = () => {
    toggleWishlist(product.id, product.name);
  };

  return (
    <div className="flex gap-4">
      {/* Vertical Thumbnail Strip */}
      {images.length > 1 && (
        <div className="hidden md:flex flex-col items-center gap-2 w-20">
          {/* Scroll Up Button */}
          {images.length > maxVisibleThumbnails && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scrollThumbnails("up")}
              disabled={!canScrollUp}
              className="h-8 w-8 rounded-none border border-gray-200 disabled:opacity-30"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          )}

          {/* Thumbnails */}
          <div className="flex flex-col gap-2">
            {visibleThumbnails.map((image, idx) => {
              const actualIndex = thumbnailStartIndex + idx;
              return (
                <button
                  key={actualIndex}
                  onClick={() => setCurrentImageIndex(actualIndex)}
                  className={`relative w-16 h-20 border transition-all ${
                    currentImageIndex === actualIndex
                      ? "border-black border-2"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} view ${actualIndex + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              );
            })}
          </div>

          {/* Scroll Down Button */}
          {images.length > maxVisibleThumbnails && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scrollThumbnails("down")}
              disabled={!canScrollDown}
              className="h-8 w-8 rounded-none border border-gray-200 disabled:opacity-30"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Main Image */}
      <div className="relative flex-1 aspect-[3/4] bg-gray-100">
        <Image
          src={images[currentImageIndex]}
          alt={`${product.name}`}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Wishlist Button - Top Right */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleWishlistClick}
          className={`absolute top-4 right-4 h-10 w-10 rounded-full bg-white shadow-md hover:bg-gray-100 ${
            inWishlist ? "text-red-500" : "text-gray-600"
          }`}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`h-5 w-5 ${inWishlist ? "fill-current" : ""}`} />
        </Button>

        {/* Mobile Thumbnails - Horizontal */}
        {images.length > 1 && (
          <div className="md:hidden absolute bottom-4 left-4 right-4 flex justify-center gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentImageIndex === idx ? "bg-black w-6" : "bg-gray-400"
                }`}
                aria-label={`View image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
