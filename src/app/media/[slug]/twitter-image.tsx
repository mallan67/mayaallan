/**
 * Individual Media Item Twitter/X Image
 */
import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "Media by Maya Allan"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

interface Props {
  params: Promise<{ slug: string }>
}

async function getMediaItem(slug: string) {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return null
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/media_items?slug=eq.${encodeURIComponent(slug)}&select=title,description,kind,cover_url&limit=1`,
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

export default async function Image({ params }: Props) {
  const { slug } = await params
  const item = await getMediaItem(slug)

  if (!item) {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
          }}
        >
          <h1 style={{ fontSize: "72px", fontWeight: "bold", color: "#1e293b" }}>Maya Allan</h1>
          <p style={{ fontSize: "32px", color: "#64748b" }}>Media</p>
        </div>
      ),
      { ...size }
    )
  }

  const description = item.description || ""
  const truncatedDesc = description.length > 120 ? description.substring(0, 117) + "..." : description

  const coverUrl = item.cover_url
    ? item.cover_url.startsWith("http")
      ? item.cover_url
      : `https://www.mayaallan.com${item.cover_url}`
    : null

  const getMediaIcon = (kind: string) => {
    switch (kind) {
      case "video":
        return (
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        )
      case "audio":
        return (
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
        )
      default:
        return (
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        )
    }
  }

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
              alt={item.title}
              width={320}
              height={320}
              style={{
                width: "320px",
                height: "320px",
                objectFit: "cover",
                borderRadius: "16px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
            />
          ) : (
            <div
              style={{
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                backgroundColor: "#e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {getMediaIcon(item.kind)}
            </div>
          )}
        </div>

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
          <div style={{ display: "flex", marginBottom: "20px" }}>
            <span
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "2px",
                backgroundColor: "#f1f5f9",
                padding: "8px 16px",
                borderRadius: "20px",
              }}
            >
              {item.kind}
            </span>
          </div>

          <div
            style={{
              fontSize: item.title.length > 40 ? "38px" : "48px",
              fontWeight: "bold",
              color: "#0f172a",
              lineHeight: 1.15,
              marginBottom: "16px",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            {item.title}
          </div>

          <p style={{ fontSize: "24px", color: "#64748b", marginBottom: "24px" }}>
            by Maya Allan
          </p>

          {truncatedDesc && (
            <p style={{ fontSize: "18px", color: "#475569", lineHeight: 1.6, marginBottom: "24px" }}>
              {truncatedDesc}
            </p>
          )}

          <div style={{ display: "flex", alignItems: "center", marginTop: "auto" }}>
            <span style={{ fontSize: "16px", color: "#94a3b8", fontWeight: "500" }}>
              mayaallan.com/media
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
