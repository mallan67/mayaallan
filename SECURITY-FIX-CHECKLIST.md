# Security Fix Checklist

## ⚡ Quick Start (5 Minutes)

### ☐ Step 1: Run RLS Migration (2 min)
1. ☐ Open https://supabase.com/dashboard
2. ☐ Select project: **supabase-indigo-kite** (daqekbfdxxkdkowgxkmr)
3. ☐ Click **SQL Editor** → **New query**
4. ☐ Open file: `supabase/enable-rls-policies.sql`
5. ☐ Copy entire contents
6. ☐ Paste into Supabase SQL Editor
7. ☐ Click **Run** (or Ctrl/Cmd+Enter)
8. ☐ Wait for: "Success. No rows returned"

### ☐ Step 2: Run Schema Fix Migration (1 min)
1. ☐ Click **New query** in SQL Editor
2. ☐ Open file: `supabase/fix-orders-table-schema.sql`
3. ☐ Copy entire contents
4. ☐ Paste into SQL Editor
5. ☐ Click **Run**
6. ☐ Wait for confirmation

### ☐ Step 3: Verify Security Advisor (2 min)
1. ☐ Go to **Settings** → **Security Advisor** in Supabase
2. ☐ Wait 5-10 minutes for scan refresh
3. ☐ Verify: 24 errors → 0 errors ✅
4. ☐ See green checkmarks for all RLS policies

---

## ✅ Testing Checklist (Optional but Recommended)

### Public Pages (Not Logged In)
- ☐ Visit `/books` - only published books visible
- ☐ Test newsletter signup - should work
- ☐ Test contact form - should work
- ☐ Visit `/events` - only published events visible
- ☐ Visit `/media` - only published media visible

### Admin Functions (Logged In)
- ☐ Log in at `/admin/login`
- ☐ Navigate to `/admin/books`
- ☐ **Test admin books form** - should work exactly as before:
  - ☐ Create new book
  - ☐ Edit existing book
  - ☐ Update title, subtitle, blurb
  - ☐ Upload cover image
  - ☐ Change publish status
  - ☐ Add/remove retailer links
  - ☐ Update pricing
  - ☐ Save successfully
- ☐ Delete a test book
- ☐ Test other admin sections (events, media, navigation)

### Payment Flow (If Active)
- ☐ Test Stripe checkout
- ☐ Verify order created
- ☐ Verify download token generated
- ☐ Test download link

---

## 📊 What Changed?

### ✅ Security Enabled
- Row Level Security (RLS) on all 11 tables
- Public can only read published content
- Public cannot write/delete (except forms)
- Customer data is now private

### ✅ Admin Unchanged
- **Admin books form: ZERO changes** ✓
- All CRUD operations work exactly as before
- Service role key bypasses RLS
- Full admin access preserved

### ✅ Schema Fixed
- Orders table now has correct columns
- Payment webhooks will work properly
- Download tracking enabled

---

## 🆘 If Something Goes Wrong

### Admin books form not working?
1. Check browser console for errors
2. Verify `SUPABASE_SERVICE_ROLE_KEY` env var is set
3. Contact me - form should work exactly as before

### Public pages showing errors?
1. Check Security Advisor for policy issues
2. Verify migrations ran successfully
3. Check browser console
4. Contact me for help

### Emergency Rollback
If critical functionality breaks, run this to disable RLS temporarily:

```sql
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

Then contact me to debug.

---

## ✨ Success Criteria

After applying these fixes, you should have:
- ✅ 0 security errors in Security Advisor (was 24)
- ✅ Admin books form working perfectly (unchanged)
- ✅ All admin operations functional
- ✅ Public content properly restricted
- ✅ Customer data protected
- ✅ Newsletter/contact forms working
- ✅ Payment system functioning

**Total Time: ~15 minutes** ⏱️

---

**Ready to proceed?** ✓ Run the migrations and let me know if you need any help!
