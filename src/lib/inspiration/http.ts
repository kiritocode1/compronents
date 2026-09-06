import { randomUUID } from "node:crypto";
import { createOwnerSession, OWNER_COOKIE, ownerPasswordMatches, requestViewer, requireOwnerWrite, requireSameOrigin } from "./auth.ts";
import { getInspirationDatabase, type InspirationDatabase } from "./db.ts";
import { retrieve } from "./retrieve.ts";
import { effectivePreferences, passagesFor, preferences, reserveUsage, resolveResource, savePreference } from "./store.ts";
import { InspirationError } from "./types.ts";
import { contextKey, parsePreference, parseRetrieval, record } from "./validation.ts";

export function jsonResponse(value: unknown, status = 200, headers: Record<string, string> = {}) {
  return Response.json(value, { status, headers: { "Cache-Control": "private, no-store", Vary: "Cookie, Authorization", ...headers } });
}

export async function handleInspiration(request: Request, database?: InspirationDatabase) {
  try {
    const url = new URL(request.url);
    const operation = url.pathname.split("/").pop();
    const viewer = requestViewer(request);
    if (operation === "session" && request.method === "GET") return jsonResponse(viewer);
    if (operation === "search" && request.method === "GET") {
      const values = Object.fromEntries(url.searchParams);
      return jsonResponse(await retrieve(parseRetrieval({ ...values, query: values.q ?? values.query }), viewer, { db: database }));
    }
    const db = database ?? await getInspirationDatabase();
    if (!db) throw new InspirationError("The inspiration database is not configured.", 503);
    if (operation === "inspect" && request.method === "GET") {
      if (!viewer.owner) throw new InspirationError("Owner access is required to inspect sources and preferences.", 401);
      const resource = await resolveResource(db, url.searchParams.get("id") ?? "");
      if (!resource) throw new InspirationError("Resource not found.", 404);
      const context = contextKey(url.searchParams.get("contextKey") ?? "");
      const [evidence, rows, jobs] = await Promise.all([
        passagesFor(db, [resource.id], url.searchParams.get("q") ?? ""), preferences(db, context),
        db.query("SELECT state, attempts, error, updated_at FROM inspiration_jobs WHERE resource_id = $1", [resource.id]),
      ]);
      return jsonResponse({ resource, evidence, preference: effectivePreferences(rows, context).get(resource.id) ?? null, jobs });
    }
    if (request.method !== "POST") throw new InspirationError("Unknown operation.", 404);
    if (!request.headers.get("content-type")?.includes("application/json")) throw new InspirationError("Send application/json.", 415);
    const text = await request.text();
    if (text.length > 12000) throw new InspirationError("Request is too large.", 413);
    let body: Record<string, unknown>;
    try { body = record(JSON.parse(text)); } catch { throw new InspirationError("Invalid JSON object."); }
    if (operation === "session") {
      requireSameOrigin(request);
      if (body.logout === true) return jsonResponse({ owner: false }, 200, { "Set-Cookie": `${OWNER_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0` });
      if (typeof body.password !== "string" || body.password.length > 500) throw new InspirationError("Enter the owner password.");
      if (!await reserveUsage(db, `login:${Math.floor(Date.now() / 900000)}`, 1, 10)) throw new InspirationError("Too many login attempts. Try again in 15 minutes.", 429);
      if (!ownerPasswordMatches(body.password)) throw new InspirationError("Incorrect owner password.", 401);
      return jsonResponse({ owner: true }, 200, { "Set-Cookie": `${OWNER_COOKIE}=${createOwnerSession()}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200` });
    }
    if (operation === "preference") requireOwnerWrite(request);
    else if (!viewer.owner) throw new InspirationError("Owner access is required.", 401);
    if (operation !== "preference" && !request.headers.has("authorization")) requireSameOrigin(request);
    if (typeof body.resourceId !== "string") throw new InspirationError("Resource ID is required.");
    const resource = await resolveResource(db, body.resourceId);
    if (!resource) throw new InspirationError("Resource not found.", 404);
    if (operation === "preference") return jsonResponse(await savePreference(db, parsePreference(body, resource.id)));
    if (operation === "feedback") {
      if (!["irrelevant", "inspected", "adopted", "used-successfully"].includes(String(body.outcome))) throw new InspirationError("Unknown feedback outcome.");
      if (typeof body.note !== "string" || body.note.length > 2000) throw new InspirationError("Feedback note must be at most 2,000 characters.");
      const id = randomUUID();
      await db.query("INSERT INTO inspiration_feedback(id, resource_id, outcome, note) VALUES ($1,$2,$3,$4)", [id, resource.id, body.outcome, body.note]);
      return jsonResponse({ id });
    }
    throw new InspirationError("Unknown operation.", 404);
  } catch (error) {
    return jsonResponse({ error: error instanceof InspirationError ? error.message : "Inspiration database operation failed. Check local health." }, error instanceof InspirationError ? error.status : 503);
  }
}
