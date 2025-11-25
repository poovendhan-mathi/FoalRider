-- COMPLETE FIX FOR GUEST CART AND ORDERS
-- Run this ENTIRE script in Supabase SQL Editor
-- This fixes both cart_items and orders tables for guest users

-- ============================================
-- PART 1: FIX CART_ITEMS TABLE
-- ============================================

-- Make user_id nullable in cart_items
ALTER TABLE cart_items ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing cart_items RLS policies
DROP POLICY IF EXISTS "Users can view own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can insert own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can delete own cart" ON cart_items;
DROP POLICY IF EXISTS "Guest users can manage cart" ON cart_items;

-- Create comprehensive RLS policies for cart_items

-- Authenticated users can view their own cart items
CREATE POLICY "Users can view own cart"
ON cart_items FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Authenticated users can insert their own cart items
CREATE POLICY "Users can insert own cart"
ON cart_items FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Authenticated users can update their own cart items
CREATE POLICY "Users can update own cart"
ON cart_items FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Authenticated users can delete their own cart items
CREATE POLICY "Users can delete own cart"
ON cart_items FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- CRITICAL: Allow anonymous/guest users to manage cart via session_id
CREATE POLICY "Guest users can manage cart"
ON cart_items FOR ALL
TO anon
USING (user_id IS NULL AND session_id IS NOT NULL)
WITH CHECK (user_id IS NULL AND session_id IS NOT NULL);

-- ============================================
-- PART 2: FIX ORDERS TABLE
-- ============================================

-- Add guest columns if they don't exist
DO $$ 
BEGIN
    -- Add guest_email column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'guest_email'
    ) THEN
        ALTER TABLE orders ADD COLUMN guest_email TEXT;
        RAISE NOTICE 'Added guest_email column to orders';
    ELSE
        RAISE NOTICE 'guest_email column already exists in orders';
    END IF;

    -- Add guest_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'guest_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN guest_id TEXT;
        RAISE NOTICE 'Added guest_id column to orders';
    ELSE
        RAISE NOTICE 'guest_id column already exists in orders';
    END IF;
END $$;

-- Make user_id nullable in orders
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- Drop all existing orders RLS policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
DROP POLICY IF EXISTS "Guest users can create orders" ON orders;

-- Create comprehensive RLS policies for orders

-- Allow authenticated users to view their own orders
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated users to create orders for themselves
CREATE POLICY "Users can create own orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- CRITICAL FIX: Allow anonymous/guest users to create orders
-- The "TO anon" is essential for unauthenticated requests
CREATE POLICY "Guest users can create orders"
ON orders FOR INSERT
TO anon
WITH CHECK (
    user_id IS NULL 
    AND guest_email IS NOT NULL 
    AND guest_id IS NOT NULL
);

-- Allow admins to view all orders
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Allow admins to update any order
CREATE POLICY "Admins can update orders"
ON orders FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ============================================
-- PART 3: ADD INDEXES FOR PERFORMANCE
-- ============================================

-- Cart indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);

-- Order indexes
CREATE INDEX IF NOT EXISTS idx_orders_guest_id ON orders(guest_id);
CREATE INDEX IF NOT EXISTS idx_orders_guest_email ON orders(guest_email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- ============================================
-- PART 4: VERIFICATION
-- ============================================

-- Verify cart_items policies
SELECT 
    '=== CART POLICIES ===' as info,
    policyname,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'cart_items'
ORDER BY policyname;

-- Verify orders policies
SELECT 
    '=== ORDER POLICIES ===' as info,
    policyname,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY policyname;

-- Verify orders columns
SELECT 
    '=== ORDER COLUMNS ===' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name IN ('user_id', 'guest_email', 'guest_id')
ORDER BY column_name;

-- Final success message
DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ GUEST CART AND ORDERS FIX COMPLETE!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 What was fixed:';
    RAISE NOTICE '  ✓ cart_items: user_id is now nullable';
    RAISE NOTICE '  ✓ cart_items: Guest users can manage cart via session_id';
    RAISE NOTICE '  ✓ orders: guest_email and guest_id columns added';
    RAISE NOTICE '  ✓ orders: user_id is now nullable';
    RAISE NOTICE '  ✓ orders: Guest users can create orders';
    RAISE NOTICE '  ✓ All RLS policies updated with TO anon / TO authenticated';
    RAISE NOTICE '  ✓ Performance indexes added';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 You can now test guest checkout end-to-end!';
    RAISE NOTICE '';
END $$;
