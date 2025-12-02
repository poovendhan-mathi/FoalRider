# Foal Rider Brand Theme Colors

## Official Brand Color Palette

The Foal Rider brand uses a sophisticated three-color theme that represents luxury, elegance, and timelessness.

---

## Primary Colors

### 1. Black - Primary Background

| Property         | Value                                           |
| ---------------- | ----------------------------------------------- |
| **Hex**          | `#000000`                                       |
| **RGB**          | `rgb(0, 0, 0)`                                  |
| **CSS Variable** | `--brand-primary`                               |
| **Tailwind**     | `bg-black` or `bg-black/75` (with transparency) |

**Usage:**

- Header background
- Footer background
- Primary buttons
- Text on light backgrounds
- Navigation elements

**Symbolism:** Strength, elegance, timelessness

---

### 2. Gold - Accent Color

| Property         | Value                              |
| ---------------- | ---------------------------------- |
| **Hex**          | `#C5A572`                          |
| **RGB**          | `rgb(197, 165, 114)`               |
| **CSS Variable** | `--brand-accent`                   |
| **Tailwind**     | `text-[#C5A572]` or `bg-[#C5A572]` |

**Usage:**

- Logo color
- Hover states on navigation
- Accent text and headings
- Call-to-action highlights
- Links on dark backgrounds
- Section dividers and borders

**Symbolism:** Luxury, craftsmanship, refinement

---

### 3. White - Neutral/Background

| Property         | Value                      |
| ---------------- | -------------------------- |
| **Hex**          | `#FFFFFF`                  |
| **RGB**          | `rgb(255, 255, 255)`       |
| **CSS Variable** | `--brand-neutral`          |
| **Tailwind**     | `bg-white` or `text-white` |

**Usage:**

- Page backgrounds
- Text on dark backgrounds
- Card backgrounds
- Content areas
- Form inputs

**Symbolism:** Purity, simplicity, sophistication

---

## Color Combinations

### Header & Footer

```css
/* Background */
background: rgba(0, 0, 0, 0.75); /* black/75 */
backdrop-filter: blur(12px);

/* Text */
color: rgba(255, 255, 255, 0.9); /* white/90 */

/* Hover State */
color: #c5a572; /* Gold */
```

### Navigation Links

```css
/* Default */
color: rgba(255, 255, 255, 0.9);

/* Hover */
color: #c5a572;
transition: color 150ms;
```

### Buttons

```css
/* Primary Button */
background-color: #000000;
color: #ffffff;

/* Primary Button Hover */
background-color: #c5a572;
color: #000000;

/* Outline Button */
border-color: #c5a572;
color: #c5a572;
```

---

## CSS Variables (globals.css)

```css
:root {
  /* Foal Rider Brand Colors - Official Guidelines */
  --brand-primary: #000000; /* Black */
  --brand-accent: #c5a572; /* Gold */
  --brand-secondary: #2e2e2e; /* Charcoal (supporting) */
  --brand-neutral: #ffffff; /* White */
}
```

---

## Tailwind Usage Examples

### Header Component

```tsx
<header className="bg-black/75 backdrop-blur-md">
  <nav className="text-white/90 hover:text-[#C5A572]">...</nav>
</header>
```

### Footer Component

```tsx
<footer className="bg-black/75 backdrop-blur-md text-white">
  <h3 className="text-[#C5A572]">Section Title</h3>
  <a className="text-white/70 hover:text-[#C5A572]">Link</a>
</footer>
```

### Logo

```tsx
<img src="/assets/logo/Gold.png" alt="Foal Rider" />
<span className="text-[#C5A572]">FOAL RIDER</span>
```

---

## Accessibility Notes

- Gold (#C5A572) on Black (#000000): Contrast ratio 7.2:1 ✅ (AAA)
- White (#FFFFFF) on Black (#000000): Contrast ratio 21:1 ✅ (AAA)
- Gold (#C5A572) on White (#FFFFFF): Contrast ratio 2.9:1 ⚠️ (Use for decorative only)

For text on white backgrounds, use black (#000000) for body text to ensure readability.

---

## File References

- Logo files: `/public/assets/logo/`
  - `Gold.png` - Gold logo for dark backgrounds
  - `Black.png` - Black logo for light backgrounds
  - `Charcoal.png` - Charcoal variant
- CSS Variables: `/src/app/globals.css`
- Header: `/src/components/layout/Header.tsx`
- Homepage: `/src/app/page.tsx`
