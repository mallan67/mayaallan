-- Enable Row Level Security (RLS) on all tables - CORRECT TABLE NAMES
-- This fixes the security vulnerabilities by protecting all tables from unauthorized access
-- Service role key (used by admin routes) bypasses RLS, so admin operations continue to work

-- ============================================================
-- BOOKS TABLE (snake_case)
-- ============================================================
ALTER TABLE IF EXISTS public.books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published books" ON public.books;
DROP POLICY IF EXISTS "Block public insert on books" ON public.books;
DROP POLICY IF EXISTS "Block public update on books" ON public.books;
DROP POLICY IF EXISTS "Block public delete on books" ON public.books;

CREATE POLICY "Public can view published books" ON public.books
  FOR SELECT
  USING (is_published = true AND is_visible = true);

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
-- RETAILERS TABLE (snake_case)
-- ============================================================
ALTER TABLE IF EXISTS public.retailers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active retailers" ON public.retailers;
DROP POLICY IF EXISTS "Block public insert on retailers" ON public.retailers;
DROP POLICY IF EXISTS "Block public update on retailers" ON public.retailers;
DROP POLICY IF EXISTS "Block public delete on retailers" ON public.retailers;

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
-- BOOK_RETAILER_LINKS TABLE (snake_case)
-- ============================================================
ALTER TABLE IF EXISTS public.book_retailer_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active book retailer links" ON public.book_retailer_links;
DROP POLICY IF EXISTS "Block public insert on book_retailer_links" ON public.book_retailer_links;
DROP POLICY IF EXISTS "Block public update on book_retailer_links" ON public.book_retailer_links;
DROP POLICY IF EXISTS "Block public delete on book_retailer_links" ON public.book_retailer_links;

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
-- NAVIGATION_ITEMS TABLE (snake_case)
-- ============================================================
ALTER TABLE IF EXISTS public.navigation_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view visible navigation items" ON public.navigation_items;
DROP POLICY IF EXISTS "Block public insert on navigation_items" ON public.navigation_items;
DROP POLICY IF EXISTS "Block public update on navigation_items" ON public.navigation_items;
DROP POLICY IF EXISTS "Block public delete on navigation_items" ON public.navigation_items;

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
-- SITE_SETTINGS TABLE (PascalCase - as per your Tables mapping)
-- ============================================================
ALTER TABLE IF EXISTS public."SiteSettings" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Block public select on SiteSettings" ON public."SiteSettings";
DROP POLICY IF EXISTS "Block public insert on SiteSettings" ON public."SiteSettings";
DROP POLICY IF EXISTS "Block public update on SiteSettings" ON public."SiteSettings";
DROP POLICY IF EXISTS "Block public delete on SiteSettings" ON public."SiteSettings";

CREATE POLICY "Block public select on SiteSettings" ON public."SiteSettings"
  FOR SELECT
  USING (false);

CREATE POLICY "Block public insert on SiteSettings" ON public."SiteSettings"
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Block public update on SiteSettings" ON public."SiteSettings"
  FOR UPDATE
  USING (false);

CREATE POLICY "Block public delete on SiteSettings" ON public."SiteSettings"
  FOR DELETE
  USING (false);

-- ============================================================
-- SITE_SETTINGS TABLE (snake_case fallback)
-- ============================================================
ALTER TABLE IF EXISTS public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Block public select on site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Block public insert on site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Block public update on site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Block public delete on site_settings" ON public.site_settings;

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
-- EMAIL_SUBSCRIBERS TABLE (snake_case)
-- ============================================================
ALTER TABLE IF EXISTS public.email_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Block public select on email_subscribers" ON public.email_subscribers;
DROP POLICY IF EXISTS "Public can insert email subscriptions" ON public.email_subscribers;
DROP POLICY IF EXISTS "Block public update on email_subscribers" ON public.email_subscribers;
DROP POLICY IF EXISTS "Block public delete on email_subscribers" ON public.email_subscribers;

CREATE POLICY "Block public select on email_subscribers" ON public.email_subscribers
  FOR SELECT
  USING (false);

CREATE POLICY "Public can insert email subscriptions" ON public.email_subscribers
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Block public update on email_subscribers" ON public.email_subscribers
  FOR UPDATE
  USING (false);

CREATE POLICY "Block public delete on email_subscribers" ON public.email_subscribers
  FOR DELETE
  USING (false);

-- ============================================================
-- CONTACT_SUBMISSIONS TABLE (snake_case)
-- ============================================================
ALTER TABLE IF EXISTS public.contact_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Block public select on contact_submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Public can insert contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Block public update on contact_submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Block public delete on contact_submissions" ON public.contact_submissions;

CREATE POLICY "Block public select on contact_submissions" ON public.contact_submissions
  FOR SELECT
  USING (false);

CREATE POLICY "Public can insert contact submissions" ON public.contact_submissions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Block public update on contact_submissions" ON public.contact_submissions
  FOR UPDATE
  USING (false);

CREATE POLICY "Block public delete on contact_submissions" ON public.contact_submissions
  FOR DELETE
  USING (false);

-- ============================================================
-- ORDERS TABLE (snake_case)
-- ============================================================
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Block public select on orders" ON public.orders;
DROP POLICY IF EXISTS "Block public insert on orders" ON public.orders;
DROP POLICY IF EXISTS "Block public update on orders" ON public.orders;
DROP POLICY IF EXISTS "Block public delete on orders" ON public.orders;

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
-- DOWNLOAD_TOKENS TABLE (snake_case)
-- ============================================================
ALTER TABLE IF EXISTS public.download_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Block public select on download_tokens" ON public.download_tokens;
DROP POLICY IF EXISTS "Block public insert on download_tokens" ON public.download_tokens;
DROP POLICY IF EXISTS "Block public update on download_tokens" ON public.download_tokens;
DROP POLICY IF EXISTS "Block public delete on download_tokens" ON public.download_tokens;

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
-- EVENT TABLE (PascalCase - as per your Tables mapping)
-- ============================================================
ALTER TABLE IF EXISTS public."Event" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published events" ON public."Event";
DROP POLICY IF EXISTS "Block public insert on Event" ON public."Event";
DROP POLICY IF EXISTS "Block public update on Event" ON public."Event";
DROP POLICY IF EXISTS "Block public delete on Event" ON public."Event";

CREATE POLICY "Public can view published events" ON public."Event"
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Block public insert on Event" ON public."Event"
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Block public update on Event" ON public."Event"
  FOR UPDATE
  USING (false);

CREATE POLICY "Block public delete on Event" ON public."Event"
  FOR DELETE
  USING (false);

-- ============================================================
-- EVENTS TABLE (snake_case fallback)
-- ============================================================
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published events" ON public.events;
DROP POLICY IF EXISTS "Block public insert on events" ON public.events;
DROP POLICY IF EXISTS "Block public update on events" ON public.events;
DROP POLICY IF EXISTS "Block public delete on events" ON public.events;

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
-- MEDIA_ITEMS TABLE (snake_case)
-- ============================================================
ALTER TABLE IF EXISTS public.media_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published media items" ON public.media_items;
DROP POLICY IF EXISTS "Block public insert on media_items" ON public.media_items;
DROP POLICY IF EXISTS "Block public update on media_items" ON public.media_items;
DROP POLICY IF EXISTS "Block public delete on media_items" ON public.media_items;

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

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE 'Row Level Security has been enabled on all tables!';
  RAISE NOTICE 'Service role key (admin) will bypass all RLS policies.';
  RAISE NOTICE 'Public users can only read published content and submit forms.';
END $$;
