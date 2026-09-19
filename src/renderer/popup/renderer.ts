// 08 walks in from the left, sits in the middle of the screen (back to you, tail swishing
// now and then), and after the break walks off to the right. Everything is drawn on a small
// pixel grid and scaled up, so she stays crisp pixel art at any size.
//
// Main process drives it with:
//   window.__start(stayMs | null)  — come out; null = stay until __leave()
//   window.__leave()               — get up and walk off now
//   window.__setStay(stayMs | null)
// and learns she's gone when the page title becomes "gone".

type Ctx = CanvasRenderingContext2D;
type RGB = [number, number, number];
interface Ellipse { x: number; y: number; rx: number; ry: number; rot?: number }
interface Leg { hx: number; hy: number; fx: number; fy: number; w: number }
interface Tail { x: number; y: number; a0: number; curl: number; seg: number; w: number; flat: number }

const PAL = {
  white: "#f8f6f3", shade: "#e3dfda", far: "#cfcbc7", grey: "#6f6c74", greyD: "#524f57",
  pink: "#f4b3bf", eye: "#2e2933", outline: "#3a3440",
};
const hex = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
const SNAP: RGB[] = Object.values(PAL).filter((c) => c !== PAL.outline).map(hex);
const OUT = hex(PAL.outline);

// The cat lives on an L×L grid; GROUND is the floor line, ANCHOR the x she's positioned by.
const L = 112, GROUND = 84, ANCHOR = 48;
const mk = (): HTMLCanvasElement => { const c = document.createElement("canvas"); c.width = c.height = L; return c; };
const layers = [mk(), mk()];
const catA = mk(), catB = mk(), catOut = mk();

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (u: number) => u * u * u * (u * (u * 6 - 15) + 10);

// ---------- pixel pipeline ----------
/** Snap to the palette, drop soft edges, add a 1px outline around the silhouette. */
function pixelate(c: HTMLCanvasElement): void {
  const x = c.getContext("2d")!, img = x.getImageData(0, 0, L, L), d = img.data;
  const solid = new Uint8Array(L * L);
  for (let i = 0; i < L * L; i++) {
    const p = i * 4;
    if (d[p + 3] < 120) { d[p + 3] = 0; continue; }
    let best = SNAP[0], bd = Infinity;
    for (const s of SNAP) {
      const dd = (d[p] - s[0]) ** 2 + (d[p + 1] - s[1]) ** 2 + (d[p + 2] - s[2]) ** 2;
      if (dd < bd) { bd = dd; best = s; }
    }
    d[p] = best[0]; d[p + 1] = best[1]; d[p + 2] = best[2]; d[p + 3] = 255; solid[i] = 1;
  }
  for (let y = 0; y < L; y++) for (let xx = 0; xx < L; xx++) {
    const i = y * L + xx; if (solid[i]) continue;
    if ((xx > 0 && solid[i - 1]) || (xx < L - 1 && solid[i + 1]) || (y > 0 && solid[i - L]) || (y < L - 1 && solid[i + L])) {
      const p = i * 4; d[p] = OUT[0]; d[p + 1] = OUT[1]; d[p + 2] = OUT[2]; d[p + 3] = 255;
    }
  }
  x.putImageData(img, 0, 0);
}
function flatten(target: HTMLCanvasElement): HTMLCanvasElement {
  layers.forEach(pixelate);
  const c = target.getContext("2d")!; c.clearRect(0, 0, L, L);
  layers.forEach((l) => c.drawImage(l, 0, 0));
  return target;
}
function clearLayers(): [Ctx, Ctx] {
  const [a, b] = layers.map((c) => { const x = c.getContext("2d")!; x.clearRect(0, 0, L, L); return x; });
  return [a, b];
}
function fillMask(c: Ctx, mask: Uint8Array, dy = 0): void {
  const img = c.createImageData(L, L), W8 = hex(PAL.white);
  for (let y = 0; y < L; y++) for (let x = 0; x < L; x++) {
    const sy = y - dy; if (sy < 0 || sy >= L || !mask[sy * L + x]) continue;
    const p = (y * L + x) * 4; img.data[p] = W8[0]; img.data[p + 1] = W8[1]; img.data[p + 2] = W8[2]; img.data[p + 3] = 255;
  }
  c.putImageData(img, 0, 0);
}

