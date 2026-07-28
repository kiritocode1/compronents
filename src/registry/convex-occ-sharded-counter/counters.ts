/**
 * counters.ts: a Convex counter that stays correct under contention and keeps
 * its read set narrow enough to stay fast. Every decision lives in
 * `lib/occShards.ts`, which runs without a deployment. Pinned to convex@1.42.3.
 *
 * The shape:
 *
 *   increment   mutation  read-modify-write of ONE shard row
 *   total       query     rollup across shards, reactive, never conflicts
 *   spend       mutation  a limit enforced from one shard's slice of the budget
 *   rebalance   internalMutation  cron: flattens shard skew, one shard per run
 *
 * Read this before changing anything: the read set is the unit of contention.
 * "The read set precisely records all data queried by a transaction, including
 * specific index ranges scanned during execution"
 * (https://stack.convex.dev/how-convex-works). A mutation aborts and re-runs
 * when anything inside a range it read has been written since it started, so
 * the question for every line below is not "is this fast" but "how much of the
 * keyspace did this put in the read set".
 *
 * That is why `increment` uses a `q.eq(...).eq(...)` point lookup and touches
 * nothing else. A `.filter()` would scan the table
 * (https://docs.convex.dev/database/reading-data/indexes/indexes-and-query-perf),
 * putting every row in the read set, and the mutation would then conflict with
 * every unrelated insert into the table. It works at 100 rows and throws
 * "Write conflict: Optimistic concurrency control" (https://docs.convex.dev/error)
 * at 100k.
 *
 * Add to convex/schema.ts:
 *
 * ```ts
 * counterShards: defineTable({
 *   name: v.string(),
 *   shard: v.number(),
 *   value: v.number(),
 * }).index("by_name_shard", ["name", "shard"]),
 * ```
 *
 * Live check (needs a deployment, this file cannot run locally). Fire many
 * increments at once and confirm the total is exact and nothing threw:
 *
 *   for i in $(seq 1 200); do
 *     npx convex run counters:increment \
 *       "{\"name\":\"post:4412:likes\",\"token\":\"session:$i\",\"delta\":1}" &
 *   done; wait
 *   npx convex run counters:total '{"name":"post:4412:likes"}'
 *
 * Expect 200. Then swap `increment` for a version that writes a single row and
 * run it again: the total is still 200 (OCC does not lose updates), but the
 * deployment's function log fills with retries and slow mutations, which is the
 * cost this component exists to remove.
 */

import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  internalMutation,
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "./_generated/server";
import {
  decideSpend,
  defaultShardPolicy,
  pickShard,
  rollup,
} from "./lib/occShards";

/**
 * One shard row, by exact index point. This single call is the whole read set
 * of `increment`, so two callers conflict only when they drew the same shard.
 *
 * Note what happens when the row does not exist yet: the read set still covers
 * the range that was searched, so two concurrent first-increments of the same
 * shard cannot both insert. One commits, the other's read set is invalidated,
 * it re-runs, finds the row, and patches it. On a SQL database that guarantee
 * is a unique constraint plus an ON CONFLICT clause you have to remember to
 * write; here it is what a read already means.
 */
async function shardRow(
  ctx: QueryCtx | MutationCtx,
  name: string,
  shard: number,
) {
  return await ctx.db
    .query("counterShards")
    .withIndex("by_name_shard", (q) => q.eq("name", name).eq("shard", shard))
    .unique();
}

export const increment = mutation({
  args: {
    /** Counter identity, for example "post:4412:likes". */
    name: v.string(),
    /**
     * A stable string for this caller: a session id, a user id, a request id.
     * It selects the shard by hash rather than at random, so an OCC re-run of
     * this mutation reads and writes the same row and its retry has the same
     * read set.
     */
    token: v.string(),
    delta: v.number(),
  },
  handler: async (ctx, args) => {
    const shard = pickShard(args.token);
    const row = await shardRow(ctx, args.name, shard);

    if (row === null) {
      await ctx.db.insert("counterShards", {
        name: args.name,
        shard,
        value: args.delta,
      });
    } else {
      // Read-modify-write, and it is simply correct. The mutation is a
      // serializable transaction, so there is no isolation level to pick and no
      // row lock to forget; a concurrent increment to this same shard aborts
      // one of the two and re-runs it against the committed value.
      await ctx.db.patch("counterShards", row._id, {
        value: row.value + args.delta,
      });
    }
    return { shard };
  },
});

