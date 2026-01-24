/**
 * Individual Event Twitter/X Image
 */
import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "Event with Maya Allan"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

interface Props {
  params: Promise<{ slug: string }>
}

async function getEvent(slug: string) {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return null
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/Event?slug=eq.${encodeURIComponent(slug)}&select=title,description,startsAt,locationText,eventImageUrl&limit=1`,
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
  const event = await getEvent(slug)

  if (!event) {
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
          <p style={{ fontSize: "32px", color: "#64748b" }}>Events</p>
        </div>
      ),
      { ...size }
    )
  }

  const description = event.description || ""
  const truncatedDesc = description.length > 100 ? description.substring(0, 97) + "..." : description

  const eventDate = new Date(event.startsAt)
  const dateStr = eventDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  const timeStr = eventDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })

  const imageUrl = event.eventImageUrl
    ? event.eventImageUrl.startsWith("http")
      ? event.eventImageUrl
      : `https://www.mayaallan.com${event.eventImageUrl}`
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
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={event.title}
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
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#64748b"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
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
              Event
            </span>
          </div>

          <div
            style={{
              fontSize: event.title.length > 40 ? "36px" : "44px",
              fontWeight: "bold",
              color: "#0f172a",
              lineHeight: 1.15,
              marginBottom: "16px",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            {event.title}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontSize: "20px", color: "#0f172a", fontWeight: "600" }}>
              {dateStr}
            </span>
            <span style={{ fontSize: "20px", color: "#64748b" }}>
              {timeStr}
            </span>
          </div>

          {event.locationText && (
            <p style={{ fontSize: "18px", color: "#64748b", marginBottom: "16px" }}>
              {event.locationText}
            </p>
          )}

          {truncatedDesc && (
            <p style={{ fontSize: "16px", color: "#475569", lineHeight: 1.5, marginBottom: "20px" }}>
              {truncatedDesc}
            </p>
          )}

          <p style={{ fontSize: "18px", color: "#64748b" }}>
            with Maya Allan
          </p>

          <div style={{ display: "flex", alignItems: "center", marginTop: "auto" }}>
            <span style={{ fontSize: "16px", color: "#94a3b8", fontWeight: "500" }}>
              mayaallan.com/events
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
