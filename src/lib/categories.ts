/**
 * Category Hierarchy Helper Functions
 * Client-side utilities for working with hierarchical categories
 */

import { createClient } from '@/lib/supabase/client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  level: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  parent?: Category | null;
  children?: Category[];
}

/**
 * Get all categories with their hierarchy
 */
export async function getAllCategories(): Promise<Category[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('level')
    .order('sort_order')
    .order('name');
  
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  
  return data as Category[];
}

/**
 * Get top-level categories (main categories)
 */
export async function getMainCategories(): Promise<Category[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .is('parent_id', null)
    .eq('is_active', true)
    .order('sort_order')
    .order('name');
  
  if (error) {
    console.error('Error fetching main categories:', error);
    return [];
  }
  
  return data as Category[];
}

/**
 * Get subcategories of a specific category
 */
export async function getSubcategories(parentId: string): Promise<Category[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', parentId)
    .eq('is_active', true)
    .order('sort_order')
    .order('name');
  
  if (error) {
    console.error('Error fetching subcategories:', error);
    return [];
  }
  
  return data as Category[];
}

/**
 * Get category with its full parent chain
 */
export async function getCategoryWithParents(slug: string): Promise<Category | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('categories')
    .select(`
      *,
      parent:categories!parent_id(
        *,
        parent:categories!parent_id(*)
      )
    `)
    .eq('slug', slug)
    .single();
  
  if (error) {
    console.error('Error fetching category:', error);
    return null;
  }
  
  return data as Category;
}

/**
 * Build category tree from flat list
 */
export function buildCategoryTree(categories: Category[]): Category[] {
  const categoryMap = new Map<string, Category>();
  const rootCategories: Category[] = [];
  
  // Create a map of all categories
  categories.forEach(cat => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });
  
  // Build the tree
  categories.forEach(cat => {
    const category = categoryMap.get(cat.id)!;
    
    if (cat.parent_id) {
      const parent = categoryMap.get(cat.parent_id);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(category);
      }
    } else {
      rootCategories.push(category);
    }
  });
  
  return rootCategories;
}

/**
 * Get breadcrumb trail for a category
 */
export function getCategoryBreadcrumbs(category: Category): Category[] {
  const breadcrumbs: Category[] = [];
  let current: Category | null | undefined = category;
  
  while (current) {
    breadcrumbs.unshift(current);
    current = current.parent;
  }
  
  return breadcrumbs;
}

/**
 * Get all category IDs in a hierarchy (parent + all descendants)
 * Useful for filtering products by category and subcategories
 */
export function getCategoryWithDescendants(
  categoryId: string,
  allCategories: Category[]
): string[] {
  const ids: string[] = [categoryId];
  
  const findChildren = (parentId: string) => {
    const children = allCategories.filter(cat => cat.parent_id === parentId);
    children.forEach(child => {
      ids.push(child.id);
      findChildren(child.id); // Recursive
    });
  };
  
  findChildren(categoryId);
  return ids;
}

/**
 * Format category for display with level indicators
 */
export function formatCategoryName(category: Category, showLevel: boolean = false): string {
  if (!showLevel) return category.name;
  
  const indent = '  '.repeat(category.level);
  const prefix = category.level > 0 ? '└ ' : '';
  return `${indent}${prefix}${category.name}`;
}
