import { getScrollParent, onScroll, scrollTopOf } from "./scroll-adapter";

const TEAM = [
  { who: "Priya, Sam and Jules", place: "Toronto", lat: 43.65, lng: -79.38 },
  { who: "Marcus", place: "Austin", lat: 30.27, lng: -97.74 },
  { who: "Freya", place: "the UK", lat: 51.51, lng: -0.13 },
  { who: "Kagiso", place: "South Africa", lat: -26.2, lng: 28.04 },
  { who: "Lucia and Mateo", place: "Spain", lat: 40.42, lng: -3.7 },
  { who: "Nadia and Theo", place: "France", lat: 48.85, lng: 2.35 },
  { who: "Owen, Dara and Finn", place: "Dublin", lat: 53.35, lng: -6.26 },
  { who: "Renata", place: "Argentina", lat: -34.6, lng: -58.38 },
];

/** Smiley eye-tracking, button pixel-flicker hover, toplink reveal, W-logo spin, pxctl fade, nearest-teammate geoIP. */
export function initMiscUi(root: HTMLElement): () => void {
  const cleanups: Array<() => void> = [];
  const scrollEl = getScrollParent(root);

  initToplink();
  initPxctlFade();
  initSmileys();
  initButtonHover();
  initWLogoSpin();
  initNearestTeammate();

  function initToplink() {
    const tl = root.querySelector<HTMLElement>(".toplink");
    const hero = root.querySelector<HTMLElement>("#hero");
    if (!hero) return;
    const upd = () => {
      const on = scrollTopOf(scrollEl) > hero.offsetHeight * 0.55;
      tl?.classList.toggle("show", on);
    };
    cleanups.push(onScroll(scrollEl, upd));
    window.addEventListener("resize", upd);
    cleanups.push(() => window.removeEventListener("resize", upd));
    upd();
  }

  function initPxctlFade() {
    const px = root.querySelector<HTMLElement>(".pxctl");
    const ft = root.querySelector<HTMLElement>("footer");
    if (!px || !ft || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) px.classList.toggle("hide", e.isIntersecting);
      },
      { root: getScrollParent(root), rootMargin: "0px 0px 320px 0px" },
    );
    io.observe(ft);
    cleanups.push(() => io.disconnect());
  }

  function initSmileys() {
    const sm = Array.from(
      root.querySelectorAll<SVGSVGElement>(".two .c .smiley"),
    );
    if (!sm.length) return;
    const NS = "http://www.w3.org/2000/svg";
    const HEART = [
      [2, 1],
      [3, 1],
      [5, 1],
      [6, 1],
      [1, 2],
      [2, 2],
      [3, 2],
      [4, 2],
      [5, 2],
      [6, 2],
      [7, 2],
      [1, 3],
      [2, 3],
      [3, 3],
      [4, 3],
      [5, 3],
      [6, 3],
      [7, 3],
      [2, 4],
      [3, 4],
      [4, 4],
      [5, 4],
      [6, 4],
      [3, 5],
      [4, 5],
      [5, 5],
      [4, 6],
    ];
    const TOUCH = !matchMedia("(hover:hover) and (pointer:fine)").matches;
    function heartSVG() {
      const s = document.createElementNS(NS, "svg");
      s.setAttribute("viewBox", "0 0 9 7");
      s.setAttribute("width", "24");
      s.setAttribute("height", "19");
      for (const [x, y] of HEART) {
        const r = document.createElementNS(NS, "rect");
        r.setAttribute("x", String(x));
        r.setAttribute("y", String(y));
        r.setAttribute("width", "1.04");
        r.setAttribute("height", "1.04");
        r.setAttribute("fill", "#e0492a");
        s.appendChild(r);
      }
      return s;
    }
    const ptr = { x: -1, y: -1 };
    const onPtrMove = (e: PointerEvent) => {
      ptr.x = e.clientX;
      ptr.y = e.clientY;
    };
    window.addEventListener("pointermove", onPtrMove, { passive: true });
    cleanups.push(() => window.removeEventListener("pointermove", onPtrMove));

    type Face = {
      sv: SVGSVGElement;
      g: SVGGElement;
      eyeL: SVGRectElement;
      eyeR: SVGRectElement;
      blush: SVGRectElement[];
      mood: string | null;
      lx: number;
      ly: number;
      shy: boolean;
    };
    const faces: Face[] = sm.map((sv) => {
      const mood = sv.getAttribute("data-mood");
      const g = document.createElementNS(NS, "g") as SVGGElement;
      sv.appendChild(g);
      function rect(c: number, r: number) {
        const e = document.createElementNS(NS, "rect");
        e.setAttribute("x", String(c * 12));
        e.setAttribute("y", String(r * 12));
        e.setAttribute("width", "12");
        e.setAttribute("height", "12");
        e.setAttribute("fill", "#0a0a0a");
        g.appendChild(e);
        return e as SVGRectElement;
      }
      const eyeL = rect(4, 5);
      const eyeR = rect(8, 5);
      const blush: SVGRectElement[] = [];
      if (mood === "sad") {
        rect(5, 7);
        rect(6, 7);
        rect(7, 7);
        rect(4, 8);
        rect(8, 8);
        for (const [cx, cr] of [
          [3, 7],
          [9, 7],
        ]) {
          const e = document.createElementNS(NS, "rect");
          e.setAttribute("x", String(cx * 12));
          e.setAttribute("y", String(cr * 12));
          e.setAttribute("width", "12");
          e.setAttribute("height", "12");
          e.setAttribute("fill", "#e0492a");
          e.setAttribute("fill-opacity", "0");
          g.appendChild(e);
          blush.push(e as SVGRectElement);
        }
      } else {
        rect(4, 7);
        rect(8, 7);
        rect(5, 8);
        rect(6, 8);
        rect(7, 8);
      }
      return { sv, g, eyeL, eyeR, blush, mood, lx: 0, ly: 0, shy: false };
    });
    let rafId = 0;
    function loop() {
      if (!TOUCH && ptr.x >= 0) {
        for (const f of faces) {
          const r = f.sv.getBoundingClientRect();
          if (r.width > 1) {
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            const dx = ptr.x - cx;
            const dy = ptr.y - cy;
            const d = Math.hypot(dx, dy) || 1;
            let tx: number;
            let ty: number;
            if (f.shy) {
              tx = (-dx / d) * 7;
              ty = (-dy / d) * 7 + 2.5;
            } else {
              const m = Math.min(1, d / 420) * 5.5;
              tx = (dx / d) * m;
              ty = (dy / d) * m;
            }
            f.lx += (tx - f.lx) * 0.15;
            f.ly += (ty - f.ly) * 0.15;
            f.g.setAttribute(
              "transform",
              `translate(${f.lx.toFixed(2)},${f.ly.toFixed(2)})`,
            );
          }
        }
      }
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);
    cleanups.push(() => cancelAnimationFrame(rafId));

    const blinkTimers: number[] = [];
    function blink(f: Face) {
      f.eyeL.setAttribute("height", "2");
      f.eyeR.setAttribute("height", "2");
      f.eyeL.setAttribute("y", String(5 * 12 + 5));
      f.eyeR.setAttribute("y", String(5 * 12 + 5));
      blinkTimers.push(
        window.setTimeout(() => {
          f.eyeL.setAttribute("height", "12");
          f.eyeR.setAttribute("height", "12");
          f.eyeL.setAttribute("y", String(5 * 12));
          f.eyeR.setAttribute("y", String(5 * 12));
        }, 110),
      );
    }
    function scheduleBlink(f: Face) {
      blinkTimers.push(
        window.setTimeout(
          () => {
            blink(f);
            scheduleBlink(f);
          },
          2200 + Math.random() * 4200,
        ),
      );
    }
    for (const f of faces) scheduleBlink(f);
    cleanups.push(() => {
      for (const id of blinkTimers) clearTimeout(id);
    });

    function replay(sv: SVGSVGElement, cls: string) {
      sv.classList.remove(cls);
      void sv.getBoundingClientRect();
      sv.classList.add(cls);
    }
    function spawnHearts(f: Face) {
      const host = f.sv.parentNode as HTMLElement | null;
      if (!host) return;
      for (let i = 0; i < 4; i++) {
        blinkTimers.push(
          window.setTimeout(() => {
            const h = heartSVG();
            h.setAttribute("class", "sm-heart");
            h.style.left = `${38 + Math.random() * 52}%`;
            h.style.top = "6px";
            host.appendChild(h);
            blinkTimers.push(
              window.setTimeout(() => {
                h.remove();
              }, 1000),
            );
          }, i * 90),
        );
      }
    }
    const faceHandlers: Array<[SVGSVGElement, string, () => void]> = [];
    for (const f of faces) {
      if (TOUCH) continue;
      if (f.mood === "sad") {
        const enter = () => {
          f.shy = true;
          f.sv.classList.add("sm-shy");
          for (const e of f.blush) e.setAttribute("fill-opacity", ".5");
        };
        const leave = () => {
          f.shy = false;
          f.sv.classList.remove("sm-shy");
          for (const e of f.blush) e.setAttribute("fill-opacity", "0");
        };
        f.sv.addEventListener("mouseenter", enter);
        f.sv.addEventListener("mouseleave", leave);
        faceHandlers.push(
          [f.sv, "mouseenter", enter],
          [f.sv, "mouseleave", leave],
        );
      } else {
        let busy = false;
        const enter = () => {
          if (busy) return;
          busy = true;
          blinkTimers.push(
            window.setTimeout(() => {
              busy = false;
            }, 620),
          );
          replay(f.sv, "sm-jump");
          spawnHearts(f);
        };
        f.sv.addEventListener("mouseenter", enter);
        faceHandlers.push([f.sv, "mouseenter", enter]);
      }
    }
    cleanups.push(() => {
      for (const [el, type, handler] of faceHandlers)
        el.removeEventListener(type, handler);
    });
  }

  function initButtonHover() {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ACC = ["#d8ff00", "#f5c518", "#e0492a", "#0a0a0a"];
    const CELL = 9;
    const ros: ResizeObserver[] = [];
    function attach(b: HTMLElement) {
      if (!b || (b as HTMLElement & { __pxd?: boolean }).__pxd) return;
      (b as HTMLElement & { __pxd?: boolean }).__pxd = true;
      const lbl = document.createElement("span");
      lbl.className = "lbl";
      while (b.firstChild) lbl.appendChild(b.firstChild);
      const fx = document.createElement("span");
      fx.className = "pxfx";
      fx.setAttribute("aria-hidden", "true");
      b.appendChild(fx);
      b.appendChild(lbl);
      let cells: HTMLElement[] = [];
      function build() {
        fx.textContent = "";
        cells = [];
        const cols = Math.ceil(b.offsetWidth / CELL);
        const rows = Math.ceil(b.offsetHeight / CELL);
        fx.style.gridTemplateColumns = `repeat(${cols},${CELL}px)`;
        fx.style.gridAutoRows = `${CELL}px`;
        for (let i = 0; i < cols * rows; i++) {
          cells.push(fx.appendChild(document.createElement("i")));
        }
      }
      build();
      if (window.ResizeObserver) {
        const ro = new ResizeObserver(build);
        ro.observe(b);
        ros.push(ro);
      }
      if (reduce) return;
      let timer = 0;
      function tick() {
        for (const c of cells)
          c.style.background =
            Math.random() < 0.14
              ? ACC[(Math.random() * ACC.length) | 0]
              : "transparent";
      }
      function clear() {
        for (const c of cells) c.style.background = "transparent";
      }
      const enter = () => {
        if (timer) return;
        tick();
        timer = window.setInterval(tick, 130);
      };
      const leave = () => {
        clearInterval(timer);
        timer = 0;
        clear();
      };
      b.addEventListener("mouseenter", enter);
      b.addEventListener("mouseleave", leave);
      cleanups.push(() => {
        b.removeEventListener("mouseenter", enter);
        b.removeEventListener("mouseleave", leave);
        clearInterval(timer);
      });
    }
    (window as unknown as { __pxHover?: (el: HTMLElement) => void }).__pxHover =
      attach;
    for (const b of Array.from(
      root.querySelectorAll<HTMLElement>(".btn, .cta .ctabtn, .tt-teaser"),
    ))
      attach(b);
    cleanups.push(() => {
      for (const ro of ros) ro.disconnect();
    });
  }

  function initWLogoSpin() {
    const l = root.querySelector<HTMLElement>(".wlogo");
    if (!l) return;
    const id = window.setInterval(() => {
      l.classList.add("spin");
      window.setTimeout(() => l.classList.remove("spin"), 860);
    }, 10000);
    cleanups.push(() => clearInterval(id));
  }

  function initNearestTeammate() {
    const el = root.querySelector<HTMLElement>("#nearest");
    if (!el) return;
    function hav(a: number, b: number, c: number, d: number) {
      const R = 6371;
      const p = Math.PI / 180;
      const s = Math.sin(((c - a) * p) / 2);
      const t = Math.sin(((d - b) * p) / 2);
      const h = s * s + Math.cos(a * p) * Math.cos(c * p) * t * t;
      return 2 * R * Math.asin(Math.sqrt(h));
    }
    function show(lat: number, lng: number) {
      let best: (typeof TEAM)[number] | null = null;
      let bd = Number.POSITIVE_INFINITY;
      for (const person of TEAM) {
        const d = hav(lat, lng, person.lat, person.lng);
        if (d < bd) {
          bd = d;
          best = person;
        }
      }
      if (!best) return;
      const plural = best.who.includes(" and ");
      const dist =
        bd < 60
          ? "practically next door"
          : `about ${(bd < 1000 ? Math.round(bd / 10) * 10 : Math.round(bd / 100) * 100).toLocaleString()} km away`;
      el!.textContent = `The nearest teammate${plural ? "s are " : " is "}${best.who} in ${best.place}, ${dist}.`;
      el!.style.display = "";
    }
    const controller = new AbortController();
    fetch("https://ipwho.is/", { signal: controller.signal })
      .then(
        (r) => r.json() as Promise<{ latitude?: number; longitude?: number }>,
      )
      .then((j) => {
        if (
          j &&
          typeof j.latitude === "number" &&
          typeof j.longitude === "number"
        )
          show(j.latitude, j.longitude);
      })
      .catch(() => {});
    cleanups.push(() => controller.abort());
  }

  return () => {
    for (const c of cleanups) c();
  };
}
