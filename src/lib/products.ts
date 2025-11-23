import { createClient } from '@/lib/supabase/server';

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

export async function getFeaturedProducts(limit: number = 6): Promise<Product[]> {
  const supabase = await createClient();
  
  const { data: products, error } = await supabase
    .from('products')
    .select(`
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
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }

  return (products || []) as unknown as Product[];
}

export function getProductImageUrl(product: Product): string {
  // First, try to get image from product_images relation
  if (product.product_images && product.product_images.length > 0) {
    const sortedImages = [...product.product_images].sort((a, b) => a.sort_order - b.sort_order);
    return sortedImages[0].url;
  }
  
  // Fallback to image_url field
  if (product.image_url) {
    return product.image_url;
  }
  
  // Fallback to placeholder
  return '/assets/images/product-placeholder.jpg';
}

export function formatPrice(price: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
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
  const supabase = await createClient();
  
  let query = supabase
    .from('products')
    .select(`
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
      categories!inner (id, name, slug, parent_id)
    `)
    .eq('is_active', true);

  // Category filter - handle both parent and child categories
  if (filters.category && filters.category !== 'all') {
    // First, get the parent category by slug
    const { data: parentCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', filters.category)
      .single();

    if (parentCategory) {
      // Get all child categories of this parent
      const { data: childCategories } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', parentCategory.id);

      // Combine parent and child category IDs
      const categoryIds = [parentCategory.id];
      if (childCategories && childCategories.length > 0) {
        categoryIds.push(...childCategories.map(c => c.id));
      }

      query = query.in('category_id', categoryIds);
    }
  }

  // Price range filter
  if (filters.minPrice) {
    query = query.gte('price', parseInt(filters.minPrice));
  }
  if (filters.maxPrice) {
    query = query.lte('price', parseInt(filters.maxPrice));
  }

  // Search filter
  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  // Sorting
  switch (filters.sort) {
    case 'price-low':
      query = query.order('price', { ascending: true });
      break;
    case 'price-high':
      query = query.order('price', { ascending: false });
      break;
    case 'name-asc':
      query = query.order('name', { ascending: true });
      break;
    case 'name-desc':
      query = query.order('name', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  const { data: products, error } = await query;

  if (error) {
    console.error('Error fetching filtered products:', error);
    return [];
  }

  return (products || []) as unknown as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  
  const { data: product, error } = await supabase
    .from('products')
    .select(`
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
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !product) {
    console.error('Error fetching product:', error);
    return null;
  }

  return product as unknown as Product;
}

export async function getRelatedProducts(
  currentProductId: string,
  categoryId: string | null,
  limit: number = 4
): Promise<Product[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from('products')
    .select(`
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
    `)
    .eq('is_active', true)
    .neq('id', currentProductId);

  // Try to get products from the same category
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data: products, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching related products:', error);
    return [];
  }

  return (products || []) as unknown as Product[];
}
