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

/**
 * Product Grid - Adidas-style layout
 * - 2 columns on mobile (like Adidas app)
 * - 3 columns on tablet
 * - 4 columns on desktop
 * - Tight gap for clean look
 */
export async function ProductGrid({ searchParams }: ProductGridProps) {
  const products = await getFilteredProducts(searchParams);

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="fr-h2 mb-3">No products found</h3>
        <p className="fr-body">
          Try adjusting your filters to see more results
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Product Count */}
      <div className="flex items-center justify-between mb-5">
        <p className="fr-meta">
          {products.length} {products.length === 1 ? "item" : "items"}
        </p>
      </div>

      {/* Grid - 2 cols mobile, 3 cols tablet, 4 cols desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
