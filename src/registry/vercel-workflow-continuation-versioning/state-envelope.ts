/**
 * state-envelope.ts
 *
 * The typed gate for state that crosses a deployment boundary in a
 * self-upgrading Vercel Workflow loop.
 *
 * Failure modes solved:
 *
 *   1. TypeScript stops helping at the exact boundary that needs it. A run is
 *      pinned to the deployment that started it, and the only supported way
 *      off that pin is start(fn, args, { deploymentId: "latest" }). The SDK's
 *      own type declaration says what that costs, verbatim from
 *      workflow@4.6.2 (@workflow/core/dist/runtime/start.d.ts):
 *
 *        "When `deploymentId` is provided, the argument and return types
 *         become `unknown` since there is no guarantee the types will be
 *         consistent across deployments."
 *
 *      So the continuation state is an untyped wire format between two
 *      versions of your own code, and the compiler will not tell you when they
 *      disagree. The versioning guide names the same thing in prose: "The
 *      serialized state is the migration boundary between versions."
 *      https://workflow.dev/docs/foundations/versioning
 *
 *   2. Silent shape drift, which is what actually happens. Deploy 12 renames
 *      lastSentAt to lastDigestAt. An in-flight loop started on deploy 11
 *      hands deploy 12 the old object. The field reads undefined, the digest
 *      window falls back to the epoch, every subscriber gets a year of
 *      articles, and the loop writes the broken shape forward so the next hop
 *      does it again. Nothing threw. decodeState refuses the undeclared shape
 *      instead of coercing it.
 *
 *   3. The rollback, which goes the other way. Migrations only run forward.
 *      Roll deploy 12 back to deploy 11 and the older code now receives state
 *      stamped with a version it has never heard of. There is no correct
 *      coercion for that, so this refuses loudly and stops the chain rather
 *      than guessing at a field it cannot know about.
 *
 *   4. The loop that cannot die. Each hop starts a fresh run and exits, so an
 *      always-continuing loop is an unbounded chain of runs that no single
 *      cancellation stops. The envelope carries its own hop count and a cap,
 *      which is the cheapest place to put the brake.
 *
 * Pure logic, no SDK imports. Run it: `bun run state-envelope.ts`.
 * The workflow wiring lives in digest-loop.ts.
 */

/** What actually travels between deployments. Keep it boring and flat. */
export interface StateEnvelope {
  /** Schema version of `state`, owned by the deployment that wrote it. */
  readonly v: number;
  /** How many continuation hops this chain has taken. */
  readonly hops: number;
  readonly state: unknown;
}

export type EnvelopeRejection =
  | "not-an-envelope"
  | "version-from-the-future"
  | "unknown-version"
  | "migration-failed"
  | "invalid-after-migration"
  | "hop-budget-exhausted";

export class UnreadableState extends Error {
  readonly reason: EnvelopeRejection;
  readonly envelopeVersion: number | null;
  constructor(
    reason: EnvelopeRejection,
    detail: string,
    envelopeVersion: number | null = null,
  ) {
    super(`${reason}: ${detail}`);
    this.name = "UnreadableState";
    this.reason = reason;
    this.envelopeVersion = envelopeVersion;
  }
}

/**
 * One migration per version step. `migrations[i]` takes a version-`i` state to
 * a version-`i+1` state, so `migrations.length` IS the current version. There
 * is no way to declare a version without declaring how to reach it, which is
 * the property that makes a forgotten migration a compile-time gap rather than
 * a runtime surprise.
 *
 * Migrations receive `unknown` on purpose. That is genuinely what arrives, and
 * typing the parameter as the old interface would be a lie the compiler cannot
 * check: the old interface lives in a deployment that may no longer exist.
 */
export interface StateVersions<Current> {
  readonly migrations: readonly ((prior: unknown) => unknown)[];
  /** Structural check for the current shape. This is the only real guard. */
  readonly validate: (candidate: unknown) => candidate is Current;
  /** Refuse to continue past this many hops. */
  readonly maxHops: number;
}

export function currentVersion<T>(spec: StateVersions<T>): number {
  return spec.migrations.length;
}

/** Stamp state for the next deployment to read. */
export function encodeState<T>(
  spec: StateVersions<T>,
  state: T,
  hops: number,
): StateEnvelope {
  return { v: currentVersion(spec), hops, state };
}

function isEnvelope(value: unknown): value is StateEnvelope {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    Number.isInteger(candidate.v) &&
    Number.isInteger(candidate.hops) &&
    "state" in candidate
  );
}

/**
 * Turn the `unknown` that crossed the deployment boundary back into a value
 * this deployment is allowed to act on, or refuse.
 *
 * Refusing is the feature. A continuation that throws leaves a failed run with
 * its input intact in the event log, which is a thing you can inspect, fix,
 * and rerun. A continuation that coerces leaves correct-looking runs writing
 * wrong data at a rate of one per interval until somebody notices.
 */
