# 🏇 FOAL RIDER - Premium Textile E-Commerce

**A modern, full-stack e-commerce platform for premium textiles, clothing, and home decor.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-blueviolet)](https://stripe.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)](https://tailwindcss.com/)

---

## 🎯 Overview

Foal Rider is a premium e-commerce platform specializing in high-quality denim products including jeans and jackets for men and women. Built with Next.js 15, Supabase, and Stripe for a seamless shopping experience with multi-currency support.

---

## ✨ Key Features

### 🎉 Currently Live
- 🔐 **Authentication** - Email/password & Supabase Auth
- 🛍️ **Product Browsing** - 25+ denim products with advanced filtering
- 🏷️ **Category System** - Hierarchical categories (parent-child support)
- 🛒 **Shopping Cart** - Persistent cart with localStorage & real-time updates
- 💱 **Multi-Currency** - 6 currencies (INR, SGD, USD, EUR, GBP, AUD) with live exchange rates
- 🖼️ **High-Quality Images** - 8K product photography from Unsplash
- 📱 **Responsive Design** - Mobile-first approach with Tailwind CSS
- 🔍 **Product Search** - Advanced filtering by category, price, and search terms

### 🚧 Coming Soon
- 💳 **Secure Checkout** - Stripe payment integration
- 📦 **Order Tracking** - Real-time order status
- ❤️ **Wishlist** - Save favorite products
- 👤 **User Dashboard** - Profile, orders, and addresses
- 👨‍💼 **Admin Panel** - Complete product & order management

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, Supabase
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth
- **Payments:** Stripe
- **Storage:** Supabase Storage
- **Hosting:** Vercel

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or higher
- npm or yarn
- Accounts on Vercel, Supabase, and Stripe

### Installation

1. **Clone the repository**
   ```powershell
   git clone https://github.com/poovendhan-mathi/FoalRider.git
   cd FoalRider
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Set up environment variables**
   ```powershell
   # Copy example file
   cp .env.example .env.local
   
   # Edit .env.local with your credentials
   ```

4. **Run development server**
   ```powershell
   npm run dev
   ```

5. **Open browser**
   ```
   http://localhost:3000
   ```

---

## 📚 Documentation

Complete implementation guide available in `/docs`:

- **[Implementation Roadmap](./docs/IMPLEMENTATION_ROADMAP.md)** - Complete project guide
- **[Project Status](./docs/PROJECT_STATUS.md)** - Current progress tracker
- **[Phase Guides](./docs/phases/)** - Step-by-step implementation

### Phase Documentation
1. [Phase 1: Project Setup](./docs/phases/PHASE_1_PROJECT_SETUP.md)
2. [Phase 2: Database Setup](./docs/phases/PHASE_2_DATABASE_SETUP.md)
3. [Phase 3: Authentication](./docs/phases/PHASE_3_AUTHENTICATION.md)
4. [Phase 4: Frontend Components](./docs/phases/PHASE_4_FRONTEND.md)
5. [Phase 5: Core Features](./docs/phases/PHASE_5_CORE_FEATURES.md)
6. [Phase 6: Payment Integration](./docs/phases/PHASE_6_PAYMENTS.md)
7. [Phase 7: Admin Dashboard](./docs/phases/PHASE_7_ADMIN.md)
8. [Phase 8: Deployment](./docs/phases/PHASE_8_DEPLOYMENT.md)

---

## 📊 Project Status

**Current Phase:** Phase 5 - Core Features (40% Complete)  
**Overall Progress:** 68%  
**Start Date:** November 23, 2025

### ✅ Completed Phases
- ✅ Phase 1: Project Setup (100%)
- ✅ Phase 2: Database Setup (100%)
- ✅ Phase 3: Authentication (100%)
- ✅ Phase 4: Frontend Components (100%)
- 🚀 Phase 5: Core Features (40% - In Progress)

### 🎯 Recent Achievements
- Multi-currency system with 6 currencies
- Shopping cart with localStorage persistence
- Hierarchical category filtering
- 25+ denim products (jeans & jackets) loaded
- Homepage showcase with actual product data
- All category filters working correctly

### 📅 Next Up
- Phase 6: Stripe Payment Integration
- Checkout flow implementation
- Order management system

See [PROJECT_STATUS.md](./docs/PROJECT_STATUS.md) for detailed tracking.

---

## 🗂️ Project Structure

```
FoalRider/
├── docs/                    # Documentation
│   ├── phases/             # Phase-by-phase guides
│   ├── PROJECT_STATUS.md   # Current progress
│   ├── CATEGORY_HIERARCHY_GUIDE.md
│   └── WISHLIST_IMPLEMENTATION_PLAN.md
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── page.tsx       # Homepage
│   │   ├── products/      # Products listing & detail
│   │   ├── login/         # Authentication pages
│   │   └── signup/
│   ├── components/         # React components
│   │   ├── layout/        # Header, Footer, Logo
│   │   ├── products/      # Product cards, filters, grids
│   │   ├── cart/          # Cart components
│   │   └── ui/            # shadcn/ui components
│   ├── contexts/          # React Contexts
│   │   ├── CartContext.tsx
│   │   └── CurrencyContext.tsx
│   ├── lib/               # Utilities
│   │   ├── supabase/      # Supabase clients
│   │   ├── products.ts    # Product queries
│   │   └── categories.ts  # Category helpers
│   ├── hooks/             # Custom hooks
│   ├── types/             # TypeScript types
│   └── middleware.ts      # Auth middleware
├── public/                # Static assets
│   └── assets/logo/      # Brand logos
├── .env.local             # Environment variables
└── package.json
```

---

## ⚙️ Available Scripts

```powershell
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

---

## 📄 License

This project is proprietary and confidential.

---

## 🔗 Links

- **Repository:** https://github.com/poovendhan-mathi/FoalRider
- **Documentation:** [/docs](./docs)
- **Design System:** [FoalRider-Figma.md](./FoalRider-Figma.md)

---

**Built with ❤️ for premium textile commerce**
