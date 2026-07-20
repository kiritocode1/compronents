import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Per-request state that survives Fluid compute's shared-instance execution
 * model.
 *
 * Verified against the Fluid compute docs (last updated 2026-07-01) and
 * @vercel/functions 3.7.5. Fluid is enabled by default for new projects "as of
 * April 23, 2025", so most code written after that date runs under it whether
 * or not anyone opted in.
 *
 * THE CHANGE THAT BREAKS EXISTING CODE
 *
 * Classic serverless gave every invocation its own microVM. One request per
 * process at a time, so module scope was, in practice, request scope: a
 * `let currentUser` at the top of a file was wasteful and confusing, but it was
 * not wrong.
 *
 * Fluid removed that guarantee. The docs, under "Isolation boundaries and
 * global state": "Instead of using a microVM for each function invocation,
 * multiple invocations can share the same physical instance (a global
 * state/process) concurrently." Concurrently is the operative word. Two
 * requests from two different users can be interleaved inside one Node process,
 * inside one module registry, reading and writing the same module-level
 * bindings, with an `await` between every read and every write.
 *
 * The same line of code went from wasteful to a cross-user data leak, with no
 * code change, no dependency bump, and no deprecation warning.
 *
 * THE BROKEN PATTERN
 *
 *   // src/lib/session.ts
 *   let currentUser: User | null = null;              // module scope
 *
 *   export function setCurrentUser(u: User) { currentUser = u; }
 *   export function getCurrentUser() { return currentUser; }
 *
 *   // src/app/api/invoices/route.ts
 *   export async function GET(req: Request) {
 *     setCurrentUser(await authenticate(req));
 *     const rows = await db.invoice.findMany({
 *       where: { orgId: getCurrentUser()!.orgId },  // whose org?
 *     });
 *     return Response.json(rows);
 *   }
 *
 * Request A authenticates as Alice and awaits the database. While that await is
 * pending, the event loop picks up request B on the same instance, which
 * authenticates as Bob and overwrites `currentUser`. Request A resumes and
 * queries with Bob's `orgId`, then returns Bob's invoices to Alice with a 200.
 *
 * This is worth spelling out because of how it fails: it never throws. There is
 * no error to page on, no stack trace, no failed health check. The response is
 * well-formed and belongs to the wrong tenant.
 *
 * WHY IT PASSES EVERY TEST YOU HAVE
 *
 * The bug needs two requests overlapping inside one process. Almost nothing in
 * a normal development loop produces that:
 *
 *   - `next dev` and a browser are one request at a time by hand.
 *   - Unit and integration tests call the handler and await it before calling
 *     it again, which is sequential by construction. A test suite that runs
 *     files in parallel still isolates them into separate workers.
 *   - Preview deployments take too little traffic to co-schedule invocations,
 *     and Fluid "prioritize[s] existing idle resources before allocating new
 *     ones", so low traffic means one request per instance.
 *   - Load tests against a single endpoint often authenticate as one user, so
 *     the value being clobbered is identical every time and the corruption is
 *     invisible.
 *
 * It surfaces in production, under concurrent traffic from distinct users, as a
 * support ticket that says "I can see someone else's data" and does not
 * reproduce. Grep for the shape rather than waiting for the report: any `let`
 * or mutable object at module scope in a file that also touches request data.
 * Common instances beyond the obvious one are a memoized per-tenant database
 * client keyed once at first use, a request id held in a module variable for
 * logging, a "current locale" set by middleware, an unscoped in-memory cache
 * keyed by resource id rather than tenant id, and a mutated singleton SDK
 * client such as `sdk.setAuthToken(token)` on a shared instance.
 *
 * What is still safe at module scope is anything immutable or genuinely
 * request-independent: connection pools, compiled schemas, config read from the
 * environment, and clients whose per-call auth is passed as an argument. The
 * test is not "is it global", it is "does its value depend on which request is
 * running".
 */

export type RequestContext = {
  requestId: string;
  /** Null before authentication resolves. Never widen this to a mutable holder object. */
  actor: { userId: string; orgId: string } | null;
  startedAt: number;
};

