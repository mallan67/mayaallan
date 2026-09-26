-- The public author biography is canonical in src/lib/identity.ts (AUTHOR_BIO).
-- Remove the legacy database copy so no alternate biography remains stored.
UPDATE site_settings
SET author_bio = NULL
WHERE author_bio IS NOT NULL;
