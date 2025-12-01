# Enterprise-Grade Payment Architecture for Next.js + Stripe

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT BROWSER                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Locale    │  │  Currency   │  │   Pricing   │  │    Stripe Elements      │ │
│  │  Provider   │◄─┤  Provider   │◄─┤   Display   │  │  (Card Input/Payment)   │ │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘  └───────────┬─────────────┘ │
│         │                │                                       │               │
│         └────────────────┴───────────────────────────────────────┘               │
│                                      │                                           │
└──────────────────────────────────────┼───────────────────────────────────────────┘
                                       │ HTTPS Only
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              NEXT.JS SERVER                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                           MIDDLEWARE LAYER                                │   │
│  │  • Auth verification (from your existing session manager)                 │   │
│  │  • Rate limiting                                                          │   │
│  │  • Request validation                                                     │   │
│  │  • Geo-IP detection                                                       │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                           │
│  ┌───────────────────────────────────┼──────────────────────────────────────┐   │
│  │                         API ROUTES                                        │   │
│  │  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────────────┐  │   │
│  │  │ /api/payments/  │  │ /api/webhooks/   │  │ /api/pricing/           │  │   │
│  │  │ create-intent   │  │ stripe           │  │ get-prices              │  │   │
│  │  │ confirm         │  │ (verify sig)     │  │ convert                 │  │   │
│  │  │ refund          │  │                  │  │                         │  │   │
│  │  └────────┬────────┘  └────────┬─────────┘  └────────┬────────────────┘  │   │
│  └───────────┼────────────────────┼─────────────────────┼────────────────────┘   │
│              │                    │                     │                        │
│  ┌───────────┼────────────────────┼─────────────────────┼────────────────────┐   │
│  │           │        SERVICE LAYER                     │                    │   │
│  │  ┌────────▼────────┐  ┌───────▼────────┐  ┌─────────▼──────────────┐     │   │
│  │  │ PaymentService  │  │ WebhookService │  │ PricingService         │     │   │
│  │  │ • Idempotency   │  │ • Sig verify   │  │ • Currency conversion  │     │   │
│  │  │ • Fraud checks  │  │ • Event handle │  │ • Locale pricing       │     │   │
│  │  │ • Audit logging │  │ • Retry logic  │  │ • Tax calculation      │     │   │
│  │  └────────┬────────┘  └───────┬────────┘  └─────────┬──────────────┘     │   │
│  └───────────┼────────────────────┼─────────────────────┼────────────────────┘   │
│              │                    │                     │                        │
└──────────────┼────────────────────┼─────────────────────┼────────────────────────┘
               │                    │                     │
               ▼                    ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            EXTERNAL SERVICES                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │     STRIPE      │  │    SUPABASE     │  │     EXCHANGE RATE API           │  │
│  │  • Customers    │  │  • Users        │  │  (Optional - for real-time)     │  │
│  │  • PaymentIntent│  │  • Payments     │  │                                 │  │
│  │  • Subscriptions│  │  • Audit logs   │  │                                 │  │
│  │  • Webhooks     │  │  • Prices       │  │                                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Payment Flow Sequence

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │     │  Server  │     │  Stripe  │     │ Database │     │ Webhook  │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │                │
     │ 1. Select Plan │                │                │                │
     │ (with locale)  │                │                │                │
     ├───────────────►│                │                │                │
     │                │                │                │                │
     │                │ 2. Get price   │                │                │
     │                │ for currency   │                │                │
     │                ├───────────────►│                │                │
     │                │◄───────────────┤                │                │
     │                │                │                │                │
     │                │ 3. Create      │                │                │
     │                │ pending payment│                │                │
     │                ├────────────────────────────────►│                │
     │                │                │                │                │
     │                │ 4. Create      │                │                │
     │                │ PaymentIntent  │                │                │
     │                ├───────────────►│                │                │
     │                │◄───────────────┤                │                │
     │                │ (client_secret)│                │                │
     │                │                │                │                │
     │◄───────────────┤                │                │                │
     │ 5. Return      │                │                │                │
     │ client_secret  │                │                │                │
     │                │                │                │                │
     │ 6. Confirm     │                │                │                │
     │ Payment        │                │                │                │
     ├────────────────────────────────►│                │                │
     │                │                │                │                │
     │◄────────────────────────────────┤                │                │
     │ (Success/Fail) │                │                │                │
     │                │                │                │                │
     │                │                │ 7. Webhook:    │                │
     │                │                │ payment_intent │                │
     │                │                │ .succeeded     │                │
     │                │                ├────────────────────────────────►│
     │                │                │                │                │
     │                │                │                │ 8. Verify sig  │
     │                │                │                │ Update payment │
     │                │                │                │ status         │
     │                │                │                ├───────────────►│
     │                │                │                │                │
     │                │                │                │◄───────────────┤
     │                │                │                │                │
     │                │ 9. Query       │                │                │
     │                │ payment status │                │                │
     │                ├────────────────────────────────►│                │
     │◄───────────────┤                │                │                │
     │ 10. Confirmed! │                │                │                │
     │                │                │                │                │
```

---

## Project Structure

```
src/
├── lib/
│   ├── stripe/
│   │   ├── client.ts                 # Stripe client initialization
│   │   ├── config.ts                 # Stripe configuration
│   │   ├── customers.ts              # Customer management
│   │   ├── payment-intents.ts        # Payment intent operations
│   │   ├── webhooks.ts               # Webhook verification
│   │   └── prices.ts                 # Price/product management
│   │
│   ├── payments/
│   │   ├── payment-service.ts        # Core payment business logic
│   │   ├── idempotency.ts            # Idempotency key management
│   │   ├── fraud-detection.ts        # Basic fraud checks
│   │   ├── audit-logger.ts           # Payment audit logging
│   │   └── types.ts                  # Payment types
│   │
│   ├── pricing/
│   │   ├── pricing-service.ts        # Pricing logic
│   │   ├── currency-converter.ts     # Currency conversion
│   │   ├── locale-pricing.ts         # Locale-based pricing
│   │   ├── tax-calculator.ts         # Tax calculation
│   │   └── types.ts                  # Pricing types
│   │
│   ├── locale/
│   │   ├── locale-service.ts         # Locale detection & management
│   │   ├── country-config.ts         # Country configurations
│   │   ├── currency-config.ts        # Currency configurations
│   │   └── types.ts                  # Locale types
│   │
│   └── validation/
│       ├── payment-schemas.ts        # Zod schemas for payments
│       └── pricing-schemas.ts        # Zod schemas for pricing
│
├── providers/
│   ├── LocaleProvider.tsx            # Locale context (your existing)
│   ├── CurrencyProvider.tsx          # Currency context
│   └── StripeProvider.tsx            # Stripe Elements provider
│
├── hooks/
│   ├── useLocale.ts                  # Locale hook (your existing)
│   ├── useCurrency.ts                # Currency hook
│   ├── usePricing.ts                 # Pricing hook
│   └── usePayment.ts                 # Payment hook
│
├── components/
│   └── payment/
│       ├── PricingCard.tsx           # Shows price in user's currency
│       ├── PaymentForm.tsx           # Stripe Elements form
│       ├── PaymentStatus.tsx         # Payment status display
│       └── CurrencySelector.tsx      # Currency switcher
│
├── app/
│   ├── api/
│   │   ├── payments/
│   │   │   ├── create-intent/route.ts
│   │   │   ├── confirm/route.ts
│   │   │   └── refund/route.ts
│   │   │
│   │   ├── webhooks/
│   │   │   └── stripe/route.ts       # Stripe webhook handler
│   │   │
│   │   └── pricing/
│   │       ├── get-prices/route.ts
│   │       └── convert/route.ts
│   │
│   └── (main)/
│       ├── pricing/page.tsx
│       └── checkout/page.tsx
│
└── middleware.ts                      # Add payment-specific checks
```

---

## Database Schema (Supabase)

```sql
-- ============================================
-- CURRENCY & LOCALE TABLES
-- ============================================

