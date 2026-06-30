"use client";

/**
 * Cappen Fluid Simulation - a full-screen WebGL ink field.
 *
 * The canvas runs a compact GPU fluid solver built from ping-pong render
 * targets. Pointer velocity splats into the velocity and dye fields, then the
 * display pass thresholds the dye into a high-contrast ink layer. The original
 * reference was global; this version scopes input, resize, rAF, and WebGL
 * disposal to the React component.
 *
 * BLANK - aryank.space
 */

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export interface CappenFluidSimulationProps {
  logo?: string;
  navLinks?: { label: string; href: string }[];
  headline?: [string, string, string] | string[];
  background?: string;
  textColor?: string;
  inkColor?: string;
  blendMode?: CSSProperties["mixBlendMode"];
  showNav?: boolean;
  simResolution?: number;
  dyeResolution?: number;
  curl?: number;
  pressureIterations?: number;
  velocityDissipation?: number;
  dyeDissipation?: number;
  splatRadius?: number;
  forceStrength?: number;
  pressureDecay?: number;
  threshold?: number;
  edgeSoftness?: number;
  idle?: boolean;
}

type ShaderPair = readonly [string, string];

type DoubleTarget = {
  read: THREE.WebGLRenderTarget;
  write: THREE.WebGLRenderTarget;
  swap: () => void;
};

type FluidConfig = Required<
  Pick<
    CappenFluidSimulationProps,
    | "simResolution"
    | "dyeResolution"
    | "curl"
    | "pressureIterations"
    | "velocityDissipation"
    | "dyeDissipation"
    | "splatRadius"
    | "forceStrength"
    | "pressureDecay"
    | "threshold"
    | "edgeSoftness"
    | "idle"
  >
> & {
  inkColor: THREE.Color;
};

type UniformValue =
  | number
  | THREE.Color
  | THREE.Texture
  | THREE.Vector2
  | THREE.Vector3
  | null;

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const precision = `precision highp float;`;
const sampler = `precision mediump sampler2D;`;

