// lock.ts: distributed lock and leader election on Deno KV, zero dependencies.
//
// What it is: withLock(kv, name, fn) gives mutual exclusion across processes,
// isolates, and Deploy regions. onLeader(kv, name, cb) runs a leader election
// loop with automatic failover.
//
// Why Deno makes this trivial: kv.atomic().check(versionstamp).set() is a
// distributed compare-and-swap, expireIn gives lease TTLs so a dead holder
// cannot wedge the lock forever, and kv.watch() turns "poll until free" into
// "get notified the instant the lock key changes". Because KV expiry is only
// guaranteed to be the earliest deletion time, the lease also stores its own
// expiresAt and waiters race a timer against the watch, so failover is bounded
// by the TTL even if the backend is slow to sweep expired keys.
//
// run (in-process mutual exclusion demo):
//   deno run -A --unstable-kv lock.ts demo
// run (leader election, start two, kill the first, watch the second take over):
//   deno run -A --unstable-kv lock.ts leader nodeA /tmp/lockdemo.db
//   deno run -A --unstable-kv lock.ts leader nodeB /tmp/lockdemo.db

export interface Lease {
  name: string;
  id: string;
  versionstamp: string;
  /** Release the lock. Safe to call even if the lease already expired. */
  release(): Promise<void>;
}

interface LockValue {
  id: string;
  expiresAt: number;
}

const key = (name: string): Deno.KvKey => ["lock", name];

/** One acquisition attempt. Returns a Lease or null if someone holds it. */
export async function tryAcquire(
  kv: Deno.Kv,
  name: string,
  opts: { ttlMs?: number; id?: string } = {},
): Promise<Lease | null> {
  const ttlMs = opts.ttlMs ?? 5000;
  const id = opts.id ?? crypto.randomUUID();
  const cur = await kv.get<LockValue>(key(name));
  const now = Date.now();
  // Held and not past its own deadline: give up this attempt.
  if (cur.value && cur.value.expiresAt > now) return null;
  const res = await kv.atomic()
    .check({ key: key(name), versionstamp: cur.versionstamp })
    .set(key(name), { id, expiresAt: now + ttlMs } satisfies LockValue, {
      expireIn: ttlMs,
    })
    .commit();
  if (!res.ok) return null;
  return {
    name,
    id,
    versionstamp: res.versionstamp,
    release: async () => {
      // Delete only if the key is still our exact write.
      await kv.atomic()
        .check({ key: key(name), versionstamp: res.versionstamp })
        .delete(key(name))
        .commit();
    },
  };
}

/**
 * Block until the lock is free, then acquire it. Wakes on kv.watch events
 * (instant when the holder releases) and on a timer at the current lease's
 * expiresAt (bounded failover when the holder died).
 */
export async function acquire(
  kv: Deno.Kv,
  name: string,
  opts: { ttlMs?: number; id?: string; signal?: AbortSignal } = {},
): Promise<Lease> {
  while (true) {
    opts.signal?.throwIfAborted();
    const lease = await tryAcquire(kv, name, opts);
    if (lease) return lease;
    await waitForChangeOrExpiry(kv, name, opts.signal);
  }
}

async function waitForChangeOrExpiry(
  kv: Deno.Kv,
  name: string,
  signal?: AbortSignal,
): Promise<void> {
  const cur = await kv.get<LockValue>(key(name));
  if (!cur.value || cur.value.expiresAt <= Date.now()) return;
  const reader = kv.watch<[LockValue]>([key(name)]).getReader();
  // ponytail: timer fallback because KV expiry sweeps can lag past expiresAt
  const timer = new Promise<void>((r) =>
    setTimeout(r, Math.max(0, cur.value!.expiresAt - Date.now()) + 25)
  );
  const abort = new Promise<never>((_, rej) => {
    signal?.addEventListener("abort", () => rej(signal.reason), { once: true });
  });
  try {
    // First watch read is the current state; wait for the one after it.
    await Promise.race([
      (async () => {
        await reader.read();
        await reader.read();
      })(),
      timer,
      ...(signal ? [abort] : []),
    ]);
  } finally {
    reader.cancel().catch(() => {});
  }
}