-- Supported currencies with their configurations
CREATE TABLE currencies (
    code VARCHAR(3) PRIMARY KEY,           -- ISO 4217: USD, EUR, GBP, INR
    name VARCHAR(100) NOT NULL,            -- US Dollar, Euro, etc.
    symbol VARCHAR(10) NOT NULL,           -- $, €, £, ₹
    symbol_position VARCHAR(10) DEFAULT 'before', -- 'before' or 'after'
    decimal_places INTEGER DEFAULT 2,      -- Most are 2, JPY is 0
    decimal_separator VARCHAR(1) DEFAULT '.',
    thousand_separator VARCHAR(1) DEFAULT ',',
    stripe_supported BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Country configurations
CREATE TABLE countries (
    code VARCHAR(2) PRIMARY KEY,           -- ISO 3166-1 alpha-2: US, GB, IN
    name VARCHAR(100) NOT NULL,
    default_currency VARCHAR(3) REFERENCES currencies(code),
    default_locale VARCHAR(10) NOT NULL,   -- en-US, en-GB, hi-IN
    tax_rate DECIMAL(5,2) DEFAULT 0,       -- Default tax rate percentage
    stripe_supported BOOLEAN DEFAULT true,
    requires_postal_code BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exchange rates (updated periodically or use Stripe's)
CREATE TABLE exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_currency VARCHAR(3) REFERENCES currencies(code),
    target_currency VARCHAR(3) REFERENCES currencies(code),
    rate DECIMAL(20,10) NOT NULL,          -- High precision for accuracy
    source VARCHAR(50) DEFAULT 'manual',   -- 'stripe', 'api', 'manual'
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(base_currency, target_currency)
);

-- ============================================
-- PRODUCT & PRICING TABLES
-- ============================================

-- Products/Plans
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_product_id VARCHAR(255) UNIQUE, -- prod_xxx from Stripe
    name VARCHAR(255) NOT NULL,
    description TEXT,
    features JSONB DEFAULT '[]',           -- Feature list
    is_subscription BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prices in different currencies (mirrors Stripe Prices)
CREATE TABLE prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    stripe_price_id VARCHAR(255) UNIQUE,   -- price_xxx from Stripe
    currency VARCHAR(3) REFERENCES currencies(code),

    -- Amount in smallest currency unit (cents, paise, etc.)
    unit_amount INTEGER NOT NULL,

    -- For subscriptions
    recurring_interval VARCHAR(20),        -- 'month', 'year', null for one-time
    recurring_interval_count INTEGER DEFAULT 1,

    -- For display
    display_amount DECIMAL(20,2),          -- Human readable: 29.99

    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(product_id, currency, recurring_interval)
);

-- ============================================
-- CUSTOMER & PAYMENT TABLES
-- ============================================

-- Link users to Stripe customers
CREATE TABLE stripe_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    stripe_customer_id VARCHAR(255) UNIQUE NOT NULL,
    default_currency VARCHAR(3) REFERENCES currencies(code),
    default_payment_method_id VARCHAR(255),
    billing_country VARCHAR(2) REFERENCES countries(code),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments (single source of truth)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relations
    user_id UUID REFERENCES auth.users(id),
    stripe_customer_id VARCHAR(255),
    product_id UUID REFERENCES products(id),
    price_id UUID REFERENCES prices(id),

    -- Stripe references
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_charge_id VARCHAR(255),

    -- Idempotency (CRITICAL for preventing duplicate charges)
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,

    -- Amount details
    currency VARCHAR(3) REFERENCES currencies(code),
    amount INTEGER NOT NULL,               -- In smallest unit
    amount_received INTEGER,               -- Actual received

    -- Display amounts (for records)
    display_amount DECIMAL(20,2),
    display_currency VARCHAR(3),
    exchange_rate DECIMAL(20,10),          -- Rate at time of payment

    -- Tax
    tax_amount INTEGER DEFAULT 0,
    tax_rate DECIMAL(5,2),
    tax_country VARCHAR(2),

    -- Status tracking
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- Values: pending, processing, requires_action, succeeded, failed, canceled, refunded, partially_refunded

    -- Metadata
    description TEXT,
    receipt_email VARCHAR(255),
    receipt_url TEXT,

    -- Client info (for fraud detection)
    client_ip INET,
    client_user_agent TEXT,
    client_country VARCHAR(2),

    -- Error tracking
    failure_code VARCHAR(100),
    failure_message TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,

    -- Indexes for common queries
    CONSTRAINT valid_status CHECK (status IN (
        'pending', 'processing', 'requires_action',
        'succeeded', 'failed', 'canceled',
        'refunded', 'partially_refunded'
    ))
);

-- Refunds
CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    stripe_refund_id VARCHAR(255) UNIQUE,

    amount INTEGER NOT NULL,
    currency VARCHAR(3) REFERENCES currencies(code),
    reason VARCHAR(50),                    -- 'duplicate', 'fraudulent', 'requested_by_customer'
    status VARCHAR(50) NOT NULL DEFAULT 'pending',

    refunded_by UUID REFERENCES auth.users(id),
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WEBHOOK & AUDIT TABLES
-- ============================================

-- Webhook events (for idempotency and debugging)
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,

    -- Processing status
    status VARCHAR(50) DEFAULT 'pending',  -- pending, processing, processed, failed
    attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    error_message TEXT,

    -- Event data
    payload JSONB NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- Payment audit log (immutable record of all payment events)
