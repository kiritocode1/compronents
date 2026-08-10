/**
 * InkField GPU engine.
 *
 * Owns the WebGL2 context, the render targets and the pass order. The pass
 * order is load-bearing and not obvious: `feedback` runs LAST in a frame, after
 * the passes that display it, so what you see on frame N is the diffusion state
 * computed at the end of frame N-1. That one-frame lag is inherent to a
 * ping-pong feedback system and is how the original behaves.
 *
 *   composite -> realtime -> mapFrag -> [distort] -> feedback
 *   commit: encode -> typeMapEncode
 *
 * The force map is regenerated EVERY frame against an advancing clock, so ink
 * laid down now diffuses along a different field than ink laid down ten seconds
 * from now.
 *
 * BLANK - aryank.space
 */

import {
  baseVert,
  compositeFrag,
  distortFrag,
  encodeFrag,
  feedbackFrag,
  flowFrag,
  mapFrag,
  metallicFrag,
  realtimeFrag,
  typeMapEncodeFrag,
} from "./shaders";

type UniformValue =
  | number
  | boolean
  | readonly number[]
  | Float32Array
  | { texture: WebGLTexture };

/** A colour target plus its texture. All targets share the canvas resolution. */
class Target {
  readonly framebuffer: WebGLFramebuffer;
  readonly texture: WebGLTexture;

  constructor(
    private gl: WebGL2RenderingContext,
    public width: number,
    public height: number,
  ) {
    const gl2 = gl;
    const tex = gl2.createTexture();
    if (!tex) throw new Error("ink-field: could not create texture");
    gl2.bindTexture(gl2.TEXTURE_2D, tex);
    gl2.texImage2D(
      gl2.TEXTURE_2D,
      0,
      gl2.RGBA,
      width,
      height,
      0,
      gl2.RGBA,
      gl2.UNSIGNED_BYTE,
      null,
    );
    gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_MIN_FILTER, gl2.LINEAR);
    gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_MAG_FILTER, gl2.LINEAR);
    gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_WRAP_S, gl2.CLAMP_TO_EDGE);
    gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_WRAP_T, gl2.CLAMP_TO_EDGE);

    const fb = gl2.createFramebuffer();
    if (!fb) throw new Error("ink-field: could not create framebuffer");
    gl2.bindFramebuffer(gl2.FRAMEBUFFER, fb);
    gl2.framebufferTexture2D(
      gl2.FRAMEBUFFER,
      gl2.COLOR_ATTACHMENT0,
      gl2.TEXTURE_2D,
      tex,
      0,
    );
    gl2.bindFramebuffer(gl2.FRAMEBUFFER, null);

    this.framebuffer = fb;
    this.texture = tex;
  }

  clear(r: number, g: number, b: number, a: number) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.viewport(0, 0, this.width, this.height);
    gl.disable(gl.BLEND);
    gl.clearColor(r, g, b, a);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  dispose() {
    this.gl.deleteFramebuffer(this.framebuffer);
    this.gl.deleteTexture(this.texture);
  }
}

class Program {
  readonly program: WebGLProgram;
  private locations = new Map<string, WebGLUniformLocation | null>();
  /** Uniform names the driver reports as active after linking. */
  readonly active: Set<string>;

