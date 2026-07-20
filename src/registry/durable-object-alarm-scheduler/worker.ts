/// <reference types="@cloudflare/workers-types" />

/**
 * The Worker in front of the per-entity schedules.
 *
 * The naming decision is the architecture. `getByName(userId)` means one object,
 * one SQLite database, and one alarm per user, and it means the schedule for a
 * user is reachable without an index, a lookup table, or a query: the id is the
 * address. Choose the wrong grain here and nothing downstream can fix it.
 *
 *   getByName(userId)          one timer per user. The default.
 *   getByName(orgId)           one timer per org, correct when tasks are
 *                              org-wide and wrong when a hot org serialises
 *                              every one of its users behind a single object.
 *   getByName(`${orgId}:${n}`) explicit sharding when one object cannot keep up.
 *
 * Note what is absent: there is no cron trigger in this Worker. Nothing polls,
 * nothing sweeps, and adding a `[triggers]` block would be reintroducing the
 * pattern the alarms replace.
 */

import type { EntitySchedule, SchedulerEnv, Task } from "./scheduler.ts";

export { EntitySchedule } from "./scheduler.ts";

const DAY_MS = 24 * 60 * 60 * 1000;

export default {
  async fetch(request: Request, env: SchedulerEnv): Promise<Response> {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    if (!userId) return new Response("userId is required", { status: 400 });

    // Addressed by name, so there is no id to store and no mapping table.
    const schedule = env.SCHEDULE.getByName(userId);

    switch (`${request.method} ${url.pathname}`) {
      case "POST /trial": {
        // Three timers for one user, all held by one object with one alarm
        // pointing at the earliest. On the sweep-a-table design these would be
        // three rows competing with every other user's rows.
        const startedAt = Date.now();
        await scheduleAll(schedule, [
          {
            id: `${userId}:trial-day-11`,
            kind: "trial-ending",
            dueAt: startedAt + 11 * DAY_MS,
            payload: { userId, daysLeft: 3 },
          },
          {
            id: `${userId}:trial-day-14`,
            kind: "trial-ending",
            dueAt: startedAt + 14 * DAY_MS,
            payload: { userId, daysLeft: 0 },
          },
          {
            id: `${userId}:digest`,
            kind: "digest",
            dueAt: startedAt + 7 * DAY_MS,
            payload: { userId },
            repeatMs: 7 * DAY_MS,
          },
        ]);
        return new Response(null, { status: 202 });
      }

      case "POST /converted": {
        // Cancelling is exact, because the task ids are derived from the user id
        // rather than generated. No search, no tombstone row, no chance of the
        // sweep picking up a cancelled job that a previous transaction missed.
        await schedule.cancel(`${userId}:trial-day-11`);
        await schedule.cancel(`${userId}:trial-day-14`);
        return new Response(null, { status: 204 });
      }

      case "GET /pending":
        return Response.json(await schedule.pending());

      default:
        return new Response("not found", { status: 404 });
    }
  },
} satisfies ExportedHandler<SchedulerEnv>;

/**
 * ponytail: sequential, not Promise.all. These all target the same object, which
 * processes one event at a time regardless, so concurrency here buys nothing and
 * only makes the failure case harder to reason about.
 */
async function scheduleAll(
  schedule: DurableObjectStub<EntitySchedule>,
  tasks: Task[],
): Promise<void> {
  for (const task of tasks) await schedule.schedule(task);
}
