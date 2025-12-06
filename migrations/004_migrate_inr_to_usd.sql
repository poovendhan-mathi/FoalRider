-- ============================================
-- FOALRIDER - MIGRATE FROM INR TO USD
-- ============================================
-- Run this in Supabase SQL Editor
-- 
-- This script will:
-- 1. Convert all product prices from INR (paise) to USD (cents)
-- 2. Update orders table currency
-- 3. Update currency rates table
--
-- CONVERSION: Using rate 1 USD = 83.5 INR
-- Formula: USD cents = INR paise / 83.5
-- Example: ₹1,000 (100000 paise) = $11.98 (1198 cents)
-- ============================================

-- ============================================
-- STEP 1: BACKUP EVERYTHING FIRST
-- ============================================

-- Backup products
CREATE TABLE IF NOT EXISTS products_backup_inr_to_usd AS
SELECT * FROM products;

-- Verify backup
SELECT 'PRODUCTS BACKUP' as status, COUNT(*) as count FROM products_backup_inr_to_usd;

-- ============================================
-- STEP 2: VIEW CURRENT PRICES (BEFORE CONVERSION)
-- ============================================

SELECT 
    'BEFORE CONVERSION' as status,
    id,
    name,
    price as price_inr_paise,
    ROUND(price / 100.0, 2) as display_inr,
    ROUND(price / 83.5, 0) as new_price_usd_cents,
    ROUND(price / 83.5 / 100.0, 2) as display_usd
FROM products
ORDER BY price DESC
LIMIT 20;

-- ============================================
-- STEP 3: CONVERT PRODUCT PRICES TO USD CENTS
-- ============================================

-- Convert INR paise to USD cents
-- Using exchange rate: 1 USD = 83.5 INR
UPDATE products
SET 
    price = ROUND(price / 83.5),  -- Convert paise to cents
    currency = 'USD',
    updated_at = NOW();

-- ============================================
-- STEP 4: UPDATE CURRENCY RATES TABLE
-- ============================================

-- Add rate_to_usd column if it doesn't exist
ALTER TABLE currency_rates 
ADD COLUMN IF NOT EXISTS rate_to_usd DECIMAL(12, 6) DEFAULT 1.0;

-- Now rates should be: How many USD you get for 1 unit of this currency
-- rate_to_usd: 1 EUR = 1.09 USD, 1 INR = 0.012 USD, etc.

UPDATE currency_rates
SET 
    rate_to_usd = CASE currency_code
        WHEN 'USD' THEN 1.0          -- Base currency
        WHEN 'INR' THEN 0.012        -- 1 INR = 0.012 USD
        WHEN 'SGD' THEN 0.74         -- 1 SGD = 0.74 USD
        WHEN 'EUR' THEN 1.09         -- 1 EUR = 1.09 USD
        WHEN 'GBP' THEN 1.27         -- 1 GBP = 1.27 USD
        WHEN 'AUD' THEN 0.66         -- 1 AUD = 0.66 USD
        ELSE 1.0
    END,
    updated_at = NOW()
WHERE currency_code IN ('USD', 'INR', 'SGD', 'EUR', 'GBP', 'AUD');

-- ============================================
-- STEP 5: VERIFY CONVERSION
-- ============================================

SELECT 
    'AFTER CONVERSION' as status,
    id,
    name,
    price as price_usd_cents,
    ROUND(price / 100.0, 2) as display_usd,
    currency
FROM products
ORDER BY price DESC
LIMIT 20;

-- ============================================
-- STEP 6: PRICE STATISTICS
-- ============================================

SELECT 
    'PRICE STATISTICS' as report,
    COUNT(*) as total_products,
    MIN(price) as min_price_cents,
    MAX(price) as max_price_cents,
    ROUND(MIN(price) / 100.0, 2) as min_display_usd,
    ROUND(MAX(price) / 100.0, 2) as max_display_usd,
    ROUND(AVG(price) / 100.0, 2) as avg_display_usd
FROM products
WHERE is_active = true;

-- ============================================
-- STEP 7: VERIFY CURRENCY RATES
-- ============================================

-- Verify currency rates (note: rate_to_usd is now the important column)
SELECT 
    'CURRENCY RATES' as status,
    currency_code,
    currency_name,
    rate_to_usd,
    symbol
FROM currency_rates
ORDER BY currency_code;

-- ============================================
-- FINAL SUMMARY
-- ============================================

SELECT 
    'MIGRATION COMPLETE' as status,
    (SELECT COUNT(*) FROM products) as total_products,
    (SELECT COUNT(*) FROM products WHERE currency = 'USD') as products_in_usd,
    '✅ All prices converted to USD cents' as message;
