"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { calculateOrderTotals, SHIPPING_CONFIG } from "@/lib/pricing";

export default function CartPage() {
  const { items, totalItems, removeFromCart, updateQuantity, clearCart } =
    useCart();
  const { formatPrice } = useCurrency();
  const [showClearDialog, setShowClearDialog] = useState(false);

  // Calculate subtotal from cart items
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Use centralized pricing functions for shipping, tax, and total
  const { shipping, tax, total } = calculateOrderTotals(subtotal);

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleClearCart = () => {
    setShowClearDialog(true);
  };

  const confirmClearCart = () => {
    clearCart();
    setShowClearDialog(false);
  };

  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] pt-24">
        <div className="container mx-auto px-4 py-12">
          <h1 className="font-['Playfair_Display'] text-4xl font-bold text-black mb-8">
            Shopping Cart
          </h1>

          <Card variant="elevated" className="p-16 text-center rounded-2xl">
            <div className="p-6 bg-[#C5A572]/10 rounded-full w-fit mx-auto mb-8">
              <ShoppingBag className="h-16 w-16 text-[#C5A572]" />
            </div>
            <h2 className="font-['Playfair_Display'] text-2xl font-semibold text-black mb-4">
              Your cart is empty
            </h2>
            <p className="font-['Montserrat'] text-[#9CA3AF] mb-8 max-w-md mx-auto">
              Discover our premium collection and add some amazing products to
              your cart.
            </p>
            <Button size="lg" variant="gold" asChild>
              <Link href="/products">
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="font-['Playfair_Display'] text-4xl font-bold text-black">
              Shopping Cart
            </h1>
            <p className="font-['Montserrat'] text-[#9CA3AF] mt-2">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={handleClearCart}
            className="hover:bg-red-50 hover:text-red-600 hover:border-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card
                key={item.product.id}
                variant="elevated"
                className="p-6 rounded-2xl"
              >
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-[#F8F6F3]">
                    <Image
                      src={
                        item.product.image_url ||
                        "/assets/images/product-placeholder.svg"
                      }
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="grow">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-['Playfair_Display'] text-lg font-semibold text-black mb-1">
                          {item.product.name}
                        </h3>
                        <p className="font-['Montserrat'] text-sm text-[#9CA3AF]">
                          {formatPrice(item.product.price)} each
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-[#9CA3AF] hover:text-red-500 transition-colors p-2 h-fit tap-feedback active:scale-90"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-[#E5E5E5] rounded-lg">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.product.id,
                              item.quantity - 1
                            )
                          }
                          className="h-12 w-12 flex items-center justify-center hover:bg-[#F8F6F3] transition-all rounded-l-lg tap-feedback active:bg-[#E5E5E5]"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-['Montserrat'] font-semibold w-12 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.product.id,
                              item.quantity + 1
                            )
                          }
                          className="h-12 w-12 flex items-center justify-center hover:bg-[#F8F6F3] transition-all rounded-r-lg tap-feedback active:bg-[#E5E5E5]"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <span className="font-['Montserrat'] text-xl font-bold text-[#C5A572]">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card variant="elevated" className="p-8 rounded-2xl sticky top-24">
              <h2 className="font-['Playfair_Display'] text-2xl font-bold text-black mb-8">
                Order Summary
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between font-['Montserrat']">
                  <span className="text-[#9CA3AF]">Subtotal</span>
                  <span className="font-semibold text-black">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between font-['Montserrat']">
                  <span className="text-[#9CA3AF]">Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-emerald-500">Free</span>
                    ) : (
                      <span className="text-black">
                        {formatPrice(shipping)}
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between font-['Montserrat']">
                  <span className="text-[#9CA3AF]">Tax (18% GST)</span>
                  <span className="font-semibold text-black">
                    {formatPrice(tax)}
                  </span>
                </div>

                <div className="h-px bg-[#E5E5E5] my-4" />

                <div className="flex justify-between">
                  <span className="font-['Montserrat'] text-lg font-semibold text-black">
                    Total
                  </span>
                  <span className="font-['Montserrat'] text-2xl font-bold text-[#C5A572]">
                    {formatPrice(total)}
                  </span>
                </div>

                {subtotal < SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD && (
                  <div className="font-['Montserrat'] text-sm text-[#4B5563] bg-[#C5A572]/10 p-4 rounded-xl mt-4">
                    Add{" "}
                    <span className="font-semibold text-[#C5A572]">
                      {formatPrice(
                        SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD - subtotal
                      )}
                    </span>{" "}
                    more for free shipping!
                  </div>
                )}
              </div>

              <Button
                size="lg"
                variant="gold"
                className="w-full h-14 text-base"
                asChild
              >
                <Link href="/checkout">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full h-12 mt-4"
                asChild
              >
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Clear Cart Confirmation Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-['Playfair_Display'] text-xl">
              Clear Shopping Cart?
            </DialogTitle>
            <DialogDescription className="font-['Montserrat']">
              This will remove all {totalItems} item
              {totalItems !== 1 ? "s" : ""} from your cart. This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmClearCart}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
