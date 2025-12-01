# Enterprise E-Commerce Architecture for Next.js + Supabase + Stripe

## Complete System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CLIENT APPLICATIONS                                   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────────────────┐  │
│  │   Customer Web App  │  │   Admin Dashboard   │  │   Mobile App (Future)           │  │
│  │   (Next.js SSR)     │  │   (Next.js)         │  │   (React Native)                │  │
│  └──────────┬──────────┘  └──────────┬──────────┘  └──────────────┬──────────────────┘  │
└─────────────┼────────────────────────┼─────────────────────────────┼────────────────────┘
              │                        │                             │
              └────────────────────────┼─────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    API GATEWAY LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │                              NEXT.JS MIDDLEWARE                                  │    │
│  │  • Authentication & Authorization                                                │    │
│  │  • Rate Limiting                                                                 │    │
│  │  • Request Validation                                                            │    │
│  │  • Geo-IP / Locale Detection                                                     │    │
│  │  • Admin Route Protection                                                        │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                          │                                              │
│  ┌───────────────────────────────────────┼────────────────────────────────────────┐    │
│  │                              API ROUTES                                         │    │
│  ├─────────────┬─────────────┬───────────┴───┬─────────────┬─────────────────────┤    │
│  │  /api/      │  /api/      │  /api/        │  /api/      │  /api/              │    │
│  │  products   │  cart       │  orders       │  checkout   │  admin              │    │
│  │             │             │               │             │                     │    │
│  │  • list     │  • get      │  • create     │  • init     │  • products/*       │    │
│  │  • detail   │  • add      │  • list       │  • complete │  • orders/*         │    │
│  │  • search   │  • update   │  • detail     │  • webhook  │  • customers/*      │    │
│  │  • filter   │  • remove   │  • cancel     │             │  • analytics/*      │    │
│  │             │  • merge    │  • return     │             │  • inventory/*      │    │
│  └─────────────┴─────────────┴───────────────┴─────────────┴─────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    SERVICE LAYER                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │
│  │  Product    │ │  Cart       │ │  Order      │ │  Inventory  │ │  Customer       │   │
│  │  Service    │ │  Service    │ │  Service    │ │  Service    │ │  Service        │   │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └────────┬────────┘   │
│         │               │               │               │                  │            │
│  ┌──────┴──────┐ ┌──────┴──────┐ ┌──────┴──────┐ ┌──────┴──────┐ ┌────────┴────────┐   │
│  │  Pricing    │ │  Promotion  │ │  Payment    │ │  Shipping   │ │  Notification   │   │
│  │  Service    │ │  Service    │ │  Service    │ │  Service    │ │  Service        │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────┘   │
│                                                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │
│  │  Search     │ │  Analytics  │ │  Audit      │ │  Tax        │ │  Media          │   │
│  │  Service    │ │  Service    │ │  Service    │ │  Service    │ │  Service        │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    DATA LAYER                                            │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────────────────┐  │
│  │      SUPABASE       │  │       STRIPE        │  │      EXTERNAL SERVICES          │  │
│  │                     │  │                     │  │                                 │  │
│  │  • PostgreSQL DB    │  │  • Customers        │  │  • Cloudinary (Images)          │  │
│  │  • Auth             │  │  • Products         │  │  • Algolia (Search)             │  │
│  │  • Storage          │  │  • Prices           │  │  • SendGrid (Email)             │  │
│  │  • Realtime         │  │  • PaymentIntents   │  │  • Shippo (Shipping)            │  │
│  │  • Edge Functions   │  │  • Subscriptions    │  │  • TaxJar (Tax)                 │  │
│  │                     │  │  • Webhooks         │  │  • Redis (Cache) - Optional     │  │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Complete Database Schema

Based on your existing tables, here's the complete schema:

```sql
-- ============================================================================
-- SECTION 1: EXISTING TABLES (Your current schema - keeping for reference)
-- ============================================================================

-- currencies (EXISTS)
-- countries (EXISTS)
-- exchange_rates (EXISTS)
-- products (EXISTS - will extend)
-- prices (EXISTS - will extend)
-- stripe_customers (EXISTS)
-- payments (EXISTS)
-- refunds (EXISTS)
-- webhook_events (EXISTS)
-- payment_audit_log (EXISTS)

-- ============================================================================
-- SECTION 2: EXTENDED PRODUCT SYSTEM
-- ============================================================================

-- Product Categories (hierarchical)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES categories(id),

    -- Basic info
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,

    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,

    -- Display
    image_url TEXT,
    display_order INTEGER DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,

    -- Hierarchy path for efficient queries (e.g., "clothing/men/shirts")
    path LTREE,
    level INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Brands
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extended Products Table (ALTER your existing)
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(100) UNIQUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description VARCHAR(500);
ALTER TABLE products ADD COLUMN IF NOT EXISTS long_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS material TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS care_instructions TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_grams INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_on_sale BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_percentage INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sold_count INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE products ADD COLUMN IF NOT EXISTS gender VARCHAR(20); -- 'men', 'women', 'unisex', 'kids'
ALTER TABLE products ADD COLUMN IF NOT EXISTS season VARCHAR(50); -- 'spring', 'summer', 'fall', 'winter', 'all-season'

-- Product Variants (Size, Color combinations)
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,

    -- Variant identification
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100),
    name VARCHAR(255), -- Auto-generated: "Blue / Large"

    -- Variant attributes (stored as JSONB for flexibility)
    -- Example: {"color": "Blue", "size": "L", "color_code": "#0066CC"}
    attributes JSONB NOT NULL DEFAULT '{}',

    -- Pricing (can override product base price)
    price_adjustment INTEGER DEFAULT 0, -- Additional cost for this variant

    -- Inventory
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    allow_backorder BOOLEAN DEFAULT false,

    -- Physical
    weight_grams INTEGER,

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false, -- Show this variant by default

    -- Display
    display_order INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(product_id, attributes)
);

-- Product Images
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,

    -- Image URLs (multiple sizes)
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    medium_url TEXT,
    large_url TEXT,

    -- Metadata
    alt_text VARCHAR(255),
    title VARCHAR(255),

    -- Organization
    position INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,

    -- Technical
    width INTEGER,
    height INTEGER,
    file_size INTEGER,
    mime_type VARCHAR(50),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Attributes (for filtering: color options, size options, etc.)
CREATE TABLE product_attribute_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL, -- "Color", "Size", "Material"
    slug VARCHAR(100) UNIQUE NOT NULL,
    display_type VARCHAR(50) DEFAULT 'dropdown', -- 'dropdown', 'color_swatch', 'button', 'image'
    is_variant_attribute BOOLEAN DEFAULT true, -- Used to create variants
    is_filterable BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attribute Values
CREATE TABLE product_attribute_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attribute_type_id UUID REFERENCES product_attribute_types(id) ON DELETE CASCADE,
    value VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    display_value VARCHAR(255), -- For display (e.g., "Extra Large" for "XL")
    color_code VARCHAR(7), -- For color attributes (#FF0000)
    image_url TEXT, -- For image swatches
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,

    UNIQUE(attribute_type_id, slug)
);

-- Product to Attribute Values (many-to-many)
CREATE TABLE product_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    attribute_type_id UUID REFERENCES product_attribute_types(id),
    attribute_value_id UUID REFERENCES product_attribute_values(id),

    UNIQUE(product_id, attribute_type_id, attribute_value_id)
);

-- Size Charts
CREATE TABLE size_charts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES categories(id),
    brand_id UUID REFERENCES brands(id),

    -- Chart data as JSONB
    -- Example: {"headers": ["Size", "Chest", "Waist"], "rows": [["S", "36", "30"], ["M", "38", "32"]]}
    chart_data JSONB NOT NULL,

    -- Measurement unit
    unit VARCHAR(10) DEFAULT 'inches', -- 'inches', 'cm'

    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link products to size charts
ALTER TABLE products ADD COLUMN IF NOT EXISTS size_chart_id UUID REFERENCES size_charts(id);

-- ============================================================================
-- SECTION 3: INVENTORY MANAGEMENT
-- ============================================================================

-- Inventory Locations (Warehouses)
CREATE TABLE inventory_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,

    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(2) REFERENCES countries(code),

    -- Contact
    phone VARCHAR(50),
    email VARCHAR(255),

    -- Settings
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    can_ship BOOLEAN DEFAULT true,
    can_pickup BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory by Location
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    location_id UUID REFERENCES inventory_locations(id) ON DELETE CASCADE,

    -- Quantities
    quantity_on_hand INTEGER DEFAULT 0,
    quantity_reserved INTEGER DEFAULT 0, -- Reserved for pending orders
    quantity_available INTEGER GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,

    -- Thresholds
    reorder_point INTEGER DEFAULT 10,
    reorder_quantity INTEGER DEFAULT 50,

    -- Tracking
    last_counted_at TIMESTAMPTZ,
    last_received_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(variant_id, location_id)
);

-- Inventory Movements (audit trail)
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID REFERENCES product_variants(id),
    location_id UUID REFERENCES inventory_locations(id),

    -- Movement details
    movement_type VARCHAR(50) NOT NULL,
    -- Types: 'purchase', 'sale', 'return', 'adjustment', 'transfer_in', 'transfer_out', 'damage', 'expired'

    quantity INTEGER NOT NULL, -- Positive for in, negative for out
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,

    -- Reference
    reference_type VARCHAR(50), -- 'order', 'purchase_order', 'adjustment', 'transfer'
    reference_id UUID,

    -- Tracking
    notes TEXT,
    performed_by UUID REFERENCES auth.users(id),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECTION 4: SHOPPING CART
-- ============================================================================

-- Cart (persistent, survives sessions)
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Owner (either user or session)
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255), -- For guest carts

    -- Status
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'merged', 'converted', 'abandoned'

    -- Currency at time of cart creation
    currency VARCHAR(3) REFERENCES currencies(code),

    -- Totals (calculated, cached for performance)
    subtotal INTEGER DEFAULT 0,
    discount_total INTEGER DEFAULT 0,
    tax_total INTEGER DEFAULT 0,
    shipping_total INTEGER DEFAULT 0,
    grand_total INTEGER DEFAULT 0,

    -- Applied promotions
    applied_coupon_code VARCHAR(50),
    applied_promotions JSONB DEFAULT '[]',

    -- Metadata
    notes TEXT, -- Customer notes
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    converted_at TIMESTAMPTZ, -- When converted to order

    -- Constraints
    CONSTRAINT cart_owner CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- Cart Items
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,

    -- Product reference
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),

    -- Quantity
    quantity INTEGER NOT NULL CHECK (quantity > 0),

    -- Price at time of adding (for price change detection)
    unit_price INTEGER NOT NULL,
    original_unit_price INTEGER, -- Before any discounts

    -- Line totals
    line_subtotal INTEGER GENERATED ALWAYS AS (unit_price * quantity) STORED,
    line_discount INTEGER DEFAULT 0,
    line_total INTEGER GENERATED ALWAYS AS ((unit_price * quantity) - COALESCE(line_discount, 0)) STORED,

    -- Gift options
    is_gift BOOLEAN DEFAULT false,
    gift_message TEXT,

    -- Metadata (saved variant attributes for display)
    variant_attributes JSONB DEFAULT '{}',
    product_snapshot JSONB, -- Snapshot of product data at time of adding

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(cart_id, variant_id)
);

-- Saved for Later
CREATE TABLE saved_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, variant_id)
);

-- ============================================================================
-- SECTION 5: CUSTOMER MANAGEMENT
-- ============================================================================

-- Extended Customer Profile
CREATE TABLE customer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

    -- Personal info
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    date_of_birth DATE,
    gender VARCHAR(20),

    -- Preferences
    preferred_currency VARCHAR(3) REFERENCES currencies(code),
    preferred_locale VARCHAR(10),
    preferred_size JSONB, -- {"tops": "M", "bottoms": "32", "shoes": "10"}

    -- Communication preferences
    email_marketing BOOLEAN DEFAULT false,
    sms_marketing BOOLEAN DEFAULT false,
    push_notifications BOOLEAN DEFAULT true,

    -- Loyalty
    loyalty_points INTEGER DEFAULT 0,
    loyalty_tier VARCHAR(50) DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'

    -- Stats (denormalized for performance)
    total_orders INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0,
    average_order_value INTEGER DEFAULT 0,
    first_order_at TIMESTAMPTZ,
    last_order_at TIMESTAMPTZ,

    -- Segments (for marketing)
    tags TEXT[],
    segments TEXT[],

    -- Internal
    notes TEXT, -- Admin notes

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer Addresses
CREATE TABLE customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Address type
    address_type VARCHAR(20) DEFAULT 'shipping', -- 'shipping', 'billing'

    -- Contact
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(50),

    -- Address
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(2) REFERENCES countries(code) NOT NULL,

    -- Flags
    is_default_shipping BOOLEAN DEFAULT false,
    is_default_billing BOOLEAN DEFAULT false,

    -- Validation
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wishlists
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) DEFAULT 'My Wishlist',
    is_public BOOLEAN DEFAULT false,
    share_token VARCHAR(100) UNIQUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id),

    -- Price tracking
    price_when_added INTEGER,
    notify_on_sale BOOLEAN DEFAULT true,
    notify_on_restock BOOLEAN DEFAULT true,

    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(wishlist_id, product_id, variant_id)
);

-- ============================================================================
-- SECTION 6: ORDER MANAGEMENT
-- ============================================================================

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Order identification
    order_number VARCHAR(50) UNIQUE NOT NULL, -- Human readable: ORD-2024-000001

    -- Customer
    user_id UUID REFERENCES auth.users(id),
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),

    -- Stripe
    stripe_customer_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- Status flow: pending -> confirmed -> processing -> shipped -> delivered
    -- Or: pending -> cancelled
    -- Or: delivered -> return_requested -> returned
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- Payment: pending, authorized, paid, partially_refunded, refunded, failed
    fulfillment_status VARCHAR(50) NOT NULL DEFAULT 'unfulfilled',
    -- Fulfillment: unfulfilled, partially_fulfilled, fulfilled, returned

    -- Currency
    currency VARCHAR(3) REFERENCES currencies(code) NOT NULL,
    exchange_rate DECIMAL(20,10), -- Rate at time of order

    -- Amounts (in smallest currency unit)
    subtotal INTEGER NOT NULL,
    discount_total INTEGER DEFAULT 0,
    shipping_total INTEGER DEFAULT 0,
    tax_total INTEGER DEFAULT 0,
    grand_total INTEGER NOT NULL,
    amount_paid INTEGER DEFAULT 0,
    amount_refunded INTEGER DEFAULT 0,

    -- Discounts
    coupon_code VARCHAR(50),
    discount_breakdown JSONB DEFAULT '[]',

    -- Tax
    tax_rate DECIMAL(5,2),
    tax_breakdown JSONB DEFAULT '[]',
    is_tax_exempt BOOLEAN DEFAULT false,
    tax_exempt_reason TEXT,

    -- Shipping
    shipping_method_id UUID,
    shipping_method_name VARCHAR(255),
    estimated_delivery_date DATE,

    -- Addresses (denormalized - snapshot at order time)
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,

    -- Flags
    is_gift BOOLEAN DEFAULT false,
    gift_message TEXT,
    requires_shipping BOOLEAN DEFAULT true,

    -- Source
    source VARCHAR(50) DEFAULT 'web', -- 'web', 'mobile', 'admin', 'api'
    source_ip INET,
    user_agent TEXT,

    -- Customer notes & admin notes
    customer_notes TEXT,
    internal_notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,

    -- Cancellation
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES auth.users(id)
);

-- Order Items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,

    -- Product reference (keep reference even if product deleted)
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,

    -- Product snapshot (preserved forever)
    product_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255),
    sku VARCHAR(100),
    product_image_url TEXT,
    product_attributes JSONB DEFAULT '{}',

    -- Pricing
    quantity INTEGER NOT NULL,
    unit_price INTEGER NOT NULL,
    original_unit_price INTEGER,
    line_subtotal INTEGER NOT NULL,
    line_discount INTEGER DEFAULT 0,
    line_tax INTEGER DEFAULT 0,
    line_total INTEGER NOT NULL,

    -- Fulfillment
    quantity_fulfilled INTEGER DEFAULT 0,
    quantity_returned INTEGER DEFAULT 0,
    quantity_refunded INTEGER DEFAULT 0,

    -- Gift
    is_gift BOOLEAN DEFAULT false,
    gift_message TEXT,

    -- Weight (for shipping calculation)
    weight_grams INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Status History
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,

    status VARCHAR(50) NOT NULL,
    previous_status VARCHAR(50),

    -- Who made the change
    changed_by UUID REFERENCES auth.users(id),
    changed_by_type VARCHAR(50) DEFAULT 'system', -- 'system', 'customer', 'admin'

    notes TEXT,
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipments (Fulfillments)
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,

    -- Shipment identification
    shipment_number VARCHAR(50) UNIQUE NOT NULL,

    -- Carrier info
    carrier VARCHAR(100), -- 'fedex', 'ups', 'usps', 'dhl'
    service_type VARCHAR(100), -- 'ground', 'express', 'overnight'
    tracking_number VARCHAR(255),
    tracking_url TEXT,

    -- Status
    status VARCHAR(50) DEFAULT 'pending',
    -- pending, label_created, picked_up, in_transit, out_for_delivery, delivered, failed, returned

    -- Location
    shipped_from_location_id UUID REFERENCES inventory_locations(id),

    -- Shipping address (snapshot)
    shipping_address JSONB NOT NULL,

    -- Package details
    package_weight_grams INTEGER,
    package_dimensions JSONB, -- {"length": 10, "width": 8, "height": 4, "unit": "inches"}

    -- Costs
    shipping_cost INTEGER,
    insurance_cost INTEGER,

    -- Dates
    label_created_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    estimated_delivery_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,

    -- Proof
    signature_required BOOLEAN DEFAULT false,
    signature_image_url TEXT,
    delivery_photo_url TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipment Items
CREATE TABLE shipment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Returns
CREATE TABLE returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,

    -- Return identification
    return_number VARCHAR(50) UNIQUE NOT NULL, -- RET-2024-000001

    -- Status
    status VARCHAR(50) DEFAULT 'requested',
    -- requested, approved, rejected, shipped, received, inspected, refunded, completed

    -- Reason
    reason VARCHAR(100) NOT NULL,
    -- 'wrong_size', 'defective', 'not_as_described', 'changed_mind', 'other'
    reason_details TEXT,

    -- Return shipping
    return_label_url TEXT,
    return_tracking_number VARCHAR(255),
    return_carrier VARCHAR(100),

    -- Inspection
    inspection_notes TEXT,
    condition VARCHAR(50), -- 'new', 'like_new', 'used', 'damaged'

    -- Refund
    refund_amount INTEGER,
    refund_method VARCHAR(50), -- 'original_payment', 'store_credit'
    refund_id UUID REFERENCES refunds(id),

    -- Timestamps
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    inspected_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Who processed
    processed_by UUID REFERENCES auth.users(id),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Return Items
CREATE TABLE return_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id UUID REFERENCES returns(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,

    quantity INTEGER NOT NULL,
    reason VARCHAR(100),
    condition VARCHAR(50),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECTION 7: PROMOTIONS & DISCOUNTS
-- ============================================================================

-- Coupons
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identification
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Discount type
    discount_type VARCHAR(50) NOT NULL,
    -- 'percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y'
    discount_value DECIMAL(10,2), -- 10 for 10% or 1000 for $10.00

    -- Conditions
    minimum_order_amount INTEGER, -- Minimum cart subtotal
    minimum_quantity INTEGER, -- Minimum items in cart

    -- Limits
    max_uses INTEGER, -- Total uses allowed
    max_uses_per_customer INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,

    -- Validity
    starts_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ,

    -- Restrictions
    applicable_products UUID[], -- Specific products (null = all)
    applicable_categories UUID[], -- Specific categories (null = all)
    applicable_brands UUID[], -- Specific brands (null = all)
    excluded_products UUID[],
    excluded_categories UUID[],

    -- Customer restrictions
    first_order_only BOOLEAN DEFAULT false,
    customer_emails TEXT[], -- Specific customers only

    -- Currency
    currency VARCHAR(3) REFERENCES currencies(code), -- For fixed_amount, null = all

    -- Status
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupon Usage Tracking
CREATE TABLE coupon_uses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),

    discount_amount INTEGER NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatic Promotions (no code required)
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Type
    promotion_type VARCHAR(50) NOT NULL,
    -- 'percentage_off', 'amount_off', 'buy_x_get_y', 'bundle', 'tiered'

    -- Rules (JSONB for flexibility)
    -- Example: {"buy_quantity": 2, "get_quantity": 1, "get_discount": 100}
    rules JSONB NOT NULL DEFAULT '{}',

    -- Discount
    discount_type VARCHAR(50),
    discount_value DECIMAL(10,2),

    -- Priority (higher = applied first)
    priority INTEGER DEFAULT 0,

    -- Stacking
    stackable BOOLEAN DEFAULT false, -- Can combine with other promotions
    exclusive BOOLEAN DEFAULT false, -- Only one exclusive can apply

    -- Validity
    starts_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ,

    -- Restrictions
    applicable_products UUID[],
    applicable_categories UUID[],
    customer_segments TEXT[],

    -- Status
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECTION 8: SHIPPING
-- ============================================================================

-- Shipping Zones
CREATE TABLE shipping_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,

    -- Zone definition
    countries TEXT[], -- Array of country codes
    states TEXT[], -- Array of state/region codes
    postal_codes TEXT[], -- Array of postal code patterns

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipping Methods
CREATE TABLE shipping_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id UUID REFERENCES shipping_zones(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    description TEXT,
    carrier VARCHAR(100),

    -- Pricing type
    price_type VARCHAR(50) NOT NULL,
    -- 'flat_rate', 'weight_based', 'price_based', 'item_based', 'free'

    -- Flat rate
    flat_rate INTEGER,

    -- Weight-based (JSONB for tiers)
    -- Example: [{"min": 0, "max": 1000, "price": 500}, {"min": 1001, "max": 5000, "price": 1000}]
    weight_rates JSONB,

    -- Price-based free shipping threshold
    free_shipping_threshold INTEGER,

    -- Delivery estimate
    min_delivery_days INTEGER,
    max_delivery_days INTEGER,

    -- Restrictions
    max_weight_grams INTEGER,
    max_dimensions JSONB,

    -- Display
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECTION 9: REVIEWS & RATINGS
-- ============================================================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,

    -- Rating
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),

    -- Review content
    title VARCHAR(255),
    content TEXT,

    -- Pros/Cons
    pros TEXT[],
    cons TEXT[],

    -- Fit feedback (for clothing)
    size_feedback VARCHAR(50), -- 'runs_small', 'true_to_size', 'runs_large'

    -- Images
    image_urls TEXT[],

    -- Verification
    is_verified_purchase BOOLEAN DEFAULT false,

    -- Moderation
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'spam'
    moderated_by UUID REFERENCES auth.users(id),
    moderated_at TIMESTAMPTZ,
    rejection_reason TEXT,

    -- Helpfulness
    helpful_count INTEGER DEFAULT 0,
    unhelpful_count INTEGER DEFAULT 0,

    -- Admin response
    admin_response TEXT,
    admin_response_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review Helpfulness Votes
CREATE TABLE review_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(review_id, user_id)
);

-- ============================================================================
-- SECTION 10: ADMIN & ANALYTICS
-- ============================================================================

-- Admin Users (roles and permissions)
CREATE TABLE admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]',
    -- Example: ["products.read", "products.write", "orders.read", "orders.manage"]

    is_super_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    role_id UUID REFERENCES admin_roles(id),

    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Activity Log
CREATE TABLE admin_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES admin_users(id),

    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL, -- 'product', 'order', 'customer'
    resource_id UUID,

    -- Change details
    previous_values JSONB,
    new_values JSONB,

    ip_address INET,
    user_agent TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Events (for custom analytics)
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Event type
    event_type VARCHAR(100) NOT NULL,
    -- 'page_view', 'product_view', 'add_to_cart', 'checkout_start', 'purchase', etc.

    -- User identification
    user_id UUID REFERENCES auth.users(id),
    session_id VARCHAR(255),

    -- Event data
    properties JSONB DEFAULT '{}',
    -- Example: {"product_id": "xxx", "category": "shirts", "price": 2999}

    -- Context
    page_url TEXT,
    referrer TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),

    -- Device info
    device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
    browser VARCHAR(100),
    os VARCHAR(100),

    -- Location
    country VARCHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Sales Summary (materialized for dashboard performance)
CREATE TABLE daily_sales_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    currency VARCHAR(3) NOT NULL,

    -- Order metrics
    total_orders INTEGER DEFAULT 0,
    total_items_sold INTEGER DEFAULT 0,

    -- Revenue
    gross_revenue INTEGER DEFAULT 0,
    discounts INTEGER DEFAULT 0,
    refunds INTEGER DEFAULT 0,
    net_revenue INTEGER DEFAULT 0,

    -- Other metrics
    average_order_value INTEGER DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    returning_customers INTEGER DEFAULT 0,

    -- Top products (JSONB array)
    top_products JSONB DEFAULT '[]',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(date, currency)
);

-- ============================================================================
-- SECTION 11: NOTIFICATIONS & EMAILS
-- ============================================================================

-- Email Templates
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identification
    slug VARCHAR(100) UNIQUE NOT NULL,
    -- 'order_confirmation', 'shipping_notification', 'password_reset', etc.

    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Content
    subject VARCHAR(500) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,

    -- Variables
    available_variables TEXT[], -- ['customer_name', 'order_number', 'order_items']

    -- Localization
    locale VARCHAR(10) DEFAULT 'en',

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(slug, locale)
);

-- Notification Queue
CREATE TABLE notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Type
    channel VARCHAR(50) NOT NULL, -- 'email', 'sms', 'push'
    template_slug VARCHAR(100),

    -- Recipient
    user_id UUID REFERENCES auth.users(id),
    recipient VARCHAR(255) NOT NULL, -- email or phone

    -- Content
    subject VARCHAR(500),
    content TEXT,
    data JSONB DEFAULT '{}', -- Template variables

    -- Status
    status VARCHAR(50) DEFAULT 'pending',
    -- 'pending', 'processing', 'sent', 'failed'

    -- Attempts
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_attempt_at TIMESTAMPTZ,
    error_message TEXT,

    -- Scheduling
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECTION 12: INDEXES FOR PERFORMANCE
-- ============================================================================

-- Categories
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_path ON categories USING GIST (path);

-- Products
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_status ON products(is_active, published_at);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_search ON products USING GIN (to_tsvector('english', name || ' ' || COALESCE(short_description, '')));

-- Variants
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);
CREATE INDEX idx_variants_stock ON product_variants(stock_quantity) WHERE is_active = true;

-- Inventory
CREATE INDEX idx_inventory_variant ON inventory(variant_id);
CREATE INDEX idx_inventory_location ON inventory(location_id);
CREATE INDEX idx_inventory_low_stock ON inventory(quantity_available) WHERE quantity_available <= reorder_point;

-- Carts
CREATE INDEX idx_carts_user ON carts(user_id) WHERE status = 'active';
CREATE INDEX idx_carts_session ON carts(session_id) WHERE status = 'active';
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);

-- Orders
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Reviews
CREATE INDEX idx_reviews_product ON reviews(product_id) WHERE status = 'approved';
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- Analytics
CREATE INDEX idx_analytics_type_date ON analytics_events(event_type, created_at);
CREATE INDEX idx_analytics_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_session ON analytics_events(session_id);

-- ============================================================================
-- SECTION 13: FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
                        LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE TRIGGER trigger_generate_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL)
    EXECUTE FUNCTION generate_order_number();

-- Update product stats when review added
CREATE OR REPLACE FUNCTION update_product_review_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE products SET
            avg_rating = (SELECT AVG(rating) FROM reviews WHERE product_id = NEW.product_id AND status = 'approved'),
            review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id AND status = 'approved'),
            updated_at = NOW()
        WHERE id = NEW.product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_review_stats
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_product_review_stats();

-- Update inventory on order
CREATE OR REPLACE FUNCTION reserve_inventory_on_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Reserve inventory for new order item
    UPDATE inventory
    SET quantity_reserved = quantity_reserved + NEW.quantity
    WHERE variant_id = NEW.variant_id
    AND location_id = (SELECT id FROM inventory_locations WHERE is_default = true LIMIT 1);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reserve_inventory
    AFTER INSERT ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION reserve_inventory_on_order();

-- Log order status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO order_status_history (order_id, status, previous_status)
        VALUES (NEW.id, NEW.status, OLD.status);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_order_status
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION log_order_status_change();

-- Update customer stats on order completion
CREATE OR REPLACE FUNCTION update_customer_stats_on_order()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        UPDATE customer_profiles SET
            total_orders = total_orders + 1,
            total_spent = total_spent + NEW.grand_total,
            average_order_value = (total_spent + NEW.grand_total) / (total_orders + 1),
            last_order_at = NOW(),
            first_order_at = COALESCE(first_order_at, NOW()),
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_customer_stats
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_stats_on_order();

-- Recalculate cart totals
CREATE OR REPLACE FUNCTION recalculate_cart_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE carts SET
        subtotal = (SELECT COALESCE(SUM(line_subtotal), 0) FROM cart_items WHERE cart_id = COALESCE(NEW.cart_id, OLD.cart_id)),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.cart_id, OLD.cart_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_recalculate_cart
    AFTER INSERT OR UPDATE OR DELETE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_cart_totals();
```

---

## Complete Project Structure

```
src/
├── app/
│   ├── (shop)/                           # Customer-facing routes
│   │   ├── layout.tsx                    # Shop layout with header/footer
│   │   ├── page.tsx                      # Homepage
│   │   │
│   │   ├── products/
│   │   │   ├── page.tsx                  # Product listing (with filters)
│   │   │   └── [slug]/
│   │   │       └── page.tsx              # Product detail page
│   │   │
│   │   ├── categories/
│   │   │   └── [...slug]/
│   │   │       └── page.tsx              # Category pages (hierarchical)
│   │   │
│   │   ├── brands/
│   │   │   ├── page.tsx                  # All brands
│   │   │   └── [slug]/
│   │   │       └── page.tsx              # Brand products
│   │   │
│   │   ├── search/
│   │   │   └── page.tsx                  # Search results
│   │   │
│   │   ├── cart/
│   │   │   └── page.tsx                  # Shopping cart
│   │   │
│   │   ├── checkout/
│   │   │   ├── page.tsx                  # Checkout page
│   │   │   ├── success/page.tsx          # Order confirmation
│   │   │   └── cancel/page.tsx           # Payment cancelled
│   │   │
│   │   └── sale/
│   │       └── page.tsx                  # Sale items
│   │
│   ├── (account)/                        # Customer account (protected)
│   │   ├── layout.tsx                    # Account layout
│   │   ├── account/
│   │   │   ├── page.tsx                  # Account dashboard
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx              # Order history
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx          # Order detail
│   │   │   ├── addresses/
│   │   │   │   └── page.tsx              # Saved addresses
│   │   │   ├── wishlist/
│   │   │   │   └── page.tsx              # Wishlist
│   │   │   ├── reviews/
│   │   │   │   └── page.tsx              # My reviews
│   │   │   ├── returns/
│   │   │   │   ├── page.tsx              # Returns list
│   │   │   │   ├── new/page.tsx          # Request return
│   │   │   │   └── [id]/page.tsx         # Return detail
│   │   │   └── settings/
│   │   │       └── page.tsx              # Account settings
│   │   │
│   │   └── auth/
│   │       ├── login/page.tsx
│   │       ├── register/page.tsx
│   │       ├── forgot-password/page.tsx
│   │       └── callback/route.ts
│   │
│   ├── (admin)/                          # Admin dashboard (protected)
│   │   ├── layout.tsx                    # Admin layout
│   │   └── admin/
│   │       ├── page.tsx                  # Admin dashboard
│   │       │
│   │       ├── products/
│   │       │   ├── page.tsx              # Products list
│   │       │   ├── new/page.tsx          # Create product
│   │       │   └── [id]/
│   │       │       ├── page.tsx          # Edit product
│   │       │       └── variants/page.tsx # Manage variants
│   │       │
│   │       ├── categories/
│   │       │   ├── page.tsx              # Categories list
│   │       │   └── [id]/page.tsx         # Edit category
│   │       │
│   │       ├── orders/
│   │       │   ├── page.tsx              # Orders list
│   │       │   └── [id]/
│   │       │       └── page.tsx          # Order detail
│   │       │
│   │       ├── customers/
│   │       │   ├── page.tsx              # Customers list
│   │       │   └── [id]/
│   │       │       └── page.tsx          # Customer detail
│   │       │
│   │       ├── inventory/
│   │       │   ├── page.tsx              # Inventory overview
│   │       │   ├── locations/page.tsx    # Warehouse locations
│   │       │   └── movements/page.tsx    # Stock movements
│   │       │
│   │       ├── promotions/
│   │       │   ├── coupons/
│   │       │   │   ├── page.tsx          # Coupons list
│   │       │   │   └── [id]/page.tsx     # Edit coupon
│   │       │   └── automatic/
│   │       │       ├── page.tsx          # Auto promotions
│   │       │       └── [id]/page.tsx     # Edit promotion
│   │       │
│   │       ├── shipping/
│   │       │   ├── zones/page.tsx        # Shipping zones
│   │       │   └── methods/page.tsx      # Shipping methods
│   │       │
│   │       ├── reviews/
│   │       │   └── page.tsx              # Review moderation
│   │       │
│   │       ├── analytics/
│   │       │   ├── page.tsx              # Analytics dashboard
│   │       │   ├── sales/page.tsx        # Sales reports
│   │       │   └── products/page.tsx     # Product analytics
│   │       │
│   │       └── settings/
│   │           ├── page.tsx              # General settings
│   │           ├── users/page.tsx        # Admin users
│   │           ├── emails/page.tsx       # Email templates
│   │           └── integrations/page.tsx # Third-party integrations
│   │
│   └── api/
│       ├── products/
│       │   ├── route.ts                  # GET: list, POST: create
│       │   ├── [id]/route.ts             # GET, PUT, DELETE
│       │   ├── [id]/variants/route.ts    # Variant operations
│       │   └── search/route.ts           # Product search
│       │
│       ├── categories/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       │
│       ├── cart/
│       │   ├── route.ts                  # GET cart, POST create
│       │   ├── items/route.ts            # POST add item
│       │   ├── items/[id]/route.ts       # PUT update, DELETE remove
│       │   └── merge/route.ts            # POST merge guest cart
│       │
│       ├── checkout/
│       │   ├── init/route.ts             # Initialize checkout
│       │   ├── shipping/route.ts         # Get shipping options
│       │   ├── tax/route.ts              # Calculate tax
│       │   └── complete/route.ts         # Complete order
│       │
│       ├── orders/
│       │   ├── route.ts                  # GET list, POST create
│       │   ├── [id]/route.ts             # GET detail
│       │   ├── [id]/cancel/route.ts      # POST cancel
│       │   └── [id]/return/route.ts      # POST request return
│       │
│       ├── customers/
│       │   ├── profile/route.ts
│       │   ├── addresses/route.ts
│       │   └── addresses/[id]/route.ts
│       │
│       ├── wishlist/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       │
│       ├── reviews/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       │
│       ├── webhooks/
│       │   └── stripe/route.ts
│       │
│       ├── pricing/
│       │   ├── get-price/route.ts
│       │   └── convert/route.ts
│       │
│       └── admin/
│           ├── products/
│           │   ├── route.ts
│           │   ├── [id]/route.ts
│           │   ├── [id]/images/route.ts
│           │   └── bulk/route.ts
│           │
│           ├── orders/
│           │   ├── route.ts
│           │   ├── [id]/route.ts
│           │   ├── [id]/fulfill/route.ts
│           │   └── [id]/refund/route.ts
│           │
│           ├── customers/
│           │   ├── route.ts
│           │   └── [id]/route.ts
│           │
│           ├── inventory/
│           │   ├── route.ts
│           │   ├── adjust/route.ts
│           │   └── transfer/route.ts
│           │
│           ├── promotions/
│           │   ├── coupons/route.ts
│           │   └── automatic/route.ts
│           │
│           ├── analytics/
│           │   ├── dashboard/route.ts
│           │   ├── sales/route.ts
│           │   └── export/route.ts
│           │
│           └── settings/
│               ├── route.ts
│               └── users/route.ts
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── admin.ts                      # Service role client
│   │
│   ├── stripe/
│   │   ├── client.ts
│   │   ├── webhooks.ts
│   │   └── sync.ts                       # Product sync with Stripe
│   │
│   ├── services/
│   │   ├── product/
│   │   │   ├── product-service.ts
│   │   │   ├── variant-service.ts
│   │   │   ├── category-service.ts
│   │   │   ├── inventory-service.ts
│   │   │   └── search-service.ts
│   │   │
│   │   ├── cart/
│   │   │   ├── cart-service.ts
│   │   │   ├── cart-calculator.ts        # Price calculations
│   │   │   └── cart-validator.ts         # Stock validation
│   │   │
│   │   ├── order/
│   │   │   ├── order-service.ts
│   │   │   ├── fulfillment-service.ts
│   │   │   ├── return-service.ts
│   │   │   └── order-number-service.ts
│   │   │
│   │   ├── checkout/
│   │   │   ├── checkout-service.ts
│   │   │   ├── shipping-calculator.ts
│   │   │   └── tax-calculator.ts
│   │   │
│   │   ├── customer/
│   │   │   ├── customer-service.ts
│   │   │   ├── address-service.ts
│   │   │   └── wishlist-service.ts
│   │   │
│   │   ├── promotion/
│   │   │   ├── coupon-service.ts
│   │   │   ├── promotion-service.ts
│   │   │   └── discount-calculator.ts
│   │   │
│   │   ├── payment/
│   │   │   ├── payment-service.ts        # Your existing
│   │   │   └── refund-service.ts
│   │   │
│   │   ├── notification/
│   │   │   ├── notification-service.ts
│   │   │   ├── email-service.ts
│   │   │   └── template-service.ts
│   │   │
│   │   ├── analytics/
│   │   │   ├── analytics-service.ts
│   │   │   └── report-service.ts
│   │   │
│   │   └── media/
│   │       └── media-service.ts          # Image upload/processing
│   │
│   ├── auth/
│   │   └── session-manager.ts            # Your existing
│   │
│   ├── locale/
│   │   └── locale-service.ts             # Your existing
│   │
│   ├── pricing/
│   │   └── pricing-service.ts            # Your existing
│   │
│   └── validation/
│       ├── product-schemas.ts
│       ├── order-schemas.ts
│       ├── cart-schemas.ts
│       └── customer-schemas.ts
│
├── hooks/
│   ├── useSession.ts                     # Your existing
│   ├── useCurrency.ts                    # Your existing
│   │
│   ├── products/
│   │   ├── useProducts.ts
│   │   ├── useProduct.ts
│   │   ├── useProductVariants.ts
│   │   └── useProductFilters.ts
│   │
│   ├── cart/
│   │   ├── useCart.ts
│   │   ├── useAddToCart.ts
│   │   └── useCartCount.ts
│   │
│   ├── checkout/
│   │   ├── useCheckout.ts
│   │   └── useShippingOptions.ts
│   │
│   ├── orders/
│   │   ├── useOrders.ts
│   │   └── useOrder.ts
│   │
│   ├── customer/
│   │   ├── useAddresses.ts
│   │   └── useWishlist.ts
│   │
│   └── admin/
│       ├── useAdminProducts.ts
│       ├── useAdminOrders.ts
│       └── useAdminAnalytics.ts
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx
│   │   ├── MobileMenu.tsx
│   │   ├── SearchBar.tsx
│   │   └── CartIcon.tsx
│   │
│   ├── products/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── ProductGallery.tsx
│   │   ├── ProductInfo.tsx
│   │   ├── VariantSelector.tsx
│   │   ├── SizeSelector.tsx
│   │   ├── ColorSelector.tsx
│   │   ├── QuantitySelector.tsx
│   │   ├── AddToCartButton.tsx
│   │   ├── ProductReviews.tsx
│   │   ├── SizeChart.tsx
│   │   └── RelatedProducts.tsx
│   │
│   ├── filters/
│   │   ├── FilterSidebar.tsx
│   │   ├── CategoryFilter.tsx
│   │   ├── PriceFilter.tsx
│   │   ├── ColorFilter.tsx
│   │   ├── SizeFilter.tsx
│   │   ├── BrandFilter.tsx
│   │   ├── SortDropdown.tsx
│   │   └── ActiveFilters.tsx
│   │
│   ├── cart/
│   │   ├── CartDrawer.tsx
│   │   ├── CartItem.tsx
│   │   ├── CartSummary.tsx
│   │   ├── CartEmpty.tsx
│   │   └── CartCouponInput.tsx
│   │
│   ├── checkout/
│   │   ├── CheckoutSteps.tsx
│   │   ├── ShippingForm.tsx
│   │   ├── ShippingOptions.tsx
│   │   ├── PaymentForm.tsx               # Your existing
│   │   ├── OrderReview.tsx
│   │   └── OrderConfirmation.tsx
│   │
│   ├── account/
│   │   ├── AccountSidebar.tsx
│   │   ├── OrderList.tsx
│   │   ├── OrderDetail.tsx
│   │   ├── AddressList.tsx
│   │   ├── AddressForm.tsx
│   │   ├── WishlistGrid.tsx
│   │   └── ReviewList.tsx
│   │
│   ├── reviews/
│   │   ├── ReviewForm.tsx
│   │   ├── ReviewList.tsx
│   │   ├── ReviewItem.tsx
│   │   ├── RatingStars.tsx
│   │   └── RatingSummary.tsx
│   │
│   ├── admin/
│   │   ├── layout/
│   │   │   ├── AdminHeader.tsx
│   │   │   ├── AdminSidebar.tsx
│   │   │   └── AdminBreadcrumb.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── DashboardStats.tsx
│   │   │   ├── SalesChart.tsx
│   │   │   ├── RecentOrders.tsx
│   │   │   └── LowStockAlert.tsx
│   │   │
│   │   ├── products/
│   │   │   ├── ProductTable.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── VariantForm.tsx
│   │   │   ├── ImageUploader.tsx
│   │   │   └── BulkActions.tsx
│   │   │
│   │   ├── orders/
│   │   │   ├── OrderTable.tsx
│   │   │   ├── OrderDetail.tsx
│   │   │   ├── FulfillmentModal.tsx
│   │   │   └── RefundModal.tsx
│   │   │
│   │   ├── customers/
│   │   │   ├── CustomerTable.tsx
│   │   │   └── CustomerDetail.tsx
│   │   │
│   │   └── common/
│   │       ├── DataTable.tsx
│   │       ├── Pagination.tsx
│   │       ├── SearchInput.tsx
│   │       ├── StatusBadge.tsx
│   │       └── ConfirmModal.tsx
│   │
│   └── ui/                               # Base UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Modal.tsx
│       ├── Drawer.tsx
│       ├── Toast.tsx
│       ├── Skeleton.tsx
│       ├── Badge.tsx
│       └── ... (shadcn/ui components)
│
├── providers/
│   ├── AuthProvider.tsx                  # Your existing
│   ├── LocaleProvider.tsx                # Your existing
│   ├── CurrencyProvider.tsx              # Your existing
│   ├── CartProvider.tsx                  # Cart context
│   ├── WishlistProvider.tsx              # Wishlist context
│   └── AdminProvider.tsx                 # Admin context
│
├── types/
│   ├── database.ts                       # Generated from Supabase
│   ├── product.ts
│   ├── cart.ts
│   ├── order.ts
│   ├── customer.ts
│   ├── shipping.ts
│   └── admin.ts
│
├── constants/
│   ├── order-status.ts
│   ├── payment-status.ts
│   ├── shipping-carriers.ts
│   └── return-reasons.ts
│
└── middleware.ts                         # Auth + Admin protection
```

---

## Core Service Implementation Skeletons

### 1. Product Service (`lib/services/product/product-service.ts`)

```typescript
/**
 * Product Service
 *
 * Handles all product-related operations.
 * Used by both customer-facing and admin APIs.
 */

