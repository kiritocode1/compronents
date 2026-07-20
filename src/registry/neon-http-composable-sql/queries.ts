import { sql, withDeadline } from "./client";

/**
 * Incident reads for a status page, written against the composable HTTP query
 * path added in `@neondatabase/serverless` 1.0.0 (2025-03-25).
 *
 * Before 1.0.0 a query template was compiled to SQL-with-placeholders eagerly,
 * at construction. A fragment built on its own therefore numbered its own
 * parameters from `$1`, and nesting it inside another query produced colliding
 * placeholders. The practical consequence was that every optional filter had to
 * be handled by hand: either string-concatenate the WHERE clause and hand-index
 * a parallel params array, or write one full query per combination of filters.
 * The first is how injection bugs get written; the second is how a three-filter
 * endpoint grows eight query functions.
 *
 * 1.0.0 moved compilation to query time (`SqlTemplate.toParameterizedQuery`
 * walks the tree and assigns `$n` in traversal order), so a fragment is inert
 * until an outer query consumes it. That is what makes the conditional-filter
 * code below possible, and it matches the postgres.js model.
 */

export type IncidentStatus =
  | "investigating"
  | "identified"
  | "monitoring"
  | "resolved";

export type IncidentFilters = {
  status?: IncidentStatus;
  /** Free text matched against title and summary. */
  search?: string;
  /** Only incidents opened at or after this instant. */
  since?: Date;
  serviceIds?: string[];
};

export type IncidentRow = {
  id: string;
  title: string;
  status: IncidentStatus;
  severity: number;
  service_id: string;
  opened_at: Date;
  resolved_at: Date | null;
};

/**
 * A fragment is whatever `sql` returns, so the type is just the return type of
 * the tagged template. It is a lazy `NeonQueryPromise`: it carries the template
 * and its values but sends nothing until awaited or nested. Never `await` a
 * fragment. Awaiting one runs it as a standalone query, which for a bare
 * `WHERE ...` fragment is a syntax error from Postgres, not a local one.
 */
type Fragment = ReturnType<typeof sql>;

/**
 * Folds fragments pairwise into a single fragment.
 *
 * This has to be a fold, not an interpolated array. Interpolating an array of
 * fragments does NOT compose them: the composer only recurses into a nested
 * template or an `unsafe()` value, and anything else is treated as a value to
 * bind. So `sql`WHERE ${frags}`` compiles to `WHERE $1` with the whole array of
 * fragment objects bound as one parameter. That fails at the database with a
 * type error rather than at the call site, so it is worth knowing by name.
 */
function joinFragments(
  parts: Fragment[],
  separator: "AND" | "OR" | ",",
): Fragment | null {
  if (parts.length === 0) return null;
  return parts.reduce((left, right) =>
    separator === ","
      ? sql`${left}, ${right}`
      : separator === "AND"
        ? sql`${left} AND ${right}`
        : sql`${left} OR ${right}`,
  );
}

/**
 * Each filter contributes a fragment or nothing. No branch here ever touches a
 * SQL string: an absent filter contributes no fragment, and a present one
 * contributes a fragment whose values stay values all the way to the wire.
 */
function buildWhere(filters: IncidentFilters): Fragment {
  const conditions: Fragment[] = [];

  if (filters.status) {
    conditions.push(sql`i.status = ${filters.status}`);
  }

  if (filters.search) {
    // The value is still a bound parameter; only the wildcards are literal.
    const pattern = `%${filters.search}%`;
    conditions.push(
      sql`(i.title ILIKE ${pattern} OR i.summary ILIKE ${pattern})`,
    );
  }

  if (filters.since) {
    conditions.push(sql`i.opened_at >= ${filters.since}`);
  }

  if (filters.serviceIds?.length) {
    // One bound array beats N placeholders: `= ANY($n)` keeps the parameter
    // count fixed no matter how many ids arrive, so the query text is stable
    // and Postgres can reuse the plan.
    conditions.push(sql`i.service_id = ANY(${filters.serviceIds})`);
  }

  const predicate = joinFragments(conditions, "AND");
  // An empty fragment interpolates to the empty string, so the unfiltered case
  // needs no separate query and no dangling WHERE.
  return predicate ? sql`WHERE ${predicate}` : sql``;
}

/**
 * One query function covering every combination of filters, ordering, and
 * pagination. Pre-1.0.0 this was the shape that forced string building.
 */
export async function listIncidents(
  filters: IncidentFilters,
  page: { limit: number; offset: number },
): Promise<IncidentRow[]> {
  const where = buildWhere(filters);

  // Clamped at the boundary. `limit` is a bound parameter and cannot inject,
  // but an unclamped one is still a denial-of-service knob on a public handler.
  const limit = Math.min(Math.max(page.limit, 1), 100);

  const rows = await sql`
    SELECT i.id, i.title, i.status, i.severity, i.service_id, i.opened_at, i.resolved_at
    FROM incidents i
    ${where}
    ORDER BY i.opened_at DESC
    LIMIT ${limit} OFFSET ${Math.max(page.offset, 0)}
  `;

  return rows as IncidentRow[];
}

