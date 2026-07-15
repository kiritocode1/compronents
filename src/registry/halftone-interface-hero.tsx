"use client";

/**
 * Halftone Interface Hero
 *
 * A full-screen identity field with a WebGL halftone wordmark and a separate
 * RGB particle trail. The shader treats the wordmark as a height map: ordered
 * dithering, directional lighting, cursor-steered normals, and offset color
 * samples give each grid cell its dimensional, chromatic response.
 *
 * The wordmark texture is generated at runtime, so the component has no image,
 * font, or animation-library dependency.
 *
 * BLANK, aryank.space
 */

import { useEffect, useRef, useState } from "react";

export interface HalftoneHeroLink {
  label: string;
  href: string;
}

export interface HalftoneInterfaceHeroProps {
  headline?: [string, string];
  navigation?: HalftoneHeroLink[];
  utilityLinks?: HalftoneHeroLink[];
  brand?: [string, string];
  footerLabel?: string;
  locationLabel?: string;
  timeZone?: string;
  background?: string;
  foreground?: string;
  accentColors?: [string, string, string];
  className?: string;
}

type TrailParticle = {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  life: number;
  size: number;
};

const DEFAULT_NAVIGATION: HalftoneHeroLink[] = [
  { label: "events", href: "#events" },
  { label: "interfaces", href: "#interfaces" },
  { label: "people", href: "#people" },
  { label: "about", href: "#about" },
];

const DEFAULT_UTILITY_LINKS: HalftoneHeroLink[] = [
  { label: "follow", href: "#follow" },
  { label: "subscribe", href: "#subscribe" },
];

const DEFAULT_HEADLINE: [string, string] = ["blank", "interfaces"];
const DEFAULT_BRAND: [string, string] = ["blank", "interfaces"];
const DEFAULT_ACCENTS: [string, string, string] = [
  "#ff266c",
  "#1cffaf",
  "#5848ff",
];

