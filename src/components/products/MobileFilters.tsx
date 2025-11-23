'use client';

import { useState } from 'react';
import { ProductFilters } from '@/components/products/ProductFilters';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface MobileFiltersProps {
  searchParams: {
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
  };
}

export function MobileFilters({ searchParams }: MobileFiltersProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle style={{ fontFamily: 'Playfair Display, serif' }}>
              Filters
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <ProductFilters searchParams={searchParams} onFilterApplied={() => setMobileFiltersOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
