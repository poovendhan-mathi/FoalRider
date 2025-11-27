# Currency System Migration Guide

## 🎯 Overview

This migration fixes the critical currency conversion bug by:

1. Creating the `currency_rates` table in Supabase
2. Inserting correct exchange rates (INR as base)
3. Setting up proper RLS policies

## 🔧 Critical Fix Applied

### The Problem

- Exchange rates were **inverted**
- Converting ₹1000 to USD showed $83,000 instead of $12
- Root cause: Rate logic was backwards

### The Solution

**Correct rate representation**: `1 INR = X foreign currency`

**Example:**

- `1 INR = 0.012 USD` means `1 USD = 83.33 INR` (1 / 0.012)
- To convert ₹1000 to USD: `1000 × 0.012 = $12` ✅

## 📋 Migration Steps

### Step 1: Run SQL Migration

Execute the migration script in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste `migrations/001_currency_rates.sql`
4. Click **Run**

**Or use Supabase CLI:**

```bash
# If you have Supabase CLI installed
supabase db push --db-url "your-database-url"
```

### Step 2: Verify Table Creation

Check if the table was created successfully:

```sql
-- Run this in Supabase SQL Editor
SELECT * FROM currency_rates;
```

**Expected output:**

```
currency_code | rate_from_inr | is_active
--------------+---------------+-----------
INR           | 1.0           | true
USD           | 0.012         | true
EUR           | 0.011         | true
GBP           | 0.0095        | true
AUD           | 0.0182        | true
SGD           | 0.0161        | true
```

### Step 3: Test Currency Conversion

**Test API endpoint:**

```bash
# Fetch current rates
curl http://localhost:3000/api/currency
```

**Expected response:**

```json
{
  "rates": [
    {
      "currency_code": "INR",
      "rate_from_inr": "1.0",
      "is_active": true,
      "updated_at": "2025-11-27T..."
    },
    {
      "currency_code": "USD",
      "rate_from_inr": "0.012",
      "is_active": true,
      "updated_at": "2025-11-27T..."
    },
    ...
  ],
  "count": 6,
  "timestamp": "2025-11-27T..."
}
```

### Step 4: Test in Browser

1. Start your dev server: `npm run dev`
2. Navigate to any product page
3. Use the currency selector to switch currencies
4. Verify prices are correct:
   - ₹1000 INR → $12 USD ✅
   - ₹1000 INR → €11 EUR ✅
   - ₹1000 INR → £9.50 GBP ✅

## 🧪 Testing Checklist

- [ ] Migration script runs without errors
- [ ] `currency_rates` table exists in database
- [ ] 6 currencies are inserted (INR, USD, EUR, GBP, AUD, SGD)
- [ ] API endpoint `/api/currency` returns rates
- [ ] Currency selector works in UI
- [ ] Price conversions are accurate
- [ ] Cart shows correct totals in different currencies
- [ ] Checkout displays correct amounts

## 🔍 Verification Queries

**Check all rates:**

```sql
SELECT
  currency_code,
  rate_from_inr,
  ROUND(1.0 / rate_from_inr, 2) as inr_per_unit,
  is_active,
  updated_at
FROM currency_rates
ORDER BY currency_code;
```

**Verify conversion logic:**

```sql
-- Example: Convert ₹1000 to USD
SELECT
  1000 as inr_amount,
  1000 * rate_from_inr as usd_amount,
  currency_code
FROM currency_rates
WHERE currency_code = 'USD';

-- Should return: usd_amount = 12.0
```

## 🛠️ Manual Rate Updates

To update exchange rates manually:

```sql
-- Update USD rate
UPDATE currency_rates
SET rate_from_inr = 0.012, -- New rate
    updated_at = NOW()
WHERE currency_code = 'USD';
```

**Or use the API (admin only):**

```bash
curl -X POST http://localhost:3000/api/currency \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "rates": {
      "USD": 0.012,
      "EUR": 0.011,
      "GBP": 0.0095
    }
  }'
```

## 📊 Code Changes Summary

### Files Modified

1. **`src/lib/currency.ts`** ✅

   - Fixed `convertPrice()` logic
   - Corrected fallback rates
   - Added proper validation

2. **`migrations/001_currency_rates.sql`** ✅

   - Created currency_rates table
   - Inserted correct exchange rates
   - Set up RLS policies

3. **`src/app/api/currency/route.ts`** ✅
   - API for fetching rates
   - Proper error handling

### No Changes Needed

- ✅ `src/contexts/CurrencyContext.tsx` - Already correct
- ✅ `src/components/PriceDisplay.tsx` - Already correct
- ✅ `src/components/CurrencySelector.tsx` - Already correct

## 🚨 Troubleshooting

### Issue: Migration fails with "relation already exists"

**Solution:** Table already created. Verify with:

```sql
SELECT * FROM currency_rates;
```

### Issue: API returns empty rates

**Possible causes:**

1. RLS policies blocking access
2. No active rates in database
3. Supabase connection issue

**Debug:**

```sql
-- Check if rates exist
SELECT COUNT(*) FROM currency_rates WHERE is_active = true;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'currency_rates';
```

### Issue: Prices still show incorrect values

**Solutions:**

1. Clear browser cache and localStorage
2. Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
3. Check browser console for errors
4. Verify API endpoint returns correct rates

## 📈 Rate Update Schedule

**Recommended:** Update exchange rates weekly or bi-weekly

**Sources for accurate rates:**

- https://www.xe.com/
- https://www.exchangerate-api.com/
- https://openexchangerates.org/

## ✅ Success Criteria

Migration is complete when:

1. ✅ All SQL commands execute successfully
2. ✅ 6 currencies appear in database
3. ✅ API returns correct rates
4. ✅ UI currency selector works
5. ✅ Price conversions are accurate
6. ✅ No console errors

## 🎉 Completion

Once all tests pass, mark Phase 7C as complete in `PROJECT_STATUS.md`:

```markdown
### Phase 7C: Currency System Fix ✅ COMPLETED

- ✅ Created currency_rates table
- ✅ Fixed exchange rate logic
- ✅ Tested all conversions
- ✅ API endpoints working
- ✅ UI displaying correct prices
```

---

**Last Updated:** November 27, 2025  
**Status:** Ready to deploy  
**Priority:** P0 - Critical Fix
