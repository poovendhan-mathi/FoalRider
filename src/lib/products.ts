import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  inventory: number;
  is_active: boolean;
  category_id: string | null;
  image_url: string | null;
  created_at: string;
  categories?: {
    id?: string;
    name: string;
    slug?: string;
  } | null;
  product_images?: Array<{
    id: string;
    url: string;
    sort_order: number;
  }>;
}

export async function getFeaturedProducts(
  limit: number = 6
): Promise<Product[]> {
  const supabase = await getSupabaseServerClient();

  const { data: products, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      description,
      price,
      inventory,
      is_active,
      category_id,
      image_url,
      created_at,
      product_images (id, url, sort_order)
    `
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }

  return (products || []) as unknown as Product[];
}

export function getProductImageUrl(product: Product): string {
  // First, try to get image from product_images relation
  if (product.product_images && product.product_images.length > 0) {
    const sortedImages = [...product.product_images].sort(
      (a, b) => a.sort_order - b.sort_order
    );
    return sortedImages[0].url;
  }

  // Fallback to image_url field
  if (product.image_url) {
    return product.image_url;
  }

  // Fallback to placeholder
  return "/assets/images/product-placeholder.jpg";
}

export function formatPrice(price: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
  }).format(price);
}

export async function getFilteredProducts(filters: {
  category?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
}): Promise<Product[]> {
  console.log("🔍 Fetching products with filters:", filters);

  const supabase = await getSupabaseServerClient();

  let query = supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      description,
      price,
      inventory,
      is_active,
      category_id,
      image_url,
      created_at,
      categories (
        id,
        name,
        slug
      ),
      product_images (id, url, sort_order)
    `
    )
    .eq("is_active", true);

  console.log("📊 Initial query created");

  // Apply category filter if provided
  if (filters.category && filters.category !== "all") {
    console.log("🏷️ Filtering by category:", filters.category);
    // Get the category and its children
    const { data: categoryData, error: catError } = await supabase
      .from("categories")
      .select("id, parent_id")
      .eq("slug", filters.category)
      .maybeSingle();

    if (catError) {
      console.error("❌ Category fetch error:", catError);
      return [];
    }

    if (categoryData) {
      console.log("✅ Category found:", categoryData);
      // Get all child category IDs
      const { data: childCategories } = await supabase
        .from("categories")
        .select("id")
        .eq("parent_id", categoryData.id);

      const categoryIds = [
        categoryData.id,
        ...(childCategories || []).map((c) => c.id),
      ];
      console.log("📁 Category IDs to filter:", categoryIds);
      query = query.in("category_id", categoryIds);
    } else {
      console.log("⚠️ Category slug not found in database:", filters.category);
      // Category doesn't exist in DB - return empty to show no products
      // This prevents showing all products when an invalid category is selected
      return [];
    }
  }

  // Apply search filter if provided
  if (filters.search) {
    console.log("🔎 Searching for:", filters.search);
    query = query.ilike("name", `%${filters.search}%`);
  }

  // Apply price filters if provided
  if (filters.minPrice) {
    console.log("💰 Min price:", filters.minPrice);
    query = query.gte("price", parseFloat(filters.minPrice));
  }
  if (filters.maxPrice) {
    console.log("💰 Max price:", filters.maxPrice);
    query = query.lte("price", parseFloat(filters.maxPrice));
  }

  // Apply sorting
  const sortOption = filters.sort || "newest";
  console.log("🔄 Sorting by:", sortOption);

  switch (sortOption) {
    case "price-low":
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-high":
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "name":
    case "name-asc":
      query = query.order("name", { ascending: true });
      break;
    case "name-desc":
      query = query.order("name", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  console.log("⏳ Executing query...");
  const { data: products, error } = await query;

  if (error) {
    console.error("❌ Error fetching filtered products:", error);
    console.error("❌ Error details:", JSON.stringify(error, null, 2));
    return [];
  }

  console.log("✅ Products fetched:", products?.length || 0);
  if (products && products.length > 0) {
    console.log("📦 Sample product:", products[0]);
  }

  return (products || []) as unknown as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await getSupabaseServerClient();

  const { data: product, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      description,
      price,
      inventory,
      is_active,
      category_id,
      image_url,
      created_at,
      product_images (id, url, sort_order),
      categories (id, name, slug)
    `
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !product) {
    console.error("Error fetching product:", error);
    return null;
  }

  return product as unknown as Product;
}

export async function getRelatedProducts(
  currentProductId: string,
  categoryId: string | null,
  limit: number = 4
): Promise<Product[]> {
  const supabase = await getSupabaseServerClient();

  let query = supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      description,
      price,
      inventory,
      is_active,
      category_id,
      image_url,
      created_at,
      product_images (id, url, sort_order)
    `
    )
    .eq("is_active", true)
    .neq("id", currentProductId);

  // Try to get products from the same category
  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data: products, error } = await query
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching related products:", error);
    return [];
  }

  return (products || []) as unknown as Product[];
}
