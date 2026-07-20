/// <reference types="@cloudflare/workers-types" />

/**
 * The calling side, where promise pipelining and stub disposal both live.
 *
 * Everything here is one Worker talking to another through a service binding.
 * The binding is configured with an explicit entrypoint so it resolves to the
 * RPC class rather than the default fetch handler:
 *
 * {
 *   "name": "blank-gateway",
 *   "main": "src/gateway/gateway.ts",
 *   "compatibility_date": "2026-07-01",
 *   "services": [
 *     { "binding": "CATALOG", "service": "blank-catalog", "entrypoint": "CatalogService" }
 *   ]
 * }
 *
 * The two things that go wrong on this side are both invisible until load:
 * awaiting every intermediate stub, which reintroduces exactly the round trips
 * RPC removed, and never disposing a stub, which keeps the remote object and
 * everything it holds alive until the request ends.
 */

import type { CatalogSession, Product } from "./catalog-service.ts";

export type GatewayEnv = {
  CATALOG: Service<import("./catalog-service.ts").default>;
};

export default {
  async fetch(request: Request, env: GatewayEnv): Promise<Response> {
    const url = new URL(request.url);
    const locale = url.searchParams.get("locale") ?? "en-GB";

    // `using` is the whole disposal story. When this block exits, by return or
    // by throw, the stub is disposed and the remote CatalogSession's disposer
    // runs. Without it the session survives until the request ends, which on a
    // long streaming response can be minutes of a remote object held open per
    // in-flight request.
    //
    // This requires "lib": ["ESNext"] and a TypeScript target that emits the
    // explicit resource management helpers; wrangler's default tsconfig has it.
    using session = await env.CATALOG.session(locale, "GBP");

    if (url.pathname === "/cart") {
      return json(await cartSummary(session, requireParam(url, "cartId")));
    }
    return json(
      await productPage(env, session, requireParam(url, "productId")),
    );
  },
} satisfies ExportedHandler<GatewayEnv>;

/**
 * Pipelining, stated as plainly as it can be.
 *
 * `session.cart(id)` returns a promise for a stub. Calling `.total()` on that
 * promise, without awaiting it, tells the runtime to run both on the far side:
 * one round trip, not two. The chain can go as deep as the object graph does.
 *
 * The version that looks identical and is twice as slow:
 *
 *   const cart = await session.cart(cartId);   // round trip 1
 *   const total = await cart.total();          // round trip 2
 *
 * And the version that is four times as slow, because each await is a fresh
 * sequential hop even though nothing depends on the previous result:
 *
 *   const cart = await session.cart(cartId);
 *   const lines = await cart.lineCount();
 *   const total = await cart.total();
 */
async function cartSummary(session: CatalogSession, cartId: string) {
  const cart = session.cart(cartId);

  // Two pipelined chains started before either is awaited, then joined. This is
  // one round trip carrying both calls, not two calls that happen to overlap.
  const [lines, total] = await Promise.all([cart.lineCount(), cart.total()]);

  return { cartId, lines, total };
}

/**
 * The pattern that used to require a bespoke aggregate endpoint.
 *
 * A product page needs the product, its related items, and a session-scoped
 * currency. Over HTTP that is three requests, or one endpoint invented to avoid
 * three requests. Here it is three calls, issued together, and the fine-grained
 * API stays fine-grained.
 */
async function productPage(
  env: GatewayEnv,
  session: CatalogSession,
  productId: string,
) {
  const product = await session.product(productId);
  if (!product) throw new NotFound(`no product ${productId}`);

  // A property getter on the remote object is read like a property. It is still
  // a round trip, so it belongs in the Promise.all rather than on its own line.
  const [related, currency] = await Promise.all([
    session.products(relatedIds(product)),
    session.currency,
  ]);

  // Fire and forget on the remote side. Not awaited here, because awaiting it
  // would make the page wait on an analytics insert; the remote entrypoint
  // holds its own lifetime open with waitUntil.
  void env.CATALOG.recordImpression(productId);

  return {
    product,
    currency,
    // The remote returned a Map and structured clone preserved it, so this is a
    // Map here too and no rehydration step exists to get wrong.
    related: [...related.values()],
  };
}

/**
 * ponytail: a deterministic stub for related products. Replace with the real
 * recommendation source; the call shape above is what this file is about.
 */
function relatedIds(product: Product): string[] {
  return [`${product.id}-alt`, `${product.id}-bundle`];
}

class NotFound extends Error {}

function requireParam(url: URL, name: string): string {
  const value = url.searchParams.get(name);
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
  });
}
