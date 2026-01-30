-- Query to list all actual tables in your database
SELECT
  schemaname,
  tablename,
  CASE
    WHEN tablename ~ '^[A-Z]' THEN 'PascalCase'
    WHEN tablename ~ '_' THEN 'snake_case'
    ELSE 'lowercase'
  END as naming_convention,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = c.relname) as rls_policies_count,
  obj_description((schemaname||'.'||tablename)::regclass) as description
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Also check which tables have RLS enabled
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
