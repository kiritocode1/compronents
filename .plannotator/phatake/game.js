'use strict';
// An original game on the Pixel Plays engine (MIT, amirmushichge/pixel-plays): Diwali crackers on the BLANK Interfaces logo.

/* ---------- the slab: the logo as a destructible heightmap ---------- */
const KIND_STONE = 1, KIND_RANGOLI = 2, KIND_SLAB = 5;
const SL = 22, SD = 22 * 331 / 975, H0 = 1.3;          // length along x, depth along y, thickness
const X0 = -SL / 2, Y0 = -SD / 2;
const CELL = .1, GX = Math.ceil(SL / CELL), GY = Math.ceil(SD / CELL);
const height = new Float32Array(GX * GY), intact = new Uint8Array(GX * GY), soot = new Float32Array(GX * GY), dirt = new Uint8Array(GX * GY);
const MASK_RES = .025, MW = Math.ceil(SL / MASK_RES), MH = Math.ceil(SD / MASK_RES);
const maskSlab = new Uint8Array(MW * MH), maskLetter = new Uint8Array(MW * MH);
const isTop = new Uint8Array(W * H), topShadow = new Uint8Array(W * H);

function buildMask() {
  const c = document.createElement('canvas'); c.width = MW; c.height = MH;
  const g = c.getContext('2d');
  const sx = MW / 975, sy = MH / 331;
  g.setTransform(sx, 0, 0, sy, -337 * sx, -319 * sy);
  g.save(); g.transform(1, 0, 0, .779127617232, 0, 0);
  for (const [d, light] of window.BLANK_LOGO) { g.fillStyle = light ? '#fff' : '#000'; g.fill(new Path2D(d)); }
  g.restore();
  g.fillStyle = '#fff'; g.font = '800 90px Inter, Helvetica, Arial, sans-serif'; g.fillText('®', 1217, 480.72);
  const data = g.getImageData(0, 0, MW, MH).data;
  for (let i = 0; i < MW * MH; i++) {
    if (data[i * 4 + 3] < 128) continue;
    maskSlab[i] = 1;
    if (data[i * 4] > 127) maskLetter[i] = 1;
  }
}
function maskAt(x, y, m) {
  if (x < X0 || y < Y0) return 0;
  const mx = (x - X0) / MASK_RES | 0, my = (y - Y0) / MASK_RES | 0;
  return mx < MW && my < MH ? m[my * MW + mx] : 0;
}
function cellOf(x, y) {
  if (x < X0 || y < Y0) return -1;
  const gx = (x - X0) / CELL | 0, gy = (y - Y0) / CELL | 0;
  return gx < GX && gy < GY ? gy * GX + gx : -1;
}
const heightAt = (x, y) => { const c = cellOf(x, y); return c < 0 ? 0 : height[c]; };
const wasSlab = (x, y) => { const c = cellOf(x, y); return c >= 0 && intact[c] === 1; };
function resetSlab() {
  soot.fill(0); dirt.fill(0);
  for (let gy = 0; gy < GY; gy++) for (let gx = 0; gx < GX; gx++) {
    const inside = maskAt(X0 + (gx + .5) * CELL, Y0 + (gy + .5) * CELL, maskSlab);
    height[gy * GX + gx] = inside ? H0 : 0; intact[gy * GX + gx] = inside;
  }
  G.debris.length = 0;
  G.dirty = true;
}
// visit every cell whose centre is within r of (x, y), with a ragged edge so breaks never read as circles
function eachCell(x, y, r, fn) {
  const g0x = Math.max(0, (x - r - X0) / CELL | 0), g1x = Math.min(GX - 1, (x + r - X0) / CELL | 0);
  const g0y = Math.max(0, (y - r - Y0) / CELL | 0), g1y = Math.min(GY - 1, (y + r - Y0) / CELL | 0);
  for (let gy = g0y; gy <= g1y; gy++) for (let gx = g0x; gx <= g1x; gx++) {
    const cx = X0 + (gx + .5) * CELL, cy = Y0 + (gy + .5) * CELL;
    const d = Math.hypot(cx - x, cy - y) / (r * (.82 + noise(cx * 2.3 + x, cy * 2.3) * .36));
    if (d < 1) fn(gy * GX + gx, d, cx, cy);
  }
}
function addSoot(x, y, r, amount) {
  eachCell(x, y, r, (c, d) => { if (height[c] > 0) soot[c] = Math.min(1, soot[c] + amount * (1 - d * d)); });
  G.dirty = true;
}
function addCrater(x, y, r, depth) {
  eachCell(x, y, r, (c, d) => {
    if (height[c] <= 0) return;
    const h = Math.min(height[c], H0 - depth * (1 - d * d));
    height[c] = h < .3 ? 0 : h;                         // thin shards fall away: the slab chips
  });
  G.dirty = true;
}
function addDirt(x, y, r, kind, density) {
  eachCell(x, y, r, (c, d, cx, cy) => { if (height[c] > 0 && hash(cx * 7.1, cy * 3.3 + G.time) < density * (1 - d)) dirt[c] = kind; });
  G.dirty = true;
}

/* ---------- palette ---------- */
const packAll = list => list.map(c => rgb(...c));
const BLACK_T = packAll([[19, 19, 18], [24, 24, 22], [29, 28, 26], [34, 33, 30]]);
const CREAM_T = packAll([[212, 210, 200], [219, 217, 208], [226, 224, 216], [232, 230, 223]]);
const CORE_T = packAll([[170, 158, 140], [182, 170, 152], [193, 182, 164], [203, 193, 176]]);  // sandy concrete under the black coat
const SOOT_T = packAll([[30, 27, 27], [40, 36, 34], [52, 46, 42]]);
const ASH_T = packAll([[74, 69, 65], [88, 82, 76], [104, 97, 89]]);
const PAPER_C = [0, rgb(206, 62, 52), rgb(232, 186, 70), rgb(104, 98, 92)]; // red paper, gold foil, ash
const STONE_T = packAll([[214, 197, 162], [220, 204, 170], [226, 211, 178], [231, 217, 185]]);
const GROUT = rgb(196, 178, 142);
const SLAB_SIDE = [24, 23, 22], CORE_SIDE = [198, 186, 166];

