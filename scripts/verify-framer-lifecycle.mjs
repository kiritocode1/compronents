#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, join, resolve } from "node:path";
import ts from "typescript";

if (process.argv.includes("--help")) {
  console.log(
    "Verify real WebGL renderer isolation, resize, settings update, replacement and disposal.\nCreates an isolated temporary public fixture, removes it afterwards.\nUsage: node scripts/verify-framer-lifecycle.mjs\nCOMPONENTS_URL defaults to https://compronents.localhost:1355.\nWrites .plannotator/framer-galleries/lifecycle.json. Does not test React prop reconciliation.",
  );
  process.exit(0);
}
const base = process.env.COMPONENTS_URL ?? "https://compronents.localhost:1355";
const directory = mkdtempSync(resolve("public/framer-qa-"));
const session = `compronents-lifecycle-${process.pid}`;
const output = resolve(".plannotator/framer-galleries");
mkdirSync(output, { recursive: true });
const browser = (...args) =>
  execFileSync("agent-browser", ["--session", session, ...args], {
    encoding: "utf8",
    timeout: 45000,
  });
try {
  for (const [component, prefix] of [
    ["warped-gallery", "gallery"],
    ["fluid-refraction", "fluid"],
  ]) {
    for (const file of ["renderer", "shaders"]) {
      const source = readFileSync(
        `src/registry/${component}/${file}.ts`,
        "utf8",
      );
      const compiled = ts.transpileModule(source, {
        compilerOptions: {
          target: ts.ScriptTarget.ES2022,
          module: ts.ModuleKind.ESNext,
        },
      }).outputText;
      writeFileSync(
        join(directory, `${prefix}-${file}.js`),
        compiled.replace('"./shaders"', `"./${prefix}-shaders.js"`),
      );
    }
  }
  writeFileSync(
    join(directory, "index.html"),
    `<!doctype html><meta charset="utf-8"><title>Isolated renderer lifecycle verification</title><style>body{margin:0;background:#111;display:flex;flex-wrap:wrap;gap:8px}section{position:relative;width:400px;height:240px;overflow:hidden}canvas{width:100%;height:100%}</style><script type="module" src="./fixture.js"></script>`,
  );
  writeFileSync(
    join(directory, "fixture.js"),
    `
const live=new Map();const rafs=new Set();const observers=new Set();
for(const Constructor of [WebGLRenderingContext,WebGL2RenderingContext]){
  for(const kind of ['Texture','Framebuffer','Program','Shader','Buffer']){
    const p=Constructor.prototype,create=p['create'+kind],remove=p['delete'+kind];
    if(!live.has(kind))live.set(kind,new Set());
    p['create'+kind]=function(...args){const value=create.apply(this,args);if(value)live.get(kind).add(value);return value};
    p['delete'+kind]=function(value){live.get(kind).delete(value);return remove.call(this,value)};
  }
}
const nativeRAF=requestAnimationFrame,nativeCancel=cancelAnimationFrame;
window.requestAnimationFrame=(callback)=>{const id=nativeRAF((time)=>{rafs.delete(id);callback(time)});rafs.add(id);return id};
window.cancelAnimationFrame=(id)=>{rafs.delete(id);nativeCancel(id)};
for(const name of ['ResizeObserver','IntersectionObserver']){
  const Original=window[name];window[name]=class extends Original{constructor(...args){super(...args);observers.add(this)}disconnect(){observers.delete(this);super.disconnect()}};
}
const snapshot=()=>({gpu:Object.fromEntries([...live].map(([key,set])=>[key,set.size])),pendingAnimationFrames:rafs.size,observers:observers.size});
const frame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
const frames=async(n)=>{for(let i=0;i<n;i++)await frame()};
const sample=document.createElement('canvas');sample.width=640;sample.height=400;const context=sample.getContext('2d');context.fillStyle='#be7237';context.fillRect(0,0,640,400);const image=sample.toDataURL();
const createRoot=(gallery)=>{const root=document.createElement('section');const canvas=document.createElement('canvas');root.append(canvas);document.body.append(root);if(!gallery)return{root,canvas};const veil=document.createElement('div');root.append(veil);const anchors=[0,1].map(i=>{const a=document.createElement('a');a.href='#project-'+i;root.append(a);return a});return{root,canvas,veil,anchors}};
const galleryModule=await import('./gallery-renderer.js'),fluidModule=await import('./fluid-renderer.js');
const projects=[{title:'First project',image},{title:'Second project',image}];
const gallerySettings={background:'#000000',titleColor:'#ffffff',showGrid:false,playVideos:false,mobileBreakpoint:649,scrollSensitivity:1};
const fluidSettings={refractionAmount:100,chromaticAberration:100,highlight:200,disappearSpeed:5.9,velocityDissipation:99,pressureDissipation:0,pressureIterations:50,curl:18,splatRadius:3,interactOnHover:true};
const g1=createRoot(true),g2=createRoot(true),f1=createRoot(false),f2=createRoot(false);
let gc1=galleryModule.createGalleryRenderer(g1.root,g1.canvas,g1.veil,g1.anchors,projects,gallerySettings);
const gc2=galleryModule.createGalleryRenderer(g2.root,g2.canvas,g2.veil,g2.anchors,projects,gallerySettings);
const fc1=fluidModule.createFluidRenderer(f1.root,f1.canvas,{image},fluidSettings),fc2=fluidModule.createFluidRenderer(f2.root,f2.canvas,{image},fluidSettings);
if(!gc1||!gc2||!fc1||!fc2)throw new Error('Required WebGL capabilities are unavailable.');
await frames(10);const initialized=snapshot();
const otherTransform=g2.anchors[0].style.transform;
g1.root.dispatchEvent(new WheelEvent('wheel',{deltaY:100,bubbles:true,cancelable:true}));await frames(5);
const isolated=g2.anchors[0].style.transform===otherTransform;
for(const item of [g1,g2,f1,f2]){item.root.style.width='300px';item.root.style.height='320px'}
await frames(5);const resized=[g1,g2,f1,f2].map(item=>({width:item.canvas.width,height:item.canvas.height}));
fc1.update({...fluidSettings,refractionAmount:25});await frames(2);
gc1.dispose();gc1=galleryModule.createGalleryRenderer(g1.root,g1.canvas,g1.veil,g1.anchors,[{title:'Replacement',image},{title:'Changed project',image}],{...gallerySettings,titleColor:'#ffeecc'});await frames(5);
gc1.dispose();gc2.dispose();fc1.dispose();fc2.dispose();
window.__lifecycle={scope:'real WebGL renderers, not React prop reconciliation',isolated,initialized,resized,disposed:snapshot()};
`,
  );
  browser("open", `${base}/${basename(directory)}/index.html`);
  browser("wait", "--fn", "!!window.__lifecycle");
  const result = JSON.parse(browser("eval", "window.__lifecycle"));
  assert.equal(result.isolated, true);
  assert.ok(
    result.resized.every((size) => size.width === 300 && size.height === 320),
  );
  assert.ok(Object.values(result.disposed.gpu).every((count) => count === 0));
  assert.equal(result.disposed.observers, 0);
  assert.equal(result.disposed.pendingAnimationFrames, 0);
  writeFileSync(
    join(output, "lifecycle.json"),
    `${JSON.stringify(result, null, 2)}\n`,
  );
  console.log(JSON.stringify(result, null, 2));
} finally {
  try {
    browser("close");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
