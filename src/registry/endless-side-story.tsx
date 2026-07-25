"use client";

/**
 * Endless Side Story - a whole editorial page laid out sideways and looped.
 * The section run is cloned two sequences either side of the original, and the
 * track silently jumps a full sequence whenever it drifts past the halfway
 * guard, so scrolling never reaches an end in either direction. The progress
 * bar and counter read the position modulo one sequence, and snap rather than
 * ease across the wrap so the bar never runs backwards through the whole width.
 *
 * Self-contained: it fills its own box and reads the wheel over itself.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/endless-side-story";

export interface EndlessSideStoryProps {
  introHeading?: string;
  introSubheading?: string;
  headerHeading?: string;
  aboutParagraphs?: [string, string];
  aboutHeading?: string;
  storyHeadings?: string[];
  outroHeading?: string;
  heroImage?: string;
  aboutImage?: string;
  bannerImage?: string;
  conceptImage?: string;
  smoothFactor?: number;
}

export default function EndlessSideStory({
  introHeading = "Once You Start Scrolling, There's No Way Out!",
  introSubheading = "What If Your Website Could Scroll Forever?",
  headerHeading = "Traversing the frontier of digital evolution, crafting the future.",
  aboutParagraphs = [
    "In a world shaped by velocity and precision, we engineer the next generation of experiences. From hyper-intelligent design to immersive narratives, our creations defy convention, challenging the boundaries of form and function.",
    "Propelled by data, intuition, and creativity, we build ecosystems where the digital and physical seamlessly converge. Our work isn't just visual, it's visceral, experiential, and profoundly transformative.",
  ],
  aboutHeading = "Future Architectonics",
  storyHeadings = [
    "Digital Alchemy",
    "Neoteric Identities",
    "Cinematic Realities",
    "Symphonics",
  ],
  outroHeading = "horizons.com",
  heroImage = `${ASSET_BASE}/img1.jpg`,
  aboutImage = `${ASSET_BASE}/img2.jpg`,
  bannerImage = `${ASSET_BASE}/img3.jpg`,
  conceptImage = `${ASSET_BASE}/img4.jpg`,
  smoothFactor = 0.05,
}: EndlessSideStoryProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const container = root.querySelector<HTMLElement>(".ihz-container");
    const scroller = root.querySelector<HTMLElement>(".ihz-scroller");
    const progressCounter = root.querySelector<HTMLElement>(
      ".ihz-progress-counter h1",
    );
    const progressBar = root.querySelector<HTMLElement>(".ihz-progress-bar");
    if (!container || !scroller || !progressCounter || !progressBar) return;

    const touchSensitivity = 2.5;
    const bufferSize = 2;

    let targetScrollX = 0;
    let currentScrollX = 0;
    let isAnimating = false;
    let currentProgressScale = 0;
    let targetProgressScale = 0;
    let lastPercentage = 0;

    let isDown = false;
    let lastTouchX = 0;
    let touchVelocity = 0;
    let lastTouchTime = 0;
    let frame = 0;

    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor;

    const setupScroll = () => {
      for (const clone of Array.from(
        scroller.querySelectorAll(".ihz-clone-section"),
      )) {
        clone.remove();
      }

      const templateSections = Array.from(
        scroller.querySelectorAll<HTMLElement>(
          "section:not(.ihz-clone-section)",
        ),
      );
      if (!templateSections.length) return 0;

      let sequenceWidth = 0;
      for (const section of templateSections) {
        sequenceWidth += Number.parseFloat(
          window.getComputedStyle(section).width,
        );
      }

      for (let i = -bufferSize; i < 0; i++) {
        templateSections.forEach((section, index) => {
          const clone = section.cloneNode(true) as HTMLElement;
          clone.classList.add("ihz-clone-section");
          clone.setAttribute("data-clone-index", `${i}-${index}`);
          scroller.appendChild(clone);
        });
      }

      for (let i = 1; i <= bufferSize; i++) {
        templateSections.forEach((section, index) => {
          const clone = section.cloneNode(true) as HTMLElement;
          clone.classList.add("ihz-clone-section");
          clone.setAttribute("data-clone-index", `${i}-${index}`);
          scroller.appendChild(clone);
        });
      }

      scroller.style.width = `${sequenceWidth * (1 + bufferSize * 2)}px`;
      targetScrollX = sequenceWidth * bufferSize;
      currentScrollX = targetScrollX;
      scroller.style.transform = `translateX(-${currentScrollX}px)`;

      return sequenceWidth;
    };

    const checkBoundaryAndReset = (sequenceWidth: number) => {
      if (currentScrollX > sequenceWidth * (bufferSize + 0.5)) {
        targetScrollX -= sequenceWidth;
        currentScrollX -= sequenceWidth;
        scroller.style.transform = `translateX(-${currentScrollX}px)`;
        return true;
      }

      if (currentScrollX < sequenceWidth * (bufferSize - 0.5)) {
        targetScrollX += sequenceWidth;
        currentScrollX += sequenceWidth;
        scroller.style.transform = `translateX(-${currentScrollX}px)`;
        return true;
      }

      return false;
    };

    const updateProgress = (sequenceWidth: number, forceReset = false) => {
      const basePosition = sequenceWidth * bufferSize;
      const currentPosition = (currentScrollX - basePosition) % sequenceWidth;
      let percentage = (currentPosition / sequenceWidth) * 100;

      if (percentage < 0) percentage = 100 + percentage;

      const isWrapping =
        (lastPercentage > 80 && percentage < 20) ||
        (lastPercentage < 20 && percentage > 80) ||
        forceReset;

      progressCounter.textContent = `${Math.round(percentage)}`;
      targetProgressScale = percentage / 100;

      if (isWrapping) {
        currentProgressScale = targetProgressScale;
        progressBar.style.transform = `scaleX(${currentProgressScale})`;
      }

      lastPercentage = percentage;
    };

    const animate = (sequenceWidth: number, forceProgressReset = false) => {
      currentScrollX = lerp(currentScrollX, targetScrollX, smoothFactor);
      scroller.style.transform = `translateX(-${currentScrollX}px)`;

      updateProgress(sequenceWidth, forceProgressReset);

      if (!forceProgressReset) {
        currentProgressScale = lerp(
          currentProgressScale,
          targetProgressScale,
          smoothFactor,
        );
        progressBar.style.transform = `scaleX(${currentProgressScale})`;
      }

      if (Math.abs(targetScrollX - currentScrollX) < 0.01) {
        isAnimating = false;
      } else {
        frame = requestAnimationFrame(() => animate(sequenceWidth));
      }
    };

    const sequenceWidth = setupScroll();
    updateProgress(sequenceWidth, true);
    progressBar.style.transform = `scaleX(${currentProgressScale})`;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetScrollX += e.deltaY;

      const needsReset = checkBoundaryAndReset(sequenceWidth);

      if (!isAnimating) {
        isAnimating = true;
        frame = requestAnimationFrame(() => animate(sequenceWidth, needsReset));
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      isDown = true;
      lastTouchX = e.touches[0].clientX;
      lastTouchTime = performance.now();
      targetScrollX = currentScrollX;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDown) return;
      e.preventDefault();

      const currentTouchX = e.touches[0].clientX;
      const touchDelta = lastTouchX - currentTouchX;

      targetScrollX += touchDelta * touchSensitivity;

      const currentTime = performance.now();
      const timeDelta = currentTime - lastTouchTime;
      if (timeDelta > 0) touchVelocity = (touchDelta / timeDelta) * 15;

      lastTouchX = currentTouchX;
      lastTouchTime = currentTime;

      const needsReset = checkBoundaryAndReset(sequenceWidth);
      if (!isAnimating) {
        isAnimating = true;
        frame = requestAnimationFrame(() => animate(sequenceWidth, needsReset));
      }
    };

    const onTouchEnd = () => {
      isDown = false;

      if (Math.abs(touchVelocity) > 0.1) {
        targetScrollX += touchVelocity * 20;

        const decayVelocity = () => {
          touchVelocity *= 0.95;

          if (Math.abs(touchVelocity) > 0.1) {
            targetScrollX += touchVelocity;
            const needsReset = checkBoundaryAndReset(sequenceWidth);

            if (needsReset) updateProgress(sequenceWidth, true);

            frame = requestAnimationFrame(decayVelocity);
          }
        };

        frame = requestAnimationFrame(decayVelocity);
      }
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("touchstart", onTouchStart);
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd);

    return () => {
      cancelAnimationFrame(frame);
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
      for (const clone of Array.from(
        scroller.querySelectorAll(".ihz-clone-section"),
      )) {
        clone.remove();
      }
    };
  }, [smoothFactor]);

  return (
    <div className="ihz-root" ref={rootRef}>
      <style>{styles}</style>
      <div className="ihz-container">
        <div className="ihz-progress-bar" />

        <div className="ihz-progress-counter">
          <h1>0</h1>
        </div>

        <div className="ihz-scroller">
          <section className="ihz-intro">
            <h1>{introHeading}</h1>
            <h2>{introSubheading}</h2>
          </section>

          <section className="ihz-hero-img">
            <img src={heroImage} alt="" />
          </section>

          <section className="ihz-header">
            <h1>{headerHeading}</h1>
          </section>

          <section className="ihz-about">
            <div className="ihz-row">
              <div className="ihz-copy">
                {aboutParagraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>
              <div className="ihz-img">
                <img src={aboutImage} alt="" />
              </div>
            </div>

            <h1>{aboutHeading}</h1>
          </section>

          <section className="ihz-banner-img">
            <img src={bannerImage} alt="" />
          </section>

          <section className="ihz-story">
            {storyHeadings.map((heading) => (
              <h1 key={heading}>{heading}</h1>
            ))}
          </section>

          <section className="ihz-concept-img">
            <img src={conceptImage} alt="" />
          </section>

          <section className="ihz-outro">
            <h1>{outroHeading}</h1>
          </section>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Anton&family=Inter:opsz,wght@14..32,100..900&display=swap");

.ihz-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #000;
  container-type: inline-size;
}
.ihz-root * { margin: 0; padding: 0; box-sizing: border-box; user-select: none; }
.ihz-root h1 {
  font-family: "Anton", sans-serif;
  font-size: 15cqw;
  font-weight: lighter;
  text-transform: uppercase;
  line-height: 0.8;
  padding-top: 0.2em;
}
.ihz-root h2 {
  font-family: "Inter", sans-serif;
  font-size: 30px;
  font-weight: 700;
}
.ihz-root p {
  font-family: "Inter", sans-serif;
  font-size: 15px;
  font-weight: 500;
}
.ihz-root img { width: 100%; height: 100%; object-fit: cover; }
.ihz-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.ihz-progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 10px;
  transform: scaleX(0%);
  transform-origin: center left;
  background-color: #fff;
  will-change: transform;
  z-index: 2;
}
.ihz-progress-counter {
  position: absolute;
  bottom: 1em;
  right: 2.5em;
  color: #fff;
  z-index: 2;
}
.ihz-scroller {
  position: relative;
  width: 700cqw;
  height: 100%;
  display: flex;
  will-change: transform;
  transform: translateX(0);
}
.ihz-root section {
  position: relative;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.ihz-intro,
.ihz-hero-img,
.ihz-about,
.ihz-banner-img,
.ihz-story,
.ihz-outro { width: 75cqw; }
.ihz-header,
.ihz-concept-img { width: 100cqw; }
.ihz-intro,
.ihz-header {
  padding: 2em;
  background-color: #000;
  color: #fff;
}
.ihz-about {
  padding: 4em 3em 1em 2em;
  background-color: #eb001b;
  color: #fff;
}
.ihz-story {
  padding: 4em 2em 2em 2em;
  background-color: #f69e1c;
}
.ihz-outro { background-color: #fe5e00; }
.ihz-about,
.ihz-intro,
.ihz-header,
.ihz-story {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.ihz-intro,
.ihz-about,
.ihz-story { flex-direction: column; }
.ihz-header h1 { font-size: 15.75cqw; }
.ihz-story h1 { padding-top: 0; }
.ihz-about .ihz-row {
  display: flex;
  justify-content: space-between;
}
.ihz-about .ihz-row p { width: 50%; margin-bottom: 1em; }
.ihz-about .ihz-row .ihz-copy { flex: 3; }
.ihz-about .ihz-row .ihz-img { flex: 2; aspect-ratio: 7/5; }
`;
