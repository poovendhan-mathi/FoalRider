import { Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductFilters } from '@/components/products/ProductFilters';
import { MobileFilters } from '@/components/products/MobileFilters';

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <section className="py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar - Desktop */}
            <aside className="hidden lg:block lg:w-64 shrink-0">
              <div className="sticky top-24">
                <ProductFilters searchParams={params} />
              </div>
            </aside>

            {/* Mobile Filter Button */}
            <MobileFilters searchParams={params} />

            {/* Products Grid */}
            <div className="flex-1">
              <Suspense fallback={<ProductGridSkeleton />}>
                <ProductGrid searchParams={params} />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-muted h-80 rounded-lg mb-4" />
          <div className="h-4 bg-muted rounded w-3/4 mb-2" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
