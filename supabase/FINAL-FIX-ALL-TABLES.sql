-- COMPREHENSIVE RLS FIX - Covers all possible table name variations
-- This will enable RLS on whichever tables actually exist in your database

-- ============================================================
-- STEP 1: List all existing tables (for verification)
-- ============================================================
DO $$
DECLARE
    r RECORD;
BEGIN
    RAISE NOTICE '=== EXISTING PUBLIC TABLES ===';
    FOR r IN
        SELECT tablename,
               CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename
    LOOP
        RAISE NOTICE 'Table: % - RLS: %', r.tablename, r.rls_status;
    END LOOP;
END $$;

-- ============================================================
-- BOOKS / Book
-- ============================================================

-- PascalCase version
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Book') THEN
        ALTER TABLE public."Book" ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public can view published books" ON public."Book";
        DROP POLICY IF EXISTS "Block public insert on Book" ON public."Book";
        DROP POLICY IF EXISTS "Block public update on Book" ON public."Book";
        DROP POLICY IF EXISTS "Block public delete on Book" ON public."Book";

        CREATE POLICY "Public can view published books" ON public."Book"
          FOR SELECT USING ("isPublished" = true AND "isVisible" = true);

        CREATE POLICY "Block public insert on Book" ON public."Book"
          FOR INSERT WITH CHECK (false);

        CREATE POLICY "Block public update on Book" ON public."Book"
          FOR UPDATE USING (false);

        CREATE POLICY "Block public delete on Book" ON public."Book"
          FOR DELETE USING (false);

        RAISE NOTICE 'RLS enabled on: Book (PascalCase)';
    END IF;
END $$;

-- snake_case version
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'books') THEN
        ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public can view published books" ON public.books;
        DROP POLICY IF EXISTS "Block public insert on books" ON public.books;
        DROP POLICY IF EXISTS "Block public update on books" ON public.books;
        DROP POLICY IF EXISTS "Block public delete on books" ON public.books;

        CREATE POLICY "Public can view published books" ON public.books
          FOR SELECT USING (is_published = true AND is_visible = true);

        CREATE POLICY "Block public insert on books" ON public.books
          FOR INSERT WITH CHECK (false);

        CREATE POLICY "Block public update on books" ON public.books
          FOR UPDATE USING (false);

        CREATE POLICY "Block public delete on books" ON public.books
          FOR DELETE USING (false);

        RAISE NOTICE 'RLS enabled on: books (snake_case)';
    END IF;
END $$;

-- ============================================================
-- BOOK_RETAILER_LINKS / BookRetailerLink
-- ============================================================

-- PascalCase version
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'BookRetailerLink') THEN
        ALTER TABLE public."BookRetailerLink" ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public can view active links" ON public."BookRetailerLink";
        DROP POLICY IF EXISTS "Block public insert on BookRetailerLink" ON public."BookRetailerLink";
        DROP POLICY IF EXISTS "Block public update on BookRetailerLink" ON public."BookRetailerLink";
        DROP POLICY IF EXISTS "Block public delete on BookRetailerLink" ON public."BookRetailerLink";

        CREATE POLICY "Public can view active links" ON public."BookRetailerLink"
          FOR SELECT USING ("isActive" = true);

        CREATE POLICY "Block public insert on BookRetailerLink" ON public."BookRetailerLink"
          FOR INSERT WITH CHECK (false);

        CREATE POLICY "Block public update on BookRetailerLink" ON public."BookRetailerLink"
          FOR UPDATE USING (false);

        CREATE POLICY "Block public delete on BookRetailerLink" ON public."BookRetailerLink"
          FOR DELETE USING (false);

        RAISE NOTICE 'RLS enabled on: BookRetailerLink (PascalCase)';
    END IF;
END $$;