// ---------- shapes ----------
function ell(c: Ctx, e: Ellipse, col: string): void {
  c.fillStyle = col; c.beginPath();
  c.ellipse(e.x, e.y, Math.max(0.1, e.rx), Math.max(0.1, e.ry), e.rot || 0, 0, Math.PI * 2); c.fill();
}
function legLine(c: Ctx, l: Leg, col: string): void {
  c.strokeStyle = col; c.lineWidth = l.w; c.lineCap = "round";
  c.beginPath(); c.moveTo(l.hx, l.hy); c.lineTo(l.fx, l.fy); c.stroke();
}
function paw(c: Ctx, l: Leg, col: string): void { ell(c, { x: l.fx + 0.8, y: l.fy - 1.4, rx: 3.3, ry: 2.3 }, col); }
/** Tiny pink pads on the tip of each paw. */
function beans(c: Ctx, l: Leg): void {
  c.fillStyle = PAL.pink;
  const y = Math.round(l.fy - 1), x = Math.round(l.fx + 0.8);
  c.fillRect(x - 2, y, 1, 1); c.fillRect(x, y, 1, 1); c.fillRect(x + 2, y, 1, 1);
}
/** Tabby tail as a chain of segments; `flat` squashes the part lying on the floor. */
function tail(c: Ctx, t: Tail): void {
  const pts: [number, number][] = [[t.x, t.y]];
  let a = t.a0, x = t.x, y = t.y;
  for (let i = 0; i < 8; i++) {
    a += t.curl; x += Math.cos(a) * t.seg;
    const dy = Math.sin(a) * t.seg; y += dy > 0 ? dy * (1 - 0.7 * t.flat) : dy;
    pts.push([x, y]);
  }
  c.lineCap = "round"; c.lineJoin = "round"; c.lineWidth = t.w;
  for (let i = 0; i < pts.length - 1; i++) {
    c.strokeStyle = (i % 2 && i < 6) || i >= 7 ? PAL.greyD : PAL.grey;
    c.beginPath(); c.moveTo(pts[i][0], pts[i][1]); c.lineTo(pts[i + 1][0], pts[i + 1][1]); c.stroke();
  }
}

// ---------- silhouettes (pre-made masks, see art/README.md) ----------
let walkMask: Uint8Array | null = null, sitMask: Uint8Array | null = null;
function loadMask(src: string, done: (m: Uint8Array) => void): void {
  const img = new Image();
  img.onload = () => {
    const c = mk(), x = c.getContext("2d")!; x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, L, L).data, m = new Uint8Array(L * L);
    for (let i = 0; i < L * L; i++) m[i] = d[i * 4 + 3] > 127 ? 1 : 0;
    done(m);
  };
  img.src = src;
}
loadMask("sprites/walk-body.png", (m) => (walkMask = m));
loadMask("sprites/sit-back.png", (m) => (sitMask = m));

// Markings are placed in the coordinates of the reference each mask came from.
const WALK_S = 50 / (405 - 125);
const walkMap = (sx: number, sy: number): [number, number] => [50 + (sx - 330) * WALK_S, GROUND + (sy - 405) * WALK_S];
const SIT_S = 0.17239, SIT_CX = 371.16, SIT_CUT = 521.64;
const sitMap = (sx: number, sy: number): [number, number] => [50 + (sx - SIT_CX) * SIT_S, GROUND + (sy - SIT_CUT) * SIT_S];

