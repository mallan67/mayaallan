import type { Book, MediaItem, Event } from "@/lib/mock-data"

const SITE_URL = "https://www.mayaallan.com"

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
    answer: "Maya Allan is an author and researcher exploring consciousness, psychedelic integration, and self-agency. She writes practical guides for practitioners, healers, facilitators, and individuals navigating transformative experiences with psilocybin and plant medicine.",
  },
  {
    question: "What does Maya Allan write about?",
    answer: "Maya Allan writes about psilocybin integration, psychedelic healing, and inner transformation. Her books provide practical guidance for solo journeyers, practitioners, healers, and facilitators working with plant medicine and consciousness exploration.",
  },
  {
    question: "What is psilocybin integration?",
    answer: "Psilocybin integration is the process of making meaning from and applying insights gained during a psilocybin experience to everyday life. It involves reflection, journaling, and practices that help translate profound experiences into lasting personal growth and transformation.",
  },
  {
    question: "Who are Maya Allan's books for?",
    answer: "Maya Allan's books are designed for practitioners, healers, facilitators, psychedelic guides, therapists, integration specialists, and solo journeyers seeking practical guidance for navigating transformative psilocybin experiences with clarity and self-agency.",
  },
]

// =============================================================================
// Psilocybin/Mushroom Search Intent FAQs
// These target real search queries from people seeking guidance
// =============================================================================

