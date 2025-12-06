"use client";

import { useCurrency } from "@/contexts/CurrencyContext";

interface PriceDisplayProps {
  /** Price from database in PAISE (smallest unit) */
  priceInPaise: number;
  className?: string;
  /** @deprecated Use priceInPaise instead */
  priceInINR?: number;
}

/**
 * Client component to display price with currency conversion
 * Use this in server components that need to show prices
 *
 * @example
 * // Database price: 100000 paise (₹1000)
 * <PriceDisplay priceInPaise={100000} />
 * // Displays: ₹1,000 or $12.00 based on user's currency
 */
export function PriceDisplay({
  priceInPaise,
  priceInINR,
  className = "",
}: PriceDisplayProps) {
  const { formatPrice } = useCurrency();

  // Support legacy prop name
  const price = priceInPaise ?? priceInINR ?? 0;

  return <span className={className}>{formatPrice(price)}</span>;
}
