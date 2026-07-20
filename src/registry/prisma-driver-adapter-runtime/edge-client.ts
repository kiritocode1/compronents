/**
 * Serverless and edge runtime client for Prisma Postgres (verified against
 * @prisma/adapter-ppg@7.8.0 and @prisma/ppg@1.0.1, which version separately
 * from the 7.8.0 line).
 *
 * This is the counterpart to `client.ts`, and the split is not a preference.
 * `PrismaPg` wraps a `pg.Pool`, and a pool assumes a process that outlives
 * many requests and can amortise a TCP and TLS handshake across them. Cloudflare
 * Workers, Vercel Edge, Deno Deploy and short-lived Bun or Lambda invocations
 * break both assumptions: isolates are created and discarded on their own
 * schedule, so a pool per isolate multiplies into far more Postgres backends
 * than the connection count suggests, and each cold isolate pays the full
 * handshake anyway.
 *
 * `@prisma/adapter-ppg` uses the Prisma Postgres serverless driver instead of
 * a TCP pool, which is why the pool tuning that dominates `client.ts` has no
 * equivalent here. `PrismaPostgresAdapterConfig` accepts exactly one field,
 * `connectionString: string | URL`, and that is the entire surface. There is no
 * `max`, no connect timeout, and nothing inherited from a Node driver, so the
 * v7 warning about adapters picking up their driver's pool defaults does not
 * apply to this path. Install both packages: the adapter has `@prisma/ppg` as
 * its client library.
 *
 * The connection string is the direct TCP URL from the Prisma Postgres
 * connection details, conventionally `PRISMA_DIRECT_TCP_URL`, not the pooled
 * URL used by the Node client.
 */
import { PrismaPostgresAdapter } from "@prisma/adapter-ppg";

import { PrismaClient } from "../generated/prisma/client";

/**
 * Edge runtimes do not populate `process.env`. In a Cloudflare Worker the
 * bindings arrive as the second argument to `fetch`, and in Vercel Edge
 * functions the values are inlined at build time rather than read from a live
 * process object. Taking the value as an argument is what makes this module
 * portable across all of them, and it is why the Node client can read
 * `process.env` at module scope while this one cannot.
 */
export type EdgeEnv = {
  PRISMA_DIRECT_TCP_URL: string;
};

/**
 * Cached per connection string rather than unconditionally. An isolate is
 * reused across requests when the platform decides to reuse it, so building a
 * client on every request throws away that reuse; keying by URL keeps a
 * preview deployment that swaps databases mid-isolate from serving the old
 * one. A plain Map is enough because an isolate holds a single database in
 * every realistic case, so this never grows.
 */
const clients = new Map<string, PrismaClient>();

export function getPrismaClient(env: EdgeEnv): PrismaClient {
  const connectionString = env.PRISMA_DIRECT_TCP_URL;
  if (!connectionString) {
    throw new Error("PRISMA_DIRECT_TCP_URL is not set");
  }

  const cached = clients.get(connectionString);
  if (cached) return cached;

  const client = new PrismaClient({
    adapter: new PrismaPostgresAdapter({ connectionString }),
  });

  clients.set(connectionString, client);
  return client;
}

/**
 * Cloudflare Workers entry point. Note what is absent: no `$disconnect` in a
 * `finally`, and no `waitUntil` to flush one. Disconnecting would discard the
 * client the next request in this isolate is meant to reuse, and the platform
 * tears the isolate down on its own. This is the inverse of `client.ts`, where
 * skipping `$disconnect` leaks connections.
 *
 * ```ts
 * export default {
 *   async fetch(request: Request, env: EdgeEnv): Promise<Response> {
 *     const prisma = getPrismaClient(env);
 *     const releases = await prisma.release.findMany({ take: 20 });
 *     return Response.json(releases);
 *   },
 * };
 * ```
 *
 * The generated client must be able to run here at all. Point the generator's
 * `output` at a path your edge bundle can import, and keep the import in this
 * file resolving to the generated directory rather than to `@prisma/client`,
 * which in v7 no longer re-exports a client you have generated.
 */
