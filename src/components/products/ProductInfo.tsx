"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCart } from "@/contexts/CartContext";
import { WishlistButtonWithLabel } from "@/components/wishlist/WishlistButton";
import { MobileProductActions } from "./MobileProductActions";
import type { Product } from "@/lib/products";
import { ShoppingCart, Share2, Truck, Shield, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description || "",
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
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
        <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold mb-2 text-black">
          {product.name}
        </h1>
        {product.categories && (
          <p className="font-['Montserrat'] text-[#9CA3AF]">
            {product.categories.name}
          </p>
        )}
      </div>

      {/* Price */}
      <div>
        <div className="flex items-baseline gap-4">
          <span className="font-['Playfair_Display'] text-4xl font-bold text-[#C5A572]">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>

      {/* Stock Status */}
      <div>
        {isOutOfStock ? (
          <Badge
            variant="destructive"
            className="font-['Montserrat'] text-base px-4 py-1"
          >
            Out of Stock
          </Badge>
        ) : isLowStock ? (
          <Badge
            variant="warning"
            className="font-['Montserrat'] text-base px-4 py-1"
          >
            Only {product.inventory} left in stock
          </Badge>
        ) : (
          <Badge
            variant="success"
            className="font-['Montserrat'] text-base px-4 py-1"
          >
            In Stock
          </Badge>
        )}
      </div>

      <Separator className="bg-[#E5E5E5]" />

      {/* Description */}
      {product.description && (
        <div>
          <p className="font-['Montserrat'] text-base leading-relaxed text-[#4B5563]">
            {product.description}
          </p>
        </div>
      )}

      <Separator className="bg-[#E5E5E5]" />

      {/* Quantity Selector */}
      {!isOutOfStock && (
        <div>
          <label className="font-['Montserrat'] text-sm font-medium mb-2 block text-black">
            Quantity
          </label>
          <div className="flex items-center gap-3">
            <Button
              variant="outline-gold"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="h-10 w-10 rounded-full"
            >
              -
            </Button>
            <span className="font-['Montserrat'] text-xl font-semibold min-w-[3rem] text-center text-black">
              {quantity}
            </span>
            <Button
              variant="outline-gold"
              size="icon"
              onClick={() =>
                setQuantity(Math.min(product.inventory, quantity + 1))
              }
              disabled={quantity >= product.inventory}
              className="h-10 w-10 rounded-full"
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
          variant="gold"
          className="w-full font-['Montserrat'] cursor-pointer"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-5 w-5 stroke-[1.5]" />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <WishlistButtonWithLabel
            productId={product.id}
            productName={product.name}
          />
          <Button
            variant="outline-gold"
            size="lg"
            onClick={handleShare}
            className="cursor-pointer font-['Montserrat']"
          >
            <Share2 className="mr-2 h-4 w-4 stroke-[1.5]" />
            Share
          </Button>
        </div>
      </div>

      <Separator className="bg-[#E5E5E5]" />

      {/* Features */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-[#C5A572]/10 flex items-center justify-center shrink-0">
            <Truck className="h-5 w-5 text-[#C5A572] stroke-[1.5]" />
          </div>
          <div>
            <h4 className="font-['Montserrat'] font-semibold mb-1 text-black">
              Free Shipping
            </h4>
            <p className="font-['Montserrat'] text-sm text-[#9CA3AF]">
              Free shipping on orders over ₹2,000
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-[#C5A572]/10 flex items-center justify-center shrink-0">
            <RefreshCw className="h-5 w-5 text-[#C5A572] stroke-[1.5]" />
          </div>
          <div>
            <h4 className="font-['Montserrat'] font-semibold mb-1 text-black">
              Easy Returns
            </h4>
            <p className="font-['Montserrat'] text-sm text-[#9CA3AF]">
              30-day return policy for your peace of mind
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-[#C5A572]/10 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5 text-[#C5A572] stroke-[1.5]" />
          </div>
          <div>
            <h4 className="font-['Montserrat'] font-semibold mb-1 text-black">
              Quality Guarantee
            </h4>
            <p className="font-['Montserrat'] text-sm text-[#9CA3AF]">
              100% authentic products with quality assurance
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Add to Cart */}
      <MobileProductActions product={product} />
    </div>
  );
}
