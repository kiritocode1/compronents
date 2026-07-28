/**
 * replica-session.ts
 *
 * Read-your-writes for Turso embedded replicas, using the replication frame
 * number as a session watermark.
 *
 * An embedded replica inverts the usual latency model: reads are a local
 * SQLite file (microseconds, no network) and writes go to the remote primary.
 * That inversion is the whole point, and it is also the hazard. Once a write
 * has been acknowledged by the primary, the local file the next read touches
 * has not necessarily pulled it yet, so a user can submit a form and reload
 * into a page that does not contain what they just submitted.
 *
 * Failure modes solved:
 *   1. Stale read of your own write. `client.execute(INSERT ...)` on an
 *      embedded replica returns once the remote primary has committed. The
 *      following `client.execute(SELECT ...)` is answered from the local
 *      replica file, which is only as fresh as its last pull. On one machine
 *      in local development the gap is invisible, because your write and your
 *      read use the same client and the same file. In production the read
 *      lands on a different instance that never pulled, and the row is
 *      missing. This module makes the write return a frame watermark and
 *      makes the read refuse to answer below it.
 *   2. Believing `syncInterval` is read-your-writes. `syncInterval` is a
 *      staleness bound in seconds, not a causal bound: with
 *      `syncInterval: 60`, a read issued 40ms after a write can legitimately
 *      be answered from a 60 second old snapshot. It bounds how old data gets,
 *      never how old data is relative to your own write. Only a watermark
 *      carried from the write to the read expresses causality.
 *   3. `sync()` throwing on a client that is not a replica. On a plain local
 *      `file:` client, `sync()` rejects with `SyncNotSupported("File")` and an
 *      EMPTY `code` property, so a defensive `catch (e) { if (e.code === ...) }`
 *      does not match and the local development configuration crashes on a
 *      code path that never runs in production. Capability is probed once and
 *      cached here; a client that cannot sync is a client that reads the
 *      primary directly, which is already read-your-writes.
 *   4. An unbounded catch-up loop turning a slow read into a hung request.
 *      Waiting for a replica to reach a frame is only correct with a deadline
 *      and a defined action at the deadline. Here the action is to escalate to
 *      the primary and serve a correct slow answer, never a fast wrong one.
 *
 * The primitive that makes this work: `Client.sync()` resolves to
 * `{ frame_no, frames_synced }` (see the `Replicated` type in
 * `@libsql/core/api.d.ts`). `frame_no` is a monotonic position in the
 * primary's replication log, so it is a comparable watermark. Sync after a
 * committed write and the returned `frame_no` is at or past that write; any
 * replica that reaches that number has the write.
 *
 * Client generation: this targets `@libsql/client@0.17.4`, the stable client,
 * because it is the one that exposes the frame number. The newer
 * `@tursodatabase/sync@0.7.1` rewrite offers `pull()`/`push()` and a
 * `remoteWritesExperimental` option documented as pulling after each write for
 * read-your-writes, but that option is marked EXPERIMENTAL in its own types
 * and its `stats()` exposes an opaque `revision` string that "must not be
 * interpreted in any way", so it cannot be compared across machines the way a
 * frame number can.
 *
 * Docs:
 *   https://docs.turso.tech/features/embedded-replicas/introduction
 *   https://github.com/tursodatabase/libsql-client-ts
 *
 * run: bun replica-session.ts
 */

/** A position in the primary's replication log. Monotonic, comparable. */
export type Frame = number;

export interface SyncResult {
  frame_no: number;
  frames_synced: number;
}

/**
 * The subset of `@libsql/client`'s `Client` this module uses. The real client
 * satisfies it structurally, so `createClient({ url, syncUrl, authToken })`
 * can be passed directly with no adapter.
 */
export interface ReplicaClient {
  execute(stmt: unknown): Promise<{ rows: unknown[] }>;
  batch(stmts: unknown[], mode?: string): Promise<unknown[]>;
  sync(): Promise<SyncResult | undefined>;
  readonly protocol: string;
}

// A client either can replicate or cannot; probing costs one round trip, so
// the answer is cached per client instance.
const canSync = new WeakMap<ReplicaClient, boolean>();

