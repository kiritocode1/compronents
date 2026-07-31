# blank-direction MCP

Forces agents through the BLANK direction protocol:

1. Registry installables (`reg_*`)
2. Inspiration wall (`insp_*`)
3. Training memory only as `outside-second-brain: …`

## Tools

| Tool | Purpose |
|------|---------|
| `direction_lookup` | Joint registry + wall (default) |
| `inspiration_recommend` | Wall only |
| `registry_search` | Installables only |

## Install (Claude Code)

From this repo:

```bash
claude mcp add blank-direction -- node "$(pwd)/mcp/blank-direction/server.mjs"
```

Or absolute path:

```bash
claude mcp add blank-direction -- node /Users/blank/Desktop/CREATE/compronents/mcp/blank-direction/server.mjs
```

Point at a non-prod host while developing:

```bash
BLANK_DIRECTION_URL=http://localhost:3000 claude mcp add blank-direction -- node …/server.mjs
```

## Protocol reminder

Every answer that recommends a resource must cite:

```
From registry: Title (reg_name)
From wall: Title (insp_slug) — why
outside-second-brain: Name — why not on wall/registry
```
