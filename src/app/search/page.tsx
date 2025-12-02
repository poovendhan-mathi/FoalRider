import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp } from "lucide-react";

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="outline-gold" className="mb-4">
              FIND YOUR STYLE
            </Badge>
            <h1 className="font-['Playfair_Display'] text-4xl font-bold text-black">
              Search Products
            </h1>
          </div>

          <Card className="p-8 mb-8 rounded-2xl border-[#E5E5E5]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] h-5 w-5 stroke-[1.5]" />
              <Input
                type="search"
                placeholder="Search for products, categories, or brands..."
                className="pl-12 pr-4 py-6 text-lg font-['Montserrat'] rounded-xl"
              />
            </div>

            <div className="mt-6">
              <h3 className="font-['Montserrat'] text-sm font-semibold text-[#9CA3AF] mb-3 uppercase tracking-wide">
                Trending Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Denim Jacket",
                  "Slim Jeans",
                  "Vintage Denim",
                  "Black Jeans",
                  "Cropped Jacket",
                ].map((term) => (
                  <Link key={term} href={`/products?search=${term}`}>
                    <Button
                      variant="outline-gold"
                      size="sm"
                      className="cursor-pointer font-['Montserrat']"
                    >
                      <TrendingUp className="h-3 w-3 mr-2 stroke-[1.5]" />
                      {term}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </Card>

          <div className="text-center">
            <p className="font-['Montserrat'] text-[#4B5563] mb-6">
              Search functionality coming soon with advanced filtering options
            </p>
            <Button
              size="lg"
              variant="gold"
              className="font-['Montserrat'] cursor-pointer"
              asChild
            >
              <Link href="/products">Browse All Products</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
