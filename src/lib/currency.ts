// ============================================
// CURRENCY UTILITIES
// ============================================
// Handles multi-currency support with database-managed exchange rates
// ✅ FIXED: Corrected exchange rate logic (27 Nov 2025)

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type SupportedCurrency = "INR" | "SGD" | "USD" | "EUR" | "GBP" | "AUD";

export interface ExchangeRates {
  INR: number;
  SGD: number;
  USD: number;
  EUR: number;
  GBP: number;
  AUD: number;
  timestamp: number;
}

const EXCHANGE_RATES_KEY = "foalrider_exchange_rates";
const CURRENCY_PREFERENCE_KEY = "foalrider_preferred_currency";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * ✅ CORRECTED: Fallback exchange rates (how much 1 INR equals in each currency)
 * These represent: 1 INR = X foreign currency
 *
 * Example: 1 INR = 0.012 USD means that 1 USD = 83.33 INR (1/0.012)
 *
 * To convert ₹1000 to USD: 1000 × 0.012 = $12 ✅
 * Previously WRONG: 1000 × 83.5 = $83,500 ❌
 */
const FALLBACK_RATES: ExchangeRates = {
  INR: 1.0,
  SGD: 0.0161, // 1 INR = 0.0161 SGD (inverse: 1 SGD ≈ 62 INR)
  USD: 0.012, // 1 INR = 0.012 USD (inverse: 1 USD ≈ 83.33 INR)
  EUR: 0.011, // 1 INR = 0.011 EUR (inverse: 1 EUR ≈ 90.91 INR)
  GBP: 0.0095, // 1 INR = 0.0095 GBP (inverse: 1 GBP ≈ 105.26 INR)
  AUD: 0.0182, // 1 INR = 0.0182 AUD (inverse: 1 AUD ≈ 54.95 INR)
  timestamp: Date.now(),
};

/**
 * Fetch exchange rates from database with proper error handling
 * Rates are stored in currency_rates table and can be managed via admin dashboard
 *
 * Database schema:
 * - currency_code: 'INR' | 'USD' | 'SGD' | 'EUR' | 'GBP' | 'AUD'
 * - rate_to_inr: number (how much INR you get for 1 unit of foreign currency)
 * - is_active: boolean
 * - updated_at: timestamp
 *
 * NOTE: Database uses rate_to_inr (e.g., 1 USD = 83.5 INR)
 * We convert this to rate_from_inr (1 INR = 0.012 USD) by taking the inverse (1/rate_to_inr)
 *
 * @returns Promise with exchange rates and error info
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
  // Check if we're in browser environment
  if (typeof window === "undefined") {
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
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("currency_rates")
      .select("currency_code, rate_to_inr")
      .eq("is_active", true);

    if (error) {
      console.error(
        "❌ Database error fetching currency rates:",
        error.message
      );
      return FALLBACK_RATES;
    }

    if (!data || data.length === 0) {
      console.warn(
        "⚠️ No active currency rates found in database, using fallback"
      );
      return FALLBACK_RATES;
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
    // Convert rate_to_inr to rate_from_inr by taking inverse
    data.forEach((currency: { currency_code: string; rate_to_inr: number }) => {
      const code = currency.currency_code as SupportedCurrency;
      const rateToInr = currency.rate_to_inr;

      if (code in rates && rateToInr && rateToInr > 0) {
        // Convert: if 1 USD = 83.5 INR, then 1 INR = 1/83.5 USD = 0.012 USD
        rates[code] = code === "INR" ? 1.0 : 1 / rateToInr;
      }
    });

    // Cache it
    localStorage.setItem(EXCHANGE_RATES_KEY, JSON.stringify(rates));

    return rates;
  } catch (error) {
    console.error(
      "❌ Unexpected error fetching exchange rates, using fallback:",
      error
    );
    return FALLBACK_RATES;
  }
}

/**
 * ✅ CORRECTED: Convert price from INR to target currency
 *
 * Uses corrected exchange rates where:
 * - rates[currency] = how much 1 INR equals in that currency
 *
 * Example with USD:
 * - Rate: 1 INR = 0.012 USD
 * - Convert ₹1000: 1000 × 0.012 = $12.00 ✅
 *
 * @param priceInINR - Price in Indian Rupees
 * @param toCurrency - Target currency code
 * @param rates - Exchange rates object
 * @returns Converted price in target currency
 */
export function convertPrice(
  priceInINR: number,
  toCurrency: SupportedCurrency,
  rates: ExchangeRates
): number {
  if (toCurrency === "INR") return priceInINR;

  const rate = rates[toCurrency];

  // Validate rate
  if (!rate || rate <= 0 || isNaN(rate)) {
    console.error(`❌ Invalid exchange rate for ${toCurrency}: ${rate}`);
    // Fallback to INR if rate is invalid
    return priceInINR;
  }

  // ✅ CORRECT: Multiply INR by rate (rate already represents 1 INR = X foreign currency)
  return priceInINR * rate;
}

/**
 * Format price with proper currency symbol and locale
 */
export function formatPrice(
  price: number,
  currency: SupportedCurrency = "INR"
): string {
  const localeMap: Record<SupportedCurrency, string> = {
    INR: "en-IN",
    SGD: "en-SG",
    USD: "en-US",
    EUR: "de-DE",
    GBP: "en-GB",
    AUD: "en-AU",
  };

  return new Intl.NumberFormat(localeMap[currency], {
    style: "currency",
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
    INR: "₹",
    SGD: "S$",
    USD: "$",
    EUR: "€",
    GBP: "£",
    AUD: "A$",
  };
  return symbols[currency];
}

/**
 * Get user's preferred currency from localStorage
 */
export function getPreferredCurrency(): SupportedCurrency {
  if (typeof window === "undefined") return "INR";

  const saved = localStorage.getItem(CURRENCY_PREFERENCE_KEY);
  return (saved as SupportedCurrency) || "INR";
}

/**
 * Save user's preferred currency to localStorage
 */
export function setPreferredCurrency(currency: SupportedCurrency): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CURRENCY_PREFERENCE_KEY, currency);
}

/**
 * Detect user's currency based on location
 * Automatically selects currency based on user's country
 * Defaults to SGD for countries without supported currency
 */
export async function detectUserCurrency(): Promise<SupportedCurrency> {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();

    console.log(
      "📍 User location detected:",
      data.country_name,
      `(${data.country_code})`
    );

    const currencyMap: Record<string, SupportedCurrency> = {
      // India
      IN: "INR",

      // Singapore
      SG: "SGD",

      // United States
      US: "USD",

      // United Kingdom
      GB: "GBP",

      // Australia
      AU: "AUD",

      // European Union countries
      DE: "EUR", // Germany
      FR: "EUR", // France
      IT: "EUR", // Italy
      ES: "EUR", // Spain
      NL: "EUR", // Netherlands
      BE: "EUR", // Belgium
      AT: "EUR", // Austria
      PT: "EUR", // Portugal
      IE: "EUR", // Ireland
      GR: "EUR", // Greece
      FI: "EUR", // Finland
    };

    const detectedCurrency = currencyMap[data.country_code] || "SGD";

    console.log(
      `💰 Currency set to: ${detectedCurrency} ${
        detectedCurrency === "SGD" ? "(default)" : ""
      }`
    );

    return detectedCurrency;
  } catch (error) {
    console.error("Error detecting currency:", error);
    console.log("💰 Using default currency: SGD");
    return "SGD"; // Default to SGD instead of INR
  }
}

/**
 * Get all supported currencies with their details
 */
export function getSupportedCurrencies() {
  return [
    { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
    { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
    { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
    { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
    { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  ] as const;
}
