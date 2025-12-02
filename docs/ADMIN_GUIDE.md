# 👨‍💼 FoalRider Admin Guide

Complete guide for managing the FoalRider admin panel.

---

## Accessing Admin Panel

### URL

```
https://yourdomain.com/admin
```

### Requirements

- User must be logged in
- User must have `role = 'admin'` in profiles table

### Setting Up Admin Access

```sql
-- In Supabase SQL Editor
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

---

## Dashboard

**URL:** `/admin`

### Overview Cards

| Card            | Description                 |
| --------------- | --------------------------- |
| Total Revenue   | Sum of all completed orders |
| Total Orders    | Count of all orders         |
| Total Customers | Count of registered users   |
| Total Products  | Count of active products    |

### Recent Orders

Shows latest 5 orders with:

- Order number
- Customer name
- Total amount
- Status
- Date

---

## Products Management

**URL:** `/admin/products`

### View All Products

The products page displays:

- Product image
- Name
- Price
- Category
- Stock status
- Actions (Edit, Delete)

### Create New Product

1. Click **"Add Product"** button
2. Fill in the form:

| Field       | Required | Description             |
| ----------- | -------- | ----------------------- |
| Name        | Yes      | Product name            |
| Slug        | Yes      | URL-friendly identifier |
| Description | No       | Product description     |
| Price       | Yes      | Base price              |
| Currency    | Yes      | INR, USD, etc.          |
| Category    | No       | Product category        |
| Image URL   | No       | Primary image           |
| Inventory   | Yes      | Stock quantity          |
| Active      | Yes      | Visibility toggle       |

3. Click **"Save Product"**

### Edit Product

1. Click **Edit** icon on product row
2. Update fields as needed
3. Click **"Update Product"**

### Delete Product

1. Click **Delete** icon on product row
2. Confirm deletion

> **Warning:** Deleting a product is permanent. Orders containing this product will retain a snapshot of the product data.

### Product Images

Add multiple images:

1. Edit product
2. Scroll to "Product Images" section
3. Add image URLs with sort order
4. Primary image (sort_order = 0) shows in grid

### Product Variants

Add size/color variants:

1. Edit product
2. Scroll to "Variants" section
3. Add variants with:
   - Size (XS, S, M, L, XL, XXL)
   - Color
   - Extra price (price adjustment)
   - Inventory

---

## Categories Management

**URL:** `/admin/categories`

### View Categories

Displays:

- Category name
- Slug
- Parent category
- Product count
- Status (Active/Inactive)

### Create Category

1. Click **"Add Category"**
2. Fill in:

| Field       | Required | Description          |
| ----------- | -------- | -------------------- |
| Name        | Yes      | Category name        |
| Slug        | Yes      | URL identifier       |
| Description | No       | Category description |
| Parent      | No       | Parent category      |
| Sort Order  | No       | Display order        |
| Active      | Yes      | Visibility           |

3. Click **"Save Category"**

### Hierarchical Categories

Create subcategories by setting a parent:

```
Men (parent: none)
├── Jeans (parent: Men)
│   ├── Slim Fit (parent: Jeans)
│   └── Regular Fit (parent: Jeans)
└── Jackets (parent: Men)
```

---

## Orders Management

**URL:** `/admin/orders`

### View Orders

Displays:

- Order number
- Customer name
- Email
- Total amount
- Payment status
- Order status
- Date
- Actions

### Order Statuses

| Status     | Description                     |
| ---------- | ------------------------------- |
| pending    | Order created, awaiting payment |
| confirmed  | Payment received                |
| processing | Being prepared                  |
| shipped    | Out for delivery                |
| delivered  | Successfully delivered          |
| cancelled  | Order cancelled                 |
| refunded   | Payment refunded                |

### Update Order Status

1. Click on order to open details
2. Change status dropdown
3. Add tracking number (if shipping)
4. Click **"Update"**

### Order Details

View:

- Customer information
- Shipping address
- Items ordered
- Payment details
- Status history

---

## Customers Management

**URL:** `/admin/customers`

### View Customers

Displays:

- Name
- Email
- Join date
- Total orders
- Total spent

### Customer Details

Click on customer to view:

- Profile information
- Order history
- Addresses
- Activity

---

## Settings

**URL:** `/admin/settings`

### Store Settings

| Setting     | Description            |
| ----------- | ---------------------- |
| Store Name  | Business name          |
| Store Email | Contact email          |
| Currency    | Default currency       |
| Tax Rate    | Default tax percentage |

### Shipping Settings

Configure shipping rates and zones.

### Payment Settings

Stripe configuration and payment options.

---

## Common Tasks

### Adding a New Product

```
1. Go to /admin/products
2. Click "Add Product"
3. Enter name, slug, price
4. Select category
5. Add primary image URL
6. Set inventory
7. Save product
8. Add variants (optional)
9. Add more images (optional)
```

### Processing an Order

```
1. Go to /admin/orders
2. Find order (status: confirmed)
3. Change status to "processing"
4. Prepare items
5. Change status to "shipped"
6. Add tracking number
7. Customer receives notification
```

### Creating a Category

```
1. Go to /admin/categories
2. Click "Add Category"
3. Enter name and slug
4. Set parent (for subcategories)
5. Save category
6. Assign products to category
```

---

## Troubleshooting

### Can't Access Admin Panel

1. Check you're logged in
2. Verify your role is 'admin' in database
3. Clear browser cache
4. Try incognito mode

### Product Not Showing

1. Check `is_active` is true
2. Verify inventory > 0
3. Check category is active
4. Clear cache

### Order Status Won't Update

1. Check database connection
2. Verify RLS policies
3. Check for validation errors

---

## Keyboard Shortcuts

| Shortcut | Action      |
| -------- | ----------- |
| Ctrl + S | Save form   |
| Escape   | Close modal |
| Ctrl + K | Search      |

---

_Last updated: December 3, 2025_
