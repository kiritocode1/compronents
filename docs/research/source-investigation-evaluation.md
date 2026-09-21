# Evaluating source investigation and application

Research checked on 2026-09-22. This note proposes evaluation methods; it does not report an implemented or measured BLANK change. Production code was not changed. The main investigation owns the current implementation audit.

## Finding

Evaluate what the agent learned, whether the cited material supports it, and what decision or tested artifact followed. Link counts, tool counts, elapsed time and agent counts cannot establish research quality. A trace can prove that a page was opened. It cannot by itself prove understanding or useful application.

Use outcome checks together with a source record. Do not require one exact browsing sequence. A book chapter retrieved directly and the same chapter found through the contents page are both valid. Conversely, a perfectly formatted citation does not excuse an unsupported claim.

## Primary sources and checked claims

### 1. Anthropic, How we built our multi-agent research system

Published June 13, 2025. Read the article, including its evaluation and appendix sections.

URL: https://www.anthropic.com/engineering/multi-agent-research-system

Checked findings:

- The production approach uses a lead researcher to delegate distinct investigations, synthesize their findings and decide whether another investigation is needed. Workers adapt their searches after observing results. This is an iterative process, not one retrieval call followed by a report.
- Delegation needs an objective, output format, tool/source guidance and clear boundaries. Vague delegation caused duplicate searches and gaps.
- The evaluation rubric covers factual accuracy, citation accuracy, completeness, source quality and tool efficiency. Human review found a preference for highly ranked content farms that automated evaluation had missed.
- The authors started with about 20 realistic queries. They explicitly warn against grading a single prescribed path because different valid investigations can use different tools and source counts.
- Their appendix recommends having workers write durable artifacts and return references, reducing information loss from repeated summarization through a coordinator.
- They report approximately 15 times chat token use for multi-agent systems in their own data. They identify breadth-first research with independent directions as a good fit; shared-context tasks with many dependencies are a weaker fit.

Limitations:

- This is a first-party production report, not a controlled benchmark proving that this architecture will improve BLANK. Its reported 90.2% gain is on an internal research evaluation. The gain and token ratios are not forecasts for our workload.
- A correlation between token usage and performance does not justify making agents perform more calls. The task can simply need more work, or difficult tasks can cause both more tokens and different scores.

Application proposed for BLANK: delegate questions with independent evidence needs. Require a source-backed finding, decision and artifact reference from each worker. Have the lead assess the actual source support before adopting the worker's recommendation.

### 2. Anthropic, Demystifying evals for AI agents

Published January 9, 2026. Read the research-agent, non-determinism, grading and evaluation-design sections.

URL: https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents

Checked findings:

- The article distinguishes the transcript from the outcome. An agent saying that it completed an action is different from verifying the resulting state.
- Research evaluation combines groundedness, coverage and source quality. Model-based assessment needs calibration against human judgment.
- Deterministic checks work well for concrete conditions; model graders support open-ended assessment. Judges should be able to return Unknown when evidence is missing.
- Requiring an exact tool sequence creates brittle evaluation because agents can find valid alternatives. Read traces to diagnose failure, but principally grade the produced result.
- Balanced evaluation must include cases where a behavior should not occur. Only rewarding research will teach excessive research on trivial tasks.
- Repeated trials matter. One successful run and consistent success are different properties. Clean environments prevent earlier trial artifacts and shared infrastructure from distorting results.

Limitations:

- These are engineering recommendations and examples. They do not validate any specific BLANK rubric or numerical pass threshold.
- “Grounded” is relative to the supplied material. A weak or incorrect source can still support an incorrect claim. Source quality remains a separate judgment.

Application proposed for BLANK: grade source support and decision usefulness separately; add small no-research controls and blocked-source cases; compare repeated runs from clean task state.

### 3. Gao et al., Enabling Large Language Models to Generate Text with Citations, ALCE

Version read: arXiv 2305.14627v2. Read sections 3.2 to 3.4, the post-hoc citation results, section 6, the limitations and relevant evaluation appendices.

URL: https://arxiv.org/html/2305.14627v2

Checked findings:

- ALCE separates fluency, correctness and citation quality. Citation recall measures whether cited passages support each statement. Citation precision detects irrelevant citations.
- The paper tests shortcuts. Copying a retrieved passage and citing itself can achieve strong citation scores while failing usefulness or coverage. A support metric alone is insufficient.
- Generating an answer from the model and attaching citations afterwards produced comparatively poor citation support. Correct-looking answers and plausible citations are distinct from answers grounded in the material inspected.
- Human evaluation separately checks utility, whether all cited passages support the sentence, and whether a particular citation fully supports, partly supports or does not support the sentence.
- Automatic support grading is imperfect. The paper reports 85.1% accuracy for citation recall and 77.6% for citation precision against its human annotations. Its inference model struggles with partial support.

Limitations:

- This 2023 benchmark studies text answers and then-current models. Its scores are not measurements of current agents.
- It does not evaluate visual design quality, code adoption, real tool execution or source influence on a decision. Those need additional checks.
- A citation showing an author advocates a method supports the attribution. It does not prove that the method works in our environment.

Application proposed for BLANK: assess important claims against exact excerpts or observed behavior. Distinguish source support, task relevance and actual application. Reject citation decoration even when the response sounds plausible.

### 4. Kim et al., Towards a Science of Scaling Agent Systems

Version read: arXiv 2512.08296v3, revised April 8, 2026. Read the abstract, setup, metric definitions, analysis of errors, limitations and evaluation appendix.

URL: https://arxiv.org/html/2512.08296v3

Checked findings:

- The study compares 260 configurations across six benchmarks, five coordination architectures and three model families. It controls task prompts, tool interfaces and compute while varying coordination and model capability.
- The reported benefit depends on task structure. Decomposable financial analysis benefits under some architectures; sequential planning loses performance. Fanout is not a universal improvement.
- The paper distinguishes task-level failure rate from trace-level error amplification, which measures extra computation caused by coordination failures. Its often-quoted 17.2 and 4.4 multipliers are trace-level values, not task failure multipliers.
- Version 3 says the error-amplification predictor is not independently statistically significant after the other coordination metrics are included. The discussion cautions against interpreting all descriptive relationships as confirmed general laws.
- Mixing model families did not automatically improve performance in the exploratory heterogeneity tests. Different agents are not evidence of independent reasoning or independent sources.

Limitations:

- Coding and terminal benchmarks use 20-instance subsets with wide per-cell confidence intervals. Architecture-specific prompts were not optimized.
- Absolute cross-domain prediction is limited. The reported 87% architecture-selection figure concerns held-out configurations and must not be treated as a universal prediction guarantee.
- This does not measure BLANK research tasks. Its numeric thresholds are not appropriate hard-coded delegation rules for us.

Application proposed for BLANK: test bounded fanout against a strong single investigator. Keep a lead responsible for verification. Do not count workers agreeing about the same source as corroboration. Record primary-source provenance, since several websites can repeat the same original claim.

## Proposed minimum evidence record

Use one compact record per consequential finding, not a diary of every click:

| Field | Required information |
| --- | --- |
| Question | The unresolved task decision this investigation addresses |
| Source | Exact URL plus page section, repository revision or artifact identifier where available |
| Observation | Short excerpt, inspected implementation detail, visible behavior or command result |
| Interpretation | What the observation supports and what it does not establish |
| Decision | Adopt, adapt, reject or unresolved, with the relevant task constraint |
| Application | The proposed choice, isolated experiment or resulting artifact this evidence changed |
| Validation | Whether only the source was read, a demo was operated, or the proposed use was actually tested |

A rejected candidate is useful research when the rejection removes a plausible option for a source-backed reason. Do not force artificial adoption. For a research-only request, a supported decision or small authorized experiment is enough; production edits are not a completion requirement.

## Proposed small evaluation set

Start with these eight cases. They test mechanisms, not arbitrary minimum call counts. Pin reference material for repeatability, then separately sample live sources for access and drift failures.

