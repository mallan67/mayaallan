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

export default async function Image() {
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
              stroke="#64748b"
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
                fontWeight: "600",
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "2px",
                backgroundColor: "#f1f5f9",
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
              fontWeight: "bold",
              color: "#0f172a",
              lineHeight: 1.1,
              marginBottom: "16px",
            }}
          >
            Upcoming Events
          </div>

          {/* Author */}
          <p
            style={{
              fontSize: "28px",
              color: "#64748b",
              marginBottom: "24px",
            }}
          >
            with Maya Allan
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
                fontSize: "18px",
                color: "#94a3b8",
                fontWeight: "500",
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
    }
  )
}
