/**
 * GET /api/admin/db-inspect
 *
 * Read-only DB inspection report for the Event/SiteSettings table drift.
 *
 * Background:
 *   `schema.sql` defines snake_case `events` and `site_settings`, but the
 *   code reads from PascalCase `"Event"` and `"SiteSettings"` (via the
 *   `Tables` constant in src/lib/supabaseAdmin.ts). It's not clear which
 *   side has the live production rows without inspecting the database.
 *
 *   This endpoint probes both sides via the supabase admin client, captures
 *   row counts + sample columns from whatever exists, and reports a
 *   recommendation. NOTHING IS WRITTEN. No migration is executed. The
 *   operator runs this once, reviews the JSON, then plans the actual
 *   migration in a follow-up PR.
 *
 * Auth: admin session only. No same-origin CSRF guard because this is a
 * read-only GET — the guard would block direct curl / raw-JSON access by
 * the operator (no Origin header) without adding any real protection
 * (no state mutation possible).
 *
 * Caching: `dynamic = "force-dynamic"` — every call hits the live DB so the
 * snapshot is always current. No client-side cache.
 */

import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type TableProbe = {
  /** Identifier passed to `.from(...)`. PascalCase needs no quoting here
   * because supabase-js handles it; snake_case is just the column name. */
  tableName: string
  /** Was the table reachable via PostgREST? */
  exists: boolean
  /** Row count returned by `count: "exact"`. Null when exists === false. */
  rowCount: number | null
  /** Column names sampled from the first row (if any). Null when table
   * exists but is empty, or when exists === false. */
  sampleColumns: string[] | null
  /** PostgREST/Postgres error code surfaced when probe failed. Most useful
   * value is `PGRST205` (no row found for view) or `42P01` (table missing). */
  errorCode: string | null
  /** Sanitized error message — strip any row content that PostgREST might
   * have echoed back. We never want to leak real data through the report. */
  errorMessage: string | null
}

async function probeTable(name: string): Promise<TableProbe> {
  try {
    const { count, data, error } = await supabaseAdmin
      .from(name)
      .select("*", { count: "exact" })
      .limit(1)

    if (error) {
      return {
        tableName: name,
        exists: false,
        rowCount: null,
        sampleColumns: null,
        errorCode: error.code ?? null,
        errorMessage: error.message?.slice(0, 200) ?? "Unknown error",
      }
    }

    const sampleColumns =
      Array.isArray(data) && data.length > 0 ? Object.keys(data[0]).sort() : null

    return {
      tableName: name,
      exists: true,
      rowCount: count ?? 0,
      sampleColumns,
      errorCode: null,
      errorMessage: null,
    }
  } catch (err) {
    return {
      tableName: name,
      exists: false,
      rowCount: null,
      sampleColumns: null,
      errorCode: null,
      errorMessage: err instanceof Error ? err.message.slice(0, 200) : String(err).slice(0, 200),
    }
  }
}

type Pair = {
  /** Friendly label for the report header. */
  label: string
  pascal: TableProbe
  snake: TableProbe
  /** Column-name diff. */
  onlyInPascal: string[]
  onlyInSnake: string[]
  inBoth: string[]
  /** Human-readable recommendation from the probe results. */
  recommendation: string
}

function diffColumns(pascal: TableProbe, snake: TableProbe): Pick<Pair, "onlyInPascal" | "onlyInSnake" | "inBoth"> {
  const pCols = new Set(pascal.sampleColumns ?? [])
  const sCols = new Set(snake.sampleColumns ?? [])
  return {
    onlyInPascal: [...pCols].filter((c) => !sCols.has(c)).sort(),
    onlyInSnake: [...sCols].filter((c) => !pCols.has(c)).sort(),
    inBoth: [...pCols].filter((c) => sCols.has(c)).sort(),
  }
}

