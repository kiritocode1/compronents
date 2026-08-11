// Generates src/registry/grain-gradient-field/shaders.ts from the eight
// compiled GLSL programs recorded in tests/fixtures/grain-gradient/.
//
//   node scripts/gen-grain-shaders.mjs
//
// The fixtures are the shaders the original scene actually ran. Every knob the
// component exposes is a numeric literal inside them, so instead of hand-typing
// ~29KB of GLSL we swap each literal for a template slot and let the generator
// re-emit the file. tests/grain-gradient-shaders.test.mjs then proves the
// generated builder reproduces each fixture byte-for-byte at default config,
// which is what makes "1:1" a checked claim rather than a hopeful one.
//
// Then it mirrors the shared engine + shaders into the nav item, so the two
// registry items stay identical without a symlink the shadcn CLI cannot follow.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtures = path.join(root, "tests/fixtures/grain-gradient");
const outFile = path.join(root, "src/registry/grain-gradient-field/shaders.ts");

const read = (name) => fs.readFileSync(path.join(fixtures, name), "utf8");

/** Replace `needle` exactly `times` times, or throw. Silent misses are the
 *  whole failure mode this generator exists to prevent. */
function swap(src, needle, replacement, times = 1) {
  const hits = src.split(needle).length - 1;
  if (hits !== times) {
    throw new Error(
      `expected ${times} occurrence(s) of ${JSON.stringify(
        needle.slice(0, 70),
      )}, found ${hits}`,
    );
  }
  return src.split(needle).join(replacement);
}

const BASE_COLOR =
  "vec3(0.9686274509803922, 0.9725490196078431, 0.9254901960784314)";
const SHAPE_COLOR =
  "vec3(0.803921568627451, 0.807843137254902, 0.7686274509803922)";

// --- gradient (layer 0): the flat base fill -------------------------------
let gradient = read("0-gradient.frag");
gradient = swap(gradient, BASE_COLOR, "vec3(${rgb(c.baseColor)})", 2);
gradient = swap(
  gradient,
  "mix(vec2(0), (uMousePos-0.5), 0.0000)",
  "mix(vec2(0), (uMousePos-0.5), ${n(0)})",
);
gradient = swap(gradient, "uv /= (0.5000*2.)", "uv /= (${n(0.5)}*2.)");
gradient = swap(
  gradient,
  "rotate(uv, (0.0000 - 0.5) * 2. * PI)",
  "rotate(uv, (${n(0)} - 0.5) * 2. * PI)",
);

// --- sdf_shape (layer 1): the raymarched MSDF blob ------------------------
let sdf = read("1-sdf-shape.frag");
sdf = swap(sdf, SHAPE_COLOR, "vec3(${rgb(c.shapeColor)})", 3);
// Shape scale appears three times: getAdjustedP, scene()'s two uses.
sdf = swap(
  sdf,
  "max(0.8800, 0.000000001)",
  "max(${n(c.shapeSize)}, 0.000000001)",
  2,
);
sdf = swap(sdf, "if(0.8800 <= 0.0001)", "if(${n(c.shapeSize)} <= 0.0001)");
sdf = swap(
  sdf,
  "vec2(0.5, 0.6652470187393527)",
  "vec2(${num(c.shapeX)}, ${num(c.shapeY)})",
  2,
);
sdf = swap(sdf, "vec3(0.5, 0.5, 0.5)", "vec3(${rgb(c.shapeRotation)})", 3);
sdf = swap(sdf, "vec3(0.25, 0.25, -3)", "vec3(${rgb(c.lightPosition)})", 3);

// --- noiseBlur (layer 2): two directional smear passes --------------------
const blurSlots = (src) => {
  let s = src;
  s = swap(
    s,
    "rot(0.4212 * -1. * 2.0 * PI)",
    "rot(${n(c.blurAngle)} * -1. * 2.0 * PI)",
  );
  s = swap(
    s,
    "vec2(0.5600, 1.-0.5600)",
    "vec2(${n(c.blurRatio)}, 1.-${n(c.blurRatio)})",
  );
  s = swap(s, "* 5. * 0.2600;", "* 5. * ${n(c.blurScale)};");
  s = swap(
    s,
    "uTime * 0.025 + 0.1600 * 2.",
    "uTime * 0.025 + ${n(c.blurOffset)} * 2.",
  );
  s = swap(s, "(0.1400 + 0.01) * 0.25", "(${n(c.blurAmount)} + 0.01) * 0.25");
  return s;
};
const noiseBlurA = blurSlots(read("2-noise-blur.frag"));
const noiseBlurB = blurSlots(read("2-noise-blur-1.frag"));
if (noiseBlurA !== noiseBlurB) {
  throw new Error("noiseBlur passes diverged; they were identical upstream");
}

