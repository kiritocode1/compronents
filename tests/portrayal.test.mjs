// Portrayal integrity: the code we SHOW must be the code that RENDERS.
//
//   node --test tests/portrayal.test.mjs
//
// Each component has up to three site wrappers around the same installable
// source (`@/registry/<name>`):
//   - demos/<name>     — the ONLY one shown as copyable code ("Usage" tab)
//   - previews/<name>  — rendered in the fullscreen iframe
//   - studios/<name>   — the interactive panel shown first on the detail page
//
// They must not lie about the component. This suite enforces that the preview
// and the studio's at-rest state render the SAME registry component with the
// SAME scalar prop values the shown demo uses — so "what you see" is "what you
// copy". Only scalar props are compared (data arrays are out of scope), and
// identity/mode props are ignored (see PORTRAYAL_IGNORED_PROPS).

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  PORTRAYAL_IGNORED_PROPS,
  registryDefaults,
  registryItems,
  studioDefaults,
  wrapperProps,
} from "./registry-data.mjs";

/** Scalar props a mismatch on would mean "renders differently than shown". */
function conflicts(shown, actual) {
  const out = [];
  for (const [key, value] of Object.entries(actual)) {
    if (PORTRAYAL_IGNORED_PROPS.has(key)) continue;
    if (shown[key] !== undefined && String(shown[key]) !== String(value)) {
      out.push(
        `${key}: renders "${value}" but shown code uses "${shown[key]}"`,
      );
    }
  }
  return out;
}

for (const item of registryItems) {
  if (item.section === "backend") continue;

  test(`${item.name}: panels render what the demo shows`, () => {
    // What the shown demo renders: its explicit props over the component's
    // own defaults.
    const demoProps = wrapperProps(`src/components/demos/${item.name}.tsx`);
    assert.notEqual(
      demoProps,
      null,
      `demo does not render @/registry/${item.name}`,
    );
    const shown = { ...registryDefaults(item.name), ...demoProps };

    // The fullscreen iframe renders the preview (falling back to the demo). It
    // must not portray different values than the code the user is handed.
    const preview = wrapperProps(`src/components/previews/${item.name}.tsx`);
    if (preview) {
      const diff = conflicts(shown, preview);
      assert.deepEqual(
        diff,
        [],
        `preview drifts from shown demo:\n  - ${diff.join("\n  - ")}\n`,
      );
    }

    // The interactive panel's default preset is its at-rest look, before any
    // control is touched. It must equal the shown demo.
    const studio = studioDefaults(`src/components/studios/${item.name}.tsx`);
    if (studio) {
      const diff = conflicts(shown, studio);
      assert.deepEqual(
        diff,
        [],
        `studio default state drifts from shown demo:\n  - ${diff.join("\n  - ")}\n`,
      );
    }
  });
}
