import { Suspense } from "react";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductFilters } from "@/components/products/ProductFilters";
import { MobileFilters } from "@/components/products/MobileFilters";
import { ProductGridSkeleton } from "@/components/products/ProductSkeleton";

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-20">
      {/* Page Header */}
      <section className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-10">
          <h1 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold tracking-tight text-black">
            Our <span className="text-[#C5A572]">Collection</span>
          </h1>
          <p className="font-['Montserrat'] text-gray-500 mt-2 text-sm">
            Premium denim crafted for the modern wardrobe
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
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
            <Suspense
              key={JSON.stringify(params)}
              fallback={<ProductGridSkeleton count={12} />}
            >
              <ProductGrid searchParams={params} />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