CREATE TABLE payment_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES payments(id),

    event_type VARCHAR(100) NOT NULL,
    -- Values: created, processing, succeeded, failed, refund_initiated, refund_completed, etc.

    actor_type VARCHAR(50) NOT NULL,       -- 'user', 'system', 'stripe', 'admin'
    actor_id VARCHAR(255),                 -- user_id or 'stripe_webhook'

    previous_state JSONB,
    new_state JSONB,

    ip_address INET,
    user_agent TEXT,

    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_payment_intent ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX idx_payments_idempotency ON payments(idempotency_key);

CREATE INDEX idx_webhook_events_stripe_id ON webhook_events(stripe_event_id);
CREATE INDEX idx_webhook_events_status ON webhook_events(status);

CREATE INDEX idx_audit_log_payment ON payment_audit_log(payment_id);
CREATE INDEX idx_audit_log_created ON payment_audit_log(created_at DESC);

CREATE INDEX idx_prices_product_currency ON prices(product_id, currency);
CREATE INDEX idx_exchange_rates_pair ON exchange_rates(base_currency, target_currency);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_audit_log ENABLE ROW LEVEL SECURITY;

-- Users can only see their own payments
CREATE POLICY "Users view own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

-- Users cannot modify payments directly (only through API)
CREATE POLICY "No direct payment modification" ON payments
    FOR ALL USING (false);

-- Service role can do everything (for API routes)
CREATE POLICY "Service role full access payments" ON payments
    FOR ALL USING (auth.role() = 'service_role');

-- Similar policies for other tables...
CREATE POLICY "Users view own refunds" ON refunds
    FOR SELECT USING (
        payment_id IN (SELECT id FROM payments WHERE user_id = auth.uid())
    );

CREATE POLICY "Users view own stripe customer" ON stripe_customers
    FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_prices_updated_at
    BEFORE UPDATE ON prices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create audit log on payment changes
CREATE OR REPLACE FUNCTION log_payment_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO payment_audit_log (
            payment_id, event_type, actor_type, actor_id, new_state
        ) VALUES (
            NEW.id, 'created', 'system', 'system', to_jsonb(NEW)
        );
    ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        INSERT INTO payment_audit_log (
            payment_id, event_type, actor_type, actor_id, previous_state, new_state
        ) VALUES (
            NEW.id,
            'status_changed_to_' || NEW.status,
            'system',
            'system',
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_audit_trigger
    AFTER INSERT OR UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION log_payment_changes();
```

---

## Seed Data for Currencies & Countries

```sql
-- Insert major currencies
INSERT INTO currencies (code, name, symbol, symbol_position, decimal_places) VALUES
('USD', 'US Dollar', '$', 'before', 2),
('EUR', 'Euro', '€', 'before', 2),
('GBP', 'British Pound', '£', 'before', 2),
('INR', 'Indian Rupee', '₹', 'before', 2),
('JPY', 'Japanese Yen', '¥', 'before', 0),
('AUD', 'Australian Dollar', 'A$', 'before', 2),
('CAD', 'Canadian Dollar', 'C$', 'before', 2),
('CHF', 'Swiss Franc', 'CHF', 'after', 2),
('CNY', 'Chinese Yuan', '¥', 'before', 2),
('SGD', 'Singapore Dollar', 'S$', 'before', 2);

-- Insert major countries
INSERT INTO countries (code, name, default_currency, default_locale, tax_rate) VALUES
('US', 'United States', 'USD', 'en-US', 0),
('GB', 'United Kingdom', 'GBP', 'en-GB', 20),
('DE', 'Germany', 'EUR', 'de-DE', 19),
('FR', 'France', 'EUR', 'fr-FR', 20),
('IN', 'India', 'INR', 'en-IN', 18),
('JP', 'Japan', 'JPY', 'ja-JP', 10),
('AU', 'Australia', 'AUD', 'en-AU', 10),
('CA', 'Canada', 'CAD', 'en-CA', 5),
('SG', 'Singapore', 'SGD', 'en-SG', 8),
('CH', 'Switzerland', 'CHF', 'de-CH', 7.7);
```

---

## Implementation Skeletons

### 1. Types (`lib/payments/types.ts`)

```typescript
/**
 * Core payment types
 * All amounts are in smallest currency unit (cents, paise, etc.)
 */

export interface PaymentCreateParams {
  productId: string;
  priceId: string;
  currency: string;

  // Idempotency - CRITICAL
  idempotencyKey: string;

  // User info
  userId: string;
  email: string;

  // Locale info
  locale: string;
  country: string;

  // Optional
  metadata?: Record<string, string>;
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
}

export type PaymentStatus =
  | "pending"
  | "processing"
  | "requires_action"
  | "succeeded"
  | "failed"
  | "canceled"
  | "refunded"
  | "partially_refunded";

export interface PriceDisplay {
  amount: number; // Raw amount in smallest unit
  displayAmount: string; // Formatted: "$29.99"
  currency: string; // USD
  currencySymbol: string; // $
}

export interface LocalePricing {
  productId: string;
  prices: {
    currency: string;
    amount: number;
    displayAmount: string;
    stripePriceId: string;
  }[];
  recommendedCurrency: string; // Based on user's locale
}

// Security types
export interface PaymentSecurityContext {
  userId: string;
  ip: string;
  userAgent: string;
  country: string;
  sessionId: string;
}

export interface FraudCheckResult {
  passed: boolean;
  riskScore: number; // 0-100
  flags: string[];
  action: "allow" | "review" | "block";
}
```

---

### 2. Locale Types (`lib/locale/types.ts`)

```typescript
/**
 * Locale and currency types
 * Integrates with your existing locale system
 */

export interface LocaleConfig {
  locale: string; // en-US, de-DE
  language: string; // en, de
  country: string; // US, DE
  currency: string; // USD, EUR
  timezone: string; // America/New_York
}

export interface CurrencyConfig {
  code: string; // USD
  name: string; // US Dollar
  symbol: string; // $
  symbolPosition: "before" | "after";
  decimalPlaces: number;
  decimalSeparator: string;
  thousandSeparator: string;
}

export interface CountryConfig {
  code: string; // US
  name: string; // United States
  defaultCurrency: string; // USD
  defaultLocale: string; // en-US
  taxRate: number; // 0 (percentage)
  stripeSupported: boolean;
  requiresPostalCode: boolean;
}

// Locale detection sources (priority order)
export type LocaleSource =
  | "user_preference" // User explicitly set
  | "account_setting" // Saved in user profile
  | "url_parameter" // ?locale=de-DE
  | "cookie" // Previously detected
  | "accept_language" // Browser header
  | "geo_ip" // IP geolocation
  | "default"; // Fallback
```

---

### 3. Locale Service (`lib/locale/locale-service.ts`)

```typescript
/**
 * Locale Service
 *
 * Integrates with your existing locale detection.
 * Provides currency and country info based on locale.
 */

import {
  LocaleConfig,
  CurrencyConfig,
  CountryConfig,
  LocaleSource,
} from "./types";

export class LocaleService {
  private supabase: SupabaseClient;
  private cache: Map<string, any>;

  constructor(supabase: SupabaseClient) {
    // Initialize with Supabase client
    // Set up cache for currency/country configs
  }

  /**
   * Detect user's locale from various sources
   * Priority: user_preference > account > cookie > header > geo > default
   */
  async detectLocale(context: {
    userId?: string;
    cookies?: Record<string, string>;
    acceptLanguage?: string;
    ip?: string;
  }): Promise<{ locale: LocaleConfig; source: LocaleSource }> {
    // 1. Check user preferences in database (if logged in)
    // 2. Check cookie for previously selected locale
    // 3. Parse Accept-Language header
    // 4. Geo-IP lookup (if enabled)
    // 5. Return default locale
    // Return both the locale and where it came from (for debugging)
  }

  /**
   * Get currency configuration for a currency code
   */
  async getCurrencyConfig(currencyCode: string): Promise<CurrencyConfig> {
    // Check cache first
    // Query database
    // Fallback to USD if not found
  }

  /**
   * Get country configuration
   */
  async getCountryConfig(countryCode: string): Promise<CountryConfig> {
    // Check cache first
    // Query database
    // Fallback to US if not found
  }

  /**
   * Get recommended currency for a country
   */
  async getRecommendedCurrency(countryCode: string): Promise<string> {
    const country = await this.getCountryConfig(countryCode);
    return country.defaultCurrency;
  }

  /**
   * Validate if currency is supported for payments
   */
  async isCurrencySupported(currencyCode: string): Promise<boolean> {
    const currency = await this.getCurrencyConfig(currencyCode);
    return currency.stripeSupported && currency.isActive;
  }

  /**
   * Format amount for display in user's locale
   */
  formatAmount(
    amount: number, // In smallest unit (cents)
    currency: CurrencyConfig,
    locale: string
  ): string {
    // Convert from smallest unit to display amount
    // Use Intl.NumberFormat for proper locale formatting
    // Handle symbol position (before/after)
    // Handle decimal places (JPY has 0)

    const displayAmount = amount / Math.pow(10, currency.decimalPlaces);

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces,
    }).format(displayAmount);
  }

  /**
   * Parse display amount to smallest unit
   */
  parseAmount(displayAmount: number, currencyCode: string): number {
    // Get currency config
    // Multiply by 10^decimalPlaces
    // Round to avoid floating point issues
  }
}
```

---

### 4. Pricing Service (`lib/pricing/pricing-service.ts`)

```typescript
/**
 * Pricing Service
 *
 * Handles multi-currency pricing, conversion, and tax calculation.
 *
 * STRATEGY: You have two options for multi-currency:
 * 1. Fixed prices per currency (recommended - set in Stripe dashboard)
 * 2. Dynamic conversion (requires exchange rate API)
 *
 * This implementation supports both.
 */

