import { attachDatabasePool, waitUntil } from "@vercel/functions";
import { Pool } from "pg";
import { getRequestContext, requireRequestContext } from "./request-context";

/**
 * Instance lifecycle under Fluid compute: pool attachment across suspension,
 * the real boundary of `waitUntil`, and the uncaught-exception behaviour that
 * changed underneath handlers written for classic serverless.
 *
 * Verified against @vercel/functions 3.7.5 and the Fluid compute docs
 * (last updated 2026-07-01).
 */

/**
 * SUSPENSION, AND WHY attachDatabasePool EXISTS
 *
 * A Fluid instance is not torn down after a response. It goes idle and can be
 * suspended, then resumed for a later invocation. That is what makes the pool a
 * genuine pool again after years of serverless advice to avoid them, and it is
 * also what breaks a pool that nobody told about the suspension.
 *
 * Pool eviction is driven by timers: `idleTimeoutMillis` in pg,
 * `maxIdleTimeMS` in the MongoDB driver, `idleTimeout` in mysql2 and mariadb. A
 * suspended instance does not run timers. The socket, meanwhile, is a live TCP
 * connection with a server on the other end that has its own idle limits and no
 * knowledge of any of this. Postgres holds a backend process per connection and
 * counts it against `max_connections` the whole time.
 *
 * `attachDatabasePool(pool)` closes that gap. The 3.7.5 JSDoc is precise about
 * the mechanism, more so than the docs page: it "ensures that the current
 * function instance stays alive long enough for idle database connections to be
 * removed from the pool". The instance is held open until the pool's own idle
 * eviction has actually run, so what suspends has no idle clients left in it.
 * Skip the call and each suspend can strand connections that the pool believes
 * are still available, until the database starts refusing new ones and the
 * symptom shows up as "too many clients already" on a deployment whose traffic
 * did not change.
 *
 * Supported pool types, from the docs and confirmed by the `DbPool` union in
 * the shipped types: PostgreSQL (pg), MySQL2, MariaDB, MongoDB, Redis
 * (ioredis), and Cassandra (cassandra-driver). The union also carries a plain
 * MySQL shape. Detection is duck-typed rather than nominal, so per the JSDoc
 * you "can pass in any object with a compatible interface", which in practice
 * means a pool exposing `on('release', ...)` plus an idle-timeout option. That
 * cuts both ways: an unrecognised object is not a type error and not a runtime
 * error, it is a silent no-op. If you wrap or proxy your pool, attach the
 * underlying driver pool, not the wrapper.
 *
 * `attachDatabasePool` is still marked `@experimental` in the 3.7.5 types. The
 * older `experimental_attachDatabasePool` alias is exported but deprecated, so
 * the unprefixed name is the one to call.
 */

/**
 * The pool is module scope, and that is correct. Module scope is only dangerous
 * for values that differ per request (see request-context.ts). A pool is
 * request-independent infrastructure, and hoisting it is the entire point: a
 * Fluid instance serving concurrent invocations reuses these connections
 * instead of opening one per request.
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  /**
   * Size this against instances multiplied by connections, not requests
   * multiplied by connections. Fluid concurrency means one instance can hold
   * several in-flight queries, so a small max per instance is usually right,
   * and a pooler such as PgBouncer or Prisma Accelerate is still the answer
   * above a few instances.
   */
  max: 10,
  /** Must be well under the database's own idle timeout and any proxy's. */
  idleTimeoutMillis: 10_000,
});

/**
 * Immediately after construction, as the docs instruct: "Call this function
 * right after creating a database pool". Not inside a handler, not lazily on
 * first query. Attaching per request registers listeners repeatedly on the same
 * pool.
 */
attachDatabasePool(pool);

/**
 * BACKGROUND WORK: WHERE THE BOUNDARY ACTUALLY IS
 *
 * `waitUntil` reads like a job queue and is not one. The docs state the
 * constraint in two sentences: "Promises passed to `waitUntil()` will have the
 * same timeout as the function itself. If the function times out, the promises
 * will be cancelled."
 *
 * Both halves matter.
 *
 * Same timeout means the budget is shared, not extended. On Fluid defaults that
 * is 300s by default with an 800s maximum on Pro and Enterprise, and a handler
 * that spent 280 of it does not hand a fresh 300 to the background promise. It
 * hands over whatever is left.
 *
 * Cancelled means cancelled without a completion signal you will see. The
 * response already went out with a 200. The client is gone. Nothing retries.
 * There is no dead-letter queue and no failed invocation in the dashboard,
 * because from the platform's perspective the request succeeded. The work
 * simply did not happen, and you find out when the numbers do not reconcile.
 *
 * This is exactly why the pattern is so appealing and so damaging. It is
 * reached for precisely when the work must not block the response, which
 * correlates almost perfectly with work that must not be lost: outbound
 * webhooks, audit and compliance rows, billing and usage meters, payment
 * reconciliation, search index updates, welcome emails.
 *
 * The line to hold:
 *
 *   SAFE for waitUntil / after: best-effort, short, idempotent, and tolerable
 *   to lose. Analytics events, log shipping, cache warming, a metrics
 *   increment, an optional CDN purge. If losing one in a thousand is a
 *   rounding error, it belongs here.
 *
 *   NOT SAFE: anything with a durability, ordering, or retry requirement.
 *   Anything a customer or an auditor would notice missing. Anything that
 *   writes money. Anything you would have written a retry loop for if it were
 *   inline.
 *
 * For the second category the correct move is to commit a durable record inside
 * the request, transactionally with the write that caused it, and let a
 * consumer do the work. See the Vercel Queue Consumer Groups entry in this
 * registry for that shape, or Vercel Workflows, which the Fluid docs point to
 * for "workloads that require unlimited execution time" and which can "pause,
 * resume, and maintain state for minutes to months without duration limits".
 * The insert is a few milliseconds and it is on the right side of the
 * durability boundary.
 */

