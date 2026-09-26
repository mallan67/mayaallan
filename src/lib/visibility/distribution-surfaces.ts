export type DistributionCategory =
  | "root-index"
  | "downstream-search"
  | "ai-answer"
  | "bibliographic"
  | "reader-network"
  | "library"
  | "psychedelic-editorial"
  | "psychedelic-podcast"
  | "psychedelic-directory"
  | "conference-event"
  | "social"
  | "syndication"
  | "retail"
  | "international"

export type DistributionStatus =
  | "active"
  | "verified"
  | "inherited"
  | "monitor"
  | "opportunity"
  | "external-activation"
  | "retry-later"

export interface DistributionSurface {
  id: string
  name: string
  category: DistributionCategory
  status: DistributionStatus
  url?: string
  countries?: string[]
  coverageFrom?: string[]
  attempts?: number
  note: string
  modes?: string[]
}

/**
 * Internet-distribution registry.
 *
 * This is intentionally broader than book retail. It records where Maya Allan,
 * a work, an edition, or supporting content can be discovered, indexed, cited,
 * syndicated, discussed, cataloged, interviewed, or presented.
 *
 * Important governance:
 * - Root indexes and downstream interfaces are separate so one submission is
 *   not counted as several independent activation tasks.
 * - "retry-later" is not a block. It preserves an opportunity while preventing
 *   repeated immediate applications after a platform rejection.
 * - External platform state must never overwrite canonical author/book data.
 */