// ---------- walking (side view, facing right) ----------
const HIPS: Record<string, [number, number]> = {
  farHind: [188, 284], farFront: [425, 300], nearHind: [222, 290], nearFront: [385, 304],
};
function legs(phase: number, amt: number): { far: Leg[]; near: Leg[] } {
  const leg = (h: [number, number], off: number): Leg => {
    const [hx, hy] = walkMap(h[0], h[1]);
    return { hx, hy, w: 5, fx: hx + Math.sin(phase + off) * 5.5 * amt, fy: GROUND - Math.max(0, Math.cos(phase + off)) * 2.5 * amt };
  };
  return { far: [leg(HIPS.farHind, 0), leg(HIPS.farFront, Math.PI)], near: [leg(HIPS.nearHind, Math.PI), leg(HIPS.nearFront, 0)] };
}
function drawWalk(phase: number, amt: number): HTMLCanvasElement {
  const [back, main] = clearLayers();
  const bob = Math.round(Math.abs(Math.sin(phase)) * amt);   // 1px step bob
  const lg = legs(phase, amt);
  lg.far.forEach((l) => { legLine(back, { ...l, hy: l.hy + bob, w: 4.2 }, PAL.far); paw(back, l, PAL.far); });
  fillMask(main, walkMask!, bob);
  const shape = (pts: [number, number][], col: string) => {
    main.fillStyle = col; main.beginPath();
    pts.forEach(([sx, sy], i) => { const [x, y] = walkMap(sx, sy); if (i) main.lineTo(x, y + bob); else main.moveTo(x, y + bob); });
    main.fill();
  };
  shape([[450, 190], [470, 98], [518, 168]], PAL.white);          // near ear
  shape([[514, 164], [550, 96], [562, 176]], PAL.white);          // far ear
  lg.near.forEach((l) => { legLine(main, { ...l, hy: l.hy + bob, w: 4.6 }, PAL.white); paw(main, l, PAL.white); });
  main.globalCompositeOperation = "source-atop";
  const at = (e: Ellipse, col: string) => { const [x, y] = walkMap(e.x, e.y); ell(main, { x, y: y + bob, rx: e.rx * WALK_S, ry: e.ry * WALK_S, rot: e.rot }, col); };
  at({ x: 330, y: 300, rx: 130, ry: 30 }, PAL.shade);            // soft belly shading
  at({ x: 492, y: 190, rx: 40, ry: 26, rot: 0.15 }, PAL.grey);   // grey over the top of her head and one eye
  at({ x: 335, y: 245, rx: 26, ry: 72, rot: 0.5 }, PAL.grey);    // her diagonal stripe
  at({ x: 185, y: 255, rx: 70, ry: 60 }, PAL.grey);              // grey rump
  at({ x: 140, y: 110, rx: 48, ry: 100, rot: -0.1 }, PAL.grey);  // tail
  for (const [tx, ty] of [[150, 60], [135, 105], [128, 150]]) at({ x: tx, y: ty, rx: 26, ry: 7, rot: -0.25 }, PAL.greyD);   // tabby rings
  at({ x: 175, y: 30, rx: 22, ry: 14 }, PAL.greyD);              // darker tail tip
  main.globalCompositeOperation = "source-over";
  shape([[466, 178], [474, 124], [500, 168]], PAL.pink);         // pink inside the near ear
  lg.near.forEach((l) => beans(main, l)); lg.far.forEach((l) => beans(back, l));
  const [ex, ey] = walkMap(528, 205), [nx, ny] = walkMap(549, 228);
  main.fillStyle = PAL.eye; main.fillRect(Math.round(ex), Math.round(ey + bob), 2, 2);
  main.fillStyle = PAL.pink; main.fillRect(Math.round(nx), Math.round(ny + bob), 1, 1);
  return flatten(catA);
}

// ---------- sitting (back to you, head turned right) ----------
// Tail: swish (1.3s) to the other side, then rest a while before the next one.
const SWISH = 1.3, HOLDS = [2.2, 3.1, 1.8, 2.7, 3.4, 2.0];
function wagAt(t: number): number {   // 0 = lying one way, 1 = the other
  let i = 0, start = 0;
  for (;;) {
    const len = SWISH + HOLDS[i % HOLDS.length];
    if (t < start + len) { const u = smooth(Math.min(1, (t - start) / SWISH)); return i % 2 ? 1 - u : u; }
    start += len; i++;
  }
}
function drawSit(t: number): HTMLCanvasElement {
  const [, main] = clearLayers();
  fillMask(main, sitMask!);
  main.globalCompositeOperation = "source-atop";
  const at = (e: Ellipse, col: string) => { const [x, y] = sitMap(e.x, e.y); ell(main, { x, y, rx: e.rx * SIT_S, ry: e.ry * SIT_S, rot: e.rot }, col); };
  at({ x: 455, y: 465, rx: 85, ry: 70 }, PAL.shade);             // soft shading
  at({ x: 300, y: 248, rx: 56, ry: 40, rot: -0.2 }, PAL.grey);   // grey cap on the back of the head
  at({ x: 410, y: 370, rx: 30, ry: 100, rot: -0.5 }, PAL.grey);  // her diagonal stripe
  at({ x: 455, y: 520, rx: 70, ry: 32, rot: -0.2 }, PAL.grey);   // grey bottom that runs into the tail
  at({ x: 232, y: 222, rx: 9, ry: 17, rot: -0.25 }, PAL.pink);   // ears
  at({ x: 318, y: 200, rx: 9, ry: 17, rot: 0.15 }, PAL.pink);
  main.globalCompositeOperation = "source-over";
  const w = wagAt(t), [bx, by] = sitMap(485, 500);
  tail(main, { x: bx, y: by, a0: lerp(2.15, 0.35, w), curl: lerp(0.14, -0.12, w), seg: 3.6, w: 4, flat: lerp(0.45, 0.3, w) });
  flatten(catB);
  // The reference faces left; mirrored, she sits facing the way she walked in.
  const c = catOut.getContext("2d")!; c.clearRect(0, 0, L, L);
  c.save(); c.translate(100, 0); c.scale(-1, 1); c.drawImage(catB, 0, 0); c.restore();
  return catOut;
}

