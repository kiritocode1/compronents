import { getScrollParent } from "./scroll-adapter";

/** Staggered .reveal-on-scroll for every section, plus the intro line-split reveal. */
export function initReveals(root: HTMLElement): () => void {
  const ioRoot = getScrollParent(root);
  const cleanups: Array<() => void> = [];

  const io = new IntersectionObserver(
    (es) => {
      for (const e of es) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }
    },
    { root: ioRoot, threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
  );
  for (const el of Array.from(root.querySelectorAll<HTMLElement>(".reveal"))) {
    let i = 0;
    let s = el.previousElementSibling;
    while (s) {
      if (s.classList?.contains("reveal")) i++;
      s = s.previousElementSibling;
    }
    if (i) el.style.transitionDelay = `${i * 0.12}s`;
    io.observe(el);
  }
  cleanups.push(() => io.disconnect());

  const lead = root.querySelector<HTMLElement>(".intro .lead");
  if (lead) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      lead.classList.add("ready");
    } else {
      const orig = lead.innerHTML;
      let revealed = false;
      let rafId = 0;
      const split = (): boolean => {
        lead.innerHTML = orig;
        if (!lead.clientWidth) return false;
        type Tok = { t: string; em: boolean; sp: boolean };
        const toks: Tok[] = [];
        lead.childNodes.forEach((n) => {
          const em = n.nodeType === 1 && (n as Element).tagName === "EM";
          String(n.textContent)
            .split(/(\s+)/)
            .forEach((p) => {
              if (p.length) toks.push({ t: p, em, sp: /^\s+$/.test(p) });
            });
        });
        lead.textContent = "";
        const ws = toks.map((tk) => {
          const s = document.createElement("span");
          s.textContent = tk.t;
          if (tk.em) s.style.color = "var(--muted)";
          if (tk.sp) s.setAttribute("data-sp", "1");
          lead.appendChild(s);
          return s;
        });
        const lines: HTMLSpanElement[][] = [];
        let cur: HTMLSpanElement[] | null = null;
        let top: number | null = null;
        for (const s of ws) {
          if (s.getAttribute("data-sp") && top === null) continue;
          const tOff = s.offsetTop;
          if (top === null || Math.abs(tOff - top) > 2) {
            cur = [];
            lines.push(cur);
            top = tOff;
          }
          cur?.push(s);
        }
        lead.textContent = "";
        lines.forEach((arr, i) => {
          const ln = document.createElement("span");
          ln.className = "ln";
          const inner = document.createElement("span");
          inner.style.transitionDelay = `${i * 0.1}s`;
          for (const s of arr) {
            s.removeAttribute("data-sp");
            inner.appendChild(s);
          }
          ln.appendChild(inner);
          lead.appendChild(ln);
        });
        lead.classList.add("ready");
        if (revealed) lead.classList.add("in");
        return true;
      };
      const init = () => {
        if (!split()) {
          rafId = requestAnimationFrame(init);
          return;
        }
        const leadIo = new IntersectionObserver(
          (es) => {
            for (const e of es) {
              if (e.isIntersecting) {
                revealed = true;
                lead.classList.add("in");
              }
            }
          },
          { root: ioRoot, threshold: 0 },
        );
        leadIo.observe(lead);
        cleanups.push(() => leadIo.disconnect());
        let rt = 0;
        const onResize = () => {
          clearTimeout(rt);
          rt = window.setTimeout(() => {
            lead.classList.remove("in");
            split();
          }, 200);
        };
        window.addEventListener("resize", onResize);
        cleanups.push(() => {
          window.removeEventListener("resize", onResize);
          clearTimeout(rt);
        });
      };
      (document.fonts?.ready ?? Promise.resolve()).then(init);
      cleanups.push(() => cancelAnimationFrame(rafId));
    }
  }

  return () => {
    for (const c of cleanups) c();
  };
}
