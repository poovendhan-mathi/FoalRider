# ✅ PHASE 1 - QUICK ACTION CHECKLIST

**Use this as your step-by-step guide to complete Phase 1**

---

## 🎯 IMMEDIATE ACTIONS NEEDED

### 1. GET YOUR CREDENTIALS (15 minutes)

📖 **Full Guide:** [docs/CREDENTIALS_GUIDE.md](./CREDENTIALS_GUIDE.md)

#### Supabase:
- [ ] Go to https://supabase.com/dashboard
- [ ] Select "Foal Rider" project
- [ ] Settings → API
- [ ] Copy these 3 values:
  - [ ] Project URL → `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] service_role secret → `SUPABASE_SERVICE_ROLE_KEY`

#### Stripe:
- [ ] Go to https://dashboard.stripe.com
- [ ] Enable TEST MODE (toggle top-right)
- [ ] Developers → API keys
- [ ] Copy these 2 values:
  - [ ] Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - [ ] Secret key → `STRIPE_SECRET_KEY`

#### Fill .env.local:
- [ ] Open `.env.local` file in project root
- [ ] Paste all credentials
- [ ] Save file
- [ ] Restart dev server if running

---

### 2. INSTALL DEPENDENCIES (10 minutes)

Open terminal and run:

```powershell
# Core dependencies for Supabase & Stripe
npm install @supabase/supabase-js @supabase/ssr @stripe/stripe-js stripe

# UI & Form libraries
npm install lucide-react clsx tailwind-merge react-hook-form zod @hookform/resolvers

# Utilities
npm install date-fns

# Dev dependencies
npm install -D @types/node
```

**Checklist:**
- [ ] All packages installed successfully
- [ ] No error messages
- [ ] `package.json` updated

---

### 3. SET UP SHADCN/UI (15 minutes)

```powershell
# Initialize shadcn/ui
npx shadcn@latest init

# Answer prompts:
# - TypeScript? Yes
# - Style? New York
# - Color? Slate  
# - CSS variables? Yes
# - Tailwind config location? Default
# - Import alias for components? @/components
# - Import alias for utils? @/lib/utils
```

**Then install essential components:**

```powershell
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add form
npx shadcn@latest add toast
npx shadcn@latest add dialog
npx shadcn@latest add badge
npx shadcn@latest add select
npx shadcn@latest add dropdown-menu
npx shadcn@latest add avatar
npx shadcn@latest add separator
npx shadcn@latest add label
```

**Checklist:**
- [ ] shadcn/ui initialized
- [ ] `components.json` created
- [ ] `lib/utils.ts` created
- [ ] All UI components installed
- [ ] `src/components/ui/` folder has components

---

### 4. CREATE FOLDER STRUCTURE (5 minutes)

```powershell
# Create all necessary folders
New-Item -ItemType Directory -Force -Path src/lib/supabase
New-Item -ItemType Directory -Force -Path src/lib/stripe
New-Item -ItemType Directory -Force -Path src/lib/utils
New-Item -ItemType Directory -Force -Path src/components/layout
New-Item -ItemType Directory -Force -Path src/components/features
New-Item -ItemType Directory -Force -Path src/components/shared
New-Item -ItemType Directory -Force -Path src/hooks
New-Item -ItemType Directory -Force -Path src/types
New-Item -ItemType Directory -Force -Path src/contexts
New-Item -ItemType Directory -Force -Path src/constants
```

**Checklist:**
- [ ] All folders created
- [ ] Structure matches documentation

---

### 5. ADD BRAND COLORS (5 minutes)

Update `src/app/globals.css`:

```css
@import "tailwindcss";

@layer base {
  :root {
    /* Foal Rider Brand Colors */
    --color-primary-50: 248 247 244;
    --color-primary-100: 240 237 229;
    --color-primary-500: 201 184 150; /* Gold */
    --color-primary-600: 180 159 122;
    --color-primary-900: 44 62 80; /* Dark Blue */
    
    --color-accent-50: 254 245 241;
    --color-accent-100: 253 233 225;
    --color-accent-500: 236 240 241;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

**Checklist:**
- [ ] Brand colors added
- [ ] File saved
- [ ] No syntax errors

---

### 6. TEST EVERYTHING (5 minutes)

```powershell
# Start development server
npm run dev
```

**Visit:** http://localhost:3000

**Checklist:**
- [ ] Server starts without errors
- [ ] Page loads successfully
- [ ] No console errors
- [ ] Hot reload working

---

### 7. COMMIT YOUR WORK (5 minutes)

```powershell
# Check what changed
git status

# Stage all changes
git add .

# Commit
git commit -m "feat: Complete Phase 1 - Dependencies, shadcn/ui, and configuration"

# Push to GitHub
git push origin main
```

**Checklist:**
- [ ] All files staged
- [ ] Commit successful
- [ ] Pushed to GitHub
- [ ] `.env.local` NOT in commit (verify!)

---

## ✅ PHASE 1 COMPLETION CHECKLIST

Before moving to Phase 2, verify:

- [ ] Environment variables set in `.env.local`
- [ ] All dependencies installed
- [ ] shadcn/ui initialized and components added
- [ ] Folder structure created
- [ ] Brand colors added to globals.css
- [ ] Development server running
- [ ] No errors in terminal or console
- [ ] Changes committed to Git
- [ ] Updated PROJECT_STATUS.md

---

## 🎉 DONE? NEXT STEPS:

1. **Update Status:** Mark Phase 1 as complete in `docs/PROJECT_STATUS.md`
2. **Move to Phase 2:** Open `docs/phases/PHASE_2_DATABASE_SETUP.md`
3. **Set up database tables** and Row Level Security

---

## 🆘 HAVING ISSUES?

### Common Problems:

**"Module not found" errors:**
```powershell
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**shadcn/ui components not working:**
```powershell
# Ensure components.json exists
# Re-run: npx shadcn@latest init
```

**Environment variables not loading:**
- Restart dev server
- Check file name is exactly `.env.local`
- Verify file is in project root

**Git push fails:**
```powershell
# Pull latest changes first
git pull origin main
# Then push
git push origin main
```

---

**Estimated Total Time:** 60-75 minutes  
**Difficulty:** Easy  
**Last Updated:** November 23, 2025
