/**
 * Porting a durable workflow from Effect v3 to Effect v4.
 *
 * This file is the v4 destination (pinned: effect@4.0.0-beta.98). Each call
 * site that changed carries the exact v3 spelling it replaces, taken from
 * @effect/workflow@0.19.0 and effect@3.22.0 (both published 2026-07-13, the
 * current v3 line).
 *
 * The two versions cannot be installed side by side, so treat the `v3:`
 * comments as the before, the code as the after.
 *
 * Verified deltas, newest first:
 *
 *  1. Package move. v3: `import { Workflow } from "@effect/workflow"`.
 *     v4: `import { Workflow } from "effect/unstable/workflow"`. The durable
 *     execution engine, RPC, SQL, HTTP, and AI packages all moved into core
 *     under `effect/unstable/*`; there is no separate install.
 *
 *  2. Tag-first `Workflow.make`, landed effect@4.0.0-beta.75 (2026-06-01,
 *     PR Effect-TS/effect-smol#2294). v3 took `{ name, payload, ... }` in one
 *     options object. v4 takes the tag as the first argument, exposes it as
 *     `_tag`, and supports `class X extends Workflow.make(...)`.
 *
 *  3. Schema constraint surface, landed effect@4.0.0-beta.86 (2026-06-23,
 *     PR Effect-TS/effect-smol#2442). v3 workflow generics were bounded by
 *     `Schema.Schema.Any` / `Schema.Schema.All`; v4 bounds them by
 *     `Schema.Top` / `Schema.Constraint`. This is invisible when you pass
 *     schemas directly and only bites when you wrote your own generic helper.
 *
 *  4. `Schema.TaggedError<Self>(identifier?)(tag, fields)` in v3 became
 *     `Schema.TaggedErrorClass<Self>()(tag, fields)` in v4.
 *
 *  5. `Schema.Literal("a", "b")` (variadic) in v3 became
 *     `Schema.Literals(["a", "b"])` (array) in v4.
 *
 *  6. `WorkflowEngine.makeUnsafe` returns `WorkflowEngine["Type"]` in v3 and
 *     `WorkflowEngine["Service"]` in v4, following the Context.Service rename.
 *     `WorkflowEngine.layerMemory` kept its name in both.
 */

import { Effect, Layer, Schema } from "effect";
// v3: import { Activity, Workflow, WorkflowEngine } from "@effect/workflow"
import { Activity, Workflow, WorkflowEngine } from "effect/unstable/workflow";

// v3: export class ImportRejected extends Schema.TaggedError<ImportRejected>()(
//       "ImportRejected",
//       { sourceId: Schema.String, reason: Schema.Literal("unreadable", "schema_drift") }
//     ) {}
export class ImportRejected extends Schema.TaggedErrorClass<ImportRejected>()(
  "ImportRejected",
  {
    sourceId: Schema.String,
    reason: Schema.Literals(["unreadable", "schema_drift"]),
  },
) {}

// v3: export const ImportCatalog = Workflow.make({
//       name: "ImportCatalog",
//       payload: { ... },
//       success: ...,
//       error: ImportRejected,
//       idempotencyKey: ({ sourceId }) => sourceId
//     })
//
// v4: the tag moves out front and the result is subclassable, which is what
// makes `ImportCatalog._tag` and `typeof ImportCatalog` usable as a pair.
export class ImportCatalog extends Workflow.make("ImportCatalog", {
  payload: {
    sourceId: Schema.String,
    revision: Schema.Int,
  },
  success: Schema.Struct({ rowsImported: Schema.Int }),
  error: ImportRejected,
  idempotencyKey: ({ sourceId, revision }) => `${sourceId}:${revision}`,
}) {}

/**
 * `Activity.make` is unchanged between the two majors apart from its generic
 * bounds (delta 3). Bodies port across untouched.
 */
const fetchManifest = (sourceId: string) =>
  Activity.make({
    name: "FetchManifest",
    success: Schema.Int,
    error: ImportRejected,
    execute: Effect.gen(function* () {
      const attempt = yield* Activity.CurrentAttempt;
      if (attempt > 3) {
        return yield* new ImportRejected({ sourceId, reason: "unreadable" });
      }
      return 4200;
    }),
  });

/**
 * `toLayer` also ported unchanged. The workflow body is a plain Effect in both
 * majors; only the activity checkpoints decide what is skipped on replay.
 */
export const ImportCatalogLayer = ImportCatalog.toLayer(
  Effect.fnUntraced(function* (payload) {
    const rowsImported = yield* fetchManifest(payload.sourceId);
    return { rowsImported };
  }),
);

// v3 and v4 agree on the name here; only the service type behind it changed.
export const ImportCatalogLive = ImportCatalogLayer.pipe(
  Layer.provideMerge(WorkflowEngine.layerMemory),
);

/**
 * Generic helpers are where delta 3 actually shows up. A v3 helper written as
 * `<S extends Schema.Schema.Any>` does not compile against v4; the equivalent
 * bound is `Schema.Top`.
 */
export const describeWorkflow = <
  Tag extends string,
  Payload extends Schema.Struct.Fields,
  Success extends Schema.Top,
  Error extends Schema.Top,
>(
  workflow: Workflow.Workflow<Tag, Schema.Struct<Payload>, Success, Error>,
): { readonly tag: Tag; readonly fields: ReadonlyArray<string> } => ({
  // v3 exposed no `_tag` on workflows; you carried the name separately.
  tag: workflow._tag,
  fields: Object.keys(workflow.payloadSchema.fields),
});

/** Same call in both majors, but the payload now flows through `~type.make.in`. */
export const runImport = (sourceId: string, revision: number) =>
  ImportCatalog.execute({ sourceId, revision });
