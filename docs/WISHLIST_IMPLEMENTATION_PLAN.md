# Wishlist Feature Implementation Plan

## Overview
Implement a complete wishlist/favorites system allowing users to save products for later viewing and easy access.

## Phase: Next Implementation Phase (Phase 5)

## Database Schema
Already exists in database:
```sql
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT, -- For guest users
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id),
  UNIQUE(session_id, product_id)
);
```

## Components to Create

### 1. WishlistContext (`src/contexts/WishlistContext.tsx`)
- State management for wishlist items
- Methods: `addToWishlist`, `removeFromWishlist`, `toggleWishlist`, `clearWishlist`
- LocalStorage persistence for guests
- Supabase sync for authenticated users
- `totalItems` count for badge display

### 2. WishlistButton Component (`src/components/wishlist/WishlistButton.tsx`)
- Heart icon that toggles filled/outlined state
- Shows if product is in wishlist
- Click handler to add/remove from wishlist
- Toast notifications
- Props: `productId`, `size`, `className`

### 3. Wishlist Page (`src/app/wishlist/page.tsx`)
- Grid display of wishlisted products
- Use ProductCard component
- "Remove from wishlist" button on each card
- "Move to cart" quick action
- Empty state when no items
- Total count display

### 4. Integration Points

#### Header Component
```tsx
<Button variant="ghost" size="icon" className="relative">
  <Heart className="h-5 w-5" />
  {wishlistCount > 0 && (
    <span className="absolute -top-1 -right-1 bg-[#C5A572]">
      {wishlistCount}
    </span>
  )}
</Button>
```

#### ProductCard Component
- Add WishlistButton in top-right corner of image
- Position: `absolute top-4 right-4`

#### ProductInfo Component (Product Detail Page)
- Add WishlistButton next to "Add to Cart"
- Larger button with text label

## API/Database Functions

### Supabase Functions (`src/lib/supabase/wishlist.ts`)
```typescript
// For authenticated users
export async function getUserWishlist(userId: string)
export async function addToWishlist(userId: string, productId: string)
export async function removeFromWishlist(userId: string, productId: string)
export async function isInWishlist(userId: string, productId: string)
export async function syncGuestWishlist(sessionId: string, userId: string)
```

## Implementation Steps

1. **Create WishlistContext**
   - Similar pattern to CartContext
   - LocalStorage for guests
   - Supabase integration for auth users

2. **Create WishlistButton Component**
   - Reusable across product cards and detail pages
   - Animated heart icon
   - Optimistic UI updates

3. **Update Layout**
   - Add WishlistProvider wrapper
   - Add wishlist icon to Header with badge

4. **Create Wishlist Page**
   - Grid layout of products
   - Empty state
   - Bulk actions (clear all, move all to cart)

5. **Update Product Components**
   - Add WishlistButton to ProductCard (top-right of image)
   - Add WishlistButton to ProductInfo (below Add to Cart)

6. **Sync Logic**
   - On login: merge guest wishlist with user wishlist
   - On logout: keep guest wishlist in localStorage

## RLS Policies
Already configured in `supabase-rls-policies.sql`:
```sql
-- Users can view their own wishlist items
-- Users can insert their own wishlist items
-- Users can delete their own wishlist items
-- Guest users can manage using session_id
```

## UI/UX Considerations

- **Heart Icon States:**
  - Outlined: Not in wishlist
  - Filled with animation: In wishlist
  - Red/Pink color when filled

- **Feedback:**
  - Toast notification on add/remove
  - Instant visual feedback (no loading state)
  - Show count in header badge

- **Guest Experience:**
  - Works without login
  - Persists in localStorage
  - Migrates on login

- **Mobile:**
  - Touch-friendly heart button size
  - Easy access from bottom navigation if added

## Dependencies
- Already have: Supabase, auth context, toast system
- Need to create: WishlistContext, WishlistButton, Wishlist page

## Testing Checklist
- [ ] Add item to wishlist as guest
- [ ] Remove item from wishlist as guest
- [ ] Wishlist persists after page refresh
- [ ] Login syncs guest wishlist to user account
- [ ] Wishlist page displays correctly
- [ ] Heart icon toggles properly
- [ ] Badge count updates in real-time
- [ ] Remove from wishlist on wishlist page
- [ ] Empty state shows when no items
- [ ] Mobile responsive

## Estimated Time
- Context & Logic: 2-3 hours
- Components: 2-3 hours
- Integration: 1-2 hours
- Testing: 1 hour
- **Total: 6-9 hours**

## Priority
Medium - Nice-to-have feature that improves user experience but not critical for MVP.
