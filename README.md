# 🏇 FoalRider

**Premium Denim E-Commerce Platform**

A modern, full-featured e-commerce application built with Next.js 16, featuring a complete shopping experience with Stripe payments, user authentication, and a comprehensive admin dashboard.

---

## 🚀 Tech Stack

| Technology   | Version | Purpose                                     |
| ------------ | ------- | ------------------------------------------- |
| Next.js      | 16.0.3  | React framework with App Router & Turbopack |
| TypeScript   | 5.x     | Type-safe development                       |
| Supabase     | Latest  | PostgreSQL database, Auth & Storage         |
| Stripe       | Latest  | Payment processing & webhooks               |
| Tailwind CSS | 3.x     | Utility-first CSS framework                 |
| shadcn/ui    | Latest  | Accessible UI components                    |
| React Query  | 5.x     | Data fetching & caching                     |
| Zod          | Latest  | Schema validation                           |

---

## ✨ Features

### 🛍️ Customer Features

| Feature               | Description                                                         |
| --------------------- | ------------------------------------------------------------------- |
| **Product Catalog**   | Browse products with category filters, price range, and sorting     |
| **Product Detail**    | View product images, descriptions, size/color variants, and reviews |
| **Shopping Cart**     | Add/remove items, update quantities, persistent cart                |
| **Wishlist**          | Save favorite products, price drop notifications                    |
| **Checkout**          | Secure Stripe payment integration                                   |
| **Order History**     | View past orders, order status, download invoices                   |
| **User Profile**      | Manage account details, addresses, preferences                      |
| **Search**            | Full-text search across products                                    |
| **Multi-Currency**    | Support for INR, USD, EUR, GBP, SGD, AUD                            |
| **Responsive Design** | Optimized for mobile, tablet, and desktop                           |

### 👨‍💼 Admin Features

| Feature        | Description                                            |
| -------------- | ------------------------------------------------------ |
| **Dashboard**  | Analytics overview, revenue charts, recent orders      |
| **Products**   | Create, edit, delete products with images and variants |
| **Categories** | Hierarchical category management                       |
| **Orders**     | View orders, update status, track shipments            |
| **Customers**  | View customer list, order history, details             |
| **Analytics**  | Revenue trends, top products, order statistics         |
| **Settings**   | Store configuration, tax rates, shipping               |

### 🔧 Technical Features

| Feature                | Description                             |
| ---------------------- | --------------------------------------- |
| **Authentication**     | Supabase Auth with email/password       |
| **Authorization**      | Role-based access (customer/admin)      |
| **Row Level Security** | Database-level security policies        |
| **API Routes**         | RESTful API with validation             |
| **Error Handling**     | Error boundaries, loading states        |
| **Performance**        | React Query caching, image optimization |

---

## 📁 Project Structure

```
FoalRider/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login, signup)
│   │   ├── admin/             # Admin panel pages
│   │   ├── api/               # API routes
│   │   ├── cart/              # Shopping cart
│   │   ├── checkout/          # Checkout flow
│   │   ├── orders/            # Order history
│   │   ├── products/          # Product pages
│   │   ├── profile/           # User profile
│   │   ├── wishlist/          # Wishlist page
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   │
│   ├── components/            # React components
│   │   ├── admin/             # Admin-specific components
│   │   ├── layout/            # Header, Footer, Navigation
│   │   ├── products/          # Product cards, gallery, filters
│   │   ├── ui/                # shadcn/ui components
│   │   └── wishlist/          # Wishlist components
│   │
│   ├── contexts/              # React Context providers
│   │   ├── AuthProvider.tsx   # Authentication state
│   │   ├── CartContext.tsx    # Shopping cart state
│   │   ├── CurrencyContext.tsx # Currency selection
│   │   └── WishlistContext.tsx # Wishlist state
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── useUser.ts         # Current user hook
│   │   ├── useAdminQueries.ts # Admin data fetching
│   │   └── use-toast.ts       # Toast notifications
│   │
│   ├── lib/                   # Utilities & helpers
│   │   ├── supabase/          # Supabase clients
│   │   ├── stripe/            # Stripe configuration
│   │   ├── validations/       # Zod schemas
│   │   ├── currency.ts        # Currency formatting
│   │   └── products.ts        # Product helpers
│   │
│   └── types/                 # TypeScript definitions
│
├── public/                    # Static assets
│   └── assets/               # Images, icons
│
├── docs/                      # Documentation
│   ├── PROJECT_STRUCTURE.md  # Detailed structure
│   ├── DATABASE.md           # Database schema
│   ├── ADMIN_GUIDE.md        # Admin panel guide
│   └── PROJECT_STATUS.md     # Current status
│
└── migrations/               # Database migrations
```

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **yarn**
- **Supabase** account (free tier works)
- **Stripe** account (test mode for development)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/poovendhan-mathi/FoalRider.git
cd FoalRider
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
```

4. **Configure environment variables** (see below)

5. **Run database migrations**

   - Go to Supabase SQL Editor
   - Run the SQL files from `/migrations` folder

6. **Start development server**

```bash
npm run dev
```

7. **Open in browser**

```
http://localhost:3000
```

### Environment Variables

Create a `.env.local` file with the following:

```env
# ===================
# SUPABASE
# ===================
# Get these from: https://app.supabase.com/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ===================
# STRIPE
# ===================
# Get these from: https://dashboard.stripe.com/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx

# Webhook secret from: https://dashboard.stripe.com/webhooks
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# ===================
# APP CONFIG
# ===================
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📜 Available Scripts

| Command              | Description                             |
| -------------------- | --------------------------------------- |
| `npm run dev`        | Start development server with Turbopack |
| `npm run build`      | Create production build                 |
| `npm run start`      | Start production server                 |
| `npm run lint`       | Run ESLint                              |
| `npm run test`       | Run Jest tests                          |
| `npm run test:watch` | Run tests in watch mode                 |

---

## 🗄️ Database Setup

### Supabase Configuration

1. Create a new Supabase project
2. Go to SQL Editor
3. Run migrations from `/migrations` folder in order
4. Enable Row Level Security on all tables

### Setting Up Admin User

After creating a user account, run this SQL to make them admin:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

---

## 💳 Stripe Configuration

### Development (Test Mode)

1. Use Stripe test keys (start with `pk_test_` and `sk_test_`)
2. Test card number: `4242 4242 4242 4242`
3. Any future expiry date
4. Any 3-digit CVC

### Webhook Setup

1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Copy webhook secret to `.env.local`

---

## 📚 Documentation

| Document                                       | Description                                          |
| ---------------------------------------------- | ---------------------------------------------------- |
| [Project Structure](docs/PROJECT_STRUCTURE.md) | Detailed folder organization and file purposes       |
| [Database Schema](docs/DATABASE.md)            | Complete database tables, columns, and relationships |
| [Admin Guide](docs/ADMIN_GUIDE.md)             | How to use the admin panel                           |
| [Project Status](docs/PROJECT_STATUS.md)       | Current development status                           |

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

- Update `NEXT_PUBLIC_APP_URL` to your production URL
- Use Stripe live keys (start with `pk_live_` and `sk_live_`)
- Set up production Stripe webhook

---

## 🤝 Contributing

This is a private project. Please contact the author for contribution guidelines.

---

## 👨‍💻 Author

**Poovendhan Mathi**

- GitHub: [@poovendhan-mathi](https://github.com/poovendhan-mathi)

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React Framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Stripe](https://stripe.com/) - Payment Processing
- [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
