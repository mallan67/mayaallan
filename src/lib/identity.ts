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
  "https://www.instagram.com/mayaallan",
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
  // "https://www.amazon.com/author/mayaallan",       // TODO: claim Amazon Author Central
  // "https://www.goodreads.com/author/show/XXXX",    // TODO: enroll in Goodreads Author Program
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
export const BOOK_PROFILES: Record<string, string[]> = {
  "psilocybin-integration-guide": [
    // "https://www.amazon.com/dp/XXXXXXXXXX",                      // TODO: Amazon ASIN URL
    // "https://www.goodreads.com/book/show/XXXXXXXX",              // TODO: Goodreads book page
    // "https://books.google.com/books?id=XXXXXXXX",                // TODO: Google Books listing
    // "https://www.barnesandnoble.com/w/XXXXXXXXX",                // TODO: B&N listing
    // "https://www.kobo.com/us/en/ebook/XXXXX",                    // TODO: Kobo
    // "https://books.apple.com/us/book/XXXXXXX",                   // TODO: Apple Books
    // "https://openlibrary.org/works/OLXXXXXXW/Psilocybin_Integration_Guide", // TODO: Open Library work
    // "https://www.worldcat.org/oclc/XXXXXXXX",                    // TODO: WorldCat
    // "https://www.bookbub.com/books/psilocybin-integration-guide", // TODO: BookBub
    // "https://www.librarything.com/work/XXXXXX",                  // TODO: LibraryThing
  ],
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
  "Maya Allan is an author and researcher specializing in psilocybin integration, " +
  "consciousness exploration, and the practical work of inner transformation. Her work " +
  "draws on peer-reviewed psychedelic research, traditional wisdom, and decades of " +
  "facilitation experience to support practitioners, healers, facilitators, and solo " +
  "journeyers navigating non-ordinary states of consciousness."

export const AUTHOR_NAME = "Maya Allan"
export const AUTHOR_JOB_TITLE = "Author and Researcher"

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
