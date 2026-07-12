/** @type {import('next').NextConfig} */

// ----------------------------------------------------------------------------
// Content Security Policy
// ----------------------------------------------------------------------------
// Conservative allow-list. Sources are scoped to what we actually use today:
//
//   - Self for everything by default
//   - PayPal:        https://*.paypal.com, https://*.paypalobjects.com
//                    (checkout iframes, JS SDK if added later)
//   - Vercel Blob:   https://*.public.blob.vercel-storage.com
//                    (cover images + ebook PDFs)
//   - Supabase:      https://*.supabase.co
//                    (REST + storage)
//   - Resend / Anthropic / etc. live entirely server-side — never touch the
//     browser, so we don't need to allowlist them.
//   - YouTube + Vimeo for embedded video iframes (admin can paste these into
//     media items).
//   - data: + blob: for inline images and dynamic blob downloads.
//
// frame-ancestors 'none' blocks every clickjacking attempt site-wide. This
// supersedes X-Frame-Options (which is kept below as a belt-and-braces
// header for legacy browsers).
// ----------------------------------------------------------------------------
const IS_PRODUCTION =
  process.env.VERCEL_ENV === "production" ||
  (!process.env.VERCEL_ENV && process.env.NODE_ENV === "production")

const CSP_DIRECTIVES = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${IS_PRODUCTION ? "" : " 'unsafe-eval'"} https://www.paypal.com https://*.paypal.com https://*.paypalobjects.com https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https://*.public.blob.vercel-storage.com",
  "connect-src 'self' https://*.supabase.co https://*.paypal.com https://api-m.paypal.com https://api-m.sandbox.paypal.com https://vitals.vercel-insights.com",
  // Pin PayPal to the specific hostnames the SDK actually loads. Wildcards
  // would also permit hypothetical hostile sub-hosts if PayPal ever has a
  // subdomain takeover — unlikely but a free hardening win.
  "frame-src https://www.paypal.com https://www.sandbox.paypal.com https://*.youtube.com https://*.youtube-nocookie.com https://*.vimeo.com https://player.vimeo.com",
  "frame-ancestors 'none'",
  "form-action 'self' https://*.paypal.com",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ")

const SECURITY_HEADERS = [
  {
    key: "Strict-Transport-Security",
    // 2 years, all subdomains, eligible for HSTS preload.
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    // Belt-and-braces alongside CSP frame-ancestors 'none'.
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    // Deny powerful features by default; loosen per-route as needed.
    value: [
      "accelerometer=()",
      "autoplay=(self)",
      "camera=()",
      "encrypted-media=()",
      "fullscreen=(self)",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "midi=()",
      "payment=(self https://*.paypal.com)",
      "picture-in-picture=()",
      "sync-xhr=(self)",
      "usb=()",
    ].join(", "),
  },
  {
    key: "Content-Security-Policy",
    value: CSP_DIRECTIVES,
  },
]

const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
    ],
  },
  async headers() {
    // No-store + private headers for any route that surfaces single-purchase
    // state or buyer-bound resources. Privacy purpose: a shared-computer
    // user must not see a cached version of a previous buyer's success or
    // download page. These supersede ANY upstream CDN / browser cache.
    const NO_STORE_HEADERS = [
      { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, private" },
      { key: "Pragma", value: "no-cache" },
      { key: "Expires", value: "0" },
    ]

    // For routes whose URL itself carries a secret bearer token (download
    // tokens), the site-wide `strict-origin-when-cross-origin` Referrer-Policy
    // is too lenient: same-origin navigations from /download/<token> would
    // send the full URL (including the token) in `Referer` to the destination
    // — exposing the token in Vercel access logs, third-party analytics
    // beacons on subsequent pages, and any image/font/script the next page
    // loads. `no-referrer` strips it unconditionally.
    const NO_REFERRER_HEADERS = [
      { key: "Referrer-Policy", value: "no-referrer" },
    ]

    const previewHeaders = IS_PRODUCTION
      ? []
      : [
          {
            source: "/:path*",
            headers: [
              { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
            ],
          },
        ]

    return [
      ...previewHeaders,
      {
        // Apply security headers to every route.
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
      {
        // /checkout/success/* — post-purchase confirmation. Must never be cached.
        source: "/checkout/:path*",
        headers: NO_STORE_HEADERS,
      },
      {
        // /download/<token>/* — token-gated download landing page.
        // Each token is unique to a single buyer; caching would leak info.
        source: "/download/:path*",
        headers: [...NO_STORE_HEADERS, ...NO_REFERRER_HEADERS],
      },
      {
        // /api/checkout/* — endpoints that return per-buyer redirect URLs / session ids.
        source: "/api/checkout/:path*",
        headers: NO_STORE_HEADERS,
      },
      {
        // /api/download/* — actual file delivery; must not be cached at any layer
        // and must not leak the token via Referer.
        source: "/api/download/:path*",
        headers: [...NO_STORE_HEADERS, ...NO_REFERRER_HEADERS],
      },
    ]
  },
  async redirects() {
    return [
      // Redirect non-www to www for SEO consistency.
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "mayaallan.com",
          },
        ],
        destination: "https://www.mayaallan.com/:path*",
        permanent: true,
      },
      {
        source: "/beliefaudit",
        destination: "/belief-inquiry",
        permanent: true,
      },
      {
        source: "/beliefaudit/:path*",
        destination: "/belief-inquiry/:path*",
        permanent: true,
      },
      // Tool slug migration (2026-07): descriptive slugs that match the nav
      // labels. Old paths 301 to the new canonical URLs so existing links,
      // bookmarks, and any indexed pages carry over without loss.
      {
        source: "/reset",
        destination: "/nervous-system-reset",
        permanent: true,
      },
      {
        source: "/integration",
        destination: "/integration-reflection",
        permanent: true,
      },
      {
        source: "/tools/integration-journal",
        destination: "/integration-journal",
        permanent: true,
      },
      {
        source: "/tools",
        destination: "/practices",
        permanent: true,
      },
      {
        source: "/articles",
        destination: "/blog",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
