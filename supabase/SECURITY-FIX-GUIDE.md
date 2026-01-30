# Security Vulnerability Fix Guide

## Overview

Your Supabase Security Advisor detected **24 security errors** because Row Level Security (RLS) was not enabled on any of your database tables. This meant anyone with your Supabase anon key (which is exposed in client-side code) could read, write, or delete ANY data in your database.

## What Was Fixed

✅ **Enabled Row Level Security (RLS)** on all 11 database tables
✅ **Created secure policies** that allow public read access only to published content
✅ **Blocked all unauthorized write operations** from public users
✅ **Preserved admin functionality** - service role key bypasses RLS
✅ **Admin books form remains unchanged** - all admin operations continue to work

## How to Apply the Fix

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: **supabase-indigo-kite** (ID: daqekbfdxxkdkowgxkmr)
3. Click **SQL Editor** in the left sidebar
4. Click **New query**

### Step 2: Run the RLS Migration

1. Open the file `supabase/enable-rls-policies.sql` in this repository
2. Copy the entire contents
3. Paste into the Supabase SQL Editor
4. Click **Run** or press Ctrl+Enter (Cmd+Enter on Mac)
5. Wait for confirmation: "Success. No rows returned"

### Step 3: Verify Security Advisor

1. Go to **Settings** → **Security Advisor** in your Supabase dashboard
2. Wait a few minutes for the security scan to refresh
3. Verify that the 24 errors are resolved
4. You should see green checkmarks for all RLS policies

## What Each Policy Does

### 📚 Books Table
- ✅ **Public can read**: Only published and visible books (`is_published = true AND is_visible = true`)
- 🚫 **Public cannot**: Insert, update, or delete books
- ✅ **Admin can**: Do everything via service role key (bypasses RLS)

### 🏪 Retailers Table
- ✅ **Public can read**: Only active retailers (`is_active = true`)
- 🚫 **Public cannot**: Insert, update, or delete retailers
- ✅ **Admin can**: Manage all retailers via service role key

### 🔗 Book Retailer Links Table
- ✅ **Public can read**: Only active links for published books
- 🚫 **Public cannot**: Insert, update, or delete links
- ✅ **Admin can**: Manage all links via service role key

### 🧭 Navigation Items Table
- ✅ **Public can read**: Only visible navigation items (`is_visible = true`)
- 🚫 **Public cannot**: Insert, update, or delete navigation items
- ✅ **Admin can**: Manage all navigation via service role key

### ⚙️ Site Settings Table
- 🚫 **Public cannot**: Read, insert, update, or delete settings
- ✅ **Admin can**: Manage all settings via service role key

### 📧 Email Subscribers Table
- ✅ **Public can insert**: New newsletter subscriptions (form submission)
- 🚫 **Public cannot**: Read, update, or delete subscriber data
- ✅ **Admin can**: View and manage all subscribers via service role key

### 📬 Contact Submissions Table
- ✅ **Public can insert**: New contact form submissions
- 🚫 **Public cannot**: Read, update, or delete submissions
- ✅ **Admin can**: View and manage all submissions via service role key

### 💳 Orders Table
- 🚫 **Public cannot**: Read, insert, update, or delete orders
- ✅ **Admin can**: Manage all orders via service role key

### 🔑 Download Tokens Table
- 🚫 **Public cannot**: Read, insert, update, or delete tokens
- ✅ **Admin can**: Generate and manage tokens via service role key

### 📅 Events Table
- ✅ **Public can read**: Only published events (`is_published = true`)
- 🚫 **Public cannot**: Insert, update, or delete events
- ✅ **Admin can**: Manage all events via service role key

### 🎵 Media Items Table
- ✅ **Public can read**: Only published and visible media (`is_published = true AND is_visible = true`)
- 🚫 **Public cannot**: Insert, update, or delete media
- ✅ **Admin can**: Manage all media via service role key

## Admin Functionality Preserved

### ✅ How Admin Operations Continue to Work

