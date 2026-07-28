/**
 * occ-shards.ts: shard selection, rollup, and per-shard budget for a Convex
 * counter that survives contention. Pure functions and no Convex imports, so
 * the logic runs without a deployment; `counters.ts` is a thin handler over it.
 *
 * The bottom half of this file is a small model of Convex's optimistic
 * concurrency control, used by the demo to reproduce the failures below and
 * show that the sharded shape fixes them.
 *
 * Pinned to convex@1.42.3.
 *
 * Failure modes solved:
 *
 *   1. The lost update, which Convex simply does not have. On Postgres at READ
 *      COMMITTED, `SELECT value` then `UPDATE SET value = 41` from two
 *      overlapping transactions ends at 41, not 42, and nothing errors. Every
 *      Convex mutation is a serializable transaction over the whole database:
 *      "The read set precisely records all data queried by a transaction,
 *      including specific index ranges scanned during execution"
 *      (https://stack.convex.dev/how-convex-works), and a commit whose read set
 *      was invalidated aborts and re-runs from the latest timestamp. So the
 *      naive read-modify-write is correct here with no BEGIN, no isolation
 *      level to choose, and no row lock to forget. The demo runs the same
 *      increment under both engines to show the difference.
 *
 *   2. The write conflict that OCC buys instead. Correctness is free, but
 *      throughput is not: every writer that touches one hot document
 *      invalidates every other writer's read set, so retries pile up until
 *      Convex gives up with "Write conflict: Optimistic concurrency control"
 *      (https://docs.convex.dev/error). Its remediation is exactly this file:
 *      "design your data model to avoid requiring many writes to the same
 *      document". Increments land on one of N shard rows, so two writers
 *      collide only when they draw the same shard.
 *
 *   3. The read set that is wider than the write. `.filter()` has no index
 *      behind it, so it scans the table (https://docs.convex.dev/database/
 *      reading-data/indexes/indexes-and-query-perf) and puts the whole table in
 *      the read set. A mutation written that way conflicts with every unrelated
 *      insert into that table: it works perfectly at 100 rows and starts
 *      throwing write conflicts at 100k. `withIndex` narrows the read set to
 *      the range actually needed, which is the contention surface.
 *
 *   4. The rollup that undoes the sharding. Summing all N shards inside a
 *      mutation puts all N back in one read set, so a "check the limit, then
 *      increment" mutation is exactly as contended as the unsharded counter it
 *      replaced. Reads of the total belong in a query, which never conflicts;
 *      a limit a mutation must enforce gets a per-shard budget instead, so the
 *      check stays inside the one shard being written.
 *
 * run: bun run occ-shards.ts
 */

export interface ShardPolicy {
  /** Shard count. Contention falls as 1/shards; rollup cost rises linearly. */
  readonly shards: number;
}

/**
 * 16 is the useful middle for a counter a human reads: a like count, a view
 * count, an active-session gauge. Below 4 the hot row is still hot; above 64
 * the rollup query is reading more rows than the write it protects.
 */
export const defaultShardPolicy: ShardPolicy = { shards: 16 };

/**
 * FNV-1a. Deterministic on purpose: the same token always draws the same shard,
 * so an OCC re-execution of the mutation reads and writes the same row and its
 * retry has the same read set. `Math.random()` would also work for a plain
 * counter (any shard is as good as any other), but it returns a new value on
 * every run per https://docs.convex.dev/functions/runtimes, so a retry silently
 * moves to a different row, which makes contention impossible to reason about
 * and makes a per-shard budget (see `decideSpend`) unenforceable.
 */
export function pickShard(
  token: string,
  policy: ShardPolicy = defaultShardPolicy,
): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < token.length; i++) {
    hash ^= token.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash % policy.shards;
}

/** The key of one shard row. Also the index prefix the mutation reads. */
export function shardKey(name: string, shard: number): string {
  return `${name}#${shard}`;
}

/** Total across shards. Cheap in a query, expensive in a mutation. */
export function rollup(shardValues: readonly number[]): number {
  let total = 0;
  for (const v of shardValues) total += v;
  return total;
}

export type SpendDecision =
  | { readonly kind: "apply"; readonly next: number }
  | {
      readonly kind: "reject";
      readonly reason: string;
      readonly shardRemaining: number;
    };

/**
 * A limit a mutation has to enforce, kept inside one shard. Each shard carries
 * `limit / shards` of the budget, so the check reads one row and the read set
 * stays one row wide. The tradeoff is honest and worth stating out loud: a
 * caller can be rejected while another shard still has headroom, so the
 * effective global limit sits between `limit - shards + 1` and `limit`. That is
 * the correct trade for a rate ceiling or a seat cap; it is the wrong trade for
 * money, where a single authoritative row and its contention is the point.
 */
