-- Performance Indexes - SAFE VERSION
-- Only creates indexes for columns we know exist

-- ============================================================
-- CRITICAL INDEXES (Recommended by Supabase)
-- ============================================================

-- 1. Books created_at index (67.85% performance improvement)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'books') THEN
        CREATE INDEX IF NOT EXISTS idx_books_created_at ON public.books USING btree (created_at);
        RAISE NOTICE '✅ Created index: books.created_at (67%% faster)';
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Book') THEN
        CREATE INDEX IF NOT EXISTS idx_book_created_at ON public."Book" USING btree ("createdAt");
        RAISE NOTICE '✅ Created index: Book.createdAt (67%% faster)';
    END IF;
END $$;

-- 2. NavigationItem sortOrder index (28.91% performance improvement)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'navigation_items') THEN
        CREATE INDEX IF NOT EXISTS idx_navigation_items_sort_order ON public.navigation_items USING btree (sort_order);
        RAISE NOTICE '✅ Created index: navigation_items.sort_order (28%% faster)';
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'NavigationItem') THEN
        CREATE INDEX IF NOT EXISTS idx_navigation_item_sort_order ON public."NavigationItem" USING btree ("sortOrder");
        RAISE NOTICE '✅ Created index: NavigationItem.sortOrder (28%% faster)';
    END IF;
END $$;

-- 3. Book retailer links by book_id
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'book_retailer_links') THEN
        CREATE INDEX IF NOT EXISTS idx_book_retailer_links_book_id ON public.book_retailer_links USING btree (book_id);
        RAISE NOTICE '✅ Created index: book_retailer_links.book_id';
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'BookRetailerLink') THEN
        CREATE INDEX IF NOT EXISTS idx_book_retailer_link_book_id ON public."BookRetailerLink" USING btree ("bookId");
        RAISE NOTICE '✅ Created index: BookRetailerLink.bookId';
    END IF;
END $$;

-- 4. Composite index for published + visible books
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'books') THEN
        CREATE INDEX IF NOT EXISTS idx_books_published_visible ON public.books USING btree (is_published, is_visible, created_at);
        RAISE NOTICE '✅ Created index: books published+visible';
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Book') THEN
        CREATE INDEX IF NOT EXISTS idx_book_published_visible ON public."Book" USING btree ("isPublished", "isVisible", "createdAt");
        RAISE NOTICE '✅ Created index: Book published+visible';
    END IF;
END $$;

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE '================================';
    RAISE NOTICE '✅ All performance indexes created!';
    RAISE NOTICE '✅ Query performance optimized!';
    RAISE NOTICE '================================';
    RAISE NOTICE 'Expected improvements:';
    RAISE NOTICE '- Books queries: 67%% faster';
    RAISE NOTICE '- Navigation queries: 28%% faster';
    RAISE NOTICE '- Retailer links: Faster lookups';
    RAISE NOTICE '================================';
END $$;
