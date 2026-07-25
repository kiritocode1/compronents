"use client";

/**
 * Flying Cube Scroll - six CSS cubes flying in from thirty thousand pixels
 * away and settling into a spread. Every face is a real image on a
 * preserve-3d box, so the cubes are genuinely dimensional rather than
 * pre-rendered. Position, three rotations, and Z are each interpolated per
 * cube across the first half of the pin, and two of them keep spinning a
 * further half turn in the second half. The logo blurs and clears out over the
 * first two percent, the opening headline scales up and blurs away, and a
 * second block resolves from blurred and undersized once the cubes have
 * landed.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/flying-cube-scroll";

interface CubeTransform {
  top: number;
  left: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  z: number;
}

export interface FlyingCubeScrollProps {
  heading?: string;
  outroHeading?: string;
  outroBody?: string;
  aboutHeading?: string;
  images?: string[];
  embedded?: boolean;
}

const DEFAULT_IMAGES = Array.from(
  { length: 36 },
  (_, i) => `${ASSET_BASE}/img${i + 1}.jpeg`,
);

const CUBES_DATA: Record<
  string,
  { initial: CubeTransform; final: CubeTransform }
> = {
  "cube-1": {
    initial: {
      top: -55,
      left: 37.5,
      rotateX: 360,
      rotateY: -360,
      rotateZ: -48,
      z: -30000,
    },
    final: { top: 50, left: 15, rotateX: 0, rotateY: 3, rotateZ: 0, z: 0 },
  },
  "cube-2": {
    initial: {
      top: -35,
      left: 32.5,
      rotateX: -360,
      rotateY: 360,
      rotateZ: 90,
      z: -30000,
    },
    final: { top: 75, left: 25, rotateX: 1, rotateY: 2, rotateZ: 0, z: 0 },
  },
  "cube-3": {
    initial: {
      top: -65,
      left: 50,
      rotateX: -360,
      rotateY: -360,
      rotateZ: -180,
      z: -30000,
    },
    final: { top: 25, left: 25, rotateX: -1, rotateY: 2, rotateZ: 0, z: 0 },
  },
  "cube-4": {
    initial: {
      top: -35,
      left: 50,
      rotateX: -360,
      rotateY: -360,
      rotateZ: -180,
      z: -30000,
    },
    final: { top: 75, left: 75, rotateX: 1, rotateY: -2, rotateZ: 0, z: 0 },
  },
  "cube-5": {
    initial: {
      top: -55,
      left: 62.5,
      rotateX: 360,
      rotateY: 360,
      rotateZ: -135,
      z: -30000,
    },
    final: { top: 25, left: 75, rotateX: -1, rotateY: -2, rotateZ: 0, z: 0 },
  },
  "cube-6": {
    initial: {
      top: -35,
      left: 67.5,
      rotateX: -180,
      rotateY: -360,
      rotateZ: -180,
      z: -30000,
    },
    final: { top: 50, left: 85, rotateX: 0, rotateY: -3, rotateZ: 0, z: 0 },
  },
};

const FACES = ["front", "back", "right", "left", "top", "bottom"] as const;

export default function FlyingCubeScroll({
  heading = "The first media company crafted for the digital first generation.",
  outroHeading = "Where innovation meets precision.",
  outroBody = "BLANK unites visionary thinkers, creative architects, and analytical experts, collaborating seamlessly to transform challenges into opportunities. Together, we deliver tailored solutions that drive impact and inspire growth.",
  aboutHeading = "Your next section goes here",
  images = DEFAULT_IMAGES,
  embedded = true,
}: FlyingCubeScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".orc-content");
    const stickySection = root.querySelector<HTMLElement>(".orc-sticky");
    const logo = root.querySelector<HTMLElement>(".orc-logo");
    const cubesContainer = root.querySelector<HTMLElement>(".orc-cubes");
    const header1 = root.querySelector<HTMLElement>(".orc-header-1");
    const header2 = root.querySelector<HTMLElement>(".orc-header-2");
    if (
      !content ||
      !stickySection ||
      !logo ||
      !cubesContainer ||
      !header1 ||
      !header2
    ) {
      return;
    }

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const stickyHeight =
      (embedded ? root.clientHeight : window.innerHeight) * 4;

    const interpolate = (start: number, end: number, progress: number) =>
      start + (end - start) * progress;

    const trigger = ScrollTrigger.create({
      trigger: stickySection,
      scroller,
      start: "top top",
      end: `+=${stickyHeight}px`,
      scrub: 1,
      pin: true,
      pinSpacing: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const initialProgress = Math.min(self.progress * 20, 1);
        logo.style.filter = `blur(${interpolate(0, 20, initialProgress)}px)`;

        const logoOpacityProgress =
          self.progress >= 0.02 ? Math.min((self.progress - 0.02) * 100, 1) : 0;
        logo.style.opacity = `${1 - logoOpacityProgress}`;

        const cubesOpacityProgress =
          self.progress >= 0.01 ? Math.min((self.progress - 0.01) * 100, 1) : 0;
        cubesContainer.style.opacity = `${cubesOpacityProgress}`;

        const header1Progress = Math.min(self.progress * 2.5, 1);
        header1.style.transform = `translate(-50%, -50%) scale(${interpolate(
          1,
          1.5,
          header1Progress,
        )})`;
        header1.style.filter = `blur(${interpolate(0, 20, header1Progress)}px)`;
        header1.style.opacity = `${1 - header1Progress}`;

        const header2StartProgress = (self.progress - 0.4) * 10;
        const header2Progress = Math.max(0, Math.min(header2StartProgress, 1));
        const header2Scale = interpolate(0.75, 1, header2Progress);
        const header2Blur = interpolate(10, 0, header2Progress);

        header2.style.transform = `translate(-50%, -50%) scale(${header2Scale})`;
        header2.style.filter = `blur(${header2Blur}px)`;
        header2.style.opacity = `${header2Progress}`;

        const firstPhaseProgress = Math.min(self.progress * 2, 1);
        const secondPhaseProgress =
          self.progress >= 0.5 ? (self.progress - 0.5) * 2 : 0;

        for (const [cubeClass, data] of Object.entries(CUBES_DATA)) {
          const cube = root.querySelector<HTMLElement>(`.orc-${cubeClass}`);
          if (!cube) continue;
          const { initial, final } = data;

          const currentTop = interpolate(
            initial.top,
            final.top,
            firstPhaseProgress,
          );
          const currentLeft = interpolate(
            initial.left,
            final.left,
            firstPhaseProgress,
          );
          const currentRotateX = interpolate(
            initial.rotateX,
            final.rotateX,
            firstPhaseProgress,
          );
          const currentRotateY = interpolate(
            initial.rotateY,
            final.rotateY,
            firstPhaseProgress,
          );
          const currentRotateZ = interpolate(
            initial.rotateZ,
            final.rotateZ,
            firstPhaseProgress,
          );
          const currentZ = interpolate(initial.z, final.z, firstPhaseProgress);

          let additionalRotation = 0;
          if (cubeClass === "cube-2") {
            additionalRotation = interpolate(0, 180, secondPhaseProgress);
          } else if (cubeClass === "cube-4") {
            additionalRotation = interpolate(0, -180, secondPhaseProgress);
          }

          cube.style.top = `${currentTop}%`;
          cube.style.left = `${currentLeft}%`;
          cube.style.transform = `
            translate3d(-50%, -50%, ${currentZ}px)
            rotateX(${currentRotateX}deg)
            rotateY(${currentRotateY + additionalRotation}deg)
            rotateZ(${currentRotateZ}deg)
          `;
        }
      },
    });

    ScrollTrigger.refresh();

    return () => {
      trigger.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, images]);

  return (
    <div
      className={embedded ? "orc-root orc-embedded" : "orc-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="orc-content">
        <section className="orc-sticky">
          <div className="orc-logo">
            <div className="orc-col">
              <div className="orc-block orc-block-1" />
              <div className="orc-block orc-block-2" />
            </div>
            <div className="orc-col">
              <div className="orc-block orc-block-3" />
              <div className="orc-block orc-block-4" />
            </div>
            <div className="orc-col">
              <div className="orc-block orc-block-5" />
              <div className="orc-block orc-block-6" />
            </div>
          </div>

          <div className="orc-cubes">
            {Object.keys(CUBES_DATA).map((cubeClass, cubeIndex) => (
              <div className={`orc-cube orc-${cubeClass}`} key={cubeClass}>
                {FACES.map((face, faceIndex) => (
                  <div className={`orc-${face}`} key={face}>
                    <img
                      src={images[cubeIndex * FACES.length + faceIndex]}
                      alt=""
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="orc-header-1">
            <h1>{heading}</h1>
          </div>

          <div className="orc-header-2">
            <h2>{outroHeading}</h2>
            <p>{outroBody}</p>
          </div>
        </section>

        <section className="orc-about">
          <h2>{aboutHeading}</h2>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap");

.orc-root {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "Inter", sans-serif;
  background-color: #331707;
}
.orc-root.orc-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.orc-root.orc-embedded::-webkit-scrollbar { display: none; }
.orc-root * { margin: 0; padding: 0; box-sizing: border-box; }
.orc-content { position: relative; width: 100%; }
.orc-root img { width: 100%; height: 100%; object-fit: cover; }
.orc-root section {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
}
.orc-sticky { background-color: #331707; color: #ffe9d9; }
.orc-about {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-color: #cdb9ab;
  color: #331707;
}
.orc-logo {
  position: absolute;
  top: 25%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 24px;
  z-index: 2;
}
.orc-col {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.orc-col:nth-child(2) { gap: 26px; }
.orc-block { width: 35px; height: 35px; background-color: #ffe9d9; }
.orc-block-1 { transform: rotate(42deg); transform-origin: bottom right; }
.orc-block-5 { transform: rotate(-42deg); transform-origin: bottom left; }
.orc-cubes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  perspective: 10000px;
}
.orc-cube {
  position: absolute;
  width: 150px;
  height: 150px;
  transform-style: preserve-3d;
}
.orc-cube > div {
  position: absolute;
  width: 150px;
  height: 150px;
  transform-style: preserve-3d;
  backface-visibility: visible;
}
.orc-front { transform: translateZ(75px); }
.orc-back { transform: translateZ(-75px) rotateY(180deg); }
.orc-right { transform: translateX(75px) rotateY(90deg); }
.orc-left { transform: translateX(-75px) rotateY(-90deg); }
.orc-top { transform: translateY(-75px) rotateX(90deg); }
.orc-bottom { transform: translateY(75px) rotateX(-90deg); }
.orc-cube-1 {
  top: -55%;
  left: 37.5%;
  transform: translate3d(-50%, -50%, -30000px) rotateX(360deg) rotateY(-360deg) rotateZ(-48deg);
}
.orc-cube-2 {
  top: -35%;
  left: 32.5%;
  transform: translate3d(-50%, -50%, -30000px) rotateX(-180deg) rotateY(180deg) rotateZ(90deg);
}
.orc-cube-3 {
  top: -65%;
  left: 50%;
  transform: translate3d(-50%, -50%, -30000px) rotateX(-90deg) rotateY(-90deg) rotateZ(-180deg);
}
.orc-cube-4 {
  top: -35%;
  left: 50%;
  transform: translate3d(-50%, -50%, -30000px) rotateX(-90deg) rotateY(-90deg) rotateZ(-180deg);
}
.orc-cube-5 {
  top: -55%;
  left: 62.5%;
  transform: translate3d(-50%, -50%, -30000px) rotateX(180deg) rotateY(180deg) rotateZ(-135deg);
}
.orc-cube-6 {
  top: -35%;
  left: 67.5%;
  transform: translate3d(-50%, -50%, -30000px) rotateX(-90deg) rotateY(-180deg) rotateZ(-180deg);
}
.orc-header-1 {
  width: 60%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1);
  transform-origin: center center;
  text-align: center;
  color: #ffe9d9;
}
.orc-header-1 h1 { font-weight: 400; font-size: 4rem; line-height: 1; }
.orc-header-2 {
  width: 30%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.75);
  transform-origin: center center;
  text-align: center;
  opacity: 0;
  filter: blur(10px);
  color: #ffe9d9;
}
.orc-header-2 h2 { margin-bottom: 0.5rem; }
.orc-header-2 p { font-size: 1.25rem; font-weight: lighter; }
`;
