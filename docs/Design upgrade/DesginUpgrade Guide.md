Foal Rider - Complete Luxury Design System
🎨 Design Philosophy
Looking at your current site, I can see it's functional but needs that luxury polish. Let's transform it into a premium brand experience like Hermès, Burberry, or Tom Ford - brands that use similar black/gold/white palettes.

1. Typography System
   Install Premium Fonts
   Bash

# Already available via Google Fonts in Next.js

Update src/app/layout.tsx
React

import { Playfair_Display, Cormorant_Garamond, Inter } from 'next/font/google'

// Luxury serif for headings - elegant, high-end feel
const playfair = Playfair_Display({
subsets: ['latin'],
variable: '--font-heading',
display: 'swap',
weight: ['400', '500', '600', '700'],
})

// Refined serif for subheadings and quotes
const cormorant = Cormorant_Garamond({
subsets: ['latin'],
variable: '--font-accent',
display: 'swap',
weight: ['300', '400', '500', '600'],
})

// Clean sans-serif for body text
const inter = Inter({
subsets: ['latin'],
variable: '--font-body',
display: 'swap',
weight: ['300', '400', '500', '600'],
})

export default function RootLayout({ children }) {
return (
<html lang="en" className={`${playfair.variable} ${cormorant.variable} ${inter.variable}`}>
<body className="font-body antialiased">
{children}
</body>
</html>
)
}
Update tailwind.config.ts
TypeScript

import type { Config } from 'tailwindcss'

