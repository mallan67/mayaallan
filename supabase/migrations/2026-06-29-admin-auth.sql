-- =============================================================================
-- admin_auth — mutable storage for the single admin credential + reset tokens.
-- =============================================================================
-- Why this exists:
--   The admin password used to live ONLY in the ADMIN_PASSWORD_HASH env var,
--   which can't be changed without editing Vercel and redeploying. This table
--   moves the credential into the database so the operator can change it (and
--   recover from a lockout) entirely from the website via a "Forgot password?"
--   email flow — no terminal, no redeploy.
--
-- Single-row design:
--   There is exactly one admin. The CHECK (id = 1) constraint + the seed row
--   guarantee the table never holds more than one credential record.
--
-- Security model:
--   - password_hash is a bcrypt hash (never plaintext).
--   - reset_token_hash stores a SHA-256 of the reset token, NOT the token
--     itself — so a database leak never yields a usable reset link.
--   - RLS is enabled with NO policies. The app reaches this table only through
--     the Supabase service-role key (which bypasses RLS); enabling RLS with no
--     policies means that if the anon/publishable key is ever introduced, it
--     gets zero access to this table by default. Defense-in-depth for the most
--     sensitive row in the database.
-- =============================================================================

create table if not exists admin_auth (
  id                      integer primary key default 1,
  -- bcrypt hash of the current admin password. NULL until the first reset is
  -- completed; while NULL, login falls back to the ADMIN_PASSWORD_HASH env var.
  password_hash           text,
  -- SHA-256 hex of the active password-reset token (raw token is emailed, never
  -- stored). NULL when no reset is pending.
  reset_token_hash        text,
  -- When the active reset token stops being valid.
  reset_token_expires_at  timestamptz,
  -- Audit: when the last reset link was requested / last password change landed.
  reset_requested_at      timestamptz,
  updated_at              timestamptz not null default now(),
  constraint admin_auth_singleton check (id = 1)
);

-- Seed the single row so the app can always UPDATE id=1 (no INSERT race).
insert into admin_auth (id) values (1) on conflict (id) do nothing;

-- Deny-all RLS: no policies => only the service-role key (which bypasses RLS)
-- can touch this table. The app uses exactly that key server-side.
alter table admin_auth enable row level security;
