# 🗄️ FoalRider - Database Schema

Complete database documentation for Supabase PostgreSQL.

---

## Overview

| Property           | Value                 |
| ------------------ | --------------------- |
| Provider           | Supabase              |
| Database           | PostgreSQL 15         |
| Authentication     | Supabase Auth         |
| Total Tables       | 10                    |
| Row Level Security | Enabled on all tables |

---

## Entity Relationship Diagram

```text
                    ┌─────────────────┐
                    │   auth.users    │
                    │   (Supabase)    │
                    └────────┬────────┘
                             │ 1:1
                             ▼
                    ┌─────────────────┐
                    │    profiles     │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   addresses   │   │    orders     │   │  cart_items   │
└───────────────┘   └───────┬───────┘   └───────┬───────┘
                            │                   │
                            ▼                   │
                    ┌───────────────┐           │
                    │  order_items  │           │
                    └───────┬───────┘           │
                            │                   │
                            ▼                   ▼
                    ┌───────────────────────────────┐
                    │           products            │
                    └───────────────┬───────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            │                       │                       │
            ▼                       ▼                       ▼
    ┌───────────────┐      ┌───────────────┐       ┌───────────────┐
    │product_images │      │product_variants│       │   reviews     │
    └───────────────┘      └───────────────┘       └───────────────┘

                    ┌───────────────┐
                    │  categories   │◄──┐
                    └───────────────┘   │ self-reference
                            ▲           │ (parent_id)
                            └───────────┘
```

---

## Tables

### 1. profiles

User profile information, linked to Supabase Auth.

| Column       | Type        | Nullable | Default    | Description                        |
| ------------ | ----------- | -------- | ---------- | ---------------------------------- |
| `id`         | UUID        | NO       | -          | Primary key, FK to `auth.users.id` |
| `full_name`  | TEXT        | YES      | NULL       | User's display name                |
| `email`      | TEXT        | YES      | NULL       | Email (mirrored from auth)         |
| `phone`      | TEXT        | YES      | NULL       | Phone number                       |
| `avatar_url` | TEXT        | YES      | NULL       | Profile picture URL                |
| `role`       | TEXT        | NO       | 'customer' | User role: 'customer' or 'admin'   |
| `created_at` | TIMESTAMPTZ | NO       | NOW()      | Account creation time              |
| `updated_at` | TIMESTAMPTZ | NO       | NOW()      | Last update time                   |

**Constraints:**

- `role` must be either 'customer' or 'admin'

**Indexes:**

- `idx_profiles_role` on `role`
- `idx_profiles_email` on `email`

**RLS Policies:**

- Users can read their own profile
- Users can update their own profile
- Admins can read all profiles

---

### 2. categories

Product categories with hierarchical support.

| Column        | Type        | Nullable | Default           | Description                         |
| ------------- | ----------- | -------- | ----------------- | ----------------------------------- |
| `id`          | UUID        | NO       | gen_random_uuid() | Primary key                         |
| `name`        | TEXT        | NO       | -                 | Category name                       |
| `slug`        | TEXT        | NO       | -                 | URL-friendly identifier (unique)    |
| `description` | TEXT        | YES      | NULL              | Category description                |
| `parent_id`   | UUID        | YES      | NULL              | FK to `categories.id` for hierarchy |
| `sort_order`  | INTEGER     | NO       | 0                 | Display order                       |
| `is_active`   | BOOLEAN     | NO       | true              | Visibility flag                     |
| `created_at`  | TIMESTAMPTZ | NO       | NOW()             | Creation timestamp                  |

**Constraints:**

- `slug` must be unique

**Indexes:**

- `idx_categories_slug` on `slug`
- `idx_categories_parent` on `parent_id`

**RLS Policies:**

- Public read access for active categories
- Admin-only write access

**Example Hierarchy:**

```text
Men's Wear (parent_id: NULL)
├── Jeans (parent_id: mens-wear-id)
│   ├── Slim Fit (parent_id: jeans-id)
│   └── Regular Fit (parent_id: jeans-id)
└── Jackets (parent_id: mens-wear-id)
```

---

### 3. products

Main product catalog.

