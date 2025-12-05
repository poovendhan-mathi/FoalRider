"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthProvider";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { CurrencySelectorCompact } from "@/components/CurrencySelector";
import { UserDropdown } from "./UserDropdown";
import Link from "next/link";
import { ShoppingCart, Menu, Heart, X } from "lucide-react";
import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function Header() {
  const { state } = useAuth();
  const user = state.user;
  const { totalItems } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<{
    full_name?: string;
    avatar_url?: string;
    role?: string;
  } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        return;
      }

      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("❌ Profile load error in Header:", error);
      } else if (data) {
        setProfile(data);
      }
    }

    loadProfile();
  }, [user]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/75 backdrop-blur-md shadow-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Mobile: Menu Button (Left) */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white/90 hover:text-[#C5A572] hover:bg-white/10 tap-feedback"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5 stroke-[1.5]" />
          ) : (
            <Menu className="h-5 w-5 stroke-[1.5]" />
          )}
        </Button>

        {/* Logo - Center on mobile, Left on desktop */}
        <Link
          href="/"
          className="flex items-center hover:opacity-80 transition-opacity md:flex-none absolute left-1/2 -translate-x-1/2 md:relative md:left-0 md:translate-x-0"
        >
          <img
            src="/assets/logo/Gold.png"
            alt="Foal Rider"
            className="h-9 w-auto"
          />
        </Link>

        {/* Desktop Navigation - Center */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-base font-medium text-white/90 hover:text-[#C5A572] tap-opacity transition-all duration-150"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Home
          </Link>
          <Link
            href="/products"
            className="text-base font-medium text-white/90 hover:text-[#C5A572] tap-opacity transition-all duration-150"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Collections
          </Link>
          <Link
            href="/about"
            className="text-base font-medium text-white/90 hover:text-[#C5A572] tap-opacity transition-all duration-150"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            About Us
          </Link>
          <Link
            href="/contact"
            className="text-base font-medium text-white/90 hover:text-[#C5A572] tap-opacity transition-all duration-150"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Contact
          </Link>
        </nav>

        {/* Actions - Right */}
        <div className="flex items-center gap-3">
          {/* Currency Selector - Desktop only */}
          <div className="hidden md:block">
            <CurrencySelectorCompact />
          </div>

          {/* Search - Desktop only (mobile has bottom nav) */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex text-white/90 hover:text-[#C5A572] hover:bg-white/10 tap-feedback"
            asChild
          >
            <Link href="/search">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </Link>
          </Button>

          {/* Wishlist - Desktop only (mobile has bottom nav) */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex text-white/90 hover:text-[#C5A572] hover:bg-white/10 relative tap-feedback"
            asChild
          >
            <Link href="/wishlist">
              <Heart className="h-5 w-5 stroke-[1.5]" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C5A572] text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-['Montserrat'] font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>
          </Button>

          {/* Cart - Desktop only (mobile has bottom nav) */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex text-white/90 hover:text-[#C5A572] hover:bg-white/10 relative tap-feedback"
            asChild
          >
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5 stroke-[1.5]" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C5A572] text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-['Montserrat'] font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
          </Button>

          {/* User - Always visible */}
          <UserDropdown user={user} profile={profile} showName={true} />
        </div>
      </div>

      {/* Mobile Menu - Slide down */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Content */}
          <div className="relative z-50 md:hidden border-t border-white/10 bg-black/95 backdrop-blur-md p-6 space-y-4">
            {/* Currency Selector for Mobile */}
            <div className="pb-4 border-b border-white/10">
              <CurrencySelectorCompact />
            </div>

            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-lg font-medium text-white/90 hover:text-[#C5A572] py-2 tap-opacity transition-all duration-150"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Home
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-lg font-medium text-white/90 hover:text-[#C5A572] py-2 tap-opacity transition-all duration-150"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Collections
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-lg font-medium text-white/90 hover:text-[#C5A572] py-2 tap-opacity transition-all duration-150"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              About Us
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-lg font-medium text-white/90 hover:text-[#C5A572] py-2 tap-opacity transition-all duration-150"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Contact
            </Link>
          </div>
        </>
      )}
    </header>
  );
}