-- snake_case version
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'book_retailer_links') THEN
        ALTER TABLE public.book_retailer_links ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public can view active links" ON public.book_retailer_links;
        DROP POLICY IF EXISTS "Block public insert on book_retailer_links" ON public.book_retailer_links;
        DROP POLICY IF EXISTS "Block public update on book_retailer_links" ON public.book_retailer_links;
        DROP POLICY IF EXISTS "Block public delete on book_retailer_links" ON public.book_retailer_links;

        CREATE POLICY "Public can view active links" ON public.book_retailer_links
          FOR SELECT USING (is_active = true);

        CREATE POLICY "Block public insert on book_retailer_links" ON public.book_retailer_links
          FOR INSERT WITH CHECK (false);

        CREATE POLICY "Block public update on book_retailer_links" ON public.book_retailer_links
          FOR UPDATE USING (false);

        CREATE POLICY "Block public delete on book_retailer_links" ON public.book_retailer_links
          FOR DELETE USING (false);

        RAISE NOTICE 'RLS enabled on: book_retailer_links (snake_case)';
    END IF;
END $$;

-- ============================================================
-- RETAILERS / Retailer
-- ============================================================

-- PascalCase version
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Retailer') THEN
        ALTER TABLE public."Retailer" ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public can view active retailers" ON public."Retailer";
        DROP POLICY IF EXISTS "Block public insert on Retailer" ON public."Retailer";
        DROP POLICY IF EXISTS "Block public update on Retailer" ON public."Retailer";
        DROP POLICY IF EXISTS "Block public delete on Retailer" ON public."Retailer";

        CREATE POLICY "Public can view active retailers" ON public."Retailer"
          FOR SELECT USING ("isActive" = true);

        CREATE POLICY "Block public insert on Retailer" ON public."Retailer"
          FOR INSERT WITH CHECK (false);

        CREATE POLICY "Block public update on Retailer" ON public."Retailer"
          FOR UPDATE USING (false);

        CREATE POLICY "Block public delete on Retailer" ON public."Retailer"
          FOR DELETE USING (false);

        RAISE NOTICE 'RLS enabled on: Retailer (PascalCase)';
    END IF;
END $$;

-- snake_case version
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'retailers') THEN
        ALTER TABLE public.retailers ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public can view active retailers" ON public.retailers;
        DROP POLICY IF EXISTS "Block public insert on retailers" ON public.retailers;
        DROP POLICY IF EXISTS "Block public update on retailers" ON public.retailers;
        DROP POLICY IF EXISTS "Block public delete on retailers" ON public.retailers;

        CREATE POLICY "Public can view active retailers" ON public.retailers
          FOR SELECT USING (is_active = true);

        CREATE POLICY "Block public insert on retailers" ON public.retailers
          FOR INSERT WITH CHECK (false);

        CREATE POLICY "Block public update on retailers" ON public.retailers
          FOR UPDATE USING (false);

        CREATE POLICY "Block public delete on retailers" ON public.retailers
          FOR DELETE USING (false);

        RAISE NOTICE 'RLS enabled on: retailers (snake_case)';
    END IF;
END $$;

-- ============================================================
-- NAVIGATION_ITEMS / NavigationItem
-- ============================================================

-- PascalCase version
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'NavigationItem') THEN
        ALTER TABLE public."NavigationItem" ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public can view visible items" ON public."NavigationItem";
        DROP POLICY IF EXISTS "Block public insert on NavigationItem" ON public."NavigationItem";
        DROP POLICY IF EXISTS "Block public update on NavigationItem" ON public."NavigationItem";
        DROP POLICY IF EXISTS "Block public delete on NavigationItem" ON public."NavigationItem";

        CREATE POLICY "Public can view visible items" ON public."NavigationItem"
          FOR SELECT USING ("isActive" = true);

        CREATE POLICY "Block public insert on NavigationItem" ON public."NavigationItem"
          FOR INSERT WITH CHECK (false);

        CREATE POLICY "Block public update on NavigationItem" ON public."NavigationItem"
          FOR UPDATE USING (false);

        CREATE POLICY "Block public delete on NavigationItem" ON public."NavigationItem"
          FOR DELETE USING (false);

        RAISE NOTICE 'RLS enabled on: NavigationItem (PascalCase)';
    END IF;
END $$;

