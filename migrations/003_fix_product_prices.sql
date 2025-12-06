-- ============================================
-- FOALRIDER - PRICE FIX SCRIPT
-- ============================================
-- Run this in Supabase SQL Editor
-- 
-- Based on diagnostic: 10 products have prices < 100 (likely in main unit, not paise)
-- This script will convert them to paise (multiply by 100)
-- ============================================

-- STEP 1: View the problematic products BEFORE fix
SELECT 
    'BEFORE FIX' as status,
    id,
    name,
    price as current_price,
    price * 100 as new_price_after_fix,
    currency
FROM products
WHERE price < 100
ORDER BY price ASC;

-- STEP 2: Create backup table
CREATE TABLE IF NOT EXISTS products_price_backup_20251206 AS
SELECT id, name, price, currency, updated_at
FROM products
WHERE price < 100;

-- Verify backup was created
SELECT 'BACKUP CREATED' as status, COUNT(*) as backed_up_products 
FROM products_price_backup_20251206;

-- STEP 3: FIX THE PRICES - Convert from main unit to paise
UPDATE products
SET 
    price = price * 100,
    updated_at = NOW()
WHERE price < 100;

-- STEP 4: Verify the fix
SELECT 
    'AFTER FIX' as status,
    id,
    name,
    price as price_in_paise,
    ROUND(price / 100.0, 2) as display_price
FROM products
WHERE id IN (SELECT id FROM products_price_backup_20251206)
ORDER BY price ASC;

-- STEP 5: Final health check
SELECT 
    'FINAL_CHECK' as report,
    (SELECT COUNT(*) FROM products WHERE is_active = true) as active_products,
    (SELECT COUNT(*) FROM products WHERE price < 100 AND is_active = true) as suspicious_prices,
    CASE 
        WHEN (SELECT COUNT(*) FROM products WHERE price < 100 AND is_active = true) > 0 
        THEN '⚠️ Still have issues'
        ELSE '✅ All prices are now in correct format (paise)'
    END as status;
