import { Suspense } from 'react';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductFilters } from '@/components/products/ProductFilters';
import { MobileFilters } from '@/components/products/MobileFilters';
import { ProductGridSkeleton } from '@/components/products/ProductSkeleton';

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
    <div className="min-h-screen bg-background pt-16">
      {/* Main Content */}
      <section className="h-[calc(100vh-4rem)]">
        <div className="container mx-auto px-4 h-full">
          <div className="flex flex-col lg:flex-row gap-8 h-full py-6">
            {/* Filters Sidebar - Desktop - Fixed height with own scroll */}
            <aside className="hidden lg:block lg:w-64 shrink-0 h-full overflow-y-auto">
              <ProductFilters searchParams={params} />
            </aside>

            {/* Mobile Filter Button */}
            <MobileFilters searchParams={params} />

            {/* Products Grid - Scrollable */}
            <div className="flex-1 h-full overflow-y-auto">
              <Suspense key={JSON.stringify(params)} fallback={<ProductGridSkeleton count={9} />}>
                <ProductGrid searchParams={params} />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
