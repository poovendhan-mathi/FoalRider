import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookOpen, ArrowRight } from 'lucide-react';

export default function JournalPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
          Journal
        </h1>
        
        <Card className="p-12 text-center max-w-2xl mx-auto">
          <BookOpen className="h-24 w-24 mx-auto text-[#C5A572] mb-6" />
          <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
          <p className="text-gray-600 mb-8">
            Our journal section is currently under development. Stay tuned for stories, 
            fashion tips, and behind-the-scenes content from Foal Rider.
          </p>
          <Button
            size="lg"
            className="bg-[#C5A572] hover:bg-[#B89968] cursor-pointer"
            asChild
          >
            <Link href="/products">
              Explore Collections
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
