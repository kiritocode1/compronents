// N+1 elimination and single-flight refresh for the BLANK registry, using
// SvelteKit's `query.batch`, `requested()` and a remote `form`.
//
// Requires @sveltejs/kit >= 2.61.0 and these flags, both still experimental at 2.70.1:
//
//   // svelte.config.js
//   export default {
//     kit: { experimental: { remoteFunctions: true } },
//     compilerOptions: { experimental: { async: true } }
//   };
//
// Version notes that matter here:
//   2.58.0 (2026-04-23) made `limit` required on `requested()` and changed it to yield
//                       `{ arg, query }` entries rather than bare validated arguments.
//   2.59.0 (2026-05-01) taught `requested()` about `query.batch`, so per-entry refreshes
//                       collapse into one batched server call instead of one call each.
//   2.61.0 (2026-05-22) removed `query.run()`. Awaiting a query now works everywhere,
//                       including event handlers and module scope, and shares one cache.
//
// This file must be named `*.remote.ts`. It stays on the server; the client imports
// generated fetch stubs with the same names.

import { error, invalid } from "@sveltejs/kit";
import { command, form, getRequestEvent, query, requested } from "$app/server";

export interface ComponentStats {
  slug: string;
  installs: number;
  stars: number;
  lastPublishedAt: string | null;
}

// Stand-in for your database. Replace both functions with real queries; the shape is
// what matters, in particular that `readStats` takes many slugs and issues one round trip.
const table = new Map<string, ComponentStats>();

async function readStats(
  slugs: string[],
): Promise<Map<string, ComponentStats>> {
  // One query for the whole batch: `select * from component_stats where slug = any($1)`.
  const rows = slugs.map(
    (slug) =>
      table.get(slug) ?? {
        slug,
        installs: 0,
        stars: 0,
        lastPublishedAt: null,
      },
  );
  return new Map(rows.map((row) => [row.slug, row]));
}

/**
 * Batched query. Twenty components rendering `componentStats(slug)` in a loop produce
 * twenty calls in the same macrotask, which SvelteKit collects into a single request and
 * a single invocation of this function. It returns a lookup callback, not an array, so
 * ordering and duplicate arguments are handled for you.
 *
 * `'unchecked'` skips schema validation, so the argument list arrives as untrusted client
 * input and is validated below. Pass a Standard Schema instead if you have one.
 */
export const componentStats = query.batch(
  "unchecked",
  async (slugs: string[]) => {
    for (const slug of slugs) {
      if (typeof slug !== "string" || !/^[a-z0-9-]{1,64}$/.test(slug)) {
        error(
          400,
          "Component slug must be lowercase letters, digits or hyphens",
        );
      }
    }

    const byslug = await readStats(slugs);

    // Returned callback resolves one caller. `idx` is the position in `slugs`,
    // useful when the backing query returns results positionally.
    return (slug: string): ComponentStats => {
      const row = byslug.get(slug);
      if (!row) error(404, `No stats recorded for ${slug}`);
      return row;
    };
  },
);

function requireMaintainer(): string {
  const { locals } = getRequestEvent();
  const maintainer = (locals as { maintainer?: string }).maintainer;
  if (!maintainer) error(401, "Sign in to publish to the BLANK registry");
  return maintainer;
}

type PublishInput = {
  slug: string;
  version: string;
};

/**
 * Remote form. Spread it onto a `<form>` element; it works without JavaScript and
 * upgrades to a fetch submission when hydrated. Prefer this over a `+page.server.ts`
 * form action when the form is not tied to one route, since it is importable anywhere.
 *
 * `requested(componentStats, 20).refreshAll()` performs the single-flight mutation: the
 * client tells the server which query instances it currently holds, and the refreshed
 * values ride back on this response instead of costing a second round trip. Because
 * `componentStats` is a `query.batch`, all of those refreshes run as one batched call.
 */
export const publishComponent = form(
  "unchecked",
  async (data: PublishInput, issue) => {
    requireMaintainer();

    if (!/^[a-z0-9-]{1,64}$/.test(data.slug ?? "")) {
      invalid(issue.slug("Use lowercase letters, digits and hyphens only"));
    }
    if (!/^\d+\.\d+\.\d+$/.test(data.version ?? "")) {
      invalid(issue.version("Use a semver version, for example 1.4.0"));
    }

    const previous = table.get(data.slug);
    table.set(data.slug, {
      slug: data.slug,
      installs: previous?.installs ?? 0,
      stars: previous?.stars ?? 0,
      lastPublishedAt: new Date().toISOString(),
    });

    // The limit caps how many client-requested entries the server acts on; anything
    // past it is reported back to the client as a failure rather than silently dropped.
    await requested(componentStats, 20).refreshAll();

    return { slug: data.slug, version: data.version };
  },
);

/**
 * Same single-flight idea, driven imperatively from an event handler. The manual loop is
 * the alternative to `refreshAll()` when only some entries need updating: `arg` is the
 * validated argument bound to the client's original cache key, and `set()` writes the new
 * value straight into that cache with no refetch at all.
 */
export const recordInstall = command("unchecked", async (slug: string) => {
  if (!/^[a-z0-9-]{1,64}$/.test(slug)) {
    error(400, "Component slug must be lowercase letters, digits or hyphens");
  }

  const current = table.get(slug) ?? {
    slug,
    installs: 0,
    stars: 0,
    lastPublishedAt: null,
  };
  const next = { ...current, installs: current.installs + 1 };
  table.set(slug, next);

  for (const { arg, query: stats } of requested(componentStats, 20)) {
    if (arg === slug) stats.set(next);
  }

  return next.installs;
});
