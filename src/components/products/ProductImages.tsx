'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getProductImageUrl } from '@/lib/product-helpers';
import type { Product } from '@/lib/products';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductImagesProps {
  product: Product;
}

export function ProductImages({ product }: ProductImagesProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Get all available images
  const images = product.product_images && product.product_images.length > 0
    ? product.product_images.sort((a, b) => a.sort_order - b.sort_order).map(img => img.url)
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
      <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
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
              variant="secondary"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={goToPrevImage}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={goToNextImage}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
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
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                currentImageIndex === index
                  ? 'border-[#C5A572] ring-2 ring-[#C5A572]/50'
                  : 'border-transparent hover:border-muted-foreground/30'
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
