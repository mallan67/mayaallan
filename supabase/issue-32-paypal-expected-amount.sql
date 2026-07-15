-- issue #32: PayPal captured-amount verification.
--
-- Additive, idempotent migration. Adds the two nullable columns the checkout
-- route writes (the price + currency quoted to the buyer at checkout time) and
-- the webhook reads (to verify the captured amount before fulfilling an order).
--
-- Scope guarantee: this ONLY adds two nullable columns. It does NOT add or
-- alter RLS, policies, grants, permissions, roles, schemas, functions, or
-- defaults. Safe to run against production before deploying the code change.
BEGIN;

ALTER TABLE public.pending_paypal_orders
  ADD COLUMN IF NOT EXISTS expected_amount NUMERIC(12,2);

ALTER TABLE public.pending_paypal_orders
  ADD COLUMN IF NOT EXISTS expected_currency TEXT;

COMMIT;
