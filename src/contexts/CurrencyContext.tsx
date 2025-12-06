"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  SupportedCurrency,
  ExchangeRates,
  CURRENCY_CONFIG,
  FALLBACK_EXCHANGE_RATES,
  fetchExchangeRates,
  convertToTargetCurrency,
  formatCurrencyValue,
  formatDatabasePrice,
  getCurrencySymbol,
} from "@/lib/pricing";

// ============================================
// CONTEXT TYPES
// ============================================

interface CurrencyContextType {
  /** Current selected currency */
  currency: SupportedCurrency;
  /** Update the selected currency */
  setCurrency: (currency: SupportedCurrency) => void;
  /** Current exchange rates (from database) */
  exchangeRates: ExchangeRates | null;
  /** Loading state */
  isLoading: boolean;
  /**
   * Convert database price (cents) to selected currency (main unit)
   * @param priceInCents - Price from database in cents
   * @returns Number in target currency's main unit
   */
  convertPrice: (priceInCents: number) => number;
  /**
   * Format database price for display
   * @param priceInCents - Price from database in cents
   * @returns Formatted string like "$100.00" or "€91.74"
   */
  formatPrice: (priceInCents: number) => string;
  /** Current currency symbol */
  currencySymbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

// ============================================
// LOCAL STORAGE KEYS
// ============================================

const CURRENCY_PREFERENCE_KEY = "foalrider_preferred_currency";

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get saved currency preference from localStorage
 */
function getPreferredCurrency(): SupportedCurrency | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(CURRENCY_PREFERENCE_KEY);
  if (saved && saved in CURRENCY_CONFIG) {
    return saved as SupportedCurrency;
  }
  return null;
}

/**
 * Save currency preference to localStorage
 */
function setPreferredCurrency(currency: SupportedCurrency): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CURRENCY_PREFERENCE_KEY, currency);
}

/**
 * Detect user's currency based on location
 */
async function detectUserCurrency(): Promise<SupportedCurrency> {
  try {
    const response = await fetch("https://ipapi.co/json/", {
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    const data = await response.json();

    console.log(
      "📍 User location detected:",
      data.country_name,
      `(${data.country_code})`
    );

    const currencyMap: Record<string, SupportedCurrency> = {
      IN: "INR",
      SG: "SGD",
      US: "USD",
      GB: "GBP",
      AU: "AUD",
      // EU countries
      DE: "EUR",
      FR: "EUR",
      IT: "EUR",
      ES: "EUR",
      NL: "EUR",
      BE: "EUR",
      AT: "EUR",
      PT: "EUR",
      IE: "EUR",
      GR: "EUR",
      FI: "EUR",
    };

    const detected = currencyMap[data.country_code] || "USD";
    console.log(`💰 Currency detected: ${detected}`);
    return detected;
  } catch (error) {
    console.error("Error detecting currency:", error);
    return "USD"; // Default to USD
  }
}

// ============================================
// PROVIDER COMPONENT
// ============================================

interface CurrencyProviderProps {
  children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [currency, setCurrencyState] = useState<SupportedCurrency>("USD");
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Load preferred currency and exchange rates on mount
  useEffect(() => {
    const loadCurrency = async () => {
      setIsLoading(true);

      // Check if user has a saved preference
      const saved = getPreferredCurrency();

      if (saved) {
        // Use saved preference
        setCurrencyState(saved);
      } else {
        // Auto-detect based on location
        try {
          console.log("🌍 Auto-detecting currency based on location...");
          const detected = await detectUserCurrency();
          console.log("✅ Detected currency:", detected);
          setCurrencyState(detected);
          setPreferredCurrency(detected);
        } catch (error) {
          console.error("Failed to detect currency, using USD:", error);
          setCurrencyState("USD");
          setPreferredCurrency("USD");
        }
      }

      // Fetch exchange rates from database
      try {
        const rates = await fetchExchangeRates();
        setExchangeRates(rates);
      } catch (error) {
        console.error("Failed to load exchange rates:", error);
        setExchangeRates(FALLBACK_EXCHANGE_RATES);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrency();
  }, []);

  // Save currency preference when it changes
  const setCurrency = useCallback((newCurrency: SupportedCurrency) => {
    setCurrencyState(newCurrency);
    setPreferredCurrency(newCurrency);
  }, []);

  /**
   * Convert price from database (paise) to selected currency (main unit)
   */
  const convertPrice = useCallback(
    (priceInPaise: number): number => {
      return convertToTargetCurrency(
        priceInPaise,
        currency,
        exchangeRates || FALLBACK_EXCHANGE_RATES
      );
    },
    [currency, exchangeRates]
  );

  /**
   * Format database price for display in selected currency
   */
  const formatPrice = useCallback(
    (priceInPaise: number): string => {
      return formatDatabasePrice(
        priceInPaise,
        currency,
        exchangeRates || FALLBACK_EXCHANGE_RATES
      );
    },
    [currency, exchangeRates]
  );

  // Get current currency symbol
  const currencySymbol = getCurrencySymbol(currency);

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    exchangeRates,
    isLoading,
    convertPrice,
    formatPrice,
    currencySymbol,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

/**
 * Hook to use currency context
 * @throws Error if used outside CurrencyProvider
 */
export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);

  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }

  return context;
}

/**
 * Hook with safe defaults for server-side rendering
 */
export function useCurrencySafe(): CurrencyContextType {
  try {
    return useCurrency();
  } catch {
    // Fallback for SSR or outside provider
    return {
      currency: "INR" as SupportedCurrency,
      setCurrency: () => {},
      exchangeRates: null,
      isLoading: false,
      convertPrice: (price: number) => price / 100,
      formatPrice: (price: number) => formatCurrencyValue(price / 100, "INR"),
      currencySymbol: "₹",
    };
  }
}

// Re-export types for convenience
export type { SupportedCurrency, ExchangeRates };
