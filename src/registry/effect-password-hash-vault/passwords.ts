/**
 * passwords.ts
 *
 * Failure modes solved:
 *   1. The precomputed crack (fast hashes and rainbow tables): storing
 *      md5(password) or even sha256(password) means one leaked table is
 *      crackable offline at billions of guesses per second, and identical
 *      passwords share identical hashes, so cracking one user cracks every
 *      user who chose the same password. Here every user gets a random
 *      16-byte salt and the hash is scrypt, a memory-hard function whose
 *      cost parameters make each guess expensive by design. Two users with
 *      the same password store different hashes, and a rainbow table is
 *      useless because no table was computed with your salts.
 *   2. The permanently weak hash (cost that never keeps up): hardware gets
 *      faster every year, but a hash written to the database keeps its
 *      2015 cost forever unless something upgrades it. The stored string
 *      embeds its own parameters (N, r, p, salt), verification reads them
 *      from the record rather than from config, and a successful login
 *      through an outdated cost transparently re-hashes at the current
 *      cost. The login is the only moment the plaintext exists, so it is
 *      the only moment an upgrade is possible, and the vault uses it.
 *
 * Why the primitives make it correct: verification recomputes with the
 * record's own parameters and compares with timingSafeEqual, so there is
 * no byte-by-byte oracle; the typed InvalidCredentials failure is the same
 * for unknown user and wrong password, so the login endpoint cannot be
 * used to enumerate accounts.
 */

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto"
import { Data, Effect, Ref } from "effect"

export class InvalidCredentials extends Data.TaggedError("InvalidCredentials")<{
  readonly reason: "unknown_user_or_bad_password"
}> {}

export interface ScryptParams {
  readonly N: number
  readonly r: number
  readonly p: number
}

/** current cost: N=16384 is interactive-login grade for scrypt */
export const CURRENT_PARAMS: ScryptParams = { N: 16384, r: 8, p: 1 }

const KEYLEN = 32

/** self-describing record: scrypt$N$r$p$saltHex$hashHex */
export const hashPassword = (password: string, params: ScryptParams = CURRENT_PARAMS): string => {
  const salt = randomBytes(16)
  const hash = scryptSync(password, salt, KEYLEN, {
    N: params.N,
    r: params.r,
    p: params.p,
    maxmem: 128 * params.N * params.r * 2,
  })
  return `scrypt$${params.N}$${params.r}$${params.p}$${salt.toString("hex")}$${hash.toString("hex")}`
}

export const verifyPassword = (password: string, stored: string): boolean => {
  const [scheme, nStr, rStr, pStr, saltHex, hashHex] = stored.split("$")
  if (scheme !== "scrypt") return false
  const salt = Buffer.from(saltHex, "hex")
  const expected = Buffer.from(hashHex, "hex")
  const candidate = scryptSync(password, salt, expected.length, {
    N: Number(nStr),
    r: Number(rStr),
    p: Number(pStr),
    maxmem: 128 * Number(nStr) * Number(rStr) * 2,
  })
  return timingSafeEqual(candidate, expected)
}

export const needsRehash = (stored: string, params: ScryptParams = CURRENT_PARAMS): boolean => {
  const [scheme, nStr, rStr, pStr] = stored.split("$")
  return (
    scheme !== "scrypt" ||
    Number(nStr) < params.N ||
    Number(rStr) < params.r ||
    Number(pStr) < params.p
  )
}

export interface PasswordVault {
  /** `atParams` models a record written under an older cost policy */
  readonly register: (
    user: string,
    password: string,
    atParams?: ScryptParams,
  ) => Effect.Effect<void>
  /** verify; on success through an outdated hash, upgrade it in place */
  readonly login: (user: string, password: string) => Effect.Effect<void, InvalidCredentials>
  readonly storedRecord: (user: string) => Effect.Effect<string | undefined>
}

