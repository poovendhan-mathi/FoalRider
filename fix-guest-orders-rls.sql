-- FIX RLS POLICY FOR GUEST ORDERS
-- Run this in Supabase SQL Editor

-- Step 1: Drop all existing RLS policies on orders table
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
DROP POLICY IF EXISTS "Guest users can create orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;

-- Step 2: Create NEW comprehensive RLS policies

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

-- CRITICAL: Allow anonymous/guest users to create orders
-- This policy uses TO anon to specifically allow unauthenticated requests
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

-- Step 3: Verify policies
SELECT 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY policyname;

-- Step 4: Test query (should return column info)
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name IN ('user_id', 'guest_email', 'guest_id')
ORDER BY column_name;