const shaders = {
  splat: [
    vertexShader,
    `${precision} ${sampler}
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform float radius;
    uniform vec3 color;
    uniform vec2 point;
    varying vec2 vUv;
    void main() {
      vec2 p = vUv - point;
      p.x *= aspectRatio;
      gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + exp(-dot(p, p) / radius) * color, 1.0);
    }`,
  ],
  advection: [
    vertexShader,
    `${precision} ${sampler}
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform float dt;
    uniform float dissipation;
    varying vec2 vUv;
    void main() {
      gl_FragColor = vec4(dissipation * texture2D(uSource, vUv - dt * texture2D(uVelocity, vUv).xy * texelSize).rgb, 1.0);
    }`,
  ],
  divergence: [
    vertexShader,
    `${precision} ${sampler}
    uniform sampler2D uVelocity;
    uniform vec2 texelSize;
    varying vec2 vUv;
    vec2 vel(vec2 uv) {
      vec2 edge = vec2(1.0);
      if (uv.x < 0.0) { uv.x = 0.0; edge.x = -1.0; }
      if (uv.x > 1.0) { uv.x = 1.0; edge.x = -1.0; }
      if (uv.y < 0.0) { uv.y = 0.0; edge.y = -1.0; }
      if (uv.y > 1.0) { uv.y = 1.0; edge.y = -1.0; }
      return edge * texture2D(uVelocity, uv).xy;
    }
    void main() {
      vec2 L = vUv - vec2(texelSize.x, 0.0);
      vec2 R = vUv + vec2(texelSize.x, 0.0);
      vec2 T = vUv + vec2(0.0, texelSize.y);
      vec2 B = vUv - vec2(0.0, texelSize.y);
      gl_FragColor = vec4(0.5 * (vel(R).x - vel(L).x + vel(T).y - vel(B).y), 0.0, 0.0, 1.0);
    }`,
  ],
  curl: [
    vertexShader,
    `${precision} ${sampler}
    uniform sampler2D uVelocity;
    uniform vec2 texelSize;
    varying vec2 vUv;
    void main() {
      vec2 L = vUv - vec2(texelSize.x, 0.0);
      vec2 R = vUv + vec2(texelSize.x, 0.0);
      vec2 T = vUv + vec2(0.0, texelSize.y);
      vec2 B = vUv - vec2(0.0, texelSize.y);
      gl_FragColor = vec4(texture2D(uVelocity, R).y - texture2D(uVelocity, L).y - texture2D(uVelocity, T).x + texture2D(uVelocity, B).x, 0.0, 0.0, 1.0);
    }`,
  ],
  vorticity: [
    vertexShader,
    `${precision} ${sampler}
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform vec2 texelSize;
    uniform float curlStrength;
    uniform float dt;
    varying vec2 vUv;
    void main() {
      vec2 L = vUv - vec2(texelSize.x, 0.0);
      vec2 R = vUv + vec2(texelSize.x, 0.0);
      vec2 T = vUv + vec2(0.0, texelSize.y);
      vec2 B = vUv - vec2(0.0, texelSize.y);
      vec2 force = normalize(vec2(abs(texture2D(uCurl, T).x) - abs(texture2D(uCurl, B).x), abs(texture2D(uCurl, R).x) - abs(texture2D(uCurl, L).x)) + 0.0001) * curlStrength * texture2D(uCurl, vUv).x;
      gl_FragColor = vec4(texture2D(uVelocity, vUv).xy + force * dt, 0.0, 1.0);
    }`,
  ],
  pressure: [
    vertexShader,
    `${precision} ${sampler}
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    uniform vec2 texelSize;
    varying vec2 vUv;
    void main() {
      vec2 L = clamp(vUv - vec2(texelSize.x, 0.0), 0.0, 1.0);
      vec2 R = clamp(vUv + vec2(texelSize.x, 0.0), 0.0, 1.0);
      vec2 T = clamp(vUv + vec2(0.0, texelSize.y), 0.0, 1.0);
      vec2 B = clamp(vUv - vec2(0.0, texelSize.y), 0.0, 1.0);
      gl_FragColor = vec4((texture2D(uPressure, L).x + texture2D(uPressure, R).x + texture2D(uPressure, T).x + texture2D(uPressure, B).x - texture2D(uDivergence, vUv).x) * 0.25, 0.0, 0.0, 1.0);
    }`,
  ],
  gradientSubtract: [
    vertexShader,
    `${precision} ${sampler}
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    uniform vec2 texelSize;
    varying vec2 vUv;
    void main() {
      float pL = texture2D(uPressure, clamp(vUv - vec2(texelSize.x, 0.0), 0.0, 1.0)).x;
      float pR = texture2D(uPressure, clamp(vUv + vec2(texelSize.x, 0.0), 0.0, 1.0)).x;
      float pT = texture2D(uPressure, clamp(vUv + vec2(0.0, texelSize.y), 0.0, 1.0)).x;
      float pB = texture2D(uPressure, clamp(vUv - vec2(0.0, texelSize.y), 0.0, 1.0)).x;
      gl_FragColor = vec4(texture2D(uVelocity, vUv).xy - vec2(pR - pL, pT - pB), 0.0, 1.0);
    }`,
  ],
  clear: [
    vertexShader,
    `${precision} ${sampler}
    uniform sampler2D uTexture;
    uniform float value;
    varying vec2 vUv;
    void main() {
      gl_FragColor = value * texture2D(uTexture, vUv);
    }`,
  ],
  display: [
    vertexShader,
    `${precision}
    uniform sampler2D uTexture;
    uniform float threshold;
    uniform float edgeSoftness;
    uniform vec3 inkColor;
    varying vec2 vUv;
    void main() {
      float density = clamp(length(texture2D(uTexture, vUv).rgb), 0.0, 1.0);
      float alpha = edgeSoftness > 0.0
        ? smoothstep(threshold - edgeSoftness * 0.5, threshold + edgeSoftness * 0.5, density)
        : step(threshold, density);
      gl_FragColor = vec4(inkColor, alpha);
    }`,
  ],
} satisfies Record<string, ShaderPair>;

