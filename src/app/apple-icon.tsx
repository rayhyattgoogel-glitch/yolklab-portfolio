import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0c0a",
          color: "#d4a84a",
          fontFamily: "serif",
          fontSize: 120,
          fontWeight: 500,
          letterSpacing: -4,
        }}
      >
        Y
      </div>
    ),
    { ...size },
  );
}
