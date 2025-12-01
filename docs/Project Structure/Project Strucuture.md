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

````typescript
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

```typescript
  /**
   * Bulk update products
   */
  async bulkUpdateProducts(
    updates: BulkProductUpdate[],
    adminUserId: string
  ): Promise<BulkUpdateResult> {
    // 1. Validate all updates
    // 2. Process in transaction
    // 3. Log each change
    // 4. Return success/failure counts
  }

  /**
   * Delete product (soft delete)
   */
  async deleteProduct(
    productId: string,
    adminUserId: string
  ): Promise<void> {
    // 1. Check if product has pending orders
    // 2. Soft delete (set is_active = false)
    // 3. Archive in Stripe
    // 4. Log activity
  }

  // ==================== HELPERS ====================

  /**
   * Generate unique slug
   */
  private async generateSlug(name: string): Promise<string> {
    // 1. Convert name to slug format
    // 2. Check for existing
    // 3. Append number if needed
  }

  /**
   * Sync product to Stripe
   */
  private async syncToStripe(product: Product): Promise<void> {
    // 1. Create/update Stripe Product
    // 2. Create/update Stripe Prices for each currency
    // 3. Store Stripe IDs
  }
}
````

---

### 2. Cart Service (`lib/services/cart/cart-service.ts`)

```typescript
/**
 * Cart Service
 *
 * Manages shopping cart operations.
 * Supports both authenticated and guest users.
 * Handles cart persistence, validation, and calculations.
 */

export class CartService {
  private supabase: SupabaseClient;
  private inventoryService: InventoryService;
  private pricingService: PricingService;
  private promotionService: PromotionService;

  // ==================== CART RETRIEVAL ====================

  /**
   * Get or create cart for user/session
   */
  async getCart(params: {
    userId?: string;
    sessionId?: string;
    currency: string;
  }): Promise<Cart> {
    // 1. Find existing active cart
    // 2. If not found, create new cart
    // 3. Validate all items still available
    // 4. Recalculate totals
    // 5. Return cart with items
  }

  /**
   * Get cart with full item details
   */
  async getCartWithDetails(cartId: string): Promise<CartWithDetails> {
    // 1. Fetch cart
    // 2. Fetch items with product/variant details
    // 3. Check stock availability for each
    // 4. Flag any items with issues (out of stock, price changed)
    // 5. Calculate totals
  }

  // ==================== CART OPERATIONS ====================

  /**
   * Add item to cart
   */
  async addItem(params: {
    cartId: string;
    productId: string;
    variantId: string;
    quantity: number;
    currency: string;
  }): Promise<CartItem> {
    // 1. Validate product/variant exists and is active
    // 2. Check stock availability
    // 3. Get current price
    // 4. Check if item already in cart
    //    - If yes, update quantity
    //    - If no, add new item
    // 5. Recalculate cart totals
    // 6. Return updated item
  }

  /**
   * Update item quantity
   */
  async updateItemQuantity(params: {
    cartId: string;
    itemId: string;
    quantity: number;
  }): Promise<CartItem> {
    // 1. Validate item belongs to cart
    // 2. If quantity = 0, remove item
    // 3. Check stock availability
    // 4. Update quantity
    // 5. Recalculate cart totals
  }

  /**
   * Remove item from cart
   */
  async removeItem(params: { cartId: string; itemId: string }): Promise<void> {
    // 1. Validate item belongs to cart
    // 2. Delete item
    // 3. Recalculate cart totals
  }

  /**
   * Clear cart
   */
  async clearCart(cartId: string): Promise<void> {
    // 1. Delete all items
    // 2. Reset totals
    // 3. Remove applied coupon
  }

  /**
   * Move item to saved for later
   */
  async saveForLater(params: {
    cartId: string;
    itemId: string;
    userId: string;
  }): Promise<void> {
    // 1. Get item details
    // 2. Add to saved_items table
    // 3. Remove from cart
  }

  /**
   * Move saved item back to cart
   */
  async moveToCart(params: {
    savedItemId: string;
    userId: string;
    cartId: string;
  }): Promise<CartItem> {
    // 1. Get saved item details
    // 2. Add to cart
    // 3. Remove from saved items
  }

  // ==================== CART MERGING ====================

  /**
   * Merge guest cart into user cart after login
   */
  async mergeCarts(params: {
    guestSessionId: string;
    userId: string;
    currency: string;
  }): Promise<Cart> {
    // 1. Get guest cart
    // 2. Get or create user cart
    // 3. For each guest item:
    //    - If exists in user cart, keep higher quantity
    //    - If not exists, add to user cart
    // 4. Mark guest cart as merged
    // 5. Recalculate user cart totals
    // 6. Return merged cart
  }

  // ==================== PROMOTIONS ====================

  /**
   * Apply coupon code
   */
  async applyCoupon(params: {
    cartId: string;
    couponCode: string;
    userId?: string;
  }): Promise<ApplyCouponResult> {
    // 1. Validate coupon exists and is active
    // 2. Check coupon conditions (min amount, products, dates)
    // 3. Check user eligibility (first order, usage limit)
    // 4. Calculate discount
    // 5. Apply to cart
    // 6. Recalculate totals
    // 7. Return result with discount details
  }

  /**
   * Remove coupon
   */
  async removeCoupon(cartId: string): Promise<void> {
    // 1. Clear coupon from cart
    // 2. Recalculate totals
  }

  /**
   * Apply automatic promotions
   */
  async applyAutomaticPromotions(cartId: string): Promise<AppliedPromotion[]> {
    // 1. Get all active automatic promotions
    // 2. Check each promotion's conditions
    // 3. Apply eligible promotions (respecting priority and stacking)
    // 4. Store applied promotions
    // 5. Return list of applied promotions
  }

  // ==================== VALIDATION ====================

  /**
   * Validate cart before checkout
   */
  async validateForCheckout(cartId: string): Promise<CartValidationResult> {
    // 1. Check cart is not empty
    // 2. Validate each item:
    //    - Product still active
    //    - Variant still active
    //    - Price hasn't changed significantly
    //    - Stock available
    // 3. Validate promotions still valid
    // 4. Return validation result with any issues
  }

  /**
   * Reserve inventory for checkout
   */
  async reserveInventory(cartId: string): Promise<ReservationResult> {
    // 1. For each item, attempt to reserve stock
    // 2. If any fails, release all reservations
    // 3. Return reservation status
  }

  /**
   * Release inventory reservation
   */
  async releaseReservation(cartId: string): Promise<void> {
    // 1. Release all reserved inventory for cart
  }

  // ==================== CALCULATIONS ====================

  /**
   * Calculate cart totals
   */
  async calculateTotals(cartId: string): Promise<CartTotals> {
    // 1. Sum item subtotals
    // 2. Apply item-level discounts
    // 3. Apply cart-level discounts
    // 4. Calculate shipping (if address provided)
    // 5. Calculate tax (if address provided)
    // 6. Calculate grand total
    // 7. Update cart record
  }

  // ==================== CART CLEANUP ====================

  /**
   * Clean up abandoned carts (run via cron)
   */
  async cleanupAbandonedCarts(): Promise<number> {
    // 1. Find carts older than expiry (30 days)
    // 2. Release any inventory reservations
    // 3. Mark as abandoned or delete
    // 4. Return count of cleaned carts
  }
}
```

---

### 3. Order Service (`lib/services/order/order-service.ts`)

```typescript
/**
 * Order Service
 *
 * Handles order creation, management, and lifecycle.
 * Core business logic for the e-commerce platform.
 */

