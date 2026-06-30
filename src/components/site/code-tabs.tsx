"use client";

import { useId, useState } from "react";
import { CopyButton } from "@/components/site/copy-button";
import {
  TabsSubtle,
  TabsSubtleItem,
  TabsSubtlePanel,
} from "@/components/ui/tabs-subtle";

export interface CodeTab {
  /** Tab label, e.g. a package manager (`pnpm`) or a filename (`demo.tsx`). */
  label: string;
  /** Pre-highlighted Shiki HTML for this tab's code. */
  html: string;
  /** Raw source, used for the copy button. */
  raw: string;
}

/**
 * A bordered code surface with a row of subtle tabs and a copy button.
 * Highlighting happens on the server; this client wrapper only owns the
 * selected-tab state so it can drive the animated `TabsSubtle` rail.
 */
export function CodeTabs({ tabs }: { tabs: CodeTab[] }) {
  const [selected, setSelected] = useState(0);
  const idPrefix = useId();
  const active = tabs[selected] ?? tabs[0];

  return (
    <div className="overflow-hidden rounded-lg border bg-surface">
      <div className="flex items-center justify-between gap-2 border-b py-1.5 pr-1.5 pl-2">
        <TabsSubtle
          selectedIndex={selected}
          onSelect={setSelected}
          idPrefix={idPrefix}
        >
          {tabs.map((tab, i) => (
            <TabsSubtleItem
              key={`${i}-${tab.label}`}
              index={i}
              label={tab.label}
            />
          ))}
        </TabsSubtle>
        <CopyButton value={active.raw} />
      </div>
      {tabs.map((tab, i) => (
        <TabsSubtlePanel
          key={`${i}-${tab.label}`}
          index={i}
          selectedIndex={selected}
          idPrefix={idPrefix}
        >
          <div
            className="overflow-x-auto p-4"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted Shiki output from local source / static commands
            dangerouslySetInnerHTML={{ __html: tab.html }}
          />
        </TabsSubtlePanel>
      ))}
    </div>
  );
}
