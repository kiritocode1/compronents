/// <reference types="@cloudflare/workers-types" />

/**
 * Bookmark carrier for D1 read replication.
 *
 * D1 replicas are asynchronous, so correctness here is entirely a question of
 * what you anchor a session to and whether that anchor survives to the next
 * request.
 *
 * The facts this file is built on, from @cloudflare/workers-types@5.20260719.1:
 *
 * - `D1Database.withSession(constraintOrBookmark?: D1SessionBookmark |
 *   D1SessionConstraint): D1DatabaseSession`. `D1SessionBookmark` is a bare
 *   `string`, `D1SessionConstraint` is `"first-primary" | "first-unconstrained"`.
 * - `D1DatabaseSession` exposes exactly three members: `prepare()`, `batch()`,
 *   and `getBookmark(): D1SessionBookmark | null`. There is no `exec()` on a
 *   session, and no `close()` or `dispose()`. A session is a routing decision,
 *   not a connection.
 * - `getBookmark()` returns `null` until at least one query has run on the
 *   session. A handler that opens a session and takes an early return path has
 *   nothing to carry forward, which is why `commit` below is a no-op on null
 *   rather than writing an empty cookie over a good one.
 * - Replication is a per-database setting (dashboard Settings, or the REST API
 *   with `"read_replication": {"mode": "auto"}`). There is no wrangler.jsonc
 *   key for it.
 *
 * The two facts that decide the design:
 *
 * 1. Queries issued off the bare binding (`env.DB.prepare(...)`) never touch a
 *    replica. Cloudflare's wording: to use read replication you must use the
 *    Sessions API, otherwise all queries continue to be executed only by the
 *    primary. So a codebase that has never heard of sessions is slow, not
 *    wrong. Adopting sessions is what introduces the possibility of a stale
 *    read, and this file is the part you owe in exchange.
 * 2. Sequential consistency is scoped to one `D1DatabaseSession` object, which
 *    dies with the Worker invocation that made it. A user action that spans two
 *    requests spans two sessions, and the second one is anchored to whatever
 *    you hand `withSession`. Hand it nothing and it defaults to
 *    `"first-unconstrained"`, which is free to serve the request from a replica
 *    that has not yet applied the write the first request made. The bookmark is
 *    the only thing that stitches the two sessions together.
 *
 * Constraint choice per route type:
 *
 * - Write route: `"first-primary"`. Writes are forwarded to the primary no
 *   matter what the session is anchored to, so this constraint buys nothing for
 *   the INSERT itself. It matters for the read half of a read-modify-write: a
 *   handler that SELECTs a row, computes from it, then UPDATEs is only correct
 *   if the SELECT saw the primary. Use `"first-primary"` on any route that
 *   writes, and stop reasoning about which of its statements is the read.
 * - Read-only dashboard, the user's own data: the incoming bookmark, falling
 *   back to `"first-unconstrained"`. This is the route that shows the user their
 *   own writes, so the bookmark is load bearing. First-time visitors with no
 *   cookie have no write to be inconsistent with, so the unconstrained fallback
 *   is correct rather than merely tolerable.
 * - Public cached page: `"first-unconstrained"`, ignoring any bookmark. Anchoring
 *   a public feed to one visitor's bookmark drags that visitor's session onto
 *   whichever replica has caught up, for a page where seconds of lag is the
 *   point of using replicas at all. Pass `ANONYMOUS` explicitly so the choice
 *   reads as deliberate.
 */

export const BOOKMARK_COOKIE = "d1_bookmark";
export const BOOKMARK_HEADER = "x-d1-bookmark";

/** Sentinel meaning "do not read the request's bookmark", for public routes. */
export const ANONYMOUS = Symbol("d1-anonymous-session");

export type SessionAnchor = D1SessionConstraint | typeof ANONYMOUS;

/**
 * A bookmark is opaque, so there is nothing to parse, but it arrives from the
 * client and goes straight into `withSession`. Two things are worth rejecting:
 *
 * - Anything outside a conservative token charset or over a sane length, which
 *   is the usual header and cookie hygiene.
 * - The literal constraint strings. `withSession` takes bookmark and constraint
 *   in the same positional argument, so a client that sends
 *   `x-d1-bookmark: first-primary` promotes itself to primary-only reads and
 *   bypasses the replicas you are paying for. Nothing is corrupted, but the
 *   knob is not the client's to turn.
 */
