import { getRelatedProducts } from "@/lib/products";
import { ProductCard } from "./ProductCard";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface RelatedProductsProps {
  currentProductId: string;
  categoryId: string | null;
}

export async function RelatedProducts({
  currentProductId,
  categoryId,
}: RelatedProductsProps) {
  const relatedProducts = await getRelatedProducts(
    currentProductId,
    categoryId
  );

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div>
      {/* Levi's-style section header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-black uppercase tracking-wide">
          You May Also Like
        </h2>
        <Link
          href="/products"
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-black hover:underline"
        >
          View all
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
