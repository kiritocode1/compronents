"use client";

import { useEffect, useRef, useState } from "react";

export const DEFAULT_ASSET_BASE =
  "https://ui.aryank.space/assets/ink-core-layout";

const CARDS = [
  {
    title: "the rarest material",
    body: "the universe has eons and you have about eighty. that makes your time the rarest material in existence. we build with it.",
    image: "5.png",
    left: 0,
    top: 0,
  },
  {
    title: "the idea",
    body: "you can't own more time. but a moment, fully noticed, is time made solid. the more you notice, the more life you get to keep.",
    image: "4.png",
    left: 6,
    top: 5,
  },
  {
    title: "the idea behind the name",
    body: "an old idea we kept returning to: every thing happens once. do the same thing tomorrow and you'll make something else entirely. that's what makes it precious.",
    image: "1.png",
    left: 11,
    top: 2,
  },
  {
    title: "the name",
    body: "ichigo ichie, a japanese phrase. we compressed it into one word: BLANK. a studio named after the fact that nothing happens twice.",
    image: "2.png",
    left: 15,
    top: 4,
  },
  {
    title: "the mark",
    body: "our wordmark was drawn by a calligraphy artist. ink and brush. she shipped us the original. it exists exactly once, which is the entire point.",
    image: "3.png",
    left: 21,
    top: 1,
  },
  {
    title: "the king",
    body: "in shogi, who is the king you're protecting? it is not the piece but the ones who come after you. that's the other way humans hold time. we pass things down.",
    image: "8.png",
    left: 25,
    top: 5,
  },
  {
    title: "the studio",
    body: "so this is what we do. objects, brands, film, software, archives. different disciplines, one passion. making moments you can preserve.",
    image: "7-r2.png",
    left: 30,
    top: 0,
  },
  {
    title: "est. 2026",
    body: "we began with time. we intend to leave some behind. BLANK studio, designed to hold time.",
    image: "8.mp4",
    left: 35,
    top: 4,
  },
] as const;

export interface InkCoreLayoutProps {
  /** Milliseconds the opening ink screen remains visible. */
  loadingDuration?: number;
  /** Base URL for the registered image and video assets. */
  assetBase?: string;
  className?: string;
}

/**
 * A compact, horizontal studio layout with source-backed segmented tiles and
 * a cursor-drawn ink field.
 *
 * BLANK - aryank.space
 */
