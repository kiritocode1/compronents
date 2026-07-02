// @ts-nocheck
// biome-ignore-all lint: source-authored GSAP template port.

"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useLayoutEffect, useRef } from "react";

import { useAsset, useRoute } from "../../runtime";

gsap.registerPlugin(ScrollTrigger);

const slides = [
  {
    title: "Room 14B",
    image: "/featured-work/featured-work-1.jpg",
    url: "/brief",
  },
  {
    title: "Subject Identified",
    image: "/featured-work/featured-work-2.jpg",
    url: "/brief",
  },
  {
    title: "Dossier 09",
    image: "/featured-work/featured-work-3.jpg",
    url: "/brief",
  },
  {
    title: "Stairwell C7",
    image: "/featured-work/featured-work-4.jpg",
    url: "/brief",
  },
];

const STRIPS_COUNT = 20;
const SCROLL_PER_TRANSITION = 1000;
const INITIAL_DELAY = 300;
const FINAL_DELAY = 300;
const TITLE_CHANGE_THRESHOLD = 0.3;

const MASK_HIDDEN =
  "linear-gradient(to bottom, transparent 0%, transparent 100%)";
const MASK_REVEALED = "linear-gradient(to bottom, black 0%, black 100%)";

// precompute strip bounds for horizontal wipe mask
function createStripBounds(stripsCount) {
  return Array.from({ length: stripsCount }, (_, j) => {
    const posFromBottom = stripsCount - j - 1;
    const step = 100 / stripsCount;
    const lower = (posFromBottom + 1) * step;
    const upper = posFromBottom * step;
    return {
      lower,
      upperGap: upper - 0.1,
      delay: (j / stripsCount) * 0.5,
    };
  });
}

// merge overlapping mask intervals into contiguous ranges
function mergeIntervals(intervals) {
  if (!intervals.length) return [];

  intervals.sort((a, b) => a.top - b.top);
  const merged = [{ ...intervals[0] }];

  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    const next = intervals[i];

    if (next.top <= last.bottom) {
      last.bottom = Math.max(last.bottom, next.bottom);
    } else {
      merged.push({ ...next });
    }
  }

  return merged;
}

// build css mask gradient from strip reveal progress
function buildStripMask(stripBounds, getAdj) {
  const intervals = [];

  for (let j = 0; j < stripBounds.length; j++) {
    const bounds = stripBounds[j];
    const adj = Math.max(0, Math.min(1, getAdj(j, bounds)));
    if (adj <= 0) continue;

    const sliceHeight = bounds.lower - bounds.upperGap;
    intervals.push({
      top: bounds.lower - adj * sliceHeight,
      bottom: bounds.lower,
    });
  }

  const merged = mergeIntervals(intervals);
  if (!merged.length) return MASK_HIDDEN;

  const stops = [];
  let cursor = 0;

  for (const { top, bottom } of merged) {
    if (top > cursor) {
      stops.push(`transparent ${cursor}%`, `transparent ${top}%`);
    }
    stops.push(`black ${top}%`, `black ${bottom}%`);
    cursor = bottom;
  }

  if (cursor < 100) {
    stops.push(`transparent ${cursor}%`, `transparent 100%`);
  }

  return `linear-gradient(to bottom, ${stops.join(", ")})`;
}

function setMaskImage(el, value) {
  el.style.maskImage = value;
  el.style.webkitMaskImage = value;
}

function createScaleSetter(el) {
  const apply = (value) => {
    el.style.transform = `translate3d(0, 0, 0) scale(${value})`;
  };
  apply(1.25);
  return apply;
}

