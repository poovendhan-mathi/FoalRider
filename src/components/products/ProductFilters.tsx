'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useState, useEffect } from 'react';

interface ProductFiltersProps {
  searchParams: {
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
  };
}

const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'mens-wear', name: 'Men\'s Wear' },
  { id: 'womens-wear', name: 'Women\'s Wear' },
  { id: 'home-textiles', name: 'Home Textiles' },
  { id: 'accessories', name: 'Accessories' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

export function ProductFilters({ searchParams }: ProductFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);

  useEffect(() => {
    const minPrice = searchParams.minPrice ? parseInt(searchParams.minPrice) : 0;
    const maxPrice = searchParams.maxPrice ? parseInt(searchParams.maxPrice) : 50000;
    setPriceRange([minPrice, maxPrice]);
  }, [searchParams.minPrice, searchParams.maxPrice]);

  const updateFilters = (key: string, value: string | null) => {
    const current = new URLSearchParams(Array.from(params.entries()));
    
    if (value === null || value === '' || value === 'all') {
      current.delete(key);
    } else {
      current.set(key, value);
    }

    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`/products${query}`);
  };

  const applyPriceFilter = () => {
    const current = new URLSearchParams(Array.from(params.entries()));
    current.set('minPrice', priceRange[0].toString());
    current.set('maxPrice', priceRange[1].toString());
    router.push(`/products?${current.toString()}`);
  };

  const clearFilters = () => {
    router.push('/products');
    setPriceRange([0, 50000]);
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
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => updateFilters('category', category.id === 'all' ? null : category.id)}
              className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                (searchParams.category === category.id || (!searchParams.category && category.id === 'all'))
                  ? 'bg-[#C5A572] text-white font-medium'
                  : 'hover:bg-muted'
              }`}
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Sort Filter */}
      <div>
        <Label className="text-base font-semibold mb-3 block">Sort By</Label>
        <div className="space-y-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => updateFilters('sort', option.value)}
              className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                searchParams.sort === option.value
                  ? 'bg-[#C5A572] text-white font-medium'
                  : 'hover:bg-muted'
              }`}
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {option.label}
            </button>
          ))}
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
            <span>₹{priceRange[0].toLocaleString()}</span>
            <span>₹{priceRange[1].toLocaleString()}</span>
          </div>
          <Button 
            onClick={applyPriceFilter}
            className="w-full bg-[#C5A572] hover:bg-[#B08D5B]"
            size="sm"
          >
            Apply Price Filter
          </Button>
        </div>
      </div>
    </div>
  );
}
