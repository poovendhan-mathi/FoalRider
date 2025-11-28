"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  SupportedCurrency,
  ExchangeRates,
  getExchangeRates,
  convertPrice as convertPriceUtil,
  formatPrice as formatPriceUtil,
  getPreferredCurrency,
  setPreferredCurrency,
  getCurrencySymbol,
  detectUserCurrency,
} from "@/lib/currency";

interface CurrencyContextType {
  currency: SupportedCurrency;
  setCurrency: (currency: SupportedCurrency) => void;
  exchangeRates: ExchangeRates | null;
  isLoading: boolean;
  convertPrice: (priceInINR: number) => number;
  formatPrice: (priceInINR: number) => string;
  currencySymbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

interface CurrencyProviderProps {
  children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [currency, setCurrencyState] = useState<SupportedCurrency>("INR");
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

      // If no saved preference, auto-detect based on location
      if (!saved || saved === "INR") {
        try {
          console.log("🌍 Auto-detecting currency based on location...");
          const detected = await detectUserCurrency();
          console.log("✅ Detected currency:", detected);
          setCurrencyState(detected);
          setPreferredCurrency(detected); // Save for future visits
        } catch (error) {
          console.error(
            "Failed to detect currency, using SGD as default:",
            error
          );
          setCurrencyState("SGD"); // Default to SGD if detection fails
          setPreferredCurrency("SGD");
        }
      } else {
        // Use saved preference
        setCurrencyState(saved);
      }

      // Fetch exchange rates
      try {
        const rates = await getExchangeRates();
        setExchangeRates(rates);
      } catch (error) {
        console.error("Failed to load exchange rates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrency();
  }, []);

  // Save currency preference when it changes
  const setCurrency = (newCurrency: SupportedCurrency) => {
    setCurrencyState(newCurrency);
    setPreferredCurrency(newCurrency);
  };

  // Convert price from INR to selected currency
  const convertPrice = (priceInINR: number): number => {
    if (!exchangeRates) return priceInINR;
    return convertPriceUtil(priceInINR, currency, exchangeRates);
  };

  // Format price with currency symbol
  const formatPrice = (priceInINR: number): string => {
    const convertedPrice = convertPrice(priceInINR);
    return formatPriceUtil(convertedPrice, currency);
  };

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
 * Optional: Hook with safe defaults for server-side rendering
 */
export function useCurrencySafe() {
  try {
    return useCurrency();
  } catch {
    // Fallback for SSR or outside provider
    return {
      currency: "INR" as SupportedCurrency,
      setCurrency: () => {},
      exchangeRates: null,
      isLoading: false,
      convertPrice: (price: number) => price,
      formatPrice: (price: number) => formatPriceUtil(price, "INR"),
      currencySymbol: "₹",
    };
  }
}
