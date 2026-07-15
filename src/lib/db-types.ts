/**
 * Value coercers for the direct Postgres client (src/lib/db.ts).
 *
 * Kept in a separate, dependency-free module (no "server-only") so the logic
 * is unit-testable — see tests/lib/db-types.test.mjs.
 *
 * Money-safe design:
 *  - bigint (int8): parse to a JS number ONLY when it round-trips as a safe
 *    integer (|value| <= Number.MAX_SAFE_INTEGER); otherwise keep the exact
 *    string. Every id / foreign key in this schema is a small value, so the
 *    API/UI number contract is preserved, while a hypothetical out-of-range id
 *    can never silently lose precision.
 *  - numeric / decimal: intentionally NOT overridden here — postgres.js returns
 *    them as strings. Money must never pass through binary floating point.
 *    Arithmetic is done in SQL (exact `numeric`) or on the integer
 *    `amount_cents` column; a numeric string is only ever `Number(...)`-ed for
 *    a single display value, never accumulated.
 *  - int2 / int4 (smallint, integer): postgres.js already returns these as JS
 *    numbers, so bounded counters like `amount_cents`, `download_count`,
 *    `max_downloads`, and `sort_order` need no override.
 *  - timestamp / timestamptz: normalized to an ISO-8601 string, matching the
 *    contract the app was written against under PostgREST/supabase-js.
 */

/** int8 → number when safe, else the original exact string. */
export function parseBigIntSafe(raw: string): number | string {
  const n = Number(raw)
  return Number.isSafeInteger(n) ? n : raw
}

/** timestamp/timestamptz wire value → ISO-8601 string. */
export function parseTimestampToIso(raw: string): string {
  return new Date(raw).toISOString()
}

type PgTypeParser = {
  to: number
  from: number[]
  serialize: (v: unknown) => string
  parse: (v: string) => unknown
}

/**
 * postgres.js `types` config. Only int8 and timestamps are overridden; numeric
 * is deliberately left as postgres.js's default (string) so money stays exact.
 */
export const pgTypes: Record<string, PgTypeParser> = {
  bigintSafe: {
    to: 20,
    from: [20], // int8 / bigint
    serialize: (v) => String(v),
    parse: parseBigIntSafe,
  },
  timestampIso: {
    to: 1184,
    from: [1114, 1184], // timestamp, timestamptz
    serialize: (v) => String(v),
    parse: parseTimestampToIso,
  },
}