/**
 * True when this client is an embedded replica with a pullable log.
 *
 * A plain `file:` client and a purely remote client both reject `sync()`. Both
 * are already read-your-writes (there is one copy of the data, or reads go to
 * the primary), so "cannot sync" is not an error condition, it is a fast path.
 */
export async function isReplica(client: ReplicaClient): Promise<boolean> {
  const cached = canSync.get(client);
  if (cached !== undefined) return cached;
  let supported = false;
  try {
    // Note: a non-replica rejects here with an empty `code`, so the message,
    // not the code, is the only signal. We do not parse it: any rejection
    // means "no replication log to wait on".
    const r = await client.sync();
    supported = r !== undefined;
  } catch {
    supported = false;
  }
  canSync.set(client, supported);
  return supported;
}

/**
 * Commit a write and return the watermark a later read must reach to see it.
 *
 * `mode: "write"` is passed explicitly because `batch()` defaults to
 * `"deferred"`, which is the mode that loses an upgrade race against a
 * concurrent writer (see the Turso Transaction Mode Guard entry).
 *
 * Returns `null` when the client is not a replica: there is nothing to wait
 * for, so callers should not carry a watermark they cannot use.
 */
export async function commitWrite(
  client: ReplicaClient,
  stmts: unknown[],
): Promise<{ results: unknown[]; frame: Frame | null }> {
  const results = await client.batch(stmts, "write");
  if (!(await isReplica(client))) return { results, frame: null };
  // The write is already committed on the primary, so the frame this sync
  // lands on is at or past the write's own frame.
  const synced = await client.sync();
  return { results, frame: synced?.frame_no ?? null };
}

export interface AwaitFrameResult {
  reached: boolean;
  frame: Frame;
  /** Sync calls issued. 0 means the replica was already caught up. */
  syncs: number;
  /** Frames pulled across those syncs, a usable replication lag metric. */
  framesPulled: number;
}

/**
 * Pull until the replica reaches `target`, or the deadline expires.
 *
 * Never throws on lag: a caller that cannot wait needs to choose a fallback,
 * and silently answering from a stale snapshot is the failure this module
 * exists to prevent.
 */
export async function awaitFrame(
  client: ReplicaClient,
  target: Frame,
  options: { timeoutMs?: number; pollMs?: number } = {},
): Promise<AwaitFrameResult> {
  const timeoutMs = options.timeoutMs ?? 300;
  const pollMs = options.pollMs ?? 25;
  const deadline = Date.now() + timeoutMs;
  let syncs = 0;
  let framesPulled = 0;
  let frame: Frame = -1;

  for (;;) {
    const r = await client.sync();
    syncs += 1;
    framesPulled += r?.frames_synced ?? 0;
    frame = r?.frame_no ?? -1;
    if (frame >= target) return { reached: true, frame, syncs, framesPulled };
    if (Date.now() >= deadline)
      return { reached: false, frame, syncs, framesPulled };
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }
}

export interface FreshReadResult<T> {
  value: T;
  /**
   * "replica" is the local microsecond read. "primary" means the replica did
   * not catch up in time and the query was escalated over the network.
   * "unwatermarked" means no watermark was supplied, so no write of this
   * session needed to be visible.
   */
  servedBy: "replica" | "primary" | "unwatermarked";
  syncs: number;
  waitedMs: number;
}

/**
 * Run `read` against a snapshot guaranteed to contain the write at `frame`.
 *
 * `read` receives whichever client can honour the guarantee, so a consumer
 * writes the query once and the routing decision stays here.
 */
