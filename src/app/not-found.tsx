'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-12 text-center">
        <AlertCircle className="h-24 w-24 mx-auto text-[#C5A572] mb-6" />
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            size="lg"
            className="bg-[#C5A572] hover:bg-[#B89968]"
            asChild
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
          >
            <Link href="/products">
              Browse Products
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
