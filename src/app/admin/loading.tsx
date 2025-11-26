import { LoadingCards } from "@/components/admin/Loading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AdminLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="animate-pulse">
        <div className="h-10 w-48 bg-gray-200 rounded mb-2" />
        <div className="h-5 w-96 bg-gray-200 rounded" />
      </div>

      {/* Stats Cards Skeleton */}
      <LoadingCards count={4} />

      {/* Quick Actions & Recent Orders Skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 bg-gray-200 rounded animate-pulse"
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                      <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
                      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
