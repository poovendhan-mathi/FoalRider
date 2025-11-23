# 🚀 Vercel Deployment Guide

## Adding Environment Variables to Vercel

### Step 1: Access Your Vercel Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **FoalRider** project
3. Click on **Settings** tab

### Step 2: Navigate to Environment Variables
1. In the Settings menu (left sidebar), click on **Environment Variables**
2. You'll see a form to add new variables

### Step 3: Add Supabase Environment Variables

Add these **3 required** environment variables one by one:

#### 1. NEXT_PUBLIC_SUPABASE_URL
```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://bmgkxhbdmoblfdsqtnlk.supabase.co
```
- ✅ Check: **Production**
- ✅ Check: **Preview**
- ✅ Check: **Development**

Click **Save**

#### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: sb_publishable_Zsfis-7V35arIxpLe3hCLw_djALbXVX
```
- ✅ Check: **Production**
- ✅ Check: **Preview**  
- ✅ Check: **Development**

Click **Save**

#### 3. SUPABASE_SERVICE_ROLE_KEY
```
Key: SUPABASE_SERVICE_ROLE_KEY
Value: sb_secret_NOjB9hL_bF00WbYWXYXfgw_vxwiWEZ5
```
- ✅ Check: **Production**
- ⚠️ **DO NOT** check Preview or Development (security best practice)

Click **Save**

### Step 4: Add Stripe Environment Variables (Optional - for Phase 6)

#### 4. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```
Key: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: [Your Stripe Publishable Key from .env.local]
```
- ✅ Check all environments
- 💡 Get this from your `.env.local` file or Stripe Dashboard

#### 5. STRIPE_SECRET_KEY
```
Key: STRIPE_SECRET_KEY
Value: [Your Stripe Secret Key from .env.local]
```
- ✅ Check: **Production**
- ⚠️ **DO NOT** check Preview or Development
- 💡 Get this from your `.env.local` file or Stripe Dashboard

---

## Visual Guide

### Where to Find Environment Variables in Vercel:

```
Vercel Dashboard
└── Your Project (FoalRider)
    └── Settings (top menu)
        └── Environment Variables (left sidebar)
            └── Add New Variable
```

### What Each Field Means:

1. **Key**: The name of the environment variable (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
2. **Value**: The actual credential/URL (copy from `.env.local`)
3. **Environments**: Where the variable should be available
   - **Production**: Live website (yourdomain.com)
   - **Preview**: PR/branch deployments
   - **Development**: When running `vercel dev` locally

---

## After Adding Variables

### 1. Redeploy Your Site
After adding all environment variables:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click the **⋯** menu (three dots)
4. Select **Redeploy**
5. ✅ Check "Use existing Build Cache" (faster)
6. Click **Redeploy**

### 2. Verify Environment Variables
To check if variables are set correctly:
```bash
# In your terminal (local)
vercel env ls
```

Or check in Vercel dashboard:
- Settings → Environment Variables → Should see all 3-5 variables listed

---

## Common Issues & Solutions

### ❌ Build Still Failing?
**Error**: `@supabase/ssr: Your project's URL and API key are required`

**Solutions**:
1. ✅ Ensure all 3 Supabase variables are added
2. ✅ Check for typos in variable **names** (must be exact)
3. ✅ Make sure "Production" environment is checked
4. ✅ Redeploy after adding variables
5. ✅ Wait 2-3 minutes for variables to propagate

### ❌ Variables Not Working in Preview?
Make sure you checked the **Preview** checkbox when adding the variable.

### ❌ Getting 401 Unauthorized Errors?
- Check that `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Verify Supabase RLS policies are enabled

---

## Security Best Practices

### ✅ DO:
- Add `NEXT_PUBLIC_*` variables to all environments (safe)
- Add secret keys (`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`) to Production only
- Use different keys for test/production (already doing this with Stripe test keys)

### ❌ DON'T:
- Share service role keys publicly
- Commit `.env.local` to Git (already in `.gitignore`)
- Use production Stripe keys in development

---

## Quick Reference

### Current Environment Variables:

| Variable | Type | Environments | Purpose |
|----------|------|--------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | All | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | All | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Production | Admin operations |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public | All | Stripe checkout (Phase 6) |
| `STRIPE_SECRET_KEY` | Secret | Production | Payment processing (Phase 6) |

---

## Need Help?

If you encounter issues:
1. Check Vercel deployment logs: Deployments → Click deployment → View logs
2. Verify `.env.local` locally: `npm run dev` should work
3. Contact support: [Vercel Support](https://vercel.com/support)

---

**Last Updated**: November 24, 2025  
**Status**: Ready for deployment after adding environment variables