export default function InkCoreLayout({
  loadingDuration = 5667,
  assetBase = DEFAULT_ASSET_BASE,
  className = "",
}: InkCoreLayoutProps) {
  const rootRef = useRef<HTMLElement>(null);
  const panRef = useRef(0);
  const inkScrollRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const [inkVisible, setInkVisible] = useState(true);
  const [still, setStill] = useState(false);
  const [largeType, setLargeType] = useState(false);
  const [panX, setPanX] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => setLoading(false), loadingDuration);
    return () => window.clearTimeout(timeout);
  }, [loadingDuration]);

  useEffect(() => {
    const font = new FontFace(
      "Ink Core Switzer",
      `url(${assetBase}/switzer.ttf)`,
    );
    void font.load().then((loaded) => document.fonts.add(loaded));
    return () => {
      document.fonts.delete(font);
    };
  }, [assetBase]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let startX = 0;
    let startPan = 0;
    let dragging = false;
    const maxPan = () => {
      const unit = Math.max(32, (root.clientHeight - 190) / 10);
      return Math.min(
        0,
        root.clientWidth - (root.clientWidth * 0.14 + unit * 38),
      );
    };
    const down = (event: PointerEvent) => {
      if ((event.target as HTMLElement).closest("a, button")) return;
      startX = event.clientX;
      startPan = panRef.current;
      dragging = true;
      root.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      if (!dragging) return;
      const nextPan = Math.max(
        maxPan(),
        Math.min(0, startPan + event.clientX - startX),
      );
      panRef.current = nextPan;
      inkScrollRef.current = -nextPan;
      setPanX(nextPan);
    };
    const up = (event: PointerEvent) => {
      dragging = false;
      root.releasePointerCapture(event.pointerId);
    };

    root.addEventListener("pointerdown", down);
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerup", up);
    root.addEventListener("pointercancel", up);
    return () => {
      root.removeEventListener("pointerdown", down);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerup", up);
      root.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <section
      className={`ink-core-layout ${still ? "is-still" : ""} ${largeType ? "is-large" : ""} ${className}`}
      aria-label="Ink field editorial layout"
      ref={rootRef}
      style={
        {
          "--icl-loading-duration": `${loadingDuration}ms`,
        } as React.CSSProperties
      }
    >
      <style>{styles}</style>
      {inkVisible ? (
        <InkCursor rootRef={rootRef} scrollX={inkScrollRef} />
      ) : null}

      <a className="icl-retrace" href="#start">
        ‹‹ RETRACE STEPS
      </a>
      <a className="icl-explore" href="#end">
        EXPLORE STUDIO »
      </a>

      <div
        className="icl-rail"
        id="start"
        style={{ transform: `translate3d(${panX}px, 0, 0)` }}
      >
        {CARDS.map((card, index) => (
          <article
            className="icl-card"
            key={card.title}
            style={
              {
                "--left": card.left,
                "--top": card.top,
              } as React.CSSProperties
            }
          >
            <div className="icl-card-image" aria-hidden="true">
              {card.image.endsWith(".mp4") ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  src={`${assetBase}/${card.image}`}
                />
              ) : (
                Array.from({ length: 6 }, (_, band) => (
                  <span
                    className="icl-band"
                    key={band}
                    style={{ "--band": band } as React.CSSProperties}
                  >
                    <img alt="" src={`${assetBase}/${card.image}`} />
                  </span>
                ))
              )}
            </div>
            <p className="icl-cap">
              CORE-{String(index + 1).padStart(3, "0")} · {card.title}
            </p>
            <p className="icl-copy">{card.body}</p>
          </article>
        ))}
      </div>

      <div className="icl-footer" id="end">
        <button type="button">♪ MUSIC · PLAY</button>
        <p>BLANK studio · est. 2026 · core</p>
        <span>▸ 000</span>
      </div>

      <div className="icl-controls">
        <button type="button" onClick={() => setInkVisible((value) => !value)}>
          HOLD TIME WITH INK · {inkVisible ? "ON" : "OFF"}
        </button>
        <button type="button" onClick={() => setStill((value) => !value)}>
          MOTION · {still ? "STILL" : "FULL"}
        </button>
        <button
          type="button"
          aria-label="Toggle text size"
          onClick={() => setLargeType((value) => !value)}
        >
          Aᵃ
        </button>
      </div>

      {loading ? (
        <LoadingScreen
          assetBase={assetBase}
          loadingDuration={loadingDuration}
        />
      ) : null}
    </section>
  );
}

