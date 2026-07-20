/**
 * Long-lived Node runtime client for Prisma ORM 7.x (verified against
 * prisma@7.8.0, @prisma/adapter-pg@7.8.0, pg@8.22.0).
 *
 * Two things changed in v7 that this file exists to absorb.
 *
 * First, driver adapters are no longer opt-in. In v6 the `driverAdapters`
 * preview feature was a choice; in v7 every database requires an explicit
 * adapter because the Rust query engine that used to own the connection is
 * gone. Since 6.6.0 the adapter is also constructed directly with the driver's
 * own options (`new PrismaPg({ connectionString })`) rather than by handing it
 * a pool you built yourself, which is the form shown here.
 *
 * Second, and this is the part that silently changes production behaviour:
 * with the Rust engine gone, the connection pool is now literally `pg`'s pool,
 * and it inherits `pg`'s defaults. The v7 upgrade guide warns these "may differ
 * significantly from Prisma ORM v6 defaults" and gives the sharpest example:
 * the `pg` driver has no connection timeout by default (`0`), while v6 used a
 * 5-second timeout. A `0` connect timeout does not mean fast, it means never
 * give up. Under pool exhaustion or a network partition, requests that used to
 * fail in 5 seconds now hang until something upstream kills them, and the
 * symptom presents as a hung service rather than as database errors.
 *
 * So every pool setting below is pinned explicitly. Inheriting a default you
 * did not choose is the failure mode; the specific numbers are less important
 * than the fact that they are written down.
 */
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";

/**
 * `PrismaPg`'s first argument is a `pg.PoolConfig` (it also accepts a
 * `pg.Pool` or a bare connection string). Passing the config object rather
 * than a pool lets the adapter own the pool lifecycle, including disposal.
 *
 * Verified `pg` defaults, all of which are wrong for at least one deployment
 * shape and none of which are announced at runtime:
 *
 *   max                    10        per process, not per cluster
 *   idleTimeoutMillis      10_000
 *   connectionTimeoutMillis 0        no timeout, waits forever
 *   maxLifetimeSeconds     0         connections are never recycled
 */
const poolConfig = {
  connectionString: process.env.DATABASE_URL,

  /**
   * Per process. The number that matters to Postgres is this times the number
   * of processes, and it must stay under `max_connections` minus the headroom
   * your superuser needs to log in and diagnose the outage. Four processes at
   * the `pg` default of 10 is already 40 connections against a small managed
   * instance that allows 100.
   */
  max: 10,

  /**
   * Bounded so a slow or saturated database surfaces as an error instead of a
   * hang. This is the setting the upgrade guide calls out: leaving it at the
   * `pg` default of 0 restores v6-era latency expectations to nothing.
   * Requests queue behind a pool that never yields, and the request timeout
   * that eventually fires is your load balancer's, not the database's.
   */
  connectionTimeoutMillis: 5_000,

  /**
   * How long an unused connection is kept. Raised above the `pg` default of
   * 10s because a steady-state service pays a TLS handshake every time this
   * expires. Keep it comfortably below any idle timeout enforced between you
   * and Postgres (pgbouncer's `server_idle_timeout`, a cloud NAT gateway's
   * idle rule), or the pool hands out connections the far end already closed.
   */
  idleTimeoutMillis: 30_000,

  /**
   * Recycle connections on a schedule. The `pg` default of 0 keeps a
   * connection alive indefinitely, which pins a process to whichever backend
   * it first reached. This is what makes a rolling failover or a read-replica
   * rebalance take effect without a deploy.
   */
  maxLifetimeSeconds: 30 * 60,

  /**
   * Off by default in `pg`, and it should stay off for a server. It lets the
   * event loop drain while the pool is idle, which is right for a script and
   * wrong for anything that expects to keep listening.
   */
  allowExitOnIdle: false,
};

/**
 * The second argument is `PrismaPgOptions`, which is adapter behaviour rather
 * than driver config.
 *
 * `onPoolError` and `onConnectionError` are not optional in practice. `pg`
 * emits `error` on idle clients when the server closes a connection out from
 * under you (failover, an idle reaper, an operator terminating a backend). An
 * unhandled `error` event on an EventEmitter throws, and because it fires on
 * an idle client it is not inside any request, so nothing catches it and the
 * process exits. These handlers are the difference between a logged blip and
 * a restart loop.
 */
const adapterOptions = {
  onPoolError: (error: Error) => {
    console.error("[prisma] pool error", { message: error.message });
  },
  onConnectionError: (error: Error) => {
    console.error("[prisma] connection error", { message: error.message });
  },
};

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    // v7 does not read .env for you at runtime, and the generated client has
    // no datasource URL baked in. A missing variable would otherwise reach pg
    // as an undefined connection string and fail as a localhost refusal.
    throw new Error("DATABASE_URL is not set");
  }

  return new PrismaClient({
    adapter: new PrismaPg(poolConfig, adapterOptions),
  });
}

/**
 * Hot reload in Next.js and most watch-mode dev servers re-evaluates this
 * module without tearing down the previous one. Each evaluation would build a
 * new `PrismaPg`, and each `PrismaPg` owns a `pg.Pool` of up to `max`
 * connections that nothing ever closes. Twenty saves later the database is
 * refusing connections and the error points at your app rather than at the
 * editor. Stashing the client on `globalThis` survives the reload; the
 * production branch skips the global so the client stays module-scoped.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Call on graceful shutdown (SIGTERM handler, test teardown). `$disconnect`
 * disposes the adapter, which ends the pool it created. Skipping it leaves
 * connections established until Postgres times them out, which matters most
 * in tests, where each worker otherwise holds `max` connections open until
 * the whole run finishes.
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