export class PricingService {
  private supabase: SupabaseClient;
  private localeService: LocaleService;

  constructor(supabase: SupabaseClient, localeService: LocaleService) {
    // Initialize
  }

  /**
   * Get price for a product in user's currency
   *
   * Strategy:
   * 1. First, try to find a fixed price in the requested currency
   * 2. If not found, convert from base currency (USD)
   */
  async getPriceForCurrency(
    productId: string,
    currency: string,
    interval?: "month" | "year"
  ): Promise<PriceDisplay | null> {
    // 1. Try to find exact price match
    const exactPrice = await this.supabase
      .from("prices")
      .select("*")
      .eq("product_id", productId)
      .eq("currency", currency)
      .eq("recurring_interval", interval || null)
      .eq("is_active", true)
      .single();

    if (exactPrice.data) {
      return this.formatPrice(exactPrice.data, currency);
    }

    // 2. Convert from base currency
    const basePrice = await this.getBasePrice(productId, interval);
    if (!basePrice) return null;

    return this.convertPrice(basePrice, "USD", currency);
  }

  /**
   * Get all available prices for a product
   */
  async getProductPrices(productId: string): Promise<LocalePricing> {
    // Query all active prices for the product
    // Include Stripe price IDs
    // Format for display
  }

  /**
   * Convert price between currencies
   */
  async convertPrice(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<PriceDisplay> {
    // Get exchange rate
    const rate = await this.getExchangeRate(fromCurrency, toCurrency);

    // Convert
    const convertedAmount = Math.round(amount * rate);

    // Format for display
    const currencyConfig = await this.localeService.getCurrencyConfig(
      toCurrency
    );
    return {
      amount: convertedAmount,
      displayAmount: this.localeService.formatAmount(
        convertedAmount,
        currencyConfig,
        "en"
      ),
      currency: toCurrency,
      currencySymbol: currencyConfig.symbol,
    };
  }

  /**
   * Get exchange rate between currencies
   *
   * Sources (in order):
   * 1. Database cache (if not expired)
   * 2. Stripe's exchange rates (if using Stripe's conversion)
   * 3. External API (fallback)
   */
  async getExchangeRate(from: string, to: string): Promise<number> {
    if (from === to) return 1;

    // Check database cache
    const cached = await this.supabase
      .from("exchange_rates")
      .select("rate, expires_at")
      .eq("base_currency", from)
      .eq("target_currency", to)
      .single();

    if (cached.data && new Date(cached.data.expires_at) > new Date()) {
      return cached.data.rate;
    }

    // Fetch fresh rate
    // Option A: From external API
    // Option B: Calculate from Stripe prices

    // Update cache
    // Return rate
  }

  /**
   * Calculate tax for a purchase
   */
  async calculateTax(
    amount: number,
    currency: string,
    country: string,
    options?: {
      state?: string; // For US state tax
      postalCode?: string; // For more precise tax
      productType?: string; // Some products have different rates
    }
  ): Promise<{
    taxAmount: number;
    taxRate: number;
    taxCountry: string;
    breakdown?: TaxBreakdown[];
  }> {
    // Get country tax rate
    const countryConfig = await this.localeService.getCountryConfig(country);

    // Simple calculation (for complex tax, use Stripe Tax or TaxJar)
    const taxRate = countryConfig.taxRate;
    const taxAmount = Math.round(amount * (taxRate / 100));

    return {
      taxAmount,
      taxRate,
      taxCountry: country,
    };
  }

  /**
   * Get the final amount including tax
   */
  async calculateTotal(
    productId: string,
    currency: string,
    country: string
  ): Promise<{
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
    displayTotal: string;
  }> {
    const price = await this.getPriceForCurrency(productId, currency);
    if (!price) throw new Error("Price not found");

    const tax = await this.calculateTax(price.amount, currency, country);

    const total = price.amount + tax.taxAmount;
    const currencyConfig = await this.localeService.getCurrencyConfig(currency);

    return {
      subtotal: price.amount,
      tax: tax.taxAmount,
      total,
      currency,
      displayTotal: this.localeService.formatAmount(
        total,
        currencyConfig,
        "en"
      ),
    };
  }
}
```

---

### 5. Idempotency Service (`lib/payments/idempotency.ts`)

```typescript
/**
 * Idempotency Service
 *
 * CRITICAL for preventing duplicate charges!
 *
 * How it works:
 * 1. Client generates unique idempotency key before payment
 * 2. Server checks if this key was used before
 * 3. If used, return existing result instead of creating new payment
 * 4. If not used, process payment and store result with key
 */

export class IdempotencyService {
  private supabase: SupabaseClient;

