/// <reference types="@cloudflare/workers-types" />

/**
 * A service that exposes objects, not endpoints, using Workers RPC.
 *
 * Microservices have always paid a tax that had nothing to do with the problem
 * being solved: every call between two services is an HTTP request, so every
 * call serializes to JSON, crosses a socket, and costs a round trip. That tax is
 * why service APIs drift coarse. Nobody ships `getCart()` then `cart.items()`
 * then `item.product()` across a network boundary, so instead someone writes
 * `getCartWithItemsAndProducts()`, and six months later there are four
 * near-identical aggregate endpoints because each caller wanted a slightly
 * different subset.
 *
 * Workers RPC removes the tax rather than working around it. A method on a class
 * extending `WorkerEntrypoint` is called with `await env.BINDING.method(args)`
 * and there is no HTTP request underneath. Arguments and return values are
 * structured-cloned, so `Date`, `Map`, `Set`, `ArrayBuffer`, and cyclic
 * structures all survive, and none of them need a codec. Errors thrown remotely
 * are thrown locally, with the remote stack attached.
 *
 * Two capabilities follow from that, and they are what actually changes the
 * design:
 *
 *   1. A method can return a live object. Return an instance of a class
 *      extending `RpcTarget` and the caller receives a stub: calling a method on
 *      the stub calls it on the real object, which is still alive on this side,
 *      holding whatever state it holds. That is a session, not a payload.
 *
 *   2. Calls pipeline. The caller can invoke a method on the promise for a stub
 *      without awaiting it first, and both hops travel together. So the fine
 *      grained API is the cheap one, and the aggregate endpoint stops being
 *      necessary.
 *
 * Two rules the runtime enforces, both worth knowing before the first
 * production incident rather than after:
 *
 *   - Only class methods are exposed. A class property holding an arrow function
 *     is not callable over RPC, which reads as an inexplicable "not a function"
 *     at the call site. Prototype methods only.
 *   - Stubs are scoped to the I/O context that created them. A stub cannot be
 *     stashed in a module-level variable and used by a later request; it is
 *     invalid the moment the request that created it ends.
 *
 * Pinned to @cloudflare/workers-types@5.20260719.1, wrangler 4.112.0,
 * compatibility_date 2026-07-01.
 *
 * Matching wrangler.jsonc for this service:
 *
 * {
 *   "name": "blank-catalog",
 *   "main": "src/catalog/catalog-service.ts",
 *   "compatibility_date": "2026-07-01",
 *   "d1_databases": [
 *     { "binding": "CATALOG_DB", "database_name": "catalog", "database_id": "..." }
 *   ]
 * }
 */

import { RpcTarget, WorkerEntrypoint } from "cloudflare:workers";

export type CatalogEnv = {
  CATALOG_DB: D1Database;
};

export type Product = {
  id: string;
  title: string;
  priceMinor: number;
  currency: string;
};

export type PriceBreakdown = {
  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;
  currency: string;
};

/**
 * A per-caller session object.
 *
 * It holds the resolved locale and currency once, so the twenty calls a page
 * render makes do not each re-resolve them, and the caller cannot forget to pass
 * them. On an HTTP API this would be a token the caller threads through every
 * request, or a header everyone forgets on one route.
 *
 * The disposer runs when the caller disposes its stub, or when the caller's
 * request ends and the runtime disposes it for them.
 */
export class CatalogSession extends RpcTarget {
  #db: D1Database;
  #locale: string;
  #currency: string;
  #reads = 0;

  constructor(db: D1Database, locale: string, currency: string) {
    super();
    this.#db = db;
    this.#locale = locale;
    this.#currency = currency;
  }

  // A getter is readable over RPC as a property access, which is why the
  // read counter is exposed this way rather than as a getReads() method.
  get currency(): string {
    return this.#currency;
  }

  get reads(): number {
    return this.#reads;
  }