export async function readAtLeast<T>(options: {
  replica: ReplicaClient;
  /** Remote client used when the replica cannot catch up in time. */
  primary: ReplicaClient;
  frame: Frame | null;
  read: (client: ReplicaClient) => Promise<T>;
  timeoutMs?: number;
  pollMs?: number;
}): Promise<FreshReadResult<T>> {
  const { replica, primary, frame, read } = options;
  if (frame === null || !(await isReplica(replica))) {
    return {
      value: await read(replica),
      servedBy: "unwatermarked",
      syncs: 0,
      waitedMs: 0,
    };
  }
  const started = Date.now();
  const caught = await awaitFrame(replica, frame, {
    timeoutMs: options.timeoutMs,
    pollMs: options.pollMs,
  });
  const waitedMs = Date.now() - started;
  if (caught.reached) {
    return {
      value: await read(replica),
      servedBy: "replica",
      syncs: caught.syncs,
      waitedMs,
    };
  }
  // Correct and slow beats fast and wrong.
  return {
    value: await read(primary),
    servedBy: "primary",
    syncs: caught.syncs,
    waitedMs,
  };
}

/**
 * Watermark transport. The frame number is a small positive integer with no
 * tenant meaning, safe to put in a cookie or an `X-Replica-Frame` header, and
 * a hostile value can only cost the sender a timeout on their own request.
 */
export function serializeFrame(frame: Frame | null): string {
  return frame === null ? "" : String(frame);
}

export function parseFrame(raw: string | null | undefined): Frame | null {
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isSafeInteger(n) && n >= 0 ? n : null;
}

// ---------------------------------------------------------------------------
// demo
// ---------------------------------------------------------------------------
// Real libSQL databases (two `file:` databases, real SQL, the real client) with
// a scripted replication transport in place of Turso's, so the pull can be held
// back on demand. Turso Cloud is not required to run this.

