// =============================================================================
// Identity & Profile Sources
// =============================================================================
// One place to maintain every external profile + identifier for Maya Allan.
// Everything in here is injected into JSON-LD `sameAs` arrays site-wide so
// search engines (Google Knowledge Graph) and AI engines (ChatGPT, Claude,
// Perplexity) consolidate all profiles into a single entity for you.
//
// HOW TO ADD A NEW PROFILE:
//   1. Create the profile on the platform (Wikidata, Goodreads, etc.)
//   2. Paste the canonical URL into the right array below
//   3. That's it — every schema on the site picks it up automatically
//
// VERIFY YOUR sameAs IS WORKING:
//   Run any page through https://search.google.com/test/rich-results and
//   confirm `sameAs` appears in the parsed JSON-LD.
// =============================================================================

export const SITE_URL = "https://www.mayaallan.com"

// -----------------------------------------------------------------------------
// AUTHOR_PROFILES — every place "Maya Allan" exists online as a verified entity
// -----------------------------------------------------------------------------
// Add new ones as you claim them. Leave commented-out URLs that don't exist
// yet so the migration path is visible. Only LIVE URLs should be uncommented —
// linking to a 404 from sameAs hurts more than it helps.
export const AUTHOR_PROFILES: string[] = [
  // Social
  "https://www.instagram.com/maya.allan66/", // VERIFIED 2026-05-19 (first post live)
  // "https://x.com/mayaallan",                       // TODO: claim or remove
  // "https://www.facebook.com/mayaallan",            // TODO: claim or remove
  // "https://www.linkedin.com/in/mayaallan",         // TODO: claim
  // "https://www.youtube.com/@mayaallan",            // TODO: claim
  // "https://www.tiktok.com/@mayaallan",             // TODO: claim
  // "https://www.pinterest.com/mayaallan",           // TODO: claim
  // "https://www.threads.net/@mayaallan",            // TODO: claim
  // "https://bsky.app/profile/mayaallan.com",        // TODO: claim
  // "https://substack.com/@mayaallan",               // TODO: claim
  // "https://medium.com/@mayaallan",                 // TODO: claim

  // Author / book platforms (HIGHEST PRIORITY — Google trusts these the most)
  // NOTE on Goodreads author: the stub at goodreads.com/author/show/65134359.Maya_Allan
  // exists but has NOT been claimed via the Goodreads Author Program. Linking
  // sameAs to an unclaimed stub is a weak/neutral signal and can suggest an
  // abandoned profile. Hold OUT of sameAs until claim completes — Maya tried
  // once and it didn't go through; retry via goodreads.com/author/program.
  // The book-level Goodreads URL (BOOK_PROFILES below) is fine to keep — that
  // page is a real, public book listing.
  // "https://www.goodreads.com/author/show/65134359.Maya_Allan", // ADD AFTER AUTHOR CLAIM APPROVED
  // "https://www.amazon.com/author/mayaallan",       // TODO: claim Amazon Author Central (highest single-source ROI)
  // "https://www.bookbub.com/profile/maya-allan",    // TODO: claim
  // "https://app.thestorygraph.com/profile/mayaallan", // TODO: claim
  // "https://openlibrary.org/authors/OLXXXXXA/Maya_Allan", // TODO: add via openlibrary.org
  // "https://www.librarything.com/author/allanmaya",  // TODO: claim

  // Knowledge / identifier services (these light up Knowledge Panels)
  // "https://www.wikidata.org/wiki/QXXXXXXX",        // TODO: create Wikidata entry (see WIKIDATA-DRAFT.md)
  // "https://orcid.org/0000-0000-0000-0000",         // TODO: register at orcid.org (free, 5 min)
  // "https://isni.org/isni/0000000XXXXXXXXX",        // TODO: request via isni.org (free for authors)
  // "https://viaf.org/viaf/XXXXXXXX/",               // TODO: auto-generated after library entries

  // Podcast / speaker profiles
  // "https://www.podchaser.com/creators/maya-allan-XXXX", // TODO: claim after first podcast
  // "https://www.listennotes.com/curated-podcasts/maya-allan/", // TODO: same
]

