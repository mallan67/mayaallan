# Content Publishing Rules - "Draft by Default"

## Core Principle
**Nothing renders on the public site unless explicitly enabled.**

This is a hard contract across the entire system to prevent accidental content leaks and maintain full editorial control.

## Publishing Flags

### Books
- `isPublished` (boolean) - Must be `true` for book to appear anywhere on public site
- `isVisible` (boolean) - Additional visibility toggle (both must be `true`)
- `isComingSoon` (boolean) - Shows "Coming Soon" badge, but **only if `isVisible = true`**
- **Default:** All new books start as `isPublished: false, isVisible: false`

### Media (Audio/Video)
- `isPublished` (boolean) - Must be `true` for media to appear
- `isVisible` (boolean) - Additional visibility toggle (both must be `true`)
- **Default:** All new media starts as `isPublished: false, isVisible: false`

### Events
- `isPublished` (boolean) - Must be `true` for event to appear
- `isVisible` (boolean) - Additional visibility toggle (both must be `true`)
- `keepVisibleAfterEnd` (boolean) - Controls if past events stay visible
- **Default:** All new events start as `isPublished: false, isVisible: false`

### Navigation Items
- `isVisible` (boolean) - Must be `true` for tab to appear in navigation
- **Default:** Core tabs (Books, Contact) start visible, new tabs start hidden

### Retailers
- `isActive` (boolean) - Must be `true` for retailer to appear in book links
- **Default:** New retailers start as `isActive: false`

### Book Retailer Links
- `isActive` (boolean) - Must be `true` for link to display on book page
- **Default:** New links start as `isActive: false`

## Frontend Rendering Rules

### Section Visibility
1. **Section disappears if empty** - If a filtered query returns zero items, the entire section is not rendered (no empty state shown)
2. **No default content** - Sample/placeholder content is hidden by default
3. **Coming Soon requires explicit enable** - Books with `isComingSoon: true` only show if `isVisible: true`

### Homepage Sections
- **Hero/Featured Book** - Only renders if `publishedBooks.length > 0`
- **Events Section** - Only renders if `visibleEvents.length > 0`
- **Media Section** - Only renders if `visibleMedia.length > 0`
- **About Section** - Always visible (core author bio)

### List Pages
- **Books Page** - Shows "No books published yet" if `publishedBooks.length === 0`
- **Events Page** - Shows "No events scheduled" if `visibleEvents.length === 0`
- **Media Page** - Shows "No media available" if `visibleMedia.length === 0`

## Admin Workflow

### Creating New Content
1. Admin creates item (starts as draft/hidden by default)
2. Admin edits content, uploads images, etc.
3. Admin explicitly checks "Published" and "Visible" boxes
4. Content appears on public site

### "Coming Soon" Books
1. Create book with `isVisible: true, isComingSoon: true, isPublished: false`
2. Book shows with "Coming Soon" badge
3. When ready, set `isPublished: true, isComingSoon: false`
4. Full book details now visible with purchase links

## Database Schema Defaults

When implementing a real database, ensure these defaults in migrations:

```sql
-- Books
isPublished BOOLEAN DEFAULT FALSE,
isVisible BOOLEAN DEFAULT FALSE,
isComingSoon BOOLEAN DEFAULT FALSE,

-- Media
isPublished BOOLEAN DEFAULT FALSE,
isVisible BOOLEAN DEFAULT FALSE,

-- Events
isPublished BOOLEAN DEFAULT FALSE,
isVisible BOOLEAN DEFAULT FALSE,
keepVisibleAfterEnd BOOLEAN DEFAULT FALSE,

-- Navigation
isVisible BOOLEAN DEFAULT FALSE,

-- Retailers
isActive BOOLEAN DEFAULT FALSE,

-- BookRetailerLinks
isActive BOOLEAN DEFAULT FALSE
```

## Testing Checklist

- [ ] New book doesn't appear on site until both `isPublished` and `isVisible` are `true`
- [ ] "Coming Soon" book only shows if `isVisible: true`
- [ ] Past event disappears unless `keepVisibleAfterEnd: true`
- [ ] Homepage hero section disappears if no published books
- [ ] Events section disappears if no visible events
- [ ] Media section disappears if no visible media
- [ ] Navigation tab disappears if `isVisible: false`
- [ ] Retailer link doesn't show if `isActive: false`
- [ ] Empty list pages show friendly "no content" message (not raw empty array)

## Migration Path

When migrating from mock data to real database:
1. Run migration to create tables with proper defaults
2. Bulk update existing content to set publish flags explicitly
3. Review each item and decide visibility
4. Test that unpublished content doesn't leak to public site
