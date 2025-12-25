# Backend Features - Complete Documentation

## What Existed Before

### Basic CRM
- Contact form submissions viewer (read-only)
- Email subscriber list viewer (read-only)
- CSV export for both

### Content Management
- Books: Basic CRUD with title, description, publication status
- Media: Audio/video management with visibility controls
- Events: Event management with visibility controls
- Retailers: Master retailer list management

### Site Configuration
- Navigation management (edit tab names, reorder, show/hide)
- Site settings (social media links, basic metadata)

### Authentication
- Session-based admin login (Iron Session)
- Protected routes via middleware

---

## What Was Added/Changed

### 1. Global Publishing Contract (NEW)
**Rule:** Everything is DRAFT by default, nothing renders unless explicitly enabled.

**Implementation:**
- All content types default to `isPublished: false` and `isVisible: false`
- Frontend checks BOTH flags before rendering
- Sections completely disappear if no active items (no empty states on public site)
- Admin can set "Coming Soon" but it only shows if `isVisible: true`

### 2. Books Module Upgrades (ENHANCED)

**New Fields:**
- `subtitle1` and `subtitle2` - For multi-line subtitles
- `tagsCsv` - Comma-separated keywords for SEO
- `isbn` - Book identification
- `copyright` - Copyright notice (e.g., "© 2025 Maya Allan")
- `blurb` - Short book description
- `coverUrl` - Required for frontend display
- `backCoverUrl` - Optional back cover image
- `ebookFileUrl` - Required for direct sales delivery

**Enhanced Statuses:**
- Draft (default: `isPublished: false, isVisible: false`)
- Published (`isPublished: true, isVisible: true`)
- Coming Soon (`isVisible: true, isComingSoon: true, isPublished: false`)

**Per-Book Retailer Management (NEW):**
- Master retailer list maintained in admin
- For each book, admin selects which retailers to display
- Each retailer link has:
  - Active/inactive toggle
  - Format type (ebook / print / hardcover)
  - Custom purchase URL per book
- Admin UI at `/admin/books/[id]/retailers`

**Direct Sales with Real Payments (NEW):**
- Per-book toggle: `allowDirectSale`
- Integration fields:
  - `stripePaymentLink` - Stripe checkout URL
  - `paypalPaymentLink` - PayPal payment URL
- Webhook endpoints:
  - `/api/payment/stripe/webhook` - Processes Stripe payments
  - `/api/payment/paypal/webhook` - Processes PayPal payments
- After successful payment:
  - Webhook receives event
  - Verifies payment
  - Sends email with ebook download link (`ebookFileUrl`)
- If no active retailers AND direct sale is off:
  - Admin can choose to show "Coming Soon" OR hide completely

### 3. Media Module Clarification (ENHANCED)

**Upload OR Embed:**
- `fileUrl` - For uploaded audio/video files (Vercel Blob)
- `externalUrl` - For YouTube/Vimeo embeds
- One or the other required

**New Fields:**
- `coverUrl` - Thumbnail/cover image
- `isbn` - Optional ISBN for audio books
- Publishing flags work same as books

### 4. Events Module Behavior (ENHANCED)

**Past Event Control:**
- New field: `keepVisibleAfterEnd`
- If `false`: Events disappear after end date
- If `true`: Events remain visible after end date
- Admin can toggle per-event

**Visibility Logic:**
```typescript
if (!event.isPublished || !event.isVisible) return false
if (isPast && !event.keepVisibleAfterEnd) return false
return true
```

### 5. SEO + Schema.org Structured Data (NEW)

**Per-Content Metadata:**
- Books: `seoTitle`, `seoDescription`, `ogImageUrl`
- Media: `seoTitle`, `seoDescription`, `ogImageUrl`
- Events: `seoTitle`, `seoDescription`, `ogImageUrl`

**Structured Data Generation:**
- `/src/lib/structured-data.ts` - Schema.org JSON-LD generators
- `generateBookSchema()` - Book type with author, ISBN, offers
- `generateAuthorSchema()` - Person type for Maya Allan
- `generateEventSchema()` - Event type with location, dates
- `generateMediaSchema()` - AudioObject/VideoObject types
- Automatically embedded in page `<head>` via `<script type="application/ld+json">`

**SEO Features:**
- Sitemap generation (`/src/app/sitemap.ts`)
- Robots.txt (`/src/app/robots.ts`)
- Open Graph tags on all pages
- Twitter Card metadata
- PWA manifest.json