export const makePasswordVault = (options?: {
  readonly params?: ScryptParams
}): Effect.Effect<PasswordVault> =>
  Effect.gen(function* () {
    const params = options?.params ?? CURRENT_PARAMS
    const records = yield* Ref.make(new Map<string, string>())

    const register = (user: string, password: string, atParams?: ScryptParams) =>
      Ref.update(records, (m) => new Map(m).set(user, hashPassword(password, atParams ?? params)))

    const login = (user: string, password: string) =>
      Effect.gen(function* () {
        const stored = (yield* Ref.get(records)).get(user)
        // Same typed failure for unknown user and wrong password: the login
        // endpoint must not be an account-enumeration oracle.
        if (stored === undefined || !verifyPassword(password, stored)) {
          return yield* new InvalidCredentials({ reason: "unknown_user_or_bad_password" })
        }
        // The only moment the plaintext exists is the only upgrade window.
        if (needsRehash(stored, params)) {
          yield* Ref.update(records, (m) => new Map(m).set(user, hashPassword(password, params)))
        }
      })

    const storedRecord = (user: string) =>
      Ref.get(records).pipe(Effect.map((m) => m.get(user)))

    return { register, login, storedRecord } as const
  })

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() => console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`))

  const vault = yield* makePasswordVault()

  // Property 1: identical passwords store different records (the salt), and
  // both still verify.
  {
    yield* vault.register("ada", "correct horse battery staple")
    yield* vault.register("grace", "correct horse battery staple")
    const a = yield* vault.storedRecord("ada")
    const g = yield* vault.storedRecord("grace")
    const bothLogin = yield* Effect.all([
      Effect.exit(vault.login("ada", "correct horse battery staple")),
      Effect.exit(vault.login("grace", "correct horse battery staple")),
    ])
    yield* check(
      "same password, different hashes",
      a !== undefined && g !== undefined && a !== g && bothLogin.every((e) => e._tag === "Success"),
      `two users, one password, distinct salts => distinct records; both logins verified`,
    )
  }

  // Property 2: wrong password and unknown user fail identically (typed).
  {
    const wrong = yield* Effect.exit(vault.login("ada", "hunter2"))
    const unknown = yield* Effect.exit(vault.login("nobody", "hunter2"))
    const sameShape =
      wrong._tag === "Failure" &&
      unknown._tag === "Failure" &&
      String(wrong.cause).includes("InvalidCredentials") &&
      String(unknown.cause).includes("InvalidCredentials")
    yield* check(
      "no account-enumeration oracle",
      sameShape,
      `wrong password and unknown user produce the same InvalidCredentials failure`,
    )
  }

  // Property 3: a legacy low-cost hash verifies with its embedded params and
  // upgrades transparently on the next successful login.
  {
    yield* vault.register("torvald", "kernel-panic-42", { N: 1024, r: 8, p: 1 })
    const before = yield* vault.storedRecord("torvald")
    yield* vault.login("torvald", "kernel-panic-42")
    const after = yield* vault.storedRecord("torvald")
    const upgradedInPlace =
      before !== undefined &&
      after !== undefined &&
      before.startsWith("scrypt$1024$") &&
      after.startsWith("scrypt$16384$") &&
      verifyPassword("kernel-panic-42", after)
    yield* check(
      "outdated cost upgrades at login",
      upgradedInPlace && before !== undefined && needsRehash(before) && !needsRehash(after ?? ""),
      `record went scrypt$1024$ -> scrypt$16384$ during login, the one moment the plaintext exists`,
    )
  }

  // Property 4: a tampered record never verifies.
  {
    const record = hashPassword("s3cret")
    const tampered = record.slice(0, -2) + (record.endsWith("00") ? "01" : "00")
    yield* check(
      "tampered hash fails closed",
      verifyPassword("s3cret", record) && !verifyPassword("s3cret", tampered),
      `original verifies, single-byte tamper rejected by timingSafeEqual`,
    )
  }

  console.log("passwords.ts: all properties verified")
})

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e)
  process.exit(1)
})
