import { createHash, randomUUID } from "node:crypto";
import { lookup } from "node:dns/promises";
import { mkdir, writeFile } from "node:fs/promises";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { BlockList } from "node:net";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { canonicalUrl } from "./catalog.ts";
import type { InspirationDatabase } from "./db.ts";
import { resolveResource } from "./store.ts";
import type { Passage } from "./types.ts";

const blocked = new BlockList();
for (const [ip, bits] of [["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10],
  ["127.0.0.0", 8], ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24],
  ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24],
  ["224.0.0.0", 3]] as const) blocked.addSubnet(ip, bits, "ipv4");
const globalV6 = new BlockList();
globalV6.addSubnet("2000::", 3, "ipv6");
for (const [ip, bits] of [["2001::", 32], ["2001:db8::", 32], ["2002::", 16]] as const) blocked.addSubnet(ip, bits, "ipv6");

export function publicAddress(address: string, family: number) {
  return family === 4 ? !blocked.check(address, "ipv4")
    : family === 6 && globalV6.check(address, "ipv6") && !blocked.check(address, "ipv6");
}

/** Resolve each redirect and pin the connection to that checked address. */
export async function fetchSource(input: string, signal = AbortSignal.timeout(12000), redirects = 0): Promise<{ url: string; body: string; contentType: string }> {
  const url = new URL(canonicalUrl(input));
  if (url.port && url.port !== "80" && url.port !== "443") throw new Error("Only standard HTTP ports are allowed.");
  if (redirects > 4) throw new Error("Too many source redirects.");
  const addresses = await lookup(url.hostname.replace(/^\[|\]$/g, ""), { all: true });
  if (!addresses.length || addresses.some(a => !publicAddress(a.address, a.family))) throw new Error("Source resolves to a non-public address.");
  const address = addresses[0];
  const response = await new Promise<{ status: number; location?: string; contentType: string; body: string }>((done, reject) => {
    const req = (url.protocol === "https:" ? httpsRequest : httpRequest)(url, {
      signal, family: address.family,
      lookup: (_hostname, _options, callback) => callback(null, address.address, address.family),
      headers: { "User-Agent": "BLANK-Inspiration/1.0", Accept: "text/html, text/plain, text/markdown", "Accept-Encoding": "identity" },
    }, res => {
      const chunks: Buffer[] = []; let bytes = 0;
      res.on("error", reject);
      res.on("data", (chunk: Buffer) => {
        bytes += chunk.length;
        if (bytes > 2_000_000) { res.destroy(new Error("Source exceeds 2 MB.")); return; }
        chunks.push(chunk);
      });
      res.on("end", () => done({ status: res.statusCode ?? 0, location: res.headers.location,
        contentType: res.headers["content-type"] ?? "", body: Buffer.concat(chunks).toString("utf8") }));
    });
    req.on("error", reject); req.end();
  });
  if ([301, 302, 303, 307, 308].includes(response.status) && response.location) {
    return fetchSource(new URL(response.location, url).href, signal, redirects + 1);
  }
  if (response.status < 200 || response.status >= 300) throw new Error(`Source returned HTTP ${response.status}.`);
  return { url: url.href, body: response.body, contentType: response.contentType };
}

export async function extractSource(body: string, contentType: string, url: string) {
  if (/text\/(plain|markdown)/i.test(contentType)) return body.trim();
  if (!/html/i.test(contentType)) throw new Error("Only HTML and Markdown sources are supported.");
  const [{ JSDOM }, { Readability }] = await Promise.all([import("jsdom"), import("@mozilla/readability")]);
  const dom = new JSDOM(body, { url });
  try {
    const article = new Readability(dom.window.document).parse();
    if (!article?.content) throw new Error("No readable source body. Manual review is required.");
    const extracted = new JSDOM(article.content);
    try {
      return [...extracted.window.document.querySelectorAll("h1,h2,h3,h4,h5,h6,p,pre,li,table")]
        .filter(node => !node.parentElement?.closest("pre,li,table"))
        .map(node => `${/^H[1-6]$/.test(node.tagName) ? `${"#".repeat(Number(node.tagName[1]))} ` : ""}${node.textContent?.trim() ?? ""}`)
        .filter(Boolean).join("\n\n");
    } finally { extracted.window.close(); }
  } finally { dom.window.close(); }
}

