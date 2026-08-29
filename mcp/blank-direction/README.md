# blank-direction MCP

Makes BLANK useful during the work, not just at recommendation time.

## Tools

| Tool | Purpose |
|------|---------|
| `direction_discover` | Proactive 8 to 12 candidate scan before planning |
| `direction_lookup` | Strict registry plus wall lookup for a known need |
| `inspiration_recommend` | Wall-only shortlist |
| `registry_search` | Installables only |

## Install (Claude Code)

From this repo:

```bash
claude mcp add blank-direction -- node "$(pwd)/mcp/blank-direction/server.mjs"
```

Or use the absolute path:

```bash
claude mcp add blank-direction -- node /Users/blank/Desktop/CREATE/compronents/mcp/blank-direction/server.mjs
```

Point at the named local host while developing:

```bash
BLANK_DIRECTION_URL=https://compronents.localhost claude mcp add blank-direction -- node /absolute/path/to/server.mjs
```

## Working protocol

Before an agent plans open-ended UI or frontend work, it calls
`direction_discover`. It scans the candidates, inspects at most 3, records the
mechanism and why it fits, then tells the agent what to apply and compare.

The response tells the agent how to engage with each source. Component
libraries should be searched for the concrete component. Skills should load
their `SKILL.md`. Tools should be run or evaluated. Essays should be read.
Creative references should be curated in an Argent Chromium session.

Failed access consumes one of the 3 inspection attempts. If no source is
successfully inspected, the agent must report zero influences.

Use `direction_lookup` when the need is already fixed. Cite only sources that
changed the work:

```
From registry: Title (reg_name)
From wall: Title (insp_slug): why
outside-second-brain: Name: why it was needed
```