  constructor(
    private gl: WebGL2RenderingContext,
    vertexSource: string,
    fragmentSource: string,
    label: string,
  ) {
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader)
        throw new Error(`ink-field: could not create shader (${label})`);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`ink-field: ${label} shader failed to compile\n${log}`);
      }
      return shader;
    };

    const vs = compile(gl.VERTEX_SHADER, vertexSource);
    const fs = compile(gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    if (!program)
      throw new Error(`ink-field: could not create program (${label})`);
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`ink-field: ${label} program failed to link\n${log}`);
    }
    this.program = program;

    // Enumerate what survived compilation. A uniform the shader declares but
    // never reads is eliminated by the driver, so setting it is a silent no-op.
    this.active = new Set<string>();
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
    for (let i = 0; i < count; i++) {
      const info = gl.getActiveUniform(program, i);
      if (info) this.active.add(info.name.replace(/\[0\]$/, ""));
    }
  }

  private location(name: string) {
    if (!this.locations.has(name)) {
      this.locations.set(name, this.gl.getUniformLocation(this.program, name));
    }
    return this.locations.get(name) ?? null;
  }

  set(name: string, value: UniformValue, textureUnit?: number) {
    const gl = this.gl;
    const loc = this.location(name);
    if (loc === null) return;

    if (typeof value === "boolean") {
      gl.uniform1f(loc, value ? 1 : 0);
      return;
    }
    if (typeof value === "number") {
      gl.uniform1f(loc, value);
      return;
    }
    if (typeof value === "object" && "texture" in value) {
      const unit = textureUnit ?? 0;
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, value.texture);
      gl.uniform1i(loc, unit);
      return;
    }
    const arr = value as ArrayLike<number>;
    switch (arr.length) {
      case 2:
        gl.uniform2fv(loc, arr as Float32List);
        break;
      case 3:
        gl.uniform3fv(loc, arr as Float32List);
        break;
      case 4:
        gl.uniform4fv(loc, arr as Float32List);
        break;
      default:
        gl.uniform1fv(loc, arr as Float32List);
    }
  }

  /** Integer uniform, for the handful the shaders declare as `int`. */
  setInt(name: string, value: number) {
    const loc = this.location(name);
    if (loc !== null) this.gl.uniform1i(loc, value);
  }

  dispose() {
    this.gl.deleteProgram(this.program);
  }
}

export interface EngineOptions {
  pixelDensity?: number;
  backgroundColor?: [number, number, number];
  paperTexture?: boolean;
  paperGrain?: number;
}

export interface StrokeUniforms {
  useSharpen: number;
  brushColorMode: number;
  brushCategory: number;
  baseBrushSize: number;
  indiffusionStrength: number;
  strokeSeed: number;
  mouseCount: number;
  mouseCountAccumulated: number;
}

export interface CommitUniforms extends StrokeUniforms {
  keyBlendMode: number;
  useSpectralMix: boolean;
  hueShift: number;
  satShift: number;
  briShift: number;
  whiteMaxOpacity: number;
  customBrushColor: readonly [number, number, number];
}

export interface DistortUniforms {
  distortEnabled: boolean;
  displacementB: number;
  displacementC: number;
  showFbmMask: boolean;
  rsEnabled: boolean;
  rsFrequency: number;
  rsWaveSpeed: number;
  rsStrength: number;
  rsGradientMix: number;
  rsScale: number;
  cellularEnabled: boolean;
  cellularScale: number;
  cellularSeed: number;
  whiteDotDensity: number;
  grainAmount: number;
}

export interface FlowUniforms {
  blendType: number;
  blendVol: number;
  blendA: number;
  blendB: number;
  directVol: number;
  snoiseVol: number;
  globalStyle: number;
  pixD: number;
  colorDeep: number;
  whiteDot: number;
  doBigShape: number;
  doMask: number;
  multiDir: number;
  lastStrokeOnly: boolean;
  radSeed: number;
  seed: number;
  strokeBounds: readonly [number, number, number, number];
}

export interface MetallicUniforms {
  strength: number;
  flowSpeed: number;
  fresnelStrength: number;
  tint: readonly [number, number, number];
  lightPos: readonly [number, number];
}

/** Force-map field parameters. Randomised per session by the original. */
export interface ForceMapParams {
  randomSeed: [number, number, number, number];
  scale: [number, number, number];
  amplitude: [number, number, number];
  phase: [number, number, number];
  vortexScale: [number, number];
  clusterScale: [number, number];
}

