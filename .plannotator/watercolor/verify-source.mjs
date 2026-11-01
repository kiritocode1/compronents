import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as shaders from '../../src/registry/watercolor/shaders.ts';
import { DEFAULT_SETTINGS, DEFAULT_HUE } from '../../src/registry/watercolor/settings.ts';
const bundle = readFileSync(new URL('./reference/assets/index-2ZPewFcs.js', import.meta.url), 'utf8');
const names = {r:'RENDER',O:'ADVECT_PAINT',k:'ADVECT_VELOCITY',A:'CURL',ee:'DIVERGENCE',te:'PAPER',ne:'PRESSURE',re:'PROJECT',ie:'SETTLE',j:'SPREAD'};
let count = 0;
for (const match of bundle.matchAll(/(?:^|[,;{(\s])([A-Za-z_$][\w$]*)\s*=\x60(struct Frame \{[\s\S]*?)\x60/g)) {
 assert.equal(shaders[names[match[1]]], match[2], names[match[1]]); count++;
}
assert.equal(count,10);
const source = readFileSync(new URL('./reference/assets/Settings-DyGoQMeO.js', import.meta.url),'utf8');
const {t:original} = await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const {hue, rainbow:{isActive,...rainbow},...rest}=original;
assert.deepEqual(DEFAULT_SETTINGS,{...rest,rainbow});
assert.equal(DEFAULT_HUE,hue); assert.equal(isActive,true);
console.log('PASS: 10 byte-identical WGSL modules; all defaults equal pinned source.');