const config: Config = {
content: [
'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
],
theme: {
extend: {
colors: {
// Brand Colors
brand: {
black: '#000000',
gold: '#C5A572',
'gold-light': '#D4B896',
'gold-dark': '#A68B5B',
white: '#FFFFFF',
charcoal: '#2E2E2E',
cream: '#FAF8F5',
'off-white': '#F5F3F0',
},
},
fontFamily: {
heading: ['var(--font-heading)', 'Playfair Display', 'serif'],
accent: ['var(--font-accent)', 'Cormorant Garamond', 'serif'],
body: ['var(--font-body)', 'Inter', 'sans-serif'],
},
fontSize: {
// Luxury typography scale
'display-xl': ['5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
'display': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
'heading-1': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
'heading-2': ['2.25rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
'heading-3': ['1.75rem', { lineHeight: '1.3' }],
'heading-4': ['1.25rem', { lineHeight: '1.4' }],
'body-lg': ['1.125rem', { lineHeight: '1.7' }],
'body': ['1rem', { lineHeight: '1.7' }],
'body-sm': ['0.875rem', { lineHeight: '1.6' }],
'caption': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.05em' }],
},
letterSpacing: {
'luxury': '0.2em',
'wide-luxury': '0.3em',
},
animation: {
'fade-in': 'fadeIn 0.8s ease-out',
'fade-in-up': 'fadeInUp 0.8s ease-out',
'fade-in-down': 'fadeInDown 0.8s ease-out',
'slide-in-left': 'slideInLeft 0.8s ease-out',
'slide-in-right': 'slideInRight 0.8s ease-out',
'scale-in': 'scaleIn 0.6s ease-out',
'shimmer': 'shimmer 2s infinite',
'float': 'float 6s ease-in-out infinite',
},
keyframes: {
fadeIn: {
'0%': { opacity: '0' },
'100%': { opacity: '1' },
},
fadeInUp: {
'0%': { opacity: '0', transform: 'translateY(30px)' },
'100%': { opacity: '1', transform: 'translateY(0)' },
},
fadeInDown: {
'0%': { opacity: '0', transform: 'translateY(-30px)' },
'100%': { opacity: '1', transform: 'translateY(0)' },
},
slideInLeft: {
'0%': { opacity: '0', transform: 'translateX(-50px)' },
'100%': { opacity: '1', transform: 'translateX(0)' },
},
slideInRight: {
'0%': { opacity: '0', transform: 'translateX(50px)' },
'100%': { opacity: '1', transform: 'translateX(0)' },
},
scaleIn: {
'0%': { opacity: '0', transform: 'scale(0.95)' },
'100%': { opacity: '1', transform: 'scale(1)' },
},
shimmer: {
'0%': { backgroundPosition: '-200% 0' },
'100%': { backgroundPosition: '200% 0' },
},
float: {
'0%, 100%': { transform: 'translateY(0)' },
'50%': { transform: 'translateY(-10px)' },
},
},
boxShadow: {
'luxury': '0 4px 30px rgba(0, 0, 0, 0.1)',
'luxury-lg': '0 10px 60px rgba(0, 0, 0, 0.15)',
'luxury-gold': '0 4px 30px rgba(197, 165, 114, 0.2)',
'card': '0 2px 20px rgba(0, 0, 0, 0.08)',
'card-hover': '0 8px 40px rgba(0, 0, 0, 0.12)',
},
backgroundImage: {
'gradient-luxury': 'linear-gradient(135deg, #000000 0%, #2E2E2E 100%)',
'gradient-gold': 'linear-gradient(135deg, #C5A572 0%, #D4B896 50%, #C5A572 100%)',
'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
},
},
},
plugins: [],
}

export default config 2. Global Styles - src/app/globals.css
CSS

@tailwind base;
@tailwind components;
@tailwind utilities;

/_ ================================
FOAL RIDER - LUXURY DESIGN SYSTEM
================================ _/

:root {
/_ Brand Colors _/
--brand-primary: #000000;
--brand-accent: #C5A572;
--brand-accent-light: #D4B896;
--brand-accent-dark: #A68B5B;
--brand-secondary: #2E2E2E;
--brand-neutral: #FFFFFF;
--brand-cream: #FAF8F5;
--brand-off-white: #F5F3F0;

/_ Spacing _/
--section-padding: clamp(4rem, 10vw, 8rem);
--container-padding: clamp(1rem, 5vw, 3rem);

/_ Transitions _/
--transition-fast: 150ms ease;
--transition-base: 300ms ease;
--transition-slow: 500ms ease;
--transition-luxury: 600ms cubic-bezier(0.4, 0, 0.2, 1);
}

/_ ================================
BASE STYLES
================================ _/

@layer base {
html {
scroll-behavior: smooth;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
}

body {
@apply bg-brand-cream text-brand-black font-body;
font-feature-settings: "kern" 1, "liga" 1;
}

/_ Headings _/
h1, h2, h3, h4 {
@apply font-heading font-medium;
text-wrap: balance;
}

h1 {
@apply text-heading-1 md:text-display tracking-tight;
}

h2 {
@apply text-heading-2 md:text-heading-1;
}

h3 {
@apply text-heading-3 md:text-heading-2;
}

h4 {
@apply text-heading-4 md:text-heading-3;
}

/_ Paragraphs _/
p {
@apply text-body leading-relaxed text-brand-charcoal/80;
}

/_ Links _/
a {
@apply transition-colors duration-300;
}

/_ Selection _/
::selection {
@apply bg-brand-gold/30 text-brand-black;
}

/_ Focus states _/
:focus-visible {
@apply outline-none ring-2 ring-brand-gold ring-offset-2;
}

/_ Scrollbar _/
::-webkit-scrollbar {
width: 8px;
}

::-webkit-scrollbar-track {
@apply bg-brand-cream;
}

::-webkit-scrollbar-thumb {
@apply bg-brand-gold/50 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
@apply bg-brand-gold;
}
}

/_ ================================
COMPONENT CLASSES
================================ _/

@layer components {
/_ Container _/
.container-luxury {
@apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.container-narrow {
@apply max-w-4xl mx-auto px-4 sm:px-6 lg:px-8;
}

/_ Section Spacing _/
.section-padding {
@apply py-16 md:py-24 lg:py-32;
}

.section-padding-sm {
@apply py-12 md:py-16 lg:py-20;
}

/_ Decorative Elements _/
.gold-line {
@apply w-16 h-px bg-brand-gold;
}

.gold-line-center {
@apply w-16 h-px bg-brand-gold mx-auto;
}

.gold-line-animated {
@apply w-16 h-px bg-brand-gold transition-all duration-500;
}

.group:hover .gold-line-animated {
@apply w-24;
}

/_ Text Styles _/
.text-luxury-heading {
@apply font-heading text-brand-black tracking-tight;
}

.text-luxury-subheading {
@apply font-accent text-brand-charcoal/70 text-lg md:text-xl italic;
}

.text-luxury-label {
@apply font-body text-caption uppercase tracking-luxury text-brand-gold font-medium;
}

.text-luxury-body {
@apply font-body text-body text-brand-charcoal/80 leading-relaxed;
}

/_ Buttons _/
.btn-luxury {
@apply inline-flex items-center justify-center gap-2
px-8 py-4
font-body text-sm uppercase tracking-luxury font-medium
transition-all duration-500
cursor-pointer
disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-primary {
@apply btn-luxury
bg-brand-black text-white
hover:bg-brand-gold hover:text-brand-black
active:scale-[0.98];
}

.btn-secondary {
@apply btn-luxury
bg-brand-gold text-brand-black
hover:bg-brand-gold-dark
active:scale-[0.98];
}

.btn-outline {
@apply btn-luxury
bg-transparent border border-brand-black text-brand-black
hover:bg-brand-black hover:text-white
active:scale-[0.98];
}

.btn-outline-gold {
@apply btn-luxury
bg-transparent border border-brand-gold text-brand-gold
hover:bg-brand-gold hover:text-brand-black
active:scale-[0.98];
}

.btn-ghost {
@apply btn-luxury
bg-transparent text-brand-black
hover:text-brand-gold
px-4;
}

.btn-link {
@apply inline-flex items-center gap-2
font-body text-sm uppercase tracking-luxury font-medium
text-brand-gold hover:text-brand-gold-dark
transition-colors duration-300
group;
}

.btn-link::after {
content: '';
@apply block w-0 h-px bg-brand-gold transition-all duration-300;
}

.btn-link:hover::after {
@apply w-full;
}

/_ Cards _/
.card-luxury {
@apply bg-white rounded-none
shadow-card hover:shadow-card-hover
transition-all duration-500
overflow-hidden;
}

.card-product {
@apply card-luxury group cursor-pointer;
}

.card-product:hover .card-product-image {
@apply scale-105;
}

.card-product-image {
@apply w-full h-auto object-cover transition-transform duration-700 ease-out;
}

.card-product-overlay {
@apply absolute inset-0 bg-brand-black/0 group-hover:bg-brand-black/20
transition-colors duration-500
flex items-center justify-center;
}

/_ Input Fields _/
.input-luxury {
@apply w-full px-4 py-3
bg-white border border-brand-charcoal/20
font-body text-body text-brand-black
placeholder:text-brand-charcoal/40
focus:border-brand-gold focus:ring-0 focus:outline-none
transition-colors duration-300;
}

.input-luxury-dark {
@apply w-full px-4 py-3
bg-transparent border border-white/20
font-body text-body text-white
placeholder:text-white/40
focus:border-brand-gold focus:ring-0 focus:outline-none
transition-colors duration-300;
}

/_ Labels _/
.label-luxury {
@apply block mb-2 font-body text-sm uppercase tracking-wide text-brand-charcoal/60;
}

/_ Dividers _/
.divider-luxury {
@apply w-full h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent;
}

.divider-luxury-vertical {
@apply w-px h-full bg-gradient-to-b from-transparent via-brand-gold/30 to-transparent;
}

/_ Image Treatments _/
.image-luxury {
@apply relative overflow-hidden;
