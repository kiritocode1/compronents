# Inspiration: one bar, one passphrase

## Goal

Today the page has two search engines behind a mode switch, and two passphrases where one is 30 days and the other is 12 hours. After: one bar that narrows the wall as you type and escalates to context search on its own, and one passphrase that gets you in and makes you the owner. Proof: type a typo, see the wall narrow; keep typing something the wall does not hold, see retrieval hits append without the wall vanishing; sign in once, come back tomorrow, preferences still there.

## The change

```
today   type -> wall narrows        submit -> wall HIDDEN, retrieval replaces
after   type -> wall narrows -> weak? -> retrieval appends, wall stays
```

## Files

| File | Today | After |
| --- | --- | --- |
| `src/lib/inspiration-auth.ts` | sets `inspiration_unlock` only | also mints the owner session when the same passphrase is the owner one |
| `src/lib/inspiration/auth.ts` | `validOwnerSession` rejects any expiry beyond 12h | ceiling raised to 30d, matching the unlock cookie |
| `src/lib/inspiration/http.ts` | owner cookie `Max-Age=43200` | `Max-Age=2592000` |
| `src/lib/inspiration-browse.ts` | returns `InspirationGroup[]`, drops its scores | returns `{ groups, top }` so the client can tell a strong local hit from a weak one |
| `src/components/site/inspiration-index.tsx` | two modes, wall hidden on submit, `Context` input in the bar | one bar, wall always rendered, retrieval merges in, context parsed from `in:` |

## The choices

### 1. One passphrase mints both cookies

The unlock action already has the plaintext in hand and already compares it. Comparing it against the owner secret too costs one more call and removes the second sign-in entirely.

```diff
   (await cookies()).set("inspiration_unlock", "unlocked", {
     httpOnly: true, sameSite: "lax", path: "/inspiration",
     maxAge: 60 * 60 * 24 * 30,
   });
+  // Same person, same passphrase. If it is also the owner secret, elevate now
+  // instead of asking again on the page we just let them into.
+  if (ownerPasswordMatches(password)) {
+    (await cookies()).set(OWNER_COOKIE, createOwnerSession(), {
+      httpOnly: true, secure: true, sameSite: "strict", path: "/",
+      maxAge: 60 * 60 * 24 * 30,
+    });
+  }
   redirect("/inspiration");
```

`ownerPasswordMatches` throws 503 when the owner env vars are unconfigured, so it gets wrapped in a try and the unlock still succeeds without elevation. The `details` sign-in block stays in the UI as the fallback for the case where the two passwords genuinely differ in production.

Rejected: keeping the two prompts and only raising the expiry. It fixes the recurrence but not the "why am I signing in on a page I just signed into" question, which is the one being asked.

### 2. Browse reports its confidence

The escalation trigger already exists inside `browseInspiration`. `scoreByHref` knows whether the top local hit is a real match or noise, then the function throws that away and returns groups. One caller, so change the return type rather than adding a wrapper.

```diff
-export function browseInspiration(groups, rawQuery, now = new Date()): InspirationGroup[] {
+export interface BrowseResult {
+  groups: InspirationGroup[];
+  /** Best combined score in [0, ~1.1]. 0 when nothing matched. */
+  top: number;
+}
+
+export function browseInspiration(groups, rawQuery, now = new Date()): BrowseResult {
```

Escalate when `top < 0.55` or `groups.length === 0`. That number is a starting guess and gets tuned against real queries before this lands.

### 3. The wall never disappears

The mode switch is one ternary. Removing it is most of the fix.

```diff
-      {!submitted.query ? <div className="mt-12 space-y-14">
+      <div className="mt-12 space-y-14">
```

Retrieval then merges instead of replacing. Hits already on the wall attach their preference badge and sources disclosure in place. Hits the wall does not hold append below under their own heading, so a semantic-only find is visibly a different kind of result and not silently mixed into your own shelves.

Submit stops being a mode change and becomes what Enter does in a browser: nothing you were not already getting, just sooner. The debounce is 250ms after typing stops, aborting in flight on the next keystroke, which the existing `AbortController` already does.

### 4. Context leaves the bar

`Context` becomes a query prefix, parsed client-side and stripped before either engine sees it.

```
grain texture in:kalypso
```

Parsed to `{ text: "grain texture", contextKey: "kalypso" }`. The bar stays one field whether or not you are the owner, and the active context renders as a removable chip beside it rather than a second input. Discoverability is the weak point here, so the chip is also clickable to clear, and the placeholder gains the hint only when signed in.

Rejected: moving the input into the `details` block. It works, but it puts a per-search scope two clicks away from the search.

## Not doing

- No change to the retrieval engine itself. `retrieve.ts` ranking, RRF, and the hybrid provider stay as they are.
- No change to what owner unlocks. Semantic candidates, evidence, and preferences stay owner-only.
- No change to the page-level gate. The wall stays passphrase gated at 30 days.
- Not touching the preference save form, the feedback outcomes, or the MCP token path.
- No visual redesign. Same type, same spacing, same colours. This is interaction only.
