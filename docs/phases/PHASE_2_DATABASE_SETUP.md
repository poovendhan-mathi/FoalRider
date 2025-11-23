# 🗄️ PHASE 2: DATABASE SETUP

**Duration:** 3-4 hours  
**Status:** ⏳ Not Started  
**Dependencies:** Phase 1 Complete

---

## 📋 OVERVIEW

This phase covers the complete Supabase database setup, including table creation, relationships, Row Level Security (RLS) policies, and storage buckets.

---

## 🎯 OBJECTIVES

- [ ] Create all database tables
- [ ] Set up table relationships
- [ ] Configure Row Level Security policies
- [ ] Create database functions and triggers
- [ ] Set up storage buckets
- [ ] Seed initial data
- [ ] Test database connections

---

## 📊 PHASE STATUS

| Task | Status | Time Spent | Notes |
|------|--------|------------|-------|
| 2.1 Create Core Tables | ⏳ | - | - |
| 2.2 Create Product Tables | ⏳ | - | - |
| 2.3 Create Order Tables | ⏳ | - | - |
| 2.4 Set Up Storage Buckets | ⏳ | - | - |
| 2.5 Configure RLS Policies | ⏳ | - | - |
| 2.6 Create Database Functions | ⏳ | - | - |
| 2.7 Seed Initial Data | ⏳ | - | - |
| 2.8 Generate TypeScript Types | ⏳ | - | - |

**Progress:** 0/8 tasks completed (0%)

---

## 🛠️ STEP 2.1: CREATE CORE TABLES

### Access Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your Foal Rider project
3. Navigate to SQL Editor
4. Click "New Query"

### SQL: Core Tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- PROFILES TABLE (User Information)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for faster queries
CREATE INDEX profiles_email_idx ON profiles(email);
CREATE INDEX profiles_role_idx ON profiles(role);

-- ============================================
-- ADDRESSES TABLE
-- ============================================
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('billing', 'shipping')),
  is_default BOOLEAN DEFAULT false,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'US' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX addresses_user_id_idx ON addresses(user_id);
CREATE INDEX addresses_is_default_idx ON addresses(is_default);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX categories_slug_idx ON categories(slug);
CREATE INDEX categories_parent_id_idx ON categories(parent_id);
CREATE INDEX categories_is_active_idx ON categories(is_active);
```

### Checklist
- [ ] UUID extension enabled
- [ ] profiles table created
- [ ] addresses table created
- [ ] categories table created
- [ ] All indexes created
- [ ] SQL executed successfully

---

## 🛠️ STEP 2.2: CREATE PRODUCT TABLES

### SQL: Product Tables

```sql
-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  base_price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  
  -- Product details
  sku TEXT UNIQUE,
  fabric_type TEXT, -- Cotton, Linen, Silk, Wool
  fabric_composition TEXT, -- e.g., "100% Cotton" or "60% Cotton, 40% Polyester"
  care_instructions TEXT,
  
  -- Inventory
  track_inventory BOOLEAN DEFAULT true,
  inventory_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX products_slug_idx ON products(slug);
CREATE INDEX products_category_id_idx ON products(category_id);
CREATE INDEX products_status_idx ON products(status);
CREATE INDEX products_is_featured_idx ON products(is_featured);
CREATE INDEX products_sku_idx ON products(sku);

-- ============================================
-- PRODUCT IMAGES TABLE
-- ============================================
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX product_images_product_id_idx ON product_images(product_id);
CREATE INDEX product_images_is_primary_idx ON product_images(is_primary);

-- ============================================
-- PRODUCT VARIANTS TABLE
-- ============================================
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  
  -- Variant options
  size TEXT, -- XS, S, M, L, XL, XXL
  color TEXT,
  color_hex TEXT, -- For display
  
  -- Pricing
  price DECIMAL(10,2),
  compare_at_price DECIMAL(10,2),
  
  -- Inventory
  sku TEXT UNIQUE,
  inventory_quantity INTEGER DEFAULT 0,
  
  -- Status
  is_available BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX product_variants_product_id_idx ON product_variants(product_id);
CREATE INDEX product_variants_sku_idx ON product_variants(sku);
CREATE INDEX product_variants_is_available_idx ON product_variants(is_available);

-- ============================================
-- PRODUCT REVIEWS TABLE
-- ============================================
CREATE TABLE product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate reviews
  UNIQUE(product_id, user_id)
);

