import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { Toaster } from "@/components/ui/sonner";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { PageLoader } from "@/components/layout/PageLoader";
import { Suspense } from "react";

// Figma Design System Fonts
const playfairDisplay = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Foal Rider - Premium Textile Products",
  description: "Premium quality textiles and fabrics for all your needs",
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png', sizes: '512x512' },
      { url: '/assets/logo/Gold.png', sizes: '512x512' },
    ],
    apple: '/assets/logo/Gold.png',
    shortcut: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfairDisplay.variable} ${montserrat.variable} antialiased`}
        style={{ fontFamily: 'var(--font-body)' }}
      >
        <AuthProvider>
          <CurrencyProvider>
            <CartProvider>
              <WishlistProvider>
                <Suspense fallback={null}>
                  <PageLoader />
                </Suspense>
                <ClientLayout>
                  {children}
                </ClientLayout>
              </WishlistProvider>
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
