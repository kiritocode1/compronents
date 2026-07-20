/**
 * Non-interactive migration gate for drizzle-kit@1.0.0-rc.4.
 *
 * rc.4 added a programmatic SDK at the `drizzle-kit/cli` subpath and a JSON
 * envelope contract shared with the CLI's `--output json` mode. The
 * architectural consequence is the point of this file: drizzle-kit's ambiguous
 * decisions (is this a rename or a drop plus create? may I drop a non-empty
 * column?) stop being an interactive prompt someone answers at 2am and become a
 * `Hint[]` that lives in the repo, gets code-reviewed, and is replayed
 * byte-identically in CI.
 *
 * Before rc.4 a non-TTY drizzle-kit run either hung on a prompt or was forced
 * through with `--force`, which silently approved every destructive change in
 * the diff. Now an unapproved destructive change comes back as a
 * `missing_hints` envelope that this gate can reject by name.
 */
import { generate, type Hint, type MissingHint, push } from "drizzle-kit/cli";

const config = {
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
} as const;

/**
 * The approval ledger. Every entry is a decision a human made once, in a pull
 * request, with the diff visible. Entity tuples are positional and their arity
 * depends on `kind`: `[schema, table, column]` for a column, `[schema, table]`
 * for a table, `[name]` for a schema or role.
 *
 * Note the literal `"foreign key"` with a space; it is the one kind in the union
 * that is not snake_case.
 */
export const approvedHints: Hint[] = [
  {
    type: "rename",
    kind: "column",
    from: ["public", "releases", "downloads"],
    to: ["public", "releases", "install_count"],
  },
  {
    type: "confirm_data_loss",
    kind: "column",
    entity: ["public", "packages", "legacy_registry_id"],
  },
];

/** Renders an unresolved decision as a line an operator can act on. */
function describe(hint: MissingHint): string {
  // `reason` only exists on the confirm_data_loss branch of the union.
  const reason = hint.type === "confirm_data_loss" ? ` (${hint.reason})` : "";
  return `${hint.type} ${hint.kind} ${hint.entity.join(".")}${reason}`;
}

export class UnapprovedSchemaChange extends Error {
  readonly unresolved: readonly MissingHint[];
  constructor(unresolved: readonly MissingHint[]) {
    super(
      `drizzle-kit needs ${unresolved.length} decision(s) that are not in approvedHints:\n` +
        unresolved.map((h) => `  ${describe(h)}`).join("\n") +
        "\nAdd them to approvedHints in a reviewed pull request, then re-run.",
    );
    this.name = "UnapprovedSchemaChange";
    this.unresolved = unresolved;
  }
}

/**
 * CI drift check. Runs `generate` with the approved hints and asserts the schema
 * and the committed migration folder already agree.
 *
 * `no_changes` is the pass condition. `ok` means someone edited the schema
 * without committing the migration, so CI just wrote one on a throwaway runner:
 * that is a failure, not a fix.
 */
export async function assertMigrationsCommitted(): Promise<void> {
  const result = await generate({ ...config, hints: approvedHints });

  switch (result.status) {
    case "no_changes":
      return;
    case "missing_hints":
      throw new UnapprovedSchemaChange(result.unresolved);
    case "ok":
      throw new Error(
        `Schema drift: drizzle-kit generated a migration in CI. Run drizzle-kit generate locally and commit it.`,
      );
    case "error":
      throw new Error(`drizzle-kit generate failed: ${result.error.code}`);
  }
}

/**
 * Deploy-time apply for environments where migration files are not used
 * (preview branches, ephemeral test databases). Same ledger, same rejection
 * behaviour, so a preview database can never take a destructive change that
 * production has not already approved.
 */
export async function pushApproved(
  databaseUrl: string,
): Promise<"applied" | "unchanged"> {
  const result = await push({
    ...config,
    url: databaseUrl,
    hints: approvedHints,
    // `strict` and `force` stay off: force would approve every destructive
    // change in the diff, which is exactly what the hint ledger replaces.
    verbose: false,
    force: false,
  });

  switch (result.status) {
    case "no_changes":
      return "unchanged";
    case "ok":
      return "applied";
    case "missing_hints":
      throw new UnapprovedSchemaChange(result.unresolved);
    case "error":
      throw new Error(`drizzle-kit push failed: ${result.error.code}`);
  }
}