// -----------------------------------------------------------------------------
// BOOK_PROFILES — per-book external listings (Amazon ASIN page, Google Books, etc.)
// -----------------------------------------------------------------------------
// Keyed by book slug. Used in the Book schema's sameAs array to consolidate
// authority for each individual book.
//
// Each URL here tells Google "this is the same book as on retailer X." When
// Google sees the same book on Amazon, B&N, Bookshop, AbeBooks, and ThriftBooks,
// it merges them into one Book entity with combined authority — which is what
// surfaces the "Book card" rich result with the cover + retailer buttons.
export const BOOK_PROFILES: Record<string, string[]> = {
  "psilocybin-integration-guide": [
    // VERIFIED LIVE (2026-05-19) — found via cross-engine search
    "https://www.amazon.com/Psilocybin-Integration-Guide-Navigating-Experience/dp/B0G7JWDJYQ",
    "https://www.barnesandnoble.com/w/psilocybin-integration-guide-maya-allan/1148993659",
    "https://bookshop.org/p/books/psilocybin-integration-guide-40-real-scenarios-for-navigating-what-you-see-feel-experience-maya-allan/3c9390316323761a",
    "https://www.thriftbooks.com/w/psilocybin-integration-guide-40-real-scenarios-for-navigating-what-you-see-feel--experience/57728042/",
    "https://www.abebooks.com/9798994148839/Psilocybin-Integration-Guide-Real-Scenarios/plp",
    "https://www.goodreads.com/book/show/245299940-psilocybin-integration-guide", // VERIFIED 2026-05-19
    "https://play.google.com/store/books/details/Maya_Allan_Psilocybin_Integration_Guide?id=HvafEQAAQBAJ", // VERIFIED 2026-05-19 ($9.99 ebook)

    // TODO: paste the actual URLs once confirmed (Maya: these listings exist
    // but the canonical URLs weren't programmatically findable — copy from the
    // browser tab when you visit each platform):
    // "https://books.apple.com/us/book/XXXXXXX",                   // exists per Maya
    // "https://play.google.com/store/books/details?id=XXXXXXX",    // ebook channel per BOOK-METADATA.md
    // "https://books.google.com/books?id=XXXXXXX",                 // Google Books catalog (separate from Play)

    // TODO: future channels — leave commented until live:
    // "https://www.kobo.com/us/en/ebook/XXXXX",                    // Kobo
    // "https://openlibrary.org/works/OLXXXXXXW/Psilocybin_Integration_Guide", // Open Library — free, 5min, valuable
    // "https://www.worldcat.org/oclc/XXXXXXXX",                    // WorldCat — auto-populates after library catalogs
    // "https://www.bookbub.com/books/psilocybin-integration-guide", // BookBub author program
    // "https://www.librarything.com/work/XXXXXX",                  // LibraryThing
  ],
}

// -----------------------------------------------------------------------------
// BOOK_ASINS — Amazon ASIN per book slug (emitted as a schema.org PropertyValue
// identifier alongside ISBN). Helps Google merge the Amazon listing with the
// rest of the Book entity graph.
// -----------------------------------------------------------------------------
export const BOOK_ASINS: Record<string, string> = {
  "psilocybin-integration-guide": "B0G7JWDJYQ",
}

// -----------------------------------------------------------------------------
// AUTHOR_IDENTIFIERS — structured identifiers that some schema types accept
// -----------------------------------------------------------------------------
// These are emitted as Person.identifier[] in JSON-LD so search engines can
// match Maya across data sources even without sameAs URL crawls.
export interface AuthorIdentifier {
  type: "ORCID" | "ISNI" | "VIAF" | "Wikidata"
  value: string
  propertyId: string // schema.org PropertyID
}

