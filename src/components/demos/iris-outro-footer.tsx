"use client";

import IrisOutroFooter from "@/registry/iris-outro-footer";

/**
 * Embedded preview of the Iris Outro Footer. The full component is the last
 * screen of a tall page and scrubs against the page scroll; `embedded` turns it
 * into its own scroller with a one-screen lead-in, so the iris still blooms
 * rather than simply appearing.
 *
 * Scroll inside the box to run the closing titles.
 */
export default function Demo() {
  return (
    <div className="relative h-[560px] w-full overflow-hidden rounded-md">
      <IrisOutroFooter embedded />
    </div>
  );
}
