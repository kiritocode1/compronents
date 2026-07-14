/**
 * The registry's FullscreenPreview / FullPageStudioShell own the real scroll
 * container (a `fixed inset-0 overflow-y-auto` div, or a bounded studio
 * panel) - the window itself never scrolls. Every place the source read
 * `window.scrollY` / `pageYOffset` / called `window.scrollTo` has to target
 * that ancestor instead.
 */

export function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  let current = node?.parentElement ?? null;
  while (current) {
    const style = getComputedStyle(current);
    if (/(auto|scroll)/.test(style.overflowY)) return current;
    current = current.parentElement;
  }
  return null;
}

export function scrollTopOf(el: HTMLElement | null): number {
  return el ? el.scrollTop : window.scrollY;
}

export function scrollHeightOf(el: HTMLElement | null): number {
  return el ? el.scrollHeight : document.documentElement.scrollHeight;
}

export function clientHeightOf(el: HTMLElement | null): number {
  return el ? el.clientHeight : window.innerHeight;
}

export function onScroll(el: HTMLElement | null, cb: () => void): () => void {
  const target: HTMLElement | Window = el ?? window;
  target.addEventListener("scroll", cb, { passive: true });
  return () => target.removeEventListener("scroll", cb);
}

export function scrollToY(el: HTMLElement | null, y: number): void {
  if (el) el.scrollTop = y;
  else window.scrollTo(0, y);
}