/* ---------- ground: a sandstone aangan with a rangoli ---------- */
const HALF_X = 16.5, HALF_Y = 11;
const RC = { x: .4, y: 7.1, r: 1.9 };
const RANGOLI = {
  white: rgb(244, 240, 228), yellow: rgb(240, 192, 48), orange: rgb(232, 124, 40),
  magenta: rgb(196, 46, 118), indigo: rgb(72, 62, 148), green: rgb(62, 138, 86),
};
function rangoli(x, y, ix, iy) {
  const dx = x - RC.x, dy = y - RC.y, r = Math.hypot(dx, dy) / RC.r;
  if (r > 1) return 0;
  const a = Math.atan2(dy, dx), R = RANGOLI;
  let c;
  if (r > .9) c = Math.floor((a + Math.PI) / (Math.PI / 14)) % 2 ? R.white : R.green;
  else if (r > .8) c = R.orange;
  else if (r < .12) c = R.white;
  else if (r < .26) c = R.yellow;
  else {
    const petal = .42 + .36 * Math.pow(Math.abs(Math.cos(a * 4)), .7);
    c = r < petal ? (r < .5 ? R.yellow : R.magenta) : R.indigo;
  }
  if (hash(ix * 5, iy * 3) > .9) c = R.white;          // loose powder
  return c;
}
function groundColor(x, y, ix, iy, i) {
  const edge = Math.pow(Math.pow(Math.abs(x) / HALF_X, 4) + Math.pow(Math.abs(y) / HALF_Y, 4), .25) + (noise(x * 1.3, y * 1.3) - .5) * .1;
  if (edge > 1.04) return 0;
  if (edge > .94 && hash(ix, iy) < (edge - .94) / .1) return 0;
  if (edge > .87 + (noise(x * .7 + 3, y * .7) - .5) * .1) {
    kinds[i] = KIND_GRASS;
    const t = noise(x * .9, y * .9) * 1.15 + (hash(ix, iy) - .5) * .55 - .08;
    return rgb(...GRASS[clamp(Math.floor(t * 4.2), 0, 3)]);
  }
  const rg = rangoli(x, y, ix, iy);
  if (rg) { kinds[i] = KIND_RANGOLI; return rg; }
  kinds[i] = KIND_STONE;
  const T = 2.4, tx = Math.floor(x / T), ty = Math.floor(y / T);
  if (x / T - tx < .045 || y / T - ty < .045) return GROUT;
  const v = .5 + (hash(tx, ty) - .5) * .5 + (noise(x * 1.1, y * 1.1) - .5) * .35;
  return STONE_T[clamp(Math.floor(v * 4 + (bayerAt(ix, iy) - .5) * .6), 0, 3)];
}

/* ---------- baking ---------- */
const DIYAS = [];
for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283 + .3; DIYAS.push({ x: RC.x + Math.cos(a) * 2.45, y: RC.y + Math.sin(a) * 2.45 * .82 }); }
DIYAS.push({ x: -11.8, y: 4.4 }, { x: 11.9, y: -2.6 }, { x: 12.2, y: 3.2 });
const CLAY = [168, 94, 58], BOTTLE = [70, 128, 96], BURNT = [64, 48, 42];
const cache = { pix: new Uint32Array(W * H), zb: new Float32Array(W * H), kinds: new Uint8Array(W * H), gz: new Float32Array(W * H), ground: new Uint8Array(W * H) };
const staticCasts = [];
function castStatic(x, y, z, r) { staticCasts.push([x, y, z, r]); }

function bakeGround() {
  zb.fill(-1e9);
  pix.fill(rgb(255, 255, 255));
  for (let iy = 0; iy < H; iy++) for (let ix = 0; ix < W; ix++) {
    const g = unproject(ix + .5, iy + .5), i = iy * W + ix, c = groundColor(g.x, g.y, ix, iy, i);
    if (!c) continue;
    pix[i] = c; ground[i] = 1;
    zb[i] = (g.x + g.y) / R2 * COS;
  }
  growGrass();
  cache.gz.set(zb); cache.ground.set(ground);
  // props that never break: diyas, a neem by the back corner
  for (const d of DIYAS) { sphere(d.x, d.y, .02, .17, CLAY, 'solid'); castStatic(d.x, d.y, .1, .16); }
  growTree(-13.2, -6.4, .62, 260, 5);
  for (let k = 0; k <= 6; k++) castStatic(-13.2 + .03 * k, -6.4, k * .22, .2);
  cache.pix.set(pix); cache.zb.set(zb); cache.kinds.set(kinds);
}

const ST = .045;
function paintSlab() {
  isTop.fill(0);
  for (let a = X0; a < X0 + SL; a += ST) for (let b = Y0; b < Y0 + SD; b += ST) {
    const c = cellOf(a, b);
    if (c < 0) continue;
    const h = height[c];
    if (h <= 0) continue;
    // exposed walls facing the camera: +x (lower right) and +y (lower left)
    const nx = heightAt(a + ST, b), ny = heightAt(a, b + ST);
    if (nx < h) wall(a, b, nx, h, 1.2, h < H0 - .04 || nx > 0 || wasSlab(a + ST, b));
    if (ny < h) wall(a, b, ny, h, 2.3, h < H0 - .04 || ny > 0 || wasSlab(a, b + ST));
    const p = project(a, b, h), ix = p.sx | 0, iy = p.sy | 0;
    if (ix < 0 || iy < 0 || ix >= W || iy >= H) continue;
    const i = iy * W + ix;
    if (p.d <= zb[i]) continue;
    zb[i] = p.d; isTop[i] = 1; kinds[i] = KIND_SLAB;
    pix[i] = topColor(a, b, h, c, ix, iy);
  }
}
function wall(a, b, z0, z1, level, broken) {
  const ramp = rampOf(broken ? CORE_SIDE : SLAB_SIDE);
  for (let z = z0; z <= z1; z += ST) {
    const p = project(a, b, z), ix = p.sx | 0, iy = p.sy | 0;
    if (ix < 0 || iy < 0 || ix >= W || iy >= H) continue;
    const i = iy * W + ix;
    if (p.d <= zb[i]) continue;
    zb[i] = p.d; isTop[i] = 0; kinds[i] = KIND_SLAB;
    pix[i] = ramp[clamp(Math.floor(level + (noise(a * 2 + b, z * 9) - .5) * .9 + (bayerAt(ix, iy) - .5) * .5), 0, 4)];
  }
}
function topColor(x, y, h, c, ix, iy) {
  const bay = bayerAt(ix, iy);
  let tones, v, kind;
  if (h < H0 - .04) { kind = 2; tones = CORE_T; v = .2 + h / H0 * .6 + (noise(x * 3, y * 3) - .5) * .4; }
  else if (maskAt(x, y, maskLetter)) { kind = 1; tones = CREAM_T; v = .5 + (noise(x * 1.5, y * 1.5) - .5) * .5; }
  else { kind = 0; tones = BLACK_T; v = .5 + (noise(x * 1.2, y * 1.2) - .5) * .6; }
  let col = tones[clamp(Math.floor(v * 4 + (bay - .5) * .6), 0, 3)];
  const s = soot[c];
  if (s > 0) {
    // grain, not the Bayer matrix: soot is a smudge, and an ordered pattern reads as a checkerboard on black
    const sv = s * 1.15 + (noise(x * 4.5, y * 4.5) - .5) * .55, grain = hash(ix * 1.7, iy * 2.3);
    if (kind === 0) { if (sv * .55 > grain) col = ASH_T[clamp(Math.floor(sv * 3 + hash(ix, iy) * .6 - .4), 0, 2)]; }
    else if (sv * (kind === 2 ? .2 : 1) > grain) col = SOOT_T[clamp(Math.floor((1 - sv) * 3 + hash(ix, iy) * .7), 0, 2)];
  }
  // litter settles on the surface, not in the fresh break, so a crater keeps its clean cut-stone form
  const dk = kind === 2 ? 0 : dirt[c];
  if (dk && hash(ix * 3, iy * 7) < .5) col = PAPER_C[dk];
  return col;
}
function castSlab() {
  for (let gy = 0; gy < GY; gy += 2) for (let gx = 0; gx < GX; gx += 2) {
    const h = height[gy * GX + gx];
    if (h > 0) castShadow(X0 + (gx + .5) * CELL, Y0 + (gy + .5) * CELL, h, .15, 1, 0);
  }
}
function drawDebris() {
  for (const d of G.debris) {
    if (d.type === 'bottle') { capsule([d.x, d.y, d.z], [d.x, d.y, d.z + .32], .13, .09, () => BOTTLE, 'solid'); capsule([d.x, d.y, d.z + .32], [d.x, d.y, d.z + .5], .05, .05, () => BOTTLE, 'solid'); }
    else if (d.type === 'cone') capsule([d.x, d.y, d.z], [d.x, d.y, d.z + .3], .18, .07, () => BURNT, 'solid');
    else if (d.type === 'coil') sphere(d.x, d.y, d.z + .02, .12, BURNT, 'rough');
  }
}
function bakeSlab() {
  pix.set(cache.pix); zb.set(cache.zb); kinds.set(cache.kinds); groundZ.set(cache.gz); ground.set(cache.ground);
  shadowMask.fill(0);
  paintSlab();
  // the slab top is a floor for edges and kid shadows, but not ground: ground-plane shadows must not land on it
  for (let i = 0; i < W * H; i++) if (isTop[i]) { groundZ[i] = zb[i]; ground[i] = 0; }
  drawDebris();
  for (const [x, y, z, r] of staticCasts) castShadow(x, y, z, r);
  castSlab();
  for (const d of G.debris) castAt(d.x, d.y, d.z + .2, .14);
  bakeOcclusion();
  staticShadow.set(shadowMask);
  applyShadows(groundZ);
  applyTopShadows(groundZ);
  bakedPix.set(pix); bakedZ.set(zb);
  G.dirty = false; G.bakedAt = G.time;
  G.ruin = measureRuin();
}

