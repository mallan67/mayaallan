/**
 * Past-events visibility filter for public-facing event listings.
 *
 * Rule:
 *   Show an event if EITHER:
 *     - startsAt is in the future (still "upcoming"), OR
 *     - keepVisibleAfterEnd === true (operator opted in to keep visible)
 *
 *   Hide otherwise (past event the operator didn't pin).
 *
 * Why:
 *   The "Upcoming Events" homepage block + /events listing + sitemap
 *   were leaking past events into views framed as "upcoming." Operator
 *   feedback: this looked broken / embarrassing on the live site.
 *
 *   `keepVisibleAfterEnd` is the existing column on the Event table (set
 *   from the admin event-edit form) — used for events the operator wants
 *   to keep listed after the date passes (e.g., a recap-pending workshop).
 *
 * Schema note:
 *   This filter targets the CURRENT production schema: PascalCase `Event`
 *   table with camelCase columns. After PR #9 (table reconciliation) migrates
 *   to snake_case, the column names will change to `starts_at` and
 *   `keep_visible_after_end`. At that point this helper updates in one place
 *   instead of patching every caller.
 *
 * Usage (Supabase PostgREST `.or()` syntax):
 *
 *   import { upcomingEventsOrClause } from "@/lib/events-visibility"
 *
 *   const { data } = await supabaseAdmin
 *     .from(Tables.events)
 *     .select("*")
 *     .eq("isVisible", true)
 *     .or(upcomingEventsOrClause())
 *     .order("startsAt", { ascending: true })
 */

/**
 * Returns the `.or()` clause string for Supabase PostgREST that filters to
 * upcoming-or-pinned events. Anchored to the current wall-clock at call time
 * (so a long-running cron pulling sitemap data over minutes will be consistent
 * within a single request, then refreshed on the next request).
 */
export function upcomingEventsOrClause(): string {
  const nowIso = new Date().toISOString()
  return `startsAt.gte.${nowIso},keepVisibleAfterEnd.eq.true`
}
