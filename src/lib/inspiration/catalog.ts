import { createHash } from "node:crypto";
import { inspirationGroups } from "../inspiration.ts";
import { inspirationPickId } from "../inspiration-id.ts";
import { resolveFacets } from "../inspiration-meta.ts";
import type { Resource } from "./types.ts";

/** Derive a license token from description text. Descriptions state it
 *  inconsistently ("MIT licensed", "Apache-2.0", "license not stated"), so an
 *  explicit allowlist with an "unknown" default beats null. */
export function deriveLicense(description: string): string {
  const text = description;
  if (/\bmit\b/i.test(text)) return "mit";
  if (/apache[-\s]?2\.0/i.test(text)) return "apache-2.0";
  if (/\bgpl\b/i.test(text)) return "gpl";
  if (/\bbsd\b/i.test(text)) return "bsd";
  if (/\bisc\b/i.test(text)) return "isc";
  if (/\bcc0\b/i.test(text)) return "cc0";
  if (/polyform/i.test(text)) return "polyform-noncommercial";
  if (/commercial/i.test(text)) return "commercial";
  return "unknown";
}

/** Preserve path case, meaningful queries and trailing slashes. Only strip tracking. */
export function canonicalUrl(input: string): string {
  const url = new URL(input);
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.username ||
    url.password
  ) {
    throw new Error("A public HTTP URL without credentials is required.");
  }
  url.hash = "";
  for (const key of [...url.searchParams.keys()]) {
    if (/^(utm_.+|fbclid|gclid)$/i.test(key)) url.searchParams.delete(key);
  }
  return url.toString();
}

export function resourceId(href: string): string {
  return `res_${createHash("sha256").update(canonicalUrl(href)).digest("hex").slice(0, 24)}`;
}

export function resourceText(resource: Resource): string {
  return [
    resource.title,
    resource.href,
    resource.description,
    ...resource.kind,
    ...resource.stack,
    ...resource.useFor,
  ].join(" ");
}

let catalog: Resource[] | undefined;
export function seedCatalog(): Resource[] {
  if (catalog) return catalog;
  const byUrl = new Map<string, Resource>();
  for (const group of inspirationGroups) {
    for (const link of group.links) {
      const href = canonicalUrl(link.href);
      const alias = inspirationPickId(link.title, link.href);
      const previous = byUrl.get(href);
      if (previous) {
        previous.categories = [
          ...new Set([...previous.categories, group.title]),
        ];
        previous.aliases = [...new Set([...previous.aliases, alias])];
        continue;
      }
      const facets = resolveFacets(group.title, link);
      const description = link.description ?? "";
      byUrl.set(href, {
        id: resourceId(href),
        aliases: [alias],
        title: link.title,
        href,
        description,
        categories: [group.title],
        dateAdded: link.dateAdded,
        kind: link.kind
          ? Array.isArray(link.kind)
            ? link.kind
            : [link.kind]
          : [],
        stack: link.stack ?? [],
        useFor: link.useFor ?? [],
        license: deriveLicense(description),
        inferred: {
          kind: facets.kind,
          stack: facets.stack,
          useFor: facets.useFor,
        },
      });
    }
  }
  catalog = [...byUrl.values()];
  return catalog;
}
