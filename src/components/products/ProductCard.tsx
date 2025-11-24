'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { useCurrency } from '@/contexts/CurrencyContext';
import type { Product } from '@/lib/products';

interface ProductCardProps {
  product: Product;
}

function getProductImageUrl(product: Product): string {
  // First, try to get image from product_images relation
  if (product.product_images && product.product_images.length > 0) {
    const sortedImages = [...product.product_images].sort((a, b) => a.sort_order - b.sort_order);
    return sortedImages[0].url;
  }
  
  // Fallback to image_url field
  if (product.image_url) {
    return product.image_url;
  }
  
  // Fallback to placeholder
  return '/assets/images/product-placeholder.jpg';
}

export function ProductCard({ product }: ProductCardProps) {
  const { formatPrice } = useCurrency();
  const imageUrl = getProductImageUrl(product);
  const isOutOfStock = product.inventory <= 0;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Wishlist Button */}
          <div className="absolute top-4 right-4 z-10">
            <WishlistButton productId={product.id} productName={product.name} />
          </div>
            
          {isOutOfStock && (
            <Badge className="absolute top-4 left-4 bg-red-500">
              Out of Stock
            </Badge>
          )}
            
          {product.inventory <= 5 && product.inventory > 0 && (
            <Badge className="absolute top-4 left-4 bg-orange-500">
              Only {product.inventory} left
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <h3 
          className="font-semibold text-lg mb-2 line-clamp-2"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          <Link href={`/products/${product.slug}`} className="hover:text-[#C5A572] transition-colors">
            {product.name}
          </Link>
        </h3>
        {product.description && (
          <p 
            className="text-sm text-muted-foreground line-clamp-2 mb-3"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span 
            className="text-2xl font-bold text-[#C5A572]"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {formatPrice(product.price)}
          </span>
          {product.inventory > 0 && product.inventory <= 10 && (
            <span className="text-xs text-muted-foreground">
              {product.inventory} in stock
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full bg-[#C5A572] hover:bg-[#B08D5B] cursor-pointer"
          disabled={isOutOfStock}
          asChild={!isOutOfStock}
        >
          {isOutOfStock ? (
            <span>Out of Stock</span>
          ) : (
            <Link href={`/products/${product.slug}`}>
              View Details
            </Link>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
