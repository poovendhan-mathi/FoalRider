import { getRelatedProducts } from '@/lib/products';
import { ProductCard } from './ProductCard';

interface RelatedProductsProps {
  currentProductId: string;
  categoryId: string | null;
}

export async function RelatedProducts({ currentProductId, categoryId }: RelatedProductsProps) {
  const relatedProducts = await getRelatedProducts(currentProductId, categoryId);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 
        className="text-3xl font-bold mb-8"
        style={{ fontFamily: 'Playfair Display, serif' }}
      >
        You May Also Like
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