CREATE INDEX product_reviews_product_id_idx ON product_reviews(product_id);
CREATE INDEX product_reviews_user_id_idx ON product_reviews(user_id);
CREATE INDEX product_reviews_is_approved_idx ON product_reviews(is_approved);
```

### Checklist
- [ ] products table created
- [ ] product_images table created
- [ ] product_variants table created
- [ ] product_reviews table created
- [ ] All indexes created
- [ ] Constraints properly set

---

## 🛠️ STEP 2.3: CREATE ORDER TABLES

### SQL: Order Tables

```sql
-- ============================================
-- CARTS TABLE
-- ============================================
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT, -- For guest carts
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days'
);

CREATE INDEX carts_user_id_idx ON carts(user_id);
CREATE INDEX carts_session_id_idx ON carts(session_id);

-- ============================================
-- CART ITEMS TABLE
-- ============================================
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL, -- Price at time of adding
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate items
  UNIQUE(cart_id, product_id, variant_id)
);

CREATE INDEX cart_items_cart_id_idx ON cart_items(cart_id);
CREATE INDEX cart_items_product_id_idx ON cart_items(product_id);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Customer info (stored for record keeping)
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  
  -- Amounts
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
  )),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'paid', 'failed', 'refunded'
  )),
  fulfillment_status TEXT DEFAULT 'unfulfilled' CHECK (fulfillment_status IN (
    'unfulfilled', 'partial', 'fulfilled'
  )),
  
  -- Payment info
  stripe_payment_intent_id TEXT,
  payment_method TEXT,
  
  -- Shipping info
  shipping_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,
  tracking_number TEXT,
  carrier TEXT,
  
  -- Notes
  customer_note TEXT,
  admin_note TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX orders_order_number_idx ON orders(order_number);
CREATE INDEX orders_user_id_idx ON orders(user_id);
CREATE INDEX orders_status_idx ON orders(status);
CREATE INDEX orders_payment_status_idx ON orders(payment_status);
CREATE INDEX orders_created_at_idx ON orders(created_at DESC);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  
  -- Snapshot of product details at time of order
  product_name TEXT NOT NULL,
  product_sku TEXT,
  variant_details JSONB, -- size, color, etc.
  
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX order_items_order_id_idx ON order_items(order_id);
CREATE INDEX order_items_product_id_idx ON order_items(product_id);

-- ============================================
-- WISHLISTS TABLE
-- ============================================
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User can only have one entry per product
  UNIQUE(user_id, product_id)
);

CREATE INDEX wishlists_user_id_idx ON wishlists(user_id);
CREATE INDEX wishlists_product_id_idx ON wishlists(product_id);
```

### Checklist
- [ ] carts table created
- [ ] cart_items table created
- [ ] orders table created
- [ ] order_items table created
- [ ] wishlists table created
- [ ] All indexes and constraints set

---

## 🛠️ STEP 2.4: SET UP STORAGE BUCKETS

### Via Supabase Dashboard

1. Go to Storage in Supabase Dashboard
2. Create the following buckets:

### Bucket 1: Product Images
```
Name: products
Public: Yes (for product images)
File size limit: 5MB
Allowed MIME types: image/jpeg, image/png, image/webp
```

### Bucket 2: User Avatars
```
Name: avatars
Public: Yes
File size limit: 2MB
Allowed MIME types: image/jpeg, image/png, image/webp
```

### SQL: Storage Policies

```sql
-- ============================================
-- STORAGE POLICIES FOR PRODUCTS BUCKET
-- ============================================

-- Allow public read access to product images
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Allow authenticated users with admin role to upload
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' 
  AND auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Allow admins to update product images
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products'
  AND auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Allow admins to delete product images
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products'
  AND auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- ============================================
-- STORAGE POLICIES FOR AVATARS BUCKET
-- ============================================

-- Allow public read access to avatars
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Checklist
- [ ] products bucket created
- [ ] avatars bucket created
- [ ] Storage policies configured
- [ ] Public access enabled for read
- [ ] Upload restrictions set

---

## 🛠️ STEP 2.5: CONFIGURE RLS POLICIES

### SQL: Row Level Security Policies

