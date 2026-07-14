/** Springy momentum drag carousels (iPhone-style rubber band), pixel-grid vertical snap, and the hover reveal-cta tell. */
export function initCarousels(root: HTMLElement): () => void {
  const cleanups: Array<() => void> = [];

  for (const sl of Array.from(
    root.querySelectorAll<HTMLElement>("[data-slider]"),
  )) {
    const track = sl.firstElementChild as HTMLElement;
    let x = 0;
    let vel = 0;
    let dragging = false;
    let lastX = 0;
    let lastT = 0;
    let maxX = 0;
    let raf = 0;
    let step = 0;
    let target: number | null = null;
    let prevB: HTMLButtonElement | null = null;
    let nextB: HTMLButtonElement | null = null;
    const SNAP = !!matchMedia("(pointer:coarse)").matches;
    let slSx = 0;
    let slMoved = false;
    let slDownA: HTMLAnchorElement | null = null;

    function bounds() {
      maxX = Math.min(0, sl.clientWidth - track.scrollWidth);
      const c = track.children;
      step =
        c.length > 1
          ? Math.abs(
              c[1].getBoundingClientRect().left -
                c[0].getBoundingClientRect().left,
            )
          : sl.clientWidth;
      if (!step) step = sl.clientWidth;
    }
    function snapX(px: number) {
      if (!step) return Math.max(maxX, Math.min(0, px));
      return Math.max(maxX, Math.min(0, Math.round(px / step) * step));
    }
    bounds();
    const onResize = () => {
      bounds();
      clampSpring();
    };
    window.addEventListener("resize", onResize);
    cleanups.push(() => window.removeEventListener("resize", onResize));

    function apply() {
      track.style.transform = `translate3d(${x}px,0,0)`;
      if (prevB && nextB) {
        prevB.disabled = x >= -0.5;
        nextB.disabled = x <= maxX + 0.5;
      }
    }
    function clampSpring() {
      if (x > 0) x = 0;
      if (x < maxX) x = maxX;
      apply();
    }
    function run() {
      raf = 0;
      if (dragging) {
        apply();
        return;
      }
      if (target !== null) {
        x += (target - x) * 0.18;
        if (Math.abs(target - x) < 0.3) {
          x = target;
          target = null;
          apply();
          return;
        }
        apply();
        raf = requestAnimationFrame(run);
        return;
      }
      x += vel;
      vel *= 0.94;
      if (x > 0) {
        x += (0 - x) * 0.18;
        vel *= 0.5;
      } else if (x < maxX) {
        x += (maxX - x) * 0.18;
        vel *= 0.5;
      }
      if (Math.abs(vel) > 0.06 || x > 0.5 || x < maxX - 0.5) {
        apply();
        raf = requestAnimationFrame(run);
      } else {
        x = Math.max(maxX, Math.min(0, Math.round(x / 14) * 14));
        vel = 0;
        apply();
      }
    }
    function kick() {
      if (!raf) raf = requestAnimationFrame(run);
    }
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault();
      dragging = true;
      sl.classList.add("drag");
      cancelAnimationFrame(raf);
      raf = 0;
      lastX = e.clientX;
      lastT = performance.now();
      vel = 0;
      target = null;
      slSx = e.clientX;
      slMoved = false;
      slDownA = (e.target as Element).closest?.(
        "a.slide",
      ) as HTMLAnchorElement | null;
      try {
        sl.setPointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const now = performance.now();
      const dt = now - lastT || 16;
      if (Math.abs(e.clientX - slSx) > 5) slMoved = true;
      let nx = x + dx;
      if (nx > 0) nx = x + dx * 0.35;
      else if (nx < maxX) nx = x + dx * 0.35;
      x = nx;
      vel = (dx / dt) * 16;
      lastX = e.clientX;
      lastT = now;
      apply();
    };
    function up(nav: boolean) {
      if (!dragging) return;
      dragging = false;
      sl.classList.remove("drag");
      if (SNAP) {
        target = snapX(x + vel * 8);
        vel = 0;
      }
      kick();
      if (nav && !slMoved && slDownA) {
        const a = slDownA;
        const href = a.getAttribute("href");
        if (href && href !== "#") {
          if (a.getAttribute("target") === "_blank")
            window.open(a.href, "_blank", "noopener");
          else window.location.href = a.href;
        }
      }
      slDownA = null;
    }
    const onUp = () => up(true);
    const onCancel = () => up(false);
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
      vel = 0;
      x -= e.deltaX;
      clampSpring();
      e.preventDefault();
    };
    sl.addEventListener("pointerdown", onDown);
    sl.addEventListener("pointermove", onMove);
    sl.addEventListener("pointerup", onUp);
    sl.addEventListener("pointercancel", onCancel);
    sl.addEventListener("wheel", onWheel, { passive: false });
    cleanups.push(() => {
      sl.removeEventListener("pointerdown", onDown);
      sl.removeEventListener("pointermove", onMove);
      sl.removeEventListener("pointerup", onUp);
      sl.removeEventListener("pointercancel", onCancel);
      sl.removeEventListener("wheel", onWheel);
    });

    if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
      const mkArrow = (
        cls: string,
        label: string,
        left: boolean,
        sign: number,
      ) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = `sl-arrow ${cls}`;
        b.setAttribute("aria-label", label);
        b.innerHTML = left
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>';
        const stop = (e: Event) => e.stopPropagation();
        const click = (e: Event) => {
          e.preventDefault();
          target = snapX(x + sign * step);
          kick();
        };
        b.addEventListener("pointerdown", stop);
        b.addEventListener("click", click);
        sl.appendChild(b);
        cleanups.push(() => {
          b.removeEventListener("pointerdown", stop);
          b.removeEventListener("click", click);
          b.remove();
        });
        return b;
      };
      prevB = mkArrow("prev", "Previous slides", true, 1);
      nextB = mkArrow("next", "Next slides", false, -1);
      apply();
    }

    const linkClickHandlers: Array<[HTMLAnchorElement, (e: Event) => void]> =
      [];
    for (const a of Array.from(
      track.querySelectorAll<HTMLAnchorElement>("a.slide"),
    )) {
      const handler = (e: Event) => {
        if ((e as MouseEvent).detail !== 0) e.preventDefault();
      };
      a.addEventListener("click", handler);
      linkClickHandlers.push([a, handler]);
    }
    cleanups.push(() => {
      for (const [a, handler] of linkClickHandlers)
        a.removeEventListener("click", handler);
    });

    const ctaLabel = sl.closest("#lab") ? "View experiment" : "View case study";
    const addedTells: HTMLElement[] = [];
    for (const m of Array.from(
      track.querySelectorAll<HTMLElement>("a.slide.cs .csm"),
    )) {
      const c = document.createElement("span");
      c.className = "reveal-cta";
      m.appendChild(c);
      const clip = document.createElement("span");
      clip.className = "rc-clip";
      const inn = document.createElement("span");
      inn.className = "rc-i";
      inn.textContent = ctaLabel;
      clip.appendChild(inn);
      m.appendChild(clip);
      addedTells.push(c, clip);
    }
    cleanups.push(() => {
      for (const el of addedTells) el.remove();
    });

    (document.fonts?.ready ?? Promise.resolve()).then(() => bounds());
    requestAnimationFrame(() => bounds());
  }

  function snapV() {
    for (const tw of Array.from(
      root.querySelectorAll<HTMLElement>(".track-wrap"),
    )) {
      tw.style.transform = "none";
      const m = tw.querySelector(".slide .csm, .slide .pv");
      if (!m) continue;
      const top =
        m.getBoundingClientRect().top +
        (window.pageYOffset || document.documentElement.scrollTop || 0);
      let off = ((top % 14) + 14) % 14;
      if (off > 7) off -= 14;
      tw.style.transform = `translateY(${-off}px)`;
    }
  }
  window.addEventListener("resize", snapV);
  (document.fonts?.ready ?? Promise.resolve()).then(snapV);
  requestAnimationFrame(snapV);
  const t1 = window.setTimeout(snapV, 400);
  cleanups.push(() => {
    window.removeEventListener("resize", snapV);
    clearTimeout(t1);
  });

  return () => {
    for (const c of cleanups) c();
  };
}
