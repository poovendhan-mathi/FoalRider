// ============================================
// CURRENCY UTILITIES
// ============================================
// Handles multi-currency support with database-managed exchange rates

import { createClient } from '@/lib/supabase/client';

export type SupportedCurrency = 'INR' | 'SGD' | 'USD' | 'EUR' | 'GBP' | 'AUD';

export interface ExchangeRates {
  INR: number;
  SGD: number;
  USD: number;
  EUR: number;
  GBP: number;
  AUD: number;
  timestamp: number;
}

const EXCHANGE_RATES_KEY = 'foalrider_exchange_rates';
const CURRENCY_PREFERENCE_KEY = 'foalrider_preferred_currency';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Fallback rates if database fails
const FALLBACK_RATES: ExchangeRates = {
  INR: 1.0,
  SGD: 62.0,
  USD: 83.5,
  EUR: 90.5,
  GBP: 105.0,
  AUD: 55.0,
  timestamp: Date.now(),
};

/**
 * Fetch exchange rates from database with caching
 * Rates are stored in currency_rates table and can be managed via admin dashboard
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    return FALLBACK_RATES;
  }

  try {
    // Check cache first
    const cached = localStorage.getItem(EXCHANGE_RATES_KEY);
    if (cached) {
      const cachedRates: ExchangeRates = JSON.parse(cached);
      if (Date.now() - cachedRates.timestamp < CACHE_DURATION) {
        return cachedRates;
      }
    }

    // Fetch from database
    const supabase = createClient();
    const { data, error } = await supabase
      .from('currency_rates')
      .select('currency_code, rate_to_inr')
      .eq('is_active', true);

    if (error) throw error;

    if (!data || data.length === 0) {
      throw new Error('No currency rates found');
    }

    // Build rates object
    const rates: ExchangeRates = {
      INR: 1.0,
      SGD: FALLBACK_RATES.SGD,
      USD: FALLBACK_RATES.USD,
      EUR: FALLBACK_RATES.EUR,
      GBP: FALLBACK_RATES.GBP,
      AUD: FALLBACK_RATES.AUD,
      timestamp: Date.now(),
    };

    // Update with database values
    data.forEach((currency) => {
      const code = currency.currency_code as SupportedCurrency;
      if (code in rates) {
        rates[code] = currency.rate_to_inr;
      }
    });

    // Cache it
    localStorage.setItem(EXCHANGE_RATES_KEY, JSON.stringify(rates));

    return rates;
  } catch (error) {
    console.error('Error fetching exchange rates from database, using fallback:', error);
    return FALLBACK_RATES;
  }
}

/**
 * Convert price from INR to target currency
 */
export function convertPrice(
  priceInINR: number,
  toCurrency: SupportedCurrency,
  rates: ExchangeRates
): number {
  if (toCurrency === 'INR') return priceInINR;
  return priceInINR * rates[toCurrency];
}

/**
 * Format price with proper currency symbol and locale
 */
export function formatPrice(
  price: number,
  currency: SupportedCurrency = 'INR'
): string {
  const localeMap: Record<SupportedCurrency, string> = {
    INR: 'en-IN',
    SGD: 'en-SG',
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    AUD: 'en-AU',
  };

  return new Intl.NumberFormat(localeMap[currency], {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: SupportedCurrency): string {
  const symbols: Record<SupportedCurrency, string> = {
    INR: '₹',
    SGD: 'S$',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AUD: 'A$',
  };
  return symbols[currency];
}

/**
 * Get user's preferred currency from localStorage
 */
export function getPreferredCurrency(): SupportedCurrency {
  if (typeof window === 'undefined') return 'INR';
  
  const saved = localStorage.getItem(CURRENCY_PREFERENCE_KEY);
  return (saved as SupportedCurrency) || 'INR';
}

/**
 * Save user's preferred currency to localStorage
 */
export function setPreferredCurrency(currency: SupportedCurrency): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CURRENCY_PREFERENCE_KEY, currency);
}

/**
 * Detect user's currency based on location (optional enhancement)
 */
export async function detectUserCurrency(): Promise<SupportedCurrency> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    const currencyMap: Record<string, SupportedCurrency> = {
      IN: 'INR',
      SG: 'SGD',
      US: 'USD',
      GB: 'GBP',
      AU: 'AUD',
      // Add EU countries
      DE: 'EUR',
      FR: 'EUR',
      IT: 'EUR',
      ES: 'EUR',
    };

    return currencyMap[data.country_code] || 'INR';
  } catch (error) {
    console.error('Error detecting currency:', error);
    return 'INR';
  }
}

/**
 * Get all supported currencies with their details
 */
export function getSupportedCurrencies() {
  return [
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  ] as const;
}
