# Authentication & Profile System - How It Works

## Overview

Your app uses **Supabase Auth** + **Profiles Table** for user management.

## Architecture

```
┌─────────────────┐
│  auth.users     │  ← Supabase Auth (built-in)
│  (Supabase)     │     - Email/Password
└────────┬────────┘     - User ID (UUID)
         │
         │ Linked by: user.id = profile.id
         │
┌────────▼────────┐
│   profiles      │  ← Custom table YOU created
│   (Your table)  │     - Full name
└─────────────────┘     - Phone
                        - Avatar
                        - Role (customer/admin)
```

## Flow Explained

### 1. User Signs Up
```typescript
// User clicks "Sign Up" button
await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: { full_name: 'John Doe' }
  }
});
```

**What happens:**
1. ✅ Supabase creates user in `auth.users` table
2. ✅ Trigger (if set up) creates profile in `profiles` table
3. ✅ Profile has default `role: 'customer'`

### 2. User Logs In
```typescript
// User clicks "Login" button
await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

**What happens:**
1. ✅ Supabase validates credentials
2. ✅ AuthContext sets `user` state
3. ✅ If profile doesn't exist, creates one
4. ✅ App fetches profile data from `profiles` table

### 3. Profile Data Loading
```typescript
// In Header.tsx or any component
const { user } = useAuth(); // From auth.users

// Fetch profile data
const { data: profile } = await supabase
  .from('profiles')
  .select('full_name, avatar_url, role')
  .eq('id', user.id)
  .single();
```

**What you get:**
- `user` - From Supabase Auth (email, id, created_at)
- `profile` - From your profiles table (full_name, phone, role, avatar_url)

## Admin System (PROPER WAY)

### ❌ WRONG (What we had):
```typescript
// Hardcoded - BAD!
const isAdmin = user.email === 'pooven0708@gmail.com';
```

### ✅ CORRECT (Fixed now):
```typescript
// Database-driven - GOOD!
const isAdmin = profile?.role === 'admin';
```

## How to Make a User Admin

### Step 1: Go to Supabase SQL Editor

### Step 2: Run this SQL:
```sql
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'pooven0708@gmail.com'
);
```

### Step 3: Verify:
```sql
SELECT email, full_name, role FROM profiles WHERE email = 'pooven0708@gmail.com';
```

Expected result:
```
email                  | full_name | role
-----------------------|-----------|-------
pooven0708@gmail.com  | John Doe  | admin
```

### Step 4: Log in and test
1. Login to your app
2. Click profile avatar (rightmost)
3. Should see "Admin Dashboard" option
4. Profile page shows "Admin" badge

## Database Schema

### auth.users (Supabase managed)
```
id          UUID    ← User ID
email       TEXT    ← Login email
created_at  TIMESTAMP
```

### profiles (Your table)
```
id          UUID    ← Same as auth.users.id
email       TEXT    ← Copied from auth.users.email
full_name   TEXT    ← User's display name
phone       TEXT    ← Phone number
avatar_url  TEXT    ← Profile picture URL
role        TEXT    ← 'customer' or 'admin'
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

## Current State

### What exists in Supabase right now:
1. ✅ `auth.users` table - 1 user (pooven0708@gmail.com)
2. ❓ `profiles` table - Need to check if it exists
3. ❓ Profile for your user - Need to check if created

## Setup Steps (If Not Already Done)

### 1. Create profiles table (if not exists):
```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Create profile for your existing user:
```sql
INSERT INTO profiles (id, email, role)
SELECT 
  id, 
  email, 
  'admin' as role
FROM auth.users 
WHERE email = 'pooven0708@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### 3. Set up automatic profile creation trigger:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## How Components Use This

### Header.tsx:
```typescript
const { user } = useAuth(); // Gets auth user
const [profile, setProfile] = useState(null);

useEffect(() => {
  // Fetch profile data
  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, role')
      .eq('id', user.id)
      .single();
    setProfile(data);
  };
  loadProfile();
}, [user]);

// Use profile data
<UserDropdown user={user} profile={profile} />
```

### UserDropdown.tsx:
```typescript
const isAdmin = profile?.role === 'admin'; // Check database role

{isAdmin && (
  <DropdownMenuItem asChild>
    <Link href="/admin">Admin Dashboard</Link>
  </DropdownMenuItem>
)}
```

## Security Best Practices

### ✅ What we do:
1. Store role in database
2. Check role dynamically from database
3. No hardcoded emails in code
4. Use RLS policies to protect data
5. Only admins (via SQL) can change roles

### ❌ What to avoid:
1. ~~Hardcoding admin emails~~
2. ~~Storing roles in environment variables~~
3. ~~Client-side only role checks~~
4. ~~Allowing users to change their own role~~

## Troubleshooting

### "Admin Dashboard not showing"
1. Check database: `SELECT role FROM profiles WHERE email = 'pooven0708@gmail.com'`
2. Should return: `role = 'admin'`
3. If not, run: `UPDATE profiles SET role = 'admin' WHERE email = 'pooven0708@gmail.com'`

### "Profile not found"
1. Check if profile exists: `SELECT * FROM profiles WHERE email = 'pooven0708@gmail.com'`
2. If not, create it:
```sql
INSERT INTO profiles (id, email, role)
SELECT id, email, 'admin' FROM auth.users WHERE email = 'pooven0708@gmail.com';
```

### "Changes not reflecting"
1. Clear browser cache
2. Logout and login again
3. Check browser console for errors
4. Verify profile loaded: `console.log(profile)`

## Summary

**How it works:**
1. User signs up → Creates `auth.users` record
2. Trigger/Code creates `profiles` record (linked by ID)
3. App reads role from `profiles.role` column
4. Admin role set via SQL, not hardcoded
5. Components check `profile?.role === 'admin'` dynamically

**Your account:**
- Email: pooven0708@gmail.com
- User ID: (UUID in auth.users)
- Profile: (linked in profiles table)
- Role: Set to 'admin' via SQL

**No hardcoding. All database-driven. Proper best practices.** ✅
