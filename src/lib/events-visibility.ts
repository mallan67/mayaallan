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
 *   Targets the canonical snake_case `events` table (post table-reconciliation
 *   migration 2026-05-21). The PascalCase `"Event"` orphan still exists as
 *   a rollback safety net but is not read by application code.
 *
 * Usage (Supabase PostgREST `.or()` syntax):
 *
 *   import { upcomingEventsOrClause, eventRowToObject } from "@/lib/events-visibility"
 *
 *   const { data } = await supabaseAdmin
 *     .from(Tables.events)
 *     .select("*")
 *     .eq("is_visible", true)
 *     .or(upcomingEventsOrClause())
 *     .order("starts_at", { ascending: true })
 *   const events = (data ?? []).map(eventRowToObject)
 */

/**
 * Returns the `.or()` clause string for Supabase PostgREST that filters to
 * upcoming-or-pinned events. Anchored to the current wall-clock at call time
 * (so a long-running cron pulling sitemap data over minutes will be consistent
 * within a single request, then refreshed on the next request).
 */
export function upcomingEventsOrClause(): string {
  const nowIso = new Date().toISOString()
  return `starts_at.gte.${nowIso},keep_visible_after_end.eq.true`
}

/**
 * Public event shape used by render code — camelCase, post-migration-safe.
 * The DB stores snake_case columns; this type is what UI components consume.
 */
export type EventObject = {
  id: number
  slug: string
  title: string
  description: string | null
  startsAt: string | null
  endsAt: string | null
  locationText: string | null
  locationUrl: string | null
  eventImageUrl: string | null
  isPublished: boolean
  isVisible: boolean
  keepVisibleAfterEnd: boolean
  seoTitle: string | null
  seoDescription: string | null
  createdAt: string | null
  updatedAt: string | null
}

/**
 * Maps a raw snake_case row from the `events` table to the camelCase shape
 * the UI consumes. Use after any `.from(Tables.events).select(...)` query
 * before passing the data to render code. Keeps DB columns (snake_case)
 * and UI/API shape (camelCase) decoupled — matches the pattern the
 * `books` table already uses elsewhere in the codebase.
 */
export function eventRowToObject(row: Record<string, unknown>): EventObject {
  return {
    id: row.id as number,
    slug: row.slug as string,
    title: row.title as string,
    description: (row.description ?? null) as string | null,
    startsAt: (row.starts_at ?? null) as string | null,
    endsAt: (row.ends_at ?? null) as string | null,
    locationText: (row.location_text ?? null) as string | null,
    locationUrl: (row.location_url ?? null) as string | null,
    eventImageUrl: (row.event_image_url ?? null) as string | null,
    isPublished: Boolean(row.is_published),
    isVisible: Boolean(row.is_visible),
    keepVisibleAfterEnd: Boolean(row.keep_visible_after_end),
    seoTitle: (row.seo_title ?? null) as string | null,
    seoDescription: (row.seo_description ?? null) as string | null,
    createdAt: (row.created_at ?? null) as string | null,
    updatedAt: (row.updated_at ?? null) as string | null,
  }
}

/**
 * Inverse of eventRowToObject: maps the camelCase admin-input shape (from
 * the zod schema) to the snake_case DB column shape for INSERT/UPDATE.
 * Caller passes a partial object; only present keys are emitted in the
 * result (preserves "field omitted = column not touched" semantics).
 */
export function eventObjectToRow(input: Record<string, unknown>): Record<string, unknown> {
  const FIELD_MAP: Record<string, string> = {
    title: "title",
    slug: "slug",
    description: "description",
    startsAt: "starts_at",
    endsAt: "ends_at",
    locationText: "location_text",
    locationUrl: "location_url",
    eventImageUrl: "event_image_url",
    isPublished: "is_published",
    isVisible: "is_visible",
    keepVisibleAfterEnd: "keep_visible_after_end",
    seoTitle: "seo_title",
    seoDescription: "seo_description",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
  const out: Record<string, unknown> = {}
  for (const key of Object.keys(input)) {
    const col = FIELD_MAP[key]
    if (col) out[col] = input[key]
  }
  return out
}
