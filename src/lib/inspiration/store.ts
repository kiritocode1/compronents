import type { InspirationDatabase } from "./db.ts";
import { resourceText, seedCatalog } from "./catalog.ts";
import { InspirationError, type Passage, type PersonalPreference, type Resource } from "./types.ts";

export async function importCatalog(db: InspirationDatabase, resources = seedCatalog()) {
  // One request per batch, and each resource plus its aliases changes atomically.
  for (let offset = 0; offset < resources.length; offset += 100) {
    await db.query(`WITH input AS (
      SELECT value AS doc FROM jsonb_array_elements($1::jsonb)
    ), saved AS (
      INSERT INTO inspiration_resources (id, canonical_url, document, search_text)
      SELECT doc->>'id', doc->>'href', doc - 'searchText', doc->>'searchText' FROM input
      ON CONFLICT(canonical_url) DO UPDATE SET
        document = EXCLUDED.document || jsonb_build_object('id', inspiration_resources.id),
        search_text = EXCLUDED.search_text, updated_at = now()
      RETURNING id, document
    ) INSERT INTO inspiration_aliases(alias, resource_id)
      SELECT jsonb_array_elements_text(document->'aliases'), id FROM saved ON CONFLICT DO NOTHING`,
      [JSON.stringify(resources.slice(offset, offset + 100).map(r => ({ ...r, searchText: resourceText(r) })))]);
  }
  await refreshEmbeddings(db);
  return resources.length;
}

/**
 * Re-embed only rows whose text changed. Runs inside importCatalog rather than as
 * its own command, because an indexing step nothing calls is an index that stays
 * empty. A no-op on local PGlite, which has no embedding extension.
 */
export async function refreshEmbeddings(db: InspirationDatabase) {
  if (db.kind !== "neon") return { resources: 0, passages: 0 };
  const [resources, passages] = await Promise.all([
    db.query<{ id: string }>(`UPDATE inspiration_resources
      SET embedding = rag_bge_small_en_v15.embedding_for_passage(search_text), embedded_text = search_text
      WHERE active AND embedded_text IS DISTINCT FROM search_text RETURNING id`),
    db.query<{ id: string }>(`UPDATE inspiration_passages
      SET embedding = rag_bge_small_en_v15.embedding_for_passage(search_text), embedded_text = search_text
      WHERE active AND embedded_text IS DISTINCT FROM search_text RETURNING id`),
  ]);
  return { resources: resources.length, passages: passages.length };
}

/** Active rows still missing an embedding. Zero is the healthy state on Neon. */
export async function embeddingGaps(db: InspirationDatabase) {
  if (db.kind !== "neon") return null;
  const [row] = await db.query<{ resources: number; passages: number }>(`SELECT
    (SELECT count(*)::integer FROM inspiration_resources WHERE active AND embedding IS NULL) AS resources,
    (SELECT count(*)::integer FROM inspiration_passages WHERE active AND embedding IS NULL) AS passages`);
  return row;
}

export async function allResources(db: InspirationDatabase): Promise<Resource[]> {
  const rows = await db.query<{ document: Resource }>(`SELECT document FROM inspiration_resources WHERE active ORDER BY id`);
  return rows.map(row => row.document);
}

export async function resolveResource(db: InspirationDatabase, id: string): Promise<Resource | null> {
  const rows = await db.query<{ document: Resource }>(`SELECT DISTINCT r.document FROM inspiration_resources r
    LEFT JOIN inspiration_aliases a ON a.resource_id = r.id
    WHERE r.active AND (r.id = $1 OR a.alias = $1 OR r.canonical_url = $1) LIMIT 2`, [id]);
  if (rows.length > 1) throw new InspirationError("This old citation matches multiple resources. Search by title or URL to select one.", 409);
  return rows[0]?.document ?? null;
}

export async function preferences(db: InspirationDatabase, contextKey: string): Promise<PersonalPreference[]> {
  return db.query<PersonalPreference>(`SELECT resource_id AS "resourceId", context_key AS "contextKey",
    preference, rating, note, to_char(tested_at, 'YYYY-MM-DD') AS "testedAt", revision
    FROM inspiration_preferences WHERE context_key IN ('', $1)`, [contextKey]);
}

export function effectivePreferences(rows: PersonalPreference[], context: string) {
  const map = new Map<string, PersonalPreference>();
  for (const row of rows.filter(row => row.contextKey === "")) map.set(row.resourceId, row);
  for (const row of rows.filter(row => context !== "" && row.contextKey === context)) map.set(row.resourceId, row);
  return map;
}

export async function savePreference(db: InspirationDatabase, value: PersonalPreference) {
  const rows = await db.query<PersonalPreference>(`INSERT INTO inspiration_preferences
    (resource_id, context_key, preference, rating, note, tested_at)
    SELECT $1, $2, $3, $4, $5, $6::date WHERE $7::integer = 0
    ON CONFLICT(resource_id, context_key) DO NOTHING RETURNING revision`,
    [value.resourceId, value.contextKey, value.preference, value.rating, value.note, value.testedAt, value.revision]);
  if (rows.length) return { ...value, revision: 1 };
  const updated = await db.query<{ revision: number }>(`UPDATE inspiration_preferences SET
    preference = $3, rating = $4, note = $5, tested_at = $6::date, revision = revision + 1, updated_at = now()
    WHERE resource_id = $1 AND context_key = $2 AND revision = $7 RETURNING revision`,
    [value.resourceId, value.contextKey, value.preference, value.rating, value.note, value.testedAt, value.revision]);
  if (!updated.length) throw new InspirationError("This preference changed in another tab. Reload before saving.", 409);
  return { ...value, revision: updated[0].revision };
}

export async function passagesFor(db: InspirationDatabase, ids: string[], query = ""): Promise<Passage[]> {
  if (!ids.length) return [];
  const rows = await db.query<{ document: Passage }>(`SELECT document FROM (
    SELECT document, row_number() OVER (PARTITION BY resource_id ORDER BY
      ts_rank_cd(search_vector, plainto_tsquery('english', $2)) DESC,
      (document->>'ordinal')::integer) AS position
    FROM inspiration_passages WHERE active AND resource_id = ANY($1::text[])
  ) ranked WHERE position <= 2`, [ids, query]);
  return rows.map(row => row.document);
}

/** Reserve before the provider request. Failed requests still consume the local budget. */
export async function reserveUsage(db: InspirationDatabase, bucket: string, amount: number, limit: number) {
  const rows = await db.query(`INSERT INTO inspiration_usage(bucket, requests)
    SELECT $1, $2::integer WHERE $2::integer <= $3::integer
    ON CONFLICT(bucket) DO UPDATE SET requests = inspiration_usage.requests + EXCLUDED.requests
    WHERE inspiration_usage.requests + EXCLUDED.requests <= $3 RETURNING bucket`, [bucket, amount, limit]);
  return rows.length > 0;
}