/** Run fn while holding the lock, always releasing afterwards. */
export async function withLock<T>(
  kv: Deno.Kv,
  name: string,
  fn: (lease: Lease) => Promise<T> | T,
  opts: { ttlMs?: number; signal?: AbortSignal } = {},
): Promise<T> {
  const lease = await acquire(kv, name, opts);
  try {
    return await fn(lease);
  } finally {
    await lease.release();
  }
}

/**
 * Leader election loop. Calls cb with an AbortSignal when this node becomes
 * leader; the signal fires if leadership is lost (renew fails). Renews the
 * lease at ttl/2. Returns a stop function that abdicates and exits the loop.
 */
export function onLeader(
  kv: Deno.Kv,
  name: string,
  cb: (signal: AbortSignal) => void | Promise<void>,
  opts: { ttlMs?: number; id?: string } = {},
): () => Promise<void> {
  const ttlMs = opts.ttlMs ?? 5000;
  const id = opts.id ?? crypto.randomUUID();
  const stopped = new AbortController();

  const loop = (async () => {
    while (!stopped.signal.aborted) {
      let lease: Lease;
      try {
        lease = await acquire(kv, name, { ttlMs, id, signal: stopped.signal });
      } catch {
        return; // stopped while waiting
      }
      const lost = new AbortController();
      const cbDone = Promise.resolve(cb(lost.signal)).catch(() => {});
      let stamp = lease.versionstamp;
      // Renew until we lose the CAS race, expire, or are stopped.
      while (!stopped.signal.aborted) {
        await new Promise((r) => setTimeout(r, ttlMs / 2));
        const res = await kv.atomic()
          .check({ key: key(name), versionstamp: stamp })
          .set(key(name), { id, expiresAt: Date.now() + ttlMs }, {
            expireIn: ttlMs,
          })
          .commit();
        if (!res.ok) break; // someone else took over
        stamp = res.versionstamp;
      }
      lost.abort("leadership lost");
      await cbDone;
      if (stopped.signal.aborted) {
        await kv.atomic()
          .check({ key: key(name), versionstamp: stamp })
          .delete(key(name))
          .commit();
      }
    }
  })();

  return async () => {
    stopped.abort("stopped");
    await loop;
  };
}

// Self-check and cross-process demo.
if (import.meta.main) {
  const [mode, nodeId, path] = Deno.args;
  if (mode === "leader") {
    // Cross-process leader election on a shared KV file.
    const kv = await Deno.openKv(path ?? "/tmp/lockdemo.db");
    console.log(`[${nodeId}] contending for leadership`);
    onLeader(kv, "cluster-leader", async (signal) => {
      console.log(`[${nodeId}] I AM LEADER at ${new Date().toISOString()}`);
      await new Promise<void>((r) =>
        signal.addEventListener("abort", () => r(), { once: true })
      );
      console.log(`[${nodeId}] lost leadership`);
    }, { ttlMs: 2000, id: nodeId });
  } else {
    // Mutual exclusion proof: two workers, same lock, interleavings recorded.
    const kv = await Deno.openKv(":memory:");
    const log: string[] = [];
    let inside = 0;
    const worker = (label: string) =>
      withLock(kv, "shared", async () => {
        inside++;
        log.push(`${label} enter (concurrent holders: ${inside})`);
        if (inside > 1) throw new Error("MUTUAL EXCLUSION VIOLATED");
        await new Promise((r) => setTimeout(r, 300));
        inside--;
        log.push(`${label} exit`);
      }, { ttlMs: 3000 });
    const t0 = Date.now();
    await Promise.all([worker("A"), worker("B")]);
    console.log(log.join("\n"));
    console.log(`both done in ${Date.now() - t0}ms (second waited, no overlap)`);
    // Expiry failover proof: take a lease, never release, next acquire
    // succeeds only after the TTL deadline passes.
    const dead = await tryAcquire(kv, "orphan", { ttlMs: 1000 });
    if (!dead) throw new Error("expected to acquire orphan");
    const t1 = Date.now();
    const heir = await acquire(kv, "orphan", { ttlMs: 1000 });
    console.log(
      `orphaned lease reclaimed after ${Date.now() - t1}ms (ttl was 1000ms)`,
    );
    await heir.release();
    kv.close();
  }
}
