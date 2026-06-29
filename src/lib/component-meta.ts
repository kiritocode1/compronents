import { assetItems, getAssetEnvKey, getHostedAssetUrl } from "@/lib/assets";

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

export interface NuanceDoc {
  label: string;
  description: string;
}

export interface EditableDoc {
  name: string;
  control: "text" | "textarea" | "color" | "tuple" | "links" | "asset-url";
  description: string;
}

export interface ComponentAssetDoc {
  id: string;
  label: string;
  provider: "vercel-blob";
  pathname: string;
  envKey: string;
  fallbackPath: string;
  role: string;
}

export interface ComponentMeta {
  /** Path on disk to the demo source, relative to the repo root. */
  demoPath: string;
  studioPath?: string;
  api: PropDoc[];
  nuance: NuanceDoc[];
  editable: EditableDoc[];
  assets: ComponentAssetDoc[];
}

const animatedFooterAssets = assetItems
  .filter((asset) => asset.id.startsWith("animated-footer-"))
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    envKey: getAssetEnvKey(asset),
    fallbackPath: asset.fallbackPath,
    role: asset.role,
  }));

export const componentMeta: Record<string, ComponentMeta> = {
  "animated-footer": {
    demoPath: "src/components/demos/animated-footer.tsx",
    studioPath: "src/components/studios/animated-footer.tsx",
    nuance: [
      {
        label: "Image fidelity",
        description:
          "The hand photos are not decorative; their contrast determines every ASCII cell. Keep CORS open so the canvas can sample pixels.",
      },
      {
        label: "Reveal behavior",
        description:
          "Fullscreen mode owns scroll with Lenis and GSAP. Embedded mode avoids scroll hijacking and reveals from an IntersectionObserver.",
      },
      {
        label: "Color dramaturgy",
        description:
          "The base glyph color should stay low and earthen while hover color carries the heat of the interaction.",
      },
    ],
    editable: [
      {
        name: "heading",
        control: "tuple",
        description:
          "Two wordmark halves, tuned independently so narrow names still hold the footer edges.",
      },
      {
        name: "description",
        control: "textarea",
        description:
          "The studio paragraph in the upper-right; short copy preserves the wide empty field.",
      },
      {
        name: "links",
        control: "links",
        description:
          "Four compact nav links work best because the line reveal has room to breathe.",
      },
      {
        name: "charColor",
        control: "color",
        description: "Resting ASCII glyph color.",
      },
      {
        name: "hoverColor",
        control: "color",
        description: "Lit cluster fill color.",
      },
      {
        name: "leftImage/rightImage",
        control: "asset-url",
        description: `Hosted through ${getHostedAssetUrl(
          "animated-footer/blank-hand-right.png",
        )} and the matching right-hand route.`,
      },
    ],
    assets: animatedFooterAssets,
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
        default:
          '"https://compronents.dev/assets/animated-footer/blank-hand-right.png"',
        description:
          "Left hand image, sampled into ASCII. Defaults to the Compronents asset route backed by Vercel Blob.",
      },
      {
        name: "rightImage",
        type: "string",
        default:
          '"https://compronents.dev/assets/animated-footer/blank-hand-left.png"',
        description:
          "Right hand image, sampled into ASCII. Defaults to the Compronents asset route backed by Vercel Blob.",
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