export default function FeaturedProjects() {
  const asset = useAsset();
  const { navigate } = useRoute();
  const handleExploreClick = useCallback(
    (event) => {
      event.preventDefault();
      const href =
        exploreLinkRef.current?.getAttribute("href") || slides[0].url;
      navigate(href);
    },
    [navigate],
  );
  const sectionRef = useRef(null);
  const firstImgRef = useRef(null);
  const titleRef = useRef(null);
  const exploreLinkRef = useRef(null);
  const slideImagesRef = useRef(null);

  // pinned scroll slider with strip-mask transitions and title swap
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const slideImages = slideImagesRef.current;
    const titleElement = titleRef.current;
    const exploreLink = exploreLinkRef.current;
    const firstSlideImg = firstImgRef.current;

    if (
      !section ||
      !slideImages ||
      !titleElement ||
      !exploreLink ||
      !firstSlideImg
    )
      return;

    const stripBounds = createStripBounds(STRIPS_COUNT);
    const totalSlides = slides.length;
    const slideLayers = [];
    const setFirstImgScale = createScaleSetter(firstSlideImg);

    for (let i = 1; i < totalSlides; i++) {
      const imgContainer = document.createElement("div");
      imgContainer.className = "fp-img-container";

      const img = document.createElement("img");
      img.className = "fp-slide-masked";
      img.src = asset(slides[i].image);
      img.alt = slides[i].title;
      img.decoding = "async";
      setMaskImage(img, MASK_HIDDEN);

      imgContainer.appendChild(img);
      slideImages.appendChild(imgContainer);

      slideLayers.push({
        transitionIndex: i - 1,
        img,
        setScale: createScaleSetter(img),
        revealState: "hidden",
      });
    }

    const transitionCount = totalSlides - 1;
    const totalScrollDistance =
      transitionCount * SCROLL_PER_TRANSITION + INITIAL_DELAY + FINAL_DELAY;

    const transitionRanges = [];
    let pos = INITIAL_DELAY;
    for (let i = 0; i < transitionCount; i++) {
      const start = pos;
      const end = start + SCROLL_PER_TRANSITION;
      transitionRanges.push({
        startPercent: start / totalScrollDistance,
        endPercent: end / totalScrollDistance,
      });
      pos = end;
    }

    function calculateImageProgress(scrollProgress) {
      if (scrollProgress < transitionRanges[0].startPercent) return 0;
      if (
        scrollProgress >
        transitionRanges[transitionRanges.length - 1].endPercent
      )
        return transitionRanges.length;

      for (let i = 0; i < transitionRanges.length; i++) {
        const { startPercent, endPercent } = transitionRanges[i];
        if (scrollProgress >= startPercent && scrollProgress <= endPercent) {
          const norm =
            (scrollProgress - startPercent) / (endPercent - startPercent);
          return i + norm;
        }
      }
      return transitionRanges.length;
    }

    function getScaleForImage(imageIndex, currentImageIndex, progress) {
      const continuousProgress = currentImageIndex + progress;
      const diff = continuousProgress - imageIndex;
      if (diff <= 0) return 1.25;
      if (diff >= 2) return 1;
      return 1.25 - 0.125 * diff;
    }

    let currentTitleIndex = 0;
    let queuedTitleIndex = null;
    let isAnimating = false;
    let lastImageProgress = 0;

    function animateTitleChange(index, direction) {
      if (index === currentTitleIndex) return;
      if (index < 0 || index >= slides.length) return;

      if (isAnimating) {
        queuedTitleIndex = index;
        return;
      }

      isAnimating = true;
      const outY = direction === "down" ? "-120%" : "120%";
      const inY = direction === "down" ? "120%" : "-120%";

      gsap.killTweensOf(titleElement);
      exploreLink.href = slides[index].url;

      gsap.to(titleElement, {
        y: outY,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          titleElement.textContent = slides[index].title;
          gsap.set(titleElement, { y: inY });
          gsap.to(titleElement, {
            y: "0%",
            duration: 0.3,
            ease: "power2.out",
            onComplete: () => {
              currentTitleIndex = index;
              isAnimating = false;
              if (
                queuedTitleIndex !== null &&
                queuedTitleIndex !== currentTitleIndex
              ) {
                const next = queuedTitleIndex;
                queuedTitleIndex = null;
                animateTitleChange(next, direction);
              }
            },
          });
        },
      });
    }

    function getTitleIndexForProgress(imageProgress) {
      const idx = Math.floor(imageProgress);
      const specific = imageProgress - idx;
      return specific >= TITLE_CHANGE_THRESHOLD
        ? Math.min(idx + 1, slides.length - 1)
        : idx;
    }

    function setLayerRevealed(layer) {
      if (layer.revealState === "revealed") return;
      setMaskImage(layer.img, MASK_REVEALED);
      layer.revealState = "revealed";
    }

    function setLayerHidden(layer) {
      if (layer.revealState === "hidden") return;
      setMaskImage(layer.img, MASK_HIDDEN);
      layer.revealState = "hidden";
    }

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: `+=${totalScrollDistance}vh`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      invalidateOnRefresh: true,

      onUpdate: (self) => {
        const imageProgress = calculateImageProgress(self.progress);
        const scrollDirection =
          imageProgress > lastImageProgress ? "down" : "up";
        const currentImageIndex = Math.floor(imageProgress);
        const imageSpecificProgress = imageProgress - currentImageIndex;

        const correctTitleIndex = getTitleIndexForProgress(imageProgress);
        if (correctTitleIndex !== currentTitleIndex) {
          queuedTitleIndex = correctTitleIndex;
          if (!isAnimating)
            animateTitleChange(correctTitleIndex, scrollDirection);
        }

        setFirstImgScale(
          getScaleForImage(0, currentImageIndex, imageSpecificProgress),
        );

        for (const layer of slideLayers) {
          const { transitionIndex, setScale } = layer;
          const scale = getScaleForImage(
            transitionIndex,
            currentImageIndex,
            imageSpecificProgress,
          );

          setScale(scale);

          if (transitionIndex < currentImageIndex) {
            setLayerRevealed(layer);
          } else if (transitionIndex === currentImageIndex) {
            layer.revealState = "animating";
            setMaskImage(
              layer.img,
              buildStripMask(stripBounds, (_j, bounds) =>
                Math.max(
                  0,
                  Math.min(1, (imageSpecificProgress - bounds.delay) * 2),
                ),
              ),
            );
          } else {
            setLayerHidden(layer);
          }
        }

        lastImageProgress = imageProgress;
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <section className="fp-sticky-slider" ref={sectionRef}>
      <div className="fp-slide-images" ref={slideImagesRef}>
        <div className="fp-img" id="fp-img-1">
          <img
            ref={firstImgRef}
            src={asset(slides[0].image)}
            alt={slides[0].title}
          />
        </div>
      </div>

      <div className="fp-slide-info">
        <div className="container">
          <div className="fp-slide-title-prefix">
            <p>Featured</p>
          </div>

          <div className="fp-slide-title">
            <p id="fp-title-text" ref={titleRef}>
              {slides[0].title}
            </p>
          </div>

          <div className="fp-slide-link">
            <a
              ref={exploreLinkRef}
              href={slides[0].url}
              onClick={handleExploreClick}
            >
              Explore
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
