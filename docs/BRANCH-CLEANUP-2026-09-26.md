# Branch cleanup — 2026-09-26

This file records the branch consolidation decision so future work does not recreate competing implementation lines.

## Canonical active implementation

- `main` — production authority.
- `fix/author-first-publishing-identity-2026-09-26` — PR #98; the only active implementation PR for current author/book identity and SEO/AEO operations.

## Preserve temporarily

- `audiobook-approved-manifest` — audiobook review evidence and comparison artifacts. **Not approved yet**; Maya needs to review the audiobook again before any approval decision.
- `feat/analytics-visibility-2026-09-07` — blocked source branch. PR #57 is closed; retain only until its useful analytics pieces are selectively rebuilt with the two known attribution defects fixed.
- `work/site-visibility` — research archive. PR #58 is closed; contains September 24 crawl/ranking/book ecosystem/AI-search evidence and strategy. Do not merge as application code.

## Safe to delete now: merged or wholly superseded

- agent/claims-positioning
- agent/crisis-layer
- agent/system-audit-remediation-phase-1
- belief-inquiry-phase-1
- chore/cleanup-and-hygiene
- chore/p1-junk-cleanup-next-env
- chore/remove-remaining-rls-references
- chore/remove-rls-language-and-clean-stripe-docs
- chore/safe-backlog-cleanup-2026-09-06
- feat/p1-remove-stripe
- feat/p2-ai-safety-operational
- feat/p5a-upstash-rate-limits
- feat/p5b-resend-idempotency-silent-failure-alerts
- feat/p5d-ops-inspection-a11y-zod
- feat/resend-broadcasts-newsletter
- feat/seo-visibility-2026-09-26
- feat/visibility-command-center-2026-09-26
- feature/admin-password-reset
- fix/admin-auth-layout-split
- fix/admin-shell-auth-paths
- fix/audit-batch-1
- fix/book-page-machine-metadata
- fix/canonical-author-bio-2026-09-26
- fix/cookie-consent-cream-color
- fix/payment-flow-guards
- fix/paypal-expected-amount
- fix/pr-b-money-path-and-security
- fix/restore-admin-password-legacy-fallback
- fix/restore-author-bio-2026-09-26
- fix/site-health-critical
- fix/supabase-data-api-grants-2026-09-26
- fix/supabase-grants-followup-2026-09-26
- hardening/audit-blockers
- ops-2026-05-20-cleanup
- security/supabase-remove-public-exposure

These branches are either represented by merged PRs, wholly behind current main, explicitly abandoned/superseded, or contain old work replaced by later merged implementation.

## Safe to delete after PR #98 merges

- feat/visibility-engine-13-point-2026-09-26 — PR #64 closed as superseded after its useful Search Console automation was selectively moved into PR #98.
- fix/author-first-publishing-identity-2026-09-26 — delete after PR #98 is merged.

## Open PR policy

As of this cleanup:
- PR #98 is the only active implementation PR.
- PR #64 is closed as superseded.
- PR #58 is closed as research archive.
- PR #57 is closed as blocked source work.

Do not open a new visibility/SEO/AEO branch while PR #98 is active. Add compatible work to PR #98 or wait until it is merged and branch from fresh `main`.
