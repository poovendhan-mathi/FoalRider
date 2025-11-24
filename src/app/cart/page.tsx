'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { items, totalItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const { formatPrice } = useCurrency();

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 2000 ? 0 : 200; // Free shipping over $2000
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + shipping + tax;

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
          
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingBag className="h-24 w-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Add some amazing products to your cart and start shopping!
            </p>
            <Link href="/products">
              <Button size="lg" className="bg-[#C5A572] hover:bg-[#B89968] cursor-pointer">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <p className="text-gray-600 mt-2">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={handleClearCart}
            className="hover:bg-red-50 hover:text-red-600 hover:border-red-600 cursor-pointer"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.product.id} className="p-6">
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                    <Image
                      src={item.product.image_url || '/assets/images/product-placeholder.jpg'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatPrice(item.product.price)} each
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-gray-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-3 border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="h-10 w-10 cursor-pointer"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-base font-semibold min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="h-10 w-10 cursor-pointer"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Item Total */}
                      <div className="ml-auto">
                        <p className="text-lg font-bold text-[#C5A572]">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (18% GST)</span>
                  <span className="font-semibold">{formatPrice(tax)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-[#C5A572]">{formatPrice(total)}</span>
                </div>

                {subtotal < 2000 && (
                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                    Add {formatPrice(2000 - subtotal)} more for free shipping!
                  </p>
                )}
              </div>

              <Button
                size="lg"
                className="w-full mt-6 bg-[#C5A572] hover:bg-[#B89968] cursor-pointer"
                asChild
              >
                <Link href="/checkout">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Link href="/products">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full mt-3 cursor-pointer"
                >
                  Continue Shopping
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