// --- sine (layer 3): the slow standing-wave warp --------------------------
let sine = read("3-sine.frag");
sine = swap(sine, "20.0 * 0.1900", "20.0 * ${n(c.waveFrequency)}");
sine = swap(sine, "0.7500 * 0.2", "${n(c.waveAmplitude)} * 0.2");

// --- mouse (layer 4): read pass + ping-pong trail write pass --------------
let mouseRead = read("4-mouse.frag");
mouseRead = swap(
  mouseRead,
  "mouseTrail.z * (1.0000 * 2.0)",
  "mouseTrail.z * (${n(c.trailStrength)} * 2.0)",
);
mouseRead = swap(
  mouseRead,
  "250.0 * 1.0000",
  "250.0 * ${n(c.trailNoiseScale)}",
);

let mouseWrite = read("4-mouse-1.frag");
mouseWrite = swap(
  mouseWrite,
  "float rad = 0.3400 * 0.4",
  "float rad = ${n(c.trailRadius)} * 0.4",
);
mouseWrite = swap(
  mouseWrite,
  "smoothstep(0.0, 1.0, angle)), 0.5700)",
  "smoothstep(0.0, 1.0, angle)), ${n(c.trailDistortion)})",
);
mouseWrite = swap(mouseWrite, "rad * 0.2100", "rad * ${n(c.trailFalloff)}");
mouseWrite = swap(
  mouseWrite,
  "uv / (1.0 + 0.1200 * 0.03) + 0.1200 * 0.015, 0.1200)",
  "uv / (1.0 + ${n(c.trailDilate)} * 0.03) + ${n(c.trailDilate)} * 0.015, ${n(c.trailDilate)})",
);
mouseWrite = swap(
  mouseWrite,
  "draw *= pow(0.5000, 0.2);",
  "draw *= pow(${n(c.trailDecay)}, 0.2);",
);

// --- diffuse (layer 5): the random-tap scatter that reads as grain --------
let diffuse = read("5-diffuse.frag");
diffuse = swap(
  diffuse,
  "float amount = 0.2700 * 2.;",
  "float amount = ${n(c.grainAmount)} * 2.;",
);
diffuse = swap(
  diffuse,
  "max(1. - 0.7800, 2./MAX_ITERATIONS)",
  "max(1. - ${n(c.grainQuality)}, 2./MAX_ITERATIONS)",
);
diffuse = swap(
  diffuse,
  "vec2(0.3800 / aspectRatio, 1.-0.3800)",
  "vec2(${n(c.grainRatio)} / aspectRatio, 1.-${n(c.grainRatio)})",
);

// --- vertex shaders: two variants, neither parameterised ------------------
const VERT_TEXTURE_MATRIX = `#version 300 es
precision mediump float;in vec3 aVertexPosition; in vec2 aTextureCoord;uniform mat4 uMVMatrix; uniform mat4 uPMatrix; uniform mat4 uTextureMatrix;out vec2 vTextureCoord; out vec3 vVertexPosition;void main() { gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); vTextureCoord = (uTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy; }`;
const VERT_PLAIN = `#version 300 es
precision mediump float;in vec3 aVertexPosition; in vec2 aTextureCoord;uniform mat4 uMVMatrix; uniform mat4 uPMatrix;out vec2 vTextureCoord; out vec3 vVertexPosition;void main() { gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); vTextureCoord = aTextureCoord; }`;

/** GLSL carries no backticks or `${`, but escape defensively so a future
 *  fixture edit cannot silently break the emitted template literal. */