export class ProductService {
  private supabase: SupabaseClient;
  private pricingService: PricingService;

  // ==================== PUBLIC QUERIES ====================

  /**
   * Get products with filtering, sorting, pagination
   */
  async getProducts(params: {
    // Pagination
    page?: number;
    limit?: number;

    // Filtering
    categoryId?: string;
    categorySlug?: string;
    brandId?: string;
    brandSlug?: string;
    gender?: 'men' | 'women' | 'unisex' | 'kids';

    // Price range (in user's currency)
    minPrice?: number;
    maxPrice?: number;
    currency?: string;

    // Attributes
    colors?: string[];
    sizes?: string[];

    // Flags
    onSale?: boolean;
    isNew?: boolean;
    isFeatured?: boolean;
    inStock?: boolean;

    // Search
    search?: string;
    tags?: string[];

    // Sorting
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'rating';
  }): Promise<PaginatedResult<Product>> {
    // 1. Build base query
    // 2. Apply filters
    // 3. Apply sorting
    // 4. Apply pagination
    // 5. Transform results with prices in user's currency
  }

  /**
   * Get single product by slug
   */
  async getProductBySlug(
    slug: string,
    currency: string
  ): Promise<ProductDetail | null> {
    // 1. Fetch product with all relations
    // 2. Fetch variants with stock
    // 3. Fetch images
    // 4. Fetch reviews summary
    // 5. Fetch related products
    // 6. Convert prices to user's currency
  }