```sql
-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- ADDRESSES POLICIES
-- ============================================

-- Users can manage their own addresses
CREATE POLICY "Users can view own addresses"
ON addresses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
ON addresses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
ON addresses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
ON addresses FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- CATEGORIES POLICIES (Public Read)
-- ============================================

CREATE POLICY "Anyone can view active categories"
ON categories FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage categories"
ON categories FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- PRODUCTS POLICIES (Public Read)
-- ============================================

CREATE POLICY "Anyone can view active products"
ON products FOR SELECT
USING (status = 'active');

CREATE POLICY "Admins can manage products"
ON products FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- PRODUCT IMAGES POLICIES
-- ============================================

CREATE POLICY "Anyone can view product images"
ON product_images FOR SELECT
USING (true);

CREATE POLICY "Admins can manage product images"
ON product_images FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- PRODUCT VARIANTS POLICIES
-- ============================================

CREATE POLICY "Anyone can view available variants"
ON product_variants FOR SELECT
USING (is_available = true);

CREATE POLICY "Admins can manage variants"
ON product_variants FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- PRODUCT REVIEWS POLICIES
-- ============================================

CREATE POLICY "Anyone can view approved reviews"
ON product_reviews FOR SELECT
USING (is_approved = true);

CREATE POLICY "Users can create reviews"
ON product_reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
ON product_reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviews"
ON product_reviews FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- CARTS POLICIES
-- ============================================

CREATE POLICY "Users can view own cart"
ON carts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cart"
ON carts FOR ALL
USING (auth.uid() = user_id);

-- ============================================
-- CART ITEMS POLICIES
-- ============================================

CREATE POLICY "Users can view own cart items"
ON cart_items FOR SELECT
USING (
  cart_id IN (
    SELECT id FROM carts WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage own cart items"
ON cart_items FOR ALL
USING (
  cart_id IN (
    SELECT id FROM carts WHERE user_id = auth.uid()
  )
);

-- ============================================
-- ORDERS POLICIES
-- ============================================

CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update orders"
ON orders FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- ORDER ITEMS POLICIES
-- ============================================

CREATE POLICY "Users can view own order items"
ON order_items FOR SELECT
USING (
  order_id IN (
    SELECT id FROM orders WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all order items"
ON order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- WISHLISTS POLICIES
-- ============================================

CREATE POLICY "Users can manage own wishlist"
ON wishlists FOR ALL
USING (auth.uid() = user_id);
```

### Checklist
- [ ] RLS enabled on all tables
- [ ] Public read policies set for products
- [ ] User-specific policies configured
- [ ] Admin policies configured
- [ ] Policies tested

---

## 🛠️ STEP 2.6: CREATE DATABASE FUNCTIONS

### SQL: Utility Functions

```sql
-- ============================================
-- FUNCTION: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at
  BEFORE UPDATE ON addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_reviews_updated_at
  BEFORE UPDATE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Generate unique order number
-- ============================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_order_number TEXT;
  done BOOLEAN := false;
BEGIN
  WHILE NOT done LOOP
    new_order_number := 'FR' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = new_order_number) THEN
      done := true;
    END IF;
  END LOOP;
  
  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Create profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNCTION: Calculate order total
-- ============================================
CREATE OR REPLACE FUNCTION calculate_order_total(order_id_param UUID)
RETURNS DECIMAL AS $$
DECLARE
  order_subtotal DECIMAL;
  order_tax DECIMAL;
  order_shipping DECIMAL;
  order_discount DECIMAL;
BEGIN
  SELECT 
    COALESCE(SUM(total_price), 0),
    (SELECT tax FROM orders WHERE id = order_id_param),
    (SELECT shipping_cost FROM orders WHERE id = order_id_param),
    (SELECT discount_amount FROM orders WHERE id = order_id_param)
  INTO order_subtotal, order_tax, order_shipping, order_discount
  FROM order_items
  WHERE order_id = order_id_param;
  
  RETURN order_subtotal + order_tax + order_shipping - order_discount;
END;
$$ LANGUAGE plpgsql;
```

### Checklist
- [ ] updated_at triggers created
- [ ] Order number generator created
- [ ] User profile trigger created
- [ ] Order total calculator created
- [ ] All functions tested

---

## 🛠️ STEP 2.7: SEED INITIAL DATA

### SQL: Seed Data

```sql
-- ============================================
-- SEED: Categories
-- ============================================
INSERT INTO categories (name, slug, description, is_active) VALUES
('Fabrics', 'fabrics', 'Premium textile fabrics', true),
('Home Decor', 'home-decor', 'Elegant home textiles', true),
('Apparel', 'apparel', 'Ready-to-wear clothing', true),
('Accessories', 'accessories', 'Textile accessories', true);

-- Subcategories
INSERT INTO categories (name, slug, description, parent_id, is_active)
SELECT 'Cotton', 'cotton', 'Pure cotton fabrics', id, true FROM categories WHERE slug = 'fabrics'
UNION ALL
SELECT 'Linen', 'linen', 'Premium linen textiles', id, true FROM categories WHERE slug = 'fabrics'
UNION ALL
SELECT 'Silk', 'silk', 'Luxurious silk fabrics', id, true FROM categories WHERE slug = 'fabrics'
UNION ALL
SELECT 'Bedding', 'bedding', 'Bed linens and sheets', id, true FROM categories WHERE slug = 'home-decor'
UNION ALL
SELECT 'Curtains', 'curtains', 'Window treatments', id, true FROM categories WHERE slug = 'home-decor'
UNION ALL
SELECT 'Shirts', 'shirts', 'Men and women shirts', id, true FROM categories WHERE slug = 'apparel'
UNION ALL
SELECT 'Pants', 'pants', 'Trousers and jeans', id, true FROM categories WHERE slug = 'apparel';

-- ============================================
-- SEED: Sample Admin User (Manual step)
-- ============================================
-- Note: Create admin user through Supabase Auth Dashboard
-- Then update their role:
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@foalrider.com';
```

