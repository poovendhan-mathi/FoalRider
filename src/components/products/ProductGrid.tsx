import { getFilteredProducts } from "@/lib/products";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  searchParams: {
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
  };
}

export async function ProductGrid({ searchParams }: ProductGridProps) {
  const products = await getFilteredProducts(searchParams);

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-light text-black mb-2">
          No products found
        </h3>
        <p className="text-gray-500 text-sm">
          Try adjusting your filters to see more results
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <p className="text-sm text-gray-500">
          {products.length} {products.length === 1 ? "product" : "products"}
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
