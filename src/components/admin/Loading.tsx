import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
  text,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2
        className={cn("animate-spin text-gray-600", sizeClasses[size])}
      />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
}

interface LoadingTableProps {
  rows?: number;
  columns?: number;
}

export function LoadingTable({ rows = 5, columns = 6 }: LoadingTableProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          {Array.from({ length: columns }).map((_, j) => (
            <div
              key={j}
              className="h-8 bg-gray-200 rounded"
              style={{ width: `${100 / columns}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface LoadingCardProps {
  count?: number;
}

export function LoadingCards({ count = 4 }: LoadingCardProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-6 bg-white border border-gray-200 rounded-lg space-y-3 animate-pulse"
        >
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-8 w-16 bg-gray-200 rounded" />
          <div className="h-3 w-24 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-64 bg-gray-200 rounded" />
      </div>
      <LoadingCards />
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
        <LoadingTable />
      </div>
    </div>
  );
}
