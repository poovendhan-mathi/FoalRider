# 🗄️ FoalRider - Database Documentation

## 📋 Table of Contents
1. [Database Overview](#database-overview)
2. [Schema Design](#schema-design)
3. [Tables Reference](#tables-reference)
4. [Relationships](#relationships)
5. [Row Level Security (RLS)](#row-level-security)
6. [Database Functions](#database-functions)
7. [Triggers](#triggers)
8. [Indexes](#indexes)
9. [Query Examples](#query-examples)

---

## 🎯 Database Overview

**Database:** PostgreSQL 15  
**Provider:** Supabase  
**Location:** Cloud-hosted  
**Backup:** Automatic daily backups

### Key Features
- ✅ Row-Level Security (RLS) enabled on all tables
- ✅ Foreign key constraints for data integrity
- ✅ Cascading deletes where appropriate
- ✅ Indexes on frequently queried columns
- ✅ JSONB support for flexible data
- ✅ Auto-generated UUIDs
- ✅ Timestamp tracking (created_at, updated_at)

---

## 🏗️ Schema Design

### Architecture Pattern
```
auth.users (Supabase Managed)
    ↓
profiles (User Data)
    ↓
├── orders (Customer Orders)
│   └── order_items (Order Line Items)
│       └── products (Product Catalog)
│           └── categories (Product Categories)
├── cart_items (Shopping Cart)
│   └── products
├── addresses (Shipping Addresses)
└── reviews (Product Reviews)
    └── products
```

### Data Flow
1. **Authentication:** User signs up → `auth.users` created
2. **Profile:** AuthContext creates `profiles` record
3. **Shopping:** User browses `products` filtered by `categories`
4. **Cart:** Items added to `cart_items` (persistent)
5. **Checkout:** Order created in `orders` with `order_items`
6. **Review:** User can leave `reviews` for products

---

## 📊 Tables Reference

### 1. auth.users (Supabase Managed)
**Purpose:** Core authentication table managed by Supabase

**Structure:**
```sql
TABLE auth.users (
  id                  UUID PRIMARY KEY,
  email               TEXT UNIQUE NOT NULL,
  encrypted_password  TEXT,
  email_confirmed_at  TIMESTAMPTZ,
  raw_user_meta_data  JSONB,           -- Stores: {role: 'admin'|'customer'}
  raw_app_meta_data   JSONB,
  created_at          TIMESTAMPTZ,
  updated_at          TIMESTAMPTZ,
  last_sign_in_at     TIMESTAMPTZ
)
```

**Metadata Structure:**
```json
{
  "role": "admin" | "customer",
  "full_name": "User Name",
  "avatar_url": "https://..."
}
```

**Access:**
- ❌ Not directly accessible via API
- ✅ Access via `supabase.auth.getUser()`
- ✅ Join with profiles table for user data

---

### 2. profiles
**Purpose:** User profile and display information

**Structure:**
```sql
CREATE TABLE profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name   TEXT,
  avatar_url  TEXT,
  phone       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);
```

**RLS Policies:**
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
```

**Relationships:**
- `id` → `auth.users.id` (ONE-TO-ONE)
- Referenced by: `orders`, `addresses`, `reviews`, `cart_items`

**Data Flow:**
```
User signs up
    ↓
auth.users record created
    ↓
AuthContext creates profiles record
    ↓
Profile data displayed in UI
```

---

### 3. categories
**Purpose:** Product categorization hierarchy

**Structure:**
```sql
CREATE TABLE categories (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url   TEXT,
  is_active   BOOLEAN DEFAULT true,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_active ON categories(is_active) WHERE is_active = true;
```

**RLS Policies:**
```sql
-- Public read access
CREATE POLICY "Anyone can view active categories"
ON categories FOR SELECT
TO public
USING (is_active = true);
```

**Hierarchy Example:**
```
Men's Clothing (parent_id: NULL)
├── Shirts (parent_id: men-clothing-id)
├── Pants (parent_id: men-clothing-id)
└── Jackets (parent_id: men-clothing-id)
```

**Sample Data:**
```sql
-- 15 categories across 3 main categories
-- See DATABASE_COMPLETE.sql for full list
```

---

### 4. products
**Purpose:** Product catalog with details

**Structure:**
```sql
CREATE TABLE products (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  description  TEXT,
  price        NUMERIC(10,2) NOT NULL,
  category_id  UUID REFERENCES categories(id) ON DELETE SET NULL,
  images       TEXT[] DEFAULT '{}',        -- Array of image URLs
  sizes        TEXT[] DEFAULT '{}',        -- ['XS', 'S', 'M', 'L', 'XL']
  colors       TEXT[] DEFAULT '{}',        -- ['Black', 'White', 'Blue']
  stock        INTEGER DEFAULT 0,
  is_active    BOOLEAN DEFAULT true,
  is_featured  BOOLEAN DEFAULT false,
  tags         TEXT[] DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_price ON products(price);
```

**RLS Policies:**
```sql
-- Public read access for active products
CREATE POLICY "Anyone can view active products"
ON products FOR SELECT
TO public
USING (is_active = true);
```

**Relationships:**
- `category_id` → `categories.id` (MANY-TO-ONE)
- Referenced by: `order_items`, `cart_items`, `reviews`

**Sample Product:**
```json
{
  "id": "uuid",
  "name": "Tapered Fit Dark Indigo Jeans",
  "slug": "tapered-fit-dark-indigo-jeans",
  "price": 4199.00,
  "category_id": "men-jeans-uuid",
  "images": [
    "/products/jeans1.jpg",
    "/products/jeans2.jpg"
  ],
  "sizes": ["28", "30", "32", "34", "36"],
  "colors": ["Dark Indigo", "Light Blue"],
  "stock": 50,
  "is_active": true
}
```

---

### 5. orders
**Purpose:** Customer order records

**Structure:**
```sql
CREATE TABLE orders (
  -- Primary key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Order identification
  order_number TEXT DEFAULT (
    'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
    LPAD(FLOOR(RANDOM() * 999999 + 1)::TEXT, 6, '0')
  ),
  
  -- User reference
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Payment info
  total_amount      NUMERIC(10,2) NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'INR',
  payment_status    TEXT NOT NULL DEFAULT 'pending',
  payment_intent_id TEXT,
  
  -- Order status
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- Shipping info
  shipping_address JSONB NOT NULL,
  
  -- Customer email
  email TEXT NOT NULL,
  
  -- Additional columns
  subtotal       NUMERIC(10,2),
  shipping_cost  NUMERIC(10,2) DEFAULT 0,
  tax            NUMERIC(10,2) DEFAULT 0,
  discount       NUMERIC(10,2) DEFAULT 0,
  
  -- Tracking
  tracking_number TEXT,
  shipping_name   TEXT,
  shipping_phone  TEXT,
  
  -- Payment method
  payment_method         TEXT,
  stripe_payment_intent_id TEXT,
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);
```

**RLS Policies:**
```sql
-- Users can create their own orders
CREATE POLICY "Users can create their own orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own orders
CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
TO authenticated
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
```

**Shipping Address Structure:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "address": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "zipCode": "400001",
  "country": "India",
  "phone": "9876543210"
}
```

**Order States:**
- `pending` - Order placed, payment pending
- `processing` - Payment confirmed, preparing order
- `shipped` - Order dispatched
- `delivered` - Order delivered successfully
- `cancelled` - Order cancelled

**Relationships:**
- `user_id` → `auth.users.id` (MANY-TO-ONE)
- Referenced by: `order_items`

---

### 6. order_items
**Purpose:** Individual items in an order

**Structure:**
```sql
CREATE TABLE order_items (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id   UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity   INTEGER NOT NULL,
  price      NUMERIC(10,2) NOT NULL,
  subtotal   NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
```

**RLS Policies:**
```sql
-- Users can create order items for their orders
CREATE POLICY "Users can create order items"
ON order_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- Users can view their order items
CREATE POLICY "Users can view their order items"
ON order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- Admins can view all order items
CREATE POLICY "Admins can view all order items"
ON order_items FOR SELECT
TO authenticated
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
```

**Relationships:**
- `order_id` → `orders.id` (MANY-TO-ONE)
- `product_id` → `products.id` (MANY-TO-ONE)

**Example:**
```json
{
  "id": "uuid",
  "order_id": "order-uuid",
  "product_id": "product-uuid",
  "quantity": 2,
  "price": 4199.00,
  "subtotal": 8398.00
}
```

---

### 7. cart_items
**Purpose:** Persistent shopping cart storage

**Structure:**
```sql
CREATE TABLE cart_items (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity   INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
```

**RLS Policies:**
```sql
-- Users can manage their own cart
CREATE POLICY "Users can manage own cart"
ON cart_items FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

**Relationships:**
- `user_id` → `auth.users.id` (MANY-TO-ONE)
- `product_id` → `products.id` (MANY-TO-ONE)

---

### 8. addresses
**Purpose:** User shipping addresses

**Structure:**
```sql
CREATE TABLE addresses (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name      TEXT NOT NULL,
  address_line1  TEXT NOT NULL,
  address_line2  TEXT,
  city           TEXT NOT NULL,
  state          TEXT NOT NULL,
  postal_code    TEXT NOT NULL,
  country        TEXT NOT NULL DEFAULT 'India',
  phone          TEXT,
  is_default     BOOLEAN DEFAULT false,
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_addresses_default ON addresses(is_default) WHERE is_default = true;
```

**RLS Policies:**
```sql
-- Users can manage their own addresses
CREATE POLICY "Users can manage own addresses"
ON addresses FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

**Relationships:**
- `user_id` → `auth.users.id` (MANY-TO-ONE)

---

### 9. reviews
**Purpose:** Product reviews and ratings

**Structure:**
```sql
CREATE TABLE reviews (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  rating     INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title      TEXT,
  comment    TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
```

**RLS Policies:**
```sql
-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews"
ON reviews FOR SELECT
TO public
USING (true);

-- Users can create reviews
CREATE POLICY "Users can create reviews"
ON reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update own reviews
CREATE POLICY "Users can update own reviews"
ON reviews FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
```

**Relationships:**
- `user_id` → `auth.users.id` (MANY-TO-ONE)
- `product_id` → `products.id` (MANY-TO-ONE)

---

## 🔗 Relationships

### Entity Relationship Diagram

```
┌─────────────┐
│ auth.users  │
└──────┬──────┘
       │ 1:1
       ↓
┌─────────────┐
│  profiles   │
└──────┬──────┘
       │ 1:N
       ├──────→ orders ──────→ order_items ──────→ products
       │                                              ↑
       ├──────→ cart_items ─────────────────────────┘
       │                                              ↑
       ├──────→ addresses                            │
       │                                              │
       └──────→ reviews ────────────────────────────┘
                                                      ↑
                                                      │
                                            ┌─────────┴────────┐
                                            │   categories      │
                                            └──────────────────┘
```

### Foreign Key Constraints

```sql
-- profiles
ALTER TABLE profiles
  ADD CONSTRAINT fk_profiles_user
  FOREIGN KEY (id) REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- products
ALTER TABLE products
  ADD CONSTRAINT fk_products_category
  FOREIGN KEY (category_id) REFERENCES categories(id)
  ON DELETE SET NULL;

-- orders
ALTER TABLE orders
  ADD CONSTRAINT fk_orders_user
  FOREIGN KEY (user_id) REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- order_items
ALTER TABLE order_items
  ADD CONSTRAINT fk_order_items_order
  FOREIGN KEY (order_id) REFERENCES orders(id)
  ON DELETE CASCADE;

ALTER TABLE order_items
  ADD CONSTRAINT fk_order_items_product
  FOREIGN KEY (product_id) REFERENCES products(id)
  ON DELETE SET NULL;

-- cart_items
ALTER TABLE cart_items
  ADD CONSTRAINT fk_cart_items_user
  FOREIGN KEY (user_id) REFERENCES auth.users(id)
  ON DELETE CASCADE;

ALTER TABLE cart_items
  ADD CONSTRAINT fk_cart_items_product
  FOREIGN KEY (product_id) REFERENCES products(id)
  ON DELETE CASCADE;

-- addresses
ALTER TABLE addresses
  ADD CONSTRAINT fk_addresses_user
  FOREIGN KEY (user_id) REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- reviews
ALTER TABLE reviews
  ADD CONSTRAINT fk_reviews_user
  FOREIGN KEY (user_id) REFERENCES auth.users(id)
  ON DELETE CASCADE;

ALTER TABLE reviews
  ADD CONSTRAINT fk_reviews_product
  FOREIGN KEY (product_id) REFERENCES products(id)
  ON DELETE CASCADE;
```

---

## 🔒 Row Level Security (RLS)

### Security Model

**Principle:** Users can only access their own data unless they are admins.

### Policy Patterns

#### 1. User Data Access
```sql
-- Users can only see their own records
CREATE POLICY "policy_name"
ON table_name FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

#### 2. Admin Access
```sql
-- Admins can see all records
CREATE POLICY "admins_full_access"
ON table_name FOR SELECT
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
```

#### 3. Public Read
```sql
-- Anyone can view (for products, categories)
CREATE POLICY "public_read"
ON table_name FOR SELECT
TO public
USING (is_active = true);
```

#### 4. Nested Check
```sql
-- Order items accessible via orders
CREATE POLICY "order_items_via_orders"
ON order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);
```

### Testing RLS Policies

```sql
-- Test as specific user
SET request.jwt.claims = '{"sub": "user-uuid"}';

-- Test query
SELECT * FROM orders;

-- Reset
RESET request.jwt.claims;
```

---

## ⚙️ Database Functions

### 1. Auto-Generate Order Number
```sql
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ORD-' || 
         TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
         LPAD(FLOOR(RANDOM() * 999999 + 1)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;
```

### 2. Update Timestamp
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 3. Calculate Order Total
```sql
CREATE OR REPLACE FUNCTION calculate_order_total(order_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
  total NUMERIC;
BEGIN
  SELECT COALESCE(SUM(subtotal), 0)
  INTO total
  FROM order_items
  WHERE order_id = order_uuid;
  
  RETURN total;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔔 Triggers

### 1. Update Timestamps
```sql
-- Profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Products
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Orders
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. Auto-Create Profile (Future Enhancement)
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

---

## 📈 Indexes

### Performance Indexes

```sql
-- Profiles
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);

-- Categories
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_active ON categories(is_active) WHERE is_active = true;

-- Products
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_price ON products(price);

-- Orders
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- Order Items
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Cart Items
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

-- Addresses
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_addresses_default ON addresses(is_default) WHERE is_default = true;

-- Reviews
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
```

---

## 📝 Query Examples

### Common Queries

#### 1. Get User Profile with Orders
```sql
SELECT 
  p.*,
  COUNT(DISTINCT o.id) as total_orders,
  COALESCE(SUM(o.total_amount), 0) as total_spent
FROM profiles p
LEFT JOIN orders o ON p.id = o.user_id
WHERE p.id = 'user-uuid'
GROUP BY p.id;
```

#### 2. Get Product with Category
```sql
SELECT 
  p.*,
  c.name as category_name,
  c.slug as category_slug
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.slug = 'product-slug'
AND p.is_active = true;
```

#### 3. Get Order with Items
```sql
SELECT 
  o.*,
  jsonb_agg(
    jsonb_build_object(
      'product_name', pr.name,
      'quantity', oi.quantity,
      'price', oi.price,
      'subtotal', oi.subtotal
    )
  ) as items
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products pr ON oi.product_id = pr.id
WHERE o.id = 'order-uuid'
GROUP BY o.id;
```

#### 4. Get Products by Category with Filters
```sql
SELECT *
FROM products
WHERE category_id = 'category-uuid'
AND is_active = true
AND price BETWEEN 1000 AND 5000
ORDER BY price ASC
LIMIT 20 OFFSET 0;
```

#### 5. Get User's Recent Orders
```sql
SELECT 
  o.id,
  o.order_number,
  o.total_amount,
  o.currency,
  o.status,
  o.payment_status,
  o.created_at,
  COUNT(oi.id) as items_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = 'user-uuid'
GROUP BY o.id
ORDER BY o.created_at DESC
LIMIT 10;
```

#### 6. Get Product Reviews with User Info
```sql
SELECT 
  r.*,
  p.full_name as reviewer_name,
  p.avatar_url as reviewer_avatar
FROM reviews r
JOIN profiles p ON r.user_id = p.id
WHERE r.product_id = 'product-uuid'
ORDER BY r.created_at DESC;
```

#### 7. Get Cart with Product Details
```sql
SELECT 
  c.*,
  p.name,
  p.price,
  p.images,
  p.slug,
  (c.quantity * p.price) as subtotal
FROM cart_items c
JOIN products p ON c.product_id = p.id
WHERE c.user_id = 'user-uuid';
```

---

## 🔧 Maintenance Queries

### Cleanup Old Carts
```sql
DELETE FROM cart_items
WHERE updated_at < NOW() - INTERVAL '30 days';
```

### Update Product Stock
```sql
UPDATE products
SET stock = stock - order_quantity
WHERE id = 'product-uuid';
```

### Mark Order as Shipped
```sql
UPDATE orders
SET 
  status = 'shipped',
  tracking_number = 'TRACK123',
  updated_at = NOW()
WHERE id = 'order-uuid';
```

---

## 📊 Analytics Queries

### Sales by Category
```sql
SELECT 
  c.name as category,
  COUNT(DISTINCT o.id) as orders,
  SUM(oi.subtotal) as revenue
FROM categories c
JOIN products p ON c.id = p.category_id
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
WHERE o.status = 'delivered'
GROUP BY c.id, c.name
ORDER BY revenue DESC;
```

### Top Selling Products
```sql
SELECT 
  p.name,
  SUM(oi.quantity) as units_sold,
  SUM(oi.subtotal) as revenue
FROM products p
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
WHERE o.status IN ('delivered', 'shipped')
GROUP BY p.id, p.name
ORDER BY units_sold DESC
LIMIT 10;
```

---

**Last Updated:** November 25, 2025  
**Database Version:** PostgreSQL 15  
**Total Tables:** 9 (+ auth.users)
