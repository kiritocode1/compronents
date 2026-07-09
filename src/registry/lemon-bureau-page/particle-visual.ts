// @ts-nocheck
// biome-ignore-all lint: source-authored WebGL particle-logo port.
//
// WebGL particle system that renders a logo image as points and distorts them
// away from the pointer. Ported from the source `particle-visual.js` into a
// factory that drives the given canvas and returns a cleanup function.

export function initParticleVisual(
  canvasEl: HTMLCanvasElement,
  assetBase: string,
): () => void {
  const base = assetBase.replace(/\/$/, "");

  const PV = {
    config: {
      canvasBg: "#0f0f0f",
      logoSize: 2000,
      distortionRadius: 2000,
      forceStrength: 0.05,
      maxDisplacement: 500,
      returnForce: 0.05,
      logoPath: `${base}/home/particle-visual.png`,
      particleSpacing: 5,
    },
    canvas: canvasEl,
    gl: null,
    program: null,
    geometry: null,
    particles: [],
    posArray: null,
    colorArray: null,
    mouse: { x: 0, y: 0 },
    execCount: 0,
    isMobile: false,
    animFrame: null,
  };

  let disposed = false;

  function getParticleCanvasSize() {
    const canvas = PV.canvas;
    if (!canvas) return { cssW: innerWidth, cssH: innerHeight };
    const container =
      canvas.closest(".particle-canvas") || canvas.parentElement;
    const rect =
      container?.getBoundingClientRect?.() ?? canvas.getBoundingClientRect();
    return { cssW: Math.max(1, rect.width), cssH: Math.max(1, rect.height) };
  }

  function computeLogoScale(cssW) {
    const b = Math.min(cssW / 1920, 1);
    if (cssW < 1000) return Math.min(b * 2.2, 0.9);
    return b;
  }

  function setupShaders() {
    const vs = `
      precision mediump float;
      uniform vec2 u_resolution;
      attribute vec2 a_position;
      attribute vec4 a_color;
      varying vec4 v_color;
      void main() {
        vec2 clip = (a_position / u_resolution * 2.0 - 1.0) * vec2(1.0, -1.0);
        v_color = a_color;
        gl_Position = vec4(clip, 0.0, 1.0);
        gl_PointSize = 3.0;
      }`;

    const fs = `
      precision mediump float;
      varying vec4 v_color;
      void main() {
        if (v_color.a < 0.01) discard;
        float dist = length(gl_PointCoord - 0.5);
        float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
        gl_FragColor = vec4(v_color.rgb, v_color.a * alpha);
      }`;

    const vShader = PV.gl.createShader(PV.gl.VERTEX_SHADER);
    PV.gl.shaderSource(vShader, vs);
    PV.gl.compileShader(vShader);

    const fShader = PV.gl.createShader(PV.gl.FRAGMENT_SHADER);
    PV.gl.shaderSource(fShader, fs);
    PV.gl.compileShader(fShader);

    PV.program = PV.gl.createProgram();
    PV.gl.attachShader(PV.program, vShader);
    PV.gl.attachShader(PV.program, fShader);
    PV.gl.linkProgram(PV.program);
  }

  function loadImage() {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (disposed) return;
      const temp = document.createElement("canvas");
      const ctx = temp.getContext("2d", { willReadFrequently: true });
      temp.width = temp.height = PV.config.logoSize;

      const s = PV.config.logoSize * 0.9;
      const o = (PV.config.logoSize - s) / 2;
      ctx.drawImage(img, o, o, s, s);

      createParticles(
        ctx.getImageData(0, 0, PV.config.logoSize, PV.config.logoSize).data,
      );
    };
    img.src = PV.config.logoPath;
  }

  function createParticles(pixels) {
    const { cssW } = getParticleCanvasSize();
    const cx = PV.canvas.width / 2;
    const cy = PV.canvas.height / 2;
    const scale = computeLogoScale(cssW);
    const dim = PV.config.logoSize;
    const spacing = PV.config.particleSpacing;

    const pos = [];
    const colors = [];
    PV.particles = [];

    for (let i = 0; i < dim; i += spacing) {
      for (let j = 0; j < dim; j += spacing) {
        const idx = (i * dim + j) * 4;
        if (pixels[idx + 3] > 50) {
          const x = cx + (j - dim / 2) * scale;
          const y = cy + (i - dim / 2) * scale;

          pos.push(x, y);
          colors.push(
            pixels[idx] / 255,
            pixels[idx + 1] / 255,
            pixels[idx + 2] / 255,
            pixels[idx + 3] / 255,
          );
          PV.particles.push({ ox: x, oy: y, vx: 0, vy: 0, i, j });
        }
      }
    }

    PV.posArray = new Float32Array(pos);
    const posBuf = PV.gl.createBuffer();
    PV.gl.bindBuffer(PV.gl.ARRAY_BUFFER, posBuf);
    PV.gl.bufferData(PV.gl.ARRAY_BUFFER, PV.posArray, PV.gl.DYNAMIC_DRAW);

    const colBuf = PV.gl.createBuffer();
    PV.gl.bindBuffer(PV.gl.ARRAY_BUFFER, colBuf);
    PV.gl.bufferData(
      PV.gl.ARRAY_BUFFER,
      new Float32Array(colors),
      PV.gl.STATIC_DRAW,
    );

    PV.geometry = { posBuf, colBuf, count: PV.particles.length };
    animate();
  }

  function animate() {
    if (disposed) return;
    PV.animFrame = requestAnimationFrame(animate);

    if (!PV.isMobile && PV.execCount > 0) {
      PV.execCount--;
      const rad = PV.config.distortionRadius ** 2;
      let needsUpdate = false;

      for (let i = 0; i < PV.particles.length; i++) {
        const x = PV.posArray[i * 2];
        const y = PV.posArray[i * 2 + 1];
        const p = PV.particles[i];
        const dx = PV.mouse.x - x;
        const dy = PV.mouse.y - y;
        const dis = dx * dx + dy * dy;

        if (dis < rad && dis > 0) {
          const f = -rad / dis;
          const distOrig = Math.sqrt((x - p.ox) ** 2 + (y - p.oy) ** 2);
          const mult = Math.max(
            0.1,
            1 - distOrig / (PV.config.maxDisplacement * 2),
          );
          p.vx +=
            f * Math.cos(Math.atan2(dy, dx)) * PV.config.forceStrength * mult;
          p.vy +=
            f * Math.sin(Math.atan2(dy, dx)) * PV.config.forceStrength * mult;
          needsUpdate = true;
        }

        if (Math.abs(p.vx) > 0.01 || Math.abs(p.vy) > 0.01) {
          const nx = x + (p.vx *= 0.82) + (p.ox - x) * PV.config.returnForce;
          const ny = y + (p.vy *= 0.82) + (p.oy - y) * PV.config.returnForce;
          const dox = nx - p.ox;
          const doy = ny - p.oy;
          const distOrig = Math.sqrt(dox * dox + doy * doy);

          if (distOrig > PV.config.maxDisplacement) {
            const s = PV.config.maxDisplacement / distOrig;
            const ds =
              s +
              (1 - s) *
                Math.exp(-(distOrig - PV.config.maxDisplacement) * 0.02);
            PV.posArray[i * 2] = p.ox + dox * ds;
            PV.posArray[i * 2 + 1] = p.oy + doy * ds;
            p.vx *= 0.7;
            p.vy *= 0.7;
          } else {
            PV.posArray[i * 2] = nx;
            PV.posArray[i * 2 + 1] = ny;
          }
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        PV.gl.bindBuffer(PV.gl.ARRAY_BUFFER, PV.geometry.posBuf);
        PV.gl.bufferSubData(PV.gl.ARRAY_BUFFER, 0, PV.posArray);
      }
    }

    render();
  }

  function render() {
    const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
      PV.config.canvasBg,
    );
    PV.gl.viewport(0, 0, PV.canvas.width, PV.canvas.height);
    PV.gl.clearColor(
      parseInt(rgb[1], 16) / 255,
      parseInt(rgb[2], 16) / 255,
      parseInt(rgb[3], 16) / 255,
      1,
    );
    PV.gl.clear(PV.gl.COLOR_BUFFER_BIT);
    PV.gl.useProgram(PV.program);

    PV.gl.uniform2f(
      PV.gl.getUniformLocation(PV.program, "u_resolution"),
      PV.canvas.width,
      PV.canvas.height,
    );

    PV.gl.bindBuffer(PV.gl.ARRAY_BUFFER, PV.geometry.posBuf);
    PV.gl.enableVertexAttribArray(0);
    PV.gl.vertexAttribPointer(0, 2, PV.gl.FLOAT, false, 0, 0);

    PV.gl.bindBuffer(PV.gl.ARRAY_BUFFER, PV.geometry.colBuf);
    PV.gl.enableVertexAttribArray(1);
    PV.gl.vertexAttribPointer(1, 4, PV.gl.FLOAT, false, 0, 0);

    PV.gl.drawArrays(PV.gl.POINTS, 0, PV.geometry.count);
  }

  function handleMouseMove(e) {
    const rect = PV.canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    PV.mouse.x = (e.clientX - rect.left) * dpr;
    PV.mouse.y = (e.clientY - rect.top) * dpr;
    PV.execCount = 300;
  }

  function handleResize() {
    const { cssW, cssH } = getParticleCanvasSize();

    PV.isMobile = cssW < 1000;

    const dpr = Math.min(devicePixelRatio || 1, 2);
    PV.canvas.width = Math.floor(cssW * dpr);
    PV.canvas.height = Math.floor(cssH * dpr);

    if (!PV.geometry) return;

    const cx = PV.canvas.width / 2;
    const cy = PV.canvas.height / 2;
    const scale = computeLogoScale(cssW);
    const dim = PV.config.logoSize;

    for (let i = 0; i < PV.particles.length; i++) {
      const p = PV.particles[i];
      p.ox = cx + (p.j - dim / 2) * scale;
      p.oy = cy + (p.i - dim / 2) * scale;
      p.vx = p.vy = 0;
      PV.posArray[i * 2] = p.ox;
      PV.posArray[i * 2 + 1] = p.oy;
    }

    PV.gl.bindBuffer(PV.gl.ARRAY_BUFFER, PV.geometry.posBuf);
    PV.gl.bufferSubData(PV.gl.ARRAY_BUFFER, 0, PV.posArray);
  }

  // init
  const { cssW, cssH } = getParticleCanvasSize();
  PV.isMobile = cssW < 1000;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  PV.canvas.width = Math.floor(cssW * dpr);
  PV.canvas.height = Math.floor(cssH * dpr);

  PV.gl = PV.canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    powerPreference: "high-performance",
    desynchronized: true,
  });
  if (!PV.gl) return () => {};

  PV.gl.enable(PV.gl.BLEND);
  PV.gl.blendFunc(PV.gl.SRC_ALPHA, PV.gl.ONE_MINUS_SRC_ALPHA);

  setupShaders();
  loadImage();

  if (!PV.isMobile) {
    document.addEventListener("mousemove", handleMouseMove, { passive: true });
  }
  window.addEventListener("resize", handleResize);

  return () => {
    disposed = true;
    if (PV.animFrame) cancelAnimationFrame(PV.animFrame);
    document.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("resize", handleResize);
    const lose = PV.gl?.getExtension("WEBGL_lose_context");
    lose?.loseContext();
  };
}
