"use client";

import { useState } from "react";
import Image from "next/image";
import { getProductImageUrl } from "@/lib/product-helpers";
import type { Product } from "@/lib/products";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductImagesProps {
  product: Product;
}

export function ProductImages({ product }: ProductImagesProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get all available images
  const images =
    product.product_images && product.product_images.length > 0
      ? product.product_images
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((img) => img.url)
      : product.image_url
      ? [product.image_url]
      : [getProductImageUrl(product)];

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-[#F8F6F3] rounded-2xl overflow-hidden">
        <Image
          src={images[currentImageIndex]}
          alt={`${product.name} - Image ${currentImageIndex + 1}`}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-[#C5A572] hover:text-white h-12 w-12 rounded-full shadow-md transition-all duration-300"
              onClick={goToPrevImage}
            >
              <ChevronLeft className="h-6 w-6 stroke-[1.5]" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-[#C5A572] hover:text-white h-12 w-12 rounded-full shadow-md transition-all duration-300"
              onClick={goToNextImage}
            >
              <ChevronRight className="h-6 w-6 stroke-[1.5]" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-['Montserrat'] font-medium">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                currentImageIndex === index
                  ? "border-[#C5A572] ring-2 ring-[#C5A572]/30 shadow-md"
                  : "border-transparent hover:border-[#C5A572]/50"
              }`}
            >
              <Image
                src={image}
                alt={`${product.name} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, 12.5vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