  /**
   * Get product variants with availability
   */
  async getProductVariants(
    productId: string
  ): Promise<ProductVariant[]> {
    // 1. Fetch all variants
    // 2. Check stock for each
    // 3. Return with availability status
  }

  /**
   * Search products
   */
  async searchProducts(
    query: string,
    options: SearchOptions
  ): Promise<SearchResult> {
    // 1. Full-text search on name, description
    // 2. Match on SKU
    // 3. Match on brand/category
    // 4. Score and rank results
  }

  // ==================== ADMIN OPERATIONS ====================

  /**
   * Create product
   */
  async createProduct(
    data: CreateProductInput,
    adminUserId: string
  ): Promise<Product> {
    // 1. Validate input
    // 2. Generate slug from name
    // 3. Create product
    // 4. Create variants if provided
    // 5. Sync to Stripe if needed
    // 6. Log admin activity
  }

  /**
   * Update product
   */
  async updateProduct(
    productId: string,
    data: UpdateProductInput,
    adminUserId: string
  ): Promise<Product> {
    // 1. Validate input
    // 2. Update product
    // 3. Update Stripe if prices changed
    // 4. Log admin activity
  }

  /**
   * Create product variant
   */
  async createVariant(
    productId: string,
    data: CreateVariantInput,
    adminUserId: string
  ): Promise<ProductVariant> {
    // 1. Generate SKU if not provided
    // 2. Create variant
    // 3. Initialize inventory
    // 4. Log activity
  }

  /**
   * Bulk update products
   */
  async bulkUpdateProducts(
    updates: BulkProductUpdate[],
    adminUserId: string
  ): Promise
```
