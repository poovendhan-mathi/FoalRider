"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Loader2, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import Image from "next/image";

interface OrderItem {
  id: string;
  quantity: number;
  price_at_time: number;
  products: {
    id: string;
    name: string;
    image_url: string;
  };
}

interface ShippingAddress {
  name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  currency: string;
  status: string;
  payment_status: string;
  created_at: string;
  shipping_address: ShippingAddress | null;
  email: string;
  order_items: OrderItem[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            id,
            quantity,
            price_at_time,
            products (
              id,
              name,
              image_url
            )
          )
        `
        )
        .eq("id", orderId)
        .single();

      if (error) {
        console.error("Error fetching order:", error);
        setError("Order not found");
      } else {
        setOrder(data);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId, fetchOrder]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#C5A572]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="container mx-auto px-4 py-8">
          <Card className="p-12 text-center max-w-md mx-auto">
            <Package className="h-24 w-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-semibold mb-4">Order Not Found</h2>
            <p className="text-gray-600 mb-8">
              {error || "The order you are looking for does not exist."}
            </p>
            <Button
              size="lg"
              className="bg-[#C5A572] hover:bg-[#B89968] cursor-pointer"
              onClick={() => router.push("/products")}
            >
              Continue Shopping
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return "text-green-600 bg-green-100";
      case "processing":
        return "text-blue-600 bg-blue-100";
      case "shipped":
        return "text-purple-600 bg-purple-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Order Header */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">Order Details</h1>
                <p className="text-gray-600">Order #{order.order_number}</p>
                <p className="text-sm text-gray-500">
                  Placed on{" "}
                  {format(new Date(order.created_at), "MMMM dd, yyyy")}
                </p>
              </div>
              <div className="flex gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.payment_status === "paid"
                      ? "text-green-600 bg-green-100"
                      : "text-orange-600 bg-orange-100"
                  }`}
                >
                  {order.payment_status === "paid" ? "Paid" : "Pending Payment"}
                </span>
              </div>
            </div>
          </Card>

          {/* Order Items */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 border-b last:border-b-0"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden shrink-0">
                    {item.products.image_url ? (
                      <Image
                        src={item.products.image_url}
                        alt={item.products.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.products.name}</h3>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-sm font-medium text-[#C5A572]">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: order.currency || "INR",
                      }).format(item.price_at_time)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: order.currency || "INR",
                      }).format(item.price_at_time * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Total */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-[#C5A572]">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: order.currency || "INR",
                  }).format(order.total_amount)}
                </span>
              </div>
            </div>
          </Card>

          {/* Shipping Address */}
          {order.shipping_address && (
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <div className="text-gray-600">
                {order.shipping_address.name && (
                  <p className="font-medium text-gray-900">
                    {order.shipping_address.name}
                  </p>
                )}
                {order.shipping_address.line1 && (
                  <p>{order.shipping_address.line1}</p>
                )}
                {order.shipping_address.line2 && (
                  <p>{order.shipping_address.line2}</p>
                )}
                <p>
                  {order.shipping_address.city &&
                    `${order.shipping_address.city}, `}
                  {order.shipping_address.state &&
                    `${order.shipping_address.state} `}
                  {order.shipping_address.postal_code}
                </p>
                {order.shipping_address.country && (
                  <p>{order.shipping_address.country}</p>
                )}
              </div>
            </Card>
          )}

          {/* Contact Email */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <p className="text-gray-600">{order.email}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