/**
 * AsyncLocalStorage is the fix, and it is the reason `node:async_hooks` is the
 * only import in this file: the store is bound to the async execution context
 * of one `run()` call, and every `await`, `.then()`, timer, and stream callback
 * that descends from it sees that store and no other. Concurrent requests on
 * the same instance get different stores from the same ALS object, so there is
 * no shared cell to clobber.
 *
 * The ALS instance itself is module scope, which is correct: it is immutable
 * infrastructure, not request state.
 */
const requestContext = new AsyncLocalStorage<RequestContext>();

/**
 * Wrap the entire handler body. Anything outside the callback, including code
 * that runs before `runWithRequestContext` and anything scheduled with a bare
 * `setTimeout` from outside it, is not in the context and will read undefined.
 */
export function runWithRequestContext<T>(
  seed: Omit<RequestContext, "startedAt">,
  fn: () => Promise<T>,
): Promise<T> {
  return requestContext.run({ ...seed, startedAt: Date.now() }, fn);
}

/**
 * Throws rather than returning undefined. A silent undefined here reproduces
 * the original failure mode: a query that quietly runs unscoped. Callers that
 * legitimately run outside a request, such as a cron entrypoint or a build
 * step, should use `getRequestContext()` and handle the null.
 */
export function requireRequestContext(): RequestContext {
  const ctx = requestContext.getStore();
  if (!ctx) {
    throw new Error(
      "No request context. Wrap the handler body in runWithRequestContext().",
    );
  }
  return ctx;
}

export function getRequestContext(): RequestContext | undefined {
  return requestContext.getStore();
}

/**
 * The one mutation this module allows, and it mutates the store belonging to
 * the current async context rather than a module binding. Authentication
 * usually resolves after the context is created, so the alternative is
 * threading a second `run()` through the handler.
 */
export function setActor(actor: NonNullable<RequestContext["actor"]>): void {
  const ctx = requireRequestContext();
  ctx.actor = actor;
}

/**
 * The tenant scope every query should read from. Deriving it through a function
 * that throws is what turns "returned the wrong tenant's rows" into "threw
 * before touching the database".
 */
export function requireOrgId(): string {
  const { actor } = requireRequestContext();
  if (!actor) throw new Error("Request is not authenticated.");
  return actor.orgId;
}

/**
 * Usage. Note that `withRequestContext` wraps the whole body, so the ALS store
 * is established before any await.
 *
 * ```ts
 * // app/api/invoices/route.ts
 * import { runWithRequestContext, setActor, requireOrgId } from "@/lib/request-context";
 *
 * export async function GET(request: Request) {
 *   return runWithRequestContext(
 *     { requestId: crypto.randomUUID(), actor: null },
 *     async () => {
 *       setActor(await authenticate(request));
 *       const rows = await db.invoice.findMany({ where: { orgId: requireOrgId() } });
 *       return Response.json(rows);
 *     },
 *   );
 * }
 * ```
 *
 * WHEN NOT TO REACH FOR ALS
 *
 * Explicitly passing the context as a parameter is better wherever the call
 * graph is short enough to tolerate it. `findInvoices(ctx, { status })` cannot
 * be called without a context, which the type checker enforces, while ALS
 * enforces nothing at compile time and fails at runtime through
 * `requireRequestContext`. ALS earns its place when the context has to cross a
 * boundary you do not control: a logger, an ORM extension, an instrumentation
 * hook, a third-party middleware that takes no user argument. Use it there and
 * pass arguments everywhere else. Reaching for ALS as the default turns every
 * function into one that can throw at runtime for a reason its signature does
 * not disclose.
 *
 * ALS is also not free. Its cost tracks the number of async resource
 * transitions, not the number of `getStore()` calls, so a hot loop creating
 * many promises inside a context pays more than a handler that reads the store
 * a hundred times. It is cheap enough for request scope and worth measuring
 * before wrapping something tighter.
 *
 * A NOTE ON THE ONE PLACE ALS DOES NOT REACH
 *
 * Work scheduled to outlive the response inherits the context only if it is
 * scheduled from inside it. `waitUntil(doWork())` called inside the callback
 * captures the store, because the promise was created there. A module-scope
 * queue drained by a later invocation does not, which is one more reason the
 * background-work boundary in lifecycle.ts matters.
 */
