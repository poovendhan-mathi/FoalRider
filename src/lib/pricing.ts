// ============================================
// CENTRALIZED PRICING SYSTEM
// ============================================
// Single source of truth for all pricing operations
//
// CONVENTION: All prices in the database are stored in the SMALLEST UNIT
// - USD: Cents (1 USD = 100 cents) → $100 stored as 10000
// - INR: Paise (1 INR = 100 paise) → ₹100 stored as 10000
// - SGD: Cents (1 SGD = 100 cents) → S$100 stored as 10000
// - EUR: Cents (1 EUR = 100 cents) → €100 stored as 10000
// - GBP: Pence (1 GBP = 100 pence) → £100 stored as 10000
// - AUD: Cents (1 AUD = 100 cents) → A$100 stored as 10000
//
// BASE CURRENCY: USD (all prices stored in USD cents)
// This matches Stripe's convention and is better for international e-commerce
//
// EXCHANGE RATES:
// - Primary source: `currency_rates` table in database
// - rate_to_usd: How many USD you get for 1 unit of foreign currency
//   e.g., EUR rate_to_usd = 1.09 means 1 EUR = 1.09 USD
// - We use this to convert USD to other currencies: USD / rate_to_usd

export type SupportedCurrency = "INR" | "SGD" | "USD" | "EUR" | "GBP" | "AUD";

// ============================================
// CONFIGURATION
// ============================================

/**
 * Currency configuration including locale, symbol, and divisor
 */
export const CURRENCY_CONFIG: Record<
  SupportedCurrency,
  {
    locale: string;
    symbol: string;
    name: string;
    flag: string;
    divisor: number; // How many smallest units in 1 main unit
  }
> = {
  INR: {
    locale: "en-IN",
    symbol: "₹",
    name: "Indian Rupee",
    flag: "🇮🇳",
    divisor: 100,
  },
  SGD: {
    locale: "en-SG",
    symbol: "S$",
    name: "Singapore Dollar",
    flag: "🇸🇬",
    divisor: 100,
  },
  USD: {
    locale: "en-US",
    symbol: "$",
    name: "US Dollar",
    flag: "🇺🇸",
    divisor: 100,
  },
  EUR: { locale: "de-DE", symbol: "€", name: "Euro", flag: "🇪🇺", divisor: 100 },
  GBP: {
    locale: "en-GB",
    symbol: "£",
    name: "British Pound",
    flag: "🇬🇧",
    divisor: 100,
  },
  AUD: {
    locale: "en-AU",
    symbol: "A$",
    name: "Australian Dollar",
    flag: "🇦🇺",
    divisor: 100,
  },
};

/**
 * Base currency for the database (prices are stored in this currency's smallest unit)
 */
export const BASE_CURRENCY: SupportedCurrency = "USD";

// ============================================
// SHIPPING & TAX CONSTANTS
// ============================================

/**
 * Shipping configuration (all values in cents - smallest unit)
 */
export const SHIPPING_CONFIG = {
  /** Free shipping threshold in cents ($50 = 5000 cents) */
  FREE_SHIPPING_THRESHOLD: 5000,
  /** Standard shipping cost in cents ($5 = 500 cents) */
  STANDARD_SHIPPING_COST: 500,
} as const;

/**
 * Tax configuration
 */
export const TAX_CONFIG = {
  /** GST rate as decimal (18% = 0.18) */
  GST_RATE: 0.18,
  /** GST rate as percentage for display */
  GST_PERCENTAGE: 18,
} as const;

/**
 * Calculate shipping cost based on subtotal
 * @param subtotalInCents - Subtotal in cents
 * @returns Shipping cost in cents (0 if free shipping applies)
 */
export function calculateShipping(subtotalInCents: number): number {
  return subtotalInCents >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD
    ? 0
    : SHIPPING_CONFIG.STANDARD_SHIPPING_COST;
}

/**
 * Calculate tax (GST) based on subtotal
 * @param subtotalInCents - Subtotal in cents
 * @returns Tax amount in cents
 */
