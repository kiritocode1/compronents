"use client";

import { useEffect, useRef } from "react";

export interface PlasmaTunnelBackgroundProps {
  className?: string;
  speed?: number;
  intensity?: number;
  pixelRatio?: number;
}

const VERTEX_SHADER_SOURCE = `#version 300 es
in vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_intensity;

out vec4 fragColor;

void main() {
  vec4 color = vec4(0.0);
  float z = 0.0;
  float d = 0.0;
  vec3 ray = normalize(2.0 * gl_FragCoord.rgb - u_resolution.xyy);

  for (int stepIndex = 0; stepIndex < 99; stepIndex++) {
    vec3 p = z * ray;
    p.z -= u_time;
    d = 1.0;

    for (int foldIndex = 0; foldIndex < 5; foldIndex++) {
      d += d;
      p += sin(p * d + p.z * d) / d;
    }

    d = 0.1 * length(1.0 + p.xy * sin(p.z + vec2(0.0, 2.0)));
    z += d;
    color += (0.7 - p.y / max(z, 0.001) * vec4(0.0, 1.0, 2.0, 0.0)) / max(d, 0.001);
  }

  fragColor = tanh(color * u_intensity / 2000.0);
}
`;

function compileShader(
  gl: WebGL2RenderingContext,
  type: GLenum,
  source: string,
) {
  const shader = gl.createShader(type);

  if (!shader) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(
      "Plasma tunnel shader compile failed",
      gl.getShaderInfoLog(shader),
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createPlasmaTunnelProgram(gl: WebGL2RenderingContext) {
  const vertexShader = compileShader(
    gl,
    gl.VERTEX_SHADER,
    VERTEX_SHADER_SOURCE,
  );
  const fragmentShader = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    FRAGMENT_SHADER_SOURCE,
  );

  if (!vertexShader || !fragmentShader) {
    return null;
  }

  const program = gl.createProgram();

  if (!program) {
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(
      "Plasma tunnel program link failed",
      gl.getProgramInfoLog(program),
    );
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

export default function PlasmaTunnelBackground({
  className,
  speed = 1,
  intensity = 1,
  pixelRatio = 1.5,
}: PlasmaTunnelBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    });

    if (!gl) {
      return;
    }

    const program = createPlasmaTunnelProgram(gl);

    if (!program) {
      return;
    }

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const intensityLocation = gl.getUniformLocation(program, "u_intensity");
    const vertexArray = gl.createVertexArray();
    const vertexBuffer = gl.createBuffer();
    const activateProgram = gl.useProgram.bind(gl);

    if (!vertexArray || !vertexBuffer) {
      gl.deleteProgram(program);
      return;
    }

    gl.bindVertexArray(vertexArray);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resizeCanvas = () => {
      const ratio = Math.max(1, Math.min(window.devicePixelRatio, pixelRatio));
      const width = Math.max(1, Math.floor(canvas.clientWidth * ratio));
      const height = Math.max(1, Math.floor(canvas.clientHeight * ratio));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      gl.viewport(0, 0, width, height);
      gl.uniform2f(resolutionLocation, width, height);
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas);
    activateProgram(program);
    resizeCanvas();

    let animationFrame = 0;
    const startTime = performance.now();

    const render = (now: number) => {
      activateProgram(program);
      resizeCanvas();
      gl.bindVertexArray(vertexArray);
      gl.uniform1f(timeLocation, ((now - startTime) / 1000) * speed);
      gl.uniform1f(intensityLocation, intensity);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      gl.deleteBuffer(vertexBuffer);
      gl.deleteVertexArray(vertexArray);
      gl.deleteProgram(program);
    };
  }, [intensity, pixelRatio, speed]);

  return <canvas ref={canvasRef} className={className ?? "h-full w-full"} />;
}
