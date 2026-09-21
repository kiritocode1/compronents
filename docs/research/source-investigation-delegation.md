# Source investigation and research delegation

Research date: 2026-09-22. This note proposes a workflow; it does not change production behavior.

## Finding

Parallel workers can investigate independent questions while keeping their full source context separate. They do not automatically investigate sources deeply. Depth comes from a concrete question, permission to follow useful links, a required evidence record, and a lead agent that rejects unsupported findings.

For BLANK, assign workers decisions to investigate, not lists of resources to summarize. "Determine how this section should communicate comparison" is a useful task. "Research Pinterest" is insufficient.

## Primary sources inspected

1. [Anthropic, How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system), published 2025-06-13. Read the full article, including evaluation, reliability and appendix sections.
2. [Official research lead prompt](https://github.com/anthropics/anthropic-cookbook/blob/daac2acb91544767804e42cf720df07c232fd5b6/patterns/agents/prompts/research_lead_agent.md). Read the full file at this pinned revision.
3. [Official research worker prompt](https://github.com/anthropics/anthropic-cookbook/blob/daac2acb91544767804e42cf720df07c232fd5b6/patterns/agents/prompts/research_subagent.md). Read the full file at the same revision.

The engineering article links to an official Cookbook page. I located and read the concrete prompt files in the official repository rather than treating the article's summary as sufficient evidence. An attempted fetch of the article's linked OpenAI BrowseComp page failed, so no claims here rely on that page.

## What the sources support

| Observation | Evidence | Implication for BLANK |
| --- | --- | --- |
| Independent research is a good candidate for parallel workers. | The article says its system excels "especially for breadth-first queries that involve pursuing multiple independent directions simultaneously." | Split visual composition, component implementation and relevant technical constraints only when each can produce useful independent findings. |
| Delegation needs more than a topic. | The article requires "an objective, an output format, guidance on the tools and sources to use, and clear task boundaries." Its early vague tasks caused duplicate searches and missing coverage. | Every worker gets a question, task context, exclusions, expected evidence, available tools and budget. |
| Search snippets are insufficient. | The worker prompt says to "use web_fetch to get the complete contents" when following search results or when more detail is helpful. It explicitly ends by requiring full results rather than snippets. | Search inside a resource and read the relevant child page, chapter, source file or example. A landing page is a starting point. |
| Research should respond to findings. | The worker prompt cycles through gathered evidence, remaining gaps, tool choice and action. It prohibits repeating the same unsuccessful query and requires reporting unresolved conflicts. | Follow links because they can resolve a specific uncertainty. Do not mechanically crawl every link or repeat retrieval until the budget expires. |
| Cost needs a task-specific limit. | Anthropic reports about 15 times chat token consumption for multi-agent systems and about 4 times chat consumption for agents. | These are vendor workload observations, not a promise about BLANK or a comparison of equivalent single-agent and multi-agent research. Measure our own cost and benefit. |
| Citations need their own check. | The article describes a CitationAgent that checks specific source locations after synthesis. Its evaluation rubric separates factual accuracy and citation accuracy. | The lead must verify that the cited passage supports the applied claim. A valid URL alone is inadequate. A separate agent is optional for a small task. |
| Evidence should survive summarization. | The appendix recommends persistent worker artifacts and lightweight references to reduce the "game of telephone." | Keep exact URLs, excerpt locations, screenshots or experiment output in worker artifacts; return a short decision summary with references. |
| Outcome evaluation matters more than a prescribed path. | The article says two valid investigations can use different searches and numbers of sources. Its rubric includes accuracy, completeness, source quality and tool efficiency. | Do not grade depth by link count, number of workers, tokens or calls alone. Check whether the investigation resolved a decision and whether that result is supported. |

Anthropic reports a 90.2% improvement over single-agent Opus 4 on its internal research evaluation and up to 90% lower research time after parallelization. These are vendor-reported results on its system, not independently reproduced findings or predictions for our UI tasks. More agents also used more tokens, so this does not isolate delegation as the cause of the quality gain.

## Parts not to copy

The public prompts contain useful mechanisms but inconsistent budgets. The worker prompt recommends under five calls for a simple task, later requires a minimum of five, also says to avoid more than ten, allows fifteen in another paragraph, then sets an absolute limit of twenty. The lead prompt mandates at least one worker even for simple tasks and defaults to three for most requests.

These instructions should not become our policy. Fixed minimum calls reward activity; mandatory workers add overhead. Use one clear budget and an evidence-based finish condition. The sample lead prompt also assumes a separate citation agent and therefore omits citations from its output. Copying that behavior without the citation stage would remove attribution entirely.

The article's warnings are concrete: fifty workers for a simple question, endless searches for nonexistent sources, excessive coordination messages, duplicate work and a whole batch waiting on one slow worker. More delegation needs tighter scope and inspectable outputs.

## Proposed bounded workflow

1. **Name the decision.** Record the user scenario, constraints and unknowns. Use BLANK discovery to obtain starting sources. The lead reads the current product and owns the final decision.
2. **Choose independent questions.** A narrow task stays with one agent. For an open section design, use up to three workers only when distinct questions exist. A worker can study visual references, another can inspect candidate implementations, and another can investigate a substantive accessibility or backend constraint. Do not invent the third question to fill a slot.
3. **Investigate within each source.** A worker follows the resource's own catalog, search, table of contents, examples and outbound originals. It examines specific artifacts. It can replace an inaccessible lead while recording the failed access. Read-only investigation is allowed; installation, publication and live data changes retain their existing authorization rules.
4. **Return evidence and application.** The worker states what the source actually demonstrates, the mechanism, relevant constraints, how it could change this task, and what remains unverified. A tool recommendation requires a relevant trial where practical. A backend pattern requires a concrete scenario and failure case. A visual claim requires inspecting the visual.
5. **Synthesize and challenge.** The lead compares findings, checks support for consequential claims and selects adopt, adapt or reject. It requests a focused follow-up only for an unresolved decision that matters. Dependent work stays sequential: select a promising pattern before spending time testing its implementation.
6. **Demonstrate and finish.** Applied findings become a proposed preview, code experiment or explanation appropriate to the request. If implementation is requested, its existing review and verification rules still apply. Finish when material decisions have supporting evidence, consequential contradictions are resolved or disclosed, and another source is unlikely to change the choice.

For an initial trial, give each worker a first-pass budget of roughly 6 to 10 source/tool actions and at most one lead-authorized follow-up. This is a proposed operational budget, not a research result. Stop earlier when evidence is sufficient. If access failures consume the budget, return the unresolved question and attempted paths; never reclassify it as researched.

## Worker task and result contract

```text
Question: the specific decision this investigation must inform
Context: user scenario, current product, constraints
Starting sources: BLANK results and why each might help
Boundaries: what other workers own, excluded changes
Required work: appropriate internal search, chapter/example reading or trial
Budget: one explicit first-pass limit; follow-up requires a named evidence gap
Output:
  - question answered or unresolved
  - exact source/artifact URL and relevant section or file
  - short supporting excerpt or observable result
  - mechanism learned
  - applicability and incompatibilities for this task
  - proposed decision, with a concrete example
  - verification performed and remaining uncertainty
```

Do not label a source "used" merely because it was opened. Keep these states separate: discovered, inspected, tested where relevant, selected, applied and verified. A worker can correctly reject a source without applying it.

## How to test this proposal

Run the current workflow and this workflow on the same small set of real tasks. Include a section design requiring gallery research, a component choice requiring source inspection, a backend pattern requiring chapter-level reading, an inaccessible source, and a narrow edit where no delegation is warranted.

Compare supported decisions, actual depth within resources, appropriate source use, duplication, unresolved gaps, elapsed time and token cost. Have a human judge whether the output materially helps the task. Audit a sample of evidence records against the original sources. A longer report or a larger source list is not evidence of improvement.