if (import.meta.main) {
  const { createClient } = await import("@libsql/client");
  const { rmSync } = await import("node:fs");

  let failures = 0;
  const assert = (name: string, ok: boolean, detail: string) => {
    if (!ok) failures += 1;
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}\n      ${detail}`);
  };

  const files = ["primary.db", "replica.db"];
  const clean = () => {
    for (const f of files)
      for (const suffix of ["", "-wal", "-shm"]) {
        try {
          rmSync(`${f}${suffix}`);
        } catch {}
      }
  };
  clean();

  const primaryDb = createClient({ url: "file:primary.db" });
  const replicaDb = createClient({ url: "file:replica.db" });
  const schema =
    "CREATE TABLE comments (id INTEGER PRIMARY KEY, post TEXT NOT NULL, body TEXT NOT NULL)";
  await primaryDb.execute(schema);
  await replicaDb.execute(schema);

  // Scripted replication: writes append to the primary's log, `sync()` applies
  // whatever is not held back. `hold` is the lag knob.
  const log: { sql: string; args: unknown[] }[] = [];
  let applied = 0;
  let hold = 0;

  const replica: ReplicaClient = {
    protocol: "file",
    // Writes on an embedded replica go to the remote primary.
    async batch(stmts: unknown[], _mode?: string) {
      const out: unknown[] = [];
      for (const stmt of stmts as { sql: string; args: unknown[] }[]) {
        out.push(await primaryDb.execute(stmt as never));
        log.push(stmt);
      }
      return out;
    },
    // Reads are local.
    execute: (stmt: unknown) => replicaDb.execute(stmt as never) as never,
    async sync() {
      const visible = Math.max(0, log.length - hold);
      let pulled = 0;
      while (applied < visible) {
        await replicaDb.execute(log[applied] as never);
        applied += 1;
        pulled += 1;
      }
      return { frame_no: applied, frames_synced: pulled };
    },
  };
  const primary: ReplicaClient = {
    protocol: "http",
    batch: (stmts: unknown[], mode?: string) =>
      primaryDb.batch(stmts as never, mode as never) as never,
    execute: (stmt: unknown) => primaryDb.execute(stmt as never) as never,
    sync: async () => undefined,
  };

  const countFor = (post: string) => async (c: ReplicaClient) => {
    const r = await c.execute({
      sql: "SELECT COUNT(*) AS n FROM comments WHERE post = ?",
      args: [post],
    });
    return Number((r.rows[0] as Record<string, unknown>).n);
  };

  // Property 1: the naive read-after-write is stale, and nothing throws.
  {
    await replica.batch([
      {
        sql: "INSERT INTO comments (post, body) VALUES (?, ?)",
        args: ["launch-notes", "Shipping the replica router next week."],
      },
    ]);
    const seen = await countFor("launch-notes")(replica);
    assert(
      "unguarded read-after-write is stale",
      seen === 0,
      `the write is committed on the primary, the local replica answered ${seen} comments, so the author reloads into a page missing their own comment`,
    );
  }

  // Property 2: the same write, watermarked, is visible to the guarded read.
  {
    const { frame } = await commitWrite(replica, [
      {
        sql: "INSERT INTO comments (post, body) VALUES (?, ?)",
        args: ["launch-notes", "Frame watermarks beat syncInterval."],
      },
    ]);
    const r = await readAtLeast({
      replica,
      primary,
      frame,
      read: countFor("launch-notes"),
    });
    assert(
      "guarded read sees its own write",
      r.value === 2 && r.servedBy === "replica",
      `watermark frame=${frame}, served by ${r.servedBy} after ${r.syncs} sync(s), saw ${r.value} comments (both the stale write and the new one)`,
    );
  }

  // Property 3: a replica that cannot catch up escalates instead of lying.
  {
    const { frame } = await commitWrite(replica, [
      {
        sql: "INSERT INTO comments (post, body) VALUES (?, ?)",
        args: ["launch-notes", "This one is stuck behind replication lag."],
      },
    ]);
    hold = 1; // the frame exists on the primary but this replica cannot pull it
    applied -= 1; // and the replica is rewound behind it
    const r = await readAtLeast({
      replica,
      primary,
      frame,
      read: countFor("launch-notes"),
      timeoutMs: 60,
      pollMs: 10,
    });
    assert(
      "lagging replica escalates to the primary",
      r.servedBy === "primary" && r.value === 3,
      `after ${r.syncs} sync attempts over ${r.waitedMs}ms the replica was still short of frame ${frame}, so the read went remote and returned the correct ${r.value} comments`,
    );
    hold = 0;
    await replica.sync();
  }

  // Property 4: no watermark means no waiting. A read that does not depend on
  // this session's write must not pay the catch-up cost.
  {
    const r = await readAtLeast({
      replica,
      primary,
      frame: null,
      read: countFor("launch-notes"),
    });
    assert(
      "unwatermarked read never waits",
      r.servedBy === "unwatermarked" && r.syncs === 0 && r.waitedMs === 0,
      `served by ${r.servedBy} with ${r.syncs} syncs, a local read at full speed`,
    );
  }

  // Property 5: a non-replica client is transparently the fast path, and the
  // probe survives the empty error code that `SyncNotSupported` carries.
  {
    const plain = createClient({ url: "file:primary.db" });
    let raised: unknown = null;
    try {
      await plain.sync();
    } catch (e) {
      raised = e;
    }
    const replicaLike = await isReplica(plain as unknown as ReplicaClient);
    const r = await readAtLeast({
      replica: plain as unknown as ReplicaClient,
      primary,
      frame: 999_999, // a watermark this client can never reach
      read: countFor("launch-notes"),
    });
    assert(
      "non-replica client is detected, not crashed on",
      replicaLike === false && r.servedBy === "unwatermarked" && r.value === 3,
      `sync() rejected with code=${JSON.stringify((raised as { code?: string })?.code)} (empty, so a code check would not have matched), isReplica=false, read served locally with ${r.value} comments`,
    );
    plain.close();
  }

  // Property 6: watermark transport round-trips and rejects junk.
  {
    const ok = parseFrame(serializeFrame(4821)) === 4821;
    const junk =
      parseFrame("../../etc") === null &&
      parseFrame("-3") === null &&
      parseFrame("") === null &&
      parseFrame(null) === null;
    assert(
      "watermark round-trips and rejects junk",
      ok && junk,
      `4821 survives the cookie round trip; "../../etc", "-3", "" and null all parse to null and degrade to an unwatermarked read`,
    );
  }

  primaryDb.close();
  replicaDb.close();
  clean();
  console.log(
    failures === 0
      ? "replica-session.ts: all properties verified"
      : `replica-session.ts: ${failures} FAILED`,
  );
  if (failures > 0) process.exit(1);
}
