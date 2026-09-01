"use client";

import { Lock } from "lucide-react";
import { startTransition, useActionState, useEffect, useState } from "react";
import { RegistryFiles } from "@/components/site/registry-files";
import {
  isSourceUnlocked,
  loadSourceFiles,
  unlockSource,
} from "@/lib/source-access";

type Payload = Awaited<ReturnType<typeof loadSourceFiles>>;

/**
 * Detail pages are statically prerendered, so their source cannot be embedded
 * without publishing it. This component keeps the page static and pulls the
 * files through an authenticated server action once a token is present.
 */
export function SourceGate({ name }: { name: string }) {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [checked, setChecked] = useState(false);
  const [state, action, pending] = useActionState(unlockSource, undefined);
  const [token, setToken] = useState("");

  // `state` is not read in the body, it is the trigger: a successful unlock
  // returns a new state object, and that is what re-runs this effect to load
  // the now-permitted files.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional trigger dep
  useEffect(() => {
    let alive = true;

    (async () => {
      if (await isSourceUnlocked()) {
        const next = await loadSourceFiles(name).catch(() => null);
        if (alive && next) setPayload(next);
      }
      if (alive) setChecked(true);
    })();

    return () => {
      alive = false;
    };
  }, [name, state]);

  if (payload) {
    return <RegistryFiles files={payload.files} demo={payload.demo} />;
  }

  if (!checked) {
    return (
      <div className="rounded-lg border bg-surface px-4 py-6 text-sm text-faint">
        Checking access…
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-surface px-4 py-6">
      <div className="flex items-center gap-2 text-sm text-foreground">
        <Lock className="size-4 text-faint" aria-hidden="true" />
        Source is token gated
      </div>
      <p className="mt-2 max-w-prose text-sm text-muted-foreground">
        Paste a registry token to read and copy the files. The same token
        installs this item with the shadcn CLI.
      </p>

      <form
        action={action}
        className="mt-4 flex max-w-md gap-2"
        onSubmit={() => startTransition(() => setToken(""))}
      >
        <input
          name="token"
          type="password"
          autoComplete="off"
          aria-label="Registry token"
          placeholder="blank_…"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          className="flex-1 rounded-lg border bg-transparent px-3.5 py-2.5 text-sm text-foreground transition-colors placeholder:text-faint focus:border-foreground/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-lg border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground disabled:opacity-50"
        >
          {pending ? "Checking" : "Unlock"}
        </button>
      </form>

      {state?.error ? (
        <p className="mt-2 text-xs text-faint">{state.error}</p>
      ) : null}
    </div>
  );
}