export function decideSpend(
  shardValue: number,
  delta: number,
  limit: number,
  policy: ShardPolicy = defaultShardPolicy,
): SpendDecision {
  const shardBudget = Math.floor(limit / policy.shards);
  const next = shardValue + delta;
  if (next > shardBudget) {
    return {
      kind: "reject",
      reason: `shard budget exhausted (${shardValue}/${shardBudget} of a ${limit} global limit across ${policy.shards} shards)`,
      shardRemaining: Math.max(0, shardBudget - shardValue),
    };
  }
  return { kind: "apply", next };
}

// ---------------------------------------------------------------------------
// demo: a model of Convex OCC, and of the READ COMMITTED engine it is usually
// compared against, driving the real functions above.
//
// The model: a transaction begins at a snapshot of the write log. Every read
// records the index range it scanned, as a key prefix; an empty prefix is a
// table scan. At commit, the transaction aborts if any write appended after its
// snapshot falls inside one of those ranges. That is the whole of OCC, and it
// is why an empty index range is protected too: a read that found nothing still
// conflicts with an insert into the range it searched.
// ---------------------------------------------------------------------------

interface WriteLogEntry {
  readonly table: string;
  readonly key: string;
}

interface Engine {
  readonly docs: Map<string, number>;
  readonly log: WriteLogEntry[];
  /** false models READ COMMITTED: no read-set validation, last write wins. */
  readonly validateReads: boolean;
}

/**
 * An index range that was scanned. `exact` is a single index entry (the
 * `q.eq(...)` point lookup a `withIndex` does); otherwise it is a prefix, and
 * an empty prefix is the whole table, which is what `.filter()` reads.
 */
interface ReadRange {
  readonly table: string;
  readonly prefix: string;
  readonly exact: boolean;
}

interface Txn {
  readonly snapshot: number;
  readonly reads: ReadRange[];
  readonly writes: Array<{ table: string; key: string; value: number }>;
}

const makeEngine = (validateReads: boolean): Engine => ({
  docs: new Map(),
  log: [],
  validateReads,
});

const begin = (engine: Engine): Txn => ({
  snapshot: engine.log.length,
  reads: [],
  writes: [],
});

const inRange = (range: ReadRange, table: string, key: string): boolean =>
  range.table === table &&
  (range.exact ? key === range.prefix : key.startsWith(range.prefix));

/**
 * Read an index range. Returns the matching rows and records the range, not
 * just the rows found, which is the part people forget.
 */
function readRange(
  engine: Engine,
  txn: Txn,
  table: string,
  prefix: string,
): number[] {
  const range: ReadRange = { table, prefix, exact: false };
  txn.reads.push(range);
  const found: number[] = [];
  for (const [docKey, value] of engine.docs) {
    const [docTable, ...rest] = docKey.split("/");
    if (inRange(range, docTable, rest.join("/"))) found.push(value);
  }
  return found;
}

/** A `withIndex` point lookup: one index entry, in and out of the read set. */
function readOne(
  engine: Engine,
  txn: Txn,
  table: string,
  key: string,
): number | null {
  txn.reads.push({ table, prefix: key, exact: true });
  const value = engine.docs.get(`${table}/${key}`);
  return value === undefined ? null : value;
}

const write = (txn: Txn, table: string, key: string, value: number) => {
  txn.writes.push({ table, key, value });
};

/** True if the transaction committed; false if its read set was invalidated. */
function commit(engine: Engine, txn: Txn): boolean {
  if (engine.validateReads) {
    for (let i = txn.snapshot; i < engine.log.length; i++) {
      const entry = engine.log[i];
      for (const read of txn.reads) {
        if (inRange(read, entry.table, entry.key)) return false;
      }
    }
  }
  for (const w of txn.writes) {
    engine.docs.set(`${w.table}/${w.key}`, w.value);
    engine.log.push({ table: w.table, key: w.key });
  }
  return true;
}

/**
 * Interleave `writers` so that every writer reads before any writer commits,
 * which is the worst case OCC has to survive and the one that produces the
 * retry counts people report. Losers re-run from scratch, the way Convex
 * re-executes an aborted mutation from the latest timestamp. `failed` counts
 * writers still unfinished when `maxRounds` runs out, which is the bounded
 * internal retry budget behind the "Write conflict" a caller actually sees.
 * Returns total commit attempts across all writers.
 */
