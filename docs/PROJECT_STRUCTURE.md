# 📁 FoalRider - Project Structure

Detailed folder organization, file purposes, and architecture guide.

---

## Overview

The project follows Next.js 16 App Router conventions with a clear separation of concerns:

- **`src/app/`** - Pages, layouts, and API routes
- **`src/components/`** - Reusable UI components
- **`src/contexts/`** - React Context providers for global state
- **`src/hooks/`** - Custom React hooks
- **`src/lib/`** - Utilities, helpers, and external service clients
- **`src/types/`** - TypeScript type definitions

---

## Root Directory

```text
FoalRider/
├── src/                    # Source code (main application)
├── public/                 # Static assets (served at root URL)
├── docs/                   # Project documentation
├── migrations/             # SQL migration files for Supabase
├── scripts/                # Utility scripts
├── .env.local              # Environment variables (not committed)
├── .env.example            # Example environment template
├── package.json            # Dependencies and scripts
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── middleware.ts           # Next.js middleware (auth, redirects)
├── components.json         # shadcn/ui configuration
└── README.md               # Project readme
```

---

## Source Directory (`src/`)

### App Directory (`src/app/`)

Next.js App Router pages and API routes. Each folder represents a route.

```text
app/
├── layout.tsx              # Root layout (providers, fonts, meta)
├── page.tsx                # Homepage (/)
├── globals.css             # Global CSS styles
├── error.tsx               # Global error boundary
├── not-found.tsx           # 404 page
│
├── login/
│   └── page.tsx            # Login page (/login)
│
├── signup/
│   └── page.tsx            # Registration page (/signup)
│
├── forgot-password/
│   └── page.tsx            # Password reset request (/forgot-password)
│
├── reset-password/
│   └── page.tsx            # Password reset form (/reset-password)
│
├── products/
│   ├── page.tsx            # Product listing with filters (/products)
│   └── [slug]/
│       └── page.tsx        # Product detail page (/products/[slug])
│
├── cart/
│   └── page.tsx            # Shopping cart (/cart)
│
├── checkout/
│   ├── page.tsx            # Checkout form (/checkout)
│   ├── success/
│   │   └── page.tsx        # Order success (/checkout/success)
│   └── error/
│       └── page.tsx        # Payment error (/checkout/error)
│
├── orders/
│   ├── page.tsx            # Order history (/orders)
│   └── [orderId]/
│       └── page.tsx        # Order detail (/orders/[orderId])
│
├── wishlist/
│   └── page.tsx            # Wishlist page (/wishlist)
│
├── profile/
│   ├── page.tsx            # User profile (/profile)
│   └── orders/
│       └── page.tsx        # User orders (/profile/orders)
│
├── search/
│   └── page.tsx            # Search results (/search)
│
├── about/
│   └── page.tsx            # About page (/about)
│
├── contact/
│   └── page.tsx            # Contact page (/contact)
│
├── journal/
│   └── page.tsx            # Blog/Journal (/journal)
│
├── admin/                  # Admin panel (protected)
│   ├── page.tsx            # Dashboard (/admin)
│   ├── products/
│   │   ├── page.tsx        # Products list (/admin/products)
│   │   ├── new/
│   │   │   └── page.tsx    # Create product (/admin/products/new)
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx # Edit product (/admin/products/[id]/edit)
│   ├── categories/
│   │   └── page.tsx        # Categories (/admin/categories)
│   ├── orders/
│   │   ├── page.tsx        # Orders list (/admin/orders)
│   │   └── [id]/
│   │       └── page.tsx    # Order detail (/admin/orders/[id])
│   ├── customers/
│   │   ├── page.tsx        # Customers list (/admin/customers)
│   │   └── [id]/
│   │       └── page.tsx    # Customer detail (/admin/customers/[id])
│   ├── analytics/
│   │   └── page.tsx        # Analytics (/admin/analytics)
│   └── settings/
│       └── page.tsx        # Settings (/admin/settings)
│
└── api/                    # API Routes
    ├── auth/
    │   └── callback/
    │       └── route.ts    # Auth callback handler
    ├── products/
    │   ├── route.ts        # GET products, POST create
    │   └── [id]/
    │       ├── route.ts    # GET/PUT/DELETE product
    │       ├── features/
    │       │   └── route.ts # Product features
    │       └── variants/
    │           └── route.ts # Product variants
    ├── categories/
    │   └── route.ts        # Categories CRUD
    ├── cart/
    │   └── route.ts        # Cart operations
    ├── orders/
    │   ├── route.ts        # Orders CRUD
    │   └── [orderId]/
    │       └── invoice/
    │           └── route.ts # Generate invoice PDF
    ├── wishlist/
    │   ├── route.ts        # Wishlist CRUD
    │   └── notifications/
    │       └── route.ts    # Wishlist notifications
    ├── reviews/
    │   └── route.ts        # Product reviews
    ├── currency/
    │   └── route.ts        # Currency conversion rates
    ├── stripe/
    │   └── route.ts        # Create payment intent
    ├── webhooks/
    │   └── stripe/
    │       └── route.ts    # Stripe webhook handler
    └── admin/
        ├── analytics/
        │   └── route.ts    # Dashboard analytics
        ├── products/
        │   └── route.ts    # Admin product management
        ├── categories/
        │   ├── route.ts    # Categories management
        │   ├── [id]/
        │   │   └── route.ts
        │   └── reorder/
        │       └── route.ts # Reorder categories
        ├── orders/
        │   ├── route.ts    # Admin orders
        │   └── [id]/
        │       └── route.ts
        ├── customers/
        │   ├── route.ts    # Admin customers
        │   └── [id]/
        │       └── route.ts
        └── settings/
            └── route.ts    # Store settings
```

