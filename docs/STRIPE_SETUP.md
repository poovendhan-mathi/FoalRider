# Stripe Payment Integration Setup

## Overview
Foal Rider uses Stripe for secure payment processing. This guide will help you set up Stripe integration for both test and production environments.

## Prerequisites
- Stripe account (sign up at https://stripe.com)
- Node.js 18+ and npm installed
- Foal Rider project cloned and dependencies installed

## Step 1: Create Stripe Account

1. Go to https://dashboard.stripe.com/register
2. Sign up for a free account
3. Complete the account setup process

## Step 2: Get API Keys

### Test Mode Keys (Development)
1. Navigate to https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)
4. Add to your `.env.local` file:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
```

### Live Mode Keys (Production)
1. Complete Stripe onboarding (verify business details)
2. Navigate to https://dashboard.stripe.com/apikeys
3. Copy your **Publishable key** (starts with `pk_live_`)
4. Copy your **Secret key** (starts with `sk_live_`)
5. Add to Vercel environment variables (NOT in code)

## Step 3: Set Up Webhook

Webhooks allow Stripe to notify your app about payment events (success, failure, refunds).

### Local Development (using Stripe CLI)

1. **Install Stripe CLI**
   - macOS: `brew install stripe/stripe-cli/stripe`
   - Windows: Download from https://github.com/stripe/stripe-cli/releases
   - Linux: See https://stripe.com/docs/stripe-cli

2. **Login to Stripe CLI**
   ```bash
   stripe login
   ```

3. **Forward webhook events to localhost**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Copy the webhook signing secret** (starts with `whsec_`)
   ```bash
   # Add to .env.local
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

### Production (Vercel Deployment)

1. Go to https://dashboard.stripe.com/webhooks
2. Click "+ Add endpoint"
3. Enter your endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy the "Signing secret" (starts with `whsec_`)
6. Add to Vercel environment variables

## Step 4: Test the Integration

### Test Card Numbers

Stripe provides test cards for different scenarios:

| Card Number | Scenario |
|------------|----------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 9995 | Declined |
| 4000 0000 0000 3220 | 3D Secure authentication required |
| 4000 0025 0000 3155 | Requires additional verification |

**Test Card Details:**
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

### Testing Flow

1. Start your development server: `npm run dev`
2. Start Stripe webhook forwarding: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Add products to cart
4. Go to checkout: http://localhost:3000/checkout
5. Fill in customer details
6. Use test card: `4242 4242 4242 4242`
7. Complete payment
8. Check webhook events in Stripe CLI terminal
9. Verify order in database (Supabase)

## Step 5: Currency Configuration

Stripe supports 135+ currencies. Foal Rider currently supports:
- INR (Indian Rupee) - default
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- SGD (Singapore Dollar)
- AUD (Australian Dollar)

All amounts are converted to the smallest currency unit (e.g., cents for USD, paise for INR).

## Step 6: Security Best Practices

### Environment Variables
- ✅ Store API keys in environment variables
- ❌ Never commit API keys to version control
- ✅ Use test keys in development
- ✅ Use live keys only in production

### Webhook Verification
- The webhook handler verifies signatures to prevent fraud
- Never skip signature verification in production
- Rotate webhook secrets if compromised

### Amount Validation
- Server-side amount calculation prevents tampering
- Payment intent is created server-side
- Client cannot modify the payment amount

## Step 7: Go Live Checklist

Before enabling live payments:

1. **Complete Stripe Activation**
   - Verify business details
   - Add bank account for payouts
   - Set up branding (logo, colors)

2. **Update Environment Variables**
   - Switch to live API keys
   - Update webhook endpoint in Stripe dashboard
   - Set `STRIPE_WEBHOOK_SECRET` with live webhook secret

3. **Test in Production**
   - Use live test cards before going fully live
   - Test complete purchase flow
   - Verify webhooks are received
   - Check order creation in database

4. **Monitor Payments**
   - Set up Stripe Dashboard email alerts
   - Monitor payment success/failure rates
   - Track refunds and disputes

## Troubleshooting

### "Invalid API Key" Error
- Check that keys match your environment (test vs live)
- Verify keys are set correctly in `.env.local`
- Restart Next.js dev server after changing env vars

### Webhook Not Received
- Check Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Verify webhook URL is correct
- Check webhook secret matches in `.env.local`
- Review Next.js server logs for errors

### Payment Intent Creation Failed
- Check Stripe secret key is set
- Verify amount is at least 50 (cents/paise)
- Check currency code is lowercase (e.g., 'inr', not 'INR')
- Review API logs in Stripe Dashboard

### Order Not Created After Payment
- Check webhook handler logs
- Verify Supabase connection
- Check orders table exists with correct schema
- Ensure `orderId` is passed in payment intent metadata

## Resources

- Stripe Docs: https://stripe.com/docs
- Stripe Testing Guide: https://stripe.com/docs/testing
- Stripe API Reference: https://stripe.com/docs/api
- Stripe CLI: https://stripe.com/docs/stripe-cli
- Test Cards: https://stripe.com/docs/testing#cards
- Webhook Events: https://stripe.com/docs/api/events/types

## Support

If you encounter issues:
1. Check the [Troubleshooting](#troubleshooting) section above
2. Review Stripe Dashboard logs: https://dashboard.stripe.com/logs
3. Check Stripe status page: https://status.stripe.com
4. Contact Stripe support: https://support.stripe.com

---

**Last Updated:** January 2025
**Stripe API Version:** 2024-12-18
