#!/usr/bin/env node
import { parseArgs } from "node:util";
import { getInspirationDatabase, migrate } from "../src/lib/inspiration/db.ts";
import { seedCatalog } from "../src/lib/inspiration/catalog.ts";
import { drainJobs, enqueue } from "../src/lib/inspiration/ingest.ts";
import { allResources, effectivePreferences, importCatalog, passagesFor, preferences, resolveResource, savePreference } from "../src/lib/inspiration/store.ts";
import { retrieve } from "../src/lib/inspiration/retrieve.ts";
import { parsePreference } from "../src/lib/inspiration/validation.ts";
import { resolveEngagement } from "../src/lib/inspiration-engagement.ts";

const { values, positionals: [command = "help", argument] } = parseArgs({ allowPositionals: true, options: {
  "dry-run": { type: "boolean" }, limit: { type: "string", default: "6" }, mode: { type: "string", default: "search" },
  context: { type: "string", default: "" }, value: { type: "string" }, rating: { type: "string" }, note: { type: "string", default: "" },
} });
const print = value => console.log(JSON.stringify(value, null, 2));
if (command === "help") {
  console.log(`Local inspiration database. No DATABASE_URL fallback or cloud provisioning.
  pnpm inspiration import [--dry-run]
  pnpm inspiration health
  pnpm inspiration explain "query" [--mode search|recommend|discover] [--limit 6] [--context react]
  pnpm inspiration inspect <resource-id-or-url>
  pnpm inspiration preference <resource-id> --value prefer|neutral|avoid [--rating 1..5] [--note text] [--context react]
  pnpm inspiration enqueue <resource-id> [--dry-run]
  pnpm inspiration ingest [--limit 6] [--dry-run]
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
    const known = ["import", "health", "explain", "inspect", "preference", "enqueue", "ingest", "jobs", "export", "migrate"];
    if (!known.includes(command)) throw new Error(`Unknown command: ${command}. Run pnpm inspiration help.`);
    if (values["dry-run"] && !["enqueue", "ingest"].includes(command)) throw new Error("This command does not support --dry-run.");
    if (["inspect", "preference", "enqueue", "explain"].includes(command) && !argument) throw new Error("A resource ID or query is required.");
    const limit = Number(values.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) throw new Error("Limit must be an integer from 1 to 50.");
    db = await getInspirationDatabase();
    if (!db) throw new Error("No inspiration database configured.");
    if (command === "migrate") { await migrate(db); print({ migrated: true, database: db.kind }); }
    if (command === "import") print({ imported: await importCatalog(db) });
    if (command === "health") print({ database: db.kind, ...(await db.query(`SELECT
      (SELECT count(*)::integer FROM inspiration_resources WHERE active) AS resources,
      (SELECT count(*)::integer FROM inspiration_preferences) AS preferences,
      (SELECT count(*)::integer FROM inspiration_passages WHERE active) AS passages,
      (SELECT count(*)::integer FROM inspiration_snapshots) AS snapshots`))[0] });
    if (command === "explain") print(await retrieve({ query: argument, mode: values.mode, limit, contextKey: values.context }, { owner: true }, { db }));
    if (command === "inspect" || command === "preference" || command === "enqueue") {
      const resource = await resolveResource(db, argument);
      if (!resource) throw new Error("Resource not found. Import the catalog first.");
      const rows = await preferences(db, values.context);
      const current = effectivePreferences(rows, values.context).get(resource.id);
      if (command === "inspect") print({ resource, evidence: await passagesFor(db, [resource.id]), preference: current ?? null,
        engagement: resolveEngagement({ source: "wall", category: resource.categories[0], kind: resource.kind.length ? resource.kind : resource.inferred.kind }) });
      if (command === "preference") {
        const scoped = rows.find(p => p.resourceId === resource.id && p.contextKey === values.context);
        print(await savePreference(db, parsePreference({ preference: values.value, rating: values.rating ? Number(values.rating) : null,
          note: values.note, contextKey: values.context, revision: scoped?.revision ?? 0 }, resource.id)));
      }
      if (command === "enqueue") { if (!values["dry-run"]) await enqueue(db, resource.id); print({ resourceId: resource.id, queued: !values["dry-run"] }); }
    }
    if (command === "jobs" || (command === "ingest" && values["dry-run"])) print(await db.query("SELECT resource_id, state, attempts, error, next_attempt_at FROM inspiration_jobs ORDER BY updated_at DESC"));
    if (command === "ingest" && !values["dry-run"]) print(await drainJobs(db, limit));
    if (command === "export") print({ version: 1, resources: await allResources(db), preferences: await db.query("SELECT * FROM inspiration_preferences"),
      passages: await db.query("SELECT document, active FROM inspiration_passages"), snapshots: await db.query("SELECT * FROM inspiration_snapshots"),
      jobs: await db.query("SELECT * FROM inspiration_jobs"), feedback: await db.query("SELECT * FROM inspiration_feedback") });
  } catch (error) { console.error(error.message); process.exitCode = 1; }
  finally { await db?.close?.(); }
}
