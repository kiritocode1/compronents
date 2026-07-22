/**
 * Boot sequence ported from obys.agency d.js:
 *   class ah  — logo stroke draw + morph (counter 0→50)
 *   class eh  — plane grow at center, moveUnder stack, tBg white, spread
 *
 * NO invent rotation / fan / spin. Planes only change size + xy position.
 */

import gsap from "gsap";

import {
  LOGO_PATH_L,
  LOGO_PATH_L_GLOBE,
  LOGO_PATH_R,
  LOGO_PATH_R_GLOBE,
} from "./logo-paths";

export type BootPlane = {
  el: HTMLElement;
  w: number;
  h: number;
};

export type BootOptions = {
  root: HTMLElement;
  logo: HTMLElement;
  pathR: SVGPathElement;
  pathL: SVGPathElement;
  stack: HTMLElement;
  planes: HTMLElement[];
  preloader: HTMLElement | null;
  preloaderBg: HTMLElement | null;
  prgBar: HTMLElement | null;
  pctEl: HTMLElement | null;
  onCounter: (n: number) => void;
  onDone: () => void;
};

/**
 * Run the home boot. Returns a kill() for cleanup.
 */
export function runObysBoot(opts: BootOptions): () => void {
  const {
    root,
    logo,
    pathR,
    pathL,
    stack,
    planes: allPlanes,
    preloader,
    preloaderBg,
    prgBar,
    pctEl,
    onCounter,
    onDone,
  } = opts;

  const n = Math.min(allPlanes.length, 6);
  const planes = allPlanes.slice(0, n);
  const vw = root.clientWidth;
  const vh = root.clientHeight;

  const setCounter = (raw: number) => {
    const v = Math.min(100, Math.max(0, Math.round(raw)));
    onCounter(v);
    if (prgBar) prgBar.style.transform = `translateX(${v - 100}%)`;
  };

  // --- sizes (frame-like widths from aspect) ---
  const sizes = planes.map((el) => {
    const ar = Number(el.dataset.ar || "1") || 1;
    const w = Math.min(vw * 0.2, 200);
    return { w, h: w / ar };
  });

  // --- moveUnder targets: stacked under logo center, 5px gap (source) ---
  const gap = 5;
  const totalH = sizes.reduce((s, x) => s + x.h, 0) + gap * Math.max(0, n - 1);
  let y = vh / 2 - totalH / 2;
  const under = sizes.map((sz) => {
    const top = y + sz.h / 2;
    y += sz.h + gap;
    return { left: vw / 2, top, ...sz };
  });

  // --- logo setup (source ah: paths opacity 0 initially) ---
  logo.classList.add("is-intro");
  logo.classList.remove("is-spread", "is-on");
  pathR.setAttribute("d", LOGO_PATH_R_GLOBE);
  pathL.setAttribute("d", LOGO_PATH_L_GLOBE);
  for (const p of [pathR, pathL]) {
    p.setAttribute("fill", "none");
    p.setAttribute("stroke", "#fff");
    p.setAttribute("stroke-width", "2.5");
    p.style.opacity = "0";
  }

  // --- stack(): center, size 0 (source) ---
  planes.forEach((el, i) => {
    gsap.set(el, {
      left: vw / 2,
      top: vh / 2,
      xPercent: -50,
      yPercent: -50,
      width: 0,
      height: 0,
      opacity: 1,
      rotation: 0,
      zIndex: n - i,
    });
  });

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.set(stack, { autoAlpha: 0 });
      if (preloader) {
        preloader.style.pointerEvents = "none";
        gsap.set(preloader, { autoAlpha: 0 });
      }
      onDone();
    },
  });

  setCounter(0);

  // ========== class ah.run — stroke draw outer rings (0→30, 1300ms) ==========
  // Source draws 4 temporary stroke paths; we dash-draw the globe paths.
  const lenR =
    typeof pathR.getTotalLength === "function" ? pathR.getTotalLength() : 900;
  const lenL =
    typeof pathL.getTotalLength === "function" ? pathL.getTotalLength() : 900;
  pathR.style.strokeDasharray = `${lenR}`;
  pathL.style.strokeDasharray = `${lenL}`;
  pathR.style.strokeDashoffset = `${lenR}`;
  pathL.style.strokeDashoffset = `${lenL}`;
  pathR.style.opacity = "1";
  pathL.style.opacity = "1";

  const dash = { r: lenR, l: lenL, p: 0 };
  tl.to(
    dash,
    {
      r: 0,
      l: 0,
      p: 30,
      duration: 1.3,
      ease: "power2.inOut",
      onUpdate: () => {
        pathR.style.strokeDashoffset = `${dash.r}`;
        pathL.style.strokeDashoffset = `${dash.l}`;
        setCounter(dash.p);
      },
    },
    0,
  );

  // ========== class ah.phase3 — morph fill globe→logo (30→50, 1400ms) ==========
  const fill = { o: 0, p: 30 };
  tl.to(
    fill,
    {
      o: 1,
      p: 50,
      duration: 1.4,
      ease: "power2.inOut",
      onUpdate: () => {
        for (const p of [pathR, pathL]) {
          p.setAttribute("fill", "#fff");
          p.setAttribute("fill-opacity", String(fill.o));
          p.setAttribute("stroke-opacity", String(1 - fill.o));
        }
        setCounter(fill.p);
      },
      onComplete: () => {
        // source: oh(paths, logoD) + fill currentColor
        pathR.setAttribute("d", LOGO_PATH_R);
        pathL.setAttribute("d", LOGO_PATH_L);
        for (const p of [pathR, pathL]) {
          p.setAttribute("fill", "currentColor");
          p.removeAttribute("stroke");
          p.removeAttribute("stroke-width");
          p.removeAttribute("fill-opacity");
          p.removeAttribute("stroke-opacity");
          p.style.strokeDasharray = "";
          p.style.strokeDashoffset = "";
        }
      },
    },
    1.3,
  );

  // ========== class eh.showPlanes — grow at center (stagger 180, dur 1600) ==========
  // Source: only size grows; position stays viewport center. NO rotation.
  const planesT0 = 1.3 + 1.4; // after ah
  planes.forEach((el, i) => {
    const { w, h } = sizes[i];
    tl.to(
      el,
      {
        width: w,
        height: h,
        left: vw / 2,
        top: vh / 2,
        xPercent: -50,
        yPercent: -50,
        rotation: 0,
        duration: 1.6,
        ease: "power3.out",
      },
      planesT0 + i * 0.18,
    );
  });

  const afterGrow = planesT0 + Math.max(0, n - 1) * 0.18 + 1.6;
  const prog = { p: 50 };
  tl.to(
    prog,
    {
      p: 85,
      duration: afterGrow - planesT0,
      ease: "none",
      onUpdate: () => setCounter(prog.p),
    },
    planesT0,
  );

  // ========== class eh q=1 — center → under-logo stack (1200ms) ==========
  // Source: linear lerp of x,y only. NO spin.
  planes.forEach((el, i) => {
    const u = under[i];
    tl.to(
      el,
      {
        left: u.left,
        top: u.top,
        width: u.w,
        height: u.h,
        xPercent: -50,
        yPercent: -50,
        rotation: 0,
        duration: 1.2,
        ease: "power3.inOut",
      },
      afterGrow,
    );
  });

  const afterUnder = afterGrow + 1.2;

  // ========== class eh.tBg + L_ — bg white, counter exits ==========
  tl.to(
    preloaderBg,
    { backgroundColor: "#ffffff", duration: 0.3, ease: "power2.out" },
    afterUnder,
  );
  if (pctEl) {
    tl.to(
      pctEl,
      { y: -40, opacity: 0, duration: 0.3, ease: "power2.in" },
      afterUnder,
    );
  }

  // ========== class eh.spread — logo is-spread, planes → final then fade ==========
  // Source: planes lerp to final gallery targets over 1600ms while gallery chrome boots.
  // DOM: hold stack, open logo, fade stack, reveal real gallery (no invent fan/rotate).
  tl.add(() => {
    logo.classList.remove("is-intro");
    logo.classList.add("is-on", "is-spread");
    setCounter(100);
    if (prgBar) prgBar.style.transform = "translateX(0%)";
  }, afterUnder + 0.1);

  // Opacity-only fade of intro planes (source hands off to live GL planes)
  tl.to(
    planes,
    {
      opacity: 0,
      duration: 1.0,
      ease: "power2.inOut",
      stagger: 0.04,
    },
    afterUnder + 0.25,
  );

  tl.to(
    preloader,
    { autoAlpha: 0, duration: 0.35, ease: "power2.out" },
    afterUnder + 1.0,
  );

  return () => {
    tl.kill();
  };
}
