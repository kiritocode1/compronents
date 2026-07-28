/// <reference types="@cloudflare/workers-types" />

/**
 * Workers HTTP Cache: tag responses on the way out, purge them by tag from
 * inside the Worker when the underlying data changes.
 *
 * This is not the old `caches.default` / Cache API pattern. Setting
 * `cache: { enabled: true }` in Wrangler config puts an HTTP cache IN FRONT of
 * the `fetch` handler, so a hit is served without invoking the Worker at all
 * (and without billing CPU time for it). Your job shrinks to two things: emit
 * correct `Cache-Control` plus `Cache-Tag` headers, and purge tags on write.
 *
 * Version notes:
 * - `ctx.cache` landed in workerd on 2026-04-21, typed as `CacheContext` in
 *   @cloudflare/workers-types (`purge({ tags, pathPrefixes, purgeEverything })`).
 * - The `cache: { enabled: true }` Wrangler config option shipped in
 *   Wrangler 4.89.0 (2026-05-07).
 * - Per-export cache overrides via the `exports` map shipped in Wrangler 4.107.0
 *   (2026-07-02), so a WorkerEntrypoint can opt out while the default stays cached.
 * - `ctx.cache` is optional on `ExecutionContext`, so guard it. Outside a fetch
 *   scope, import `cache` from `cloudflare:workers` instead (used in `queue` below).
 *
 * Pinned to @cloudflare/workers-types@5.20260719.1 and wrangler@4.112.0.
 *
 * Matching wrangler.jsonc:
 *
 * {
 *   "name": "blank-catalog",
 *   "main": "src/catalog/worker.ts",
 *   "compatibility_date": "2026-07-01",
 *   "cache": { "enabled": true, "cross_version_cache": true },
 *   "exports": {
 *     "default": { "type": "worker", "cache": { "enabled": true } },
 *     "Admin": { "type": "worker", "cache": { "enabled": false } }
 *   },
 *   "kv_namespaces": [{ "binding": "CATALOG", "id": "<catalog-namespace-id>" }]
 * }
 */

import { cache, WorkerEntrypoint } from "cloudflare:workers";

export type CatalogEnv = {
  CATALOG: KVNamespace;
  ADMIN_TOKEN: string;
};

export type Product = {
  id: string;
  title: string;
  collections: string[];
  priceCents: number;
};

/**
 * Tag vocabulary. Keep it small and derived, never ad hoc: every tag you emit is
 * a purge handle you have to remember to pull later.
 */
const tagsFor = (product: Product) => [
  "catalog",
  `product:${product.id}`,
  ...product.collections.map((slug) => `collection:${slug}`),
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const match = /^\/products\/([\w-]+)$/.exec(url.pathname);
    if (!match) return new Response("Not found", { status: 404 });

    // Only GET and HEAD are cacheable; anything else bypasses the cache entirely,
    // so a mutation route never needs to think about invalidation on the way in.
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405 });
    }

    const product = await env.CATALOG.get<Product>(match[1], "json");
    if (!product) {
      // Negative results get a short TTL and a tag, so publishing the product
      // later can invalidate the 404 instead of waiting it out.
      return new Response("Not found", {
        status: 404,
        headers: {
          "cache-control": "public, max-age=30",
          "cache-tag": `catalog,product:${match[1]}`,
        },
      });
    }

    return new Response(JSON.stringify(product), {
      headers: {
        "content-type": "application/json",
        // stale-while-revalidate keeps the edge serving instantly while the
        // Worker refreshes in the background after the max-age expires.
        "cache-control": "public, max-age=300, stale-while-revalidate=600",
        // Comma separated. This header is stripped before the response reaches
        // the client; it exists only so ctx.cache.purge can find the entry.
        "cache-tag": tagsFor(product).join(","),
        vary: "accept-encoding",
      },
    });
  },

  /**
   * Purge from a queue consumer. There is no `ctx.cache` here, so the module
   * level `cache` binding from `cloudflare:workers` is the way in.
   */
  async queue(
    batch: MessageBatch<{ productId: string; collections: string[] }>,
  ) {
    const tags = new Set<string>();
    for (const message of batch.messages) {
      tags.add(`product:${message.body.productId}`);
      for (const slug of message.body.collections) {
        tags.add(`collection:${slug}`);
      }
    }

    const result = await cache.purge({ tags: [...tags] });
    if (result.errors.length > 0) {
      // Retry the whole batch: a partially purged catalog serves stale prices.
      batch.retryAll();
    }
  },
} satisfies ExportedHandler<
  CatalogEnv,
  { productId: string; collections: string[] }
>;

/**
 * Admin entrypoint. Its `exports` entry sets `cache: { enabled: false }`, so
 * writes and previews are never served from the shared HTTP cache even though
 * the Worker as a whole has caching on.
 */
export class Admin extends WorkerEntrypoint<CatalogEnv> {
  override async fetch(request: Request): Promise<Response> {
    if (
      request.headers.get("authorization") !== `Bearer ${this.env.ADMIN_TOKEN}`
    ) {
      return new Response("Unauthorized", { status: 401 });
    }

    const product = (await request.json()) as Product;
    await this.env.CATALOG.put(product.id, JSON.stringify(product));

    // Purge the product and every collection it appears in. Tag purge is
    // eventually consistent, so treat the returned errors as a retry signal
    // rather than assuming the write is immediately visible everywhere.
    const result = await this.ctx.cache!.purge({ tags: tagsFor(product) });

    return new Response(
      JSON.stringify({ id: product.id, purged: result.errors.length === 0 }),
      {
        status: result.errors.length === 0 ? 200 : 502,
        headers: { "content-type": "application/json" },
      },
    );
  }

  /** Nuclear option, for a schema migration that reshapes every response body. */
  async purgeCatalog(): Promise<number> {
    const result = await this.ctx.cache!.purge({
      pathPrefixes: ["/products/"],
    });
    return result.errors.length;
  }
}
