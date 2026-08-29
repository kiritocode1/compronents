# Make BLANK a proactive taste loop

## Goal

The wall should change what agents make. It should not end as a list of links or citations.

Before an agent makes a meaningful frontend, UI, component, library, tool, or craft decision, BLANK should expose it to a varied set of relevant work. The agent then studies a few sources, explains why their choices work, applies the useful mechanisms, and compares the result.

This follows the reason the wall exists: taste develops through exposure to strong work, rational analysis, and repeated application.

## Confirmed failures

The catalog is not the problem. It has 1,308 links across 51 groups, and precise recent-import queries return the intended entries.

The broad candidate pool also works. For "help me explore what I could use for a new developer tool interface," `rankExpanded` finds 102 candidates. The strict recommender reduces that to one, then `/direction` removes the last result. The public response is empty. The wider search path returns useful material such as OpenTUI, New Interfaces, Make Interfaces Feel Better, Fallow Tools, and Mockdown.

The second failure is behavioral. Every agent instruction says to look up, recommend, and cite. None requires the agent to inspect a selected source, explain a mechanism, apply it, or compare the result. The global trigger is also reactive. It waits for the user to mention a resource instead of running before the agent makes a choice.

## Chosen product model

BLANK gets two explicit jobs.

### Exact direction

Keep `/direction`, `direction_lookup`, and `recommendInspiration` strict. They answer a known need with a few high-confidence results. Their ranking and current regression behavior should not change.

### Taste preflight

Add `direction_discover` and `/direction/discover`. This is the proactive path for open work.

It returns a compact scan of 8 to 12 varied candidates, with 10 by default. The scan mixes usable registry items, libraries, tools, implementation examples, essays, case studies, portfolios, galleries, and other references when the ranked pool supports them.

The agent follows one bounded loop:

1. Scan all compact candidates. Do not open every link.
2. Attempt to inspect at most three live sources.
3. For each inspected source, name the observed mechanism, why it works for this task, and whether to adopt, adapt, or reject it.
4. Apply the chosen mechanisms.
5. Compare the result with the intended property and report what matched or changed.

The final answer cites only sources that influenced the work. A scanned candidate is not an influence. A catalog description is a lead, not proof that a live source uses a mechanism.

## Proactive trigger

Run one taste preflight before the first choice-bearing decision in a stable task direction. This includes:

- page or component composition
- interaction or motion behavior
- typography, color, density, or visual system
- choosing a component, library, UI kit, frontend tool, or implementation example
- shaping a new user-facing frontend experience

Skip it for:

- a typo or copy correction
- a mechanical refactor with a fixed result
- a pure backend bug with no tool or interface choice
- an exact 1:1 reproduction where the user already chose the source
- a task already covered by the current taste preflight

The agent decides whether the trigger applies because it has the task context. The server will not add a keyword or model classifier that could silently suppress discovery again.

## Architecture

### Retrieval and selection

`rankExpanded` remains the only relevance engine. Discovery asks it for a larger bounded pool and selects a varied scan without using the strict recommendation floors.

Selection is deterministic:

1. Get a recall-sized ranked pool, initially 120.
2. Compute strict exact results through the unchanged exact path and expose them in a separate `exact` field.
3. Remove duplicate ids, canonical URLs, and same-title entries on the same host.
4. Map existing facets and categories to roles such as installable, library, tool, implementation, essay, case study, portfolio, gallery, and reference.
5. Pin strict exact results first.
6. Fill the scan with the highest-ranked candidates that add category, role, source, or host variety.
7. Keep at most two candidates per category and two per host. Relax the category cap, then the host cap, only when the result would otherwise stay underfilled.
8. Require positive query or facet evidence for every candidate. Diversity can reorder relevant candidates but cannot admit an unrelated one.

There is no random sampling, cursor, personal taste profile, embedding index, or server-side source crawl in this version.

### Category-aware engagement

The wall has 51 groups. The BLANK registry is the 52nd decision source. Discovery must tell the agent how to engage with each result, not only why it ranked.