export class OrderService {
  private supabase: SupabaseClient;
  private cartService: CartService;
  private inventoryService: InventoryService;
  private paymentService: PaymentService;
  private shippingService: ShippingService;
  private notificationService: NotificationService;

  // ==================== ORDER CREATION ====================

  /**
   * Create order from cart
   */
  async createOrder(params: {
    cartId: string;
    userId: string;
    shippingAddressId: string;
    billingAddressId: string;
    shippingMethodId: string;
    paymentMethodId?: string;
    customerNotes?: string;
    isGift?: boolean;
    giftMessage?: string;
  }): Promise<Order> {
    // TRANSACTION START
    try {
      // 1. Validate cart for checkout
      const cartValidation = await this.cartService.validateForCheckout(
        params.cartId
      );
      if (!cartValidation.valid) {
        throw new OrderError("CART_INVALID", cartValidation.issues);
      }

      // 2. Get cart with full details
      const cart = await this.cartService.getCartWithDetails(params.cartId);

      // 3. Get and validate addresses
      const shippingAddress = await this.getAddress(params.shippingAddressId);
      const billingAddress = await this.getAddress(params.billingAddressId);

      // 4. Get shipping method and calculate cost
      const shippingMethod = await this.shippingService.getMethod(
        params.shippingMethodId
      );
      const shippingCost = await this.shippingService.calculateCost({
        methodId: params.shippingMethodId,
        items: cart.items,
        address: shippingAddress,
      });

      // 5. Calculate tax
      const tax = await this.calculateTax(cart, shippingAddress);

      // 6. Calculate final totals
      const totals = this.calculateOrderTotals({
        subtotal: cart.subtotal,
        discountTotal: cart.discount_total,
        shippingTotal: shippingCost,
        taxTotal: tax.amount,
      });

      // 7. Reserve inventory (final reservation)
      const reservation = await this.inventoryService.reserveForOrder(
        cart.items
      );
      if (!reservation.success) {
        throw new OrderError("INVENTORY_UNAVAILABLE", reservation.failedItems);
      }

      // 8. Create order record
      const order = await this.supabase
        .from("orders")
        .insert({
          user_id: params.userId,
          customer_email: cart.user_email,
          status: "pending",
          payment_status: "pending",
          fulfillment_status: "unfulfilled",
          currency: cart.currency,
          subtotal: totals.subtotal,
          discount_total: totals.discountTotal,
          shipping_total: totals.shippingTotal,
          tax_total: totals.taxTotal,
          grand_total: totals.grandTotal,
          shipping_address: shippingAddress,
          billing_address: billingAddress,
          shipping_method_id: params.shippingMethodId,
          shipping_method_name: shippingMethod.name,
          is_gift: params.isGift,
          gift_message: params.giftMessage,
          customer_notes: params.customerNotes,
          coupon_code: cart.applied_coupon_code,
          discount_breakdown: cart.applied_promotions,
          tax_breakdown: tax.breakdown,
        })
        .select()
        .single();

      // 9. Create order items
      await this.createOrderItems(order.data.id, cart.items);

      // 10. Mark cart as converted
      await this.cartService.convertCart(params.cartId, order.data.id);

      // 11. Record coupon usage
      if (cart.applied_coupon_code) {
        await this.recordCouponUsage(
          cart.applied_coupon_code,
          order.data.id,
          params.userId
        );
      }

      // 12. Log status history
      await this.logStatusChange(order.data.id, null, "pending", "system");

      return order.data;
    } catch (error) {
      // Release inventory on failure
      await this.inventoryService.releaseReservation(params.cartId);
      throw error;
    }
    // TRANSACTION END
  }

  /**
   * Confirm order after payment
   */
  async confirmOrder(orderId: string, paymentIntentId: string): Promise<Order> {
    // 1. Update order status
    // 2. Update payment status
    // 3. Deduct inventory (not just reserve)
    // 4. Send confirmation email
    // 5. Update customer stats
    // 6. Trigger analytics event
  }

  // ==================== ORDER QUERIES ====================

  /**
   * Get orders for customer
   */
  async getCustomerOrders(params: {
    userId: string;
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResult<Order>> {
    // 1. Query orders for user
    // 2. Include item summaries
    // 3. Apply filters and pagination
  }

  /**
   * Get single order detail
   */
  async getOrderDetail(
    orderId: string,
    userId?: string // For authorization
  ): Promise<OrderDetail> {
    // 1. Fetch order
    // 2. Verify ownership (if userId provided)
    // 3. Fetch items
    // 4. Fetch shipments
    // 5. Fetch status history
    // 6. Return full detail
  }

  /**
   * Get orders for admin
   */
  async getAdminOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    fulfillmentStatus?: string;
    dateFrom?: Date;
    dateTo?: Date;
    search?: string;
    sortBy?: string;
  }): Promise<PaginatedResult<OrderAdmin>> {
    // 1. Build query with filters
    // 2. Include customer info
    // 3. Apply sorting and pagination
  }

  // ==================== ORDER MANAGEMENT ====================

  /**
   * Update order status
   */
  async updateStatus(params: {
    orderId: string;
    status: OrderStatus;
    notes?: string;
    adminUserId?: string;
  }): Promise<Order> {
    // 1. Validate status transition
    // 2. Update order
    // 3. Log status change
    // 4. Trigger notifications based on status
  }

  /**
   * Cancel order
   */
  async cancelOrder(params: {
    orderId: string;
    reason: string;
    cancelledBy: string;
    refund?: boolean;
  }): Promise<Order> {
    // 1. Validate order can be cancelled
    // 2. Update order status
    // 3. Release inventory
    // 4. Process refund if requested
    // 5. Send cancellation email
    // 6. Log activity
  }

  /**
   * Add internal note
   */
  async addNote(params: {
    orderId: string;
    note: string;
    adminUserId: string;
  }): Promise<void> {
    // 1. Append to internal notes
    // 2. Log activity
  }

  // ==================== ORDER FULFILLMENT ====================

  /**
   * Create shipment for order
   */
  async createShipment(params: {
    orderId: string;
    items: Array<{ orderItemId: string; quantity: number }>;
    carrier: string;
    trackingNumber?: string;
    locationId: string;
    adminUserId: string;
  }): Promise<Shipment> {
    // 1. Validate items belong to order
    // 2. Validate quantities don't exceed unfulfilled
    // 3. Create shipment record
    // 4. Create shipment items
    // 5. Update order item fulfilled quantities
    // 6. Update order fulfillment status
    // 7. Deduct inventory from location
    // 8. Log activity
    // 9. Send shipping notification if tracking provided
  }

  /**
   * Update shipment tracking
   */
  async updateShipmentTracking(params: {
    shipmentId: string;
    trackingNumber: string;
    carrier: string;
    adminUserId: string;
  }): Promise<Shipment> {
    // 1. Update shipment
    // 2. Send tracking notification to customer
    // 3. Log activity
  }

  /**
   * Mark shipment as delivered
   */
  async markDelivered(params: {
    shipmentId: string;
    deliveredAt?: Date;
    signature?: string;
    photoUrl?: string;
    adminUserId: string;
  }): Promise<Shipment> {
    // 1. Update shipment status
    // 2. Check if all shipments delivered
    // 3. If yes, update order status to delivered
    // 4. Send delivery confirmation email
    // 5. Trigger review request email (delayed)
  }