function parseBookmark(
  raw: string | null | undefined,
): D1SessionBookmark | null {
  if (!raw) return null;
  const value = raw.trim();
  if (value.length === 0 || value.length > 256) return null;
  if (value === "first-primary" || value === "first-unconstrained") return null;
  return /^[\w.:-]+$/.test(value) ? value : null;
}

function bookmarkFromCookies(header: string | null): D1SessionBookmark | null {
  if (!header) return null;
  for (const pair of header.split(";")) {
    const eq = pair.indexOf("=");
    if (eq < 0) continue;
    if (pair.slice(0, eq).trim() !== BOOKMARK_COOKIE) continue;
    return parseBookmark(decodeURIComponent(pair.slice(eq + 1).trim()));
  }
  return null;
}

/**
 * Header first, then cookie. The header is for API clients that hold their own
 * bookmark and want it back in the response; the cookie is for browsers, which
 * cannot hold anything between a 303 and the GET that follows it.
 */
export function readBookmark(request: Request): D1SessionBookmark | null {
  return (
    parseBookmark(request.headers.get(BOOKMARK_HEADER)) ??
    bookmarkFromCookies(request.headers.get("cookie"))
  );
}

export type D1SessionScope = {
  session: D1DatabaseSession;
  /**
   * Writes the session's current bookmark onto a response. Returns a new
   * Response: header mutation on a redirect built by `Response.redirect()`
   * throws, because those headers are immutable.
   */
  commit: (response: Response) => Response;
};

/**
 * Opens a session anchored at the request's bookmark, falling back to
 * `fallback` when there is none, and hands back a `commit` that puts the
 * resulting bookmark on the way out.
 *
 * Call `commit` on every response the handler can return, including the error
 * ones. A dropped bookmark is not a failure you will see in logs: it silently
 * downgrades the next request to unconstrained, and the bug surfaces later as
 * one user occasionally not seeing their own write.
 */
export function openSession(
  db: D1Database,
  request: Request,
  fallback: SessionAnchor = "first-unconstrained",
): D1SessionScope {
  const anchor =
    fallback === ANONYMOUS
      ? "first-unconstrained"
      : (readBookmark(request) ?? fallback);

  const session = db.withSession(anchor);

  return {
    session,
    commit(response) {
      // null means no query ran on this session, so there is no version to
      // pin and the caller's existing cookie is still the better anchor.
      const bookmark = session.getBookmark();
      if (bookmark === null) return response;

      const next = new Response(response.body, response);
      next.headers.set(BOOKMARK_HEADER, bookmark);

      // Set-Cookie is what makes the redirect case work. A browser following a
      // 303 does not forward the redirect response's custom headers to the
      // GET, so `x-d1-bookmark` alone dies at the redirect and the follow-up
      // read lands on an unconstrained session. The cookie is the only carrier
      // the browser will replay for you.
      //
      // SameSite=Lax rather than Strict: Strict withholds the cookie on a
      // top-level navigation from another origin, which is exactly the
      // post-checkout return-from-payment-provider case where read-your-writes
      // matters most.
      //
      // Max-Age is short because a bookmark is a lower bound on database
      // version, not a pin. An old one is weak rather than wrong, so there is
      // nothing to gain from carrying it past the flow that produced it.
      next.headers.append(
        "set-cookie",
        `${BOOKMARK_COOKIE}=${encodeURIComponent(bookmark)}; Path=/; Max-Age=120; HttpOnly; Secure; SameSite=Lax`,
      );

      return next;
    },
  };
}

/**
 * Replica routing is invisible in application logs, so pull it off `D1Meta`
 * when you need to know where a query actually ran. `served_by_primary`,
 * `served_by_region`, and `served_by_colo` are all optional on the type: they
 * are absent on a database without replication enabled, so treat undefined as
 * "unknown", never as "replica".
 */
export function routingOf(result: D1Response): {
  primary: boolean | undefined;
  region: string | undefined;
  colo: string | undefined;
} {
  return {
    primary: result.meta.served_by_primary,
    region: result.meta.served_by_region,
    colo: result.meta.served_by_colo,
  };
}