  /**
   * Generate a new idempotency key
   * Called on client before initiating payment
   *
   * Format: {userId}_{productId}_{timestamp}_{random}
   */
  static generateKey(params: {
    userId: string;
    productId: string;
    action: string;
  }): string {
    const timestamp = Date.now();
    const random = crypto.randomUUID().slice(0, 8);
    return `${params.userId}_${params.productId}_${params.action}_${timestamp}_${random}`;
  }

  /**
   * Check if idempotency key was already used
   * Returns existing payment if found
   */
  async checkKey(key: string): Promise<{
    exists: boolean;
    existingPayment?: Payment;
    existingResult?: PaymentIntent;
  }> {
    const existing = await this.supabase
      .from("payments")
      .select("*")
      .eq("idempotency_key", key)
      .single();

    if (existing.data) {
      return {
        exists: true,
        existingPayment: existing.data,
        existingResult: {
          id: existing.data.stripe_payment_intent_id,
          clientSecret: null, // Don't expose for completed payments
          amount: existing.data.amount,
          currency: existing.data.currency,
          status: existing.data.status,
        },
      };
    }

    return { exists: false };
  }

  /**
   * Validate idempotency key format and age
   */
  validateKey(key: string): {
    valid: boolean;
    error?: string;
  } {
    if (!key || key.length < 20) {
      return { valid: false, error: "Invalid idempotency key format" };
    }

    // Extract timestamp from key
    const parts = key.split("_");
    if (parts.length < 4) {
      return { valid: false, error: "Invalid idempotency key format" };
    }

    const timestamp = parseInt(parts[3], 10);
    const age = Date.now() - timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (age > maxAge) {
      return { valid: false, error: "Idempotency key expired" };
    }

    return { valid: true };
  }
}
```

---

### 6. Fraud Detection (`lib/payments/fraud-detection.ts`)

```typescript
/**
 * Basic Fraud Detection
 *
 * For production, consider using:
 * - Stripe Radar (built-in)
 * - Custom ML models
 * - Third-party services (Sift, Forter)
 *
 * This provides basic checks as a first line of defense.
 */

export class FraudDetectionService {
  private supabase: SupabaseClient;

  /**
   * Run fraud checks before creating payment
   */
  async checkPayment(
    context: PaymentSecurityContext,
    params: {
      amount: number;
      currency: string;
      email: string;
    }
  ): Promise<FraudCheckResult> {
    const flags: string[] = [];
    let riskScore = 0;

    // Check 1: Velocity - too many payments in short time
    const velocityResult = await this.checkVelocity(context.userId);
    if (velocityResult.exceeded) {
      flags.push("velocity_exceeded");
      riskScore += 30;
    }

    // Check 2: Amount anomaly - unusually large purchase
    const amountResult = await this.checkAmountAnomaly(
      context.userId,
      params.amount
    );
    if (amountResult.anomaly) {
      flags.push("amount_anomaly");
      riskScore += 20;
    }

    // Check 3: Geo mismatch - IP country doesn't match billing country
    const geoResult = await this.checkGeoMismatch(context.ip, context.country);
    if (geoResult.mismatch) {
      flags.push("geo_mismatch");
      riskScore += 15;
    }

    // Check 4: Email domain - disposable email addresses
    const emailResult = this.checkEmailDomain(params.email);
    if (emailResult.suspicious) {
      flags.push("suspicious_email");
      riskScore += 25;
    }

    // Check 5: Account age - new accounts making large purchases
    const accountAge = await this.getAccountAge(context.userId);
    if (accountAge < 24 * 60 * 60 * 1000 && params.amount > 10000) {
      // < 24 hours
      flags.push("new_account_high_value");
      riskScore += 20;
    }

    // Check 6: Failed payment history
    const failedPayments = await this.getRecentFailedPayments(context.userId);
    if (failedPayments > 3) {
      flags.push("multiple_failed_payments");
      riskScore += 25;
    }

    // Determine action based on risk score
    let action: "allow" | "review" | "block";
    if (riskScore >= 70) {
      action = "block";
    } else if (riskScore >= 40) {
      action = "review";
    } else {
      action = "allow";
    }

    return {
      passed: action !== "block",
      riskScore,
      flags,
      action,
    };
  }

  /**
   * Check payment velocity (rate limiting)
   */
  private async checkVelocity(userId: string): Promise<{ exceeded: boolean }> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentPayments = await this.supabase
      .from("payments")
      .select("id", { count: "exact" })
      .eq("user_id", userId)
      .gte("created_at", oneHourAgo.toISOString());

    return { exceeded: (recentPayments.count || 0) >= 5 };
  }

  /**
   * Check for amount anomalies based on user history
   */
  private async checkAmountAnomaly(
    userId: string,
    amount: number
  ): Promise<{ anomaly: boolean }> {
    // Get user's average payment amount
    const avgQuery = await this.supabase
      .from("payments")
      .select("amount")
      .eq("user_id", userId)
      .eq("status", "succeeded")
      .limit(20);

    if (!avgQuery.data || avgQuery.data.length < 3) {
      // Not enough history
      return { anomaly: amount > 50000 }; // Flag if > $500 for new users
    }

    const avgAmount =
      avgQuery.data.reduce((sum, p) => sum + p.amount, 0) /
      avgQuery.data.length;

    // Flag if current amount is 5x the average
    return { anomaly: amount > avgAmount * 5 };
  }

  /**
   * Check for geographic mismatches
   */
  private async checkGeoMismatch(
    ip: string,
    billingCountry: string
  ): Promise<{ mismatch: boolean }> {
    // Use IP geolocation service
    // Compare with billing country
    // This is a simplified example

    // In production, use a service like MaxMind, ipinfo.io, etc.
    return { mismatch: false }; // Placeholder
  }

  /**
   * Check for suspicious email domains
   */
  private checkEmailDomain(email: string): { suspicious: boolean } {
    const domain = email.split("@")[1]?.toLowerCase();

    // List of known disposable email domains
    const disposableDomains = [
      "tempmail.com",
      "throwaway.email",
      "guerrillamail.com",
      "10minutemail.com",
      // ... add more
    ];

    return { suspicious: disposableDomains.includes(domain) };
  }

  // Additional helper methods...
  private async getAccountAge(userId: string): Promise<number> {}
  private async getRecentFailedPayments(userId: string): Promise<number> {}
}
```

---

### 7. Payment Service (`lib/payments/payment-service.ts`)

```typescript
/**
 * Payment Service - Core Business Logic
 *
 * Orchestrates the entire payment flow with security best practices.
 */

export class PaymentService {
  private stripe: Stripe;
  private supabase: SupabaseClient;
  private pricingService: PricingService;
  private idempotencyService: IdempotencyService;
  private fraudService: FraudDetectionService;
  private auditLogger: AuditLogger;

  constructor(deps: {
    stripe: Stripe;
    supabase: SupabaseClient;
    pricingService: PricingService;
    idempotencyService: IdempotencyService;
    fraudService: FraudDetectionService;
    auditLogger: AuditLogger;
  }) {
    // Initialize all dependencies
  }

  /**
   * Create a payment intent
   *
   * SECURITY CHECKLIST:
   * ✓ Verify user authentication
   * ✓ Check idempotency key
   * ✓ Run fraud checks
   * ✓ Validate price on server (never trust client amount)
   * ✓ Create database record BEFORE Stripe call
   * ✓ Audit log everything
   */
  async createPaymentIntent(
    params: PaymentCreateParams,
    context: PaymentSecurityContext
  ): Promise<PaymentIntent> {
    // 1. Validate idempotency key
    const idempotencyCheck = this.idempotencyService.validateKey(
      params.idempotencyKey
    );
    if (!idempotencyCheck.valid) {
      throw new PaymentError("INVALID_IDEMPOTENCY_KEY", idempotencyCheck.error);
    }

    // 2. Check for existing payment with this key
    const existingPayment = await this.idempotencyService.checkKey(
      params.idempotencyKey
    );
    if (existingPayment.exists) {
      // Return existing payment instead of creating duplicate
      await this.auditLogger.log({
        paymentId: existingPayment.existingPayment!.id,
        eventType: "idempotent_request_returned",
        actorType: "user",
        actorId: params.userId,
        metadata: { idempotencyKey: params.idempotencyKey },
      });

      return existingPayment.existingResult!;
    }

    // 3. Get and verify price from SERVER (never trust client)
    const price = await this.pricingService.getPriceForCurrency(
      params.productId,
      params.currency
    );
    if (!price) {
      throw new PaymentError("PRICE_NOT_FOUND", "Product price not available");
    }

    // 4. Calculate total with tax
    const total = await this.pricingService.calculateTotal(
      params.productId,
      params.currency,
      params.country
    );

    // 5. Run fraud checks
    const fraudCheck = await this.fraudService.checkPayment(context, {
      amount: total.total,
      currency: params.currency,
      email: params.email,
    });

    if (!fraudCheck.passed) {
      await this.auditLogger.log({
        eventType: "fraud_check_blocked",
        actorType: "system",
        actorId: "fraud_service",
        metadata: {
          userId: params.userId,
          riskScore: fraudCheck.riskScore,
          flags: fraudCheck.flags,
        },
      });

      throw new PaymentError(
        "FRAUD_DETECTED",
        "Payment blocked for security reasons"
      );
    }

    // 6. Get or create Stripe customer
    const stripeCustomerId = await this.getOrCreateStripeCustomer(
      params.userId,
      params.email,
      params.currency
    );

    // 7. Create database record FIRST (with pending status)
    const payment = await this.createPaymentRecord({
      ...params,
      stripeCustomerId,
      amount: total.total,
      taxAmount: total.tax,
      taxRate: (total.tax / total.subtotal) * 100,
      clientIp: context.ip,
      clientUserAgent: context.userAgent,
      clientCountry: context.country,
    });

    try {
      // 8. Create Stripe PaymentIntent
      const paymentIntent = await this.stripe.paymentIntents.create(
        {
          amount: total.total,
          currency: params.currency.toLowerCase(),
          customer: stripeCustomerId,

          // Security: Use automatic payment methods
          automatic_payment_methods: {
            enabled: true,
          },

          // Link to our database record
          metadata: {
            payment_id: payment.id,
            user_id: params.userId,
            product_id: params.productId,
            idempotency_key: params.idempotencyKey,
          },

          // Receipt
          receipt_email: params.email,

          // Idempotency key for Stripe
        },
        {
          idempotencyKey: params.idempotencyKey,
        }
      );

      // 9. Update database with Stripe PaymentIntent ID
      await this.supabase
        .from("payments")
        .update({
          stripe_payment_intent_id: paymentIntent.id,
          status: "processing",
        })
        .eq("id", payment.id);

      // 10. Audit log
      await this.auditLogger.log({
        paymentId: payment.id,
        eventType: "payment_intent_created",
        actorType: "user",
        actorId: params.userId,
        newState: { stripePaymentIntentId: paymentIntent.id },
        ipAddress: context.ip,
        userAgent: context.userAgent,
      });

      return {
        id: payment.id,
        clientSecret: paymentIntent.client_secret!,
        amount: total.total,
        currency: params.currency,
        status: "processing",
      };
    } catch (error) {
      // Update payment status to failed
      await this.supabase
        .from("payments")
        .update({
          status: "failed",
          failure_code: error.code,
          failure_message: error.message,
        })
        .eq("id", payment.id);

      await this.auditLogger.log({
        paymentId: payment.id,
        eventType: "payment_intent_creation_failed",
        actorType: "system",
        actorId: "stripe",
        metadata: { error: error.message },
      });

      throw new PaymentError("STRIPE_ERROR", error.message);
    }
  }

