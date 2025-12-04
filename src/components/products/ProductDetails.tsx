"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/lib/products";
import { Star, ChevronRight, Minus, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Mobile Sticky Add to Bag Bar Component
 */
function MobileStickyAddToBag({
  product,
  selectedSize,
  onAddToCart,
  isOutOfStock,
}: {
  product: Product;
  selectedSize: string;
  onAddToCart: () => void;
  isOutOfStock: boolean;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg safe-area-bottom animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between gap-3 p-3">
        <div className="flex flex-col">
          <span className="font-semibold text-black">
            {formatPrice(product.price)}
          </span>
          {selectedSize && (
            <span className="text-xs text-gray-500">Size: {selectedSize}</span>
          )}
        </div>
        <Button
          onClick={onAddToCart}
          disabled={isOutOfStock}
          className="flex-1 max-w-[200px] bg-black text-white hover:bg-gray-800 h-12 font-semibold uppercase"
        >
          {isOutOfStock ? "Sold Out" : "Add to Bag"}
        </Button>
      </div>
    </div>
  );
}

interface ProductFeatures {
  fit?: string;
  rise?: string;
  leg_style?: string;
  closure?: string;
  stretch_level?: string;
  material?: string;
  material_composition?: Record<string, number>;
  care_instructions?: string[];
  sustainability?: string;
  country_of_origin?: string;
  front_rise?: string;
  knee_measurement?: string;
  leg_opening?: string;
  inseam?: string;
  model_height?: string;
  model_waist?: string;
  model_size_worn?: string;
  style_notes?: string;
}

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  color_hex?: string;
  color_name?: string;
  inventory: number;
  price: number;
}

interface ProductDetailsProps {
  product: Product;
}

/**
 * Product Details Component
 * Features:
 * - Breadcrumb navigation
 * - Star rating display
 * - Price with installment options
 * - Color selector
 * - Size selectors (Waist/Length or just Size)
 * - Offers section
 * - Quantity selector
 * - Add to Bag button
 */