| Column        | Type        | Nullable | Default           | Description                         |
| ------------- | ----------- | -------- | ----------------- | ----------------------------------- |
| `id`          | UUID        | NO       | gen_random_uuid() | Primary key                         |
| `name`        | TEXT        | NO       | -                 | Product name                        |
| `slug`        | TEXT        | YES      | NULL              | URL-friendly identifier             |
| `description` | TEXT        | YES      | NULL              | Product description (supports HTML) |
| `price`       | NUMERIC     | NO       | -                 | Base price in default currency      |
| `currency`    | TEXT        | NO       | 'INR'             | Price currency code                 |
| `inventory`   | INTEGER     | NO       | 0                 | Stock quantity                      |
| `is_active`   | BOOLEAN     | NO       | true              | Visibility flag                     |
| `category_id` | UUID        | YES      | NULL              | FK to `categories.id`               |
| `image_url`   | TEXT        | YES      | NULL              | Primary product image               |
| `created_at`  | TIMESTAMPTZ | NO       | NOW()             | Creation timestamp                  |

**Constraints:**

- `price` must be >= 0
- `inventory` must be >= 0

**Indexes:**

- `idx_products_slug` on `slug`
- `idx_products_category` on `category_id`
- `idx_products_active` on `is_active`

**RLS Policies:**

- Public read access for active products
- Admin-only write access

---

### 4. product_images

Multiple images per product.

| Column       | Type    | Nullable | Default           | Description                 |
| ------------ | ------- | -------- | ----------------- | --------------------------- |
| `id`         | UUID    | NO       | gen_random_uuid() | Primary key                 |
| `product_id` | UUID    | YES      | NULL              | FK to `products.id`         |
| `url`        | TEXT    | NO       | -                 | Image URL                   |
| `alt`        | TEXT    | YES      | NULL              | Alt text for accessibility  |
| `sort_order` | INTEGER | NO       | 0                 | Display order (0 = primary) |

**Indexes:**

- `idx_product_images_product` on `product_id`

**RLS Policies:**

- Public read access
- Admin-only write access

---

### 5. product_variants

Product variations (size, color, etc.).