-- snake_case version
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'navigation_items') THEN
        ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public can view visible items" ON public.navigation_items;
        DROP POLICY IF EXISTS "Block public insert on navigation_items" ON public.navigation_items;
        DROP POLICY IF EXISTS "Block public update on navigation_items" ON public.navigation_items;
        DROP POLICY IF EXISTS "Block public delete on navigation_items" ON public.navigation_items;

        CREATE POLICY "Public can view visible items" ON public.navigation_items
          FOR SELECT USING (is_visible = true);

        CREATE POLICY "Block public insert on navigation_items" ON public.navigation_items
          FOR INSERT WITH CHECK (false);

        CREATE POLICY "Block public update on navigation_items" ON public.navigation_items
          FOR UPDATE USING (false);

        CREATE POLICY "Block public delete on navigation_items" ON public.navigation_items
          FOR DELETE USING (false);

        RAISE NOTICE 'RLS enabled on: navigation_items (snake_case)';
    END IF;
END $$;

-- ============================================================
-- SITE_SETTINGS / SiteSettings
-- ============================================================

-- PascalCase version
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'SiteSettings') THEN
        ALTER TABLE public."SiteSettings" ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Block all public access to SiteSettings" ON public."SiteSettings";

        CREATE POLICY "Block all public access to SiteSettings" ON public."SiteSettings"
          FOR ALL USING (false);

        RAISE NOTICE 'RLS enabled on: SiteSettings (PascalCase)';
    END IF;
END $$;

-- snake_case version
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'site_settings') THEN
        ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Block all public access to site_settings" ON public.site_settings;

        CREATE POLICY "Block all public access to site_settings" ON public.site_settings
          FOR ALL USING (false);

        RAISE NOTICE 'RLS enabled on: site_settings (snake_case)';
    END IF;
END $$;

-- ============================================================
-- EMAIL_SUBSCRIBERS / EmailSubscriber
-- ============================================================

-- PascalCase version
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'EmailSubscriber') THEN
        ALTER TABLE public."EmailSubscriber" ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Block public select on EmailSubscriber" ON public."EmailSubscriber";
        DROP POLICY IF EXISTS "Public can insert subscriptions" ON public."EmailSubscriber";
        DROP POLICY IF EXISTS "Block public update on EmailSubscriber" ON public."EmailSubscriber";
        DROP POLICY IF EXISTS "Block public delete on EmailSubscriber" ON public."EmailSubscriber";

        CREATE POLICY "Block public select on EmailSubscriber" ON public."EmailSubscriber"
          FOR SELECT USING (false);

        CREATE POLICY "Public can insert subscriptions" ON public."EmailSubscriber"
          FOR INSERT WITH CHECK (true);

        CREATE POLICY "Block public update on EmailSubscriber" ON public."EmailSubscriber"
          FOR UPDATE USING (false);

        CREATE POLICY "Block public delete on EmailSubscriber" ON public."EmailSubscriber"
          FOR DELETE USING (false);

        RAISE NOTICE 'RLS enabled on: EmailSubscriber (PascalCase)';
    END IF;
END $$;

-- snake_case version
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'email_subscribers') THEN
        ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Block public select on email_subscribers" ON public.email_subscribers;
        DROP POLICY IF EXISTS "Public can insert subscriptions" ON public.email_subscribers;
        DROP POLICY IF EXISTS "Block public update on email_subscribers" ON public.email_subscribers;
        DROP POLICY IF EXISTS "Block public delete on email_subscribers" ON public.email_subscribers;

        CREATE POLICY "Block public select on email_subscribers" ON public.email_subscribers
          FOR SELECT USING (false);

        CREATE POLICY "Public can insert subscriptions" ON public.email_subscribers
          FOR INSERT WITH CHECK (true);

        CREATE POLICY "Block public update on email_subscribers" ON public.email_subscribers
          FOR UPDATE USING (false);

        CREATE POLICY "Block public delete on email_subscribers" ON public.email_subscribers
          FOR DELETE USING (false);

        RAISE NOTICE 'RLS enabled on: email_subscribers (snake_case)';
    END IF;
END $$;

-- ============================================================
-- CONTACT_SUBMISSIONS / ContactSubmission
-- ============================================================