const VERTEX_SHADER = `#version 300 es
in vec2 position;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

out vec4 color;

uniform vec2 resolution;
uniform vec2 pointer;
uniform float hover;
uniform float pixelRatio;
uniform sampler2D wordmark;
uniform float wordmarkAspect;
uniform vec3 inkColor;
uniform float compact;

vec2 fittedWordmarkSize() {
  float horizontalFill = mix(0.82, 0.92, compact);
  float verticalFill = mix(0.66, 0.58, compact);
  float fittedWidth = min(
    resolution.x * horizontalFill,
    resolution.y * verticalFill * wordmarkAspect
  );
  return vec2(fittedWidth, fittedWidth / wordmarkAspect);
}

float sampleWordmark(vec2 pixel) {
  vec2 center = vec2(resolution.x * 0.5, resolution.y * 0.47);
  vec2 uv = (pixel - center) / fittedWordmarkSize() + 0.5;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    return 0.0;
  }
  vec4 sampleColor = texture(wordmark, uv);
  return sampleColor.a * max(max(sampleColor.r, sampleColor.g), sampleColor.b);
}

float orderedDither(ivec2 cell) {
  int x = cell.x & 3;
  int y = cell.y & 3;
  int index = y * 4 + x;
  float matrix[16] = float[16](
    0.0, 8.0, 2.0, 10.0,
    12.0, 4.0, 14.0, 6.0,
    3.0, 11.0, 1.0, 9.0,
    15.0, 7.0, 13.0, 5.0
  );
  return (matrix[index] + 0.5) / 16.0;
}

void main() {
  vec2 pixel = gl_FragCoord.xy;
  float pointerDistance = distance(pixel, pointer);

  float lightRadius = max(resolution.x, resolution.y) * mix(0.50, 0.26, compact);
  float proximity = 1.0 - smoothstep(0.0, lightRadius, pointerDistance);
  proximity = pow(proximity, mix(0.55, 0.85, compact));
  float idleRelief = mix(0.55, 0.18, compact);
  float relief = proximity * (idleRelief + 0.65 * hover);

  float colorRadius = min(resolution.x, resolution.y) * mix(0.22, 0.14, compact);
  float colorInfluence = (1.0 - smoothstep(0.0, colorRadius, pointerDistance)) * hover;

  float cellSize = mix(10.0, 3.75, compact) * pixelRatio;
  vec2 cellIndex = floor(pixel / cellSize);
  vec2 cellCenter = (cellIndex + 0.5) * cellSize;

  vec2 radialDirection = normalize(pixel - pointer + vec2(0.0001));
  float colorOffset = colorInfluence * mix(11.0, 5.0, compact) * pixelRatio;

  float centerHeight = sampleWordmark(cellCenter);
  float warmHeight = sampleWordmark(cellCenter + radialDirection * colorOffset);
  float coolHeight = sampleWordmark(cellCenter - radialDirection * colorOffset);
  float heightX = sampleWordmark(cellCenter + vec2(cellSize, 0.0));
  float heightY = sampleWordmark(cellCenter + vec2(0.0, cellSize));

  float raisedHeight = centerHeight * relief;
  vec3 surfaceNormal = normalize(vec3(
    centerHeight - heightX,
    centerHeight - heightY,
    0.55 - raisedHeight * 0.45
  ));

  vec3 restingLight = normalize(vec3(-0.35, 0.4, 0.85));
  vec3 cursorLight = normalize(vec3(normalize(pointer - cellCenter + vec2(0.0001)), 0.8));
  vec3 lightDirection = normalize(mix(restingLight, cursorLight, relief));
  float diffuse = max(dot(surfaceNormal, lightDirection), 0.0);
  float highlight = pow(diffuse, 18.0) * relief;
  float lighting = clamp(0.45 + 0.65 * diffuse + highlight, 0.0, 1.4);

  float threshold = orderedDither(ivec2(cellIndex));
  float binaryTone = step(threshold, lighting);
  float tone = mix(
    lighting,
    binaryTone * (0.55 + 0.45 * lighting),
    mix(0.5, 0.1, compact)
  );

  // A circle larger than half a grid cell is clipped by that cell. The result
  // is the rounded-square tile visible in the reference rather than a circle.
  float distanceFromCellCenter = distance(pixel, cellCenter);
  float antialias = 1.2 * pixelRatio;
  float warmRadius = sqrt(warmHeight) * cellSize * mix(0.64, 0.72, compact);
  float centerRadius = sqrt(centerHeight) * cellSize * mix(0.64, 0.72, compact);
  float coolRadius = sqrt(coolHeight) * cellSize * mix(0.64, 0.72, compact);

  float warmInk = 1.0 - smoothstep(
    warmRadius - antialias,
    warmRadius + antialias,
    distanceFromCellCenter
  );
  float centerInk = 1.0 - smoothstep(
    centerRadius - antialias,
    centerRadius + antialias,
    distanceFromCellCenter
  );
  float coolInk = 1.0 - smoothstep(
    coolRadius - antialias,
    coolRadius + antialias,
    distanceFromCellCenter
  );

  float coverage = max(centerHeight, max(warmHeight, coolHeight));
  float coverageGate = smoothstep(0.015, 0.12, coverage);
  vec3 channels = vec3(warmInk, centerInk, coolInk) * tone;

  vec3 finalInk = inkColor * channels.g;
  vec3 fringe = (channels - vec3(channels.g)) * colorInfluence * 2.2;
  fringe = vec3(
    fringe.r + fringe.g * 0.04 + fringe.b * 0.09,
    fringe.r * 0.02 + fringe.g + fringe.b * 0.05,
    fringe.r * 0.07 + fringe.g * 0.03 + fringe.b
  );
  finalInk = clamp(finalInk + fringe, 0.0, 1.0);

  float alpha = max(max(channels.r, channels.g), channels.b) * coverageGate;
  color = vec4(finalInk, clamp(alpha, 0.0, 1.0));
}
`;

