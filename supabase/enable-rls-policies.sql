-- Enable Row Level Security (RLS) on all tables
-- This fixes the security vulnerabilities by protecting all tables from unauthorized access
-- Service role key (used by admin routes) bypasses RLS, so admin operations continue to work

-- ============================================================
-- BOOKS TABLE - Public can view published books only
-- ============================================================
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Allow public to view published and visible books
CREATE POLICY "Public can view published books" ON public.books
  FOR SELECT
  USING (is_published = true AND is_visible = true);

-- Block all public INSERT, UPDATE, DELETE operations
-- (Service role key bypasses RLS, so admin can still modify)
CREATE POLICY "Block public insert on books" ON public.books
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Block public update on books" ON public.books
  FOR UPDATE
  USING (false);

CREATE POLICY "Block public delete on books" ON public.books
  FOR DELETE
  USING (false);

-- ============================================================
-- RETAILERS TABLE - Public can view active retailers only
-- ============================================================
ALTER TABLE public.retailers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active retailers" ON public.retailers
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Block public insert on retailers" ON public.retailers
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Block public update on retailers" ON public.retailers
  FOR UPDATE
  USING (false);

CREATE POLICY "Block public delete on retailers" ON public.retailers
  FOR DELETE
  USING (false);

-- ============================================================
-- BOOK_RETAILER_LINKS TABLE - Public can view active links for published books
-- ============================================================
ALTER TABLE public.book_retailer_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active book retailer links" ON public.book_retailer_links
  FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.books
      WHERE books.id = book_retailer_links.book_id
      AND books.is_published = true
      AND books.is_visible = true
    )
  );

CREATE POLICY "Block public insert on book_retailer_links" ON public.book_retailer_links
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Block public update on book_retailer_links" ON public.book_retailer_links
  FOR UPDATE
  USING (false);

CREATE POLICY "Block public delete on book_retailer_links" ON public.book_retailer_links
  FOR DELETE
  USING (false);

-- ============================================================
-- NAVIGATION_ITEMS TABLE - Public can view visible navigation items only
-- ============================================================
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view visible navigation items" ON public.navigation_items
  FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Block public insert on navigation_items" ON public.navigation_items
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Block public update on navigation_items" ON public.navigation_items
  FOR UPDATE
  USING (false);

CREATE POLICY "Block public delete on navigation_items" ON public.navigation_items
  FOR DELETE
  USING (false);

-- ============================================================
-- SITE_SETTINGS TABLE - Block all public access
-- ============================================================
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Block public select on site_settings" ON public.site_settings
  FOR SELECT
  USING (false);

CREATE POLICY "Block public insert on site_settings" ON public.site_settings
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Block public update on site_settings" ON public.site_settings
  FOR UPDATE
  USING (false);

CREATE POLICY "Block public delete on site_settings" ON public.site_settings
  FOR DELETE
  USING (false);

-- ============================================================
-- EMAIL_SUBSCRIBERS TABLE - Allow public insert (newsletter signup) only
-- ============================================================
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

-- Block public read access to subscriber data
CREATE POLICY "Block public select on email_subscribers" ON public.email_subscribers
  FOR SELECT
  USING (false);

-- Allow public to insert new subscriptions (newsletter signup)
CREATE POLICY "Public can insert email subscriptions" ON public.email_subscribers
  FOR INSERT
  WITH CHECK (true);

-- Block public update and delete
CREATE POLICY "Block public update on email_subscribers" ON public.email_subscribers
  FOR UPDATE
  USING (false);

CREATE POLICY "Block public delete on email_subscribers" ON public.email_subscribers
  FOR DELETE
  USING (false);

-- ============================================================
-- CONTACT_SUBMISSIONS TABLE - Allow public insert (contact form) only
-- ============================================================
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Block public read access to contact submissions
CREATE POLICY "Block public select on contact_submissions" ON public.contact_submissions
  FOR SELECT
  USING (false);

-- Allow public to insert new contact submissions
CREATE POLICY "Public can insert contact submissions" ON public.contact_submissions
  FOR INSERT
  WITH CHECK (true);

-- Block public update and delete
CREATE POLICY "Block public update on contact_submissions" ON public.contact_submissions
  FOR UPDATE
  USING (false);

CREATE POLICY "Block public delete on contact_submissions" ON public.contact_submissions
  FOR DELETE
  USING (false);

-- ============================================================
-- ORDERS TABLE - Block all public access
-- ============================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Block public select on orders" ON public.orders
  FOR SELECT
  USING (false);

CREATE POLICY "Block public insert on orders" ON public.orders
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Block public update on orders" ON public.orders
  FOR UPDATE
  USING (false);

CREATE POLICY "Block public delete on orders" ON public.orders
  FOR DELETE
  USING (false);

-- ============================================================
-- DOWNLOAD_TOKENS TABLE - Block all public access
-- ============================================================
ALTER TABLE public.download_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Block public select on download_tokens" ON public.download_tokens
  FOR SELECT
  USING (false);

CREATE POLICY "Block public insert on download_tokens" ON public.download_tokens
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Block public update on download_tokens" ON public.download_tokens
  FOR UPDATE
  USING (false);

CREATE POLICY "Block public delete on download_tokens" ON public.download_tokens
  FOR DELETE
  USING (false);

-- ============================================================
-- EVENTS TABLE - Public can view published events only
-- ============================================================
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published events" ON public.events
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Block public insert on events" ON public.events
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Block public update on events" ON public.events
  FOR UPDATE
  USING (false);

CREATE POLICY "Block public delete on events" ON public.events
  FOR DELETE
  USING (false);

-- ============================================================
-- MEDIA_ITEMS TABLE - Public can view published and visible media only
-- ============================================================
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published media items" ON public.media_items
  FOR SELECT
  USING (is_published = true AND is_visible = true);

CREATE POLICY "Block public insert on media_items" ON public.media_items
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Block public update on media_items" ON public.media_items
  FOR UPDATE
  USING (false);

CREATE POLICY "Block public delete on media_items" ON public.media_items
  FOR DELETE
  USING (false);
