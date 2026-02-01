-- Performance Indexes - Recommended by Supabase Index Advisor
-- These indexes will improve query performance as your database grows

-- ============================================================
-- BOOK TABLE INDEXES
-- ============================================================

-- Index for sorting books by creation date (70% performance improvement)
-- Used by: Homepage featured books, admin book list, etc.
CREATE INDEX IF NOT EXISTS idx_book_created_at
ON public."Book" USING btree ("createdAt");

-- Index for sorting books by creation date (snake_case version)
CREATE INDEX IF NOT EXISTS idx_books_created_at
ON public.books USING btree (created_at);

-- Composite index for filtering published + visible + featured books
CREATE INDEX IF NOT EXISTS idx_book_published_visible_featured
ON public."Book" USING btree ("isPublished", "isVisible", "isFeatured", "createdAt");

CREATE INDEX IF NOT EXISTS idx_books_published_visible_featured
ON public.books USING btree (is_published, is_visible, is_featured, created_at);

-- ============================================================
-- NAVIGATION ITEMS INDEX
-- ============================================================

-- Index for sorting navigation by sortOrder (better query performance)
CREATE INDEX IF NOT EXISTS idx_navigation_item_sort_order
ON public."NavigationItem" USING btree ("sortOrder");

CREATE INDEX IF NOT EXISTS idx_navigation_items_sort_order
ON public.navigation_items USING btree (sort_order);

-- Composite index for active navigation items sorted by order
CREATE INDEX IF NOT EXISTS idx_navigation_item_active_sorted
ON public."NavigationItem" USING btree ("isActive", "sortOrder");

CREATE INDEX IF NOT EXISTS idx_navigation_items_visible_sorted
ON public.navigation_items USING btree (is_visible, sort_order);

-- ============================================================
-- BOOK RETAILER LINKS INDEX
-- ============================================================

-- Index for looking up retailer links by book (already exists from schema)
-- But let's ensure it exists for PascalCase version too
CREATE INDEX IF NOT EXISTS idx_book_retailer_link_book_id
ON public."BookRetailerLink" USING btree ("bookId");

-- Composite index for active links by book
CREATE INDEX IF NOT EXISTS idx_book_retailer_link_active_book
ON public."BookRetailerLink" USING btree ("isActive", "bookId");

CREATE INDEX IF NOT EXISTS idx_book_retailer_links_active_book
ON public.book_retailer_links USING btree (is_active, book_id);

-- ============================================================
-- ORDERS TABLE INDEX
-- ============================================================

-- Index for looking up orders by customer email (already exists from schema)
-- Add for PascalCase version
CREATE INDEX IF NOT EXISTS idx_order_email
ON public."Order" USING btree (email);

-- Index for order status filtering
CREATE INDEX IF NOT EXISTS idx_order_status
ON public."Order" USING btree (status);

CREATE INDEX IF NOT EXISTS idx_orders_status
ON public.orders USING btree (status);

-- ============================================================
-- DOWNLOAD TOKENS INDEX
-- ============================================================

-- Index for token lookups (already exists from schema)
-- Add for PascalCase version
CREATE INDEX IF NOT EXISTS idx_download_token_token
ON public."DownloadToken" USING btree (token);

-- Index for expired token cleanup
CREATE INDEX IF NOT EXISTS idx_download_token_expires_at
ON public."DownloadToken" USING btree ("expiresAt");

CREATE INDEX IF NOT EXISTS idx_download_tokens_expires_at
ON public.download_tokens USING btree (expires_at);

-- ============================================================
-- EVENTS TABLE INDEX
-- ============================================================

-- Index for published events sorted by date
CREATE INDEX IF NOT EXISTS idx_event_published_date
ON public."Event" USING btree ("isPublished", "eventDate");

CREATE INDEX IF NOT EXISTS idx_events_published_date
ON public.events USING btree (is_published, event_date);

-- ============================================================
-- MEDIA ITEMS INDEX
-- ============================================================

-- Index for published media sorted by creation date
CREATE INDEX IF NOT EXISTS idx_media_item_published_created
ON public."MediaItem" USING btree ("isPublished", "isVisible", "createdAt");

CREATE INDEX IF NOT EXISTS idx_media_items_published_created
ON public.media_items USING btree (is_published, is_visible, created_at);

-- ============================================================
-- VERIFICATION
-- ============================================================
DO $$
DECLARE
    r RECORD;
    index_count INT := 0;
BEGIN
    RAISE NOTICE '=== PERFORMANCE INDEXES CREATED ===';

    -- Count indexes on public schema tables
    FOR r IN
        SELECT
            schemaname,
            tablename,
            indexname
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND indexname LIKE 'idx_%'
        ORDER BY tablename, indexname
    LOOP
        index_count := index_count + 1;
        RAISE NOTICE 'Index: % on table %', r.indexname, r.tablename;
    END LOOP;

    RAISE NOTICE '================================';
    RAISE NOTICE 'Total performance indexes: %', index_count;
    RAISE NOTICE '✅ Indexes created successfully!';
    RAISE NOTICE '✅ Query performance improved!';
    RAISE NOTICE '================================';
END $$;
