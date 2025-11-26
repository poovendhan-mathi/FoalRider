import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import OrderStatusFilter from "@/components/admin/OrderStatusFilter";

async function getOrders(status?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data: orders, error } = await query;

  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }

  return orders || [];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount / 100);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    processing: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    shipped: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    delivered: "bg-green-100 text-green-800 hover:bg-green-200",
    cancelled: "bg-red-100 text-red-800 hover:bg-red-200",
  };
  return colors[status] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
}

function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-gray-100 text-gray-800",
    paid: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-orange-100 text-orange-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  await requireAdmin();

  const status = searchParams.status || "all";
  const orders = await getOrders(status);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Orders</h1>
          <p className="text-gray-600">Manage and track all customer orders</p>
        </div>
        <Link href="/admin">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>
                {orders.length} order{orders.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
            <div className="flex gap-3">
              <OrderStatusFilter currentStatus={status} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        {order.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {order.profiles?.full_name || "Guest"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.profiles?.email || order.shipping_email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getPaymentStatusColor(
                            order.payment_status
                          )}
                        >
                          {order.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(order.total_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
