/// <reference types="@cloudflare/workers-types" />

/**
 * Control-plane Worker for the saga Workflow: create instances, cancel with
 * compensation, and replay from a named step.
 *
 * Version notes:
 * - `WorkflowInstance.terminate({ rollback: true })` landed in workerd on
 *   2026-06-29 and in Wrangler 4.109.0 (2026-06-23) for local dev. The default
 *   (`terminate()`) still stops the instance WITHOUT compensating.
 * - `WorkflowInstance.restart({ from: { name, count, type } })` landed 2026-05-04
 *   (Wrangler 4.97.0, 2026-06-02). Steps before `from` keep their cached results.
 *
 * Pinned to @cloudflare/workers-types@5.20260719.1.
 *
 * Matching wrangler.jsonc:
 *
 * {
 *   "name": "blank-subscription-saga",
 *   "main": "src/subscription-saga/worker.ts",
 *   "compatibility_date": "2026-07-01",
 *   "workflows": [
 *     {
 *       "binding": "PROVISION",
 *       "name": "provision-subscription",
 *       "class_name": "ProvisionSubscriptionWorkflow",
 *       // Cron triggering is config-only today (Wrangler 4.94.0, 2026-05-22):
 *       // the field is accepted and forwarded, scheduled dispatch is not live yet.
 *       "schedule": "0 3 * * *"
 *     }
 *   ],
 *   "kv_namespaces": [{ "binding": "SEATS", "id": "<seats-namespace-id>" }]
 * }
 */

import type {
  ProvisionSubscription,
  SubscriptionEnv,
} from "./workflow";

export { ProvisionSubscriptionWorkflow } from "./workflow";

type Env = SubscriptionEnv & {
  PROVISION: Workflow<ProvisionSubscription>;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/subscriptions") {
      const order = (await request.json()) as ProvisionSubscription;
      const instance = await env.PROVISION.create({
        // A stable id makes the whole provisioning attempt idempotent: a repeated
        // POST for the same account and plan throws instead of double charging.
        id: `provision:${order.accountId}:${order.planId}`,
        params: order,
        retention: { successRetention: "7 days", errorRetention: "30 days" },
      });
      return json({ instanceId: instance.id }, 202);
    }

    const instanceId = url.pathname.split("/").at(-1);
    if (!instanceId) return json({ error: "Missing instance id" }, 400);

    if (request.method === "GET") {
      const instance = await env.PROVISION.get(instanceId);
      const status = await instance.status();
      return json(status);
    }

    // Operator cancel. `rollback: true` runs every registered compensating
    // action in reverse step-start order before the instance is marked
    // terminated, so a half-provisioned subscription refunds itself.
    if (request.method === "DELETE") {
      const instance = await env.PROVISION.get(instanceId);
      await instance.terminate({ rollback: true });
      return json({ terminated: instanceId, compensated: true });
    }

    // Replay after fixing a downstream outage. Everything before the named step
    // keeps its cached result, so the payment is not captured a second time.
    if (request.method === "PUT") {
      const instance = await env.PROVISION.get(instanceId);
      await instance.restart({
        from: { name: "notify account webhook", count: 1, type: "do" },
      });
      return json({ restarted: instanceId, from: "notify account webhook" });
    }

    return json({ error: "Unsupported method" }, 405);
  },
} satisfies ExportedHandler<Env>;
