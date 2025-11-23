'use client';

import { Logo } from './Logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { CurrencySelectorCompact } from '@/components/CurrencySelector';
import Link from 'next/link';
import { ShoppingCart, User, Menu } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { user } = useAuth();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/75 backdrop-blur-md shadow-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo - Left */}
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <img
            src="/assets/logo/Gold.png"
            alt="Foal Rider"
            className="h-9 w-auto"
          />
        </Link>

        {/* Desktop Navigation - Center */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-base font-medium text-white/90 hover:text-[#C5A572] transition-colors" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Home
          </Link>
          <Link href="/products" className="text-base font-medium text-white/90 hover:text-[#C5A572] transition-colors" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Collections
          </Link>
          <Link href="/about" className="text-base font-medium text-white/90 hover:text-[#C5A572] transition-colors" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            About Us
          </Link>
          <Link href="/journal" className="text-base font-medium text-white/90 hover:text-[#C5A572] transition-colors" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Journal
          </Link>
          <Link href="/contact" className="text-base font-medium text-white/90 hover:text-[#C5A572] transition-colors" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Contact
          </Link>
        </nav>

        {/* Actions - Right */}
        <div className="flex items-center gap-3">
          {/* Currency Selector - Desktop */}
          <div className="hidden md:block">
            <CurrencySelectorCompact />
          </div>

          <Button variant="ghost" size="icon" className="text-white/90 hover:text-[#C5A572] hover:bg-white/10" asChild>
            <Link href="/search">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </Link>
          </Button>
          
          <Button variant="ghost" size="icon" className="text-white/90 hover:text-[#C5A572] hover:bg-white/10" asChild>
            <Link href={user ? "/profile" : "/login"}>
              <User className="h-5 w-5" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" className="text-white/90 hover:text-[#C5A572] hover:bg-white/10 relative" asChild>
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C5A572] text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden text-white/90 hover:text-[#C5A572] hover:bg-white/10" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/80 backdrop-blur-md p-6 space-y-4">
          {/* Currency Selector for Mobile */}
          <div className="pb-4 border-b border-white/10">
            <CurrencySelectorCompact />
          </div>
          
          <Link href="/" className="block text-base font-medium text-white/90 hover:text-[#C5A572] transition-colors" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Home
          </Link>
          <Link href="/products" className="block text-base font-medium text-white/90 hover:text-[#C5A572] transition-colors" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Collections
          </Link>
          <Link href="/about" className="block text-base font-medium text-white/90 hover:text-[#C5A572] transition-colors" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            About Us
          </Link>
          <Link href="/journal" className="block text-base font-medium text-white/90 hover:text-[#C5A572] transition-colors" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Journal
          </Link>
          <Link href="/contact" className="block text-base font-medium text-white/90 hover:text-[#C5A572] transition-colors" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Contact
          </Link>
        </div>
      )}
    </header>
  );
}