export function calculateTax(subtotalInCents: number): number {
  return Math.round(subtotalInCents * TAX_CONFIG.GST_RATE);
}

/**
 * Calculate order totals from subtotal
 * @param subtotalInCents - Subtotal in cents
 * @returns Object with shipping, tax, and total in cents
 */
export function calculateOrderTotals(subtotalInCents: number): {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
} {
  const shipping = calculateShipping(subtotalInCents);
  const tax = calculateTax(subtotalInCents);
  const total = subtotalInCents + shipping + tax;

  return { subtotal: subtotalInCents, shipping, tax, total };
}

/**
 * LocalStorage keys for caching
 */
const EXCHANGE_RATES_CACHE_KEY = "foalrider_exchange_rates_v2";
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Exchange rates interface
 * rate_from_inr: How much 1 INR equals in target currency
 * Example: USD = 0.012 means 1 INR = 0.012 USD
 */
export interface ExchangeRates {
  INR: number;
  SGD: number;
  USD: number;
  EUR: number;
  GBP: number;
  AUD: number;
  timestamp: number;
}

/**
 * FALLBACK exchange rates (rate_to_usd format)
 * Used when database is unavailable
 *
 * These represent: 1 unit of currency = X USD
 * To convert $100 to EUR: 100 / 1.09 = €91.74
 */
export const FALLBACK_EXCHANGE_RATES: ExchangeRates = {
  USD: 1.0,
  INR: 0.012, // 1 INR = 0.012 USD (1 USD ≈ 83.33 INR)
  SGD: 0.74, // 1 SGD = 0.74 USD
  EUR: 1.09, // 1 EUR = 1.09 USD
  GBP: 1.27, // 1 GBP = 1.27 USD
  AUD: 0.66, // 1 AUD = 0.66 USD
  timestamp: Date.now(),
};

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Fetch exchange rates from database with caching
 * Primary source: currency_rates table
 * Fallback: FALLBACK_EXCHANGE_RATES
 *
 * @returns Promise with exchange rates (rate_to_usd format)
 */
export async function fetchExchangeRates(): Promise<ExchangeRates> {
  // Only run in browser
  if (typeof window === "undefined") {
    return FALLBACK_EXCHANGE_RATES;
  }

  try {
    // Check cache first
    const cached = localStorage.getItem(EXCHANGE_RATES_CACHE_KEY);
    if (cached) {
      const cachedRates: ExchangeRates = JSON.parse(cached);
      if (Date.now() - cachedRates.timestamp < CACHE_DURATION_MS) {
        return cachedRates;
      }
    }

    // Fetch from API (which fetches from database)
    const response = await fetch("/api/currency");
    if (!response.ok) {
      console.warn("⚠️ Failed to fetch currency rates, using fallback");
      return FALLBACK_EXCHANGE_RATES;
    }

    const data = await response.json();
    if (!data.rates || data.rates.length === 0) {
      console.warn("⚠️ No currency rates found, using fallback");
      return FALLBACK_EXCHANGE_RATES;
    }

    // Build rates object
    // Database stores rate_to_usd (e.g., 1 EUR = 1.09 USD)
    const rates: ExchangeRates = {
      ...FALLBACK_EXCHANGE_RATES,
      timestamp: Date.now(),
    };

    data.rates.forEach(
      (currency: { currency_code: string; rate_to_usd: number }) => {
        const code = currency.currency_code as SupportedCurrency;
        const rateToUsd = currency.rate_to_usd;

        if (code in rates && rateToUsd && rateToUsd > 0) {
          rates[code] = rateToUsd;
        }
      }
    );

    // Cache the rates
    localStorage.setItem(EXCHANGE_RATES_CACHE_KEY, JSON.stringify(rates));

    return rates;
  } catch (error) {
    console.error("❌ Error fetching exchange rates:", error);
    return FALLBACK_EXCHANGE_RATES;
  }
}

/**
 * Convert database price (smallest unit) to display value (main unit)
 *
 * @param priceInSmallestUnit - Price from database (e.g., 10000 cents)
 * @returns Price in main unit (e.g., 100 dollars)
 *
 * @example
 * toMainUnit(10000) // Returns 100 ($100)
 */
