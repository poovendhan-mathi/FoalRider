'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, Lock } from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="container mx-auto px-4 py-8">
          <Card className="p-12 text-center max-w-md mx-auto">
            <Lock className="h-24 w-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-semibold mb-4">Admin Access Required</h2>
            <p className="text-gray-600 mb-8">
              Please login with admin credentials to access this area
            </p>
            <Button
              size="lg"
              className="bg-[#C5A572] hover:bg-[#B89968] cursor-pointer"
              onClick={() => router.push('/login?redirect=/admin')}
            >
              Admin Login
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <Shield className="h-12 w-12 text-[#C5A572] mb-4" />
            <h3 className="text-xl font-bold mb-2">Product Management</h3>
            <p className="text-gray-600 mb-4">
              Add, edit, and manage products, categories, and inventory
            </p>
            <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
              Coming in Phase 7
            </p>
          </Card>

          <Card className="p-6">
            <Shield className="h-12 w-12 text-[#C5A572] mb-4" />
            <h3 className="text-xl font-bold mb-2">Order Management</h3>
            <p className="text-gray-600 mb-4">
              View and process customer orders, manage shipments
            </p>
            <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
              Coming in Phase 7
            </p>
          </Card>

          <Card className="p-6">
            <Shield className="h-12 w-12 text-[#C5A572] mb-4" />
            <h3 className="text-xl font-bold mb-2">User Management</h3>
            <p className="text-gray-600 mb-4">
              Manage customer accounts, roles, and permissions
            </p>
            <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
              Coming in Phase 7
            </p>
          </Card>

          <Card className="p-6">
            <Shield className="h-12 w-12 text-[#C5A572] mb-4" />
            <h3 className="text-xl font-bold mb-2">Analytics</h3>
            <p className="text-gray-600 mb-4">
              View sales reports, revenue charts, and performance metrics
            </p>
            <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
              Coming in Phase 7
            </p>
          </Card>

          <Card className="p-6">
            <Shield className="h-12 w-12 text-[#C5A572] mb-4" />
            <h3 className="text-xl font-bold mb-2">Category Management</h3>
            <p className="text-gray-600 mb-4">
              Organize products with hierarchical categories
            </p>
            <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
              Coming in Phase 7
            </p>
          </Card>

          <Card className="p-6">
            <Shield className="h-12 w-12 text-[#C5A572] mb-4" />
            <h3 className="text-xl font-bold mb-2">Settings</h3>
            <p className="text-gray-600 mb-4">
              Configure store settings, shipping, taxes, and more
            </p>
            <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
              Coming in Phase 7
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
