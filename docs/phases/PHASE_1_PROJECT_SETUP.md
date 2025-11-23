# 🚀 PHASE 1: PROJECT SETUP

**Duration:** 2-3 hours  
**Status:** ✅ Complete (100%)  
**Dependencies:** None (Prerequisites completed)

---

## 📊 CURRENT STATUS SUMMARY

### ✅ What's Already Done:
- ✅ Next.js 16.0.3 project initialized
- ✅ TypeScript configured
- ✅ Tailwind CSS 4 installed
- ✅ Git repository connected to GitHub
- ✅ `.gitignore` properly configured
- ✅ Environment files created and credentials filled
- ✅ Supabase keys configured (new publishable/secret format)
- ✅ Stripe test keys configured

### 🎯 What You Need to Do:
1. **Install dependencies** (Supabase, Stripe, shadcn/ui, etc.)
2. **Set up shadcn/ui** components
3. **Create folder structure** (lib, components, hooks, etc.)
4. **Add brand colors** to Tailwind
5. **Commit changes** to Git

---

## 📋 OVERVIEW

This phase covers the initial project setup, including Next.js installation, dependency configuration, and basic project structure creation.

---

## 🎯 OBJECTIVES

- [ ] Initialize Next.js 15 project with App Router
- [ ] Install and configure Tailwind CSS
- [ ] Set up shadcn/ui component library
- [ ] Configure TypeScript
- [ ] Install required dependencies
- [ ] Set up environment variables
- [ ] Create project folder structure
- [ ] Configure ESLint and Prettier

---

## 📊 PHASE STATUS

| Task | Status | Time Spent | Notes |
|------|--------|------------|-------|
| 1.1 Create Next.js Project | ✅ | - | Next.js 16 already initialized |
| 1.2 Install Core Dependencies | ⏳ | - | Need Supabase, Stripe, etc. |
| 1.3 Configure Tailwind CSS | ✅ | - | Tailwind 4 configured |
| 1.4 Initialize shadcn/ui | ⏳ | - | Not yet installed |
| 1.5 Install UI Components | ⏳ | - | Depends on 1.4 |
| 1.6 Set Up Environment Variables | ✅ | - | Credentials configured |
| 1.7 Create Folder Structure | ⏳ | - | Basic structure exists |
| 1.8 Configure Git | ✅ | - | Git initialized and pushing to GitHub |

**Progress:** 4/8 tasks completed (50%)

---

## 🛠️ STEP 1.1: CREATE NEXT.JS PROJECT

### ✅ ALREADY COMPLETED

The Next.js project has been successfully created with the following:
- ✅ Next.js 16.0.3 installed
- ✅ TypeScript configured
- ✅ App Router enabled
- ✅ src directory structure
- ✅ Import alias `@/*` configured

### Current Setup
```json
{
  "name": "foalrider",
  "version": "0.1.0",
  "dependencies": {
    "next": "16.0.3",
    "react": "19.2.0",
    "react-dom": "19.2.0"
  }
}
```

### ✅ Checklist
- [x] Verify Next.js 15+ is installed (✅ v16.0.3)
- [x] Confirm TypeScript is configured
- [x] Check App Router is enabled
- [x] Verify src directory structure

### Expected Output
```
✓ Next.js 16.0.3 installed
✓ TypeScript configured
✓ Tailwind CSS configured
✓ ESLint configured
✓ App Router enabled
```

### 🎯 Action Required: NONE - This step is complete!

---

## 🛠️ STEP 1.2: INSTALL CORE DEPENDENCIES

### ⚠️ PowerShell Script Execution Issue

If you get a "scripts is disabled" error, run this first:

```powershell
# Run PowerShell as Administrator, then:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# OR use CMD instead (simpler):
# Open Command Prompt (cmd) and run the commands there
```

### 📦 Installation Commands

**Option 1: Using CMD (Recommended)**
```cmd
npm install @supabase/supabase-js @supabase/ssr @stripe/stripe-js stripe lucide-react clsx tailwind-merge react-hook-form zod @hookform/resolvers date-fns

npm install -D @types/node
```

**Option 2: After fixing PowerShell**
```powershell
npm install @supabase/supabase-js @supabase/ssr @stripe/stripe-js stripe lucide-react clsx tailwind-merge react-hook-form zod @hookform/resolvers date-fns

npm install -D @types/node
```

