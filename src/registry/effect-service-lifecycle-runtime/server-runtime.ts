/**
 * The server's run loop: supervised background workers that cannot leak, and a
 * SIGTERM shutdown that interrupts everything in order.
 *
 * The shape of a long-lived server is a set of background fibers (a queue
 * drainer, a metrics flusher, a heartbeat) plus a foreground that waits for a
 * shutdown signal. Two things go wrong with the naive version, and this file is
 * built to prevent both.
 *
 * Background fibers leak. Forking a worker and forgetting it means that on
 * shutdown the process either hangs waiting for a detached fiber or exits while
 * the fiber is mid-write. FiberSet is a supervised set: every worker is run into
 * it, the set lives in a scope, and when that scope closes every fiber in the set
 * is interrupted. Nothing is forgotten, because membership is the mechanism, not
 * a list someone maintains. A worker that fails also surfaces through the set
 * rather than dying silently in the background.
 *
 * Shutdown is not process.exit. A kill -TERM that calls process.exit(0) abandons
 * every in-flight request and every open resource. Here SIGTERM interrupts the
 * root fiber, interruption closes the scope, closing the scope interrupts the
 * FiberSet workers and runs the acquireRelease finalizers (the pool drain in
 * server-services.ts), and only then does the process end. The teardown runs in
 * the reverse of setup order because that is how scope finalizers compose, so the
 * pool closes after the workers that use it stop, not before.
 *
 * v4 forking note: the combinators were renamed. Effect.fork is now forkChild,
 * Effect.forkDaemon is forkDetach, and forkScoped and forkIn keep their names.
 * This file uses FiberSet.run, which forks into the supervised set rather than
 * detaching, so the workers stay tied to the server's lifetime.
 *
 * Every API is from effect@4.0.0-beta.98: FiberSet, Effect.acquireRelease via the
 * services layer, Scope through Effect.scoped.
 */

import { Effect, Fiber, FiberSet, type Layer } from "effect";
import { ConnectionPool, JobQueue, ServerServices } from "./server-services.ts";

/**
 * One background worker: a loop that does a unit of work and sleeps. Written as a
 * forever loop with a delay; interruption during the sleep is clean, which is why
 * the interruptible sleep is the loop's yield point.
 */
const worker = (name: string, everyMillis: number, step: Effect.Effect<void>) =>
  step.pipe(
    Effect.tap(() => Effect.annotateCurrentSpan("worker", name)),
    Effect.delay(`${everyMillis} millis`),
    Effect.forever,
  );

/**
 * The server program. It builds the supervised FiberSet in its scope, runs the
 * background workers into it, and then blocks on Effect.never until interrupted.
 * When the scope closes (on interrupt), the FiberSet interrupts the workers and
 * the services layer's finalizers drain the pool.
 *
 * Effect.scoped bounds the scope to this effect, so everything started here is
 * torn down when this effect ends, in reverse order.
 */
export const serverProgram = Effect.scoped(
  Effect.gen(function* () {
    const pool = yield* ConnectionPool;
    const queue = yield* JobQueue;

    // The supervised set. It is created in the current scope, so it and every
    // fiber in it are interrupted when this scope closes.
    const workers = yield* FiberSet.make<void>();

    // A queue drainer and a stats reporter, both supervised. FiberSet.run forks
    // each into the set; neither is a detached daemon, so neither can outlive the
    // server.
    yield* FiberSet.run(
      workers,
      worker(
        "queue-drainer",
        200,
        queue.enqueue("heartbeat-job").pipe(Effect.asVoid),
      ),
    );
    yield* FiberSet.run(
      workers,
      worker(
        "pool-stats",
        1000,
        Effect.sync(() => {
          const stats = pool.stats();
          return stats;
        }).pipe(Effect.asVoid),
      ),
    );

    yield* Effect.log("server started, workers supervised");

    // Block until interrupted. On SIGTERM the root fiber is interrupted, this
    // never resolves normally, and the scope unwinds: workers interrupted first,
    // then the pool drained by its release.
    return yield* Effect.never;
  }),
);

/**
 * The entrypoint. It provides the services layer and forks the program as the
 * root fiber, then wires SIGTERM and SIGINT to interrupt that fiber. Interrupting
 * it, rather than calling process.exit, is what lets the scope finalizers run: a
 * graceful drain instead of an abrupt kill.
 *
 * ponytail: signal wiring uses the Node process global directly; in a full app
 * this is the platform runner's job (the platform packages provide a runMain that
 * installs these handlers for you). Kept explicit here so the interrupt-drives-
 * shutdown mechanism is visible.
 */
export const main = () => {
  const fiber = Effect.runFork(
    serverProgram.pipe(Effect.provide(ServerServices)),
  );

  const shutdown = () => {
    // Interrupt the root fiber. This closes the scope, interrupts the workers,
    // and runs the finalizers, then the runtime lets the process exit on its own.
    Effect.runFork(Fiber.interrupt(fiber));
  };

  // `globalThis.process` is read defensively so this module also type-checks in a
  // non-Node build; the handlers only attach where a process exists.
  const proc = (globalThis as { process?: NodeJS.Process }).process;
  proc?.on("SIGTERM", shutdown);
  proc?.on("SIGINT", shutdown);

  return fiber;
};

/** The fully wired layer, exported for tests that want to provide it themselves. */
export const ServerLive: Layer.Layer<ConnectionPool | JobQueue> =
  ServerServices;
