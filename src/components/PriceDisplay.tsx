'use client';

import { useCurrency } from '@/contexts/CurrencyContext';

interface PriceDisplayProps {
  priceInINR: number;
  className?: string;
}

/**
 * Client component to display price with currency conversion
 * Use this in server components that need to show prices
 */
export function PriceDisplay({ priceInINR, className = '' }: PriceDisplayProps) {
  const { formatPrice } = useCurrency();
  
  return (
    <span className={className}>
      {formatPrice(priceInINR)}
    </span>
  );
}