### Dependencies List
| Package | Purpose |
|---------|---------|
| @supabase/supabase-js | Supabase client for database & auth |
| @supabase/ssr | Server-side rendering support |
| @stripe/stripe-js | Stripe payment integration |
| stripe | Stripe backend SDK |
| lucide-react | Beautiful icon library |
| clsx + tailwind-merge | Utility for styling |
| react-hook-form | Form management |
| zod | Schema validation |
| @hookform/resolvers | Form validation integration |
| date-fns | Date formatting |

### Checklist
- [ ] All packages installed successfully
- [ ] No error messages
- [ ] `package.json` updated with new dependencies

### Expected Result
```
✓ Installed 50+ packages
✓ No vulnerabilities found
✓ package.json updated
```

---

## 🛠️ STEP 1.3: CONFIGURE TAILWIND CSS

### ✅ ALREADY COMPLETED

Tailwind CSS 4 is already configured in the project!

### Current Configuration
- ✅ Tailwind CSS 4 installed
- ✅ PostCSS configured
- ✅ Global styles set up

### 🎯 Action Required: Update with Brand Colors

You need to add Foal Rider brand colors to your Tailwind configuration.

Create/update `src/app/globals.css`:

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
    --color-accent-500: 236 240 241; /* Light accent */
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

### Checklist
- [x] Tailwind config exists
- [ ] Brand colors added to globals.css
- [ ] Custom fonts configured (we'll do this in Step 1.4)
- [x] Animations available

---

## 🛠️ STEP 1.4: INITIALIZE SHADCN/UI

### Commands
```powershell
# Initialize shadcn/ui
npx shadcn-ui@latest init

# When prompted, choose:
# - TypeScript: Yes
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
```

### Configuration
Answer the prompts as follows:
- ✓ Would you like to use TypeScript? **Yes**
- ✓ Which style would you like to use? **Default**
- ✓ Which color would you like to use as base color? **Slate**
- ✓ Where is your global CSS file? **src/app/globals.css**
- ✓ Would you like to use CSS variables for colors? **Yes**
- ✓ Where is your tailwind.config.js located? **tailwind.config.ts**
- ✓ Configure the import alias for components? **@/components**
- ✓ Configure the import alias for utils? **@/lib/utils**

### Checklist
- [ ] shadcn/ui initialized
- [ ] components.json created
- [ ] lib/utils.ts created
- [ ] CSS variables configured

---

## 🛠️ STEP 1.5: INSTALL UI COMPONENTS

### Commands
```powershell
# Install essential components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add carousel
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add separator
```

### Components List
- [ ] Button
- [ ] Card
- [ ] Input
- [ ] Form
- [ ] Toast
- [ ] Dialog
- [ ] Badge
- [ ] Carousel
- [ ] Tabs
- [ ] Accordion
- [ ] Select
- [ ] Dropdown Menu
- [ ] Sheet
- [ ] Avatar
- [ ] Separator

---

## 🛠️ STEP 1.6: SET UP ENVIRONMENT VARIABLES

### ✅ COMPLETED

Environment files have been created and filled with your credentials!

### 📋 Credentials Status
- [x] Supabase URL configured
- [x] Supabase publishable key added (new API format)
- [x] Supabase secret key added
- [x] Stripe publishable key added (test mode)
- [x] Stripe secret key added (test mode)
- [x] Site URL configured
- [x] .env.local is in .gitignore ✅

### 🔒 Security Notes
- ✅ `.env.local` is protected by `.gitignore`
- ⚠️ NEVER commit `.env.local` to Git
- ✅ Using TEST keys for development
- ✅ Service role key is secured

### 📝 About Vercel
**No API key needed!** Vercel automatically handles deployment. When you deploy:
1. Push code to GitHub
2. Connect repository in Vercel dashboard
3. Vercel auto-deploys on every push
4. Set environment variables in Vercel dashboard (copy from `.env.local`)

### ⚡ Action Required
**Restart your development server** to load the new environment variables:
```powershell
# Stop with Ctrl+C if running, then:
npm run dev
```

---

## 🛠️ STEP 1.7: CREATE FOLDER STRUCTURE

### Commands
```powershell
# Create directory structure
mkdir -p src/lib/{supabase,stripe,utils}
mkdir -p src/components/{ui,layout,features,shared}
mkdir -p src/app/{api,auth}
mkdir -p src/types
mkdir -p src/hooks
mkdir -p src/constants
mkdir -p public/assets/{images,icons}
```

### Expected Structure
```
src/
├── app/
│   ├── (auth)/
│   ├── (shop)/
│   ├── api/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/           # shadcn components
│   ├── layout/       # Header, Footer, Navigation
│   ├── features/     # Feature-specific components
│   └── shared/       # Reusable components
├── lib/
│   ├── supabase/     # Supabase clients
│   ├── stripe/       # Stripe configuration
│   └── utils/        # Utility functions
├── hooks/            # Custom React hooks
├── types/            # TypeScript types
└── constants/        # App constants

public/
└── assets/
    ├── logo/         # Already exists
    ├── images/
    └── icons/
```

### Checklist
- [ ] lib directories created
- [ ] components structure created
- [ ] app routes structure created
- [ ] types directory created
- [ ] hooks directory created
- [ ] constants directory created
- [ ] public assets organized

---

## 🛠️ STEP 1.8: CONFIGURE GIT

### ✅ ALREADY COMPLETED

Git is already configured and working:
- ✅ Git repository initialized
- ✅ Connected to GitHub: `poovendhan-mathi/FoalRider`
- ✅ `.gitignore` properly configured
- ✅ Sensitive files excluded

### Current `.gitignore` Status
```ignore
✅ /node_modules
✅ /.next/
✅ .env*           # ← All env files excluded
✅ *.tsbuildinfo
✅ next-env.d.ts
```

### 🎯 Action: Commit Phase 1 Completion

Once you complete all Phase 1 tasks, commit your work:

```powershell
# Check status
git status

# Stage all changes
git add .

# Commit
git commit -m "feat: Complete Phase 1 - Project setup with dependencies and configuration"

# Push to GitHub
git push origin main
```

### Checklist
- [x] .gitignore updated
- [x] Sensitive files excluded (✅ .env* already in .gitignore)
- [ ] Phase 1 changes committed (do this after completing all steps)
- [ ] Pushed to GitHub

---

## ✅ PHASE COMPLETION CHECKLIST

### Technical Setup
- [ ] Next.js 15 installed and running
- [ ] All dependencies installed successfully
- [ ] Tailwind CSS configured with brand colors
- [ ] shadcn/ui components installed
- [ ] Environment variables configured
- [ ] Folder structure created

### Configuration
- [ ] TypeScript properly configured
- [ ] ESLint running without errors
- [ ] Git repository up to date
- [ ] .gitignore properly set

### Testing
- [ ] `npm run dev` starts successfully
- [ ] No build errors
- [ ] Can access http://localhost:3000
- [ ] Basic page loads correctly

### Documentation
- [ ] README.md updated
- [ ] Environment variables documented
- [ ] Setup instructions added

---

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue 1: Node Version Mismatch
**Error:** "Engine not supported"  
**Solution:** Ensure Node.js 18.17 or higher
```powershell
node --version
# If needed: nvm install 20
# Or download from nodejs.org
```

### Issue 2: Port Already in Use
**Error:** "Port 3000 is already in use"  
**Solution:** Kill the process or use different port
```powershell
# Find process on port 3000
netstat -ano | findstr :3000
# Kill process
taskkill /PID <PID> /F
# Or use different port
npm run dev -- -p 3001
```

### Issue 3: Module Not Found
**Error:** "Cannot find module '@/...' "  
**Solution:** Check tsconfig.json paths
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue 4: Tailwind Not Working
**Solution:** Ensure content paths in tailwind.config.ts
```typescript
content: [
  './src/**/*.{js,ts,jsx,tsx,mdx}',
]
```

---

## 📚 NEXT STEPS

Once Phase 1 is complete, proceed to:
- **Phase 2:** Database Setup (Supabase tables and schemas)

---

## 📝 NOTES

- Keep all passwords secure in Pass.txt (already in .gitignore)
- Test each step before moving to next
- Document any deviations from plan
- Update PROJECT_STATUS.md after completion

---

**Phase Status:** ⏳ Not Started  
**Last Updated:** November 23, 2025  
**Next Review:** Upon completion
