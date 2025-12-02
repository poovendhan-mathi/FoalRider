import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductImagesLevis } from "@/components/products/ProductImagesLevis";
import { ProductInfoLevis } from "@/components/products/ProductInfoLevis";
import { ProductTabs } from "@/components/products/ProductTabs";
import { RelatedProducts } from "@/components/products/RelatedProducts";
import { ProductDetailSkeleton } from "@/components/products/ProductSkeleton";
import { getProductBySlug } from "@/lib/products";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function ProductContent({ slug }: { slug: string }) {
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images - Levi's Style with vertical thumbnails */}
        <ProductImagesLevis product={product} />

        {/* Product Info - Levi's Style with size selectors, offers */}
        <ProductInfoLevis product={product} />
      </div>

      {/* Product Tabs - Description, Specs, Reviews */}
      <div className="mt-16">
        <ProductTabs product={product} />
      </div>

      {/* Related Products */}
      <div className="mt-16">
        <RelatedProducts
          currentProductId={product.id}
          categoryId={product.category_id}
        />
      </div>
    </>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Product Details Section */}
      <section className="py-8 lg:py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <Suspense fallback={<ProductDetailSkeleton />}>
            <ProductContent slug={slug} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