  async product(id: string): Promise<Product | null> {
    this.#reads += 1;
    const row = await this.#db
      .prepare(
        "SELECT id, title, price_minor AS priceMinor FROM products WHERE id = ?1 AND locale = ?2",
      )
      .bind(id, this.#locale)
      .first<Omit<Product, "currency">>();
    return row ? { ...row, currency: this.#currency } : null;
  }

  /**
   * Returns a Map, deliberately. Structured clone carries it intact, so the
   * caller gets the lookup structure it wanted instead of an array it has to
   * rebuild into one, and nothing about this signature would survive JSON.
   */
  async products(ids: string[]): Promise<Map<string, Product>> {
    this.#reads += 1;
    const capped = ids.slice(0, 100);
    if (capped.length === 0) return new Map();

    const placeholders = capped.map((_, i) => `?${i + 1}`).join(",");
    const { results } = await this.#db
      .prepare(
        `SELECT id, title, price_minor AS priceMinor
           FROM products
          WHERE id IN (${placeholders}) AND locale = ?${capped.length + 1}`,
      )
      .bind(...capped, this.#locale)
      .all<Omit<Product, "currency">>();

    return new Map(
      results.map((row) => [row.id, { ...row, currency: this.#currency }]),
    );
  }

  /**
   * Returns another RpcTarget, which is where this stops being a fancier fetch.
   * The caller gets a stub for a cart that lives here, and can pipeline calls
   * into it in the same round trip that created it.
   */
  async cart(cartId: string): Promise<Cart> {
    return new Cart(this.#db, cartId, this.#currency);
  }

  // Called when the caller's stub is disposed, or when its request ends.
  // Flush metrics here; do not do anything that must not be skipped, because a
  // disconnecting client is exactly when you want to be sure, and this is not.
  [Symbol.dispose](): void {
    console.log("catalog session closed", {
      locale: this.#locale,
      reads: this.#reads,
    });
  }
}

export class Cart extends RpcTarget {
  #db: D1Database;
  #cartId: string;
  #currency: string;

  constructor(db: D1Database, cartId: string, currency: string) {
    super();
    this.#db = db;
    this.#cartId = cartId;
    this.#currency = currency;
  }

  async lineCount(): Promise<number> {
    const row = await this.#db
      .prepare("SELECT COUNT(*) AS n FROM cart_lines WHERE cart_id = ?1")
      .bind(this.#cartId)
      .first<{ n: number }>();
    return row?.n ?? 0;
  }

  async total(): Promise<PriceBreakdown> {
    const row = await this.#db
      .prepare(
        `SELECT COALESCE(SUM(p.price_minor * l.quantity), 0) AS subtotalMinor
           FROM cart_lines l
           JOIN products p ON p.id = l.product_id
          WHERE l.cart_id = ?1`,
      )
      .bind(this.#cartId)
      .first<{ subtotalMinor: number }>();

    const subtotalMinor = row?.subtotalMinor ?? 0;
    const taxMinor = Math.round(subtotalMinor * 0.2);
    return {
      subtotalMinor,
      taxMinor,
      totalMinor: subtotalMinor + taxMinor,
      currency: this.#currency,
    };
  }
}

export default class CatalogService extends WorkerEntrypoint<CatalogEnv> {
  /**
   * The entry point callers reach through their service binding.
   *
   * `session` is a normal prototype method, so it is exposed. Writing it as
   * `session = async (locale: string) => ...` would type-check, deploy, and then
   * fail at every call site with "session is not a function", because class
   * property arrow functions are not on the prototype and RPC only exposes the
   * prototype.
   */
  async session(locale: string, currency = "USD"): Promise<CatalogSession> {
    return new CatalogSession(this.env.CATALOG_DB, locale, currency);
  }

  /**
   * Fire and forget work, kept on this side of the boundary.
   *
   * `this.ctx.waitUntil` extends this Worker's lifetime, not the caller's, so
   * the caller's response is not held open by it. The caller doing its own
   * waitUntil around an RPC call would instead be waiting on a promise whose
   * work is happening in another isolate.
   */
  async recordImpression(productId: string): Promise<void> {
    this.ctx.waitUntil(
      this.env.CATALOG_DB.prepare(
        "INSERT INTO impressions (product_id, at) VALUES (?1, ?2)",
      )
        .bind(productId, Date.now())
        .run(),
    );
  }

  // A default fetch keeps the Worker deployable and probeable on its own URL.
  // RPC callers never reach it.
  override async fetch(): Promise<Response> {
    return new Response("catalog: rpc only", { status: 404 });
  }
}
