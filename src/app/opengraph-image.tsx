/**
 * Main Website OG Image
 * Generates a 1200x630 image for the homepage
 */
import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "Maya Allan - Author"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

// Fetch featured book for homepage OG image
async function getFeaturedBook() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return null
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/books?is_featured=eq.true&is_published=eq.true&is_visible=eq.true&select=title,cover_url,blurb&limit=1`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    return data?.[0] || null
  } catch {
    return null
  }
}

export default async function Image() {
  const featuredBook = await getFeaturedBook()

  // Ensure cover URL is absolute
  const coverUrl = featuredBook?.cover_url
    ? featuredBook.cover_url.startsWith("http")
      ? featuredBook.cover_url
      : `https://www.mayaallan.com${featuredBook.cover_url}`
    : null

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          backgroundColor: "#ffffff",
        }}
      >
        {/* Left side - Book Cover or placeholder */}
        <div
          style={{
            width: "400px",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            backgroundColor: "#f8fafc",
          }}
        >
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt={featuredBook?.title || "Featured Book"}
              width={300}
              height={450}
              style={{
                width: "300px",
                height: "450px",
                objectFit: "cover",
                borderRadius: "8px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
            />
          ) : (
            <div
              style={{
                width: "300px",
                height: "450px",
                backgroundColor: "#e2e8f0",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <span style={{ color: "#64748b", fontSize: "48px", marginBottom: "16px" }}>MA</span>
              <span style={{ color: "#94a3b8", fontSize: "18px" }}>Maya Allan</span>
            </div>
          )}
        </div>

        {/* Right side - Author Info */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "50px 60px 50px 40px",
            backgroundColor: "#ffffff",
          }}
        >
          {/* Author name */}
          <div
            style={{
              fontSize: "64px",
              fontWeight: "bold",
              color: "#0f172a",
              lineHeight: 1.1,
              marginBottom: "16px",
            }}
          >
            Maya Allan
          </div>

          {/* Tagline */}
          <p
            style={{
              fontSize: "28px",
              color: "#64748b",
              marginBottom: "24px",
            }}
          >
            Author & Guide
          </p>

          {/* Description */}
          <p
            style={{
              fontSize: "20px",
              color: "#475569",
              lineHeight: 1.6,
              marginBottom: "24px",
            }}
          >
            Integration guides for transformative experiences. Books, workshops, and resources for clarity and personal growth.
          </p>

          {/* Featured book title if available */}
          {featuredBook?.title && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 20px",
                backgroundColor: "#f1f5f9",
                borderRadius: "8px",
                marginBottom: "24px",
              }}
            >
              <span style={{ fontSize: "14px", color: "#64748b", marginRight: "8px" }}>Featured:</span>
              <span style={{ fontSize: "16px", color: "#0f172a", fontWeight: "600" }}>{featuredBook.title}</span>
            </div>
          )}

          {/* Website */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "auto",
            }}
          >
            <span
              style={{
                fontSize: "18px",
                color: "#94a3b8",
                fontWeight: "500",
              }}
            >
              mayaallan.com
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