export const AUTHOR_IDENTIFIERS: AuthorIdentifier[] = [
  // { type: "ORCID",    value: "0000-0000-0000-0000", propertyId: "https://orcid.org/" },
  // { type: "ISNI",     value: "0000000XXXXXXXXX",    propertyId: "https://isni.org/" },
  // { type: "Wikidata", value: "QXXXXXXX",             propertyId: "https://www.wikidata.org/wiki/" },
]

// -----------------------------------------------------------------------------
// AUTHOR_BIO — canonical short bio used in JSON-LD descriptions
// -----------------------------------------------------------------------------
// Keep this in sync with Amazon Author Central + Goodreads bio for consistency.
// Google rewards consistent bios across the web — it's a "same entity" signal.
export const AUTHOR_BIO =
  "Maya Allan is an author and educator focused on psilocybin integration, post-journey " +
  "reflection, and self-inquiry. She writes non-clinical, educational resources — including " +
  "the Psilocybin Integration Guide — that help readers make sense of their own experiences " +
  "and build a personal reflective practice. Her work centers on personal agency: the " +
  "meaning-making after an experience is the reader's own to do."

export const AUTHOR_NAME = "Maya Allan"
export const AUTHOR_JOB_TITLE = "Author and Educator"

// -----------------------------------------------------------------------------
// SUPPORTED_LOCALES — i18n configuration
// -----------------------------------------------------------------------------
// Used by middleware, sitemap (for hreflang), and the locale dictionary loader.
// Order matters: first locale is the default. Each entry maps to a route prefix
// and the Open Graph / HTML lang attribute.
//
// Selection rationale for THIS niche (psilocybin integration + spiritual /
// consciousness work) — ranked by combined audience size + niche affinity:
//
//   en  — English (US, UK, AU, CA): default; book is written in English
//   es  — Spanish (Spain + LatAm): ~500M speakers; huge plant-medicine culture
//                                  (ayahuasca, Mexico, Peru), strong demand
//   pt  — Portuguese (Brazil-first): Brazil has LEGAL ayahuasca via Santo
//                                  Daime/UDV, massive psychedelic community
//   de  — German (DE, AT, CH): Switzerland has legal medical psilocybin;
//                                  Germany has MIND Foundation + strong
//                                  research culture; high affluence, willing
//                                  to pay for books
//   he  — Hebrew (Israel): Israel is a global psychedelic research hub
//                                  (Hebrew University, MAPS Israel, Imperial-
//                                  affiliated trials); active integration
//                                  community; high English fluency but Hebrew
//                                  content converts much better
//   fr  — French (France, CA, BE, CH, parts of Africa): growing scene, France
//                                  legalizing for research, established
//                                  spiritual reader base
//
// IMPORTANT: Hebrew (he) is RTL — right-to-left. Layouts that hardcode
// margin-left / padding-left / text-align: left will break in Hebrew. The
// HTML `dir` attribute must be "rtl" when locale === "he". The locale-aware
// layout file should set this automatically.
export const LOCALES = ["en", "es", "pt", "de", "fr", "he"] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = "en"

export const LOCALE_LABELS: Record<
  Locale,
  { native: string; ogLocale: string; hreflang: string; dir: "ltr" | "rtl" }
> = {
  en: { native: "English",    ogLocale: "en_US", hreflang: "en",    dir: "ltr" },
  es: { native: "Español",    ogLocale: "es_ES", hreflang: "es",    dir: "ltr" },
  pt: { native: "Português",  ogLocale: "pt_BR", hreflang: "pt-BR", dir: "ltr" },
  de: { native: "Deutsch",    ogLocale: "de_DE", hreflang: "de",    dir: "ltr" },
  fr: { native: "Français",   ogLocale: "fr_FR", hreflang: "fr",    dir: "ltr" },
  he: { native: "עברית",      ogLocale: "he_IL", hreflang: "he",    dir: "rtl" },
}

/** Helper: get HTML `dir` attribute for a locale. */
export function localeDir(locale: Locale): "ltr" | "rtl" {
  return LOCALE_LABELS[locale]?.dir ?? "ltr"
}
