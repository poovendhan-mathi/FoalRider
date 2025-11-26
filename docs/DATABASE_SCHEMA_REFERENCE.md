# DATABASE SCHEMA REFERENCE - VERIFIED FROM SUPABASE

## Generated: November 26, 2025

**⚠️ CRITICAL: This document reflects the ACTUAL database structure from Supabase.**
**Always refer to this when making code changes related to orders.**

---

## ORDERS TABLE - ACTUAL STRUCTURE

### Complete Column List (from live database):

| Column Name                | Data Type     | Nullable | Usage in Code                                     |
| -------------------------- | ------------- | -------- | ------------------------------------------------- |
| `id`                       | string (uuid) | NO       | Primary key, auto-generated                       |
| `order_number`             | string        | NO       | **REQUIRED** - Format: `ORD-{timestamp}-{random}` |
| `user_id`                  | string (uuid) | YES      | User ID for authenticated users, NULL for guests  |
| `guest_id`                 | string        | YES      | Guest identifier for anonymous checkouts          |
| `guest_email`              | string        | YES      | Guest email for anonymous checkouts               |
| `email`                    | string        | NO       | **REQUIRED** - Customer email (all orders)        |
| `status`                   | string (enum) | NO       | Order status: pending, processing, shipped, etc.  |
| `subtotal`                 | number        | YES      | Subtotal before shipping/tax (can be NULL!)       |
| `shipping_cost`            | number        | NO       | Shipping cost, defaults to 0                      |
| `tax`                      | number        | NO       | Tax amount, defaults to 0                         |
| `discount`                 | number        | NO       | Discount amount, defaults to 0                    |
| `total_amount`             | number        | NO       | **REQUIRED** - Final total amount                 |
| `currency`                 | string        | NO       | Currency code (INR, USD, etc.)                    |
| `payment_status`           | string (enum) | NO       | pending, paid, failed, refunded                   |
| `payment_intent_id`        | string        | YES      | **PRIMARY** Stripe payment intent ID              |
| `stripe_payment_intent_id` | string        | YES      | **BACKUP** field (use payment_intent_id instead)  |
| `payment_method`           | string        | YES      | Payment method type                               |
| `shipping_address`         | object/json   | YES      | Full shipping address as JSON string              |
| `shipping_name`            | string        | YES      | Recipient name                                    |
| `shipping_phone`           | string        | YES      | Recipient phone                                   |
| `shipping_address_id`      | string        | YES      | Reference to addresses table (if used)            |
| `customer_name`            | string        | YES      | Customer full name                                |
| `customer_email`           | string        | YES      | Customer email (duplicate of email field)         |
| `customer_phone`           | string        | YES      | Customer phone number                             |
| `tracking_number`          | string        | YES      | Shipping tracking number                          |
| `notes`                    | string        | YES      | Additional notes                                  |
| `created_at`               | timestamp     | NO       | Auto-generated creation time                      |
| `updated_at`               | timestamp     | NO       | Auto-updated modification time                    |

---

## CRITICAL FIELD NAME CORRECTIONS

### ❌ WRONG (what we thought) → ✅ CORRECT (actual database)

1. **Total field:**

   - ❌ WRONG: `total`
   - ✅ CORRECT: `total_amount`

2. **Payment Intent ID:**

   - ❌ WRONG: `stripe_payment_intent_id` (this exists but not primary)
   - ✅ CORRECT: `payment_intent_id` (use this one!)

3. **Email field:**
   - ✅ Database has: `email` (required)
   - ✅ Also has: `customer_email` (optional duplicate)
   - ✅ Also has: `guest_email` (for guest tracking)

---

## SAMPLE ACTUAL ORDER FROM DATABASE

