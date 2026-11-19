"use client";

/**
 * Patch Cables: a port of the nrly.fun patch experiment (patch.nrly.fun), a
 * playable dot lattice that patches cables and turns them into sound.
 *
 * Mechanism. Dots sit on the even cells of a square lattice, so every dot has
 * four diagonal neighbours. Each cell owns one diagonal, and a spring per cell
 * (E) grows two stubs out of its end dots that meet and fuse into a neck. One
 * full-screen fragment shader draws the whole field as a signed distance
 * field: dots, necks and signal beads are joined with a C2 smooth union, so
 * the goo has no crease. Hovering pulls nearby cells towards joined; dragging
 * patches a cell for good, and patched cells fill with ink that creeps from
 * the dot you started on. Beads of signal run along inked cables and split at
 * every jack. A curl-noise dye field, carried by the cursor's wake, tints the
 * background behind the dots.
 *
 * Sound. Every time a neck closes (E crosses 0.52, released below 0.38), the
 * cell plays one note. Pitch comes from the cell's position on a 15 step
 * pentatonic ladder, so any gesture is in key. Pan follows x. Four voices:
 * Mist (detuned sines into a generated 3.6s reverb), Pluck (Karplus-Strong
 * strings, a mallet, a harp and an FM bell in bands across the field), Bloop
 * (a sine that glides up) and Acid (two detuned saws through a resonant
 * lowpass with a snapping envelope). All generators share one tempo clock, so
 * rain, signal and the sequencer stay in time with each other.
 *
 * The shaders, spring constants, ink timings and synth graph are the
 * source's, unchanged. What moved: the control faceplate became props, the
 * window became the component's box, and the brand mark became a plain cable
 * glyph.
 *
 * BLANK - aryank.space
 */