function recommend(pascal: TableProbe, snake: TableProbe): string {
  // Rule of thumb: whichever side has rows is "production data."
  const pHasData = pascal.exists && (pascal.rowCount ?? 0) > 0
  const sHasData = snake.exists && (snake.rowCount ?? 0) > 0

  if (pHasData && sHasData) {
    return (
      "BOTH SIDES HAVE ROWS. Manual merge required — pick one side as the " +
      "source of truth, copy the missing rows from the other side preserving " +
      "PKs/timestamps, then update Tables[*] in src/lib/supabaseAdmin.ts to " +
      "point at the surviving table. Do not drop the loser until the code " +
      "reads + writes are confirmed against the new target."
    )
  }
  if (pHasData && !sHasData) {
    return (
      "PRODUCTION DATA LIVES IN THE PASCALCASE TABLE. The snake_case table " +
      "is empty (or absent). Migration path: copy all rows from the PascalCase " +
      "table into snake_case (matching column names where they differ — see " +
      "onlyInPascal/onlyInSnake), then flip Tables[*] to the snake_case name. " +
      "Hold the drop of the PascalCase table until production has been running " +
      "on the new target for at least one release cycle."
    )
  }
  if (!pHasData && sHasData) {
    return (
      "PRODUCTION DATA ALREADY LIVES IN THE SNAKE_CASE TABLE. The PascalCase " +
      "table is empty (or absent) — code is reading from the wrong place, which " +
      "would explain any 'admin shows no data' bugs. Flip Tables[*] in " +
      "src/lib/supabaseAdmin.ts to the snake_case name. Once verified in " +
      "production, drop the PascalCase orphan."
    )
  }
  if (!pHasData && !sHasData) {
    return (
      "NEITHER SIDE HAS ROWS. Pick the snake_case name as canonical, drop the " +
      "PascalCase orphan if it exists. Confirm absence of foreign keys / RLS " +
      "policies still referencing the old name before dropping."
    )
  }
  return "Unreachable."
}

async function inspectPair(label: string, pascalName: string, snakeName: string): Promise<Pair> {
  const [pascal, snake] = await Promise.all([probeTable(pascalName), probeTable(snakeName)])
  const cols = diffColumns(pascal, snake)
  return {
    label,
    pascal,
    snake,
    ...cols,
    recommendation: recommend(pascal, snake),
  }
}

export async function GET() {
  // No CSRF guard: read-only GET handlers don't need same-origin
  // protection (the helper's own docstring notes this), and the guard
  // would block direct curl / raw-JSON access by the operator with no
  // Origin header. Admin auth via isAuthenticated() is the access gate.
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [events, siteSettings] = await Promise.all([
    inspectPair("events", "Event", "events"),
    inspectPair("site_settings", "SiteSettings", "site_settings"),
  ])

  // Specific visibility-check: surface every event currently visible on
  // the live `Event` table with its date + keepVisibleAfterEnd value.
  // Operator request — verifying why the Jan 15 event is still showing
  // on the live homepage / /events / sitemap surfaces post-PR-#22 (P5C).
  let visibleEvents: Array<{
    slug: string
    startsAt: string | null
    endsAt: string | null
    keepVisibleAfterEnd: boolean | null
    isVisible: boolean | null
    isPast: boolean | null
  }> | null = null
  let visibleEventsError: string | null = null
  try {
    const { data, error } = await supabaseAdmin
      .from("Event")
      .select("slug, startsAt, endsAt, keepVisibleAfterEnd, isVisible")
      .eq("isVisible", true)
      .order("startsAt", { ascending: true })
    if (error) {
      visibleEventsError = error.message?.slice(0, 200) ?? "Unknown error"
    } else {
      const nowMs = Date.now()
      visibleEvents = (data ?? []).map((row: any) => ({
        slug: row.slug,
        startsAt: row.startsAt ?? null,
        endsAt: row.endsAt ?? null,
        keepVisibleAfterEnd: row.keepVisibleAfterEnd ?? null,
        isVisible: row.isVisible ?? null,
        isPast: row.startsAt ? new Date(row.startsAt).getTime() < nowMs : null,
      }))
    }
  } catch (err) {
    visibleEventsError = err instanceof Error ? err.message.slice(0, 200) : String(err).slice(0, 200)
  }

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      note:
        "Read-only inspection. No rows written, no schema modified. Re-run any " +
        "time to refresh. Recommendation column is heuristic; verify by reading " +
        "rowCount + sampleColumns yourself before planning the migration.",
      pairs: [events, siteSettings],
      visibleEvents,
      visibleEventsError,
    },
    { headers: { "Cache-Control": "no-store" } },
  )
}
