# 🏇 FoalRider - Complete Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Core Features](#core-features)
6. [Authentication Flow](#authentication-flow)
7. [Database Schema](#database-schema)
8. [API Routes](#api-routes)
9. [Component Guide](#component-guide)
10. [State Management](#state-management)

---

## 🎯 Project Overview

**FoalRider** is a modern e-commerce platform built with Next.js 15, specializing in premium products with multi-currency support. The platform features a complete shopping experience with authentication, cart management, checkout with Stripe, and order tracking.

### Key Highlights
- 🛍️ Full-featured e-commerce platform
- 💳 Stripe payment integration
- 🔐 Secure authentication with Supabase
- 🌍 Multi-currency support (INR, USD, EUR, GBP, AUD)
- 📱 Responsive design with Tailwind CSS
- 🎨 Modern UI with Radix UI components
- 🔒 Row-Level Security (RLS) for data protection

---

## 🏗️ Architecture

### Frontend Architecture
```
Next.js 15 (App Router)
├── React 19 (Server & Client Components)
├── TypeScript (Strict Mode)
├── Tailwind CSS (Styling)
└── Radix UI (Component Library)
```

### Backend Architecture
```
Supabase (BaaS)
├── PostgreSQL (Database)
├── Auth (Authentication)
├── Storage (File Storage)
└── Realtime (Live Updates)
```

### Payment Processing
```
Stripe
├── Payment Intents API
├── Test Mode Integration
└── Webhook Support
```

---

## 🛠️ Tech Stack

### Core Technologies
- **Framework:** Next.js 15.0.3 with Turbopack
- **Language:** TypeScript 5.x
- **React:** Version 19
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth
- **Payments:** Stripe
- **Styling:** Tailwind CSS 3.4
- **UI Components:** Radix UI (shadcn/ui)
- **Forms:** React Hook Form
- **Notifications:** Sonner (Toast)
- **Icons:** Lucide React
- **Date Handling:** date-fns

### Development Tools
- **Testing:** Jest + React Testing Library
- **Linting:** ESLint
- **Type Checking:** TypeScript
- **Package Manager:** npm

---

## 📁 Project Structure

```
FoalRider/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Homepage
│   │   ├── not-found.tsx            # 404 page
│   │   ├── error.tsx                # Error boundary
│   │   ├── globals.css              # Global styles
│   │   ├── about/                   # About page
│   │   ├── login/                   # Login page
│   │   ├── signup/                  # Signup page
│   │   ├── products/                # Products listing & details
│   │   │   ├── page.tsx            # Products list
│   │   │   └── [slug]/             # Product detail page
│   │   ├── cart/                    # Shopping cart
│   │   ├── checkout/                # Checkout flow
│   │   │   ├── page.tsx            # Checkout page
│   │   │   └── success/            # Order success
│   │   ├── profile/                 # User profile
│   │   │   ├── page.tsx            # Profile overview
│   │   │   ├── orders/             # Order history
│   │   │   └── wishlist/           # Wishlist
│   │   └── api/                     # API routes
│   │       └── create-payment-intent/ # Stripe payment
│   │
│   ├── components/                   # React components
│   │   ├── layout/                  # Layout components
│   │   │   ├── Header.tsx          # Main header/navigation
│   │   │   ├── Logo.tsx            # Brand logo
│   │   │   └── UserDropdown.tsx    # User menu
│   │   ├── products/                # Product components
│   │   │   ├── ProductCard.tsx     # Product card
│   │   │   ├── ProductGrid.tsx     # Product grid
│   │   │   ├── ProductFilters.tsx  # Filter sidebar
│   │   │   ├── ProductImages.tsx   # Image gallery
│   │   │   └── ProductInfo.tsx     # Product details
│   │   ├── cart/                    # Cart components
│   │   ├── checkout/                # Checkout components
│   │   └── ui/                      # Reusable UI components
│   │
│   ├── contexts/                     # React contexts
│   │   ├── CartContext.tsx          # Shopping cart state
│   │   └── CurrencyContext.tsx      # Currency selection
│   │
│   ├── lib/                          # Utility libraries
│   │   ├── supabase/                # Supabase clients
│   │   │   ├── client.ts           # Browser client
│   │   │   ├── server.ts           # Server client
│   │   │   └── admin.ts            # Admin client
│   │   ├── auth/                    # Authentication
│   │   │   └── AuthContext.tsx     # Auth state
│   │   ├── stripe/                  # Stripe integration
│   │   ├── products.ts              # Product utilities
│   │   ├── categories.ts            # Category helpers
│   │   ├── currency.ts              # Currency utilities
│   │   └── utils.ts                 # General utilities
│   │
│   ├── types/                        # TypeScript types
│   │   └── database.types.ts        # Database types
│   │
│   └── middleware.ts                 # Next.js middleware
│
├── public/                           # Static assets
│   └── assets/                      # Images, fonts, etc.
│
├── docs/                             # Documentation
│
├── .env.local                        # Environment variables
├── next.config.ts                    # Next.js config
├── tailwind.config.ts                # Tailwind config
├── tsconfig.json                     # TypeScript config
└── package.json                      # Dependencies

```

---

## 🎯 Core Features

### 1. **Authentication System**

#### User Registration
- Email/password signup
- Automatic profile creation
- Email verification
- Secure password hashing

#### User Login
- Email/password authentication
- Session management
- Automatic token refresh
- Remember me functionality

#### Protected Routes
- Middleware-based protection
- Automatic redirects
- Role-based access (admin/customer)

**Code Location:** `src/lib/auth/AuthContext.tsx`

**Key Functions:**
```typescript
// Sign up new user
const signUp = async (email, password, metadata)

// Sign in existing user
const signIn = async (email, password)

// Sign out
const signOut = async ()

// Get current user
const { user } = useAuth()
```

---

### 2. **Product Catalog**

#### Product Listing
- Grid/list view toggle
- Filtering by category, price, color, size
- Sorting options
- Pagination
- Mobile-responsive filters

**Code Location:** `src/app/products/page.tsx`

**Key Functions:**
```typescript
// Fetch all products
fetchProducts(): Promise<Product[]>

// Filter products
filterByCategory(category: string)
filterByPriceRange(min: number, max: number)
filterByColor(color: string)

// Sort products
sortBy('price-asc' | 'price-desc' | 'newest')
```

#### Product Detail Page
- Image gallery with zoom
- Size & color selection
- Stock availability
- Add to cart
- Related products
- Product specifications

**Code Location:** `src/app/products/[slug]/page.tsx`

---

### 3. **Shopping Cart**

#### Cart Management
- Add/remove items
- Update quantities
- Persistent storage (localStorage)
- Real-time price calculations
- Multi-currency support

**Code Location:** `src/contexts/CartContext.tsx`

**Key Functions:**
```typescript
// Add item to cart
addItem(product: Product, quantity: number, selectedSize?: string)

// Remove item
removeItem(itemId: string)

// Update quantity
updateQuantity(itemId: string, quantity: number)

// Clear cart
clearCart()

// Get totals
const { subtotal, tax, shipping, total } = useCart()
```

**State Structure:**
```typescript
interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}
```

---

### 4. **Checkout Process**

#### Payment Flow
1. **Cart Review** - Show items, calculate totals
2. **Shipping Info** - Collect delivery address
3. **Payment** - Stripe payment form
4. **Order Creation** - Store in database
5. **Confirmation** - Show order details

**Code Location:** `src/app/checkout/page.tsx`

**Key Functions:**
```typescript
// Create payment intent
createPaymentIntent(amount, currency): Promise<PaymentIntent>

// Handle payment submission
handlePayment(paymentMethod): Promise<Order>

// Create order in database
createOrder(orderData): Promise<Order>
```

**Stripe Integration:**
- Uses Payment Intents API
- Supports 3D Secure (SCA)
- Test card: 4242 4242 4242 4242
- Webhook support for async events

---

### 5. **Currency System**

#### Multi-Currency Support
- 5 currencies: INR, USD, EUR, GBP, AUD
- Real-time conversion
- Persistent selection
- Stripe currency handling

**Code Location:** `src/contexts/CurrencyContext.tsx`

**Conversion Rates (Base: INR):**
```typescript
INR: 1.0     (₹)
USD: 83.0    ($)
EUR: 89.5    (€)
GBP: 105.0   (£)
AUD: 54.5    (A$)
```

**Key Functions:**
```typescript
// Get currency
const { currency, symbol } = useCurrency()

// Change currency
setCurrency('USD')

// Format price
formatPrice(1000) // "₹1,000.00"

// Convert price
convertPrice(1000, 'USD') // "$12.05"
```

---

### 6. **Order Management**

#### Order History
- View all orders
- Order status tracking
- Payment status
- Shipping details
- Download invoices (future)

**Code Location:** `src/app/profile/orders/page.tsx`

**Order States:**
- `pending` - Order placed
- `processing` - Payment confirmed
- `shipped` - Out for delivery
- `delivered` - Completed
- `cancelled` - Cancelled by user/admin

**Key Functions:**
```typescript
// Fetch user orders
fetchOrders(): Promise<Order[]>

// Get order details
getOrderById(orderId): Promise<Order>

// Update order status (admin only)
updateOrderStatus(orderId, status): Promise<Order>
```

---

### 7. **User Profile**

#### Profile Management
- Update personal info
- Change password
- Upload avatar
- Manage addresses
- View order history

**Code Location:** `src/app/profile/page.tsx`

**Tabs:**
1. **Overview** - Stats and quick access
2. **Orders** - Order history
3. **Addresses** - Shipping addresses
4. **Settings** - Account settings

**Key Functions:**
```typescript
// Update profile
updateProfile(data): Promise<Profile>

// Upload avatar
uploadAvatar(file): Promise<string>

// Add address
addAddress(address): Promise<Address>
```

---

### 8. **Admin Features**

#### Admin Identification
- Role stored in `auth.users.raw_user_meta_data`
- Accessed via JWT custom claims
- RLS policies for data access

**Admin Capabilities:**
- View all orders
- View all users
- Manage products (future)
- View analytics (future)

**Code Location:** `src/components/layout/UserDropdown.tsx`

**Check if admin:**
```typescript
const isAdmin = user?.user_metadata?.role === 'admin'
```

---

## 🔐 Authentication Flow

### 1. Signup Flow
```
User enters email/password
    ↓
Supabase creates auth.users record
    ↓
SIGNED_IN event fires
    ↓
AuthContext checks if profile exists
    ↓
If no profile → Create in profiles table
    ↓
User redirected to homepage
```

### 2. Login Flow
```
User enters credentials
    ↓
Supabase validates
    ↓
JWT token issued
    ↓
Token stored in cookie
    ↓
Profile fetched from database
    ↓
User redirected to dashboard
```

### 3. Session Management
```
Middleware checks auth cookie
    ↓
If invalid → Redirect to /login
    ↓
If valid → Allow access
    ↓
Auto-refresh before expiry
```

---

## 📊 Database Schema

See [DATABASE_DOCUMENTATION.md](./DATABASE_DOCUMENTATION.md) for complete database details.

### Core Tables:
- `auth.users` - Supabase managed auth
- `profiles` - User profiles
- `products` - Product catalog
- `categories` - Product categories
- `orders` - Customer orders
- `order_items` - Order line items
- `cart_items` - Persistent cart (future)
- `addresses` - Shipping addresses
- `reviews` - Product reviews

---

## 🎨 Component Guide

### Layout Components

#### Header Component
**Location:** `src/components/layout/Header.tsx`

**Features:**
- Sticky navigation
- Search bar
- Cart icon with count
- User dropdown
- Currency selector
- Mobile responsive

**Props:** None (uses global state)

#### Logo Component
**Location:** `src/components/layout/Logo.tsx`

**Features:**
- Animated gradient text
- Link to homepage
- Consistent branding

**Props:**
```typescript
interface LogoProps {
  className?: string;
  showText?: boolean;
}
```

### Product Components

#### ProductCard
**Location:** `src/components/products/ProductCard.tsx`

**Features:**
- Product image
- Title and price
- Quick add to cart
- Wishlist button
- Hover effects

**Props:**
```typescript
interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'list';
}
```

#### ProductFilters
**Location:** `src/components/products/ProductFilters.tsx`

**Features:**
- Category filter
- Price range slider
- Color swatches
- Size selector
- Reset filters

**Props:**
```typescript
interface ProductFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}
```

---

## 🔄 State Management

### Global State (Contexts)

#### CartContext
**Purpose:** Manage shopping cart state

**Provides:**
```typescript
{
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (product, quantity) => void;
  removeItem: (id) => void;
  updateQuantity: (id, quantity) => void;
  clearCart: () => void;
}
```

#### CurrencyContext
**Purpose:** Manage currency selection

**Provides:**
```typescript
{
  currency: CurrencyCode;
  symbol: string;
  rate: number;
  setCurrency: (currency) => void;
  formatPrice: (amount) => string;
  convertPrice: (amount, toCurrency) => number;
}
```

#### AuthContext
**Purpose:** Manage authentication state

**Provides:**
```typescript
{
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email, password) => Promise<void>;
  signUp: (email, password, metadata) => Promise<void>;
  signOut: () => Promise<void>;
}
```

---

## 📦 Deployment

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_pk
STRIPE_SECRET_KEY=your_stripe_sk
NEXT_PUBLIC_SITE_URL=your_site_url
```

### Build Commands
```bash
# Development
npm run dev

# Production build
npm run build

# Start production
npm start

# Run tests
npm test
```

---

## 🧪 Testing

### Test Coverage
- Unit tests for utilities
- Component tests
- Integration tests for checkout
- E2E tests (future)

### Running Tests
```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

---

## 📚 Additional Resources

- [Database Documentation](./DATABASE_DOCUMENTATION.md)
- [SQL Migrations](./DATABASE_COMPLETE.sql)
- [API Documentation](./API_DOCUMENTATION.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

---

**Last Updated:** November 25, 2025
**Version:** 1.0.0
