# 📐 FIGMA DESIGN SYSTEM FOR "FOAL RIDER" TEXTILE STORE
**Premium E-commerce Experience | Complete Page Library**

## 📋 FIGMA FILE STRUCTURE

**Main File: "Foal Rider - Premium Textile Store"**
```
Pages:
- 🏠 Home
- 🛍️ Product Listing
- 👗 Product Detail
- 🛒 Cart & Checkout
- 📋 Account & Orders
- 📄 About Us
- 📰 Journal
- 📞 Contact
- ❌ Error Pages
- 🎨 Design System

Components:
- Header
- Footer
- Product Card
- Hero Section
- Form Elements
- Navigation Links
- Error States
- Loading Indicators
```

---

## 🎨 PAGE-BY-PAGE DESIGN BREAKDOWN

### 1. 🏠 HOME PAGE

**Desktop Version:**
```
[Hero Section: Full-width]
- Background: High-resolution linen texture
- Overlay: 20% dark gradient
- Content:
  - H1: "TIMELESS TEXTILES" (Playfair Display, 72px, #2c3e50)
  - Subheading: "Crafted with Tradition, Designed for Today" (Montserrat, 24px, #7f8c8d)
  - CTA Button: "Explore Collections" (Montserrat, 18px, #ecf0f1 bg, #2c3e50 text)

[Featured Collections: 3-column grid]
- Collection 1: "Spring Breeze" - Pastel linens
- Collection 2: "Heritage Weaves" - Traditional patterns  
- Collection 3: "Modern Minimal" - Solid colors

[Best Sellers: 4-column carousel]
- Premium cotton sateen
- Organic linen blend
- Silk satin pillows
- Wool throw blankets

[Newsletter Signup: Full-width banner]
- "Subscribe to Our Elegance Newsletter"
- Email input + Subscribe button
```

**Mobile Version:**
```
[Stacked layout]
- Hero section full-screen
- Collections: 2-column grid
- Best sellers: Vertical scroll
- Newsletter: Fixed bottom bar
```

---

### 2. 🛍️ PRODUCT LISTING PAGE

**Desktop Version:**
```
[Header + Search Bar]
[Filter Sidebar: Left column, 250px]
- Categories: Fabrics | Home Decor | Garments
- Price Range: $50-$500
- Color: Blue | Green | Neutral
- Fabric: Cotton | Linen | Silk
- Sort: New Arrivals | Price | Popularity

[Product Grid: 4-column layout]
- Product Card components with hover effects
- Quick view button on hover
- Sale badges (15% off, 25% off)
- New arrival tags

[Pagination: Bottom center]
- Page numbers + Load more button
```

**Mobile Version:**
```
[Header + Filter dropdown]
[Stacked product cards]
[Infinite scroll]
[Bottom navigation bar with filters]
```

---

### 3. 👗 PRODUCT DETAIL PAGE

**Desktop Version:**
```
[Two-column layout]
[Left: Image Gallery]
- Main image (800x600px) + 4 thumbnails
- Lightbox icon
- Zoom controls
- 360° view button

[Right: Product Information]
- H1: "Organic Cotton Sateen Sheet Set" (Playfair Display, 48px)
- Price: "$299.00" (larger font)
- SKU: "OCSS-001"
- Size selector: Twin | Full | Queen | King
- Quantity selector (+/- buttons)
- Add to Cart button (primary)
- Wishlist icon (secondary)

[Description Tabs]
- Details: Fabric composition, care instructions
- Specifications: Thread count, dimensions, weight
- Care: Machine wash instructions, drying

[Related Products: 3-column carousel]
- "Complete the Look" suggestions
```

**Mobile Version:**
```
[Single-column layout]
- Image swipe gallery
- Product info below
- Expanded tabs
- Sticky add to cart button
```

---

### 4. 🛒 CART & CHECKOUT

**Cart Page:**
```
[Header + Mini Cart sidebar]
[Cart Items: Vertical list]
- Product image + thumbnails
- Title + variations
- Quantity + Remove button
- Price breakdown

[Sidebar Summary]
- Subtotal
- Shipping estimate
- Taxes
- Total
- Apply coupon field
- Checkout button
```

