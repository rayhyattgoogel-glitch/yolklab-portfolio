import { ImageResponse } from "next/og";
import { loadAllDiaries, loadDiaryBySlug } from "@/lib/content/loader";

export const dynamic = "force-static";
export const alt = "yolklab · diary";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return loadAllDiaries().map((d) => ({ slug: d.slug }));
}

/**
 * Satori (next/og) ships only Latin glyphs, so CJK titles render as tofu
 * unless we hand it a font with the needed glyphs. We fetch a SUBSETTED TTF
 * (only the characters in `text`) from Google Fonts.
 *
 * Font format is chosen by Google from the User-Agent: modern browsers get
 * woff2, old IE gets EOT, old Safari gets SVG — none of which Satori can
 * parse. A generic/unknown UA makes Google fall back to plain TTF
 * (`format('truetype')`, sfnt magic 0x00010000), which is what Satori needs.
 */
async function loadGoogleFontTTF(
  family: string,
  text: string,
): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css?family=${encodeURIComponent(
    family,
  )}&text=${encodeURIComponent(text)}`;
  const css = await (
    await fetch(url, { headers: { "User-Agent": "curl/8.0.0" } })
  ).text();
  // Prefer the truetype @font-face src; fall back to the first url().
  const match =
    css.match(/src:\s*url\(([^)]+)\)\s*format\(['"]truetype['"]\)/) ??
    css.match(/src:\s*url\(([^)]+)\)/);
  if (!match) {
    throw new Error(`Could not extract TTF url from Google Fonts CSS for ${family}`);
  }
  return await (await fetch(match[1])).arrayBuffer();
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const diary = loadDiaryBySlug(slug);
  const title = diary?.title ?? "diary";
  const dateLabel = diary?.date ?? "";

  // Every glyph that appears anywhere on the card must be in the subset.
  const fontText =
    title + dateLabel + "0123456789 / DIARYyolkab·diary.net—";
  const fontData = await loadGoogleFontTTF("Noto Serif SC", fontText);

  const titleSize = title.length > 26 ? 60 : title.length > 18 ? 76 : 92;

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
          fontFamily: "Noto Serif SC",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 20,
            color: "#a0978a",
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          <span
            style={{ width: 32, height: 2, background: "#d4a84a", display: "block" }}
          />
          <span>04 / diary</span>
          {dateLabel && <span style={{ color: "#d4a84a" }}>·</span>}
          {dateLabel && <span>{dateLabel}</span>}
        </div>

        {/* Title */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            fontSize: titleSize,
            lineHeight: 1.15,
            letterSpacing: -1,
            fontWeight: 400,
            color: "#f3eee0",
            maxWidth: 1040,
          }}
        >
          {title}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 56,
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 22,
            color: "#a0978a",
            letterSpacing: 3,
          }}
        >
          <span
            style={{
              width: 11,
              height: 11,
              background: "#d4a84a",
              transform: "rotate(45deg)",
              display: "block",
            }}
          />
          <span style={{ color: "#f3eee0" }}>yolklab</span>
          <span>·</span>
          <span>diary</span>
          <span style={{ marginLeft: "auto" }}>yolklab.net</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Noto Serif SC",
          data: fontData,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
