#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const names = ["warped-gallery", "hover-bloom", "fluid-refraction"];
const [command = "help", name = "all"] = process.argv.slice(2);
const base = process.env.COMPONENTS_URL ?? "https://compronents.localhost:1355";
const output = resolve(".plannotator/framer-galleries");
mkdirSync(output, { recursive: true });
const browser = (session, ...args) =>
  execFileSync("agent-browser", ["--session", session, ...args], {
    encoding: "utf8",
    timeout: 45000,
  });
function evaluated(session, script) {
  const raw = browser(session, "eval", script).trim();
  const value = JSON.parse(raw);
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}
if (command === "help" || command === "--help") {
  console.log(
    `Framer component verification\n\nCommands:\n  check [all|${names.join("|")}]\n    Operate mounted desktop/mobile previews; verify canvas, input, overflow and browser errors.\n  bloom-parity\n    Replay one seeded press and 240 frames on the original and port, then compare pixels.\n\nEnvironment:\n  COMPONENTS_URL   Named app origin, defaults to ${base}\n\nArtifacts: ${output}\nRequires agent-browser, Python 3 and Pillow. Does not start or stop the shared app server.\n`,
  );
} else if (command === "check") {
  const selected = name === "all" ? names : [name];
  assert.ok(
    selected.every((n) => names.includes(n)),
    `Unknown component ${name}. Run --help.`,
  );
  const results = [];
  for (const item of selected) {
    const session = `compronents-verify-${item}`;
    try {
      browser(session, "open", `${base}/components/${item}/preview`);
      browser(session, "set", "viewport", "1280", "577");
      browser(
        session,
        "wait",
        "--fn",
        item === "hover-bloom"
          ? 'document.querySelector("canvas")?.width === 1280'
          : `document.querySelector('[data-${item}]')?.dataset.ready === "true"`,
      );
      const dimensions = evaluated(
        session,
        'JSON.stringify((()=>{const c=document.querySelector("canvas"),r=c.parentElement;return {width:c.width,height:c.height,overflow:r.getBoundingClientRect().right>innerWidth+0.5,documentOverflow:document.documentElement.scrollWidth>innerWidth};})())',
      );
      assert.equal(dimensions.overflow, false);
      browser(session, "snapshot", "-i");
      if (item === "warped-gallery") {
        const before = evaluated(
          session,
          'JSON.stringify(document.querySelector("[data-warped-gallery] a").style.transform)',
        );
        browser(session, "focus", "[data-warped-gallery]");
        browser(session, "press", "PageDown");
        browser(
          session,
          "wait",
          "--fn",
          `document.querySelector('[data-warped-gallery] a').style.transform !== ${JSON.stringify(before)}`,
        );
      } else if (item === "hover-bloom") {
        browser(session, "mouse", "move", "640", "500");
        browser(session, "mouse", "down");
        browser(session, "mouse", "up");
        browser(
          session,
          "wait",
          "--fn",
          '(() => { const c=document.querySelector("canvas"); const data=c.getContext("2d").getImageData(620,200,40,300).data; for(let i=0;i<data.length;i+=4) if(data[i+1]<180 && data[i+3]>0) return true; return false; })()',
        );
      } else {
        browser(session, "mouse", "move", "400", "300");
        browser(session, "mouse", "move", "650", "350");
      }
      browser(
        session,
        "screenshot",
        resolve(output, `${item}-interaction.png`),
      );
      browser(session, "set", "viewport", "390", "844");
      browser(
        session,
        "wait",
        "--fn",
        'document.querySelector("canvas")?.width === 390',
      );
      const mobile = evaluated(
        session,
        'JSON.stringify((()=>{const c=document.querySelector("canvas"),r=c.parentElement;return {width:c.width,height:c.height,overflow:r.getBoundingClientRect().right>innerWidth+0.5,documentOverflow:document.documentElement.scrollWidth>innerWidth};})())',
      );
      assert.equal(mobile.overflow, false);
      browser(session, "screenshot", resolve(output, `${item}-mobile.png`));
      const errors = browser(session, "errors").trim();
      assert.equal(errors, "", `${item} runtime errors: ${errors}`);
      results.push({
        name: item,
        url: `${base}/components/${item}/preview`,
        desktop: dimensions,
        mobile,
        runtimeErrors: [],
      });
    } finally {
      browser(session, "close");
    }
  }
  console.log(JSON.stringify(results, null, 2));
} else if (command === "bloom-parity") {
  const mobile = name === "mobile";
  const width = mobile ? 390 : 1280,
    height = mobile ? 844 : 577;
  const prefix = mobile ? "bloom-mobile" : "bloom";
  for (const [kind, url] of [
    ["source", "https://practical-assumptions-334944.framer.app/"],
    ["current", `${base}/components/hover-bloom/preview`],
  ]) {
    const session = `compronents-verify-bloom-${kind}`;
    try {
      browser(session, "set", "viewport", String(width), String(height));
      browser(session, "open", url);
      browser(
        session,
        "wait",
        "--fn",
        `document.querySelector("canvas")?.width === ${width}`,
      );
      const freeze = readFileSync(resolve(output, "freeze-frames.js"), "utf8");
      browser(
        session,
        "eval",
        `${freeze}\nconst root=document.querySelector('[aria-label="Hover Bloom canvas"]');root.dispatchEvent(new PointerEvent('pointerdown',{clientX:${width / 2},clientY:${height - 77},pointerType:'${mobile ? "touch" : "mouse"}',bubbles:true}));window.__stepFrames(240);`,
      );
      browser(session, "screenshot", resolve(output, `${prefix}-${kind}.png`));
    } finally {
      browser(session, "close");
    }
  }
  console.log(
    execFileSync(
      "python3",
      [
        "scripts/framer-screenshot-diff.py",
        resolve(output, `${prefix}-source.png`),
        resolve(output, `${prefix}-current.png`),
        ...(mobile ? ["--mobile"] : []),
        "--output",
        resolve(output, `${prefix}-diff`),
      ],
      { encoding: "utf8" },
    ),
  );
} else {
  throw new Error(`Unknown command ${command}. Run --help.`);
}
