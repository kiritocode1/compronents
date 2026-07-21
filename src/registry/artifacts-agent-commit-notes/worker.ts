/// <reference types="@cloudflare/workers-types" />

/**
 * The Worker in front of an Artifacts repo: it authorises a run, mints the
 * narrowest token that run needs, and answers provenance questions afterwards.
 *
 * The division of labour is set by the binding surface rather than by taste. The
 * Artifacts Workers binding is a control plane (`create`, `get`, `import`,
 * `fork`, `delete`) plus token management (`createToken`, `listTokens`,
 * `revokeToken`) plus a read surface (`log`, `readCommit`, `readTree`). Nothing
 * on it writes content. So the Worker never commits; it hands out a scoped
 * credential and the agent's own container does the pushing (commit-run.ts).
 *
 * What that buys is worth the round trip: the write token exists for the length
 * of one run, it is scoped to one repo, and the Worker is the only thing holding
 * the account credential. The alternative that everybody reaches for first, one
 * long-lived write token baked into the agent image, means a compromised agent
 * has permanent write access to every repo the token covers, and revoking it
 * stops every agent at once.
 *
 * Matching wrangler.jsonc:
 *
 * {
 *   "$schema": "./node_modules/wrangler/config-schema.json",
 *   "name": "blank-agent-provenance",
 *   "main": "src/provenance/worker.ts",
 *   "compatibility_date": "2026-07-01",
 *   "artifacts": [
 *     { "binding": "ARTIFACTS", "namespace": "agents-batch" }
 *   ],
 *   "vars": {
 *     "CLOUDFLARE_ACCOUNT_ID": "<your account id>",
 *     "ARTIFACTS_NAMESPACE": "agents-batch"
 *   }
 * }
 *
 * `artifacts` is non-inheritable in named Wrangler environments, so repeat the
 * block in every environment that needs it. Namespaces are also the rate-limit
 * boundary (2,000 control-plane requests per 10 seconds per namespace, and 2,000
 * Git requests per 10 seconds per repo), which is why the namespace here is
 * `agents-batch` rather than `default`: a fleet of agents minting tokens should
 * not be able to rate-limit the interactive namespace.
 *
 * Pinned to @cloudflare/workers-types@5.20260719.1, wrangler 4.112.0,
 * compatibility_date 2026-07-01.
 */

import {
  type AgentAttribution,
  ALL_NOTES_REFSPEC,
  decodeNote,
  notePathCandidates,
  noteRefs,
} from "./attribution.ts";

/**
 * `npx wrangler types` generates the real `Artifacts` type into
 * `worker-configuration.d.ts`, and the docs say to treat that generated file as
 * the source of truth for the binding in your environment. This local
 * declaration covers only the members used below so the file type-checks before
 * that file exists; delete it once `wrangler types` has run.
 */
type ArtifactsRepoHandle = {
  createToken(
    scope?: "read" | "write",
    ttl?: number,
  ): Promise<{ plaintext: string; scope: string; expiresAt: string }>;
  revokeToken(tokenOrId: string): Promise<boolean>;
};

type ArtifactsBinding = {
  get(name: string): Promise<ArtifactsRepoHandle>;
  create(
    name: string,
    opts?: {
      description?: string;
      readOnly?: boolean;
      setDefaultBranch?: string;
    },
  ): Promise<{
    name: string;
    remote: string;
    defaultBranch: string;
    token: string;
  }>;
};

export type ProvenanceEnv = {
  ARTIFACTS: ArtifactsBinding;
  /** Cloudflare API token. REST control-plane routes only; repo tokens do not work there. */
  CLOUDFLARE_API_TOKEN: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  ARTIFACTS_NAMESPACE: string;
  /** Shared secret the agent fleet presents. Stand-in for your real authorisation. */
  FLEET_SECRET: string;
};

/**
 * A run gets fifteen minutes of write access. Long enough that a slow model call
 * does not strand a half-finished commit, short enough that a leaked token from
 * a container log is expired before anyone reads the log. Tokens carry their
 * expiry in the string itself (`art_v1_<40 hex>?expires=<unix_seconds>`), so the
 * agent can check rather than discover it on a failed push.
 */
const RUN_TOKEN_TTL_SECONDS = 15 * 60;

