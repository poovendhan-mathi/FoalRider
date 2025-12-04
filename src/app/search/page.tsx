"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, X, Loader2 } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
  categories?: {
    name: string;
  } | null;
}

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { formatPrice } = useCurrency();

  const debouncedQuery = useDebounce(query, 300);

  const searchProducts = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(
        `/api/products/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data.products || []);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    searchProducts(debouncedQuery);
  }, [debouncedQuery, searchProducts]);

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
  };

  const trendingSearches = [
    "Denim Jacket",
    "Slim Jeans",
    "Vintage Denim",
    "Black Jeans",
    "Cropped Jacket",
  ];

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-light tracking-tight text-black mb-2">
              Search Products
            </h1>
            <p className="text-gray-500 text-sm">
              Find your perfect denim pieces
            </p>
          </div>

          {/* Search Input */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products..."
              className="pl-12 pr-12 py-6 text-lg rounded-none border-black focus:ring-[#C5A572] focus:border-[#C5A572]"
              autoFocus
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#C5A572]" />
            </div>
          )}

          {/* Results */}
          {!loading && hasSearched && (
            <div className="mb-8">
              <p className="text-sm text-gray-500 mb-4">
                {results.length} {results.length === 1 ? "result" : "results"}{" "}
                for &quot;{query}&quot;
              </p>

              {results.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No products found</p>
                  <Button
                    asChild
                    variant="outline"
                    className="border-[#C5A572] text-[#C5A572] hover:bg-[#C5A572] hover:text-white"
                  >
                    <Link href="/products">Browse All Products</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="group"
                    >
                      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-3">
                        <Image
                          src={
                            product.image_url ||
                            "/assets/images/product-placeholder.svg"
                          }
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <h3 className="text-sm font-medium text-black group-hover:underline line-clamp-2">
                        {product.name}
                      </h3>
                      {product.categories?.name && (
                        <p className="text-xs text-gray-500 mt-1">
                          {product.categories.name}
                        </p>
                      )}
                      <p className="text-sm font-semibold text-black mt-1">
                        {formatPrice(product.price)}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Trending Searches (show when not searching) */}
          {!hasSearched && !loading && (
            <Card className="p-6 border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
                Trending Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-full text-sm text-black hover:border-[#C5A572] hover:text-[#C5A572] transition-colors"
                  >
                    <TrendingUp className="h-3 w-3 mr-2" />
                    {term}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Quick Links */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500 mb-4">Or browse by category</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-black text-black hover:bg-black hover:text-white"
              >
                <Link href="/products?category=mens-wear">Men&apos;s</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-black text-black hover:bg-black hover:text-white"
              >
                <Link href="/products?category=womens-wear">Women&apos;s</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-black text-black hover:bg-black hover:text-white"
              >
                <Link href="/products">All Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