  // ==================== RETURNS & REFUNDS ====================

  /**
   * Request return (customer initiated)
   */
  async requestReturn(params: {
    orderId: string;
    userId: string;
    items: Array<{
      orderItemId: string;
      quantity: number;
      reason: string;
      reasonDetails?: string;
    }>;
  }): Promise<Return> {
    // 1. Validate order belongs to user
    // 2. Validate order is delivered
    // 3. Validate return window (e.g., 30 days)
    // 4. Validate items can be returned
    // 5. Create return record
    // 6. Create return items
    // 7. Send return confirmation email
    // 8. Notify admin
  }

  /**
   * Process return (admin)
   */
  async processReturn(params: {
    returnId: string;
    action: "approve" | "reject";
    notes?: string;
    adminUserId: string;
  }): Promise<Return> {
    // If approved:
    // 1. Generate return label
    // 2. Send return instructions to customer
    // 3. Update return status
    // If rejected:
    // 1. Update status
    // 2. Send rejection email with reason
  }

  /**
   * Receive return
   */
  async receiveReturn(params: {
    returnId: string;
    items: Array<{
      returnItemId: string;
      condition: "new" | "like_new" | "used" | "damaged";
      notes?: string;
    }>;
    adminUserId: string;
  }): Promise<Return> {
    // 1. Update return item conditions
    // 2. Update return status
    // 3. Calculate refund amount based on conditions
    // 4. Return inventory if condition allows
  }

  /**
   * Complete return with refund
   */
  async completeReturn(params: {
    returnId: string;
    refundAmount: number;
    refundMethod: "original_payment" | "store_credit";
    adminUserId: string;
  }): Promise<Return> {
    // 1. Process refund
    // 2. Update return status
    // 3. Update order refund amounts
    // 4. Send refund confirmation email
    // 5. Log activity
  }

  // ==================== HELPERS ====================

  private async calculateTax(
    cart: Cart,
    shippingAddress: Address
  ): Promise<TaxResult> {
    // Use tax service to calculate
  }

  private calculateOrderTotals(params: {
    subtotal: number;
    discountTotal: number;
    shippingTotal: number;
    taxTotal: number;
  }): OrderTotals {
    return {
      subtotal: params.subtotal,
      discountTotal: params.discountTotal,
      shippingTotal: params.shippingTotal,
      taxTotal: params.taxTotal,
      grandTotal:
        params.subtotal -
        params.discountTotal +
        params.shippingTotal +
        params.taxTotal,
    };
  }

  private async createOrderItems(
    orderId: string,
    cartItems: CartItem[]
  ): Promise<void> {
    // Create order item records with product snapshots
  }

  private async logStatusChange(
    orderId: string,
    previousStatus: string | null,
    newStatus: string,
    changedBy: string
  ): Promise<void> {
    // Insert into order_status_history
  }
}
```

---

### 4. Checkout Service (`lib/services/checkout/checkout-service.ts`)

```typescript
/**
 * Checkout Service
 *
 * Orchestrates the checkout flow.
 * Coordinates between cart, payment, shipping, and order services.
 */

export class CheckoutService {
  private cartService: CartService;
  private orderService: OrderService;
  private paymentService: PaymentService;
  private shippingService: ShippingService;
  private taxService: TaxService;

  // ==================== CHECKOUT INITIALIZATION ====================

  /**
   * Initialize checkout session
   */
  async initializeCheckout(params: {
    cartId: string;
    userId: string;
    currency: string;
  }): Promise<CheckoutSession> {
    // 1. Validate cart
    const validation = await this.cartService.validateForCheckout(
      params.cartId
    );
    if (!validation.valid) {
      throw new CheckoutError("CART_INVALID", validation.issues);
    }

    // 2. Get cart with details
    const cart = await this.cartService.getCartWithDetails(params.cartId);

    // 3. Get user's saved addresses
    const addresses = await this.getCustomerAddresses(params.userId);

    // 4. Create checkout session
    const session: CheckoutSession = {
      id: generateCheckoutId(),
      cartId: params.cartId,
      userId: params.userId,
      step: "shipping",
      cart: cart,
      addresses: addresses,
      selectedShippingAddressId: addresses.defaultShipping?.id,
      selectedBillingAddressId: addresses.defaultBilling?.id,
      shippingOptions: [],
      selectedShippingMethodId: null,
      totals: {
        subtotal: cart.subtotal,
        discount: cart.discount_total,
        shipping: 0,
        tax: 0,
        total: cart.subtotal - cart.discount_total,
      },
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    };

    // 5. Store session (in database or cache)
    await this.storeCheckoutSession(session);

    return session;
  }

  // ==================== CHECKOUT STEPS ====================

  /**
   * Set shipping address
   */
  async setShippingAddress(params: {
    sessionId: string;
    addressId?: string;
    newAddress?: AddressInput;
  }): Promise<CheckoutSession> {
    // 1. Get session
    const session = await this.getCheckoutSession(params.sessionId);

    // 2. If new address, create it
    let addressId = params.addressId;
    if (params.newAddress) {
      const address = await this.createAddress(
        session.userId,
        params.newAddress
      );
      addressId = address.id;
    }

    // 3. Validate address
    const address = await this.validateAddress(addressId!);

    // 4. Update session
    session.selectedShippingAddressId = addressId;

    // 5. Get available shipping options
    session.shippingOptions = await this.shippingService.getOptionsForAddress({
      address: address,
      items: session.cart.items,
    });

    // 6. Calculate tax preview
    const taxEstimate = await this.taxService.estimate({
      items: session.cart.items,
      address: address,
    });
    session.totals.tax = taxEstimate.amount;

    // 7. Update totals
    session.totals.total = this.calculateTotal(session.totals);

    // 8. Move to shipping method step
    session.step = "shipping_method";

    await this.updateCheckoutSession(session);
    return session;
  }

  /**
   * Set shipping method
   */
  async setShippingMethod(params: {
    sessionId: string;
    shippingMethodId: string;
  }): Promise<CheckoutSession> {
    // 1. Get session
    const session = await this.getCheckoutSession(params.sessionId);

    // 2. Validate shipping method
    const method = session.shippingOptions.find(
      (o) => o.id === params.shippingMethodId
    );
    if (!method) {
      throw new CheckoutError("INVALID_SHIPPING_METHOD");
    }

    // 3. Update session
    session.selectedShippingMethodId = params.shippingMethodId;
    session.totals.shipping = method.price;
    session.estimatedDelivery = method.estimatedDelivery;

    // 4. Recalculate total
    session.totals.total = this.calculateTotal(session.totals);

    // 5. Move to payment step
    session.step = "payment";

    await this.updateCheckoutSession(session);
    return session;
  }

  /**
   * Set billing address
   */
  async setBillingAddress(params: {
    sessionId: string;
    sameAsShipping?: boolean;
    addressId?: string;
    newAddress?: AddressInput;
  }): Promise<CheckoutSession> {
    // 1. Get session
    const session = await this.getCheckoutSession(params.sessionId);

    // 2. Determine billing address
    let billingAddressId: string;
    if (params.sameAsShipping) {
      billingAddressId = session.selectedShippingAddressId!;
    } else if (params.newAddress) {
      const address = await this.createAddress(
        session.userId,
        params.newAddress,
        "billing"
      );
      billingAddressId = address.id;
    } else {
      billingAddressId = params.addressId!;
    }

    // 3. Update session
    session.selectedBillingAddressId = billingAddressId;
    session.billingAddressSameAsShipping = params.sameAsShipping ?? false;

    await this.updateCheckoutSession(session);
    return session;
  }

