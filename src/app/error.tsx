'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-12 text-center">
        <AlertTriangle className="h-24 w-24 mx-auto text-red-500 mb-6" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Something Went Wrong</h2>
        <p className="text-gray-600 mb-8">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            size="lg"
            className="bg-[#C5A572] hover:bg-[#B89968]"
            onClick={reset}
          >
            Try Again
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => window.location.href = '/'}
          >
            Go Home
          </Button>
        </div>
      </Card>
    </div>
  );
}
