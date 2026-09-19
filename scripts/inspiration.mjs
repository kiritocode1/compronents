#!/usr/bin/env node
import { parseArgs } from "node:util";
import { seedCatalog } from "../src/lib/inspiration/catalog.ts";
import { getInspirationDatabase, migrate } from "../src/lib/inspiration/db.ts";
import {
  checkFreshness,
  drainJobs,
  enqueue,
} from "../src/lib/inspiration/ingest.ts";
import { retrieve } from "../src/lib/inspiration/retrieve.ts";
import {
  allResources,
  effectivePreferences,
  embeddingGaps,
  freshnessQueue,
  importCatalog,
  passagesFor,
  preferences,
  resolveResource,
  savePreference,
  setQuarantine,
  topMisses,
} from "../src/lib/inspiration/store.ts";
import { parsePreference } from "../src/lib/inspiration/validation.ts";
import { resolveEngagement } from "../src/lib/inspiration-engagement.ts";

const {
  values,
  positionals: [command = "help", argument],
} = parseArgs({
  allowPositionals: true,
  options: {
    "dry-run": { type: "boolean" },
    limit: { type: "string", default: "6" },
    mode: { type: "string", default: "search" },
    context: { type: "string", default: "" },
    value: { type: "string" },
    rating: { type: "string" },
    note: { type: "string", default: "" },
  },
});
const print = (value) => console.log(JSON.stringify(value, null, 2));
// This file is CLI-only by construction: no server route imports it. Mark the
// process so drainJobs can tell an explicit invocation from a route import.
process.env.INSPIRATION_INGEST_CLI = "1";
if (command === "help") {
  console.log(`Local inspiration database. No DATABASE_URL fallback or cloud provisioning.
  pnpm inspiration import [--dry-run]
  pnpm inspiration health
  pnpm inspiration explain "query" [--mode search|recommend|discover] [--limit 6] [--context react]
  pnpm inspiration inspect <resource-id-or-url>
  pnpm inspiration preference <resource-id> --value prefer|neutral|avoid [--rating 1..5] [--note text] [--context react]
  pnpm inspiration enqueue <resource-id> [--dry-run]
  pnpm inspiration ingest [--limit 6] [--dry-run]
  pnpm inspiration backfill [--limit 100] [--dry-run]
  pnpm inspiration misses [--limit 20]
  pnpm inspiration freshness [--limit 10] [--dry-run]
  pnpm inspiration noul <resource-id-or-url>
  pnpm inspiration jobs
  pnpm inspiration export
  pnpm inspiration migrate

Run before the dev server starts. PGlite supports one process per database.
Local state lives in .inspiration-local. Set INSPIRATION_LOCAL_DB for an isolated copy.
Source ingestion is local and text-only. No semantic provider runs unless configured.`);
} else if (command === "import" && values["dry-run"]) {
  print({ resources: seedCatalog().length, writes: 0 });
} else {
  let db;
  try {
    const known = [
      "import",
      "health",
      "explain",
      "inspect",
      "preference",
      "enqueue",
      "ingest",
      "backfill",
      "misses",
      "freshness",
      "noul",
      "jobs",
      "export",
      "migrate",
    ];
    if (!known.includes(command))
      throw new Error(
        `Unknown command: ${command}. Run pnpm inspiration help.`,
      );
    if (
      values["dry-run"] &&
      !["enqueue", "ingest", "backfill", "freshness"].includes(command)
    )
      throw new Error("This command does not support --dry-run.");
    if (
      ["inspect", "preference", "enqueue", "explain", "noul"].includes(
        command,
      ) &&
      !argument
    )
      throw new Error("A resource ID or query is required.");
    const limit = Number(values.limit);
    const maxLimit = command === "backfill" ? 500 : 50;
    if (!Number.isInteger(limit) || limit < 1 || limit > maxLimit)
      throw new Error(`Limit must be an integer from 1 to ${maxLimit}.`);
    db = await getInspirationDatabase();
    if (!db) throw new Error("No inspiration database configured.");
    if (command === "migrate") {
      await migrate(db);
      print({ migrated: true, database: db.kind });
    }
    if (command === "import") print({ imported: await importCatalog(db) });
    if (command === "health")
      print({
        database: db.kind,
        ...(
          await db.query(`SELECT
      (SELECT count(*)::integer FROM inspiration_resources WHERE active) AS resources,
      (SELECT count(*)::integer FROM inspiration_resources WHERE quarantined) AS quarantined,
      (SELECT count(*)::integer FROM inspiration_preferences) AS preferences,
      (SELECT count(*)::integer FROM inspiration_passages WHERE active) AS passages,
      (SELECT count(*)::integer FROM inspiration_snapshots) AS snapshots`)
        )[0],
        embeddingGaps: await embeddingGaps(db),
      });
    if (command === "explain")
      print(
        await retrieve(
          {
            query: argument,
            mode: values.mode,
            limit,
            contextKey: values.context,
          },
          { owner: true },
          { db },
        ),
      );
    if (
      command === "inspect" ||
      command === "preference" ||
      command === "enqueue"
    ) {
      const resource = await resolveResource(db, argument);
      if (!resource)
        throw new Error("Resource not found. Import the catalog first.");
      const rows = await preferences(db, values.context);
      const current = effectivePreferences(rows, values.context).get(
        resource.id,
      );
      if (command === "inspect")
        print({
          resource,
          evidence: await passagesFor(db, [resource.id]),
          preference: current ?? null,
          engagement: resolveEngagement({
            source: "wall",
            category: resource.categories[0],
            kind: resource.kind.length ? resource.kind : resource.inferred.kind,
          }),
        });
      if (command === "preference") {
        const scoped = rows.find(
          (p) =>
            p.resourceId === resource.id && p.contextKey === values.context,
        );
        print(
          await savePreference(
            db,
            parsePreference(
              {
                preference: values.value,
                rating: values.rating ? Number(values.rating) : null,
                note: values.note,
                contextKey: values.context,
                revision: scoped?.revision ?? 0,
              },
              resource.id,
            ),
          ),
        );
      }
      if (command === "enqueue") {
        if (!values["dry-run"]) await enqueue(db, resource.id);
        print({ resourceId: resource.id, queued: !values["dry-run"] });
      }
    }
    if (command === "jobs" || (command === "ingest" && values["dry-run"]))
      print(
        await db.query(
          "SELECT resource_id, state, attempts, error, next_attempt_at FROM inspiration_jobs ORDER BY updated_at DESC",
        ),
      );
    if (command === "ingest" && !values["dry-run"])
      print(await drainJobs(db, limit));
    if (command === "misses")
      print(await topMisses(db, limit > 50 ? 50 : limit));
    if (command === "noul") {
      const { judgeInspo } = await import("../src/lib/inspiration/judge.ts");
      const { experimental_evaluate: evaluate } = await import("ai");
      const target = await resolveResource(db, argument);
      if (!target)
        throw new Error("Resource not found. Import the catalog first.");
      const evidence = await passagesFor(db, [target.id]);
      const exact = await retrieve(
        { query: target.title, mode: "search", limit: 5 },
        { owner: true },
        { db },
      );
      const exactAt = exact.hits.findIndex(
        (hit) => hit.resource.id === target.id,
      );
      const intentRanks = [];
      for (const intent of target.useFor.slice(0, 2)) {
        const found = await retrieve(
          { query: intent, mode: "recommend", limit: 3 },
          { owner: true },
          { db },
        );
        const rank = found.hits.findIndex(
          (hit) => hit.resource.id === target.id,
        );
        intentRanks.push({
          intent,
          rank: rank === -1 ? null : rank + 1,
          topTitle: found.hits[0]?.resource.title ?? "",
        });
      }
      print(
        await judgeInspo(
          {
            title: target.title,
            href: target.href,
            description: target.description,
            kind: target.kind,
            stack: target.stack,
            useFor: target.useFor,
            license: target.license ?? "unknown",
            categories: target.categories,
            dateAdded: target.dateAdded,
            exactRank: exactAt === -1 ? null : exactAt + 1,
            intentRanks,
            passageCount: evidence.length,
            firstPassageHeading: evidence[0]?.heading ?? "",
          },
          (input) => evaluate(input),
        ),
      );
    }
    if (command === "freshness") {
      const queue = await freshnessQueue(db, Math.min(limit, 50));
      if (values["dry-run"]) {
        print({ stale: queue.length, sample: queue.slice(0, 6) });
      } else {
        const report = {
          checked: queue.length,
          ok: [],
          changed: [],
          moved: [],
          unreadable: [],
          dead: [],
        };
        for (const candidate of queue) {
          const result = await checkFreshness(db, candidate);
          if (result.status === "dead")
            await setQuarantine(db, result.id, result.detail);
          report[result.status].push({ id: result.id, detail: result.detail });
        }
        print(report);
      }
    }
    if (command === "backfill") {
      // A row is settled when it cannot teach us anything new: recorded
      // permanent errors (thin content, bad DNS, wrong content type, gone
      // pages, oversize, unreadable shells), or three attempts gone. Settled
      // rows keep their history but leave the backlog; transient failures
      // (timeouts, 429/403/5xx, TLS) retry until their third attempt, and a
      // future explicit `enqueue` still resets any single resource by hand.
      // COALESCE keeps never-attempted resources (NULL job row) eligible.
      const permanentErrors = `(j.error LIKE 'Too little readable text%'
        OR j.error LIKE 'No readable source body%' OR j.error LIKE '%non-public address%' OR j.error LIKE 'Only %'
        OR j.error LIKE '%HTTP 404%' OR j.error LIKE '%HTTP 410%'
        OR j.error LIKE '%ENOTFOUND%' OR j.error LIKE '%exceeds 2 MB%'
        OR j.error LIKE 'Empty source cannot replace%' OR j.error LIKE 'Cannot set properties of undefined%'
        OR j.error LIKE 'Too many source redirects%' OR j.error LIKE 'Parse Error%'
        OR j.error LIKE '%HTTP 402.%' OR j.error LIKE '%HTTP 406.%'
        OR j.error LIKE '%does not match certificate%')`;
      const settled = `AND NOT (COALESCE(j.attempts, 0) >= 3 OR (COALESCE(j.attempts, 0) >= 1 AND ${permanentErrors}))`;
      // Graduate settled rows straight to failed so the drain spends its
      // budget on fresh rows instead of re-failing known outcomes while fresh
      // rows starve behind them in claim order.
      if (!values["dry-run"]) {
        await db.query(
          `UPDATE inspiration_jobs j SET state = 'failed', attempts = 3, updated_at = now()
           FROM inspiration_resources r LEFT JOIN inspiration_passages p
           ON p.resource_id = r.id AND p.active
           WHERE j.resource_id = r.id AND r.active AND p.id IS NULL
           AND (COALESCE(j.attempts, 0) >= 3 OR (COALESCE(j.attempts, 0) >= 1 AND ${permanentErrors}))`,
        );
      }
      const missing = await db.query(
        `SELECT r.id FROM inspiration_resources r LEFT JOIN inspiration_passages p
         ON p.resource_id = r.id AND p.active LEFT JOIN inspiration_jobs j ON j.resource_id = r.id
         WHERE r.active AND p.id IS NULL ${settled}
         ORDER BY r.document->>'dateAdded' LIMIT $1`,
        [Math.min(limit, 200)],
      );
      if (values["dry-run"]) {
        const [{ total }] = await db.query(
          `SELECT count(*)::integer AS total FROM inspiration_resources r
           LEFT JOIN inspiration_passages p ON p.resource_id = r.id AND p.active
           LEFT JOIN inspiration_jobs j ON j.resource_id = r.id
           WHERE r.active AND p.id IS NULL ${settled}`,
        );
        print({
          passageLess: total,
          sample: missing.slice(0, 6).map((r) => r.id),
        });
      } else {
        // Requeue without resetting attempts or errors: the settled filter
        // above graduates rows on their history, and a reset would wipe the
        // evidence it decides on. Explicit single-resource `enqueue` still
        // resets by hand when an operator wants a fresh start.
        for (const row of missing) {
          await db.query(
            `INSERT INTO inspiration_jobs(resource_id) VALUES ($1)
             ON CONFLICT(resource_id) DO UPDATE SET state = 'pending', next_attempt_at = now()
             WHERE inspiration_jobs.state <> 'running' OR inspiration_jobs.lease_until < now()`,
            [row.id],
          );
        }
        const results = [];
        for (let done = 0; done < missing.length; done += 6)
          results.push(...(await drainJobs(db, 6)));
        print({ enqueued: missing.length, results });
      }
    }
    if (command === "export")
      print({
        version: 1,
        resources: await allResources(db),
        preferences: await db.query("SELECT * FROM inspiration_preferences"),
        passages: await db.query(
          "SELECT document, active FROM inspiration_passages",
        ),
        snapshots: await db.query("SELECT * FROM inspiration_snapshots"),
        jobs: await db.query("SELECT * FROM inspiration_jobs"),
        feedback: await db.query("SELECT * FROM inspiration_feedback"),
      });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await db?.close?.();
  }
}
