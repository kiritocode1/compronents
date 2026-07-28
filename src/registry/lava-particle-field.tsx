"use client";

/**
 * Lava Particle Field - a GPU particle solver where the particles live in the
 * texture itself. Buffer A stores one particle per texel as position in RG and
 * velocity in BA, and advances it by sampling its eight neighbours and adopting
 * whichever one is closer under a wrapped distance, which is how particles are
 * handed between texels without any CPU-side list. Buffer B accumulates density
 * and pressure from that field, and its gradient is fed back into A on the next
 * frame, so the two ping-pong: motion writes density, density pushes motion.
 * The image pass reads out vorticity, the curl of the velocity field, and maps
 * it straight to the lava colour, so what you see is rotation, not heat.
 *
 * Four double-buffered targets in FloatType, all at twice display resolution.
 * Press and drag to inject a gaussian of velocity.
 *
 * Fills its container. Three.js, no animation library.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";

export interface LavaParticleFieldProps {
  brand?: string;
  experimentLabel?: string;
  footerLeft?: string;
  footerRight?: string;
  /** Simulation resolution as a multiple of display size. */
  resolutionScale?: number;
}

const BUFFER_A = `
#define size iResolution.xy
#define SAMPLE(a, p, s) texture((a), (p)/s)

float gauss(vec2 x, float r) {
    return exp(-pow(length(x)/r, 2.));
}

#define SPEED
#define BLASTER

#define PI 3.14159265

#ifdef SPEED
    #define dt 8.5
    #define P 0.01
#else
    #define dt 2.
    #define P 0.05
#endif

#define particle_density 1.
#define minimal_density 0.8

const float radius = 2.0;

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform vec2 iResolution;
uniform vec4 iMouse;
uniform float iTime;
uniform float iFrame;

void Check(inout vec4 U, vec2 pos, vec2 dx) {
    vec4 Unb = SAMPLE(iChannel0, pos+dx, size);
    vec2 rpos1 = mod(pos-Unb.xy+size*0.5,size) - size*0.5;
    vec2 rpos2 = mod(pos-U.xy+size*0.5,size) - size*0.5;
    if(length(rpos1) < length(rpos2)) {
        U = Unb;
    }
}

vec4 B(vec2 pos) {
    return 5.*SAMPLE(iChannel1, pos, size);
}

void main() {
    vec2 pos = gl_FragCoord.xy;
    vec4 U = SAMPLE(iChannel0, pos, size);

    Check(U, pos, vec2(-1,0));
    Check(U, pos, vec2(1,0));
    Check(U, pos, vec2(0,-1));
    Check(U, pos, vec2(0,1));
    Check(U, pos, vec2(-1,-1));
    Check(U, pos, vec2(1,1));
    Check(U, pos, vec2(1,-1));
    Check(U, pos, vec2(-1,1));
    U.xy = mod(U.xy,size);

    if(length(mod(pos-U.xy+size*0.5,size) - size*0.5) > 1./minimal_density) {
        U.xy = pos;
    }

    vec2 ppos = U.xy;
    vec2 pressure = vec2(B(ppos+vec2(1,0)).z - B(ppos+vec2(-1,0)).z, B(ppos+vec2(0,1)).z - B(ppos+vec2(0,-1)).z);

    if(iMouse.z > 0.0) {
        float k = gauss(ppos-iMouse.xy, 25.);
        U.zw = U.zw*(1.-k) + k*0.2*vec2(cos(0.02*iTime*dt), sin(0.02*iTime*dt));
    }

    #ifdef BLASTER
        U.zw += 0.002*vec2(cos(0.01*iTime*dt), sin(0.01*iTime*dt))*gauss(ppos-size*vec2(0.5,0.5),8.)*dt;
    #endif

    U.zw = U.zw*0.9995;
    U.zw += P*pressure*dt;
    vec2 velocity = 0.*B(ppos).xy + U.zw;
    U.xy += dt*velocity;
    U.xy = mod(U.xy,size);

    if(iFrame < 1.0) {
        if(mod(pos, vec2(1./particle_density)).x < 1. && mod(pos, vec2(1./particle_density)).y < 1.)
            U = vec4(pos,0.,0.);
    }

    gl_FragColor = U;
}
`;

const BUFFER_B = `
#define size iResolution.xy
#define SAMPLE(a, p, s) texture((a), (p)/s)

float gauss(vec2 x, float r) {
    return exp(-pow(length(x)/r, 2.));
}

const float radius = 2.0;

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform vec2 iResolution;

vec4 B(vec2 pos) {
    return SAMPLE(iChannel1, pos, size);
}

vec3 pdensity(vec2 pos) {
    vec4 particle_param = SAMPLE(iChannel0, pos, size);
    return vec3(particle_param.zw, gauss(pos - particle_param.xy, 0.7*radius));
}

const vec2 damp = vec2(0.000,0.01);
const vec2 ampl = vec2(0.1,1.);

void main() {
    vec2 pos = gl_FragCoord.xy;
    vec4 prev_u = SAMPLE(iChannel1, pos, size);
    vec3 density = pdensity(pos);
    vec4 u;
    u.xyz = 0.5*density;
    float div = B(pos+vec2(1,0)).x-B(pos-vec2(1,0)).x+B(pos+vec2(0,1)).y-B(pos-vec2(0,1)).y;
    u.zw = (1.-0.001)*0.25*(B(pos+vec2(0,1))+B(pos+vec2(1,0))+B(pos-vec2(0,1))+B(pos-vec2(1,0))).zw;
    u.zw += ampl*vec2(div,density.z);
    gl_FragColor = u;
}
`;