| Case | What the task asks | What passes | Shallow behavior that fails |
| --- | --- | --- | --- |
| UI library | Choose a command menu for an existing app with keyboard navigation and a specific data-loading constraint | Inspect concrete component documentation and implementation; explain the relevant state or accessibility mechanism; verify a small example where feasible; identify a real constraint or tradeoff | Cite the library homepage and claim accessibility because its marketing says so |
| Visual collection | Propose a layout for a section using a collection such as Are.na | Inspect individual works; follow originals where available; compare concrete hierarchy, density or interaction choices; produce an annotated proposal tied to those observations | Link a board and invent a stylistic description without seeing the examples |
| Backend book | Select a pattern for an operation that can be delivered twice | Read the relevant chapter or section; state the failure sequence, assumptions and guarantee; map it to the task; use a small example or falsifying case | Recommend the book or repeat a familiar pattern name without tracing duplicate delivery |
| Tool use | Evaluate an available tool on a small authorized fixture | Inspect usage; run the relevant command; inspect the actual artifact or output; explain whether it addresses the task and identify one material limit | Recommend installation or write an imagined usage example without running it |
| Source contradiction | Compare two plausible sources with conflicting prerequisites | Notice the disagreement, trace versions or assumptions and either resolve it or mark the decision unresolved | Merge incompatible advice into a confident recommendation |
| Access failure | The strongest candidate is inaccessible, but an alternative is available | Record the failed access, try a suitable alternative and clearly label evidence limits | Treat the search snippet as full inspection or claim an inaccessible page was read |
| No-research control | Adjust an existing component's spacing without changing its design | Make or explain the narrow change without discovery or a research team | Spawn researchers and propose a new library |
| Fanout overlap | Compare two implementation approaches whose sources repeat the same original benchmark | Give workers distinct questions, retain original provenance and verify the decision-bearing claim centrally | Count three copied claims or three agreeing agents as independent confirmation |

The examples define proposed test scenarios. They are not reports that these sources were investigated in this run.

## How to grade and compare

Use three layers:

1. Mechanical evidence checks. Referenced artifacts exist; a claimed command appears in recorded tool results; the source locator and quoted passage can be checked; the proposed artifact is inspectable. These checks prove access and action, not usefulness.
2. Source-support and task-fit review. For each important claim, judge supported, partial, contradicted or unknown. Check whether the proposal respects the task constraints and follows from the evidence. Keep inferred benefits distinct from observed behavior.
3. Outcome review. For code or tools, run the relevant small scenario. For a visual proposal, inspect the actual proposal against the brief and observed references. For reading research, verify that it resolves the stated decision or clearly identifies the missing evidence.

Treat fabricated inspection, invented command results or a consequential unsupported claim as a failure. Do not let strong prose average away those defects. Do not fail an honest blocked outcome merely because the source became unavailable; score recovery and transparency separately from resolved decisions.

Compare three conditions before claiming improvement:

- Current discovery workflow.
- One investigator with the explicit evidence and completion requirements above.
- A lead plus two bounded investigators with the same requirements and independent responsibilities.

Run each of the eight cases three times per condition as an initial diagnostic, 72 trials total. This is a proposed experiment, not a statistically powered benchmark. Match total allowed model budget when testing the value of coordination itself; separately compare latency at comparable quality if speed is the goal. Keep model, tool access and source snapshots fixed. A prompt-and-tools improvement and a larger compute budget are different causes.

Record task completion, important unsupported claims, useful adoption or rejection, unique primary evidence, time, total tokens and cost per successful task. Raw calls and source counts remain diagnostic metrics. Blindly compare outputs where possible and calibrate model graders on human-reviewed examples.

Include a source-change check in pinned fixtures. Change one relevant requirement or implementation fact and verify that the decision changes appropriately. This gives stronger evidence of source use than a citation alone. It still cannot prove an internal causal reasoning process, and the changed fact must genuinely affect the task.

## Recommendation to the main investigation

First make “investigated” and “used” reviewable with concrete observations and task decisions. Then test whether a small team improves coverage or latency beyond that stronger single-agent baseline. Otherwise, fanout can produce several shallow reports instead of one.

The sources support bounded independent investigation, central verification, mixed outcome and evidence checks, and repeated comparison against realistic tasks. They do not establish a universal minimum number of sources, clicks, tokens or agents.
