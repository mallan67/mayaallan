-- Add audiobook support to books table
-- Run this in the Supabase SQL editor (Database -> SQL -> New query)
-- Safe to run multiple times — uses IF NOT EXISTS.

ALTER TABLE books
  ADD COLUMN IF NOT EXISTS has_audiobook BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE books
  ADD COLUMN IF NOT EXISTS audiobook_price NUMERIC(10, 2);

COMMENT ON COLUMN books.has_audiobook IS 'Whether this book is available as an audiobook (controls Audiobook tile + format pill on frontend).';
COMMENT ON COLUMN books.audiobook_price IS 'Optional price displayed on the Audiobook format tile. Leave NULL to show the tile without a price.';
