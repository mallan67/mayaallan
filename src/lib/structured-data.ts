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
} from "@/lib/identity"

// Re-export so existing imports from structured-data keep working.
export { SITE_URL }

/**
 * Build the schema.org identifier[] array from AUTHOR_IDENTIFIERS.
 * Emits PropertyValue nodes that AI engines + Knowledge Graph use to
 * disambiguate Maya across data sources (ORCID, ISNI, Wikidata, etc).
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
// AEO (Answer Engine Optimization) Schemas
// These schemas help AI-powered answer engines and voice assistants understand
// and surface content from this site in search results and voice responses
// =============================================================================

export interface FAQItem {
  question: string
  answer: string
}

/**
 * FAQ Schema for Answer Engine Optimization
 * Helps AI answer engines surface Q&A content directly in search results
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
 * DefinedTermSet schema — the canonical structure for glossary-style pages.
 * AI engines (Claude, ChatGPT, Perplexity) and Google use DefinedTerm to
 * recognize a page as the authoritative definition for a given concept.
 *
 * Each term renders as a DefinedTerm node with optional alternateName synonyms;
 * the set is keyed by the page URL so engines can deep-link to a specific term.
 */
export interface DefinedTermInput {
  /** Stable id used as the anchor fragment (e.g. "ego-dissolution"). */
  id: string
  /** Canonical term name. */
  term: string
  /** Synonyms / alternative spellings. */
  alternateNames?: string[]
  /** 50-150 word standalone definition (AI engines quote verbatim). */
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
 * BreadcrumbList Schema for Navigation Context
 * Helps answer engines understand site hierarchy and navigation paths
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
 * Speakable Schema for Voice Assistant Optimization
 * Indicates which sections are suitable for text-to-speech by voice assistants
 */
export function generateSpeakableWebPageSchema(
  pageUrl: string,
  pageName: string,
  description: string,
  speakableCssSelectors: string[] = ["h1", "h2", ".speakable"]
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: pageName,
    description,
    url: pageUrl,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: speakableCssSelectors,
    },
  }
}

/**
 * Article Schema for editorial content (scenarios, blog posts, essays)
 * Required for Google Discover + AI engine attribution.
 */
export interface ArticleSchemaInput {
  headline: string
  description: string
  url: string
  datePublished: string // ISO 8601
  dateModified?: string // ISO 8601, defaults to datePublished
  image?: string | string[]
  keywords?: string[] | string
  /** Word count helps Google estimate read time + content depth. */
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

/**
 * HowTo Schema for Process/Guide Content
 * Useful for integration guides and instructional content
 */
export interface HowToStep {
  name: string
  text: string
  url?: string
}

export function generateHowToSchema(
  name: string,
  description: string,
  steps: HowToStep[],
  options?: {
    totalTime?: string
    image?: string
  }
) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    ...(options?.totalTime && { totalTime: options.totalTime }),
    ...(options?.image && { image: options.image }),
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.url && { url: step.url }),
    })),
  }
}

// =============================================================================
// Pre-defined FAQ Content for AEO
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

export const BOOK_FAQS = (bookTitle: string, bookDescription?: string): FAQItem[] => [
  // What the book is about
  {
    question: `What is "${bookTitle}" about?`,
    answer: bookDescription || `"${bookTitle}" by Maya Allan is an educational guide for understanding and reflecting on psilocybin experiences, offering practical wisdom for readers doing their own integration.`,
  },
  {
    question: `What topics does "${bookTitle}" cover?`,
    answer: `"${bookTitle}" covers post-experience reflection and integration practices, ways of working with challenging or confusing experiences, and frameworks for translating insights into everyday life.`,
  },
  // Who benefits from the book
  {
    question: `Who is "${bookTitle}" for?`,
    answer: `"${bookTitle}" is written for readers navigating their own psilocybin experiences who want practical, grounded guidance for reflection and integration.`,
  },
  {
    question: `Can beginners use "${bookTitle}"?`,
    answer: `Yes, "${bookTitle}" is accessible to beginners while also offering depth for experienced readers. It provides foundational concepts for those new to integration alongside more advanced reflection frameworks.`,
  },
  {
    question: `Is "${bookTitle}" suitable for therapists and mental health professionals?`,
    answer: `"${bookTitle}" is an educational resource, not a clinical or professional text, and it makes no therapeutic claims. Readers from many backgrounds have found its reflection frameworks useful, but it is not a substitute for professional training or care.`,
  },
  {
    question: `Is "${bookTitle}" a guide to using psilocybin?`,
    answer: `No. "${bookTitle}" is intended for post-experience reflection and education. It is not a guide to obtaining, dosing, or using psilocybin, and it does not replace medical, legal, or professional advice.`,
  },
  // What readers will learn/gain
  {
    question: `What will I learn from "${bookTitle}"?`,
    answer: `Readers of "${bookTitle}" will find practical reflection and integration frameworks, ways to process and apply insights over time, and language for making sense of difficult or meaningful experiences.`,
  },
  {
    question: `How is "${bookTitle}" different from other psilocybin books?`,
    answer: `"${bookTitle}" by Maya Allan focuses on practical integration rather than just the experience itself. It offers actionable frameworks for readers doing their own reflection, emphasizing self-agency and grounded, practical wisdom.`,
  },
  // Author credibility
  {
    question: `Who wrote "${bookTitle}"?`,
    answer: `"${bookTitle}" was written by Maya Allan, an author and educator focused on psilocybin integration, post-journey reflection, self-inquiry, and consciousness exploration.`,
  },
]

export function generateWebSiteSchema(siteName = "Maya Allan", siteUrl = SITE_URL) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    description: "Maya Allan is an author and educator offering non-clinical, educational resources for psilocybin integration, post-journey reflection, and self-inquiry.",
    publisher: {
      "@type": "Person",
      name: "Maya Allan",
      url: siteUrl,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/books?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
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
    ...(book.blurb && { description: book.blurb }),
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
