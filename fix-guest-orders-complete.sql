-- COMPLETE FIX FOR GUEST ORDERS
-- Run this entire script in Supabase SQL Editor

-- Step 1: Check current table structure
DO $$ 
BEGIN
    -- Add guest_email column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'guest_email'
    ) THEN
        ALTER TABLE orders ADD COLUMN guest_email TEXT;
        RAISE NOTICE 'Added guest_email column';
    ELSE
        RAISE NOTICE 'guest_email column already exists';
    END IF;

    -- Add guest_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'guest_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN guest_id TEXT;
        RAISE NOTICE 'Added guest_id column';
    ELSE
        RAISE NOTICE 'guest_id column already exists';
    END IF;
END $$;

-- Step 2: Make user_id nullable
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- Step 3: Drop all existing RLS policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
DROP POLICY IF EXISTS "Guest users can create orders" ON orders;

-- Step 4: Create comprehensive RLS policies with ROLE specifications

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

-- Step 5: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_guest_id ON orders(guest_id);
CREATE INDEX IF NOT EXISTS idx_orders_guest_email ON orders(guest_email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Step 6: Verify the setup
SELECT 
    'Column Check' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name IN ('user_id', 'guest_email', 'guest_id')
ORDER BY column_name;

-- Show all policies
SELECT 
    'Policy Check' as check_type,
    policyname,
    cmd,
    qual IS NOT NULL as has_using,
    with_check IS NOT NULL as has_with_check
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY policyname;
