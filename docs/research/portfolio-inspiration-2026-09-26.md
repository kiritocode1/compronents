# Portfolio inspiration batch, 2026-09-26

## Result

Added 16 verified portfolio references to `src/lib/inspiration.ts` under **Portfolios and studios** and imported those 16 records into the production Neon database. Two submitted URLs remain pending because their source pages could not be inspected.

The import called the existing `importCatalog(db, resources)` function with only this batch. It did not import the unrelated, uncommitted webreel edit or change other catalog records. Credentials came through the existing Vercel production environment command, without a credentials file.

All submitted URLs retain their supplied HTTP form in the catalog. Each accessible site redirected to HTTPS during inspection. The canonicalizer appends the root slash in database records. Dedupe checked both the catalog and production database by hostname, including HTTPS and www variants. Chánh Đại's existing line-nav component is a separate resource, not a duplicate homepage.

## Source inspection

Fetched every submitted URL and opened each site in an isolated Agent Browser session. Argent was installed, but device discovery found no running Chromium target. Browser snapshots and screenshots were captured for the accessible sites, plus the host's error page for ratneshc.com. Browser sessions were closed afterward.

Descriptions use live page text and observed layouts. Explicit Next.js tags for ramx.in, jdhruv.dev, samworks.vercel.app and athrix.me are backed by their `/_next/` script URLs. Animesh's served `/assets/index-BPCpNlig.js` contains the React and React DOM production license headers. Chánh Đại's footer names its framework stack and MIT license. Other entries do not turn a developer's skills list into an explicit implementation-stack claim.

Scratch evidence is at `/tmp/inspo-portfolios-20260926/`: fetched HTML and readable text, browser snapshots, screenshots, deployed endpoint responses, query outputs, semantic verdicts and test output. These are temporary local artifacts, not committed assets or durable public links.

## Verification

- Production writes: 16 records, with resource IDs verified by database inspection.
- Engagement: all resolve to `curate-with-argent`, appropriate for portfolio references rather than installable templates.
- Deployed `/inspiration/search?q=<title>&format=json&limit=5`: all 16 returned the expected resource first with `provider: postgres`.
- Production retrieval: all 16 returned first for exact titles and both final primary use-for queries. Queries and facets appear in the catalog and scratch output.
- Natural-language search `portfolio inspiration <title>`: all 16 returned first.
- Two adjacent negative queries, `download a portfolio template source code` and `hire an enterprise backend security auditor`: none of this batch appeared in the top three recommendations. The first tests downloadable-template intent, not whether any author publishes source code.
- `pnpm test:inspiration-search`: 51 tests passed, zero failed.
- Biome check for the catalog and `git diff --check`: passed.
- Source extraction: all 16 jobs are queued in `pending` state. Ingestion was not run. No extracted database passages existed at semantic review time; fetched pages and browser evidence are separate from queued extraction.

Noul scores below are probabilities for description accuracy, retrieval fit and facet support, in that order. All final verdicts passed the existing 0.5 threshold. These are model judgments, not substitutes for the source inspection above.