  /**
   * Create payment intent for checkout
   */
  async createPaymentIntent(params: {
    sessionId: string;
    idempotencyKey: string;
  }): Promise<PaymentIntentResult> {
    // 1. Get session
    const session = await this.getCheckoutSession(params.sessionId);

    // 2. Validate checkout is ready for payment
    this.validateReadyForPayment(session);

    // 3. Reserve inventory
    await this.cartService.reserveInventory(session.cartId);

    // 4. Get addresses
    const shippingAddress = await this.getAddress(
      session.selectedShippingAddressId!
    );
    const billingAddress = await this.getAddress(
      session.selectedBillingAddressId!
    );

    // 5. Create order in pending state
    const order = await this.orderService.createOrder({
      cartId: session.cartId,
      userId: session.userId,
      shippingAddressId: session.selectedShippingAddressId!,
      billingAddressId: session.selectedBillingAddressId!,
      shippingMethodId: session.selectedShippingMethodId!,
    });

    // 6. Create Stripe payment intent
    const paymentIntent = await this.paymentService.createPaymentIntent({
      orderId: order.id,
      amount: session.totals.total,
      currency: session.cart.currency,
      customerId: session.userId,
      idempotencyKey: params.idempotencyKey,
      metadata: {
        order_id: order.id,
        checkout_session_id: session.id,
      },
    });

    // 7. Update session with order reference
    session.orderId = order.id;
    session.paymentIntentId = paymentIntent.id;
    await this.updateCheckoutSession(session);

    return {
      clientSecret: paymentIntent.clientSecret,
      orderId: order.id,
    };
  }

  /**
   * Complete checkout after successful payment
   */
  async completeCheckout(params: {
    sessionId: string;
    paymentIntentId: string;
  }): Promise<OrderConfirmation> {
    // 1. Get session
    const session = await this.getCheckoutSession(params.sessionId);

    // 2. Verify payment succeeded
    const paymentVerified = await this.paymentService.verifyPayment(
      params.paymentIntentId
    );
    if (!paymentVerified) {
      throw new CheckoutError("PAYMENT_NOT_CONFIRMED");
    }

    // 3. Confirm order
    const order = await this.orderService.confirmOrder(
      session.orderId!,
      params.paymentIntentId
    );

    // 4. Clear checkout session
    await this.deleteCheckoutSession(params.sessionId);

    // 5. Return confirmation
    return {
      orderId: order.id,
      orderNumber: order.order_number,
      email: order.customer_email,
      total: order.grand_total,
      currency: order.currency,
      estimatedDelivery: order.estimated_delivery_date,
    };
  }

  // ==================== CHECKOUT RECOVERY ====================

  /**
   * Get abandoned checkout for recovery
   */
  async getAbandonedCheckout(
    sessionId: string
  ): Promise<CheckoutSession | null> {
    // 1. Get session if not expired
    // 2. Revalidate cart (items still available)
    // 3. Recalculate prices (may have changed)
    // 4. Return updated session
  }

  // ==================== HELPERS ====================

  private calculateTotal(totals: CheckoutTotals): number {
    return totals.subtotal - totals.discount + totals.shipping + totals.tax;
  }

  private validateReadyForPayment(session: CheckoutSession): void {
    if (!session.selectedShippingAddressId) {
      throw new CheckoutError("SHIPPING_ADDRESS_REQUIRED");
    }
    if (!session.selectedBillingAddressId) {
      throw new CheckoutError("BILLING_ADDRESS_REQUIRED");
    }
    if (!session.selectedShippingMethodId) {
      throw new CheckoutError("SHIPPING_METHOD_REQUIRED");
    }
  }
}
```

---

### 5. Inventory Service (`lib/services/product/inventory-service.ts`)

```typescript
/**
 * Inventory Service
 *
 * Manages stock levels, reservations, and movements.
 * Critical for preventing overselling.
 */

export class InventoryService {
  private supabase: SupabaseClient;

  // ==================== STOCK QUERIES ====================

  /**
   * Get stock for variant
   */
  async getStock(variantId: string): Promise<StockInfo> {
    // 1. Get inventory across all locations
    // 2. Sum available quantities
    // 3. Return total and by-location breakdown
  }

  /**
   * Get stock for multiple variants (batch)
   */
  async getStockBatch(variantIds: string[]): Promise<Map<string, StockInfo>> {
    // Efficiently fetch stock for multiple variants
  }

  /**
   * Check if quantity is available
   */
  async isAvailable(
    variantId: string,
    quantity: number,
    locationId?: string
  ): Promise<boolean> {
    // Check if requested quantity is available
  }

  /**
   * Get low stock items (for admin alerts)
   */
  async getLowStockItems(params: {
    locationId?: string;
    page?: number;
    limit?: number;
  }): Promise<LowStockItem[]> {
    // Get items where quantity_available <= reorder_point
  }

  // ==================== STOCK OPERATIONS ====================

  /**
   * Reserve inventory for checkout
   */
  async reserveForOrder(
    items: Array<{ variantId: string; quantity: number }>
  ): Promise<ReservationResult> {
    // TRANSACTION
    // 1. For each item:
    //    - Check available quantity
    //    - If available, increment reserved
    //    - If not available, add to failed list
    // 2. If any failed, rollback all
    // 3. Return result
  }

  /**
   * Commit reservation (convert to actual deduction)
   */
  async commitReservation(
    orderId: string,
    items: Array<{ variantId: string; quantity: number }>
  ): Promise<void> {
    // TRANSACTION
    // 1. Deduct from on_hand
    // 2. Release from reserved
    // 3. Record movement
  }

  /**
   * Release reservation (order cancelled/expired)
   */
  async releaseReservation(
    items: Array<{ variantId: string; quantity: number }>
  ): Promise<void> {
    // Decrement reserved quantity
  }

  /**
   * Adjust stock (admin operation)
   */
  async adjustStock(params: {
    variantId: string;
    locationId: string;
    adjustment: number; // Positive or negative
    reason: "count" | "damage" | "return" | "other";
    notes?: string;
    adminUserId: string;
  }): Promise<InventoryAdjustment> {
    // 1. Validate adjustment won't make stock negative
    // 2. Apply adjustment
    // 3. Record movement
    // 4. Log admin activity
  }

  /**
   * Receive stock (from purchase order)
   */
  async receiveStock(params: {
    variantId: string;
    locationId: string;
    quantity: number;
    purchaseOrderId?: string;
    notes?: string;
    adminUserId: string;
  }): Promise<void> {
    // 1. Increment on_hand
    // 2. Record movement as 'purchase'
    // 3. Update last_received_at
  }

  /**
   * Transfer stock between locations
   */
  async transferStock(params: {
    variantId: string;
    fromLocationId: string;
    toLocationId: string;
    quantity: number;
    notes?: string;
    adminUserId: string;
  }): Promise<void> {
    // TRANSACTION
    // 1. Validate source has sufficient stock
    // 2. Deduct from source location
    // 3. Add to destination location
    // 4. Record movements for both
  }

