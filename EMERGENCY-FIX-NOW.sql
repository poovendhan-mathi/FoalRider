-- EMERGENCY FIX - RUN THIS NOW IN SUPABASE
-- This disables RLS temporarily to test if that's the issue

-- Temporarily disable RLS on cart_items to allow all operations
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;

-- Temporarily disable RLS on orders to allow all operations  
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Make sure columns are nullable
ALTER TABLE cart_items ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- Add guest columns if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'guest_email'
    ) THEN
        ALTER TABLE orders ADD COLUMN guest_email TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'guest_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN guest_id TEXT;
    END IF;
END $$;

-- Verify
SELECT 'cart_items RLS' as table_name, relrowsecurity as rls_enabled 
FROM pg_class WHERE relname = 'cart_items'
UNION ALL
SELECT 'orders RLS' as table_name, relrowsecurity as rls_enabled 
FROM pg_class WHERE relname = 'orders';