-- PascalCase version
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ContactSubmission') THEN
        ALTER TABLE public."ContactSubmission" ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Block public select on ContactSubmission" ON public."ContactSubmission";
        DROP POLICY IF EXISTS "Public can insert contacts" ON public."ContactSubmission";
        DROP POLICY IF EXISTS "Block public update on ContactSubmission" ON public."ContactSubmission";
        DROP POLICY IF EXISTS "Block public delete on ContactSubmission" ON public."ContactSubmission";

        CREATE POLICY "Block public select on ContactSubmission" ON public."ContactSubmission"
          FOR SELECT USING (false);

        CREATE POLICY "Public can insert contacts" ON public."ContactSubmission"
          FOR INSERT WITH CHECK (true);

        CREATE POLICY "Block public update on ContactSubmission" ON public."ContactSubmission"
          FOR UPDATE USING (false);

        CREATE POLICY "Block public delete on ContactSubmission" ON public."ContactSubmission"
          FOR DELETE USING (false);

        RAISE NOTICE 'RLS enabled on: ContactSubmission (PascalCase)';
    END IF;
END $$;

-- snake_case version
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contact_submissions') THEN
        ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Block public select on contact_submissions" ON public.contact_submissions;
        DROP POLICY IF EXISTS "Public can insert contacts" ON public.contact_submissions;
        DROP POLICY IF EXISTS "Block public update on contact_submissions" ON public.contact_submissions;
        DROP POLICY IF EXISTS "Block public delete on contact_submissions" ON public.contact_submissions;

        CREATE POLICY "Block public select on contact_submissions" ON public.contact_submissions
          FOR SELECT USING (false);

        CREATE POLICY "Public can insert contacts" ON public.contact_submissions
          FOR INSERT WITH CHECK (true);

        CREATE POLICY "Block public update on contact_submissions" ON public.contact_submissions
          FOR UPDATE USING (false);

        CREATE POLICY "Block public delete on contact_submissions" ON public.contact_submissions
          FOR DELETE USING (false);

        RAISE NOTICE 'RLS enabled on: contact_submissions (snake_case)';
    END IF;
END $$;

-- ============================================================
-- ORDERS / Order
-- ============================================================

-- PascalCase version
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Order') THEN
        ALTER TABLE public."Order" ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Block all public access to Order" ON public."Order";

        CREATE POLICY "Block all public access to Order" ON public."Order"
          FOR ALL USING (false);

        RAISE NOTICE 'RLS enabled on: Order (PascalCase)';
    END IF;
END $$;

-- snake_case version
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Block all public access to orders" ON public.orders;

        CREATE POLICY "Block all public access to orders" ON public.orders
          FOR ALL USING (false);

        RAISE NOTICE 'RLS enabled on: orders (snake_case)';
    END IF;
END $$;

-- ============================================================
-- DOWNLOAD_TOKENS / DownloadToken
-- ============================================================

-- PascalCase version
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'DownloadToken') THEN
        ALTER TABLE public."DownloadToken" ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Block all public access to DownloadToken" ON public."DownloadToken";

        CREATE POLICY "Block all public access to DownloadToken" ON public."DownloadToken"
          FOR ALL USING (false);

        RAISE NOTICE 'RLS enabled on: DownloadToken (PascalCase)';
    END IF;
END $$;

-- snake_case version
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'download_tokens') THEN
        ALTER TABLE public.download_tokens ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Block all public access to download_tokens" ON public.download_tokens;

        CREATE POLICY "Block all public access to download_tokens" ON public.download_tokens
          FOR ALL USING (false);

        RAISE NOTICE 'RLS enabled on: download_tokens (snake_case)';
    END IF;
END $$;

-- ============================================================
-- EVENTS / Event
-- ============================================================

-- PascalCase version
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Event') THEN
        ALTER TABLE public."Event" ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public can view published events" ON public."Event";
        DROP POLICY IF EXISTS "Block public insert on Event" ON public."Event";
        DROP POLICY IF EXISTS "Block public update on Event" ON public."Event";
        DROP POLICY IF EXISTS "Block public delete on Event" ON public."Event";

        CREATE POLICY "Public can view published events" ON public."Event"
          FOR SELECT USING ("isPublished" = true);

        CREATE POLICY "Block public insert on Event" ON public."Event"
          FOR INSERT WITH CHECK (false);

        CREATE POLICY "Block public update on Event" ON public."Event"
          FOR UPDATE USING (false);

        CREATE POLICY "Block public delete on Event" ON public."Event"
          FOR DELETE USING (false);

        RAISE NOTICE 'RLS enabled on: Event (PascalCase)';
    END IF;
