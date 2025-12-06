# FoalRider Pricing Convention

## Overview

All monetary values in FoalRider are stored in the **smallest currency unit** (paise for INR, cents for USD/EUR/GBP, etc.). This is a common practice in e-commerce applications and aligns with Stripe's requirements.

## Centralized Pricing System

All pricing logic is now centralized in `src/lib/pricing.ts`. This is the **single source of truth** for:

- Currency conversion
- Price formatting
- Exchange rate management
- Stripe amount conversion

### Key Files

| File                               | Purpose                             |
| ---------------------------------- | ----------------------------------- |
| `src/lib/pricing.ts`               | Core pricing logic (use this!)      |
| `src/contexts/CurrencyContext.tsx` | React context for currency state    |
| `src/components/PriceDisplay.tsx`  | Reusable price display component    |
| `src/lib/currency.ts`              | DEPRECATED - use pricing.ts instead |

## Key Convention

| Currency | Smallest Unit | Example                |
| -------- | ------------- | ---------------------- |
| INR      | Paise         | ₹1,000 = 100,000 paise |
| USD      | Cents         | $10.00 = 1,000 cents   |
| EUR      | Cents         | €10.00 = 1,000 cents   |
| GBP      | Pence         | £10.00 = 1,000 pence   |
| SGD      | Cents         | S$10.00 = 1,000 cents  |
| AUD      | Cents         | A$10.00 = 1,000 cents  |

## Database Tables

### `products` table

- `price`: Product price in **paise** (integer)

### `orders` table

- `subtotal`: Order subtotal in **paise**
- `shipping_cost`: Shipping cost in **paise**
- `tax`: Tax amount in **paise**
- `discount`: Discount amount in **paise**
- `total_amount`: Total order amount in **paise**

### `order_items` table

- `unit_price`: Price per unit in **paise**
- `total_price`: Total price (unit_price × quantity) in **paise**

### `product_variants` table

- `extra_price`: Additional price for variant in **paise**

### `currency_rates` table

- `rate_to_inr`: Exchange rate (1 foreign unit = X INR)

## Frontend Display

The `CurrencyContext` handles all conversions:

```typescript
// Input: price in paise
// Output: formatted string in user's selected currency
const { formatPrice } = useCurrency();
formatPrice(100000); // "₹1,000.00" or "$12.50" based on currency
```

### Important Functions

1. **`convertPrice(priceInPaise)`** - Converts paise to the selected currency's main unit
2. **`formatPrice(priceInPaise)`** - Converts and formats with currency symbol

## API Guidelines

### Creating Products (Admin API)

```typescript
// POST /api/admin/products
{
  "name": "Premium Riding Boots",
  "price": 599900, // ₹5,999 in paise
  "sku": "BOOT-001"
}
```

### Creating Payment Intent

```typescript
// POST /api/create-payment-intent
{
  "amount": 599900, // Amount in paise (Stripe requires smallest unit)
  "currency": "inr"
}
```

## Validation

All price inputs are validated using Zod schemas in `/src/lib/validations/api-schemas.ts`:

```typescript
// Prices must be:
// - Whole numbers (integers)
// - Positive (minimum 1 paise for products)
// - Maximum 10,000,000 paise (₹1,00,000) for products

export const priceInPaiseSchema = z
  .number()
  .int("Price must be a whole number (paise)")
  .min(0)
  .max(10000000);
```

## Common Gotchas

### ❌ Wrong

```typescript
// Don't display database price directly
<span>₹{product.price}</span> // Shows ₹100000 instead of ₹1,000
```

### ✅ Correct

```typescript
// Always use formatPrice or convertPrice
const { formatPrice } = useCurrency();
<span>{formatPrice(product.price)}</span>; // Shows ₹1,000.00
```

### ❌ Wrong

```typescript
// Don't compare rupees to paise
if (total > 2000) {
  // 2000 what? rupees or paise?
  // Free shipping
}
```

### ✅ Correct

```typescript
// Use paise consistently with clear comments
const FREE_SHIPPING_THRESHOLD_PAISE = 200000; // ₹2,000 in paise
if (total > FREE_SHIPPING_THRESHOLD_PAISE) {
  // Free shipping
}
```

## Multi-Currency Support

FoalRider supports multiple currencies via the `currency_rates` table:

1. Products are stored in INR (paise)
2. Exchange rates are fetched from the database
3. Frontend converts to user's selected currency
4. Stripe payments use the user's selected currency

### Supported Currencies

- INR (Indian Rupee) - Default
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- SGD (Singapore Dollar)
- AUD (Australian Dollar)

## Testing Prices

When writing tests or seeding data:

```typescript
// Create a product priced at ₹1,500
const product = {
  name: "Test Product",
  price: 150000, // 150000 paise = ₹1,500
};

// Test cart with ₹2,500 total
const cartTotal = 250000; // 250000 paise = ₹2,500
```

## Stripe Integration

Stripe requires amounts in the smallest currency unit, which matches our storage convention:

```typescript
// Our database stores: 599900 paise
// Stripe expects: 599900 (smallest unit)
// No conversion needed!

const paymentIntent = await stripe.paymentIntents.create({
  amount: order.total_amount, // Already in paise
  currency: "inr",
});
```

---

**Last Updated:** December 2024
**Maintainer:** FoalRider Dev Team
