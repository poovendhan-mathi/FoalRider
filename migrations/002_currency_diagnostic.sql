-- ============================================
-- FOALRIDER - CURRENCY AND PRICING DIAGNOSTIC & FIX SCRIPT
-- ============================================
-- Run this in Supabase SQL Editor
-- 
-- This script will:
-- 1. Check the current state of currency_rates table
-- 2. Verify product prices are in correct format (paise)
-- 3. Set up proper exchange rates if missing
-- 4. Provide fix scripts if needed
--
-- PRICING CONVENTION:
-- All prices should be in PAISE (smallest currency unit)
-- ₹100 = 10000 paise
-- $60 stored for a product should be 6000 paise (if converted to INR first)
-- ============================================

-- ============================================
-- STEP 1: CHECK CURRENCY RATES TABLE
-- ============================================

-- Check if currency_rates table exists and has data
SELECT 
    'currency_rates check' as check_type,
    currency_code,
    rate_to_inr,
    is_active,
    updated_at
FROM currency_rates
ORDER BY currency_code;

-- ============================================
-- STEP 2: CHECK PRODUCT PRICES
-- ============================================

-- Sample of product prices to verify format
-- If prices look like 60, 100, 500 - they're in main unit (WRONG)
-- If prices look like 6000, 10000, 50000 - they're in paise (CORRECT)
SELECT 
    'product_prices check' as check_type,
    id,
    name,
    price,
    currency,
    CASE 
        WHEN price < 100 THEN 'LIKELY_WRONG (seems like main unit, not paise)'
        WHEN price >= 100 AND price < 10000 THEN 'CHECK (might be small price or wrong format)'
        ELSE 'LIKELY_CORRECT (seems like paise)'
    END as price_assessment,
    -- Expected display price
    ROUND(price / 100.0, 2) as expected_display_price
FROM products
ORDER BY price ASC
LIMIT 20;

-- ============================================
-- STEP 3: STATISTICAL ANALYSIS
-- ============================================

SELECT 
    'price_statistics' as check_type,
    COUNT(*) as total_products,
    MIN(price) as min_price,
    MAX(price) as max_price,
    AVG(price) as avg_price,
    -- Count of suspicious prices (too low to be paise)
    COUNT(*) FILTER (WHERE price < 100) as likely_wrong_format,
    COUNT(*) FILTER (WHERE price >= 10000) as likely_correct_format
FROM products
WHERE is_active = true;

-- ============================================
-- STEP 4: SETUP/UPDATE CURRENCY RATES
-- ============================================

-- Insert or update currency rates
-- These are approximate rates as of December 2024
-- rate_to_inr means: 1 unit of foreign currency = X INR
-- Example: 1 USD = 83.5 INR

INSERT INTO currency_rates (currency_code, currency_name, symbol, rate_to_inr, is_active, updated_at)
VALUES 
    ('INR', 'Indian Rupee', '₹', 1.0, true, NOW()),
    ('USD', 'US Dollar', '$', 83.5, true, NOW()),
    ('SGD', 'Singapore Dollar', 'S$', 62.0, true, NOW()),
    ('EUR', 'Euro', '€', 91.0, true, NOW()),
    ('GBP', 'British Pound', '£', 105.0, true, NOW()),
    ('AUD', 'Australian Dollar', 'A$', 55.0, true, NOW())
ON CONFLICT (currency_code) 
DO UPDATE SET 
    currency_name = EXCLUDED.currency_name,
    symbol = EXCLUDED.symbol,
    rate_to_inr = EXCLUDED.rate_to_inr,
    is_active = true,
    updated_at = NOW();

-- Verify the rates were inserted
SELECT 
    'currency_rates_after_update' as check_type,
    currency_code,
    rate_to_inr,
    is_active,
    updated_at
FROM currency_rates
ORDER BY currency_code;

-- ============================================
-- STEP 5: FIX PRODUCT PRICES (IF NEEDED)
-- ============================================

-- ⚠️ ONLY RUN THIS IF YOUR PRICES ARE IN WRONG FORMAT!
-- This converts prices from main unit to paise (multiplies by 100)
-- 
-- UNCOMMENT THE FOLLOWING BLOCK ONLY IF STEP 2 SHOWS PRICES ARE WRONG

/*
-- Backup first!
CREATE TABLE IF NOT EXISTS products_price_backup AS
SELECT id, name, price, currency, updated_at
FROM products;

-- Convert prices from main unit to paise
UPDATE products
SET 
    price = price * 100,
    updated_at = NOW()
WHERE price < 10000; -- Only update likely wrong prices

-- Verify the fix
SELECT 
    'after_fix' as check_type,
    id,
    name,
    price as price_in_paise,
    ROUND(price / 100.0, 2) as display_price_inr
FROM products
ORDER BY price ASC
LIMIT 20;
*/

-- ============================================
-- STEP 6: CHECK ORDERS TABLE
-- ============================================

-- Verify order amounts are in paise
SELECT 
    'orders_check' as check_type,
    id,
    order_number,
    total_amount,
    subtotal,
    shipping_cost,
    tax,
    currency,
    CASE 
        WHEN total_amount < 1000 THEN 'LIKELY_WRONG'
        ELSE 'LIKELY_CORRECT'
    END as amount_assessment
FROM orders
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- SUMMARY
-- ============================================

-- Run this to get a summary of your pricing health
SELECT 
    'PRICING_HEALTH_SUMMARY' as report,
    (SELECT COUNT(*) FROM products WHERE is_active = true) as active_products,
    (SELECT COUNT(*) FROM products WHERE price < 100 AND is_active = true) as suspicious_prices,
    (SELECT COUNT(*) FROM currency_rates WHERE is_active = true) as active_currencies,
    CASE 
        WHEN (SELECT COUNT(*) FROM products WHERE price < 100 AND is_active = true) > 0 
        THEN '⚠️ ATTENTION: Some prices may need conversion to paise'
        ELSE '✅ All prices appear to be in correct format (paise)'
    END as status;
