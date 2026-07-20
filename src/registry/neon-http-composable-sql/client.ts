import { type NeonQueryFunction, neon } from "@neondatabase/serverless";

/**
 * One-shot HTTP query client for `@neondatabase/serverless` 1.1.0.
 *
 * `neon()` returns a tagged-template function that sends a single query over
 * https instead of opening a Postgres session. There is no connection to pool
 * and nothing to close, which is the only reason it works inside an edge
 * isolate that may be frozen between requests.
 *
 * Three release facts drive this file:
 *
 * 1. 1.0.0 (2025-03-25) made HTTP template queries fully composable, including
 *    parameterized ones. Compilation to raw SQL moved to query time, so a
 *    nested fragment gets its placeholders renumbered against the outer query
 *    rather than colliding at `$1`. See `queries.ts`, which is where that
 *    actually pays off.
 * 2. 1.0.0 also made `sql` callable ONLY as a tagged template. `sql(text)` and
 *    `sql(text, params)` now throw at runtime and fail to typecheck. Both were
 *    legal on 0.x, and the first silently interpolated attacker-controlled
 *    values straight into the SQL string, so the throw is the point. Migrating
 *    from 0.x, every `sql(...)` call site becomes either a template literal or
 *    `sql.query(text, params)`.
 * 3. 1.1.0 (2026-04-09) inlined all type declarations that were previously
 *    re-exported from `@types/pg` and `@types/node`. Runtime behaviour is
 *    unchanged, but code asserting exact type identity with `@types/pg`
 *    exports, augmenting via `declare module "pg"`, or assuming `Buffer` where
 *    the driver now declares `Uint8Array` needs its types updated.
 *
 * What this client cannot do, by construction:
 *
 * - No interactive transactions. Each call is one request, one implicit
 *   transaction. You cannot `BEGIN`, branch on a result, then `COMMIT`.
 *   `sql.transaction([...])` exists but is non-interactive: you hand it every
 *   query up front and it sends them as one batch, so no query can depend on
 *   an earlier query's rows.
 * - No session state. Temp tables, `SET LOCAL`, advisory locks, `LISTEN`, and
 *   prepared statements do not survive between calls, and two calls are not
 *   guaranteed to touch the same backend.
 * - Binary values are hex-encoded and JSON-stringified on the way out, so
 *   large `bytea` payloads are meaningfully more expensive here.
 *
 * Any of those means the WebSocket path instead, from the same package:
 *
 * ```ts
 * import { Pool, neonConfig } from "@neondatabase/serverless";
 * // Only where the `WebSocket` global is undefined (Node.js, per the driver's
 * // CONFIG.md). Edge runtimes provide it, so leave this alone there.
 * // import ws from "ws"; neonConfig.webSocketConstructor = ws;
 * const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 * const client = await pool.connect();
 * try {
 *   await client.query("BEGIN");
 *   // ... reads and writes that depend on each other ...
 *   await client.query("COMMIT");
 * } finally {
 *   client.release();
 * }
 * ```
 */

/**
 * Built once at module scope, not per request. The returned function holds no
 * socket, so an isolate can reuse it across invocations for free, and the
 * connection string is parsed once instead of on every request.
 *
 * `neon()` throws immediately when the connection string is missing or is not
 * a `postgres:` / `postgresql:` URL with user, host, and database. At module
 * scope that surfaces as an isolate that fails to boot, which is louder and
 * cheaper to diagnose than the first request of the day returning a 500.
 */
export const sql: NeonQueryFunction<false, false> = neon(
  process.env.DATABASE_URL!,
  {
    // Default (false): resolve to the row array directly. Turn on only where a
    // caller needs `rowCount` or `fields`, and prefer overriding per query via
    // `sql.query(text, params, { fullResults: true })` over flipping it here,
    // since it changes the resolved shape of every query in the process.
    fullResults: false,
    // Default (false): rows as objects. `true` gives arrays of arrays and drops
    // the column names, which is worth it only for wide result sets you are
    // about to serialize positionally anyway.
    arrayMode: false,
    // Merged into the options passed to the underlying `fetch`. Only put
    // request-independent values here. An `AbortSignal` must NOT go at module
    // scope: one signal shared by every query fires once and then aborts all
    // subsequent queries in the isolate. Use `withDeadline()` below per call.
    fetchOptions: { priority: "high" },
  },
);

/**
 * Per-call options helper for the cases where the module-scope defaults are
 * wrong. Kept as a function so each call gets a fresh `AbortSignal`; a signal
 * built once at module scope would fire once and then abort every later query.
 */
export function withDeadline(ms: number) {
  return { fetchOptions: { signal: AbortSignal.timeout(ms) } };
}

/**
 * `authToken` is the other option worth knowing: a string or a sync/async
 * getter, sent as the `Authorization` header so Neon RLS can evaluate policies
 * against the end user's JWT rather than a single service role. It needs a
 * per-request token, so build that client inside the handler, not here:
 *
 * ```ts
 * const userSql = neon(process.env.DATABASE_URL!, {
 *   authToken: () => getSessionToken(request),
 * });
 * ```
 *
 * Related: 1.0.1 (2025-06-06) added a console warning when a connection is
 * opened in a browser, suppressible with `disableWarningInBrowsers: true`.
 * Suppress it only when you have actually put RLS in front of the database.
 */
