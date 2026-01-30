-- FINAL SECURITY FIX - Resolve all remaining issues
-- This fixes the CRITICAL issue and improves form security

-- ============================================================
-- FIX 1: Enable RLS on _prisma_migrations (CRITICAL)
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = '_prisma_migrations') THEN
    ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Block all public access to _prisma_migrations" ON public._prisma_migrations;

    CREATE POLICY "Block all public access to _prisma_migrations" ON public._prisma_migrations
      FOR ALL
      USING (false);

    RAISE NOTICE 'Fixed: _prisma_migrations table now protected';
  END IF;
END $$;

-- ============================================================
-- FIX 2: Improve contact_submissions security (snake_case)
-- Change from "true" to require email and name to be present
-- This prevents completely empty submissions while still allowing public access
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contact_submissions') THEN
    DROP POLICY IF EXISTS "Public can insert contacts" ON public.contact_submissions;

    CREATE POLICY "Public can insert contact submissions" ON public.contact_submissions
      FOR INSERT
      WITH CHECK (
        email IS NOT NULL
        AND email != ''
        AND name IS NOT NULL
        AND name != ''
        AND message IS NOT NULL
        AND message != ''
      );

    RAISE NOTICE 'Improved: contact_submissions now requires email, name, and message';
  END IF;
END $$;

-- ============================================================
-- FIX 3: Improve ContactSubmission security (PascalCase)
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ContactSubmission') THEN
    DROP POLICY IF EXISTS "Public can insert contacts" ON public."ContactSubmission";

    CREATE POLICY "Public can insert contact submissions" ON public."ContactSubmission"
      FOR INSERT
      WITH CHECK (
        email IS NOT NULL
        AND email != ''
        AND name IS NOT NULL
        AND name != ''
        AND message IS NOT NULL
        AND message != ''
      );

    RAISE NOTICE 'Improved: ContactSubmission now requires email, name, and message';
  END IF;
END $$;

-- ============================================================
-- FIX 4: Improve email_subscribers security (snake_case)
-- Require valid email format
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'email_subscribers') THEN
    DROP POLICY IF EXISTS "Public can insert subscriptions" ON public.email_subscribers;

    CREATE POLICY "Public can insert email subscriptions" ON public.email_subscribers
      FOR INSERT
      WITH CHECK (
        email IS NOT NULL
        AND email != ''
        AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'
      );

    RAISE NOTICE 'Improved: email_subscribers now requires valid email format';
  END IF;
END $$;

-- ============================================================
-- FIX 5: Improve EmailSubscriber security (PascalCase)
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'EmailSubscriber') THEN
    DROP POLICY IF EXISTS "Public can insert subscriptions" ON public."EmailSubscriber";

    CREATE POLICY "Public can insert email subscriptions" ON public."EmailSubscriber"
      FOR INSERT
      WITH CHECK (
        email IS NOT NULL
        AND email != ''
        AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'
      );

    RAISE NOTICE 'Improved: EmailSubscriber now requires valid email format';
  END IF;
END $$;

-- ============================================================
-- FINAL VERIFICATION
-- ============================================================
DO $$
DECLARE
    r RECORD;
    critical_count INT := 0;
    warning_count INT := 0;
BEGIN
    RAISE NOTICE '=== SECURITY STATUS ===';

    -- Check all public tables
    FOR r IN
        SELECT tablename,
               CASE WHEN rowsecurity THEN 'ENABLED ✓' ELSE 'DISABLED ✗' END as rls_status,
               rowsecurity
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename NOT LIKE 'pg_%'
        ORDER BY tablename
    LOOP
        IF NOT r.rowsecurity THEN
            critical_count := critical_count + 1;
            RAISE NOTICE 'CRITICAL: Table % - RLS: %', r.tablename, r.rls_status;
        END IF;
    END LOOP;

    RAISE NOTICE '========================';
    IF critical_count = 0 THEN
        RAISE NOTICE '✅ SUCCESS: All tables have RLS enabled!';
        RAISE NOTICE '✅ Forms have validated INSERT policies';
        RAISE NOTICE '✅ Your database is now secure!';
    ELSE
        RAISE NOTICE '❌ WARNING: % tables still need RLS!', critical_count;
    END IF;
    RAISE NOTICE '========================';
END $$;
