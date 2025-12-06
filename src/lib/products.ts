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
  return "/assets/images/product-placeholder.svg";
}

export function formatPrice(price: number, currency: string = "USD"): string {
  const locale = currency === "INR" ? "en-IN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(price);
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getFilteredProducts(filters: {
  category?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  page?: string;
  pageSize?: string;
}): Promise<PaginatedResult<Product>> {
  console.log("🔍 Fetching products with filters:", filters);

  const supabase = await getSupabaseServerClient();

  // Pagination settings
  const page = parseInt(filters.page || "1", 10);
  const pageSize = parseInt(filters.pageSize || "12", 10);
  const offset = (page - 1) * pageSize;

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

  // Build filter conditions that will be reused for both count and data queries
  let categoryIds: string[] | null = null;

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
      return { data: [], total: 0, page, pageSize, totalPages: 0 };
    }

    if (categoryData) {
      console.log("✅ Category found:", categoryData);
      // Get all child category IDs
      const { data: childCategories } = await supabase
        .from("categories")
        .select("id")
        .eq("parent_id", categoryData.id);

      categoryIds = [
        categoryData.id,
        ...(childCategories || []).map((c) => c.id),
      ];
      console.log("📁 Category IDs to filter:", categoryIds);
      query = query.in("category_id", categoryIds);
    } else {
      console.log("⚠️ Category slug not found in database:", filters.category);
      // Category doesn't exist in DB - return empty to show no products
      return { data: [], total: 0, page, pageSize, totalPages: 0 };
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

  // Get total count for pagination
  let countQuery = supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  if (categoryIds) {
    countQuery = countQuery.in("category_id", categoryIds);
  }
  if (filters.search) {
    countQuery = countQuery.ilike("name", `%${filters.search}%`);
  }
  if (filters.minPrice) {
    countQuery = countQuery.gte("price", parseFloat(filters.minPrice));
  }
  if (filters.maxPrice) {
    countQuery = countQuery.lte("price", parseFloat(filters.maxPrice));
  }

  const { count } = await countQuery;
  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);

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

  // Apply pagination
  query = query.range(offset, offset + pageSize - 1);

  console.log("⏳ Executing query...");
  const { data: products, error } = await query;

  if (error) {
    console.error("❌ Error fetching filtered products:", error);
    console.error("❌ Error details:", JSON.stringify(error, null, 2));
    return { data: [], total: 0, page, pageSize, totalPages: 0 };
  }

  console.log(
    "✅ Products fetched:",
    products?.length || 0,
    "of",
    total,
    "total"
  );
  if (products && products.length > 0) {
    console.log("📦 Sample product:", products[0]);
  }

  return {
    data: (products || []) as unknown as Product[],
    total,
    page,
    pageSize,
    totalPages,
  };
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
