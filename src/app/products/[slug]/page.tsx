import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { ProductImages } from '@/components/products/ProductImages';
import { ProductInfo } from '@/components/products/ProductInfo';
import { ProductTabs } from '@/components/products/ProductTabs';
import { RelatedProducts } from '@/components/products/RelatedProducts';
import { getProductBySlug, getRelatedProducts } from '@/lib/products';

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

  // Fetch related products on server
  const relatedProducts = await getRelatedProducts(product.id, product.category_id);

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
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 
                className="text-3xl font-bold mb-8"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                You May Also Like
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => {
                  const imageUrl = relatedProduct.product_images?.[0]?.url || relatedProduct.image_url || '/placeholder.jpg';
                  return (
                    <div key={relatedProduct.id} className="group">
                      <a href={`/products/${relatedProduct.slug}`} className="block">
                        <div className="relative aspect-square overflow-hidden bg-muted rounded-lg mb-3">
                          <img
                            src={imageUrl}
                            alt={relatedProduct.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <h3 className="font-semibold line-clamp-2 mb-1">{relatedProduct.name}</h3>
                        <p className="text-sm text-muted-foreground">₹{relatedProduct.price.toLocaleString('en-IN')}</p>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
