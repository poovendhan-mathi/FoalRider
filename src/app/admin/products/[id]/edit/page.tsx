import { requireAdmin } from "@/lib/auth/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductForm from "@/components/admin/ProductForm";

async function getProduct(productId: string) {
  const supabase = await getSupabaseServerClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (error || !product) {
    return null;
  }

  return product;
}

async function getCategories() {
  const supabase = await getSupabaseServerClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id")
    .order("name");

  return categories || [];
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const [product, categories] = await Promise.all([
    getProduct(id),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Edit Product</h1>
        <p className="text-gray-600">Update product details</p>
      </div>

      <ProductForm categories={categories} mode="edit" initialData={product} />
    </div>
  );
}
