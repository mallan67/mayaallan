-- =============================================================================
-- Allow 'held' as a pending_paypal_orders.status value.
-- =============================================================================
-- A PayPal capture can return 2xx but NOT COMPLETED (PENDING — eCheck / risk
-- hold). The capture routes now mark such a row status='held' (instead of
-- 'consumed') so a later reload/retry returns the "processing" outcome rather
-- than wrongly reporting the purchase complete. The original constraint
-- (CHECK status IN ('pending','consumed','expired')) would REJECT that write,
-- so this migration extends it to include 'held'.
--
-- Idempotent + guarded: skips if the table doesn't exist, and re-running is a
-- no-op (it drops the current status CHECK and re-adds the extended one).
-- =============================================================================
do $$
declare
  cname text;
begin
  if to_regclass('public.pending_paypal_orders') is null then
    raise notice 'pending_paypal_orders does not exist — skipping (run the pr-b money-path SQL first).';
    return;
  end if;

  -- Drop any CHECK constraint currently governing `status` (the name can vary
  -- between deployments, so match on the constraint definition).
  for cname in
    select c.conname
    from pg_constraint c
    where c.conrelid = 'public.pending_paypal_orders'::regclass
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%status%'
  loop
    execute format('alter table public.pending_paypal_orders drop constraint %I', cname);
  end loop;

  alter table public.pending_paypal_orders
    add constraint pending_paypal_orders_status_check
    check (status in ('pending', 'consumed', 'expired', 'held'));
end;
$$;
