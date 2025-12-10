-- ============================================
-- FOALRIDER - DELETE ALL ORDERS AND RELATED DATA
-- ============================================
-- Run this in Supabase SQL Editor
-- 
-- ⚠️ WARNING: This will permanently delete:
-- - All order items
-- - All reviews linked to orders
-- - All orders
-- 
-- This action CANNOT be undone!
-- ============================================

-- ============================================
-- STEP 1: VIEW CURRENT DATA (BEFORE DELETION)
-- ============================================

SELECT 'BEFORE DELETION' as status;

SELECT 'ORDERS' as table_name, COUNT(*) as count FROM orders;
SELECT 'ORDER_ITEMS' as table_name, COUNT(*) as count FROM order_items;
SELECT 'REVIEWS (with order_id)' as table_name, COUNT(*) as count FROM reviews WHERE order_id IS NOT NULL;

-- ============================================
-- STEP 2: DELETE ORDER ITEMS (child records)
-- ============================================

-- Order items reference orders via foreign key
DELETE FROM order_items;

SELECT 'ORDER_ITEMS DELETED' as status, 
       (SELECT COUNT(*) FROM order_items) as remaining_count;

-- ============================================
-- STEP 3: UPDATE REVIEWS (remove order references)
-- ============================================

-- Reviews have optional order_id, set to NULL instead of deleting
UPDATE reviews 
SET order_id = NULL 
WHERE order_id IS NOT NULL;

SELECT 'REVIEWS UPDATED' as status,
       (SELECT COUNT(*) FROM reviews WHERE order_id IS NOT NULL) as reviews_with_orders;

-- ============================================
-- STEP 4: DELETE ALL ORDERS
-- ============================================

DELETE FROM orders;

SELECT 'ORDERS DELETED' as status,
       (SELECT COUNT(*) FROM orders) as remaining_count;

-- ============================================
-- STEP 5: VERIFY DELETION
-- ============================================

SELECT 'AFTER DELETION - VERIFICATION' as status;

SELECT 'ORDERS' as table_name, COUNT(*) as count FROM orders;
SELECT 'ORDER_ITEMS' as table_name, COUNT(*) as count FROM order_items;
SELECT 'REVIEWS (with order_id)' as table_name, COUNT(*) as count FROM reviews WHERE order_id IS NOT NULL;

-- ============================================
-- FINAL SUMMARY
-- ============================================

SELECT 
    '✅ ALL ORDERS DELETED SUCCESSFULLY' as status,
    'Orders, order items cleared. Reviews preserved but unlinked.' as message;
