import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowRight, Star, ShoppingBag } from 'lucide-react';
import { getFeaturedProducts } from '@/lib/products';
import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import { PriceDisplay } from '@/components/PriceDisplay';
import { getProductImageUrl } from '@/lib/product-helpers';

// Get featured products for sections
async function getSectionProducts() {
  const supabase = await createClient();
  
  // Get Men's Tapered Fit Dark Indigo Jeans
  const { data: mensJeansProduct } = await supabase
    .from('products')
    .select(`
      id, name, slug, price, image_url,
      categories!inner(slug),
      product_images(url, sort_order)
    `)
    .eq('slug', 'tapered-fit-dark-indigo-jeans')
    .eq('is_active', true)
    .single();

  // Get Women's Bootcut Dark Denim Jeans
  const { data: womensDenimShirt } = await supabase
    .from('products')
    .select(`
      id, name, slug, price, image_url,
      categories!inner(slug),
      product_images(url, sort_order)
    `)
    .eq('slug', 'bootcut-dark-denim-jeans')
    .eq('is_active', true)
    .single();

  return { mensJeansProduct, womensDenimShirt };
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts(6);
  const { mensJeansProduct, womensDenimShirt } = await getSectionProducts();
  
  // Get image URLs with fallback - High quality 8K images
  const mensJeansImage = mensJeansProduct?.product_images?.[0]?.url || 
                         mensJeansProduct?.image_url || 
                         'https://images.unsplash.com/photo-1542272604-787c3835535d?w=3840&q=95';
  
  const womensDenimImage = womensDenimShirt?.product_images?.[0]?.url || 
                           womensDenimShirt?.image_url || 
                           'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=3840&q=95';

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2E2E2E]/20 via-background to-[#C5A572]/10" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <Badge className="bg-accent text-accent-foreground">
              Premium Textile Collection 2025
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Crafted for
              <span className="block bg-gradient-to-r from-[#000000] to-[#C5A572] bg-clip-text text-transparent">
                Perfection
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the finest quality pants and shirts, meticulously crafted from premium fabrics. Where timeless style meets exceptional comfort.
            </p>
            
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
                <Link href="/products?category=mens-wear">
                  Explore Collection <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/products">Shop All Products</Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#C5A572] text-[#C5A572]" />
                ))}
              </div>
              <span>Trusted by 10,000+ customers</span>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Men's Premium Denim Jeans Section */}
      <section className="py-24 bg-[#ecf0f1]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Product Image - High Quality 8K */}
            <Link 
              href={mensJeansProduct ? `/products/${mensJeansProduct.slug}` : '/products?category=mens-pants'} 
              className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#2E2E2E] order-2 md:order-1 block cursor-pointer group"
            >
              <img 
                src={mensJeansImage}
                alt={mensJeansProduct?.name || "Premium Men's Denim Jeans"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-8 left-8 text-white">
                <div className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {mensJeansProduct?.name || "Premium Denim Jeans"}
                </div>
                {mensJeansProduct && (
                  <div className="text-lg md:text-xl opacity-90 font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    <PriceDisplay priceInINR={mensJeansProduct.price} />
                  </div>
                )}
              </div>
            </Link>

            {/* Content */}
            <div className="space-y-6 order-1 md:order-2">
              <Badge variant="outline" className="border-[#2c3e50] text-[#2c3e50]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                SIGNATURE COLLECTION
              </Badge>
              
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: 'Playfair Display, serif', color: '#2c3e50' }}>
                Premium Denim Jeans
                <span className="block" style={{ color: '#4169e1' }}>Engineered for Perfection</span>
              </h2>
              
              <p className="text-lg leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif', color: '#7f8c8d' }}>
                Our signature denim jeans are crafted from the finest Japanese selvedge denim, combining timeless style with modern comfort. Each pair is designed to become your favorite, featuring:
              </p>

              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 rounded-full bg-[#4169e1]/10 flex items-center justify-center flex-shrink-0">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#4169e1' }} />
                  </div>
                  <div>
                    <span className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif', color: '#2c3e50' }}>Premium Stretch Denim</span>
                    <p className="text-sm" style={{ fontFamily: 'Montserrat, sans-serif', color: '#7f8c8d' }}>Flexible fabric that retains its shape</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 rounded-full bg-[#4169e1]/10 flex items-center justify-center flex-shrink-0">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#4169e1' }} />
                  </div>
                  <div>
                    <span className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif', color: '#2c3e50' }}>Tailored Fit</span>
                    <p className="text-sm" style={{ fontFamily: 'Montserrat, sans-serif', color: '#7f8c8d' }}>Multiple fits to suit every body type</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 rounded-full bg-[#4169e1]/10 flex items-center justify-center flex-shrink-0">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#4169e1' }} />
                  </div>
                  <div>
                    <span className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif', color: '#2c3e50' }}>Sustainable Production</span>
                    <p className="text-sm" style={{ fontFamily: 'Montserrat, sans-serif', color: '#7f8c8d' }}>Eco-friendly processes and materials</p>
                  </div>
                </li>
              </ul>

              <div className="flex gap-4 pt-4">
                <Button size="lg" style={{ backgroundColor: '#2c3e50', color: '#ecf0f1', fontFamily: 'Montserrat, sans-serif' }} asChild>
                  <Link href="/products?category=mens-pants">Shop Denim Collection</Link>
                </Button>
                <Button size="lg" variant="outline" style={{ borderColor: '#2c3e50', color: '#2c3e50', fontFamily: 'Montserrat, sans-serif' }} asChild>
                  <Link href="/about">Our Story</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Women's Denim Shirt Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Content */}
            <div className="space-y-6">
              <Badge variant="outline" className="border-[#C5A572] text-[#C5A572]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                WOMEN'S DENIM COLLECTION
              </Badge>
              
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: 'Playfair Display, serif', color: '#2c3e50' }}>
                Classic Denim Shirts
                <span className="block" style={{ color: '#C5A572' }}>Timeless & Versatile</span>
              </h2>
              
              <p className="text-lg leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif', color: '#7f8c8d' }}>
                Our women's denim shirt collection features timeless designs crafted with premium chambray denim. Each piece is a wardrobe essential that effortlessly elevates any look.
              </p>

              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 rounded-full bg-[#C5A572]/10 flex items-center justify-center flex-shrink-0">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#C5A572' }} />
                  </div>
                  <div>
                    <span className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif', color: '#2c3e50' }}>Premium Fabrics</span>
                    <p className="text-sm" style={{ fontFamily: 'Montserrat, sans-serif', color: '#7f8c8d' }}>Soft, breathable, and luxurious</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 rounded-full bg-[#C5A572]/10 flex items-center justify-center flex-shrink-0">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#C5A572' }} />
                  </div>
                  <div>
                    <span className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif', color: '#2c3e50' }}>Flattering Silhouettes</span>
                    <p className="text-sm" style={{ fontFamily: 'Montserrat, sans-serif', color: '#7f8c8d' }}>Designed to enhance every figure</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 rounded-full bg-[#C5A572]/10 flex items-center justify-center flex-shrink-0">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#C5A572' }} />
                  </div>
                  <div>
                    <span className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif', color: '#2c3e50' }}>Versatile Styles</span>
                    <p className="text-sm" style={{ fontFamily: 'Montserrat, sans-serif', color: '#7f8c8d' }}>From casual to evening wear</p>
                  </div>
                </li>
              </ul>

              <div className="flex gap-4 pt-4">
                <Button size="lg" variant="outline" className="border-[#C5A572] text-[#C5A572] hover:bg-[#C5A572] hover:text-white" style={{ fontFamily: 'Montserrat, sans-serif' }} asChild>
                  <Link href="/products?category=womens-tops">View Denim Shirts</Link>
                </Button>
                <Button size="lg" variant="outline" style={{ borderColor: '#C5A572', color: '#C5A572', fontFamily: 'Montserrat, sans-serif' }} asChild>
                  <Link href="/products?category=womens-wear">Explore Collection</Link>
                </Button>
              </div>
            </div>

            {/* Product Image - High Quality 8K */}
            <Link 
              href={womensDenimShirt ? `/products/${womensDenimShirt.slug}` : '/products?category=womens-tops'}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#2E2E2E] order-first md:order-last block cursor-pointer group"
            >
              <img 
                src={womensDenimImage}
                alt={womensDenimShirt?.name || "Women's Denim Shirt Collection"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-8 left-8 text-white">
                <div className="text-4xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {womensDenimShirt?.name || "Denim Shirts"}
                </div>
                {womensDenimShirt && (
                  <div className="text-white text-xl font-semibold mt-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    <PriceDisplay priceInINR={womensDenimShirt.price} />
                  </div>
                )}
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Craftsmanship Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Content */}
            <div className="space-y-6">
              <Badge variant="outline" className="border-[#C5A572] text-[#C5A572]">
                ARTISAN CRAFTED
              </Badge>
              
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Every Stitch
                <span className="block text-[#C5A572]">Tells a Story</span>
              </h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our artisans pour their heart into every garment, blending traditional techniques with modern innovation. Each piece carries the mark of true craftsmanship.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-[#C5A572]">50+</div>
                  <p className="text-sm text-muted-foreground">Years of Expertise</p>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-[#C5A572]">100%</div>
                  <p className="text-sm text-muted-foreground">Quality Guaranteed</p>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-[#C5A572]">10K+</div>
                  <p className="text-sm text-muted-foreground">Happy Customers</p>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-[#C5A572]">24/7</div>
                  <p className="text-sm text-muted-foreground">Customer Support</p>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button size="lg" variant="outline" asChild>
                  <Link href="/about">Discover Our Heritage</Link>
                </Button>
              </div>
            </div>

            {/* Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#2E2E2E] order-first md:order-last">
              <img 
                src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=90"
                alt="Artisan Craftsmanship"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Shirts Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Content */}
            <div className="space-y-6 order-2 md:order-1">
              <Badge variant="outline" className="border-accent text-accent">
                TIMELESS ELEGANCE
              </Badge>
              
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Sophisticated Shirts
                <span className="block text-accent">For Every Occasion</span>
              </h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                From casual weekends to formal events, our shirts blend classic design with modern comfort. Crafted from premium fabrics that breathe and move naturally.
              </p>

              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-accent" />
                  </div>
                  <div>
                    <span className="font-semibold">Premium Cotton & Linen</span>
                    <p className="text-sm text-muted-foreground">Breathable, natural fabrics</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-accent" />
                  </div>
                  <div>
                    <span className="font-semibold">Precision Tailoring</span>
                    <p className="text-sm text-muted-foreground">Perfect fit, every time</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-accent" />
                  </div>
                  <div>
                    <span className="font-semibold">Versatile Styles</span>
                    <p className="text-sm text-muted-foreground">Casual to formal options</p>
                  </div>
                </li>
              </ul>

              <div className="flex gap-4 pt-4">
                <Button size="lg" asChild>
                  <Link href="/products/shirts">Shop Shirts Collection</Link>
                </Button>
                <Button size="lg" variant="ghost" asChild>
                  <Link href="/collections">View All Collections</Link>
                </Button>
              </div>
            </div>

            {/* Image */}
            <Link href="/products?category=mens-wear" className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#2E2E2E] order-1 md:order-2 block cursor-pointer group">
              <img 
                src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=90"
                alt="Premium Shirts Collection"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-8 left-8 text-white">
                <div className="text-4xl font-bold">Refined Shirts</div>
                <p className="text-white/90 mt-2">Timeless Elegance</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge className="bg-[#2C5F2D] text-white">
              SUSTAINABLE FASHION
            </Badge>
            
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
              Fashion That
              <span className="block bg-gradient-to-r from-[#2C5F2D] to-[#C5A572] bg-clip-text text-transparent">
                Cares for Tomorrow
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              We believe in creating beautiful clothing that doesn&apos;t cost the earth. Every thread, every dye, every process is chosen with care for our planet and its people.
            </p>

            <div className="grid md:grid-cols-3 gap-8 pt-8">
              <div className="space-y-3">
                <div className="relative w-20 h-20 mx-auto rounded-full bg-[#2C5F2D]/10 flex items-center justify-center">
                  <div className="text-4xl">🌱</div>
                </div>
                <h3 className="text-xl font-semibold">Organic Materials</h3>
                <p className="text-sm text-muted-foreground">
                  100% organic cotton and sustainable fabrics in every piece
                </p>
              </div>

              <div className="space-y-3">
                <div className="relative w-20 h-20 mx-auto rounded-full bg-[#2C5F2D]/10 flex items-center justify-center">
                  <div className="text-4xl">♻️</div>
                </div>
                <h3 className="text-xl font-semibold">Zero Waste</h3>
                <p className="text-sm text-muted-foreground">
                  Innovative cutting techniques minimize fabric waste to near zero
                </p>
              </div>

              <div className="space-y-3">
                <div className="relative w-20 h-20 mx-auto rounded-full bg-[#2C5F2D]/10 flex items-center justify-center">
                  <div className="text-4xl">❤️</div>
                </div>
                <h3 className="text-xl font-semibold">Ethical Production</h3>
                <p className="text-sm text-muted-foreground">
                  Fair wages and safe working conditions for all our artisans
                </p>
              </div>
            </div>

            <Button size="lg" variant="outline" className="mt-8" asChild>
              <Link href="/sustainability">Learn About Our Impact</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4">NEW ARRIVALS</Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Featured Collection
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our latest premium pants and shirts, handpicked for quality and style
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {featuredProducts.map((product) => {
              const imageUrl = product.product_images?.[0]?.url || 
                              product.image_url || 
                              'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=90';
              
              return (
                <Card key={product.id} className="group overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <Link href={`/products/${product.slug}`}>
                    <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.inventory < 10 && product.inventory > 0 && (
                        <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground">
                          Only {product.inventory} left
                        </Badge>
                      )}
                      {product.inventory === 0 && (
                        <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground">
                          Sold Out
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                        </div>
                        {product.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between pt-2">
                          <PriceDisplay priceInINR={product.price} className="text-2xl font-bold" />
                          <Button size="sm" variant="secondary" className="gap-2">
                            <ShoppingBag className="h-4 w-4" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link href="/products">
                View All Products <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-gradient-to-br from-[#2c3e50] to-[#1a252f] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img 
                  src="/assets/logo/Gold.png"
                  alt="Foal Rider Logo"
                  className="h-12 w-auto"
                />
                <span className="text-xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#C5A572' }}>FOAL RIDER</span>
              </div>
              <p className="text-sm" style={{ fontFamily: 'Montserrat, sans-serif', color: '#bdc3c7' }}>
                Premium textiles crafted with care and precision.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4" style={{ fontFamily: 'Montserrat, sans-serif', color: '#C5A572' }}>Shop</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/products?category=pants" className="hover:text-[#C5A572] transition-colors" style={{ fontFamily: 'Montserrat, sans-serif', color: '#bdc3c7' }}>Pants</Link></li>
                <li><Link href="/products?category=shirts" className="hover:text-[#C5A572] transition-colors" style={{ fontFamily: 'Montserrat, sans-serif', color: '#bdc3c7' }}>Shirts</Link></li>
                <li><Link href="/products" className="hover:text-[#C5A572] transition-colors" style={{ fontFamily: 'Montserrat, sans-serif', color: '#bdc3c7' }}>All Products</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4" style={{ fontFamily: 'Montserrat, sans-serif', color: '#C5A572' }}>Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-[#C5A572] transition-colors" style={{ fontFamily: 'Montserrat, sans-serif', color: '#bdc3c7' }}>About Us</Link></li>
                <li><Link href="/contact" className="hover:text-[#C5A572] transition-colors" style={{ fontFamily: 'Montserrat, sans-serif', color: '#bdc3c7' }}>Contact</Link></li>
                <li><Link href="/shipping" className="hover:text-[#C5A572] transition-colors" style={{ fontFamily: 'Montserrat, sans-serif', color: '#bdc3c7' }}>Shipping</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4" style={{ fontFamily: 'Montserrat, sans-serif', color: '#C5A572' }}>Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-[#C5A572] transition-colors" style={{ fontFamily: 'Montserrat, sans-serif', color: '#bdc3c7' }}>Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-[#C5A572] transition-colors" style={{ fontFamily: 'Montserrat, sans-serif', color: '#bdc3c7' }}>Terms of Service</Link></li>
                <li><Link href="/returns" className="hover:text-[#C5A572] transition-colors" style={{ fontFamily: 'Montserrat, sans-serif', color: '#bdc3c7' }}>Returns</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm" style={{ fontFamily: 'Montserrat, sans-serif', color: '#7f8c8d' }}>
            © {new Date().getFullYear()} Foal Rider. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
