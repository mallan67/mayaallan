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
//   - 'unsafe-inline' / 'unsafe-eval' are ONLY in script-src — Next.js needs
//     these for App Router runtime hydration; removing them breaks the site.
//
// frame-ancestors 'none' blocks every clickjacking attempt site-wide. This
// supersedes X-Frame-Options (which is kept below as a belt-and-braces
// header for legacy browsers).
// ----------------------------------------------------------------------------
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://*.paypal.com https://*.paypalobjects.com https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https: ",
  "media-src 'self' blob: https://*.public.blob.vercel-storage.com",
  "connect-src 'self' https://*.supabase.co https://*.paypal.com https://api-m.paypal.com https://api-m.sandbox.paypal.com https://vitals.vercel-insights.com",
  "frame-src https://*.paypal.com https://*.youtube.com https://*.youtube-nocookie.com https://*.vimeo.com https://player.vimeo.com",
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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply security headers to every route.
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ]
  },
  async redirects() {
    return [
      // Redirect non-www to www for SEO consistency
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
    ];
  },
};

export default nextConfig;
