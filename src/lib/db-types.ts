/**
 * postgres.js `types` config for the direct Postgres client (src/lib/db.ts).
 *
 * The pure value coercers live in src/lib/db-coerce.mjs (plain ESM) so the exact
 * functions are unit-testable without a TypeScript loader — see
 * tests/lib/db-coerce.test.mjs. This module only wires them into postgres.js.
 *
 * Money-safe: bigint -> number only when a safe integer (else the exact string);
 * numeric/decimal is deliberately NOT overridden (postgres.js returns it as a
 * string, so money never passes through a float); int2/int4 counters
 * (amount_cents, download_count, max_downloads, sort_order) are already numbers;
 * timestamps -> ISO-8601 strings.
 */
import { parseBigIntSafe, parseTimestampToIso } from "@/lib/db-coerce.mjs"

type PgTypeParser = {
  to: number
  from: number[]
  serialize: (v: unknown) => string
  parse: (v: string) => unknown
}

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
