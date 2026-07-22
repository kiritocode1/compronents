// do-ratelimit: a global token bucket rate limiter, one Durable Object per API key.
//
// The fronting Worker never speaks HTTP to the DO. It calls the RPC method
// take() directly on a stub obtained with getByName(apiKey), so each API key
// shards to its own strongly consistent bucket, worldwide.
//
// Bucket state lives in DO SQLite (survives eviction). Refill is alarm driven:
// whenever the bucket is below capacity an alarm is armed, and each alarm tick
// adds REFILL_TOKENS until the bucket is full again, then the alarm goes quiet
// so an idle key costs nothing.

import { DurableObject } from "cloudflare:workers";

const CAPACITY = 10; // burst size
const REFILL_TOKENS = 5; // tokens added per alarm tick
const REFILL_INTERVAL_MS = 5_000;

export interface Verdict {
	allowed: boolean;
	remaining: number;
	limit: number;
	resetSeconds: number; // seconds until the bucket is full again
}

export class TokenBucket extends DurableObject {
	constructor(ctx: DurableObjectState, env: unknown) {
		super(ctx, env);
		// Schema init is guaranteed to finish before any RPC call is delivered.
		ctx.blockConcurrencyWhile(async () => {
			ctx.storage.sql.exec(
				`CREATE TABLE IF NOT EXISTS bucket (
					id INTEGER PRIMARY KEY CHECK (id = 1),
					tokens REAL NOT NULL,
					updated_ms INTEGER NOT NULL
				)`,
			);
			ctx.storage.sql.exec(
				"INSERT OR IGNORE INTO bucket (id, tokens, updated_ms) VALUES (1, ?, ?)",
				CAPACITY,
				Date.now(),
			);
		});
	}

	// RPC method: called as stub.take(cost) from the fronting Worker, no fetch involved.
	async take(cost = 1): Promise<Verdict> {
		const row = this.ctx.storage.sql
			.exec<{ tokens: number }>("SELECT tokens FROM bucket WHERE id = 1")
			.one();
		let tokens = row.tokens;
		const allowed = tokens >= cost;
		if (allowed) {
			tokens -= cost;
			this.ctx.storage.sql.exec(
				"UPDATE bucket SET tokens = ?, updated_ms = ? WHERE id = 1",
				tokens,
				Date.now(),
			);
		}
		// Arm the refill alarm only while the bucket is not full. One alarm per DO.
		if (tokens < CAPACITY && (await this.ctx.storage.getAlarm()) === null) {
			await this.ctx.storage.setAlarm(Date.now() + REFILL_INTERVAL_MS);
		}
		return {
			allowed,
			remaining: Math.floor(tokens),
			limit: CAPACITY,
			resetSeconds: Math.ceil(
				(Math.ceil((CAPACITY - tokens) / REFILL_TOKENS) * REFILL_INTERVAL_MS) / 1000,
			),
		};
	}

	// Debug RPC: read the bucket without spending a token.
	async peek(): Promise<{ tokens: number; alarmAt: number | null }> {
		const row = this.ctx.storage.sql
			.exec<{ tokens: number }>("SELECT tokens FROM bucket WHERE id = 1")
			.one();
		return { tokens: row.tokens, alarmAt: await this.ctx.storage.getAlarm() };
	}

	async alarm(): Promise<void> {
		const next = this.ctx.storage.transactionSync(() => {
			const row = this.ctx.storage.sql
				.exec<{ tokens: number }>("SELECT tokens FROM bucket WHERE id = 1")
				.one();
			const tokens = Math.min(CAPACITY, row.tokens + REFILL_TOKENS);
			this.ctx.storage.sql.exec(
				"UPDATE bucket SET tokens = ?, updated_ms = ? WHERE id = 1",
				tokens,
				Date.now(),
			);
			return tokens;
		});
		if (next < CAPACITY) {
			await this.ctx.storage.setAlarm(Date.now() + REFILL_INTERVAL_MS);
		}
	}
}

interface Env {
	LIMITER: DurableObjectNamespace<TokenBucket>;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const apiKey = request.headers.get("x-api-key");
		if (!apiKey) {
			return Response.json(
				{ error: "Send an x-api-key header, each key gets its own global bucket." },
				{ status: 401 },
			);
		}

		const stub = env.LIMITER.getByName(apiKey);

		if (new URL(request.url).pathname === "/peek") {
			return Response.json(await stub.peek());
		}

		const verdict = await stub.take(1);
		const headers = new Headers({
			"RateLimit-Limit": String(verdict.limit),
			"RateLimit-Remaining": String(verdict.remaining),
			"RateLimit-Reset": String(verdict.resetSeconds),
			"content-type": "application/json",
		});

		if (!verdict.allowed) {
			headers.set("Retry-After", String(verdict.resetSeconds));
			return new Response(
				JSON.stringify({ error: "Rate limit exceeded, bucket is empty." }),
				{ status: 429, headers },
			);
		}
		return new Response(
			JSON.stringify({ ok: true, key: apiKey, remaining: verdict.remaining }),
			{ headers },
		);
	},
};
