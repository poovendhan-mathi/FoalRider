-- ============================================
-- VERIFY USD MIGRATION - Run this to check everything is correct
-- ============================================

-- 1. Check product prices
SELECT 
    '📦 PRODUCTS' as check_type,
    COUNT(*) as total,
    COUNT(CASE WHEN currency = 'USD' THEN 1 END) as usd_products,
    MIN(price) as min_cents,
    MAX(price) as max_cents,
    ROUND(MIN(price) / 100.0, 2) as min_usd,
    ROUND(MAX(price) / 100.0, 2) as max_usd
FROM products;

-- 2. Sample products with prices
SELECT 
    name,
    price as cents,
    CONCAT('$', ROUND(price / 100.0, 2)) as display_price,
    currency
FROM products
ORDER BY price DESC
LIMIT 10;

-- 3. Check currency rates
SELECT 
    '💱 CURRENCY RATES' as check_type,
    currency_code,
    currency_name,
    rate_to_usd,
    symbol
FROM currency_rates
WHERE is_active = true
ORDER BY currency_code;

-- 4. Verify rate_to_usd column exists and has values
SELECT 
    '✅ RATE CHECK' as status,
    COUNT(*) as currencies_with_rates,
    COUNT(CASE WHEN rate_to_usd IS NOT NULL AND rate_to_usd > 0 THEN 1 END) as valid_rates
FROM currency_rates;