export const PSILOCYBIN_GUIDANCE_FAQS: FAQItem[] = [
  // PREPARATION - Before the experience
  {
    question: "How do I prepare for my first mushroom experience?",
    answer: "Preparing for your first mushroom experience involves creating a safe physical environment (set and setting), clarifying your intentions, arranging for uninterrupted time, having water and comfort items nearby, and ideally having a trusted person available. Mental preparation includes being in a stable emotional state and approaching the experience with openness and respect.",
  },
  {
    question: "What should I know before taking psilocybin?",
    answer: "Before taking psilocybin, understand that experiences vary widely, effects typically last 4-6 hours, and integration afterward is essential for lasting benefit. Prepare your environment, set clear intentions, avoid mixing with other substances, ensure you're in a stable mental state, and have support available. Research any medication interactions and consider starting with a lower dose.",
  },
  {
    question: "Is it safe to take mushrooms alone?",
    answer: "Solo mushroom journeys can be meaningful but require extra preparation. Ensure you're in a safe, comfortable environment, start with a lower dose, have emergency contacts available, and remove potential hazards. Many people benefit from having a trip sitter, especially for early experiences. Solo journeys are best suited for those with prior experience who feel emotionally stable.",
  },
  {
    question: "How do I set intentions for a psilocybin journey?",
    answer: "Setting intentions involves reflecting on what you hope to explore, heal, or understand. Write down 1-3 clear intentions without being too rigid about outcomes. Common intentions include seeking clarity on life decisions, processing grief or trauma, connecting with creativity, or simply being open to what arises. Hold intentions lightly—the medicine often reveals what you need, not what you expect.",
  },

  // DURING - Navigating the experience
  {
    question: "What do I do during a difficult mushroom experience?",
    answer: "During a challenging moment, remember: breathe deeply, change your environment slightly (different room, lighting, or music), remind yourself the effects are temporary, and surrender rather than resist. Difficult experiences often carry the deepest insights. Ground yourself by feeling your body, focusing on breath, or holding a comforting object. Having a trusted person nearby can help.",
  },
  {
    question: "Why do mushrooms bring up difficult emotions?",
    answer: "Psilocybin can surface suppressed emotions, unprocessed memories, and psychological material that normally stays hidden. This isn't a sign something is wrong—it's often the healing process at work. The mushroom experience can help you face and process what you've been avoiding, leading to emotional release and integration when approached with acceptance.",
  },
  {
    question: "How long does a mushroom trip last?",
    answer: "A typical psilocybin experience lasts 4-6 hours, with peak effects occurring 2-3 hours after ingestion. The come-up takes 30-60 minutes, the peak lasts 2-3 hours, and the gradual return to baseline takes another 2-3 hours. Plan for the full day to be free, as you'll likely want rest and reflection time afterward.",
  },

  // AFTER - Integration and meaning-making
  {
    question: "What should I do after a mushroom experience?",
    answer: "After a mushroom experience, prioritize rest and gentle activities. Journal your insights while they're fresh, even if they seem unclear. Avoid major decisions for a few days. Spend time in nature, practice meditation, and allow yourself to process. The real work of integration—applying insights to your life—unfolds over days and weeks following the experience.",
  },
  {
    question: "How do I integrate a psilocybin experience?",
    answer: "Integration involves making meaning from your experience and applying insights to daily life. Key practices include journaling, discussing with a trusted person or therapist, meditation, creative expression, and making concrete changes aligned with your insights. Integration is ongoing—revisit your notes periodically and notice how your perspective evolves over time.",
  },
  {
    question: "Why do I feel different after taking mushrooms?",
    answer: "Feeling different after mushrooms is common and can include increased openness, shifted perspectives, emotional sensitivity, or a sense of renewed purpose. Psilocybin can create lasting changes in how you perceive yourself and the world. This \"afterglow\" period is valuable for integration. If difficult feelings persist beyond a few weeks, consider speaking with an integration-informed therapist.",
  },
  {
    question: "How do I make sense of my psychedelic insights?",
    answer: "Making sense of psychedelic insights takes time and patience. Write everything down without judgment, then revisit your notes over several days. Look for themes and patterns. Discuss your experience with someone you trust. Some insights are immediately clear while others reveal meaning gradually. Not everything needs to be understood intellectually—some wisdom integrates through changed behavior and perspective.",
  },

  // HEALING & GROWTH - Therapeutic potential
  {
    question: "Can psilocybin help with anxiety?",
    answer: "Research suggests psilocybin may help reduce anxiety by promoting new perspectives, emotional processing, and breaking rigid thought patterns. Many people report decreased anxiety following meaningful psilocybin experiences, particularly when combined with proper preparation and integration. However, psilocybin isn't appropriate for everyone—those with certain conditions should consult healthcare providers.",
  },
  {
    question: "Can mushrooms help with depression?",
    answer: "Clinical research shows promising results for psilocybin-assisted therapy in treating depression, including treatment-resistant cases. Psilocybin may help by promoting neuroplasticity, breaking negative thought loops, and facilitating emotional breakthroughs. The therapeutic benefit comes not just from the substance but from the full process of preparation, experience, and integration.",
  },
  {
    question: "How can psilocybin support healing from trauma?",
    answer: "Psilocybin may support trauma healing by allowing access to difficult memories with reduced fear response, promoting emotional processing, and helping reframe traumatic narratives. The experience can create distance from pain while maintaining connection to the memory, enabling new perspectives. Trauma work with psilocybin is best done with professional support and careful integration.",
  },
  {
    question: "Can psychedelics help with self-discovery?",
    answer: "Many people use psilocybin as a tool for self-discovery, gaining insights into their patterns, values, relationships, and life purpose. The experience can reveal blind spots, clarify what matters most, and catalyze personal growth. Self-discovery through psychedelics is most effective when approached with intention, openness, and commitment to integrating insights into meaningful life changes.",
  },
  {
    question: "How do mushrooms change your perspective?",
    answer: "Psilocybin can shift perspective by temporarily reducing activity in the brain's default mode network, which maintains our usual sense of self. This allows fresh ways of seeing yourself, relationships, and life situations. Many report feeling more connected to nature, others, and something greater than themselves. These perspective shifts can persist long after the experience when properly integrated.",
  },

  // PRACTICAL - Guidance seekers
  {
    question: "What is a psilocybin guide or facilitator?",
    answer: "A psilocybin guide or facilitator is someone trained to support others through psychedelic experiences. They help with preparation, hold space during the journey, and assist with integration afterward. Good facilitators create safety, offer grounded presence without directing the experience, and help you make meaning from what arises. They may be therapists, trained practitioners, or experienced community members.",
  },
  {
    question: "Should I journal after a mushroom experience?",
    answer: "Yes, journaling after a mushroom experience is one of the most valuable integration practices. Write as soon as you're able, capturing images, feelings, insights, and questions—even if they seem nonsensical. Don't edit or judge; just record. Revisit your journal over the following days and weeks. Patterns and meanings often emerge that weren't clear immediately after the experience.",
  },
  {
    question: "How often can you take psilocybin?",
    answer: "Most traditions and practitioners recommend spacing significant psilocybin experiences at least 2-4 weeks apart, with many suggesting longer intervals of months between deep journeys. Integration takes time—rushing back for another experience before processing the last one can be counterproductive. Quality of integration matters more than frequency of experiences.",
  },
]

