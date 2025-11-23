-- ============================================
-- FOAL RIDER - ROW LEVEL SECURITY POLICIES
-- ============================================
-- Run this after creating all tables

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES
-- ============================================
-- Users can view all profiles (for display purposes)
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- CATEGORIES
-- ============================================
-- Everyone can view active categories
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (is_active = true OR auth.role() = 'service_role');

-- Only admins can manage categories (handle via service_role)

-- ============================================
-- PRODUCTS
-- ============================================
-- Everyone can view active products
CREATE POLICY "Active products are viewable by everyone"
  ON products FOR SELECT
  USING (is_active = true OR auth.role() = 'service_role');

-- Only admins can manage products (handle via service_role)

-- ============================================
-- PRODUCT IMAGES
-- ============================================
-- Everyone can view product images
CREATE POLICY "Product images are viewable by everyone"
  ON product_images FOR SELECT
  USING (true);

-- ============================================
-- PRODUCT VARIANTS
-- ============================================
-- Everyone can view product variants
CREATE POLICY "Product variants are viewable by everyone"
  ON product_variants FOR SELECT
  USING (true);

-- ============================================
-- ADDRESSES
-- ============================================
-- Users can view their own addresses
CREATE POLICY "Users can view own addresses"
  ON addresses FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own addresses
CREATE POLICY "Users can insert own addresses"
  ON addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own addresses
CREATE POLICY "Users can update own addresses"
  ON addresses FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own addresses
CREATE POLICY "Users can delete own addresses"
  ON addresses FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- ORDERS
-- ============================================
-- Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Users can insert their own orders
CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- Only admins can update orders (via service_role)
CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (auth.role() = 'service_role');

-- ============================================
-- ORDER ITEMS
-- ============================================
-- Users can view order items for their orders
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    ) OR auth.role() = 'service_role'
  );

-- Users can insert order items for their orders
CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    ) OR auth.role() = 'service_role'
  );

-- ============================================
-- CART ITEMS (Updated for Guest Cart Support)
-- ============================================
-- Users can view their own cart (authenticated)
CREATE POLICY "Users can view own cart"
  ON cart_items FOR SELECT
  USING (auth.uid() = user_id);

-- Guest users can view cart by session_id
CREATE POLICY "Guests can view cart by session"
  ON cart_items FOR SELECT
  USING (
    user_id IS NULL 
    AND session_id IS NOT NULL
    -- Frontend must pass session_id in query
  );

-- Users can insert their own cart items
CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id OR (user_id IS NULL AND session_id IS NOT NULL));

-- Users can update their own cart items
CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  USING (auth.uid() = user_id OR (user_id IS NULL AND session_id IS NOT NULL));

-- Users can delete their own cart items
CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  USING (auth.uid() = user_id OR (user_id IS NULL AND session_id IS NOT NULL));

-- ============================================
-- REVIEWS
-- ============================================
-- Everyone can view approved reviews
CREATE POLICY "Approved reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (is_approved = true OR auth.uid() = user_id OR auth.role() = 'service_role');

-- Authenticated users can insert reviews
CREATE POLICY "Authenticated users can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews (before approval)
CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id AND is_approved = false);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- WISHLISTS
-- ============================================
-- Users can view their own wishlist
CREATE POLICY "Users can view own wishlist"
  ON wishlists FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add items to their wishlist
CREATE POLICY "Users can insert own wishlist items"
  ON wishlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove items from their wishlist
CREATE POLICY "Users can delete own wishlist items"
  ON wishlists FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- NOTES
-- ============================================
-- Admin operations (creating products, approving reviews, etc.)
-- should be done using the service_role key from backend/API routes
-- Never expose service_role key to the client!

-- GUEST CART USAGE:
-- Frontend should generate a session_id (crypto.randomUUID()) and store in localStorage
-- When user logs in, merge guest cart with user cart using the session_id
