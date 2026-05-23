/**
 * Fetch a SUBSETTED TTF (only the glyphs in `text`) from Google Fonts for use
 * in next/og `ImageResponse`.
 *
 * Satori (the engine behind next/og) parses only TTF/OTF — not woff2. Google
 * picks the format from the User-Agent: modern browsers get woff2, old IE gets
 * EOT, old Safari gets SVG. A generic/unknown UA makes Google fall back to
 * plain TTF (`format('truetype')`, sfnt magic 0x00010000), which Satori needs.
 *
 * Subsetting via `text=` keeps CJK fonts tiny (only the requested characters),
 * so this is cheap to run at build time per image.
 */
export async function loadGoogleFontTTF(
  family: string,
  text: string,
): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css?family=${encodeURIComponent(
    family,
  )}&text=${encodeURIComponent(text)}`;
  const css = await (
    await fetch(url, { headers: { "User-Agent": "curl/8.0.0" } })
  ).text();
  const match =
    css.match(/src:\s*url\(([^)]+)\)\s*format\(['"]truetype['"]\)/) ??
    css.match(/src:\s*url\(([^)]+)\)/);
  if (!match) {
    throw new Error(`Could not extract TTF url from Google Fonts CSS for ${family}`);
  }
  return await (await fetch(match[1])).arrayBuffer();
}
