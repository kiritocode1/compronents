import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./', import.meta.url));
const source = await readFile(`${root}reference/app.js`, 'utf8');
const css = await readFile(`${root}reference/index.css`, 'utf8');
const names = ['Field Atlas', 'Signal Concept', 'Registry 24', 'Night Form', 'Prism Study', 'Soft Protocol', 'Orbit Desk', 'Teaching Grid', 'Studio Notes', 'Emulsion', 'Glyph Press', 'Black Frame', 'Salience', 'Modernist Trace', 'Bioform', 'Velocity', 'Atmos'];
const projects = names.map((name, i) => ({ name, client: 'BLANK', date: '2026-01-01', id: `project-${i + 1}`, slug: `project-${i + 1}`, url: 'https://aryank.space', image: `https://zs4kp2p2okhfnarl.public.blob.vercel-storage.com/award-list/img${i + 1}.jpg` }));

function replaceOnce(text, before, after) {
  assert.equal(text.split(before).length, 2, `Expected one occurrence of ${before}`);
  return text.replace(before, after);
}

// Keep the renderer intact. Content and the bootstrap are the only substitutions.
let runtime = replaceOnce(source, 'Gi=Ui.map(e=>({...e,...Wi[e.id]}))', 'Gi=window.__CASSETTE_CONFIG__.projects');
runtime = replaceOnce(runtime, 'e.fillText(`SONY`,t,n)', 'e.fillText(window.__CASSETTE_CONFIG__.label,t,n)');
runtime = replaceOnce(runtime, 'new Pl().load().catch(Fl)', '(window.__cassetteTower=new Pl()).load().catch(Fl)');
runtime = runtime.replaceAll(' ↗', '');
await writeFile(`${root}runtime.js`, runtime);

function documentFor(script, config, manual = false) {
  const navigation = config.projects.map((p, i) => `<li><a href="${p.url}" data-index="${i}" target="_blank" rel="noopener noreferrer">${p.name}<span class="projects__details">, ${p.client}, ${p.date.slice(0,4)}</span></a></li>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cassette tower preview</title><style>${css.replace(/@font-face\{[^}]+\}/,'')}.chrome .logo{font:800 22px/1 Arial,sans-serif;letter-spacing:-1.5px}.chrome .copy{max-width:400px}</style></head><body><h1 class="title">BLANK selected work</h1><div class="chrome"><a class="logo" href="https://aryank.space" target="_blank" rel="noopener noreferrer">BLANK</a><nav class="projects" aria-label="Projects"><ul>${navigation}</ul></nav><div class="contact"><a class="link" href="https://aryank.space" target="_blank" rel="noopener noreferrer">aryank.space</a></div><p class="copy">A design &amp; engineering practice for interface builders.</p><button class="sound" type="button" data-sound aria-pressed="false" aria-label="Turn sound on"><span class="bars" aria-hidden="true"><span></span><span></span><span></span><span></span></span></button></div><script>window.__CASSETTE_CONFIG__=${JSON.stringify(config)};window.__manual=${manual};</script><script type="module" src="${script}"></script></body></html>`;
}

await writeFile(`${root}index.html`, documentFor('./runtime.js', { projects, label: 'BLANK' }));
await writeFile(`${root}projects.json`, JSON.stringify(projects, null, 2));
// Both controls use the same content so the authorized substitutions do not dominate the diff.
let control = replaceOnce(source, 'Gi=Ui.map(e=>({...e,...Wi[e.id]}))', 'Gi=window.__CASSETTE_CONFIG__.projects');
control = replaceOnce(control, 'e.fillText(`SONY`,t,n)', 'e.fillText(window.__CASSETTE_CONFIG__.label,t,n)');
control = replaceOnce(control, 'new Pl().load().catch(Fl)', '(window.__cassetteTower=new Pl()).load().catch(Fl)');
control = control.replaceAll(' ↗', '');
await writeFile(`${root}control.js`, control);
await writeFile(`${root}control.html`, documentFor('./control.js', { projects, label: 'BLANK' }, true));
console.log(`Preview ready: ${projects.length} projects, ${runtime.length} runtime characters.`);