### Checklist
- [ ] Categories seeded
- [ ] Subcategories created
- [ ] Admin user created (manual)
- [ ] Admin role assigned

---

## 🛠️ STEP 2.8: GENERATE TYPESCRIPT TYPES

### Install Supabase CLI
```powershell
npm install -D supabase
```

### Generate Types
```powershell
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref your-project-ref

# Generate types
npx supabase gen types typescript --linked > src/types/supabase.ts
```

### Create Database Types File

Create `src/types/database.ts`:
```typescript
import { Database } from './supabase'

export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

export type Inserts<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert']

export type Updates<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update']

// Type aliases for convenience
export type Profile = Tables<'profiles'>
export type Product = Tables<'products'>
export type ProductImage = Tables<'product_images'>
export type ProductVariant = Tables<'product_variants'>
export type Category = Tables<'categories'>
export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type Cart = Tables<'carts'>
export type CartItem = Tables<'cart_items'>
export type Address = Tables<'addresses'>
export type ProductReview = Tables<'product_reviews'>
export type Wishlist = Tables<'wishlists'>
```

### Checklist
- [ ] Supabase CLI installed
- [ ] Types generated
- [ ] database.ts created
- [ ] Type aliases exported

---

## ✅ PHASE COMPLETION CHECKLIST

### Database Tables
- [ ] All core tables created
- [ ] All product tables created
- [ ] All order tables created
- [ ] Table relationships verified

### Security
- [ ] RLS enabled on all tables
- [ ] Public read policies set
- [ ] User policies configured
- [ ] Admin policies configured

### Storage
- [ ] Storage buckets created
- [ ] Storage policies configured
- [ ] File upload restrictions set

### Functions & Triggers
- [ ] Timestamp triggers working
- [ ] Order number generator working
- [ ] Profile creation trigger working

### Data & Types
- [ ] Initial categories seeded
- [ ] TypeScript types generated
- [ ] Type aliases created

### Testing
- [ ] Can query tables via SQL editor
- [ ] RLS policies working correctly
- [ ] File uploads working
- [ ] Triggers executing properly

---

## 🧪 TESTING CHECKLIST

### Test 1: Query Products
```sql
SELECT * FROM products LIMIT 5;
```

### Test 2: Test RLS
```sql
-- Should work (public read)
SELECT * FROM categories WHERE is_active = true;

-- Should be restricted by RLS
SELECT * FROM profiles;
```

### Test 3: Test Storage Upload
- Upload a test image to products bucket
- Verify it's accessible via public URL

### Test 4: Test Triggers
```sql
-- Insert a test product
INSERT INTO products (name, slug, base_price, status)
VALUES ('Test Product', 'test-product', 99.99, 'draft');

-- Check updated_at was set
SELECT name, created_at, updated_at FROM products WHERE slug = 'test-product';

-- Update and check trigger
UPDATE products SET name = 'Updated Test' WHERE slug = 'test-product';
SELECT name, created_at, updated_at FROM products WHERE slug = 'test-product';

-- Clean up
DELETE FROM products WHERE slug = 'test-product';
```

---

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue 1: RLS Blocks All Access
**Solution:** Ensure policies are created AFTER enabling RLS

### Issue 2: Foreign Key Violations
**Solution:** Insert data in correct order (categories before products)

### Issue 3: Storage Upload Fails
**Solution:** Check bucket exists and policies are configured

### Issue 4: Types Not Generating
**Solution:** Ensure Supabase CLI is logged in and project is linked

---

## 📚 NEXT STEPS

Once Phase 2 is complete, proceed to:
- **Phase 3:** Authentication Setup (Sign up, Login, OAuth)

---

**Phase Status:** ⏳ Not Started  
**Last Updated:** November 23, 2025  
**Next Review:** Upon completion
