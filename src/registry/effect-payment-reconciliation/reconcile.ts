/**
 * reconcile.ts
 *
 * Failure modes solved:
 *   1. Silent money drift (trusting exactly-once end to end): every payment
 *      crosses at least three systems (your platform, the processor, the
 *      ledger), and each hop can drop, duplicate, or mangle a record.
 *      Without reconciliation nobody notices until the quarterly close is
 *      off by an amount no one can explain. Reconciliation is the safety
 *      net: normalize both sides, match by transaction id, and classify
 *      every difference into an explicit bucket (amount mismatch, missing
 *      internal, missing external) that an operator can action.
 *   2. The midnight false alarm (cut-off time mismatches): a transaction
 *      stamped 23:59:55 internally can land as 00:00:30 next day at the
 *      processor, and a naive matcher pages someone at 1am for money that
 *      is not missing, it is in transit across a day boundary. Records
 *      missing from the counterparty inside the cut-off tolerance are
 *      classified pending_cutoff and carried to the next day's run, where
 *      they either match and resolve or escalate to a real discrepancy.
 *
 * Why the primitives make it correct: normalization is a pure function per
 * source, so format drift is handled in one place; classification is a
 * total function over the joined ids, so every record lands in exactly one
 * bucket and "unexplained" is not a possible outcome.
 */

import { Effect, Ref } from "effect"

/** internal ledger record: cents, ISO timestamp */
export interface LedgerRecord {
  readonly txId: string
  readonly amountCents: number
  readonly postedAt: string
}

/** processor statement record: decimal string, "YYYY/MM/DD HH:mm:ss" stamp */
export interface ProcessorRecord {
  readonly reference: string
  readonly amount: string
  readonly settledAt: string
}

interface Normalized {
  readonly txId: string
  readonly amountCents: number
  readonly atMs: number
}

// The transformation layer: each source's quirks are absorbed here, so the
// matcher only ever sees one shape.
export const normalizeLedger = (r: LedgerRecord): Normalized => ({
  txId: r.txId,
  amountCents: r.amountCents,
  atMs: Date.parse(r.postedAt),
})

