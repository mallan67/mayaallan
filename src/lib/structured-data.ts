import type { Book, MediaItem, Event } from "@/lib/types"
import {
  AUTHOR_PROFILES,
  AUTHOR_IDENTIFIERS,
  AUTHOR_BIO,
  AUTHOR_NAME,
  AUTHOR_JOB_TITLE,
  BOOK_PROFILES,
  BOOK_ASINS,
  SITE_URL,
  SITE_SEO_DESCRIPTION,
  bookMachineSummary,
} from "@/lib/identity"

// Re-export so existing imports from structured-data keep working.
export { SITE_URL }

/**
 * Build the schema.org identifier[] array from AUTHOR_IDENTIFIERS.
 * Emits PropertyValue nodes (ORCID, ISNI, Wikidata, etc.) so the Person
 * entity can be matched against external identifier systems.
 */
function authorIdentifierNodes() {
  if (AUTHOR_IDENTIFIERS.length === 0) return undefined
  return AUTHOR_IDENTIFIERS.map((id) => ({
    "@type": "PropertyValue",
    propertyID: id.type,
    value: id.value,
    url: `${id.propertyId}${id.value}`,
  }))
}

// =============================================================================
// Schema.org helpers
// Each helper builds one JSON-LD node that describes visible page content.
// Comments describe what the markup means. None of it promises rankings,
// rich results, or citations.
// =============================================================================

export interface FAQItem {
  question: string
  answer: string
}

/**
 * FAQPage — the visible question/answer pairs on a page, as schema.org nodes.
 * Google discontinued FAQ rich results from May 7, 2026. Emit this only where
 * a visible FAQ exists and the markup is an accurate description of it.
 */
export function generateFAQSchema(faqs: FAQItem[], pageUrl?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(pageUrl && { url: pageUrl }),
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}

/**
 * DefinedTermSet — the schema.org structure for a glossary: a named set of
 * DefinedTerm nodes, each with a name, optional alternate names, a definition,
 * and an anchor URL on the page.
 */
export interface DefinedTermInput {
  /** Stable id used as the anchor fragment (e.g. "ego-dissolution"). */
  id: string
  /** Canonical term name. */
  term: string
  /** Synonyms / alternative spellings. */
  alternateNames?: string[]
  /** 50-150 word standalone definition. */
  definition: string
}

export function generateDefinedTermSetSchema(
  setName: string,
  setUrl: string,
  description: string,
  terms: DefinedTermInput[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: setName,
    url: setUrl,
    description,
    hasDefinedTerm: terms.map((t) => ({
      "@type": "DefinedTerm",
      "@id": `${setUrl}#${t.id}`,
      name: t.term,
      ...(t.alternateNames && t.alternateNames.length > 0 && { alternateName: t.alternateNames }),
      description: t.definition,
      inDefinedTermSet: setUrl,
      url: `${setUrl}#${t.id}`,
    })),
  }
}

/**
 * BreadcrumbList — the page's position in the site hierarchy. Google may show
 * it as a breadcrumb trail in place of the URL in results.
 */
export interface BreadcrumbItem {
  name: string
  url: string
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * Article — editorial content (scenarios, blog posts, essays): headline,
 * description, author, publisher, dates, optional series membership and
 * citations.
 */
export interface ArticleSchemaInput {
  headline: string
  description: string
  url: string
  datePublished: string // ISO 8601
  dateModified?: string // ISO 8601, defaults to datePublished
  image?: string | string[]
  keywords?: string[] | string
  /** Word count of the article body. */
  wordCount?: number
  /** Set when the page is part of a series/cluster (e.g., the 40-scenarios cluster). */
  isPartOf?: { name: string; url: string }
  /** Inline source citations — usually built from `citedStatToCitation(stats)`. */
  citation?: Array<{ "@type": string; name: string; url?: string }>
}

export function generateArticleSchema(input: ArticleSchemaInput, siteUrl = SITE_URL) {
  const authorIdentifiers = authorIdentifierNodes()
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    url: input.url,
    mainEntityOfPage: { "@type": "WebPage", "@id": input.url },
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    inLanguage: "en",
    ...(input.image && { image: input.image }),
    ...(input.keywords && {
      keywords: Array.isArray(input.keywords) ? input.keywords.join(", ") : input.keywords,
    }),
    ...(input.wordCount && { wordCount: input.wordCount }),
    author: {
      "@type": "Person",
      name: AUTHOR_NAME,
      url: siteUrl,
      sameAs: AUTHOR_PROFILES,
      ...(authorIdentifiers && { identifier: authorIdentifiers }),
    },
    publisher: {
      "@type": "Organization",
      name: AUTHOR_NAME,
      url: siteUrl,
    },
    ...(input.isPartOf && {
      isPartOf: {
        "@type": "CreativeWorkSeries",
        name: input.isPartOf.name,
        url: input.isPartOf.url,
      },
    }),
    ...(input.citation && input.citation.length > 0 && { citation: input.citation }),
  }
}