/**
 * The rollup. This has to be a query, not a helper a mutation calls.
 *
 * A query is read-only, so it never takes part in a write conflict, and Convex
 * re-runs it when the rows it read change, which is what makes the total live.
 * Summing the shards inside a mutation instead would put all N shards into that
 * mutation's read set, so it would conflict with every increment to any of
 * them, which is precisely the contention the sharding removed.
 *
 * No Date.now() and no Math.random() in here, and not only because a query must
 * be deterministic to be cached. Per
 * https://docs.convex.dev/understanding/best-practices, a query is re-run when
 * the data it read changes, "but not when Date.now() changes", so a clock read
 * inside a query returns a value that is stale until something unrelated
 * happens to invalidate it, and it poisons the query cache on the way. Time a
 * query needs is an argument the caller passes or a field a scheduled mutation
 * maintains.
 */
export const total = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const shards = await ctx.db
      .query("counterShards")
      .withIndex("by_name_shard", (q) => q.eq("name", args.name))
      .collect();
    return rollup(shards.map((s) => s.value));
  },
});

/**
 * A limit a mutation must enforce, without reading every shard to do it. Each
 * shard owns `limit / shards` of the budget, so the check reads the one row it
 * is about to write. The cost is stated in `decideSpend`: a caller can be
 * rejected while another shard still has headroom. Correct for a seat cap or a
 * usage ceiling, wrong for money, where you want the single authoritative
 * document and its contention.
 */
export const spend = mutation({
  args: {
    name: v.string(),
    token: v.string(),
    delta: v.number(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const shard = pickShard(args.token);
    const row = await shardRow(ctx, args.name, shard);
    const decision = decideSpend(row?.value ?? 0, args.delta, args.limit);

    if (decision.kind === "reject") {
      return { ok: false as const, reason: decision.reason, shard };
    }
    if (row === null) {
      await ctx.db.insert("counterShards", {
        name: args.name,
        shard,
        value: decision.next,
      });
    } else {
      await ctx.db.patch("counterShards", row._id, { value: decision.next });
    }
    return { ok: true as const, shard, shardValue: decision.next };
  },
});

/**
 * Hash-by-token spreads load evenly only when tokens are evenly distributed. A
 * counter driven by a handful of very busy tokens leaves one shard hot and the
 * rest near zero, which brings back the contention this component removes and
 * makes `spend` reject callers while the global budget is barely touched.
 *
 * This cron flattens that: it moves the excess above the mean off the hottest
 * shard and onto the coldest one. It touches exactly two rows per run, so the
 * rebalancer itself is never the contended writer, and because the total is a
 * sum, moving value between shards leaves `total` unchanged at every instant.
 *
 * Register it in convex/crons.ts:
 *
 * ```ts
 * import { cronJobs } from "convex/server";
 * import { internal } from "./_generated/api";
 *
 * const crons = cronJobs();
 * crons.interval(
 *   "flatten counter shards",
 *   { minutes: 10 },
 *   internal.counters.rebalance,
 *   { name: "post:4412:likes" },
 * );
 * export default crons;
 * ```
 */
export const rebalance = internalMutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const shards = await ctx.db
      .query("counterShards")
      .withIndex("by_name_shard", (q) => q.eq("name", args.name))
      .collect();
    if (shards.length < 2) return { moved: 0 };

    const mean = rollup(shards.map((s) => s.value)) / defaultShardPolicy.shards;
    const hottest = shards.reduce((a, b) => (a.value >= b.value ? a : b));
    const coldest = shards.reduce((a, b) => (a.value <= b.value ? a : b));
    const move = Math.floor(hottest.value - mean);
    if (hottest._id === coldest._id || move <= 0) return { moved: 0 };

    await ctx.db.patch("counterShards", hottest._id, {
      value: hottest.value - move,
    });
    await ctx.db.patch("counterShards", coldest._id, {
      value: coldest.value + move,
    });
    return { moved: move, from: hottest.shard, to: coldest.shard };
  },
});

/**
 * Scheduling the rebalance from a mutation, rather than only from the cron, is
 * the cheap way to react to skew the moment you notice it. `ctx.scheduler` in a
 * mutation is part of that mutation's transaction, so this cannot queue work
 * for a write that then aborts on an OCC conflict.
 */
export const incrementAndFlattenIfSkewed = mutation({
  args: {
    name: v.string(),
    token: v.string(),
    delta: v.number(),
    skewAt: v.number(),
  },
  handler: async (ctx, args) => {
    const shard = pickShard(args.token);
    const row = await shardRow(ctx, args.name, shard);
    const next = (row?.value ?? 0) + args.delta;

    if (row === null) {
      await ctx.db.insert("counterShards", {
        name: args.name,
        shard,
        value: next,
      });
    } else {
      await ctx.db.patch("counterShards", row._id, { value: next });
    }

    // Still one row in the read set: the decision is made from the shard we
    // already read, not from a rollup that would widen it to every shard.
    if (next >= args.skewAt) {
      await ctx.scheduler.runAfter(0, internal.counters.rebalance, {
        name: args.name,
      });
    }
    return { shard, shardValue: next };
  },
});
