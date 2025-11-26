import { requireAdmin } from "@/lib/auth/admin";
import Link from "next/link";
import { ArrowLeft, BarChart3, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AnalyticsPage() {
  await requireAdmin();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-gray-600">
            View detailed reports and insights about your store
          </p>
        </div>
        <Link href="/admin">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Sales Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Revenue trends, top-selling products, and sales performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Customer Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Customer behavior, lifetime value, and retention metrics
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Time-based Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Daily, weekly, and monthly performance reports
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Advanced analytics features are in development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold mb-1">Revenue Charts</h3>
              <p className="text-sm text-gray-600">
                Interactive line charts showing revenue trends over time with
                date range selection
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold mb-1">Product Performance</h3>
              <p className="text-sm text-gray-600">
                Bar charts displaying top-selling products and inventory
                turnover rates
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold mb-1">Customer Analytics</h3>
              <p className="text-sm text-gray-600">
                Customer acquisition costs, retention rates, and lifetime value
                analysis
              </p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-semibold mb-1">Order Statistics</h3>
              <p className="text-sm text-gray-600">
                Pie charts showing order status distribution and average order
                value metrics
              </p>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-semibold mb-1">Export Reports</h3>
              <p className="text-sm text-gray-600">
                Download comprehensive reports in CSV or PDF format for offline
                analysis
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
