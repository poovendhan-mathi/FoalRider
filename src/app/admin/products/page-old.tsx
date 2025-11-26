import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
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
import Image from "next/image";

async function getProducts(page: number = 1, pageSize: number = 20) {
  const supabase = await createClient();

  // Calculate offset
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Fetch products with category information and pagination
  const {
    data: products,
    error,
    count,
  } = await supabase
    .from("products")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching products:", error);
    return { products: [], total: 0 };
  }

  // Fetch categories separately and merge
  if (products && products.length > 0) {
    const categoryIds = products
      .filter((p) => p.category_id)
      .map((p) => p.category_id);

    if (categoryIds.length > 0) {
      const { data: categories } = await supabase
        .from("categories")
        .select("id, name")
        .in("id", categoryIds);

      // Create a map of category_id to category_name
      const categoryMap = new Map(categories?.map((c) => [c.id, c.name]) || []);

      // Add category name to each product
      products.forEach((product) => {
        if (product.category_id) {
          product.category_name =
            categoryMap.get(product.category_id) || "Uncategorized";
        } else {
          product.category_name = "Uncategorized";
        }
      });
    } else {
      // No categories assigned
      products.forEach((product) => {
        product.category_name = "Uncategorized";
      });
    }
  }

  return { products: products || [], total: count || 0 };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount / 100);
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 20;

  const { products, total } = await getProducts(page, pageSize);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Products</h1>
          <p className="text-gray-600">Manage your product inventory</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <Link href="/admin/products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Products</CardTitle>
              <CardDescription>
                {products.length} product{products.length !== 1 ? "s" : ""}{" "}
                found
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
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
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-500">
                              SKU: {product.sku}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {product.category_name || "Uncategorized"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(product.price)}
                      </TableCell>
                      <TableCell>
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
                      <TableCell>
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
                          <Link
                            href={`/products/${product.slug || product.id}`}
                            target="_blank"
                          >
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
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
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Showing {(page - 1) * pageSize + 1} to{" "}
                {Math.min(page * pageSize, total)} of {total} products
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/admin/products?page=${page - 1}`}
                  className={page <= 1 ? "pointer-events-none" : ""}
                >
                  <Button variant="outline" size="sm" disabled={page <= 1}>
                    Previous
                  </Button>
                </Link>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <Link key={i} href={`/admin/products?page=${pageNum}`}>
                        <Button
                          variant={page === pageNum ? "default" : "outline"}
                          size="sm"
                        >
                          {pageNum}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
                <Link
                  href={`/admin/products?page=${page + 1}`}
                  className={page >= totalPages ? "pointer-events-none" : ""}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                  >
                    Next
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
