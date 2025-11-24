'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function PageLoader() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const prevPathnameRef = useRef(pathname);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only show loader when pathname actually changes (route navigation)
    // Not for search params or hash changes
    if (pathname !== prevPathnameRef.current) {
      setIsLoading(true);
      prevPathnameRef.current = pathname;
      
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      // Hide loader after page loads
      timerRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 800);
    }

    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/60 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Logo */}
        <img
          src="/assets/logo/Gold.png"
          alt="Foal Rider"
          className="h-12 w-auto mb-2"
        />
        
        {/* Elegant Donut Spinner with Theme Colors */}
        <div className="relative w-16 h-16">
          {/* Outer ring with gold gradient */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#C5A572] border-r-[#D4AF37] animate-spin" />
          {/* Inner glow effect */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#C5A572]/20 to-[#D4AF37]/20 blur-sm" />
        </div>
        
        {/* Loading text with fade animation */}
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
