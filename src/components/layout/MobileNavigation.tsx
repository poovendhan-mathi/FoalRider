"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, Heart, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthProvider";

/**
 * Mobile Bottom Navigation
 * Fixed bottom nav bar for mobile devices - Levi's/Adidas style
 * Shows: Home, Search, Cart, Wishlist, Account
 */
export function MobileNavigation() {
  const pathname = usePathname();
  const { totalItems: cartCount } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const { state } = useAuth();
  const isLoggedIn = !!state.user;

  // Don't show on admin pages
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      name: "Search",
      href: "/search",
      icon: Search,
      isActive: pathname === "/search",
    },
    {
      name: "Cart",
      href: "/cart",
      icon: ShoppingBag,
      isActive: pathname === "/cart",
      badge: cartCount > 0 ? cartCount : undefined,
    },
    {
      name: "Wishlist",
      href: "/wishlist",
      icon: Heart,
      isActive: pathname === "/wishlist",
      badge: wishlistCount > 0 ? wishlistCount : undefined,
    },
    {
      name: "Account",
      href: isLoggedIn ? "/profile" : "/login",
      icon: User,
      isActive: pathname === "/profile" || pathname === "/login",
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full h-full relative tap-feedback ${
              item.isActive ? "text-black" : "text-gray-500"
            }`}
          >
            <div className="relative">
              <item.icon
                className={`h-5 w-5 ${
                  item.isActive ? "stroke-2" : "stroke-[1.5]"
                }`}
              />
              {item.badge && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 font-medium">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
