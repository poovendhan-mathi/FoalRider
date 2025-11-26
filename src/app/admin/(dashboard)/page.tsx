import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Package, ShoppingCart, Users, BarChart3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

async function getDashboardStats() {
  const supabase = await createClient();

  const { count: productsCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  const { count: ordersCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  const { count: customersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { data: revenueData } = await supabase
    .from("orders")
    .select("total_amount")
    .in("status", ["processing", "shipped", "delivered"]);

  const totalRevenue =
    revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) ||
    0;

  return {
    products: productsCount || 0,
    orders: ordersCount || 0,
    customers: customersCount || 0,
    revenue: totalRevenue,
  };
}

export default async function AdminPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <CardDescription>Welcome to your admin dashboard.</CardDescription>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(stats.revenue / 100).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From {stats.orders} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products}</div>
            <Link
              href="/admin/products"
              className="text-xs text-blue-600 hover:underline"
            >
              Manage products
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customers}</div>
            <Link
              href="/admin/customers"
              className="text-xs text-blue-600 hover:underline"
            >
              View all customers
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
