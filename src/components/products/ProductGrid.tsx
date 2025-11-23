import { getFilteredProducts } from '@/lib/products';
import { ProductCard } from './ProductCard';

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
      <div className="text-center py-12">
        <h3 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          No products found
        </h3>
        <p className="text-muted-foreground" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Try adjusting your filters to see more results
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Showing {products.length} {products.length === 1 ? 'product' : 'products'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
