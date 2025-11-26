import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, FolderTree } from "lucide-react";
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

async function getCategories() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*, products(count)")
    .order("name");

  return categories || [];
}

// Helper function to build category tree
function buildCategoryTree(categories: any[]) {
  const categoryMap = new Map();
  const rootCategories: any[] = [];

  // Create map of categories
  categories.forEach((cat) => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });

  // Build tree structure
  categories.forEach((cat) => {
    const category = categoryMap.get(cat.id);
    if (cat.parent_id) {
      const parent = categoryMap.get(cat.parent_id);
      if (parent) {
        parent.children.push(category);
      }
    } else {
      rootCategories.push(category);
    }
  });

  return rootCategories;
}

export default async function CategoriesPage() {
  await requireAdmin();

  const categories = await getCategories();
  const categoryTree = buildCategoryTree(categories);

  // Flatten for table view
  const flattenCategories = (cats: any[], level = 0): any[] => {
    return cats.reduce((acc, cat) => {
      acc.push({ ...cat, level });
      if (cat.children && cat.children.length > 0) {
        acc.push(...flattenCategories(cat.children, level + 1));
      }
      return acc;
    }, []);
  };

  const flatCategories = flattenCategories(categoryTree);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Categories</h1>
          <p className="text-gray-600">Manage product categories</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>
            {categories.length} categor{categories.length !== 1 ? "ies" : "y"}{" "}
            found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <FolderTree className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No categories found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flatCategories.map((category: any) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div
                          style={{ paddingLeft: `${category.level * 24}px` }}
                          className="flex items-center gap-2"
                        >
                          {category.level > 0 && (
                            <span className="text-gray-400">└─</span>
                          )}
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {category.slug}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {category.products?.[0]?.count || 0} products
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            category.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {category.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Category Management</CardTitle>
          <CardDescription>
            Categories are currently managed through the database. Use Supabase
            dashboard to add or edit categories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Future updates will include a visual category editor with
            drag-and-drop functionality to manage the category hierarchy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
