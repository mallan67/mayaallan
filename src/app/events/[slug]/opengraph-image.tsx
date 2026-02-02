/**
 * Individual Event OG Image
 * Generates a 1200x630 image with event information
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

  // Fallback if no event found
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

  // Format date
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

  // Ensure image URL is absolute
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
        {/* Left side - Image or Icon */}
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
                stroke="#0f172a"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
          )}
        </div>

        {/* Right side - Event Info */}
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
          {/* Event tag */}
          <div style={{ display: "flex", marginBottom: "20px" }}>
            <span
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#1e293b",
                textTransform: "uppercase",
                letterSpacing: "2px",
                backgroundColor: "#e2e8f0",
                padding: "8px 16px",
                borderRadius: "20px",
              }}
            >
              Event
            </span>
          </div>

          {/* Title */}
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

          {/* Date and Time */}
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
            <span style={{ fontSize: "20px", color: "#0f172a" }}>
              {timeStr}
            </span>
          </div>

          {/* Location */}
          {event.locationText && (
            <p style={{ fontSize: "18px", color: "#0f172a", marginBottom: "16px" }}>
              {event.locationText}
            </p>
          )}

          {/* Description */}
          {truncatedDesc && (
            <p style={{ fontSize: "16px", color: "#1e293b", lineHeight: 1.5, marginBottom: "20px" }}>
              {truncatedDesc}
            </p>
          )}

          {/* Author */}
          <p style={{ fontSize: "18px", color: "#0f172a" }}>
            with Maya Allan
          </p>

          {/* Website */}
          <div style={{ display: "flex", alignItems: "center", marginTop: "auto" }}>
            <span style={{ fontSize: "16px", color: "#1e293b", fontWeight: "500" }}>
              mayaallan.com/events
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