  /**
   * Return stock to inventory
   */
  async returnStock(params: {
    variantId: string;
    locationId: string;
    quantity: number;
    returnId: string;
    condition: string;
    adminUserId: string;
  }): Promise<void> {
    // 1. If condition allows, add back to inventory
    // 2. Record movement as 'return'
  }

  // ==================== MOVEMENT QUERIES ====================

  /**
   * Get movement history for variant
   */
  async getMovements(params: {
    variantId?: string;
    locationId?: string;
    movementType?: string;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<InventoryMovement>> {
    // Query movement history with filters
  }

  // ==================== HELPERS ====================

  private async recordMovement(params: {
    variantId: string;
    locationId: string;
    movementType: string;
    quantity: number;
    referenceType?: string;
    referenceId?: string;
    notes?: string;
    performedBy?: string;
  }): Promise<void> {
    // 1. Get current quantity
    // 2. Insert movement record with before/after quantities
  }
}
```

---

### 6. Promotion Service (`lib/services/promotion/promotion-service.ts`)

```typescript
/**
 * Promotion Service
 *
 * Handles coupons and automatic promotions.
 * Calculates discounts for cart items.
 */

export class PromotionService {
  private supabase: SupabaseClient;

  // ==================== COUPON VALIDATION ====================

  /**
   * Validate coupon code
   */
  async validateCoupon(params: {
    code: string;
    cartSubtotal: number;
    cartItems: CartItem[];
    userId?: string;
    currency: string;
  }): Promise<CouponValidationResult> {
    // 1. Get coupon by code
    const coupon = await this.getCouponByCode(params.code);
    if (!coupon) {
      return { valid: false, error: "INVALID_CODE" };
    }

    // 2. Check if active
    if (!coupon.is_active) {
      return { valid: false, error: "COUPON_INACTIVE" };
    }

    // 3. Check date validity
    const now = new Date();
    if (new Date(coupon.starts_at) > now) {
      return { valid: false, error: "COUPON_NOT_STARTED" };
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
      return { valid: false, error: "COUPON_EXPIRED" };
    }

    // 4. Check usage limits
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return { valid: false, error: "COUPON_MAX_USES_REACHED" };
    }

    // 5. Check per-customer usage
    if (params.userId && coupon.max_uses_per_customer) {
      const userUses = await this.getUserCouponUses(coupon.id, params.userId);
      if (userUses >= coupon.max_uses_per_customer) {
        return { valid: false, error: "COUPON_ALREADY_USED" };
      }
    }

    // 6. Check minimum order amount
    if (
      coupon.minimum_order_amount &&
      params.cartSubtotal < coupon.minimum_order_amount
    ) {
      return {
        valid: false,
        error: "MINIMUM_NOT_MET",
        minimumRequired: coupon.minimum_order_amount,
      };
    }

    // 7. Check currency (for fixed amount)
    if (
      coupon.discount_type === "fixed_amount" &&
      coupon.currency !== params.currency
    ) {
      return { valid: false, error: "CURRENCY_MISMATCH" };
    }

    // 8. Check first order only
    if (coupon.first_order_only && params.userId) {
      const hasOrders = await this.userHasOrders(params.userId);
      if (hasOrders) {
        return { valid: false, error: "FIRST_ORDER_ONLY" };
      }
    }

    // 9. Check product/category restrictions
    const eligibleItems = await this.getEligibleItems(coupon, params.cartItems);
    if (eligibleItems.length === 0) {
      return { valid: false, error: "NO_ELIGIBLE_ITEMS" };
    }

    // 10. Calculate discount
    const discount = this.calculateCouponDiscount(coupon, eligibleItems);

    return {
      valid: true,
      coupon: coupon,
      discount: discount,
      eligibleItems: eligibleItems,
    };
  }

  /**
   * Calculate discount from coupon
   */
  private calculateCouponDiscount(
    coupon: Coupon,
    eligibleItems: CartItem[]
  ): DiscountResult {
    let discountAmount = 0;
    const itemDiscounts: ItemDiscount[] = [];

    const eligibleSubtotal = eligibleItems.reduce(
      (sum, item) => sum + item.line_subtotal,
      0
    );

    switch (coupon.discount_type) {
      case "percentage":
        discountAmount = Math.round(
          eligibleSubtotal * (coupon.discount_value / 100)
        );
        // Distribute discount across items proportionally
        for (const item of eligibleItems) {
          const proportion = item.line_subtotal / eligibleSubtotal;
          itemDiscounts.push({
            itemId: item.id,
            discount: Math.round(discountAmount * proportion),
          });
        }
        break;

      case "fixed_amount":
        discountAmount = Math.min(
          coupon.discount_value * 100,
          eligibleSubtotal
        );
        // Apply to items in order until exhausted
        let remaining = discountAmount;
        for (const item of eligibleItems) {
          const itemDiscount = Math.min(remaining, item.line_subtotal);
          itemDiscounts.push({ itemId: item.id, discount: itemDiscount });
          remaining -= itemDiscount;
          if (remaining <= 0) break;
        }
        break;

      case "free_shipping":
        // Handled separately in checkout
        break;

      case "buy_x_get_y":
        // Complex logic for BOGO deals
        break;
    }

    return {
      totalDiscount: discountAmount,
      itemDiscounts,
      discountType: coupon.discount_type,
      couponCode: coupon.code,
    };
  }

  // ==================== AUTOMATIC PROMOTIONS ====================

  /**
   * Get applicable automatic promotions for cart
   */
  async getApplicablePromotions(
    cartItems: CartItem[],
    customerSegments?: string[]
  ): Promise<ApplicablePromotion[]> {
    // 1. Get all active automatic promotions
    // 2. Filter by validity dates
    // 3. Filter by customer segments
    // 4. Check product/category eligibility
    // 5. Sort by priority
    // 6. Return applicable promotions
  }

  /**
   * Calculate automatic promotion discounts
   */
  async calculateAutomaticDiscounts(
    cartItems: CartItem[],
    customerSegments?: string[]
  ): Promise<AutomaticDiscountResult> {
    // 1. Get applicable promotions
    const promotions = await this.getApplicablePromotions(
      cartItems,
      customerSegments
    );

    // 2. Apply promotions respecting stacking rules
    const appliedPromotions: AppliedPromotion[] = [];
    let totalDiscount = 0;
    let hasExclusive = false;

    for (const promo of promotions) {
      // Skip non-stackable if we already have an exclusive
      if (hasExclusive && !promo.stackable) continue;
      if (promo.exclusive && appliedPromotions.length > 0) continue;

      // Calculate discount for this promotion
      const discount = this.calculatePromotionDiscount(promo, cartItems);

      if (discount.amount > 0) {
        appliedPromotions.push({
          promotionId: promo.id,
          name: promo.name,
          discount: discount.amount,
          itemDiscounts: discount.itemDiscounts,
        });
        totalDiscount += discount.amount;

        if (promo.exclusive) {
          hasExclusive = true;
          break; // Stop processing more promotions
        }
      }
    }

    return {
      appliedPromotions,
      totalDiscount,
    };
  }

  // ==================== ADMIN OPERATIONS ====================

  /**
   * Create coupon
   */
  async createCoupon(
    data: CreateCouponInput,
    adminUserId: string
  ): Promise<Coupon> {
    // 1. Validate code is unique
    // 2. Validate dates
    // 3. Create coupon
    // 4. Log activity
  }

  /**
   * Update coupon
   */
  async updateCoupon(
    couponId: string,
    data: UpdateCouponInput,
    adminUserId: string
  ): Promise<Coupon> {
    // 1. Validate changes
    // 2. Update coupon
    // 3. Log activity
  }

  /**
   * Get coupon usage statistics
   */
  async getCouponStats(couponId: string): Promise<CouponStats> {
    // Total uses, revenue generated, average discount, etc.
  }
}
```

---

### 7. Admin Analytics Service (`lib/services/analytics/analytics-service.ts`)

```typescript
/**
 * Analytics Service
 *
 * Provides business intelligence and reporting.
 * Powers the admin dashboard and reports.
 */

export class AnalyticsService {
  private supabase: SupabaseClient;

