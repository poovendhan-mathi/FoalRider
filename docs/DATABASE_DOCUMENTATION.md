# 🗄️ FoalRider - Database Documentation

**Last Updated:** November 26, 2025  
**Database Provider:** Supabase (PostgreSQL 15)  
**Schema Version:** 1.0

---

## 📋 Table of Contents

1. [Database Overview](#database-overview)
2. [Schema Architecture](#schema-architecture)
3. [Tables Reference](#tables-reference)
4. [Required Migrations](#required-migrations)
5. [Row Level Security (RLS)](#row-level-security)
6. [Relationships](#relationships)

---

## 🎯 Database Overview

### Current Structure

- **Total Tables:** 10
- **Authentication:** Supabase Auth (`auth.users`)
- **User Data:** `profiles` table
- **Product System:** `products`, `categories`, `product_images`, `product_variants`
- **Order System:** `orders`, `order_items`, `addresses`
- **Shopping:** `cart_items`
- **Reviews:** `reviews`

### Key Features

- ✅ Row-Level Security (RLS) enabled
- ✅ UUID primary keys
- ✅ Foreign key constraints
- ✅ Timestamp tracking
- ✅ Support for guest checkouts
- ✅ Multi-currency support

---

## 🏗️ Schema Architecture

```
auth.users (Supabase)
    ↓
profiles (User Profiles)
    ↓
├── orders (Customer Orders)
│   ├── order_items (Line Items)
│   │   └── products
│   └── addresses (Shipping)
├── cart_items (Shopping Cart)
│   └── products
│       ├── product_images
│       ├── product_variants
│       └── categories
└── reviews (Product Reviews)
    └── products
```

---

## 📊 Tables Reference

### 1. **profiles**

**Purpose:** User profile information

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | - | FK to auth.users.id (PK) |
| `full_name` | TEXT | YES | NULL | User's full name |
| `avatar_url` | TEXT | YES | NULL | Profile picture URL |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Account creation time |

**Missing Columns (Need Migration):**

- ❌ `email` (TEXT) - Should mirror auth.users.email
- ❌ `phone` (TEXT) - User's phone number
- ❌ `role` (TEXT) - 'customer' or 'admin' (DEFAULT: 'customer')
- ❌ `updated_at` (TIMESTAMPTZ) - Last profile update

**Relationships:**

- `id` → `auth.users.id` (ONE-TO-ONE)

---

### 2. **categories**

**Purpose:** Product categorization with hierarchy support

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `name` | TEXT | NO | - | Category name |
| `slug` | TEXT | NO | - | URL-friendly identifier (UNIQUE) |
| `description` | TEXT | YES | NULL | Category description |
| `parent_id` | UUID | YES | NULL | FK to categories.id (self-reference) |
| `sort_order` | INTEGER | NO | 0 | Display order |
| `is_active` | BOOLEAN | NO | true | Visibility flag |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Creation timestamp |

**Features:**

- ✅ Hierarchical categories (unlimited nesting)
- ✅ Slug-based routing
- ✅ Soft delete via `is_active`

**Example Hierarchy:**

```
Denim (parent_id: NULL)
├── Jeans (parent_id: denim-id)
│   ├── Skinny Jeans (parent_id: jeans-id)
│   └── Straight Jeans (parent_id: jeans-id)
└── Jackets (parent_id: denim-id)
```

---

### 3. **products**

**Purpose:** Main product catalog

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `name` | TEXT | NO | - | Product name |
| `description` | TEXT | YES | NULL | Product description |
| `price` | NUMERIC | NO | - | Base price |
| `currency` | TEXT | NO | 'INR' | Price currency code |
| `inventory` | INTEGER | NO | 0 | Stock quantity |
| `is_active` | BOOLEAN | NO | true | Visibility flag |
| `category_id` | UUID | YES | NULL | FK to categories.id |
| `image_url` | TEXT | YES | NULL | Primary product image |
| `slug` | TEXT | YES | NULL | URL-friendly identifier |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Creation timestamp |

**Relationships:**

- `category_id` → `categories.id` (MANY-TO-ONE)

---

### 4. **product_images**

**Purpose:** Multiple images per product

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `product_id` | UUID | YES | NULL | FK to products.id |
| `url` | TEXT | NO | - | Image URL |
| `sort_order` | INTEGER | NO | 0 | Display order |

**Relationships:**

- `product_id` → `products.id` (MANY-TO-ONE)

---

### 5. **product_variants**

**Purpose:** Product variations (size, color, fabric)

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `product_id` | UUID | YES | NULL | FK to products.id |
| `size` | TEXT | YES | NULL | Size (XS, S, M, L, XL, etc.) |
| `color` | TEXT | YES | NULL | Color name |
| `fabric_type` | TEXT | YES | NULL | Fabric material |
| `extra_price` | NUMERIC | NO | 0 | Price adjustment |
| `inventory` | INTEGER | NO | 0 | Variant-specific stock |

**Relationships:**

- `product_id` → `products.id` (MANY-TO-ONE)

---

### 6. **addresses**

**Purpose:** User shipping addresses

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `user_id` | UUID | NO | - | FK to profiles.id |
| `full_name` | TEXT | NO | - | Recipient name |
| `phone` | TEXT | NO | - | Contact number |
| `address_line1` | TEXT | NO | - | Street address |
| `address_line2` | TEXT | YES | NULL | Apt/Suite/Unit |
| `city` | TEXT | NO | - | City name |
| `state` | TEXT | NO | - | State/Province |
| `postal_code` | TEXT | NO | - | ZIP/Postal code |
| `country` | TEXT | NO | 'India' | Country name |
| `is_default` | BOOLEAN | NO | false | Default address flag |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Creation timestamp |

**Relationships:**

- `user_id` → `profiles.id` (MANY-TO-ONE)

---

### 7. **orders**

**Purpose:** Customer orders (supports both authenticated and guest users)

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `user_id` | UUID | YES | NULL | FK to profiles.id (authenticated users) |
| `guest_id` | UUID | YES | NULL | Guest session identifier |
| `guest_email` | TEXT | YES | NULL | Guest user email |
| `order_number` | TEXT | NO | - | Human-readable order ID (UNIQUE) |
| `email` | TEXT | NO | - | Order confirmation email |
| `status` | ENUM | NO | 'pending' | Order status |
| `subtotal` | NUMERIC | YES | NULL | Items total |
| `shipping_cost` | NUMERIC | NO | 0 | Shipping charges |
| `tax` | NUMERIC | NO | 0 | Tax amount |
| `discount` | NUMERIC | NO | 0 | Discount amount |
| `total_amount` | NUMERIC | NO | - | Final total |
| `currency` | TEXT | NO | 'INR' | Order currency |
| `shipping_address_id` | UUID | YES | NULL | FK to addresses.id |
| `shipping_name` | TEXT | YES | NULL | Recipient name (denormalized) |
| `shipping_phone` | TEXT | YES | NULL | Contact number (denormalized) |
| `shipping_address` | TEXT | YES | NULL | Full address (denormalized) |
| `payment_status` | ENUM | NO | 'pending' | Payment status |
| `payment_method` | TEXT | YES | NULL | Payment method used |
| `payment_intent_id` | TEXT | YES | NULL | Stripe payment intent ID |
| `stripe_payment_intent_id` | TEXT | YES | NULL | Alternative Stripe ID field |
| `customer_name` | TEXT | YES | NULL | Customer name |
| `customer_email` | TEXT | YES | NULL | Customer email (denormalized) |
| `customer_phone` | TEXT | YES | NULL | Customer phone |
| `tracking_number` | TEXT | YES | NULL | Shipment tracking ID |
| `notes` | TEXT | YES | NULL | Order notes |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Order creation time |
| `updated_at` | TIMESTAMPTZ | NO | NOW() | Last update time |

**Status Values:**

- `pending` - Order created, awaiting payment
- `confirmed` - Payment received
- `processing` - Being prepared
- `shipped` - Out for delivery
- `delivered` - Successfully delivered
- `cancelled` - Order cancelled
- `refunded` - Payment refunded

**Payment Status Values:**

- `pending` - Awaiting payment
- `paid` - Payment successful
- `failed` - Payment failed
- `refunded` - Payment refunded

**Guest Order Support:**

- Either `user_id` OR `guest_id` must be set
- Guest orders don't have profiles relationship

**Relationships:**

- `user_id` → `profiles.id` (MANY-TO-ONE, optional)
- `shipping_address_id` → `addresses.id` (MANY-TO-ONE, optional)

---

### 8. **order_items**

**Purpose:** Line items for each order

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `order_id` | UUID | NO | - | FK to orders.id |
| `product_id` | UUID | YES | NULL | FK to products.id |
| `variant_id` | UUID | YES | NULL | FK to product_variants.id |
| `product_name` | TEXT | NO | - | Product name (snapshot) |
| `product_description` | TEXT | YES | NULL | Description (snapshot) |
| `variant_details` | JSONB | YES | NULL | Variant info (snapshot) |
| `quantity` | INTEGER | NO | - | Quantity ordered |
| `unit_price` | NUMERIC | NO | - | Price per unit |
| `total_price` | NUMERIC | NO | - | Line total (qty × price) |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Creation timestamp |

**Why Denormalization?**

- Product data is snapshot at order time
- Protects against product changes/deletions
- Maintains order history accuracy

**Relationships:**

- `order_id` → `orders.id` (MANY-TO-ONE)
- `product_id` → `products.id` (MANY-TO-ONE, optional)
- `variant_id` → `product_variants.id` (MANY-TO-ONE, optional)

---

### 9. **cart_items**

**Purpose:** Persistent shopping cart for authenticated users

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `user_id` | UUID | NO | - | FK to profiles.id |
| `product_id` | UUID | NO | - | FK to products.id |
| `variant_id` | UUID | YES | NULL | FK to product_variants.id |
| `quantity` | INTEGER | NO | 1 | Item quantity |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Added to cart time |
| `updated_at` | TIMESTAMPTZ | NO | NOW() | Last update time |

**Note:** Guest carts are stored in localStorage, not database

**Relationships:**

- `user_id` → `profiles.id` (MANY-TO-ONE)
- `product_id` → `products.id` (MANY-TO-ONE)
- `variant_id` → `product_variants.id` (MANY-TO-ONE, optional)

---

### 10. **reviews**

**Purpose:** Product reviews and ratings

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `product_id` | UUID | NO | - | FK to products.id |
| `user_id` | UUID | NO | - | FK to profiles.id |
| `order_id` | UUID | YES | NULL | FK to orders.id |
| `rating` | INTEGER | NO | - | 1-5 star rating |
| `title` | TEXT | YES | NULL | Review title |
| `comment` | TEXT | YES | NULL | Review text |
| `is_verified_purchase` | BOOLEAN | NO | false | Purchased flag |
| `is_approved` | BOOLEAN | NO | false | Moderation status |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Review creation time |

**Relationships:**

- `product_id` → `products.id` (MANY-TO-ONE)
- `user_id` → `profiles.id` (MANY-TO-ONE)
- `order_id` → `orders.id` (MANY-TO-ONE, optional)

---

## 🔧 Required Migrations

### Migration 1: Add Missing Columns to `profiles`

```sql
-- Add missing columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index on role for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Create index on email for lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
```

### Migration 2: Create Triggers for Auto-Profile Creation

```sql
-- Function to create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    'customer',
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Migration 3: Create Trigger for Profile Sync

```sql
-- Function to sync email changes from auth.users to profiles
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET
    email = NEW.email,
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users update
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.handle_user_update();
```

### Migration 4: Add Updated At Trigger for Profiles

```sql
-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on profiles update
DROP TRIGGER IF EXISTS set_updated_at ON profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

---

## 🔐 Row Level Security (RLS)

### profiles Table

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### orders Table

```sql
-- Users can view their own orders
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### Public Tables (Read-Only)

```sql
-- Anyone can view active products
CREATE POLICY "Anyone can view active products"
ON products FOR SELECT
TO public
USING (is_active = true);

-- Anyone can view active categories
CREATE POLICY "Anyone can view active categories"
ON categories FOR SELECT
TO public
USING (is_active = true);
```

---

## 🔗 Relationships Summary

| Table              | Foreign Keys                                        | Description            |
| ------------------ | --------------------------------------------------- | ---------------------- |
| `profiles`         | `auth.users.id`                                     | User account link      |
| `categories`       | `categories.id` (self)                              | Category hierarchy     |
| `products`         | `categories.id`                                     | Product categorization |
| `product_images`   | `products.id`                                       | Product gallery        |
| `product_variants` | `products.id`                                       | Product variations     |
| `addresses`        | `profiles.id`                                       | User addresses         |
| `orders`           | `profiles.id`, `addresses.id`                       | Order ownership        |
| `order_items`      | `orders.id`, `products.id`, `product_variants.id`   | Order contents         |
| `cart_items`       | `profiles.id`, `products.id`, `product_variants.id` | Shopping cart          |
| `reviews`          | `products.id`, `profiles.id`, `orders.id`           | Product feedback       |

---

## 📝 Notes

### Role System

- **Source of Truth:** `profiles.role` column
- **Default:** New users get `'customer'` role
- **Admin Access:** Manually set `role = 'admin'` in database
- **Do NOT use:** `auth.users.role` (always 'authenticated')

### Guest Checkout

- Guest orders use `guest_id` + `guest_email`
- No profile relationship required
- Email sent to `guest_email` for order confirmation

### Currency System

- Multi-currency support (INR, USD, EUR, GBP, AUD)
- Base prices stored in `products.currency` (default: INR)
- Orders capture currency at purchase time
- Frontend handles real-time conversion

### Inventory Management

- Base inventory: `products.inventory`
- Variant inventory: `product_variants.inventory`
- Deducted on order confirmation
- Restored on order cancellation

---

**Document Version:** 1.0  
**Last Reviewed:** November 26, 2025  
**Next Review:** After Phase 7 completion