  /**
   * Process successful payment (called by webhook)
   */
  async handlePaymentSuccess(
    stripePaymentIntentId: string,
    stripeEvent: Stripe.PaymentIntent
  ): Promise<void> {
    // 1. Find our payment record
    const payment = await this.supabase
      .from("payments")
      .select("*")
      .eq("stripe_payment_intent_id", stripePaymentIntentId)
      .single();

    if (!payment.data) {
      throw new Error(`Payment not found for intent: ${stripePaymentIntentId}`);
    }

    // 2. Update payment status
    await this.supabase
      .from("payments")
      .update({
        status: "succeeded",
        amount_received: stripeEvent.amount_received,
        stripe_charge_id: stripeEvent.latest_charge as string,
        receipt_url: stripeEvent.charges?.data[0]?.receipt_url,
        completed_at: new Date().toISOString(),
      })
      .eq("id", payment.data.id);

    // 3. Fulfill the order (grant access, send email, etc.)
    await this.fulfillOrder(payment.data);

    // 4. Audit log
    await this.auditLogger.log({
      paymentId: payment.data.id,
      eventType: "payment_succeeded",
      actorType: "stripe",
      actorId: "webhook",
      newState: { status: "succeeded" },
    });
  }

  /**
   * Process failed payment (called by webhook)
   */
  async handlePaymentFailure(
    stripePaymentIntentId: string,
    stripeEvent: Stripe.PaymentIntent
  ): Promise<void> {
    // Find payment, update status, log, notify user
  }

  /**
   * Process refund
   */
  async createRefund(params: {
    paymentId: string;
    amount?: number; // Partial refund amount, null for full
    reason: "duplicate" | "fraudulent" | "requested_by_customer";
    refundedBy: string; // Admin user ID
    notes?: string;
  }): Promise<Refund> {
    // 1. Verify payment exists and is refundable
    // 2. Create Stripe refund
    // 3. Create refund record in database
    // 4. Update payment status
    // 5. Audit log
    // 6. Notify user
  }

  // Helper methods
  private async getOrCreateStripeCustomer(
    userId: string,
    email: string,
    currency: string
  ): Promise<string> {
    // Check if customer exists in database
    // If not, create in Stripe and save to database
  }

  private async createPaymentRecord(params: any): Promise<Payment> {
    // Insert pending payment record
  }

  private async fulfillOrder(payment: Payment): Promise<void> {
    // Grant access to purchased product
    // Send confirmation email
    // Update user's subscription status (if applicable)
  }
}
```

---

### 8. Webhook Handler (`lib/stripe/webhooks.ts`)

```typescript
/**
 * Stripe Webhook Handler
 *
 * SECURITY CRITICAL:
 * ✓ Always verify webhook signature
 * ✓ Process events idempotently
 * ✓ Handle retries gracefully
 * ✓ Don't trust event data - fetch from Stripe if sensitive
 */

export class WebhookService {
  private stripe: Stripe;
  private supabase: SupabaseClient;
  private paymentService: PaymentService;

  /**
   * Verify and process webhook event
   */
  async handleWebhook(
    rawBody: string,
    signature: string
  ): Promise<{ success: boolean; message: string }> {
    // 1. Verify webhook signature
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      throw new WebhookError(
        "INVALID_SIGNATURE",
        "Webhook signature verification failed"
      );
    }

    // 2. Check if event was already processed (idempotency)
    const existingEvent = await this.supabase
      .from("webhook_events")
      .select("id, status")
      .eq("stripe_event_id", event.id)
      .single();

    if (existingEvent.data?.status === "processed") {
      return { success: true, message: "Event already processed" };
    }

    // 3. Record event (with 'processing' status)
    const eventRecord = await this.supabase
      .from("webhook_events")
      .upsert({
        stripe_event_id: event.id,
        event_type: event.type,
        payload: event,
        status: "processing",
        attempts: (existingEvent.data?.attempts || 0) + 1,
        last_attempt_at: new Date().toISOString(),
      })
      .select()
      .single();

    try {
      // 4. Process event based on type
      switch (event.type) {
        case "payment_intent.succeeded":
          await this.paymentService.handlePaymentSuccess(
            (event.data.object as Stripe.PaymentIntent).id,
            event.data.object as Stripe.PaymentIntent
          );
          break;

        case "payment_intent.payment_failed":
          await this.paymentService.handlePaymentFailure(
            (event.data.object as Stripe.PaymentIntent).id,
            event.data.object as Stripe.PaymentIntent
          );
          break;

        case "charge.refunded":
          await this.handleChargeRefunded(event.data.object as Stripe.Charge);
          break;

        case "charge.dispute.created":
          await this.handleDisputeCreated(event.data.object as Stripe.Dispute);
          break;

        // Add more event handlers as needed

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      // 5. Mark event as processed
      await this.supabase
        .from("webhook_events")
        .update({
          status: "processed",
          processed_at: new Date().toISOString(),
        })
        .eq("id", eventRecord.data!.id);

      return { success: true, message: "Event processed successfully" };
    } catch (error) {
      // Mark as failed but don't throw - Stripe will retry
      await this.supabase
        .from("webhook_events")
        .update({
          status: "failed",
          error_message: error.message,
        })
        .eq("id", eventRecord.data!.id);

      // Rethrow for Stripe to retry
      throw error;
    }
  }

  private async handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
    // Update refund status in database
  }

  private async handleDisputeCreated(dispute: Stripe.Dispute): Promise<void> {
    // Alert admin, update payment status, prepare evidence
  }
}
```

---

### 9. API Route: Create Payment Intent (`app/api/payments/create-intent/route.ts`)

```typescript
/**
 * Create Payment Intent API Route
 *
 * POST /api/payments/create-intent
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Request validation schema
const createPaymentSchema = z.object({
  productId: z.string().uuid(),
  priceId: z.string().uuid(),
  currency: z.string().length(3),
  idempotencyKey: z.string().min(20).max(255),
  locale: z.string(),
  country: z.string().length(2),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user (using your existing session manager)
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Rate limiting
    const rateLimitResult = await checkRateLimit(
      session.user.id,
      "create_payment"
    );
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: { "Retry-After": rateLimitResult.retryAfter.toString() },
        }
      );
    }

    // 3. Parse and validate request body
    const body = await request.json();
    const validationResult = createPaymentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const params = validationResult.data;

    // 4. Build security context
    const securityContext: PaymentSecurityContext = {
      userId: session.user.id,
      ip: request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      country: params.country,
      sessionId: session.id,
    };

    // 5. Create payment intent through service
    const paymentService = getPaymentService(); // Factory function
    const result = await paymentService.createPaymentIntent(
      {
        ...params,
        userId: session.user.id,
        email: session.user.email,
      },
      securityContext
    );

    // 6. Return client secret (ONLY thing needed by frontend)
    return NextResponse.json({
      clientSecret: result.clientSecret,
      paymentId: result.id,
    });
  } catch (error) {
    console.error("Create payment intent error:", error);

    if (error instanceof PaymentError) {
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
```

---

### 10. API Route: Stripe Webhook (`app/api/webhooks/stripe/route.ts`)

```typescript
/**
 * Stripe Webhook Handler
 *
 * POST /api/webhooks/stripe
 *
 * CRITICAL: This route must:
 * - NOT use body parsing middleware
 * - Access raw body for signature verification
 * - Return 200 quickly (process async if needed)
 */

