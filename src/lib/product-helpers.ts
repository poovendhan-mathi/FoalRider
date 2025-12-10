/**
 * Client-safe product helper functions
 * These utilities can be used in both server and client components
 */

/**
 * Get product image URL with fallback to placeholder
 */
export function getProductImageUrl(product: {
  image_url?: string | null;
}): string {
  return product.image_url || "/placeholder.jpg";
}

/**
 * Format currency with locale
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  const currencyMap: Record<string, string> = {
    INR: "en-IN",
    SGD: "en-SG",
    USD: "en-US",
    EUR: "en-EU",
    GBP: "en-GB",
    AUD: "en-AU",
  };

  const locale = currencyMap[currency] || "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Check if product is in stock
 */
export function isProductInStock(inventory: number): boolean {
  return inventory > 0;
}

/**
 * Check if product has low stock
 */
export function isProductLowStock(
  inventory: number,
  threshold: number = 5
): boolean {
  return inventory > 0 && inventory <= threshold;
}

/**
 * Get stock status badge
 */
export function getStockStatus(inventory: number): {
  status: "in-stock" | "low-stock" | "out-of-stock";
  label: string;
  color: string;
} {
  if (inventory <= 0) {
    return {
      status: "out-of-stock",
      label: "Out of Stock",
      color: "destructive",
    };
  }

  if (inventory <= 5) {
    return {
      status: "low-stock",
      label: `Only ${inventory} left in stock`,
      color: "warning",
    };
  }

  return {
    status: "in-stock",
    label: "In Stock",
    color: "success",
  };
}
