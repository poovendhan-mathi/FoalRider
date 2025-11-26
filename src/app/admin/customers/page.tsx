import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, User, ChevronLeft, ChevronRight } from "lucide-react";
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

const ITEMS_PER_PAGE = 10;

async function getCustomers(page: number = 1) {
  const supabase = await createClient();

  // Calculate offset
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  // Get total count
  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "customer");

  // Get paginated customer profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (profilesError) {
    console.error("Error fetching customers:", profilesError);
    throw new Error("Failed to fetch customers");
  }

  // Get order counts for each customer
  if (profiles && profiles.length > 0) {
    const userIds = profiles.map((profile) => profile.id);

    const { data: orderCounts } = await supabase
      .from("orders")
      .select("user_id")
      .in("user_id", userIds);

    // Count orders per user
    const orderCountMap = new Map();
    orderCounts?.forEach((order) => {
      const count = orderCountMap.get(order.user_id) || 0;
      orderCountMap.set(order.user_id, count + 1);
    });

    // Add order count to each profile
    profiles.forEach((profile) => {
      profile.order_count = orderCountMap.get(profile.id) || 0;
    });
  }

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;

  return {
    customers: profiles || [],
    totalCount: count || 0,
    totalPages,
    currentPage: page,
  };
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  await requireAdmin();

  const page = Number(searchParams.page) || 1;
  const { customers, totalCount, totalPages, currentPage } = await getCustomers(
    page
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Customers</h1>
          <p className="text-gray-600">Manage your customer accounts</p>
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
          <CardTitle>All Customers</CardTitle>
          <CardDescription>
            {totalCount} customer{totalCount !== 1 ? "s" : ""} registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No customers yet</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer: any) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {customer.avatar_url ? (
                              <img
                                src={customer.avatar_url}
                                alt={customer.full_name}
                                className="h-8 w-8 rounded-full"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-4 w-4 text-gray-500" />
                              </div>
                            )}
                            <span className="font-medium">
                              {customer.full_name || "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phone || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {customer.order_count || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(customer.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/customers/${customer.id}`}>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                    {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of{" "}
                    {totalCount} customers
                  </p>
                  <div className="flex gap-2">
                    <Link href={`/admin/customers?page=${currentPage - 1}`}>
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
                          return (
                            p === 1 ||
                            p === totalPages ||
                            (p >= currentPage - 1 && p <= currentPage + 1)
                          );
                        })
                        .map((p, idx, arr) => (
                          <>
                            {idx > 0 && arr[idx - 1] !== p - 1 && (
                              <span key={`ellipsis-${p}`} className="px-2">
                                ...
                              </span>
                            )}
                            <Link key={p} href={`/admin/customers?page=${p}`}>
                              <Button
                                variant={
                                  currentPage === p ? "default" : "outline"
                                }
                                size="sm"
                              >
                                {p}
                              </Button>
                            </Link>
                          </>
                        ))}
                    </div>
                    <Link href={`/admin/customers?page=${currentPage + 1}`}>
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
