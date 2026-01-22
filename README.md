# mayaallan.com

Official Maya Allan author site + internal Admin CMS (books, media, events, navigation).

This repo is strict on purpose. If you ignore the structure rules, you will break routing, imports, or admin flows.

---

## Architecture (Authoritative)

- **Next.js** App Router
- **Database:** Supabase (Postgres) — single source of truth
- **File storage:** Vercel Blob
- **Payments:** Stripe + PayPal **URLs only** (payment links)
- **Auth:** iron-session (admin cookies)

> Prisma is NOT part of the runtime architecture. Any Prisma usage must be removed or rewritten to Supabase.

---

## The “Do Not Screw the Repo” Rules

These rules exist because mixing folder roots and import styles causes silent breakage.

1) **All runtime code lives under `src/` only**
   - If it’s imported by the app, it must be in `src/`.

2) **No duplicate code roots**
   - After migration there must NOT be both:
     - `lib/` and `src/lib/`
     - `components/` and `src/components/`

3) **Imports must use the alias**
   - Use `@/…` imports everywhere.
   - Do NOT use deep relative imports like `../../lib/...` across folders.

4) **Alias is the contract**
   - `@/*` must always point to the single code root (`./src/*`).
   - This is what makes refactors safe.

5) **Build gate**
   - Every structural change must pass:
     - `npm run build`
     - `npm run lint` (if configured)

---

## Folder Structure (What Goes Where)

### `src/` — the ONLY code root
Everything below is runtime code and can be imported by the app:

- `src/app/`
  - All Next.js routes (public + admin)
  - All API routes
  - Pages/layouts/templates
  - Examples:
    - `src/app/page.tsx`
    - `src/app/admin/books/page.tsx`
    - `src/app/api/admin/books/route.ts`
    - `src/app/api/upload/route.ts`

- `src/lib/`
  - Server utilities + shared logic
  - Session/auth helpers
  - Supabase server/admin clients
  - Validation helpers (Zod)
  - Examples:
    - `src/lib/session.ts`
    - `src/lib/supabaseAdmin.ts`
    - `src/lib/validators/*.ts`

- `src/components/`
  - Reusable UI components
  - UI primitives, admin UI, shared UI
  - Recommended structure:
    - `src/components/ui/*`
    - `src/components/admin/*`
    - `src/components/shared/*`

- `src/hooks/` (optional)
  - Shared React hooks only when needed
  - Example:
    - `src/hooks/useDebounce.ts`

### Repo Root (must stay at root)
These are not part of the runtime import tree:

- `public/`
  - Static assets served by Next.js
  - DO NOT move under `src/`

- `scripts/`
  - CLI scripts (seeding, checks, test utilities)
  - Must use Supabase (service role) if touching the DB
  - Must NOT use Prisma

- Root config files
  - `middleware.ts`
  - `tsconfig.json`
  - `next.config.*`
  - `.env*`

---

## TypeScript Alias (Required)

Single alias contract:

