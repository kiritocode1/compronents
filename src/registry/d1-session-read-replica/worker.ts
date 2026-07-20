/// <reference types="@cloudflare/workers-types" />

/**
 * Write, redirect, read: the flow D1 read replication gets wrong by default.
 *
 * The failure is not exotic and it does not look like a database problem. A
 * user posts a note, the handler INSERTs it and answers `303 See Other`, the
 * browser follows to `GET /notes`, and the list comes back without the note
 * they just wrote. Reload and it appears. Every layer looks healthy: the INSERT
 * succeeded, the SELECT succeeded, and nothing in either log line says which
 * database instance answered.
 *
 * What happened is that those are two Worker invocations and therefore two
 * `D1DatabaseSession` objects. D1's sequential consistency guarantee is scoped
 * to one session. The INSERT went to the primary, as every write does
 * regardless of session anchor. The GET opened a fresh session, and a fresh
 * session with no argument is `"first-unconstrained"`, so it was free to land
 * on a replica that had not yet applied the INSERT. Both requests behaved
 * exactly as documented.
 *
 * The fix is one string crossing the redirect. `session.getBookmark()` after
 * the write names the database version that write produced; `withSession(that)`
 * on the read guarantees a database instance at least that current. The
 * carrier has to be `Set-Cookie`, because a browser following a 303 replays
 * cookies and drops the redirect's custom headers. See `session.ts`.
 *
 * Worth being precise about what this does not fix. Sessions are opt in: code
 * that queries the bare binding runs entirely on the primary and has never had
 * this bug. Adopting sessions is what buys replica read latency and, in the
 * same move, creates the staleness this file manages. If you are not carrying
 * bookmarks, you are not ready for the latency win.
 *
 * Enable replication on the database itself (dashboard Settings, or the REST
 * API with `"read_replication": {"mode": "auto"}`); there is no wrangler.jsonc
 * key. Until it is on, everything below runs against the primary and is
 * correct but pointless.
 *
 * Pinned to @cloudflare/workers-types@5.20260719.1 and wrangler@4.112.0.
 *
 * Matching wrangler.jsonc:
 *
 * {
 *   "name": "blank-notes",
 *   "main": "src/notes/worker.ts",
 *   "compatibility_date": "2026-07-01",
 *   "d1_databases": [
 *     { "binding": "DB", "database_name": "blank-notes", "database_id": "<id>" }
 *   ]
 * }
 */

import { ANONYMOUS, openSession, routingOf } from "./session";

export type NotesEnv = {
  DB: D1Database;
};

export type Note = {
  id: string;
  author_id: string;
  body: string;
  created_at: number;
};

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });

/** Stand in for whatever your auth actually is. */
const authorOf = (request: Request) => request.headers.get("x-author-id");

/**
 * The bug, kept around because it is the version most codebases already have.
 *
 * Everything about it is defensible in isolation: it opens a session, it uses
 * `"first-primary"` so the read-modify-write half is correct, and it answers
 * 303 so a refresh does not repost. It just lets the session end without
 * telling anyone what version it produced, so the GET that follows starts from
 * nothing and can read a replica that is behind this INSERT.
 */
export async function createNoteWithoutBookmark(
  request: Request,
  env: NotesEnv,
  authorId: string,
  body: string,
): Promise<Response> {
  const { session } = openSession(env.DB, request, "first-primary");

  await session
    .prepare(
      "INSERT INTO notes (id, author_id, body, created_at) VALUES (?, ?, ?, ?)",
    )
    .bind(crypto.randomUUID(), authorId, body, Date.now())
    .run();

  // The bookmark exists on the session right now and is discarded here.
  return new Response(null, { status: 303, headers: { location: "/notes" } });
}

/**
 * The same handler, committing the bookmark.
 *
 * `"first-primary"` is the right anchor for any route that writes. It is not
 * needed for the INSERT, which goes to the primary either way, but it covers
 * the quota SELECT below: reading a per-author count off a lagging replica and
 * then writing based on it lets an author past the cap, and that is a
 * correctness bug in the write, not a freshness annoyance in a read.
 *
 * `Response.redirect()` is deliberately not used. Its headers are immutable, so
 * `commit` could not attach the cookie, and the throw would land at runtime on
 * the one path that most needs the bookmark.
 */