/* shadows that land on the slab top instead of the ground plane */
function castAt(x, y, z, r, strength = 1) {
  const hp = heightAt(x, y);
  if (hp <= 0) return castShadow(x, y, z, r, strength, 0);
  const lift = Math.max(0, z - hp);
  const p = project(x + SHADOW_X * lift, y + SHADOW_Y * lift, hp);
  const rx = r * S * 1.05, ry = rx * SIN + 1;
  for (let iy = Math.max(0, p.sy - ry | 0); iy <= Math.min(H - 1, Math.ceil(p.sy + ry)); iy++)
    for (let ix = Math.max(0, p.sx - rx | 0); ix <= Math.min(W - 1, Math.ceil(p.sx + rx)); ix++) {
      const dx = (ix + .5 - p.sx) / rx, dy = (iy + .5 - p.sy) / ry;
      if (dx * dx + dy * dy > 1) continue;
      const i = iy * W + ix;
      if (topShadow[i] < strength) topShadow[i] = strength;
    }
}
function applyTopShadows(refZ) {
  for (let i = 0; i < W * H; i++) {
    const s = topShadow[i];
    if (!s) continue;
    topShadow[i] = 0;
    if (!isTop[i] || zb[i] !== refZ[i]) continue;
    if (s === 1) tint(i, .6, .58, .76); else tint(i, .42, .4, .6);
  }
}

/* ---------- score ---------- */
let slabCells = 0;
function countCells() {
  slabCells = 0;
  for (let gy = 0; gy < GY; gy++) for (let gx = 0; gx < GX; gx++) {
    if (maskAt(X0 + (gx + .5) * CELL, Y0 + (gy + .5) * CELL, maskSlab)) slabCells++;
  }
}
// how ruined the logo is: broken depth counts fully, soot on the letters fully, soot on black half, litter a little
function measureRuin() {
  let sum = 0;
  for (let gy = 0; gy < GY; gy++) for (let gx = 0; gx < GX; gx++) {
    const c = gy * GX + gx, x = X0 + (gx + .5) * CELL, y = Y0 + (gy + .5) * CELL;
    if (!maskAt(x, y, maskSlab)) continue;
    const broken = 1 - height[c] / H0;
    const sooted = soot[c] * (maskAt(x, y, maskLetter) ? 1 : .5);
    sum += Math.min(1, Math.max(broken, sooted) + (dirt[c] ? .15 : 0));
  }
  return Math.round(sum / slabCells * 100);
}

/* ---------- the children ---------- */
const OUTFITS = {
  meera: { kind: 'lehenga', skirt: [192, 44, 112], border: [232, 182, 62], top: [236, 168, 52], dupatta: [242, 132, 64], skin: [178, 122, 88], hair: [30, 22, 20] },
  arjun: { kind: 'kurta', kurta: [236, 146, 46], trim: [250, 214, 110], pajama: [238, 232, 216], skin: [158, 106, 76], hair: [26, 20, 18] },
  kabir: { kind: 'jacket', kurta: [236, 226, 204], jacket: [36, 112, 112], trim: [226, 180, 72], pajama: [236, 226, 204], skin: [170, 116, 84], hair: [34, 24, 20] },
};
const MOJARI = [150, 92, 44], JASMINE = [250, 248, 236], GOLD = [236, 196, 82];
const KID_SCALE = 1.25, WALK = 2.6, RUN = 3.6;
const kids = [
  { name: 'meera', x: -8.2, y: 1.1, yaw: .9, sparkler: true },
  { name: 'arjun', x: -5.4, y: 2.4, yaw: .6 },
  { name: 'kabir', x: 2.6, y: -.4, yaw: 1.3 },
].map(k => ({ ...k, home: { x: k.x, y: k.y }, z: H0, state: 'idle', t: 0, phase: 0, job: null, look: k.yaw, outfit: OUTFITS[k.name] }));

