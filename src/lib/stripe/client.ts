import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;

/**
 * Get Stripe.js instance
 * Singleton pattern to avoid loading Stripe multiple times
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
}

/**
 * Create payment intent and get client secret
 * @param amount - Amount in smallest currency unit (cents/paise)
 * @param currency - Currency code (default: 'usd')
 * @param metadata - Optional metadata to attach to payment intent
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = "usd",
  metadata?: Record<string, string | number>
) {
  try {
    const response = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency,
        metadata,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create payment intent");
    }

    const data = await response.json();
    return {
      clientSecret: data.clientSecret,
      paymentIntentId: data.paymentIntentId,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Create payment intent error:", error.message);
      throw error;
    }
    throw new Error("An unknown error occurred while creating payment intent");
  }
}

/**
 * Format amount for display (converts from smallest currency unit)
 */
export function formatStripeAmount(amount: number, currency: string): string {
  const divisor = getAmountDivisor(currency);
  const value = amount / divisor;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(value);
}

/**
 * Convert amount to Stripe format (smallest currency unit)
 * 
 * @param amount - Amount in currency units (e.g., 78.01 dollars/rupees)
 * @param currency - Currency code (e.g., 'SGD', 'USD', 'INR')
 * @returns Amount in smallest unit (cents/paise)
 * 
 * NOTE: This function assumes the amount is ALREADY in the correct currency!
 * It only converts from dollars/rupees to cents/paise (multiply by 100).
 * Currency conversion should happen BEFORE calling this function.
 */
export function toStripeAmount(amount: number, currency: string): number {
  // Simply convert to smallest unit (multiply by 100 for most currencies)
  const divisor = getAmountDivisor(currency);
  return Math.round(amount * divisor);
}

/**
 * Get divisor for currency (100 for USD/EUR/INR, 1 for JPY)
 */
function getAmountDivisor(currency: string): number {
  const zeroCurrencies = ["jpy", "krw"];
  return zeroCurrencies.includes(currency.toLowerCase()) ? 1 : 100;
}