/**
 * The same `where` fragment reused in a second query. Reuse is safe: the
 * fragment is not consumed by being nested, and its values are re-bound under
 * whatever numbers the new outer query assigns.
 *
 * Both queries go out as two separate HTTP requests. They are not a consistent
 * snapshot of each other, and over HTTP there is no way to make them one
 * without `sql.transaction`, below.
 */
export async function countIncidents(
  filters: IncidentFilters,
): Promise<number> {
  const rows =
    await sql`SELECT count(*)::int AS total FROM incidents i ${buildWhere(filters)}`;
  return (rows[0]?.total as number) ?? 0;
}

/**
 * Sends both queries as one non-interactive transaction: a single HTTP request,
 * one snapshot, so the page and its total agree. Every query must be known up
 * front. Nothing here can read the first result and decide what to ask second,
 * which is the whole limitation of the HTTP path.
 *
 * `transaction()` also takes `isolationLevel`, `readOnly`, and `deferrable`.
 * `readOnly: true` is worth setting on a pure read: it lets Postgres reject a
 * write that should not be in this path.
 */
export async function listIncidentsPage(
  filters: IncidentFilters,
  page: { limit: number; offset: number },
): Promise<{ rows: IncidentRow[]; total: number }> {
  const where = buildWhere(filters);
  const limit = Math.min(Math.max(page.limit, 1), 100);

  const [rows, totals] = await sql.transaction(
    [
      sql`
        SELECT i.id, i.title, i.status, i.severity, i.service_id, i.opened_at, i.resolved_at
        FROM incidents i
        ${where}
        ORDER BY i.opened_at DESC
        LIMIT ${limit} OFFSET ${Math.max(page.offset, 0)}
      `,
      sql`SELECT count(*)::int AS total FROM incidents i ${where}`,
    ],
    { readOnly: true, isolationLevel: "RepeatableRead" },
  );

  return {
    rows: rows as IncidentRow[],
    total: (totals[0]?.total as number) ?? 0,
  };
}

/**
 * `sql.unsafe()` interpolates a raw string with no escaping and no binding. It
 * is for identifiers, which cannot be parameters in Postgres: you cannot write
 * `ORDER BY $1`. The allowlist is the security boundary, so it maps caller
 * input to constants rather than validating and passing the input through.
 */
const SORT_COLUMNS = {
  opened: "i.opened_at",
  severity: "i.severity",
  updated: "i.updated_at",
} as const;

export function listIncidentsSorted(
  filters: IncidentFilters,
  sort: keyof typeof SORT_COLUMNS,
  direction: "asc" | "desc",
) {
  const column = SORT_COLUMNS[sort];
  if (!column) throw new Error(`Unsupported sort column: ${String(sort)}`);
  const order = direction === "asc" ? "ASC" : "DESC";

  return sql`
    SELECT i.id, i.title, i.status, i.severity, i.service_id, i.opened_at, i.resolved_at
    FROM incidents i
    ${buildWhere(filters)}
    ORDER BY ${sql.unsafe(column)} ${sql.unsafe(order)}
    LIMIT 50
  `;
}

/**
 * The `sql.query(text, params)` escape hatch, added in 1.0.0 to replace the
 * `sql(text, params)` call that release made throw.
 *
 * You need it exactly when the query text is a runtime string rather than a
 * literal in your source: a statement handed over by another layer (a query
 * builder's `.toSQL()`, a saved report definition, a captured statement being
 * replayed) where you hold `text` and `params` as separate values and there is
 * no template to write. If you are typing the SQL out yourself, use a template
 * and let the driver number the placeholders.
 *
 * Its real limit: a `sql.query()` result is NOT composable when it has
 * parameters. Nesting one inside a template throws `This query is not
 * composable`, because it arrives already numbered against itself and the
 * composer refuses to silently renumber it. So `sql.query` is a whole-query
 * escape hatch, never a fragment. Everything conditional has to stay on the
 * template path.
 */
export async function runSavedReport(report: {
  text: string;
  params: unknown[];
}): Promise<Record<string, unknown>[]> {
  const rows = await sql.query(report.text, report.params, withDeadline(5_000));
  return rows as Record<string, unknown>[];
}

/**
 * Migration note for 0.x code. All three of these threw the moment you upgraded
 * to 1.0.0, with a message naming the fix:
 *
 * ```ts
 * await sql(`SELECT * FROM incidents WHERE id = ${id}`);   // was injectable
 * await sql("SELECT * FROM incidents WHERE id = $1", [id]); // was safe
 * await sql("SELECT 1", [], { fullResults: true });
 * ```
 *
 * The first becomes a template (`sql`... ${id}``). The second and third become
 * `sql.query("SELECT * FROM incidents WHERE id = $1", [id])`. The middle case
 * is the one that surprises people: it was never a vulnerability, but it is
 * indistinguishable from the first at the call site, so 1.0.0 rejects the shape
 * rather than trying to tell them apart.
 */
