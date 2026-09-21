# Source investigation worker trial

Research date: 2026-09-22

Question: What concrete limitations should a lead agent account for when delegating source investigation to cheaper models? The focus is when multi-agent work helps or hurts, especially task decomposability, coordination errors, and verification. This note is research only. It does not change production behavior.

## Evidence record

| Field | Record |
| --- | --- |
| Parent source | [Google Research blog](https://research.google/blog/) |
| Specific child source | [Towards a Science of Scaling Agent Systems: When and why agent systems work](https://research.google/blog/towards-a-science-of-scaling-agent-systems-when-and-why-agent-systems-work/) |
| Primary paper | [arXiv HTML, version 3](https://arxiv.org/html/2512.08296v3), revised 2026-04-08 |
| What I read | The Google Research blog post; the paper abstract; Sections 1, 3, 4.1 to 4.5, 5 and 6; Table 5; Table 14; Appendix B; Appendix C; Appendix D; Appendix E. I also read the paper's definitions of task-level and trace-level error amplification. |
| Finding | Multi-agent coordination helps when subtasks can be independently explored and their outputs can be checked. It adds cost and can reduce success when later steps depend on earlier state, when tool orchestration is dense, or when the worker outputs are not independently verified. Cheaper workers therefore need bounded, decomposable assignments and a lead or validator that checks the source and the claim. |
| Uncertainty | The paper does not test a general "cheap model" delegation policy. Its heterogeneity experiment is preliminary, uses 13 BrowseComp-Plus configurations, and mainly mixes model capability levels within or across families. The paper also warns that several regression predictors lose significance under cluster-robust inference. |
| Workflow change | Delegate only a named, independent evidence question. Require the exact source location and a short supporting passage or observed result. Keep synthesis and consequential claims with a verifier. Compare fanout against a strong single investigator instead of assuming that more workers or cheaper workers improve quality. |

## What the paper actually shows

The paper's abstract reports 260 controlled configurations across six agentic benchmarks, five architectures and three LLM families. It reports relative performance from `+80.8%` on decomposable financial reasoning to `-70.0%` on sequential planning. In Section 4.2, the authors explain the mechanism: Finance Agent has natural independent streams such as revenue, costs and market factors, while PlanCraft requires ordered constraint satisfaction. Artificially splitting a sequential task creates messages and consumes reasoning budget.

The paper's task definition in Section 3.2 is useful for triage. Agentic tasks involve sustained interaction, partial observability and adaptive strategy changes. Section 3.2 also defines sequential interdependence: later actions depend on earlier observations. A source investigation that asks several workers to inspect genuinely separate sources is closer to the decomposable case. A worker that must maintain one evolving argument across a chain of dependent sources is closer to the sequential case and is a poor fanout candidate.

Table 5 gives the cross-configuration means:

| Architecture | Success rate | Turns | Coordination overhead | Trace-level error amplification | Success per 1K tokens |
| --- | ---: | ---: | ---: | ---: | ---: |
| Single agent | 0.466 | 7.2 | 0% | 1.0 | 67.7 |
| Independent | 0.370 | 11.4 | 58% | 17.2 | 42.4 |
| Decentralized | 0.477 | 26.1 | 263% | 7.8 | 23.9 |
| Centralized | 0.463 | 27.7 | 285% | 4.4 | 21.5 |
| Hybrid | 0.452 | 44.3 | 515% | 5.1 | 13.6 |

These are aggregate results across the study, not a prescription for every task. They show the cost of coordination clearly. Hybrid used 6.2 times as many turns as the single-agent baseline. The paper says in Section 4.4 that, under fixed total reasoning-token budgets, per-agent reasoning becomes thin beyond roughly three to four agents.

Verification is the key difference between independent and supervised coordination. Section 4.4 reports that centralized and hybrid systems used an orchestrator to cross-check outputs before aggregation, while decentralized systems used challenge and response rounds. Those systems achieved a reported 22.7% average reduction in factual error. Independent systems had no correction mechanism and showed a reported 4.6% error amplification at the task-level metric.

The paper explicitly distinguishes this task-level result from the often-quoted `17.2x` and `4.4x` values. In Section 3.1, `A_e^task` is the ratio of MAS to SAS task error rates. `A_e^trace` measures extra computational work caused by coordination failures using execution-trace token analysis. Thus `17.2x` for Independent and `4.4x` for Centralized are trace-level error amplification values, not a claim that task failure probability is 17.2 times higher. A lead must preserve this distinction when summarizing the evidence.

Section 4.4 also gives a useful verification signal. Successful runs had lower contradictory token mass, a median of 2.3% versus 8.1% in failures. High redundancy was harmful when it became excessive: redundancy above 0.50 correlated negatively with success (`r = -0.136`, `p = 0.004`). Agreement between workers is therefore not enough. The lead should check whether workers added independently supported information and whether contradictions were resolved.

## Limits relevant to cheaper delegated workers

The paper does not establish that a cheaper model is equivalent to a stronger model for source investigation. Appendix E.2 permits heterogeneous model assignments, but Section 5(ii) says the tested agents otherwise shared identical base architectures and differed mainly in scale and role prompts. In a preliminary set of 13 heterogeneous BrowseComp-Plus configurations, centralized heterogeneous teams underperformed strong homogeneous teams by a mean of 12.6 percentage points. Decentralized teams gained 2.0 percentage points, which the authors say was largely attributable to the stronger constituent model. This is too small and narrow to support a universal model-tier rule, but it is enough to reject the assumption that cheap workers preserve strong-worker quality automatically.

The paper's main results also do not isolate source quality or research depth. A cheap worker can be useful for a narrow retrieval task, but the experiment does not show that it will find the same primary source, recognize a source conflict, or interpret a table correctly. Those are separate verification requirements for our workflow.

The regression is not a dependable universal router. The abstract reports architecture selection for 87% of held-out configurations, but Section 5(vii) says the model clusters observations at only six dataset levels. Several predictors that appear significant under naive OLS lose significance under cluster-robust inference. Table 14 reports, for example, `log_tools` changing from `p < 0.001` to `p = 0.172`, and `efficiency × tools` changing from `p = 0.002` to `p = 0.205`. The authors frame dataset-level predictors as descriptive directional patterns, not confirmed general laws. Use task structure as a reason to test a delegation design, not as a hard-coded guarantee.

The benchmark coverage is limited. The paper uses 50 to 100 instances for four benchmarks but only 20-instance subsets for SWE-bench Verified and Terminal-Bench. Section 5(v) says the typical bootstrap confidence intervals are about plus or minus 20 percentage points per cell for the smaller evaluations. Prompts were held constant for experimental control rather than optimized for each model or family. The paper also does not cover embodied agents, multi-user interaction or long-horizon temporal dependencies. Any worker policy for BLANK should therefore be measured on our source tasks rather than copied from the paper's thresholds.

The paper reports cost tradeoffs, not a reason to maximize delegation. Section 4.4 reports 67.7 successes per 1,000 tokens for SAS versus 21.5 for Centralized and 13.6 for Hybrid. Communication grows superlinearly with agent count in the paper's fitted analysis, and the authors project roughly 69 turns at six agents and 157 at ten agents from a 7.2-turn SAS baseline. These numbers are an argument for a small bounded fanout with an early stopping rule.

## Recommendations for the lead workflow

1. Classify the question before delegating. Fan out only when the evidence paths are independent, the source outputs have a clear merge format, and another worker can check the result. Keep one investigator on a shared evolving argument or a source chain with sequential dependencies.
2. Give cheaper workers narrow assignments such as "locate the original paper and report Section 4.2's result," not "research multi-agent systems." Require an exact URL, version, section or table, a short quote or measured observation, and an uncertainty statement.
3. Put synthesis and claim verification with a lead or stronger validator. The validator should open the cited source, check that the passage supports the precise claim, and distinguish task-level outcomes from trace, token or cost metrics.
4. Treat agreement as a prompt for checking, not corroboration. Workers that read the same source are one evidence path. Require distinct primary sources before calling evidence independent.
5. Stop when the decision is supported. Do not use fixed minimum call counts. More workers increase communication and can reduce the reasoning budget available to each worker.
6. Measure the workflow against a single strong investigator on repeated, clean tasks. Record supported claims, unsupported claims, unique primary evidence, time, tokens and cost. Include a blocked-source case and a sequential source-chain case. The paper supports bounded experimentation, not universal delegation equivalence.

## Source navigation and discrepancy

The Google Research blog post was the parent source requested for discovery. Its "Paper" link resolved to arXiv:2512.08296. The blog text says "180 agent configurations," four benchmarks, and `R^2 = 0.513`; arXiv version 3 says 260 configurations, six benchmarks, and cross-validated `R^2 = 0.373` or `0.413` with the task-grounded capability metric. I used the versioned paper for the findings above and did not merge the blog's earlier figures into the evidence. The mismatch may reflect a revised study, but I did not find an explicit explanation for the change.

No source was blocked. The Google Research page, RSS listing, blog post, arXiv HTML, and PDF were reachable. The PDF was used as a backup download; the section and table reading above came from the versioned arXiv HTML so that section locators could be checked.
