# Source investigation implementation

Implemented locally against `4eccad7`. The accepted proposal is
[source-investigation-workflow.md](source-investigation-workflow.md).

## Before and after

Previously, wall Markdown included an action, but JSON omitted engagement
instructions and Markdown omitted the required evidence. Discovery instructions
capped inspection at three sources, including failed loads. No shared worker
brief directed lower-tier research or required lead verification.

```mermaid
flowchart LR
  A[BLANK retrieval] --> B[JSON hits or Markdown actions]
  B --> C[Agent decides whether to investigate]
```

The current response code supplies the same action and evidence requirements in
both formats. The installed rules direct the host to assign independent research
questions, investigate inside sources and verify the findings before use.

```mermaid
flowchart LR
  A[BLANK retrieval] --> B[Actions and evidence requirements]
  B --> C[Host lead assigns questions]
  C --> D[Lower-tier workers investigate]
  D --> E[Lead checks original evidence]
  E --> F[Supported choice and application]
```

The first two nodes are exercised server behavior. Worker creation and source
investigation are host responsibilities defined in the installed skill. A
response cannot force an arbitrary MCP client to run workers.

## Source path

| Construct | Responsibility |
| --- | --- |
| `src/lib/inspiration/response.ts` | Adds shared research instructions and per-resource engagement; renders the same contract as Markdown |
| `src/lib/inspiration/compat.ts` | Delivers the contract for wall search, recommend, discover and joint direction |
| `src/lib/inspiration/http.ts` | Preserves website JSON default, adds explicit Markdown, and labels inspection as stored evidence |
| `src/lib/registry-search.ts` | Adds engagement to installable hits while preserving ranking and install commands |
| `src/app/registry/search/route.ts` | Delivers research guidance in registry JSON and Markdown |
| `mcp/blank-direction/server.mjs` | Requests Markdown by default for MCP search and sends the matching Accept header for JSON |
| `.agents/skills/blank-direction/SKILL.md` | Defines worker briefs, model selection, source investigation, deadlines and lead verification |

For the tested command-menu scenario, the MCP adapter forwards the query and
chosen format. The route retrieves candidates, adds the shared protocol, and
returns source actions. JSON and Markdown expose the same requirements. Owner
preferences stay private. Stored inspection still requires owner access.

## Verification

The focused run covered 80 tests across database behavior, retrieval quality,
engagement, direction, response contracts and the real MCP stdio process. Its
first run found a missing apply/compare reminder in the tool description and a
missing inspect reminder in the project instructions. Both were restored, and
the four-test instruction suite then passed. All 80 cases pass across the final
focused runs.

`tsc --noEmit --pretty false` passed. Scoped Biome checks and `git diff --check`
passed. The pre-existing compact formatting in `http.ts` was preserved; its
Biome lint check passed.

A `gpt-5.6-luna` worker independently created and ran the MCP process tests. It
found that JSON search still advertised Markdown in its Accept header. The lead
fixed the adapter and the worker verified both headers with the actual process.
This demonstrates delegation and an evidence-backed correction in this task;
it is not a benchmark of research quality or cost savings.

Global rule sources in `/Users/blank/dotfiles/skills/rules/core/direction-first.md`
and `direction-first.grok.md` were rebuilt and installed. Grok's compact rule is
9,961 of its 10,000 allowed characters. The global build/install/check workflow
passed. Shared and Claude copies of the direction and second-brain skills were
synchronized. Existing unrelated dotfiles changes were preserved.

The implementation is local and uncommitted. Production responses require a
separate deployment. Existing agent sessions may need to reload instructions
or reconnect their MCP process. Research quality, latency and model cost remain
unmeasured. Human diff review is separate from the automated checks above.
