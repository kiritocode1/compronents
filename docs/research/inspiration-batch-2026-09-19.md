# Inspiration additions, 19 September 2026

## Destination and evidence

Saved 16 new resources to production Neon. The database now has 1,574 active resources and no embedding gaps. Each new resource was inspected after import, returned first for its exact title, and appeared with the same resource ID through the deployed search endpoint using provider `postgres` and HTTP 200. All 16 extraction jobs are pending. Extraction was queued, not run.

Descriptions came from the linked repository README or source page. The 0xMovez post and its embedded article were read through `https://api.fxtwitter.com/0xMovez/status/2104216919033192746` because X access was blocked. The article body was truncated during step seven; the catalog explicitly records that limitation. README inspection verifies descriptions, not operation of the tools.

The existing importer received only these 16 resources. An unrelated, uncommitted Webreel catalog edit was excluded from the database write and this commit.

## Saved resources

Every row below has a confirmed Neon write, deployed database retrieval, and pending extraction. Ranks show exact title, first supported intent, and second supported intent.

| Resource | Group | Resource ID | Ranks |
| --- | --- | --- | --- |
| [Opus motion-design course](https://x.com/0xMovez/status/2104216919033192746) | Animation and motion | `res_1d6de2d12a212953d2675b0b` | 1 / 1 / 1 |
| [GitHub MCP Server](https://github.com/github/github-mcp-server) | AI agent platforms and infrastructure | `res_faa318861b48de8d83c95eb8` | 1 / 1 / 1 |
| [Claude-Mem](https://github.com/thedotmack/claude-mem) | AI agent platforms and infrastructure | `res_853c63f738f0cecf3b918959` | 1 / 1 / 1 |
| [Supermemory](https://github.com/supermemoryai/supermemory) | AI agent platforms and infrastructure | `res_82d803b5a5c59170ed946da2` | 1 / 1 / 1 |
| [OpenDots](https://github.com/CopilotKit/OpenDots) | AI agent platforms and infrastructure | `res_0216c7938e68654c4eab5b69` | 1 / 1 / 1 |
| [Tester Army E2E](https://tester.army/e2e) | Developer tools and utilities | `res_73174228ae73db959b34a18c` | 1 / 1 / 1 |
| [MarkItDown](https://github.com/microsoft/markitdown) | File sharing and conversion tools | `res_dec36f96df8d997b886d7780` | 1 / 1 / 2 |
| [@yielded/auth](https://github.com/yielded-dev/auth) | Effect ecosystem | `res_5b9007d9840354fd9b53755c` | 1 / 1 / 1 |
| [Superpowers](https://github.com/obra/superpowers) | Agent skills directories | `res_8c6014a36ca90e3fbda99713` | 1 / 1 / 1 |
| [Karpathy-Inspired Claude Code Guidelines](https://github.com/multica-ai/andrej-karpathy-skills) | Agent skills directories | `res_ca6e9330cc1b2a538d3772d7` | 1 / 1 / 1 |
| [gstack](https://github.com/garrytan/gstack) | Agent skills directories | `res_b321d228efd2bc14fda49902` | 1 / 1 / 1 |
| [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Agent skills directories | `res_845dff761b2978ce3eaa250d` | 1 / 1 / 1 |
| [Taste Skill](https://github.com/Leonxlnx/taste-skill) | Agent skills directories | `res_291d5eb46511b79f06895f30` | 1 / 1 / 1 |
| [Anthropic Skills](https://github.com/anthropics/skills) | Agent skills directories | `res_82a901da1b9bedec6f38670b` | 1 / 1 / 1 |
| [Humanizer](https://github.com/blader/humanizer) | Agent skills directories | `res_2db4f7d2d7de0ea292a7b64c` | 1 / 1 / 1 |
| [jev-seo](https://github.com/AgriciDaniel/jev-seo) | Agent skills directories | `res_37c494331c25cb9fe8d99586` | 1 / 1 / 1 |

Addy Osmani's `https://github.com/addyosmani/agent-skills` is already represented by `https://skills.addy.ie/`, resource `res_9ae251e562d6aa4dad926e47`, in Agent skills directories. Confirmed in both the catalog and Neon. No duplicate was added.

## Checks and limits

- `pnpm exec biome check --write src/lib/inspiration.ts` passed.
- `git diff --check` passed.
- `pnpm test:inspiration-search` passed all 51 tests.
- Exact-title rank was 1 for all 16 resources. Supported intents used the first two explicit `useFor` phrases in each catalog entry. Thirty-one ranked first; MarkItDown ranked second for `convert office files to markdown`, after `anydoc`.
- Two title-free negative queries were checked: `custody cryptocurrency private keys and sign blockchain transfers` and `provision physical hardware devices through fleet management`. None of these additions appeared in the top three. These are coarse unrelated-intent checks, not proof of discrimination between closely related tools. Initial title-anchored negatives were confounded by exact-name lookup and do not support that claim.
- All 16 Noul attempts failed with `Free tier users do not have access to this model.` The source-description, use-retrieval and facet-support verdicts and probabilities are unavailable for every row. The semantic gate remains blocked, not passed.
- One sequential deployed-verification command exceeded its 180-second timeout after ten resources. A bounded completion run verified the remaining six and checked the pending jobs.

No tools were installed. No changes were made to the Bandobast database or source code for this inspiration batch.