Resolve the action in this order:

1. Registry results always use the inspect, install, and run path.
2. An explicit or derived `kind` overrides the category default. A skill inside a broad developer-tools group still loads as a skill. An essay inside React still gets read as an essay.
3. The category supplies the fallback action for mixed or untyped entries.

The interaction families cover every current group:

| Interaction | Category defaults | Agent behavior |
| --- | --- | --- |
| Search, inspect, install | React; React Native and mobile; JavaScript and TypeScript; Icons; Animated icon libraries; UI kit directories; Component libraries and blocks; Animation and motion; WebGL, shaders and creative coding; Audio, video and media; AI agent platforms and infrastructure; Effect ecosystem | Open the selected library or directory, search its own catalog with task terms, inspect the concrete component, API, source, or example, then install or copy only the chosen item. A landing-page skim does not count. |
| Read and study | Web platform, CSS and performance; Frontend architecture and patterns; Interface design guidelines and craft; Design essays and culture; LLMs and AI engineering; Machine learning and deep learning; Backend engineering; Distributed systems and computer science; Books and fundamentals; Personal blogs and sites; Engineering essays and culture | Read the relevant article, chapter, or documentation section. Extract the thesis, mechanism, evidence, and task-specific decision. Do not treat the catalog description as the reading. |
| Curate visually with Argent | Component demos and micro-interactions; Design inspiration galleries; Portfolios and studios; Branding and logo archives | Load `argent-device-interact`. Use a running Argent Chromium CDP target, open the live source, discover before interactions, inspect states and motion, and capture visual evidence. Curate only details relevant to the current task. Do not navigate from screenshots. |
| Use or evaluate directly | Color, gradients and palettes; CSS and shape generators; Typography tools; AI tools, agents and search; Databases and storage; Infrastructure, observability and runtimes; Developer tools and utilities; Productivity and business tools; File sharing and conversion tools; ASCII art and diagram tools; Marketing and growth tools; Docs, slides and content tools | Open or run the tool against the current task. Record the produced result, API behavior, or focused evaluation. Reading the homepage alone does not count as use. |
| Inspect, license, or download an asset | Illustration and visual assets; Type foundries and directories; Free typefaces; Mockups, textures and patterns | Inspect the actual specimen or asset, verify usage and licensing constraints, then download or adopt it only when the task authorizes that change. Keep binaries in the repo's approved asset workflow. |
| Watch or listen | YouTube channels; Talks and individual videos; VPS and hosting videos | Watch or listen to the relevant item, or use a reliable transcript when media playback is unavailable. Extract the argument, demonstration, or comparison that matters to the task. |
| Work through an exercise | Courses and learning paths; Coding challenges and practice | Use the relevant lesson or exercise. Run the example or solve the focused problem instead of merely linking the course. |
| Deploy and evaluate | Self-hosted software | Inspect deployment requirements and run or deploy only when the task authorizes infrastructure changes. Otherwise produce a concrete evaluation. |
| Inspect the tastemaker's work | Developer profiles and socials | Read recent or task-relevant work and follow references to the actual artifact. Do not perform social actions without user authorization. |
| Load and follow the skill | Agent skills directories | If the skill is already available, read its `SKILL.md` fully and use it. If it is not installed, inspect it and follow the approved skill-install flow only when the task permits installation. |

Mixed categories still respect the per-link `kind`. A `video` in Audio, video and media uses watch or listen. A `demo` in WebGL uses Argent curation. A `library` in a design gallery uses search, inspect, and install.

Argent curation follows its existing safety contract. Check availability once, call `list-devices`, prefer a running Chromium target, use `open-url`, call `describe` before interactions, and use screenshots as visual evidence rather than navigation. If Argent is absent, follow the installed Argent fallback rule instead of pretending the source was inspected.

The existing `GROUP_USAGE` table already states how each group should be used. Export it and make the new resolver the executable form of that intent. A completeness test will fail if any wall category lacks an engagement strategy.

