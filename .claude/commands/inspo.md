---
description: Add pasted links to the inspiration registry with accurate descriptions
argument-hint: <url> [url...]
allowed-tools: Read, Edit, Bash, WebFetch, WebSearch
---

Add each URL in `$ARGUMENTS` to the inspiration registry at
`src/lib/inspiration.ts`. If `$ARGUMENTS` is empty, use the URLs the user pasted
most recently in this conversation.

**This command always targets one fixed repo, no matter where you invoke it
from.** Before anything else:

```bash
cd /Users/blank/Desktop/CREATE/compronents
```

Every path below (`src/lib/inspiration.ts`, `./tests/alias-hooks.mjs`) is
relative to that directory, and every `pnpm`, `biome`, `git add` and `git commit`
runs there. If you were invoked from some other repo, that repo is not the
target: read nothing from it, change nothing in it, and never commit to it. The
only file you may write outside compronents is the scratch script in `/tmp`.

Read `AGENTS.md` (in that repo) conventions: never use em dashes, never surface
another studio's internal name, real specific copy only.

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

5. **Set the facets.** Facets are what `/direction` and `/inspiration/recommend`
   rank on. Every link already gets facets derived from its title, description
   and host by `deriveLinkFacets` (`src/lib/inspiration-meta.ts`) and merged with
   its category defaults, so no entry is facet-less. Set a field only to correct
   or extend what derivation produces:

   - **`useFor`** is the highest-leverage field. Set it on every new link.
     A phrase scores 6.5 points plus 2.4 per word when it appears **verbatim as a
     substring of the query**, so write short lowercase fragments a person would
     literally type ("background thread", "off the main thread", "icon morph"),
     not sentences. Aim for five to eight phrases of two to four words, one per
     distinct intent that should land here. Derivation only ever yields the
     title, host, repo slug and capitalized names lifted from the description, so
     every phrase that is not the product's own name has to come from you.
     Explicit phrases are kept ahead of derived ones and survive the 12-item cap.
   - **`stack`** merges with derived tags. `deriveStack` regex-matches a fixed
     list (react, next, motion, three, webgl, effect, llm, mcp, and so on), so
     add tags that list does not know ("hermes", "metro") or that are true but
     never appear in your copy.
   - **`kind`** replaces derivation entirely when set. Derivation takes the first
     two `KIND_RULES` regex hits over title, description and href, so a library
     whose description happens to say "guide" gets labelled `essay`. Set it when
     the copy would mislabel it; otherwise leave it off.
   - **`style`** is vibe only, for links someone picks by look: galleries,
     portfolios, component libraries, marketing sites. Leave it unset for
     libraries, infra and reference material. Category defaults already cover the
     visual groups, so set it only when this link is an exception, such as a
     brutalist entry in a restrained group.

6. **Insert at the top** of that group's `links` array, in the existing shape:

   ```ts
   {
     title: "Name",
     href: "https://example.com/",
     dateAdded: "YYYY-MM-DD",
     kind: "library",
     stack: ["react", "motion"],
     useFor: ["what someone types", "another intent"],
     description:
       "...",
   },
   ```

   `title` is the site or project's own name, not a slogan. `dateAdded` is
   today's date. Keep the trailing slash and any query string exactly as the
   user pasted, unless it is a tracking-only param you can drop cleanly. Omit any
   facet field you decided not to override.

7. **Verify retrieval, do not assume it.** Write a scratch script to `/tmp` (never
   into the repo) that prints the resolved facets and runs the queries this link
   should win, then run it with the alias hooks:

   ```bash
   cat > /tmp/inspo-check.mjs <<'EOF'
   import { inspirationGroups } from "@/lib/inspiration";
   import { resolveFacets } from "@/lib/inspiration-meta";
   import { recommendInspiration } from "@/lib/inspiration-recommend";

   const HREF = "https://example.com/";
   const QUERIES = ["intent one", "a full sentence a user would type"];

   let found = null;
   for (const g of inspirationGroups)
     for (const l of g.links) if (l.href === HREF) found = { g, l };
   if (!found) throw new Error("link not found");
   console.log(JSON.stringify(resolveFacets(found.g.title, found.l), null, 2));
   for (const q of QUERIES) {
     const titles = recommendInspiration(q).picks.map((p) => p.title);
     console.log(`${q} -> ${titles.join(" | ") || "(none)"}`);
   }
   EOF
   node --import ./tests/alias-hooks.mjs /tmp/inspo-check.mjs
   ```

   The link should place first for its own name and for at least the intents you
   wrote `useFor` phrases for. If an intent misses, the phrase does not match how
   the query reads: fix the phrase, do not pad the description. Then check you did
   not buy those hits with false positives, by running two or three adjacent
   queries this link should **not** win and confirming it stays out of `picks`.

After all URLs are in: run `pnpm biome check --write src/lib/inspiration.ts`
(fall back to `npx biome check --write` if pnpm is unhappy) and `pnpm test`, then
`git add src/lib/inspiration.ts && git commit` with the message
`feat: add <Name>, <Name> inspirations`. Do not push unless asked.

Report one line per link: name, group it landed in, and the queries it now wins,
or "already present".
