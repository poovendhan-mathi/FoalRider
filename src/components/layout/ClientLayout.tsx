"use client";

import { Header } from "./Header";
import { MobileBottomNav } from "./MobileBottomNav";
import { usePathname } from "next/navigation";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't show main header on admin pages or checkout
  const hideHeader =
    pathname?.startsWith("/admin") || pathname?.startsWith("/checkout");

  // Don't show mobile nav on admin or checkout pages
  const hideMobileNav =
    pathname?.startsWith("/admin") || pathname?.startsWith("/checkout");

  return (
    <>
      {!hideHeader && <Header />}
      {/* Main content with bottom padding for mobile nav */}
      <div className={!hideMobileNav ? "pb-16 md:pb-0" : ""}>{children}</div>
      {!hideMobileNav && <MobileBottomNav />}
    </>
  );
}