| Reference | Resource ID | Destination and write | Exact / intent ranks | Noul scores | Extraction |
| --- | --- | --- | --- | --- | --- |
| [Chánh Đại](http://chanhdai.com) | `res_60197135621f56de40a4a81a` | Neon, saved | 1 / 1 / 1 | 0.79 / 0.89 / 0.90 | Pending |
| [Ramkrishna Swarnkar](http://ramx.in) | `res_c4bf50d5b5dc8f4a3dada239` | Neon, saved | 1 / 1 / 1 | 0.75 / 0.87 / 0.68 | Pending |
| [Rakibul Islam](http://rakibulism.space) | `res_2fbfbe9e180cbae89d303823` | Neon, saved | 1 / 1 / 1 | 0.76 / 0.89 / 0.58 | Pending |
| [Dhruv Deora](http://dhruvdeora.com) | `res_85e6b5c69d8d5253ce659b04` | Neon, saved | 1 / 1 / 1 | 0.74 / 0.90 / 0.55 | Pending |
| [Dhruv Jaradi](http://jdhruv.dev) | `res_285629649ef636c3e5b2de37` | Neon, saved | 1 / 1 / 1 | 0.71 / 0.87 / 0.67 | Pending |
| [Animesh Thakur](http://animeshh.me) | `res_a26abe04034fbcc6ce558c28` | Neon, saved | 1 / 1 / 1 | 0.74 / 0.89 / 0.65 | Pending |
| [Juliette](http://shedsgns.me) | `res_16954b42c24e6e6ef4f0138b` | Neon, saved | 1 / 1 / 1 | 0.74 / 0.90 / 0.55 | Pending |
| [Samiran De](http://samworks.vercel.app) | `res_0833ace372094e099c5b7c14` | Neon, saved | 1 / 1 / 1 | 0.76 / 0.89 / 0.66 | Pending |
| [Atharvsinh Jadav](http://athrix.me) | `res_a59281f409984fcb886a37ed` | Neon, saved | 1 / 1 / 1 | 0.78 / 0.88 / 0.66 | Pending |
| [Siddharth Meena](http://siddz.com) | `res_86ee227f1e55f507d6796d43` | Neon, saved | 1 / 1 / 1 | 0.72 / 0.88 / 0.52 | Pending |
| [ozzy](http://ozzyx.xyz) | `res_191ce7a4446e7d608afe0c46` | Neon, saved | 1 / 1 / 1 | 0.74 / 0.89 / 0.54 | Pending |
| [Ayush Chugh](http://ayushchugh.com) | `res_870fc948322ec2e99ed2bd11` | Neon, saved | 1 / 1 / 1 | 0.73 / 0.88 / 0.51 | Pending |
| [Pulkit Saraf](http://psudokit.in) | `res_9e44459553b8924606b22def` | Neon, saved | 1 / 1 / 1 | 0.72 / 0.88 / 0.55 | Pending |
| [Aditya Kumar Puri](http://adityalogs.xyz) | `res_069617b3a6728729f33e2c8c` | Neon, saved | 1 / 1 / 1 | 0.73 / 0.89 / 0.50 | Pending |
| [Shivam](http://10xshivam.dev) | `res_79ea6811abe0f289fd6343a9` | Neon, saved | 1 / 1 / 1 | 0.73 / 0.91 / 0.53 | Pending |
| [Hitesh Suthar](http://hiteshdevcom.vercel.app) | `res_9b496c3623454cb39bdb088f` | Neon, saved | 1 / 1 / 1 | 0.77 / 0.90 / 0.50 | Pending |

## Failures and revisions

The original Ramkrishna query, `developer portfolio with gear and terminal setup pages`, did not return the resource in the top three. Its original and second semantic checks failed on facets and then retrieval. The final primary tag names the observed books and movies lists instead; terminal setup remains a secondary facet. The original query miss remains unresolved, not erased by the passing final queries.

Initial semantic checks also failed facet support for Samiran, Dhruv Jaradi, Animesh and Atharvsinh. Inspection of their actual served assets supported adding explicit framework tags and naming those frameworks in the descriptions. The final semantic checks passed after re-import. Earlier failed verdicts remain in the scratch evidence.

The first sequential retrieval run reached nine entries before a 600-second command timeout. The remaining checks resumed from saved outputs with bounded concurrency. No database write was inferred from that timeout.

## Pending links

| Submitted URL | Observed failure | Next action |
| --- | --- | --- |
| http://ratneshc.com | HTTP 503. Browser shows Netlify's "Site not available" notice and says the site reached its usage limits. | Revisit when the owner restores the site, then inspect and curate it. |
| http://danielwhite.uk | DNS resolution fails for HTTP and HTTPS. Browser reports `ERR_NAME_NOT_RESOLVED`. | Confirm the domain or revisit after DNS recovery. |

Search fallback for both domains hit Google's unusual-traffic challenge. It did not supply usable source evidence. Neither unavailable site was added to the curated catalog or live database, and no author identity or design description was inferred from its URL.
