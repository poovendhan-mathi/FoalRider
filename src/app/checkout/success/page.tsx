"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Package, Mail } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-4">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600 mb-8">
            Thank you for your purchase. Your order has been confirmed.
          </p>

          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="text-lg font-mono font-bold text-[#C5A572]">
                {orderId}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
            <div className="bg-blue-50 rounded-lg p-4 flex gap-3">
              <Mail className="h-6 w-6 text-blue-600 shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Order Confirmation</h3>
                <p className="text-sm text-gray-600">
                  A confirmation email has been sent to your email address
                </p>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 flex gap-3">
              <Package className="h-6 w-6 text-purple-600 shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Delivery Updates</h3>
                <p className="text-sm text-gray-600">
                  You&apos;ll receive shipping updates via email
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="bg-[#C5A572] hover:bg-[#B89968] cursor-pointer"
              asChild
            >
              <Link href="/products">Continue Shopping</Link>
            </Button>
            {orderId && (
              <Button
                variant="outline"
                size="lg"
                className="cursor-pointer"
                asChild
              >
                <Link href={`/orders/${orderId}`}>View Order Details</Link>
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A572]"></div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
