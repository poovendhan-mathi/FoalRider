-- ============================================
-- ADD MISSING RLS POLICIES
-- ============================================
-- Run this to add missing policies for wishlists and guest cart support

-- Enable RLS on wishlists (if not already enabled)
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Drop and recreate cart policies for guest support
DROP POLICY IF EXISTS "Users can view own cart" ON cart_items;
DROP POLICY IF EXISTS "Guests can view cart by session" ON cart_items;
DROP POLICY IF EXISTS "Users can insert own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;

-- ============================================
-- CART ITEMS - Updated for Guest Support
-- ============================================
CREATE POLICY "Users can view own cart"
  ON cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Guests can view cart by session"
  ON cart_items FOR SELECT
  USING (user_id IS NULL AND session_id IS NOT NULL);

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id OR (user_id IS NULL AND session_id IS NOT NULL));

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  USING (auth.uid() = user_id OR (user_id IS NULL AND session_id IS NOT NULL));

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  USING (auth.uid() = user_id OR (user_id IS NULL AND session_id IS NOT NULL));

-- ============================================
-- WISHLISTS - New Policies
-- ============================================
CREATE POLICY "Users can view own wishlist"
  ON wishlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist items"
  ON wishlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist items"
  ON wishlists FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this to check policies were created:
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;
