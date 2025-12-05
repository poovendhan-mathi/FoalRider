"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
} from "lucide-react";
import { formatPrice } from "@/lib/currency";

interface AnalyticsData {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    totalCustomers: number;
    totalProducts: number;
    revenueGrowth: number;
    ordersGrowth: number;
  };
  chartData: Array<{
    date: string;
    count: number;
    revenue: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  statusBreakdown: Record<string, number>;
  period: string;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "1y">("30d");

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/analytics?period=${period}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(
          errorData.error ||
            `Error ${response.status}: Failed to load analytics`
        );
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setError("Network error: Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A572]"></div>
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="text-lg text-red-500">
          {error || "Failed to load analytics data"}
        </div>
        <Button onClick={fetchAnalytics} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  const { summary, chartData, topProducts, statusBreakdown } = data;

  // Convert status breakdown to chart data
  const statusChartData = Object.entries(statusBreakdown).map(
    ([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    })
  );

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-end gap-2">
        <Button
          variant={period === "7d" ? "default" : "outline"}
          size="sm"
          onClick={() => setPeriod("7d")}
        >
          7 Days
        </Button>
        <Button
          variant={period === "30d" ? "default" : "outline"}
          size="sm"
          onClick={() => setPeriod("30d")}
        >
          30 Days
        </Button>
        <Button
          variant={period === "90d" ? "default" : "outline"}
          size="sm"
          onClick={() => setPeriod("90d")}
        >
          90 Days
        </Button>
        <Button
          variant={period === "1y" ? "default" : "outline"}
          size="sm"
          onClick={() => setPeriod("1y")}
        >
          1 Year
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(summary.totalRevenue / 100, "INR")}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {summary.revenueGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span
                className={
                  summary.revenueGrowth >= 0 ? "text-green-500" : "text-red-500"
                }
              >
                {Math.abs(summary.revenueGrowth).toFixed(1)}%
              </span>
              <span className="ml-1">from previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalOrders}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {summary.ordersGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span
                className={
                  summary.ordersGrowth >= 0 ? "text-green-500" : "text-red-500"
                }
              >
                {Math.abs(summary.ordersGrowth).toFixed(1)}%
              </span>
              <span className="ml-1">from previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Order Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(summary.avgOrderValue / 100, "INR")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per completed order
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              New in selected period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Trend */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Revenue & Orders Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString()
                  }
                  formatter={(value: number, name: string) => {
                    if (name === "revenue") {
                      return [formatPrice(value / 100, "INR"), "Revenue"];
                    }
                    return [value, "Orders"];
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Revenue"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="count"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === "revenue") {
                      return [formatPrice(value / 100, "INR"), "Revenue"];
                    }
                    return [value, "Sales"];
                  }}
                />
                <Legend />
                <Bar dataKey="sales" fill="#3b82f6" name="Sales" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
