# 🎨 FoalRider - Adidas/Calvin Klein Style Redesign

> **Document Version**: 1.0  
> **Created**: December 2, 2025  
> **Status**: In Progress  
> **Reference**: Adidas.com, Calvin Klein, Nike, Zara

---

## 📊 Design Analysis

### Current Issues Identified

| Issue                        | Severity    | Description                                               |
| ---------------------------- | ----------- | --------------------------------------------------------- |
| **Typography Inconsistency** | 🔴 Critical | Fonts look the same size everywhere - lacks hierarchy     |
| **Pricing Display**          | 🔴 Critical | Price styling is basic/generic, not aesthetic             |
| **Product Cards**            | 🟠 High     | Using default bordered card style - not clean like Adidas |
| **Mobile Grid**              | 🟠 High     | Single column on mobile - should be 2 columns like Adidas |
| **Color Usage**              | 🟡 Medium   | Gold color overused - needs more balance with black       |
| **Homepage Layout**          | 🔴 Critical | Too text-heavy, boring sections                           |
| **Mobile Navigation**        | 🟠 High     | Missing bottom navigation bar like Adidas                 |
| **Visual Hierarchy**         | 🔴 Critical | Everything looks equal - no emphasis on key elements      |

---

## 🔍 Adidas Design Analysis

### Typography System (Adidas)

```
Display Headlines:    AdihausDIN / 72-96px / Bold / Uppercase
Section Headlines:    AdihausDIN / 32-48px / Bold
Product Names:        AdihausDIN / 14-16px / Bold
Price - Sale:         AdihausDIN / 16px / Bold / #FF0000 (Red)
Price - Original:     AdihausDIN / 14px / Regular / #767677 (Strikethrough)
Body Text:            AdihausDIN / 14px / Regular / #000000
Category Labels:      AdihausDIN / 12px / Regular / #767677
```

### Product Card Style (Adidas)

- **NO visible borders** - clean edge-to-edge design
- **Minimal shadows** - almost flat
- **Large product image** - takes 80% of card
- **Wishlist heart** - top right, minimal outline icon
- **Price below image** - red for sale, black for regular
- **Product name** - black, simple, no description
- **Category tag** - small gray text

### Grid Layout (Adidas)

```
Desktop:  4 columns (25% each)
Tablet:   3 columns (33% each)
Mobile:   2 columns (50% each) ← KEY DIFFERENCE
```

### Color Palette (Adidas)

```
Primary Black:    #000000
Secondary Gray:   #767677
Sale Red:         #FF0000 / #CF0000
Background:       #FFFFFF
Hover Gray:       #ECEFF1
Border Gray:      #E5E5E5
```

---

## 🔍 Calvin Klein Design Analysis

### Typography System (Calvin Klein)

```
Display:          CK Sans / 48-64px / Light / Uppercase / Letter-spacing: 0.2em
Headlines:        CK Sans / 24-32px / Regular
Product Names:    CK Sans / 14px / Regular / #000000
Prices:           CK Sans / 14px / Medium / #000000
Body:             CK Sans / 14px / Regular / #666666
Labels:           CK Sans / 11px / Medium / Uppercase
```

### Key Design Elements

- **Minimal, clean aesthetic**
- **High-contrast black and white**
- **Full-bleed imagery**
- **Generous whitespace**
- **No heavy shadows or borders**

---

## 🎯 New Design System for FoalRider

### Typography Scale (Inspired by Adidas + Luxury)

```css
/* Display - Hero Headlines */
.fr-display {
  font-family: "Montserrat", sans-serif;
  font-size: 64px / 72px (mobile/desktop);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  line-height: 1;
}

/* H1 - Section Headlines */
.fr-h1 {
  font-family: "Montserrat", sans-serif;
  font-size: 36px / 48px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: -0.01em;
}

/* H2 - Subsections */
.fr-h2 {
  font-family: "Montserrat", sans-serif;
  font-size: 24px / 32px;
  font-weight: 600;
}

/* H3 - Card Titles */
.fr-h3 {
  font-family: "Montserrat", sans-serif;
  font-size: 16px / 18px;
  font-weight: 600;
}

/* Product Name - Clean & Simple */
.fr-product-name {
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  line-height: 1.3;
}

/* Price - Sale Price (Stand out) */
.fr-price-sale {
  font-family: "Montserrat", sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #cf0000; /* Bold red like Adidas */
}

/* Price - Regular */
.fr-price {
  font-family: "Montserrat", sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #000000;
}

/* Price - Original (Strikethrough) */
.fr-price-original {
  font-family: "Montserrat", sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: #767677;
  text-decoration: line-through;
}

/* Category/Meta Text */
.fr-meta {
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: #767677;
}

/* Labels/Badges */
.fr-label {
  font-family: "Montserrat", sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Body Text */
.fr-body {
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #4b5563;
  line-height: 1.6;
}
```

