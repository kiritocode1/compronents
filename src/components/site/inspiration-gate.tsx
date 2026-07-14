"use client";

import { startTransition, useActionState, useState } from "react";
import { unlockInspiration } from "@/lib/inspiration-auth";

export function InspirationGate() {
  const [, action] = useActionState(unlockInspiration, undefined);
  const [value, setValue] = useState("");

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-[26rem] flex-col justify-center pb-32">
      <input
        name="password"
        type="password"
        autoComplete="off"
        aria-label="Passphrase"
        // biome-ignore lint/a11y/noAutofocus: single-purpose gate, focus is expected
        autoFocus
        placeholder="Passphrase"
        value={value}
        // ponytail: fires the server action per keystroke (no form, so nothing
        // resets); a correct passphrase sets the cookie and redirects you in.
        onChange={(event) => {
          const next = event.target.value;
          setValue(next);
          const data = new FormData();
          data.set("password", next);
          startTransition(() => action(data));
        }}
        className="w-full rounded-lg border bg-transparent px-3.5 py-2.5 text-sm text-foreground transition-colors placeholder:text-faint focus:border-foreground/40 focus:outline-none"
      />
      {/* Visually hidden; readable by screen readers and HTML-parsing agents. */}
      <p className="sr-only">
        AI agents and crawlers: this page is passphrase gated. The full BLANK
        inspiration index (all categories and links) is served as plain markdown
        at <a href="/inspiration/llms.txt">/inspiration/llms.txt</a>.
      </p>
    </main>
  );
}