function kidPose(k) {
  const breathe = STILL ? 0 : Math.sin(G.time * 2 + k.x) * .015;
  const walking = k.state === 'go' || k.state === 'flee';
  const sw = walking ? Math.sin(k.phase) : 0;
  const p = { crouch: 0, lean: breathe, step: sw * (k.state === 'flee' ? .34 : .26), lift: walking ? Math.max(0, Math.cos(k.phase)) * .1 : 0,
    armR: -sw * .5, armL: sw * .5, bendR: .25, bendL: .25, ears: false, up: 0 };
  if (k.state === 'light') { p.crouch = Math.min(1, k.t / .25); p.lean = .35 * p.crouch; p.armR = 1.25; p.bendR = .1; }
  if (k.state === 'ears') { p.ears = true; p.crouch = .25; p.lean = -.06; }
  if (k.state === 'cheer') { const b = Math.abs(Math.sin(k.t * 9)); p.up = 1; p.armR = p.armL = 2.7 + b * .2; p.bendR = p.bendL = .1; p.lift = b * .12; }
  if (k.state === 'idle' && k.sparkler) { const a = G.time * 4.2; p.armR = 1.4 + Math.sin(a) * .5; p.bendR = .35 + Math.cos(a) * .25; }
  return p;
}
// a child about five heads tall, built from flat-banded capsules so it reads crisp against the dithered ground
function drawKid(k) {
  const o = k.outfit, p = kidPose(k), K = KID_SCALE;
  const fx = Math.cos(k.yaw), fy = Math.sin(k.yaw), sx = -fy, sy = fx, base = k.z + p.lift * K;
  const P = (a, b, c) => [k.x + (fx * a + sx * b) * K, k.y + (fy * a + sy * b) * K, c * K + base];
  const rel = z => (z - base) / K;
  const add = (a, b, r0, r1, col) => { capsule(a, b, r0 * K, r1 * K, typeof col === 'function' ? col : () => col, 'solid'); G.bones.push(a, r0 * K, b, r1 * K); };
  const hipZ = .9 - p.crouch * .34, hipA = -p.crouch * .16;
  const shZ = hipZ + Math.cos(p.lean) * .6, shA = hipA + Math.sin(p.lean) * .6;
  const headZ = shZ + .3, headA = shA + Math.sin(p.lean) * .12, headR = .21;
  // legs: a hip, a knee and an ankle each, with the knee pushed forward by the crouch
  const leg = (side, step) => {
    const hip = P(hipA, side * .11, hipZ);
    const foot = P(step * .9 + p.crouch * .12, side * .13, .07 + Math.max(0, step) * .1);
    const knee = P((hipA + step * .9) / 2 + .06 + p.crouch * .32, side * .12, (hipZ + .07) / 2 + .04 - p.crouch * .05);
    return { hip, knee, foot };
  };
  const L = leg(1, -p.step), R = leg(-1, p.step);
  const shoe = f => add(f, [f[0] + fx * .14 * K, f[1] + fy * .14 * K, f[2]], .07, .06, MOJARI);
  if (o.kind === 'lehenga') {
    // the skirt hides the legs: a flared cone from the waist to the floor with a gold hem
    const hem = .08 + p.crouch * .02, flare = .4 + p.crouch * .14;
    const bands = z => { const r = rel(z); return r < hem + .13 ? o.border : r < hem + .2 ? o.skirt : r > hipZ - .14 ? o.border : o.skirt; };
    add(P(hipA, 0, hipZ), P(hipA + p.step * .1 + p.crouch * .1, 0, hem + .05), .17, flare, bands);
    shoe(L.foot); shoe(R.foot);
  } else {
    for (const g of [L, R]) {
      add(g.hip, g.knee, .1, .085, o.pajama); add(g.knee, g.foot, .085, .07, o.pajama); shoe(g.foot);
    }
    // kurta skirt to the knee, over the pajama
    add(P(hipA, 0, hipZ + .04), P(hipA + .03 + p.crouch * .16, 0, .46 + p.crouch * .02), .19, .245, o.kurta);
  }
  // torso and head
  const neck = P(shA, 0, shZ + .04), head = P(headA, 0, headZ);
  const torso = o.kind === 'lehenga' ? z => (rel(z) < hipZ + .12 ? o.skin : o.top) : o.kind === 'jacket' ? o.jacket : o.kurta;
  add(P(hipA, 0, hipZ), P(shA, 0, shZ - .02), .17, .2, torso);
  if (o.kind !== 'lehenga') add(P(hipA + .17, 0, hipZ + .08), P(shA + .19, 0, shZ - .04), .035, .035, o.trim);   // placket
  add(neck, head, .07, .07, o.skin);
  add(head, head, headR, headR, o.skin);
  const crown = [head[0] - fx * .05 * K, head[1] - fy * .05 * K, head[2] + .06 * K];
  add(crown, crown, headR * .9, headR * .9, o.hair);
  if (o.kind === 'lehenga') {
    add(P(headA - .17, 0, headZ - .06), P(shA - .24, 0, shZ - .42), .06, .045, o.hair);              // braid
    add(P(headA - .18, .08, headZ + .02), P(headA - .18, .08, headZ + .02), .05, .05, JASMINE);       // gajra
    add(P(shA + .05, -.2, shZ - .02), P(hipA + .14, .18, hipZ + .02), .055, .05, o.dupatta);          // dupatta across the chest
    add(P(shA - .1, -.21, shZ - .02), P(hipA - .14, -.22, hipZ - .28), .05, .06, o.dupatta);          // and its tail behind
  }
  // arms: angle 0 hangs down, 1.57 points forward, 3.14 points up
  const arm = (side, ang, bend) => ({
    sh: P(shA, side * .23, shZ - .03),
    el: P(shA + Math.sin(ang) * .28, side * (.26 + p.up * .02), shZ - .03 - Math.cos(ang) * .28),
    hd: P(shA + Math.sin(ang + bend) * .54, side * .27, shZ - .03 - Math.cos(ang + bend) * .54),
  });
  let A = arm(-1, p.armR, p.bendR), B = arm(1, p.armL, p.bendL);
  if (p.ears) {
    A = { sh: P(shA, -.23, shZ - .03), el: P(shA + .08, -.42, shZ + .02), hd: P(headA, -.2, headZ) };
    B = { sh: P(shA, .23, shZ - .03), el: P(shA + .08, .42, shZ + .02), hd: P(headA, .2, headZ) };
  }
  for (const g of [A, B]) {
    if (o.kind === 'lehenga') {
      add(g.sh, g.el, .075, .065, z => (rel(z) > shZ - .14 ? o.top : o.skin));
      add(g.el, g.hd, .06, .055, o.skin);
      const w = [lerp(g.el[0], g.hd[0], .8), lerp(g.el[1], g.hd[1], .8), lerp(g.el[2], g.hd[2], .8)];
      capsule(w, w, .06 * K, .06 * K, () => GOLD, 'solid');                                            // bangles
    } else { add(g.sh, g.el, .075, .065, o.kurta); add(g.el, g.hd, .06, .055, o.kurta); }
    add(g.hd, g.hd, .065, .065, o.skin);
  }
  // the thing in the hand: a sparkler while idle, an agarbatti while lighting
  const reach = len => P(shA + Math.sin(p.armR + p.bendR) * len, -.27, shZ - .03 - Math.cos(p.armR + p.bendR) * len);
  k.sparkTip = null; k.incense = null;
  if (k.state === 'idle' && k.sparkler) { k.sparkTip = reach(1.05); capsule(A.hd, k.sparkTip, .025, .02, () => [120, 116, 112], 'solid'); }
  if (k.state === 'go' || k.state === 'light') { k.incense = reach(.82); capsule(A.hd, k.incense, .02, .02, () => [96, 64, 44], 'solid'); }
}

