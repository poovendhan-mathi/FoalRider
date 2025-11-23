# Category Hierarchy Implementation Guide

## Overview
This guide explains how to implement and use the hierarchical category system for unlimited nesting (Categories → Subcategories → Sub-subcategories → etc.)

---

## Database Structure

### Schema Changes
```sql
categories table:
- id (UUID, primary key)
- name (TEXT)
- slug (TEXT, unique)
- description (TEXT)
- parent_id (UUID, references categories.id) ← NEW
- level (INT, default 0) ← NEW
- sort_order (INT, default 0) ← NEW
- is_active (BOOLEAN, default true) ← NEW
- created_at (TIMESTAMPTZ)
```

### Hierarchy Levels
- **Level 0**: Main categories (e.g., Men's Wear, Women's Wear)
- **Level 1**: Subcategories (e.g., Shirts, Pants, Dresses)
- **Level 2**: Sub-subcategories (e.g., Casual Shirts, Formal Shirts)
- **Level 3+**: Unlimited nesting possible

---

## Migration Steps

### 1. Run Database Migration
```bash
# In Supabase SQL Editor
scripts/add-hierarchical-categories.sql
```

This adds:
- `parent_id` column for hierarchy
- `level` column for depth tracking
- `sort_order` column for custom ordering
- `is_active` column for visibility control
- Indexes for performance

### 2. Add Subcategories (Optional)
Uncomment and customize the example subcategories in the migration file, or add via SQL:

```sql
INSERT INTO categories (name, slug, description, parent_id, level, sort_order) VALUES
('Shirts', 'mens-shirts', 'Men''s shirts', 
  (SELECT id FROM categories WHERE slug='mens-wear'), 1, 1);
```

---

## Frontend Implementation

### 1. Using Category Helpers

```typescript
import {
  getMainCategories,
  getSubcategories,
  buildCategoryTree,
  getCategoryBreadcrumbs
} from '@/lib/categories';

// Get main categories for top-level navigation
const mainCategories = await getMainCategories();

// Get subcategories when hovering/clicking a main category
const subcategories = await getSubcategories(categoryId);

// Build full tree for mega menu
const allCategories = await getAllCategories();
const tree = buildCategoryTree(allCategories);
```

### 2. Update ProductFilters Component

```typescript
// src/components/products/ProductFilters.tsx
import { getMainCategories, getSubcategories } from '@/lib/categories';

export function ProductFilters() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    getMainCategories().then(setCategories);
  }, []);

  const handleCategoryClick = async (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
      // Load subcategories
      const subs = await getSubcategories(categoryId);
      // Update state to show subcategories
    }
  };

  return (
    <div>
      {categories.map(cat => (
        <div key={cat.id}>
          <button onClick={() => handleCategoryClick(cat.id)}>
            {cat.name}
          </button>
          {/* Show subcategories if expanded */}
        </div>
      ))}
    </div>
  );
}
```

### 3. Update Product Filtering Logic

```typescript
// src/lib/products.ts
import { getCategoryWithDescendants } from '@/lib/categories';

export async function getFilteredProducts(filters: {
  category?: string;
  includeSubcategories?: boolean;
  // ... other filters
}) {
  const supabase = await createClient();
  
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true);

  if (filters.category) {
    if (filters.includeSubcategories) {
      // Get category and all its subcategories
      const allCategories = await getAllCategories();
      const categoryIds = getCategoryWithDescendants(
        filters.category,
        allCategories
      );
      query = query.in('category_id', categoryIds);
    } else {
      // Just the specific category
      query = query.eq('category_id', filters.category);
    }
  }

  return query;
}
```

---

## UI Components

### Mega Menu with Subcategories

```tsx
// components/navigation/MegaMenu.tsx
'use client';

import { useState, useEffect } from 'react';
import { getMainCategories, getSubcategories } from '@/lib/categories';

export function MegaMenu() {
  const [mainCats, setMainCats] = useState([]);
  const [hoveredCat, setHoveredCat] = useState(null);
  const [subcats, setSubcats] = useState([]);

  useEffect(() => {
    getMainCategories().then(setMainCats);
  }, []);

  const handleHover = async (categoryId) => {
    setHoveredCat(categoryId);
    const subs = await getSubcategories(categoryId);
    setSubcats(subs);
  };

  return (
    <nav>
      {mainCats.map(cat => (
        <div 
          key={cat.id}
          onMouseEnter={() => handleHover(cat.id)}
        >
          <a href={`/products?category=${cat.slug}`}>
            {cat.name}
          </a>
          
          {hoveredCat === cat.id && subcats.length > 0 && (
            <div className="submenu">
              {subcats.map(sub => (
                <a key={sub.id} href={`/products?category=${sub.slug}`}>
                  {sub.name}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
```

### Breadcrumbs

```tsx
// components/CategoryBreadcrumbs.tsx
import { getCategoryBreadcrumbs } from '@/lib/categories';
import Link from 'next/link';

export function CategoryBreadcrumbs({ category }) {
  const breadcrumbs = getCategoryBreadcrumbs(category);

  return (
    <nav className="flex gap-2">
      <Link href="/products">All Products</Link>
      {breadcrumbs.map((cat, index) => (
        <>
          <span>/</span>
          <Link 
            key={cat.id} 
            href={`/products?category=${cat.slug}`}
            className={index === breadcrumbs.length - 1 ? 'font-bold' : ''}
          >
            {cat.name}
          </Link>
        </>
      ))}
    </nav>
  );
}
```

---

## Usage Examples

### Example 1: Filter by Category + Subcategories
```
User clicks "Men's Wear" → Shows all products in Men's Wear AND all subcategories (Shirts, Pants, etc.)
```

### Example 2: Filter by Specific Subcategory
```
User clicks "Casual Shirts" → Shows only casual shirts products
```

### Example 3: Breadcrumb Navigation
```
Product Page → Shows: Home / Men's Wear / Shirts / Casual Shirts
```

---

## Migration Path

### Phase 1: Add Schema (Now)
✅ Run `add-hierarchical-categories.sql`

### Phase 2: Add Basic Subcategories
- Add 4-5 subcategories for each main category
- No sub-subcategories yet
- Update filters to show subcategories

### Phase 3: Full Hierarchy
- Add sub-subcategories as needed
- Implement mega menu
- Add breadcrumb navigation

---

## Performance Considerations

1. **Indexes**: Already added on `parent_id` and `level`
2. **Caching**: Consider caching category tree on server/client
3. **Recursive Queries**: Limited depth for UI display (max 3 levels recommended)

---

## Testing Checklist

- [ ] Run migration successfully
- [ ] Add sample subcategories
- [ ] Verify hierarchy displays correctly
- [ ] Test filtering by main category
- [ ] Test filtering by subcategory
- [ ] Breadcrumbs show full path
- [ ] Sort order works correctly
- [ ] RLS policies still work

---

## Future Enhancements

1. **Category Images**: Add `image_url` column for category banners
2. **SEO**: Add `meta_title`, `meta_description` for category pages
3. **Featured**: Add `is_featured` for homepage display
4. **Product Count**: Cache product counts per category
5. **Admin UI**: Build category management interface with drag-drop ordering
