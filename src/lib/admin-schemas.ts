/**
 * Shared zod schemas + validators for admin write routes.
 *
 * Before this file, admin POST/PUT handlers read `request.json()` as `any`,
 * coerced fields per-handler, and trusted the client to send well-formed
 * payloads. That meant:
 *   - Garbage values like { isPublished: "yes please" } silently became
 *     true (because of `Boolean(body.isPublished)`).
 *   - Missing required fields landed as 500s from Postgres NOT NULL
 *     violations instead of clean 400s.
 *   - Field-name typos on the client (e.g. `slug` vs `slug_url`) silently
 *     stored as null with no validation feedback.
 *
 * Each schema below parses the inbound JSON into a strictly-typed shape.
 * Routes use `Schema.safeParse(body)` and surface a 400 with field-level
 * errors on failure. Existing response shapes (success path) are unchanged.
 */

import { z } from "zod"

// ─── Shared primitives ─────────────────────────────────────────────────

/** Accept either a number or a numeric string (with optional `$,` chars
 * the form may include). Blank/null/undefined yield null. Genuinely
 * invalid input (e.g. "abc") raises a Zod issue rather than silently
 * converting to null — silent conversion would let a typo clear a price
 * column on update. */
export const decimalOrNull = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((value, ctx) => {
    if (value === null || value === undefined || value === "") return null
    if (typeof value === "number") {
      if (Number.isFinite(value)) return value
      ctx.addIssue({ code: "custom", message: "must be a finite number" })
      return z.NEVER
    }
    if (typeof value !== "string") {
      ctx.addIssue({ code: "custom", message: "must be a number or numeric string" })
      return z.NEVER
    }
    const cleaned = value.trim().replace(/[$,]/g, "")
    if (!cleaned) return null
    const n = Number(cleaned)
    if (!Number.isFinite(n)) {
      ctx.addIssue({ code: "custom", message: "must be a numeric value" })
      return z.NEVER
    }
    return n
  })

/** ISO-8601 datetime or null. Blank/null/undefined yield null. Invalid
 * non-empty input raises a Zod issue (not silent null) so a typo can't
 * clear a date column on update. The admin form sends
 * `YYYY-MM-DDTHH:mm` (no seconds, no timezone), which `new Date(...)`
 * accepts. */
export const isoDateOrNull = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value, ctx) => {
    if (!value) return null
    const trimmed = String(value).trim()
    if (!trimmed) return null
    const date = new Date(trimmed)
    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({ code: "custom", message: "must be a valid date/time or blank" })
      return z.NEVER
    }
    return date.toISOString()
  })

/** A slug — lowercase letters, digits, hyphens. 1-100 chars. Stricter than
 * the historical "any string is fine" admin behavior, but matches what the
 * public route handlers (and unique constraints) already require. */
export const slugSchema = z
  .string()
  .min(1, "slug is required")
  .max(100)
  .regex(/^[A-Za-z0-9_-]+$/, "slug must contain only letters, digits, hyphens, and underscores")

/** Trimmed required title, length-capped. */
export const titleSchema = z.string().trim().min(1, "title is required").max(300)

/** Optional string or null. Caps length so a malformed paste can't insert
 * a multi-megabyte payload. */
export const optionalShortText = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === null || v === undefined) return null
    const trimmed = v.trim()
    return trimmed === "" ? null : trimmed.slice(0, 1000)
  })

/** Optional long-text field (blurb / description). Same null+trim
 * semantics, larger cap. */
export const optionalLongText = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === null || v === undefined) return null
    const trimmed = v.trim()
    return trimmed === "" ? null : trimmed.slice(0, 20_000)
  })

/** Optional URL — basic shape check. Blank/null/undefined yield null.
 * Invalid non-empty input raises a Zod issue rather than silently
 * converting to null — silent conversion would let an admin form
 * typo (e.g. "https//missing-colon.com") clear a legitimate URL
 * column on update. Accepts both absolute URLs and relative paths
 * (forms use both). */
export const optionalUrl = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v, ctx) => {
    if (v === null || v === undefined) return null
    const trimmed = v.trim()
    if (!trimmed) return null
    try {
      // `new URL(value, base)` parses relative paths against the base.
      // Throws if not parseable. We don't enforce protocol because the
      // forms accept both absolute https URLs and relative paths.
      new URL(trimmed, "https://example.com/")
      return trimmed.slice(0, 2048)
    } catch {
      ctx.addIssue({
        code: "custom",
        message: "must be a valid URL or relative path (or blank to clear)",
      })
      return z.NEVER
    }
  })

/** Optional boolean. Accepted inputs:
 *   - Native booleans:  true | false
 *   - Common strings:   "true" | "false" | "on" | "off"   (case-insensitive)
 *   - Empty:            null | undefined → false (omitted-field default)
 * ANY OTHER VALUE (e.g. "yes please", "1", 0, []) raises a Zod issue.
 * This stops the previous JS-coercion footgun where any truthy string
 * silently became true. */
