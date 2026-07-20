/// <reference types="@cloudflare/workers-types" />

/**
 * Durable per-entity timers: a scheduler where the schedule lives with the thing
 * being scheduled, instead of in a table that a cron job sweeps.
 *
 * The serverless answer to "send this reminder in 36 hours" has been a cron
 * trigger every minute plus `SELECT * FROM jobs WHERE due_at <= now() LIMIT n`.
 * That works, and it brings a fixed set of problems with it: the sweep runs
 * 1,440 times a day whether or not anything is due, minute-granularity is the
 * floor, the LIMIT is a throughput ceiling that becomes a backlog under a spike,
 * two overlapping sweeps need a lock to avoid double-sending, and the table is a
 * single hot row range that every worker contends on.
 *
 * A Durable Object alarm is a timer the platform holds for you, per object. The
 * object is asleep and costing nothing until the alarm fires, and then it wakes
 * with all of its state present. Ten million users with a pending reminder is
 * ten million sleeping objects and zero running queries, rather than a sweep
 * that has to get through ten million rows.
 *
 * What the platform guarantees, and what it does not:
 *
 *   - `alarm()` retries automatically with exponential backoff if it throws.
 *     Retries are the reason every handler here must be idempotent: a partially
 *     completed handler runs again from the top.
 *   - `alarmInfo.isRetry` and `alarmInfo.retryCount` say which attempt this is,
 *     so a handler can give up deliberately instead of exhausting retries and
 *     vanishing.
 *   - There is exactly one alarm per object. `setAlarm()` overwrites; it does
 *     not enqueue. This is the single most important fact in this file, and it
 *     is why a scheduler that holds more than one task needs its own due queue
 *     and must always point the alarm at the earliest due time.
 *   - Firing is guaranteed but the exact moment is not. Treat the timestamp as
 *     "not before", never as "at".
 *
 * Pinned to @cloudflare/workers-types@5.20260719.1, wrangler 4.112.0,
 * compatibility_date 2026-07-01.
 *
 * Matching wrangler.jsonc:
 *
 * {
 *   "name": "blank-scheduler",
 *   "main": "src/scheduler/worker.ts",
 *   "compatibility_date": "2026-07-01",
 *   "durable_objects": {
 *     "bindings": [{ "name": "SCHEDULE", "class_name": "EntitySchedule" }]
 *   },
 *   "exports": {
 *     "EntitySchedule": { "type": "durable-object", "storage": "sqlite" }
 *   }
 * }
 */

import { DurableObject } from "cloudflare:workers";

export type SchedulerEnv = {
  SCHEDULE: DurableObjectNamespace<EntitySchedule>;
  WEBHOOK_URL: string;
};

export type TaskKind = "trial-ending" | "digest" | "dunning-retry";

export type Task = {
  id: string;
  kind: TaskKind;
  dueAt: number;
  payload: Record<string, unknown>;
  /** Set for recurring tasks; the task reschedules itself by this interval. */
  repeatMs?: number;
};

/**
 * Give up after this many attempts rather than letting the platform's retry
 * budget run out silently. A task that has failed this many times is not going
 * to succeed on the next identical attempt.
 */
const MAX_ATTEMPTS = 6;

/** Alarms are "not before", so there is no value in scheduling sub-second. */
const MIN_LEAD_MS = 1_000;