export function decodeState<T>(
  spec: StateVersions<T>,
  input: unknown,
): { state: T; hops: number } {
  if (!isEnvelope(input)) {
    throw new UnreadableState(
      "not-an-envelope",
      "continuation argument was not stamped by encodeState; a run started before versioning was introduced needs a v0 envelope wrapped around it at the call site",
    );
  }

  const target = currentVersion(spec);

  if (input.v > target) {
    throw new UnreadableState(
      "version-from-the-future",
      `state is v${input.v} and this deployment understands up to v${target}, so a newer deployment wrote it and this one was rolled back under it`,
      input.v,
    );
  }
  if (input.v < 0) {
    throw new UnreadableState(
      "unknown-version",
      `v${input.v} is not a version`,
      input.v,
    );
  }
  if (input.hops >= spec.maxHops) {
    throw new UnreadableState(
      "hop-budget-exhausted",
      `chain reached ${input.hops} hops against a cap of ${spec.maxHops}; start a fresh chain rather than raising the cap without reading why it ran this long`,
      input.v,
    );
  }

  let carried = input.state;
  for (let v = input.v; v < target; v += 1) {
    try {
      carried = spec.migrations[v](carried);
    } catch (error) {
      throw new UnreadableState(
        "migration-failed",
        `v${v} to v${v + 1} threw: ${error instanceof Error ? error.message : String(error)}`,
        input.v,
      );
    }
  }

  if (!spec.validate(carried)) {
    throw new UnreadableState(
      "invalid-after-migration",
      `state failed the v${target} shape check after migrating from v${input.v}`,
      input.v,
    );
  }

  return { state: carried, hops: input.hops };
}

// ---------------------------------------------------------------------------
// demo: bun run state-envelope.ts
// ---------------------------------------------------------------------------

/** v2 of the digest loop's state, as deployment 12 understands it. */
interface DigestStateV2 {
  readonly subscriberId: string;
  /** ISO timestamp. Renamed from lastSentAt in v1. */
  readonly lastDigestAt: string;
  /** Added in v2; v1 runs are migrated onto the account default. */
  readonly locale: string;
}

const digestVersions: StateVersions<DigestStateV2> = {
  maxHops: 400,
  migrations: [
    // v0 -> v1: the original loop tracked only the subscriber.
    (prior) => {
      const p = prior as { subscriberId: string };
      return {
        subscriberId: p.subscriberId,
        lastSentAt: "1970-01-01T00:00:00.000Z",
      };
    },
    // v1 -> v2: rename lastSentAt, add locale.
    (prior) => {
      const p = prior as { subscriberId: string; lastSentAt: string };
      return {
        subscriberId: p.subscriberId,
        lastDigestAt: p.lastSentAt,
        locale: "en-GB",
      };
    },
  ],
  validate: (candidate): candidate is DigestStateV2 => {
    if (typeof candidate !== "object" || candidate === null) return false;
    const c = candidate as Record<string, unknown>;
    return (
      typeof c.subscriberId === "string" &&
      typeof c.lastDigestAt === "string" &&
      typeof c.locale === "string"
    );
  },
};

let failures = 0;

