import { assetItems, getHostedAssetUrl } from "@/lib/assets";

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
    fallbackPath: asset.fallbackPath,
    role: asset.role,
  }));

// The accordion ships a 20-image set; document a representative few rather than
// rendering twenty near-identical asset cards.
const accordionFramesAssets = assetItems
  .filter((asset) => asset.id.startsWith("accordion-frames-"))
  .slice(0, 3)
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role:
      asset.id === "accordion-frames-spotlight-1"
        ? "First of the numbered panel set spotlight-1.jpg … spotlight-20.jpg, each revealed when its slat is focused."
        : asset.role,
  }));

const asciiLogoAssets = assetItems
  .filter((asset) => asset.id.startsWith("ascii-logo-"))
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role: asset.role,
  }));

const overlayMenuAssets = assetItems
  .filter((asset) => asset.id.startsWith("overlay-menu-"))
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role: asset.role,
  }));

const mosaicFlipAssets = assetItems
  .filter((asset) => asset.id.startsWith("mosaic-flip-"))
  .slice(0, 3)
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role: asset.role,
  }));

const imageRevealAssets = assetItems
  .filter((asset) => asset.id.startsWith("image-reveal-"))
  .slice(0, 3)
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role: asset.role,
  }));

const awardListAssets = assetItems
  .filter((asset) => asset.id.startsWith("award-list-"))
  .slice(0, 3)
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role: asset.role,
  }));

const inversaScrollAssets = assetItems
  .filter((asset) => asset.id.startsWith("inversa-scroll-"))
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role: asset.role,
  }));

const materialSpotlightAssets = assetItems
  .filter((asset) => asset.id.startsWith("material-spotlight-"))
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role: asset.role,
  }));

const portfolioPageAssets = assetItems
  .filter((asset) => asset.id.startsWith("portfolio-page-"))
  .slice(0, 3)
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role: asset.role,
  }));

