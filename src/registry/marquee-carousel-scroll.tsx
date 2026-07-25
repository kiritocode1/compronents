"use client";

/**
 * Marquee Carousel Scroll - a pinned carousel where each project arrives as a
 * wedge. Scrolling forward tilts the incoming slide's clip path up from the
 * bottom edge while the outgoing one closes off the top, and the image and copy
 * inside slide at different rates so the layers separate as they cross. Each
 * title is tripled and marqueed on an infinite linear loop, and a row of
 * segmented bars fills one at a time to show where you are in the set.
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

const ASSET_BASE = "https://ui.aryank.space/assets/marquee-carousel-scroll";

export interface MarqueeSlide {
  tag: string;
  marquee: string;
  image: string;
}

export interface MarqueeCarouselScrollProps {
  brand?: string;
  navItems?: string[];
  introCopy?: string;
  outroCopy?: string;
  slides?: MarqueeSlide[];
  embedded?: boolean;
}

const DEFAULT_SLIDES: MarqueeSlide[] = [
  {
    tag: "Website",
    marquee: "Eclipse Interactive Art Portfolio",
    image: `${ASSET_BASE}/slide-img-1.jpg`,
  },
  {
    tag: "Branding",
    marquee: "Solaris Avant-Garde Brand Identity",
    image: `${ASSET_BASE}/slide-img-2.jpg`,
  },
  {
    tag: "Experience",
    marquee: "Nova Immersive Light Exhibition",
    image: `${ASSET_BASE}/slide-img-3.jpg`,
  },
  {
    tag: "Website",
    marquee: "Luminex Virtual Reality Showcase",
    image: `${ASSET_BASE}/slide-img-4.jpg`,
  },
  {
    tag: "Marketing",
    marquee: "Orion Digital Art Launch Campaign",
    image: `${ASSET_BASE}/slide-img-5.jpg`,
  },
];

export default function MarqueeCarouselScroll({
  brand = "nova",
  navItems = ["Home", "Projects", "Gallery", "Experiences", "Contact"],
  introCopy = "Where Vision Ignites and Boundaries Fade.",
  outroCopy = "Endless Horizons Await Beyond the Canvas.",
  slides = DEFAULT_SLIDES,
  embedded = true,
}: MarqueeCarouselScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!slides.length) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".ese-content");
    const carousel = root.querySelector<HTMLElement>(".ese-carousel");
    if (!content || !carousel) return;

    const slideCount = slides.length;
    let activeSlideIndex = 0;
    let previousProgress = 0;
    let isAnimatingSlide = false;
    let triggerDestroyed = false;

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const initMarqueeAnimation = (h1Element: HTMLElement) => {
      const text = h1Element.textContent ?? "";
      h1Element.textContent = `${text} ${text} ${text}`;

      gsap.to(h1Element, {
        x: "-33.33%",
        duration: 10,
        ease: "linear",
        repeat: -1,
        rotation: 0.01,
      });
    };

    const initialSlide = carousel.querySelector<HTMLElement>(".ese-slide");
    if (!initialSlide) return;
    gsap.set(initialSlide, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    });
    gsap.set(initialSlide.querySelector(".ese-slide-img img"), { y: "0%" });

    const initialMarquee = initialSlide.querySelector<HTMLElement>(
      ".ese-marquee-container h1",
    );
    if (initialMarquee) initMarqueeAnimation(initialMarquee);

    const updateProgressBars = (progress: number) => {
      const progressBars = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll(".ese-progress-bar"),
      );
      progressBars.forEach((bar, index) => {
        const barProgress = Math.min(
          Math.max(progress * slideCount - index, 0),
          1,
        );
        bar.style.setProperty("--ese-progress", `${barProgress}`);
      });
    };

    const createAndAnimateSlide = (
      index: number,
      isScrollingForward: boolean,
    ) => {
      const currentSlide = carousel.querySelector<HTMLElement>(".ese-slide");
      if (!currentSlide) {
        isAnimatingSlide = false;
        return;
      }

      const slideData = slides[index];

      const newSlide = document.createElement("div");
      newSlide.className = "ese-slide";

      const imgWrap = document.createElement("div");
      imgWrap.className = "ese-slide-img";
      const img = document.createElement("img");
      img.src = slideData.image;
      img.alt = "";
      imgWrap.appendChild(img);

      const copy = document.createElement("div");
      copy.className = "ese-slide-copy";
      const tagWrap = document.createElement("div");
      tagWrap.className = "ese-slide-tag";
      const tagP = document.createElement("p");
      tagP.textContent = slideData.tag;
      tagWrap.appendChild(tagP);

      const marqueeWrap = document.createElement("div");
      marqueeWrap.className = "ese-slide-marquee";
      const marqueeContainer = document.createElement("div");
      marqueeContainer.className = "ese-marquee-container";
      const h1 = document.createElement("h1");
      h1.textContent = slideData.marquee;
      marqueeContainer.appendChild(h1);
      marqueeWrap.appendChild(marqueeContainer);

      copy.append(tagWrap, marqueeWrap);
      newSlide.append(imgWrap, copy);

      initMarqueeAnimation(h1);

      const currentSlideImg =
        currentSlide.querySelector<HTMLElement>(".ese-slide-img");
      const currentSlideCopy =
        currentSlide.querySelector<HTMLElement>(".ese-slide-copy");

      if (!currentSlideImg || !currentSlideCopy) {
        isAnimatingSlide = false;
        return;
      }

      gsap.killTweensOf(currentSlide);
      gsap.killTweensOf(currentSlideImg);
      gsap.killTweensOf(currentSlideCopy);

      const newSlideImg = newSlide.querySelector(".ese-slide-img img");
      const newSlideCopy = newSlide.querySelector(".ese-slide-copy");

      if (isScrollingForward) {
        gsap.set(newSlide, {
          clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        });
        gsap.set(newSlideImg, { y: "25%" });
        gsap.set(newSlideCopy, { y: "100%" });

        carousel.appendChild(newSlide);

        gsap.to(newSlide, {
          clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
          duration: 1,
          ease: "power4.inOut",
        });

        gsap.to([newSlideCopy, newSlideImg], {
          y: "0%",
          duration: 1,
          ease: "power4.inOut",
        });

        gsap.to(currentSlide, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          duration: 1,
          ease: "power4.inOut",
          onStart: () => {
            gsap.to(currentSlideImg, {
              y: "-25%",
              duration: 1,
              ease: "power4.inOut",
            });
            gsap.to(currentSlideCopy, {
              y: "-100%",
              duration: 1,
              ease: "power4.inOut",
            });
          },
          onComplete: () => {
            currentSlide.remove();
            isAnimatingSlide = false;
          },
          onInterrupt: () => {
            isAnimatingSlide = false;
          },
        });
      } else {
        gsap.set(newSlide, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        });
        gsap.set(newSlideImg, { y: "-25%" });
        gsap.set(newSlideCopy, { y: "-100%" });

        carousel.insertBefore(newSlide, currentSlide);

        gsap.to(newSlide, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 1,
          ease: "power4.inOut",
        });

        gsap.to([newSlideImg, newSlideCopy], {
          y: "0%",
          duration: 1,
          ease: "power4.inOut",
        });

        gsap.to(currentSlide, {
          clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
          duration: 1,
          ease: "power4.inOut",
          onStart: () => {
            gsap.to(currentSlideImg, {
              y: "25%",
              duration: 1,
              ease: "power4.inOut",
            });
            gsap.to(currentSlideCopy, {
              y: "100%",
              duration: 1,
              ease: "power4.inOut",
            });
          },
          onComplete: () => {
            currentSlide.remove();
            isAnimatingSlide = false;
          },
          onInterrupt: () => {
            isAnimatingSlide = false;
          },
        });
      }
    };

    const viewportHeight = embedded ? root.clientHeight : window.innerHeight;

    const scrollTrigger = ScrollTrigger.create({
      trigger: carousel,
      scroller,
      start: "top top",
      end: `+=${viewportHeight * (slideCount * 3)}px`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (triggerDestroyed) return;

        const progress = self.progress;
        updateProgressBars(progress);

        if (isAnimatingSlide) {
          previousProgress = progress;
          return;
        }

        const isScrollingForward = progress > previousProgress;
        const targetSlideIndex = Math.min(
          Math.floor(progress * slideCount),
          slideCount - 1,
        );

        if (targetSlideIndex !== activeSlideIndex) {
          isAnimatingSlide = true;
          createAndAnimateSlide(targetSlideIndex, isScrollingForward);
          activeSlideIndex = targetSlideIndex;
        }

        previousProgress = progress;
      },
      onKill: () => {
        triggerDestroyed = true;
      },
    });

    ScrollTrigger.refresh();

    return () => {
      triggerDestroyed = true;
      scrollTrigger.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, slides]);

  return (
    <div
      className={embedded ? "ese-root ese-embedded" : "ese-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="ese-content">
        <nav className="ese-nav">
          <div className="ese-logo">
            <a href="#top">{brand}</a>
          </div>
          <div className="ese-nav-items">
            {navItems.map((item) => (
              <a href="#top" key={item}>
                {item}
              </a>
            ))}
          </div>
        </nav>

        <section className="ese-intro">
          <p>{introCopy}</p>
        </section>

        <section className="ese-carousel">
          <div className="ese-slide">
            <div className="ese-slide-img">
              <img src={slides[0]?.image} alt="" />
            </div>
            <div className="ese-slide-copy">
              <div className="ese-slide-tag">
                <p>{slides[0]?.tag}</p>
              </div>
              <div className="ese-slide-marquee">
                <div className="ese-marquee-container">
                  <h1>{slides[0]?.marquee}</h1>
                </div>
              </div>
            </div>
          </div>
          <div className="ese-carousel-progress">
            {slides.map((slide) => (
              <div className="ese-progress-bar" key={slide.marquee} />
            ))}
          </div>
        </section>

        <section className="ese-outro">
          <p>{outroCopy}</p>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");

.ese-root {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "Inter", sans-serif;
  background-color: #0f0f0f;
}
.ese-root.ese-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.ese-root.ese-embedded::-webkit-scrollbar { display: none; }
.ese-root * { margin: 0; padding: 0; box-sizing: border-box; }
.ese-content { position: relative; width: 100%; }
.ese-root h1 {
  position: relative;
  color: #fff;
  font-size: 10rem;
  font-weight: 700;
  letter-spacing: -0.4rem;
  line-height: 1.5;
  will-change: transform;
  white-space: nowrap;
}
.ese-root p {
  color: #fff;
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: -0.04rem;
  line-height: 1;
}
.ese-root a {
  color: #fff;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
}
.ese-root img {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: cover;
  will-change: transform;
}
.ese-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 2em 4em;
  display: flex;
  justify-content: space-between;
  z-index: 2;
}
.ese-nav-items { display: flex; gap: 1em; }
.ese-logo a {
  font-size: 2rem;
  font-weight: 600;
  letter-spacing: -0.06rem;
}
.ese-root section {
  position: relative;
  width: 100%;
  height: 100svh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #0f0f0f;
  overflow: hidden;
}
.ese-slide,
.ese-slide-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.ese-slide {
  display: flex;
  align-items: flex-end;
  padding-bottom: 5em;
}
.ese-slide-img img {
  position: relative;
  transform: scale(1.25);
  will-change: transform;
}
.ese-slide-copy {
  position: relative;
  width: 100%;
  overflow: hidden;
  will-change: transform;
  z-index: 0;
}
.ese-slide-tag { padding: 0 4em; }
.ese-slide-marquee { width: 100%; overflow: hidden; }
.ese-marquee-container { width: 1000%; }
.ese-carousel-progress {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 4em;
  display: flex;
  justify-content: space-between;
  gap: 1em;
  z-index: 2;
}
.ese-progress-bar {
  position: relative;
  flex: 1;
  width: 100%;
  height: 2px;
  background-color: rgba(255, 255, 255, 0.2);
}
.ese-progress-bar::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  transform-origin: center left;
  transform: scaleX(var(--ese-progress, 0));
  will-change: transform;
}

@media (max-width: 900px) {
  .ese-nav-items { display: none; }
  .ese-nav { padding: 2em; }
  .ese-slide-tag { padding: 0 2em; }
  .ese-marquee-container { width: 2000%; }
  .ese-carousel-progress { padding: 2em 1em; gap: 0.5em; }
}
`;
