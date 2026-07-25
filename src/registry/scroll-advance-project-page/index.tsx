"use client";

/**
 * Scroll Advance Project Page - a project template where reaching the bottom
 * is the navigation. The footer pins for three viewports and fills a second
 * progress bar as you push through it; when that bar completes, the page
 * advances to the next project on its own. Two independent progress readouts
 * run at once: one in the nav tracking the whole document, one in the footer
 * tracking only the pin. A latch stops the handoff firing twice if the pin is
 * scrubbed across its end.
 *
 * Routes run through a lightweight internal router, so the whole template is
 * one installable component with no routing dependency.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useCallback, useEffect, useRef, useState } from "react";

import { getScrollAdvanceStyles } from "./styles";

export const DEFAULT_ASSET_BASE =
  "https://ui.aryank.space/assets/scroll-advance-project-page";

export interface ScrollAdvanceProject {
  slug: string;
  title: string;
  description: string;
  images: string[];
}

export interface ScrollAdvanceProjectPageProps {
  assetBase?: string;
  projects?: ScrollAdvanceProject[];
  initialSlug?: string;
}

function buildDefaults(assetBase: string): ScrollAdvanceProject[] {
  const meta = [
    {
      slug: "digital-ocean",
      title: "Digital Ocean",
      description: "A virtual diving experience through digital oceans.",
    },
    {
      slug: "cosmic-visualizer",
      title: "Cosmic Visualizer",
      description: "Interactive visualization of astronomical data.",
    },
    {
      slug: "smart-controller",
      title: "Smart Controller",
      description: "Centralized system for managing smart home devices.",
    },
  ];

  return meta.map((project, projectIndex) => ({
    ...project,
    images: Array.from(
      { length: 5 },
      (_, i) => `${assetBase}/project-${projectIndex + 1}-${i + 1}.jpg`,
    ),
  }));
}

export default function ScrollAdvanceProjectPage({
  assetBase = DEFAULT_ASSET_BASE,
  projects,
  initialSlug,
}: ScrollAdvanceProjectPageProps) {
  const items = projects ?? buildDefaults(assetBase);
  const [index, setIndex] = useState(() => {
    const found = items.findIndex((p) => p.slug === initialSlug);
    return found >= 0 ? found : 0;
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const isTransitioning = useRef(false);

  const project = items[index] ?? items[0];
  const nextProject = items[(index + 1) % items.length];
  const prevProject = items[(index - 1 + items.length) % items.length];

  const goTo = useCallback(
    (slug: string) => {
      const found = items.findIndex((p) => p.slug === slug);
      if (found < 0) return;
      isTransitioning.current = false;
      setIndex(found);
      const root = rootRef.current;
      if (root) root.scrollTop = 0;
    },
    [items],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".sap-project-page");
    const projectNav = root.querySelector<HTMLElement>(".sap-project-nav");
    const progressBar = root.querySelector<HTMLElement>(
      ".sap-project-page-scroll-progress-bar",
    );
    const projectDescription = root.querySelector<HTMLElement>(
      ".sap-project-description",
    );
    const footer = root.querySelector<HTMLElement>(".sap-project-footer");
    const nextProgressBar = root.querySelector<HTMLElement>(
      ".sap-next-project-progress-bar",
    );
    if (!content || !projectNav || !footer) return;

    const lenis = new Lenis({ wrapper: root, content });
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    gsap.set(projectNav, { opacity: 0, y: -100 });
    gsap.to(projectNav, {
      opacity: 1,
      y: 0,
      duration: 1,
      delay: 0.25,
      ease: "power3.out",
    });

    gsap.to(projectDescription, {
      opacity: 1,
      duration: 1,
      delay: 0.5,
      ease: "power3.out",
    });

    const navScrollTrigger = ScrollTrigger.create({
      trigger: content,
      scroller: root,
      start: "top top",
      end: "bottom bottom",
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (progressBar) gsap.set(progressBar, { scaleX: self.progress });
      },
    });

    const footerScrollTrigger = ScrollTrigger.create({
      trigger: footer,
      scroller: root,
      start: "top top",
      end: `+=${root.clientHeight * 3}px`,
      pin: true,
      pinSpacing: true,
      invalidateOnRefresh: true,
      onEnter: () => {
        if (!isTransitioning.current) {
          gsap.to(projectNav, { y: -100, duration: 0.5, ease: "power2.inOut" });
        }
      },
      onLeaveBack: () => {
        if (!isTransitioning.current) {
          gsap.to(projectNav, { y: 0, duration: 0.5, ease: "power2.inOut" });
        }
      },
      onUpdate: (self) => {
        if (nextProgressBar && !isTransitioning.current) {
          gsap.set(nextProgressBar, { scaleX: self.progress });
        }

        if (self.progress >= 1 && !isTransitioning.current) {
          isTransitioning.current = true;

          const tl = gsap.timeline();

          tl.set(nextProgressBar, { scaleX: 1 });

          tl.to(
            [
              footer.querySelector(".sap-project-footer-copy"),
              footer.querySelector(".sap-next-project-progress"),
            ],
            { opacity: 0, duration: 0.3, ease: "power2.inOut" },
          );

          tl.call(() => goTo(nextProject.slug));
        }
      },
    });

    ScrollTrigger.refresh();

    return () => {
      navScrollTrigger.kill();
      footerScrollTrigger.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [index, nextProject.slug, goTo]);

  return (
    <div className="sap-root" ref={rootRef}>
      <style>{getScrollAdvanceStyles()}</style>

      <div className="sap-project-page" key={project.slug}>
        <div className="sap-project-nav">
          <div className="sap-link">
            <span>&#8592;&nbsp;</span>
            <button type="button" onClick={() => goTo(prevProject.slug)}>
              Previous
            </button>
          </div>

          <div className="sap-project-page-scroll-progress">
            <p>{project.title}</p>
            <div className="sap-project-page-scroll-progress-bar" />
          </div>

          <div className="sap-link">
            <button type="button" onClick={() => goTo(nextProject.slug)}>
              Next
            </button>
            <span>&nbsp;&#8594;</span>
          </div>
        </div>

        <div className="sap-project-hero">
          <h1>{project.title}</h1>
          <p className="sap-project-description">{project.description}</p>
        </div>

        <div className="sap-project-images">
          {project.images.map((image) => (
            <div className="sap-project-img" key={image}>
              <img src={image} alt="" />
            </div>
          ))}
        </div>

        <div className="sap-project-footer">
          <h1>{nextProject.title}</h1>

          <div className="sap-project-footer-copy">
            <p>Next Project</p>
          </div>

          <div className="sap-next-project-progress">
            <div className="sap-next-project-progress-bar" />
          </div>
        </div>
      </div>
    </div>
  );
}