export const componentMeta: Record<string, ComponentMeta> = {
  "portfolio-page": {
    demoPath: "src/components/demos/portfolio-page.tsx",
    studioPath: "src/components/studios/portfolio-page.tsx",
    nuance: [
      {
        label: "The screen is a clip-path",
        description:
          "Home and project are two states of one AnimatePresence. Each enters and exits by animating a polygon clip-path, so the whole screen wipes shut and open instead of routing.",
      },
      {
        label: "Reveal from behind bars",
        description:
          "The wordmark lines sit under masking bars and slide up into view on load, staggered. It reads as type being printed rather than faded in.",
      },
      {
        label: "Grain ties it together",
        description:
          "An inline SVG noise layer animates over everything at a low opacity — no external image — giving the flat colors a filmic texture.",
      },
    ],
    editable: [
      {
        name: "bg / text",
        control: "color",
        description: "Landing backdrop and ink color.",
      },
      {
        name: "projectBg",
        control: "color",
        description: "The project view's background — usually the inverse.",
      },
      {
        name: "projects",
        control: "asset-url",
        description: `Each project's name, copy, and thumbnail — hosted through ${getHostedAssetUrl(
          "portfolio-page/project-1.jpg",
        )} and the numbered set.`,
      },
    ],
    assets: portfolioPageAssets,
    api: [
      {
        name: "primaryLines / secondaryLines",
        type: "[string, string, string]",
        default: '["blank","visual","dev."] / …',
        description: "The two big landing wordmark columns.",
      },
      {
        name: "projects",
        type: "PortfolioProject[]",
        default: "5 sample projects",
        description:
          "Each { name, category, year, image, description }; click opens the project view.",
      },
      {
        name: "aboutLead / aboutBody",
        type: "string",
        default: "(about this guy) / …",
        description: "The about section's small label and paragraph.",
      },
      {
        name: "socials",
        type: "{ label, href }[]",
        default: "email / twitter / linkedin",
        description: "Links in the about column.",
      },
      {
        name: "credits",
        type: "[string, string, string]",
        default: '"currently creating at|aryank.space" …',
        description: "Three label|value credits in the landing footer.",
      },
      {
        name: "bg / text / projectBg",
        type: "string",
        default: '"#191c1a" / "#b0b0b0" / "#b0b0b0"',
        description: "Landing background, ink, and project-view background.",
      },
    ],
  },
  "material-spotlight": {
    demoPath: "src/components/demos/material-spotlight.tsx",
    studioPath: "src/components/studios/material-spotlight.tsx",
    nuance: [
      {
        label: "A patch, not a new shader",
        description:
          "onBeforeCompile splices four small chunks into MeshStandardMaterial — it keeps all of the standard PBR lighting and only overrides roughness and diffuse inside the sphere of influence.",
      },
      {
        label: "World-space, ray-picked",
        description:
          "The cursor is ray-cast onto a plane to get a world point; the fragment shader measures distance to it, so the spotlight sticks to the surface in 3D rather than sliding across the screen.",
      },
      {
        label: "Eased, never snapped",
        description:
          "Both the hit point and the activation amount lerp every frame, so the spot glides to the cursor and fades out smoothly when the pointer leaves.",
      },
    ],
    editable: [
      {
        name: "background",
        control: "color",
        description: "Clear color behind the model.",
      },
      {
        name: "radius / softness",
        control: "text",
        description:
          "Size of the polished sphere and the feather past its edge.",
      },
      {
        name: "src",
        control: "asset-url",
        description: `GLB model, hosted through ${getHostedAssetUrl(
          "material-spotlight/model.glb",
        )}.`,
      },
    ],
    assets: materialSpotlightAssets,
    api: [
      {
        name: "src",
        type: "string",
        default: '"…/material-spotlight/model.glb"',
        description: "Model URL (.glb / .gltf), same-origin or CORS-enabled.",
      },
      {
        name: "background",
        type: "string",
        default: '"#dddcd7"',
        description: "Clear / background color.",
      },
      {
        name: "radius",
        type: "number",
        default: "0.15",
        description: "Radius of the polished spotlight, in world units.",
      },
      {
        name: "softness",
        type: "number",
        default: "0.35",
        description: "Soft falloff width past the radius.",
      },
      {
        name: "lerp",
        type: "number",
        default: "0.05",
        description:
          "Follow easing for the hit point and activation per frame.",
      },
      {
        name: "exposure",
        type: "number",
        default: "0.65",
        description: "ACES tone-mapping exposure.",
      },
    ],
  },
  "inversa-scroll": {
    demoPath: "src/components/demos/inversa-scroll.tsx",
    studioPath: "src/components/studios/inversa-scroll.tsx",
    nuance: [
      {
        label: "One scroll, many phases",
        description:
          "A single pinned ScrollTrigger drives everything by hand in onUpdate. Each effect — parallax, mask scale, saturation, grid, markers, copy — owns its own slice of progress with smoothstep easing, so they overlap without a timeline.",
      },
      {
        label: "Subtract-mask window",
        description:
          "The dark overlay is masked by a solid layer minus the SVG slats (mask-composite: subtract), so the slats read as a hole. Scaling the mask grows or closes that window.",
      },
      {
        label: "Owns its scroll",
        description:
          "By default it pins inside its own scroll container so it embeds in a bounded box. Pass embedded={false} to run it as a full-page section on the window scroll.",
      },
    ],
    editable: [
      {
        name: "markers[].color",
        control: "color",
        description: "The two pulsing location-marker colors.",
      },
      {
        name: "dark",
        control: "color",
        description: "Backdrop and overlay color.",
      },
      {
        name: "title / blocks / outroText",
        control: "text",
        description:
          "The headline, the three sliding copy blocks, and the outro.",
      },
      {
        name: "heroImage / maskImage / gridImage",
        control: "asset-url",
        description: `Hosted through ${getHostedAssetUrl(
          "inversa-scroll/hero-img.jpg",
        )} and the mask / grid SVGs.`,
      },
    ],
    assets: inversaScrollAssets,
    api: [
      {
        name: "heroImage",
        type: "string",
        default: '"…/inversa-scroll/hero-img.jpg"',
        description:
          "Parallaxing hero photo, masked and desaturated on scroll.",
      },
      {
        name: "maskImage",
        type: "string",
        default: '"…/inversa-scroll/mask.svg"',
        description: "SVG mask scaled to open / close the inverted window.",
      },
      {
        name: "gridImage",
        type: "string",
        default: '"…/inversa-scroll/grid-overlay.svg"',
        description: "Wireframe grid SVG that fades in over the window.",
      },
      {
        name: "title",
        type: "string",
        default: '"Location Framework"',
        description: "The big headline in the first copy block.",
      },
      {
        name: "blocks",
        type: "[InversaBlock, InversaBlock, InversaBlock]",
        default: "Coordinate Mapping / …",
        description: "The three { heading, body } blocks that slide past.",
      },
      {
        name: "markers",
        type: "[InversaMarker, InversaMarker]",
        default: "Anchor / Drift Field",
        description: "Two { label, color, top, left } pulsing markers.",
      },
      {
        name: "outroText",
        type: "string",
        default: '"The system has reached…"',
        description: "Copy in the closing panel.",
      },
      {
        name: "dark / light",
        type: "string",
        default: '"#141414" / "#ffffff"',
        description: "Backdrop/overlay color and text/foreground color.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own an internal scroll container (true) or use the window scroll (false).",
      },
    ],
  },
  "award-list": {
    demoPath: "src/components/demos/award-list.tsx",
    studioPath: "src/components/studios/award-list.tsx",
    nuance: [
      {
        label: "Three-state shutter",
        description:
          "Each row is a 240px column clipped to 80px: name, project, name. Hover parks it on the middle (project) band; the exit edge decides whether it settles back up or rolls down to the next name.",
      },
      {
        label: "Scroll keeps up",
        description:
          "A scroll listener re-runs the hit-test against the last cursor position, so a row entered while scrolling still opens and closes correctly instead of sticking.",
      },
      {
        label: "The preview pile",
        description:
          "Hovered rows stack their image in the corner; pause and it collapses to the most recent, leave the list and the whole pile scales away.",
      },
    ],
    editable: [
      {
        name: "nameBackground / nameColor",
        control: "color",
        description: "Resting name-row surface and ink.",
      },
      {
        name: "projectBackground / projectColor",
        control: "color",
        description: "The inverted project band revealed on hover.",
      },
      {
        name: "awards",
        control: "asset-url",
        description: `Each row's name, credit, and image — hosted through ${getHostedAssetUrl(
          "award-list/img1.jpg",
        )} and the numbered set.`,
      },
    ],
    assets: awardListAssets,
    api: [
      {
        name: "awards",
        type: "Award[]",
        default: "17 sample awards",
        description:
          "Rows of { name, type, project, label, image }; image lands on the preview pile.",
      },
      {
        name: "heading",
        type: "string",
        default: '"Recognition and awards"',
        description: "Label above the list. Pass empty string to hide.",
      },
      {
        name: "nameBackground",
        type: "string",
        default: '"#e3e3db"',
        description: "Resting name-row background.",
      },
      {
        name: "nameColor",
        type: "string",
        default: '"#000000"',
        description: "Resting name-row text color.",
      },
      {
        name: "projectBackground",
        type: "string",
        default: '"#000000"',
        description: "Hover project-band background.",
      },
      {
        name: "projectColor",
        type: "string",
        default: '"#e3e3db"',
        description: "Hover project-band text color.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own an internal scroll container (true) or use the window scroll (false).",
      },
    ],
  },
  "image-reveal": {
    demoPath: "src/components/demos/image-reveal.tsx",
    studioPath: "src/components/studios/image-reveal.tsx",
    nuance: [
      {
        label: "Owns its scroll",
        description:
          "By default it pins inside its own scroll container (custom ScrollTrigger scroller + Lenis wrapper), so it embeds in a bounded box. Pass embedded={false} to drive it from the window instead.",
      },
      {
        label: "Decode band",
        description:
          "The dissolve is a density field: a solid core at the seam scattering to noise at the edges, gated per-cell by a stable hash so the static looks organic instead of uniform.",
      },
      {
        label: "Clip, not crossfade",
        description:
          "Each frame is wiped with a polygon clip-path rather than faded, so the transition has a hard moving edge — the band rides exactly that edge.",
      },
    ],
    editable: [
      {
        name: "dissolveColor",
        control: "color",
        description: "Color of the scattering dissolve characters.",
      },
      {
        name: "dissolveCellSize",
        control: "text",
        description:
          "Cell size in px; smaller is fine static, larger teletext.",
      },
      {
        name: "introText / outroText",
        control: "text",
        description: "Copy in the intro and outro panels.",
      },
      {
        name: "images",
        control: "asset-url",
        description: `Stacked frames, hosted through ${getHostedAssetUrl(
          "image-reveal/img-1.jpg",
        )} and the numbered set.`,
      },
    ],
    assets: imageRevealAssets,
    api: [
      {
        name: "images",
        type: "string[]",
        default: "img-1…5 (Compronents assets)",
        description: "Stacked images, revealed top to bottom as you scroll.",
      },
      {
        name: "introText",
        type: "string",
        default: '"Scroll down to decode the craft"',
        description: "Copy shown in the intro panel.",
      },
      {
        name: "outroText",
        type: "string",
        default: '"The rest is under NDA"',
        description: "Copy shown in the outro panel.",
      },
      {
        name: "dissolveColor",
        type: "string",
        default: '"#ff6426"',
        description: "Color of the dissolve characters.",
      },
      {
        name: "dissolveCellSize",
        type: "number",
        default: "16",
        description: "Size of each dissolve cell, in px.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own an internal scroll container (true) or use the window scroll (false).",
      },
    ],
  },
  "mosaic-flip": {
    demoPath: "src/components/demos/mosaic-flip.tsx",
    studioPath: "src/components/studios/mosaic-flip.tsx",
    nuance: [
      {
        label: "Sliced, not tiled",
        description:
          "Every cube paints the same full image with a shifted background-position, so the grid reassembles one picture. The flip turns that picture over rather than swapping a mosaic of thumbnails.",
      },
      {
        label: "Hidden-face swap",
        description:
          "The incoming image is painted onto whichever face is currently turned away, then the grid rotates 180°. You never see the paint happen — only the reveal.",
      },
      {
        label: "Queued hovers",
        description:
          "A reveal in flight parks the next request and runs it on completion, so dragging across the list resolves to the last project instead of stuttering.",
      },
    ],
    editable: [
      {
        name: "tilesX / tilesY",
        control: "text",
        description: "Grid resolution; finer grids ripple, coarser ones plate.",
      },
      {
        name: "tileSize",
        control: "text",
        description: "Cube edge length in px (also sets the 3D depth).",
      },
      {
        name: "edgeColor",
        control: "color",
        description: "Color of the cube top and bottom faces.",
      },
      {
        name: "images",
        control: "asset-url",
        description: `Idle + project images, hosted through ${getHostedAssetUrl(
          "mosaic-flip/default.jpg",
        )} and the numbered set.`,
      },
    ],
    assets: mosaicFlipAssets,
    api: [
      {
        name: "images",
        type: "string[]",
        default: "default + img1…6 (Compronents assets)",
        description:
          "Image URLs; index 0 is the idle image, 1…N map to the projects.",
      },
      {
        name: "projects",
        type: "{ label: string }[]",
        default: "NX-09 / Deep Space / …",
        description: "Project names; project i (1-based) reveals images[i].",
      },
      {
        name: "tilesX",
        type: "number",
        default: "12",
        description: "Number of cube columns.",
      },
      {
        name: "tilesY",
        type: "number",
        default: "9",
        description: "Number of cube rows.",
      },
      {
        name: "tileSize",
        type: "number",
        default: "60",
        description: "Cube edge length in px; the 3D depth is half of this.",
      },
      {
        name: "edgeColor",
        type: "string",
        default: '"#222222"',
        description: "Color of the cube top/bottom faces.",
      },
      {
        name: "background",
        type: "string",
        default: '"#171717"',
        description: "Frame background color.",
      },
      {
        name: "perspective",
        type: "number",
        default: "800",
        description: "CSS perspective applied to the 3D scene, in px.",
      },
    ],
  },
  "overlay-menu": {
    demoPath: "src/components/demos/overlay-menu.tsx",
    studioPath: "src/components/studios/overlay-menu.tsx",
    nuance: [
      {
        label: "Layered reveal",
        description:
          "Four curtain panels scaleY in sequence, then the dark surface clip-reveals beneath them. The overlap (a negative timeline offset) is what makes it read as depth rather than a single wipe.",
      },
      {
        label: "Masked line slide",
        description:
          "Each link is split into masked lines that slide up from behind their own clip. The slide is deliberately delayed until the curtains have mostly landed.",
      },
      {
        label: "Wraps your page",
        description:
          "The component is a layout: it renders the bar and overlay over whatever you pass as children, so it composes with an existing hero instead of replacing it.",
      },
    ],
    editable: [
      {
        name: "panelColors",
        control: "tuple",
        description: "The four curtain panel colors, swept in order.",
      },
      {
        name: "menuColor",
        control: "color",
        description: "Menu surface revealed beneath the curtains.",
      },
      {
        name: "togglerColor",
        control: "color",
        description: "Hamburger bar color.",
      },
      {
        name: "logo",
        control: "asset-url",
        description: `Bar logo, hosted through ${getHostedAssetUrl(
          "overlay-menu/logo.png",
        )}.`,
      },
    ],
    assets: overlayMenuAssets,
    api: [
      {
        name: "logo",
        type: "string",
        default: '"…/overlay-menu/logo.png"',
        description: "Logo image shown in the top-left of the bar.",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "Page / hero content rendered behind the menu.",
      },
      {
        name: "socials",
        type: "{ label, href }[]",
        default: "Bluesky / Pinterest / …",
        description: "Social links column.",
      },
      {
        name: "legal",
        type: "{ label, href }[]",
        default: "Cookie Policy / …",
        description: "Small legal links column.",
      },
      {
        name: "primaryLinks",
        type: "{ label, href }[]",
        default: "Home / Experiments / …",
        description: "Large primary navigation links.",
      },
      {
        name: "secondaryLinks",
        type: "{ label, href }[]",
        default: "Playground / …",
        description: "Mid-size secondary links.",
      },
      {
        name: "panelColors",
        type: "[string, string, string, string]",
        default: '["#57cea5","#063124","#0b5c43","#21ba80"]',
        description: "The four curtain panel colors, swept in order.",
      },
      {
        name: "menuColor",
        type: "string",
        default: '"#084331"',
        description: "Menu surface color revealed under the curtains.",
      },
      {
        name: "togglerColor",
        type: "string",
        default: '"#ffffff"',
        description: "Hamburger bar color.",
      },
    ],
  },
  "ascii-logo": {
    demoPath: "src/components/demos/ascii-logo.tsx",
    studioPath: "src/components/studios/ascii-logo.tsx",
    nuance: [
      {
        label: "Image fidelity",
        description:
          "Every glyph comes from a sampled pixel, so the source needs real contrast against the threshold. The canvas reads pixels back, so keep it same-origin or CORS-open.",
      },
      {
        label: "Spring, not snap",
        description:
          "The cursor pushes glyphs out and a spring pulls them home. Stiffness and damping decide whether the wordmark ripples or violently scatters.",
      },
      {
        label: "Density is brightness",
        description:
          "The glyph ramp maps low-to-high brightness; denser characters read as brighter pixels, so the ramp order is the contrast curve.",
      },
    ],
    editable: [
      {
        name: "charColor / gridColor / background",
        control: "color",
        description:
          "Lit glyphs, the resting dot grid, and the frame backdrop.",
      },
      {
        name: "chars",
        control: "text",
        description: "Glyph ramp, ordered dark to bright.",
      },
      {
        name: "pushForce",
        control: "text",
        description: "How hard the cursor scatters nearby glyphs.",
      },
      {
        name: "src",
        control: "asset-url",
        description: `Sampled wordmark, hosted through ${getHostedAssetUrl(
          "ascii-logo/logo.png",
        )}.`,
      },
    ],
    assets: asciiLogoAssets,
    api: [
      {
        name: "src",
        type: "string",
        default: '"https://compronents.dev/assets/ascii-logo/logo.png"',
        description:
          "Logo image, sampled into glyphs. Same-origin or CORS-enabled.",
      },
      {
        name: "background",
        type: "string",
        default: '"#0f0f0f"',
        description: "Frame background color.",
      },
      {
        name: "gridColor",
        type: "string",
        default: '"#171717"',
        description: "Resting dot-grid color.",
      },
      {
        name: "charColor",
        type: "string",
        default: '"#dadada"',
        description: "Lit glyph color.",
      },
      {
        name: "chars",
        type: "string",
        default: '".:+*#%@0369"',
        description: "Glyph ramp, dark to bright.",
      },
      {
        name: "threshold",
        type: "number",
        default: "0.5",
        description: "Brightness (0–1) a pixel must clear to become a glyph.",
      },
      {
        name: "cellSize / cellGap",
        type: "number",
        default: "8 / 2",
        description: "Glyph cell size and gap in px on desktop.",
      },
      {
        name: "mobileCellSize / mobileCellGap",
        type: "number",
        default: "3 / 1",
        description: "Cell size and gap below mobileBreakpoint.",
      },
      {
        name: "mobileBreakpoint",
        type: "number",
        default: "768",
        description:
          "Viewport width under which the denser mobile grid kicks in.",
      },
      {
        name: "pushRadius",
        type: "number",
        default: "5",
        description: "Cursor influence radius, in cells.",
      },
      {
        name: "pushForce",
        type: "number",
        default: "30",
        description: "Strength of the cursor push.",
      },
      {
        name: "spring",
        type: "number",
        default: "0.025",
        description: "Spring stiffness pulling glyphs back home.",
      },
      {
        name: "damping",
        type: "number",
        default: "0.5",
        description: "Velocity damping per frame.",
      },
      {
        name: "flickerMs",
        type: "number",
        default: "50",
        description: "Interval at which lit glyphs reshuffle their character.",
      },
      {
        name: "logoScale",
        type: "number",
        default: "75",
        description: "Logo width as a percentage of the container.",
      },
    ],
  },
  "accordion-frames": {
    demoPath: "src/components/demos/accordion-frames.tsx",
    studioPath: "src/components/studios/accordion-frames.tsx",
    nuance: [
      {
        label: "No animation library",
        description:
          "Every move is one CSS transition on left/width. The component only computes geometry — the browser does the easing, so it stays cheap even with twenty panels.",
      },
      {
        label: "Centered as a set",
        description:
          "The strip is sized for exactly one open panel and centered as a whole, so it never jumps. The focused slat widens in place while the rest compress, and the indicator beams track wherever it lands.",
      },
      {
        label: "Touch vs. hover",
        description:
          "Below the breakpoint the layout thins to fewer panels and focus switches from hover to tap, so the accordion stays usable on a phone.",
      },
    ],
    editable: [
      {
        name: "accentColor",
        control: "color",
        description: "Focus indicator border and the vertical beam color.",
      },
      {
        name: "background",
        control: "color",
        description: "Frame backdrop behind the panels.",
      },
      {
        name: "expandedWidth",
        control: "text",
        description: "Open-panel width in px; the resting slats stay thin.",
      },
      {
        name: "images",
        control: "asset-url",
        description: `Panel images, hosted through ${getHostedAssetUrl(
          "accordion-frames/spotlight-1.jpg",
        )} and the rest of the numbered set.`,
      },
    ],
    assets: accordionFramesAssets,
    api: [
      {
        name: "images",
        type: "string[]",
        default: "spotlight-1…20 (Compronents assets)",
        description:
          "Panel image URLs. The accordion shows up to desktopCount of them.",
      },
      {
        name: "desktopCount",
        type: "number",
        default: "20",
        description: "How many panels to show on wide viewports.",
      },
      {
        name: "mobileCount",
        type: "number",
        default: "10",
        description: "How many panels to show below mobileBreakpoint.",
      },
      {
        name: "expandedWidth",
        type: "number",
        default: "400",
        description: "Open-panel width in px on desktop.",
      },
      {
        name: "mobileExpandedWidth",
        type: "number",
        default: "100",
        description: "Open-panel width in px on mobile.",
      },
      {
        name: "collapsedWidth",
        type: "number",
        default: "20",
        description: "Resting slat width in px.",
      },
      {
        name: "gap",
        type: "number",
        default: "5",
        description: "Gap between slats in px.",
      },
      {
        name: "panelHeight",
        type: "number",
        default: "400",
        description: "Track height in px on desktop.",
      },
      {
        name: "mobilePanelHeight",
        type: "number",
        default: "260",
        description: "Track height in px on mobile.",
      },
      {
        name: "mobileBreakpoint",
        type: "number",
        default: "1000",
        description: "Viewport width under which the mobile layout applies.",
      },
      {
        name: "defaultFocus",
        type: "number",
        default: "0",
        description: "Index of the panel open on first paint.",
      },
      {
        name: "focusIndicator",
        type: "boolean",
        default: "true",
        description: "Draw the bordered focus box with the vertical beams.",
      },
      {
        name: "accentColor",
        type: "string",
        default: '"#ffffff"',
        description: "Focus indicator and beam color.",
      },
      {
        name: "background",
        type: "string",
        default: '"#0f0f0f"',
        description: "Frame background color.",
      },
    ],
  },
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
