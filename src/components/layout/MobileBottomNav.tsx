"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  isActive: boolean;
}

function NavItem({ href, icon: Icon, label, badge, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-all duration-150 touch-manipulation active:scale-90 active:opacity-70",
        isActive ? "text-[#C5A572]" : "text-gray-500"
      )}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <div className="relative">
        <Icon
          className={cn(
            "w-6 h-6 transition-all duration-200",
            isActive ? "stroke-2" : "stroke-[1.5]"
          )}
        />
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] flex items-center justify-center bg-[#C5A572] text-black text-[10px] font-bold rounded-full px-1">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </div>
      <span
        className={cn(
          "text-[10px] font-medium transition-all duration-200",
          isActive ? "font-semibold text-[#C5A572]" : ""
        )}
      >
        {label}
      </span>
    </Link>
  );
}

/**
 * Mobile Bottom Navigation - Premium style
 * Fixed at bottom on mobile only (hidden on md+)
 * Shows: Home, Search, Wishlist, Bag, Account
 */
export function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems: cartTotal } = useCart();
  const { totalItems: wishlistTotal } = useWishlist();

  // Hide on admin pages and checkout
  if (pathname.startsWith("/admin") || pathname.startsWith("/checkout")) {
    return null;
  }

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/wishlist", icon: Heart, label: "Wishlist", badge: wishlistTotal },
    { href: "/cart", icon: ShoppingBag, label: "Bag", badge: cartTotal },
    { href: "/profile", icon: User, label: "Account" },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 md:hidden safe-area-bottom shadow-[0_-2px_10px_rgba(0,0,0,0.1)]"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch justify-around h-16">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            badge={item.badge}
            isActive={
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href)
            }
          />
        ))}
      </div>
    </nav>
  );
}
