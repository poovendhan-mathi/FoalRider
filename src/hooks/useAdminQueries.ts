import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Analytics Query
export function useAnalytics(period: "7d" | "30d" | "90d" | "1y" = "30d") {
  return useQuery({
    queryKey: ["analytics", period],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics?period=${period}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch analytics");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors (auth issues)
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        return false;
      }
      if (error instanceof Error && error.message.includes("Forbidden")) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
  });
}

// Settings Query
export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await fetch("/api/admin/settings");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch settings");
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (
        error instanceof Error &&
        (error.message.includes("Unauthorized") ||
          error.message.includes("Forbidden"))
      ) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
  });
}

// Settings Mutation
export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: Record<string, unknown>) => {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update settings");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Products Query
export function useProducts(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["products", page, limit],
    queryFn: async () => {
      const response = await fetch(
        `/api/admin/products?page=${page}&limit=${limit}`
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch products");
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      if (
        error instanceof Error &&
        (error.message.includes("Unauthorized") ||
          error.message.includes("Forbidden"))
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// Orders Query
export function useOrders(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["orders", page, limit],
    queryFn: async () => {
      const response = await fetch(
        `/api/admin/orders?page=${page}&limit=${limit}`
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch orders");
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      if (
        error instanceof Error &&
        (error.message.includes("Unauthorized") ||
          error.message.includes("Forbidden"))
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// Customers Query
export function useCustomers(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["customers", page, limit],
    queryFn: async () => {
      const response = await fetch(
        `/api/admin/customers?page=${page}&limit=${limit}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }
      return response.json();
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

// Categories Query
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/admin/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Category Reorder Mutation
export function useReorderCategories() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      categories: Array<{ id: string; display_order: number }>
    ) => {
      const response = await fetch("/api/admin/categories/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reorder categories");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: "Success",
        description: "Categories reordered successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Order Status Update Mutation
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: string;
    }) => {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update order status");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
