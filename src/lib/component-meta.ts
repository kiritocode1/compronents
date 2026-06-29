/**
 * UI-only metadata: the documented public API (props) for each component, and
 * the on-disk path of its `demo.tsx`. Kept separate from `registry.ts` so the
 * registry JSON stays lean.
 *
 * To add one: set `demoPath` to `src/components/demos/<name>.tsx` and list the
 * component's props in `api`.
 */

export interface PropDoc {
  name: string;
  type: string;
  default?: string;
  description: string;
}

export interface ComponentMeta {
  /** Path on disk to the demo source, relative to the repo root. */
  demoPath: string;
  api: PropDoc[];
}

export const componentMeta: Record<string, ComponentMeta> = {
  "animated-footer": {
    demoPath: "src/components/demos/animated-footer.tsx",
    api: [
      {
        name: "heading",
        type: "[string, string]",
        default: '["Blank", "Space"]',
        description:
          "The big two-part wordmark, shown bottom-left and bottom-right.",
      },
      {
        name: "links",
        type: "{ label: string; href: string }[]",
        default: "Work / About / Writing / Contact",
        description: "Nav links rendered in the top-left.",
      },
      {
        name: "description",
        type: "string",
        default: '"Blank — a software developer…"',
        description: "Short studio paragraph rendered in the top-right.",
      },
      {
        name: "leftImage",
        type: "string",
        default: '"/blank-hand-left.png"',
        description:
          "Left hand image, sampled into ASCII. Must be same-origin or CORS-enabled — provide your own.",
      },
      {
        name: "rightImage",
        type: "string",
        default: '"/blank-hand-right.png"',
        description:
          "Right hand image, sampled into ASCII. Must be same-origin or CORS-enabled — provide your own.",
      },
      {
        name: "charColor",
        type: "string",
        default: '"#803500"',
        description: "Base color of the resting ASCII glyphs.",
      },
      {
        name: "hoverColor",
        type: "string",
        default: '"#ff6a00"',
        description: "Color of the glyph clusters lit under the cursor.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "false",
        description:
          "Contain the footer to a bounded, relatively-positioned parent (absolute + reveal-on-enter) instead of taking over the viewport.",
      },
    ],
  },
};

export function getComponentMeta(name: string): ComponentMeta | undefined {
  return componentMeta[name];
}