/** Best-effort. Losing one of these costs a row in an analytics table. */
async function recordPageView(path: string, requestId: string): Promise<void> {
  await fetch("https://analytics.internal.example.com/v1/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ path, requestId, at: Date.now() }),
  });
}

export function trackPageView(path: string): void {
  const ctx = getRequestContext();
  if (!ctx) return;

  /**
   * Scheduled from inside the request's async context, so the AsyncLocalStorage
   * store is captured and `ctx` here is this request's, not a neighbour's.
   * Scheduling background work from module scope loses that binding, which is
   * the same leak class as a module-level `currentUser`.
   *
   * The rejection handler is not decoration. An unhandled rejection inside a
   * `waitUntil` promise reaches the process-level handler discussed below.
   */
  waitUntil(
    recordPageView(path, ctx.requestId).catch((error: unknown) => {
      console.error("analytics.page_view failed", {
        requestId: ctx.requestId,
        error,
      });
    }),
  );
}

/**
 * The same work under Next.js 15.1 or above, where the docs recommend
 * "using the built-in `after()` function from `next/server` instead of
 * `waitUntil()`". Two properties are worth knowing:
 *
 *   - "`after()` does not block the response. The callback runs once rendering
 *     or the response is finished." It runs after the response, whereas
 *     `waitUntil` only extends the handler's lifetime around a promise you have
 *     already started.
 *   - "`after()` is not a Dynamic API; calling it does not cause a route to
 *     become dynamic." So a statically prerendered page or a cached route
 *     handler can log, meter, or warm a cache without giving up its caching,
 *     which was the usual reason people avoided it.
 *
 * `after()` is subject to the same duration budget. Choosing it over
 * `waitUntil` changes the ergonomics and the prerender interaction, not the
 * durability. The queue boundary above is unchanged.
 *
 * ```ts
 * import { after } from "next/server";
 *
 * export async function GET(request: Request) {
 *   const body = await render(request);
 *   after(async () => {
 *     await recordPageView(new URL(request.url).pathname, requestId);
 *   });
 *   return Response.json(body);
 * }
 * ```
 */

/**
 * The durable side of the boundary, for contrast. The event row is written in
 * the same transaction as the domain write, so it commits or rolls back with
 * it, and no background task can drop it. A consumer picks it up.
 */
export async function enqueueDurable(
  topic: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const { requestId } = requireRequestContext();
  const client = await pool.connect();
  try {
    await client.query(
      `insert into outbox (topic, payload, request_id) values ($1, $2, $3)`,
      [topic, JSON.stringify(payload), requestId],
    );
  } finally {
    /**
     * Release in a finally, always. Under Fluid a leaked client is not
     * reclaimed by the process exiting after the response, because the process
     * does not exit. It is held until the pool's idle logic reaps it, and a
     * client checked out and never released is never idle, so it is never
     * reaped. Leak `max` of them and the instance deadlocks on its own pool
     * while every request on it hangs until the duration limit.
     */
    client.release();
  }
}

/**
 * UNCAUGHT EXCEPTIONS BEHAVE DIFFERENTLY NOW
 *
 * The docs: "When uncaught exceptions or unhandled rejections happen in
 * Node.js, Fluid compute logs the error and lets current requests finish before
 * stopping the process. This means one broken request won't crash other
 * requests running on the same instance."
 *
 * Read that carefully, because it is easy to over-read in either direction. The
 * process does still stop. What changed is that it drains first: in-flight
 * requests belonging to other users complete normally rather than dying with
 * the one that threw. The feature list calls this error isolation, "Unhandled
 * errors won't crash other concurrent requests running on the same instance".
 *
 * Two consequences for code carried over from classic serverless:
 *
 *   1. A `process.on("uncaughtException", ...)` handler installed to flush logs
 *      or notify an error tracker now runs while other users' requests are
 *      still being served on the same process. Anything it does that is not
 *      confined to the failing request, resetting a module-level cache,
 *      calling `pool.end()`, mutating shared config, tearing down a client,
 *      damages requests that were fine. Worse, calling `process.exit()` in that
 *      handler, which was harmless when the instance served one request, now
 *      kills in-flight requests belonging to other users and converts an
 *      isolated bug into a burst of 500s.
 *
 *   2. Do not treat the platform's draining as error handling. It is a crash,
 *      logged, with a graceful shutdown attached. Handle errors in the handler,
 *      where the request context is still available and the response can be a
 *      500 with a request id rather than a dropped connection.
 *
 * If you keep a process-level handler, keep it read-only:
 *
 *   process.on("uncaughtException", (err) => {
 *     logger.fatal({ err }, "uncaught");   // log only
 *     // no process.exit(), no pool.end(), no shared-state mutation
 *   });
 *
 * `pool.end()` in particular belongs nowhere in a Fluid function. The pool is
 * meant to outlive the request and survive suspension, and `attachDatabasePool`
 * already handles the part of the lifecycle that needs handling.
 */