const INK_VERTEX_SHADER = `
  attribute vec2 aPos;
  varying vec2 vUv;
  void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const INK_SIMULATION_SHADER = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uPrev;
  uniform vec2 uTexel;
  uniform vec2 uCursor;
  uniform vec2 uPrevCursor;
  uniform float uDeposit;
  uniform float uDissipate;
  uniform float uTime;
  uniform float uAspect;
  uniform float uShift;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ v += a * noise(p); p *= 2.0; a *= 0.5; } return v; }
  vec2 curl(vec2 p){
    float e = 0.1;
    float a = fbm(p + vec2(0.0, e)); float b = fbm(p - vec2(0.0, e));
    float c = fbm(p + vec2(e, 0.0)); float d = fbm(p - vec2(e, 0.0));
    return vec2(a - b, d - c) / (2.0 * e);
  }
  vec4 samp4(vec2 uv){
    vec2 s = uv + vec2(uShift, 0.0);
    float inb = step(0.0, s.x) * step(s.x, 1.0) * step(0.0, s.y) * step(s.y, 1.0);
    return texture2D(uPrev, s) * inb;
  }
  float segDist(vec2 uv, vec2 a, vec2 b){
    vec2 pa = (uv - a) * vec2(uAspect, 1.0), ba = (b - a) * vec2(uAspect, 1.0);
    float h = clamp(dot(pa, ba) / max(1e-5, dot(ba, ba)), 0.0, 1.0);
    return length(pa - ba * h);
  }

  void main(){
    vec2 uv = vUv;
    float wet = samp4(uv).g;
    vec2 vel = curl(vec2(uv.x * uAspect, uv.y) * 2.4 + uTime * 0.05) * 0.1;
    vec4 c = samp4(uv - vel * 0.003 * wet);
    vec2 e = uTexel * 0.75;
    vec4 bl = (samp4(uv + vec2(e.x, 0.0)) + samp4(uv - vec2(e.x, 0.0))
             + samp4(uv + vec2(0.0, e.y)) + samp4(uv - vec2(0.0, e.y))
             + samp4(uv + e) + samp4(uv - e)
             + samp4(uv + vec2(e.x, -e.y)) + samp4(uv + vec2(-e.x, e.y))) * 0.125;
    float bleed = 0.3 * wet;
    float dens = mix(c.r, bl.r, bleed);
    float wetN = mix(c.g, bl.g, bleed);
    float d = segDist(uv, uPrevCursor, uCursor);
    float dep = uDeposit * (smoothstep(0.006, 0.0, d) + 0.25 * smoothstep(0.016, 0.0, d));
    dens += dep;
    wetN = max(wetN * 0.972, min(1.0, dep * 3.0));
    float dith = step(0.93, hash(uv * 613.7 + vec2(fract(uTime * 0.711) * 100.0))) * 0.0047;
    dens = dens * uDissipate - dith;
    gl_FragColor = vec4(clamp(dens, 0.0, 1.0), clamp(wetN, 0.0, 1.0), 0.0, 1.0);
  }
`;

const INK_DISPLAY_SHADER = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform float uWindow;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  void main(){
    vec2 suv = vec2((vUv.x + (uWindow - 1.0) * 0.5) / uWindow, vUv.y);
    float dens = texture2D(uTex, suv).r;
    vec3 ink = vec3(0.016, 0.043, 0.020);
    float grain = 0.88 + 0.12 * vnoise(vUv * 220.0);
    float a = smoothstep(0.05, 0.8, dens) * grain * 0.85;
    if (a < 0.004) discard;
    gl_FragColor = vec4(ink, a);
  }
