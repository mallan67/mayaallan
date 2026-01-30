-- Fix RLS for _prisma_migrations table
-- This is a Prisma system table that should block all public access

-- Enable RLS on Prisma migrations table
ALTER TABLE IF EXISTS public._prisma_migrations ENABLE ROW LEVEL SECURITY;

-- Block all public access (only service role can access)
DROP POLICY IF EXISTS "Block all public access to _prisma_migrations" ON public._prisma_migrations;

CREATE POLICY "Block all public access to _prisma_migrations" ON public._prisma_migrations
  FOR ALL
  USING (false);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'RLS enabled on _prisma_migrations table';
  RAISE NOTICE 'All security issues should now be resolved!';
END $$;