const BOOLEANISH_TRUE = new Set(["true", "on"])
const BOOLEANISH_FALSE = new Set(["false", "off"])

export const booleanish = z
  .union([z.boolean(), z.string(), z.null(), z.undefined()])
  .transform((v, ctx) => {
    if (v === true) return true
    if (v === false) return false
    if (v === null || v === undefined) return false
    if (typeof v === "string") {
      const lower = v.trim().toLowerCase()
      if (BOOLEANISH_TRUE.has(lower)) return true
      if (BOOLEANISH_FALSE.has(lower)) return false
    }
    ctx.addIssue({
      code: "custom",
      message: 'must be true/false (boolean) or one of "true"/"false"/"on"/"off"',
    })
    return z.NEVER
  })

// ─── Event admin schemas ───────────────────────────────────────────────

/** POST /api/admin/events — create a new event row. */
export const eventCreateSchema = z.object({
  title: titleSchema,
  slug: slugSchema,
  description: optionalLongText,
  startsAt: z
    .string()
    .min(1, "startsAt is required")
    .transform((v, ctx) => {
      // Use ctx.addIssue + z.NEVER instead of throwing — throwing inside
      // a zod transform produces a generic 500 rather than the proper
      // ZodError flow that formatZodError() turns into a 400 field error.
      const date = new Date(v)
      if (Number.isNaN(date.getTime())) {
        ctx.addIssue({ code: "custom", message: "must be a valid date/time" })
        return z.NEVER
      }
      return date.toISOString()
    }),
  endsAt: isoDateOrNull,
  locationText: optionalShortText,
  locationUrl: optionalUrl,
  eventImageUrl: optionalUrl,
  isPublished: booleanish.optional().default(false),
  isVisible: booleanish.optional().default(false),
  keepVisibleAfterEnd: booleanish.optional().default(false),
  seoTitle: optionalShortText,
  seoDescription: optionalLongText,
})

/** PUT /api/admin/events/[id] — update existing event. All fields optional
 * because the form sends a full snapshot; if a field is omitted, we leave
 * it untouched. Same field shapes as create. */
export const eventUpdateSchema = eventCreateSchema.partial()

export type EventCreateInput = z.infer<typeof eventCreateSchema>
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>

// ─── Book admin schemas ────────────────────────────────────────────────

/** POST /api/admin/books — create a new book row. */
export const bookCreateSchema = z.object({
  slug: slugSchema,
  title: titleSchema,
  subtitle1: optionalShortText,
  subtitle2: optionalShortText,
  subtitle3: optionalShortText,
  tagsCsv: optionalShortText,
  isbn: optionalShortText,
  copyright: optionalShortText,
  blurb: optionalLongText,
  coverUrl: optionalUrl,
  backCoverUrl: optionalUrl,
  ebookFileUrl: optionalUrl,
  hasEbook: booleanish.optional().default(false),
  hasPaperback: booleanish.optional().default(false),
  hasHardcover: booleanish.optional().default(false),
  hasAudiobook: booleanish.optional().default(false),
  ebookPrice: decimalOrNull.optional(),
  paperbackPrice: decimalOrNull.optional(),
  hardcoverPrice: decimalOrNull.optional(),
  audiobookPrice: decimalOrNull.optional(),
  isFeatured: booleanish.optional().default(false),
  isPublished: booleanish.optional().default(false),
  isVisible: booleanish.optional().default(false),
  isComingSoon: booleanish.optional().default(false),
  allowDirectSale: booleanish.optional().default(false),
  allowRetailerSale: booleanish.optional().default(false),
  paypalPaymentLink: optionalUrl,
  seoTitle: optionalShortText,
  seoDescription: optionalLongText,
  ogImageUrl: optionalUrl,
  publishedAt: isoDateOrNull,
})

/** PUT /api/admin/books/[id] — update existing book. */
export const bookUpdateSchema = bookCreateSchema.partial()

export type BookCreateInput = z.infer<typeof bookCreateSchema>
export type BookUpdateInput = z.infer<typeof bookUpdateSchema>

// ─── Helpers ───────────────────────────────────────────────────────────

/**
 * Format zod errors into a flat field→message object suitable for an admin
 * UI to display next to each form field. Keeps response shape compatible
 * with the existing `{ error: string }` consumers — the field map is added
 * under a new `fields` key, never replacing `error`.
 */
export function formatZodError(error: z.ZodError): {
  error: string
  fields: Record<string, string>
} {
  const fields: Record<string, string> = {}
  for (const issue of error.issues) {
    const path = issue.path.length > 0 ? issue.path.join(".") : "_root"
    if (!fields[path]) fields[path] = issue.message
  }
  return {
    error: "Invalid input",
    fields,
  }
}