  // ==================== DASHBOARD METRICS ====================

  /**
   * Get dashboard summary
   */
  async getDashboardSummary(params: {
    dateFrom: Date;
    dateTo: Date;
    currency: string;
    compareWithPrevious?: boolean;
  }): Promise<DashboardSummary> {
    // 1. Get current period metrics
    const current = await this.getPeriodMetrics(
      params.dateFrom,
      params.dateTo,
      params.currency
    );

    // 2. Get previous period for comparison (if requested)
    let previous: PeriodMetrics | null = null;
    if (params.compareWithPrevious) {
      const periodLength = params.dateTo.getTime() - params.dateFrom.getTime();
      const prevFrom = new Date(params.dateFrom.getTime() - periodLength);
      const prevTo = new Date(params.dateTo.getTime() - periodLength);
      previous = await this.getPeriodMetrics(prevFrom, prevTo, params.currency);
    }

    return {
      // Revenue
      totalRevenue: current.revenue,
      revenueChange: previous
        ? this.calculateChange(current.revenue, previous.revenue)
        : null,

      // Orders
      totalOrders: current.orderCount,
      ordersChange: previous
        ? this.calculateChange(current.orderCount, previous.orderCount)
        : null,

      // Average order value
      averageOrderValue: current.averageOrderValue,
      aovChange: previous
        ? this.calculateChange(
            current.averageOrderValue,
            previous.averageOrderValue
          )
        : null,

      // Customers
      newCustomers: current.newCustomers,
      newCustomersChange: previous
        ? this.calculateChange(current.newCustomers, previous.newCustomers)
        : null,
      returningCustomers: current.returningCustomers,

      // Conversion
      conversionRate: current.conversionRate,

      // Top performers
      topProducts: current.topProducts,
      topCategories: current.topCategories,
    };
  }

  /**
   * Get real-time stats
   */
  async getRealTimeStats(): Promise<RealTimeStats> {
    // 1. Active carts (last 30 minutes)
    // 2. Active checkouts
    // 3. Orders in last hour
    // 4. Revenue in last hour
    // 5. Active visitors (if tracking)
  }

  // ==================== SALES ANALYTICS ====================

  /**
   * Get sales over time
   */
  async getSalesOverTime(params: {
    dateFrom: Date;
    dateTo: Date;
    granularity: "hour" | "day" | "week" | "month";
    currency: string;
  }): Promise<SalesTimeSeries> {
    // Group by time period
    // Return revenue, orders, units sold per period
  }

  /**
   * Get sales by category
   */
  async getSalesByCategory(params: {
    dateFrom: Date;
    dateTo: Date;
    currency: string;
  }): Promise<CategorySales[]> {
    // Revenue and units by category
  }

  /**
   * Get sales by product
   */
  async getProductSales(params: {
    dateFrom: Date;
    dateTo: Date;
    currency: string;
    limit?: number;
    sortBy?: "revenue" | "units" | "orders";
  }): Promise<ProductSales[]> {
    // Top selling products
  }

  /**
   * Get sales by geography
   */
  async getSalesByCountry(params: {
    dateFrom: Date;
    dateTo: Date;
    currency: string;
  }): Promise<GeographySales[]> {
    // Revenue by shipping country
  }

  // ==================== CUSTOMER ANALYTICS ====================

  /**
   * Get customer cohort analysis
   */
  async getCustomerCohorts(params: {
    cohortBy: "month" | "week";
    metric: "retention" | "revenue";
    periods: number;
  }): Promise<CohortAnalysis> {
    // Cohort retention/revenue matrix
  }

  /**
   * Get customer lifetime value
   */
  async getCustomerLTV(params: {
    segment?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<LTVAnalysis> {
    // Average LTV, by segment, by acquisition source
  }

  /**
   * Get customer segments
   */
  async getCustomerSegments(): Promise<CustomerSegment[]> {
    // RFM analysis or custom segments
  }

  // ==================== INVENTORY ANALYTICS ====================

  /**
   * Get inventory health report
   */
  async getInventoryHealth(): Promise<InventoryHealth> {
    // 1. Out of stock items
    // 2. Low stock items
    // 3. Overstock items
    // 4. Dead stock (no sales in X days)
    // 5. Stock turnover rate
  }

  /**
   * Get inventory value
   */
  async getInventoryValue(): Promise<InventoryValue> {
    // Total inventory value at cost
    // By location, by category
  }

  // ==================== CONVERSION ANALYTICS ====================

  /**
   * Get funnel analysis
   */
  async getFunnelAnalysis(params: {
    dateFrom: Date;
    dateTo: Date;
  }): Promise<FunnelAnalysis> {
    // Product views -> Add to cart -> Checkout started -> Payment -> Completed
  }

  /**
   * Get cart abandonment analysis
   */
  async getCartAbandonment(params: {
    dateFrom: Date;
    dateTo: Date;
  }): Promise<AbandonmentAnalysis> {
    // Abandonment rate
    // Abandoned value
    // Recovery rate (if tracking)
    // Top abandoned products
  }

  // ==================== REPORT GENERATION ====================

  /**
   * Generate sales report
   */
  async generateSalesReport(params: {
    dateFrom: Date;
    dateTo: Date;
    currency: string;
    format: "json" | "csv" | "pdf";
  }): Promise<ReportResult> {
    // Compile comprehensive sales report
  }

  /**
   * Generate product performance report
   */
  async generateProductReport(params: {
    dateFrom: Date;
    dateTo: Date;
    categoryId?: string;
    format: "json" | "csv" | "pdf";
  }): Promise<ReportResult> {
    // Product sales, views, conversion, returns
  }

  // ==================== HELPERS ====================

  private async getPeriodMetrics(
    dateFrom: Date,
    dateTo: Date,
    currency: string
  ): Promise<PeriodMetrics> {
    // Query and calculate all metrics for period
  }

  private calculateChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }
}
```

---

## Key Hooks Implementation

### 1. useCart Hook (`hooks/cart/useCart.ts`)

```typescript
/**
 * Main cart hook
 *
 * Provides cart state and operations to components.
 * Handles optimistic updates for better UX.
 */

"use client";

import { useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrency } from "@/providers/CurrencyProvider";
import { useSession } from "@/hooks/useSession";

export function useCart() {
  const queryClient = useQueryClient();
  const { currency } = useCurrency();
  const { user, isAuthenticated } = useSession();
  const sessionId = useSessionId(); // For guest carts

  // ==================== QUERIES ====================

  // Fetch cart
  const {
    data: cart,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cart", user?.id || sessionId, currency],
    queryFn: async () => {
      const response = await fetch(`/api/cart?currency=${currency}`);
      if (!response.ok) throw new Error("Failed to fetch cart");
      return response.json();
    },
    staleTime: 1000 * 60, // 1 minute
  });

