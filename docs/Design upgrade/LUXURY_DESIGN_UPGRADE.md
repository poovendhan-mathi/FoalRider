# 🎨 Foal Rider - Luxury Design Upgrade Guide

> **Version**: 1.0  
> **Date**: December 2025  
> **Inspired by**: Adidas, Burberry, Ralph Lauren - Minimalist Luxury

---

## 📋 Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography System](#typography-system)
4. [Icon System](#icon-system)
5. [Component Upgrades](#component-upgrades)
6. [Page-by-Page Implementation](#page-by-page-implementation)
7. [Animation & Micro-interactions](#animation--micro-interactions)
8. [Implementation Checklist](#implementation-checklist)

---

## 🎯 Design Philosophy

### Core Principles

| Principle           | Description                                             |
| ------------------- | ------------------------------------------------------- |
| **Minimalism**      | Less is more - every element has purpose                |
| **Luxury Feel**     | High-end fashion brands use whitespace generously       |
| **Consistency**     | Same patterns, colors, and spacing throughout           |
| **Elegance**        | Refined typography and subtle animations                |
| **Premium Quality** | High-resolution images, crisp icons, smooth transitions |

### Brand Identity

```
Primary: Black (#000000) - Authority, elegance, timelessness
Accent: Gold (#C5A572) - Luxury, craftsmanship, premium
Neutral: White (#FFFFFF) - Purity, sophistication, breathing room
```

---

## 🎨 Color System

### Primary Palette

| Color         | Hex       | RGB               | Usage                                |
| ------------- | --------- | ----------------- | ------------------------------------ |
| **Jet Black** | `#000000` | `rgb(0, 0, 0)`    | Headers, footers, primary text, CTAs |
| **Charcoal**  | `#1A1A1A` | `rgb(26, 26, 26)` | Secondary backgrounds, depth         |
| **Dark Gray** | `#2E2E2E` | `rgb(46, 46, 46)` | Borders on dark, subtle text         |

### Accent Palette

| Color          | Hex       | RGB                  | Usage                            |
| -------------- | --------- | -------------------- | -------------------------------- |
| **Gold**       | `#C5A572` | `rgb(197, 165, 114)` | Primary accent, highlights, CTAs |
| **Light Gold** | `#D4B98A` | `rgb(212, 185, 138)` | Hover states, soft accents       |
| **Dark Gold**  | `#A8894E` | `rgb(168, 137, 78)`  | Active states, pressed buttons   |

### Neutral Palette

| Color           | Hex       | RGB                  | Usage                     |
| --------------- | --------- | -------------------- | ------------------------- |
| **Pure White**  | `#FFFFFF` | `rgb(255, 255, 255)` | Backgrounds, text on dark |
| **Off White**   | `#FAFAFA` | `rgb(250, 250, 250)` | Page backgrounds          |
| **Warm White**  | `#F8F6F3` | `rgb(248, 246, 243)` | Premium card backgrounds  |
| **Light Gray**  | `#E5E5E5` | `rgb(229, 229, 229)` | Borders, dividers         |
| **Medium Gray** | `#9CA3AF` | `rgb(156, 163, 175)` | Muted text, placeholders  |
| **Text Gray**   | `#4B5563` | `rgb(75, 85, 99)`    | Body text                 |

### CSS Variables to Add

```css
:root {
  /* Luxury Brand System */
  --luxury-black: #000000;
  --luxury-charcoal: #1a1a1a;
  --luxury-dark: #2e2e2e;

  --luxury-gold: #c5a572;
  --luxury-gold-light: #d4b98a;
  --luxury-gold-dark: #a8894e;

  --luxury-white: #ffffff;
  --luxury-off-white: #fafafa;
  --luxury-warm-white: #f8f6f3;
  --luxury-gray-light: #e5e5e5;
  --luxury-gray-medium: #9ca3af;
  --luxury-gray-text: #4b5563;

  /* Transparency variations */
  --luxury-black-90: rgba(0, 0, 0, 0.9);
  --luxury-black-75: rgba(0, 0, 0, 0.75);
  --luxury-black-50: rgba(0, 0, 0, 0.5);
  --luxury-black-10: rgba(0, 0, 0, 0.1);

  --luxury-white-90: rgba(255, 255, 255, 0.9);
  --luxury-white-70: rgba(255, 255, 255, 0.7);
  --luxury-white-50: rgba(255, 255, 255, 0.5);

  --luxury-gold-20: rgba(197, 165, 114, 0.2);
  --luxury-gold-10: rgba(197, 165, 114, 0.1);
}
```

---

## ✍️ Typography System

### Font Families

| Type        | Font               | Weight             | Usage                          |
| ----------- | ------------------ | ------------------ | ------------------------------ |
| **Display** | Playfair Display   | 400, 600, 700      | Hero headings, product titles  |
| **Body**    | Montserrat         | 400, 500, 600, 700 | All body text, buttons, labels |
| **Accent**  | Cormorant Garamond | 400, 500           | Quotes, special callouts       |

### Type Scale

```css
/* Headings */
--text-display: 4rem; /* 64px - Hero sections */
--text-h1: 3rem; /* 48px - Page titles */
--text-h2: 2.25rem; /* 36px - Section headings */
--text-h3: 1.5rem; /* 24px - Card titles */
--text-h4: 1.25rem; /* 20px - Subsections */
--text-h5: 1.125rem; /* 18px - Small headings */

/* Body */
--text-lg: 1.125rem; /* 18px - Large body */
--text-base: 1rem; /* 16px - Default body */
--text-sm: 0.875rem; /* 14px - Small text */
--text-xs: 0.75rem; /* 12px - Captions, labels */

/* Letter Spacing */
--tracking-tight: -0.02em;
--tracking-normal: 0;
--tracking-wide: 0.05em;
--tracking-wider: 0.1em;
--tracking-widest: 0.2em; /* For badges, labels */
```

### Typography Classes

```css
/* Luxury Headings */
.luxury-display {
  font-family: "Playfair Display", serif;
  font-size: 4rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: var(--luxury-black);
}

.luxury-h1 {
  font-family: "Playfair Display", serif;
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.luxury-h2 {
  font-family: "Playfair Display", serif;
  font-size: 2.25rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.luxury-h3 {
  font-family: "Playfair Display", serif;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.4;
}

/* Body Text */
.luxury-body {
  font-family: "Montserrat", sans-serif;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.7;
  color: var(--luxury-gray-text);
}

.luxury-body-lg {
  font-family: "Montserrat", sans-serif;
  font-size: 1.125rem;
  font-weight: 400;
  line-height: 1.8;
  color: var(--luxury-gray-text);
}

/* Labels & Badges */
.luxury-label {
  font-family: "Montserrat", sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

/* Price Display */
.luxury-price {
  font-family: "Montserrat", sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--luxury-gold);
}
```

---

## 🎯 Icon System

### Recommended Icon Library

**Lucide React** (already installed) - Clean, consistent line icons

### Icon Guidelines

| Type              | Size    | Stroke  | Usage                       |
| ----------------- | ------- | ------- | --------------------------- |
| **Navigation**    | 20-24px | 1.5-2px | Header icons, nav items     |
| **Action**        | 16-20px | 2px     | Buttons, interactive        |
| **Decorative**    | 24-48px | 1.5px   | Feature highlights          |
| **Large Display** | 48-64px | 1px     | Empty states, hero sections |

### Luxury Icon Styling

```tsx
// Standard icon - Navigation
<Icon className="h-5 w-5 stroke-[1.5]" />

// Action icon - Buttons
<Icon className="h-4 w-4 stroke-2" />

// Feature icon - With gold accent
<div className="p-3 bg-luxury-gold-10 rounded-xl">
  <Icon className="h-6 w-6 text-luxury-gold stroke-[1.5]" />
</div>

// Large decorative icon
<Icon className="h-12 w-12 text-luxury-gray-medium stroke-1" />
```

### Custom Icon Wrapper Component

```tsx
// components/ui/luxury-icon.tsx
interface LuxuryIconProps {
  icon: React.ElementType;
  variant?: "default" | "accent" | "muted" | "light";
  size?: "sm" | "md" | "lg" | "xl";
  withBackground?: boolean;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
};

const variantMap = {
  default: "text-luxury-black",
  accent: "text-luxury-gold",
  muted: "text-luxury-gray-medium",
  light: "text-white",
};

export function LuxuryIcon({
  icon: Icon,
  variant = "default",
  size = "md",
  withBackground = false,
}: LuxuryIconProps) {
  const iconElement = (
    <Icon className={cn(sizeMap[size], variantMap[variant], "stroke-[1.5]")} />
  );

  if (withBackground) {
    return (
      <div className="p-3 bg-luxury-gold-10 rounded-xl inline-flex">
        {iconElement}
      </div>
    );
  }

  return iconElement;
}
```

---

## 🧩 Component Upgrades

### 1. Button Component

#### Current Issues

- Generic styling
- No luxury feel
- Missing premium variants

#### Upgraded Button Variants

```tsx
// Updated button.tsx variants
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 outline-none",
  {
    variants: {
      variant: {
        // Primary - Solid black with gold hover
        default:
          "bg-black text-white hover:bg-[#C5A572] hover:text-black border border-black hover:border-[#C5A572]",

        // Gold - Primary accent button
        gold: "bg-[#C5A572] text-black hover:bg-[#A8894E] border border-[#C5A572] hover:border-[#A8894E]",

        // Outline - Elegant border
        outline:
          "border-2 border-black text-black bg-transparent hover:bg-black hover:text-white",

        // Outline Gold - Premium outline
        "outline-gold":
          "border-2 border-[#C5A572] text-[#C5A572] bg-transparent hover:bg-[#C5A572] hover:text-black",

        // Ghost - Minimal
        ghost: "text-black hover:bg-black/5",

        // Ghost Gold - Minimal accent
        "ghost-gold": "text-[#C5A572] hover:bg-[#C5A572]/10",

        // Link - Underline style
        link: "text-black underline-offset-4 hover:underline hover:text-[#C5A572]",

        // Destructive
        destructive: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-md",
        default: "h-11 px-6 text-sm rounded-md",
        lg: "h-12 px-8 text-base rounded-md",
        xl: "h-14 px-10 text-base rounded-lg",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### 2. Card Component

#### Luxury Card Styles

```tsx
// Upgraded card variants
const cardVariants = {
  // Default - Clean white
  default: "bg-white border border-luxury-gray-light shadow-sm",

  // Elevated - Premium shadow
  elevated: "bg-white border-0 shadow-lg shadow-black/5",

  // Warm - Premium warm white
  warm: "bg-[#F8F6F3] border border-[#E5E5E5]",

  // Dark - Inverted
  dark: "bg-[#1A1A1A] text-white border-0",

  // Gold accent - With gold top border
  accent:
    "bg-white border border-luxury-gray-light border-t-2 border-t-[#C5A572]",

  // Glass - Transparent
  glass: "bg-white/80 backdrop-blur-md border border-white/20",
};
```

### 3. Input Component

#### Luxury Input Styling

```tsx
// Upgraded input styles
const inputStyles = cn(
  // Base
  "w-full h-12 px-4 text-base",
  "font-['Montserrat'] text-black placeholder:text-gray-400",

  // Border & Background
  "bg-white border border-[#E5E5E5] rounded-md",

  // Focus state - Gold accent
  "focus:outline-none focus:border-[#C5A572] focus:ring-2 focus:ring-[#C5A572]/20",

  // Transition
  "transition-all duration-200",

  // Disabled
  "disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
);
```

### 4. Badge Component

#### Luxury Badge Variants

```tsx
const badgeVariants = {
  // Default - Black
  default: "bg-black text-white font-semibold tracking-wider",

  // Gold
  gold: "bg-[#C5A572] text-black font-semibold tracking-wider",

  // Outline
  outline:
    "border-2 border-black text-black bg-transparent font-semibold tracking-wider",

  // Outline Gold
  "outline-gold":
    "border-2 border-[#C5A572] text-[#C5A572] bg-transparent font-semibold tracking-wider",

  // Soft - Muted background
  soft: "bg-black/5 text-black font-semibold tracking-wider",

  // Success
  success: "bg-emerald-500 text-white font-semibold",

  // Warning
  warning: "bg-amber-500 text-black font-semibold",

  // Error
  error: "bg-red-500 text-white font-semibold",
};
```

---

## 📄 Page-by-Page Implementation

### 1. Homepage (`/`)

#### Current State

- Uses blue (#4169e1) for denim sections
- Mixed font styling
- Generic card designs

#### Upgrades Required

```tsx
// Section Badge - Before
<Badge variant="outline" className="border-[#2c3e50] text-[#2c3e50]">
  SIGNATURE COLLECTION
</Badge>

// Section Badge - After (Luxury)
<Badge className="bg-transparent border border-[#C5A572] text-[#C5A572] px-4 py-1.5 text-xs font-semibold tracking-[0.2em]">
  SIGNATURE COLLECTION
</Badge>

// Section Heading - Before
<h2 className="text-4xl font-bold" style={{ color: "#2c3e50" }}>
  Premium Denim Jeans
  <span style={{ color: "#4169e1" }}>Engineered for Perfection</span>
</h2>

// Section Heading - After (Luxury)
<h2 className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold tracking-tight text-black">
  Premium Denim Jeans
  <span className="block text-[#C5A572]">Engineered for Perfection</span>
</h2>

// Feature List Dot - Before
<div className="h-2 w-2 rounded-full" style={{ backgroundColor: "#4169e1" }} />

// Feature List Dot - After (Luxury)
<div className="h-2 w-2 rounded-full bg-[#C5A572]" />

// CTA Button - Before
<Button className="bg-[#C5A572] hover:bg-[#B89968]">
  Shop Collection
</Button>

// CTA Button - After (Luxury)
<Button className="bg-black text-white hover:bg-[#C5A572] hover:text-black px-8 py-3 text-sm font-semibold tracking-wide transition-all duration-300">
  Shop Collection
  <ArrowRight className="ml-2 h-4 w-4" />
</Button>
```

#### Section Backgrounds

```tsx
// Current - Plain light gray
<section className="py-24 bg-[#ecf0f1]">

// Upgraded - Premium off-white with subtle pattern
<section className="py-24 bg-[#FAFAFA] relative">
  {/* Optional subtle pattern */}
  <div className="absolute inset-0 bg-[url('/assets/patterns/subtle-texture.png')] opacity-5" />
  <div className="relative z-10">
    {/* Content */}
  </div>
</section>

// Alternating Dark Section
<section className="py-24 bg-black text-white">
  {/* Content with inverted colors */}
</section>
```

### 2. Products Page (`/products`)

#### Filter Sidebar Upgrades

```tsx
// Current
<div className="bg-white rounded-lg p-4">

// Upgraded - Luxury Filter Panel
<div className="bg-[#F8F6F3] rounded-xl p-6 border border-[#E5E5E5]">
  <h3 className="font-['Playfair_Display'] text-xl font-semibold mb-6 pb-4 border-b border-[#E5E5E5]">
    Filters
  </h3>

  {/* Clear Filters Button */}
  <Button className="w-full mb-6 bg-transparent border border-black text-black hover:bg-black hover:text-white transition-all duration-300">
    Clear All Filters
  </Button>

  {/* Category Section */}
  <div className="mb-6">
    <h4 className="font-['Montserrat'] text-xs font-semibold tracking-[0.15em] uppercase mb-4 text-black/70">
      Category
    </h4>
    {/* Category items */}
  </div>
</div>
```

#### Product Card Upgrades

```tsx
// Current card
<Card className="group overflow-hidden hover:shadow-lg">

// Upgraded - Luxury Product Card
<Card className="group overflow-hidden bg-white border-0 shadow-sm hover:shadow-xl transition-all duration-500 rounded-xl">
  {/* Image Container */}
  <div className="relative aspect-[3/4] overflow-hidden bg-[#F8F6F3]">
    <Image
      src={imageUrl}
      alt={product.name}
      fill
      className="object-cover transition-transform duration-700 group-hover:scale-105"
    />

    {/* Wishlist Button - Refined */}
    <button className="absolute top-4 right-4 z-10 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-[#C5A572] hover:text-white transition-all duration-300">
      <Heart className="h-4 w-4 stroke-[1.5]" />
    </button>

    {/* Quick View on Hover */}
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
      <Button className="bg-white text-black hover:bg-[#C5A572] hover:text-black transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
        Quick View
      </Button>
    </div>
  </div>

  {/* Content */}
  <div className="p-5">
    <h3 className="font-['Playfair_Display'] text-lg font-semibold mb-2 text-black group-hover:text-[#C5A572] transition-colors duration-300">
      {product.name}
    </h3>
    <p className="font-['Montserrat'] text-sm text-gray-500 line-clamp-2 mb-3">
      {product.description}
    </p>
    <div className="flex items-center justify-between">
      <span className="font-['Montserrat'] text-xl font-semibold text-[#C5A572]">
        {formatPrice(product.price)}
      </span>
    </div>
  </div>

  {/* Action Button */}
  <div className="px-5 pb-5">
    <Button className="w-full bg-black text-white hover:bg-[#C5A572] hover:text-black transition-all duration-300 h-11">
      View Details
    </Button>
  </div>
</Card>
```

### 3. Product Detail Page (`/products/[slug]`)

#### Hero Section

```tsx
<div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
  {/* Image Gallery - Luxury Style */}
  <div className="space-y-4">
    <div className="aspect-square rounded-2xl overflow-hidden bg-[#F8F6F3]">
      <Image
        src={mainImage}
        alt={product.name}
        fill
        className="object-cover"
        priority
      />
    </div>
    {/* Thumbnail Gallery */}
    <div className="grid grid-cols-4 gap-3">
      {images.map((img, i) => (
        <button
          key={i}
          className="aspect-square rounded-lg overflow-hidden bg-[#F8F6F3] border-2 border-transparent hover:border-[#C5A572] transition-all duration-300"
        >
          <Image src={img} alt="" fill className="object-cover" />
        </button>
      ))}
    </div>
  </div>

  {/* Product Info */}
  <div className="space-y-6">
    {/* Breadcrumb */}
    <nav className="font-['Montserrat'] text-xs tracking-wide text-gray-500">
      <span className="hover:text-[#C5A572] cursor-pointer">Home</span>
      <span className="mx-2">/</span>
      <span className="hover:text-[#C5A572] cursor-pointer">Collection</span>
      <span className="mx-2">/</span>
      <span className="text-black">{product.category}</span>
    </nav>

    {/* Title */}
    <h1 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-black">
      {product.name}
    </h1>

    {/* Price */}
    <div className="flex items-center gap-4">
      <span className="font-['Montserrat'] text-3xl font-semibold text-[#C5A572]">
        {formatPrice(product.price)}
      </span>
      {product.originalPrice && (
        <span className="text-lg text-gray-400 line-through">
          {formatPrice(product.originalPrice)}
        </span>
      )}
    </div>

    {/* Stock Status */}
    <Badge className="bg-emerald-500 text-white px-4 py-1.5 text-xs font-semibold">
      In Stock
    </Badge>

    {/* Description */}
    <p className="font-['Montserrat'] text-base text-gray-600 leading-relaxed">
      {product.description}
    </p>

    {/* Quantity Selector */}
    <div className="flex items-center gap-4">
      <span className="font-['Montserrat'] text-sm font-semibold text-black">
        Quantity
      </span>
      <div className="flex items-center border border-[#E5E5E5] rounded-lg">
        <button className="h-11 w-11 flex items-center justify-center hover:bg-[#F8F6F3] transition-colors">
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-12 text-center font-semibold">1</span>
        <button className="h-11 w-11 flex items-center justify-center hover:bg-[#F8F6F3] transition-colors">
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="space-y-3 pt-4">
      <Button className="w-full h-14 bg-[#C5A572] text-black hover:bg-[#A8894E] text-base font-semibold">
        <ShoppingCart className="mr-2 h-5 w-5" />
        Add to Cart
      </Button>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-12 border-black text-black hover:bg-black hover:text-white"
        >
          <Heart className="mr-2 h-4 w-4" />
          Wishlist
        </Button>
        <Button
          variant="outline"
          className="h-12 border-black text-black hover:bg-black hover:text-white"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>
    </div>

    {/* Features */}
    <div className="border-t border-[#E5E5E5] pt-6 space-y-4">
      {features.map((feature, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="p-2 bg-[#C5A572]/10 rounded-lg">
            <feature.icon className="h-5 w-5 text-[#C5A572]" />
          </div>
          <div>
            <span className="font-['Montserrat'] text-sm font-semibold text-black">
              {feature.title}
            </span>
            <p className="text-xs text-gray-500">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
```

### 4. Cart Page (`/cart`)

```tsx
<div className="min-h-screen bg-[#FAFAFA] pt-24">
  <div className="container mx-auto px-4 py-12">
    {/* Header */}
    <div className="flex justify-between items-center mb-10">
      <div>
        <h1 className="font-['Playfair_Display'] text-4xl font-bold text-black">
          Shopping Cart
        </h1>
        <p className="font-['Montserrat'] text-gray-500 mt-2">
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </p>
      </div>

      <Button
        variant="outline"
        className="border-black text-black hover:bg-black hover:text-white"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Clear Cart
      </Button>
    </div>

    <div className="grid lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <Card className="p-6 bg-white border-0 shadow-sm rounded-xl">
            <div className="flex gap-6">
              {/* Image */}
              <div className="relative w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-[#F8F6F3]">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-grow">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-['Playfair_Display'] text-lg font-semibold text-black">
                      {item.name}
                    </h3>
                    <p className="font-['Montserrat'] text-sm text-gray-500">
                      {formatPrice(item.price)} each
                    </p>
                  </div>
                  <button className="text-gray-400 hover:text-red-500 transition-colors p-2">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                {/* Quantity & Total */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border border-[#E5E5E5] rounded-lg">
                    <button className="h-9 w-9 flex items-center justify-center hover:bg-[#F8F6F3]">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button className="h-9 w-9 flex items-center justify-center hover:bg-[#F8F6F3]">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="font-['Montserrat'] text-xl font-semibold text-[#C5A572]">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card className="p-8 bg-white border-0 shadow-sm rounded-xl sticky top-24">
          <h2 className="font-['Playfair_Display'] text-2xl font-bold text-black mb-6">
            Order Summary
          </h2>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between font-['Montserrat'] text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between font-['Montserrat'] text-gray-600">
              <span>Shipping</span>
              <span className="text-emerald-500 font-semibold">Free</span>
            </div>
            <div className="flex justify-between font-['Montserrat'] text-gray-600">
              <span>Tax (18% GST)</span>
              <span>{formatPrice(tax)}</span>
            </div>

            <div className="border-t border-[#E5E5E5] pt-4">
              <div className="flex justify-between">
                <span className="font-['Montserrat'] text-lg font-semibold text-black">
                  Total
                </span>
                <span className="font-['Montserrat'] text-2xl font-bold text-[#C5A572]">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          </div>

          <Button className="w-full h-14 bg-[#C5A572] text-black hover:bg-[#A8894E] text-base font-semibold mb-4">
            Proceed to Checkout
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 border-black text-black hover:bg-black hover:text-white"
          >
            Continue Shopping
          </Button>
        </Card>
      </div>
    </div>
  </div>
</div>
```

### 5. Contact Page (`/contact`)

```tsx
<div className="min-h-screen bg-[#FAFAFA] pt-24">
  <div className="container mx-auto px-4 py-12">
    {/* Page Header */}
    <div className="text-center mb-16">
      <Badge className="bg-transparent border border-[#C5A572] text-[#C5A572] px-4 py-1.5 text-xs font-semibold tracking-[0.2em] mb-4">
        GET IN TOUCH
      </Badge>
      <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold text-black mb-4">
        Contact Us
      </h1>
      <p className="font-['Montserrat'] text-lg text-gray-600 max-w-2xl mx-auto">
        We'd love to hear from you. Send us a message and we'll respond as soon
        as possible.
      </p>
    </div>

    <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
      {/* Contact Form */}
      <Card className="p-10 bg-white border-0 shadow-sm rounded-2xl">
        <h2 className="font-['Playfair_Display'] text-2xl font-bold text-black mb-8">
          Send us a Message
        </h2>

        <form className="space-y-6">
          <div>
            <Label className="font-['Montserrat'] text-sm font-semibold text-black mb-2 block">
              Name
            </Label>
            <Input
              placeholder="Your name"
              className="h-12 border-[#E5E5E5] focus:border-[#C5A572] focus:ring-[#C5A572]/20"
            />
          </div>

          <div>
            <Label className="font-['Montserrat'] text-sm font-semibold text-black mb-2 block">
              Email
            </Label>
            <Input
              type="email"
              placeholder="your@email.com"
              className="h-12 border-[#E5E5E5] focus:border-[#C5A572] focus:ring-[#C5A572]/20"
            />
          </div>

          <div>
            <Label className="font-['Montserrat'] text-sm font-semibold text-black mb-2 block">
              Subject
            </Label>
            <Input
              placeholder="What can we help you with?"
              className="h-12 border-[#E5E5E5] focus:border-[#C5A572] focus:ring-[#C5A572]/20"
            />
          </div>

          <div>
            <Label className="font-['Montserrat'] text-sm font-semibold text-black mb-2 block">
              Message
            </Label>
            <Textarea
              rows={6}
              placeholder="Tell us more about your inquiry..."
              className="border-[#E5E5E5] focus:border-[#C5A572] focus:ring-[#C5A572]/20 resize-none"
            />
          </div>

          <Button className="w-full h-14 bg-[#C5A572] text-black hover:bg-[#A8894E] text-base font-semibold">
            <Send className="mr-2 h-5 w-5" />
            Send Message
          </Button>
        </form>

        <p className="font-['Montserrat'] text-sm text-gray-500 text-center mt-6">
          We'll get back to you within 24-48 hours
        </p>
      </Card>

      {/* Contact Info */}
      <div className="space-y-6">
        <Card className="p-8 bg-white border-0 shadow-sm rounded-2xl">
          <h2 className="font-['Playfair_Display'] text-2xl font-bold text-black mb-8">
            Get in Touch
          </h2>

          <div className="space-y-6">
            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#C5A572]/10 rounded-xl">
                <Mail className="h-6 w-6 text-[#C5A572]" />
              </div>
              <div>
                <h3 className="font-['Montserrat'] font-semibold text-black mb-1">
                  Email
                </h3>
                <p className="text-gray-600">support@foalrider.com</p>
                <p className="text-gray-600">sales@foalrider.com</p>
              </div>
            </div>

            <div className="h-px bg-[#E5E5E5]" />

            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#C5A572]/10 rounded-xl">
                <Phone className="h-6 w-6 text-[#C5A572]" />
              </div>
              <div>
                <h3 className="font-['Montserrat'] font-semibold text-black mb-1">
                  Phone
                </h3>
                <p className="text-gray-600">+91 98765 43210</p>
                <p className="text-sm text-gray-500">Mon-Sat, 9AM-6PM IST</p>
              </div>
            </div>

            <div className="h-px bg-[#E5E5E5]" />

            {/* Address */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#C5A572]/10 rounded-xl">
                <MapPin className="h-6 w-6 text-[#C5A572]" />
              </div>
              <div>
                <h3 className="font-['Montserrat'] font-semibold text-black mb-1">
                  Office
                </h3>
                <p className="text-gray-600">123 Fashion Street</p>
                <p className="text-gray-600">Mumbai, Maharashtra 400001</p>
                <p className="text-gray-600">India</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Business Hours */}
        <Card className="p-8 bg-[#F8F6F3] border border-[#E5E5E5] rounded-2xl">
          <h3 className="font-['Playfair_Display'] text-xl font-bold text-black mb-6">
            Business Hours
          </h3>
          <div className="space-y-3 font-['Montserrat']">
            <div className="flex justify-between">
              <span className="text-gray-600">Monday - Friday</span>
              <span className="font-semibold text-black">
                9:00 AM - 6:00 PM
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Saturday</span>
              <span className="font-semibold text-black">
                10:00 AM - 4:00 PM
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sunday</span>
              <span className="font-semibold text-red-500">Closed</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</div>
```

---

## ✨ Animation & Micro-interactions

### CSS Transitions

```css
/* Smooth transitions for all interactive elements */
.luxury-transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover lift effect */
.luxury-lift {
  transition: all 0.3s ease;
}
.luxury-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

/* Subtle scale on hover */
.luxury-scale {
  transition: transform 0.5s ease;
}
.luxury-scale:hover {
  transform: scale(1.02);
}

/* Image zoom on card hover */
.luxury-image-zoom {
  transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}
.group:hover .luxury-image-zoom {
  transform: scale(1.05);
}

/* Fade up animation */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-up {
  animation: fadeUp 0.6s ease forwards;
}

/* Staggered animations for lists */
.stagger-1 {
  animation-delay: 0.1s;
}
.stagger-2 {
  animation-delay: 0.2s;
}
.stagger-3 {
  animation-delay: 0.3s;
}
.stagger-4 {
  animation-delay: 0.4s;
}
```

### Button Interactions

```tsx
// Add to existing button styles
<Button
  className="
  relative overflow-hidden
  before:absolute before:inset-0 
  before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent
  before:translate-x-[-200%] hover:before:translate-x-[200%]
  before:transition-transform before:duration-700
"
>
  Button Text
</Button>
```

### Loading States

```tsx
// Skeleton with gold shimmer
<div className="animate-pulse bg-gradient-to-r from-gray-200 via-[#C5A572]/20 to-gray-200 bg-[length:400%_100%] animate-shimmer rounded-lg h-48" />

@keyframes shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

.animate-shimmer {
  animation: shimmer 2s infinite linear;
}
```

---

## ✅ Implementation Checklist

### Phase 1: Foundation (Day 1)

- [ ] Update `globals.css` with luxury CSS variables
- [ ] Add new font weights and tracking utilities
- [ ] Create luxury utility classes
- [ ] Update Tailwind config with brand colors

### Phase 2: Core Components (Day 2)

- [ ] Upgrade `button.tsx` with luxury variants
- [ ] Upgrade `card.tsx` with luxury variants
- [ ] Upgrade `input.tsx` with luxury styling
- [ ] Upgrade `badge.tsx` with luxury variants
- [ ] Create `LuxuryIcon` wrapper component

### Phase 3: Layout Components (Day 3)

- [ ] Refine Header component styling
- [ ] Create/Update Footer component
- [ ] Update page backgrounds to off-white

### Phase 4: Page Updates (Day 4-5)

- [ ] Homepage - Update all sections
- [ ] Products page - Update filters and grid
- [ ] Product detail page - Upgrade layout
- [ ] Cart page - Luxury styling
- [ ] Contact page - Luxury forms
- [ ] About page - Content sections
- [ ] Profile/Account pages

### Phase 5: Refinements (Day 6)

- [ ] Add micro-interactions and animations
- [ ] Test responsive behavior
- [ ] Optimize images
- [ ] Ensure accessibility compliance

### Phase 6: Quality Assurance (Day 7)

- [ ] Cross-browser testing
- [ ] Performance audit
- [ ] Accessibility audit
- [ ] Final polish and tweaks

---

## 🎯 Quick Reference - Common Patterns

### Section Container

```tsx
<section className="py-20 md:py-24 bg-[#FAFAFA]">
  <div className="container mx-auto px-4 max-w-7xl">{/* Content */}</div>
</section>
```

### Section Header

```tsx
<div className="text-center mb-12 md:mb-16">
  <Badge className="bg-transparent border border-[#C5A572] text-[#C5A572] px-4 py-1.5 text-xs font-semibold tracking-[0.2em] mb-4">
    SECTION LABEL
  </Badge>
  <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-black mb-4">
    Section Title
  </h2>
  <p className="font-['Montserrat'] text-lg text-gray-600 max-w-2xl mx-auto">
    Section description text goes here.
  </p>
</div>
```

### Feature Item

```tsx
<div className="flex items-start gap-4">
  <div className="p-3 bg-[#C5A572]/10 rounded-xl flex-shrink-0">
    <Icon className="h-6 w-6 text-[#C5A572]" />
  </div>
  <div>
    <h4 className="font-['Montserrat'] font-semibold text-black mb-1">
      Feature Title
    </h4>
    <p className="font-['Montserrat'] text-sm text-gray-600">
      Feature description.
    </p>
  </div>
</div>
```

### Gold CTA Button

```tsx
<Button className="bg-[#C5A572] text-black hover:bg-[#A8894E] h-12 px-8 font-semibold">
  Call to Action
  <ArrowRight className="ml-2 h-4 w-4" />
</Button>
```

### Black Outline Button

```tsx
<Button className="bg-transparent border-2 border-black text-black hover:bg-black hover:text-white h-12 px-8 font-semibold transition-all duration-300">
  Secondary Action
</Button>
```

---

**Ready to implement!** Start with Phase 1 and work through systematically.
