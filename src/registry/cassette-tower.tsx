"use client";

import type { CSSProperties } from "react";

const RUNTIME = "https://ui.aryank.space/assets/cassette-tower/index.js";
const IMAGES =
  "https://zs4kp2p2okhfnarl.public.blob.vercel-storage.com/award-list";

export interface CassetteProject {
  name: string;
  client: string;
  year: string;
  url: string;
  /** Read with fetch() inside the frame, so cross-origin hosts need CORS. */
  image: string;
}

const defaultProjects: CassetteProject[] = [
  "Field Atlas",
  "Signal Concept",
  "Registry 24",
  "Night Form",
  "Prism Study",
  "Soft Protocol",
  "Orbit Desk",
  "Teaching Grid",
  "Studio Notes",
  "Emulsion",
  "Glyph Press",
  "Black Frame",
  "Salience",
  "Modernist Trace",
  "Bioform",
  "Velocity",
  "Atmos",
].map((name, i) => ({
  name,
  client: "BLANK",
  year: "2026",
  url: "https://aryank.space",
  image: `${IMAGES}/img${i + 1}.jpg`,
}));

// Source stylesheet with the Inter @font-face removed and the wordmark styled.
const css = `*,:before,:after{box-sizing:border-box}html,body{background:#000;width:100%;height:100%;margin:0;overflow:hidden}body{color:#f2f2f2;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;font-size:14px}.title{clip-path:inset(50%);white-space:nowrap;width:1px;height:1px;position:absolute;overflow:hidden}.canvas{cursor:none;opacity:0;touch-action:none;width:100%;height:100%;transition:opacity 1.2s;display:block;position:fixed;inset:0}.is-ready .canvas{opacity:1}@media (prefers-reduced-motion:reduce){.canvas{transition-duration:.3s}}.tracker{pointer-events:none;z-index:1;width:100%;height:100%;position:fixed;inset:0}.projects{clip-path:inset(50%);white-space:nowrap;width:1px;height:1px;position:absolute;overflow:hidden}.projects:focus-within{clip-path:none;pointer-events:auto;z-index:2;width:min(420px,100% - 48px);height:286px;position:fixed;top:50%;left:24px;overflow:clip;transform:translateY(-50%);mask-image:linear-gradient(#0000,#000 28% 72%,#0000)}.projects ul{transform:translateY(calc(132px - var(--active,0) * 22px));margin:0;padding:0;list-style:none;transition:transform .6s cubic-bezier(.19,1,.22,1)}@media (prefers-reduced-motion:reduce){.projects ul{transition-duration:10ms}}.projects li{letter-spacing:-.2px;height:22px;opacity:calc(.5 - var(--distance,6) * .07);font-size:14px;line-height:22px;transition:opacity .4s}@media (prefers-reduced-motion:reduce){.projects li{transition-duration:10ms}}.projects .is-active{opacity:1}.projects a{color:inherit;text-decoration:none;display:inline-block;position:relative}.projects a:after{content:"";transform-origin:100%;background:currentColor;height:1px;transition:transform .6s cubic-bezier(.19,1,.22,1);position:absolute;bottom:1px;left:0;right:0;transform:scaleX(0)}@media (prefers-reduced-motion:reduce){.projects a:after{transition-duration:10ms}}.projects a:focus,.projects a:focus-visible{outline:none}.projects a:focus:after{transform-origin:0;transform:scaleX(1)}.projects__details{color:#f2f2f273}.chrome{opacity:.01;pointer-events:none;z-index:2;grid-template-rows:auto 1fr auto;grid-template-columns:1fr auto;padding:24px;transition:opacity 1.2s .6s;display:grid;position:fixed;inset:0}.is-ready .chrome,.is-unsupported .chrome{opacity:1}.chrome a,.chrome button{pointer-events:auto}.chrome>a{color:inherit;text-decoration:none}.chrome>a:focus-visible{outline-offset:6px;outline:1px solid}@media (width<=640px){.chrome{padding:16px}}@media (prefers-reduced-motion:reduce){.chrome{transition-duration:.3s}}.logo{grid-area:1/1;place-self:start;height:22px;display:block}.logo img{width:auto;height:100%;display:block}.contact{letter-spacing:-.2px;grid-area:1/2;place-self:start end;gap:16px;font-size:14px;line-height:22px;display:flex}@media (width<=640px){.contact{font-size:13px}}.downloads{margin:0}@media (width<=1024px){.downloads{display:none}}.link{color:inherit;text-decoration:none;position:relative}.link:after{content:"";transform-origin:100%;background:currentColor;height:1px;transition:transform .6s cubic-bezier(.19,1,.22,1);position:absolute;bottom:0;left:0;right:0;transform:scaleX(0)}.link:hover:after,.link:focus-visible:after{transform-origin:0;transform:scaleX(1)}.link:focus-visible{outline:none}.copy{letter-spacing:-.2px;text-wrap:balance;grid-area:3/1;align-self:end;max-width:400px;margin:0;font-size:14px;line-height:20px}@media (width<=640px){.copy{max-width:325px;font-size:13px}}.sound{appearance:none;color:inherit;cursor:pointer;background:0 0;border:0;grid-area:3/2;justify-content:center;place-self:end;align-items:center;width:28px;height:28px;margin:-6px;padding:0;display:flex}.sound:focus-visible{outline-offset:2px;outline:1px solid}.bars{align-items:flex-end;gap:2px;height:12px;display:flex}.bars span{transform-origin:bottom;background:currentColor;width:2px;height:100%;transition:transform .4s;transform:scaleY(.2)}[aria-pressed=true] .bars span{animation:.9s ease-in-out infinite alternate bars}[aria-pressed=true] .bars span:nth-child(2){animation-delay:-.45s}[aria-pressed=true] .bars span:nth-child(3){animation-delay:-.2s}[aria-pressed=true] .bars span:nth-child(4){animation-delay:-.7s}@media (prefers-reduced-motion:reduce){[aria-pressed=true] .bars span{animation:none;transform:scaleY(.7)}}@keyframes bars{0%{transform:scaleY(.2)}to{transform:scaleY(1)}}.is-unsupported:after{content:"This experience needs WebGPU.";position:fixed;top:50%;left:50%;transform:translate(-50%,-50%)}
.chrome .logo{font:800 22px/1 Arial,sans-serif;letter-spacing:-1.5px}.chrome .copy{max-width:400px}`;

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"]/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char] ?? char,
  );