export class EntitySchedule extends DurableObject<SchedulerEnv> {
  private readonly sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: SchedulerEnv) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    ctx.blockConcurrencyWhile(async () => {
      this.sql.exec(`
        CREATE TABLE IF NOT EXISTS tasks (
          id        TEXT PRIMARY KEY,
          kind      TEXT NOT NULL,
          due_at    INTEGER NOT NULL,
          payload   TEXT NOT NULL,
          repeat_ms INTEGER,
          attempts  INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_at);
      `);
    });
  }

  /**
   * Schedule or reschedule a task.
   *
   * Upsert by id, which makes this safe to call from a retrying caller and makes
   * "move the reminder" the same operation as "set the reminder". The alarm is
   * then re-pointed at whatever is now earliest, which may be a completely
   * different task than the one just added.
   */
  async schedule(task: Task): Promise<void> {
    const dueAt = Math.max(task.dueAt, Date.now() + MIN_LEAD_MS);

    this.sql.exec(
      `INSERT INTO tasks (id, kind, due_at, payload, repeat_ms, attempts)
            VALUES (?, ?, ?, ?, ?, 0)
       ON CONFLICT(id) DO UPDATE SET
            kind = excluded.kind,
            due_at = excluded.due_at,
            payload = excluded.payload,
            repeat_ms = excluded.repeat_ms,
            attempts = 0`,
      task.id,
      task.kind,
      dueAt,
      JSON.stringify(task.payload),
      task.repeatMs ?? null,
    );

    await this.syncAlarm();
  }

  async cancel(taskId: string): Promise<void> {
    this.sql.exec("DELETE FROM tasks WHERE id = ?", taskId);
    await this.syncAlarm();
  }

  async pending(): Promise<Task[]> {
    return this.sql
      .exec<{
        id: string;
        kind: TaskKind;
        due_at: number;
        payload: string;
        repeat_ms: number | null;
      }>(
        "SELECT id, kind, due_at, payload, repeat_ms FROM tasks ORDER BY due_at",
      )
      .toArray()
      .map((row) => ({
        id: row.id,
        kind: row.kind,
        dueAt: row.due_at,
        payload: JSON.parse(row.payload) as Record<string, unknown>,
        repeatMs: row.repeat_ms ?? undefined,
      }));
  }

  /**
   * The one alarm points at the earliest due task, always.
   *
   * Every mutation of the queue routes through here. Skipping it once, on the
   * path that "obviously" cannot change the earliest task, is how a scheduler
   * ends up with tasks that are due and an alarm that is not set, which looks
   * exactly like the task was never scheduled.
   */
  private async syncAlarm(): Promise<void> {
    const next = this.sql
      .exec<{ due_at: number | null }>(
        "SELECT MIN(due_at) AS due_at FROM tasks",
      )
      .one().due_at;

    const current = await this.ctx.storage.getAlarm();

    if (next === null) {
      // Nothing left. Clearing matters: a stale alarm wakes the object, finds
      // nothing to do, and bills for the wake, forever, on every entity that
      // ever had a task.
      if (current !== null) await this.ctx.storage.deleteAlarm();
      return;
    }

    if (current !== next) await this.ctx.storage.setAlarm(next);
  }

  /**
   * Runs when the alarm fires, and again on every retry after a throw.
   *
   * The handler drains everything due, not just the single earliest task, since
   * several may share a due moment and there is only one alarm to fire.
   */
  override async alarm(alarmInfo?: AlarmInvocationInfo): Promise<void> {
    const now = Date.now();

    const due = this.sql
      .exec<{
        id: string;
        kind: TaskKind;
        payload: string;
        repeat_ms: number | null;
        attempts: number;
      }>(
        `SELECT id, kind, payload, repeat_ms, attempts
           FROM tasks
          WHERE due_at <= ?
          ORDER BY due_at
          LIMIT 100`,
        now,
      )
      .toArray();

    for (const row of due) {
      // Count the attempt before running it. If the process dies mid-task, the
      // retry sees an incremented counter and eventually gives up, rather than
      // retrying a poison task until the platform's budget runs out and the task
      // disappears with no record of why.
      const attempts = row.attempts + 1;
      this.sql.exec(
        "UPDATE tasks SET attempts = ? WHERE id = ?",
        attempts,
        row.id,
      );

      if (attempts > MAX_ATTEMPTS) {
        console.error("task exhausted attempts", {
          id: row.id,
          kind: row.kind,
        });
        this.sql.exec("DELETE FROM tasks WHERE id = ?", row.id);
        continue;
      }

      try {
        await this.run(row.kind, row.id, JSON.parse(row.payload));
      } catch (error) {
        // Deliberate surrender near the end of the retry budget: reschedule so
        // the object keeps getting invoked, instead of letting the last retry
        // fail and the work be dropped.
        if (alarmInfo && alarmInfo.retryCount >= 4) {
          this.sql.exec(
            "UPDATE tasks SET due_at = ? WHERE id = ?",
            Date.now() + 5 * 60_000,
            row.id,
          );
          await this.syncAlarm();
          return;
        }
        // Otherwise let it throw: the platform retries the whole handler with
        // backoff, and the tasks already completed above are gone from the table,
        // so the retry does not redo them.
        throw error;
      }

      if (row.repeat_ms) {
        // Anchor the next occurrence to now, not to the original due time. A
        // wake that arrives late must not immediately fire every occurrence it
        // slept through.
        this.sql.exec(
          "UPDATE tasks SET due_at = ?, attempts = 0 WHERE id = ?",
          Date.now() + row.repeat_ms,
          row.id,
        );
      } else {
        this.sql.exec("DELETE FROM tasks WHERE id = ?", row.id);
      }
    }

    await this.syncAlarm();
  }

  /**
   * The side effect.
   *
   * Idempotency is not optional here, and it cannot be arranged after the fact:
   * a retry re-runs this for a task that may have already been half-delivered.
   * The task id doubles as the idempotency key, which is why ids are supplied by
   * the caller rather than generated inside schedule().
   */
  private async run(
    kind: TaskKind,
    taskId: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const response = await fetch(this.env.WEBHOOK_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "idempotency-key": taskId,
      },
      body: JSON.stringify({ kind, taskId, payload }),
    });

    if (!response.ok) {
      throw new Error(`webhook ${kind} failed with ${response.status}`);
    }
  }
}