### Data shape

```ts
type DirectionId = `reg_${string}` | `insp_${string}`;

type CandidateRole =
  | "installable"
  | "library"
  | "tool"
  | "implementation"
  | "essay"
  | "case-study"
  | "portfolio"
  | "gallery"
  | "reference";

type RelevanceBand = "exact" | "direct" | "adjacent";

interface DiscoveryCandidate {
  id: DirectionId;
  source: "registry" | "wall";
  title: string;
  href: string;
  category: string;
  roles: readonly CandidateRole[];
  band: RelevanceBand;
  description?: string;
  matchedSignals: readonly string[];
  whySurfaced: string;
  engagement: {
    mode:
      | "inspect-install-run"
      | "search-source-catalog"
      | "load-skill"
      | "read-study"
      | "use-evaluate"
      | "curate-with-argent"
      | "inspect-asset"
      | "watch-listen"
      | "practice"
      | "deploy-evaluate"
      | "inspect-tastemaker";
    instruction: string;
    evidenceRequired: string;
    skill?: string;
  };
  install?: string;
}

interface DirectionDiscovery {
  task: string;
  exact: readonly DiscoveryCandidate[];
  candidates: readonly DiscoveryCandidate[];
  coverage: {
    categories: readonly string[];
    roles: readonly CandidateRole[];
    sources: readonly ("registry" | "wall")[];
  };
  budget: { scanLimit: number; studyAttempts: 3 };
  unmatched: readonly string[];
  protocol: readonly string[];
}
```

`whySurfaced` describes catalog evidence only, such as a matched `useFor` phrase, category, kind, stack, or query variant. It must never claim the live page was inspected.

The server stays stateless. Study notes and result comparisons belong to the agent task where the source is opened and the work is built.

An unavailable page consumes one of the three study attempts. A task may finish with zero successful studies and zero influences if all attempts fail. Any claimed influence requires a successful live inspection.

### Functions and ownership

```ts
// src/lib/inspiration-discover.ts
export function discoverInspiration(
  query: string,
  options?: { limit?: number; candidatePool?: number },
): WallDiscovery;

export function diversifyCandidates(
  ranked: readonly ScoredHit[],
  options: DiversityOptions,
): readonly DiscoveryCandidate[];

// src/lib/inspiration-engagement.ts
export function resolveEngagement(
  candidate: EngagementInput,
): DiscoveryCandidate["engagement"];

export function assertCategoryCoverage(
  groups: readonly InspirationGroup[],
): void;

// src/lib/direction-discover.ts
export function discoverDirection(
  input: { task: string; section?: RegistrySection; limit?: number },
): DirectionDiscovery;

export function directionDiscoveryToMarkdown(
  result: DirectionDiscovery,
): string;
```

The runtime path stays short:

```text
route or MCP
  -> discoverDirection
     -> unchanged exact direction
     -> discoverInspiration
        -> rankExpanded
```

## Agent-facing response

The scan should use three readable lanes derived from relevance and role:

- Use now for exact installables, libraries, and tools
- Study mechanics for direct case studies, essays, implementation examples, and strong references
- Broaden the frame for adjacent but still relevant work from different categories or roles

Every row also states the next action. Examples include `search this library's component catalog`, `load this skill`, `read this essay`, `run this tool`, and `curate this live reference with Argent`.

The response repeats the bounded contract because it is the instruction closest to the work:

```text
Scan all candidates. Inspect at most three live sources.
For each inspected source, name the mechanism, why it works here, and whether
you will adopt, adapt, or reject it. Apply chosen mechanisms, then compare the
result. Cite only actual influences. Catalog-only or inaccessible sources are
leads and cannot be claimed as influences.
```

## Distribution

Update every source agents actually load:

- Compronents MCP tool descriptions and README
- Compronents repo skill, template, `AGENTS.md`, and `CLAUDE.md`
- dotfiles source rules for Claude, Codex, and the compact Grok variant

