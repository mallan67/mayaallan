import type { Book, MediaItem, Event } from "@/lib/mock-data"

const SITE_URL = "https://www.mayaallan.com"

export function generateWebSiteSchema(siteName = "Maya Allan", siteUrl = SITE_URL) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    description: "Official website of Maya Allan - Author, Speaker, and Wellness Advocate",
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

export function generateOrganizationSchema(siteName = "Maya Allan", siteUrl = SITE_URL, logoUrl?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    ...(logoUrl && { logo: logoUrl }),
    sameAs: [
      "https://x.com/mayaallan",
      "https://facebook.com/mayaallan",
      "https://instagram.com/mayaallan",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      url: `${siteUrl}/contact`,
    },
  }
}

export function generateBookSchema(book: Book, siteUrl = SITE_URL) {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    ...(book.subtitle1 && { alternativeHeadline: book.subtitle1 }),
    ...(book.blurb && { description: book.blurb }),
    ...(book.isbn && { isbn: book.isbn }),
    ...(book.copyright && { copyrightNotice: book.copyright }),
    ...(book.coverUrl && {
      image: book.coverUrl,
    }),
    ...(book.publishedAt && {
      datePublished: book.publishedAt,
    }),
    author: {
      "@type": "Person",
      name: "Maya Allan",
      url: siteUrl,
    },
    ...(book.tagsCsv && {
      keywords: book.tagsCsv,
    }),
    url: `${siteUrl}/books/${book.slug}`,
    ...(book.allowDirectSale &&
      book.stripePaymentLink && {
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          url: book.stripePaymentLink,
        },
      }),
  }
}

export function generateAuthorSchema(siteUrl = SITE_URL, bio?: string, imageUrl?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Maya Allan",
    url: siteUrl,
    jobTitle: "Author",
    ...(bio && { description: bio }),
    ...(imageUrl && { image: imageUrl }),
    sameAs: ["https://x.com/mayaallan", "https://facebook.com/mayaallan", "https://instagram.com/mayaallan"],
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
    url: `${siteUrl}/events#${event.slug}`,
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
    url: `${siteUrl}/media#${media.slug}`,
  }

  if (media.kind === "audio") {
    return {
      ...baseSchema,
      "@type": "AudioObject",
      ...(media.fileUrl && { contentUrl: media.fileUrl }),
      ...(media.externalUrl && { embedUrl: media.externalUrl }),
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
