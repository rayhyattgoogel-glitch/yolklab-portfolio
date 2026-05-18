import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "Yolklab · 想到就去做，Just Do It！";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          background: "#0d0c0a",
          padding: "72px 80px",
          color: "#f3eee0",
          fontFamily: "serif",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 18,
            color: "#a0978a",
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              width: 32,
              height: 2,
              background: "#d4a84a",
              display: "block",
            }}
          />
          <span>00 / index 2026</span>
        </div>

        {/* Title block */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: 220,
              lineHeight: 0.9,
              letterSpacing: -8,
              fontWeight: 500,
              color: "#f3eee0",
              display: "flex",
            }}
          >
            yolklab
          </div>

          <div
            style={{
              marginTop: 36,
              display: "flex",
              alignItems: "center",
              gap: 22,
              fontSize: 38,
              color: "#f3eee0",
              fontStyle: "italic",
            }}
          >
            <span style={{ color: "#d4a84a", fontStyle: "normal" }}>—</span>
            <span>想到就去做，Just Do It！</span>
          </div>

          <div
            style={{
              marginTop: 48,
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 18,
              color: "#a0978a",
              letterSpacing: 5,
              textTransform: "uppercase",
            }}
          >
            <span>personal index of</span>
            <span style={{ color: "#d4a84a" }}>tools</span>
            <span>&</span>
            <span style={{ color: "#d4a84a" }}>games</span>
            <span style={{ marginLeft: "auto" }}>yolklab.net</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
