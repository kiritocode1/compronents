import { Elysia, status, t, type UnwrapSchema } from "elysia";
import { z } from "zod";

/**
 * Elysia 2.0 validation surface: TypeBox v1 and Standard Schema side by side.
 *
 * The dependency swap is the part that breaks installs. TypeBox shipped v1
 * under a NEW npm package name, and Elysia 2.0 follows it:
 *
 *   elysia@1.4.29   peerDependencies: "@sinclair/typebox": ">= 0.34.0 < 1"
 *   elysia@2.0.x    peerDependencies: "typebox": ">= 1.3.0"
 *
 * So a 2.0 upgrade means `@sinclair/typebox` out, `typebox` in. Leaving the
 * old package installed gives you two TypeBox copies and validators that
 * mysteriously reject valid input, because the schema symbols do not match.
 *
 * 2.0 also makes the TypeBox bridge tree-shakeable rather than always on, and
 * `AnySchema` is now `TypeBoxSchema | StandardSchemaV1Like`: any channel of
 * any route accepts either flavour, and they can be mixed on one route.
 */

/**
 * Standard Schema side. Zod 4, Valibot 1, and ArkType 2 all implement the
 * Standard Schema v1 interface, so Elysia consumes them directly with no
 * adapter package and no `zodToJsonSchema` step.
 *
 * Use this when the schema is shared with a client or an existing domain
 * layer that already speaks Zod. `.refine` and friends work, because Elysia
 * calls the library's own validator rather than reimplementing it.
 */
const CreateDeployment = z.object({
  project: z.string().min(1).max(64),
  ref: z
    .string()
    .regex(/^[0-9a-f]{7,40}$/, "ref must be a hex commit sha")
    .describe("Git commit to deploy"),
  environment: z.enum(["preview", "production"]),
  notify: z.array(z.email()).max(10).default([]),
});

/**
 * TypeBox side, via the `t` builder re-exported from elysia.
 *
 * Prefer TypeBox for RESPONSE schemas and for anything hot. TypeBox schemas
 * are plain JSON Schema objects, so Elysia can compile them into the
 * ahead-of-time response encoder (exact-mirror) and skip a validation pass
 * entirely. A Standard Schema response has to run the foreign validator on
 * every request instead.
 */
const Deployment = t.Object({
  id: t.String({ format: "uuid" }),
  project: t.String(),
  ref: t.String(),
  environment: t.Union([t.Literal("preview"), t.Literal("production")]),
  createdAt: t.String({ format: "date-time" }),
  url: t.String({ format: "uri" }),
});

/**
 * Getting the TypeScript type back out of a schema.
 *
 * TypeBox v1 dropped the `.static` property that 0.34 schemas carried, so the
 * old `typeof Deployment.static` no longer compiles. Elysia re-exports
 * `UnwrapSchema` from its root, which resolves either flavour: hand it a
 * TypeBox schema or a Standard Schema and it gives you the validated type.
 * Using it keeps this file free of a direct `typebox` import.
 */
type Deployment = UnwrapSchema<typeof Deployment>;

const deployments = new Map<string, Deployment>();

export const app = new Elysia({ prefix: "/deployments" })
  // Remember the 2.0 argument order: (path, hook, handler). The hook object
  // is second, the handler is third.
  .post(
    "/",
    {
      // Zod on the way in, TypeBox on the way out, one route.
      body: CreateDeployment,
      response: {
        201: Deployment,
        409: t.Object({ error: t.String(), existingId: t.String() }),
      },
    },
    ({ body, set }) => {
      // `body` is inferred from the Zod schema, including the `.default([])`
      // on `notify`, so the output type is applied, not the input type.
      const key = `${body.project}@${body.ref}:${body.environment}`;

      const existing = deployments.get(key);
      if (existing)
        return status(409, {
          error: "That ref is already deployed to this environment",
          existingId: existing.id,
        });

      const deployment = {
        id: crypto.randomUUID(),
        project: body.project,
        ref: body.ref,
        environment: body.environment,
        createdAt: new Date().toISOString(),
        url: `https://${body.project}-${body.ref.slice(0, 7)}.blank.dev`,
      };

      deployments.set(key, deployment);
      set.status = 201;

      return deployment;
    },
  )
  .get(
    "/:id",
    {
      // TypeBox on params so the numeric and boolean coercion Elysia does for
      // path and query segments applies. Standard Schema validators receive
      // the raw string, since Elysia will not silently coerce for a foreign
      // library that may have its own coercion rules.
      params: t.Object({ id: t.String({ format: "uuid" }) }),
      query: t.Object({ includeUrl: t.Optional(t.Boolean({ default: true })) }),
      response: { 200: Deployment, 404: t.Object({ error: t.String() }) },
    },
    ({ params, query }) => {
      const found = [...deployments.values()].find((d) => d.id === params.id);
      if (!found) return status(404, { error: "No such deployment" });

      return query.includeUrl === false ? { ...found, url: "" } : found;
    },
  );

export type App = typeof app;
