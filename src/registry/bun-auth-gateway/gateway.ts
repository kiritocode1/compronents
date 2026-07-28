/**
 * gateway.ts: a miniature auth gateway on pure Bun built-ins.
 *
 * Bun.serve routes for the HTTP surface, req.cookies (Bun.CookieMap) for
 * sessions with automatic Set-Cookie handling, Bun.CSRF tokens bound to the
 * session id, Bun.password (argon2id) for credential hashing, and bun:sqlite
 * for users, sessions, a sliding-window rate limiter, and a request log.
 * Zero npm deps: every piece above ships inside the Bun runtime.
 *
 * run:
 *   bun gateway.ts                  (serves on PORT, default 4010)
 *   bun gateway.ts self-test        (boots on 4011, runs full flow assertions)
 *
 * flow:
 *   POST /auth/signup {email,password}      create account
 *   POST /auth/login  {email,password}      sets httpOnly sid cookie
 *   GET  /me                                 session-protected
 *   GET  /csrf                               token for mutations, bound to sid
 *   POST /api/notes {text} + x-csrf-token    protected mutation
 *   POST /auth/logout + x-csrf-token         destroys session
 *   GET  /admin/logs                         last 20 requests from the log
 */

import { Database } from "bun:sqlite";

const SECRET = process.env.GATEWAY_SECRET ?? Bun.randomUUIDv7();
const SESSION_TTL_SEC = 60 * 60 * 24 * 7;

const db = new Database(
  process.env.GATEWAY_DB ?? `${import.meta.dir}/.gateway.db`,
  { create: true },
);
db.run("PRAGMA journal_mode=WAL");
db.run(
  `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, pw_hash TEXT NOT NULL)`,
);
db.run(
  `CREATE TABLE IF NOT EXISTS sessions (sid TEXT PRIMARY KEY, user_id INTEGER NOT NULL, expires_at REAL NOT NULL)`,
);
db.run(
  `CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, text TEXT NOT NULL)`,
);
db.run(`CREATE TABLE IF NOT EXISTS hits (key TEXT NOT NULL, ts REAL NOT NULL)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_hits ON hits(key, ts)`);
db.run(
  `CREATE TABLE IF NOT EXISTS request_log (ts REAL, method TEXT, path TEXT, status INTEGER, ms REAL, ip TEXT)`,
);

/** Sliding-window rate limiter: count real timestamps in the window, no fixed buckets. */
function rateLimit(key: string, limit: number, windowSec: number): boolean {
  db.run("DELETE FROM hits WHERE key = ? AND ts < unixepoch('subsec') - ?", [
    key,
    windowSec,
  ]);
  const { c } = db
    .query("SELECT count(*) c FROM hits WHERE key = ?")
    .get(key) as { c: number };
  if (c >= limit) return false;
  db.run("INSERT INTO hits (key, ts) VALUES (?, unixepoch('subsec'))", [key]);
  return true;
}

function sessionUser(
  req: Bun.BunRequest,
): { userId: number; sid: string } | null {
  const sid = req.cookies.get("sid");
  if (!sid) return null;
  const row = db
    .query(
      "SELECT user_id FROM sessions WHERE sid = ? AND expires_at > unixepoch('subsec')",
    )
    .get(sid) as { user_id: number } | null;
  return row ? { userId: row.user_id, sid } : null;
}

const csrfSecret = (sid: string) => `${SECRET}:${sid}`;

/** Bun.CSRF.verify throws on an empty token, so treat any throw as invalid. */
function csrfOk(token: string | null, ctx: { sid: string } | null): boolean {
  if (!token || !ctx) return false;
  try {
    return Bun.CSRF.verify(token, { secret: csrfSecret(ctx.sid) });
  } catch {
    return false;
  }
}

type Handler = (
  req: Bun.BunRequest,
  ctx: { userId: number; sid: string },
) => Response | Promise<Response>;