import {
  type CSSProperties,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export type PatchCablesVoice = "off" | "mist" | "pluck" | "bloop" | "acid";
export type PatchCablesTool = "patch" | "erase";
export type PatchCablesPattern = "tiles" | "patchbay" | "none";

/** Background, dots, patch ink, jack sockets and signal core, plus an optional fluid dye colour. */
export interface PatchCablesPalette {
  name: string;
  bg: string;
  fg: string;
  patch: string;
  socket: string;
  signal: string;
  fluid?: string;
}

/** The source's three palettes. */
export const PATCH_CABLES_PALETTES: PatchCablesPalette[] = [
  {
    name: "Dash of Lime",
    bg: "#475e62",
    fg: "#e5f56b",
    patch: "#648279",
    socket: "#e5f56b",
    signal: "#475e62",
  },
  {
    name: "Lime Cordial",
    bg: "#e5f56b",
    fg: "#4b5b5d",
    patch: "#7a9394",
    socket: "#e5f56b",
    signal: "#ffffff",
  },
  {
    name: "Slated",
    bg: "#8ea49d",
    fg: "#475e62",
    patch: "#607171",
    socket: "#d5e273",
    signal: "#e5f56b",
    fluid: "#e5f56b",
  },
];

/** Effects. magnet, ripples, breathe, sockets and signal are the source panel's chips; fluid, grain and scope are its hidden switches. */
export interface PatchCablesEffects {
  magnet: boolean;
  ripples: boolean;
  breathe: boolean;
  sockets: boolean;
  signal: boolean;
  fluid: boolean;
  grain: boolean;
  scope: boolean;
}

/** Generators: everything that plays the field on its own, on the tempo clock. */
export interface PatchCablesGenerators {
  wander: boolean;
  rain: boolean;
  selfpatch: boolean;
  lfo: boolean;
  seq: boolean;
}

export const PATCH_CABLES_EFFECTS: PatchCablesEffects = {
  magnet: true,
  ripples: true,
  breathe: false,
  sockets: true,
  signal: true,
  fluid: true,
  grain: true,
  scope: false,
};

export const PATCH_CABLES_GENERATORS: PatchCablesGenerators = {
  wander: false,
  rain: false,
  selfpatch: false,
  lfo: false,
  seq: false,
};

export interface PatchCablesProps {
  palette?: PatchCablesPalette;
  /** Synth voice, or "off". Source default: Mist. */
  voice?: PatchCablesVoice;
  /** Tempo for every generator, the signal clock and the sequencer, 60 to 180. */
  bpm?: number;
  effects?: Partial<PatchCablesEffects>;
  generators?: Partial<PatchCablesGenerators>;
  /** Cursor reach in lattice units, 0.6 to 6. */
  reach?: number;
  /** Cursor smoothing, 0 to 1. */
  smoothing?: number;
  /** Seconds the hover trail takes to decay, 0 (off) to 3. */
  trailDecay?: number;
  /** What a drag does. Holding Shift swaps it. */
  tool?: PatchCablesTool;
  /** Hand-drawn patches fade 5s after they are drawn. */
  fadePatches?: boolean;
  /** Lattice pitch in CSS px, 16 to 90. Changing it rebuilds the grid. */
  spacing?: number;
  /** Dot radius in lattice units, 0.28 to 0.62. */
  dotSize?: number;
  /** Neck width and blend softness, 0 to 1. */
  goo?: number;
  /** Narrowest neck, as a share of the full one, 0.2 to 1. */
  minNeck?: number;
  /** Pattern laid down on mount. "tiles" is the source's default tiling. */
  pattern?: PatchCablesPattern;
  /** The pill that fades in after load and leaves once you patch. */
  showHint?: boolean;
  /** The corner readout: visible grid size and cable count. */
  showReadout?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface PatchCablesHandle {
  /** Remove every patch, including generator walks and pulses. */
  clear: () => void;
  /** Lay the tiling over the grid, keeping hand-drawn patches. */
  tiles: () => void;
  /** Scatter random short cable runs. */
  patchbay: () => void;
}

interface Settings {
  patchFade: boolean;
  flStr: number;
  flSwirl: number;
  flFade: number;
  flSize: number;
  flForce: number;
  fade: number;
  ink: number;
  smooth: number;
  spacing: number;
  size: number;
  goo: number;
  reach: number;
  trail: number;
  tool: PatchCablesTool;
  pal: PatchCablesPalette;
  fx: PatchCablesEffects & PatchCablesGenerators;
  bpm: number;
  minNeck: number;
  voice: PatchCablesVoice;
}

interface Engine {
  update: (next: Settings) => void;
  clear: () => void;
  tiles: () => void;
  patchbay: () => void;
  dispose: () => void;
}

interface EngineUi {
  hint: HTMLDivElement | null;
  hintText: HTMLSpanElement | null;
  readout: HTMLDivElement | null;
}

const VS = `#version 300 es
in vec2 a; void main(){ gl_Position=vec4(a,0.,1.); }`;
// Texel per lattice cell: r = cable strength, g = dot swell, b/a = dot offset (corner dot only).
const FS = `#version 300 es
precision highp float;
uniform sampler2D uS,uC; uniform ivec2 uN; uniform vec2 uO;
uniform float uSc,uH,uR,uNeck,uK,uKb,uT,uGrain,uGlow,uMin;
uniform vec3 uBg,uFg,uPc,uSock,uSigc;
uniform sampler2D uD,uA; uniform float uFl; uniform vec2 uRes; uniform vec3 uFc;
uniform vec3 uPu[24]; uniform int uPn;
out vec4 o;
// Cubic smooth union (C2, so joins have no visible crease) that also blends the patch-colour weight.
void U(inout float d,inout float m,float d2,float m2,float k){
  float h=max(k-abs(d-d2),0.)/k, s=h*h*h;
  float w=d2<d? 1.-.5*s : .5*s;
  d=min(d,d2)-s*k/6.; m=mix(m,m2,w);
}
float seg(vec2 p,vec2 a,vec2 b){ vec2 pa=p-a,ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.); return length(pa-ba*h); }
float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float vn(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y); }
// Slowly creeping noise that roughens the ink front.
float bleed(vec2 p){ return vn(p*5.+vec2(uT*.35,-uT*.2))*.6+vn(p*11.-vec2(uT*.25,uT*.3))*.4-.5; }
bool inb(ivec2 q){ return q.x>=0&&q.y>=0&&q.x<uN.x&&q.y<uN.y; }
vec2 pos(ivec2 q){ return inb(q)? vec2(q)+(texelFetch(uS,q,0).ba-.5) : vec2(q); }
void main(){
  vec2 fc=vec2(gl_FragCoord.x,uH-gl_FragCoord.y);
  vec2 p=(fc-uO)/uSc;
  ivec2 c=ivec2(floor(p));
  float d=1e3,m=0.,hd=1e3;
  // Wide enough window that displaced dots and long necks are never clipped at a cell edge.
  for(int y=-2;y<=3;y++) for(int x=-2;x<=3;x++){
    ivec2 q=c+ivec2(x,y);
    if(!inb(q)) continue;
    if(((q.x+q.y)&1)!=0) continue;
    if(length(p-vec2(q))>1.65) continue;
    vec4 s=texelFetch(uS,q,0);
    vec2 bp=vec2(q)+s.ba-.5;
    float db=length(p-bp)-uR*(1.+.2*s.g);
    // Jack socket: a hole that opens in dots with a patched cable plugged in.
    if(length(p-bp)<.45*uR){
      float jv=floor(texelFetch(uC,q,0).a*255.+.5);
      float J=mod(jv,128.)/127.;
      if(J>.01) hd=min(hd,length(p-bp)-.38*uR*J);
    }
    float kb=.03+uKb*s.g;
    if(db>d+kb) continue;
    // Dot ink: grows from its entry point (centre for the first dot, the cable side for the rest).
    vec4 cc=texelFetch(uC,q,0); float mi=0.;
    if(cc.g>.004){
      float bv=floor(cc.a*255.+.5),ang=(cc.b-.5)*6.2831853;
      vec2 dir=bv>=128.?vec2(cos(ang),sin(ang)):vec2(0.); float rr=uR*(1.+.2*s.g);
      float reach=rr*(1.15+1.15*min(length(dir),1.))*cc.g;
      mi=cc.g>.995?1.:smoothstep(-.04,.04,reach-length(p-(bp+dir*rr))+bleed(p)*.22*rr);
    }
    U(d,m,db,mi,kb);
  }
  // The activity map says whether any cable within two cells is live, so most pixels skip this loop.
  bool anyC=inb(c)&&texelFetch(uA,c,0).r>0.;
  for(int y=-2;y<=2;y++) for(int x=-2;x<=2;x++){
    if(!anyC) break;
    ivec2 q=c+ivec2(x,y);
    if(!inb(q)) continue;
    if(length(p-vec2(q)-.5)>2.1) continue;
    float e=texelFetch(uS,q,0).r*1.5-.25;
    if(e<.004) continue;
    ivec2 a,b;
    if(((q.x+q.y)&1)==0){ a=q; b=q+ivec2(1,1); } else { a=q+ivec2(0,1); b=q+ivec2(1,0); }
    // Below 0.5 two stubs grow out of each dot and meet; above 0.5 the joined neck thickens.
    vec2 pa=pos(a),pb=pos(b);
    // Cable ink: progress P travels from the source end (high bit flips direction).
    float cv=floor(texelFetch(uC,q,0).r*255.+.5), P=mod(cv,128.)/127.;
    vec2 ab=pb-pa; float hh=clamp(dot(p-pa,ab)/dot(ab,ab),0.,1.); float tt=cv>=128.?1.-hh:hh;
    float pc=P<=0.?0.:(P>=1.?1.:smoothstep(-.05,.05,P*1.12-.06-tt+bleed(p)*.1));
    float full=uNeck*uR,base=uMin*full;
    if(e>=.5){
      float s=(e-.5)/.5;
      U(d,m,seg(p,pa,pb)-mix(base,full,s),pc,mix(uK*.85,uK,clamp(s,0.,1.)));
    } else {
      // Blend strength fades with the stub, so a retracting stub sinks into its dot with no pop.
      float s=e/.5,L=.5*s*(2.-s),g=smoothstep(0.,.42,s),rad=base*mix(.7,1.,s),k=mix(.015,uK*.85,g);
      // Join the two stubs with a hard min first, so they meet without a bulge and match the full neck exactly.
      U(d,m,min(seg(p,pa,mix(pa,pb,L)),seg(p,pb,mix(pb,pa,L)))-rad,pc,k);
    }
  }
  // Signal pulses: a bead that bulges the cable as it travels, with a bright core.
  float core=1e3;
  for(int i=0;i<24;i++){
    if(i>=uPn) break;
    vec3 pu=uPu[i]; float dp=length(p-pu.xy);
    if(dp>1.2) continue;
    U(d,m,dp-uR*.66*pu.z,1.,uK*.7);
    core=min(core,dp-uR*.24*pu.z);
  }
  float aa=.9/uSc;
  float mask=smoothstep(aa,-aa,d);
  vec3 ink=mix(uFg,uPc,clamp(m,0.,1.));
  // Fluid dye tints only the background, in the palette's patch colour.
  float dye=uFl>0.?1.-exp(-1.8*max(texture(uD,gl_FragCoord.xy/uRes).r,0.)):0.;
  vec3 bgc=mix(uBg,uFc,dye*uFl);
  vec3 col=mix(bgc,ink,mask);
  col=mix(col,uSock,smoothstep(aa,-aa,hd)*mask);
  col=mix(col,uSigc,smoothstep(aa,-aa,core)*mask*.9);
  col+=(hash(gl_FragCoord.xy+fract(uT*7.)*311.)-.5)*uGrain;
  o=vec4(col,1.);
}`;

const FVS = `#version 300 es
in vec2 a; out vec2 uv; void main(){ uv=a*.5+.5; gl_Position=vec4(a,0.,1.); }`;
const FHEAD = `#version 300 es
precision highp float; in vec2 uv; out vec4 o; uniform vec2 tx;`;
const FNOISE = `
float h2(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float vn(vec2 p){ vec2 i=floor(p),f=fract(p); vec2 u=f*f*f*(f*(f*6.-15.)+10.);
  return mix(mix(h2(i),h2(i+vec2(1,0)),u.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),u.x),u.y); }
float psi(vec2 p,float t){ return vn(p+vec2(t*.11,-t*.07))+.5*vn(p*2.03-vec2(t*.13,t*.09)); }
vec2 curl(vec2 p,float t){ float e=.02; return vec2(psi(p+vec2(0,e),t)-psi(p-vec2(0,e),t),-(psi(p+vec2(e,0),t)-psi(p-vec2(e,0),t)))/(2.*e); }`;
const FLUID_SRCS = {
  // Up to 16 splats in one pass.
  splat: `${FHEAD} uniform sampler2D uSrc; uniform vec4 uPt[16]; uniform vec3 uVal[16]; uniform int uN; uniform float asp,cap,rs;
      void main(){ vec4 b=texture(uSrc,uv); vec3 acc=vec3(0);
        for(int i=0;i<16;i++){ if(i>=uN) break; vec2 d=uv-uPt[i].xy; d.x*=asp; acc+=uVal[i]*exp(-dot(d,d)/(uPt[i].z*rs)); }
        o=b+vec4(acc,0.); o.x=min(o.x,cap); }`,
  // Wake: the cursor's push, carried along itself, softened and decaying.
  wake: `${FHEAD} uniform sampler2D uSrc; uniform float dt,diss;
      void main(){ vec2 v=texture(uSrc,uv).xy; vec2 c=uv-v*dt;
        vec4 s=texture(uSrc,c)*.6+.1*(texture(uSrc,c+vec2(tx.x,0))+texture(uSrc,c-vec2(tx.x,0))+texture(uSrc,c+vec2(0,tx.y))+texture(uSrc,c-vec2(0,tx.y)));
        o=vec4(s.xy*diss,0,1); }`,
  // Ink: moved by curl noise + wake, then faded.
  ink: `${FHEAD} uniform sampler2D uSrc,uWake; uniform float dt,diss,amp,asp,t;${FNOISE}
      void main(){ vec2 q=uv*vec2(asp,1.)*2.6; vec2 v=curl(q,t)*amp*vec2(1./asp,1.)+texture(uWake,uv).xy;
        vec2 c=uv-v*dt; float d=texture(uSrc,c).x;
        // A touch of blur keeps the edges soft as it thins out.
        float b=(texture(uSrc,c+vec2(tx.x,0)).x+texture(uSrc,c-vec2(tx.x,0)).x+texture(uSrc,c+vec2(0,tx.y)).x+texture(uSrc,c-vec2(0,tx.y)).x)*.25;
        o=vec4(mix(d,b,.12)*diss,0,0,1); }`,
};

const SCALE = [0, 3, 5, 7, 10];
const PLUCKS = ["string", "mallet", "harp", "fm", "soft"] as const;
type PluckKind = (typeof PLUCKS)[number];

function hex(h: string): [number, number, number] {
  const n = Number.parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
function segDist(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
) {
  const dx = bx - ax;
  const dy = by - ay;
  const l = dx * dx + dy * dy;
  let t = l > 1e-6 ? ((px - ax) * dx + (py - ay) * dy) / l : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return Math.hypot(px - ax - dx * t, py - ay - dy * t);
}
const sstep = (h: number) => (h <= 0 ? 0 : h >= 1 ? 1 : h * h * (3 - 2 * h));

interface Brush {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  amt: number;
  rv: number;
}
interface Splat {
  x: number;
  y: number;
  vx: number;
  vy: number;
  d: number;
  r: number;
}
interface Target {
  t: WebGLTexture;
  f: WebGLFramebuffer;
  w: number;
  h: number;
}
interface Pair {
  r: Target;
  w: Target;
  swap: () => void;
}
interface Pulse {
  c: number;
  dir: number;
  t: number;
  gen: number;
}

/**
 * Starts the field on a canvas inside root. Everything the source kept in one
 * closure lives here; the component only feeds it settings and calls dispose.
 */
function startEngine(
  root: HTMLDivElement,
  canvas: HTMLCanvasElement,
  initial: Settings,
  pattern: PatchCablesPattern,
  ui: EngineUi,
): Engine | null {
  let S: Settings = initial;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const glc = canvas.getContext("webgl2", { antialias: false });
  if (!glc) return null;
  const gl: WebGL2RenderingContext = glc;

  function sh(t: number, s: string) {
    const x = gl.createShader(t) as WebGLShader;
    gl.shaderSource(x, s);
    gl.compileShader(x);
    if (!gl.getShaderParameter(x, gl.COMPILE_STATUS))
      console.error(gl.getShaderInfoLog(x));
    return x;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API method, not a React Hook.
  gl.useProgram(prog);
  const vb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vb);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  const aLoc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(aLoc);
  gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
  const U: Record<string, WebGLUniformLocation | null> = {};
  for (const n of [
    "uS",
    "uN",
    "uO",
    "uSc",
    "uH",
    "uR",
    "uNeck",
    "uK",
    "uKb",
    "uT",
    "uGrain",
    "uGlow",
    "uMin",
    "uBg",
    "uFg",
    "uPc",
    "uC",
    "uPu",
    "uPn",
    "uSock",
    "uSigc",
    "uD",
    "uFl",
    "uRes",
    "uFc",
    "uA",
  ])
    U[n] = gl.getUniformLocation(prog, n);
  gl.uniform1i(U.uS, 0);
  gl.uniform1i(U.uC, 1);
  gl.activeTexture(gl.TEXTURE1);
  const ctex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, ctex);
  for (const p of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER])
    gl.texParameteri(gl.TEXTURE_2D, p, gl.NEAREST);
  gl.activeTexture(gl.TEXTURE0);
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  for (const p of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER])
    gl.texParameteri(gl.TEXTURE_2D, p, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

  // Grid state. Cell (i,j) owns the diagonal joining its two even-parity corners, plus the dot at (i,j) when i+j is even.
  let mv = 1;
  let dirty = 4;
  let idleFrames = 0;
  let lastFlT = -1e9;
  let rs = 1;
  let slowRuns = 0;
  const startT = performance.now();
  let ftAcc = 0;
  let ftN = 0;
  let dpr = 1;
  let cw = 0;
  let ch = 0;
  let sc = 1;
  let N: [number, number] = [0, 0];
  let O: [number, number] = [0, 0];
  let built = false;
  let atex: WebGLTexture | null = null;
  let JN!: Uint8Array;
  let abuf!: Uint8Array;
  let atmp!: Uint8Array;
  let FA!: Float32Array;
  let born!: Float64Array;
  let JK!: Float32Array;
  let CP!: Float32Array;
  let CS!: Uint8Array;
  let CD!: Uint8Array;
  let DF!: Float32Array;
  let DX!: Float32Array;
  let DY!: Float32Array;
  let DE!: Uint8Array;
  let cbuf!: Uint8Array;
  let E!: Float32Array;
  let V!: Float32Array;
  let H!: Float32Array;
  let B!: Float32Array;
  let BH!: Float32Array;
  let OX!: Float32Array;
  let OY!: Float32Array;
  let VX!: Float32Array;
  let VY!: Float32Array;
  let patched!: Uint8Array;
  let ptime!: Float64Array;
  let onState!: Uint8Array;
  let buf!: Uint8Array;

  // ---------- Fluid: ink carried by a curl-noise flow plus your cursor's wake, drawn behind the dots ----------
  // No pressure solve: the swirl field is divergence-free by construction, so it never stalls or blows up.
  const FL = (() => {
    const ok = !!(
      gl.getExtension("EXT_color_buffer_float") ||
      gl.getExtension("EXT_color_buffer_half_float")
    );
    if (!ok) return null;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const fb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, fb);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    type Prog = {
      pr: WebGLProgram;
      u: Record<string, WebGLUniformLocation | null>;
    };
    const P: Partial<Record<keyof typeof FLUID_SRCS, Prog>> = {};
    for (const n of Object.keys(FLUID_SRCS) as (keyof typeof FLUID_SRCS)[]) {
      const pr = gl.createProgram();
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, FVS));
      gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FLUID_SRCS[n]));
      gl.bindAttribLocation(pr, 0, "a");
      gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(pr));
        return null;
      }
      const u: Record<string, WebGLUniformLocation | null> = {};
      const cnt = gl.getProgramParameter(pr, gl.ACTIVE_UNIFORMS) as number;
      for (let q = 0; q < cnt; q++) {
        const info = gl.getActiveUniform(pr, q);
        if (info) u[info.name] = gl.getUniformLocation(pr, info.name);
      }
      P[n] = { pr, u };
    }
    let W = 0;
    let Hh = 0;
    let dye: Pair | null = null;
    let wake: Pair | null = null;
    let simT = 0;
    function target(w: number, h: number): Target {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA16F,
        w,
        h,
        0,
        gl.RGBA,
        gl.HALF_FLOAT,
        null,
      );
      const f = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        t,
        0,
      );
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return { t, f, w, h };
    }
    const pair = (w: number, h: number): Pair => {
      const a = target(w, h);
      const b = target(w, h);
      return {
        r: a,
        w: b,
        swap() {
          const x = this.r;
          this.r = this.w;
          this.w = x;
        },
      };
    };
    function free(x: Pair | null) {
      if (!x) return;
      for (const o of [x.r, x.w]) {
        gl.deleteTexture(o.t);
        gl.deleteFramebuffer(o.f);
      }
    }
    function resize() {
      const s = Math.min(1, 360 / Math.max(cw, ch));
      const nW = Math.max(16, Math.round(cw * s));
      const nH = Math.max(16, Math.round(ch * s));
      if (nW === W && nH === Hh) return;
      free(dye);
      free(wake);
      W = nW;
      Hh = nH;
      dye = pair(W, Hh);
      wake = pair(Math.ceil(W / 2), Math.ceil(Hh / 2));
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    type Bind = (nm: string, tx: Target) => void;
    function run(
      name: keyof typeof FLUID_SRCS,
      dst: Target,
      set: (bind: Bind, u: Record<string, WebGLUniformLocation | null>) => void,
    ) {
      const p = P[name] as Prog;
      // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API method, not a React Hook.
      gl.useProgram(p.pr);
      if (p.u.tx) gl.uniform2f(p.u.tx, 1 / dst.w, 1 / dst.h);
      let unit = 3;
      set((nm, tx) => {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, tx.t);
        gl.uniform1i(p.u[nm] ?? null, unit);
        unit++;
      }, p.u);
      gl.viewport(0, 0, dst.w, dst.h);
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst.f);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    const queue: Splat[] = [];
    // Brushes are in lattice units. Splats are uv (y up); velocity is uv per second.
    function addBrush(b: Brush, dt: number) {
      const ax = O[0] + b.ax * sc;
      const ay = O[1] + b.ay * sc;
      const bx = O[0] + b.bx * sc;
      const by = O[1] + b.by * sc;
      const dx = bx - ax;
      const dy = by - ay;
      const sp = Math.hypot(dx, dy) / dt;
      if (b.amt < 0.05) return;
      const r = ((S.reach * sc * S.flSize) / ch) ** 2;
      // Spread splats along the segment so fast strokes leave a continuous ribbon.
      const n = Math.min(
        6,
        1 + Math.floor(Math.hypot(dx, dy) / (Math.sqrt(r) * ch * 0.6)),
      );
      const k = Math.min(1, 0.15 + sp / (cw * 0.6)) * b.amt;
      for (let q = 1; q <= n; q++) {
        const t = q / n;
        const px = ax + dx * t;
        const py = ay + dy * t;
        lastFlT = performance.now();
        queue.push({
          x: px / cw,
          y: 1 - py / ch,
          vx: (dx / dt / cw) * S.flForce * 0.5,
          vy: (-dy / dt / ch) * S.flForce * 0.5,
          d: ((k * 0.42) / n) * Math.min(1.5, dt * 60),
          r,
        });
      }
    }
    function puff(lx: number, ly: number) {
      const px = O[0] + lx * sc;
      const py = O[1] + ly * sc;
      const r = ((sc * 0.9) / ch) ** 2;
      lastFlT = performance.now();
      for (let q = 0; q < 8; q++) {
        const a = (q / 8) * Math.PI * 2;
        queue.push({
          x: (px + Math.cos(a) * sc * 0.6) / cw,
          y: 1 - (py + Math.sin(a) * sc * 0.6) / ch,
          vx: Math.cos(a) * 0.25 * S.flForce,
          vy: -Math.sin(a) * 0.25 * S.flForce,
          d: 0.12,
          r,
        });
      }
    }
    function step(dt: number) {
      resize();
      const dyeP = dye as Pair;
      const wakeP = wake as Pair;
      simT += dt;
      gl.bindVertexArray(vao);
      gl.disable(gl.BLEND);
      const asp = cw / ch;
      const all = queue.splice(0, 64);
      queue.length = 0;
      for (let c0 = 0; c0 < all.length; c0 += 16) {
        const ch_ = all.slice(c0, c0 + 16);
        const n = ch_.length;
        const pt = new Float32Array(64);
        const vw = new Float32Array(48);
        const vd = new Float32Array(48);
        ch_.forEach((s_, q) => {
          pt.set([s_.x, s_.y, s_.r, 0], q * 4);
          vw.set([s_.vx, s_.vy, 0], q * 3);
          vd.set([s_.d, 0, 0], q * 3);
        });
        const go = (pp: Pair, val: Float32Array, rsc: number, cap: number) =>
          run("splat", pp.w, (bind, u) => {
            bind("uSrc", pp.r);
            gl.uniform4fv(u["uPt[0]"] ?? null, pt);
            gl.uniform3fv(u["uVal[0]"] ?? null, val);
            gl.uniform1i(u.uN ?? null, n);
            gl.uniform1f(u.asp ?? null, asp);
            gl.uniform1f(u.cap ?? null, cap);
            gl.uniform1f(u.rs ?? null, rsc);
          });
        go(wakeP, vw, 1.4, 1e3);
        wakeP.swap();
        go(dyeP, vd, 1, 1.6);
        dyeP.swap();
      }
      run("wake", wakeP.w, (bind, u) => {
        bind("uSrc", wakeP.r);
        gl.uniform1f(u.dt ?? null, dt);
        gl.uniform1f(u.diss ?? null, Math.exp(-dt * 2.4));
      });
      wakeP.swap();
      run("ink", dyeP.w, (bind, u) => {
        bind("uSrc", dyeP.r);
        bind("uWake", wakeP.r);
        gl.uniform1f(u.dt ?? null, dt);
        gl.uniform1f(u.diss ?? null, Math.exp(-dt / S.flFade));
        gl.uniform1f(u.amp ?? null, S.flSwirl * 0.0035);
        gl.uniform1f(u.asp ?? null, asp);
        gl.uniform1f(u.t ?? null, simT);
      });
      dyeP.swap();
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.bindVertexArray(null);
      gl.viewport(0, 0, cw, ch);
    }
    return {
      step,
      addBrush,
      puff,
      dye: () => (dye ? dye.r.t : null),
      dispose: () => {
        free(dye);
        free(wake);
      },
    };
  })();

  function build() {
    const old = built ? { N: N.slice() as [number, number], patched } : null;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5) * rs;
    cw = Math.max(1, Math.round(root.clientWidth * dpr));
    ch = Math.max(1, Math.round(root.clientHeight * dpr));
    canvas.width = cw;
    canvas.height = ch;
    sc = S.spacing * dpr;
    N = [Math.ceil(cw / sc) + 4, Math.ceil(ch / sc) + 4];
    O = [(cw - (N[0] - 1) * sc) / 2, (ch - (N[1] - 1) * sc) / 2];
    const n = N[0] * N[1];
    const F = () => new Float32Array(n);
    E = F();
    V = F();
    H = F();
    CP = F();
    DF = F();
    JK = F();
    DX = F();
    DY = F();
    CS = new Uint8Array(n);
    CD = new Uint8Array(n);
    DE = new Uint8Array(n);
    B = F();
    BH = F();
    OX = F();
    OY = F();
    VX = F();
    VY = F();
    patched = new Uint8Array(n);
    JN = new Uint8Array(n);
    born = new Float64Array(n);
    abuf = new Uint8Array(n);
    atmp = new Uint8Array(n);
    FA = new Float32Array(n);
    onState = new Uint8Array(n);
    ptime = new Float64Array(n);
    buf = new Uint8Array(n * 4);
    cbuf = new Uint8Array(n * 4);
    built = true;
    if (old) {
      const di = Math.floor((N[0] - old.N[0]) / 2);
      let dj = Math.floor((N[1] - old.N[1]) / 2);
      if ((di + dj) & 1) dj += 1;
      for (let j = 0; j < old.N[1]; j++)
        for (let i = 0; i < old.N[0]; i++) {
          const ni = i + di;
          const nj = j + dj;
          if (ni < 0 || nj < 0 || ni >= N[0] || nj >= N[1]) continue;
          const b = nj * N[0] + ni;
          patched[b] = old.patched[j * old.N[0] + i];
          if (patched[b]) {
            E[b] = 1;
            onState[b] = 1;
            if (patched[b] === 2) {
              CP[b] = 1;
              CS[b] = 1;
              born[b] = performance.now();
            }
          }
        }
    }
    if (old)
      for (let k = 0; k < n; k++)
        if (patched[k] === 2) {
          const [a, b] = ends(k % N[0], Math.floor(k / N[0]));
          for (const x of [a, b])
            if (x >= 0) {
              DE[x] = 1;
              DF[x] = 1;
            }
        }
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA8,
      N[0],
      N[1],
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    );
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, ctex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA8,
      N[0],
      N[1],
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    );
    if (!atex) {
      atex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE6);
      gl.bindTexture(gl.TEXTURE_2D, atex);
      for (const p of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER])
        gl.texParameteri(gl.TEXTURE_2D, p, gl.NEAREST);
    }
    gl.activeTexture(gl.TEXTURE6);
    gl.bindTexture(gl.TEXTURE_2D, atex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.R8,
      N[0],
      N[1],
      0,
      gl.RED,
      gl.UNSIGNED_BYTE,
      null,
    );
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    dirty = 4;
    // If the tiling preset is showing, re-tile it so it always fills the new size.
    if (old && lastPreset === "tiles") tileLogo(false);
    gl.viewport(0, 0, cw, ch);
  }

  // Presets
  let lastPreset: "tiles" | null = null;
  function clearAll() {
    lastPreset = null;
    patched.fill(0);
    FA?.fill(0);
  }
  function setCell(i: number, j: number, v: number, t: number) {
    if (i < 0 || j < 0 || i >= N[0] || j >= N[1]) return;
    const k = j * N[0] + i;
    patched[k] = v;
    ptime[k] = t || 0;
  }
  function stagger(i: number, j: number) {
    return reduce ? 0 : performance.now() + (i + j * 0.6) * 16;
  }
  // Lay the tiling over the whole grid, leaving hand-drawn patches alone.
  function tileLogo(animate: boolean) {
    for (let k = 0, n = patched.length; k < n; k++)
      if (patched[k] === 1) patched[k] = 0;
    const put = (i: number, j: number) => {
      if (i < 0 || j < 0 || i >= N[0] || j >= N[1]) return;
      if (patched[j * N[0] + i] !== 2)
        setCell(i, j, 1, animate ? stagger(i, j) : 0);
    };
    for (let b = -1; b * 4 < N[1] + 4; b++)
      for (let a = -1; a * 4 < N[0] + 4; a++) {
        const cx = 4 * a + 2 * (b & 1) + 1;
        const cy = 4 * b + 1;
        put(cx, cy);
        put(cx, cy - 1);
      }
  }
  function presetLogo() {
    clearAll();
    lastPreset = "tiles";
    tileLogo(true);
  }
  function presetBay() {
    clearAll();
    const count = Math.round((N[0] * N[1]) / 16);
    for (let c = 0; c < count; c++) {
      let x = Math.floor(Math.random() * N[0]);
      let y = Math.floor(Math.random() * N[1]);
      if ((x + y) & 1) x += 1;
      const dx = Math.random() < 0.5 ? 1 : -1;
      let dy = Math.random() < 0.5 ? 1 : -1;
      const len = 2 + Math.floor(Math.random() * 6);
      for (let s = 0; s < len; s++) {
        if (Math.random() < 0.35) dy = -dy;
        setCell(Math.min(x, x + dx), Math.min(y, y + dy), 1, stagger(x, y));
        x += dx;
        y += dy;
      }
    }
  }

  // Pointer
  const ptr = {
    sx: -99,
    sy: -99,
    sIn: false,
    amt: 0,
    x: -99,
    y: -99,
    px: -99,
    py: -99,
    in: false,
    down: false,
    lx: 0,
    ly: 0,
    shift: false,
    moved: 0,
  };
  const ripples: { x: number; y: number; t: number }[] = [];
  function toLattice(e: PointerEvent): [number, number] {
    const r = canvas.getBoundingClientRect();
    return [
      ((e.clientX - r.left) * dpr - O[0]) / sc,
      ((e.clientY - r.top) * dpr - O[1]) / sc,
    ];
  }
  // Endpoint dots of cell (i,j) as cell indices (left end first), -1 if off-grid.
  function ends(i: number, j: number): [number, number] {
    const nx = N[0];
    const ny = N[1];
    const id = (x: number, y: number) =>
      x >= 0 && y >= 0 && x < nx && y < ny ? y * nx + x : -1;
    return ((i + j) & 1) === 0
      ? [id(i, j), id(i + 1, j + 1)]
      : [id(i, j + 1), id(i + 1, j)];
  }
  function seedInk(k: number, sx: number, sy: number) {
    const i = k % N[0];
    const j = Math.floor(k / N[0]);
    const [a, b] = ends(i, j);
    if ((a >= 0 && DE[a]) || (b >= 0 && DE[b])) return; // ink already nearby, it will flow in
    const pick = (x: number) => {
      if (x < 0) return 1e9;
      return Math.hypot((x % N[0]) - sx, Math.floor(x / N[0]) - sy);
    };
    const src = pick(a) <= pick(b) ? a : b;
    if (src < 0) return;
    DE[src] = 1;
    DF[src] = 0;
    DX[src] = 0;
    DY[src] = 0;
  }
  function paintAt(x: number, y: number, val: number, sx: number, sy: number) {
    const i = Math.floor(x);
    const j = Math.floor(y);
    if (i < 0 || j < 0 || i >= N[0] || j >= N[1]) return;
    const fx = x - i;
    const fy = y - j;
    const d = ((i + j) & 1) === 0 ? Math.abs(fx - fy) : Math.abs(fx + fy - 1);
    if (d / Math.SQRT2 < 0.3) {
      const k = j * N[0] + i;
      if (val === 2 && patched[k] !== 2) seedInk(k, sx, sy);
      patched[k] = val;
      ptime[k] = 0;
      born[k] = val === 2 ? performance.now() : 0;
      FA[k] = 0;
    }
  }
  function paintSeg(x0: number, y0: number, x1: number, y1: number) {
    const val = (S.tool === "patch") !== ptr.shift ? 2 : 0;
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(1, Math.ceil(len / 0.15));
    for (let s = 0; s <= n; s++) {
      const t = s / n;
      paintAt(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, val, x0, y0);
    }
  }
  const onMove = (e: PointerEvent) => {
    const [x, y] = toLattice(e);
    if (!ptr.in) {
      ptr.px = x;
      ptr.py = y;
    }
    ptr.x = x;
    ptr.y = y;
    ptr.in = true;
    ptr.shift = e.shiftKey;
    if (ptr.down) {
      ptr.moved += Math.hypot(x - ptr.lx, y - ptr.ly);
      if (ptr.moved > 0.35) paintSeg(ptr.lx, ptr.ly, x, y);
      ptr.lx = x;
      ptr.ly = y;
    }
  };
  const onDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    canvas.setPointerCapture(e.pointerId);
    const [x, y] = toLattice(e);
    if (!ptr.in) {
      ptr.px = x;
      ptr.py = y;
    }
    ptr.x = x;
    ptr.y = y;
    ptr.in = true;
    ptr.down = true;
    ptr.lx = x;
    ptr.ly = y;
    ptr.moved = 0;
    ptr.shift = e.shiftKey;
    if (S.fx.ripples) ripples.push({ x, y, t: performance.now() });
    if (FL && S.fx.fluid) FL.puff(x, y);
    ensureAudio();
  };
  const onUp = (e: PointerEvent) => {
    if (ptr.down && ptr.moved > 0.35 && (S.tool === "patch") !== ptr.shift)
      hideHint();
    if (ptr.down && ptr.moved <= 0.35) paintSeg(ptr.lx, ptr.ly, ptr.lx, ptr.ly);
    ptr.down = false;
    if (e.pointerType !== "mouse") ptr.in = false;
  };
  const onLeave = () => {
    if (!ptr.down) ptr.in = false;
  };
  const syncShift = (e: KeyboardEvent) => {
    ptr.shift = e.shiftKey;
    canvas.dataset.erasing = String((S.tool === "erase") !== ptr.shift);
  };
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("pointerleave", onLeave);
  window.addEventListener("keydown", syncShift);
  window.addEventListener("keyup", syncShift);

  // Sound: a small plucked voice per cable that connects, pentatonic by position.
  let analyser: AnalyserNode | null = null;
  let scopeBuf: Float32Array<ArrayBuffer> | null = null;
  let mistIn: GainNode | null = null;
  let ac: AudioContext | null = null;
  let bus: GainNode | null = null;
  let lastNote = 0;
  let notesThisFrame = 0;
  function ensureAudio() {
    if (S.voice === "off") return;
    try {
      if (!ac) {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        ac = new Ctx();
        bus = ac.createGain();
        bus.gain.value = 0.16;
        const lp = ac.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 2200;
        lp.Q.value = 0.7;
        const dl = ac.createDelay(1);
        dl.delayTime.value = 0.27;
        const fb = ac.createGain();
        fb.gain.value = 0.34;
        const wet = ac.createGain();
        wet.gain.value = 0.3;
        bus.connect(lp);
        lp.connect(ac.destination);
        analyser = ac.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0;
        bus.connect(analyser);
        scopeBuf = new Float32Array(analyser.fftSize);
        // A long, dark generated reverb for the Mist voice.
        const sr = ac.sampleRate;
        const len = Math.floor(sr * 3.6);
        const ir = ac.createBuffer(2, len, sr);
        for (let c = 0; c < 2; c++) {
          const d = ir.getChannelData(c);
          let lpv = 0;
          for (let n = 0; n < len; n++) {
            lpv += (Math.random() * 2 - 1 - lpv) * 0.18;
            d[n] = lpv * (1 - n / len) ** 2.6;
          }
        }
        const cv = ac.createConvolver();
        cv.buffer = ir;
        const rv = ac.createGain();
        rv.gain.value = 0.9;
        mistIn = ac.createGain();
        mistIn.gain.value = 0.55;
        mistIn.connect(cv);
        cv.connect(rv);
        rv.connect(ac.destination);
        rv.connect(analyser);
        lp.connect(dl);
        dl.connect(fb);
        fb.connect(dl);
        dl.connect(wet);
        wet.connect(ac.destination);
      }
      if (ac.state === "suspended") ac.resume();
    } catch (_) {}
  }
  const ksCache = new Map<string, AudioBuffer>();
  // Karplus-Strong plucked string, rendered once per pitch and cached.
  function ks(ctx: AudioContext, fr: number, damp: number, bright: number) {
    const key = `${Math.round(fr * 4)}|${damp}|${bright}`;
    const hit = ksCache.get(key);
    if (hit) return hit;
    if (ksCache.size > 90) ksCache.clear();
    const sr = ctx.sampleRate;
    const len = Math.floor(sr * 1.6);
    const P = Math.max(2, Math.round(sr / fr));
    const b = ctx.createBuffer(1, len, sr);
    const d = b.getChannelData(0);
    const ring = new Float32Array(P);
    let prev = 0;
    for (let n = 0; n < P; n++) {
      const w = Math.random() * 2 - 1;
      prev = prev * (1 - bright) + w * bright + w * (1 - bright) * 0.35;
      ring[n] = prev;
    }
    let p = 0;
    for (let n = 0; n < len; n++) {
      const a = ring[p];
      const nx = ring[(p + 1) % P];
      d[n] = a;
      ring[p] =
        damp * (bright * 0.35 * a + (1 - bright * 0.35) * 0.5 * (a + nx));
      p = (p + 1) % P;
    }
    ksCache.set(key, b);
    return b;
  }
  function pluckVariant(
    ctx: AudioContext,
    kind: PluckKind,
    fr: number,
    vel: number,
    t0: number,
    dest: AudioNode,
  ) {
    const env = (peak: number, dec: number) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(peak, t0 + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0008, t0 + dec);
      g.connect(dest);
      return g;
    };
    const sine = (fq: number, type?: OscillatorType) => {
      const o = ctx.createOscillator();
      o.type = type || "sine";
      o.frequency.value = fq;
      return o;
    };
    const run = (o: OscillatorNode, dur: number) => {
      o.start(t0);
      o.stop(t0 + dur + 0.05);
    };
    if (kind === "string" || kind === "harp") {
      const src = ctx.createBufferSource();
      src.buffer =
        kind === "string" ? ks(ctx, fr, 0.995, 0.25) : ks(ctx, fr, 0.9985, 0.8);
      const g = env(
        vel * (kind === "string" ? 0.9 : 0.7),
        kind === "string" ? 0.9 : 1.5,
      );
      src.connect(g);
      src.start(t0);
      src.stop(t0 + 1.6);
    } else if (kind === "mallet") {
      const parts: [number, number, number][] = [
        [1, 0.7, 0.55],
        [3.98, 0.28, 0.12],
        [9.2, 0.1, 0.04],
      ];
      for (const [m, a, dec] of parts) {
        const o = sine(fr * m);
        o.connect(env(vel * a, dec));
        run(o, dec);
      }
    } else if (kind === "fm") {
      const c = sine(fr);
      const mo = sine(fr * 3.5);
      const mg = ctx.createGain();
      mg.gain.setValueAtTime(fr * 2.6 * vel, t0);
      mg.gain.exponentialRampToValueAtTime(1, t0 + 0.32);
      mo.connect(mg);
      mg.connect(c.frequency);
      c.connect(env(vel * 0.45, 0.75));
      run(c, 0.75);
      run(mo, 0.75);
    } else {
      const g = env(vel * 0.5, 0.55);
      const o1 = sine(fr, "triangle");
      const o2 = sine(fr * 2.003);
      const g2 = ctx.createGain();
      g2.gain.value = 0.35;
      o1.connect(g);
      o2.connect(g2);
      g2.connect(g);
      run(o1, 0.55);
      run(o2, 0.55);
    }
  }
  function playVoice(i: number, j: number, force?: boolean) {
    if (!ac || !bus || ac.state !== "running") return;
    const ctx = ac;
    const now = ctx.currentTime;
    if (
      !force &&
      (now - lastNote < (S.voice === "mist" ? 0.14 : 0.05) ||
        notesThisFrame > 0)
    )
      return;
    lastNote = now;
    notesThisFrame++;
    const deg = (((i + (N[1] - j) * 2) % 15) + 15) % 15;
    const f = 98 * 2 ** ((SCALE[deg % 5] + 12 * Math.floor(deg / 5)) / 12);
    let out: AudioNode = bus;
    if (ctx.createStereoPanner) {
      const pan = ctx.createStereoPanner();
      pan.pan.value = Math.max(-1, Math.min(1, (i / N[0]) * 2 - 1));
      pan.connect(bus);
      out = pan;
    }
    const g = ctx.createGain();
    g.connect(out);
    const osc = (type: OscillatorType, fr: number) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = fr;
      return o;
    };
    if (S.voice === "pluck") {
      // Timbre changes in bands across the canvas; brightness follows height; small human variation per note.
      const vel = 0.55 + Math.random() * 0.45;
      const fr =
        f *
        (Math.random() < 0.14 ? 2 : 1) *
        2 ** ((Math.random() - 0.5) * 0.012);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 900 + (1 - j / N[1]) * 4200;
      lp.Q.value = 0.8;
      lp.connect(g);
      const kind =
        PLUCKS[
          ((Math.floor(i / 5) % PLUCKS.length) + PLUCKS.length) % PLUCKS.length
        ];
      pluckVariant(ctx, kind, fr, vel, now, lp);
      if (Math.random() < 0.18)
        pluckVariant(ctx, kind, fr * 1.5, vel * 0.45, now + 0.055, lp); // occasional strummed fifth
    } else if (S.voice === "mist") {
      // Soft and slow: detuned sines on a major pentatonic, gentle attack, long fade into reverb.
      const MAJ = [0, 2, 4, 7, 9];
      const dg = deg % 10;
      const fm = 146.83 * 2 ** ((MAJ[dg % 5] + 12 * Math.floor(dg / 5)) / 12);
      const vel = 0.6 + Math.random() * 0.4;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 1500;
      lp.Q.value = 0.3;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.2 * vel, now + 0.08);
      g.gain.exponentialRampToValueAtTime(0.0008, now + 2.8);
      lp.connect(g);
      if (mistIn) {
        const send = ctx.createGain();
        send.gain.value = 0.8;
        g.connect(send);
        send.connect(mistIn);
      }
      const parts: [number, number, number][] = [
        [fm, -4, 1],
        [fm, 4, 1],
        [fm * 2, 0, 0.18],
        [fm / 2, 0, 0.25],
      ];
      for (const [fq, cents, a] of parts) {
        const o = osc("sine", fq * 2 ** (cents / 1200));
        const ga = ctx.createGain();
        ga.gain.value = a * 0.5;
        o.connect(ga);
        ga.connect(lp);
        o.start(now);
        o.stop(now + 2.9);
      }
    } else if (S.voice === "bloop") {
      // Droplet: a sine that glides up as it fades.
      const o = osc("sine", f * 0.6);
      o.frequency.setValueAtTime(f * 0.6, now);
      o.frequency.exponentialRampToValueAtTime(f * 1.45, now + 0.13);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.75, now + 0.006);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      o.connect(g);
      o.start(now);
      o.stop(now + 0.34);
    } else if (S.voice === "acid") {
      // Saw bass through a resonant lowpass with a snappy filter envelope.
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.Q.value = 13;
      lp.frequency.setValueAtTime(f * 9, now);
      lp.frequency.exponentialRampToValueAtTime(f * 0.9, now + 0.24);
      const o1 = osc("sawtooth", f / 2);
      const o2 = osc("sawtooth", (f / 2) * 1.006);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.32, now + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
      o1.connect(lp);
      o2.connect(lp);
      lp.connect(g);
      o1.start(now);
      o2.start(now);
      o1.stop(now + 0.4);
      o2.stop(now + 0.4);
    }
  }

  // Colours
  function applyPalette(p: PatchCablesPalette) {
    dirty = 4;
    root.style.setProperty("--pcb-canvas-bg", p.bg);
    root.style.setProperty("--pcb-canvas-fg", p.fg);
  }

  // Frame
  let last = performance.now();
  let frame = 0;
  // Autoplay: everything runs on one clock so modes stay in time with each other and with Sound.
  let scopeVals = new Float32Array(0);
  let colPulse = new Float32Array(0);
  let beatAcc = 0;
  let beatN = 0;
  let seqCol = -1;
  let ghost: { x: number; y: number; amt: number } | null = null;
  const autoWalks: { cells: number[]; t: number }[] = [];
  function step(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const f = dt * 60;
    const t = now / 1000;
    const reach = S.reach;
    const decay = S.trail > 0 ? Math.exp(-dt / (S.trail * 0.45)) : 0;
    const damp = (0.74 + 0.08 * S.smooth) ** f;
    const odamp = 0.8 ** f;
    const nx = N[0];
    const ny = N[1];
    const follow = 1 - Math.exp(-dt * (42 - 37 * S.smooth));
    if (ptr.in && !ptr.sIn) {
      ptr.sx = ptr.x;
      ptr.sy = ptr.y;
    }
    ptr.sIn = ptr.in;
    const ax = ptr.sx;
    const ay = ptr.sy;
    if (ptr.in) {
      ptr.sx += (ptr.x - ptr.sx) * follow;
      ptr.sy += (ptr.y - ptr.sy) * follow;
    }
    const bx = ptr.sx;
    const by = ptr.sy;
    ptr.amt +=
      ((ptr.in ? 1 : 0) - ptr.amt) * (1 - Math.exp(-dt * (14 - 10 * S.smooth)));
    const amt = sstep(ptr.amt);
    const hov = amt > 0.002;
    const stiff = 0.22 - 0.14 * S.smooth;
    const speed = Math.hypot(bx - ax, by - ay) / Math.max(dt, 0.001);
    const reachV = reach * (1 + Math.min(0.6, speed * 0.02)); // fast strokes reach a little wider
    for (let r = ripples.length - 1; r >= 0; r--)
      if (now - ripples[r].t > 2400) ripples.splice(r, 1);
    const brushes: Brush[] = [];
    if (hov) brushes.push({ ax, ay, bx, by, amt, rv: reachV });
    autoplay(now, dt, brushes);
    const fx_ = S.fx;
    if (
      brushes.length ||
      ripples.length ||
      pulses.length ||
      fx_.breathe ||
      fx_.rain ||
      fx_.wander ||
      fx_.selfpatch ||
      fx_.seq ||
      fx_.lfo
    )
      mv = 1;
    if (FL && S.fx.fluid)
      for (const B_ of brushes) FL.addBrush(B_, Math.max(dt, 0.001));

    if (colPulse.length !== nx) colPulse = new Float32Array(nx);
    const pulse = colPulse;
    const pd = Math.exp(-dt * 4.5);
    const mag = S.fx.magnet;
    const br = S.fx.breathe;
    const lfo = S.fx.lfo;
    // Scope: one row of dots traces the live audio waveform.
    let scopeRow = -1;
    if (scopeVals.length !== nx) scopeVals = new Float32Array(nx);
    const scope = scopeVals;
    scope.fill(0);
    if (S.fx.scope) {
      const [vx0, vx1, vy0, vy1] = visible();
      scopeRow = Math.round(vy0 + (vy1 - vy0) * 0.8);
      if (analyser && scopeBuf && ac && ac.state === "running") {
        analyser.getFloatTimeDomainData(scopeBuf);
        // Start at a rising zero crossing so the trace holds still like a real scope.
        let st = 0;
        for (let q = 1; q < scopeBuf.length / 2; q++)
          if (scopeBuf[q - 1] < 0 && scopeBuf[q] >= 0) {
            st = q;
            break;
          }
        const span = scopeBuf.length / 2;
        for (let i = Math.max(0, vx0); i <= Math.min(nx - 1, vx1); i++) {
          const v =
            scopeBuf[
              st + Math.floor(((i - vx0) / Math.max(1, vx1 - vx0)) * (span - 1))
            ] || 0;
          scope[i] = Math.max(-1, Math.min(1, v * 9));
        }
      }
    }
    notesThisFrame = 0;
    for (let j = 0; j < ny; j++)
      for (let i = 0; i < nx; i++) {
        const k = j * nx + i;
        const even = ((i + j) & 1) === 0;
        // Cable target
        let tg = patched[k] && now >= ptime[k] ? 1 : 0;
        if (FA[k] > 0) tg *= sstep(FA[k]);
        let h = 0;
        for (const B_ of brushes) {
          const d = segDist(i + 0.5, j + 0.5, B_.ax, B_.ay, B_.bx, B_.by);
          const v = sstep(1 - Math.max(0, d - 0.25) / B_.rv) * B_.amt;
          if (v > h) h = v;
        }
        H[k] = Math.max(h, H[k] * decay);
        if (H[k] > tg) tg = H[k];
        let rip = 0;
        let rdx = 0;
        let rdy = 0;
        for (let r = 0; r < ripples.length; r++) {
          const R = ripples[r];
          const age = (now - R.t) / 1000;
          const front = age * 8;
          const dx = i + 0.5 - R.x;
          const dy = j + 0.5 - R.y;
          const d = Math.hypot(dx, dy);
          const w = sstep(1 - Math.abs(d - front) / 1.1) * (1 - age / 2.4);
          if (w > rip) {
            rip = w;
            rdx = dx / (d || 1);
            rdy = dy / (d || 1);
          }
        }
        if (rip > tg) tg = rip;
        if (pulse[i] * 0.95 > tg) tg = pulse[i] * 0.95;
        if (lfo) {
          const w =
            Math.sin(i * 0.38 + j * 0.21 - ((t * S.bpm) / 120) * 2.2) *
            Math.sin(j * 0.17 - i * 0.07 + ((t * S.bpm) / 120) * 0.9);
          const l = sstep((w - 0.35) / 0.65);
          if (l > tg) tg = l;
        }
        // Magnetic joins: a link never rests halfway. Below the join point it is only a small swell;
        // past it, it snaps fully together, and it holds until the pull drops well below (hysteresis).
        if (!JN[k] && tg > 0.42) JN[k] = 1;
        else if (JN[k] && tg < 0.2) JN[k] = 0;
        tg = JN[k]
          ? 0.62 + 0.38 * sstep((tg - 0.2) / 0.8)
          : 0.16 * sstep(tg / 0.42);
        if (reduce) {
          const de = (tg - E[k]) * Math.min(1, 0.25 * f);
          E[k] += de;
          if (de > 1e-4 || de < -1e-4) mv = 1;
        } else if (tg >= E[k]) {
          V[k] += (tg - E[k]) * stiff * f;
          V[k] *= damp;
          E[k] += V[k] * f;
          if (V[k] > 1e-4 || V[k] < -1e-4) mv = 1;
        } else {
          // Letting go: bleed off any spring motion, then ease down with no bounce.
          // Fast while the neck thins and splits, slower as the halves sink back into their dots.
          V[k] *= 0.55 ** f;
          const rate = (E[k] > 0.5 ? 6.5 : 2.6) * (1.35 - 0.7 * S.smooth);
          const de = (tg - E[k]) * (1 - Math.exp(-dt * rate));
          E[k] += de + V[k] * f;
          if (E[k] < tg) E[k] = tg;
          if (de < -1e-4 || V[k] > 1e-4 || V[k] < -1e-4) mv = 1;
        }
        // Note on when the stubs meet, reset once they have pulled well apart.
        if (!onState[k] && E[k] > 0.52) {
          onState[k] = 1;
          if (S.voice !== "off") playVoice(i, j);
        } else if (onState[k] && E[k] < 0.38) onState[k] = 0;
        // Corner dot: swell, trail and offset
        let gx = 0;
        let gy = 0;
        if (even) {
          let bt = 0;
          for (const B_ of brushes) {
            const d = segDist(i, j, B_.ax, B_.ay, B_.bx, B_.by);
            const v = sstep(1 - d / (B_.rv * 0.85)) * B_.amt;
            if (v > bt) bt = v;
          }
          BH[k] = Math.max(bt, BH[k] * decay);
          let bump = Math.max(BH[k], rip * 0.8, pulse[i] * 0.9);
          if (br)
            bump = Math.max(
              bump,
              0.18 * (0.5 + 0.5 * Math.sin(t * 1.3 + i * 0.45 + j * 0.31)),
            );
          const db = (bump - B[k]) * Math.min(1, 0.2 * f);
          B[k] += db;
          if (db > 3e-4 || db < -3e-4) mv = 1;
          if (mag)
            for (const B_ of brushes) {
              const dx = B_.bx - i;
              const dy = B_.by - j;
              const d = Math.hypot(dx, dy);
              const w = sstep(1 - d / (reach * 1.4)) * B_.amt;
              if (w > 0) {
                const s = (0.24 * w) / Math.max(d, 0.7);
                gx += dx * s;
                gy += dy * s;
              }
            }
          if (rip > 0) {
            gx += rdx * 0.16 * rip;
            gy += rdy * 0.16 * rip;
          }
          if (br) {
            gx += 0.035 * Math.sin(t * 0.9 + j * 0.6);
            gy += 0.035 * Math.cos(t * 0.8 + i * 0.5);
          }
          if (j === scopeRow) {
            gy += scope[i] * 0.44;
            B[k] = Math.max(B[k], Math.abs(scope[i]) * 0.9);
          }
          if (reduce) {
            OX[k] += (gx - OX[k]) * 0.3;
            OY[k] += (gy - OY[k]) * 0.3;
          } else {
            VX[k] += (gx - OX[k]) * 0.12 * f;
            VY[k] += (gy - OY[k]) * 0.12 * f;
            VX[k] *= odamp;
            VY[k] *= odamp;
            OX[k] += VX[k] * f;
            OY[k] += VY[k] * f;
            if (Math.abs(VX[k]) + Math.abs(VY[k]) > 1e-4) mv = 1;
          }
          OX[k] = Math.max(-0.45, Math.min(0.45, OX[k]));
          OY[k] = Math.max(-0.45, Math.min(0.45, OY[k]));
        }
        const o = k * 4;
        buf[o] = Math.max(
          0,
          Math.min(255, Math.round(((E[k] + 0.25) / 1.5) * 255)),
        );
        buf[o + 1] = Math.round(Math.min(1, B[k]) * 255);
        buf[o + 2] = Math.round((OX[k] + 0.5) * 255);
        buf[o + 3] = Math.round((OY[k] + 0.5) * 255);
      }
    for (let i = 0; i < nx; i++) pulse[i] *= pd;
    ptr.px = ptr.x;
    ptr.py = ptr.y;
    inkStep(dt);
    // Activity map: mark live cables, then grow the marks two cells each way.
    {
      const nx_ = N[0];
      const ny_ = N[1];
      for (let k = 0, n = nx_ * ny_; k < n; k++) atmp[k] = E[k] > 0.004 ? 1 : 0;
      for (let j = 0; j < ny_; j++) {
        const r = j * nx_;
        for (let i = 0; i < nx_; i++) {
          let v = 0;
          for (let d = -2; d <= 2 && !v; d++) {
            const x = i + d;
            if (x >= 0 && x < nx_ && atmp[r + x]) v = 1;
          }
          abuf[r + i] = v;
        }
      }
      for (let i = 0; i < nx_; i++)
        for (let j = 0; j < ny_; j++) {
          let v = 0;
          for (let d = -2; d <= 2 && !v; d++) {
            const y = j + d;
            if (y >= 0 && y < ny_ && abuf[y * nx_ + i]) v = 1;
          }
          atmp[j * nx_ + i] = v ? 255 : 0;
        }
    }
  }
  function visible(): [number, number, number, number] {
    return [
      Math.max(0, Math.floor(-O[0] / sc)),
      Math.min(N[0] - 1, Math.ceil((cw - O[0]) / sc)),
      Math.max(0, Math.floor(-O[1] / sc)),
      Math.min(N[1] - 1, Math.ceil((ch - O[1]) / sc)),
    ];
  }
  function autoplay(now: number, dt: number, brushes: Brush[]) {
    const fx = S.fx;
    const t = now / 1000;
    const [x0, x1, y0, y1] = visible();
    const eighth = 60 / S.bpm / 2;
    beatAcc += dt;
    // Wander: a ghost cursor drifting on a slow looping path, with the same trail and magnet as yours.
    if (fx.wander) {
      const sp = S.bpm / 108;
      const cx = (x0 + x1) / 2;
      const cy = (y0 + y1) / 2;
      const hx = (x1 - x0) * 0.42;
      const hy = (y1 - y0) * 0.4;
      const nx_ =
        cx +
        hx *
          (Math.sin(t * 0.31 * sp) * 0.7 + Math.sin(t * 0.83 * sp + 1.7) * 0.3);
      const ny_ =
        cy +
        hy *
          (Math.cos(t * 0.27 * sp + 0.6) * 0.65 +
            Math.sin(t * 0.67 * sp) * 0.35);
      if (!ghost) ghost = { x: nx_, y: ny_, amt: 0 };
      ghost.amt = Math.min(1, ghost.amt + dt * 1.5);
      brushes.push({
        ax: ghost.x,
        ay: ghost.y,
        bx: nx_,
        by: ny_,
        amt: sstep(ghost.amt),
        rv: S.reach * 1.15,
      });
      ghost.x = nx_;
      ghost.y = ny_;
    } else if (ghost) {
      ghost.amt -= dt * 2;
      if (ghost.amt <= 0) ghost = null;
      else
        brushes.push({
          ax: ghost.x,
          ay: ghost.y,
          bx: ghost.x,
          by: ghost.y,
          amt: sstep(ghost.amt),
          rv: S.reach * 1.15,
        });
    }
    // Self-patch: retire old walks first.
    for (let w = autoWalks.length - 1; w >= 0; w--) {
      if (now - autoWalks[w].t > 9000) {
        for (const k of autoWalks[w].cells)
          if (patched[k] === 2) patched[k] = 0;
        autoWalks.splice(w, 1);
      }
    }
    if (beatAcc < eighth) return;
    beatAcc -= eighth;
    if (beatAcc > eighth) beatAcc = 0;
    beatN++;
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    // Rain: a ripple on most beats, somewhere on screen.
    if (fx.rain && beatN % 2 === 0 && Math.random() < 0.8 && ripples.length < 7)
      ripples.push({ x: rnd(x0, x1), y: rnd(y0, y1), t: now });
    // Self-patch: every few beats, draw a short inked cable that later dissolves.
    if (fx.selfpatch && beatN % 6 === 0 && autoWalks.length < 6) {
      let x = Math.floor(rnd(x0 + 1, x1 - 1));
      let y = Math.floor(rnd(y0 + 1, y1 - 1));
      if ((x + y) & 1) x += 1;
      const dx = Math.random() < 0.5 ? 1 : -1;
      let dy = Math.random() < 0.5 ? 1 : -1;
      const cells: number[] = [];
      const len = 3 + Math.floor(Math.random() * 4);
      const sx = x;
      const sy = y;
      for (let st = 0; st < len; st++) {
        if (Math.random() < 0.4) dy = -dy;
        const ci = Math.min(x, x + dx);
        const cj = Math.min(y, y + dy);
        if (ci >= 0 && cj >= 0 && ci < N[0] && cj < N[1]) {
          const k = cj * N[0] + ci;
          if (!patched[k]) {
            if (!cells.length) seedInk(k, sx, sy);
            patched[k] = 2;
            ptime[k] = 0;
            cells.push(k);
          }
        }
        x += dx;
        y += dy;
      }
      if (cells.length) autoWalks.push({ cells, t: now });
    }
    // Sequencer: a playhead steps across the columns on eighth notes.
    // Patched cables in the current column play notes, so what you draw becomes the pattern.
    if (fx.seq) {
      seqCol = seqCol < x0 || seqCol >= x1 ? x0 : seqCol + 1;
      if (seqCol < colPulse.length) colPulse[seqCol] = 1;
      if (S.voice !== "off") {
        let played = 0;
        for (let j = y0; j <= y1 && played < 3; j++) {
          const k = j * N[0] + seqCol;
          if (patched[k]) {
            playVoice(seqCol, j, true);
            played++;
            j += 1;
          }
        }
      }
    }
  }
  // Signal pulses travel along fully inked cables and split at each jack they reach.
  const pulses: Pulse[] = [];
  let pulseAcc = 0;
  function incident(k: number) {
    const nx = N[0];
    const i = k % nx;
    const j = Math.floor(k / nx);
    const out: [number, number][] = [];
    for (const c of [
      k,
      i > 0 && j > 0 ? k - nx - 1 : -1,
      j > 0 ? k - nx : -1,
      i > 0 ? k - 1 : -1,
    ]) {
      if (c < 0) continue;
      const [a, b] = ends(c % nx, Math.floor(c / nx));
      if (a === k) out.push([c, 0]);
      else if (b === k) out.push([c, 1]);
    }
    return out;
  }
  const inked = (c: number) => patched[c] === 2 && CP[c] >= 1;
  function pulseStep(dt: number) {
    const nx = N[0];
    if (!S.fx.signal) {
      pulses.length = 0;
      return;
    }
    pulseAcc += dt;
    const beat = 60 / S.bpm;
    if (pulseAcc > beat) {
      pulseAcc = 0;
      if (pulses.length < 16) {
        const live: number[] = [];
        for (let c = 0, n = patched.length; c < n; c++)
          if (inked(c)) live.push(c);
        if (live.length) {
          const c = live[Math.floor(Math.random() * live.length)];
          pulses.push({ c, dir: Math.random() < 0.5 ? 0 : 1, t: 0, gen: 0 });
        }
      }
    }
    // biome-ignore lint/suspicious/noApproximativeNumericConstant: the source divides by 1.414, not SQRT2; keeping it keeps the timing identical.
    const sp = (3.2 * S.bpm) / 108 / 1.414;
    for (let q = pulses.length - 1; q >= 0; q--) {
      const P_ = pulses[q];
      if (!inked(P_.c)) {
        pulses.splice(q, 1);
        continue;
      }
      P_.t += dt * sp;
      if (P_.t >= 1) {
        const [a, b] = ends(P_.c % nx, Math.floor(P_.c / nx));
        const dst = P_.dir ? a : b;
        pulses.splice(q, 1);
        if (dst < 0) continue;
        if (S.voice !== "off") playVoice(dst % nx, Math.floor(dst / nx));
        if (P_.gen < 9)
          for (const [c, dir] of incident(dst)) {
            if (c === P_.c || !inked(c) || pulses.length >= 24) continue;
            pulses.push({ c, dir, t: 0, gen: P_.gen + 1 });
          }
      }
    }
  }
  const pulseArr = new Float32Array(72);
  function pulseUniforms() {
    const nx = N[0];
    const arr = pulseArr;
    arr.fill(0);
    let n = 0;
    for (const P_ of pulses) {
      if (n >= 24) break;
      const [a, b] = ends(P_.c % nx, Math.floor(P_.c / nx));
      if (a < 0 || b < 0) continue;
      const ax = (a % nx) + OX[a];
      const ay = Math.floor(a / nx) + OY[a];
      const bx = (b % nx) + OX[b];
      const by = Math.floor(b / nx) + OY[b];
      const t = P_.dir ? 1 - P_.t : P_.t;
      arr[n * 3] = ax + (bx - ax) * t;
      arr[n * 3 + 1] = ay + (by - ay) * t;
      arr[n * 3 + 2] = 0.55 + 0.45 * Math.sin(Math.PI * P_.t);
      n++;
    }
    gl.uniform3fv(U.uPu, arr);
    gl.uniform1i(U.uPn, n);
  }
  function inkStep(dt: number) {
    const nx = N[0];
    const ny = N[1];
    const sp = S.ink;
    const now = performance.now();
    const lim = S.patchFade ? 5000 : Number.POSITIVE_INFINITY;
    // One pass over cables: life expiry, fade out, then ink creeping along.
    for (let j = 0; j < ny; j++)
      for (let i = 0; i < nx; i++) {
        const k = j * nx + i;
        if (
          patched[k] === 2 &&
          born[k] > 0 &&
          FA[k] === 0 &&
          now - born[k] > lim
        )
          FA[k] = 1;
        if (FA[k] > 0) {
          mv = 1;
          if (patched[k] !== 2) FA[k] = 0;
          else {
            FA[k] -= dt / S.fade;
            if (FA[k] <= 0) {
              FA[k] = 0;
              patched[k] = 0;
              born[k] = 0;
            }
          }
        }
        if (patched[k] === 2) {
          const [a, b] = ends(i, j);
          if (!CS[k]) {
            const ra = a >= 0 && DE[a] && DF[a] >= 0.55;
            const rb = b >= 0 && DE[b] && DF[b] >= 0.55;
            if (ra || rb) {
              CS[k] = 1;
              CD[k] = ra ? 0 : 1;
              CP[k] = 0.001;
            }
          }
          if (CS[k] && CP[k] < 1) {
            mv = 1;
            // biome-ignore lint/suspicious/noApproximativeNumericConstant: the source divides by 1.414, not SQRT2; keeping it keeps the timing identical.
            CP[k] = Math.min(1, CP[k] + (dt * sp) / 1.414);
            if (CP[k] >= 1) {
              const src = CD[k] ? b : a;
              const dst = CD[k] ? a : b;
              if (dst >= 0 && !DE[dst]) {
                const dx = (src % nx) - (dst % nx);
                const dy = Math.floor(src / nx) - Math.floor(dst / nx);
                const l = Math.hypot(dx, dy) || 1;
                DE[dst] = 1;
                DF[dst] = 0;
                DX[dst] = dx / l;
                DY[dst] = dy / l;
              }
            }
          }
        } else if (CP[k] > 0) {
          mv = 1;
          CP[k] = Math.max(0, CP[k] - dt * 2.2);
          if (CP[k] === 0) CS[k] = 0;
        } else CS[k] = 0;
      }
    // One pass over dots: ink fill or drain, and jack sockets opening or closing.
    const jr = Math.min(1, dt * (S.fx.sockets ? 6 : 8));
    for (let j = 0; j < ny; j++)
      for (let i = j & 1; i < nx; i += 2) {
        const k = j * nx + i;
        const live =
          patched[k] === 2 ||
          (i > 0 && j > 0 && patched[k - nx - 1] === 2) ||
          (j > 0 && patched[k - nx] === 2) ||
          (i > 0 && patched[k - 1] === 2);
        if (DE[k]) {
          if (live) {
            if (DF[k] < 1) {
              DF[k] = Math.min(1, DF[k] + dt * sp * 0.75);
              mv = 1;
            }
          } else {
            mv = 1;
            DF[k] -= dt * 1.6;
            if (DF[k] <= 0) {
              DF[k] = 0;
              DE[k] = 0;
            }
          }
        }
        const jt = S.fx.sockets && live ? 1 : 0;
        const dj = (jt - JK[k]) * jr;
        if (dj > 2e-3 || dj < -2e-3) {
          JK[k] += dj;
          mv = 1;
        } else JK[k] = jt;
      }
    pulseStep(dt);
    for (let k = 0, n = nx * ny; k < n; k++) {
      const o = k * 4;
      cbuf[o] =
        CP[k] > 0
          ? Math.max(1, Math.round(CP[k] * 127)) + (CD[k] ? 128 : 0)
          : 0;
      cbuf[o + 1] = Math.round(DF[k] * 255);
      const hasDir = DX[k] !== 0 || DY[k] !== 0;
      cbuf[o + 2] = hasDir
        ? Math.round((Math.atan2(DY[k], DX[k]) / (Math.PI * 2) + 0.5) * 255) &
          255
        : 0;
      cbuf[o + 3] = (hasDir ? 128 : 0) + Math.round(Math.min(1, JK[k]) * 127);
    }
  }
  function render(now: number) {
    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API method, not a React Hook.
    gl.useProgram(prog);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      N[0],
      N[1],
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      buf,
    );
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, ctex);
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      N[0],
      N[1],
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      cbuf,
    );
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    const p = S.pal;
    gl.uniform2i(U.uN, N[0], N[1]);
    gl.uniform2f(U.uO, O[0], O[1]);
    gl.uniform1f(U.uSc, sc);
    gl.uniform1f(U.uH, ch);
    gl.uniform1f(U.uR, S.size);
    gl.uniform1f(U.uNeck, 0.3 + 0.75 * S.goo);
    gl.uniform1f(U.uK, 0.12 + 0.42 * S.goo);
    gl.uniform1f(U.uKb, 0.06 + 0.3 * S.goo);
    gl.uniform1f(U.uT, (now || 0) / 1000);
    gl.uniform1f(U.uMin, S.minNeck);
    gl.uniform1f(U.uGrain, S.fx.grain ? 0.085 : 0);
    gl.uniform1f(U.uGlow, 0);
    gl.uniform3fv(U.uBg, hex(p.bg));
    gl.uniform3fv(U.uFg, hex(p.fg));
    gl.uniform3fv(U.uPc, hex(p.patch));
    gl.uniform3fv(U.uSock, hex(p.socket));
    gl.uniform3fv(U.uSigc, hex(p.signal));
    pulseUniforms();
    const dt_ = FL && S.fx.fluid ? FL.dye() : null;
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, dt_ || null);
    gl.activeTexture(gl.TEXTURE0);
    gl.activeTexture(gl.TEXTURE6);
    gl.bindTexture(gl.TEXTURE_2D, atex);
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      N[0],
      N[1],
      gl.RED,
      gl.UNSIGNED_BYTE,
      atmp,
    );
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(U.uA, 6);
    gl.uniform1i(U.uD, 2);
    gl.uniform3fv(U.uFc, hex(p.fluid || p.patch));
    gl.uniform1f(U.uFl, dt_ ? S.flStr : 0);
    gl.uniform2f(U.uRes, cw, ch);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function updateReadout() {
    if (!ui.readout) return;
    let c = 0;
    const x0 = Math.floor(-O[0] / sc);
    const x1 = Math.ceil((cw - O[0]) / sc);
    const y0 = Math.floor(-O[1] / sc);
    const y1 = Math.ceil((ch - O[1]) / sc);
    for (let j = Math.max(0, y0); j < Math.min(N[1], y1); j++)
      for (let i = Math.max(0, x0); i < Math.min(N[0], x1); i++)
        if (patched[j * N[0] + i]) c++;
    ui.readout.textContent = `${x1 - x0} × ${y1 - y0} grid · ${c} cable${c === 1 ? "" : "s"}`;
  }
  let raf = 0;
  let running = false;
  function loop(now: number) {
    // Drop render resolution if the GPU can't keep up, so the page (and the panel) stays responsive.
    const ft = now - last;
    // Only judge speed after a warm-up, over a long window, and only while the tab is visible.
    // A resize happens before drawing, so the canvas is never shown blank.
    if (
      now - startT > 3000 &&
      !document.hidden &&
      idleFrames === 0 &&
      ft > 0 &&
      ft < 250
    ) {
      ftAcc += ft;
      ftN++;
    }
    if (ftN >= 120) {
      const avg = ftAcc / ftN;
      ftAcc = 0;
      ftN = 0;
      slowRuns = avg > 30 ? slowRuns + 1 : 0;
      if (slowRuns >= 2 && rs > 0.75) {
        rs = Math.max(0.75, rs * 0.85);
        slowRuns = 0;
        build();
      }
    }
    // When nothing is moving, keep the last frame on screen and do almost no work.
    // The simulation still ticks (slower once idle and the cursor is away) so timers and hovers wake it.
    const sleepy = idleFrames > 30 && !ptr.in;
    if (!sleepy || frame % 4 === 0) {
      mv = 0;
      step(now);
      const flAct = !!(
        FL &&
        S.fx.fluid &&
        now - lastFlT < S.flFade * 5000 + 500
      );
      if (mv || flAct || dirty > 0) {
        idleFrames = 0;
        if (flAct && FL) {
          try {
            FL.step(Math.min(0.033, Math.max(0.001, ft / 1000)));
          } catch (e) {
            console.error(e);
          }
        }
        render(now);
        if (dirty > 0) dirty--;
      } else idleFrames++;
    }
    if ((frame++ & 15) === 0) updateReadout();
    raf = requestAnimationFrame(loop);
  }
  function setRunning(on: boolean) {
    if (on && !running) {
      running = true;
      raf = requestAnimationFrame(loop);
    } else if (!on && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  }

  // Usage hint: fades in after load, leaves once the first patch is drawn.
  if (ui.hintText && matchMedia("(pointer: coarse)").matches)
    ui.hintText.textContent = "Touch and drag to patch";
  let hintGone = false;
  const timers: number[] = [];
  timers.push(
    window.setTimeout(() => {
      if (!hintGone) ui.hint?.setAttribute("data-state", "show");
    }, 900),
  );
  function hideHint() {
    if (hintGone) return;
    hintGone = true;
    ui.hint?.setAttribute("data-state", "gone");
    timers.push(
      window.setTimeout(() => {
        if (ui.hint) ui.hint.hidden = true;
      }, 600),
    );
  }

  // The source rebuilt on window resize; here the box is the window.
  let rt = 0;
  let lastW = root.clientWidth;
  let lastH = root.clientHeight;
  const resizeObserver = new ResizeObserver(() => {
    if (root.clientWidth === lastW && root.clientHeight === lastH) return;
    lastW = root.clientWidth;
    lastH = root.clientHeight;
    clearTimeout(rt);
    rt = window.setTimeout(build, 80);
  });
  resizeObserver.observe(root);
  const intersection = new IntersectionObserver(([entry]) => {
    setRunning(entry?.isIntersecting ?? false);
  });
  intersection.observe(root);
  const onVisibility = () => {
    dirty = 4;
  };
  document.addEventListener("visibilitychange", onVisibility);

  applyPalette(S.pal);
  build();
  if (pattern === "tiles") presetLogo();
  else if (pattern === "patchbay") presetBay();
  setRunning(true);

  return {
    update(next) {
      const prev = S;
      S = next;
      if (next.spacing !== prev.spacing) build();
      if (next.pal !== prev.pal) applyPalette(next.pal);
      if (next.tool !== prev.tool)
        canvas.dataset.erasing = String(next.tool === "erase");
      if (next.voice !== prev.voice) {
        ensureAudio();
        if (next.voice !== "off")
          playVoice(Math.floor(N[0] / 2), Math.floor(N[1] / 2));
      }
      // Any control change redraws, even if the field is otherwise still.
      dirty = 4;
    },
    clear() {
      clearAll();
      autoWalks.length = 0;
      pulses.length = 0;
      dirty = 4;
    },
    tiles() {
      presetLogo();
      dirty = 4;
    },
    patchbay() {
      presetBay();
      dirty = 4;
    },
    dispose() {
      setRunning(false);
      for (const id of timers) clearTimeout(id);
      clearTimeout(rt);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("keydown", syncShift);
      window.removeEventListener("keyup", syncShift);
      ac?.close().catch(() => {});
      FL?.dispose();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap");
.pcb-root{position:relative;width:100%;height:100%;overflow:hidden;container-type:size;background:var(--pcb-canvas-bg);
  --pcb-canvas-bg:#475e62;--pcb-canvas-fg:#e5f56b;--pcb-glass:rgba(244,244,242,.7);--pcb-ink:#2c2c2b;
  --pcb-mono:"DM Mono",ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace;--pcb-track:.04em}
.pcb-stage{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:crosshair}
.pcb-stage[data-erasing="true"]{cursor:cell}
.pcb-readout{position:absolute;z-index:4;right:16px;bottom:14px;font-family:var(--pcb-mono);font-size:11px;letter-spacing:var(--pcb-track);
  text-transform:uppercase;color:var(--pcb-canvas-fg);opacity:.75;font-variant-numeric:tabular-nums;pointer-events:none}
.pcb-hint{position:absolute;z-index:4;left:50%;bottom:22px;display:flex;align-items:center;gap:14px;height:46px;padding:0 22px 0 5px;border-radius:999px;
  background:var(--pcb-glass);-webkit-backdrop-filter:blur(18px) saturate(1.3);backdrop-filter:blur(18px) saturate(1.3);
  border:1px solid rgba(255,255,255,.45);box-shadow:0 18px 50px -24px rgba(20,26,27,.55);pointer-events:none;white-space:nowrap;
  opacity:0;transform:translate(-50%,10px);transition:opacity .5s ease,transform .5s cubic-bezier(.2,.8,.2,1)}
.pcb-hint[data-state="show"]{opacity:1;transform:translate(-50%,0)}
.pcb-hint[data-state="gone"]{opacity:0;transform:translate(-50%,10px) scale(.96)}
.pcb-hint[hidden]{display:none}
.pcb-hint-mark{width:36px;height:36px;border-radius:50%;background:#23383a;display:grid;place-items:center;flex:none}
.pcb-hint-mark svg{width:47%;height:47%}
.pcb-hint-text{font:500 13px var(--pcb-mono);letter-spacing:var(--pcb-track);text-transform:uppercase;color:var(--pcb-ink)}
.pcb-nogl{position:absolute;inset:0;display:grid;place-items:center;color:#e5f56b;font:15px system-ui,sans-serif;text-align:center;padding:24px}
@media (prefers-reduced-motion:reduce){.pcb-hint{transition:opacity .3s ease;transform:translate(-50%,0)}}
@container (max-width:640px){
  .pcb-hint{height:40px;gap:10px;padding-right:16px}
  .pcb-hint-mark{width:30px;height:30px}
  .pcb-hint-text{font-size:11px}
}
`;

function toSettings(p: PatchCablesProps): Settings {
  return {
    patchFade: p.fadePatches ?? true,
    flStr: 0.79,
    flSwirl: 51,
    flFade: 2.4,
    flSize: 0.26,
    flForce: 0.9,
    fade: 3.5,
    ink: 0.8,
    smooth: p.smoothing ?? 0.55,
    spacing: p.spacing ?? 40,
    size: p.dotSize ?? 0.47,
    goo: p.goo ?? 0.79,
    reach: p.reach ?? 2.2,
    trail: p.trailDecay ?? 1,
    tool: p.tool ?? "patch",
    pal: p.palette ?? PATCH_CABLES_PALETTES[0],
    fx: {
      ...PATCH_CABLES_EFFECTS,
      ...p.effects,
      ...PATCH_CABLES_GENERATORS,
      ...p.generators,
    },
    bpm: p.bpm ?? 108,
    minNeck: p.minNeck ?? 0.62,
    voice: p.voice ?? "mist",
  };
}

/**
 * A full-bleed playable lattice. Hover to merge dots, click to send a ripple,
 * drag to patch cables (Shift swaps patch and unpatch). Cables that close
 * play a note; generators can play it on their own.
 */
const PatchCables = forwardRef<PatchCablesHandle, PatchCablesProps>(
  function PatchCables(props, ref) {
    const {
      pattern = "tiles",
      showHint = true,
      showReadout = true,
      className,
      style,
    } = props;
    const rootRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const hintRef = useRef<HTMLDivElement>(null);
    const hintTextRef = useRef<HTMLSpanElement>(null);
    const readoutRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<Engine | null>(null);
    const [noGl, setNoGl] = useState(false);
    const settings = toSettings(props);
    const settingsRef = useRef(settings);
    settingsRef.current = settings;
    // Settings compared by value, so a new effects object with the same flags is not a change.
    const settingsKey = JSON.stringify(settings);

    useImperativeHandle(
      ref,
      () => ({
        clear: () => engineRef.current?.clear(),
        tiles: () => engineRef.current?.tiles(),
        patchbay: () => engineRef.current?.patchbay(),
      }),
      [],
    );

    useEffect(() => {
      const root = rootRef.current;
      const canvas = canvasRef.current;
      if (!root || !canvas) return;
      const engine = startEngine(root, canvas, settingsRef.current, pattern, {
        hint: hintRef.current,
        hintText: hintTextRef.current,
        readout: readoutRef.current,
      });
      if (!engine) {
        setNoGl(true);
        return;
      }
      engineRef.current = engine;
      return () => {
        engine.dispose();
        engineRef.current = null;
      };
    }, []);

    useEffect(() => {
      engineRef.current?.update(settingsRef.current);
    }, [settingsKey]);

    return (
      <div
        ref={rootRef}
        className={`pcb-root ${className ?? ""}`}
        style={style}
      >
        <style>{styles}</style>
        <canvas
          ref={canvasRef}
          className="pcb-stage"
          aria-label="Cable pattern canvas. Hover to merge dots, drag to patch cables, click to send a ripple."
        />
        {noGl ? (
          <div className="pcb-nogl">
            This needs WebGL2. Try a recent Chrome, Safari or Firefox.
          </div>
        ) : null}
        {showHint ? (
          <div ref={hintRef} className="pcb-hint" aria-live="polite">
            <span className="pcb-hint-mark">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="6" cy="6" r="5" fill="#e8fe43" />
                <circle cx="18" cy="18" r="5" fill="#e8fe43" />
                <path
                  d="M6 6 18 18"
                  stroke="#e8fe43"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span ref={hintTextRef} className="pcb-hint-text">
              Click and hold to patch
            </span>
          </div>
        ) : null}
        {showReadout ? <div ref={readoutRef} className="pcb-readout" /> : null}
      </div>
    );
  },
);

export default PatchCables;
