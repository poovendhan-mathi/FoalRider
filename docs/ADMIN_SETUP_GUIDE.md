# Admin Setup Guide

## How to Make a User Admin

### Option 1: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run this SQL to make a user admin:

```sql
-- Update user role to admin
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'pooven0708@gmail.com'
);
```

### Option 2: Using Supabase Table Editor

1. Go to **Table Editor** in Supabase
2. Open the `profiles` table
3. Find the row for user `pooven0708@gmail.com`
4. Set the `role` column to: `admin`
5. Save changes

## Admin Features

Once a user has `role = 'admin'` in the profiles table:

✅ **"Admin Dashboard" link** appears in profile dropdown  
✅ Can access `/admin` route  
✅ Admin badge shown on profile page  
✅ Special admin permissions (coming soon)

## Current Admin Check Logic

```typescript
// In UserDropdown.tsx
const isAdmin = profile?.role === 'admin' || user.email === 'pooven0708@gmail.com';
```

The system checks:
1. If `profile.role === 'admin'` in database, OR
2. If email is `pooven0708@gmail.com` (hardcoded fallback)

## Customer Information Storage

### Profiles Table
Stores all user information:
- `id` - UUID (matches auth.users.id)
- `email` - User's email
- `full_name` - Customer's full name
- `avatar_url` - Profile picture URL
- `phone` - Phone number
- `role` - User role ('customer' or 'admin')
- `created_at` - Account creation date
- `updated_at` - Last profile update

### How Customers Update Their Info

1. **Navigate to Profile**
   - Click profile avatar (rightmost in header)
   - Select "Profile" from dropdown

2. **Go to Settings Tab**
   - Click "Settings" tab
   - Or use direct link: `/profile#settings`

3. **Update Information**
   - Edit: Full Name, Phone Number
   - Email is read-only (requires support to change)
   - Click "Save Changes"

4. **Data is Stored**
   - Updates saved to `profiles` table
   - Toast notification confirms success
   - Profile reloads with new data

### Database Schema

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

## Verifying Admin Access

### Check in Database:
```sql
SELECT id, email, full_name, role 
FROM profiles 
WHERE email = 'pooven0708@gmail.com';
```

### Check in Application:
1. Log in with admin account
2. Click profile avatar in header
3. Should see "Admin Dashboard" option
4. Profile page should show "Admin" badge
5. Can access `/admin` route

## Troubleshooting

### "Admin Dashboard" not showing?
- Check `profiles.role` is exactly `'admin'` (lowercase)
- Clear browser cache and refresh
- Check browser console for errors
- Verify profile data loaded correctly

### Can't update profile?
- Check RLS policies enabled
- Verify user is logged in
- Check browser console for Supabase errors
- Ensure `profiles` table exists

### Admin page shows 404?
- Verify `/admin` route exists in `src/app/admin/`
- Check Next.js is serving the route
- Restart dev server: `npm run dev`

## Next Steps

To implement full admin panel:
1. Create `/admin` route
2. Add admin middleware protection
3. Build admin dashboard components
4. Add product management
5. Add order management
6. Add user management
