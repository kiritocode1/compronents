/** The inspiration database is separate from mint-me's DATABASE_URL. */
export const schema = [
  `CREATE EXTENSION IF NOT EXISTS pg_trgm`,
  `CREATE TABLE IF NOT EXISTS inspiration_resources (
    id text PRIMARY KEY, canonical_url text UNIQUE NOT NULL,
    document jsonb NOT NULL, search_text text NOT NULL,
    search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', search_text)) STORED,
    active boolean NOT NULL DEFAULT true, updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS inspiration_text_idx ON inspiration_resources USING gin(search_vector)`,
  `CREATE INDEX IF NOT EXISTS inspiration_trigram_idx ON inspiration_resources USING gin(search_text gin_trgm_ops)`,
  `CREATE TABLE IF NOT EXISTS inspiration_aliases (
    alias text NOT NULL, resource_id text NOT NULL REFERENCES inspiration_resources(id),
    PRIMARY KEY(alias, resource_id)
  )`,
  `CREATE TABLE IF NOT EXISTS inspiration_preferences (
    resource_id text NOT NULL REFERENCES inspiration_resources(id),
    context_key text NOT NULL DEFAULT '', preference text NOT NULL CHECK (preference IN ('prefer','neutral','avoid')),
    rating integer CHECK (rating BETWEEN 1 AND 5), note text NOT NULL DEFAULT '',
    tested_at date, revision integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY(resource_id, context_key)
  )`,
  `CREATE TABLE IF NOT EXISTS inspiration_passages (
    id text PRIMARY KEY, resource_id text NOT NULL REFERENCES inspiration_resources(id),
    document jsonb NOT NULL, search_text text NOT NULL,
    search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', search_text)) STORED,
    active boolean NOT NULL DEFAULT true
  )`,
  `CREATE INDEX IF NOT EXISTS inspiration_passages_text_idx ON inspiration_passages USING gin(search_vector)`,
  `CREATE INDEX IF NOT EXISTS inspiration_passages_resource_idx ON inspiration_passages(resource_id)`,
  `CREATE TABLE IF NOT EXISTS inspiration_jobs (
    resource_id text PRIMARY KEY REFERENCES inspiration_resources(id),
    state text NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','running','done','failed')),
    attempts integer NOT NULL DEFAULT 0, lease_token text, lease_until timestamptz,
    next_attempt_at timestamptz NOT NULL DEFAULT now(), error text,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS inspiration_usage (
    bucket text PRIMARY KEY, requests integer NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS inspiration_snapshots (
    resource_id text NOT NULL REFERENCES inspiration_resources(id), hash text NOT NULL,
    source_url text NOT NULL, locator text NOT NULL, fetched_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY(resource_id, hash)
  )`,
  `CREATE TABLE IF NOT EXISTS inspiration_feedback (
    id text PRIMARY KEY, resource_id text NOT NULL REFERENCES inspiration_resources(id),
    outcome text NOT NULL CHECK (outcome IN ('irrelevant','inspected','adopted','used-successfully')),
    note text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now()
  )`,
];

/**
 * Neon only. `rag_bge_small_en_v15` runs an embedding model on the database
 * compute, which PGlite cannot do, so local development keeps the full-text and
 * trigram paths and simply has no semantic column.
 *
 * `embedded_text` records the text an embedding was built from. It is what makes
 * the refresh exact: comparing against `updated_at` would re-embed the whole wall
 * on every import, because importCatalog bumps that whether or not text changed.
 */
export const vectorExtensions = [
  // pgrag is beta on Neon and refused without this, IF NOT EXISTS included.
  `SET LOCAL neon.allow_unstable_extensions='true'`,
  `CREATE EXTENSION IF NOT EXISTS vector`,
  `CREATE EXTENSION IF NOT EXISTS rag_bge_small_en_v15 CASCADE`,
];

export const vectorSchema = [
  `ALTER TABLE inspiration_resources
    ADD COLUMN IF NOT EXISTS embedding vector(384),
    ADD COLUMN IF NOT EXISTS embedded_text text`,
  `ALTER TABLE inspiration_passages
    ADD COLUMN IF NOT EXISTS embedding vector(384),
    ADD COLUMN IF NOT EXISTS embedded_text text`,
  `CREATE INDEX IF NOT EXISTS inspiration_resources_embedding_idx
    ON inspiration_resources USING hnsw (embedding vector_cosine_ops)`,
  `CREATE INDEX IF NOT EXISTS inspiration_passages_embedding_idx
    ON inspiration_passages USING hnsw (embedding vector_cosine_ops)`,
];
