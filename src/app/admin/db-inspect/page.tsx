/**
 * Admin UI for the read-only DB inspection at /api/admin/db-inspect.
 *
 * Renders the probe results as a readable report — row counts, column lists,
 * column diffs between PascalCase and snake_case, and a heuristic
 * recommendation per pair. No buttons, no actions — the operator reads,
 * decides, and plans the migration in a follow-up PR.
 *
 * Auth is enforced by the parent admin layout's AdminAuthGuard; the route
 * itself ALSO checks via /api/admin/db-inspect (defense in depth).
 */
import Link from "next/link"
import { headers } from "next/headers"
import { isAuthenticated } from "@/lib/session"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

type TableProbe = {
  tableName: string
  exists: boolean
  rowCount: number | null
  sampleColumns: string[] | null
  errorCode: string | null
  errorMessage: string | null
}

type Pair = {
  label: string
  pascal: TableProbe
  snake: TableProbe
  onlyInPascal: string[]
  onlyInSnake: string[]
  inBoth: string[]
  recommendation: string
}

type VisibleEventRow = {
  slug: string
  startsAt: string | null
  endsAt: string | null
  keepVisibleAfterEnd: boolean | null
  isVisible: boolean | null
  isPast: boolean | null
}

type Report = {
  generatedAt: string
  note: string
  pairs: Pair[]
  visibleEvents: VisibleEventRow[] | null
  visibleEventsError: string | null
}

/**
 * Server-side probe — same logic as /api/admin/db-inspect, but inlined so
 * this server component doesn't need to make a self-fetch (and so it works
 * during ISR / build). Read-only.
 */
async function probeTable(name: string): Promise<TableProbe> {
  try {
    // Direct Postgres probe. A missing relation throws (SQLSTATE 42P01),
    // caught below — how the report now detects a dropped/absent table.
    const rows = await sql`select * from ${sql(name)} limit 1`
    const [countRow] = await sql`select count(*)::int as count from ${sql(name)}`
    return {
      tableName: name,
      exists: true,
      rowCount: countRow?.count ?? 0,
      sampleColumns:
        rows.length > 0 ? Object.keys(rows[0]).sort() : null,
      errorCode: null,
      errorMessage: null,
    }
  } catch (err) {
    return {
      tableName: name,
      exists: false,
      rowCount: null,
      sampleColumns: null,
      errorCode: (err as { code?: string })?.code ?? null,
      errorMessage:
        err instanceof Error ? err.message.slice(0, 200) : String(err).slice(0, 200),
    }
  }
}

function diffColumns(pascal: TableProbe, snake: TableProbe) {
  const p = new Set(pascal.sampleColumns ?? [])
  const s = new Set(snake.sampleColumns ?? [])
  return {
    onlyInPascal: [...p].filter((c) => !s.has(c)).sort(),
    onlyInSnake: [...s].filter((c) => !p.has(c)).sort(),
    inBoth: [...p].filter((c) => s.has(c)).sort(),
  }
}

function recommend(pascal: TableProbe, snake: TableProbe): string {
  const pHasData = pascal.exists && (pascal.rowCount ?? 0) > 0
  const sHasData = snake.exists && (snake.rowCount ?? 0) > 0
  if (pHasData && sHasData)
    return "BOTH SIDES HAVE ROWS. Manual merge required."
  if (pHasData && !sHasData)
    return "Production data lives in the PascalCase table. Migrate to snake_case."
  if (!pHasData && sHasData)
    return "Production data lives in the snake_case table. Flip the Tables constant to snake_case."
  return "Neither side has rows. Pick snake_case as canonical and drop the PascalCase orphan if present."
}

async function inspectPair(label: string, pascalName: string, snakeName: string): Promise<Pair> {
  const [pascal, snake] = await Promise.all([probeTable(pascalName), probeTable(snakeName)])
  return {
    label,
    pascal,
    snake,
    ...diffColumns(pascal, snake),
    recommendation: recommend(pascal, snake),
  }
}