class FluidEngine {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
  private material!: Record<keyof typeof shaders, THREE.ShaderMaterial>;
  private velocity!: DoubleTarget;
  private dye!: DoubleTarget;
  private divergence!: THREE.WebGLRenderTarget;
  private curlTarget!: THREE.WebGLRenderTarget;
  private pressure!: DoubleTarget;
  private simSize = { w: 1, h: 1 };
  private dyeSize = { w: 1, h: 1 };
  private dpr = 1;
  private width = 1;
  private height = 1;
  private frame = 0;
  private lastTime = performance.now();
  private lastIdleSplat = 0;
  private resizeObserver: ResizeObserver;
  private cleanupFns: (() => void)[] = [];
  private mouse = { x: 0, y: 0, velocityX: 0, velocityY: 0, moved: false };

  constructor(
    canvas: HTMLCanvasElement,
    private root: HTMLElement,
    private config: FluidConfig,
  ) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    this.scene.add(this.quad);
    this.setupMaterials();
    this.resize();
    this.setupInput();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(root);
    this.seed();
    this.loop();
  }

  private makeTarget(w: number, h: number) {
    return new THREE.WebGLRenderTarget(w, h, {
      type: THREE.HalfFloatType,
      depthBuffer: false,
      stencilBuffer: false,
    });
  }

  private makeDoubleTarget(w: number, h: number): DoubleTarget {
    return {
      read: this.makeTarget(w, h),
      write: this.makeTarget(w, h),
      swap() {
        [this.read, this.write] = [this.write, this.read];
      },
    };
  }

  private setupTargets() {
    this.disposeTargets();
    const aspect = this.width / this.height;
    const simHeight = Math.max(
      2,
      Math.round(this.config.simResolution / aspect),
    );
    const dyeHeight = Math.max(
      2,
      Math.round(this.config.dyeResolution / aspect),
    );
    this.simSize = { w: this.config.simResolution, h: simHeight };
    this.dyeSize = { w: this.config.dyeResolution, h: dyeHeight };
    this.velocity = this.makeDoubleTarget(this.simSize.w, this.simSize.h);
    this.dye = this.makeDoubleTarget(this.dyeSize.w, this.dyeSize.h);
    this.divergence = this.makeTarget(this.simSize.w, this.simSize.h);
    this.curlTarget = this.makeTarget(this.simSize.w, this.simSize.h);
    this.pressure = this.makeDoubleTarget(this.simSize.w, this.simSize.h);
  }

  private setupMaterials() {
    const make = (
      [vertexShaderSource, fragmentShader]: ShaderPair,
      uniforms: Record<string, THREE.IUniform<UniformValue>>,
    ) =>
      new THREE.ShaderMaterial({
        vertexShader: vertexShaderSource,
        fragmentShader,
        uniforms,
      });
    const tex = () => ({ value: null });
    const num = (value = 0) => ({ value });
    const vec2 = () => ({ value: new THREE.Vector2() });

    this.material = {
      splat: make(shaders.splat, {
        uTarget: tex(),
        aspectRatio: num(),
        radius: num(),
        color: { value: new THREE.Vector3() },
        point: { value: new THREE.Vector2() },
      }),
      advection: make(shaders.advection, {
        uVelocity: tex(),
        uSource: tex(),
        texelSize: vec2(),
        dt: num(),
        dissipation: num(),
      }),
      divergence: make(shaders.divergence, {
        uVelocity: tex(),
        texelSize: vec2(),
      }),
      curl: make(shaders.curl, {
        uVelocity: tex(),
        texelSize: vec2(),
      }),
      vorticity: make(shaders.vorticity, {
        uVelocity: tex(),
        uCurl: tex(),
        texelSize: vec2(),
        curlStrength: num(),
        dt: num(),
      }),
      pressure: make(shaders.pressure, {
        uPressure: tex(),
        uDivergence: tex(),
        texelSize: vec2(),
      }),
      gradientSubtract: make(shaders.gradientSubtract, {
        uPressure: tex(),
        uVelocity: tex(),
        texelSize: vec2(),
      }),
      clear: make(shaders.clear, {
        uTexture: tex(),
        value: num(),
      }),
      display: make(shaders.display, {
        uTexture: tex(),
        threshold: num(),
        edgeSoftness: num(),
        inkColor: { value: new THREE.Color() },
      }),
    };
  }

  private resize() {
    const bounds = this.root.getBoundingClientRect();
    const nextWidth = Math.max(1, Math.floor(bounds.width));
    const nextHeight = Math.max(1, Math.floor(bounds.height));
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = nextWidth * this.dpr;
    this.height = nextHeight * this.dpr;
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(nextWidth, nextHeight, false);
    this.setupTargets();
    this.seed();
  }

  private setupInput() {
    const move = (clientX: number, clientY: number) => {
      const rect = this.root.getBoundingClientRect();
      const x = (clientX - rect.left) * this.dpr;
      const y = (clientY - rect.top) * this.dpr;
      this.mouse.velocityX = (x - this.mouse.x) * this.config.forceStrength;
      this.mouse.velocityY = (y - this.mouse.y) * this.config.forceStrength;
      this.mouse.x = x;
      this.mouse.y = y;
      this.mouse.moved = true;
    };

    const onPointerMove = (event: PointerEvent) => {
      move(event.clientX, event.clientY);
    };
    const onPointerDown = (event: PointerEvent) => {
      this.root.setPointerCapture?.(event.pointerId);
      move(event.clientX, event.clientY);
    };

    this.root.addEventListener("pointermove", onPointerMove);
    this.root.addEventListener("pointerdown", onPointerDown);
    this.cleanupFns.push(() => {
      this.root.removeEventListener("pointermove", onPointerMove);
      this.root.removeEventListener("pointerdown", onPointerDown);
    });
  }

  private pass(
    material: THREE.ShaderMaterial,
    target?: THREE.WebGLRenderTarget,
  ) {
    this.quad.material = material;
    this.renderer.setRenderTarget(target ?? null);
    this.renderer.render(this.scene, this.camera);
  }

  private setUniforms(
    material: THREE.ShaderMaterial,
    values: Record<string, UniformValue>,
  ) {
    for (const [key, value] of Object.entries(values)) {
      const uniform = material.uniforms[key];
      if (uniform) uniform.value = value;
    }
    return material;
  }

  private splat(x: number, y: number, velocityX: number, velocityY: number) {
    this.setUniforms(this.material.splat, {
      aspectRatio: this.width / this.height,
      point: new THREE.Vector2(x / this.width, 1 - y / this.height),
      radius: this.config.splatRadius / 100,
    });

    this.setUniforms(this.material.splat, {
      uTarget: this.velocity.read.texture,
      color: new THREE.Vector3(velocityX, -velocityY, 0),
    });
    this.pass(this.material.splat, this.velocity.write);
    this.velocity.swap();

    this.setUniforms(this.material.splat, {
      uTarget: this.dye.read.texture,
      color: new THREE.Vector3(3, 3, 3),
    });
    this.pass(this.material.splat, this.dye.write);
    this.dye.swap();
  }

  private seed() {
    const points = [
      [0.2, 0.28, 340, -180],
      [0.72, 0.36, -280, 220],
      [0.42, 0.7, 220, -300],
    ];
    for (const [x, y, vx, vy] of points) {
      this.splat(this.width * x, this.height * y, vx, vy);
    }
  }

  private simulate(dt: number) {
    const simTexel = new THREE.Vector2(1 / this.simSize.w, 1 / this.simSize.h);

    this.pass(
      this.setUniforms(this.material.curl, {
        uVelocity: this.velocity.read.texture,
        texelSize: simTexel,
      }),
      this.curlTarget,
    );
    this.pass(
      this.setUniforms(this.material.vorticity, {
        uVelocity: this.velocity.read.texture,
        uCurl: this.curlTarget.texture,
        texelSize: simTexel,
        curlStrength: this.config.curl,
        dt,
      }),
      this.velocity.write,
    );
    this.velocity.swap();

    this.pass(
      this.setUniforms(this.material.divergence, {
        uVelocity: this.velocity.read.texture,
        texelSize: simTexel,
      }),
      this.divergence,
    );

    this.pass(
      this.setUniforms(this.material.clear, {
        uTexture: this.pressure.read.texture,
        value: this.config.pressureDecay,
      }),
      this.pressure.write,
    );
    this.pressure.swap();

    this.setUniforms(this.material.pressure, {
      uDivergence: this.divergence.texture,
      texelSize: simTexel,
    });
    for (let i = 0; i < this.config.pressureIterations; i++) {
      this.material.pressure.uniforms.uPressure.value =
        this.pressure.read.texture;
      this.pass(this.material.pressure, this.pressure.write);
      this.pressure.swap();
    }

    this.pass(
      this.setUniforms(this.material.gradientSubtract, {
        uPressure: this.pressure.read.texture,
        uVelocity: this.velocity.read.texture,
        texelSize: simTexel,
      }),
      this.velocity.write,
    );
    this.velocity.swap();

    this.setUniforms(this.material.advection, {
      uVelocity: this.velocity.read.texture,
      uSource: this.velocity.read.texture,
      texelSize: simTexel,
      dt,
      dissipation: this.config.velocityDissipation,
    });
    this.pass(this.material.advection, this.velocity.write);
    this.velocity.swap();

    this.setUniforms(this.material.advection, {
      uVelocity: this.velocity.read.texture,
      uSource: this.dye.read.texture,
      texelSize: new THREE.Vector2(1 / this.dyeSize.w, 1 / this.dyeSize.h),
      dissipation: this.config.dyeDissipation,
      dt,
    });
    this.pass(this.material.advection, this.dye.write);
    this.dye.swap();
  }

  private render() {
    this.pass(
      this.setUniforms(this.material.display, {
        uTexture: this.dye.read.texture,
        threshold: this.config.threshold,
        edgeSoftness: this.config.edgeSoftness,
        inkColor: this.config.inkColor,
      }),
    );
  }

  private loop() {
    const tick = (now: number) => {
      const dt = Math.min((now - this.lastTime) / 1000, 0.016);
      this.lastTime = now;

      if (this.mouse.moved) {
        this.splat(
          this.mouse.x,
          this.mouse.y,
          this.mouse.velocityX,
          this.mouse.velocityY,
        );
        this.mouse.moved = false;
      } else if (this.config.idle && now - this.lastIdleSplat > 120) {
        const t = now * 0.00035;
        this.splat(
          this.width * (0.5 + Math.cos(t) * 0.28),
          this.height * (0.52 + Math.sin(t * 1.27) * 0.24),
          Math.sin(t * 2.1) * 140,
          Math.cos(t * 1.6) * 140,
        );
        this.lastIdleSplat = now;
      }

      this.simulate(dt);
      this.render();
      this.frame = requestAnimationFrame(tick);
    };

    this.frame = requestAnimationFrame(tick);
  }

  private disposeDoubleTarget(target?: DoubleTarget) {
    target?.read.dispose();
    target?.write.dispose();
  }

  private disposeTargets() {
    this.disposeDoubleTarget(this.velocity);
    this.disposeDoubleTarget(this.dye);
    this.disposeDoubleTarget(this.pressure);
    this.divergence?.dispose();
    this.curlTarget?.dispose();
  }

  dispose() {
    cancelAnimationFrame(this.frame);
    this.resizeObserver.disconnect();
    for (const cleanup of this.cleanupFns) cleanup();
    this.disposeTargets();
    for (const material of Object.values(this.material)) material.dispose();
    this.quad.geometry.dispose();
    this.renderer.dispose();
  }
}

