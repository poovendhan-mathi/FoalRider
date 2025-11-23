'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useState, useEffect, useTransition } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';

interface ProductFiltersProps {
  searchParams: {
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
  };
  onFilterApplied?: () => void;
}

const categories = [
  { id: 'all', name: 'All Products', parent: null },
  { id: 'mens-wear', name: 'Men\'s Wear', parent: null },
  { id: 'mens-pants', name: '  Men\'s Pants', parent: 'mens-wear' },
  { id: 'mens-jackets', name: '  Men\'s Jackets', parent: 'mens-wear' },
  { id: 'mens-shirts', name: '  Men\'s Shirts', parent: 'mens-wear' },
  { id: 'mens-tshirts', name: '  Men\'s T-Shirts', parent: 'mens-wear' },
  { id: 'womens-wear', name: 'Women\'s Wear', parent: null },
  { id: 'womens-bottoms', name: '  Women\'s Bottoms', parent: 'womens-wear' },
  { id: 'womens-tops', name: '  Women\'s Tops', parent: 'womens-wear' },
  { id: 'womens-dresses', name: '  Women\'s Dresses', parent: 'womens-wear' },
  { id: 'womens-outerwear', name: '  Women\'s Outerwear', parent: 'womens-wear' },
  { id: 'home-textiles', name: 'Home Textiles', parent: null },
  { id: 'accessories', name: 'Accessories', parent: null },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

export function ProductFilters({ searchParams, onFilterApplied }: ProductFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [optimisticCategory, setOptimisticCategory] = useState<string | null>(null);
  const [optimisticSort, setOptimisticSort] = useState<string | null>(null);
  const { currency, formatPrice, convertPrice } = useCurrency();

  // Calculate max price in current currency
  const maxPriceInCurrency = Math.ceil(convertPrice(50000));
  const stepSize = Math.ceil(maxPriceInCurrency / 100);

  useEffect(() => {
    const minPrice = searchParams.minPrice ? parseInt(searchParams.minPrice) : 0;
    const maxPrice = searchParams.maxPrice ? parseInt(searchParams.maxPrice) : 50000;
    setPriceRange([minPrice, maxPrice]);
  }, [searchParams.minPrice, searchParams.maxPrice]);

  const updateFilters = (key: string, value: string | null) => {
    // Set optimistic state immediately for instant UI feedback
    if (key === 'category') {
      setOptimisticCategory(value === 'all' ? null : value);
    } else if (key === 'sort') {
      setOptimisticSort(value);
    }

    const current = new URLSearchParams(Array.from(params.entries()));
    
    if (value === null || value === '' || value === 'all') {
      current.delete(key);
    } else {
      current.set(key, value);
    }

    const search = current.toString();
    const query = search ? `?${search}` : '';
    
    // Use startTransition for non-blocking updates
    startTransition(() => {
      router.replace(`/products${query}`, { scroll: false });
    });
    
    // Close mobile sheet after filter is applied
    if (onFilterApplied) {
      setTimeout(() => onFilterApplied(), 100);
    }
  };

  const applyPriceFilter = () => {
    const current = new URLSearchParams(Array.from(params.entries()));
    current.set('minPrice', priceRange[0].toString());
    current.set('maxPrice', priceRange[1].toString());
    
    startTransition(() => {
      router.replace(`/products?${current.toString()}`, { scroll: false });
    });
    
    // Close mobile sheet after filter is applied
    if (onFilterApplied) {
      setTimeout(() => onFilterApplied(), 100);
    }
  };

  const clearFilters = () => {
    setOptimisticCategory(null);
    setOptimisticSort(null);
    setPriceRange([0, 50000]);
    
    startTransition(() => {
      router.replace('/products', { scroll: false });
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
          Filters
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={clearFilters}
          className="w-full mb-4"
        >
          Clear All Filters
        </Button>
      </div>

      <Separator />

      {/* Category Filter */}
      <div>
        <Label className="text-base font-semibold mb-3 block">Category</Label>
        <div className="space-y-2">
          {categories.map((category) => {
            const currentCategory = optimisticCategory !== null ? optimisticCategory : searchParams.category;
            const isSelected = currentCategory === category.id || 
                             (!currentCategory && category.id === 'all');
            
            return (
              <button
                key={category.id}
                onClick={() => updateFilters('category', category.id === 'all' ? null : category.id)}
                disabled={isPending}
                className={`block w-full text-left px-3 py-2 rounded-md transition-colors disabled:opacity-50 ${
                  isSelected
                    ? 'bg-[#C5A572] text-white font-medium'
                    : 'hover:bg-muted'
                }`}
                style={{ fontFamily: 'Montserrat, sans-serif', cursor: 'pointer' }}
              >
                {category.name}
              </button>
            );
          })}

        </div>
      </div>

      <Separator />

      {/* Sort Filter */}
      <div>
        <Label className="text-base font-semibold mb-3 block">Sort By</Label>
        <div className="space-y-2">
          {sortOptions.map((option) => {
            const isSelected = optimisticSort !== null
              ? optimisticSort === option.value
              : searchParams.sort === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => updateFilters('sort', option.value)}
                disabled={isPending}
                className={`block w-full text-left px-3 py-2 rounded-md transition-colors disabled:opacity-50 ${
                  isSelected
                    ? 'bg-[#C5A572] text-white font-medium'
                    : 'hover:bg-muted'
                }`}
                style={{ fontFamily: 'Montserrat, sans-serif', cursor: 'pointer' }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Price Range Filter */}
      <div>
        <Label className="text-base font-semibold mb-3 block">Price Range</Label>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            max={50000}
            min={0}
            step={500}
            className="mb-4"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
          <Button 
            onClick={applyPriceFilter}
            disabled={isPending}
            className="w-full bg-[#C5A572] hover:bg-[#B08D5B]"
            size="sm"
          >
            {isPending ? 'Applying...' : 'Apply Price Filter'}
          </Button>
        </div>
      </div>
    </div>
  );
}
