// Lab-only: draws each test grapheme's mask, traced strokes and re-drawn tube side by side.
import { type SkeletonDebug, skeletonise, weigh } from "./skeleton";

const FAMILY = '"Nunito", ui-rounded, system-ui, sans-serif';
const WEIGHT = 1000;

const SETS: Record<string, string> = {
  latin: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  punct: "!?.,:;'\"-_()[]{}/\\@#$%&*+=<>~^|`",
  latin1: "ÀÉÎÕÜÇÑßæøåœ€£¥©®°±§¶",
  greek: "ΑΒΓΔΘΛΞΠΣΦΨΩαβγδλπσφψω",
  cyrillic: "АБВГДЖЗИЛФЦЧШЩЫЭЮЯжщ",
  other: "عربيअआकखगघ한글漢字鬱あア★♥✓→∞≈√",
  emoji: "😀🎉👍🏽🇨🇦❤️",
};

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
const CELL = 150;

function drawCell(ctx: CanvasRenderingContext2D, g: string, x0: number, y0: number) {
  let dbg: SkeletonDebug | null = null;
  const t0 = performance.now();
  const sk = skeletonise(g, { family: FAMILY, weight: WEIGHT, resolution: 160 }, (d) => (dbg = d));
  const pen = Number(new URLSearchParams(location.search).get("pen") ?? 1);
  const shown = weigh(sk, pen, pen > 1 ? 0.085 : 0);
  const ms = performance.now() - t0;
  if (!dbg) return;
  const { raster, thinned } = dbg as SkeletonDebug;
  const half = CELL / 2;
  // Left half: mask + thinned pixels + strokes, scaled to fit.
  const s = Math.min((half - 8) / raster.w, (CELL - 28) / raster.h);
  const img = ctx.createImageData(raster.w, raster.h);
  for (let i = 0; i < raster.mask.length; i++) {
    const v = thinned[i] ? [220, 40, 40, 255] : raster.mask[i] ? [205, 208, 214, 255] : [0, 0, 0, 0];
    img.data.set(v, i * 4);
  }
  const off = document.createElement("canvas");
  off.width = raster.w;
  off.height = raster.h;
  off.getContext("2d")?.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(off, x0 + 4, y0 + 4, raster.w * s, raster.h * s);
  const em = 160 * s;
  const ox = x0 + 4 + raster.originX * s;
  const oy = y0 + 4 + raster.originY * s;
  const colors = ["#1f6feb", "#0a8f4a", "#b35c00", "#8a3ffc", "#d6336c", "#0c8599"];
  sk.strokes.forEach((stroke, i) => {
    ctx.strokeStyle = colors[i % colors.length];
    ctx.fillStyle = colors[i % colors.length];
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    stroke.points.forEach((p, j) => (j ? ctx.lineTo(ox + p.x * em, oy + p.y * em) : ctx.moveTo(ox + p.x * em, oy + p.y * em)));
    if (stroke.closed) ctx.closePath();
    ctx.stroke();
    const first = stroke.points[0];
    ctx.beginPath();
    ctx.arc(ox + first.x * em, oy + first.y * em, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });
  // Right half: the tube re-drawn with the derived (and optionally fattened) pen radius.
  const bw = shown.bounds.maxX - shown.bounds.minX;
  const bh = shown.bounds.maxY - shown.bounds.minY;
  const t = Math.min((half - 8) / bw, (CELL - 28) / bh);
  const tx = x0 + half + 4 - shown.bounds.minX * t;
  const ty = y0 + 4 - shown.bounds.minY * t;
  ctx.strokeStyle = "#000";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const stroke of shown.strokes) {
    ctx.lineWidth = stroke.radius * 2 * t;
    ctx.beginPath();
    stroke.points.forEach((p, j) => (j ? ctx.lineTo(tx + p.x * t, ty + p.y * t) : ctx.moveTo(tx + p.x * t, ty + p.y * t)));
    if (stroke.points.length === 1) ctx.lineTo(tx + stroke.points[0].x * t + 0.01, ty + stroke.points[0].y * t);
    if (stroke.closed) ctx.closePath();
    ctx.stroke();
  }
  ctx.fillStyle = "#55575b";
  ctx.font = "11px ui-monospace, monospace";
  ctx.fillText(`${sk.strokes.length}s r${sk.radius.toFixed(3)} x${(shown.radius / sk.radius).toFixed(2)} ${ms.toFixed(1)}ms`, x0 + 4, y0 + CELL - 6);
}

export async function runInspector(root: HTMLElement) {
  await document.fonts.load(`${WEIGHT} 160px Nunito`, "Aa");
  const names = (new URLSearchParams(location.search).get("sets") ?? Object.keys(SETS).join(",")).split(",");
  for (const name of names) {
    const graphemes = [...segmenter.segment(SETS[name] ?? name)].map((s) => s.segment);
    const cols = Math.min(10, graphemes.length);
    const rows = Math.ceil(graphemes.length / cols);
    const title = document.createElement("h3");
    title.textContent = name;
    title.style.cssText = "font:600 13px ui-monospace,monospace;margin:18px 0 6px";
    const canvas = document.createElement("canvas");
    canvas.width = cols * CELL;
    canvas.height = rows * CELL;
    canvas.style.cssText = `width:${cols * CELL}px;height:${rows * CELL}px;background:#f4f5f7`;
    root.append(title, canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;
    ctx.strokeStyle = "#e1e3e8";
    for (let i = 0; i < graphemes.length; i++) {
      const x = (i % cols) * CELL;
      const y = Math.floor(i / cols) * CELL;
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#e1e3e8";
      ctx.strokeRect(x + 0.5, y + 0.5, CELL - 1, CELL - 1);
      drawCell(ctx, graphemes[i], x, y);
      ctx.restore();
    }
  }
}