export const DISTRIBUTION_SURFACES: DistributionSurface[] = [
  // Root / independent indexes
  {
    id: "bing",
    name: "Bing",
    category: "root-index",
    status: "active",
    url: "https://www.bing.com/webmasters/",
    note: "User-confirmed submitted/activated. Treat as a root index, not a missing task.",
  },
  {
    id: "google",
    name: "Google",
    category: "root-index",
    status: "external-activation",
    url: "https://search.google.com/search-console",
    note: "Search Console integration exists in code; runtime coverage is measured separately.",
  },
  {
    id: "brave",
    name: "Brave Search",
    category: "root-index",
    status: "opportunity",
    url: "https://search.brave.com/",
    note: "Independent index; verify MayaAllan.com coverage separately from Google/Bing.",
  },
  {
    id: "mojeek",
    name: "Mojeek",
    category: "root-index",
    status: "monitor",
    url: "https://www.mojeek.com/",
    note: "Independent crawler/index; monitor discovery and indexed pages.",
  },
  {
    id: "common-crawl",
    name: "Common Crawl",
    category: "root-index",
    status: "monitor",
    url: "https://index.commoncrawl.org/",
    note: "Open web corpus; useful for checking whether canonical pages enter widely reused datasets.",
  },
  { id: "yandex", name: "Yandex", category: "root-index", status: "opportunity", note: "Regional/international search coverage." },
  { id: "naver", name: "Naver", category: "root-index", status: "opportunity", note: "Korean search/discovery ecosystem." },
  { id: "seznam", name: "Seznam", category: "root-index", status: "opportunity", note: "Czech search/discovery ecosystem." },
  { id: "baidu", name: "Baidu", category: "root-index", status: "opportunity", note: "Chinese search/discovery ecosystem; activation constraints may differ." },

  // Downstream interfaces fed partly/primarily by root indexes
  {
    id: "yahoo",
    name: "Yahoo Search",
    category: "downstream-search",
    status: "inherited",
    coverageFrom: ["bing"],
    note: "Do not create a duplicate Bing-submission task; verify actual Yahoo visibility downstream.",
  },
  {
    id: "copilot",
    name: "Microsoft Copilot",
    category: "ai-answer",
    status: "inherited",
    coverageFrom: ["bing"],
    note: "Bing-backed discovery surface; measure whether Maya/book/pages are surfaced and cited.",
  },
  {
    id: "duckduckgo",
    name: "DuckDuckGo",
    category: "downstream-search",
    status: "monitor",
    coverageFrom: ["bing"],
    note: "Traditional results depend substantially on Bing, but visibility should still be verified separately.",
  },
  {
    id: "ecosia",
    name: "Ecosia",
    category: "downstream-search",
    status: "monitor",
    coverageFrom: ["bing", "google"],
    note: "Provider mix can vary; verify real-world appearance rather than assuming coverage.",
  },

  // AI answer/search channels
  { id: "chatgpt", name: "ChatGPT Search", category: "ai-answer", status: "monitor", note: "AEO probe + crawler telemetry already exist; track actual book/domain citations." },
  { id: "gemini", name: "Gemini / Google AI", category: "ai-answer", status: "monitor", coverageFrom: ["google"], note: "Existing AEO probe; distinguish grounded-search citations from model memory." },
  { id: "perplexity", name: "Perplexity", category: "ai-answer", status: "monitor", note: "Existing grounded AEO probe and citation capture." },
  { id: "claude", name: "Claude", category: "ai-answer", status: "monitor", note: "Existing AEO probe; grounded mode depends on configured web-search access." },
  { id: "yahoo-scout", name: "Yahoo Scout", category: "ai-answer", status: "opportunity", coverageFrom: ["bing"], note: "Add explicit answer-surface checks rather than a duplicate index submission." },
  { id: "brave-ask", name: "Ask Brave", category: "ai-answer", status: "opportunity", coverageFrom: ["brave"], note: "Independent Brave-index answer surface." },
  { id: "duck-ai", name: "Duck.ai / Search Assist", category: "ai-answer", status: "opportunity", coverageFrom: ["bing"], note: "Add citation/mention checks separately from DuckDuckGo organic search." },
  { id: "you-com", name: "You.com", category: "ai-answer", status: "opportunity", note: "Track whether Maya/book/content appear in AI answers and citations." },

  // Bibliographic / reader discovery
  { id: "open-library", name: "Open Library", category: "bibliographic", status: "verified", note: "Author/work presence exists; continue edition reconciliation and profile enrichment." },
  {
    id: "goodreads",
    name: "Goodreads",
    category: "reader-network",
    status: "retry-later",
    attempts: 10,
    url: "https://www.goodreads.com/author/program",
    note: "Keep eligible. Prior author-program applications were rejected; do NOT block or remove. Retry after broader author/book exposure and authority signals improve.",
  },
  { id: "storygraph", name: "The StoryGraph", category: "reader-network", status: "opportunity", note: "Check book/edition presence and author discoverability." },
  { id: "librarything", name: "LibraryThing", category: "reader-network", status: "opportunity", note: "Check/claim author and edition records when available." },
  { id: "bookbub", name: "BookBub", category: "reader-network", status: "opportunity", note: "Author/book discovery and newsletter ecosystem." },
  { id: "bookwyrm", name: "BookWyrm", category: "reader-network", status: "opportunity", note: "Federated social reading/discovery ecosystem." },
  { id: "bookbrainz", name: "BookBrainz", category: "bibliographic", status: "opportunity", note: "Structured work/edition/author reconciliation opportunity." },
  { id: "hardcover", name: "Hardcover", category: "reader-network", status: "opportunity", note: "Reader/discovery catalog; verify title/edition presence." },
  { id: "bowker", name: "Bowker / Books In Print", category: "bibliographic", status: "opportunity", note: "US bibliographic authority and metadata quality channel." },
  { id: "worldcat", name: "WorldCat", category: "library", status: "opportunity", note: "Track catalog/library presence and edition identifiers." },
  { id: "overdrive", name: "OverDrive / Libby", category: "library", status: "opportunity", note: "Library ebook/audiobook discovery channel where distributor eligibility permits." },
  { id: "hoopla", name: "Hoopla", category: "library", status: "opportunity", note: "Library digital-content channel; check distributor path and title availability." },
  { id: "cloudlibrary", name: "cloudLibrary", category: "library", status: "opportunity", note: "Library discovery/distribution channel." },
  { id: "borrowbox", name: "BorrowBox", category: "library", status: "opportunity", note: "International library ebook/audiobook channel." },
  { id: "palace", name: "The Palace Project", category: "library", status: "opportunity", note: "Library ebook discovery/distribution ecosystem." },

  // Psychedelic/integration editorial, podcast, directory and event surfaces
  { id: "psychedelics-today-editorial", name: "Psychedelics Today — Editorial", category: "psychedelic-editorial", status: "opportunity", url: "https://psychedelicstoday.com/contact/", modes: ["article pitch", "education/affiliate"], note: "Pitch substantive scenario/integration content, not generic book promotion." },
  { id: "psychedelics-today-podcast", name: "Psychedelics Today — Podcast", category: "psychedelic-podcast", status: "opportunity", url: "https://psychedelicstoday.com/contact/", modes: ["guest"], note: "Guest/interview opportunity tied to distinctive author perspective and scenario-based framework." },
  { id: "psychedelic-spotlight", name: "Psychedelic Spotlight", category: "psychedelic-editorial", status: "opportunity", url: "https://psychedelicspotlight.com/", modes: ["article", "interview", "event", "livestream", "partnership"], note: "Multi-surface psychedelic media opportunity." },
  { id: "doubleblind", name: "DoubleBlind", category: "psychedelic-editorial", status: "opportunity", url: "https://doubleblindmag.com/contactus/", modes: ["editorial pitch", "press", "advertising/partnership"], note: "Separate earned editorial from paid exposure." },
  { id: "chacruna", name: "Chacruna", category: "psychedelic-editorial", status: "opportunity", url: "https://chacruna.net/", modes: ["article proposal", "conference", "webinar"], note: "Editorial submissions should be substantive and non-promotional." },
  { id: "psychedelic-science-review", name: "Psychedelic Science Review", category: "psychedelic-editorial", status: "opportunity", url: "https://psychedelicreview.com/", modes: ["author application", "science explainer"], note: "Best fit for evidence-grounded public-facing pieces." },
  { id: "psychedelic-support-content", name: "Psychedelic Support — Content", category: "psychedelic-editorial", status: "opportunity", url: "https://psychedelic.support/", modes: ["article contribution"], note: "Author/content route is appropriate; professional-provider directory is not the same thing." },
  { id: "third-wave-podcast", name: "Third Wave / The Psychedelic Podcast", category: "psychedelic-podcast", status: "opportunity", url: "https://thethirdwave.co/podcast/", modes: ["guest application"], note: "Potential author/interview route after stronger public exposure." },
  { id: "lucid-news", name: "Lucid News", category: "psychedelic-editorial", status: "opportunity", url: "https://www.lucid.news/", modes: ["story pitch", "opinion", "press", "sponsorship"], note: "News/culture/integration exposure channel." },
  { id: "maps-events", name: "MAPS — Events / Media", category: "conference-event", status: "opportunity", url: "https://maps.org/", modes: ["event submission", "media interview", "newsroom"], note: "Track as event/media opportunity, not as a retailer." },
  { id: "zendo-resources", name: "Zendo Project Resources", category: "psychedelic-directory", status: "opportunity", url: "https://zendoproject.org/resources/", modes: ["resource ecosystem"], note: "Evaluate whether an educational post-journey resource is suitable for inclusion." },

  // Social / syndication
  { id: "linkedin", name: "LinkedIn", category: "social", status: "verified", note: "Existing author/professional presence; connect published articles and book mentions back to canonical URLs." },
  { id: "youtube", name: "YouTube", category: "social", status: "opportunity", note: "Video explainers/interviews can become independent search and AI-discovery surfaces." },
  { id: "instagram", name: "Instagram", category: "social", status: "opportunity", note: "Visual/reel discovery channel." },
  { id: "pinterest", name: "Pinterest", category: "social", status: "opportunity", note: "Long-tail visual discovery for journaling, reflection and inner-work topics." },
  { id: "tiktok", name: "TikTok / BookTok", category: "social", status: "opportunity", note: "Book and topic discovery surface if used deliberately." },
  { id: "bluesky", name: "Bluesky", category: "social", status: "opportunity", note: "Potential POSSE syndication destination." },
  { id: "mastodon", name: "Mastodon / ActivityPub", category: "social", status: "opportunity", note: "Federated syndication/discovery opportunity." },
  { id: "medium", name: "Medium", category: "syndication", status: "active", note: "Repo already includes canonical-aware publishing script." },
  { id: "rss", name: "RSS", category: "syndication", status: "opportunity", note: "Add canonical site feed so readers, aggregators and automation can subscribe." },
  { id: "json-feed", name: "JSON Feed", category: "syndication", status: "opportunity", note: "Machine-friendly syndication feed." },
  { id: "opds", name: "OPDS", category: "syndication", status: "opportunity", note: "Book-catalog feed for compatible reading/catalog clients." },
]

export function distributionSurface(id: string): DistributionSurface | undefined {
  return DISTRIBUTION_SURFACES.find((surface) => surface.id === id)
}

export function distributionSummary() {
  const byCategory = new Map<DistributionCategory, number>()
  const byStatus = new Map<DistributionStatus, number>()

  for (const surface of DISTRIBUTION_SURFACES) {
    byCategory.set(surface.category, (byCategory.get(surface.category) ?? 0) + 1)
    byStatus.set(surface.status, (byStatus.get(surface.status) ?? 0) + 1)
  }

  return {
    total: DISTRIBUTION_SURFACES.length,
    byCategory: Object.fromEntries(byCategory),
    byStatus: Object.fromEntries(byStatus),
  }
}
