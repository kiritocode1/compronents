import { InspirationError, type PersonalPreference, type RetrievalRequest } from "./types.ts";

export function record(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new InspirationError("Expected an object.");
  return input as Record<string, unknown>;
}

function string(value: unknown, name: string, max: number, fallback = "") {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || value.length > max) throw new InspirationError(`${name} must be text, at most ${max} characters.`);
  return value.trim();
}

export function contextKey(value: unknown) {
  const key = string(value, "Context", 80).toLowerCase();
  if (key && !/^[a-z0-9][a-z0-9 /._-]*$/.test(key)) throw new InspirationError("Use letters, numbers, spaces or /._- for context.");
  return key;
}

export function parseRetrieval(input: unknown): RetrievalRequest {
  const v = record(input);
  const mode = v.mode ?? "search";
  if (mode !== "search" && mode !== "recommend" && mode !== "discover") throw new InspirationError("Unknown search mode.");
  const limit = v.limit === undefined ? (mode === "recommend" ? 3 : mode === "discover" ? 10 : 20) : Number(v.limit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) throw new InspirationError("Limit must be an integer from 1 to 50.");
  return {
    query: string(v.query, "Query", 500), mode, limit: Math.min(limit, mode === "recommend" ? 5 : mode === "discover" ? 12 : 50),
    contextKey: contextKey(v.contextKey), category: string(v.category, "Category", 120),
    kind: string(v.kind, "Kind", 30), stack: string(v.stack, "Stack", 50),
  };
}

export function parsePreference(input: unknown, resourceId: string): PersonalPreference {
  const v = record(input);
  if (v.preference !== "prefer" && v.preference !== "neutral" && v.preference !== "avoid") throw new InspirationError("Choose Prefer, Neutral or Avoid.");
  if (v.rating !== null && (!Number.isInteger(v.rating) || Number(v.rating) < 1 || Number(v.rating) > 5)) throw new InspirationError("Rating must be 1 to 5, or null.");
  if (!Number.isInteger(v.revision) || Number(v.revision) < 0) throw new InspirationError("A preference revision is required.");
  const date = v.testedAt === null || v.testedAt === undefined || v.testedAt === "" ? null : string(v.testedAt, "Tested date", 10);
  if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date)) throw new InspirationError("Use a valid YYYY-MM-DD tested date.");
  return { resourceId, contextKey: contextKey(v.contextKey), preference: v.preference,
    rating: v.rating as number | null, note: string(v.note, "Note", 2000), testedAt: date, revision: Number(v.revision) };
}
