'use client';

import { Header } from './Header';
import { usePathname } from 'next/navigation';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't show main header on admin pages or checkout
  const hideHeader = pathname?.startsWith('/admin') || pathname?.startsWith('/checkout');
  
  return (
    <>
      {!hideHeader && <Header />}
      {children}
    </>
  );
}