Rebuild and install the dotfiles rules from their source. Do not hand-edit generated global files. Existing sessions may need a restart because rules and MCP descriptions load at session start.

## Test-first implementation

Add failing tests before behavior changes.

1. The broad developer-tool query returns 8 to 12 unique candidates when the pool supports it.
2. It covers at least three categories and three roles.
3. Category and host caps hold before documented relaxation.
4. Every candidate has positive retrieval evidence and a stable `reg_*` or `insp_*` id.
5. The result is deterministic for the same catalog and task.
6. Precise recent-import queries keep their current top results.
7. `directionLookup("animated footer")` keeps its structured result unchanged.
8. Generated response text requires discover, scan, inspect, explain why, apply, and compare.
9. Every distributed instruction copy contains the proactive stop condition, the three-attempt limit, and the catalog-evidence rule.
10. No route or instruction tells agents to fetch `llms-full.txt` or inspect the whole scan.
11. All 51 wall categories and the registry resolve to one engagement strategy.
12. Explicit `kind` values override category defaults for skills, libraries, tools, essays, videos, demos, assets, courses, portfolios, and galleries.
13. A component-library candidate instructs the agent to search inside the source and inspect a concrete component before installation.
14. A skill candidate instructs the agent to load and follow its `SKILL.md`.
15. A creative-reference candidate names `argent-device-interact`, live interaction, and visual evidence.

Static tests can prevent contract drift. After installing the rules, run fresh-session smoke checks for Claude and Codex if their local CLIs expose tool calls clearly. Report Grok behavior as unverified if its CLI cannot provide equivalent evidence.

## Files to touch

### Compronents behavior

- `src/lib/inspiration-discover.ts`, new
- `src/lib/direction-discover.ts`, new
- `src/lib/inspiration-engagement.ts`, new
- `src/app/direction/discover/route.ts`, new
- `mcp/blank-direction/server.mjs`
- `src/app/direction/route.ts`
- `src/app/inspiration/recommend/route.ts`

### Compronents tests and instructions

- `tests/inspiration-discover.test.mjs`, new
- `tests/direction-discover.test.mjs`, new
- `tests/inspiration-engagement.test.mjs`, new category and kind coverage
- `tests/direction-regression.test.mjs`
- `package.json`
- `mcp/blank-direction/README.md`
- `templates/blank-direction/AGENTS.snippet.md`
- `.agents/skills/blank-direction/SKILL.md`
- `AGENTS.md`
- `CLAUDE.md`

Before adding the Next.js route, read the installed Next.js 16 route-handler guide and fetch current official Next.js documentation through Context7 as required by this repo.

### Dotfiles source and generated outputs

- `/Users/blank/dotfiles/skills/rules/core/direction-first.md`
- `/Users/blank/dotfiles/skills/rules/core/direction-first.grok.md`
- generated files under `/Users/blank/dotfiles/skills/build/`
- installed Claude, Codex, and Grok rules produced by `bin/install`

## Validation

- focused discovery and direction tests
- full inspiration and direction test set
- scoped Biome checks for changed Compronents files
- `git diff --check` in both repositories
- dotfiles `bin/build`, `bin/install`, and `bin/check`
- local calls for the two red production queries
- fresh-session agent smoke checks where observable

Production remains unchanged until a later push.

## Synthesis decision

Three independent architecture sketches converged on the separate preflight shape. Candidate 1 is the base because it had the smallest module boundary and clearest deterministic selector. Candidate 2 contributed the study-attempt budget and the rule that access failures consume it. Candidate 3 contributed the explicit exact lane, positive-evidence requirement, and strict separation between catalog evidence and live observations.

Rejected additions include cursor pagination, task session ids, server-side study state, source crawling, embeddings, random serendipity, and a persistent taste profile. They add machinery before the exposure and application loop works.

## Not in scope

- retagging all 1,308 links
- redesigning the human inspiration page
- persistent taste history or identity-bearing telemetry
- source fetching on the server
- committing, pushing, or deploying either repository
