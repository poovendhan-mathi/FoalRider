-- ============================================
-- FOALRIDER - PRICING CONSTRAINTS MIGRATION
-- ============================================
-- Run this in Supabase SQL Editor to add pricing safeguards
-- Created: December 2024
-- Purpose: Add CHECK constraints and documentation for price fields

-- ============================================
-- 1. ADD CHECK CONSTRAINTS FOR POSITIVE PRICES
-- ============================================

-- Products table: price must be non-negative
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'products_price_positive'
    ) THEN
        ALTER TABLE products 
        ADD CONSTRAINT products_price_positive CHECK (price >= 0);
    END IF;
END $$;

-- Orders table: all monetary fields must be non-negative
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'orders_total_amount_positive'
    ) THEN
        ALTER TABLE orders 
        ADD CONSTRAINT orders_total_amount_positive CHECK (total_amount >= 0);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'orders_subtotal_positive'
    ) THEN
        ALTER TABLE orders 
        ADD CONSTRAINT orders_subtotal_positive CHECK (subtotal IS NULL OR subtotal >= 0);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'orders_shipping_cost_positive'
    ) THEN
        ALTER TABLE orders 
        ADD CONSTRAINT orders_shipping_cost_positive CHECK (shipping_cost >= 0);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'orders_tax_positive'
    ) THEN
        ALTER TABLE orders 
        ADD CONSTRAINT orders_tax_positive CHECK (tax >= 0);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'orders_discount_positive'
    ) THEN
        ALTER TABLE orders 
        ADD CONSTRAINT orders_discount_positive CHECK (discount >= 0);
    END IF;
END $$;

-- Order items table: prices must be non-negative
-- Note: Database uses 'price' and 'subtotal' columns (not unit_price/total_price)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'order_items_price_positive'
    ) THEN
        ALTER TABLE order_items 
        ADD CONSTRAINT order_items_price_positive CHECK (price >= 0);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'order_items_subtotal_positive'
    ) THEN
        ALTER TABLE order_items 
        ADD CONSTRAINT order_items_subtotal_positive CHECK (subtotal >= 0);
    END IF;
END $$;

-- Product variants table: extra_price must be non-negative
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'product_variants_extra_price_positive'
    ) THEN
        ALTER TABLE product_variants 
        ADD CONSTRAINT product_variants_extra_price_positive CHECK (extra_price >= 0);
    END IF;
END $$;

-- ============================================
-- 2. ADD COLUMN COMMENTS FOR DOCUMENTATION
-- ============================================

-- Products table
COMMENT ON COLUMN products.price IS 'Product price in PAISE (smallest currency unit). 100 paise = 1 INR. Example: ₹1,000 = 100000 paise';
COMMENT ON COLUMN products.currency IS 'Currency code (INR, USD, EUR, etc.). Prices are stored in smallest unit of this currency.';

-- Orders table
COMMENT ON COLUMN orders.subtotal IS 'Order subtotal before shipping/tax/discount in PAISE';
COMMENT ON COLUMN orders.shipping_cost IS 'Shipping cost in PAISE';
COMMENT ON COLUMN orders.tax IS 'Tax amount in PAISE';
COMMENT ON COLUMN orders.discount IS 'Discount amount in PAISE';
COMMENT ON COLUMN orders.total_amount IS 'Total order amount in PAISE (subtotal + shipping + tax - discount)';
COMMENT ON COLUMN orders.currency IS 'Currency code for this order. All amounts are in smallest unit of this currency.';

-- Order items table
-- Note: Database uses 'price' and 'subtotal' columns
COMMENT ON COLUMN order_items.price IS 'Price per unit in PAISE at time of purchase';
COMMENT ON COLUMN order_items.subtotal IS 'Total price (price × quantity) in PAISE';

-- Product variants table
COMMENT ON COLUMN product_variants.extra_price IS 'Additional price for this variant in PAISE (added to base product price)';

-- Currency rates table
COMMENT ON COLUMN currency_rates.rate_to_inr IS 'Exchange rate: 1 unit of this currency = X INR. Used for display conversion.';

-- ============================================
-- 3. ADD INDEX FOR FASTER CURRENCY LOOKUPS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_currency_rates_code ON currency_rates(currency_code);

-- ============================================
-- 4. ADD TRIGGER TO VALIDATE TOTAL_PRICE CALCULATION
-- ============================================

-- Function to validate order_items subtotal matches price * quantity
CREATE OR REPLACE FUNCTION validate_order_item_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Allow small rounding differences (within 1 paise)
    IF ABS(NEW.subtotal - (NEW.price * NEW.quantity)) > 1 THEN
        RAISE EXCEPTION 'subtotal (%) must equal price (%) × quantity (%)', 
            NEW.subtotal, NEW.price, NEW.quantity;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_validate_order_item_total'
    ) THEN
        CREATE TRIGGER trigger_validate_order_item_total
        BEFORE INSERT OR UPDATE ON order_items
        FOR EACH ROW
        EXECUTE FUNCTION validate_order_item_total();
    END IF;
END $$;

-- ============================================
-- 5. VERIFICATION QUERIES (Run to check data)
-- ============================================

-- Uncomment these to check for any existing invalid data:

-- Check for negative prices in products
-- SELECT id, name, price FROM products WHERE price < 0;

-- Check for negative amounts in orders
-- SELECT id, order_number, total_amount, subtotal, shipping_cost, tax, discount 
-- FROM orders 
-- WHERE total_amount < 0 OR subtotal < 0 OR shipping_cost < 0 OR tax < 0 OR discount < 0;

-- Check for mismatched totals in order_items
-- SELECT id, order_id, price, quantity, subtotal, 
--        (price * quantity) as expected_total
-- FROM order_items 
-- WHERE ABS(subtotal - (price * quantity)) > 1;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- All prices in the database are now protected by:
-- 1. CHECK constraints ensuring non-negative values
-- 2. Trigger validating order_items total calculation
-- 3. Column comments documenting the paise convention
-- 4. Index for faster currency rate lookups
