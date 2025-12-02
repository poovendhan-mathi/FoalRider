import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export const metadata = {
  title: "About Us | Foal Rider - Premium Denim Collection",
  description:
    "Learn about Foal Rider, your destination for premium quality denim wear. Discover our story, mission, and commitment to exceptional craftsmanship.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-16">
      <div className="pt-4">
        {/* Hero Section */}
        <section className="relative py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="outline-gold" className="mb-6">
                OUR HERITAGE
              </Badge>
              <h1 className="font-['Playfair_Display'] text-5xl md:text-6xl font-bold mb-6 text-black">
                About <span className="text-[#C5A572]">Foal Rider</span>
              </h1>
              <p className="font-['Montserrat'] text-xl text-[#4B5563] leading-relaxed">
                Your destination for premium quality denim wear. We specialize
                in timeless jeans and denim apparel that combine exceptional
                craftsmanship with contemporary style.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-24 bg-[#F8F6F3]">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <Badge variant="outline-gold" className="mb-4">
                    SINCE 2020
                  </Badge>
                  <h2 className="font-['Playfair_Display'] text-4xl font-bold mb-6 text-black">
                    Our Story
                  </h2>
                  <div className="space-y-4">
                    <p className="font-['Montserrat'] text-[#4B5563] leading-relaxed">
                      Foal Rider was born from a passion for exceptional denim
                      craftsmanship. We believe that the perfect pair of jeans
                      is more than just clothing—it's a statement of quality,
                      comfort, and timeless style.
                    </p>
                    <p className="font-['Montserrat'] text-[#4B5563] leading-relaxed">
                      Our journey began with a simple vision: to create denim
                      pieces that stand the test of time, both in durability and
                      design. Every product in our collection is carefully
                      curated to meet the highest standards of quality and
                      style.
                    </p>
                    <p className="font-['Montserrat'] text-[#4B5563] leading-relaxed">
                      We focus primarily on premium denim wear—from classic
                      jeans in various fits to versatile denim jackets. Each
                      piece is designed to become a wardrobe staple that you'll
                      reach for season after season.
                    </p>
                  </div>
                </div>
                <div className="relative aspect-square rounded-2xl overflow-hidden group">
                  <img
                    src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80"
                    alt="Denim fabric texture"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1 relative aspect-square rounded-2xl overflow-hidden group">
                  <img
                    src="https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80"
                    alt="Premium denim jeans"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="order-1 md:order-2">
                  <Badge variant="outline-gold" className="mb-4">
                    OUR PURPOSE
                  </Badge>
                  <h2 className="font-['Playfair_Display'] text-4xl font-bold mb-6 text-black">
                    Our Mission
                  </h2>
                  <div className="space-y-6">
                    <p className="font-['Montserrat'] text-[#4B5563] leading-relaxed">
                      At Foal Rider, we're committed to providing our customers
                      with premium denim products that combine quality, comfort,
                      and style. Our mission is to make exceptional denim
                      accessible to everyone who appreciates fine craftsmanship.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 h-6 w-6 rounded-full bg-[#C5A572]/10 flex items-center justify-center shrink-0">
                          <div className="h-3 w-3 rounded-full bg-[#C5A572]" />
                        </div>
                        <div>
                          <h3 className="font-['Montserrat'] font-semibold mb-1 text-black">
                            Quality First
                          </h3>
                          <p className="font-['Montserrat'] text-sm text-[#9CA3AF]">
                            Premium fabrics and meticulous attention to detail
                            in every stitch
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 h-6 w-6 rounded-full bg-[#C5A572]/10 flex items-center justify-center shrink-0">
                          <div className="h-3 w-3 rounded-full bg-[#C5A572]" />
                        </div>
                        <div>
                          <h3 className="font-['Montserrat'] font-semibold mb-1 text-black">
                            Timeless Design
                          </h3>
                          <p className="font-['Montserrat'] text-sm text-[#9CA3AF]">
                            Classic styles that never go out of fashion
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 h-6 w-6 rounded-full bg-[#C5A572]/10 flex items-center justify-center shrink-0">
                          <div className="h-3 w-3 rounded-full bg-[#C5A572]" />
                        </div>
                        <div>
                          <h3 className="font-['Montserrat'] font-semibold mb-1 text-black">
                            Customer Satisfaction
                          </h3>
                          <p className="font-['Montserrat'] text-sm text-[#9CA3AF]">
                            Dedicated to providing exceptional shopping
                            experience
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-24 bg-[#F8F6F3]">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <Badge variant="outline-gold" className="mb-4">
                  WHY US
                </Badge>
                <h2 className="font-['Playfair_Display'] text-4xl font-bold text-black">
                  Why Choose <span className="text-[#C5A572]">Foal Rider</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card variant="elevated" className="text-center rounded-2xl">
                  <CardContent className="p-8">
                    <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C5A572]/10">
                      <svg
                        className="w-8 h-8 text-[#C5A572] stroke-[1.5]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3 className="font-['Playfair_Display'] text-xl font-semibold mb-3 text-black">
                      Premium Quality
                    </h3>
                    <p className="font-['Montserrat'] text-[#9CA3AF]">
                      Every piece is crafted from high-quality denim fabrics
                      that are durable, comfortable, and age beautifully.
                    </p>
                  </CardContent>
                </Card>
                <Card variant="elevated" className="text-center rounded-2xl">
                  <CardContent className="p-8">
                    <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C5A572]/10">
                      <svg
                        className="w-8 h-8 text-[#C5A572] stroke-[1.5]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                        />
                      </svg>
                    </div>
                    <h3 className="font-['Playfair_Display'] text-xl font-semibold mb-3 text-black">
                      Perfect Fit
                    </h3>
                    <p className="font-['Montserrat'] text-[#9CA3AF]">
                      From slim to relaxed fits, we offer diverse styles
                      designed to flatter every body type and preference.
                    </p>
                  </CardContent>
                </Card>
                <Card variant="elevated" className="text-center rounded-2xl">
                  <CardContent className="p-8">
                    <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C5A572]/10">
                      <svg
                        className="w-8 h-8 text-[#C5A572] stroke-[1.5]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-['Playfair_Display'] text-xl font-semibold mb-3 text-black">
                      Great Value
                    </h3>
                    <p className="font-['Montserrat'] text-[#9CA3AF]">
                      Premium quality at accessible prices. We believe everyone
                      deserves exceptional denim without breaking the bank.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="outline-gold" className="mb-4">
                THE TEAM
              </Badge>
              <h2 className="font-['Playfair_Display'] text-4xl font-bold mb-8 text-black">
                Created By
              </h2>
              <Card variant="elevated" className="inline-block rounded-2xl">
                <CardContent className="p-10">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#C5A572] to-[#A8894E] flex items-center justify-center shadow-lg">
                    <span className="font-['Playfair_Display'] text-3xl font-bold text-white">
                      P
                    </span>
                  </div>
                  <h3 className="font-['Playfair_Display'] text-2xl font-semibold mb-2 text-black">
                    Pooven
                  </h3>
                  <p className="font-['Montserrat'] text-[#C5A572] font-medium mb-4">
                    Founder & Creator
                  </p>
                  <p className="font-['Montserrat'] text-[#4B5563] max-w-sm">
                    Passionate about creating exceptional digital experiences
                    and bringing quality denim fashion to customers worldwide.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-black">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-['Playfair_Display'] text-4xl font-bold mb-6 text-white">
                Ready to Find Your Perfect Denim?
              </h2>
              <p className="font-['Montserrat'] text-xl text-white/70 mb-8">
                Explore our curated collection of premium jeans and denim wear
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  size="lg"
                  variant="gold"
                  className="font-['Montserrat']"
                  asChild
                >
                  <Link href="/products">Shop Now</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="font-['Montserrat'] border-white text-white hover:bg-white hover:text-black"
                  asChild
                >
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
