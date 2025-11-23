import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { ProductImages } from '@/components/products/ProductImages';
import { ProductInfo } from '@/components/products/ProductInfo';
import { ProductTabs } from '@/components/products/ProductTabs';
import { RelatedProducts } from '@/components/products/RelatedProducts';
import { getProductBySlug } from '@/lib/products';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Product Details Section */}
      <section className="py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <ProductImages product={product} />

            {/* Product Info */}
            <ProductInfo product={product} />
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
        </div>
      </section>
    </div>
  );
}