const IMAGE_SHADER = `
#define size iResolution.xy
#define SAMPLE(a, p, s) texture((a), (p)/s)

float gauss(vec2 x, float r) {
    return exp(-pow(length(x)/r, 2.));
}

const float radius = 2.0;

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
uniform vec2 iResolution;

vec4 B(vec2 pos) {
    return SAMPLE(iChannel1, pos, size);
}

vec3 pdensity(vec2 pos) {
    vec4 particle_param = SAMPLE(iChannel0, pos, size);
    return vec3(particle_param.zw, gauss(pos - particle_param.xy, 0.7*radius));
}

void main() {
    vec2 pos = gl_FragCoord.xy;
    vec3 density = pdensity(pos);
    vec4 blur = SAMPLE(iChannel1, pos, size);
    float vorticity = B(pos+vec2(1,0)).y-B(pos-vec2(1,0)).y-B(pos+vec2(0,1)).x+B(pos-vec2(0,1)).x;

    vec4 fragColor;
    if(texture2D(iChannel2, vec2(38, 2) / 256.0).x > 0.5) {
        fragColor = vec4(2.*density.z*(7.*abs(density.xyy)+vec3(0.2, 0.1, 0.1)),1.0);
        fragColor = vec4(10.*abs(density.xyy) + 30.*vec3(0,0,abs(blur.z)),1.0);
    } else {
        float l1 = 490.*abs(vorticity);
        float l2 = 1.-l1;
        fragColor = vec4(vec3(1.,0.3,0.1)*l1 + 0.*vec3(0.1,0.1,0.1)*l2,1.0);
    }
    gl_FragColor = fragColor;
}
`;

interface Buffer {
  scene: THREE.Scene;
  target: THREE.WebGLRenderTarget;
  material: THREE.ShaderMaterial;
}

interface DoubleBuffer {
  read: Buffer;
  write: Buffer;
  swap(): void;
}

