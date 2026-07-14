/**
 * Hovering a case-study tile crumbles its corners into chunky pixels sampled
 * live off the tile's own canvas. The source appended this overlay to
 * `document.body` with `position: fixed`; here it's appended to the
 * component's own content wrapper instead so it stays correctly bounded
 * whether the page renders full-bleed or inside the bounded studio panel.
 */
export function initHoverCrumble(root: HTMLElement): () => void {
  if (!matchMedia("(hover:hover) and (pointer:fine)").matches) {
    return () => {};
  }
  const host = root.querySelector<HTMLElement>(".pgs-content");
  const media = Array.from(
    root.querySelectorAll<HTMLCanvasElement>(".slide .csm canvas"),
  );
  if (!host || !media.length) return () => {};

  const cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  cv.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;z-index:5;pointer-events:none;";
  host.appendChild(cv);
  const ctx = cv.getContext("2d");
  const DPR = Math.min(devicePixelRatio || 1, 2);
  let W = 0;
  let H = 0;
  let target: HTMLCanvasElement | null = null;
  const off = document.createElement("canvas");
  const offc = off.getContext("2d", { willReadFrequently: true });

  function size() {
    const r = host!.getBoundingClientRect();
    W = r.width;
    H = r.height;
    cv.width = Math.round(W * DPR);
    cv.height = Math.round(H * DPR);
    ctx?.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  size();
  const ro = new ResizeObserver(size);
  ro.observe(host);

  const enterHandlers: Array<[HTMLElement, () => void, () => void]> = [];
  for (const m of media) {
    const h = (m.closest(".csm") as HTMLElement) ?? m;
    const enter = () => {
      target = m;
    };
    const leave = () => {
      if (target === m) target = null;
    };
    h.addEventListener("mouseenter", enter);
    h.addEventListener("mouseleave", leave);
    enterHandlers.push([h, enter, leave]);
  }
  function hsh(a: number) {
    const n = Math.sin(a) * 43758.5453;
    return n - Math.floor(n);
  }
  const BL = 14;
  let rafId = 0;
  function loop(ts: number) {
    if (!ctx) {
      rafId = requestAnimationFrame(loop);
      return;
    }
    ctx.clearRect(0, 0, W, H);
    if (target) {
      const hostBox = host!.getBoundingClientRect();
      const csm = (target.closest(".csm") as HTMLElement) ?? target;
      const r = csm.getBoundingClientRect();
      const mw = target.width;
      const mh = target.height;
      if (
        r.width > 0 &&
        r.bottom > 0 &&
        r.top < window.innerHeight &&
        mw &&
        mh
      ) {
        const cols = Math.floor(r.width / BL);
        const rows = Math.floor(r.height / BL);
        if (cols >= 2 && rows >= 2) {
          if (off.width !== cols || off.height !== rows) {
            off.width = cols;
            off.height = rows;
          }
          const sc = Math.max(r.width / mw, r.height / mh);
          const cw = r.width / sc;
          const ch = r.height / sc;
          try {
            offc?.drawImage(
              target,
              (mw - cw) / 2,
              (mh - ch) / 2,
              cw,
              ch,
              0,
              0,
              cols,
              rows,
            );
            const data = offc?.getImageData(0, 0, cols, rows).data;
            if (data) {
              const step = Math.floor((ts || 0) / 90);
              const reach = Math.min(cols, rows) * 0.62;
              const s = BL - 1;
              for (let j = 0; j < rows; j++) {
                for (let i = 0; i < cols; i++) {
                  const dcx = Math.min(i, cols - 1 - i);
                  const dcy = Math.min(j, rows - 1 - j);
                  const d = Math.sqrt(dcx * dcx + dcy * dcy);
                  let p = 1 - d / reach;
                  if (p <= 0) continue;
                  p *= p;
                  if (hsh(i * 12.9 + j * 78.2 + step * 3.1) > p) continue;
                  const k = (j * cols + i) * 4;
                  ctx.fillStyle = `rgb(${data[k]},${data[k + 1]},${data[k + 2]})`;
                  ctx.fillRect(
                    Math.round(r.left - hostBox.left) + i * BL,
                    Math.round(r.top - hostBox.top) + j * BL,
                    s,
                    s,
                  );
                }
              }
            }
          } catch {
            /* media not decoded yet */
          }
        }
      }
    }
    rafId = requestAnimationFrame(loop);
  }
  rafId = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(rafId);
    ro.disconnect();
    for (const [h, enter, leave] of enterHandlers) {
      h.removeEventListener("mouseenter", enter);
      h.removeEventListener("mouseleave", leave);
    }
    cv.remove();
  };
}
