"use client";

/**
 * Service Index Scrub - a pinned services index where scroll distance is the
 * selector: every viewport height advances one service, so the list is stepped
 * discretely rather than scrubbed. A black indicator bar slides down by exactly
 * one row height and resizes to the width of the label it lands on, which is
 * measured off-screen at the real font before anything animates, so it hugs
 * each name instead of using a fixed width. A single tall image strip is
 * translated by one image height in step with it, and the body copy swaps by
 * splitting to lines, lifting them out, replacing the text, and dropping the
 * new lines back in.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/service-index-scrub";

export interface ServiceIndexEntry {
  label: string;
  copy: string;
  image: string;
}

export interface ServiceIndexScrubProps {
  services?: ServiceIndexEntry[];
  heroImage?: string;
  heroCopy?: string;
  outroCopy?: string;
  /** Row height of one service label, in px. */
  serviceHeight?: number;
  /** Height of one frame in the image strip, in px. */
  imgHeight?: number;
  accent?: string;
  embedded?: boolean;
}

const DEFAULT_SERVICES: ServiceIndexEntry[] = [
  {
    label: "Deliverables",
    copy: "We transform your ideas into tangible results. Our deliverables are meticulously crafted to exceed expectations, ensuring every project milestone is met with precision and excellence. From concept to completion.",
    image: `${ASSET_BASE}/img1.jpg`,
  },
  {
    label: "Brand & Event Design",
    copy: "Our brand and event design services create compelling visual identities that leave lasting impressions. We craft cohesive brand experiences and design engaging event spaces that tell your story, connect with your audience, and elevate your brand.",
    image: `${ASSET_BASE}/img2.jpg`,
  },
  {
    label: "Video & Photography",
    copy: "Through expert videography and photography, we capture the essence of your brand. Our visual storytelling combines technical excellence with creative vision, delivering powerful imagery that resonates with your target audience.",
    image: `${ASSET_BASE}/img3.jpg`,
  },
  {
    label: "Motion Design",
    copy: "Our motion design expertise brings static concepts to life. We create dynamic visual experiences through animation, kinetic typography, and fluid transitions, ensuring your message not only reaches but captivates your audience in today's fast-paced landscape.",
    image: `${ASSET_BASE}/img4.jpg`,
  },
  {
    label: "3D Graphics",
    copy: "We push creative boundaries with cutting-edge 3D graphics. Our team creates immersive visual experiences, from product visualization to architectural rendering, bringing depth and dimension to your projects with state-of-the-art modeling.",
    image: `${ASSET_BASE}/img5.jpg`,
  },
  {
    label: "Print & Production",
    copy: "Our print and production solutions combine traditional craftsmanship with modern innovation. We deliver premium quality printed materials that make a tangible impact, from business collateral to large-format displays, using sustainable materials.",
    image: `${ASSET_BASE}/img6.jpg`,
  },
  {
    label: "Digital (UI/UX)",
    copy: "Through intuitive UI/UX design, we create digital experiences that delight users. Our approach combines aesthetic excellence with functional efficiency, ensuring every interaction is meaningful, accessible, and aligned with your business objectives.",
    image: `${ASSET_BASE}/img7.jpg`,
  },
  {
    label: "Web Development",
    copy: "Our web development solutions leverage cutting-edge technologies to build robust, scalable digital platforms. We create responsive, performance-optimized websites and applications that provide seamless user experiences across all devices.",
    image: `${ASSET_BASE}/img8.jpg`,
  },
];

