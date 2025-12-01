import { requireAdmin } from "@/lib/auth/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const ITEMS_PER_PAGE = 10;

async function getOrders(status?: string, page: number = 1) {
  const supabase = await getSupabaseServerClient();

  // Calculate offset
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  // Get total count
  let countQuery = supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  if (status && status !== "all") {
    countQuery = countQuery.eq("status", status);
  }

  const { count } = await countQuery;

  // Get paginated data
  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data: orders, error } = await query;

  if (error) {
    console.error("Error fetching orders:", error);
    throw new Error("Failed to fetch orders");
  }

  // Fetch profile data separately for non-guest orders
  if (orders && orders.length > 0) {
    const userIds = orders
      .filter((order) => order.user_id)
      .map((order) => order.user_id);

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      // Merge profile data with orders
      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
      orders.forEach((order) => {
        if (order.user_id) {
          order.profile = profileMap.get(order.user_id) || null;
        }
      });
    }
  }

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;

  return {
    orders: orders || [],
    totalCount: count || 0,
    totalPages,
    currentPage: page,
  };
}

function formatCurrency(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
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
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const status = params.status || "all";
  const page = Number(params.page) || 1;
  const { orders, totalCount, totalPages, currentPage } = await getOrders(
    status,
    page
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Orders</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage and track all customer orders
          </p>
        </div>
        <Link href="/admin">
          <Button
            variant="outline"
            size="sm"
            className="sm:size-default w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>
                {totalCount} order{totalCount !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
            <div className="w-full sm:w-auto">
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
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Customer
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Date
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Payment
                      </TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs sm:text-sm">
                          {order.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div>
                            <p className="font-medium text-sm">
                              {order.profile?.full_name ||
                                order.customer_name ||
                                "Guest"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {order.profile?.email ||
                                order.customer_email ||
                                order.guest_email ||
                                order.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">
                          {formatDate(order.created_at)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${getStatusColor(
                              order.status
                            )} text-xs`}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge
                            className={`${getPaymentStatusColor(
                              order.payment_status
                            )} text-xs`}
                          >
                            {order.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-sm sm:text-base">
                          {formatCurrency(
                            order.total_amount,
                            order.currency || "INR"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button variant="ghost" size="sm">
                              <span className="hidden sm:inline">
                                View Details
                              </span>
                              <span className="sm:hidden">View</span>
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                    {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of{" "}
                    {totalCount} orders
                  </p>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/orders?status=${status}&page=${
                        currentPage - 1
                      }`}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                    </Link>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => {
                          // Show first, last, current, and adjacent pages
                          return (
                            p === 1 ||
                            p === totalPages ||
                            (p >= currentPage - 1 && p <= currentPage + 1)
                          );
                        })
                        .map((p, idx, arr) => (
                          <div key={p}>
                            {idx > 0 && arr[idx - 1] !== p - 1 && (
                              <span className="px-2">...</span>
                            )}
                            <Link
                              href={`/admin/orders?status=${status}&page=${p}`}
                            >
                              <Button
                                variant={
                                  currentPage === p ? "default" : "outline"
                                }
                                size="sm"
                              >
                                {p}
                              </Button>
                            </Link>
                          </div>
                        ))}
                    </div>
                    <Link
                      href={`/admin/orders?status=${status}&page=${
                        currentPage + 1
                      }`}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