function check(name: string, ok: boolean, detail: string): void {
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}\n      ${detail}`);
}

function reject(fn: () => unknown): UnreadableState | null {
  try {
    fn();
    return null;
  } catch (error) {
    return error instanceof UnreadableState ? error : null;
  }
}

function demo(): void {
  const SUBSCRIBER = "sub_4417";

  // 1. The bug this exists to stop, reproduced without the envelope. Deploy 12
  //    reads a raw v1 object straight off the wire. The rename is invisible.
  {
    const fromDeploy11 = {
      subscriberId: SUBSCRIBER,
      lastSentAt: "2026-07-22T09:00:00.000Z",
    };
    const asDeploy12 = fromDeploy11 as unknown as DigestStateV2;
    const windowStart = asDeploy12.lastDigestAt ?? "1970-01-01T00:00:00.000Z";
    check(
      "raw continuation state silently loses a renamed field",
      asDeploy12.lastDigestAt === undefined &&
        windowStart === "1970-01-01T00:00:00.000Z",
      `lastDigestAt read as ${String(asDeploy12.lastDigestAt)}, so the digest window fell back to the epoch and every article ships again`,
    );
  }

  // 2. Same input through the envelope. The rename is a declared migration, so
  //    the timestamp survives and deploy 12 gets the shape it expects.
  {
    const wire: StateEnvelope = {
      v: 1,
      hops: 6,
      state: {
        subscriberId: SUBSCRIBER,
        lastSentAt: "2026-07-22T09:00:00.000Z",
      },
    };
    const { state, hops } = decodeState(digestVersions, wire);
    check(
      "declared migration carries the renamed field forward",
      state.lastDigestAt === "2026-07-22T09:00:00.000Z" &&
        state.locale === "en-GB" &&
        hops === 6,
      `v1 state migrated to v2 with lastDigestAt=${state.lastDigestAt}, locale=${state.locale}`,
    );
  }

  // 3. A very old run, still asleep, started before either migration existed.
  //    Both steps run in order.
  {
    const wire: StateEnvelope = {
      v: 0,
      hops: 0,
      state: { subscriberId: SUBSCRIBER },
    };
    const { state } = decodeState(digestVersions, wire);
    check(
      "a v0 run walks the whole migration chain",
      state.subscriberId === SUBSCRIBER &&
        state.lastDigestAt === "1970-01-01T00:00:00.000Z" &&
        state.locale === "en-GB",
      `v0 to v${currentVersion(digestVersions)} produced ${JSON.stringify(state)}`,
    );
  }

  // 4. The rollback. Deploy 12 wrote v2, deploy 12 got rolled back, and deploy
  //    11 now receives state from a version it cannot know about.
  {
    const olderDeployment: StateVersions<unknown> = {
      maxHops: 400,
      migrations: digestVersions.migrations.slice(0, 1),
      validate: (c): c is unknown => c !== null,
    };
    const wire: StateEnvelope = {
      v: 2,
      hops: 9,
      state: {
        subscriberId: SUBSCRIBER,
        lastDigestAt: "2026-07-26T09:00:00.000Z",
        locale: "en-GB",
      },
    };
    const error = reject(() => decodeState(olderDeployment, wire));
    check(
      "rolled-back deployment refuses state from the future",
      error?.reason === "version-from-the-future" &&
        error.envelopeVersion === 2,
      `${error?.reason} on a v2 envelope reaching a v1 deployment`,
    );
  }

  // 5. A migration that produces the wrong shape is caught by validate rather
  //    than shipped. This is the case where the migration itself has the bug.
  {
    const broken: StateVersions<DigestStateV2> = {
      ...digestVersions,
      migrations: [
        digestVersions.migrations[0],
        (prior) => {
          const p = prior as { subscriberId: string };
          // Forgot to carry the timestamp across the rename.
          return { subscriberId: p.subscriberId, locale: "en-GB" };
        },
      ],
    };
    const wire: StateEnvelope = {
      v: 1,
      hops: 3,
      state: {
        subscriberId: SUBSCRIBER,
        lastSentAt: "2026-07-22T09:00:00.000Z",
      },
    };
    const error = reject(() => decodeState(broken, wire));
    check(
      "a lossy migration is rejected, not shipped",
      error?.reason === "invalid-after-migration",
      `${error?.reason} because lastDigestAt never made it across`,
    );
  }

  // 6. An unstamped argument, which is what every run started before the
  //    envelope existed will hand you.
  {
    const error = reject(() =>
      decodeState(digestVersions, { subscriberId: SUBSCRIBER }),
    );
    check(
      "unstamped continuation state is refused",
      error?.reason === "not-an-envelope",
      `${error?.reason} on a bare state object`,
    );
  }

  // 7. The brake on an immortal chain.
  {
    const wire: StateEnvelope = {
      v: 2,
      hops: 400,
      state: {
        subscriberId: SUBSCRIBER,
        lastDigestAt: "2027-09-01T09:00:00.000Z",
        locale: "en-GB",
      },
    };
    const error = reject(() => decodeState(digestVersions, wire));
    check(
      "hop budget stops a chain that would otherwise never end",
      error?.reason === "hop-budget-exhausted",
      `${error?.reason} at hop 400 of a 400 cap`,
    );
  }

  // 8. Round trip: what this deployment writes, this deployment can read, and
  //    the hop counter advances by exactly one.
  {
    const state: DigestStateV2 = {
      subscriberId: SUBSCRIBER,
      lastDigestAt: "2026-07-29T09:00:00.000Z",
      locale: "en-GB",
    };
    const wire = encodeState(digestVersions, state, 11);
    const decoded = decodeState(digestVersions, wire);
    check(
      "encode then decode is identity at the current version",
      wire.v === 2 &&
        decoded.hops === 11 &&
        decoded.state.lastDigestAt === state.lastDigestAt,
      `wrote v${wire.v} at hop ${wire.hops} and read it back unchanged`,
    );
  }

  console.log(
    failures === 0
      ? "\nstate-envelope.ts: all properties verified"
      : `\nstate-envelope.ts: ${failures} FAILED`,
  );
  if (failures > 0) process.exit(1);
}

if (import.meta.main) demo();