| Column        | Type    | Nullable | Default           | Description                       |
| ------------- | ------- | -------- | ----------------- | --------------------------------- |
| `id`          | UUID    | NO       | gen_random_uuid() | Primary key                       |
| `product_id`  | UUID    | YES      | NULL              | FK to `products.id`               |
| `size`        | TEXT    | YES      | NULL              | Size value (XS, S, M, L, XL, XXL) |
| `color`       | TEXT    | YES      | NULL              | Color name                        |
| `color_hex`   | TEXT    | YES      | NULL              | Color hex code (#FFFFFF)          |
| `color_name`  | TEXT    | YES      | NULL              | Display color name                |
| `fabric_type` | TEXT    | YES      | NULL              | Fabric material                   |
| `extra_price` | NUMERIC | NO       | 0                 | Price adjustment (+/-)            |
| `inventory`   | INTEGER | NO       | 0                 | Variant-specific stock            |

**Indexes:**

- `idx_product_variants_product` on `product_id`

**RLS Policies:**

- Public read access
- Admin-only write access

---

### 6. addresses

User shipping addresses.

| Column          | Type        | Nullable | Default           | Description          |
| --------------- | ----------- | -------- | ----------------- | -------------------- |
| `id`            | UUID        | NO       | gen_random_uuid() | Primary key          |
| `user_id`       | UUID        | NO       | -                 | FK to `profiles.id`  |
| `full_name`     | TEXT        | NO       | -                 | Recipient name       |
| `phone`         | TEXT        | NO       | -                 | Contact number       |
| `address_line1` | TEXT        | NO       | -                 | Street address       |
| `address_line2` | TEXT        | YES      | NULL              | Apt/Suite/Unit       |
| `city`          | TEXT        | NO       | -                 | City name            |
| `state`         | TEXT        | NO       | -                 | State/Province       |
| `postal_code`   | TEXT        | NO       | -                 | ZIP/Postal code      |
| `country`       | TEXT        | NO       | 'India'           | Country name         |
| `is_default`    | BOOLEAN     | NO       | false             | Default address flag |
| `created_at`    | TIMESTAMPTZ | NO       | NOW()             | Creation timestamp   |

**Indexes:**

- `idx_addresses_user` on `user_id`

**RLS Policies:**

- Users can CRUD their own addresses
- Admins can read all addresses

---

### 7. orders

Customer orders (supports both authenticated and guest users).

| Column              | Type        | Nullable | Default           | Description                         |
| ------------------- | ----------- | -------- | ----------------- | ----------------------------------- |
| `id`                | UUID        | NO       | gen_random_uuid() | Primary key                         |
| `user_id`           | UUID        | YES      | NULL              | FK to `profiles.id` (authenticated) |
| `guest_id`          | UUID        | YES      | NULL              | Guest session identifier            |
| `guest_email`       | TEXT        | YES      | NULL              | Guest user email                    |
| `order_number`      | TEXT        | NO       | -                 | Human-readable order ID (unique)    |
| `email`             | TEXT        | NO       | -                 | Order confirmation email            |
| `status`            | TEXT        | NO       | 'pending'         | Order status                        |
| `subtotal`          | NUMERIC     | YES      | NULL              | Items total before tax/shipping     |
| `shipping_cost`     | NUMERIC     | NO       | 0                 | Shipping charges                    |
| `tax`               | NUMERIC     | NO       | 0                 | Tax amount                          |
| `discount`          | NUMERIC     | NO       | 0                 | Discount amount                     |
| `total_amount`      | NUMERIC     | NO       | -                 | Final order total                   |
| `currency`          | TEXT        | NO       | 'INR'             | Order currency                      |
| `shipping_name`     | TEXT        | YES      | NULL              | Recipient name                      |
| `shipping_phone`    | TEXT        | YES      | NULL              | Contact phone                       |
| `shipping_address`  | TEXT        | YES      | NULL              | Full shipping address               |
| `payment_status`    | TEXT        | NO       | 'pending'         | Payment status                      |
| `payment_method`    | TEXT        | YES      | NULL              | Payment method used                 |
| `payment_intent_id` | TEXT        | YES      | NULL              | Stripe payment intent ID            |
| `tracking_number`   | TEXT        | YES      | NULL              | Shipment tracking ID                |
| `notes`             | TEXT        | YES      | NULL              | Order notes                         |
| `created_at`        | TIMESTAMPTZ | NO       | NOW()             | Order creation time                 |
| `updated_at`        | TIMESTAMPTZ | NO       | NOW()             | Last update time                    |

**Order Status Values:**
| Status | Description |
|--------|-------------|
| `pending` | Order created, awaiting payment |
| `confirmed` | Payment received |
| `processing` | Being prepared for shipment |
| `shipped` | Out for delivery |
| `delivered` | Successfully delivered |
| `cancelled` | Order cancelled |
| `refunded` | Payment refunded |

**Payment Status Values:**
| Status | Description |
|--------|-------------|
| `pending` | Awaiting payment |
| `paid` | Payment successful |
| `failed` | Payment failed |
| `refunded` | Payment refunded |

**Indexes:**

- `idx_orders_user` on `user_id`
- `idx_orders_number` on `order_number`
- `idx_orders_status` on `status`

**RLS Policies:**

- Users can read their own orders
- Guest orders accessible via guest_id
- Admins can read/update all orders

---

### 8. order_items

Line items for each order.

| Column                | Type        | Nullable | Default           | Description                 |
| --------------------- | ----------- | -------- | ----------------- | --------------------------- |
| `id`                  | UUID        | NO       | gen_random_uuid() | Primary key                 |
| `order_id`            | UUID        | NO       | -                 | FK to `orders.id`           |
| `product_id`          | UUID        | YES      | NULL              | FK to `products.id`         |
| `variant_id`          | UUID        | YES      | NULL              | FK to `product_variants.id` |
| `product_name`        | TEXT        | NO       | -                 | Product name (snapshot)     |
| `product_description` | TEXT        | YES      | NULL              | Description (snapshot)      |
| `variant_details`     | JSONB       | YES      | NULL              | Variant info (snapshot)     |
| `quantity`            | INTEGER     | NO       | -                 | Quantity ordered            |
| `unit_price`          | NUMERIC     | NO       | -                 | Price per unit              |
| `total_price`         | NUMERIC     | NO       | -                 | Line total (qty × price)    |
| `created_at`          | TIMESTAMPTZ | NO       | NOW()             | Creation timestamp          |

**Note:** Product data is snapshotted at order time to preserve history even if product changes or is deleted.

**Indexes:**

- `idx_order_items_order` on `order_id`
- `idx_order_items_product` on `product_id`

**RLS Policies:**

- Inherits from parent order's access

---

### 9. cart_items

Persistent shopping cart for authenticated users.

| Column       | Type        | Nullable | Default           | Description                 |
| ------------ | ----------- | -------- | ----------------- | --------------------------- |
| `id`         | UUID        | NO       | gen_random_uuid() | Primary key                 |
| `user_id`    | UUID        | NO       | -                 | FK to `profiles.id`         |
| `product_id` | UUID        | NO       | -                 | FK to `products.id`         |
| `variant_id` | UUID        | YES      | NULL              | FK to `product_variants.id` |
| `quantity`   | INTEGER     | NO       | 1                 | Item quantity               |
| `created_at` | TIMESTAMPTZ | NO       | NOW()             | Added to cart time          |
| `updated_at` | TIMESTAMPTZ | NO       | NOW()             | Last update time            |

**Note:** Guest carts are stored in localStorage, not in the database.

**Indexes:**

- `idx_cart_items_user` on `user_id`
- `idx_cart_items_product` on `product_id`

**RLS Policies:**

- Users can CRUD their own cart items only

---

### 10. reviews

Product reviews and ratings.

| Column                 | Type        | Nullable | Default           | Description                      |
| ---------------------- | ----------- | -------- | ----------------- | -------------------------------- |
| `id`                   | UUID        | NO       | gen_random_uuid() | Primary key                      |
| `product_id`           | UUID        | NO       | -                 | FK to `products.id`              |
| `user_id`              | UUID        | NO       | -                 | FK to `profiles.id`              |
| `order_id`             | UUID        | YES      | NULL              | FK to `orders.id` (for verified) |
| `rating`               | INTEGER     | NO       | -                 | 1-5 star rating                  |
| `title`                | TEXT        | YES      | NULL              | Review title                     |
| `comment`              | TEXT        | YES      | NULL              | Review text                      |
| `is_verified_purchase` | BOOLEAN     | NO       | false             | User purchased this product      |
| `is_approved`          | BOOLEAN     | NO       | false             | Admin approved                   |
| `created_at`           | TIMESTAMPTZ | NO       | NOW()             | Review creation time             |

**Constraints:**

- `rating` must be between 1 and 5

**Indexes:**

- `idx_reviews_product` on `product_id`
- `idx_reviews_user` on `user_id`

**RLS Policies:**

- Public read access for approved reviews
- Users can create/edit their own reviews
- Admins can approve/delete reviews

---

## Row Level Security (RLS) Summary

All tables have RLS enabled for security:

| Table            | Public Read   | Auth Read      | Auth Write | Admin Full |
| ---------------- | ------------- | -------------- | ---------- | ---------- |
| profiles         | ❌            | Own only       | Own only   | ✅         |
| categories       | ✅ (active)   | ✅             | ❌         | ✅         |
| products         | ✅ (active)   | ✅             | ❌         | ✅         |
| product_images   | ✅            | ✅             | ❌         | ✅         |
| product_variants | ✅            | ✅             | ❌         | ✅         |
| addresses        | ❌            | Own only       | Own only   | ✅         |
| orders           | ❌            | Own only       | ❌         | ✅         |
| order_items      | ❌            | Via order      | ❌         | ✅         |
| cart_items       | ❌            | Own only       | Own only   | ❌         |
| reviews          | ✅ (approved) | Own + approved | Own only   | ✅         |

---

## Common Queries

### Get Products with Category

```sql
SELECT
  p.*,
  c.name as category_name,
  c.slug as category_slug
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true
ORDER BY p.created_at DESC;
```

### Get Product with Images and Variants

```sql
SELECT
  p.*,
  json_agg(DISTINCT pi.*) as images,
  json_agg(DISTINCT pv.*) as variants
FROM products p
LEFT JOIN product_images pi ON pi.product_id = p.id
LEFT JOIN product_variants pv ON pv.product_id = p.id
WHERE p.slug = 'product-slug'
GROUP BY p.id;
```

### Get User Orders with Items

```sql
SELECT
  o.*,
  json_agg(oi.*) as items
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE o.user_id = 'user-uuid'
GROUP BY o.id
ORDER BY o.created_at DESC;
```

### Get Category with Children

```sql
WITH RECURSIVE category_tree AS (
  SELECT *, 0 as level
  FROM categories
  WHERE parent_id IS NULL

  UNION ALL

  SELECT c.*, ct.level + 1
  FROM categories c
  JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree
ORDER BY level, sort_order;
```

---

## Triggers

### Auto-create Profile on Signup

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, created_at)
  VALUES (NEW.id, NEW.email, 'customer', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Update Timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at column
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```