function hexToRgb(color: string): [number, number, number] {
  const value = color.trim().replace(/^#/, "");
  const expanded =
    value.length === 3
      ? value
          .split("")
          .map((character) => character + character)
          .join("")
      : value;
  if (!/^[\da-f]{6}$/i.test(expanded)) return [1, 1, 1];
  return [
    Number.parseInt(expanded.slice(0, 2), 16) / 255,
    Number.parseInt(expanded.slice(2, 4), 16) / 255,
    Number.parseInt(expanded.slice(4, 6), 16) / 255,
  ];
}

function createWordmarkTexture(headline: [string, string]) {
  const canvas = document.createElement("canvas");
  canvas.width = 1912;
  canvas.height = 758;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "alphabetic";
  ctx.fontKerning = "normal";

  const drawFittedLine = (
    text: string,
    x: number,
    baseline: number,
    targetWidth: number,
    fontSize: number,
    weight: number,
  ) => {
    ctx.save();
    ctx.font = `${weight} ${fontSize}px Helvetica Neue, Helvetica, Arial, sans-serif`;
    const measuredWidth = Math.max(1, ctx.measureText(text).width);
    ctx.translate(x, 0);
    ctx.scale(targetWidth / measuredWidth, 1);
    ctx.fillText(text, 0, baseline);
    ctx.restore();
  };

  drawFittedLine(headline[0], 15, 306, 960, 383, 500);
  drawFittedLine(headline[1], 20, 690, 1870, 504, 400);
  return canvas;
}

function compileShader(
  gl: WebGL2RenderingContext,
  kind: number,
  source: string,
) {
  const shader = gl.createShader(kind);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function HalftoneCanvas({
  headline,
  foreground,
}: {
  headline: [string, string];
  foreground: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    });
    if (!gl) return;

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      FRAGMENT_SHADER,
    );
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }
    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API method, not a React Hook.
    gl.useProgram(program);

    const triangle = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangle);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      resolution: gl.getUniformLocation(program, "resolution"),
      pointer: gl.getUniformLocation(program, "pointer"),
      hover: gl.getUniformLocation(program, "hover"),
      pixelRatio: gl.getUniformLocation(program, "pixelRatio"),
      wordmark: gl.getUniformLocation(program, "wordmark"),
      wordmarkAspect: gl.getUniformLocation(program, "wordmarkAspect"),
      inkColor: gl.getUniformLocation(program, "inkColor"),
      compact: gl.getUniformLocation(program, "compact"),
    };

    const textureSource = createWordmarkTexture(headline);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      textureSource,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const inkColor = hexToRgb(foreground);
    const pointer = {
      currentX: 0,
      currentY: 0,
      targetX: 0,
      targetY: 0,
      hover: 0,
      targetHover: 0,
    };
    let ratio = 1;
    let compact = 0;
    let frame = 0;
    let running = false;

    const requestDraw = () => {
      if (running) return;
      running = true;
      frame = window.requestAnimationFrame(draw);
    };

    const resize = () => {
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      if (!width || !height) return;
      compact = Number(width < 768);
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (pointer.currentX === 0 && pointer.currentY === 0) {
        pointer.currentX = canvas.width / 2;
        pointer.currentY = canvas.height / 2;
        pointer.targetX = pointer.currentX;
        pointer.targetY = pointer.currentY;
      }
      requestDraw();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (compact) return;
      const rect = parent.getBoundingClientRect();
      pointer.targetX = (event.clientX - rect.left) * ratio;
      pointer.targetY = (rect.height - (event.clientY - rect.top)) * ratio;
      pointer.targetHover = 1;
      requestDraw();
    };

    const onPointerLeave = () => {
      pointer.targetHover = 0;
      requestDraw();
    };

    const renderContext: WebGL2RenderingContext = gl;
    const renderCanvas: HTMLCanvasElement = canvas;

    function draw() {
      pointer.currentX += (pointer.targetX - pointer.currentX) * 0.18;
      pointer.currentY += (pointer.targetY - pointer.currentY) * 0.18;
      pointer.hover += (pointer.targetHover - pointer.hover) * 0.08;

      renderContext.uniform2f(
        uniforms.resolution,
        renderCanvas.width,
        renderCanvas.height,
      );
      renderContext.uniform2f(
        uniforms.pointer,
        pointer.currentX,
        pointer.currentY,
      );
      renderContext.uniform1f(uniforms.hover, pointer.hover);
      renderContext.uniform1f(uniforms.pixelRatio, ratio);
      renderContext.uniform1i(uniforms.wordmark, 0);
      renderContext.uniform1f(
        uniforms.wordmarkAspect,
        textureSource.width / textureSource.height,
      );
      renderContext.uniform3fv(uniforms.inkColor, inkColor);
      renderContext.uniform1f(uniforms.compact, compact);
      renderContext.clearColor(0, 0, 0, 0);
      renderContext.clear(renderContext.COLOR_BUFFER_BIT);
      renderContext.activeTexture(renderContext.TEXTURE0);
      renderContext.bindTexture(renderContext.TEXTURE_2D, texture);
      renderContext.drawArrays(renderContext.TRIANGLES, 0, 3);

      const settled =
        Math.abs(pointer.targetX - pointer.currentX) < 0.25 &&
        Math.abs(pointer.targetY - pointer.currentY) < 0.25 &&
        Math.abs(pointer.targetHover - pointer.hover) < 0.0015;
      if (settled) {
        pointer.currentX = pointer.targetX;
        pointer.currentY = pointer.targetY;
        pointer.hover = pointer.targetHover;
        running = false;
        frame = 0;
        return;
      }
      frame = window.requestAnimationFrame(draw);
    }

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(triangle);
      gl.deleteTexture(texture);
    };
  }, [foreground, headline]);

  return <canvas ref={canvasRef} className="hih-halftone" />;
}