export default function LavaParticleField({
  brand = "BLANK",
  experimentLabel = "/Experiment 0381",
  footerLeft = "GPU particle solver",
  footerRight = "Press and drag",
  resolutionScale = 2,
}: LavaParticleFieldProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const stage = root.querySelector<HTMLElement>(".lpf-stage");
    if (!stage) return;

    const mousePosition = new THREE.Vector4();
    let frame = 0;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(stage.clientWidth, stage.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    stage.appendChild(renderer.domElement);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const size = new THREE.Vector2(
      Math.round(stage.clientWidth * resolutionScale),
      Math.round(stage.clientHeight * resolutionScale),
    );

    const created: Buffer[] = [];

    function createBuffer(
      bufferSize: THREE.Vector2,
      fragmentShader: string,
    ): Buffer {
      const scene = new THREE.Scene();
      const target = new THREE.WebGLRenderTarget(bufferSize.x, bufferSize.y, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
      });
      const material = new THREE.ShaderMaterial({
        uniforms: {
          iChannel0: { value: null },
          iChannel1: { value: null },
          iChannel2: { value: null },
          iResolution: { value: bufferSize.clone() },
          iMouse: { value: mousePosition },
          iTime: { value: 0 },
          iFrame: { value: 0 },
        },
        fragmentShader,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
      scene.add(mesh);
      const buffer = { scene, target, material };
      created.push(buffer);
      return buffer;
    }

    function createDoubleBuffer(
      bufferSize: THREE.Vector2,
      fragmentShader: string,
    ): DoubleBuffer {
      return {
        read: createBuffer(bufferSize, fragmentShader),
        write: createBuffer(bufferSize, fragmentShader),
        swap() {
          [this.read, this.write] = [this.write, this.read];
        },
      };
    }

    const bufferA = createDoubleBuffer(size, BUFFER_A);
    const bufferB = createDoubleBuffer(size, BUFFER_B);
    const bufferC = createDoubleBuffer(size, BUFFER_B);
    const bufferD = createDoubleBuffer(size, BUFFER_B);
    const imageBuffer = createBuffer(size, IMAGE_SHADER);

    const finalScene = new THREE.Scene();
    const finalGeometry = new THREE.PlaneGeometry(2, 2);
    const finalMaterial = new THREE.ShaderMaterial({
      uniforms: { tDiffuse: { value: null } },
      vertexShader: `
      varying vec2 vUv;
      void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
  `,
      fragmentShader: `
      uniform sampler2D tDiffuse;
      varying vec2 vUv;
      void main() {
          gl_FragColor = texture2D(tDiffuse, vUv);
      }
  `,
    });
    const finalQuad = new THREE.Mesh(finalGeometry, finalMaterial);
    finalScene.add(finalQuad);

    // The source reads the window; here the pointer is normalised against the
    // component's own rect so the injection lands under the cursor.
    const onMouseMove = (event: MouseEvent) => {
      const rect = stage.getBoundingClientRect();
      mousePosition.setX((event.clientX - rect.left) * resolutionScale);
      mousePosition.setY(
        (rect.height - (event.clientY - rect.top)) * resolutionScale,
      );
    };
    const onMouseDown = () => mousePosition.setZ(1);
    const onMouseUp = () => mousePosition.setZ(0);

    stage.addEventListener("mousemove", onMouseMove);
    stage.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);

      const time = performance.now() * 0.001;
      frame++;

      bufferA.write.material.uniforms.iChannel0.value =
        bufferA.read.target.texture;
      bufferA.write.material.uniforms.iChannel1.value =
        bufferB.read.target.texture;
      bufferA.write.material.uniforms.iTime.value = time;
      bufferA.write.material.uniforms.iFrame.value = frame;
      renderer.setRenderTarget(bufferA.write.target);
      renderer.render(bufferA.write.scene, camera);

      bufferB.write.material.uniforms.iChannel0.value =
        bufferA.write.target.texture;
      bufferB.write.material.uniforms.iChannel1.value =
        bufferB.read.target.texture;
      renderer.setRenderTarget(bufferB.write.target);
      renderer.render(bufferB.write.scene, camera);

      bufferC.write.material.uniforms.iChannel0.value =
        bufferA.write.target.texture;
      bufferC.write.material.uniforms.iChannel1.value =
        bufferC.read.target.texture;
      renderer.setRenderTarget(bufferC.write.target);
      renderer.render(bufferC.write.scene, camera);

      bufferD.write.material.uniforms.iChannel0.value =
        bufferA.write.target.texture;
      bufferD.write.material.uniforms.iChannel1.value =
        bufferD.read.target.texture;
      renderer.setRenderTarget(bufferD.write.target);
      renderer.render(bufferD.write.scene, camera);

      imageBuffer.material.uniforms.iChannel0.value =
        bufferA.write.target.texture;
      imageBuffer.material.uniforms.iChannel1.value =
        bufferB.write.target.texture;
      imageBuffer.material.uniforms.iChannel2.value =
        bufferC.write.target.texture;
      renderer.setRenderTarget(imageBuffer.target);
      renderer.render(imageBuffer.scene, camera);

      renderer.setRenderTarget(null);
      finalQuad.material.uniforms.tDiffuse.value = imageBuffer.target.texture;
      renderer.render(finalScene, camera);

      bufferA.swap();
      bufferB.swap();
      bufferC.swap();
      bufferD.swap();
    };
    animate();

    const resize = new ResizeObserver(() => {
      if (!stage.clientWidth || !stage.clientHeight) return;
      const width = Math.round(stage.clientWidth * resolutionScale);
      const height = Math.round(stage.clientHeight * resolutionScale);
      const nextSize = new THREE.Vector2(width, height);

      renderer.setSize(stage.clientWidth, stage.clientHeight);

      for (const buffer of created) {
        buffer.target.setSize(width, height);
        buffer.material.uniforms.iResolution.value.copy(nextSize);
      }
    });
    resize.observe(stage);

    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
      stage.removeEventListener("mousemove", onMouseMove);
      stage.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      for (const buffer of created) {
        buffer.target.dispose();
        buffer.material.dispose();
      }
      finalGeometry.dispose();
      finalMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [resolutionScale]);

  return (
    <div className="lpf-root" ref={rootRef}>
      <style>{styles}</style>

      <div className="lpf-stage" />

      <nav className="lpf-nav">
        <div className="lpf-nav-items">
          <a href="#brand">{brand}</a>
        </div>
        <div className="lpf-nav-items">
          <a href="#experiment">{experimentLabel}</a>
        </div>
      </nav>

      <footer className="lpf-footer">
        <p>{footerLeft}</p>
        <p>{footerRight}</p>
      </footer>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&display=swap");

.lpf-root {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  font-family: "Geist Mono", monospace;
  overflow: hidden;
}

.lpf-root * {
  box-sizing: border-box;
}

.lpf-stage {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.lpf-stage canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.lpf-nav,
.lpf-footer {
  position: absolute;
  left: 0;
  width: 100%;
  padding: 2em;
  display: flex;
  justify-content: space-between;
  z-index: 2;
  pointer-events: none;
}

.lpf-nav a,
.lpf-footer p {
  pointer-events: auto;
}

.lpf-nav {
  top: 0;
}

.lpf-footer {
  bottom: 0;
}

.lpf-root a,
.lpf-root p {
  margin: 0;
  text-decoration: none;
  text-transform: uppercase;
  color: #fff;
  font-size: 12px;
}

.lpf-nav-items:nth-child(2) {
  display: flex;
  justify-content: flex-end;
  opacity: 0.5;
}
`;
