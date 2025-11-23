'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import type { Product } from '@/lib/products';

interface ProductTabsProps {
  product: Product;
}

export function ProductTabs({ product }: ProductTabsProps) {
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-3">
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="specifications">Specifications</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="mt-6">
        <Card className="p-6">
          <h3 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Product Description
          </h3>
          <div className="prose max-w-none" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <p className="text-muted-foreground leading-relaxed">
              {product.description || 'No description available for this product.'}
            </p>
            
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-lg">Key Features:</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Premium quality materials</li>
                <li>Expertly crafted with attention to detail</li>
                <li>Durable and long-lasting</li>
                <li>Timeless design</li>
                <li>Easy to care for</li>
              </ul>
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="specifications" className="mt-6">
        <Card className="p-6">
          <h3 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Specifications
          </h3>
          <div className="space-y-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <span className="font-medium">Product ID:</span>
              <span className="text-muted-foreground">{product.id}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <span className="font-medium">Category:</span>
              <span className="text-muted-foreground">
                {product.categories?.name || 'N/A'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <span className="font-medium">Availability:</span>
              <span className="text-muted-foreground">
                {product.inventory > 0 ? `${product.inventory} in stock` : 'Out of stock'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <span className="font-medium">SKU:</span>
              <span className="text-muted-foreground">{product.slug.toUpperCase()}</span>
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="reviews" className="mt-6">
        <Card className="p-6">
          <h3 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Customer Reviews
          </h3>
          <div className="text-center py-12">
            <p className="text-muted-foreground" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              No reviews yet. Be the first to review this product!
            </p>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
