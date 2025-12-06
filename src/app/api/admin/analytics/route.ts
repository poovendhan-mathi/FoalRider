import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerActionClient } from "@/lib/supabase/server";
import { z } from "zod";
import { logger } from "@/lib/logger";

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
      logger.warn("Analytics API: Unauthorized access attempt", {
        context: "Analytics",
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      logger.warn("Analytics API: Non-admin access attempt", {
        context: "Analytics",
        data: { userId: user.id },
      });
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

    if (ordersError) {
      logger.error("Analytics API: Failed to fetch orders", ordersError, {
        context: "Analytics",
      });
      throw ordersError;
    }

    // Fetch products data
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, inventory, created_at")
      .order("created_at", { ascending: false });

    if (productsError) {
      logger.error("Analytics API: Failed to fetch products", productsError, {
        context: "Analytics",
      });
      throw productsError;
    }

    // Fetch customers data
    const { data: customers, error: customersError } = await supabase
      .from("profiles")
      .select("id, created_at")
      .gte("created_at", startDate.toISOString());

    if (customersError) {
      logger.error("Analytics API: Failed to fetch customers", customersError, {
        context: "Analytics",
      });
      throw customersError;
    }

    // Fetch exchange rates for proper currency conversion
    const { data: currencyRates } = await supabase
      .from("currency_rates")
      .select("currency_code, rate_to_usd");

    const ratesMap: Record<string, number> = {};
    currencyRates?.forEach((rate) => {
      ratesMap[rate.currency_code] = rate.rate_to_usd;
    });

    /**
     * Convert order amount to USD (cents)
     * Note: All prices in database are stored in cents (smallest unit)
     * @param amount - Amount in cents
     * @param currency - Currency code (USD, INR, etc.)
     * @returns Amount in USD cents
     */
    const convertToUSDCents = (amount: number, currency: string): number => {
      if (currency === "USD" || !ratesMap[currency]) return amount;
      // rate_to_usd means 1 unit of this currency = X USD
      // e.g., 1 INR = 0.012 USD, so 100 INR cents = 1.2 USD cents
      return amount * ratesMap[currency];
    };

    // Calculate revenue (convert all to USD cents, then to dollars for display)
    // Note: total_amount is stored in cents (smallest unit)
    const totalRevenueCents =
      orders
        ?.filter((o) => o.status === "delivered" || o.status === "paid")
        .reduce((sum, order) => {
          const amount = order.total_amount || 0;
          const usdAmount = convertToUSDCents(amount, order.currency || "USD");
          return sum + usdAmount;
        }, 0) || 0;

    // Convert cents to dollars for display
    const totalRevenue = totalRevenueCents / 100;

    // Calculate average order value (in dollars for display)
    const completedOrders =
      orders?.filter((o) => o.status === "delivered" || o.status === "paid") ||
      [];
    const avgOrderValue =
      completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

    // Group orders by date for chart (revenue in dollars)
    const ordersByDate = orders?.reduce((acc, order) => {
      const date = new Date(order.created_at).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = { date, count: 0, revenue: 0 };
      }
      acc[date].count += 1;
      if (order.status === "delivered" || order.status === "paid") {
        const amount = order.total_amount || 0;
        const usdAmount = convertToUSDCents(amount, order.currency || "USD");
        acc[date].revenue += usdAmount / 100; // Convert to dollars
      }
      return acc;
    }, {} as Record<string, { date: string; count: number; revenue: number }>);

    const chartData = Object.values(ordersByDate || {}).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // Top selling products (by order count - would need order_items table for real data)
    // Note: product prices are in cents, convert to dollars for display
    const topProducts =
      products?.slice(0, 5).map((p) => ({
        id: p.id,
        name: p.name,
        sales: Math.floor(Math.random() * 50) + 10, // Mock data - needs order_items table
        revenue: (p.price / 100) * (Math.floor(Math.random() * 50) + 10), // Convert cents to dollars
      })) || [];

    // Order status breakdown
    const statusBreakdown = orders?.reduce((acc, order) => {
      const status = order.status || "pending";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate growth rates (compare with previous period)
    // Revenue values are in dollars
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
        const usdAmount = convertToUSDCents(amount, order.currency || "USD");
        return sum + usdAmount / 100; // Convert to dollars
      }, 0);

    const olderRevenue = olderOrders
      .filter((o) => o.status === "delivered" || o.status === "paid")
      .reduce((sum, order) => {
        const amount = order.total_amount || 0;
        const usdAmount = convertToUSDCents(amount, order.currency || "USD");
        return sum + usdAmount / 100; // Convert to dollars
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

    logger.info("Analytics API: Data fetched successfully", {
      context: "Analytics",
      data: {
        period,
        ordersCount: orders?.length,
        customersCount: customers?.length,
      },
    });

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
    logger.error("Analytics API error", error, { context: "Analytics" });

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