export default {
  async fetch(request: Request, env: ProvenanceEnv): Promise<Response> {
    const url = new URL(request.url);

    // Authorise before anything else. The binding will happily mint a write
    // token for an unauthenticated caller, and a token route is the one route in
    // this Worker where a mistake hands out durable write access rather than
    // returning wrong data.
    if (request.headers.get("authorization") !== `Bearer ${env.FLEET_SECRET}`) {
      return new Response("unauthorized", { status: 401 });
    }

    switch (`${request.method} ${url.pathname}`) {
      /**
       * Start a run: return everything the agent's container needs and nothing
       * more. One repo, one write token, one note ref.
       */
      case "POST /runs": {
        const { repo, agent } = (await request.json()) as {
          repo: string;
          agent: string;
        };

        // Validates the slug and throws on a bad one, here rather than three
        // hours later when the push tries to write to a malformed ref.
        const { short, full } = noteRefs(agent);

        const handle = await env.ARTIFACTS.get(repo);
        const token = await handle.createToken("write", RUN_TOKEN_TTL_SECONDS);

        return Response.json({
          // Returned verbatim from create()/import() at repo-provisioning time
          // and stored alongside the repo name. The docs are explicit that the
          // returned `remote` is the string to use rather than one assembled
          // from the hostname pattern.
          remote: `https://${env.CLOUDFLARE_ACCOUNT_ID}.artifacts.cloudflare.net/git/${env.ARTIFACTS_NAMESPACE}/${repo}.git`,
          token: token.plaintext,
          expiresAt: token.expiresAt,
          noteRef: full,
          noteRefShort: short,
          // Handed to the agent explicitly so the refspec is not something each
          // harness has to remember. Forgetting it is the single most common way
          // provenance is lost, and it fails silently.
          pushRefspec: `+${full}:${full}`,
          fetchRefspec: ALL_NOTES_REFSPEC,
        });
      }

      /**
       * End a run: revoke early rather than waiting out the TTL.
       *
       * The TTL is the backstop for a container that died without calling this.
       * A run that finished normally should not leave a usable write credential
       * alive for the remainder of its fifteen minutes.
       */
      case "POST /runs/end": {
        const { repo, token } = (await request.json()) as {
          repo: string;
          token: string;
        };
        const handle = await env.ARTIFACTS.get(repo);
        return Response.json({ revoked: await handle.revokeToken(token) });
      }

      /**
       * Read provenance back: "which model wrote this commit".
       *
       * This is the query the whole design exists to serve, and it is a read of
       * a ref that a naive clone of this repo would not have.
       */
      case "GET /provenance": {
        const repo = url.searchParams.get("repo");
        const commit = url.searchParams.get("commit");
        const agent = url.searchParams.get("agent");
        if (!repo || !commit || !agent) {
          return new Response("repo, commit, and agent are required", {
            status: 400,
          });
        }

        const record = await readAttribution(env, repo, agent, commit);
        if (!record) {
          // Deliberately 404 rather than an empty 200. "No note" has two causes
          // that are indistinguishable from here: the commit is human-authored,
          // or a rebase orphaned the note by giving the work a new SHA. Both are
          // "this commit is unattributed", and neither is an attribution record.
          return Response.json(
            {
              commit,
              attributed: false,
              reason: "no note on this agent's ref",
            },
            { status: 404 },
          );
        }

        return Response.json({ commit, attributed: true, ...record });
      }

      default:
        return new Response("not found", { status: 404 });
    }
  },
} satisfies ExportedHandler<ProvenanceEnv>;

/**
 * Fetch and decode one note blob over the Artifacts REST API.
 *
 * Route shape is verified: `GET /accounts/:account/artifacts/namespaces/:ns/repos/:name/file?ref=&path=`
 * returns raw file bytes as `application/octet-stream`, and errors come back in
 * the standard Cloudflare v4 envelope. Authentication is a Cloudflare API token;
 * the repo tokens minted above authenticate Git routes only and will not work
 * here, which is a distinction the docs call out and which produces a confusing
 * 403 if you get it wrong.
 *
 * The one thing not confirmed in the beta docs: the `ref` parameter is
 * documented as "a branch, tag, or commit hash", and a notes ref is none of
 * those three. If your namespace rejects `refs/notes/agents/<agent>` as a ref,
 * resolve the notes tip with `repo.log({ ref })` and walk `readCommit` and
 * `readTree` instead, or read the note from a checkout with `git notes show`
 * (blameLine in commit-run.ts does exactly that).
 */
async function readAttribution(
  env: ProvenanceEnv,
  repo: string,
  agent: string,
  commit: string,
): Promise<AgentAttribution | null> {
  const { full } = noteRefs(agent);
  const base = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/artifacts/namespaces/${env.ARTIFACTS_NAMESPACE}/repos/${repo}/file`;

  // The fanout depth of a notes tree is an internal storage detail that git
  // rebalances as the note count grows, so the path that worked against a repo
  // with fifty commits stops working against the same repo with fifty thousand.
  // Try each shape rather than pin the one observed during development.
  for (const path of notePathCandidates(commit)) {
    const response = await fetch(
      `${base}?ref=${encodeURIComponent(full)}&path=${encodeURIComponent(path)}`,
      { headers: { authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}` } },
    );

    if (response.status === 404) continue;

    if (!response.ok) {
      // Distinguish "this commit has no note" from "the ref does not exist" and
      // from "the credential is wrong". Collapsing all three into null is how a
      // provenance system quietly reports every commit as unattributed after
      // somebody rotates an API token.
      throw new Error(
        `artifacts file read failed for ${repo} at ${full}: ${response.status}`,
      );
    }

    // decodeNote returns null on a malformed or wrong-version blob rather than
    // throwing, so one hand-edited note does not fail a bulk provenance sweep.
    return decodeNote(await response.text());
  }

  return null;
}

/**
 * Provision a repo for an agent fleet.
 *
 * Called once per unit of work rather than once per fleet. The Artifacts
 * guidance is a repo per agent, session, or application, and the reason shows up
 * here: a repo is the isolation boundary for tokens, so a repo shared by fifty
 * concurrent agents cannot issue a credential that lets one of them write
 * without letting it write over the others.
 *
 * `readOnly: false` is stated rather than defaulted because this repo exists to
 * be pushed to, and `setDefaultBranch` is stated because the branch name is part
 * of the refspec the agent is handed and should not be inferred.
 */
export async function provisionRunRepo(
  env: ProvenanceEnv,
  runId: string,
): Promise<{ name: string; remote: string; defaultBranch: string }> {
  const created = await env.ARTIFACTS.create(`run-${runId}`, {
    description: `BLANK agent run ${runId}`,
    readOnly: false,
    setDefaultBranch: "main",
  });

  // create() returns an initial token in `token`. It is discarded here on
  // purpose: provisioning and running are separate authorisation events, and the
  // run gets its own short-lived token from POST /runs when it actually starts,
  // which may be well after the repo was made.
  return {
    name: created.name,
    remote: created.remote,
    defaultBranch: created.defaultBranch,
  };
}
