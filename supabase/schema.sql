-- Maya Allan Website Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/YOUR_PROJECT/sql)

-- Books table
CREATE TABLE IF NOT EXISTS public.books (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle1 TEXT,
  subtitle2 TEXT,
  subtitle3 TEXT,
  tags_csv TEXT,
  isbn TEXT,
  copyright TEXT,
  blurb TEXT,
  cover_url TEXT,
  back_cover_url TEXT,
  ebook_file_url TEXT,
  has_ebook BOOLEAN DEFAULT false,
  has_paperback BOOLEAN DEFAULT false,
  has_hardcover BOOLEAN DEFAULT false,
  ebook_price DECIMAL(10,2),
  paperback_price DECIMAL(10,2),
  hardcover_price DECIMAL(10,2),
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT false,
  is_coming_soon BOOLEAN DEFAULT false,
  allow_direct_sale BOOLEAN DEFAULT false,
  allow_retailer_sale BOOLEAN DEFAULT false,
  stripe_payment_link TEXT,
  paypal_payment_link TEXT,
  seo_title TEXT,
  seo_description TEXT,
  og_image_url TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Retailers table
CREATE TABLE IF NOT EXISTS public.retailers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Book-Retailer links (junction table)
CREATE TABLE IF NOT EXISTS public.book_retailer_links (
  id BIGSERIAL PRIMARY KEY,
  book_id BIGINT NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  retailer_id BIGINT NOT NULL REFERENCES public.retailers(id) ON DELETE CASCADE,
  url TEXT,
  format_type TEXT DEFAULT 'ebook', -- ebook, paperback, hardcover, audiobook
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(book_id, retailer_id, format_type)
);

-- Navigation items table
CREATE TABLE IF NOT EXISTS public.navigation_items (
  id BIGSERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  parent_id BIGINT REFERENCES public.navigation_items(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email subscribers table
CREATE TABLE IF NOT EXISTS public.email_subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  is_verified BOOLEAN DEFAULT false,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

-- Contact submissions table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id BIGSERIAL PRIMARY KEY,
  book_id BIGINT REFERENCES public.books(id),
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  payment_provider TEXT, -- stripe, paypal
  payment_id TEXT,
  status TEXT DEFAULT 'pending', -- pending, completed, failed, refunded
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Download tokens table (for secure ebook downloads after purchase)
CREATE TABLE IF NOT EXISTS public.download_tokens (
  id BIGSERIAL PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  order_id BIGINT REFERENCES public.orders(id),
  book_id BIGINT REFERENCES public.books(id),
  expires_at TIMESTAMPTZ NOT NULL,
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS public.events (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  location TEXT,
  event_date TIMESTAMPTZ,
  event_end_date TIMESTAMPTZ,
  image_url TEXT,
  registration_url TEXT,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media items table (audio, video, image)
CREATE TABLE IF NOT EXISTS public.media_items (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  kind TEXT NOT NULL DEFAULT 'audio', -- audio, video, image
  description TEXT,
  cover_url TEXT,
  file_url TEXT,
  external_url TEXT,
  duration TEXT,
  is_published BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_books_slug ON public.books(slug);
CREATE INDEX IF NOT EXISTS idx_books_is_published ON public.books(is_published);
CREATE INDEX IF NOT EXISTS idx_books_is_featured ON public.books(is_featured);
CREATE INDEX IF NOT EXISTS idx_book_retailer_links_book_id ON public.book_retailer_links(book_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_download_tokens_token ON public.download_tokens(token);

-- Enable Row Level Security (RLS) - optional but recommended
-- You can customize these policies based on your needs

-- For now, allow all operations via service role key (which bypasses RLS)
-- If you want to add RLS policies later, uncomment and customize:

-- ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public books are viewable by everyone" ON public.books
--   FOR SELECT USING (is_published = true AND is_visible = true);