`;

const INK_IDLE_CLEAR_MS = 10_000;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  console.warn("InkTrail shader:", gl.getShaderInfoLog(shader));
  return null;
}

function createInkProgram(gl: WebGLRenderingContext, fragment: string) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, INK_VERTEX_SHADER);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragment);
  if (!vertexShader || !fragmentShader) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  return program;
}

function activateInkProgram(gl: WebGLRenderingContext, program: WebGLProgram) {
  // biome-ignore lint/correctness/useHookAtTopLevel: WebGL's useProgram is not a React hook.
  gl.useProgram(program);
}

function InkCursor({
  rootRef,
  scrollX,
}: {
  rootRef: React.RefObject<HTMLElement | null>;
  scrollX: React.RefObject<number>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (
      !root ||
      !canvas ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(pointer: coarse)").matches
    )
      return;

    try {
      const gl = canvas.getContext("webgl", {
        alpha: true,
        premultipliedAlpha: false,
      });
      if (!gl) return;

      const simulationProgram = createInkProgram(gl, INK_SIMULATION_SHADER);
      const displayProgram = createInkProgram(gl, INK_DISPLAY_SHADER);
      if (!simulationProgram || !displayProgram) return;

      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW,
      );
      const bindPosition = (program: WebGLProgram) => {
        const location = gl.getAttribLocation(program, "aPos");
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
      };
      const createTarget = (width: number, height: number) => {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          width,
          height,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          null,
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(
          gl.FRAMEBUFFER,
          gl.COLOR_ATTACHMENT0,
          gl.TEXTURE_2D,
          texture,
          0,
        );
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        return { texture, framebuffer };
      };

      let simulationWidth = 2;
      let simulationHeight = 2;
      let viewportWidth = 1;
      let viewportHeight = 1;
      let targets = [createTarget(2, 2), createTarget(2, 2)];
      const resize = () => {
        viewportWidth = Math.max(1, root.clientWidth);
        viewportHeight = Math.max(1, root.clientHeight);
        simulationWidth = 3072;
        simulationHeight = Math.max(
          2,
          Math.round((1024 * viewportHeight) / viewportWidth),
        );
        canvas.width = viewportWidth;
        canvas.height = viewportHeight;
        targets = [
          createTarget(simulationWidth, simulationHeight),
          createTarget(simulationWidth, simulationHeight),
        ];
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      };
      resize();
      window.addEventListener("resize", resize);

      const inkAwareTarget = createTarget(192, 108);
      const pixels = new Uint8Array(192 * 108 * 4);
      const changedInkAwareElements = new Set<HTMLElement>();
      const inkAwareSteps = new WeakMap<HTMLElement, number>();
      const originalColors = new WeakMap<
        HTMLElement,
        [number, number, number]
      >();
      const clearInkAwareColors = () => {
        for (const element of changedInkAwareElements) {
          element.style.color = "";
          inkAwareSteps.delete(element);
        }
        changedInkAwareElements.clear();
      };

      const uniforms = {
        previous: gl.getUniformLocation(simulationProgram, "uPrev"),
        texel: gl.getUniformLocation(simulationProgram, "uTexel"),
        cursor: gl.getUniformLocation(simulationProgram, "uCursor"),
        previousCursor: gl.getUniformLocation(simulationProgram, "uPrevCursor"),
        deposit: gl.getUniformLocation(simulationProgram, "uDeposit"),
        dissipate: gl.getUniformLocation(simulationProgram, "uDissipate"),
        time: gl.getUniformLocation(simulationProgram, "uTime"),
        aspect: gl.getUniformLocation(simulationProgram, "uAspect"),
        shift: gl.getUniformLocation(simulationProgram, "uShift"),
      };
      const displayTexture = gl.getUniformLocation(displayProgram, "uTex");
      const displayWindow = gl.getUniformLocation(displayProgram, "uWindow");

      let cursorX = 0.5;
      let cursorY = 0.5;
      let previousCursorX = 0.5;
      let previousCursorY = 0.5;
      let deposit = 0;
      let lastPointerTime = 0;
      let readbackTick = 0;
      let elapsed = 0;
      let running = false;
      let animationFrame = 0;
      let previousScroll = 0;
      let previousFrameTime = performance.now();
      let targetIndex = 0;

      const updateInkAwareColors = () => {
        const updates: Array<[HTMLElement, number, number]> = [];
        root
          .querySelectorAll<HTMLElement>("[data-inkaware]")
          .forEach((element) => {
            const bounds = element.getBoundingClientRect();
            if (!bounds.width || !bounds.height) return;
            let maximumAlpha = 0;
            for (let sample = 0; sample < 2; sample += 1) {
              const x = bounds.left + bounds.width * 0.5;
              const y = bounds.top + ((sample + 0.5) / 2) * bounds.height;
              if (x < 0 || y < 0 || x >= viewportWidth || y >= viewportHeight)
                continue;
              const pixelX = Math.min(
                191,
                Math.floor((x / viewportWidth) * 192),
              );
              const pixelY = Math.min(
                107,
                Math.floor((1 - y / viewportHeight) * 108),
              );
              maximumAlpha = Math.max(
                maximumAlpha,
                pixels[(192 * pixelY + pixelX) * 4 + 3] ?? 0,
              );
            }
            const amount = Math.min(1, Math.max(0, (maximumAlpha - 28) / 122));
            const eased = amount * amount * (3 - 2 * amount);
            const step = Math.round(24 * eased);
            if ((inkAwareSteps.get(element) ?? 0) === step) return;
            if (step > 0 && !originalColors.has(element)) {
              const channels = getComputedStyle(element).color.match(/\d+/g);
              originalColors.set(
                element,
                channels
                  ? [+channels[0], +channels[1], +channels[2]]
                  : [4, 11, 5],
              );
            }
            updates.push([element, step, eased]);
          });
        for (const [element, step, amount] of updates) {
          if (step === 0) {
            element.style.color = "";
            inkAwareSteps.delete(element);
            changedInkAwareElements.delete(element);
            continue;
          }
          const [red, green, blue] = originalColors.get(element) ?? [4, 11, 5];
          element.style.color = `rgb(${Math.round(red + (255 - red) * amount)}, ${Math.round(green + (255 - green) * amount)}, ${Math.round(blue + (255 - blue) * amount)})`;
          inkAwareSteps.set(element, step);
          changedInkAwareElements.add(element);
        }
      };

      const render = () => {
        animationFrame = window.requestAnimationFrame(render);
        try {
          const now = performance.now();
          const delta = Math.min(0.05, (now - previousFrameTime) / 1000);
          previousFrameTime = now;
          if (now - lastPointerTime > INK_IDLE_CLEAR_MS) {
            clearInkAwareColors();
            for (const target of targets) {
              gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
              gl.clearColor(0, 0, 0, 0);
              gl.clear(gl.COLOR_BUFFER_BIT);
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            window.cancelAnimationFrame(animationFrame);
            running = false;
            return;
          }

          elapsed += delta;
          deposit *= 0.82;
          const currentScroll = scrollX.current;
          const shift = (currentScroll - previousScroll) / (3 * viewportWidth);
          previousScroll = currentScroll;
          const nextTargetIndex = 1 - targetIndex;

          gl.bindFramebuffer(
            gl.FRAMEBUFFER,
            targets[nextTargetIndex].framebuffer,
          );
          gl.viewport(0, 0, simulationWidth, simulationHeight);
          activateInkProgram(gl, simulationProgram);
          bindPosition(simulationProgram);
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, targets[targetIndex].texture);
          gl.uniform1i(uniforms.previous, 0);
          gl.uniform2f(
            uniforms.texel,
            1 / simulationWidth,
            1 / simulationHeight,
          );
          gl.uniform2f(uniforms.cursor, cursorX, cursorY);
          gl.uniform2f(
            uniforms.previousCursor,
            previousCursorX,
            previousCursorY,
          );
          gl.uniform1f(uniforms.deposit, deposit);
          gl.uniform1f(uniforms.dissipate, 0.9993);
          gl.uniform1f(uniforms.time, elapsed);
          gl.uniform1f(uniforms.aspect, (3 * viewportWidth) / viewportHeight);
          gl.uniform1f(uniforms.shift, shift);
          gl.drawArrays(gl.TRIANGLES, 0, 3);

          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
          gl.viewport(0, 0, canvas.width, canvas.height);
          activateInkProgram(gl, displayProgram);
          bindPosition(displayProgram);
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, targets[nextTargetIndex].texture);
          gl.uniform1i(displayTexture, 0);
          gl.uniform1f(displayWindow, 3);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.drawArrays(gl.TRIANGLES, 0, 3);

          readbackTick += 1;
          if (readbackTick % 3 === 0) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, inkAwareTarget.framebuffer);
            gl.viewport(0, 0, 192, 108);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            gl.readPixels(0, 0, 192, 108, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            updateInkAwareColors();
          }

          targetIndex = nextTargetIndex;
          previousCursorX = cursorX;
          previousCursorY = cursorY;
        } catch {
          window.cancelAnimationFrame(animationFrame);
          running = false;
        }
      };

      const pointerMove = (event: PointerEvent) => {
        const bounds = root.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          return;
        const nextX = ((event.clientX - bounds.left) / viewportWidth + 1) / 3;
        const nextY = 1 - (event.clientY - bounds.top) / viewportHeight;
        const now = performance.now();
        const speed =
          (Math.hypot(
            (nextX - cursorX) * viewportWidth,
            (nextY - cursorY) * viewportHeight,
          ) /
            Math.max(1, now - lastPointerTime)) *
          1000;
        lastPointerTime = now;
        cursorX = nextX;
        cursorY = nextY;
        deposit = Math.min(1, 0.22 + 0.6 * Math.exp(-speed / 1100));
        if (!running) {
          running = true;
          previousCursorX = cursorX;
          previousCursorY = cursorY;
          previousScroll = scrollX.current;
          previousFrameTime = performance.now();
          animationFrame = window.requestAnimationFrame(render);
        }
      };
      const pointerOut = (event: PointerEvent) => {
        if (!event.relatedTarget) {
          previousCursorX = cursorX;
          previousCursorY = cursorY;
          deposit = 0;
        }
      };

      window.addEventListener("pointermove", pointerMove);
      window.addEventListener("pointerout", pointerOut);
      return () => {
        window.cancelAnimationFrame(animationFrame);
        clearInkAwareColors();
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", pointerMove);
        window.removeEventListener("pointerout", pointerOut);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      };
    } catch {
      return;
    }
  }, [rootRef, scrollX]);

  return (
    <div className="icl-cursor-ink" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}

function LoadingScreen({
  assetBase,
  loadingDuration,
}: {
  assetBase: string;
  loadingDuration: number;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startedAt = performance.now();
    const interval = window.setInterval(() => {
      const elapsed = performance.now() - startedAt;
      setProgress(Math.min(99, Math.floor((elapsed / loadingDuration) * 100)));
    }, 50);
    return () => window.clearInterval(interval);
  }, [loadingDuration]);

  return (
    <div className="icl-loader" aria-hidden="true">
      <div className="icl-loader-media">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          src={`${assetBase}/intro.mp4`}
        />
        <div className="icl-loader-label">
          <span>/LOADING</span>
        </div>
      </div>
      <span className="icl-loader-progress">
        /loading ▸ {String(progress).padStart(3, "0")}
      </span>
    </div>
  );
}

const styles = `
.ink-core-layout {
  --unit: max(32px, calc((100svh - 190px) / 10));
  position: relative;
  isolation: isolate;
  width: 100%;
  height: 100svh;
  min-height: 540px;
  overflow: hidden;
  touch-action: none;
  background: #fff;
  color: #090909;
  font-family: "Ink Core Switzer", Arial, sans-serif;
  font-size: 11px;
  line-height: 1.25;
  -webkit-font-smoothing: antialiased;
}
.ink-core-layout *, .ink-core-layout *::before, .ink-core-layout *::after { box-sizing: border-box; }
.ink-core-layout a, .ink-core-layout button { color: inherit; font: inherit; }
.ink-core-layout a { text-decoration: none; }
.icl-retrace, .icl-explore, .icl-footer button, .icl-controls button {
  position: absolute;
  z-index: 4;
  border: 1px solid #a9a9a5;
  background: rgba(255,255,255,.9);
  padding: 8px 14px;
  letter-spacing: -.02em;
  white-space: nowrap;
}
.icl-retrace { top: 40px; left: 7vw; }
.icl-explore { top: 40px; right: 7vw; }
.icl-rail {
  position: absolute;
  z-index: 2;
  inset: 96px 0 0;
  width: calc(14vw + var(--unit) * 38);
  height: calc(100% - 96px);
  will-change: transform;
}
.icl-card {
  position: absolute;
  top: calc(var(--top) * var(--unit));
  left: calc(7vw + var(--left) * var(--unit));
  width: calc(var(--unit) * 2.1);
  margin: 0;
}
.icl-card-image {
  position: relative;
  display: block;
  width: 64px;
  aspect-ratio: 1;
  overflow: hidden;
  background: #f4f4f2;
}
.icl-band { position: absolute; right: 0; left: 0; top: calc(var(--band) * 16.666%); height: 16.666%; overflow: hidden; transform-origin: left center; transition: transform 400ms cubic-bezier(.16,1,.3,1); }
.icl-band img { position: absolute; top: calc(var(--band) * -100%); width: 100%; height: 600%; object-fit: cover; }
.icl-card:hover .icl-band:nth-child(odd) { transform: translateX(7px) rotate(.8deg); }
.icl-card:hover .icl-band:nth-child(even) { transform: translateX(-5px) rotate(-.7deg); }
.icl-card-image video { width: 100%; height: 100%; object-fit: cover; filter: grayscale(1); }
.icl-cap { margin: 10px 0 13px; color: #777773; font-size: 10px; letter-spacing: -.02em; white-space: nowrap; }
.icl-copy { width: 12.2ch; margin: 0; font-family: "Helvetica Neue", Helvetica, sans-serif; font-size: 15px; line-height: 1.42; letter-spacing: -.035em; }
.is-large .icl-copy { font-size: 17px; }
.icl-footer { position: absolute; z-index: 4; bottom: 23px; left: 7vw; display: flex; align-items: center; gap: 22px; color: #8e8d89; font-size: 10px; }
.icl-footer button { position: static; color: #151515; cursor: pointer; }
.icl-footer p { margin: 0; }
.icl-footer span { color: #42423f; }
.icl-controls { position: absolute; z-index: 4; right: 7vw; bottom: 22px; display: flex; align-items: center; gap: 6px; }
.icl-controls button { position: static; padding: 8px 11px; cursor: pointer; }
.icl-controls button:last-child { padding-inline: 12px; }
.icl-cursor-ink, .icl-cursor-ink canvas { position: absolute; z-index: 1; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.icl-loader { position: absolute; z-index: 90; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 22px; overflow: hidden; pointer-events: none; background: #fff; color: #040b05; animation: icl-loader-out 600ms cubic-bezier(.16,1,.3,1) forwards; animation-delay: calc(var(--icl-loading-duration) - 600ms); }
.icl-loader-media { position: relative; width: min(92vw, 1420px); aspect-ratio: 1680 / 800; max-height: 44vh; }
.icl-loader-media video { display: block; width: 100%; height: 100%; object-fit: contain; filter: grayscale(1) contrast(1.02); }
.icl-loader-label { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; }
.icl-loader-label span { font-size: 14px; letter-spacing: -.04em; }
.icl-loader-progress { font-size: 11px; letter-spacing: -.04em; text-transform: uppercase; opacity: .62; font-variant-numeric: tabular-nums; }
@keyframes icl-loader-out { to { opacity: 0; visibility: hidden; } }
@media (prefers-reduced-motion: reduce) { .icl-loader { animation-duration: 1ms; } }
@media (max-width: 700px) {
  .ink-core-layout { --unit: max(34px, calc((100svh - 170px) / 10)); min-height: 520px; }
  .icl-retrace { left: 16px; top: 18px; } .icl-explore { right: 16px; top: 18px; }
  .icl-rail { inset: 78px 0 0; width: calc(32px + var(--unit) * 38); overflow-x: auto; }
  .icl-card { left: calc(16px + var(--left) * var(--unit)); }
  .icl-footer { bottom: 16px; left: 16px; gap: 9px; } .icl-footer p { display: none; }
  .icl-controls { right: 16px; bottom: 15px; } .icl-controls button { padding: 7px; } .icl-controls button:first-child { display: none; }
}
`;