---

### Components Directory (`src/components/`)

Reusable React components organized by feature/domain.

```text
components/
├── ui/                     # shadcn/ui base components
│   ├── button.tsx          # Button variants
│   ├── card.tsx            # Card component
│   ├── input.tsx           # Form input
│   ├── label.tsx           # Form label
│   ├── dialog.tsx          # Modal dialog
│   ├── dropdown-menu.tsx   # Dropdown menus
│   ├── select.tsx          # Select input
│   ├── slider.tsx          # Range slider
│   ├── tabs.tsx            # Tab component
│   ├── toast.tsx           # Toast notifications
│   ├── toaster.tsx         # Toast container
│   └── ...                 # Other UI primitives
│
├── layout/                 # Layout components
│   ├── Header.tsx          # Site header with navigation
│   ├── Footer.tsx          # Site footer
│   ├── Navbar.tsx          # Navigation bar
│   ├── MobileMenu.tsx      # Mobile navigation drawer
│   └── AdminSidebar.tsx    # Admin panel sidebar
│
├── products/               # Product-related components
│   ├── ProductCard.tsx     # Product card for grids
│   ├── ProductGrid.tsx     # Product grid layout
│   ├── ProductGallery.tsx  # Product image gallery
│   ├── ProductDetails.tsx  # Product info section
│   ├── ProductTabs.tsx     # Reviews & details tabs
│   ├── ProductFilters.tsx  # Filter sidebar
│   ├── MobileFilters.tsx   # Mobile filter drawer
│   └── ProductSkeleton.tsx # Loading skeleton
│
├── admin/                  # Admin panel components
│   ├── AdminHeader.tsx     # Admin header
│   ├── StatsCard.tsx       # Dashboard stat card
│   ├── RevenueChart.tsx    # Revenue chart
│   ├── ProductForm.tsx     # Product create/edit form
│   ├── OrdersTable.tsx     # Orders data table
│   └── CategoryForm.tsx    # Category form
│
├── wishlist/               # Wishlist components
│   └── WishlistButton.tsx  # Add to wishlist button
│
├── CurrencySelector.tsx    # Currency dropdown
├── PriceDisplay.tsx        # Formatted price display
├── LoadingSpinner.tsx      # Loading indicator
└── ErrorBoundary.tsx       # Error boundary wrapper
```

---

### Contexts Directory (`src/contexts/`)

React Context providers for global state management.

```text
contexts/
├── AuthProvider.tsx        # Authentication state & methods
│   └── Provides: user, isLoading, signIn, signOut, signUp
│
├── CartContext.tsx         # Shopping cart state
│   └── Provides: items, addItem, removeItem, updateQuantity, clearCart, total
│
├── CurrencyContext.tsx     # Currency selection & conversion
│   └── Provides: currency, setCurrency, formatPrice, convertPrice
│
└── WishlistContext.tsx     # Wishlist state
    └── Provides: items, isInWishlist, toggleWishlist, clearWishlist
```