/** Wrap a handler with rate limiting, request logging, and optional session + CSRF checks. */
function guard(
  opts: { auth?: boolean; csrf?: boolean; limit?: number; windowSec?: number },
  handler: Handler,
) {
  return async (req: Bun.BunRequest, server: Bun.Server) => {
    const start = performance.now();
    const path = new URL(req.url).pathname;
    const ip = server.requestIP(req)?.address ?? "unknown";
    let res: Response;
    try {
      if (!rateLimit(`${ip}:${path}`, opts.limit ?? 30, opts.windowSec ?? 10)) {
        res = Response.json(
          { error: "rate limit exceeded, slow down" },
          {
            status: 429,
            headers: { "retry-after": String(opts.windowSec ?? 10) },
          },
        );
      } else {
        const ctx = sessionUser(req);
        if (opts.auth && !ctx) {
          res = Response.json({ error: "sign in first" }, { status: 401 });
        } else if (opts.csrf && !csrfOk(req.headers.get("x-csrf-token"), ctx)) {
          res = Response.json(
            {
              error:
                "missing or invalid CSRF token, fetch a fresh one from GET /csrf",
            },
            { status: 403 },
          );
        } else {
          res = await handler(req, ctx ?? { userId: 0, sid: "" });
        }
      }
    } catch (err) {
      console.error(`[gateway] ${path} threw:`, err);
      res = Response.json({ error: "internal error" }, { status: 500 });
    }
    const ms = performance.now() - start;
    db.run(
      "INSERT INTO request_log VALUES (unixepoch('subsec'), ?, ?, ?, ?, ?)",
      [req.method, path, res.status, ms, ip],
    );
    console.log(
      `[gateway] ${req.method} ${path} ${res.status} ${ms.toFixed(1)}ms ${ip}`,
    );
    return res;
  };
}

export function startGateway(port: number) {
  return Bun.serve({
    port,
    routes: {
      "/auth/signup": {
        POST: guard({ limit: 5 }, async (req) => {
          const { email, password } = (await req
            .json()
            .catch(() => ({}))) as any;
          if (!email?.includes("@") || !password || password.length < 8)
            return Response.json(
              { error: "need a valid email and a password of 8+ characters" },
              { status: 400 },
            );
          const pw_hash = await Bun.password.hash(password);
          try {
            const { id } = db
              .query(
                "INSERT INTO users (email, pw_hash) VALUES (?, ?) RETURNING id",
              )
              .get(email, pw_hash) as any;
            return Response.json({ id, email }, { status: 201 });
          } catch {
            return Response.json(
              { error: "that email is already registered" },
              { status: 409 },
            );
          }
        }),
      },
      "/auth/login": {
        POST: guard({ limit: 5 }, async (req) => {
          const { email, password } = (await req
            .json()
            .catch(() => ({}))) as any;
          const user = db
            .query("SELECT id, pw_hash FROM users WHERE email = ?")
            .get(email ?? "") as any;
          // verify against a dummy hash when the user is unknown so response timing does not leak account existence
          const ok = await Bun.password.verify(
            password ?? "",
            user?.pw_hash ?? DUMMY_HASH,
          );
          if (!user || !ok)
            return Response.json(
              { error: "wrong email or password" },
              { status: 401 },
            );
          const sid = Bun.randomUUIDv7();
          db.run(
            "INSERT INTO sessions (sid, user_id, expires_at) VALUES (?, ?, unixepoch('subsec') + ?)",
            [sid, user.id, SESSION_TTL_SEC],
          );
          req.cookies.set("sid", sid, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: SESSION_TTL_SEC,
            path: "/",
          });
          return Response.json({ ok: true, userId: user.id });
        }),
      },
      "/auth/logout": {
        POST: guard({ auth: true, csrf: true }, (req, { sid }) => {
          db.run("DELETE FROM sessions WHERE sid = ?", [sid]);
          req.cookies.delete("sid");
          return Response.json({ ok: true });
        }),
      },
      "/me": {
        GET: guard({ auth: true }, (_req, { userId }) => {
          const user = db
            .query("SELECT id, email FROM users WHERE id = ?")
            .get(userId) as any;
          return Response.json(user);
        }),
      },
      "/csrf": {
        GET: guard({ auth: true }, (_req, { sid }) =>
          Response.json({
            token: Bun.CSRF.generate(csrfSecret(sid), {
              expiresIn: 60 * 60 * 1000,
            }),
          }),
        ),
      },
      "/api/notes": {
        GET: guard({ auth: true }, (_req, { userId }) =>
          Response.json(
            db
              .query("SELECT id, text FROM notes WHERE user_id = ?")
              .all(userId),
          ),
        ),
        POST: guard({ auth: true, csrf: true }, async (req, { userId }) => {
          const { text } = (await req.json().catch(() => ({}))) as any;
          if (!text?.trim())
            return Response.json(
              { error: "note text is required" },
              { status: 400 },
            );
          const row = db
            .query(
              "INSERT INTO notes (user_id, text) VALUES (?, ?) RETURNING id, text",
            )
            .get(userId, text) as any;
          return Response.json(row, { status: 201 });
        }),
      },
      "/admin/logs": {
        GET: guard({}, () =>
          Response.json(
            db
              .query("SELECT * FROM request_log ORDER BY ts DESC LIMIT 20")
              .all(),
          ),
        ),
      },
      "/*": guard({}, () =>
        Response.json({ error: "no such route" }, { status: 404 }),
      ),
    },
  });
}

