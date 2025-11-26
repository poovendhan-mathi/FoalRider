import { LoadingTable } from "@/components/admin/Loading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CustomersLoading() {
  return (
    <div>
      {/* Header Skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="h-9 w-40 bg-gray-200 rounded mb-2 animate-pulse" />
          <div className="h-5 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Customers Table Skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 w-40 bg-gray-200 rounded mb-2 animate-pulse" />
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <LoadingTable rows={10} columns={6} />
        </CardContent>
      </Card>
    </div>
  );
}