// =============================================================================
// Pre-defined FAQ content — AUTHOR_FAQS is rendered visibly on /about and
// mirrored into that page's FAQPage JSON-LD. Book pages have no visible FAQ
// and emit no FAQPage schema (the former machine-only book FAQ constant was
// removed: FAQPage markup must describe questions a reader can actually see).
// =============================================================================

export const AUTHOR_FAQS: FAQItem[] = [
  {
    question: "Who is Maya Allan?",
    answer: "Maya Allan is an author and educator exploring consciousness, psychedelic integration, and self-agency. She writes non-clinical, educational resources for readers making sense of their own psilocybin experiences and building a personal reflective practice.",
  },
  {
    question: "What does Maya Allan write about?",
    answer: "Maya Allan writes about psilocybin integration, post-journey reflection, and self-inquiry. Her books offer educational guidance for readers reflecting on and integrating their own psychedelic experiences.",
  },
  {
    question: "What is psilocybin integration?",
    answer: "Psilocybin integration is the process of making meaning from and applying insights gained during a psilocybin experience to everyday life. It involves reflection, journaling, and practices that help translate profound experiences into lasting personal growth and transformation.",
  },
  {
    question: "Who are Maya Allan's books for?",
    answer: "Maya Allan's books are written for readers navigating their own psilocybin experiences — anyone seeking clear, educational guidance for reflection, integration, and self-agency.",
  },
]

export function generateWebSiteSchema(siteName = "Maya Allan", siteUrl = SITE_URL) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    description: SITE_SEO_DESCRIPTION,
    publisher: {
      "@type": "Person",
      name: "Maya Allan",
      url: siteUrl,
    },
    // No SearchAction: the site has no search endpoint, and Google retired the
    // sitelinks search box. Advertising a /books?q= target that does nothing
    // is misleading markup.
  }
}

export function generateOrganizationSchema(siteName = AUTHOR_NAME, siteUrl = SITE_URL, logoUrl?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    ...(logoUrl && { logo: logoUrl }),
    // sameAs sourced from src/lib/identity.ts — add new profiles there once.
    sameAs: AUTHOR_PROFILES,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      url: `${siteUrl}/contact`,
    },
    founder: {
      "@type": "Person",
      name: AUTHOR_NAME,
      url: siteUrl,
    },
  }
}

// -----------------------------------------------------------------------------
// Reviews & Ratings (for Book rich results in Google)
// -----------------------------------------------------------------------------
// Once you have real customer reviews from Amazon/Goodreads, pass them in here
// and Google will render star ratings + review count next to your book in
// search results. Until then, do NOT fake ratings — Google penalizes that and
// it's against schema.org guidelines. Leave both undefined and the schema
// simply won't include them.
export interface BookReview {
  reviewerName: string
  ratingValue: number // 1-5
  reviewBody?: string
  datePublished?: string // ISO 8601
}

export interface BookAggregateRating {
  ratingValue: number // 1-5 average
  reviewCount: number
  bestRating?: number // defaults 5
  worstRating?: number // defaults 1
}

export interface BookSchemaOptions {
  aggregateRating?: BookAggregateRating
  reviews?: BookReview[]
  /** Override per-book sameAs (defaults to BOOK_PROFILES[slug] from identity.ts) */
  sameAs?: string[]
}

