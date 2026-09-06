import { createHash } from "node:crypto";
import { inspirationGroups } from "../inspiration.ts";
import { inspirationPickId } from "../inspiration-id.ts";
import { resolveFacets } from "../inspiration-meta.ts";
import type { Resource } from "./types.ts";

/** Preserve path case, meaningful queries and trailing slashes. Only strip tracking. */
export function canonicalUrl(input: string): string {
  const url = new URL(input);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
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
  return [resource.title, resource.href, resource.description, ...resource.kind,
    ...resource.stack, ...resource.useFor].join(" ");
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
        previous.categories = [...new Set([...previous.categories, group.title])];
        previous.aliases = [...new Set([...previous.aliases, alias])];
        continue;
      }
      const facets = resolveFacets(group.title, link);
      byUrl.set(href, {
        id: resourceId(href), aliases: [alias], title: link.title, href,
        description: link.description ?? "", categories: [group.title], dateAdded: link.dateAdded,
        kind: link.kind ? (Array.isArray(link.kind) ? link.kind : [link.kind]) : [], stack: link.stack ?? [], useFor: link.useFor ?? [],
        inferred: { kind: facets.kind, stack: facets.stack, useFor: facets.useFor },
      });
    }
  }
  catalog = [...byUrl.values()];
  return catalog;
}