// ---------- screen ----------
const screenCanvas = document.getElementById("screen") as HTMLCanvasElement;
const sctx = screenCanvas.getContext("2d")!;
let P = 4, W = 0, H = 0;
function resize(): void {
  H = L; P = Math.max(2, Math.floor(window.innerHeight / H)); W = Math.ceil(window.innerWidth / P);
  screenCanvas.width = W; screenCanvas.height = H;
  screenCanvas.style.width = `${W * P}px`; screenCanvas.style.height = `${H * P}px`;
}
resize();
window.addEventListener("resize", resize);

function drawShadow(x0: number, s: { x: number; rx: number }): void {
  sctx.fillStyle = "rgba(40,30,50,.16)";
  const ry = 3.2;
  for (let y = -3; y <= 3; y++) for (let x = -Math.ceil(s.rx); x <= s.rx; x++)
    if ((x * x) / (s.rx * s.rx) + (y * y) / (ry * ry) <= 1) sctx.fillRect(x0 + Math.round(s.x) + x, GROUND + y, 1, 1);
}
const WALK_SHADOW = { x: 50, rx: 32 }, SIT_SHADOW = { x: 50, rx: 26 };

// ---------- behaviour ----------
type Phase = "away" | "in" | "pause" | "sit" | "up" | "out";
const SPEED = 17, STRIDE = 26;          // slow, calm pace (grid px per second)
const SLOW = 2.2;                       // seconds spent easing to a stop
const PAUSE = 0.5;                      // standing moment before sitting / after getting up
let phase: Phase = "away", phaseStart = 0, x = 0, walked = 0, speed = 0;
let stayMs: number | null = null, leaveRequested = false;

function enter(p: Phase, now: number): void { phase = p; phaseStart = now; }

function start(ms: number | null): void {
  stayMs = ms; leaveRequested = false;
  x = -70; walked = 0; speed = SPEED; document.title = "out";
  enter("in", performance.now());
}
function leave(): void { leaveRequested = true; }

function tick(now: number): void {
  requestAnimationFrame(tick);
  if (!walkMask || !sitMask) return;
  const dt = Math.min(0.1, (now - (tick.last || now)) / 1000); tick.last = now;
  const inPhase = (now - phaseStart) / 1000;
  const endX = Math.round(W / 2);
  let img: HTMLCanvasElement | null = null, shadow = WALK_SHADOW;

  switch (phase) {
    case "away":
      break;
    case "in": {                                   // walk in from the left, easing to a stop mid-screen
      const remaining = endX - x;
      if (leaveRequested) { enter("out", now); break; }
      const braking = SPEED * SLOW / 2;           // distance it takes to stop
      speed = remaining < braking ? Math.max(SPEED * 0.12, SPEED * Math.sqrt(remaining / braking)) : SPEED;
      const step = Math.min(remaining, speed * dt);
      x += step; walked += step;
      if (endX - x < 0.3) { x = endX; enter("pause", now); }
      img = drawWalk(walked / STRIDE * Math.PI * 2, speed / SPEED);
      break;
    }
    case "pause":                                  // stand a moment, then sit (straight cut for now)
      img = drawWalk(0, 0);
      if (inPhase >= PAUSE) enter("sit", now);
      break;
    case "sit":                                    // sit; tail swishes now and then
      img = drawSit(inPhase); shadow = SIT_SHADOW;
      if (leaveRequested || (stayMs != null && inPhase * 1000 >= stayMs)) enter("up", now);
      break;
    case "up":                                     // back on her feet a moment
      img = drawWalk(0, 0);
      if (inPhase >= PAUSE) { walked = 0; speed = 0; enter("out", now); }
      break;
    case "out": {                                  // walk off slowly to the right
      speed = Math.min(SPEED, speed + (SPEED / 2) * dt);
      x += speed * dt; walked += speed * dt;
      img = drawWalk(walked / STRIDE * Math.PI * 2, speed / SPEED);
      if (x - ANCHOR > W + 4) { phase = "away"; img = null; document.title = "gone"; }
      break;
    }
  }

  sctx.clearRect(0, 0, W, H);
  if (img) {
    const left = Math.round(x) - ANCHOR;
    drawShadow(left, shadow);
    sctx.drawImage(img, left, 0);
  }
}
tick.last = 0;
requestAnimationFrame(tick);

const w = window as unknown as {
  __start: (ms: number | null) => void;
  __leave: () => void;
  __setStay: (ms: number | null) => void;
};
w.__start = start;
w.__leave = leave;
w.__setStay = (ms) => { stayMs = ms; };