**Checkout Pages (4-step progress):**
```
[Progress Bar: 1. Shipping | 2. Payment | 3. Review | 4. Complete]

[Step 1: Shipping Information]
- Billing same as shipping toggle
- Address form with auto-fill
- Shipping method selector

[Step 2: Payment Information]
- Stripe Elements embedded
- Apple Pay/Google Pay buttons
- CVV help tooltip

[Step 3: Order Review]
- Summary of all items
- Shipping address
- Payment method
- Place Order button

[Step 4: Thank You]
- Order confirmation number
- Estimated delivery
- Continue shopping button
```

---

### 5. 📋 ACCOUNT & ORDERS

**Dashboard:**
```
[Header + Sidebar Navigation]
- Dashboard
- Orders
- Addresses
- Payment Methods
- Wishlist
- Settings

[Orders List: Main content]
- Order number + Date
- Status: Pending | Processing | Shipped | Delivered
- View Order button
- Reorder button
```

**Order Detail:**
```
[Header + Order Summary sidebar]
[Order Timeline: Top section]
- Status indicators with dates

[Order Items: Main content]
- Product details
- Quantity + Price
- Delivery date
- Tracking information

[Return/Refund Request button]
```

---

### 6. 📄 ABOUT US PAGE

**Desktop Version:**
```
[Header + Hero Section]
- Background: Studio shot of team
- H1: "Our Story"
- Subheading: "Crafting Elegance Since 2024"

[About Us Content: 2-column layout]
- Brand philosophy
- Craftsmanship process
- Sustainable practices
- Team introduction

[Our Workshop: Image gallery]
- Behind-the-scenes photos
- Artisan portraits

[Testimonials: Carousel]
- Customer reviews with photos
```

**Mobile Version:**
```
[Single-column layout]
- Expanded sections
- Swipeable gallery
- Collapsed navigation
```

---

### 7. 📰 JOURNAL PAGE

**Desktop Version:**
```
[Header + Hero Section]
- Background: Lifestyle photography
- H1: "The Foal Rider Journal"
- Subheading: "Stories Behind Our Textiles"

[Blog List: 3-column grid]
- Featured image
- Title + Excerpt
- Categories: Design | Craftsmanship | Sustainability
- Read More button

[Load More button: Bottom center]
```

**Mobile Version:**
```
[Single-column layout]
- Masonry grid layout
- Infinite scroll
```

---

### 8. 📞 CONTACT PAGE

**Desktop Version:**
```
[Header + Hero Section]
- Background: Map location
- H1: "Get in Touch"
- Subheading: "We're Here to Help"

[Contact Form: 2-column layout]
- Name + Email + Phone + Message fields
- CAPTCHA verification
- Send Message button

[Contact Information: Sidebar]
- Email: hello@foalrider.com
- Phone: +1 234 567 8900
- Address: 123 Textile Lane, Fashion City
- Social media icons

[Opening Hours: Bottom section]
- Monday-Friday: 9AM-6PM
- Saturday: 10AM-4PM
- Sunday: Closed
```

**Mobile Version:**
```
[Single-column layout]
- Contact form first
- Information below
- Click-to-call buttons
```

---

## 🎨 DESIGN SYSTEM COMPONENTS

### 1. HEADER

**Desktop Version:**
```
[Left: Logo "FOAL RIDER" - Playfair Display, 36px]
[Center: Navigation Links (20px spacing)]
- Home | Collections | About Us | Journal | Contact
[Right: Actions]
- Search icon
- Account icon
- Cart icon (with count badge)
```

**Mobile Version:**
```
[Hamburger Menu icon]  [Logo centered]  [Cart icon]
[Expanded Menu: Full-screen overlay]
```

### 2. FOOTER

**Desktop Version:**
```
[Row 1: Company Info]
- Logo + Tagline: "Crafting Elegance Since 2024"
- Links: Privacy Policy | Terms | Contact

[Row 2: Navigation]
- Collections | About Us | Journal | Support

[Row 3: Social Media]
- Instagram | Pinterest | Facebook

[Row 4: Newsletter]
- "Subscribe to Our Newsletter"
- Email input + Subscribe button
```

**Mobile Version:**
```
[Stacked sections]
- Collapsed navigation
- Social media icons horizontal
- Newsletter at bottom
```

### 3. PRODUCT CARD

