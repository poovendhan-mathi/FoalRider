-- FIX GUEST CART RLS POLICIES
-- Run this in Supabase SQL Editor

-- Step 1: Make user_id nullable in cart_items if not already
ALTER TABLE cart_items ALTER COLUMN user_id DROP NOT NULL;

-- Step 2: Drop existing cart_items RLS policies
DROP POLICY IF EXISTS "Users can view own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can insert own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can delete own cart" ON cart_items;
DROP POLICY IF EXISTS "Guest users can manage cart" ON cart_items;

-- Step 3: Create comprehensive RLS policies for cart_items

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

-- Step 4: Verify policies
SELECT 
    'Cart Policies' as check_type,
    policyname,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'cart_items'
ORDER BY policyname;