export function chunkSource(text: string, resourceId: string, sourceUrl: string, hash: string, fetchedAt: string): Passage[] {
  const passages: Passage[] = []; const headings: string[] = []; let body = "";
  const flush = () => {
    if (!body.trim()) return;
    const ordinal = passages.length;
    passages.push({ id: `${resourceId}_${hash.slice(0, 16)}_${ordinal}`, resourceId, sourceUrl,
      heading: headings.filter(Boolean).join(" / "), text: body.trim(), hash, fetchedAt, ordinal });
    body = "";
  };
  for (const paragraph of text.split(/\n\s*\n/)) {
    const heading = /^(#{1,6})\s+([^\n]+)$/.exec(paragraph);
    if (heading) { flush(); headings.length = heading[1].length; headings[heading[1].length - 1] = heading[2]; continue; }
    for (let offset = 0; offset < paragraph.length; offset += 2500) {
      const piece = paragraph.slice(offset, offset + 2500);
      if (body.length + piece.length + 2 > 2500) flush();
      body += `${body ? "\n\n" : ""}${piece}`;
    }
  }
  flush();
  return passages;
}

export async function enqueue(db: InspirationDatabase, resourceId: string) {
  if (!await resolveResource(db, resourceId)) throw new Error("Unknown resource ID.");
  await db.query(`INSERT INTO inspiration_jobs(resource_id) VALUES ($1)
    ON CONFLICT(resource_id) DO UPDATE SET state = 'pending', attempts = 0, error = NULL, next_attempt_at = now()
    WHERE inspiration_jobs.state <> 'running' OR inspiration_jobs.lease_until < now()`, [resourceId]);
}

export async function claimJob(db: InspirationDatabase) {
  const [job] = await db.query<{ resource_id: string; lease_token: string; attempts: number }>(`WITH candidate AS (
    SELECT j.resource_id FROM inspiration_jobs j JOIN inspiration_resources r ON r.id = j.resource_id AND r.active
    WHERE j.attempts < 3 AND ((j.state = 'pending' AND j.next_attempt_at <= now()) OR
      (j.state = 'running' AND j.lease_until < now()))
    ORDER BY j.next_attempt_at FOR UPDATE OF j SKIP LOCKED LIMIT 1
  ) UPDATE inspiration_jobs j SET state = 'running', attempts = attempts + 1,
    lease_token = $1, lease_until = now() + interval '60 seconds', updated_at = now()
    FROM candidate c WHERE j.resource_id = c.resource_id RETURNING j.resource_id, j.lease_token, j.attempts`, [randomUUID()]);
  return job;
}

/** Activate passages and finish the job in one statement, conditional on its current lease. */
export async function publishSource(db: InspirationDatabase, job: { resource_id: string; lease_token: string }, passages: Passage[], locator: string) {
  if (!passages.length) throw new Error("Empty source cannot replace the last successful version.");
  const first = passages[0];
  const rows = await db.query(`WITH owned AS (
    UPDATE inspiration_jobs SET state = 'done', lease_until = NULL, error = NULL, updated_at = now()
    WHERE resource_id = $1 AND lease_token = $2 AND state = 'running' AND lease_until > now() RETURNING resource_id
  ), snapshot AS (
    INSERT INTO inspiration_snapshots(resource_id, hash, source_url, locator, fetched_at)
    SELECT resource_id, $3, $4, $5, $6::timestamptz FROM owned ON CONFLICT DO NOTHING
  ), retired AS (
    UPDATE inspiration_passages SET active = false WHERE resource_id IN (SELECT resource_id FROM owned)
      AND document->>'hash' <> $3
  ) INSERT INTO inspiration_passages(id, resource_id, document, search_text)
    SELECT doc->>'id', owned.resource_id, doc, concat(doc->>'heading', ' ', doc->>'text')
    FROM owned CROSS JOIN jsonb_array_elements($7::jsonb) AS doc
    ON CONFLICT(id) DO UPDATE SET active = true RETURNING id`,
    [job.resource_id, job.lease_token, first.hash, first.sourceUrl, locator, first.fetchedAt, JSON.stringify(passages)]);
  if (!rows.length) throw new Error("Source lease expired. Another worker may have claimed it.");
}

/** Local pilot only. Cloud snapshots and scheduled ingestion require connected services. */
export async function drainJobs(db: InspirationDatabase, limit = 6) {
  if (db.kind !== "local") throw new Error("Source ingestion currently requires the local database.");
  const results: { resourceId: string; state: string; passages?: number; error?: string }[] = [];
  const deadline = Date.now() + 45000;
  for (let n = 0; n < Math.min(limit, 6) && Date.now() < deadline - 12000; n++) {
    const job = await claimJob(db); if (!job) break;
    try {
      const resource = await resolveResource(db, job.resource_id); if (!resource) throw new Error("Resource is inactive.");
      // Fetch only the curated URL. No site traversal or inferred capabilities.
      const raw = await fetchSource(resource.href);
      const extracted = await extractSource(raw.body, raw.contentType, raw.url);
      if (extracted.length < 200) throw new Error("Too little readable text. Manual source inspection is required.");
      const hash = createHash("sha256").update(JSON.stringify([raw.url, extracted])).digest("hex");
      const passages = chunkSource(extracted, resource.id, raw.url, hash, new Date().toISOString());
      const directory = resolve(process.env.INSPIRATION_LOCAL_DB || ".inspiration-local", "snapshots");
      await mkdir(directory, { recursive: true });
      const locator = resolve(directory, `${resource.id}-${hash}.json.gz`);
      await writeFile(locator, gzipSync(JSON.stringify({ ...raw, extracted })));
      await publishSource(db, job, passages, locator);
      results.push({ resourceId: resource.id, state: "done", passages: passages.length });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Source ingestion failed.";
      await db.query(`UPDATE inspiration_jobs SET state = CASE WHEN attempts >= 3 THEN 'failed' ELSE 'pending' END,
        error = $3, lease_until = NULL, next_attempt_at = now() + interval '1 hour', updated_at = now()
        WHERE resource_id = $1 AND lease_token = $2 AND state = 'running'`, [job.resource_id, job.lease_token, message]);
      results.push({ resourceId: job.resource_id, state: "failed", error: message });
    }
  }
  return results;
}
