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
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[85vh] bg-black overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1542272604-787c3835535d?w=1920&q=90"
          alt="Hero"
          fill
          className="object-cover opacity-50"
          priority
        />
        {/* Stronger gradient for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />

        {/* Hero Content - Positioned lower, cleaner typography */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-20">
          <div className="max-w-7xl mx-auto">
            {/* Reduced headline size, better contrast */}
            <span className="inline-block text-xs md:text-sm font-semibold tracking-[0.2em] text-white/80 mb-4 uppercase">
              New Collection
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight leading-[1.1]">
              PREMIUM DENIM
            </h1>
            <p className="text-base md:text-lg text-white/70 max-w-md mb-8 leading-relaxed">
              Crafted from the finest Japanese selvedge denim. Designed for
              those who appreciate true quality.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-100 font-semibold px-8 h-12"
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
                className="border-white text-white hover:bg-white hover:text-black font-semibold px-8 h-12"
                asChild
              >
                <Link href="/about">OUR STORY</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid - 2 columns, clean hover effect */}
      <section className="bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Men's Category */}
          <Link
            href="/products?category=mens-wear"
            className="relative aspect-[4/5] md:aspect-[3/4] group overflow-hidden"
          >
            <Image
              src="https://images.unsplash.com/photo-1593030103066-0093718e36d5?w=960&q=90"
              alt="Men's Collection"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <span className="text-xs font-semibold tracking-[0.15em] text-white/70 block mb-2">
                COLLECTION
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                MEN
              </h2>
              <span className="inline-flex items-center text-sm text-white font-medium group-hover:underline underline-offset-4">
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          {/* Women's Category */}
          <Link
            href="/products?category=womens-wear"
            className="relative aspect-[4/5] md:aspect-[3/4] group overflow-hidden"
          >
            <Image
              src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=960&q=90"
              alt="Women's Collection"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <span className="text-xs font-semibold tracking-[0.15em] text-white/70 block mb-2">
                COLLECTION
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                WOMEN
              </h2>
              <span className="inline-flex items-center text-sm text-white font-medium group-hover:underline underline-offset-4">
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-semibold tracking-[0.15em] text-gray-500 block mb-2">
                NEW IN
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-black">
                FEATURED
              </h2>
            </div>
            <Link
              href="/products"
              className="text-sm text-black font-medium underline underline-offset-4 hover:text-gray-600 transition-colors hidden md:inline-flex items-center"
            >
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {/* Products Grid - 2 cols mobile, 4 cols desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Mobile View All Button */}
          <div className="mt-10 text-center md:hidden">
            <Button
              variant="outline"
              className="w-full h-12 font-semibold"
              asChild
            >
              <Link href="/products">
                VIEW ALL PRODUCTS
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Categories - 4-Column Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                category: "SHOP / MEN'S BOTTOMS",
                name: "CLASSIC DENIM JEANS",
                description: "Absolutely stacked with style and attitude.",
                image:
                  "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80",
                href: "/products?category=mens-wear&type=bottoms",
              },
              {
                category: "SHOP / WOMEN'S BOTTOMS",
                name: "RELAXED FIT JEANS",
                description: "There's always room for versatility.",
                image:
                  "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600&q=80",
                href: "/products?category=womens-wear&type=bottoms",
              },
              {
                category: "SHOP / MEN'S TOPS",
                name: "TRUCKER JACKETS",
                description: "It's the classic statement piece you need.",
                image:
                  "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
                href: "/products?category=mens-wear&type=tops",
              },
              {
                category: "SHOP / WOMEN'S TOPS",
                name: "ESSENTIAL TEES",
                description: "The fitted top that never goes out of style.",
                image:
                  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80",
                href: "/products?category=womens-wear&type=tops",
              },
            ].map((item) => (
              <Link key={item.name} href={item.href} className="group block">
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Category Label */}
                <span className="text-[11px] font-medium tracking-wide text-gray-500 block mb-1">
                  {item.category}
                </span>

                {/* Product Name */}
                <h3 className="text-base md:text-lg font-bold text-black mb-1 group-hover:underline underline-offset-2">
                  {item.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Fit Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-[0.15em] text-gray-500 block mb-2">
              EXPLORE
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-black">
              SHOP BY FIT
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                name: "Slim Fit",
                image:
                  "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&q=80",
              },
              {
                name: "Regular Fit",
                image:
                  "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80",
              },
              {
                name: "Relaxed Fit",
                image:
                  "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=400&q=80",
              },
              {
                name: "Skinny Fit",
                image:
                  "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=400&q=80",
              },
            ].map((category) => (
              <Link
                key={category.name}
                href={`/products?fit=${category.name
                  .toLowerCase()
                  .replace(" ", "-")}`}
                className="group relative aspect-[3/4] overflow-hidden bg-gray-100"
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg font-semibold text-white">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="bg-black text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 text-center">
            <span className="text-sm md:text-base font-medium">
              FREE SHIPPING ON ORDERS OVER ₹2,000
            </span>
            <span className="hidden md:inline text-white/50">|</span>
            <span className="hidden md:inline text-sm text-white/70">
              Easy 30-Day Returns
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
