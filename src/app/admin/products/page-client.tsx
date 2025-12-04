"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Search,
  RefreshCw,
  Eye,
  ExternalLink,
  Package,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  main_image: string | null;
  category_id: string | null;
  category_name?: string;
}

interface Category {
  id: string;
  name: string;
}

function formatCurrency(amount: number, currency: string = "INR"): string {
  // Default to INR, but support USD and others
  let locale = "en-IN";
  if (currency === "USD") locale = "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount / 100);
}

export default function ProductsClientPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [totalCount, setTotalCount] = useState(0);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const pageSize = 20;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/products?page=${currentPage}&limit=${pageSize}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch products");
      }

      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();

      if (response.ok) {
        console.log("Categories fetched:", data.categories?.length || 0);
        setCategories(data.categories || []);
      } else {
        console.error("Failed to fetch categories:", data.error);
        toast({
          title: "Warning",
          description: "Could not load categories. Please refresh the page.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Warning",
        description: "Could not load categories. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]); // Refetch when page changes

  // Filter and search products (client-side for now, can be moved to server later)
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter - search by name, SKU, slug, or ID
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query) ||
          product.slug.toLowerCase().includes(query) ||
          product.id.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (product) => product.category_id === categoryFilter
      );
    }

    // Status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((product) => product.is_active);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((product) => !product.is_active);
    }

    return filtered;
  }, [products, searchQuery, categoryFilter, statusFilter]);

  // Use server-side pagination data
  const paginatedProducts =
    searchQuery || categoryFilter !== "all" || statusFilter !== "all"
      ? filteredProducts.slice(
          (currentPage - 1) * pageSize,
          currentPage * pageSize
        )
      : products; // Use server-paginated data when no filters applied

  const displayTotalPages =
    searchQuery || categoryFilter !== "all" || statusFilter !== "all"
      ? Math.ceil(filteredProducts.length / pageSize)
      : totalPages; // Use server total pages when no filters

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Products</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your product inventory
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin">
            <Button variant="outline" size="sm" className="sm:size-default">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <Link href="/admin/products/new">
            <Button size="sm" className="sm:size-default">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle>All Products</CardTitle>
              <CardDescription>
                {filteredProducts.length} product
                {filteredProducts.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProducts}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, SKU, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
                setStatusFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading products...</p>
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No products found</p>
              <Link href="/admin/products/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Category
                      </TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Stock
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Status
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {product.main_image && (
                              <Image
                                src={product.main_image}
                                alt={product.name}
                                width={50}
                                height={50}
                                className="rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium text-sm sm:text-base">
                                {product.name}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500">
                                SKU: {product.sku}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline">
                            {product.category_name || "Uncategorized"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-sm sm:text-base">
                          {formatCurrency(product.price, "INR")}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span
                            className={
                              product.stock_quantity > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {product.stock_quantity}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge
                            className={
                              product.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {product.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPreviewProduct(product)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {displayTotalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                  <p className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, filteredProducts.length)}{" "}
                    of {filteredProducts.length} products
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, displayTotalPages) },
                        (_, i) => {
                          let pageNum;
                          if (displayTotalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= displayTotalPages - 2) {
                            pageNum = displayTotalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={i}
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.min(displayTotalPages, p + 1)
                        )
                      }
                      disabled={currentPage >= displayTotalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Product Preview Dialog */}
      <Dialog
        open={!!previewProduct}
        onOpenChange={(open) => !open && setPreviewProduct(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Details
            </DialogTitle>
          </DialogHeader>

          {previewProduct && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Product Image */}
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {previewProduct.main_image ? (
                  <Image
                    src={previewProduct.main_image}
                    alt={previewProduct.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="h-16 w-16" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    {previewProduct.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    SKU: {previewProduct.sku}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-semibold text-[#C5A572]">
                      {formatCurrency(previewProduct.price, "INR")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stock:</span>
                    <span
                      className={
                        previewProduct.stock_quantity > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {previewProduct.stock_quantity} units
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <Badge variant="outline">
                      {previewProduct.category_name || "Uncategorized"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge
                      className={
                        previewProduct.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {previewProduct.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 flex gap-2">
                  <Link
                    href={`/products/${
                      previewProduct.slug || previewProduct.id
                    }`}
                    target="_blank"
                  >
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Store
                    </Button>
                  </Link>
                  <Link href={`/admin/products/${previewProduct.id}/edit`}>
                    <Button size="sm">Edit Product</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