function PointerTrail({
  accentColors,
}: {
  accentColors: [string, string, string];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let ratio = Math.min(window.devicePixelRatio || 1, 2);
    const particles: TrailParticle[] = [];
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let previousX = pointerX;
    let previousY = pointerY;
    let pointerVisible = false;
    let frame = 0;
    let running = false;

    const resize = () => {
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      if (!width || !height) return;
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    const requestDraw = () => {
      if (running) return;
      running = true;
      frame = window.requestAnimationFrame(draw);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
      pointerVisible = true;

      const deltaX = pointerX - previousX;
      const deltaY = pointerY - previousY;
      const count =
        1 + Math.floor(Math.min(Math.hypot(deltaX, deltaY), 60) / 12);
      for (let index = 0; index < count; index += 1) {
        particles.push({
          x: pointerX + (Math.random() - 0.5) * 4,
          y: pointerY + (Math.random() - 0.5) * 4,
          velocityX: -deltaX * 0.04 + (Math.random() - 0.5) * 0.6,
          velocityY: -deltaY * 0.04 + (Math.random() - 0.5) * 0.6,
          life: 1,
          size: 3 + Math.random() * 3,
        });
      }
      previousX = pointerX;
      previousY = pointerY;
      requestDraw();
    };

    const onPointerLeave = () => {
      pointerVisible = false;
      requestDraw();
    };

    const snap = (value: number) => Math.round(value / 3) * 3;
    const drawingContext: CanvasRenderingContext2D = ctx;
    const drawingCanvas: HTMLCanvasElement = canvas;

    function draw() {
      drawingContext.setTransform(ratio, 0, 0, ratio, 0, 0);
      drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
      drawingContext.globalCompositeOperation = "lighter";

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;
        particle.velocityX *= 0.92;
        particle.velocityY *= 0.92;
        particle.life -= 0.03;
        if (particle.life <= 0) {
          particles.splice(index, 1);
          continue;
        }

        const alpha = particle.life * 0.55;
        const separation = (1 - particle.life) * 5 + 1.5;
        const size = particle.size * particle.life;
        const x = snap(particle.x);
        const y = snap(particle.y);
        drawingContext.globalAlpha = alpha;
        drawingContext.fillStyle = accentColors[0];
        drawingContext.fillRect(x - separation, y, size, size);
        drawingContext.fillStyle = accentColors[1];
        drawingContext.fillRect(x, y, size, size);
        drawingContext.fillStyle = accentColors[2];
        drawingContext.fillRect(x + separation, y, size, size);
      }

      if (pointerVisible) {
        const x = snap(pointerX);
        const y = snap(pointerY);
        drawingContext.globalAlpha = 0.9;
        drawingContext.fillStyle = accentColors[0];
        drawingContext.fillRect(x - 2, y - 3, 6, 6);
        drawingContext.fillStyle = accentColors[1];
        drawingContext.fillRect(x, y - 3, 6, 6);
        drawingContext.fillStyle = accentColors[2];
        drawingContext.fillRect(x + 2, y - 3, 6, 6);
      }

      drawingContext.globalAlpha = 1;
      drawingContext.globalCompositeOperation = "source-over";
      if (particles.length === 0 && !pointerVisible) {
        running = false;
        frame = 0;
        return;
      }
      frame = window.requestAnimationFrame(draw);
    }

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [accentColors]);

  return <canvas ref={canvasRef} className="hih-trail" />;
}

function formatTime(timeZone: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
      .format(new Date())
      .toLowerCase();
  } catch {
    return "time unavailable";
  }
}