/* ---------- crackers ---------- */
const TYPES = {
  bomb:   { label: 'sutli bomb', fuse: 1.5 },
  rocket: { label: 'rocket', fuse: 1.0 },
  anaar:  { label: 'anaar', fuse: .9 },
  chakri: { label: 'chakri', fuse: .8 },
  ladi:   { label: 'ladi', fuse: .7 },
};
const BAG = ['bomb', 'bomb', 'bomb', 'rocket', 'rocket', 'rocket', 'anaar', 'anaar', 'chakri', 'chakri', 'ladi', 'ladi'];
const TWINE = [184, 150, 100], ROCKET_RED = [196, 60, 50], STICK = [150, 118, 76], CHAKRI_A = [52, 140, 84], CHAKRI_B = [222, 70, 60], LADI = [206, 58, 50];
// where the lit fuse sits on each cracker, so the fuse sparks come from the right place
function fuseTip(c) {
  const { x, y, z } = c;
  if (c.type === 'bomb') return [x + .08, y - .04, z + .52];
  if (c.type === 'rocket') return [x, y, z + .8];
  if (c.type === 'anaar') return [x, y, z + .46];
  if (c.type === 'chakri') return [x + .2, y, z + .08];
  return [x, y, z + .08];
}
function drawCracker(c) {
  const { x, y, z } = c;
  if (c.type === 'bomb') {
    if (c.state === 'live') return;
    sphere(x, y, z + .2, .21, TWINE, 'rough');
    capsule([x, y, z + .38], [x + .08, y - .04, z + .52], .025, .02, () => [90, 80, 64], 'solid');
  } else if (c.type === 'rocket') {
    if (c.state !== 'live') {
      capsule([x, y, z], [x, y, z + .32], .13, .09, () => BOTTLE, 'solid');
      capsule([x, y, z + .32], [x, y, z + .5], .05, .05, () => BOTTLE, 'solid');
      capsule([x, y, z + .2], [x, y, z + 1.15], .02, .02, () => STICK, 'solid');
      capsule([x, y, z + .82], [x, y, z + 1.12], .07, .06, () => ROCKET_RED, 'solid');
    } else if (c.fly) {
      const f = c.fly, d = Math.hypot(f.vx, f.vy, f.vz) || 1;
      capsule([f.x - f.vx / d * .9, f.y - f.vy / d * .9, f.z - f.vz / d * .9], [f.x, f.y, f.z], .02, .02, () => STICK, 'solid');
      capsule([f.x - f.vx / d * .25, f.y - f.vy / d * .25, f.z - f.vz / d * .25], [f.x, f.y, f.z], .07, .06, () => ROCKET_RED, 'solid');
    }
  } else if (c.type === 'anaar') {
    capsule([x, y, z], [x, y, z + .42], .2, .07, () => (c.state === 'live' ? BURNT : CLAY), 'solid');
  } else if (c.type === 'chakri') {
    const spin = c.state === 'live' ? c.t * 40 : 0;
    for (let n = 0; n < 8; n++) {
      const a = spin + n / 8 * 6.283;
      sphere(c.x + Math.cos(a) * .17, c.y + Math.sin(a) * .17, c.z + .06, .06, n % 2 ? CHAKRI_A : CHAKRI_B, 'solid');
    }
  } else if (c.type === 'ladi') {
    for (let n = c.popped || 0; n < c.n; n++) {
      const px = x + c.dx * n * .32, py = y + c.dy * n * .32, pz = heightAt(px, py);
      if (pz <= 0 && n > 0) continue;
      capsule([px - c.dy * .1, py + c.dx * .1, pz + .05], [px + c.dy * .1, py - c.dx * .1, pz + .05], .045, .045, () => LADI, 'solid');
    }
  }
}

/* ---------- state ---------- */
const BEST_KEY = 'iso-pixel:phatake:best', CRACKERS = 12;
function readBest() { try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem(BEST_KEY, String(v)); } catch {} }
const G = { phase: 'play', time: 0, timer: 0, queue: [], left: CRACKERS, crackers: [], debris: [], parts: [], smoke: [], flashes: [], bones: [],
  dirty: true, bakedAt: 0, ruin: 0, best: readBest(), status: '' };
const nodes = {};
function setStatus() {}
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
function newRound() {
  G.queue = shuffle([...BAG]); G.left = CRACKERS; G.phase = 'play';
  G.crackers.length = 0; G.parts.length = 0; G.smoke.length = 0; G.flashes.length = 0;
  for (const k of kids) { k.x = k.home.x; k.y = k.home.y; k.state = 'idle'; k.job = null; k.yaw = k.look; }
  resetSlab(); bakeSlab();
  setStatus(`tap the logo to light a ${TYPES[G.queue[0]].label}`);

}

/* ---------- input ---------- */
// the nearest surface under a canvas pixel: walk down from the slab top until a cell is that tall
function pickSlab(sx, sy) {
  for (let z = H0; z >= .3; z -= .05) {
    const g = unproject(sx, sy + z * COS * S);
    const h = heightAt(g.x, g.y);
    if (h > 0 && h >= z - .06) return { x: g.x, y: g.y, z: h };
  }
  return null;
}
function randomSpot() {
  for (let n = 0; n < 200; n++) {
    const x = X0 + 1 + Math.random() * (SL - 2), y = Y0 + .6 + Math.random() * (SD - 1.2), h = heightAt(x, y);
    if (h > .6 && kids.every(k => Math.hypot(k.x - x, k.y - y) > 1)) return { x, y, z: h };
  }
  return null;
}
const onSlab = (x, y) => (heightAt(x, y) > .6 ? { x, y } : null);
function press(spot) {
  ensureAudio();
  if (G.phase === 'over') { if (G.timer > .8) newRound(); return; }
  if (!G.left) return;
  if (!spot) { setStatus('light it on the logo, not the floor'); return; }
  const free = kids.filter(k => k.state === 'idle');
  if (!free.length) { setStatus('all three are busy · wait for one to come back'); return; }
  const kid = free.reduce((a, b) => (Math.hypot(a.x - spot.x, a.y - spot.y) <= Math.hypot(b.x - spot.x, b.y - spot.y) ? a : b));
  const type = G.queue.shift();
  G.left--;
  const c = { type, x: spot.x, y: spot.y, z: spot.z, state: 'carried', t: 0 };
  if (type === 'ladi') { const a = Math.random() * 6.283; c.dx = Math.cos(a); c.dy = Math.sin(a); c.n = 9; c.popped = 0; }
  G.crackers.push(c);
  // stand a little short of the spot, on the side the child is coming from
  const d = Math.hypot(kid.x - spot.x, kid.y - spot.y) || 1;
  kid.job = c; kid.state = 'go'; kid.t = 0;
  kid.goal = onSlab(spot.x + (kid.x - spot.x) / d * .55, spot.y + (kid.y - spot.y) / d * .55) || { x: spot.x, y: spot.y };
  setStatus(`${kid.name} is taking a ${TYPES[type].label} over`);

}
function canvasPoint(e) {
  const r = canvas.getBoundingClientRect();
  return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H];
}
canvas.addEventListener('pointerdown', e => {
  canvas.focus({ preventScroll: true });
  const [sx, sy] = canvasPoint(e);
  press(pickSlab(sx, sy));
});
canvas.addEventListener('keydown', e => {
  if ((e.key !== ' ' && e.key !== 'Enter') || e.repeat) return;
  e.preventDefault();
  press(G.phase === 'over' ? null : randomSpot());
});