  // ==================== MUTATIONS ====================

  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: async (params: AddToCartParams) => {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error("Failed to add item");
      return response.json();
    },
    onMutate: async (newItem) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      // Snapshot previous value
      const previousCart = queryClient.getQueryData([
        "cart",
        user?.id || sessionId,
        currency,
      ]);

      // Optimistically update
      queryClient.setQueryData(
        ["cart", user?.id || sessionId, currency],
        (old: Cart) => ({
          ...old,
          items: [
            ...(old?.items || []),
            { ...newItem, id: "temp-" + Date.now() },
          ],
          itemCount: (old?.itemCount || 0) + newItem.quantity,
        })
      );

      return { previousCart };
    },
    onError: (err, newItem, context) => {
      // Rollback on error
      queryClient.setQueryData(
        ["cart", user?.id || sessionId, currency],
        context?.previousCart
      );
    },
    onSettled: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: string;
      quantity: number;
    }) => {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (!response.ok) throw new Error("Failed to update quantity");
      return response.json();
    },
    // Similar optimistic update pattern
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to remove item");
    },
    // Optimistic update...
  });

  // Apply coupon mutation
  const applyCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch("/api/cart/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
  });

  // ==================== COMPUTED VALUES ====================

  const itemCount = useMemo(() => {
    return (
      cart?.items?.reduce(
        (sum: number, item: CartItem) => sum + item.quantity,
        0
      ) || 0
    );
  }, [cart?.items]);

  const isEmpty = itemCount === 0;

  // ==================== ACTIONS ====================

  const addItem = useCallback(
    async (productId: string, variantId: string, quantity: number = 1) => {
      return addItemMutation.mutateAsync({ productId, variantId, quantity });
    },
    [addItemMutation]
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity < 1) {
        return removeItem(itemId);
      }
      return updateQuantityMutation.mutateAsync({ itemId, quantity });
    },
    [updateQuantityMutation]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      return removeItemMutation.mutateAsync(itemId);
    },
    [removeItemMutation]
  );

  const applyCoupon = useCallback(
    async (code: string) => {
      return applyCouponMutation.mutateAsync(code);
    },
    [applyCouponMutation]
  );

  const removeCoupon = useCallback(async () => {
    const response = await fetch("/api/cart/coupon", { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to remove coupon");
    queryClient.invalidateQueries({ queryKey: ["cart"] });
  }, [queryClient]);

  // ==================== RETURN ====================

  return {
    // State
    cart,
    items: cart?.items || [],
    itemCount,
    isEmpty,
    isLoading,
    error,

    // Totals
    subtotal: cart?.subtotal || 0,
    discount: cart?.discount_total || 0,
    total: cart?.grand_total || 0,
    appliedCoupon: cart?.applied_coupon_code,

    // Actions
    addItem,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,

    // Loading states
    isAddingItem: addItemMutation.isPending,
    isUpdating: updateQuantityMutation.isPending,
    isRemoving: removeItemMutation.isPending,
    isApplyingCoupon: applyCouponMutation.isPending,

    // Errors
    couponError: applyCouponMutation.error?.message,
  };
}

// Cart count hook (lightweight, for header)
export function useCartCount() {
  const { data } = useQuery({
    queryKey: ["cart-count"],
    queryFn: async () => {
      const response = await fetch("/api/cart/count");
      return response.json();
    },
    staleTime: 1000 * 30, // 30 seconds
  });

  return data?.count || 0;
}
```

---

### 2. useProduct Hook (`hooks/products/useProduct.ts`)

```typescript
/**
 * Product detail hook
 *
 * Fetches and manages single product state.
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCurrency } from "@/providers/CurrencyProvider";

export function useProduct(slug: string) {
  const { currency } = useCurrency();

  // Selected variant state
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});

  // Fetch product
  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", slug, currency],
    queryFn: async () => {
      const response = await fetch(
        `/api/products/${slug}?currency=${currency}`
      );
      if (!response.ok) throw new Error("Product not found");
      return response.json();
    },
  });

  // ==================== VARIANT SELECTION ====================

  // Get selected variant based on attributes
  const selectedVariant = useMemo(() => {
    if (!product?.variants) return null;

    return product.variants.find((variant: ProductVariant) => {
      return Object.entries(selectedAttributes).every(
        ([key, value]) => variant.attributes[key] === value
      );
    });
  }, [product?.variants, selectedAttributes]);

  // Get available options for each attribute
  const availableOptions = useMemo(() => {
    if (!product?.variants) return {};

    const options: Record<string, Set<string>> = {};

    for (const variant of product.variants) {
      if (!variant.is_active) continue;

      for (const [key, value] of Object.entries(variant.attributes)) {
        if (!options[key]) options[key] = new Set();
        options[key].add(value as string);
      }
    }

    // Convert sets to arrays
    return Object.fromEntries(
      Object.entries(options).map(([key, values]) => [key, Array.from(values)])
    );
  }, [product?.variants]);

  // Check if an option is available (based on current selections)
  const isOptionAvailable = useCallback(
    (attributeType: string, value: string) => {
      if (!product?.variants) return false;

      // Check if any active variant has this combination
      return product.variants.some((variant: ProductVariant) => {
        if (!variant.is_active || variant.stock_quantity <= 0) return false;
        if (variant.attributes[attributeType] !== value) return false;

        // Check if compatible with other selected attributes
        return Object.entries(selectedAttributes).every(
          ([key, val]) =>
            key === attributeType || variant.attributes[key] === val
        );
      });
    },
    [product?.variants, selectedAttributes]
  );

  // Select an attribute value
  const selectAttribute = useCallback(
    (attributeType: string, value: string) => {
      setSelectedAttributes((prev) => ({
        ...prev,
        [attributeType]: value,
      }));
    },
    []
  );

  // Reset selection
  const resetSelection = useCallback(() => {
    setSelectedAttributes({});
  }, []);

  // ==================== PRICING ====================

  const price = useMemo(() => {
    if (!product) return null;

    const basePrice = product.price;
    const variantAdjustment = selectedVariant?.price_adjustment || 0;

    return {
      amount: basePrice.amount + variantAdjustment,
      displayAmount: formatPrice(
        basePrice.amount + variantAdjustment,
        currency
      ),
      originalAmount: product.originalPrice?.amount,
      displayOriginalAmount: product.originalPrice?.displayAmount,
      isOnSale: product.is_on_sale,
      salePercentage: product.sale_percentage,
    };
  }, [product, selectedVariant, currency]);

  // ==================== STOCK ====================

  const stock = useMemo(() => {
    if (selectedVariant) {
      return {
        quantity: selectedVariant.stock_quantity,
        isInStock: selectedVariant.stock_quantity > 0,
        isLowStock:
          selectedVariant.stock_quantity <= selectedVariant.low_stock_threshold,
        allowBackorder: selectedVariant.allow_backorder,
      };
    }

    // If no variant selected, check if any variant is in stock
    if (product?.variants) {
      const totalStock = product.variants.reduce(
        (sum: number, v: ProductVariant) => sum + v.stock_quantity,
        0
      );
      return {
        quantity: totalStock,
        isInStock: totalStock > 0,
        isLowStock: false,
        allowBackorder: false,
      };
    }

    return {
      quantity: 0,
      isInStock: false,
      isLowStock: false,
      allowBackorder: false,
    };
  }, [product?.variants, selectedVariant]);

  // ==================== CAN ADD TO CART ====================

  const canAddToCart = useMemo(() => {
    if (!selectedVariant) return false;
    if (!stock.isInStock && !stock.allowBackorder) return false;
    return true;
  }, [selectedVariant, stock]);

  // ==================== RETURN ====================

  return {
    // Product data
    product,
    isLoading,
    error,

    // Variant selection
    selectedVariant,
    selectedAttributes,
    availableOptions,
    isOptionAvailable,
    selectAttribute,
    resetSelection,

    // Pricing
    price,

    // Stock
    stock,

    // Actions
    canAddToCart,

    // Related data
    images: selectedVariant?.images || product?.images || [],
    reviews: product?.reviews || [],
    relatedProducts: product?.relatedProducts || [],
  };
}
```

---

## Provider Implementations

### Cart Provider (`providers/CartProvider.tsx`)

```typescript
/**
 * Cart Provider
 *
 * Global cart state management.
 * Handles cart merging on auth state changes.
 */

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/hooks/useSession";

interface CartContextValue {
  // Cart drawer state
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Quick add feedback
  lastAddedItem: CartItem | null;
  clearLastAdded: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);

  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useSession();
  const previousAuthState = useRef(isAuthenticated);

  // ==================== CART DRAWER ====================

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  // ==================== LAST ADDED FEEDBACK ====================

  const clearLastAdded = useCallback(() => setLastAddedItem(null), []);

  // Auto-clear last added after 3 seconds
  useEffect(() => {
    if (lastAddedItem) {
      const timer = setTimeout(clearLastAdded, 3000);
      return () => clearTimeout(timer);
    }
  }, [lastAddedItem, clearLastAdded]);

  // ==================== CART MERGING ON AUTH CHANGE ====================

  useEffect(() => {
    // User just logged in
    if (isAuthenticated && !previousAuthState.current) {
      mergeGuestCart();
    }

    // User just logged out
    if (!isAuthenticated && previousAuthState.current) {
      // Clear cached cart data
      queryClient.removeQueries({ queryKey: ["cart"] });
    }

    previousAuthState.current = isAuthenticated;
  }, [isAuthenticated, queryClient]);

  const mergeGuestCart = async () => {
    const sessionId = getSessionId();
    if (!sessionId) return;

    try {
      await fetch("/api/cart/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      // Invalidate cart queries to fetch merged cart
      queryClient.invalidateQueries({ queryKey: ["cart"] });

      // Clear guest session ID
      clearSessionId();
    } catch (error) {
      console.error("Failed to merge cart:", error);
    }
  };

  // ==================== KEYBOARD SHORTCUTS ====================

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Press 'C' to toggle cart (when not in input)
      if (
        e.key === "c" &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)
      ) {
        toggleCart();
      }
      // Press 'Escape' to close cart
      if (e.key === "Escape" && isCartOpen) {
        closeCart();
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [isCartOpen, toggleCart, closeCart]);

  return (
    <CartContext.Provider
      value={{
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        lastAddedItem,
        clearLastAdded,
      }}
    >
      {children}

      {/* Cart Drawer - rendered at root */}
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />

      {/* Toast for last added item */}
      {lastAddedItem && <AddedToCartToast item={lastAddedItem} />}
    </CartContext.Provider>
  );
}