export async function createNote(
  request: Request,
  env: NotesEnv,
  authorId: string,
  body: string,
): Promise<Response> {
  const { session, commit } = openSession(env.DB, request, "first-primary");

  const quota = await session
    .prepare("SELECT count(*) AS n FROM notes WHERE author_id = ?")
    .bind(authorId)
    .first<{ n: number }>();

  if ((quota?.n ?? 0) >= 500) {
    // commit on the rejection path too. This session read the primary, and the
    // bookmark it produced is a better anchor for the next request than the
    // stale cookie the client is still holding.
    return commit(json({ error: "note_quota_reached" }, { status: 429 }));
  }

  await session
    .prepare(
      "INSERT INTO notes (id, author_id, body, created_at) VALUES (?, ?, ?, ?)",
    )
    .bind(crypto.randomUUID(), authorId, body, Date.now())
    .run();

  return commit(
    new Response(null, { status: 303, headers: { location: "/notes" } }),
  );
}

/**
 * The read half. Anchored to the bookmark the write left behind, so it either
 * finds a replica that has applied the INSERT or falls through to one that has.
 *
 * The fallback matters and is easy to get backwards. A request with no
 * bookmark is a first-time visitor or an expired cookie: there is no write of
 * theirs to be inconsistent with, so `"first-unconstrained"` is correct here
 * and not a compromise. Defaulting to `"first-primary"` instead would route
 * every cold visitor to the primary and quietly undo replication.
 */
export async function listNotes(
  request: Request,
  env: NotesEnv,
  authorId: string,
): Promise<Response> {
  const { session, commit } = openSession(
    env.DB,
    request,
    "first-unconstrained",
  );

  const result = await session
    .prepare(
      "SELECT id, author_id, body, created_at FROM notes WHERE author_id = ? ORDER BY created_at DESC LIMIT 100",
    )
    .bind(authorId)
    .all<Note>();

  // served_by_primary is optional on D1Meta and is absent when replication is
  // off, so undefined means unknown. Logging it is the only way to tell a
  // working replica fleet from one that is silently serving everything from
  // the primary.
  const routing = routingOf(result);
  console.log({ route: "listNotes", rows: result.results.length, ...routing });

  return commit(json({ notes: result.results }));
}

/**
 * Public feed. Anonymous on purpose: it opts out of the caller's bookmark
 * rather than merely lacking one.
 *
 * Passing the visitor's bookmark here would constrain a shared, cacheable page
 * to whichever replicas have caught up with one visitor's private write, which
 * is the cost of replication with none of the benefit. It also skips `commit`,
 * so the response carries no Set-Cookie and stays cacheable.
 */
export async function publicFeed(
  request: Request,
  env: NotesEnv,
): Promise<Response> {
  const { session } = openSession(env.DB, request, ANONYMOUS);

  const result = await session
    .prepare(
      "SELECT id, author_id, body, created_at FROM notes WHERE public = 1 ORDER BY created_at DESC LIMIT 50",
    )
    .all<Note>();

  return json(
    { notes: result.results },
    { headers: { "cache-control": "public, max-age=30" } },
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/feed" && request.method === "GET") {
      return publicFeed(request, env);
    }

    const authorId = authorOf(request);
    if (!authorId) return new Response("Unauthorized", { status: 401 });

    if (url.pathname === "/notes") {
      if (request.method === "GET") return listNotes(request, env, authorId);

      if (request.method === "POST") {
        const form = await request.formData();
        const body = String(form.get("body") ?? "").trim();
        if (body.length === 0)
          return json({ error: "empty_body" }, { status: 400 });
        return createNote(request, env, authorId, body);
      }

      return new Response("Method not allowed", {
        status: 405,
        headers: { allow: "GET, POST" },
      });
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<NotesEnv>;