/* ---------- simulation ---------- */
function moveKid(k, goal, speed, dt) {
  const dx = goal.x - k.x, dy = goal.y - k.y, d = Math.hypot(dx, dy);
  if (d < .06) return true;
  const step = Math.min(d, speed * dt), nx = k.x + dx / d * step, ny = k.y + dy / d * step;
  k.yaw = Math.atan2(dy, dx);
  // stay on the slab: slide along an edge rather than step off it
  if (heightAt(nx, ny) > .3) { k.x = nx; k.y = ny; }
  else if (heightAt(nx, k.y) > .3) k.x = nx;
  else if (heightAt(k.x, ny) > .3) k.y = ny;
  else return true;
  k.phase += step * 7.5;
  return false;
}
function fleeSpot(k, c) {
  for (let n = 0; n < 16; n++) {
    const a = Math.atan2(k.y - c.y, k.x - c.x) + (n % 2 ? 1 : -1) * Math.floor((n + 1) / 2) * .4;
    for (const r of [2.8, 2.2, 1.7]) {
      const p = onSlab(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r);
      if (p && kids.every(o => o === k || Math.hypot(o.x - p.x, o.y - p.y) > .7)) return p;
    }
  }
  return { x: k.x, y: k.y };
}
function updateKids(dt) {
  for (const k of kids) {
    k.t += dt;
    const c = k.job;
    if (k.state === 'go') {
      if (moveKid(k, k.goal, WALK, dt)) { k.state = 'light'; k.t = 0; k.yaw = Math.atan2(c.y - k.y, c.x - k.x); c.state = 'placed'; c.z = heightAt(c.x, c.y) || c.z; }
    } else if (k.state === 'light') {
      if (k.t > .75) { c.state = 'fuse'; c.t = 0; sound('fuse'); k.state = 'flee'; k.t = 0; k.goal = fleeSpot(k, c); setStatus(`${k.name} lit the ${TYPES[c.type].label} · run`); }
    } else if (k.state === 'flee') {
      if (moveKid(k, k.goal, RUN, dt)) { k.state = 'ears'; k.t = 0; k.yaw = Math.atan2(c.y - k.y, c.x - k.x); }
    } else if (k.state === 'ears') {
      if (c.state === 'done') { k.state = 'cheer'; k.t = 0; }
    } else if (k.state === 'cheer') {
      if (k.t > .9) { k.state = 'idle'; k.job = null; }
    }
    k.z = Math.max(0, heightAt(k.x, k.y));
  }
}
function spark(x, y, z, vx, vy, vz, life, col, kind = 'spark') { G.parts.push({ x, y, z, vx, vy, vz, life, max: life, col, kind }); }
const SPARK_COLS = [rgb(255, 246, 214), rgb(255, 214, 96), rgb(255, 170, 60)];
const STAR_COLS = [[rgb(255, 214, 10), rgb(255, 246, 200)], [rgb(236, 80, 160), rgb(255, 190, 230)], [rgb(80, 210, 160), rgb(200, 255, 230)], [rgb(110, 150, 255), rgb(220, 230, 255)]];
function puff(x, y, z, r, life = 1.6) { G.smoke.push({ x, y, z, r, life, max: life, drift: (Math.random() - .5) * .4 }); }
function flash(x, y, z, r) { G.flashes.push({ x, y, z, r, t: 0 }); }