1. **Service Role Key Bypasses RLS**
   - Your admin API routes use `SUPABASE_SERVICE_ROLE_KEY`
   - Service role key has FULL database access regardless of RLS policies
   - All admin CRUD operations work exactly as before

2. **Admin Books Form Unchanged**
   - Located at: `/src/app/admin/books/[slug]/page.tsx`
   - **No changes made** to the form component
   - All fields, validation, and functionality remain identical
   - Form submissions use admin API routes with service role key

3. **Authentication Still Required**
   - Middleware protects all `/admin/*` routes
   - Session-based authentication with iron-session
   - Login required: `ADMIN_EMAIL` and `ADMIN_PASSWORD`

## Testing the Fix

### Test Public Access (Should Work)
1. Visit your public books page (not logged in as admin)
2. Verify published books are visible
3. Verify unpublished books are hidden
4. Try newsletter signup form
5. Try contact form submission

### Test Admin Access (Should Work)
1. Log in to admin: `/admin/login`
2. Navigate to `/admin/books`
3. Create a new book
4. Edit an existing book
5. Update book status (publish/unpublish)
6. Add/remove retailer links
7. Delete a book
8. Verify all operations succeed

## Rollback (If Needed)

If you encounter any issues, you can disable RLS temporarily:

```sql
-- WARNING: This removes security protections
-- Only use for emergency debugging

ALTER TABLE public.books DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.retailers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_retailer_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_subscribers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items DISABLE ROW LEVEL SECURITY;
```

## Security Best Practices

### ✅ What You Should Do

1. **Keep Service Role Key Secret**
   - Never expose `SUPABASE_SERVICE_ROLE_KEY` to client-side code
   - Only use it in server-side API routes (which you're already doing ✓)

2. **Use Anon Key for Public Access**
   - Public pages should use the anon key (not service role key)
   - RLS policies will automatically restrict access

3. **Monitor Security Advisor**
   - Check Security Advisor weekly for new vulnerabilities
   - Address issues promptly

4. **Validate Input**
   - Always validate user input in API routes
   - Sanitize data before database insertion (already implemented ✓)

5. **Use HTTPS Only**
   - Ensure `secure: true` in session cookies (already configured ✓)
   - Never use HTTP in production

### 🚫 What to Avoid

1. **Never disable RLS in production** without a specific reason
2. **Never expose service role key** to client-side code
3. **Never bypass authentication** in admin routes
4. **Never trust user input** without validation

## Additional Security Recommendations

### 1. Enable Email Verification (Optional)

Add email verification for newsletter subscribers:

```typescript
// In your newsletter signup API route
import { createTransport } from 'nodemailer'

// Generate verification token
const token = crypto.randomUUID()

// Send verification email
const transporter = createTransport({ /* config */ })
await transporter.sendMail({
  to: email,
  subject: 'Verify your subscription',
  html: `Click here to verify: ${process.env.SITE_URL}/verify/${token}`
})
```

### 2. Rate Limiting (Optional)

Protect contact form and newsletter signup from spam:

```typescript
// Install: npm install rate-limiter-flexible
import { RateLimiterMemory } from 'rate-limiter-flexible'

const limiter = new RateLimiterMemory({
  points: 5, // 5 submissions
  duration: 60 * 60, // per hour
})
```

### 3. CAPTCHA (Optional)

Add reCAPTCHA to forms to prevent bot submissions:

```bash
npm install react-google-recaptcha
```

## Support

If you encounter any issues:
1. Check the Security Advisor for specific error messages
2. Review the Supabase logs in your dashboard
3. Test admin operations in development environment first
4. Contact Supabase support if policies need adjustment

## Summary

✅ **All 24 security vulnerabilities will be fixed** after running `enable-rls-policies.sql`
✅ **Admin books form remains unchanged** - all functionality preserved
✅ **Public access properly restricted** - only published content visible
✅ **Newsletter and contact forms still work** - INSERT policies enabled
✅ **Zero downtime** - apply during low-traffic period for safety

**Next step:** Run the SQL migration in your Supabase SQL Editor!
