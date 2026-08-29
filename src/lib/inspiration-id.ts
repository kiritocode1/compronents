/**
 * Stable pick ids for citation. Agents must echo these so freestyling is visible.
 * Format: insp_<slug> from title + host, deterministic across deploys.
 */

export function inspirationPickId(
  title: string,
  href: string,
): `insp_${string}` {
  const host = safeHost(href);
  const base = slugify(title) || slugify(host) || "item";
  const hostBit = slugify(host.split(".")[0] || "");
  const slug = hostBit && !base.includes(hostBit) ? `${base}-${hostBit}` : base;
  // Trim the slug, not the joined string, so the prefix survives the 80-char cap.
  return `insp_${slug.slice(0, 75)}`;
}

function safeHost(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Parse insp_* ids from agent text for validation. */
export function extractCitedIds(text: string): string[] {
  const matches = text.match(/\binsp_[a-z0-9-]{2,80}\b/g) ?? [];
  return [...new Set(matches)];
}