**Desktop Version:**
```
[Card with subtle shadow]
[Top: Product Image - Hover zoom 1.1x]
[Body: 
  - H3 Product Title
  - Price (larger font)
  - Quick view button
]
[Footer: 
  - Stars rating
  - Add to cart button
  - Wishlist icon
]
```

**Hover State:**
```
- Box-shadow: 0 8px 16px rgba(0,0,0,0.1)
- Transform: translateY(-5px)
- Border color: var(--accent)
```

### 4. HERO SECTION

**Variations:**
```
1. Lifestyle Image: Model wearing textile
   - Overlay: Dark gradient 20%
   - Text: Centered, white color

2. Product Close-up: Fabric texture details
   - Overlay: Light gradient 10%
   - Text: Bottom left, dark color

3. Studio Shot: Product display
   - Overlay: None
   - Text: Centered, contrast color
```

### 5. FORM ELEMENTS

**Input Fields:**
```
- Label above input
- Soft border: 1px solid #ddd
- Active state: Border color var(--accent)
- Placeholder color: var(--text-light)
- Error state: Red border + icon
```

**Buttons:**
```
- Primary: Background var(--accent), Text white, 20px padding
- Secondary: Background transparent, Border var(--accent), Text var(--accent), 20px padding
- Ghost: Background transparent, Border none, Text var(--text-primary), 20px padding
- Hover state: 10% darker background
```

---

## 📋 FIGMA VARIABLES & STYLES

### 1. COLORS

```figma
--colors: {
  primary: "#2c3e50",      // Midnight Blue
  secondary: "#bdc3c7",    // Ash Gray
  accent: "#f1c40f",      // Mustard Yellow
  background: "#ecf0f1",   // Cloud White
  textPrimary: "#2c3e50",   // Dark Text
  textSecondary: "#7f8c8d", // Light Text
  textLight: "#ecf0f1",    // White Text
  linenWhite: "#f9f9f9",   // Off-white Linen
  woolGray: "#d3d3d3",     // Soft Wool Gray
  silkBeige: "#f5f5dc",    // Silk Beige
  denimBlue: "#4169e1"     // Premium Denim
}
```

### 2. TYPOGRAPHY

```figma
--typography: {
  familyHeading: "Playfair Display, serif",
  familyBody: "Montserrat, sans-serif",
  sizeH1: "48px 700",
  sizeH2: "36px 700",
  sizeH3: "28px 700",
  sizeBody: "16px 400",
  sizeButton: "16px 500",
  lineHeight: "1.4"
}
```

### 3. SPACING

```figma
--spacing: {
  xs: "4px",  // Extra Small
  sm: "8px",  // Small
  md: "16px", // Medium
  lg: "24px", // Large
  xl: "32px", // Extra Large
  xxl: "48px"  // Extra Extra Large
}
```

---

## 🎯 DESIGN SYSTEM GUIDELINES

### 1. COMPONENT USAGE

**Header Responsiveness:**
```
Breakpoints:
- Desktop: >1200px - Full navigation
- Tablet: 768-1200px - Collapsed navigation with dropdown
- Mobile: <768px - Hamburger menu
```

**Product Card Variations:**
```
- Hover effect: Desktop only
- Quick view: Desktop & Tablet
- Touch targets: Minimum 44px for mobile
- Image zoom: 1.1x on hover/tap
```

### 2. ACCESSIBILITY STANDARDS

**WCAG 2.1 Compliance:**
```
- Color contrast: AA standard (4.5:1)
- Text size: Minimum 16px for body
- Alt text for all images
- Keyboard navigation for all interactive elements
- ARIA labels for screen readers
- Focus states for all buttons
```

### 3. PERFORMANCE OPTIMIZATION

**Design for Speed:**
```
- Max image size: 800x600px for web
- SVGs for icons and logos
- CSS gradients for effects
- Minimal box shadows
- Optimized typography loading
```

---

## 🚀 NEXT STEPS FOR FIGMA

1. **Create Figma file** with the above structure
2. **Implement components** in components panel
3. **Set up design system** with variables
4. **Create responsive variants** for all pages
5. **Prototype interactions** (hover, click, transitions)
6. **Share with development team** via Figma Dev Mode

---

**"Foal Rider" Figma design system is complete! This premium textile experience will set you apart from competitors.**

**Ready to share the Figma file link? Or need clarification on any specific page design?**