**Usage Example:**

```tsx
import { useCart } from "@/contexts/CartContext";

function MyComponent() {
  const { items, addItem, total } = useCart();
  // ...
}
```

---

### Hooks Directory (`src/hooks/`)

Custom React hooks for reusable logic.

```text
hooks/
├── useUser.ts              # Get current authenticated user
│   └── Returns: { user, isLoading, isAdmin }
│
├── useAdminQueries.ts      # Admin data fetching with React Query
│   └── Returns: { products, orders, customers, analytics }
│
├── useAccessibility.ts     # Accessibility utilities
│   └── Returns: { announce, focusTrap, skipToContent }
│
├── usePerformance.ts       # Performance monitoring
│   └── Returns: { useDebounce, useThrottle }
│
└── use-toast.ts            # Toast notification hook
    └── Returns: { toast, dismiss }
```

---

### Lib Directory (`src/lib/`)

Utilities, helpers, and external service clients.

```text
lib/
├── supabase/               # Supabase client configuration
│   ├── client.ts           # Browser client (for client components)
│   ├── server.ts           # Server client (for server components)
│   └── admin.ts            # Admin client (service role)
│
├── stripe/                 # Stripe configuration
│   └── client.ts           # Stripe client setup
│
├── auth/                   # Authentication helpers
│   └── helpers.ts          # Auth utility functions
│
├── validations/            # Zod validation schemas
│   ├── product.ts          # Product validation
│   ├── order.ts            # Order validation
│   └── user.ts             # User validation
│
├── pdf/                    # PDF generation
│   └── invoice.ts          # Invoice PDF generator
│
├── utils.ts                # General utilities (cn, etc.)
├── currency.ts             # Currency formatting & conversion
├── products.ts             # Product helper functions
├── product-helpers.ts      # Additional product utilities
├── categories.ts           # Category helpers
├── rate-limit.ts           # API rate limiting
└── logger.ts               # Logging utility
```

---

### Types Directory (`src/types/`)

TypeScript type definitions.

```text
types/
├── database.ts             # Database table types (generated from Supabase)
├── product.ts              # Product-related types
├── order.ts                # Order-related types
├── user.ts                 # User-related types
└── cart.ts                 # Cart-related types
```

---

## Public Directory (`public/`)

Static assets served at the root URL.

```text
public/
├── favicon.png             # Browser favicon
├── favicon.svg             # SVG favicon
├── icon.png                # App icon
└── assets/
    ├── logo/               # Brand logos
    └── images/
        └── product-placeholder.svg  # Placeholder for products
```

---

## Documentation (`docs/`)

Project documentation files.

```text
docs/
├── PROJECT_STRUCTURE.md    # This file
├── DATABASE.md             # Database schema documentation
├── ADMIN_GUIDE.md          # Admin panel usage guide
└── PROJECT_STATUS.md       # Current development status
```

---

## Configuration Files

| File                 | Purpose                                   |
| -------------------- | ----------------------------------------- |
| `package.json`       | Dependencies, scripts, project metadata   |
| `next.config.ts`     | Next.js configuration (images, redirects) |
| `tailwind.config.ts` | Tailwind CSS theme and plugins            |
| `tsconfig.json`      | TypeScript compiler options               |
| `postcss.config.mjs` | PostCSS plugins                           |
| `eslint.config.mjs`  | ESLint rules                              |
| `jest.config.js`     | Jest test configuration                   |
| `middleware.ts`      | Auth middleware, route protection         |
| `components.json`    | shadcn/ui component settings              |
| `vercel.json`        | Vercel deployment configuration           |

---

## Key Patterns

### Server vs Client Components

- **Server Components** (default): Data fetching, no interactivity
- **Client Components** (`'use client'`): Event handlers, hooks, browser APIs

### Data Fetching

- **Server Components**: Direct Supabase queries
- **Client Components**: React Query with custom hooks
- **API Routes**: For mutations and complex operations

### Authentication Flow

1. User submits credentials
2. Supabase Auth validates
3. Session stored in cookies
4. Middleware checks auth on protected routes
5. Context provides user state to components

### State Management

- **Server State**: React Query (caching, refetching)
- **Client State**: React Context (cart, currency, wishlist)
- **Form State**: React Hook Form + Zod validation
