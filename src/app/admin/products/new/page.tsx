import { requireAdmin } from "@/lib/auth/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductForm from "@/components/admin/ProductForm";

async function getCategories() {
  const supabase = await getSupabaseServerClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id")
    .order("name");

  return categories || [];
}

export default async function NewProductPage() {
  await requireAdmin();

  const categories = await getCategories();

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Add New Product</h1>
        <p className="text-gray-600">Create a new product for your store</p>
      </div>

      <ProductForm categories={categories} mode="create" />
    </div>
  );
}
