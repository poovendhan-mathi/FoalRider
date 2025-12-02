-- Migration: Phase 5 - Product Features & Store Settings
-- Date: December 2, 2025
-- Description: Add tables for product features, store settings, and enhance reviews

-- ============================================
-- 1. STORE SETTINGS TABLE
-- ============================================
-- Stores all configurable store settings as key-value pairs

CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Insert default settings
INSERT INTO store_settings (key, value, description) VALUES
  ('store_name', '"FoalRider"', 'Store display name'),
  ('store_email', '"support@foalrider.com"', 'Customer support email'),
  ('store_phone', '"+91 1234567890"', 'Customer support phone'),
  ('store_address', '"123 Main Street, City, State, Country"', 'Physical store address'),
  ('currency', '"INR"', 'Default currency'),
  ('tax_rate', '18', 'Tax rate percentage'),
  ('shipping_fee', '50', 'Default shipping fee in currency units'),
  ('free_shipping_threshold', '2000', 'Order amount for free shipping'),
  ('enable_notifications', 'true', 'Enable email notifications'),
  ('enable_reviews', 'true', 'Enable product reviews'),
  ('enable_wishlist', 'true', 'Enable wishlist feature'),
  ('maintenance_mode', 'false', 'Enable maintenance mode')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write settings
CREATE POLICY "Admins can read settings" ON store_settings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update settings" ON store_settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 2. PRODUCT FEATURES TABLE
-- ============================================
-- Stores detailed product features like Levi's product pages

CREATE TABLE IF NOT EXISTS product_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  
  -- Fit Information
  fit VARCHAR(100),                    -- "Regular Through The Thigh"
  rise VARCHAR(100),                   -- "Sits At Your Waist"  
  leg_style VARCHAR(100),              -- "Straight Leg"
  
  -- Material & Construction
  closure VARCHAR(50),                 -- "Button fly" / "Zip fly"
  stretch_level VARCHAR(50),           -- "Non-stretch" / "Stretch"
  material VARCHAR(200),               -- "100% Cotton"
  material_composition JSONB,          -- {"cotton": 98, "elastane": 2}
  
  -- Care & Sustainability
  care_instructions TEXT[],            -- Array of care instructions
  sustainability TEXT,                 -- Sustainability info
  country_of_origin VARCHAR(100),
  
  -- Measurements (based on size 32)
  front_rise VARCHAR(50),
  knee_measurement VARCHAR(50),
  leg_opening VARCHAR(50),
  inseam VARCHAR(50),
  
  -- Model Information (for display)
  model_height VARCHAR(50),            -- "6'1""
  model_waist VARCHAR(50),             -- "32"
  model_size_worn VARCHAR(50),         -- "32 x 32"
  
  -- Additional details
  style_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(product_id)
);

-- Enable RLS
ALTER TABLE product_features ENABLE ROW LEVEL SECURITY;

-- Everyone can read product features
CREATE POLICY "Anyone can read product features" ON product_features
  FOR SELECT USING (true);

-- Only admins can write product features
CREATE POLICY "Admins can insert product features" ON product_features
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update product features" ON product_features
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete product features" ON product_features
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 3. ENHANCE REVIEWS TABLE
-- ============================================
-- Add additional fields to existing reviews table

-- Add title column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'title') 
  THEN
    ALTER TABLE reviews ADD COLUMN title VARCHAR(200);
  END IF;
END $$;

-- Add fit_rating column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'fit_rating') 
  THEN
    ALTER TABLE reviews ADD COLUMN fit_rating VARCHAR(20);
  END IF;
END $$;

-- Add verified_purchase column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'verified_purchase') 
  THEN
    ALTER TABLE reviews ADD COLUMN verified_purchase BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add helpful_count column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'helpful_count') 
  THEN
    ALTER TABLE reviews ADD COLUMN helpful_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- ============================================
-- 4. ENHANCE PRODUCT VARIANTS
-- ============================================
-- Add color information to product variants

-- Add color_hex column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'product_variants' AND column_name = 'color_hex') 
  THEN
    ALTER TABLE product_variants ADD COLUMN color_hex VARCHAR(7);
  END IF;
END $$;

-- Add color_name column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'product_variants' AND column_name = 'color_name') 
  THEN
    ALTER TABLE product_variants ADD COLUMN color_name VARCHAR(50);
  END IF;
END $$;

-- Add swatch_image_url column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'product_variants' AND column_name = 'swatch_image_url') 
  THEN
    ALTER TABLE product_variants ADD COLUMN swatch_image_url TEXT;
  END IF;
END $$;

-- ============================================
-- 5. WISHLIST ENHANCEMENTS
-- ============================================
-- Add price tracking to wishlist

-- Add price_at_add column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wishlists' AND column_name = 'price_at_add') 
  THEN
    ALTER TABLE wishlists ADD COLUMN price_at_add NUMERIC(10,2);
  END IF;
END $$;

-- Add notify_on_sale column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wishlists' AND column_name = 'notify_on_sale') 
  THEN
    ALTER TABLE wishlists ADD COLUMN notify_on_sale BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add notify_on_restock column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wishlists' AND column_name = 'notify_on_restock') 
  THEN
    ALTER TABLE wishlists ADD COLUMN notify_on_restock BOOLEAN DEFAULT false;
  END IF;
END $$;

-- ============================================
-- 6. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_product_features_product_id ON product_features(product_id);
CREATE INDEX IF NOT EXISTS idx_store_settings_key ON store_settings(key);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- ============================================
-- 7. UPDATE FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for product_features
DROP TRIGGER IF EXISTS update_product_features_updated_at ON product_features;
CREATE TRIGGER update_product_features_updated_at
  BEFORE UPDATE ON product_features
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for store_settings
DROP TRIGGER IF EXISTS update_store_settings_updated_at ON store_settings;
CREATE TRIGGER update_store_settings_updated_at
  BEFORE UPDATE ON store_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this to verify the migration was successful:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('store_settings', 'product_features');
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'reviews' AND column_name IN ('title', 'fit_rating', 'verified_purchase', 'helpful_count');
