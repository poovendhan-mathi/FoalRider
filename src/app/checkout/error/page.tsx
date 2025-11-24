'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { XCircle, RefreshCw, HelpCircle } from 'lucide-react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('message') || 'Payment processing failed';

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 rounded-full p-4">
              <XCircle className="h-16 w-16 text-red-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-4">Payment Failed</h1>
          <p className="text-gray-600 mb-8">
            {errorMessage}
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 text-left">
            <div className="flex gap-3">
              <HelpCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">What went wrong?</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Your payment method may have been declined</li>
                  <li>• There may have been insufficient funds</li>
                  <li>• A technical error may have occurred</li>
                  <li>• Your card information may have been incorrect</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="bg-[#C5A572] hover:bg-[#B89968] cursor-pointer"
              asChild
            >
              <Link href="/checkout">
                <RefreshCw className="mr-2 h-5 w-5" />
                Try Again
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="cursor-pointer"
              asChild
            >
              <Link href="/cart">
                Return to Cart
              </Link>
            </Button>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Need help? <Link href="/contact" className="text-[#C5A572] hover:underline">Contact our support team</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A572]"></div>
    </div>}>
      <ErrorContent />
    </Suspense>
  );
}
