import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getFeaturedProducts } from "@/lib/products";
import Image from "next/image";
import { ProductCard } from "@/components/products/ProductCard";

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts(8);

  return (
    <div className="min-h-screen">
      {/* Hero Section - Bold, Full-width, Adidas style */}
      <section className="relative h-[85vh] md:h-[90vh] bg-black overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1542272604-787c3835535d?w=1920&q=90"
          alt="Hero"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-20">
          <div className="max-w-7xl mx-auto">
            <h1 className="fr-display text-white mb-6 max-w-4xl">
              PREMIUM DENIM
              <span className="block text-[#C5A572]">COLLECTION</span>
            </h1>
            <p className="fr-body-lg text-white/80 max-w-xl mb-8">
              Crafted from the finest Japanese selvedge denim. Designed for
              those who appreciate true quality.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-white/90 font-semibold px-8"
                asChild
              >
                <Link href="/products">
                  SHOP NOW
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black font-semibold px-8"
                asChild
              >
                <Link href="/about">OUR STORY</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid - 2 columns, full-bleed images */}
      <section className="py-2 bg-white">
        <div className="grid grid-cols-2 gap-2">
          {/* Men's Category */}
          <Link
            href="/products?category=mens-wear"
            className="relative aspect-[3/4] md:aspect-[4/3] group overflow-hidden"
          >
            <Image
              src="https://images.unsplash.com/photo-1593030103066-0093718e36d5?w=960&q=90"
              alt="Men's Collection"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
            <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8">
              <span className="fr-label text-white/80 block mb-1">
                COLLECTION
              </span>
              <h2 className="fr-h1 text-white text-2xl md:text-4xl">MEN</h2>
              <span className="fr-meta text-white/70 underline underline-offset-4 mt-2 inline-block">
                Shop Now
              </span>
            </div>
          </Link>

          {/* Women's Category */}
          <Link
            href="/products?category=womens-wear"
            className="relative aspect-[3/4] md:aspect-[4/3] group overflow-hidden"
          >
            <Image
              src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=960&q=90"
              alt="Women's Collection"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
            <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8">
              <span className="fr-label text-white/80 block mb-1">
                COLLECTION
              </span>
              <h2 className="fr-h1 text-white text-2xl md:text-4xl">WOMEN</h2>
              <span className="fr-meta text-white/70 underline underline-offset-4 mt-2 inline-block">
                Shop Now
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Products - Clean Grid */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="fr-label text-gray-500 block mb-2">NEW IN</span>
              <h2 className="fr-h1">FEATURED</h2>
            </div>
            <Link
              href="/products"
              className="fr-meta text-black underline underline-offset-4 hover:text-gray-600 transition-colors hidden md:block"
            >
              View All
            </Link>
          </div>

          {/* Products Grid - 2 cols mobile, 4 cols desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Mobile View All Button */}
          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/products">
                VIEW ALL PRODUCTS
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Banner Section - Full width image with text */}
      <section className="relative h-[60vh] md:h-[70vh] bg-black overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1920&q=90"
          alt="Craftsmanship"
          fill
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />

        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-xl">
              <span className="fr-label text-[#C5A572] block mb-4">
                ARTISAN CRAFTED
              </span>
              <h2 className="fr-display text-white text-4xl md:text-6xl mb-6">
                EVERY STITCH TELLS A STORY
              </h2>
              <p className="fr-body text-white/80 mb-8">
                Our artisans pour their heart into every garment, blending
                traditional techniques with modern innovation.
              </p>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black"
                asChild
              >
                <Link href="/about">DISCOVER MORE</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Clean, minimal */}
      <section className="py-16 bg-[#F5F5F5]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <span className="fr-display text-3xl md:text-5xl text-black block">
                50+
              </span>
              <span className="fr-meta mt-2 block">Years of Excellence</span>
            </div>
            <div>
              <span className="fr-display text-3xl md:text-5xl text-black block">
                100%
              </span>
              <span className="fr-meta mt-2 block">Quality Guarantee</span>
            </div>
            <div>
              <span className="fr-display text-3xl md:text-5xl text-black block">
                10K+
              </span>
              <span className="fr-meta mt-2 block">Happy Customers</span>
            </div>
            <div>
              <span className="fr-display text-3xl md:text-5xl text-black block">
                24/7
              </span>
              <span className="fr-meta mt-2 block">Customer Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Clean, minimal */}
      <footer className="bg-black text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/assets/logo/Gold.png"
                  alt="Foal Rider"
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                />
                <span className="fr-h3 text-[#C5A572]">FOAL RIDER</span>
              </div>
              <p className="fr-meta text-gray-400">
                Premium textiles crafted with care and precision.
              </p>
            </div>

            {/* Shop Links */}
            <div>
              <h3 className="fr-label text-white mb-4">SHOP</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/products?category=mens-wear"
                    className="fr-meta text-gray-400 hover:text-white transition-colors"
                  >
                    Men
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products?category=womens-wear"
                    className="fr-meta text-gray-400 hover:text-white transition-colors"
                  >
                    Women
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="fr-meta text-gray-400 hover:text-white transition-colors"
                  >
                    All Products
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="fr-label text-white mb-4">COMPANY</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/about"
                    className="fr-meta text-gray-400 hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="fr-meta text-gray-400 hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/journal"
                    className="fr-meta text-gray-400 hover:text-white transition-colors"
                  >
                    Journal
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="fr-label text-white mb-4">LEGAL</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/privacy"
                    className="fr-meta text-gray-400 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="fr-meta text-gray-400 hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/returns"
                    className="fr-meta text-gray-400 hover:text-white transition-colors"
                  >
                    Returns
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-white/10">
            <p className="fr-meta text-gray-500 text-center">
              © {new Date().getFullYear()} Foal Rider. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
