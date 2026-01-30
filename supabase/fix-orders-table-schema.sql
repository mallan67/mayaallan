-- Fix orders table schema to match the application code
-- The webhook handlers use different column names than the original schema

-- Add missing columns
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stripe_payment_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS format_type TEXT DEFAULT 'ebook';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2);

-- Migrate data from old columns to new columns (if they exist)
UPDATE public.orders
SET email = customer_email
WHERE email IS NULL AND customer_email IS NOT NULL;

UPDATE public.orders
SET stripe_payment_id = payment_id
WHERE stripe_payment_id IS NULL AND payment_id IS NOT NULL;

UPDATE public.orders
SET amount = amount_cents::decimal / 100
WHERE amount IS NULL AND amount_cents IS NOT NULL;

-- Note: We're keeping the old columns for backward compatibility
-- If you want to remove them after verifying everything works:
-- ALTER TABLE public.orders DROP COLUMN IF EXISTS customer_email;
-- ALTER TABLE public.orders DROP COLUMN IF EXISTS payment_id;
-- ALTER TABLE public.orders DROP COLUMN IF EXISTS amount_cents;

-- Add missing column to download_tokens
ALTER TABLE public.download_tokens ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ;

-- Create index for stripe_session_id (used for idempotency checks in webhooks)
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON public.orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON public.orders(email);