export default function ServiceIndexScrub({
  services = DEFAULT_SERVICES,
  heroImage = `${ASSET_BASE}/hero.jpg`,
  heroCopy = "Scroll Down",
  outroCopy = "Your next section goes here",
  serviceHeight = 38,
  imgHeight = 250,
  accent = "#ff00ff",
  embedded = true,
}: ServiceIndexScrubProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger, SplitText);

    const content = root.querySelector<HTMLElement>(".svx-content");
    const stickySection = root.querySelector<HTMLElement>(".svx-sticky");
    const indicator = root.querySelector<HTMLElement>(".svx-indicator");
    const currentCount = root.querySelector<HTMLElement>(".svx-current-count");
    const serviceImg = root.querySelector<HTMLElement>(".svx-service-img");
    const serviceCopy = root.querySelector<HTMLElement>(".svx-service-copy p");
    const serviceEls = root.querySelectorAll<HTMLElement>(".svx-service");
    if (
      !content ||
      !stickySection ||
      !indicator ||
      !currentCount ||
      !serviceImg ||
      !serviceCopy
    )
      return;

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const viewportHeight = embedded ? root.clientHeight : window.innerHeight;
    const stickyHeight = viewportHeight * services.length;

    serviceCopy.textContent = services[0].copy;
    let currentSplitText = SplitText.create(serviceCopy, { type: "lines" });

    // Widths are measured off-screen at the real display font, so the
    // indicator hugs each label instead of using a fixed width.
    const measureContainer = document.createElement("div");
    measureContainer.style.cssText = `
      position: absolute;
      visibility: hidden;
      height: auto;
      width: auto;
      white-space: nowrap;
      font-family: "Bungee", sans-serif;
      font-size: 60px;
      font-weight: 600;
      text-transform: uppercase;
    `;
    root.appendChild(measureContainer);

    const serviceWidths = Array.from(serviceEls).map((service) => {
      measureContainer.textContent =
        service.querySelector("p")?.textContent ?? "";
      return measureContainer.offsetWidth + 8;
    });

    root.removeChild(measureContainer);

    gsap.set(indicator, {
      width: serviceWidths[0],
      xPercent: -50,
      left: "50%",
    });

    const scrollPerService = viewportHeight;
    let currentIndex = 0;

    const animateTextChange = (index: number) =>
      new Promise<void>((resolve) => {
        gsap.to(currentSplitText.lines, {
          opacity: 0,
          y: -20,
          duration: 0.25,
          stagger: 0.025,
          ease: "power3.inOut",
          onComplete: () => {
            currentSplitText.revert();
            serviceCopy.textContent = services[index].copy;
            currentSplitText = SplitText.create(serviceCopy, {
              type: "lines",
            });

            gsap.set(currentSplitText.lines, { opacity: 0, y: 20 });
            gsap.to(currentSplitText.lines, {
              opacity: 1,
              y: 0,
              duration: 0.25,
              stagger: 0.025,
              ease: "power3.out",
              onComplete: resolve,
            });
          },
        });
      });

    const trigger = ScrollTrigger.create({
      trigger: stickySection,
      scroller,
      start: "top top",
      end: `${stickyHeight}px`,
      pin: true,
      invalidateOnRefresh: true,
      onUpdate: async (self) => {
        gsap.set(root.querySelector(".svx-progress"), {
          scaleY: self.progress,
        });

        const scrollPosition = Math.max(0, self.scroll() - viewportHeight);
        const activeIndex = Math.floor(scrollPosition / scrollPerService);

        if (
          activeIndex >= 0 &&
          activeIndex < serviceEls.length &&
          currentIndex !== activeIndex
        ) {
          currentIndex = activeIndex;

          for (const service of serviceEls)
            service.classList.remove("svx-active");
          serviceEls[activeIndex].classList.add("svx-active");

          await Promise.all([
            gsap.to(indicator, {
              y: activeIndex * serviceHeight,
              width: serviceWidths[activeIndex],
              duration: 0.3,
              ease: "power3.inOut",
              overwrite: true,
            }),
            gsap.to(serviceImg, {
              y: -(activeIndex * imgHeight),
              duration: 0.3,
              ease: "power3.inOut",
              overwrite: true,
            }),
            gsap.to(currentCount, {
              innerText: activeIndex + 1,
              snap: { innerText: 1 },
              duration: 0.3,
              ease: "power3.out",
            }),
            animateTextChange(activeIndex),
          ]);
        }
      },
    });

    ScrollTrigger.refresh();

    return () => {
      trigger.kill();
      currentSplitText.revert();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
      gsap.killTweensOf([indicator, serviceImg, currentCount]);
    };
  }, [embedded, services, serviceHeight, imgHeight]);

  return (
    <div
      className={embedded ? "svx-root svx-embedded" : "svx-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="svx-content">
        <section
          className="svx-hero"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <p>{heroCopy}</p>
        </section>

        <section className="svx-sticky">
          <div className="svx-col">
            <div className="svx-services">
              <div className="svx-indicator" />
              {services.map((service, i) => (
                <div
                  className={i === 0 ? "svx-service svx-active" : "svx-service"}
                  key={service.label}
                >
                  <p>{service.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="svx-col">
            <div className="svx-service-img-wrapper">
              <div className="svx-service-img">
                {services.map((service) => (
                  <div className="svx-img" key={`img-${service.label}`}>
                    <img alt="" draggable={false} src={service.image} />
                  </div>
                ))}
              </div>
            </div>
            <div className="svx-service-copy">
              <p>{services[0].copy}</p>
            </div>
          </div>

          <div className="svx-progress-bar">
            <div className="svx-progress" />
          </div>
          <div className="svx-index">
            <span className="svx-current-count">1</span>
            <span
              className="svx-separator"
              style={{ backgroundColor: accent }}
            />
            <span className="svx-total-count">{services.length}</span>
          </div>
        </section>

        <section className="svx-outro" style={{ backgroundColor: accent }}>
          <p>{outroCopy}</p>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Bungee&family=Hanken+Grotesk:ital,wght@0,100..900;1,100..900&display=swap");

/* White, as the source renders: it leaves the page behind the services section
   unstyled. Painting that area #d5d5d5 hides the inactive labels, which are
   #d5d5d5 themselves and read as faint grey only against white. */
.svx-root {
  position: relative;
  width: 100%;
  height: 100%;
  color: #000;
  background-color: #fff;
  font-family: "Hanken Grotesk", sans-serif;
}

.svx-root * {
  box-sizing: border-box;
}

.svx-root.svx-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.svx-root.svx-embedded::-webkit-scrollbar {
  display: none;
}

.svx-content {
  position: relative;
  width: 100%;
}

.svx-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.svx-content section {
  position: relative;
  width: 100%;
  height: 100svh;
}

.svx-hero,
.svx-outro {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-color: #d5d5d5;
}

.svx-hero {
  align-items: flex-end;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-size: cover;
  padding-bottom: 4em;
  color: #fff;
}

.svx-hero p {
  margin: 0;
}

.svx-outro p {
  margin: 0;
  text-transform: uppercase;
  font-family: "Bungee", sans-serif;
  font-size: 30px;
  font-weight: 600;
  line-height: 18px;
  padding: 4px 2px 0 2px;
  background-color: #000;
  color: #fff;
}

.svx-sticky {
  display: flex;
}

.svx-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2em;
}

.svx-services {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.svx-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 38px;
  transform: translateY(0px);
  background-color: #000;
  z-index: 0;
}

.svx-service {
  position: relative;
  width: max-content;
  height: 38px;
  z-index: 1;
}

.svx-service p {
  margin: 0;
  text-transform: uppercase;
  font-family: "Bungee", sans-serif;
  font-size: 60px;
  font-weight: 600;
  color: #d5d5d5;
  transition: color 0.3s;
}

.svx-service.svx-active p {
  color: #fff;
}

.svx-service-img-wrapper {
  position: relative;
  width: 60%;
  height: 250px;
  overflow: hidden;
  clip-path: polygon(50% 0%, 100% 0, 100% 85%, 90% 100%, 50% 100%, 0 100%, 0 0);
}

.svx-service-img {
  width: 100%;
  transform: translateY(0px);
  will-change: transform;
}

.svx-img {
  width: 100%;
  height: 250px;
}

.svx-service-copy {
  width: 60%;
}

.svx-service-copy p {
  margin: 0;
  font-size: 18px;
  font-weight: 400;
  line-height: 28px;
}

.svx-progress-bar {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 2.5px;
  height: 60%;
  background-color: #e0e0e0;
}

.svx-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
  transform-origin: top;
  transform: scaleY(0);
  will-change: transform;
}

.svx-index {
  position: absolute;
  bottom: 10%;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  padding: 4px 2px 2px 2px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #000;
  color: #fff;
}

.svx-index span {
  font-family: "Bungee", sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 12px;
  width: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.svx-index span.svx-separator {
  position: relative;
  top: -1px;
  width: 20px;
  height: 2px;
}

@media (max-width: 900px) {
  .svx-sticky {
    flex-direction: column;
  }

  .svx-col:nth-child(1) {
    padding-top: 25%;
    justify-content: flex-start;
  }

  .svx-col:nth-child(2) {
    flex-direction: row;
    gap: 1.5em;
  }

  .svx-service-img-wrapper {
    width: 25%;
  }

  .svx-service-copy p {
    font-size: 14px;
  }

  .svx-progress-bar {
    top: -15%;
    height: 50%;
    transform: rotate(-90deg);
  }

  .svx-index {
    top: 5%;
    bottom: unset;
  }
}
`;
