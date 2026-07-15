/**
 * Upcoming-event visibility filter for public-facing views.
 *
 * Rule:
 *   Show an event only when `starts_at` is now or later.
 *
 * Why:
 *   The homepage, /events listing, and sitemap all use this helper in surfaces
 *   described as "upcoming." The previous query also included any past event
 *   with `keep_visible_after_end = true`, which made completed events appear as
 *   upcoming. Retained past events need a separately labelled archive/recap
 *   surface; they must not leak into future-event views.
 *
 * `keep_visible_after_end` remains part of the event model so an archive can use
 * it later without changing the database. This helper deliberately ignores it.
 *
 * Usage (direct SQL): callers filter upcoming events inline with
 *   where is_visible = true and starts_at >= now()
 * and map the resulting rows through `eventRowToObject`. The former
 * `upcomingEventsOrClause()` PostgREST `.or()` helper was removed when the app
 * moved off the Supabase Data API to a direct Postgres connection.
 */

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