export function generateBookSchema(book: Book, siteUrl = SITE_URL, options?: BookSchemaOptions) {
  // Combine book tags with relevant audience keywords for better discoverability
  const baseKeywords = book.tagsCsv || ""
  const audienceKeywords = "readers exploring post-experience integration and self-inquiry"
  const combinedKeywords = baseKeywords ? `${baseKeywords}, ${audienceKeywords}` : audienceKeywords

  // Per-book external listings (Amazon, Goodreads, Google Books, etc.) so the
  // Book entity has its own consolidated authority web independent of the author.
  const bookSameAs = options?.sameAs ?? BOOK_PROFILES[book.slug] ?? []

  // ISBN + ASIN identifiers, emitted as schema.org PropertyValue nodes so
  // Google can match the Book entity against retailer catalogs in either direction.
  const bookIdentifiers: Array<{ "@type": "PropertyValue"; propertyID: string; value: string }> = []
  if (book.isbn) {
    bookIdentifiers.push({ "@type": "PropertyValue", propertyID: "ISBN", value: book.isbn })
  }
  const asin = BOOK_ASINS[book.slug]
  if (asin) {
    bookIdentifiers.push({ "@type": "PropertyValue", propertyID: "ASIN", value: asin })
  }

  const authorIdentifiers = authorIdentifierNodes()

  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    ...(book.subtitle1 && { alternativeHeadline: book.subtitle1 }),
    // Machine-facing summary, NEVER the mutable sales blurb (book.blurb).
    description: bookMachineSummary(book.slug, book.title),
    ...(book.isbn && { isbn: book.isbn }),
    ...(bookIdentifiers.length > 0 && { identifier: bookIdentifiers }),
    ...(book.copyright && { copyrightNotice: book.copyright }),
    ...(book.coverUrl && {
      image: book.coverUrl,
    }),
    ...(book.publishedAt && {
      datePublished: book.publishedAt,
    }),
    author: {
      "@type": "Person",
      name: AUTHOR_NAME,
      url: siteUrl,
      sameAs: AUTHOR_PROFILES,
      ...(authorIdentifiers && { identifier: authorIdentifiers }),
    },
    publisher: {
      "@type": "Organization",
      name: AUTHOR_NAME,
      url: siteUrl,
    },
    inLanguage: "en",
    keywords: combinedKeywords,
    genre: ["Self-Help", "Body, Mind & Spirit", "Spirituality"],
    audience: {
      "@type": "Audience",
      audienceType: "Readers exploring psilocybin integration, reflection, and self-inquiry",
    },
    about: [
      { "@type": "Thing", name: "Psilocybin" },
      { "@type": "Thing", name: "Psychedelic Integration" },
      { "@type": "Thing", name: "Post-Journey Reflection" },
      { "@type": "Thing", name: "Consciousness" },
      { "@type": "Thing", name: "Inner Transformation" },
      { "@type": "Thing", name: "Shadow Work" },
    ],
    url: `${siteUrl}/books/${book.slug}`,
    ...(bookSameAs.length > 0 && { sameAs: bookSameAs }),
    ...(options?.aggregateRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: options.aggregateRating.ratingValue,
        reviewCount: options.aggregateRating.reviewCount,
        bestRating: options.aggregateRating.bestRating ?? 5,
        worstRating: options.aggregateRating.worstRating ?? 1,
      },
    }),
    ...(options?.reviews &&
      options.reviews.length > 0 && {
        review: options.reviews.map((r) => ({
          "@type": "Review",
          author: { "@type": "Person", name: r.reviewerName },
          reviewRating: {
            "@type": "Rating",
            ratingValue: r.ratingValue,
            bestRating: 5,
            worstRating: 1,
          },
          ...(r.reviewBody && { reviewBody: r.reviewBody }),
          ...(r.datePublished && { datePublished: r.datePublished }),
        })),
      }),
    ...(book.allowDirectSale &&
      book.paypalPaymentLink && {
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          url: book.paypalPaymentLink,
          priceCurrency: "USD",
        },
      }),
  }
}

export function generateAuthorSchema(siteUrl = SITE_URL, bio?: string, imageUrl?: string) {
  const identifiers = authorIdentifierNodes()
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: AUTHOR_NAME,
    url: siteUrl,
    jobTitle: AUTHOR_JOB_TITLE,
    description: bio || AUTHOR_BIO,
    ...(imageUrl && { image: imageUrl }),
    // sameAs sourced from src/lib/identity.ts — add new profiles there once.
    sameAs: AUTHOR_PROFILES,
    ...(identifiers && { identifier: identifiers }),
    knowsAbout: [
      "Psilocybin integration",
      "Post-journey reflection",
      "Self-inquiry",
      "Consciousness studies",
      "Shadow work",
      "Spiritual integration",
    ],
    worksFor: {
      "@type": "Organization",
      name: AUTHOR_NAME,
      url: siteUrl,
    },
  }
}

export function generateEventSchema(event: Event, siteUrl = SITE_URL) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    ...(event.description && { description: event.description }),
    startDate: event.startsAt,
    ...(event.endsAt && { endDate: event.endsAt }),
    ...(event.locationText && {
      location: {
        "@type": "Place",
        name: event.locationText,
        ...(event.locationUrl && { url: event.locationUrl }),
      },
    }),
    ...(event.photoUrls &&
      event.photoUrls.length > 0 && {
        image: event.photoUrls[0],
      }),
    organizer: {
      "@type": "Person",
      name: "Maya Allan",
      url: siteUrl,
    },
    url: `${siteUrl}/events/${event.slug}`,
  }
}

export function generateMediaSchema(media: MediaItem, siteUrl = SITE_URL) {
  const baseSchema = {
    "@context": "https://schema.org",
    name: media.title,
    ...(media.description && { description: media.description }),
    ...(media.coverUrl && { thumbnailUrl: media.coverUrl }),
    author: {
      "@type": "Person",
      name: "Maya Allan",
    },
    url: `${siteUrl}/media/${media.slug}`,
  }

  if (media.kind === "audio") {
    return {
      ...baseSchema,
      "@type": "AudioObject",
      ...(media.fileUrl && { contentUrl: media.fileUrl }),
      ...(media.externalUrl && { embedUrl: media.externalUrl }),
    }
  } else if (media.kind === "image") {
    return {
      ...baseSchema,
      "@type": "ImageObject",
      ...((media.fileUrl || media.coverUrl) && {
        contentUrl: media.fileUrl || media.coverUrl,
      }),
    }
  } else {
    return {
      ...baseSchema,
      "@type": "VideoObject",
      ...(media.fileUrl && { contentUrl: media.fileUrl }),
      ...(media.externalUrl && { embedUrl: media.externalUrl }),
    }
  }
}