export default function HalftoneInterfaceHero({
  headline = DEFAULT_HEADLINE,
  navigation = DEFAULT_NAVIGATION,
  utilityLinks = DEFAULT_UTILITY_LINKS,
  brand = DEFAULT_BRAND,
  footerLabel = "© 2026 BLANK interfaces",
  locationLabel = "nyc",
  timeZone = "America/New_York",
  background = "#121212",
  foreground = "#f3f3f1",
  accentColors = DEFAULT_ACCENTS,
  className = "",
}: HalftoneInterfaceHeroProps) {
  const [clock, setClock] = useState(() => formatTime(timeZone));

  useEffect(() => {
    setClock(formatTime(timeZone));
    const timer = window.setInterval(
      () => setClock(formatTime(timeZone)),
      30_000,
    );
    return () => window.clearInterval(timer);
  }, [timeZone]);

  return (
    <section
      className={`hih-root ${className}`}
      style={{ background, color: foreground }}
    >
      <style>{styles}</style>

      <div className="hih-field">
        <HalftoneCanvas headline={headline} foreground={foreground} />
        <PointerTrail accentColors={accentColors} />
      </div>

      <header className="hih-header">
        <a className="hih-brand" href="#top" aria-label={brand.join(" ")}>
          <span>{brand[0]}</span>
          <span>{brand[1]}</span>
        </a>

        <nav className="hih-navigation" aria-label="Primary navigation">
          {navigation.map((link) => (
            <a href={link.href} key={`${link.label}-${link.href}`}>
              {link.label}
            </a>
          ))}
        </nav>

        <nav className="hih-utilities" aria-label="Utility navigation">
          {utilityLinks.map((link) => (
            <a href={link.href} key={`${link.label}-${link.href}`}>
              {link.label}
            </a>
          ))}
        </nav>
      </header>

      <h1 className="hih-visually-hidden">{headline.join(" ")}</h1>

      <footer className="hih-footer">
        <p>{footerLabel}</p>
        <p className="hih-clock">
          {locationLabel} {clock}
        </p>
      </footer>
    </section>
  );
}

const styles = `
.hih-root {
  position: relative;
  isolation: isolate;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 18px;
  line-height: 1;
  letter-spacing: -0.035em;
}

.hih-field {
  position: absolute;
  inset: 0 0 5rem;
  overflow: hidden;
  cursor: none;
}

.hih-halftone,
.hih-trail {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}

.hih-halftone {
  z-index: 1;
  touch-action: pan-y;
}

.hih-trail {
  z-index: 10;
  pointer-events: none;
}

.hih-header,
.hih-footer {
  position: absolute;
  inset-inline: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-inline: 2rem;
}

.hih-header {
  top: 0;
  min-height: 5.25rem;
  padding-block: 1.5rem;
}

.hih-header a {
  color: inherit;
  text-decoration: none;
  transition: opacity 180ms ease;
}

.hih-header a:hover,
.hih-header a:focus-visible {
  opacity: 0.58;
}

.hih-header a:focus-visible {
  outline: 1px solid currentColor;
  outline-offset: 5px;
}

.hih-brand {
  display: flex;
  flex-direction: column;
  width: 6.2rem;
  font-size: 1.45rem;
  line-height: 0.78;
  letter-spacing: -0.075em;
  text-transform: lowercase;
  transform: scaleX(0.92);
  transform-origin: left center;
}

.hih-brand span:first-child::before {
  content: "✣";
  display: inline-block;
  margin-right: 0.1em;
  font-size: 0.62em;
  transform: translateY(-0.18em);
}

.hih-navigation {
  position: absolute;
  left: 50%;
  display: flex;
  gap: 2rem;
  line-height: 1.55;
  transform: translateX(-50%);
}

.hih-utilities {
  display: flex;
  gap: 1.25rem;
  margin-left: auto;
  line-height: 1.55;
}

.hih-footer {
  bottom: 0;
  align-items: flex-end;
  padding-block: 1.25rem;
  line-height: 1.55;
}

.hih-footer p {
  margin: 0;
}

.hih-clock {
  font-variant-numeric: tabular-nums;
}

.hih-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (max-width: 767px) {
  .hih-root {
    font-size: 15px;
  }

  .hih-field {
    bottom: 4rem;
    cursor: auto;
  }

  .hih-header,
  .hih-footer {
    padding-inline: 1rem;
  }

  .hih-header {
    min-height: 4.5rem;
    padding-block: 1rem;
  }

  .hih-brand {
    width: 4.9rem;
    font-size: 1.15rem;
  }

  .hih-navigation {
    display: none;
  }

  .hih-utilities {
    gap: 1rem;
  }

  .hih-utilities a:first-child {
    display: none;
  }

  .hih-footer {
    padding-block: 1rem;
  }

  .hih-trail {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hih-header a {
    transition: none;
  }

  .hih-trail {
    display: none;
  }
}
`;
