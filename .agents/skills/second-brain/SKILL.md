---
name: second-brain
description: >
  Alias for blank-direction: discover across the BLANK registry and inspiration
  wall before planning choice-bearing work. Prefer the blank-direction skill.
  Use for second brain / inspiration / UI resource recommendations.
---

# Second brain to blank-direction

This skill is an **alias**. Follow the full protocol in **blank-direction**.

Discovery runs before planning, not after the plan is decided:

```bash
curl -s "https://ui.aryank.space/direction/discover?q=<task+and+constraints>"
```

Or MCP tool `direction_discover`. Scan the 8 to 12 candidates, inspect at most
3, name the mechanism and whether to adopt, adapt, or reject each one, apply the
useful parts, then compare the result against the source.

Once the need is concrete:

```bash
curl -s "https://ui.aryank.space/direction?q=<known+need>"
```

Cite only sources that changed the work:

```
From registry: <Title> (reg_<name>)
From wall: <Title> (insp_<slug>): <why>
outside-second-brain: <name>: <why it was needed>
```

See `.agents/skills/blank-direction/SKILL.md` for the full contract, including
how to engage with each candidate kind.
