"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CategoryTree } from "@/components/admin/CategoryTree";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  is_active: boolean;
  display_order: number;
  product_count?: number;
}

export default function CategoriesClientPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(
    undefined
  );

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [sortBy, setSortBy] = useState<"name" | "products" | "order">("order");

  // Bulk operations state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<
    "" | "activate" | "deactivate" | "delete"
  >("");
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch categories");
      }

      setCategories(data.categories || []);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditingCategory(undefined);
    setFormOpen(true);
  };

  const handleSuccess = () => {
    fetchCategories();
    setEditingCategory(undefined);
  };

  // Filter and search categories
  const filteredCategories = useMemo(() => {
    let filtered = [...categories];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (cat) =>
          cat.name.toLowerCase().includes(query) ||
          cat.slug.toLowerCase().includes(query) ||
          cat.description?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((cat) =>
        statusFilter === "active" ? cat.is_active : !cat.is_active
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "products":
          return (b.product_count || 0) - (a.product_count || 0);
        case "order":
        default:
          return a.display_order - b.display_order;
      }
    });

    return filtered;
  }, [categories, searchQuery, statusFilter, sortBy]);

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedIds.size === filteredCategories.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCategories.map((cat) => cat.id)));
    }
  };

  const handleSelectCategory = (categoryId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkAction = (action: "activate" | "deactivate" | "delete") => {
    if (selectedIds.size === 0) {
      toast({
        title: "No selection",
        description: "Please select at least one category",
        variant: "destructive",
      });
      return;
    }

    setBulkAction(action);
    setShowBulkConfirm(true);
  };

  const executeBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return;

    setBulkLoading(true);

    try {
      const selectedCategories = categories.filter((cat) =>
        selectedIds.has(cat.id)
      );

      if (bulkAction === "delete") {
        // Check if any selected category has products or children
        const hasProducts = selectedCategories.some(
          (cat) => cat.product_count && cat.product_count > 0
        );
        const hasChildren = selectedCategories.some((cat) =>
          categories.some((c) => c.parent_id === cat.id)
        );

        if (hasProducts || hasChildren) {
          toast({
            title: "Cannot delete",
            description:
              "Some categories have products or subcategories. Please reassign them first.",
            variant: "destructive",
          });
          setShowBulkConfirm(false);
          setBulkLoading(false);
          return;
        }

        // Delete categories
        const deletePromises = Array.from(selectedIds).map((id) =>
          fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
        );

        const results = await Promise.all(deletePromises);
        const failed = results.filter((r) => !r.ok);

        if (failed.length > 0) {
          toast({
            title: "Partial failure",
            description: `${failed.length} categor${
              failed.length !== 1 ? "ies" : "y"
            } could not be deleted`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: `${selectedIds.size} categor${
              selectedIds.size !== 1 ? "ies" : "y"
            } deleted successfully`,
          });
        }
      } else {
        // Activate or deactivate categories
        const is_active = bulkAction === "activate";
        const updatePromises = Array.from(selectedIds).map((id) => {
          const category = categories.find((cat) => cat.id === id);
          if (!category) return Promise.resolve();

          return fetch(`/api/admin/categories/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...category,
              is_active,
            }),
          });
        });

        await Promise.all(updatePromises);

        toast({
          title: "Success",
          description: `${selectedIds.size} categor${
            selectedIds.size !== 1 ? "ies" : "y"
          } ${is_active ? "activated" : "deactivated"} successfully`,
        });
      }

      // Refresh categories and clear selection
      await fetchCategories();
      setSelectedIds(new Set());
      setShowBulkConfirm(false);
      setBulkAction("");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to execute bulk action",
        variant: "destructive",
      });
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Categories</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage product categories with drag-and-drop
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            className="sm:size-default"
            onClick={fetchCategories}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button size="sm" className="sm:size-default" onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Category</span>
            <span className="sm:hidden">Add</span>
          </Button>
          <Link href="/admin">
            <Button variant="outline" size="sm" className="sm:size-default">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, slug, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as "all" | "active" | "inactive")
              }
            >
              <SelectTrigger className="w-full lg:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select
              value={sortBy}
              onValueChange={(value) =>
                setSortBy(value as "name" | "products" | "order")
              }
            >
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="order">Display Order</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="products">Product Count</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Summary */}
          {(searchQuery || statusFilter !== "all") && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-1 hover:bg-gray-300 rounded-full"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Status: {statusFilter}
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="ml-1 hover:bg-gray-300 rounded-full"
                  >
                    ×
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-medium text-blue-900">
                  {selectedIds.size} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-sm"
                >
                  {selectedIds.size === filteredCategories.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("activate")}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("deactivate")}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Deactivate
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBulkAction("delete")}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>
            {filteredCategories.length} of {categories.length} categor
            {categories.length !== 1 ? "ies" : "y"} • Drag to reorder
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 mx-auto text-gray-400 mb-4 animate-spin" />
              <p className="text-gray-500">Loading categories...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
              <Filter className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No categories match your filters</p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="mt-2"
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <CategoryTree
              categories={filteredCategories}
              onEdit={handleEdit}
              onReorder={fetchCategories}
              selectedIds={selectedIds}
              onSelect={handleSelectCategory}
            />
          )}
        </CardContent>
      </Card>

      <CategoryForm
        category={editingCategory}
        categories={categories}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={handleSuccess}
      />

      {/* Bulk Action Confirmation Dialog */}
      <AlertDialog open={showBulkConfirm} onOpenChange={setShowBulkConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Action</AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === "delete" && (
                <>
                  Are you sure you want to delete {selectedIds.size} categor
                  {selectedIds.size !== 1 ? "ies" : "y"}? This action cannot be
                  undone.
                </>
              )}
              {bulkAction === "activate" && (
                <>
                  Are you sure you want to activate {selectedIds.size} categor
                  {selectedIds.size !== 1 ? "ies" : "y"}?
                </>
              )}
              {bulkAction === "deactivate" && (
                <>
                  Are you sure you want to deactivate {selectedIds.size} categor
                  {selectedIds.size !== 1 ? "ies" : "y"}?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeBulkAction}
              disabled={bulkLoading}
              className={
                bulkAction === "delete" ? "bg-red-600 hover:bg-red-700" : ""
              }
            >
              {bulkLoading ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
