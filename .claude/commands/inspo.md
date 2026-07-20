---
description: Add pasted links to the inspiration registry with accurate descriptions
argument-hint: <url> [url...]
allowed-tools: Read, Edit, Bash, WebFetch, WebSearch
---

Add each URL in `$ARGUMENTS` to the inspiration registry at
`src/lib/inspiration.ts`. If `$ARGUMENTS` is empty, use the URLs the user pasted
most recently in this conversation.

Repo: `/Users/blank/Desktop/CREATE/compronents`. Read `AGENTS.md` conventions:
never use em dashes, never surface another studio's internal name, real specific
copy only.

For each URL:

1. **Dedupe.** `grep -n "<href>" src/lib/inspiration.ts`. Also grep the bare
   domain, since the same site may already be in under a different path. If it
   is already there, say so and skip it. Do not add a second entry.

2. **Read the page.** WebFetch it. Ask for: what the thing actually is, who made
   it, and the concrete specifics on the page (counts, versions, dates, named
   features, notable examples, pricing, license). If the fetch is thin or the
   page is JS-only, WebSearch the name once for the missing facts. Never write a
   description from the URL alone or from training-data memory of the site.

3. **Write the description.** Match the existing entries: two to four sentences,
   no marketing voice. First sentence says what it is and what you would use it
   for. The rest carries specifics you actually found on the page, the details
   that make the entry useful to skim: who built it, how many items, what is
   notable or unusual about it. If the fetch attributed the page to someone,
   sanity-check the attribution against the domain before repeating it. Prefer
   "unknown" over a confident guess: drop the claim rather than invent one.

4. **Pick the group.** Read the group titles in `src/lib/inspiration.ts`
   (`grep -n '^    title: "' src/lib/inspiration.ts`) and the `GROUP_USAGE` note
   at the top of the file, and choose the one whose usage note describes how
   someone would actually use this link. Do not create a new group; if nothing
   fits, ask the user before adding one.

5. **Insert at the top** of that group's `links` array, in the existing shape:

   ```ts
   {
     title: "Name",
     href: "https://example.com/",
     dateAdded: "YYYY-MM-DD",
     description:
       "...",
   },
   ```

   `title` is the site or project's own name, not a slogan. `dateAdded` is
   today's date. Keep the trailing slash and any query string exactly as the
   user pasted, unless it is a tracking-only param you can drop cleanly.

After all URLs are in: run `pnpm biome check --write src/lib/inspiration.ts`
(fall back to `npx biome check --write` if pnpm is unhappy), then
`git add src/lib/inspiration.ts && git commit` with the message
`feat: add <Name>, <Name> inspirations`. Do not push unless asked.

Report one line per link: name, group it landed in, or "already present".