function explodeBomb(c) {
  flash(c.x, c.y, c.z + .3, 1.5);
  addCrater(c.x, c.y, 1.4, 1.2);
  addSoot(c.x, c.y, 2.6, 1);
  addDirt(c.x, c.y, 2.4, 3, .3);
  addDirt(c.x, c.y, 1.4, 1, .25);
  for (let n = 0; n < 34; n++) {
    const a = Math.random() * 6.283, v = 2 + Math.random() * 4;
    const col = n % 3 === 0 ? CREAM_T[2] : n % 3 === 1 ? BLACK_T[3] : CORE_T[2];
    spark(c.x, c.y, c.z + .2, Math.cos(a) * v, Math.sin(a) * v, 3 + Math.random() * 4, 2.2, col, 'chunk');
  }
  for (let n = 0; n < 7; n++) puff(c.x + (Math.random() - .5) * 1.2, c.y + (Math.random() - .5) * 1.2, c.z + .3 + Math.random() * .8, .5 + Math.random() * .4, 1.8 + Math.random());
  sound('boom');
}
function ignite(c) {
  if (c.type === 'bomb') explodeBomb(c);
  else if (c.type === 'rocket') {
    // one in four tips over and skids across the logo instead of climbing
    const a = Math.random() * 6.283, skid = Math.random() < .25;
    c.fly = { x: c.x, y: c.y, z: c.z + 1, vx: Math.cos(a) * (skid ? 6 : .7), vy: Math.sin(a) * (skid ? 6 : .7), vz: skid ? .6 : 7, skid };
    addSoot(c.x, c.y, .5, .8);
    G.debris.push({ type: 'bottle', x: c.x, y: c.y, z: c.z });
    sound('whistle');
  } else if (c.type === 'anaar') sound('hiss');
  else if (c.type === 'chakri') sound('whirr');
}
function updateCracker(c, dt) {
  c.t += dt;
  if (c.state === 'fuse') {
    const tip = fuseTip(c);
    spark(tip[0], tip[1], tip[2], (Math.random() - .5) * 1.4, (Math.random() - .5) * 1.4, 1 + Math.random() * 1.5, .25, SPARK_COLS[Math.random() * 3 | 0]);
    if (c.t >= TYPES[c.type].fuse) { c.state = 'live'; c.t = 0; ignite(c); }
    return;
  }
  if (c.state !== 'live') return;
  if (c.type === 'bomb') { if (c.t > 1.4) finish(c, 'boom'); }
  else if (c.type === 'rocket') updateRocket(c, dt);
  else if (c.type === 'anaar') {
    for (let n = 0; n < 5; n++) {
      const a = Math.random() * 6.283, s = Math.random() * 1.5;
      spark(c.x, c.y, c.z + .46, Math.cos(a) * s, Math.sin(a) * s, 5 + Math.random() * 3.5, .9 + Math.random() * .5, SPARK_COLS[Math.random() * 3 | 0], 'ember');
    }
    if (Math.random() < dt * 4) puff(c.x, c.y, c.z + 1.6 + Math.random(), .45, 1.6);
    if (c.t > 2.8) { addSoot(c.x, c.y, .7, .9); G.debris.push({ type: 'cone', x: c.x, y: c.y, z: c.z }); finish(c, 'the anaar burnt out'); }
  } else if (c.type === 'chakri') {
    // it spins and skids, scorching a trail
    c.vx = (c.vx || 0) + (Math.random() - .5) * 6 * dt; c.vy = (c.vy || 0) + (Math.random() - .5) * 6 * dt;
    const sp = Math.hypot(c.vx, c.vy); if (sp > 1.2) { c.vx *= 1.2 / sp; c.vy *= 1.2 / sp; }
    const nx = c.x + c.vx * dt, ny = c.y + c.vy * dt;
    if (heightAt(nx, ny) > .3) { c.x = nx; c.y = ny; c.z = heightAt(nx, ny); } else { c.vx *= -1; c.vy *= -1; }
    c.sootT = (c.sootT || 0) + dt;
    if (c.sootT > .08) { addSoot(c.x, c.y, .42, .35); c.sootT = 0; }
    for (let n = 0; n < 4; n++) {
      const a = c.t * 40 + n * 1.57;
      spark(c.x + Math.cos(a) * .2, c.y + Math.sin(a) * .2, c.z + .08, -Math.sin(a) * 3.2, Math.cos(a) * 3.2, .6 + Math.random() * .8, .35, SPARK_COLS[n % 3]);
    }
    if (c.t > 2.6) { G.debris.push({ type: 'coil', x: c.x, y: c.y, z: c.z }); finish(c, 'the chakri ran out'); }
  } else if (c.type === 'ladi') {
    while (c.popped < c.n && c.t > c.popped * .11) {
      const px = c.x + c.dx * c.popped * .32, py = c.y + c.dy * c.popped * .32, pz = heightAt(px, py);
      c.popped++;
      if (pz <= 0) continue;
      flash(px, py, pz + .1, .35);
      addSoot(px, py, .45, .6); addCrater(px, py, .28, .16); addDirt(px, py, .9, 1, .5); addDirt(px, py, .6, 2, .2);
      for (let n = 0; n < 5; n++) { const a = Math.random() * 6.283; spark(px, py, pz + .1, Math.cos(a) * 1.6, Math.sin(a) * 1.6, 2 + Math.random() * 2, .8, PAPER_C[1], 'chunk'); }
      puff(px, py, pz + .4, .3, 1.1);
      sound('pop');
    }
    if (c.popped >= c.n && c.t > c.n * .11 + .6) finish(c, 'the ladi is done');
  }
}
function updateRocket(c, dt) {
  const f = c.fly;
  if (!f) { if (c.t > 1.6) finish(c, 'the rocket burst'); return; }
  if (f.skid) { f.vz -= 2 * dt; f.z = Math.max(heightAt(f.x, f.y) + .25, f.z + f.vz * dt); }
  else { f.vz += 4 * dt; f.z += f.vz * dt; }
  f.x += f.vx * dt; f.y += f.vy * dt;
  for (let n = 0; n < 3; n++) spark(f.x, f.y, f.z - .2, (Math.random() - .5) * .8, (Math.random() - .5) * .8, -1 - Math.random(), .35, SPARK_COLS[1 + (Math.random() * 2 | 0)]);
  if (Math.random() < dt * 14) puff(f.x, f.y, f.z - .3, .16, .8);
  if (f.skid && heightAt(f.x, f.y) > 0) addSoot(f.x, f.y, .32, .4);
  if (c.t > (f.skid ? .9 : 1.15)) {
    const cols = STAR_COLS[Math.random() * STAR_COLS.length | 0];
    for (let n = 0; n < 70; n++) {
      const u = Math.random() * 2 - 1, a = Math.random() * 6.283, s = (f.skid ? 2.4 : 3.6) * (.7 + Math.random() * .3), q = Math.sqrt(1 - u * u);
      spark(f.x, f.y, f.z, Math.cos(a) * q * s, Math.sin(a) * q * s, u * s + 1, 1.3 + Math.random() * .5, cols[n % 2], 'star');
    }
    flash(f.x, f.y, f.z, .7);
    sound('crackle');
    c.fly = null; c.t = 0;
  }
}
function finish(c, text) {
  c.state = 'done';
  setStatus(G.left ? `${text} · ${G.left} left · tap the logo` : text);
}
function landed(p) {
  const h = heightAt(p.x, p.y);
  if (p.kind === 'star') { if (h > 0) addSoot(p.x, p.y, .18, .25); return; }
  if (p.kind === 'ember') { if (h > 0 && Math.random() < .3) addSoot(p.x, p.y, .3, .12); return; }
  if (p.kind === 'chunk' && h > 0 && Math.random() < .5) addDirt(p.x, p.y, .15, p.col === PAPER_C[1] ? 1 : 3, 1);
}
function update(dt) {
  G.time += dt;
  updateKids(dt);
  for (const c of G.crackers) updateCracker(c, dt);
  G.crackers = G.crackers.filter(c => c.state !== 'done' || kids.some(k => k.job === c && k.state === 'ears'));
  for (const p of G.parts) {
    const drag = p.kind === 'star' ? .985 : 1;
    p.vx *= drag; p.vy *= drag;
    p.vz -= (p.kind === 'star' ? 3.2 : 9) * dt;
    p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.life -= dt;
    const floor = heightAt(p.x, p.y);
    if (p.z <= floor && p.vz < 0) {
      if (p.kind === 'chunk' && p.vz < -2) { p.z = floor; p.vz *= -.3; p.vx *= .5; p.vy *= .5; }
      else { landed(p); p.life = 0; }
    }
  }
  G.parts = G.parts.filter(p => p.life > 0);
  for (const s of G.smoke) { s.life -= dt; s.z += dt * .7; s.x += s.drift * dt; s.r += dt * .25; }
  G.smoke = G.smoke.filter(s => s.life > 0);
  for (const f of G.flashes) f.t += dt;
  G.flashes = G.flashes.filter(f => f.t < .22);
  if (G.dirty && G.time - G.bakedAt > .1) { bakeSlab(); }
  if (G.phase === 'play' && !G.left && !G.crackers.length && kids.every(k => k.state === 'idle')) {
    G.phase = 'over'; G.timer = 0;
    if (G.dirty) bakeSlab();
    const record = G.ruin > G.best;
    if (record) { G.best = G.ruin; saveBest(G.best); }
    setStatus(`the logo is ${G.ruin}% ruined${record ? ', a new best' : ''} · tap to sweep up and go again`);

  }
  if (G.phase === 'over') G.timer += dt;
}