export function randomForceMapParams(rand: () => number): ForceMapParams {
  return {
    randomSeed: [
      100 + rand() * 100,
      200 + rand() * 100,
      300 + rand() * 100,
      400 + rand() * 100,
    ],
    scale: [
      0.002 + rand() * 0.002,
      0.005 + rand() * 0.003,
      0.015 + rand() * 0.005,
    ],
    amplitude: [0.2 + rand() * 0.5, 0.2 + rand() * 0.4, 0.2 + rand() * 0.5],
    phase: [rand() * 5, rand() * 5, rand() * 5],
    vortexScale: [0.008 + rand() * 0.006, 0.012 + rand() * 0.006],
    clusterScale: [0.001 + rand() * 0.001, 0.0008 + rand() * 0.0008],
  };
}

export class InkFieldEngine {
  private gl: WebGL2RenderingContext;
  private quad: WebGLBuffer;
  private programs: Record<string, Program>;
  private targets: Record<string, Target> = {};
  private stampTexture: WebGLTexture;
  private blitProgram: WebGLProgram;
  private blitQuad: WebGLBuffer;
  private blitLocs: {
    tex: WebGLUniformLocation | null;
    flip: WebGLUniformLocation | null;
  };

  width: number;
  height: number;
  readonly density: number;
  private background: [number, number, number];
  private disposed = false;

  forceMap: ForceMapParams;