END $$;

-- snake_case version
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'events') THEN
        ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public can view published events" ON public.events;
        DROP POLICY IF EXISTS "Block public insert on events" ON public.events;
        DROP POLICY IF EXISTS "Block public update on events" ON public.events;
        DROP POLICY IF EXISTS "Block public delete on events" ON public.events;

        CREATE POLICY "Public can view published events" ON public.events
          FOR SELECT USING (is_published = true);

        CREATE POLICY "Block public insert on events" ON public.events
          FOR INSERT WITH CHECK (false);

        CREATE POLICY "Block public update on events" ON public.events
          FOR UPDATE USING (false);

        CREATE POLICY "Block public delete on events" ON public.events
          FOR DELETE USING (false);

        RAISE NOTICE 'RLS enabled on: events (snake_case)';
    END IF;
END $$;

-- ============================================================
-- MEDIA_ITEMS / MediaItem
-- ============================================================

-- PascalCase version
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'MediaItem') THEN
        ALTER TABLE public."MediaItem" ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public can view published media" ON public."MediaItem";
        DROP POLICY IF EXISTS "Block public insert on MediaItem" ON public."MediaItem";
        DROP POLICY IF EXISTS "Block public update on MediaItem" ON public."MediaItem";
        DROP POLICY IF EXISTS "Block public delete on MediaItem" ON public."MediaItem";

        CREATE POLICY "Public can view published media" ON public."MediaItem"
          FOR SELECT USING ("isPublished" = true AND "isVisible" = true);

        CREATE POLICY "Block public insert on MediaItem" ON public."MediaItem"
          FOR INSERT WITH CHECK (false);

        CREATE POLICY "Block public update on MediaItem" ON public."MediaItem"
          FOR UPDATE USING (false);

        CREATE POLICY "Block public delete on MediaItem" ON public."MediaItem"
          FOR DELETE USING (false);

        RAISE NOTICE 'RLS enabled on: MediaItem (PascalCase)';
    END IF;
END $$;

-- snake_case version
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'media_items') THEN
        ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public can view published media" ON public.media_items;
        DROP POLICY IF EXISTS "Block public insert on media_items" ON public.media_items;
        DROP POLICY IF EXISTS "Block public update on media_items" ON public.media_items;
        DROP POLICY IF EXISTS "Block public delete on media_items" ON public.media_items;

        CREATE POLICY "Public can view published media" ON public.media_items
          FOR SELECT USING (is_published = true AND is_visible = true);

        CREATE POLICY "Block public insert on media_items" ON public.media_items
          FOR INSERT WITH CHECK (false);

        CREATE POLICY "Block public update on media_items" ON public.media_items
          FOR UPDATE USING (false);

        CREATE POLICY "Block public delete on media_items" ON public.media_items
          FOR DELETE USING (false);

        RAISE NOTICE 'RLS enabled on: media_items (snake_case)';
    END IF;
END $$;

-- ============================================================
-- FINAL SUMMARY
-- ============================================================
DO $$
DECLARE
    r RECORD;
    rls_count INT := 0;
    no_rls_count INT := 0;
BEGIN
    RAISE NOTICE '=== FINAL RLS STATUS ===';
    FOR r IN
        SELECT tablename,
               CASE WHEN rowsecurity THEN 'ENABLED ✓' ELSE 'DISABLED ✗' END as rls_status,
               rowsecurity
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename
    LOOP
        RAISE NOTICE 'Table: % - RLS: %', r.tablename, r.rls_status;
        IF r.rowsecurity THEN
            rls_count := rls_count + 1;
        ELSE
            no_rls_count := no_rls_count + 1;
        END IF;
    END LOOP;
    RAISE NOTICE '=========================';
    RAISE NOTICE 'Tables with RLS: %', rls_count;
    RAISE NOTICE 'Tables without RLS: %', no_rls_count;
    RAISE NOTICE '=========================';

    IF no_rls_count > 0 THEN
        RAISE NOTICE 'WARNING: Some tables still need RLS enabled!';
    ELSE
        RAISE NOTICE 'SUCCESS: All tables have RLS enabled!';
    END IF;
END $$;