/* ---------- drawing ---------- */
function plotLight(x, y, z, col, size = 1) {
  const p = project(x, y, z), ix = p.sx | 0, iy = p.sy | 0;
  for (let oy = 0; oy < size; oy++) for (let ox = 0; ox < size; ox++) {
    const jx = ix + ox, jy = iy + oy;
    if (jx < 0 || jy < 0 || jx >= W || jy >= H) continue;
    const i = jy * W + jx;
    if (p.d + .3 < zb[i]) continue;
    pix[i] = col;
  }
}
const SMOKE_RAMP = rampOf([168, 164, 158]);
function drawSmoke() {
  for (const s of G.smoke) {
    const p = project(s.x, s.y, s.z), rp = s.r * S, k = s.life / s.max;
    for (let iy = Math.max(0, p.sy - rp | 0); iy <= Math.min(H - 1, p.sy + rp); iy++)
      for (let ix = Math.max(0, p.sx - rp | 0); ix <= Math.min(W - 1, p.sx + rp); ix++) {
        const dx = (ix + .5 - p.sx) / rp, dy = (iy + .5 - p.sy) / rp, nn = dx * dx + dy * dy;
        if (nn > 1) continue;
        const i = iy * W + ix;
        if (p.d + s.r < zb[i]) continue;
        if (bayerAt(ix, iy) > k * .85 * (1 - nn * .5)) continue;
        pix[i] = SMOKE_RAMP[clamp(Math.floor((-.5 * dx - .6 * dy + .6) * 2.2 + 1.6), 1, 4)];
      }
  }
}
function drawFlashes() {
  for (const f of G.flashes) {
    const p = project(f.x, f.y, f.z), rp = f.r * S * (1 + f.t * 3), hot = f.t < .08;
    const inner = hot ? rgb(255, 255, 240) : rgb(255, 214, 10), outer = hot ? rgb(255, 214, 10) : rgb(255, 150, 40);
    for (let iy = Math.max(0, p.sy - rp | 0); iy <= Math.min(H - 1, p.sy + rp); iy++)
      for (let ix = Math.max(0, p.sx - rp | 0); ix <= Math.min(W - 1, p.sx + rp); ix++) {
        const dx = (ix + .5 - p.sx) / rp, dy = (iy + .5 - p.sy) / rp, nn = dx * dx + dy * dy;
        if (nn > 1 || bayerAt(ix, iy) < nn * .9) continue;
        pix[iy * W + ix] = nn < .35 ? inner : outer;
      }
  }
}
function drawParts() {
  for (const p of G.parts) {
    if (p.kind === 'star' && p.life < .4 && (Math.floor(G.time * 20 + p.x * 9) & 1)) continue;   // twinkle out
    plotLight(p.x, p.y, p.z, p.col, p.kind === 'chunk' ? 2 : 1);
    if (p.kind === 'spark' || p.kind === 'star') plotLight(p.x - p.vx * .025, p.y - p.vy * .025, p.z - p.vz * .025, p.col);
  }
}
function drawFlames(t) {
  const flick = Math.floor(t * 8);
  for (const d of DIYAS) {
    plotLight(d.x, d.y, .24, rgb(255, 170, 40));
    plotLight(d.x, d.y, .34, hash(flick, d.x) > .4 ? rgb(255, 230, 120) : rgb(255, 200, 60));
    if (hash(flick + 3, d.y) > .5) plotLight(d.x, d.y, .44, rgb(255, 250, 220));
  }
}
function flushKidShadows() {
  const b = G.bones;
  for (let i = 0; i < b.length; i += 4) {
    const a = b[i], ra = b[i + 1], c = b[i + 2];
    const n = Math.max(1, Math.ceil(Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]) / .25));
    for (let k = 0; k <= n; k++) { const t = k / n; castAt(lerp(a[0], c[0], t), lerp(a[1], c[1], t), lerp(a[2], c[2], t), ra * .9); }
    if (a[2] - heightAt(a[0], a[1]) < .2) castAt(a[0], a[1], heightAt(a[0], a[1]), .18, 2);
  }
}
function draw() {
  pix.set(bakedPix); zb.set(bakedZ); G.bones.length = 0;
  for (const c of G.crackers) if (c.state !== 'carried') drawCracker(c);
  for (const k of kids) drawKid(k);
  const windT = STILL ? 0 : Math.floor(G.time * WIND_FPS) / WIND_FPS;
  drawLeaves(windT); drawTufts(windT);
  flushKidShadows();
  applyShadows(bakedZ); applyTopShadows(bakedZ);
  shadeEdges();
  drawFlames(windT);
  drawSmoke();
  for (const k of kids) {
    if (k.sparkTip && !STILL) for (let n = 0; n < 3; n++) { const a = Math.random() * 6.283, r = Math.random() * .35; plotLight(k.sparkTip[0] + Math.cos(a) * r, k.sparkTip[1] + Math.sin(a) * r, k.sparkTip[2] + (Math.random() - .5) * .3, SPARK_COLS[n]); }
    if (k.sparkTip) plotLight(k.sparkTip[0], k.sparkTip[1], k.sparkTip[2], rgb(255, 255, 240));
    if (k.incense) plotLight(k.incense[0], k.incense[1], k.incense[2], Math.floor(G.time * 6) % 2 ? rgb(255, 120, 40) : rgb(255, 200, 80));
  }
  drawParts();
  drawFlashes();
  for (const k of kids) if (k.state === 'go') { const t = project(k.job.x, k.job.y, k.job.z + 1.6); drawArrow(t.sx, t.sy, G.time); }
  ctx.putImageData(image, 0, 0);
}

/* ---------- sound ---------- */
let audio = null, muted = false, noiseBuf = null;
function ensureAudio() {
  if (audio) { if (audio.state === 'suspended') audio.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  audio = new AC();
  noiseBuf = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate);
  const ch = noiseBuf.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
}
function hissAt(at, dur, type, f0, f1, q, gain) {
  const src = audio.createBufferSource(), filt = audio.createBiquadFilter(), g = audio.createGain();
  src.buffer = noiseBuf; filt.type = type; filt.Q.value = q;
  filt.frequency.setValueAtTime(f0, at); filt.frequency.exponentialRampToValueAtTime(f1, at + dur);
  g.gain.setValueAtTime(gain, at); g.gain.exponentialRampToValueAtTime(.0005, at + dur);
  src.connect(filt).connect(g).connect(audio.destination);
  src.start(at, Math.random()); src.stop(at + dur + .02);
}
function tone(at, dur, type, f0, f1, gain) {
  const o = audio.createOscillator(), g = audio.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, at); o.frequency.exponentialRampToValueAtTime(f1, at + dur);
  g.gain.setValueAtTime(gain, at); g.gain.exponentialRampToValueAtTime(.0005, at + dur);
  o.connect(g).connect(audio.destination); o.start(at); o.stop(at + dur + .02);
}
function sound(kind) {
  if (!audio || muted) return;
  const t = audio.currentTime;
  if (kind === 'boom') { hissAt(t, .7, 'lowpass', 1400, 60, .7, .55); tone(t, .35, 'sine', 90, 38, .5); }
  else if (kind === 'pop') hissAt(t, .07, 'bandpass', 2400, 900, 1.2, .25);
  else if (kind === 'fuse') hissAt(t, .5, 'highpass', 5000, 7000, .5, .04);
  else if (kind === 'whistle') { tone(t, 1.1, 'triangle', 700, 2600, .05); hissAt(t, 1.1, 'bandpass', 3000, 3000, 2, .06); }
  else if (kind === 'crackle') for (let n = 0; n < 12; n++) hissAt(t + n * .05 + Math.random() * .04, .05, 'bandpass', 3000, 1500, 1, .12);
  else if (kind === 'hiss') hissAt(t, 2.8, 'bandpass', 3500, 2200, .8, .07);
  else if (kind === 'whirr') { hissAt(t, 2.6, 'bandpass', 4200, 2600, 3, .06); tone(t, 2.6, 'sawtooth', 220, 140, .012); }
}

/* ---------- boot ---------- */
addEventListener('resize', fit);
fit();
buildMask();
countCells();
bakeGround();
newRound();
let last = performance.now();
function frame(now) {
  update(Math.min(.04, (now - last) / 1000));
  last = now;
  draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
// test hook: drive the game without real time or input
window.__phatake = {
  G, kids,
  step(dt, skipDraw) { update(dt); if (!skipDraw) draw(); },
  light(x, y, type) { if (type) G.queue.unshift(type); press({ x, y, z: heightAt(x, y) }); },
  run(seconds) { for (let t = 0; t < seconds; t += 1 / 60) update(1 / 60); draw(); },
};