### 6. Style Controls Without Redeploy (NEW)

**Admin-Controlled Theme Settings:**
- Font family (body & heading): Sans / Serif / Mono
- Accent color: Hex color picker
- Max width: 4xl / 5xl / 6xl / 7xl
- Button style: Rounded / Rounded Large / Pill / Square
- Author photo URL
- Default OG image URL

**Implementation:**
- Stored in `SiteSettings` table (single row)
- Updated via `/admin/settings`
- Applied via CSS custom properties or Tailwind classes
- Changes take effect immediately (no rebuild)

### 7. Author Photos & Supporting Images (NEW)

**Author Photo:**
- Field: `authorPhotoUrl` in site settings
- Displayed in About page, footer, or author bio sections

**Supporting Images:**
- Books: `coverUrl` (required), `backCoverUrl` (optional)
- Media: `coverUrl` for thumbnails
- Events: `photoUrls[]` array for event gallery
- All use Vercel Blob for storage

---

## API Endpoints Summary

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout

### Books
- `GET /api/admin/books` - List all books (admin)
- `POST /api/admin/books` - Create book
- `GET /api/admin/books/[id]` - Get book details
- `PUT /api/admin/books/[id]` - Update book
- `DELETE /api/admin/books/[id]` - Delete book
- `GET /api/admin/books/[id]/retailers` - Get book's retailer links
- `POST /api/admin/books/[id]/retailers` - Add retailer link to book
- `PUT /api/admin/books/[id]/retailers` - Update retailer link
- `DELETE /api/admin/books/[id]/retailers` - Remove retailer link

### Media
- `GET /api/admin/media` - List all media
- `POST /api/admin/media` - Create media
- `GET /api/admin/media/[id]` - Get media details
- `PUT /api/admin/media/[id]` - Update media
- `DELETE /api/admin/media/[id]` - Delete media

### Events
- `GET /api/admin/events` - List all events
- `POST /api/admin/events` - Create event
- `GET /api/admin/events/[id]` - Get event details
- `PUT /api/admin/events/[id]` - Update event
- `DELETE /api/admin/events/[id]` - Delete event

### Retailers
- `GET /api/admin/retailers` - List all retailers
- `POST /api/admin/retailers` - Create retailer
- `PUT /api/admin/retailers/[id]` - Update retailer
- `DELETE /api/admin/retailers/[id]` - Delete retailer

### CRM
- `GET /api/admin/crm/contacts` - View contact submissions
- `GET /api/admin/crm/subscribers` - View email subscribers

### Site Configuration
- `GET /api/admin/settings` - Get site settings
- `PUT /api/admin/settings` - Update site settings
- `GET /api/admin/navigation` - Get navigation items
- `PUT /api/admin/navigation/[id]` - Update navigation item
- `POST /api/admin/navigation` - Create navigation item
- `DELETE /api/admin/navigation/[id]` - Delete navigation item

### Public Endpoints
- `POST /api/contact` - Submit contact form
- `POST /api/subscribe` - Subscribe to email list
- `POST /api/payment/stripe/webhook` - Stripe payment webhook
- `POST /api/payment/paypal/webhook` - PayPal payment webhook

---

## Admin Pages

- `/admin` - Dashboard overview
- `/admin/login` - Login page
- `/admin/books` - Books list
- `/admin/books/[id]` - Edit book
- `/admin/books/[id]/retailers` - Manage book retailers
- `/admin/media` - Media list
- `/admin/events` - Events list
- `/admin/retailers` - Retailers list
- `/admin/contact` - Contact submissions
- `/admin/subscribers` - Email subscribers
- `/admin/navigation` - Navigation management
- `/admin/settings` - Site settings (theme controls, social links, metadata)

---

## What's NOT Included (Future Enhancements)

- Email sending (contact form notifications, ebook delivery emails)
- Automated marketing campaigns
- Contact tagging/segmentation
- Lead scoring
- A/B testing
- Analytics dashboard
- Integration with external email providers (Mailchimp, SendGrid)
- File upload UI (currently uses external Blob URLs)
- Bulk operations (bulk publish, bulk delete)
- Content scheduling (publish at specific date/time)
- Version history / content revisions
- Multi-language support
- Advanced SEO analysis
- Social media auto-posting
