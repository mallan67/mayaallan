import { pgTable, serial, text, boolean, timestamp, integer, primaryKey, index } from "drizzle-orm/pg-core"

/**
 * Notes:
 * - All tables use snake_case in Postgres.
 * - updatedAt auto-updates on row update via Drizzle.
 * - Visibility policy is enforced at query-layer (admin + public routes).
 */

/* =====================
   Admin Users
===================== */
export const adminUser = pgTable(
  "admin_user",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    emailIdx: index("admin_user_email_idx").on(t.email),
  }),
)

/* =====================
   Retailers
===================== */
export const retailer = pgTable(
  "retailer",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    iconUrl: text("icon_url"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    slugIdx: index("retailer_slug_idx").on(t.slug),
    activeIdx: index("retailer_active_idx").on(t.isActive),
  }),
)

/* =====================
   Books
===================== */
export const book = pgTable(
  "book",
  {
    id: serial("id").primaryKey(),

    // routing
    slug: text("slug").notNull().unique(),

    // display
    title: text("title").notNull(),
    subtitle1: text("subtitle_1"),
    subtitle2: text("subtitle_2"),
    tagsCsv: text("tags_csv").default("").notNull(),

    // metadata
    isbn: text("isbn"),
    copyright: text("copyright"),
    blurb: text("blurb"),

    // images/files (Vercel Blob URLs)
    coverUrl: text("cover_url"),
    backCoverUrl: text("back_cover_url"),

    // publish + visibility
    isPublished: boolean("is_published").default(false).notNull(),
    isVisible: boolean("is_visible").default(false).notNull(),
    isComingSoon: boolean("is_coming_soon").default(false).notNull(),

    // commerce
    allowDirectSale: boolean("allow_direct_sale").default(false).notNull(),
    stripePaymentLink: text("stripe_payment_link"),
    paypalPaymentLink: text("paypal_payment_link"),

    // SEO overrides
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    ogImageUrl: text("og_image_url"),
    noIndex: boolean("no_index").default(false).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    slugIdx: index("book_slug_idx").on(t.slug),
    publishedIdx: index("book_published_idx").on(t.isPublished),
    visibleIdx: index("book_visible_idx").on(t.isVisible),
    comingSoonIdx: index("book_coming_soon_idx").on(t.isComingSoon),
  }),
)

/* =====================
   Book ↔ Retailer Links
===================== */
export const bookRetailerLink = pgTable(
  "book_retailer_link",
  {
    bookId: integer("book_id")
      .notNull()
      .references(() => book.id, { onDelete: "cascade" }),
    retailerId: integer("retailer_id")
      .notNull()
      .references(() => retailer.id, { onDelete: "restrict" }),
    url: text("url").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.bookId, t.retailerId] }),
    bookIdx: index("book_retailer_link_book_idx").on(t.bookId),
    retailerIdx: index("book_retailer_link_retailer_idx").on(t.retailerId),
    activeIdx: index("book_retailer_link_active_idx").on(t.isActive),
  }),
)

/* =====================
   Media Items
===================== */
export const mediaItem = pgTable(
  "media_item",
  {
    id: serial("id").primaryKey(),

    // restrict values at app-level; DB stores text
    kind: text("kind").notNull(), // "audio" | "video"

    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),

    coverUrl: text("cover_url"),

    // one of these should be set (enforced in app logic)
    fileUrl: text("file_url"),
    externalUrl: text("external_url"),

    isbn: text("isbn"),

    isPublished: boolean("is_published").default(false).notNull(),
    isVisible: boolean("is_visible").default(false).notNull(),

    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    ogImageUrl: text("og_image_url"),
    noIndex: boolean("no_index").default(false).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    slugIdx: index("media_item_slug_idx").on(t.slug),
    kindIdx: index("media_item_kind_idx").on(t.kind),
    publishedIdx: index("media_item_published_idx").on(t.isPublished),
    visibleIdx: index("media_item_visible_idx").on(t.isVisible),
  }),
)

/* =====================
   Events
===================== */
export const event = pgTable(
  "event",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),

    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),

    locationText: text("location_text"),
    locationUrl: text("location_url"),

    isPublished: boolean("is_published").default(false).notNull(),
    isVisible: boolean("is_visible").default(false).notNull(),
    keepVisibleAfterEnd: boolean("keep_visible_after_end").default(false).notNull(),

    calendarUrl: text("calendar_url"),

    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    ogImageUrl: text("og_image_url"),
    noIndex: boolean("no_index").default(false).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    slugIdx: index("event_slug_idx").on(t.slug),
    startsIdx: index("event_starts_idx").on(t.startsAt),
    publishedIdx: index("event_published_idx").on(t.isPublished),
    visibleIdx: index("event_visible_idx").on(t.isVisible),
  }),
)

/* =====================
   Contact + Email
===================== */
export const contactSubmission = pgTable(
  "contact_submission",
  {
    id: serial("id").primaryKey(),
    name: text("name"),
    email: text("email"),
    message: text("message"),
    source: text("source"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    emailIdx: index("contact_submission_email_idx").on(t.email),
  }),
)

export const emailSubscriber = pgTable(
  "email_subscriber",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    source: text("source"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    emailIdx: index("email_subscriber_email_idx").on(t.email),
  }),
)

/* =====================
   Site Settings (Single Row)
===================== */
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),

  siteTitle: text("site_title").default("Maya Allan").notNull(),
  siteDescription: text("site_description").default("").notNull(),
  defaultOgImageUrl: text("default_og_image_url"),

  fontBody: text("font_body").default("serif").notNull(),
  fontHeading: text("font_heading").default("serif").notNull(),
  accentColor: text("accent_color").default("#0f172a").notNull(),
  maxWidth: text("max_width").default("max-w-6xl").notNull(),
  buttonStyle: text("button_style").default("rounded").notNull(),

  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})
