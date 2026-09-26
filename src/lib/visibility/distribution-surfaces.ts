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
  | "psychedelic-community"
  | "psychedelic-marketplace"
  | "youtube-channel"
  | "mental-health-community"
  | "self-help-wellness"
  | "integration-group"
  | "membership-club"
  | "professional-network"
  | "paid-media"
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

export type DistributionAccessModel =
  | "organic-discussion"
  | "editorial"
  | "membership"
  | "directory-listing"
  | "event"
  | "networking"
  | "book-club"
  | "sponsorship"
  | "advertising"
  | "newsletter-placement"
  | "podcast"
  | "video"
  | "partnership"
  | "community-post"

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
  access?: DistributionAccessModel[]
  paidExposure?: boolean
  audiences?: string[]
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

  // Psychedelic discussion / community marketplaces
  {
    id: "reddit-psychedelictherapy",
    name: "Reddit r/PsychedelicTherapy",
    category: "psychedelic-community",
    status: "opportunity",
    url: "https://www.reddit.com/r/PsychedelicTherapy/",
    modes: ["monthly community bulletin board", "discussion", "book/project sharing"],
    note: "Current monthly bulletin-board threads explicitly allow books, writings, events, podcasts and projects when shared with context; follow subreddit rules and avoid spam.",
  },
  {
    id: "reddit-rationalpsychonaut",
    name: "Reddit r/RationalPsychonaut",
    category: "psychedelic-community",
    status: "opportunity",
    url: "https://www.reddit.com/r/RationalPsychonaut/",
    modes: ["discussion", "resource sharing", "integration topics"],
    note: "Discussion community with recurring psychedelic education/integration content; participate as a community member rather than dropping promotional links.",
  },
  {
    id: "reddit-psychedelics",
    name: "Reddit r/Psychedelics",
    category: "psychedelic-community",
    status: "opportunity",
    url: "https://www.reddit.com/r/Psychedelics/",
    modes: ["discussion", "experience topics", "resource discovery"],
    note: "Large public psychedelic discussion surface; verify current self-promotion rules before posting.",
  },
  {
    id: "reddit-shrooms",
    name: "Reddit r/shrooms",
    category: "psychedelic-community",
    status: "opportunity",
    url: "https://www.reddit.com/r/shrooms/",
    modes: ["discussion", "experience reports", "book/resource discovery"],
    note: "Large mushroom-focused audience; only use community-appropriate educational/resource participation.",
  },
  {
    id: "how-to-use-psychedelics",
    name: "How to Use Psychedelics Community",
    category: "psychedelic-community",
    status: "opportunity",
    url: "https://www.howtousepsychedelics.com/",
    modes: ["Discord", "subreddit", "community gatherings", "integration circles", "website contribution"],
    note: "Community-run education and peer-support ecosystem that has invited contributions and hosts integration-related discussions and gatherings.",
  },
  {
    id: "violette",
    name: "Violette",
    category: "psychedelic-community",
    status: "opportunity",
    url: "https://www.violette.com/",
    modes: ["forum", "feed", "chat", "events", "resources", "circles", "members"],
    note: "Purpose-built platform for psychedelic, integration and retreat communities with discussion, resources and member spaces.",
  },
  {
    id: "global-psychedelic-society",
    name: "Global Psychedelic Society",
    category: "psychedelic-community",
    status: "opportunity",
    url: "https://globalpsychedelic.org/",
    modes: ["society network", "virtual events", "speaker resources", "leader hub"],
    note: "Global network connecting psychedelic societies; useful for speaker, resource and local-society exposure rather than retail.",
  },
  {
    id: "psychedelic-support-community",
    name: "Psychedelic Support — Community",
    category: "psychedelic-community",
    status: "opportunity",
    url: "https://psychedelic.support/",
    modes: ["community directory", "events", "articles", "member discussions"],
    note: "Community-group listings can include events and article opportunities. Current application availability must be checked before outreach.",
  },
  {
    id: "tripsitters-directory",
    name: "Tripsitters Psychedelic Directory",
    category: "psychedelic-marketplace",
    status: "opportunity",
    url: "https://www.tripsitters.org/directory",
    modes: ["community directory", "organization discovery", "online events"],
    note: "Public directory of psychedelic communities and organizations; possible discovery/listing route where criteria fit.",
  },
  {
    id: "shroomery",
    name: "Shroomery",
    category: "psychedelic-community",
    status: "opportunity",
    url: "https://www.shroomery.org/",
    modes: ["forums", "community discussion", "experience reports"],
    note: "Long-running mushroom/psychedelic forum ecosystem; community participation must respect forum rules and should not be treated as an advertising dump.",
  },
  {
    id: "meetup-psychedelic",
    name: "Meetup — Psychedelic / Integration Groups",
    category: "psychedelic-marketplace",
    status: "opportunity",
    url: "https://www.meetup.com/",
    modes: ["groups", "events", "integration circles", "local communities"],
    note: "Discovery marketplace for local and online psychedelic/integration groups and events.",
  },
  {
    id: "eventbrite-psychedelic",
    name: "Eventbrite — Psychedelic / Integration Events",
    category: "psychedelic-marketplace",
    status: "opportunity",
    url: "https://www.eventbrite.com/",
    modes: ["events", "talks", "integration circles", "book-related events"],
    note: "Public event marketplace where psychedelic and integration events are discoverable; suitable for talks or book-related educational events.",
  },

  // YouTube channels / video audiences
  {
    id: "youtube-maps",
    name: "MAPS — YouTube",
    category: "youtube-channel",
    status: "opportunity",
    url: "https://www.youtube.com/@maps",
    modes: ["interview", "lecture", "conference video", "author/topic feature"],
    note: "Established psychedelic research/education channel; pursue earned appearance or event-derived video rather than generic promotion.",
  },
  {
    id: "youtube-psychedelics-today",
    name: "Psychedelics Today — YouTube",
    category: "youtube-channel",
    status: "opportunity",
    modes: ["podcast video", "interview", "educational feature"],
    note: "Video extension of Psychedelics Today audience; connect any podcast/editorial pitch to possible YouTube distribution.",
  },
  {
    id: "youtube-third-wave",
    name: "Third Wave — YouTube",
    category: "youtube-channel",
    status: "opportunity",
    modes: ["podcast video", "interview", "education"],
    note: "Treat Third Wave's video audience as a separate searchable surface from its website/podcast.",
  },
  {
    id: "youtube-doubleblind",
    name: "DoubleBlind — YouTube",
    category: "youtube-channel",
    status: "opportunity",
    modes: ["interview", "short-form education", "editorial video"],
    note: "Video audience tied to DoubleBlind's psychedelic editorial brand; verify current contributor/guest routes.",
  },
  {
    id: "youtube-psychedelic-spotlight",
    name: "Psychedelic Spotlight — YouTube",
    category: "youtube-channel",
    status: "opportunity",
    modes: ["interview", "livestream", "event video"],
    note: "Psychedelic media video surface; align with interview/livestream/event opportunities already tracked.",
  },
  {
    id: "youtube-chacruna",
    name: "Chacruna — YouTube",
    category: "youtube-channel",
    status: "opportunity",
    modes: ["webinar", "conference video", "author discussion"],
    note: "Potential video extension of Chacruna's editorial and event ecosystem.",
  },
  {
    id: "youtube-psychedelic-integration-compass",
    name: "The Psychedelic Integration Compass — YouTube",
    category: "youtube-channel",
    status: "opportunity",
    modes: ["guest interview", "integration discussion"],
    note: "Integration-focused podcast/video audience; closely aligned with the book's post-journey discussion angle.",
  },
  {
    id: "youtube-mindscape-psychedelic-institute",
    name: "Mindscape Psychedelic Institute — YouTube/Podcast",
    category: "youtube-channel",
    status: "opportunity",
    modes: ["podcast guest", "education", "integration discussion"],
    note: "Psychedelic education/podcast video surface worth evaluating for author interviews or topic discussions.",
  },

  // Mental-health, self-help, integration, membership and professional audiences
  {
    id: "psychedelic-society-membership",
    name: "The Psychedelic Society — Membership & Integration Circles",
    category: "membership-club",
    status: "opportunity",
    url: "https://psychedelicsociety.org.uk/",
    modes: ["membership", "members-only integration circle", "events", "community socials"],
    access: ["membership", "event", "networking", "book-club"],
    audiences: ["psychedelic community", "integration", "consciousness", "personal growth"],
    note: "Members receive integration circles, socials and event access; evaluate book-club, talk, member-resource and partnership routes rather than treating it as a retail outlet.",
  },
  {
    id: "nectara",
    name: "Nectara — Psychedelic Integration Community",
    category: "integration-group",
    status: "opportunity",
    url: "https://www.nectara.org/membership",
    modes: ["membership", "live integration circles", "courses", "community", "guided practices"],
    access: ["membership", "networking", "community-post"],
    audiences: ["journeyers", "integration", "preparation", "personal growth"],
    note: "Large integration-focused member community; evaluate educational-resource, book-discussion, partnership and member-content routes.",
  },
  {
    id: "psychedelics-today-navigators",
    name: "Psychedelics Today — Navigators",
    category: "membership-club",
    status: "opportunity",
    url: "https://psychedelicstoday.com/navigators/",
    modes: ["membership", "book and film club", "webinars", "live classes", "community"],
    access: ["membership", "book-club", "event", "networking"],
    audiences: ["psychedelic practice", "education", "integration", "professional community"],
    note: "Members-only community explicitly includes book and film clubs; treat as a potential discussion/author-event surface in addition to Psychedelics Today editorial and podcast channels.",
  },
  {
    id: "district216",
    name: "District216 — Psychedelic Social Club",
    category: "membership-club",
    status: "opportunity",
    url: "https://www.district216.com/online-memberships",
    modes: ["private club", "online membership", "education", "discussion", "events"],
    access: ["membership", "event", "networking"],
    audiences: ["psychedelic culture", "consciousness", "integration", "self-exploration"],
    note: "Private educational/community club with author and educator programming; evaluate talks, book discussions, events and member-resource placement.",
  },
  {
    id: "psychedelic-health-professional-network",
    name: "Psychedelic Health Professional Network",
    category: "professional-network",
    status: "opportunity",
    url: "https://psychedelicnetwork.org.uk/",
    modes: ["membership", "weekly newsletter", "integration meetings", "presentations", "professional networking"],
    access: ["membership", "networking", "event", "newsletter-placement"],
    audiences: ["mental health professionals", "psychedelic practitioners", "researchers", "integration professionals"],
    note: "Professional membership/networking audience; any book positioning must remain educational and avoid implying clinical authority.",
  },
  {
    id: "intercollegiate-psychedelics-network",
    name: "Intercollegiate Psychedelics Network",
    category: "professional-network",
    status: "opportunity",
    url: "https://www.intercollegiatepsychedelics.net/",
    modes: ["member portal", "directory", "events", "WhatsApp community", "resource discounts"],
    access: ["membership", "networking", "event", "directory-listing"],
    audiences: ["students", "young professionals", "psychedelic studies", "research community"],
    note: "2,000+ member international student/young-professional network; evaluate educational talks, resources and book-discussion opportunities.",
  },
  {
    id: "psychedelic-states-america",
    name: "Psychedelic State(s) of America",
    category: "professional-network",
    status: "opportunity",
    url: "https://psychedelicamericas.org/events",
    modes: ["mixers", "member meetups", "livestreams", "professional development", "event submission"],
    access: ["event", "networking", "community-post"],
    audiences: ["psychedelic professionals", "community organizers", "policy", "education"],
    note: "Public event/networking surface with event submission; useful for talks, livestreams and regional professional exposure.",
  },
  {
    id: "psychedelic-network-business",
    name: "Psychedelic Network — Business Development",
    category: "paid-media",
    status: "opportunity",
    url: "https://psychedelic-network.org/",
    modes: ["business development packages", "community", "integration groups", "art and wellness"],
    access: ["advertising", "partnership", "directory-listing"],
    paidExposure: true,
    audiences: ["psychedelic community", "healing", "integration", "art", "wellness"],
    note: "Site advertises business-development packages; evaluate paid visibility only after confirming audience quality, placement terms and legal/compliance fit.",
  },
  {
    id: "psychedelic-mental-health-access-alliance",
    name: "Psychedelic Mental Health Access Alliance",
    category: "mental-health-community",
    status: "opportunity",
    url: "https://pmhaa.org/",
    modes: ["coalition", "research", "newsletter", "community engagement"],
    access: ["networking", "partnership", "event"],
    audiences: ["mental health", "psychedelic access", "research", "community health"],
    note: "Mental-health/access coalition; track for educational partnership, research-adjacent and community-engagement opportunities rather than direct consumer advertising.",
  },
  {
    id: "institute-psychedelic-therapy-integration-groups",
    name: "Institute of Psychedelic Therapy — Integration Groups",
    category: "integration-group",
    status: "monitor",
    url: "https://instituteofpsychedelictherapy.org/directory/integration-groups/",
    modes: ["integration group directory", "professional membership"],
    access: ["directory-listing", "networking"],
    audiences: ["integration groups", "counsellors", "psychotherapists"],
    note: "Directory is qualification-based for facilitators; use as a map of integration audiences and networking contacts, not as an author listing unless eligibility is met.",
  },

  // Mental-health and behavioral-health paid exposure
  {
    id: "adaa",
    name: "Anxiety & Depression Association of America",
    category: "mental-health-community",
    status: "opportunity",
    url: "https://adaa.org/about-adaa/advertise-with-adaa",
    modes: ["website ads", "newsletter ads", "podcast sponsorship", "webinar sponsorship", "conference exhibits", "self-help book ecosystem"],
    access: ["advertising", "sponsorship", "newsletter-placement", "podcast", "event", "partnership"],
    paidExposure: true,
    audiences: ["mental health consumers", "clinicians", "researchers", "educators"],
    note: "ADAA explicitly sells mental-health advertising/sponsorship and maintains a self-help book ecosystem. Any placement must present the book as educational, not treatment or clinical guidance.",
  },
  {
    id: "apa-advertising",
    name: "American Psychological Association — Advertising",
    category: "paid-media",
    status: "opportunity",
    url: "https://advertising.apa.org/",
    modes: ["website", "newsletters", "magazine", "webinars", "strategic alliances"],
    access: ["advertising", "sponsorship", "newsletter-placement", "event", "partnership"],
    paidExposure: true,
    audiences: ["psychologists", "researchers", "educators", "students"],
    note: "Large professional psychology audience. Treat as paid professional-market exposure and verify ad-policy fit before using psychedelic-related creative.",
  },
  {
    id: "mental-health-america",
    name: "Mental Health America",
    category: "mental-health-community",
    status: "opportunity",
    url: "https://mhanational.org/partner-with-us/",
    modes: ["partnership", "conference sponsor/exhibit", "webinars", "campaigns", "media outreach"],
    access: ["partnership", "sponsorship", "event", "advertising"],
    paidExposure: true,
    audiences: ["public mental health", "advocates", "professionals", "community organizations"],
    note: "National mental-health network with partnership and conference sponsorship routes. Position only around education, reflection and responsible mental-health literacy.",
  },
  {
    id: "njpa-advertising",
    name: "New Jersey Psychological Association — Advertising",
    category: "paid-media",
    status: "opportunity",
    url: "https://psychologynj.org/page/Advertise2",
    modes: ["website banners", "member e-blast", "digital journal", "event sponsorship"],
    access: ["advertising", "sponsorship", "newsletter-placement", "event"],
    paidExposure: true,
    audiences: ["New Jersey psychologists", "mental health professionals", "consumers"],
    note: "Local/regional paid access to psychology audiences through website, newsletter, journal and programs; relevant because Maya is in the NYC/NJ market.",
  },
  {
    id: "amhca-advertising",
    name: "American Mental Health Counselors Association — Advertising",
    category: "paid-media",
    status: "opportunity",
    url: "https://www.amhca.org/about/advertising",
    modes: ["content marketing", "newsletter ads", "digital magazine"],
    access: ["advertising", "newsletter-placement", "partnership"],
    paidExposure: true,
    audiences: ["mental health counselors", "behavioral health professionals"],
    note: "Professional mental-health advertising channel; verify that book creative meets advertising policies and does not imply clinical efficacy.",
  },
  {
    id: "society-behavioral-medicine",
    name: "Society of Behavioral Medicine — Advertising",
    category: "paid-media",
    status: "opportunity",
    url: "https://www.sbm.org/ways-to-give/advertise",
    modes: ["website ads", "e-newsletters", "webinar sponsorship", "industry resource email"],
    access: ["advertising", "sponsorship", "newsletter-placement"],
    paidExposure: true,
    audiences: ["behavioral medicine", "researchers", "health professionals"],
    note: "Professional behavioral-health audience; potentially useful for evidence-aware educational positioning.",
  },

  // Self-help / mindfulness / personal-growth audiences
  {
    id: "mindful",
    name: "Mindful",
    category: "self-help-wellness",
    status: "opportunity",
    url: "https://www.mindful.org/advertise-with-mindful/",
    modes: ["editorial collaboration", "newsletter", "sponsored article", "podcast", "social", "website", "magazine"],
    access: ["editorial", "advertising", "sponsorship", "newsletter-placement", "podcast", "video", "partnership"],
    paidExposure: true,
    audiences: ["mindfulness", "self-help", "wellness", "personal growth", "meditation"],
    note: "Multi-channel wellness platform with both earned collaboration and paid advertising. Strong fit for broader self-inquiry/awareness themes beyond psychedelic-only discovery.",
  },
  {
    id: "better-humans",
    name: "Better Humans on Medium",
    category: "self-help-wellness",
    status: "opportunity",
    url: "https://medium.com/better-humans",
    modes: ["editorial submission", "self-improvement publication"],
    access: ["editorial", "community-post"],
    audiences: ["self-improvement", "personal development", "human potential"],
    note: "Large self-improvement publication; use original, genuinely useful essays rather than book advertisements.",
  },
  {
    id: "mind-cafe",
    name: "Mind Cafe on Medium",
    category: "self-help-wellness",
    status: "opportunity",
    url: "https://medium.com/mind-cafe",
    modes: ["editorial submission", "happiness", "meaning", "self-improvement"],
    access: ["editorial", "community-post"],
    audiences: ["self-improvement", "meaning", "personal growth"],
    note: "Potential broader author exposure for lived-experience and meaning-oriented essays; follow current submission standards.",
  },
  {
    id: "all-about-psychology",
    name: "All About Psychology — Newsletter Sponsorship",
    category: "paid-media",
    status: "opportunity",
    url: "https://allaboutpsychology.substack.com/",
    modes: ["sponsored recommendation", "Substack", "LinkedIn amplification", "website placement"],
    access: ["sponsorship", "newsletter-placement", "advertising"],
    paidExposure: true,
    audiences: ["psychology", "mental health", "human behavior", "self-understanding"],
    note: "Publisher currently offers sponsored recommendations across newsletter, LinkedIn and website. Evaluate book sponsorship only if copy remains educational and non-clinical.",
  },
  {
    id: "addiction-recovery-ebulletin",
    name: "Addiction Recovery eBulletin",
    category: "paid-media",
    status: "opportunity",
    url: "https://addictionrecoveryebulletin.org/advertising/",
    modes: ["newsletter ad", "homepage placement", "social amplification"],
    access: ["advertising", "newsletter-placement", "sponsorship"],
    paidExposure: true,
    audiences: ["behavioral health", "recovery professionals", "clinicians", "press"],
    note: "Adjacent behavioral-health audience; evaluate carefully for thematic fit before spending because the book is not an addiction-treatment text.",
  },

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
    paidCount: DISTRIBUTION_SURFACES.filter((surface) => surface.paidExposure).length,
    membershipCount: DISTRIBUTION_SURFACES.filter((surface) => surface.access?.includes("membership")).length,
    byCategory: Object.fromEntries(byCategory),
    byStatus: Object.fromEntries(byStatus),
  }
}
