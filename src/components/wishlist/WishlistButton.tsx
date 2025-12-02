"use client";

import React from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  productName?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
  variant?: "default" | "ghost" | "outline";
}

export function WishlistButton({
  productId,
  productName,
  size = "md",
  className,
  showLabel = false,
  variant = "ghost",
}: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(productId, productName);
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <Button
      variant={variant}
      size="icon"
      className={cn(
        sizeClasses[size],
        "rounded-full transition-all duration-300 bg-white/90 backdrop-blur-sm hover:bg-[#C5A572] border-none shadow-sm hover:shadow-md cursor-pointer",
        inWishlist && "bg-[#C5A572] text-white hover:bg-[#A8894E]",
        !inWishlist && "text-[#4B5563] hover:text-white",
        className
      )}
      onClick={handleClick}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={cn(
          iconSizes[size],
          "transition-all duration-300 stroke-[1.5]",
          inWishlist && "fill-current"
        )}
      />
      {showLabel && (
        <span className="ml-2 font-['Montserrat'] text-sm">
          {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        </span>
      )}
    </Button>
  );
}

interface WishlistButtonWithLabelProps extends WishlistButtonProps {
  showLabel: true;
}

export function WishlistButtonWithLabel({
  productId,
  productName,
  className,
}: Omit<WishlistButtonWithLabelProps, "size" | "variant" | "showLabel">) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(productId, productName);
  };

  return (
    <Button
      variant="outline"
      className={cn("transition-all duration-200 cursor-pointer", className)}
      onClick={handleClick}
    >
      <Heart
        className={cn(
          "h-5 w-5 mr-2 transition-all duration-200",
          inWishlist && "fill-current"
        )}
      />
      {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
    </Button>
  );
}