export function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [features, setFeatures] = useState<ProductFeatures | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(true);
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();

  const isOutOfStock = product.inventory <= 0;

  // Fetch product features from database
  useEffect(() => {
    async function fetchFeatures() {
      try {
        const response = await fetch(`/api/products/${product.id}/features`);
        if (response.ok) {
          const data = await response.json();
          setFeatures(data.features);
        }
      } catch (error) {
        console.error("Failed to fetch product features:", error);
      } finally {
        setLoadingFeatures(false);
      }
    }

    async function fetchVariants() {
      try {
        const response = await fetch(`/api/products/${product.id}/variants`);
        if (response.ok) {
          const data = await response.json();
          setVariants(data.variants || []);
          // Set default color if variants exist
          if (data.variants?.length > 0) {
            const colors = [
              ...new Set(data.variants.map((v: ProductVariant) => v.color)),
            ];
            if (colors.length > 0) setSelectedColor(colors[0] as string);
          }
        }
      } catch (error) {
        console.error("Failed to fetch variants:", error);
      }
    }

    fetchFeatures();
    fetchVariants();
  }, [product.id]);

  // Get unique sizes and colors from variants
  const uniqueColors = [...new Set(variants.map((v) => v.color))];
  const uniqueSizes = [...new Set(variants.map((v) => v.size))].sort((a, b) => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });

  // Default sizes if no variants
  const defaultSizes = ["S", "M", "L", "XL", "XXL"];
  const displaySizes = uniqueSizes.length > 0 ? uniqueSizes : defaultSizes;

  // Get color hex for display
  const getColorVariant = (color: string) => {
    return variants.find((v) => v.color === color);
  };

  const handleAddToCart = () => {
    if (!selectedSize && displaySizes.length > 0) {
      toast({
        title: "Select a size",
        description: "Please select a size before adding to cart",
        variant: "destructive",
      });
      return;
    }

    addToCart(product, quantity);
    toast({
      title: "Added to Bag",
      description: `${quantity} × ${product.name} added to your bag`,
    });
  };

  // Build breadcrumb
  const breadcrumbs = [
    { label: "Home", href: "/" },
    ...(product.categories
      ? [
          {
            label: product.categories.name,
            href: `/products?category=${product.categories.slug}`,
          },
        ]
      : []),
    { label: product.name, href: "#" },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/"
          className="text-gray-600 hover:text-black hover:underline"
        >
          ← Back
        </Link>
        <span className="text-gray-300">|</span>
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && <span className="text-gray-400">/</span>}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-gray-500 truncate max-w-[200px]">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-gray-600 hover:text-black hover:underline"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Product Name */}
      <h1 className="font-['Playfair_Display'] text-xl md:text-2xl font-bold text-black tracking-wide">
        {product.name}
      </h1>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className="h-4 w-4 text-[#C5A572]"
              strokeWidth={1.5}
            />
          ))}
        </div>
        <span className="text-sm text-gray-500">(0)</span>
      </div>

      {/* Price Section */}
      <div className="space-y-1">
        <div className="text-2xl font-bold text-[#C5A572]">
          {formatPrice(product.price)}
        </div>
      </div>

      {/* Color Selector */}
      {(uniqueColors.length > 0 || features?.material) && (
        <div className="space-y-3">
          <div className="text-sm">
            <span className="font-medium">Color</span>:{" "}
            <span className="text-gray-600">
              {selectedColor ||
                getColorVariant(uniqueColors[0])?.color_name ||
                "Classic"}
            </span>
          </div>
          {uniqueColors.length > 0 && (
            <div className="flex gap-2">
              {uniqueColors.map((color) => {
                const variant = getColorVariant(color);
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color
                        ? "border-black ring-2 ring-offset-2 ring-black"
                        : "border-gray-300 hover:border-gray-500"
                    }`}
                    style={{
                      backgroundColor: variant?.color_hex || "#1a1a1a",
                    }}
                    title={variant?.color_name || color}
                    aria-label={`Select color ${variant?.color_name || color}`}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Size Selector */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Size</span>
          <button className="text-sm text-gray-600 hover:text-black underline">
            Size Guide
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {displaySizes.map((size) => {
            const variant = variants.find(
              (v) =>
                v.size === size && (!selectedColor || v.color === selectedColor)
            );
            const isAvailable = variant ? variant.inventory > 0 : true;

            return (
              <button
                key={size}
                onClick={() => isAvailable && setSelectedSize(size)}
                disabled={!isAvailable}
                className={`min-w-[48px] h-12 px-4 border transition-all text-sm font-medium ${
                  selectedSize === size
                    ? "border-black bg-black text-white"
                    : isAvailable
                    ? "border-gray-300 bg-white text-black hover:border-black"
                    : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="space-y-2">
        <span className="text-sm font-medium">Select Quantity</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-gray-300">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="h-12 w-12 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <button
              onClick={() =>
                setQuantity(Math.min(product.inventory, quantity + 1))
              }
              disabled={quantity >= product.inventory}
              className="h-12 w-12 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <span className="text-sm text-gray-500">
            {product.inventory} available
          </span>
        </div>
      </div>

      {/* Add to Bag Button */}
      <Button
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className="w-full h-14 bg-[#C5A572] text-white hover:bg-[#B89968] text-base font-semibold uppercase tracking-wide"
      >
        {isOutOfStock ? "Out of Stock" : "Add to Bag"}
      </Button>

      {/* Product Description */}
      {product.description && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 leading-relaxed">
            {product.description}
          </p>
        </div>
      )}

      {/* Product Features from Database */}
      {!loadingFeatures && features && (
        <div className="pt-4 border-t border-gray-200 space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wide">
            Product Details
          </h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            {features.fit && (
              <>
                <span className="text-gray-500">Fit</span>
                <span className="text-black">{features.fit}</span>
              </>
            )}
            {features.rise && (
              <>
                <span className="text-gray-500">Rise</span>
                <span className="text-black">{features.rise}</span>
              </>
            )}
            {features.leg_style && (
              <>
                <span className="text-gray-500">Leg Style</span>
                <span className="text-black">{features.leg_style}</span>
              </>
            )}
            {features.closure && (
              <>
                <span className="text-gray-500">Closure</span>
                <span className="text-black">{features.closure}</span>
              </>
            )}
            {features.stretch_level && (
              <>
                <span className="text-gray-500">Stretch</span>
                <span className="text-black">{features.stretch_level}</span>
              </>
            )}
            {features.material && (
              <>
                <span className="text-gray-500">Material</span>
                <span className="text-black">{features.material}</span>
              </>
            )}
            {features.country_of_origin && (
              <>
                <span className="text-gray-500">Made in</span>
                <span className="text-black">{features.country_of_origin}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Measurements (if available) */}
      {!loadingFeatures &&
        features &&
        (features.front_rise || features.leg_opening || features.inseam) && (
          <div className="pt-4 border-t border-gray-200 space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide">
              Measurements
            </h3>
            <p className="text-xs text-gray-500">
              Based on size {features.model_size_worn || "M"}
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              {features.front_rise && (
                <>
                  <span className="text-gray-500">Front Rise</span>
                  <span className="text-black">{features.front_rise}</span>
                </>
              )}
              {features.knee_measurement && (
                <>
                  <span className="text-gray-500">Knee</span>
                  <span className="text-black">
                    {features.knee_measurement}
                  </span>
                </>
              )}
              {features.leg_opening && (
                <>
                  <span className="text-gray-500">Leg Opening</span>
                  <span className="text-black">{features.leg_opening}</span>
                </>
              )}
              {features.inseam && (
                <>
                  <span className="text-gray-500">Inseam</span>
                  <span className="text-black">{features.inseam}</span>
                </>
              )}
            </div>
          </div>
        )}

      {/* Model Info (if available) */}
      {!loadingFeatures && features && features.model_height && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Model is {features.model_height} and wears size{" "}
            {features.model_size_worn || "M"}
          </p>
        </div>
      )}

      {/* Quick Links */}
      <div className="pt-4 border-t border-gray-200 space-y-2">
        <Link
          href="/contact"
          className="flex items-center justify-between py-2 text-sm text-gray-600 hover:text-black"
        >
          <span>Need Help?</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
        <Link
          href="/about"
          className="flex items-center justify-between py-2 text-sm text-gray-600 hover:text-black"
        >
          <span>Shipping & Returns</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Mobile Sticky Add to Bag Bar */}
      <MobileStickyAddToBag
        product={product}
        selectedSize={selectedSize}
        onAddToCart={handleAddToCart}
        isOutOfStock={isOutOfStock}
      />
    </div>
  );
}