export function toMainUnit(priceInSmallestUnit: number): number {
  return priceInSmallestUnit / CURRENCY_CONFIG[BASE_CURRENCY].divisor;
}

/**
 * Convert display price (main unit) to database value (smallest unit)
 *
 * @param priceInMainUnit - Price in main unit (e.g., 100 dollars)
 * @returns Price in smallest unit (e.g., 10000 cents)
 *
 * @example
 * toSmallestUnit(100) // Returns 10000 (10000 cents)
 */
export function toSmallestUnit(priceInMainUnit: number): number {
  return Math.round(priceInMainUnit * CURRENCY_CONFIG[BASE_CURRENCY].divisor);
}

/**
 * Convert price from base currency (USD cents) to target currency (main unit)
 *
 * @param priceInCents - Price in USD cents from database
 * @param targetCurrency - Currency to convert to
 * @param exchangeRates - Exchange rates object (optional, uses fallback if not provided)
 * @returns Price in target currency's main unit
 *
 * @example
 * // Convert $100 (10000 cents) to EUR
 * convertToTargetCurrency(10000, 'EUR') // Returns ~91.74 (EUR)
 */
export function convertToTargetCurrency(
  priceInCents: number,
  targetCurrency: SupportedCurrency,
  exchangeRates:
    | ExchangeRates
    | Record<SupportedCurrency, number> = FALLBACK_EXCHANGE_RATES
): number {
  // Step 1: Convert cents to dollars
  const priceInDollars = toMainUnit(priceInCents);

  // Step 2: If target is USD, just return dollars
  if (targetCurrency === "USD") {
    return priceInDollars;
  }

  // Step 3: Convert USD to target currency
  // rate_to_usd format: 1 EUR = 1.09 USD
  // To convert $100 to EUR: 100 / 1.09 = €91.74
  const rate =
    exchangeRates[targetCurrency] || FALLBACK_EXCHANGE_RATES[targetCurrency];

  if (!rate || rate <= 0) {
    console.error(`Invalid exchange rate for ${targetCurrency}: ${rate}`);
    return priceInDollars; // Fallback to USD
  }

  return priceInDollars / rate;
}

/**
 * Format a price value with proper currency symbol and locale
 *
 * @param value - Price value in the currency's main unit (e.g., 100 for $100)
 * @param currency - Currency code
 * @returns Formatted string (e.g., "$100.00")
 *
 * @example
 * formatCurrencyValue(100, 'USD') // Returns "$100.00"
 * formatCurrencyValue(1000, 'INR') // Returns "₹1,000"
 */
