/**
 * The service and layer foundations a long-lived Effect 4 server sits on:
 * acquire/release resources, layer memoization, and why both matter the moment a
 * server has to shut down without leaking.
 *
 * Three facts this file is built around.
 *
 * A resource is acquired and released as a pair, by the runtime, not by a
 * finally you maintain. Effect.acquireRelease binds a release to an acquire, and
 * the release runs when the enclosing scope closes, whether that is a clean
 * shutdown or an interruption partway through startup. A connection pool opened
 * this way is closed on SIGTERM without anyone writing the teardown path, which
 * is the path that is always wrong when it is written by hand because it is the
 * path that is never tested.
 *
 * A layer is memoized, so a service built once is built once. In v4 the memo map
 * is shared across Effect.provide calls, so if two services both depend on the
 * pool, the pool layer builds a single pool and both share it. This is not a
 * nicety: build it twice and you have two pools against a database sized for one,
 * a connection count that is quietly double what the dashboard says, and a
 * release path that closes one while the other keeps serving. The bug does not
 * show up until production load, which is why it has to be structural rather than
 * remembered.
 *
 * A service is a dependency, declared, not a global reached for. ConnectionPool
 * below is a Context.Service; anything that needs it says so in its type and
 * receives it from the layer graph. There is no import of a singleton, so a test
 * provides a different pool by providing a different layer, and nothing in the
 * consumer changes.
 *
 * Every API is from effect@4.0.0-beta.98: Context.Service, Layer.effect,
 * Effect.acquireRelease. v4 note: the fork combinators were renamed
 * (Effect.fork is now forkChild, forkDaemon is forkDetach), which the runtime
 * file relies on.
 */

import { Context, Effect, Layer } from "effect";

/**
 * A pooled database connection handle. The real thing wraps a driver pool; here
 * it is a small object with a counter so the lifecycle is observable in a log.
 */
export interface PooledConnection {
  readonly id: number;
  readonly release: () => void;
}

/**
 * The connection pool service. Its implementation is produced by an
 * acquireRelease: the acquire opens the pool and the release drains it. Because
 * the release is bound to the scope the layer is built in, the pool is drained
 * exactly when the server's scope closes, with no explicit shutdown call.
 */
export class ConnectionPool extends Context.Service<ConnectionPool>()(
  "BLANK/Server/ConnectionPool",
  {
    make: Effect.acquireRelease(
      Effect.sync(() => {
        let opened = 0;
        let live = 0;
        const acquire = (): PooledConnection => {
          const id = ++opened;
          live++;
          return {
            id,
            release: () => {
              live--;
            },
          };
        };
        return {
          acquire,
          stats: () => ({ opened, live }) as const,
          // Called by the release below, once, when the scope closes.
          drain: () => {
            live = 0;
          },
        };
      }),
      // The release. Runs on scope close, including an interrupt during startup,
      // which is the case a hand-written teardown forgets.
      (pool) => Effect.sync(() => pool.drain()),
    ),
  },
) {}

/**
 * A job queue that depends on the pool. It does not open its own connection
 * source; it declares ConnectionPool as a dependency and the layer graph hands it
 * the one shared pool. This is the consumer that proves memoization matters: if
 * the pool built twice, this queue and any sibling would be talking to different
 * pools.
 */
export class JobQueue extends Context.Service<JobQueue>()(
  "BLANK/Server/JobQueue",
  {
    make: Effect.gen(function* () {
      const pool = yield* ConnectionPool;
      return {
        enqueue: (payload: string) =>
          Effect.sync(() => {
            const conn = pool.acquire();
            // A real enqueue writes through conn; here it just round-trips so the
            // pool's counters move.
            conn.release();
            return { accepted: true, connId: conn.id, payload };
          }),
      };
    }),
  },
) {}

/**
 * The service graph as one layer. JobQueue.layer needs ConnectionPool, provided
 * here once. Because layers are memoized, adding a second consumer of
 * ConnectionPool to this graph does not build a second pool: it shares this one.
 *
 * Layer.provideMerge keeps ConnectionPool in the output alongside JobQueue, so
 * the runtime can read pool stats during shutdown.
 */
export const ServerServices: Layer.Layer<ConnectionPool | JobQueue> =
  Layer.effect(JobQueue)(JobQueue.make).pipe(
    Layer.provideMerge(Layer.effect(ConnectionPool)(ConnectionPool.make)),
  );
