'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/lib/products';
import { ShoppingCart, Heart, Share2, Truck, Shield, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const isOutOfStock = product.inventory <= 0;
  const isLowStock = product.inventory > 0 && product.inventory <= 5;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast({
      title: "Added to cart",
      description: `${quantity} × ${product.name} added to your cart`,
    });
  };

  const handleWishlist = () => {
    toast({
      title: "Added to wishlist",
      description: `${product.name} added to your wishlist`,
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description || '',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      toast({
        title: "Link copied",
        description: "Product link copied to clipboard",
      });
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="space-y-6">
      {/* Product Name */}
      <div>
        <h1 
          className="text-4xl md:text-5xl font-bold mb-2"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          {product.name}
        </h1>
        {product.categories && (
          <p className="text-muted-foreground" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {product.categories.name}
          </p>
        )}
      </div>

      {/* Price */}
      <div>
        <div className="flex items-baseline gap-4">
          <span 
            className="text-4xl font-bold text-[#C5A572]"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {formatPrice(product.price)}
          </span>
        </div>
      </div>

      {/* Stock Status */}
      <div>
        {isOutOfStock ? (
          <Badge variant="destructive" className="text-base px-4 py-1">
            Out of Stock
          </Badge>
        ) : isLowStock ? (
          <Badge variant="secondary" className="text-base px-4 py-1 bg-orange-500 text-white">
            Only {product.inventory} left in stock
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-base px-4 py-1 bg-green-500 text-white">
            In Stock
          </Badge>
        )}
      </div>

      <Separator />

      {/* Description */}
      {product.description && (
        <div>
          <p 
            className="text-base leading-relaxed text-muted-foreground"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {product.description}
          </p>
        </div>
      )}

      <Separator />

      {/* Quantity Selector */}
      {!isOutOfStock && (
        <div>
          <label className="text-sm font-medium mb-2 block">Quantity</label>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              -
            </Button>
            <span className="text-xl font-semibold min-w-[3rem] text-center">
              {quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
              disabled={quantity >= product.inventory}
            >
              +
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          size="lg"
          className="w-full bg-[#C5A572] hover:bg-[#B08D5B] text-white"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={handleWishlist}
          >
            <Heart className="mr-2 h-4 w-4" />
            Wishlist
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleShare}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <Separator />

      {/* Features */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Truck className="h-5 w-5 text-[#C5A572] mt-1 shrink-0" />
          <div>
            <h4 className="font-semibold mb-1">Free Shipping</h4>
            <p className="text-sm text-muted-foreground">
              Free shipping on orders over ₹2,000
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <RefreshCw className="h-5 w-5 text-[#C5A572] mt-1 shrink-0" />
          <div>
            <h4 className="font-semibold mb-1">Easy Returns</h4>
            <p className="text-sm text-muted-foreground">
              30-day return policy for your peace of mind
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-[#C5A572] mt-1 shrink-0" />
          <div>
            <h4 className="font-semibold mb-1">Quality Guarantee</h4>
            <p className="text-sm text-muted-foreground">
              100% authentic products with quality assurance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