export function formatCurrencyValue(
  value: number,
  currency: SupportedCurrency = BASE_CURRENCY
): string {
  const config = CURRENCY_CONFIG[currency];

  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * MAIN FUNCTION: Format a database price for display
 * This is the PRIMARY function to use throughout the app
 *
 * @param priceInCents - Price from database (in cents/smallest unit)
 * @param targetCurrency - Currency to display in (default: USD)
 * @param exchangeRates - Exchange rates object (optional)
 * @returns Formatted price string
 *
 * @example
 * // Database has $100 stored as 10000 cents
 * formatDatabasePrice(10000, 'USD') // Returns "$100.00"
 * formatDatabasePrice(10000, 'EUR') // Returns "€91.74" (with conversion)
 */
export function formatDatabasePrice(
  priceInPaise: number,
  targetCurrency: SupportedCurrency = BASE_CURRENCY,
  exchangeRates?: ExchangeRates | Record<SupportedCurrency, number>
): string {
  const convertedValue = convertToTargetCurrency(
    priceInPaise,
    targetCurrency,
    exchangeRates
  );

  return formatCurrencyValue(convertedValue, targetCurrency);
}

/**
 * Format price for admin panel (always in USD, from cents)
 *
 * @param priceInCents - Price from database (in cents)
 * @returns Formatted USD string
 *
 * @example
 * formatAdminPrice(10000) // Returns "$100.00"
 */
export function formatAdminPrice(priceInCents: number): string {
  const priceInDollars = toMainUnit(priceInCents);
  return formatCurrencyValue(priceInDollars, "USD");
}

// ============================================
// STRIPE INTEGRATION
// ============================================

/**
 * Convert database price to Stripe amount
 * Stripe expects amounts in the smallest currency unit
 *
 * @param priceInCents - Price in USD cents from database
 * @param targetCurrency - Currency for Stripe payment
 * @param exchangeRates - Exchange rates (optional)
 * @returns Amount in target currency's smallest unit (cents/pence)
 *
 * @example
 * // Pay $100 (10000 cents) in EUR
 * pricingToStripeAmount(10000, 'EUR') // Returns 9174 (euro cents) = €91.74
 */
export function pricingToStripeAmount(
  priceInCents: number,
  targetCurrency: SupportedCurrency = "USD",
  exchangeRates?: ExchangeRates | Record<SupportedCurrency, number>
): number {
  // If paying in USD, just return cents as-is
  if (targetCurrency === "USD") {
    return Math.round(priceInCents);
  }

  // Convert to target currency main unit
  const convertedValue = convertToTargetCurrency(
    priceInCents,
    targetCurrency,
    exchangeRates
  );

  // Convert to smallest unit for Stripe
  const config = CURRENCY_CONFIG[targetCurrency];
  return Math.round(convertedValue * config.divisor);
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate a price value (in smallest unit)
 *
 * @param priceInSmallestUnit - Price to validate
 * @returns Object with isValid and error message
 */
export function validatePrice(priceInSmallestUnit: number): {
  isValid: boolean;
  error?: string;
} {
  if (typeof priceInSmallestUnit !== "number" || isNaN(priceInSmallestUnit)) {
    return { isValid: false, error: "Price must be a number" };
  }

  if (!Number.isInteger(priceInSmallestUnit)) {
    return { isValid: false, error: "Price must be a whole number (in cents)" };
  }

  if (priceInSmallestUnit < 0) {
    return { isValid: false, error: "Price cannot be negative" };
  }

  // Max price: $100,000 = 10,000,000 cents
  if (priceInSmallestUnit > 10000000) {
    return {
      isValid: false,
      error: "Price exceeds maximum allowed ($100,000)",
    };
  }

  return { isValid: true };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: SupportedCurrency): string {
  return CURRENCY_CONFIG[currency].symbol;
}

/**
 * Get all supported currencies with their details
 */
export function getSupportedCurrencies() {
  return Object.entries(CURRENCY_CONFIG).map(([code, config]) => ({
    code: code as SupportedCurrency,
    ...config,
  }));
}

/**
 * Check if a currency is supported
 */
export function isSupportedCurrency(
  currency: string
): currency is SupportedCurrency {
  return currency in CURRENCY_CONFIG;
}

/**
 * Parse user input price string to smallest unit
 *
 * @param input - User input (e.g., "100" or "1,000" or "100.50")
 * @returns Price in smallest unit, or null if invalid
 *
 * @example
 * parseUserPriceInput("100") // Returns 10000 (cents)
 * parseUserPriceInput("1,000.50") // Returns 100050 (cents)
 */
export function parseUserPriceInput(input: string): number | null {
  // Remove commas and spaces
  const cleaned = input.replace(/[,\s]/g, "");

  // Parse as float
  const value = parseFloat(cleaned);

  if (isNaN(value) || value < 0) {
    return null;
  }

  // Convert to smallest unit
  return toSmallestUnit(value);
}

/**
 * Format a value that's ALREADY in main currency unit (dollars, not cents)
 * Use this for analytics data that's already converted
 *
 * @param valueInMainUnit - Value already in main unit (e.g., 100 dollars)
 * @param currency - Currency code (default: USD)
 * @returns Formatted string
 *
 * @example
 * formatMainUnitValue(100, 'USD') // Returns "$100.00"
 */
export function formatMainUnitValue(
  valueInMainUnit: number,
  currency: SupportedCurrency = BASE_CURRENCY
): string {
  return formatCurrencyValue(valueInMainUnit, currency);
}
