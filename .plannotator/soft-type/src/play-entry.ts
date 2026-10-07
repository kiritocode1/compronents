// Lab-only: mounts the controller full-bleed so the feel can be tested before any React wiring.
import { SoftTypeController } from "./controller";

const root = document.getElementById("stage");
if (root) {
  const params = new URLSearchParams(location.search);
  const controller = new SoftTypeController(root, {
    value: params.get("text") ?? "Soft type",
    fontFamily: '"Nunito", ui-rounded, system-ui, sans-serif',
    fontWeight: Number(params.get("weight") ?? 1000),
    theme: { ink: "#000", paper: "#fff" },
    squeeze: Number(params.get("squeeze") ?? 1.05),
    weight: Number(params.get("pen") ?? 1.2),
    breakWords: true,
    maxLength: 64,
    sound: true,
    ariaLabel: "Type to add letters",
  });
  Object.assign(window, { softType: controller });
  // Lab-only: invisible elements that track each letter, so scripted recordings can drag them.
  const proxies = document.createElement("div");
  proxies.style.cssText = "position:fixed;inset:0;pointer-events:none";
  document.body.append(proxies);
  const track = () => {
    // Lab-only peek at the controller's letters (the shipped controller keeps them private).
    const entries = (controller as unknown as { entries: { body: { cx: number; cy: number; leaving: boolean } | null }[] }).entries;
    const letters = entries.flatMap((e) => (e.body && !e.body.leaving ? [{ x: e.body.cx, y: e.body.cy }] : []));
    while (proxies.children.length < letters.length) {
      const el = document.createElement("div");
      el.style.cssText = "position:absolute;width:4px;height:4px;margin:-2px 0 0 -2px";
      proxies.append(el);
    }
    [...proxies.children].forEach((el, i) => {
      const letter = letters[i];
      if (!(el instanceof HTMLElement)) return;
      el.dataset.letter = letter ? String(i) : "";
      el.style.left = `${letter?.x ?? -10}px`;
      el.style.top = `${letter?.y ?? -10}px`;
    });
    requestAnimationFrame(track);
  };
  track();
  document.fonts.ready.then(() => document.body.setAttribute("data-ready", "1"));
}