const DEFAULT_LINKS = [
  { label: "works", href: "#" },
  { label: "about", href: "#" },
  { label: "updates", href: "#" },
  { label: "start a project", href: "#" },
];

export default function CappenFluidSimulation({
  logo = "Vortex",
  navLinks = DEFAULT_LINKS,
  headline = ["Fluid System In", "Constant Field", "Of Interaction"],
  background = "#ffffff",
  textColor = "#000000",
  inkColor = "#ffffff",
  blendMode = "difference",
  showNav = true,
  simResolution = 256,
  dyeResolution = 1024,
  curl = 50,
  pressureIterations = 40,
  velocityDissipation = 0.95,
  dyeDissipation = 0.95,
  splatRadius = 0.3,
  forceStrength = 8.5,
  pressureDecay = 0.75,
  threshold = 1,
  edgeSoftness = 0,
  idle = true,
}: CappenFluidSimulationProps) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lines = headline.slice(0, 3);

  const config = useMemo<FluidConfig>(
    () => ({
      simResolution,
      dyeResolution,
      curl,
      pressureIterations,
      velocityDissipation,
      dyeDissipation,
      splatRadius,
      forceStrength,
      pressureDecay,
      threshold,
      edgeSoftness,
      idle,
      inkColor: new THREE.Color(inkColor),
    }),
    [
      simResolution,
      dyeResolution,
      curl,
      pressureIterations,
      velocityDissipation,
      dyeDissipation,
      splatRadius,
      forceStrength,
      pressureDecay,
      threshold,
      edgeSoftness,
      idle,
      inkColor,
    ],
  );

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const engine = new FluidEngine(canvas, root, config);
    return () => engine.dispose();
  }, [config]);

  return (
    <section
      className="cfs-root"
      ref={rootRef}
      style={
        {
          "--cfs-bg": background,
          "--cfs-text": textColor,
          "--cfs-blend": blendMode,
        } as CSSProperties
      }
    >
      <style>{styles}</style>
      {showNav ? (
        <nav className="cfs-nav" aria-label="Fluid simulation navigation">
          <a className="cfs-logo" href="/">
            {logo}
          </a>
          <div className="cfs-links">
            {navLinks.map((link) => (
              <a href={link.href} key={`${link.label}-${link.href}`}>
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      ) : null}
      <div className="cfs-hero">
        {lines.map((line) => (
          <h2 key={line}>{line}</h2>
        ))}
      </div>
      <canvas ref={canvasRef} className="cfs-canvas" />
    </section>
  );
}

const styles = `
.cfs-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 620px;
  overflow: hidden;
  background: var(--cfs-bg);
  color: var(--cfs-text);
  touch-action: none;
  user-select: none;
}

.cfs-nav {
  position: absolute;
  inset: 0 0 auto 0;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: clamp(1rem, 3vw, 2rem);
  color: var(--cfs-text);
}

.cfs-nav a {
  display: inline-block;
  color: currentColor;
  text-decoration: none;
  text-transform: uppercase;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: clamp(0.68rem, 0.9vw, 0.85rem);
  font-weight: 600;
  letter-spacing: 0.04em;
}

.cfs-logo {
  font-family: inherit;
  font-size: clamp(0.8rem, 1vw, 1rem) !important;
  font-weight: 900 !important;
}

.cfs-links {
  display: flex;
  gap: clamp(1rem, 4vw, 4rem);
}

.cfs-hero {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  min-height: inherit;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(1rem, 3vw, 2rem);
  overflow: hidden;
}

.cfs-hero h2 {
  margin: 0;
  text-transform: uppercase;
  font-family: ui-sans-serif, system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(3rem, 10vw, 15rem);
  line-height: 0.9;
  letter-spacing: 0;
}

.cfs-hero h2:nth-child(2) {
  align-self: flex-end;
}

.cfs-hero h2:nth-child(3) {
  align-self: center;
}

.cfs-canvas {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
  mix-blend-mode: var(--cfs-blend);
}

@media (max-width: 1000px) {
  .cfs-root {
    min-height: 560px;
  }

  .cfs-links {
    flex-direction: column;
    align-items: flex-end;
    gap: 0.15rem;
  }

  .cfs-hero h2 {
    align-self: center !important;
    text-align: center;
    font-size: clamp(3rem, 16vw, 8rem);
  }
}
`;