async function getVisibleEventsCheck(): Promise<{
  rows: VisibleEventRow[] | null
  error: string | null
}> {
  // Surfaces every event the public filter would currently allow through.
  // Reads from the canonical snake_case `events` table (post-migration)
  // so the report reflects what the live site actually shows. Output
  // stays camelCase for the existing UI consumer below.
  try {
    const data = await sql`
      select slug, starts_at, ends_at, keep_visible_after_end, is_visible
      from events
      where is_visible = true
      order by starts_at asc
    `
    const nowMs = Date.now()
    const rows: VisibleEventRow[] = data.map((row: any) => ({
      slug: row.slug,
      startsAt: row.starts_at ?? null,
      endsAt: row.ends_at ?? null,
      keepVisibleAfterEnd: row.keep_visible_after_end ?? null,
      isVisible: row.is_visible ?? null,
      isPast: row.starts_at ? new Date(row.starts_at).getTime() < nowMs : null,
    }))
    return { rows, error: null }
  } catch (err) {
    return {
      rows: null,
      error: err instanceof Error ? err.message.slice(0, 200) : String(err).slice(0, 200),
    }
  }
}

async function getReport(): Promise<Report> {
  const [events, siteSettings, visibleCheck] = await Promise.all([
    inspectPair("events", "Event", "events"),
    inspectPair("site_settings", "SiteSettings", "site_settings"),
    getVisibleEventsCheck(),
  ])
  return {
    generatedAt: new Date().toISOString(),
    note:
      "Read-only probe. No data modified. Recommendation is heuristic — verify rowCount + sampleColumns yourself before acting.",
    pairs: [events, siteSettings],
    visibleEvents: visibleCheck.rows,
    visibleEventsError: visibleCheck.error,
  }
}