export function useCartUI() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartUI must be used within CartProvider");
  }
  return context;
}
```

---

## API Routes Summary

Here's how the key API routes should be structured:

### Products API (`app/api/products/route.ts`)

```typescript
// GET /api/products - List products with filtering
export async function GET(request: NextRequest) {
  // 1. Parse query params (filters, sorting, pagination)
  // 2. Call ProductService.getProducts()
  // 3. Return paginated results
}

// For admin: POST /api/admin/products - Create product
```

### Cart API (`app/api/cart/route.ts`)

```typescript
// GET /api/cart - Get current cart
export async function GET(request: NextRequest) {
  // 1. Get user ID from session or session ID from cookie
  // 2. Get currency from query or cookie
  // 3. Call CartService.getCart()
  // 4. Return cart with items
}
```

### Cart Items API (`app/api/cart/items/route.ts`)

```typescript
// POST /api/cart/items - Add item
export async function POST(request: NextRequest) {
  // 1. Validate request body
  // 2. Get cart ID
  // 3. Call CartService.addItem()
  // 4. Return updated item
}
```

### Checkout API (`app/api/checkout/init/route.ts`)

```typescript
// POST /api/checkout/init - Start checkout
export async function POST(request: NextRequest) {
  // 1. Require authentication
  // 2. Call CheckoutService.initializeCheckout()
  // 3. Return checkout session
}
```

---

## Middleware Configuration (`middleware.ts`)

```typescript
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Route configurations
const PUBLIC_ROUTES = [
  "/",
  "/products",
  "/categories",
  "/brands",
  "/search",
  "/sale",
  "/cart",
  "/auth/login",
  "/auth/register",
];

const PROTECTED_ROUTES = ["/account", "/checkout"];

const ADMIN_ROUTES = ["/admin"];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  // Create Supabase client
  const supabase = createServerClient(/* config with cookies */);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // ==================== PROTECTED ROUTES ====================

  if (PROTECTED_ROUTES.some((route) => path.startsWith(route))) {
    if (!session) {
      const redirectUrl = new URL("/auth/login", request.url);
      redirectUrl.searchParams.set("redirectTo", path);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // ==================== ADMIN ROUTES ====================

  if (ADMIN_ROUTES.some((route) => path.startsWith(route))) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Check admin role
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("is_active")
      .eq("user_id", session.user.id)
      .single();

    if (!adminUser?.is_active) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // ==================== GUEST SESSION ====================

  // Ensure guest session ID exists for cart
  if (!request.cookies.get("guest_session_id") && !session) {
    const guestSessionId = crypto.randomUUID();
    response.cookies.set("guest_session_id", guestSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)"],
};
```

---

## Final Checklist

### Database Setup

- [ ] Run all SQL migrations
- [ ] Seed currencies, countries, shipping zones
- [ ] Set up RLS policies
- [ ] Create database indexes
- [ ] Set up triggers and functions

### Core Services

- [ ] ProductService
- [ ] CartService
- [ ] OrderService
- [ ] CheckoutService
- [ ] InventoryService
- [ ] PromotionService
- [ ] PaymentService (existing)
- [ ] ShippingService
- [ ] NotificationService
- [ ] AnalyticsService

### API Routes

- [ ] Products CRUD
- [ ] Cart operations
- [ ] Checkout flow
- [ ] Orders management
- [ ] Customer profile
- [ ] Admin endpoints
- [ ] Webhook handlers

### Frontend

- [ ] Product listing with filters
- [ ] Product detail with variants
- [ ] Cart (drawer and page)
- [ ] Checkout flow
- [ ] Account pages
- [ ] Admin dashboard

### Testing

- [ ] Unit tests for services
- [ ] Integration tests for APIs
- [ ] E2E tests for critical flows
- [ ] Load testing for checkout

### Security

- [ ] Input validation (Zod)
- [ ] Authentication checks
- [ ] Authorization (RLS + middleware)
- [ ] Rate limiting
- [ ] CSRF protection
- [ ] XSS prevention

This architecture provides a complete, production-ready e-commerce platform. Start implementing from the database schema, then services, then API routes, and finally the frontend components. Let Claude help you build each piece!