### Color Palette (Refined)

```css
/* Primary */
--fr-black: #000000;
--fr-white: #ffffff;

/* Accent - Gold (Used sparingly) */
--fr-gold: #c5a572;
--fr-gold-light: #d4b98a;

/* Functional */
--fr-sale: #cf0000; /* Sale prices - RED */
--fr-success: #00a000; /* In stock */
--fr-warning: #ff6b00; /* Low stock */

/* Neutral Grays */
--fr-gray-900: #1a1a1a;
--fr-gray-700: #4b5563;
--fr-gray-500: #767677;
--fr-gray-300: #e5e5e5;
--fr-gray-100: #f5f5f5;
--fr-gray-50: #fafafa;
```

---

## 📱 Implementation Plan

### Phase 1: Typography & Color System ⏳ In Progress

**Status**: 🟡 Started  
**Files to Update**:

- [ ] `globals.css` - New typography classes
- [ ] `tailwind.config.ts` - Extended theme

### Phase 2: Product Card Redesign ⏳ Pending

**Status**: 🔴 Not Started  
**Key Changes**:

- [ ] Remove card borders completely
- [ ] Remove shadows (flat design)
- [ ] Larger image area (aspect-ratio 4:5)
- [ ] Minimal wishlist icon (outline heart)
- [ ] Clean price display (red for sale)
- [ ] Product name only (no description on card)
- [ ] Category as small gray text

**Reference - New ProductCard Structure**:

```tsx
<div className="product-card group">
  {/* Image Container - Full width, no border */}
  <div className="relative aspect-[4/5] bg-[#F5F5F5]">
    <Image />
    {/* Wishlist - Top right, minimal */}
    <button className="absolute top-3 right-3">
      <Heart className="w-5 h-5 stroke-1" />
    </button>
  </div>

  {/* Info - Minimal padding */}
  <div className="pt-3 pb-2">
    {/* Price Row */}
    <div className="flex items-center gap-2 mb-1">
      <span className="fr-price-sale">$65.40</span>
      <span className="fr-price-original">$109</span>
      <span className="fr-label text-[#CF0000]">-40%</span>
    </div>

    {/* Product Name */}
    <h3 className="fr-product-name">NY 90 Shoes</h3>

    {/* Category */}
    <p className="fr-meta mt-0.5">Originals</p>
  </div>
</div>
```

### Phase 3: Grid Layout (Mobile 2-Column) ⏳ Pending

**Status**: 🔴 Not Started  
**Changes**:

```tsx
// OLD
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// NEW - 2 columns on mobile, 3 on tablet, 4 on desktop
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
```

### Phase 4: Mobile Bottom Navigation ⏳ Pending

**Status**: 🔴 Not Started  
**Design**:

```tsx
// Fixed bottom nav on mobile (hidden on desktop)
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-50">
  <div className="flex justify-around py-2">
    <NavItem icon={Home} label="Home" />
    <NavItem icon={Search} label="Search" />
    <NavItem icon={Heart} label="Wishlist" />
    <NavItem icon={ShoppingBag} label="Bag" />
    <NavItem icon={User} label="Account" />
  </div>
</nav>
```

### Phase 5: Homepage Redesign ⏳ Pending

**Status**: 🔴 Not Started  
**Key Changes**:

- Full-width hero banner with bold typography
- Category grid (2 columns mobile)
- Product carousels (horizontal scroll)
- Less text, more imagery
- Bold headlines with uppercase text

### Phase 6: Pricing Display Enhancement ⏳ Pending

**Status**: 🔴 Not Started  
**New Features**:

- Sale prices in RED (#CF0000)
- Original price with strikethrough in gray
- Discount percentage badge
- Clean formatting

---

## 📋 Detailed Task Checklist

### Typography Updates

- [ ] Create new typography classes in globals.css
- [ ] Update Montserrat as primary font (not Playfair)
- [ ] Add uppercase headline styles
- [ ] Create price-specific classes

### ProductCard.tsx

- [ ] Remove Card component wrapper
- [ ] Remove border and shadow
- [ ] Use flat background (#F5F5F5)
- [ ] Update aspect ratio to 4:5
- [ ] Simplify wishlist button (outline only)
- [ ] Remove description from card
- [ ] Add price with sale styling
- [ ] Add category text

### ProductGrid.tsx

- [ ] Change to 2-column on mobile
- [ ] Reduce gap for tighter grid
- [ ] Add "X of Y items" counter

### MobileNavigation.tsx (New)

- [ ] Create new component
- [ ] Fixed bottom position
- [ ] 5 items: Home, Search, Wishlist, Cart, Account
- [ ] Active state indicator
- [ ] Hide on desktop

### Homepage

- [ ] Bold hero with large text
- [ ] Category cards (2 cols mobile)
- [ ] Featured products carousel
- [ ] Reduce text content
- [ ] Add more visual elements

### Header Updates

- [ ] Adjust for mobile bottom nav
- [ ] Simplify mobile header
- [ ] Keep cart count visible

---

## 🎨 Visual Reference

### Product Card - Target Design

```
┌────────────────────────────┐
│                        ♡   │  ← Outline heart (top-right)
│                            │
│      [PRODUCT IMAGE]       │  ← Large, centered
│         4:5 ratio          │
│                            │
│                            │
├────────────────────────────┤
│ $65.40 $109 -40%           │  ← Red sale, gray original
│ NY 90 Shoes                │  ← Product name (bold)
│ Originals                  │  ← Category (gray, small)
└────────────────────────────┘
```

### Mobile Grid - Target Layout

```
┌─────────┬─────────┐
│ Product │ Product │
│    1    │    2    │
├─────────┼─────────┤
│ Product │ Product │
│    3    │    4    │
├─────────┼─────────┤
│ Product │ Product │
│    5    │    6    │
└─────────┴─────────┘
    2 columns on mobile
```

### Mobile Bottom Navigation

```
┌────────────────────────────────┐
│   🏠     🔍     ♡     🛒    👤  │
│  Home  Search Wish   Bag  User │
└────────────────────────────────┘
    Fixed at bottom on mobile
```

---

## ✅ Implementation Status

| Task                  | Status      | Notes                             |
| --------------------- | ----------- | --------------------------------- |
| Design Analysis       | ✅ Complete | Analyzed Adidas + CK              |
| Typography System     | ✅ Complete | New .fr-\* classes in globals.css |
| Product Card Redesign | ✅ Complete | Clean, borderless, Adidas-style   |
| Mobile 2-Column Grid  | ✅ Complete | grid-cols-2 on mobile             |
| Mobile Bottom Nav     | ✅ Complete | New MobileBottomNav component     |
| Homepage Redesign     | ✅ Complete | Bold hero, clean sections         |
| Price Display         | ✅ Complete | New fr-price-\* classes           |

---

## 🎉 Changes Made

### 1. Typography System (`globals.css`)

- Added new `.fr-display`, `.fr-h1`, `.fr-h2`, `.fr-h3` classes
- Added `.fr-product-name` for clean product titles
- Added `.fr-price`, `.fr-price-sale`, `.fr-price-original` for pricing
- Added `.fr-meta`, `.fr-label`, `.fr-body` for body text
- Updated existing `.luxury-*` classes to use Montserrat (not Playfair)
- All fonts now use Montserrat for consistent, modern look

### 2. ProductCard (`ProductCard.tsx`)

- Removed Card component wrapper (cleaner, no borders)
- Changed to flat background (#F5F5F5) like Adidas
- Updated aspect ratio to 4:5 (more product-focused)
- Simplified wishlist button (outline heart, top-right)
- Removed product description from card
- Added category text below product name
- Clean price styling with sale support

### 3. ProductGrid (`ProductGrid.tsx`)

- Changed to 2 columns on mobile (was 1)
- 3 columns on tablet, 4 on desktop
- Reduced gap for tighter, cleaner look
- Updated item count text styling

### 4. MobileBottomNav (NEW)

- Created new component at `components/layout/MobileBottomNav.tsx`
- Fixed position at bottom on mobile (hidden on md+)
- 5 items: Home, Search, Wishlist, Bag, Account
- Shows badge count for cart and wishlist
- Clean, minimal design like Adidas app

### 5. ClientLayout Update

- Added MobileBottomNav to layout
- Added bottom padding on mobile for nav bar
- Hides nav on admin/checkout pages

### 6. Homepage (`page.tsx`)

- Complete redesign with bold typography
- Full-height hero section with large text
- 2-column category grid (Men/Women)
- Clean product grid using ProductCard
- Banner section with overlaid text
- Stats section with clean layout
- Minimal footer design

---

## 🚀 Next Steps (Optional Enhancements)

1. **Horizontal Product Carousel** - Add swipeable product sections
2. **Search Page Enhancement** - Add filters sidebar on mobile
3. **Cart Page Redesign** - Apply same minimal styling
4. **Product Detail Page** - Update to match new design system
5. **Add "On Sale" functionality** - Enable sale pricing display

---

_Last Updated: December 2, 2025_
_Status: ✅ IMPLEMENTATION COMPLETE_