function TableProbeCard({ probe, kind }: { probe: TableProbe; kind: "PascalCase" | "snake_case" }) {
  return (
    <div className="border border-slate-300 rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <code className="text-sm font-semibold">
          {kind === "PascalCase" ? `"${probe.tableName}"` : probe.tableName}
        </code>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            probe.exists
              ? "bg-emerald-100 text-emerald-800"
              : "bg-rose-100 text-rose-800"
          }`}
        >
          {probe.exists ? "exists" : "missing / unreachable"}
        </span>
      </div>
      {probe.exists ? (
        <>
          <div className="text-sm">
            <strong>Row count:</strong> {probe.rowCount?.toLocaleString() ?? "?"}
          </div>
          <div className="text-sm mt-2">
            <strong>Sample columns ({probe.sampleColumns?.length ?? 0}):</strong>
            {probe.sampleColumns && probe.sampleColumns.length > 0 ? (
              <ul className="mt-1 text-xs font-mono text-slate-700 grid grid-cols-2 gap-x-3">
                {probe.sampleColumns.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            ) : (
              <span className="text-slate-500 italic">
                {" "}
                (table empty — no sample row available)
              </span>
            )}
          </div>
        </>
      ) : (
        <div className="text-sm text-slate-600">
          {probe.errorCode && (
            <div>
              <strong>Error code:</strong>{" "}
              <code className="text-xs">{probe.errorCode}</code>
            </div>
          )}
          {probe.errorMessage && (
            <div>
              <strong>Message:</strong>{" "}
              <span className="text-xs">{probe.errorMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ColumnDiff({ pair }: { pair: Pair }) {
  const hasAny = pair.onlyInPascal.length + pair.onlyInSnake.length + pair.inBoth.length > 0
  if (!hasAny) {
    return (
      <p className="text-sm text-slate-600 italic">
        Both tables empty / unreachable — no column diff available.
      </p>
    )
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
      <div>
        <strong className="block mb-1">In both ({pair.inBoth.length}):</strong>
        {pair.inBoth.length > 0 ? (
          <ul className="text-xs font-mono text-emerald-800">
            {pair.inBoth.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        ) : (
          <span className="text-xs text-slate-500 italic">(none)</span>
        )}
      </div>
      <div>
        <strong className="block mb-1">
          Only in PascalCase ({pair.onlyInPascal.length}):
        </strong>
        {pair.onlyInPascal.length > 0 ? (
          <ul className="text-xs font-mono text-amber-800">
            {pair.onlyInPascal.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        ) : (
          <span className="text-xs text-slate-500 italic">(none)</span>
        )}
      </div>
      <div>
        <strong className="block mb-1">
          Only in snake_case ({pair.onlyInSnake.length}):
        </strong>
        {pair.onlyInSnake.length > 0 ? (
          <ul className="text-xs font-mono text-amber-800">
            {pair.onlyInSnake.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        ) : (
          <span className="text-xs text-slate-500 italic">(none)</span>
        )}
      </div>
    </div>
  )
}

export default async function DbInspectPage() {
  // Defense-in-depth: AdminAuthGuard at the layout level enforces this, but a
  // direct page hit during a layout glitch (or future refactor that strips the
  // guard) must still 401-equivalent rather than expose schema info.
  if (!(await isAuthenticated())) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-sm text-rose-700">
          Not authenticated. <Link href="/admin/login" className="underline">Sign in</Link>.
        </p>
      </div>
    )
  }

  // Touch headers() so the page is fully dynamic (no static optimization).
  await headers()
  const report = await getReport()

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">DB Inspection — Table Reconciliation</h1>
        <p className="text-sm text-slate-600 mt-2">
          Read-only snapshot of the live PascalCase vs snake_case table pairs.
          No rows are modified. Refresh the page to re-probe.
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Generated: <code>{report.generatedAt}</code>
        </p>
        <p className="text-xs text-slate-500 mt-1 italic">{report.note}</p>
      </div>

      <div className="space-y-8">
        {report.pairs.map((pair) => (
          <section
            key={pair.label}
            className="border-2 border-slate-300 rounded-xl p-5 bg-slate-50"
          >
            <h2 className="text-lg font-semibold mb-4">
              Pair: <code>{pair.pascal.tableName}</code> vs <code>{pair.snake.tableName}</code>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <TableProbeCard probe={pair.pascal} kind="PascalCase" />
              <TableProbeCard probe={pair.snake} kind="snake_case" />
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">Column diff</h3>
              <ColumnDiff pair={pair} />
            </div>

            <div className="bg-amber-50 border border-amber-300 rounded-lg p-3">
              <strong className="text-sm">Recommendation:</strong>
              <p className="text-sm text-slate-800 mt-1">{pair.recommendation}</p>
            </div>
          </section>
        ))}
      </div>

      <section className="mt-8 border-2 border-slate-300 rounded-xl p-5 bg-slate-50">
        <h2 className="text-lg font-semibold mb-4">
          Visible-events check (why is the Jan 15 event still on the homepage?)
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          Every row from canonical <code>events</code> with <code>is_visible = true</code>, with
          <code> keep_visible_after_end</code> + computed <code>isPast</code>. Past + pinned
          rows are the ones the PR-#5C filter intentionally keeps visible.
        </p>
        {report.visibleEventsError ? (
          <div className="bg-rose-50 border border-rose-300 rounded p-3 text-sm text-rose-800">
            Error fetching visible events: {report.visibleEventsError}
          </div>
        ) : !report.visibleEvents || report.visibleEvents.length === 0 ? (
          <p className="text-sm text-slate-600 italic">No visible events.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 text-left">
                  <th className="py-2 pr-3">slug</th>
                  <th className="py-2 pr-3">startsAt</th>
                  <th className="py-2 pr-3">isPast?</th>
                  <th className="py-2 pr-3">keepVisibleAfterEnd</th>
                  <th className="py-2">verdict</th>
                </tr>
              </thead>
              <tbody>
                {report.visibleEvents.map((ev) => {
                  // Verdict logic mirrors src/lib/events-visibility.ts.
                  // If isPast and NOT pinned → filter bug (shouldn't appear).
                  // If isPast and pinned → intentional pin (working as designed).
                  // If future → upcoming (working as designed).
                  let verdict: string
                  let color: string
                  if (ev.isPast === null) {
                    verdict = "no startsAt"
                    color = "text-slate-500"
                  } else if (ev.isPast && ev.keepVisibleAfterEnd === true) {
                    verdict = "PINNED — visible by design"
                    color = "text-amber-800"
                  } else if (ev.isPast && !ev.keepVisibleAfterEnd) {
                    verdict = "FILTER BUG — past + not pinned, should NOT be in upcoming"
                    color = "text-rose-800 font-semibold"
                  } else {
                    verdict = "upcoming"
                    color = "text-emerald-800"
                  }
                  return (
                    <tr key={ev.slug} className="border-b border-slate-200">
                      <td className="py-2 pr-3 font-mono text-xs">{ev.slug}</td>
                      <td className="py-2 pr-3 font-mono text-xs">{ev.startsAt ?? "?"}</td>
                      <td className="py-2 pr-3">{ev.isPast === null ? "?" : ev.isPast ? "yes" : "no"}</td>
                      <td className="py-2 pr-3">
                        {ev.keepVisibleAfterEnd === null ? "(null)" : String(ev.keepVisibleAfterEnd)}
                      </td>
                      <td className={`py-2 ${color}`}>{verdict}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="mt-8 text-xs text-slate-500">
        Raw JSON also available at{" "}
        <code>
          <a href="/api/admin/db-inspect" className="underline">
            /api/admin/db-inspect
          </a>
        </code>
        .
      </div>
    </div>
  )
}