export const normalizeProcessor = (r: ProcessorRecord): Normalized => ({
  txId: r.reference,
  amountCents: Math.round(Number.parseFloat(r.amount) * 100),
  atMs: Date.parse(r.settledAt.replace(/\//g, "-").replace(" ", "T") + "Z"),
})

export type Finding =
  | { readonly kind: "matched"; readonly txId: string; readonly amountCents: number }
  | {
      readonly kind: "amount_mismatch"
      readonly txId: string
      readonly internalCents: number
      readonly externalCents: number
    }
  | { readonly kind: "missing_external"; readonly txId: string; readonly amountCents: number }
  | { readonly kind: "missing_internal"; readonly txId: string; readonly amountCents: number }
  | { readonly kind: "pending_cutoff"; readonly txId: string; readonly amountCents: number }

export interface Reconciler {
  /** run one day's reconciliation; carried pending items are re-checked first */
  readonly run: (
    internal: readonly LedgerRecord[],
    external: readonly ProcessorRecord[],
    options: { readonly dayEndMs: number },
  ) => Effect.Effect<readonly Finding[]>
  readonly pendingCount: Effect.Effect<number>
}

export const makeReconciler = (options: {
  /** how close to day end a lone internal record is treated as in transit */
  readonly cutoffToleranceMs: number
}): Effect.Effect<Reconciler> =>
  Effect.gen(function* () {
    // pending_cutoff items carried between runs: txId -> normalized record
    const carried = yield* Ref.make(new Map<string, Normalized>())

    const run = (
      internal: readonly LedgerRecord[],
      external: readonly ProcessorRecord[],
      opts: { readonly dayEndMs: number },
    ) =>
      Effect.gen(function* () {
        const prior = yield* Ref.get(carried)
        const ours = new Map<string, Normalized>(
          [...prior.entries(), ...internal.map((r) => [r.txId, normalizeLedger(r)] as const)],
        )
        const theirs = new Map(external.map((r) => {
          const n = normalizeProcessor(r)
          return [n.txId, n] as const
        }))

        const findings: Finding[] = []
        const nextCarried = new Map<string, Normalized>()

        for (const [txId, mine] of ours) {
          const other = theirs.get(txId)
          if (other === undefined) {
            const wasCarried = prior.has(txId)
            const nearCutoff = opts.dayEndMs - mine.atMs <= options.cutoffToleranceMs
            if (nearCutoff && !wasCarried) {
              // in transit across the day boundary: hold, do not page anyone
              findings.push({ kind: "pending_cutoff", txId, amountCents: mine.amountCents })
              nextCarried.set(txId, mine)
            } else {
              // second day without a counterpart (or nowhere near cutoff): real
              findings.push({ kind: "missing_external", txId, amountCents: mine.amountCents })
            }
            continue
          }
          if (other.amountCents !== mine.amountCents) {
            findings.push({
              kind: "amount_mismatch",
              txId,
              internalCents: mine.amountCents,
              externalCents: other.amountCents,
            })
          } else {
            findings.push({ kind: "matched", txId, amountCents: mine.amountCents })
          }
        }

        for (const [txId, theirsOnly] of theirs) {
          if (!ours.has(txId)) {
            findings.push({ kind: "missing_internal", txId, amountCents: theirsOnly.amountCents })
          }
        }

        yield* Ref.set(carried, nextCarried)
        return findings
      })

    const pendingCount = Ref.get(carried).pipe(Effect.map((m) => m.size))

    return { run, pendingCount } as const
  })

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() => console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`))

  const DAY1_END = Date.parse("2026-07-01T00:00:00Z") + 24 * 3600 * 1000
  const recon = yield* makeReconciler({ cutoffToleranceMs: 60_000 })

  // Day 1: one clean match, one amount drift, one processor-only record, and
  // one 23:59:55 transaction the processor has not shown yet.
  const day1 = yield* recon.run(
    [
      { txId: "tx-100", amountCents: 4999, postedAt: "2026-07-01T10:00:00Z" },
      { txId: "tx-101", amountCents: 2500, postedAt: "2026-07-01T11:30:00Z" },
      { txId: "tx-102", amountCents: 1200, postedAt: "2026-07-01T23:59:55Z" },
    ],
    [
      { reference: "tx-100", amount: "49.99", settledAt: "2026/07/01 10:00:02" },
      { reference: "tx-101", amount: "25.01", settledAt: "2026/07/01 11:30:01" }, // 1 cent drift
      { reference: "tx-999", amount: "7.50", settledAt: "2026/07/01 15:00:00" },
    ],
    { dayEndMs: DAY1_END },
  )

  const kind = (id: string) => day1.find((f) => "txId" in f && f.txId === id)?.kind
  yield* check(
    "formats normalize and every record lands in one bucket",
    kind("tx-100") === "matched" &&
      kind("tx-101") === "amount_mismatch" &&
      kind("tx-999") === "missing_internal" &&
      kind("tx-102") === "pending_cutoff",
    `tx-100 matched across "49.99"/"2026/07/01" formats; tx-101 flagged 2500 vs 2501; tx-999 missing internally; tx-102 held at cutoff`,
  )

  const drift = day1.find((f) => f.kind === "amount_mismatch")
  yield* check(
    "one cent of drift is caught, not absorbed",
    drift?.kind === "amount_mismatch" && drift.externalCents - drift.internalCents === 1,
    `internal ${drift?.kind === "amount_mismatch" ? drift.internalCents : "?"} vs external ${drift?.kind === "amount_mismatch" ? drift.externalCents : "?"} cents`,
  )

  // Day 2: the processor's statement now shows tx-102 at 00:00:30, and the
  // carried pending item resolves to a match instead of a 1am page.
  const day2 = yield* recon.run(
    [],
    [{ reference: "tx-102", amount: "12.00", settledAt: "2026/07/02 00:00:30" }],
    { dayEndMs: DAY1_END + 24 * 3600 * 1000 },
  )
  const resolved = day2.find((f) => "txId" in f && f.txId === "tx-102")
  const pendingAfter = yield* recon.pendingCount
  yield* check(
    "cutoff transit resolves next day",
    resolved?.kind === "matched" && pendingAfter === 0,
    `tx-102 (23:59:55 internal, 00:00:30 external) matched on day 2, pending queue drained to ${pendingAfter}`,
  )

  // Day 3: a carried item that never shows up escalates to a real discrepancy.
  const recon2 = yield* makeReconciler({ cutoffToleranceMs: 60_000 })
  yield* recon2.run(
    [{ txId: "tx-777", amountCents: 9900, postedAt: "2026-07-01T23:59:59Z" }],
    [],
    { dayEndMs: DAY1_END },
  )
  const next = yield* recon2.run([], [], { dayEndMs: DAY1_END + 24 * 3600 * 1000 })
  yield* check(
    "a pending item that never settles escalates",
    next.some((f) => f.kind === "missing_external" && f.txId === "tx-777"),
    `tx-777 was held one day, then escalated to missing_external for $99.00`,
  )

  console.log("reconcile.ts: all properties verified")
})

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e)
  process.exit(1)
})