const DUMMY_HASH = await Bun.password.hash("timing-equalizer");

if (import.meta.main) {
  const arg = process.argv[2];
  if (arg === "self-test") {
    db.run("DELETE FROM users");
    db.run("DELETE FROM sessions");
    db.run("DELETE FROM notes");
    db.run("DELETE FROM hits");
    db.run("DELETE FROM request_log");
    const server = startGateway(4011);
    const base = "http://localhost:4011";
    const post = (
      path: string,
      body: unknown,
      headers: Record<string, string> = {},
    ) =>
      fetch(base + path, {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "content-type": "application/json", ...headers },
      });
    const assert = (cond: unknown, msg: string) => {
      if (!cond) throw new Error(`self-test failed: ${msg}`);
    };

    let r = await post("/auth/signup", {
      email: "ada@example.com",
      password: "correct-horse",
    });
    assert(r.status === 201, `signup -> ${r.status}`);
    r = await post("/auth/login", {
      email: "ada@example.com",
      password: "wrong-horse",
    });
    assert(r.status === 401, `bad login -> ${r.status}`);
    r = await post("/auth/login", {
      email: "ada@example.com",
      password: "correct-horse",
    });
    assert(r.status === 200, `login -> ${r.status}`);
    const cookie = r.headers.get("set-cookie")!.split(";")[0];
    assert(cookie.startsWith("sid="), "sid cookie set");

    r = await fetch(base + "/me");
    assert(r.status === 401, `unauthenticated /me -> ${r.status}`);
    r = await fetch(base + "/me", { headers: { cookie } });
    assert(
      r.status === 200 && (await r.json()).email === "ada@example.com",
      "/me with session",
    );

    r = await post(
      "/api/notes",
      { text: "csrf should block this" },
      { cookie },
    );
    assert(r.status === 403, `mutation without CSRF -> ${r.status}`);
    const { token } = await (
      await fetch(base + "/csrf", { headers: { cookie } })
    ).json();
    r = await post(
      "/api/notes",
      { text: "ship the gateway" },
      { cookie, "x-csrf-token": token },
    );
    assert(r.status === 201, `mutation with CSRF -> ${r.status}`);
    r = await fetch(base + "/api/notes", { headers: { cookie } });
    assert((await r.json()).length === 1, "note persisted");

    let limited = 0;
    for (let i = 0; i < 8; i++) {
      const rr = await post("/auth/login", {
        email: "ada@example.com",
        password: "wrong-horse",
      });
      if (rr.status === 429) limited++;
    }
    assert(limited >= 3, `rate limiter tripped ${limited} times`);

    r = await post("/auth/logout", {}, { cookie, "x-csrf-token": token });
    assert(r.status === 200, `logout -> ${r.status}`);
    r = await fetch(base + "/me", { headers: { cookie } });
    assert(r.status === 401, "session destroyed after logout");

    const logs = await (await fetch(base + "/admin/logs")).json();
    assert(logs.length >= 15, `request log captured ${logs.length} rows`);

    console.log("gateway self-test: all assertions passed");
    server.stop(true);
    process.exit(0);
  }
  const port = Number(process.env.PORT ?? 4010);
  startGateway(port);
  console.log(`[gateway] listening on http://localhost:${port}`);
}