  constructor(
    private canvas: HTMLCanvasElement,
    options: EngineOptions = {},
  ) {
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: true,
      premultipliedAlpha: true,
    });
    if (!gl) throw new Error("ink-field: WebGL2 is not available");
    this.gl = gl;

    this.density =
      options.pixelDensity ?? Math.min(window.devicePixelRatio || 1, 2);
    this.background = options.backgroundColor ?? [1, 1, 1];
    this.width = Math.max(1, Math.round(canvas.clientWidth * this.density));
    this.height = Math.max(1, Math.round(canvas.clientHeight * this.density));
    canvas.width = this.width;
    canvas.height = this.height;

    // Fullscreen quad in clip space. The shaders derive their own UVs from
    // gl_FragCoord and the `rect` uniform, so no varyings are needed.
    const quad = gl.createBuffer();
    if (!quad) throw new Error("ink-field: could not create quad buffer");
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]),
      gl.STATIC_DRAW,
    );
    this.quad = quad;

    this.programs = {
      map: new Program(gl, baseVert, mapFrag, "mapFrag"),
      feedback: new Program(gl, baseVert, feedbackFrag, "feedback"),
      encode: new Program(gl, baseVert, encodeFrag, "encode"),
      typeMap: new Program(gl, baseVert, typeMapEncodeFrag, "typeMapEncode"),
      composite: new Program(gl, baseVert, compositeFrag, "composite"),
      realtime: new Program(gl, baseVert, realtimeFrag, "realtime"),
      distort: new Program(gl, baseVert, distortFrag, "distort"),
      flow: new Program(gl, baseVert, flowFrag, "flow"),
      metallic: new Program(gl, baseVert, metallicFrag, "metallic"),
    };

    // Textured-quad blit, used to composite the CPU stamp layer and to present.
    const blitVS = `attribute vec2 aPos;varying vec2 vUv;uniform float uFlip;
void main(){vUv=vec2(aPos.x*0.5+0.5, uFlip>0.5 ? 0.5-aPos.y*0.5 : aPos.y*0.5+0.5);
gl_Position=vec4(aPos,0.0,1.0);}`;
    const blitFS = `precision highp float;varying vec2 vUv;uniform sampler2D uTex;
void main(){gl_FragColor=texture2D(uTex,vUv);}`;
    const blit = new Program(gl, blitVS, blitFS, "blit");
    this.blitProgram = blit.program;
    this.blitLocs = {
      tex: gl.getUniformLocation(blit.program, "uTex"),
      flip: gl.getUniformLocation(blit.program, "uFlip"),
    };
    const bq = gl.createBuffer();
    if (!bq) throw new Error("ink-field: could not create blit buffer");
    gl.bindBuffer(gl.ARRAY_BUFFER, bq);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    this.blitQuad = bq;

    const stamp = gl.createTexture();
    if (!stamp) throw new Error("ink-field: could not create stamp texture");
    gl.bindTexture(gl.TEXTURE_2D, stamp);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.stampTexture = stamp;

    this.forceMap = randomForceMapParams(Math.random);
    this.allocate(options);
  }

  private allocate(options: EngineOptions) {
    const gl = this.gl;
    for (const t of Object.values(this.targets)) t.dispose();
    this.targets = {};
    const names = [
      "forceMap",
      "draft",
      "pingPong",
      "final",
      "typeMap",
      "screen",
      "realtimeIntermediate",
      "paper",
      "flat",
      "lastStroke",
      "out",
      "flowScratch",
      "flowTypeScratch",
      "bugsMask",
      "bugsData",
      "metallic",
    ];
    for (const name of names) {
      this.targets[name] = new Target(gl, this.width, this.height);
    }

    const [r, g, b] = this.background;
    this.targets.draft.clear(1, 1, 1, 1);
    this.targets.pingPong.clear(1, 1, 1, 1);
    this.targets.final.clear(1, 1, 1, 1);
    this.targets.typeMap.clear(0, 0, 0, 1);
    this.targets.lastStroke.clear(1, 1, 1, 1);
    this.targets.bugsMask.clear(0, 0, 0, 0);
    this.targets.bugsData.clear(0, 0, 0, 0);
    this.targets.flat.clear(r, g, b, 1);
    this.buildPaper(options.paperTexture !== false, options.paperGrain ?? 0.06);
  }

  /**
   * Procedural paper: the flat background multiplied by a fibre grain. The
   * original multiplies in a bitmap; generating it keeps the component free of
   * asset dependencies and lets the grain be a prop.
   */
  private buildPaper(enabled: boolean, grain: number) {
    const [r, g, b] = this.background;
    if (!enabled || grain <= 0) {
      this.targets.paper.clear(r, g, b, 1);
      return;
    }

    const c = document.createElement("canvas");
    c.width = this.width;
    c.height = this.height;
    const ctx = c.getContext("2d");
    if (!ctx) {
      this.targets.paper.clear(r, g, b, 1);
      return;
    }
    ctx.fillStyle = `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
    ctx.fillRect(0, 0, c.width, c.height);

    const image = ctx.getImageData(0, 0, c.width, c.height);
    const px = image.data;
    for (let y = 0; y < c.height; y++) {
      for (let x = 0; x < c.width; x++) {
        const i = (y * c.width + x) * 4;
        // Two fibre directions plus white noise. The weights sum to 1 so the
        // deviation never exceeds `grain`: distort.frag skips any pixel within
        // 0.05 of the background colour, and paper that drifts past that
        // threshold would pull film grain and white dots onto the bare sheet
        // instead of onto the ink.
        const fibre =
          Math.sin(x * 0.7 + Math.sin(y * 0.11) * 2) * 0.35 +
          Math.sin(y * 0.9 + Math.sin(x * 0.07) * 2) * 0.25 +
          (Math.random() - 0.5) * 0.8;
        const k = 1 + fibre * grain;
        px[i] = Math.max(0, Math.min(255, px[i] * k));
        px[i + 1] = Math.max(0, Math.min(255, px[i + 1] * k));
        px[i + 2] = Math.max(0, Math.min(255, px[i + 2] * k));
      }
    }
    ctx.putImageData(image, 0, 0);
    this.uploadCanvasTo(this.targets.paper, c);
  }

  private uploadCanvasTo(target: Target, source: HTMLCanvasElement) {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, target.texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  }

  /** Runs one full-screen pass of `program` into `into`. */
  private pass(
    program: Program,
    into: Target | null,
    configure: (p: Program) => void,
  ) {
    const gl = this.gl;
    const w = into ? into.width : this.width;
    const h = into ? into.height : this.height;
    gl.bindFramebuffer(gl.FRAMEBUFFER, into ? into.framebuffer : null);
    gl.viewport(0, 0, w, h);
    gl.disable(gl.BLEND);
    gl.useProgram(program.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    const posLoc = gl.getAttribLocation(program.program, "aPosition");
    if (posLoc >= 0) {
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
    }

    // base.vert applies model-view and projection; identity gives clip space.
    const identity = new Float32Array([
      1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
    ]);
    const mv = gl.getUniformLocation(program.program, "uModelViewMatrix");
    const proj = gl.getUniformLocation(program.program, "uProjectionMatrix");
    if (mv) gl.uniformMatrix4fv(mv, false, identity);
    if (proj) gl.uniformMatrix4fv(proj, false, identity);

    program.set("rect", [0, 0, w, h]);
    program.set("invResolution", [1 / w, 1 / h]);
    configure(program);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  /** Copies `from` into `into` with no shading. */
  private copy(from: Target, into: Target) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, into.framebuffer);
    gl.viewport(0, 0, into.width, into.height);
    gl.disable(gl.BLEND);
    gl.useProgram(this.blitProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.blitQuad);
    const loc = gl.getAttribLocation(this.blitProgram, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, from.texture);
    if (this.blitLocs.tex) gl.uniform1i(this.blitLocs.tex, 0);
    if (this.blitLocs.flip) gl.uniform1f(this.blitLocs.flip, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  /**
   * Blends the CPU stamp layer over the grayscale draft with source-over,
   * which is what p5's 2-D drawing into a framebuffer does.
   */
  stampInto(source: HTMLCanvasElement) {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.stampTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

    const draft = this.targets.draft;
    gl.bindFramebuffer(gl.FRAMEBUFFER, draft.framebuffer);
    gl.viewport(0, 0, draft.width, draft.height);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(this.blitProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.blitQuad);
    const loc = gl.getAttribLocation(this.blitProgram, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.stampTexture);
    if (this.blitLocs.tex) gl.uniform1i(this.blitLocs.tex, 0);
    if (this.blitLocs.flip) gl.uniform1f(this.blitLocs.flip, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.disable(gl.BLEND);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  /** Regenerates the animated wind map. Runs once per frame, always. */
  renderForceMap(timeSeconds: number) {
    const f = this.forceMap;
    this.pass(this.programs.map, this.targets.forceMap, (p) => {
      p.set("randomSeed1", f.randomSeed[0]);
      p.set("randomSeed2", f.randomSeed[1]);
      p.set("randomSeed3", f.randomSeed[2]);
      p.set("randomSeed4", f.randomSeed[3]);
      p.set("scale1", f.scale[0]);
      p.set("scale2", f.scale[1]);
      p.set("scale3", f.scale[2]);
      p.set("amplitude1", f.amplitude[0]);
      p.set("amplitude2", f.amplitude[1]);
      p.set("amplitude3", f.amplitude[2]);
      p.set("phase1", f.phase[0]);
      p.set("phase2", f.phase[1]);
      p.set("phase3", f.phase[2]);
      p.set("vortexScale1", f.vortexScale[0]);
      p.set("vortexScale2", f.vortexScale[1]);
      p.set("clusterScale1", f.clusterScale[0]);
      p.set("clusterScale2", f.clusterScale[1]);
      p.set("canvasCenter", [this.width / 2, this.height / 2]);
      p.set("time", timeSeconds);
    });
  }

  /** One diffusion step. Ping-pongs the draft to avoid same-target read/write. */
  diffuse(force: number, u: StrokeUniforms) {
    this.pass(this.programs.feedback, this.targets.pingPong, (p) => {
      p.set("tex0", { texture: this.targets.draft.texture }, 0);
      p.set("forceMap", { texture: this.targets.forceMap.texture }, 1);
      p.set("force", force);
      p.set("indiffusionStrength", u.indiffusionStrength);
      p.set("baseBrushSize", u.baseBrushSize);
      p.set("useSharpen", u.useSharpen);
      p.set("brushColorMode", u.brushColorMode);
      p.set("brushCategory", u.brushCategory);
      p.set("mouseCount", u.mouseCount);
      p.set("mouseCountAccumulated", u.mouseCountAccumulated);
      p.set("strokeSeed", u.strokeSeed);
      p.set("useMask", 0);
    });
    this.copy(this.targets.pingPong, this.targets.draft);
  }

  /** Commits the finished draft: grayscale to colour, and to brush identity. */
  commit(u: CommitUniforms) {
    // encode reads `final` and writes it, so stage through the screen target.
    this.pass(this.programs.encode, this.targets.screen, (p) => {
      p.set("baseTex", { texture: this.targets.final.texture }, 0);
      p.set("strokeTex", { texture: this.targets.draft.texture }, 1);
      p.set("typeMapTex", { texture: this.targets.typeMap.texture }, 2);
      p.set("brushColorMode", u.brushColorMode);
      p.set("brushCategory", u.brushCategory);
      p.set("whiteMaxOpacity", u.whiteMaxOpacity);
      p.set("hueShift", u.hueShift);
      p.set("satShift", u.satShift);
      p.set("briShift", u.briShift);
      p.setInt("keyBlendMode", u.keyBlendMode);
      p.set("useSharpen", u.useSharpen);
      p.set("canvasBackgroundColor", this.background);
      p.set("customBrushColor", u.customBrushColor);
      p.set("useSpectralMix", u.useSpectralMix);
      p.set("useMask", 0);
    });
    this.copy(this.targets.screen, this.targets.final);

    this.pass(this.programs.typeMap, this.targets.realtimeIntermediate, (p) => {
      p.set("baseTex", { texture: this.targets.typeMap.texture }, 0);
      p.set("strokeTex", { texture: this.targets.draft.texture }, 1);
      p.set("brushCategory", u.brushCategory);
      p.set("whiteMaxOpacity", u.whiteMaxOpacity);
      p.set("useMask", 0);
    });
    this.copy(this.targets.realtimeIntermediate, this.targets.typeMap);

    // Snapshot for Last-Stroke-Only flow, then reset the draft.
    this.copy(this.targets.draft, this.targets.lastStroke);
    this.targets.draft.clear(1, 1, 1, 1);
    this.targets.pingPong.clear(1, 1, 1, 1);
  }

  /**
   * Decodes everything committed onto paper, then tints the in-progress stroke
   * so colour is visible before it has been encoded.
   */
  composite(u: {
    brushColorMode: number;
    brushCategory: number;
    brushColor: readonly [number, number, number];
    whiteMaxOpacity: number;
    hueShift: number;
    satShift: number;
    briShift: number;
    hasLiveStroke: boolean;
  }) {
    this.pass(this.programs.composite, this.targets.screen, (p) => {
      p.set("baseTex", { texture: this.targets.paper.texture }, 0);
      p.set("encodedTex", { texture: this.targets.final.texture }, 1);
      p.set("typeMapTex", { texture: this.targets.typeMap.texture }, 2);
    });

    if (!u.hasLiveStroke) {
      this.copy(this.targets.screen, this.targets.out);
      return;
    }

    this.copy(this.targets.screen, this.targets.realtimeIntermediate);
    this.pass(this.programs.realtime, this.targets.out, (p) => {
      p.set(
        "baseTex",
        { texture: this.targets.realtimeIntermediate.texture },
        0,
      );
      p.set("addTex", { texture: this.targets.draft.texture }, 1);
      p.set("encodedTex", { texture: this.targets.final.texture }, 2);
      p.set("brushColorMode", u.brushColorMode);
      p.set("brushCategory", u.brushCategory);
      p.set("brushColor", u.brushColor);
      p.set("whiteMaxOpacity", u.whiteMaxOpacity);
      p.set("hueShift", u.hueShift);
      p.set("satShift", u.satShift);
      p.set("briShift", u.briShift);
      p.set("useMask", 0);
    });
  }

  /** Post-effect stack. Skipped entirely when nothing is enabled. */
  distort(
    u: DistortUniforms,
    timeSeconds: number,
    seeds: [number, number, number, number],
  ) {
    const any =
      u.distortEnabled ||
      u.rsEnabled ||
      u.cellularEnabled ||
      u.whiteDotDensity > 0.001 ||
      u.grainAmount > 0.01;
    if (!any) return;

    this.copy(this.targets.out, this.targets.screen);
    this.pass(this.programs.distort, this.targets.out, (p) => {
      p.set("tex0", { texture: this.targets.screen.texture }, 0);
      p.set("forceMap", { texture: this.targets.forceMap.texture }, 1);
      p.set("time", timeSeconds);
      p.set("backgroundColor", this.background);
      p.set("distortEnabled", u.distortEnabled);
      p.set("displacementB", u.displacementB);
      p.set("displacementC", u.displacementC);
      p.set("showFbmMask", u.showFbmMask);
      p.set("fbmSeed1", seeds[0]);
      p.set("fbmSeed2", seeds[1]);
      p.set("fbmSeed3", seeds[2]);
      p.set("fbmSeed4", seeds[3]);
      p.set("rsEnabled", u.rsEnabled);
      p.set("rsFrequency", u.rsFrequency);
      p.set("rsWaveSpeed", u.rsWaveSpeed);
      p.set("rsStrength", u.rsStrength);
      p.set("rsGradientMix", u.rsGradientMix);
      p.set("rsScale", u.rsScale);
      p.set("cellularEnabled", u.cellularEnabled);
      p.set("cellularScale", u.cellularScale);
      p.set("cellularSeed", u.cellularSeed);
      p.set("whiteDotDensity", u.whiteDotDensity);
      p.set("grainAmount", u.grainAmount);
    });
  }

  /**
   * Long-press displacement. The colour buffer and the identity buffer must be
   * displaced identically or brush identity drifts away from the colour it
   * describes, so this runs twice with `isTypeMapMode` flipped.
   */
  applyFlow(u: FlowUniforms) {
    const run = (from: Target, into: Target, typeMapMode: boolean) => {
      this.pass(this.programs.flow, into, (p) => {
        p.set("tex0", { texture: from.texture }, 0);
        p.set("lastStrokeTex", { texture: this.targets.lastStroke.texture }, 1);
        p.setInt("lastStrokeOnly", u.lastStrokeOnly ? 1 : 0);
        p.setInt("isTypeMapMode", typeMapMode ? 1 : 0);
        p.setInt("blendType", u.blendType);
        p.set("blendVol", u.blendVol);
        p.set("radSeed", u.radSeed);
        p.set("strokeBounds", u.strokeBounds);
        p.set("pixD", u.pixD);
        p.set("blendA", u.blendA);
        p.set("blendB", u.blendB);
        p.set("directVol", u.directVol);
        p.set("snoiseVol", u.snoiseVol);
        p.setInt("gobalStyle", u.globalStyle);
        p.setInt("vline", 5);
        p.setInt("hline", 5);
        p.set("cellT", 1);
        p.set("colorDeep", u.colorDeep);
        p.set("whiteDot", u.whiteDot);
        p.set("doBigShape", u.doBigShape);
        p.set("doMask", u.doMask);
        p.setInt("multiDir", u.multiDir);
        p.set("seed", u.seed);
        p.set("pixelScale", this.density);
      });
    };

    run(this.targets.final, this.targets.flowScratch, false);
    this.copy(this.targets.flowScratch, this.targets.final);
    run(this.targets.typeMap, this.targets.flowTypeScratch, true);
    this.copy(this.targets.flowTypeScratch, this.targets.typeMap);
  }

  /** Uploads the bug-bite mask and parameter textures produced on the CPU. */
  setBugTextures(mask: HTMLCanvasElement, data: HTMLCanvasElement) {
    this.uploadCanvasTo(this.targets.bugsMask, mask);
    this.uploadCanvasTo(this.targets.bugsData, data);
  }

  /** Bug-bite etching overlay, drawn over the composited output. */
  applyMetallic(u: MetallicUniforms, timeMs: number) {
    this.copy(this.targets.out, this.targets.metallic);
    this.pass(this.programs.metallic, this.targets.out, (p) => {
      p.set("tex0", { texture: this.targets.metallic.texture }, 0);
      p.set("bugsMask", { texture: this.targets.bugsMask.texture }, 1);
      p.set("bugsData", { texture: this.targets.bugsData.texture }, 2);
      p.set("time", timeMs);
      p.set("resolution", [this.width, this.height]);
      p.set("metallicStrength", u.strength);
      p.set("flowSpeed", u.flowSpeed);
      p.set("lightPos", u.lightPos);
      p.set("fresnelStrength", u.fresnelStrength);
      p.set("metalTint", u.tint);
    });
  }

  /** Presents the output target to the drawing buffer. */
  present() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.width, this.height);
    gl.disable(gl.BLEND);
    gl.useProgram(this.blitProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.blitQuad);
    const loc = gl.getAttribLocation(this.blitProgram, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.targets.out.texture);
    if (this.blitLocs.tex) gl.uniform1i(this.blitLocs.tex, 0);
    if (this.blitLocs.flip) gl.uniform1f(this.blitLocs.flip, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /** Reads the composited output back for the bug-bite dark-pixel scan. */
  readOutput(): Uint8Array {
    const gl = this.gl;
    const pixels = new Uint8Array(this.width * this.height * 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.targets.out.framebuffer);
    gl.readPixels(
      0,
      0,
      this.width,
      this.height,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      pixels,
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return pixels;
  }

  clearArtwork() {
    this.targets.final.clear(1, 1, 1, 1);
    this.targets.typeMap.clear(0, 0, 0, 1);
    this.targets.draft.clear(1, 1, 1, 1);
    this.targets.pingPong.clear(1, 1, 1, 1);
    this.targets.lastStroke.clear(1, 1, 1, 1);
    this.targets.bugsMask.clear(0, 0, 0, 0);
    this.targets.bugsData.clear(0, 0, 0, 0);
  }

  setBackground(
    color: [number, number, number],
    paper: boolean,
    grain: number,
  ) {
    this.background = color;
    this.targets.flat.clear(color[0], color[1], color[2], 1);
    this.buildPaper(paper, grain);
  }

  resize(options: EngineOptions = {}) {
    const w = Math.max(1, Math.round(this.canvas.clientWidth * this.density));
    const h = Math.max(1, Math.round(this.canvas.clientHeight * this.density));
    if (w === this.width && h === this.height) return false;
    this.width = w;
    this.height = h;
    this.canvas.width = w;
    this.canvas.height = h;
    this.allocate(options);
    return true;
  }

  /** Canvas size in CSS pixels. The brush draws in this space, as p5 does. */
  get cssWidth() {
    return this.width / this.density;
  }

  get cssHeight() {
    return this.height / this.density;
  }

  get context() {
    return this.gl;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    const gl = this.gl;
    for (const t of Object.values(this.targets)) t.dispose();
    for (const p of Object.values(this.programs)) p.dispose();
    gl.deleteProgram(this.blitProgram);
    gl.deleteBuffer(this.quad);
    gl.deleteBuffer(this.blitQuad);
    gl.deleteTexture(this.stampTexture);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
