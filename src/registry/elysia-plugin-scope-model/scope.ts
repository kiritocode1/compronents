import { Elysia, status, t } from "elysia";
import type { EventScope } from "elysia/types";

/**
 * Elysia 2.0 lifecycle and scope model.
 *
 * Verified against elysia@2.0.0-exp.46 type declarations. Three breaking
 * changes land here at once, and stale 1.4 code hits all three.
 *
 * 1. The `on` prefix is gone from every lifecycle method.
 *
 *      1.4.29                2.0
 *      onRequest        ->   request
 *      onParse          ->   parse
 *      onTransform      ->   transform
 *      onBeforeHandle   ->   beforeHandle
 *      onAfterHandle    ->   afterHandle
 *      onAfterResponse  ->   afterResponse
 *      onMapResponse    ->   mapResponse
 *      onError          ->   error
 *      onStart          ->   setup
 *      onStop           ->   cleanup
 *
 * 2. `resolve` and `mapResolve` were REMOVED. `derive` and `mapDerive` are
 *    the only context extension hooks in 2.0.
 *
 * 3. The third scope is `'plugin'`, not `'scoped'`. The type is `EventScope`
 *    (`'global' | 'local' | 'plugin'`), renamed from `LifeCycleType`. There is
 *    no `as('scoped')` overload left, so a stale call is a compile error
 *    rather than a silent downgrade to local scope.
 */

// Encoding the widening ladder as a value keeps this honest: if a future
// release renames or drops a scope, this array stops type checking.
export const scopeOrder = [
  "local",
  "plugin",
  "global",
] as const satisfies readonly EventScope[];

type Actor = { id: string; email: string; tier: "free" | "team" };

/** Stand in session lookup. Swap for your own store. */
const lookupActor = async (token: string | undefined): Promise<Actor | null> =>
  token?.startsWith("sess_")
    ? { id: token.slice(5), email: `${token.slice(5)}@blank.dev`, tier: "team" }
    : null;

/**
 * The idiomatic 2.0 auth plugin.
 *
 * Scope rules, the part people actually get wrong:
 *
 * - `local` (default): the hook applies to routes on THIS instance only. A
 *   parent that `.use()`s the plugin sees nothing on its own routes.
 * - `'plugin'`: applies to this instance and its direct parent, then stops.
 *   This is what you want for auth: it reaches the app that opted in without
 *   infecting unrelated sibling instances.
 * - `'global'`: applies to every ancestor, all the way up. Reserve it for
 *   genuinely cross cutting concerns such as tracing or request timing.
 *
 * The scope is the FIRST argument, the handler is second.
 */
export const auth = new Elysia({ name: "blank/auth" })
  .guard({
    cookie: t.Object({ session: t.Optional(t.String({ minLength: 16 })) }),
  })
  // 2.0 spelling of the old `derive('scoped', ...)`.
  .derive("plugin", async ({ cookie }) => {
    const actor = await lookupActor(cookie.session?.value);

    // Returning `status()` from a derive short circuits the request AND is
    // folded into the route's inferred error union, so Eden clients see 401
    // as a real branch rather than an untyped throw.
    if (!actor) return status(401, { error: "Session expired or missing" });

    return { actor };
  });

/**
 * Ambient timing plugin.
 *
 * `.as('global')` promotes every pending local and plugin scoped hook on this
 * instance in one call. Prefer it over annotating each hook when the entire
 * plugin is meant to be ambient. Note `afterResponse`, not `onAfterResponse`.
 */
export const requestClock = new Elysia({ name: "blank/request-clock" })
  .derive(() => ({ startedAt: performance.now() }))
  .afterResponse(({ startedAt, path }) => {
    const ms = performance.now() - startedAt;
    if (ms > 250) console.warn(`slow route ${path} took ${ms.toFixed(1)}ms`);
  })
  .as("global");

/**
 * Macro definition, 2.0 shape.
 *
 * A macro property is `derive`. The `resolve` key was dropped from
 * `MacroProperty` in 2.0, mirroring the instance level removal. Values
 * returned from a macro `derive` land on the handler context and flow to Eden.
 */
export const tierGate = new Elysia({ name: "blank/tier-gate" })
  .use(auth)
  .macro({
    // Function form: the macro takes an argument at the call site.
    requireTier: (minimum: Actor["tier"]) => ({
      // A macro `derive` runs in the derive phase and is NOT ordered after the
      // instance level derives of plugins you mounted, so reading `actor` here
      // gets `undefined` even though `auth` is mounted. Keep macro derives to
      // values the macro itself owns.
      derive: () => ({ requiredTier: minimum }),

      // `beforeHandle` runs after the whole derive phase, so the plugin scoped
      // `actor` IS available here. It is typed as Partial because the macro
      // could be applied to an instance that never mounted `auth`, so narrow
      // it once rather than casting.
      beforeHandle({ actor }) {
        if (!actor) return status(401, { error: "Authentication required" });
        if (minimum === "team" && actor.tier !== "team")
          return status(402, { error: "This route requires a team plan" });
      },
    }),
  })
  .as("plugin");

export const app = new Elysia()
  .use(requestClock)
  .use(tierGate)
  // ARGUMENT ORDER FLIPPED IN 2.0. The hook object is now the SECOND argument
  // and the handler is THIRD:
  //
  //   1.4.29  get(path, handler, hook?)
  //   2.0     get(path, hook, handler)   |   get(path, handler)
  //
  // Every pre 2.0 tutorial and answer online uses the old order. Swapping the
  // arguments is the single most common 2.0 migration failure.
  .get(
    "/me",
    {
      requireTier: "team",
      response: {
        200: t.Object({
          id: t.String(),
          email: t.String(),
          requiredTier: t.String(),
        }),
      },
    },
    // `actor` from the plugin scoped derive and `requiredTier` from the macro
    // derive are both present and fully typed. No casts, no `any`.
    ({ actor, requiredTier }) => ({
      id: actor.id,
      email: actor.email,
      requiredTier,
    }),
  )
  // `setup` replaces `onStart`, `cleanup` replaces `onStop`.
  .setup(({ server }) => {
    console.log(`BLANK api listening on ${server?.url}`);
  })
  .cleanup(() => {
    console.log("BLANK api drained");
  });

export type App = typeof app;