function documentMarkup(projects: CassetteProject[], label: string) {
  const links = projects
    .map(
      (p, i) =>
        `<li><a href="${escapeHtml(p.url)}" data-index="${i}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.name)}<span class="projects__details">, ${escapeHtml(p.client)}, ${escapeHtml(p.year)}</span></a></li>`,
    )
    .join("");
  // The runtime builds one cassette per entry and paints the label on each shell.
  const config = JSON.stringify({
    label,
    projects: projects.map((p, i) => ({
      id: `project-${i + 1}`,
      slug: `project-${i + 1}`,
      name: p.name,
      client: p.client,
      date: `${p.year}-01-01`,
      url: p.url,
      image: p.image,
    })),
  }).replace(/</g, "\\u003c");

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cassette tower</title><style>${css}</style></head><body><h1 class="title">${escapeHtml(label)} selected work</h1><div class="chrome"><a class="logo" href="https://aryank.space" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a><nav class="projects" aria-label="Projects"><ul>${links}</ul></nav><div class="contact"><a class="link" href="https://aryank.space" target="_blank" rel="noopener noreferrer">aryank.space</a></div><p class="copy">A design &amp; engineering practice for interface builders.</p><button class="sound" type="button" data-sound aria-pressed="false" aria-label="Turn sound on"><span class="bars" aria-hidden="true"><span></span><span></span><span></span><span></span></span></button></div><script>window.__CASSETTE_CONFIG__=${config};</script><script type="module" src="${RUNTIME}"></script></body></html>`;
}

export interface CassetteTowerProps {
  /** One cassette per project. Defaults to 17 BLANK projects. */
  projects?: CassetteProject[];
  /** Printed on every cassette label and used as the wordmark. */
  label?: string;
  /** The frame fills its parent. Give the parent an explicit height. */
  className?: string;
  style?: CSSProperties;
  title?: string;
}

/**
 * The bizar.ro WebGPU cassette tower in an isolated document. The runtime owns
 * window listeners and global element lookups, so it stays inside an iframe.
 */
export default function CassetteTower({
  projects = defaultProjects,
  label = "BLANK",
  className,
  style,
  title = "Cassette tower",
}: CassetteTowerProps) {
  return (
    <iframe
      title={title}
      className={className}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        border: 0,
        background: "#000",
        ...style,
      }}
      sandbox="allow-scripts allow-popups"
      allow="webgpu"
      srcDoc={documentMarkup(projects, label)}
    />
  );
}
