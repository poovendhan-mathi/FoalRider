'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Package, ShoppingBag, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  currency: string;
  status: string;
  payment_status: string;
  created_at: string;
  shipping_address: any;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id) // Filter orders by current user
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        setOrders(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="container mx-auto px-4 py-8">
          <Card className="p-12 text-center max-w-md mx-auto">
            <Package className="h-24 w-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-semibold mb-4">Login Required</h2>
            <p className="text-gray-600 mb-8">
              Please login to view your order history
            </p>
            <Button
              size="lg"
              className="bg-[#C5A572] hover:bg-[#B89968] cursor-pointer"
              onClick={() => router.push('/login?redirect=/profile/orders')}
            >
              Login
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#C5A572]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Order History</h1>
        
        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingBag className="h-24 w-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-semibold mb-4">No Orders Yet</h2>
            <p className="text-gray-600 mb-8">
              You haven't placed any orders yet. Start shopping to see your order history here!
            </p>
            <Button
              size="lg"
              className="bg-[#C5A572] hover:bg-[#B89968] cursor-pointer"
              asChild
            >
              <Link href="/products">
                Start Shopping
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold">{order.order_number}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === 'delivered' 
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'processing'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'shipped'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.payment_status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      Placed on {format(new Date(order.created_at), 'MMM dd, yyyy')} at {format(new Date(order.created_at), 'HH:mm')}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Ship to: {order.shipping_address?.address}, {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zipCode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#C5A572]">
                      {order.currency === 'INR' ? '₹' : '$'}{order.total_amount.toFixed(2)}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 tap-feedback"
                      onClick={() => router.push(`/orders/${order.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