```json
{
  "id": "3981aa90-4a21-4752-9824-1c4b60090aa4",
  "order_number": "ORD-20251125-922290",
  "user_id": null,
  "guest_id": "guest_1764092860638_y6lg8wlvj",
  "guest_email": "qwerwerrqwer@gmail.com",
  "email": "qwerwerrqwer@gmail.com",
  "status": "processing",
  "subtotal": null,
  "shipping_cost": 0,
  "tax": 0,
  "discount": 0,
  "total_amount": 6252.82,
  "currency": "INR",
  "payment_status": "paid",
  "payment_intent_id": "pi_3SXQKZGoCTDLS4dU1dFAzj9P",
  "stripe_payment_intent_id": null,
  "payment_method": null,
  "shipping_address": {
    "city": "fgjfg",
    "phone": "686585678",
    "state": "fgjgfjh",
    "address": "fgjjh",
    "country": "India",
    "zipCode": "34565466",
    "lastName": "dfh",
    "firstName": "dfgh"
  },
  "shipping_name": null,
  "shipping_phone": null,
  "customer_name": null,
  "customer_email": null,
  "customer_phone": null,
  "tracking_number": null,
  "notes": null,
  "created_at": "2025-11-25T17:47:43.073695+00:00",
  "updated_at": "2025-11-25T17:47:41.353+00:00"
}
```

---

## REQUIRED FIELDS FOR ORDER CREATION

When inserting a new order, these fields are **MANDATORY**:

```typescript
{
  order_number: string,    // Format: ORD-{timestamp}-{random}
  email: string,           // Customer email
  total_amount: number,    // Final total
  currency: string,        // Default: "INR"
  status: string,          // Default: "processing"
  payment_status: string,  // Default: "paid"
}
```

---

## GUEST CHECKOUT FIELDS

For anonymous/guest checkout, set:

```typescript
{
  user_id: null,                        // No user account
  guest_id: `guest_{timestamp}_{random}`, // Tracking ID
  guest_email: customerEmail,           // Guest's email
  email: customerEmail,                 // Same as guest_email
}
```

---

## AUTHENTICATED USER CHECKOUT

For logged-in users, set:

```typescript
{
  user_id: userId,          // User's UUID
  guest_id: null,           // Not a guest
  guest_email: null,        // Not a guest
  email: userEmail,         // User's email
}
```

---

## PAYMENT FIELD MAPPING

```typescript
{
  payment_intent_id: paymentIntent.id,        // PRIMARY - use this!
  stripe_payment_intent_id: null,             // Leave null or duplicate
  payment_method: paymentIntent.payment_method_types?.[0],
  payment_status: 'paid',
}
```

---

## SHIPPING ADDRESS FORMAT

The `shipping_address` field stores a JSON string:

```typescript
shipping_address: JSON.stringify({
  firstName: string,
  lastName: string,
  address: string,
  city: string,
  state: string,
  zipCode: string,
  country: string,
  phone: string,
});
```

---

## ORDER_ITEMS TABLE STRUCTURE

(To be verified - need to check if this table exists and its structure)

Expected structure:

- `id`: UUID primary key
- `order_id`: UUID foreign key to orders.id
- `product_id`: UUID foreign key to products.id
- `quantity`: integer
- `unit_price`: number
- `total_price`: number
- `product_name`: string (snapshot)
- `product_description`: string (snapshot)

---

## HOW TO VERIFY THIS DOCUMENT IS UP TO DATE

Run this command to check current database structure:

```bash
npx tsx check-database-structure.ts
```

Compare the output with this document. If there are differences:

1. Update this document
2. Update `database.types.ts`
3. Update checkout code
4. Test thoroughly

---

## COMMON MISTAKES TO AVOID

1. ❌ Using `total` instead of `total_amount`
2. ❌ Using `stripe_payment_intent_id` as primary field
3. ❌ Forgetting to set `email` field
4. ❌ Not generating `order_number`
5. ❌ Passing shipping_address as object instead of JSON string
6. ❌ Assuming `subtotal` is required (it's nullable!)

---

## LAST VERIFIED

- **Date**: November 26, 2025
- **Method**: Direct Supabase query via `check-database-structure.ts`
- **Database**: Supabase PostgreSQL
- **Environment**: Production/Development

---

## FILES TO UPDATE WHEN SCHEMA CHANGES

1. `src/types/database.types.ts` - TypeScript types
2. `src/app/checkout/page.tsx` - Order creation logic
3. `docs/DATABASE_SCHEMA_REFERENCE.md` - This file
4. Any admin pages that query/update orders

---

**⚠️ REMEMBER: The database is the source of truth, not the types file!**
