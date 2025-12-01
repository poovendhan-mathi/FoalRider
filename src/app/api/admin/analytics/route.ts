import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerActionClient } from "@/lib/supabase/server";
import { z } from "zod";

const querySchema = z.object({
  period: z.enum(["7d", "30d", "90d", "1y"]).default("30d"),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerActionClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const { period } = querySchema.parse({
      period: searchParams.get("period") || "30d",
    });

    // Calculate date range
    const now = new Date();
    const daysMap = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };
    const daysAgo = daysMap[period];
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // Fetch orders data
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, total_amount, status, created_at, currency")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    if (ordersError) throw ordersError;

    // Fetch products data
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, stock_quantity, created_at")
      .order("created_at", { ascending: false });

    if (productsError) throw productsError;

    // Fetch customers data
    const { data: customers, error: customersError } = await supabase
      .from("profiles")
      .select("id, created_at")
      .gte("created_at", startDate.toISOString());

    if (customersError) throw customersError;

    // Calculate revenue (convert all to INR for simplicity)
    const totalRevenue =
      orders
        ?.filter((o) => o.status === "delivered" || o.status === "paid")
        .reduce((sum, order) => {
          const amount = order.total_amount || 0;
          // If currency is USD, convert to INR (approx 83 rate)
          const inrAmount = order.currency === "USD" ? amount * 83 : amount;
          return sum + inrAmount;
        }, 0) || 0;

    // Calculate average order value
    const completedOrders =
      orders?.filter((o) => o.status === "delivered" || o.status === "paid") ||
      [];
    const avgOrderValue =
      completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

    // Group orders by date for chart
    const ordersByDate = orders?.reduce((acc, order) => {
      const date = new Date(order.created_at).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = { date, count: 0, revenue: 0 };
      }
      acc[date].count += 1;
      if (order.status === "delivered" || order.status === "paid") {
        const amount = order.total_amount || 0;
        const inrAmount = order.currency === "USD" ? amount * 83 : amount;
        acc[date].revenue += inrAmount;
      }
      return acc;
    }, {} as Record<string, { date: string; count: number; revenue: number }>);

    const chartData = Object.values(ordersByDate || {}).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // Top selling products (by order count - would need order_items table for real data)
    const topProducts =
      products?.slice(0, 5).map((p) => ({
        id: p.id,
        name: p.name,
        sales: Math.floor(Math.random() * 50) + 10, // Mock data - needs order_items table
        revenue: p.price * (Math.floor(Math.random() * 50) + 10),
      })) || [];

    // Order status breakdown
    const statusBreakdown = orders?.reduce((acc, order) => {
      const status = order.status || "pending";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate growth rates (compare with previous period)
    const midDate = new Date(
      now.getTime() - (daysAgo / 2) * 24 * 60 * 60 * 1000
    );
    const recentOrders =
      orders?.filter((o) => new Date(o.created_at) >= midDate) || [];
    const olderOrders =
      orders?.filter((o) => new Date(o.created_at) < midDate) || [];

    const recentRevenue = recentOrders
      .filter((o) => o.status === "delivered" || o.status === "paid")
      .reduce((sum, order) => {
        const amount = order.total_amount || 0;
        const inrAmount = order.currency === "USD" ? amount * 83 : amount;
        return sum + inrAmount;
      }, 0);

    const olderRevenue = olderOrders
      .filter((o) => o.status === "delivered" || o.status === "paid")
      .reduce((sum, order) => {
        const amount = order.total_amount || 0;
        const inrAmount = order.currency === "USD" ? amount * 83 : amount;
        return sum + inrAmount;
      }, 0);

    const revenueGrowth =
      olderRevenue > 0
        ? ((recentRevenue - olderRevenue) / olderRevenue) * 100
        : 0;

    const ordersGrowth =
      olderOrders.length > 0
        ? ((recentOrders.length - olderOrders.length) / olderOrders.length) *
          100
        : 0;

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalOrders: orders?.length || 0,
        avgOrderValue,
        totalCustomers: customers?.length || 0,
        totalProducts: products?.length || 0,
        revenueGrowth,
        ordersGrowth,
      },
      chartData,
      topProducts,
      statusBreakdown,
      period,
    });
  } catch (error) {
    console.error("Analytics API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid parameters", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