export const BOOK_FAQS = (bookTitle: string, bookDescription?: string): FAQItem[] => [
  // What the book is about
  {
    question: `What is "${bookTitle}" about?`,
    answer: bookDescription || `"${bookTitle}" by Maya Allan is a comprehensive guide for understanding and integrating psilocybin experiences, offering practical wisdom for practitioners, healers, and individuals on their journey of inner transformation.`,
  },
  {
    question: `What topics does "${bookTitle}" cover?`,
    answer: `"${bookTitle}" covers psilocybin integration practices, preparation and set/setting guidance, navigating challenging experiences, post-journey reflection techniques, and frameworks for translating insights into lasting personal growth and transformation.`,
  },
  // Who benefits from the book
  {
    question: `Who is "${bookTitle}" for?`,
    answer: `"${bookTitle}" is written for practitioners, healers, facilitators, psychedelic guides, therapists, integration coaches, and solo journeyers who want practical, grounded guidance for navigating transformative experiences with psilocybin and plant medicine.`,
  },
  {
    question: `Can beginners use "${bookTitle}"?`,
    answer: `Yes, "${bookTitle}" is accessible to beginners while also offering depth for experienced practitioners. It provides foundational concepts for those new to psilocybin work alongside advanced integration frameworks for seasoned guides and facilitators.`,
  },
  {
    question: `Is "${bookTitle}" suitable for therapists and mental health professionals?`,
    answer: `Yes, "${bookTitle}" offers valuable frameworks for therapists, counselors, and mental health professionals interested in psychedelic-assisted therapy, integration support, and understanding the therapeutic potential of psilocybin experiences.`,
  },
  {
    question: `Can I use "${bookTitle}" for solo psilocybin experiences?`,
    answer: `Yes, "${bookTitle}" provides guidance specifically designed for solo journeyers, including preparation practices, safety considerations, self-reflection techniques, and integration methods for those exploring psilocybin independently.`,
  },
  // What readers will learn/gain
  {
    question: `What will I learn from "${bookTitle}"?`,
    answer: `Readers of "${bookTitle}" will learn practical integration techniques, how to prepare for meaningful psilocybin experiences, methods for processing and applying insights, and frameworks for supporting others through transformative journeys.`,
  },
  {
    question: `How is "${bookTitle}" different from other psilocybin books?`,
    answer: `"${bookTitle}" by Maya Allan focuses on practical integration rather than just the experience itself. It provides actionable frameworks for practitioners and individuals, emphasizing self-agency, grounded wisdom, and sustainable transformation.`,
  },
  // Author credibility
  {
    question: `Who wrote "${bookTitle}"?`,
    answer: `"${bookTitle}" was written by Maya Allan, an author and researcher specializing in psilocybin integration, psychedelic healing, consciousness exploration, and practical guides for inner transformation.`,
  },
]

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
  // Combine book tags with relevant audience keywords for better discoverability
  const baseKeywords = book.tagsCsv || ""
  const audienceKeywords = "practitioners, healers, facilitators, psychedelic guides, solo journeyers, therapists, integration specialists"
  const combinedKeywords = baseKeywords ? `${baseKeywords}, ${audienceKeywords}` : audienceKeywords

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
    keywords: combinedKeywords,
    genre: "Self-Help",
    audience: {
      "@type": "Audience",
      audienceType: "Practitioners, Healers, Facilitators, Guides, Solo Experiencers",
    },
    about: [
      { "@type": "Thing", name: "Psilocybin" },
      { "@type": "Thing", name: "Psychedelic Integration" },
      { "@type": "Thing", name: "Plant Medicine" },
      { "@type": "Thing", name: "Consciousness" },
    ],
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