function runConcurrently(
  engine: Engine,
  writers: Array<(txn: Txn) => void>,
  maxRounds = writers.length + 1,
): { attempts: number; failed: number } {
  let pending = writers.map((body, id) => ({ id, body }));
  let attempts = 0;
  let failed = 0;
  for (let round = 1; round <= maxRounds && pending.length > 0; round++) {
    // Every writer opens its transaction and reads at the same snapshot.
    const staged = pending.map((w) => {
      const txn = begin(engine);
      w.body(txn);
      return { ...w, txn };
    });
    const losers: typeof pending = [];
    for (const s of staged) {
      attempts++;
      if (!commit(engine, s.txn)) losers.push({ id: s.id, body: s.body });
    }
    pending = losers;
  }
  failed = pending.length;
  return { attempts, failed };
}

function demo() {
  const results: Array<[string, boolean, string]> = [];
  const check = (label: string, ok: boolean, detail: string) =>
    results.push([label, ok, detail]);

  // The same handler body under both engines: read the row, write value + 1.
  const incrementHot = (txn: Txn, engine: Engine) => {
    const current = readOne(engine, txn, "counts", "likes") ?? 0;
    write(txn, "counts", "likes", current + 1);
  };

  // 1. READ COMMITTED loses the update. No error, just a wrong number.
  {
    const pg = makeEngine(false);
    const { attempts, failed } = runConcurrently(
      pg,
      Array.from({ length: 10 }, () => (txn: Txn) => incrementHot(txn, pg)),
    );
    const total = pg.docs.get("counts/likes") ?? 0;
    check(
      "read-modify-write without read validation loses updates",
      total === 1 && attempts === 10 && failed === 0,
      `10 concurrent increments, every one "succeeded" in ${attempts} attempts, counter reads ${total}`,
    );
  }

  // 2. Convex OCC: identical handler body, correct total, paid for in retries.
  {
    const convex = makeEngine(true);
    const { attempts, failed } = runConcurrently(
      convex,
      Array.from({ length: 10 }, () => (txn: Txn) => incrementHot(txn, convex)),
    );
    const total = convex.docs.get("counts/likes") ?? 0;
    check(
      "serializable OCC makes the same code correct",
      total === 10 && failed === 0,
      `10 concurrent increments, counter reads ${total}, cost ${attempts} commit attempts for 10 commits`,
    );
  }

  const WRITERS = 24;

  // 3. The price of the hot document: every writer invalidates every other
  //    writer's read set, so exactly one commits per round and the retries are
  //    quadratic. A real deployment has a bounded internal retry budget, and
  //    that is where "Write conflict: Optimistic concurrency control" comes from.
  let hotWasted = 0;
  {
    const hot = makeEngine(true);
    const writers = Array.from(
      { length: WRITERS },
      () => (txn: Txn) => incrementHot(txn, hot),
    );
    const { attempts } = runConcurrently(hot, writers);
    hotWasted = attempts - WRITERS;
    check(
      "one hot document serializes every writer",
      hotWasted >= WRITERS && (hot.docs.get("counts/likes") ?? 0) === WRITERS,
      `${WRITERS} increments cost ${attempts} attempts, ${hotWasted} of them wasted retries`,
    );
  }

  // 4. Sharded: the same 24 writers, spread by pickShard, mostly never collide.
  //    The claim is not "zero retries", it is "retries stop scaling with the
  //    writer count", so this compares against what the hot row actually cost.
  {
    const sharded = makeEngine(true);
    const writers = Array.from({ length: WRITERS }, (_, i) => (txn: Txn) => {
      const key = shardKey("likes", pickShard(`session:${i}`));
      const current = readOne(sharded, txn, "counterShards", key) ?? 0;
      write(txn, "counterShards", key, current + 1);
    });
    const { attempts, failed } = runConcurrently(sharded, writers);
    const wasted = attempts - WRITERS;

    const shardValues: number[] = [];
    for (const [key, value] of sharded.docs) {
      if (key.startsWith("counterShards/likes#")) shardValues.push(value);
    }
    check(
      "sharding turns the hot row into N cold rows",
      rollup(shardValues) === WRITERS && failed === 0 && wasted * 8 < hotWasted,
      `${WRITERS} increments across ${shardValues.length} shard rows cost ${attempts} attempts (${wasted} wasted vs ${hotWasted} unsharded, ${(hotWasted / Math.max(1, wasted)).toFixed(1)}x fewer), rollup = ${rollup(shardValues)}`,
    );
  }

  // 5. Two concurrent first-writes to a shard that does not exist yet cannot
  //    both insert. The read found nothing, but the RANGE it searched is in the
  //    read set, so the second insert invalidates the first reader. This is the
  //    guarantee you would otherwise buy with a unique constraint.
  {
    const fresh = makeEngine(true);
    const firstWrite = (txn: Txn) => {
      const key = shardKey("signups", 3);
      const current = readOne(fresh, txn, "counterShards", key);
      write(txn, "counterShards", key, (current ?? 0) + 1);
    };
    const { failed } = runConcurrently(fresh, [firstWrite, firstWrite]);
    const value = fresh.docs.get("counterShards/signups#3");
    check(
      "a read that found nothing still conflicts with an insert into its range",
      value === 2 && failed === 0,
      `two concurrent first-increments of a fresh shard left value ${value}, not 1`,
    );
  }

  // 6. Read-set width. `.filter()` scans the table, so a mutation that uses it
  //    conflicts with an insert it has nothing to do with. `withIndex` does not.
  {
    const scan = makeEngine(true);
    scan.docs.set("counterShards/likes#0", 5);
    const scanTxn = begin(scan);
    readRange(scan, scanTxn, "counterShards", ""); // .filter(): whole table
    write(scanTxn, "counterShards", shardKey("likes", 0), 6);

    const indexed = makeEngine(true);
    indexed.docs.set("counterShards/likes#0", 5);
    const indexedTxn = begin(indexed);
    readOne(indexed, indexedTxn, "counterShards", shardKey("likes", 0)); // withIndex
    write(indexedTxn, "counterShards", shardKey("likes", 0), 6);

    // Meanwhile, an unrelated counter in the same table gets its first write.
    for (const engine of [scan, indexed]) {
      const other = begin(engine);
      write(other, "counterShards", shardKey("pageviews", 11), 1);
      commit(engine, other);
    }

    const scanCommitted = commit(scan, scanTxn);
    const indexedCommitted = commit(indexed, indexedTxn);
    check(
      "filter() conflicts with unrelated writes, withIndex() does not",
      scanCommitted === false && indexedCommitted === true,
      `unrelated insert aborted the .filter() mutation (committed=${scanCommitted}) and left the .withIndex() one alone (committed=${indexedCommitted})`,
    );
  }

  // 7. The rollup trap: summing every shard inside a mutation restores the
  //    contention sharding just removed, because all N shards are one read set.
  {
    const engine = makeEngine(true);
    for (let i = 0; i < defaultShardPolicy.shards; i++) {
      engine.docs.set(`counterShards/${shardKey("likes", i)}`, 0);
    }
    const rollupInMutation = (txn: Txn) => {
      const all = readRange(engine, txn, "counterShards", "likes#"); // every shard
      write(
        txn,
        "counterShards",
        shardKey("likes", pickShard("a")),
        rollup(all) + 1,
      );
    };
    const perShard = (txn: Txn) => {
      const key = shardKey("likes", pickShard("b"));
      const current = readOne(engine, txn, "counterShards", key) ?? 0;
      write(txn, "counterShards", key, current + 1);
    };
    const rolling = begin(engine);
    rollupInMutation(rolling);
    const local = begin(engine);
    perShard(local);
    // A third writer commits first, touching a shard neither of them wrote.
    const other = begin(engine);
    write(other, "counterShards", shardKey("likes", 12), 1);
    commit(engine, other);

    check(
      "a rollup inside a mutation re-widens the read set to every shard",
      commit(engine, rolling) === false && commit(engine, local) === true,
      "a write to shard 12 aborted the mutation that summed all shards, and did not touch the single-shard one",
    );
  }

  // 8. The per-shard budget keeps a limit enforceable without a rollup.
  {
    const limit = 320;
    const perShard = Math.floor(limit / defaultShardPolicy.shards);
    const ok = decideSpend(perShard - 1, 1, limit);
    const over = decideSpend(perShard, 1, limit);
    check(
      "a per-shard budget enforces a limit from one row",
      ok.kind === "apply" &&
        ok.next === perShard &&
        over.kind === "reject" &&
        over.shardRemaining === 0,
      `budget ${perShard}/shard of a ${limit} limit: accepted at ${perShard - 1}, rejected at ${perShard}`,
    );
  }

  for (const [label, ok, detail] of results) {
    console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`);
  }
  const failed = results.filter(([, ok]) => !ok).length;
  console.log(
    failed === 0
      ? "occ-shards.ts: all properties verified"
      : `occ-shards.ts: ${failed} property check(s) failed`,
  );
  if (failed > 0) process.exit(1);
}

// Gated, because this file is deployed. Convex bundles every module under
// convex/ and evaluates it inside the isolate, so an ungated demo() would run
// on function load and call a `process` that does not exist there.
// `import.meta.main` is true only under `bun run occ-shards.ts`.
if (import.meta.main) demo();
