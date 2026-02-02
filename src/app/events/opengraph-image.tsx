/**
 * Events Page OG Image
 * Generates a 1200x630 image for the events page
 */
import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "Events - Maya Allan"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

// Load Inter font for crisp text rendering
async function loadFont() {
  const response = await fetch(
    new URL("https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2")
  )
  return await response.arrayBuffer()
}

async function loadFontBold() {
  const response = await fetch(
    new URL("https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2")
  )
  return await response.arrayBuffer()
}

export default async function Image() {
  const [interRegular, interBold] = await Promise.all([
    loadFont(),
    loadFontBold(),
  ])

  const fonts = [
    {
      name: "Inter",
      data: interRegular,
      style: "normal" as const,
      weight: 400 as const,
    },
    {
      name: "Inter",
      data: interBold,
      style: "normal" as const,
      weight: 700 as const,
    },
  ]

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          backgroundColor: "#ffffff",
          fontFamily: "Inter",
        }}
      >
        {/* Left side - Icon/Visual */}
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
          <div
            style={{
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              backgroundColor: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000000"
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
        </div>

        {/* Right side - Page Info */}
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
          {/* Page type tag */}
          <div
            style={{
              display: "flex",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#000000",
                textTransform: "uppercase",
                letterSpacing: "2px",
                backgroundColor: "#e2e8f0",
                padding: "8px 16px",
                borderRadius: "20px",
              }}
            >
              Events
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "56px",
              fontWeight: 700,
              color: "#000000",
              lineHeight: 1.1,
              marginBottom: "16px",
            }}
          >
            Upcoming Events
          </div>

          {/* Author */}
          <p
            style={{
              fontSize: "30px",
              color: "#000000",
              fontWeight: 700,
              marginBottom: "24px",
            }}
          >
            with Maya Allan
          </p>

          {/* Description */}
          <p
            style={{
              fontSize: "22px",
              color: "#1a1a1a",
              fontWeight: 400,
              lineHeight: 1.5,
              marginBottom: "24px",
            }}
          >
            Talks, readings, workshops, and gatherings. Join Maya Allan for transformative experiences and community connection.
          </p>

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
                fontSize: "20px",
                color: "#000000",
                fontWeight: 700,
              }}
            >
              mayaallan.com/events
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts,
    }
  )
}
