import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp } from 'lucide-react';

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>
            Search Products
          </h1>
          
          <Card className="p-8 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="search"
                placeholder="Search for products, categories, or brands..."
                className="pl-10 pr-4 py-6 text-lg"
              />
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">TRENDING SEARCHES</h3>
              <div className="flex flex-wrap gap-2">
                {['Denim Jacket', 'Slim Jeans', 'Vintage Denim', 'Black Jeans', 'Cropped Jacket'].map((term) => (
                  <Link key={term} href={`/products?search=${term}`}>
                    <Button variant="outline" size="sm" className="cursor-pointer">
                      <TrendingUp className="h-3 w-3 mr-2" />
                      {term}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </Card>

          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Search functionality coming soon with advanced filtering options
            </p>
            <Button
              size="lg"
              className="bg-[#C5A572] hover:bg-[#B89968] cursor-pointer"
              asChild
            >
              <Link href="/products">
                Browse All Products
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
