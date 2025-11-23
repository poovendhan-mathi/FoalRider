'use client';

import { useCurrency } from '@/contexts/CurrencyContext';
import { getSupportedCurrencies, SupportedCurrency } from '@/lib/currency';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function CurrencySelector() {
  const { currency, setCurrency, isLoading } = useCurrency();
  const currencies = getSupportedCurrencies();

  return (
    <Select
      value={currency}
      onValueChange={(value) => setCurrency(value as SupportedCurrency)}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[140px] bg-background">
        <SelectValue>
          {isLoading ? (
            <span className="text-muted-foreground">Loading...</span>
          ) : (
            <span className="flex items-center gap-2">
              <span>{currencies.find(c => c.code === currency)?.flag}</span>
              <span className="font-medium">{currency}</span>
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {currencies.map((curr) => (
          <SelectItem key={curr.code} value={curr.code}>
            <div className="flex items-center gap-3 py-1">
              <span className="text-lg">{curr.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{curr.symbol} {curr.code}</span>
                <span className="text-xs text-muted-foreground">{curr.name}</span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * Compact currency selector for mobile
 */
export function CurrencySelectorCompact() {
  const { currency, setCurrency, isLoading } = useCurrency();
  const currencies = getSupportedCurrencies();
  const currentCurrency = currencies.find(c => c.code === currency);

  return (
    <Select
      value={currency}
      onValueChange={(value) => setCurrency(value as SupportedCurrency)}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[100px] h-9 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-colors">
        {isLoading ? (
          <span className="text-xs">Loading...</span>
        ) : (
          <div className="flex items-center justify-center gap-1.5 w-full">
            <span className="text-sm">{currentCurrency?.flag}</span>
            <span className="text-sm font-medium">{currency}</span>
          </div>
        )}
      </SelectTrigger>
      <SelectContent className="bg-background">
        {currencies.map((curr) => (
          <SelectItem key={curr.code} value={curr.code}>
            <div className="flex items-center gap-2">
              <span className="text-base">{curr.flag}</span>
              <span className="font-medium">{curr.code}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