import { NextRequest, NextResponse } from "next/server";

// Disable body parsing for this route
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // 1. Get raw body (required for signature verification)
    const rawBody = await request.text();

    // 2. Get Stripe signature header
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    // 3. Process webhook
    const webhookService = getWebhookService();
    const result = await webhookService.handleWebhook(rawBody, signature);

    // 4. Return success immediately
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);

    if (error instanceof WebhookError) {
      // Invalid signature - don't retry
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Other errors - Stripe will retry
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
```

---

### 11. Currency Provider (`providers/CurrencyProvider.tsx`)

```typescript
/**
 * Currency Provider
 *
 * Integrates with your existing LocaleProvider.
 * Provides currency formatting and conversion utilities.
 */

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useLocale } from "./LocaleProvider"; // Your existing provider

interface CurrencyContextValue {
  currency: string;
  currencyConfig: CurrencyConfig | null;
  setCurrency: (currency: string) => void;
  formatAmount: (amount: number) => string;
  formatPrice: (price: PriceDisplay) => string;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { locale, country } = useLocale(); // From your existing provider

  const [currency, setCurrencyState] = useState<string>("USD");
  const [currencyConfig, setCurrencyConfig] = useState<CurrencyConfig | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Load currency config when currency changes
  useEffect(() => {
    async function loadCurrencyConfig() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/pricing/currency-config?code=${currency}`
        );
        const config = await response.json();
        setCurrencyConfig(config);
      } catch (error) {
        console.error("Failed to load currency config:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCurrencyConfig();
  }, [currency]);

  // Set default currency based on country
  useEffect(() => {
    async function setDefaultCurrency() {
      if (country) {
        const response = await fetch(
          `/api/pricing/recommended-currency?country=${country}`
        );
        const { currency: recommendedCurrency } = await response.json();
        setCurrencyState(recommendedCurrency);
      }
    }

    setDefaultCurrency();
  }, [country]);

  // User manually changes currency
  const setCurrency = useCallback((newCurrency: string) => {
    setCurrencyState(newCurrency);
    // Optionally save to user preferences
    localStorage.setItem("preferred_currency", newCurrency);
  }, []);

  // Format amount using locale
  const formatAmount = useCallback(
    (amount: number): string => {
      if (!currencyConfig) return `${amount}`;

      const displayAmount = amount / Math.pow(10, currencyConfig.decimalPlaces);

      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyConfig.code,
      }).format(displayAmount);
    },
    [locale, currencyConfig]
  );

  // Format price display object
  const formatPrice = useCallback(
    (price: PriceDisplay): string => {
      return formatAmount(price.amount);
    },
    [formatAmount]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencyConfig,
        setCurrency,
        formatAmount,
        formatPrice,
        isLoading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
}
```

---

### 12. Stripe Provider (`providers/StripeProvider.tsx`)

```typescript
/**
 * Stripe Elements Provider
 *
 * Wraps app with Stripe context for secure card input.
 */

"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { useState, useEffect } from "react";
import { useCurrency } from "./CurrencyProvider";
import { useLocale } from "./LocaleProvider";

// Load Stripe outside component to avoid recreating on render
let stripePromise: Promise<Stripe | null>;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

export function StripeProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  const { currency } = useCurrency();

  const [options, setOptions] = useState({
    locale: locale as any,
    appearance: {
      theme: "stripe" as const,
      variables: {
        colorPrimary: "#0066cc",
        fontFamily: "system-ui, sans-serif",
      },
    },
  });

  // Update options when locale changes
  useEffect(() => {
    setOptions((prev) => ({
      ...prev,
      locale: locale as any,
    }));
  }, [locale]);

  return (
    <Elements stripe={getStripe()} options={options}>
      {children}
    </Elements>
  );
}
```

---

### 13. Payment Form Component (`components/payment/PaymentForm.tsx`)

```typescript
/**
 * Payment Form Component
 *
 * Secure payment form using Stripe Elements.
 * Handles the entire payment flow on the client side.
 */

"use client";

import { useState, useEffect } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCurrency } from "@/providers/CurrencyProvider";
import { useSession } from "@/hooks/useSession";

interface PaymentFormProps {
  productId: string;
  priceId: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
}

export function PaymentForm({
  productId,
  priceId,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { currency } = useCurrency();
  const { user } = useSession();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Generate idempotency key once per form mount
  const [idempotencyKey] = useState(() =>
    generateIdempotencyKey(user!.id, productId, "create_payment")
  );

  // Create payment intent when form mounts
  useEffect(() => {
    async function createPaymentIntent() {
      try {
        const response = await fetch("/api/payments/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId,
            priceId,
            currency,
            idempotencyKey,
            locale: navigator.language,
            country: "US", // Get from locale provider
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to create payment");
        }

        const { clientSecret, paymentId } = await response.json();
        setClientSecret(clientSecret);
        setPaymentId(paymentId);
      } catch (error) {
        setErrorMessage(error.message);
        onError(error.message);
      }
    }

    if (user) {
      createPaymentIntent();
    }
  }, [productId, priceId, currency, idempotencyKey, user]);

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/complete?payment_id=${paymentId}`,
          receipt_email: user!.email,
        },
        redirect: "if_required", // Only redirect for 3D Secure
      });

      if (error) {
        // Payment failed
        setErrorMessage(error.message || "Payment failed");
        onError(error.message || "Payment failed");
      } else if (paymentIntent.status === "succeeded") {
        // Payment succeeded without redirect
        onSuccess(paymentId!);
      } else if (paymentIntent.status === "processing") {
        // Payment processing
        onSuccess(paymentId!);
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred");
      onError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!clientSecret) {
    return <PaymentFormSkeleton />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Stripe Payment Element - handles all payment methods */}
      <PaymentElement
        options={{
          layout: "tabs",
          paymentMethodOrder: ["card", "apple_pay", "google_pay"],
        }}
      />

      {errorMessage && (
        <div className="text-red-600 text-sm">{errorMessage}</div>
      )}

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg disabled:opacity-50"
      >
        {isLoading ? "Processing..." : "Pay Now"}
      </button>

      {/* Security badges */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
        <span>🔒 Secure payment by Stripe</span>
        <span>256-bit SSL encryption</span>
      </div>
    </form>
  );
}
```
