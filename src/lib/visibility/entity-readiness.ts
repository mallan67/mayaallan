import "server-only"
import { AUTHOR_IDENTIFIERS, AUTHOR_PROFILES, BOOK_PROFILES } from "@/lib/identity"

export interface ReadinessItem {
  id: string
  label: string
  ready: boolean
  note: string
}

export function entityReadiness(): { entity: ReadinessItem[]; google: ReadinessItem[] } {
  const bookProfiles = BOOK_PROFILES["psilocybin-integration-guide"] ?? []
  return {
    entity: [
      {
        id: "author-profiles",
        label: "Claimed author profiles",
        ready: AUTHOR_PROFILES.length >= 2,
        note: AUTHOR_PROFILES.length + " live author profile(s) configured in sameAs.",
      },
      {
        id: "book-profiles",
        label: "Book identity sources",
        ready: bookProfiles.length >= 4,
        note: bookProfiles.length + " retailer/catalog profile(s) connected.",
      },
      {
        id: "author-identifiers",
        label: "Structured author identifiers",
        ready: AUTHOR_IDENTIFIERS.length > 0,
        note: AUTHOR_IDENTIFIERS.length + " identifier(s) configured.",
      },
    ],
    google: [
      {
        id: "search-profile",
        label: "Google Search Profile",
        ready: process.env.GOOGLE_SEARCH_PROFILE_VERIFIED === "true",
        note: "Set only after an eligible creator profile has been claimed.",
      },
      {
        id: "preferred-source",
        label: "Google Preferred Sources",
        ready: process.env.GOOGLE_PREFERRED_SOURCE_VERIFIED === "true",
        note: "Set only after the domain appears in Google's source-preferences tool.",
      },
      {
        id: "ai-inclusion",
        label: "Google generative AI inclusion",
        ready: process.env.GOOGLE_SEARCH_AI_INCLUDED === "true",
        note: "Confirm under Search Console Settings before marking verified.",
      },
    ],
  }
}
