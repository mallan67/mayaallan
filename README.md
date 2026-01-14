# Admin Dashboard Fix

This package contains all the fixes for the Maya Allan admin dashboard authentication and missing pages.

## Files Included

### Core Fixes
- `lib/session.ts` - Fixed session handling with `isAuthenticated()` helper

### New Pages (Add New functionality)
- `src/app/admin/books/new/page.tsx` - Create new books
- `src/app/admin/media/new/page.tsx` - Create new media (audio/video)
- `src/app/admin/events/new/page.tsx` - Create new events

### Fixed API Routes (all use isAuthenticated())
- `src/app/api/admin/login/route.ts` - Sets both adminId and isLoggedIn
- `src/app/api/admin/books/route.ts` - GET/POST books
- `src/app/api/admin/books/[id]/route.ts` - GET/PATCH/DELETE single book
- `src/app/api/admin/books/[id]/retailers/route.ts` - Manage book retailers
- `src/app/api/admin/media/route.ts` - GET/POST media
- `src/app/api/admin/media/[id]/route.ts` - GET/PATCH/DELETE single media
- `src/app/api/admin/events/route.ts` - GET/POST events
- `src/app/api/admin/events/[id]/route.ts` - GET/PATCH/DELETE single event
- `src/app/api/admin/retailers/route.ts` - GET/POST retailers
- `src/app/api/admin/retailers/[id]/route.ts` - GET/PATCH/DELETE single retailer
- `src/app/api/admin/settings/route.ts` - GET/PATCH settings
- `src/app/api/admin/crm/contacts/route.ts` - Manage contact submissions
- `src/app/api/admin/crm/subscribers/route.ts` - Manage newsletter subscribers

## Deployment Instructions

1. **Extract files** - Unzip and copy all files to your project root, preserving directory structure

2. **Set environment variables** (in Vercel or .env.local):
   ```
   ADMIN_EMAIL=admin@mayaallan.com
   ADMIN_PASSWORD=your-secure-password
   SESSION_SECRET=at-least-32-characters-long-random-string
   ```

3. **Test locally**:
   ```bash
   npm run dev
   ```
   - Go to /admin/login
   - Login with your credentials
   - Verify you can access /admin/books, /admin/media, /admin/events
   - Test "Add New" buttons work

4. **Deploy to Vercel**:
   ```bash
   git add .
   git commit -m "Fix admin auth and add new item pages"
   git push
   ```

## What Was Fixed

1. **Session Inconsistency** - The login was setting `session.adminId` but API routes were checking `session.user`. Now all routes use the `isAuthenticated()` helper which checks both `adminId` and `isLoggedIn`.

2. **Missing "New" Pages** - Added UI pages for creating new books, media, and events. All items are created as drafts (unpublished) by default.

3. **API Authentication** - All admin API routes now consistently use `isAuthenticated()` from `@/lib/session`.