const lit = (s) => s.replace(/\\/g, "\\\\").replace(/`/g, "\\`");

const header = `// GENERATED by scripts/gen-grain-shaders.mjs - do not edit by hand.
//
// The eight programs the original scene compiled, with each art-directable
// literal lifted into a template slot. At DEFAULT_CONFIG every builder below
// returns the recorded shader byte-for-byte; tests/grain-gradient-shaders.test.mjs
// asserts exactly that against tests/fixtures/grain-gradient/.
//
// Unicorn Studio's own compiler printed parameters with four decimals and
// colours at full precision, so \`n()\` and \`num()\`/\`rgb()\` reproduce that
// formatting rather than inventing a new one.

export type Vec3 = readonly [number, number, number];

export interface GrainFieldConfig {
  /** Flat fill the whole stack is composited over. Linear 0-1 RGB. */
  baseColor: Vec3;
  /** Flat-shaded colour of the raymarched shape. Linear 0-1 RGB. */
  shapeColor: Vec3;
  /** Shape scale. Larger fills more of the frame. */
  shapeSize: number;
  /** Shape centre, in 0-1 texture space (y counts up from the bottom). */
  shapeX: number;
  shapeY: number;
  /** Per-axis shape orientation, 0-1 mapping onto a full turn. */
  shapeRotation: Vec3;
  /** Key light position; z is the distance in front of the shape. */
  lightPosition: Vec3;
  /** Direction of the noise smear, 0-1 mapping onto a full turn. */
  blurAngle: number;
  /** Balance between the smear's two axes. */
  blurRatio: number;
  /** Spatial frequency of the noise driving the smear. */
  blurScale: number;
  /** Constant added to the noise's time axis; reshuffles the pattern. */
  blurOffset: number;
  /** Smear distance. */
  blurAmount: number;
  /** Standing-wave frequency of the warp pass. */
  waveFrequency: number;
  /** Standing-wave amplitude of the warp pass. */
  waveAmplitude: number;
  /** How hard the pointer trail displaces the frame beneath it. */
  trailStrength: number;
  /** Grain frequency inside the pointer trail. */
  trailNoiseScale: number;
  /** Pointer trail radius. */
  trailRadius: number;
  /** How much the trail is swirled before it is stamped. */
  trailDistortion: number;
  /** Trail edge softness; lower is softer. */
  trailFalloff: number;
  /** Outward creep of the trail as it ages. */
  trailDilate: number;
  /** Per-frame trail decay. Lower fades faster. */
  trailDecay: number;
  /** Scatter radius of the final pass. This is what reads as film grain. */
  grainAmount: number;
  /** Fraction of the 24 scatter taps actually sampled. */
  grainQuality: number;
  /** Balance between the scatter's two axes. */
  grainRatio: number;
}

/** The scene as it shipped: a warm off-white ground under a sage shape. */
export const DEFAULT_CONFIG: GrainFieldConfig = {
  baseColor: [0.9686274509803922, 0.9725490196078431, 0.9254901960784314],
  shapeColor: [0.803921568627451, 0.807843137254902, 0.7686274509803922],
  shapeSize: 0.88,
  shapeX: 0.5,
  shapeY: 0.6652470187393527,
  shapeRotation: [0.5, 0.5, 0.5],
  lightPosition: [0.25, 0.25, -3],
  blurAngle: 0.4212,
  blurRatio: 0.56,
  blurScale: 0.26,
  blurOffset: 0.16,
  blurAmount: 0.14,
  waveFrequency: 0.19,
  waveAmplitude: 0.75,
  trailStrength: 1,
  trailNoiseScale: 1,
  trailRadius: 0.34,
  trailDistortion: 0.57,
  trailFalloff: 0.21,
  trailDilate: 0.12,
  trailDecay: 0.5,
  grainAmount: 0.27,
  grainQuality: 0.78,
  grainRatio: 0.38,
};

/** Four decimals, matching how the upstream compiler printed parameters. */
const n = (v: number) => v.toFixed(4);
/** Full precision, matching how the upstream compiler printed colours. */
const num = (v: number) => String(v);
const rgb = (v: Vec3) => \`\${v[0]}, \${v[1]}, \${v[2]}\`;

export const VERT_TEXTURE_MATRIX = \`${lit(VERT_TEXTURE_MATRIX)}\`;

export const VERT_PLAIN = \`${lit(VERT_PLAIN)}\`;
`;

const builder = (name, body, doc) =>
  `\n/** ${doc} */\nexport const ${name} = (c: GrainFieldConfig) => \`${lit(body)}\`;\n`;

const out =
  header +
  builder(
    "gradientFrag",
    gradient,
    "Layer 0 - flat base fill the rest of the stack composites over.",
  ) +
  builder(
    "sdfShapeFrag",
    sdf,
    "Layer 1 - raymarches an MSDF-extruded shape and flat-shades it by N-dot-L.",
  ) +
  builder(
    "noiseBlurFrag",
    noiseBlurA,
    "Layer 2 - 32-tap directional smear steered by 4D simplex noise. Run twice.",
  ) +
  builder(
    "sineFrag",
    sine,
    "Layer 3 - slow standing-wave warp of the whole frame.",
  ) +
  builder(
    "mouseReadFrag",
    mouseRead,
    "Layer 4 read pass - displaces the frame along the trail buffer's hue/value.",
  ) +
  builder(
    "mouseWriteFrag",
    mouseWrite,
    "Layer 4 ping-pong pass - accumulates pointer motion as hue=angle, value=speed.",
  ) +
  builder(
    "diffuseFrag",
    diffuse,
    "Layer 5 - 24 random taps per pixel. The scatter is what reads as grain.",
  );

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log(`wrote ${path.relative(root, outFile)} (${out.length} bytes)`);

// --- mirror shared sources into the nav item ------------------------------
// Both registry items must install standalone, and the integrity test refuses
// relative imports that reach outside an item, so the nav ships its own copy.
const MIRRORED = ["shaders.ts", "engine.ts"];
const from = path.join(root, "src/registry/grain-gradient-field");
const to = path.join(root, "src/registry/grain-gradient-nav");
if (fs.existsSync(to)) {
  for (const file of MIRRORED) {
    const src = path.join(from, file);
    if (!fs.existsSync(src)) continue;
    fs.writeFileSync(path.join(to, file), fs.readFileSync(src));
    console.log(`mirrored ${file} -> grain-gradient-nav/`);
  }
}
