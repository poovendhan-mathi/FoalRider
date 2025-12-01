import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";

// Helper functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount / 100);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

async function getDashboardStats() {
  const supabase = await getSupabaseServerClient();

  // Get total products
  const { count: productsCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  // Get total orders
  const { count: ordersCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  // Get total customers
  const { count: customersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "customer");

  // Get total revenue (sum of all completed orders)
  const { data: revenueData } = await supabase
    .from("orders")
    .select("total_amount")
    .eq("payment_status", "paid");

  const totalRevenue =
    revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) ||
    0;

  // Get recent orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(5);

  // Get pending orders count
  const { count: pendingOrdersCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  return {
    productsCount: productsCount || 0,
    ordersCount: ordersCount || 0,
    customersCount: customersCount || 0,
    totalRevenue,
    recentOrders: recentOrders || [],
    pendingOrdersCount: pendingOrdersCount || 0,
  };
}

export default async function AdminPage() {
  // Check if user is admin
  await requireAdmin();

  const stats = await getDashboardStats();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Link
          href="/admin/products"
          className="transition-transform hover:scale-105"
        >
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.productsCount}</div>
              <p className="text-xs text-muted-foreground">Active products</p>
            </CardContent>
          </Card>
        </Link>

        <Link
          href="/admin/orders"
          className="transition-transform hover:scale-105"
        >
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ordersCount}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingOrdersCount} pending
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link
          href="/admin/customers"
          className="transition-transform hover:scale-105"
        >
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Customers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.customersCount}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>
        </Link>

        <Link
          href="/admin/analytics"
          className="transition-transform hover:scale-105"
        >
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Actions & Recent Orders */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your store</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Link href="/admin/products/new">
                <Button className="w-full" variant="outline">
                  <Package className="h-4 w-4 mr-2" />
                  Add New Product
                </Button>
              </Link>
              <Link href="/admin/orders">
                <Button className="w-full" variant="outline">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  View All Orders
                </Button>
              </Link>
              <Link href="/admin/customers">
                <Button className="w-full" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Customers
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest orders from customers</CardDescription>
              </div>
              <Link href="/admin/orders">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {stats.recentOrders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {stats.recentOrders.map(
                    (order: {
                      id: string;
                      customer_name: string;
                      status: string;
                      total: number;
                      created_at: string;
                    }) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between border-b pb-4 last:border-0"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">
                            {order.customer_name || "Guest"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          <p className="font-semibold">
                            {formatCurrency(order.total)}
                          </p>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pending Orders Alert */}
      {stats.pendingOrdersCount > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <Clock className="h-5 w-5" />
              Pending Orders Require Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-800 mb-4">
              You have {stats.pendingOrdersCount} pending order
              {stats.pendingOrdersCount > 1 ? "s" : ""} waiting for processing.
            </p>
            <Link href="/admin/orders?status=pending">
              <Button variant="default" size="sm">
                View Pending Orders
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
