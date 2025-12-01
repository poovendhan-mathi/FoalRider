"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Loader2, ArrowLeft, Download, Share2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import Image from "next/image";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  quantity: number;
  price: number; // Database uses 'price' not 'price_at_time'
  subtotal: number; // Database uses 'subtotal'
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
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            id,
            quantity,
            price,
            subtotal,
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

  const downloadReceipt = () => {
    if (!order) return;

    // Create receipt HTML content
    const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Order Receipt - ${order.order_number}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; border-bottom: 2px solid #C5A572; padding-bottom: 20px; margin-bottom: 20px; }
    .header h1 { color: #C5A572; margin: 0; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #333; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .info-item { padding: 8px; background: #f9f9f9; border-radius: 4px; }
    .info-label { font-weight: bold; color: #666; font-size: 12px; }
    .info-value { color: #333; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th { background: #C5A572; color: white; padding: 12px; text-align: left; }
    td { padding: 12px; border-bottom: 1px solid #ddd; }
    .total-row { font-weight: bold; font-size: 18px; background: #f9f9f9; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
    .status-processing { background: #E3F2FD; color: #1976D2; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🐴 FoalRider</h1>
    <p>Premium Equestrian Apparel</p>
  </div>
  
  <div class="section">
    <div class="section-title">Order Receipt</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Order Number</div>
        <div class="info-value">${order.order_number}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Order Date</div>
        <div class="info-value">${format(
          new Date(order.created_at),
          "MMMM dd, yyyy"
        )}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Status</div>
        <div class="info-value">
          <span class="status-badge status-processing">${order.status.toUpperCase()}</span>
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">Payment Status</div>
        <div class="info-value">${order.payment_status.toUpperCase()}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Customer Information</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Email</div>
        <div class="info-value">${order.email}</div>
      </div>
      ${
        order.shipping_address
          ? `
      <div class="info-item">
        <div class="info-label">Shipping Address</div>
        <div class="info-value">
          ${
            typeof order.shipping_address === "string"
              ? JSON.parse(order.shipping_address).address
              : order.shipping_address.line1
          }<br>
          ${
            typeof order.shipping_address === "string"
              ? JSON.parse(order.shipping_address).city
              : order.shipping_address.city
          }, 
          ${
            typeof order.shipping_address === "string"
              ? JSON.parse(order.shipping_address).state
              : order.shipping_address.state
          } 
          ${
            typeof order.shipping_address === "string"
              ? JSON.parse(order.shipping_address).zipCode
              : order.shipping_address.postal_code
          }
        </div>
      </div>
      `
          : ""
      }
    </div>
  </div>

  <div class="section">
    <div class="section-title">Order Items</div>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th style="text-align: center;">Quantity</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${order.order_items
          .map(
            (item) => `
          <tr>
            <td>${item.products.name}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">${new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: order.currency || "INR",
            }).format(item.price)}</td>
            <td style="text-align: right;">${new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: order.currency || "INR",
            }).format(item.subtotal)}</td>
          </tr>
        `
          )
          .join("")}
        <tr class="total-row">
          <td colspan="3" style="text-align: right;">Total Amount:</td>
          <td style="text-align: right;">${new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: order.currency || "INR",
          }).format(order.total_amount)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>Thank you for shopping with FoalRider!</p>
    <p>For any questions, please contact us at support@foalrider.com</p>
  </div>
</body>
</html>
    `;

    // Create blob and download
    const blob = new Blob([receiptHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `FoalRider-Receipt-${order.order_number}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Receipt downloaded successfully!");
  };

  const shareReceipt = async () => {
    if (!order) return;

    const shareData = {
      title: `Order Receipt - ${order.order_number}`,
      text: `My order from FoalRider\nOrder Number: ${
        order.order_number
      }\nTotal: ${new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: order.currency || "INR",
      }).format(order.total_amount)}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } else {
        // Fallback: Copy link to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Order link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Order link copied to clipboard!");
      } catch (clipboardError) {
        toast.error("Failed to share order");
      }
    }
  };

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
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

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <Button
                onClick={downloadReceipt}
                variant="outline"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download Receipt
              </Button>
              <Button
                onClick={shareReceipt}
                variant="outline"
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share Order
              </Button>
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
                      }).format(item.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: order.currency || "INR",
                      }).format(item.subtotal)}
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
