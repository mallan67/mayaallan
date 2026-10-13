import type { DistributionSurface } from "@/lib/visibility/distribution-surfaces"

export type DeliveryMode =
  | "automatic-feed"
  | "api-after-connect"
  | "manual-import"
  | "human-outreach"
  | "community-review"
  | "paid-placement"
  | "monitor-only"

export interface DeliveryReadiness {
  surfaceId: string
  mode: DeliveryMode
  configured: boolean
  requiredEnv: string[]
  setup: string
}

const API_CHANNELS: Record<string, { env: string[]; setup: string }> = {
  linkedin: {
    env: ["LINKEDIN_ACCESS_TOKEN", "LINKEDIN_AUTHOR_URN", "LINKEDIN_API_VERSION"],
    setup: "Connect a LinkedIn developer app with w_member_social, then publish canonical-link posts through the Posts API.",
  },
  pinterest: {
    env: ["PINTEREST_ACCESS_TOKEN", "PINTEREST_BOARD_ID"],
    setup: "Connect an approved Pinterest app with boards/pins write scopes, then create Pins that link to the canonical MayaAllan.com page.",
  },
  bluesky: {
    env: ["BLUESKY_HANDLE", "BLUESKY_APP_PASSWORD"],
    setup: "Create an app password for the Maya Allan Bluesky account, then syndicate canonical-link posts through AT Protocol.",
  },
  mastodon: {
    env: ["MASTODON_BASE_URL", "MASTODON_ACCESS_TOKEN"],
    setup: "Create a Mastodon application/token for the chosen instance, then publish canonical-link statuses.",
  },
  youtube: {
    env: ["YOUTUBE_CLIENT_ID", "YOUTUBE_CLIENT_SECRET", "YOUTUBE_REFRESH_TOKEN"],
    setup: "Authorize the Maya Allan YouTube channel with youtube.upload. Video uploads stay a reviewed media workflow; API projects may require Google's audit for public uploads.",
  },
}

export const AUTOMATIC_DISTRIBUTION = [
  {
    id: "rss",
    url: "/feed.xml",
    note: "Live RSS feed generated from canonical MayaAllan.com articles.",
  },
  {
    id: "json-feed",
    url: "/feed.json",
    note: "Live JSON Feed generated from the same canonical articles.",
  },
  {
    id: "sitemap",
    url: "/sitemap.xml",
    note: "Search-engine discovery feed.",
  },
  {
    id: "llms",
    url: "/llms.txt",
    note: "Machine-readable discovery manifest for AI/search tooling.",
  },
  {
    id: "llms-full",
    url: "/llms-full.txt",
    note: "Expanded machine-readable corpus.",
  },
]

function allEnvPresent(names: string[]): boolean {
  return names.every((name) => Boolean(process.env[name]?.trim()))
}

export function deliveryReadiness(surface: DistributionSurface): DeliveryReadiness {
  const api = API_CHANNELS[surface.id]
  if (api) {
    return {
      surfaceId: surface.id,
      mode: "api-after-connect",
      configured: allEnvPresent(api.env),
      requiredEnv: api.env,
      setup: api.setup,
    }
  }

  if (surface.id === "rss" || surface.id === "json-feed") {
    return {
      surfaceId: surface.id,
      mode: "automatic-feed",
      configured: true,
      requiredEnv: [],
      setup: surface.id === "rss" ? "Live at /feed.xml." : "Live at /feed.json.",
    }
  }

  if (surface.id === "medium") {
    return {
      surfaceId: surface.id,
      mode: "manual-import",
      configured: true,
      requiredEnv: [],
      setup: "Medium no longer issues new API integration tokens. Import the canonical MayaAllan.com URL into Medium so Medium sets the canonical link automatically; existing legacy tokens may still work.",
    }
  }

  if (surface.id === "substack") {
    return {
      surfaceId: surface.id,
      mode: "manual-import",
      configured: true,
      requiredEnv: [],
      setup: "Use Substack Import/Export with the MayaAllan.com RSS feed. Publishing remains under Maya's account review.",
    }
  }

  if (surface.paidExposure) {
    return {
      surfaceId: surface.id,
      mode: "paid-placement",
      configured: false,
      requiredEnv: [],
      setup: "Paid/sponsor inventory. Keep separate from earned/editorial placements and require explicit approval before spending.",
    }
  }

  if (
    surface.category === "psychedelic-community" ||
    surface.category === "psychedelic-marketplace" ||
    surface.category === "integration-group" ||
    surface.category === "membership-club"
  ) {
    return {
      surfaceId: surface.id,
      mode: "community-review",
      configured: false,
      requiredEnv: [],
      setup: "Prepare a channel-specific post, event, book-club proposal, or member resource and review the current community rules before submission.",
    }
  }

  if (
    surface.category === "psychedelic-editorial" ||
    surface.category === "psychedelic-podcast" ||
    surface.category === "youtube-channel" ||
    surface.category === "professional-network" ||
    surface.category === "conference-event" ||
    surface.category === "mental-health-community" ||
    surface.category === "self-help-wellness"
  ) {
    return {
      surfaceId: surface.id,
      mode: "human-outreach",
      configured: false,
      requiredEnv: [],
      setup: "Generate a tailored pitch/application from canonical author/book data; submit only after Maya reviews the destination-specific wording.",
    }
  }

  return {
    surfaceId: surface.id,
    mode: "monitor-only",
    configured: false,
    requiredEnv: [],
    setup: "Monitor presence/coverage; no direct publishing action is defined yet.",
  }
}

export function deliverySummary(surfaces: DistributionSurface[]) {
  const rows = surfaces.map(deliveryReadiness)
  return {
    rows,
    automatic: rows.filter((row) => row.mode === "automatic-feed").length,
    apiReady: rows.filter((row) => row.mode === "api-after-connect" && row.configured).length,
    apiNeedsConnection: rows.filter((row) => row.mode === "api-after-connect" && !row.configured).length,
    outreach: rows.filter((row) => row.mode === "human-outreach" || row.mode === "community-review").length,
    paid: rows.filter((row) => row.mode === "paid-placement").length,
  }
}
