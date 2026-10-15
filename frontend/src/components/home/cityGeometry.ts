// Deterministic procedural city geometry generator for Avatar 3D Animated Hero
// Exact isometric projection and mathematical layout from latest Hero - animated city model.

export interface PinWalker {
  id: string;
  bb: string;
  skin: string;
  hair: string;
  shirt: string;
  pants: string;
  hat: string;
  brim: string;
  bag: string;
  vest: string;
  apron: string;
  ring: string;
}

export interface PinData {
  route: Array<[number, number]>;
  cum: number[];
  len: number;
  speed: number;
  off: number;
}

export interface CityCar {
  tf: string;
  vals: string;
  kt: string;
  dur: number;
  begin: number;
  isVan: boolean;
  w1x: string;
  w1y: string;
  w2x: string;
  w2y: string;
  w3x: string;
  w3y: string;
  hx: string;
  hy: string;
  cone: string;
  bl: string;
  br: string;
  bt: string;
  cl: string;
  cr: string;
  ct: string;
  kl: string;
  kr: string;
  kt2: string;
  gl: string;
  gr: string;
  skirtL: string;
  skirtR: string;
  doors: string;
  tl: string;
  plate: string;
  sign: string;
}

export interface CityData {
  roads: Array<{ p: string }>;
  dashes: Array<{ x1: string; y1: string; x2: string; y2: string }>;
  zebras: Array<{ d: string }>;
  blocks: Array<{ p: string }>;
  grass: Array<{ p: string; c: string }>;
  plazas: Array<{ p: string }>;
  cars: CityCar[];
  vanLabels: CityCar[];
  scene: Array<any>;
  glows: Array<{ cx: string; cy: string }>;
  pinWalkers: PinWalker[];
  pinData: PinData[];
}

let cachedCityData: CityData | null = null;

export function getCityData(): CityData {
  if (cachedCityData) return cachedCityData;

  let s = 20261014;
  const R = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };

  const OX = 720, OY = 30, W = 34, H = 17;
  const P = (x: number, y: number, z = 0): [number, number] => [
    OX + (x - y) * W,
    OY + (x + y) * H - z
  ];
  const Lc = (x: number, y: number, z = 0): [number, number] => [
    (x - y) * W,
    (x + y) * H - z
  ];
  const f = (n: number) => n.toFixed(1);
  const pts = (a: Array<[number, number]>) => a.map((p) => f(p[0]) + ',' + f(p[1])).join(' ');
  const pd = (a: Array<[number, number]>) => 'M' + a.map((p) => f(p[0]) + ' ' + f(p[1])).join('L') + 'Z';
  const ln = (a: [number, number], b: [number, number]) => 'M' + f(a[0]) + ' ' + f(a[1]) + 'L' + f(b[0]) + ' ' + f(b[1]);
  
  const shade = (hex: string, m: number) => {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.min(255, Math.round((n >> 16) * m));
    const g = Math.min(255, Math.round(((n >> 8) & 255) * m));
    const b = Math.min(255, Math.round((n & 255) * m));
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  };

  const visOld = (x: number, y: number, mx: number, my: number) =>
    x > -mx && x < 1440 + mx && y > -my && y < 800 + my;
  const visible = (x: number, y: number, mx: number, my: number) =>
    x > -180 - mx && x < 1620 + mx && y > -100 - my && y < 900 + my;
  const pick = <T>(a: T[]): T => a[Math.floor(R() * a.length)];

  const KMIN = -4, KMAX = 11, A0 = -30, A1 = 75;
  const lineVisible = (axis: 'x' | 'y', v: number) => {
    for (let a = A0; a <= A1; a += 3) {
      const q = axis === 'x' ? P(a, v) : P(v, a);
      if (visible(q[0], q[1], 80, 80)) return true;
    }
    return false;
  };

  const roads: Array<{ p: string }> = [];
  const dashes: Array<{ x1: string; y1: string; x2: string; y2: string }> = [];
  const zebras: Array<{ d: string }> = [];

  for (let k = KMIN; k <= KMAX; k++) {
    const r = 5 * k;
    if (lineVisible('x', r + 0.5)) {
      roads.push({ p: pts([P(A0, r), P(A1, r), P(A1, r + 1), P(A0, r + 1)]) });
      for (let j = KMIN; j <= KMAX; j++) {
        const a = P(5 * j + 1.25, r + 0.5), b = P(5 * j + 4.75, r + 0.5);
        if (!visible((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 100, 100)) continue;
        dashes.push({ x1: f(a[0]), y1: f(a[1]), x2: f(b[0]), y2: f(b[1]) });
      }
    }
    if (lineVisible('y', r + 0.5)) {
      roads.push({ p: pts([P(r, A0), P(r + 1, A0), P(r + 1, A1), P(r, A1)]) });
      for (let j = KMIN; j <= KMAX; j++) {
        const a = P(r + 0.5, 5 * j + 1.25), b = P(r + 0.5, 5 * j + 4.75);
        if (!visible((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 100, 100)) continue;
        dashes.push({ x1: f(a[0]), y1: f(a[1]), x2: f(b[0]), y2: f(b[1]) });
      }
    }
  }

  const rect = (gx0: number, gx1: number, gy0: number, gy1: number) =>
    pd([P(gx0, gy0), P(gx1, gy0), P(gx1, gy1), P(gx0, gy1)]);

  for (let j = KMIN; j <= KMAX; j++) {
    for (let k = KMIN; k <= KMAX; k++) {
      const c = P(5 * j + 0.5, 5 * k + 0.5);
      if (!visible(c[0], c[1], 90, 90)) continue;
      let d = '';
      for (let i = 0; i < 5; i++) {
        const o = 0.08 + i * 0.19;
        d += rect(5 * j + 1.12, 5 * j + 1.5, 5 * k + o, 5 * k + o + 0.1);
        d += rect(5 * j - 0.5, 5 * j - 0.12, 5 * k + o, 5 * k + o + 0.1);
        d += rect(5 * j + o, 5 * j + o + 0.1, 5 * k + 1.12, 5 * k + 1.5);
        d += rect(5 * j + o, 5 * j + o + 0.1, 5 * k - 0.5, 5 * k - 0.12);
      }
      zebras.push({ d });
    }
  }

  const pal = [
    { l: '#e8b07a', r: '#cf8f55', t: '#f3c996' },
    { l: '#d9695a', r: '#b9503f', t: '#e8806f' },
    { l: '#e9d6a6', r: '#cdb882', t: '#f4e6bd' },
    { l: '#6a7099', r: '#4f557c', t: '#858bb3' },
    { l: '#bfb4a8', r: '#a09486', t: '#d6ccc0' },
    { l: '#8fb6d6', r: '#6f98b9', t: '#a9c9e2' }
  ];
  const roofs = ['#c9503f', '#a8443a', '#4f77a8', '#6b5a52'];
  const awns = ['#c9503f', '#2f7d6d', '#3b78c4', '#e8a020'];

  const hull = (ps: Array<[number, number]>) => {
    const sorted = ps.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o: [number, number], a: [number, number], b: [number, number]) =>
      (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo: Array<[number, number]> = [];
    for (const p of sorted) {
      while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop();
      lo.push(p);
    }
    const up: Array<[number, number]> = [];
    for (let i = sorted.length - 1; i >= 0; i--) {
      const p = sorted[i];
      while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop();
      up.push(p);
    }
    up.pop();
    lo.pop();
    return lo.concat(up);
  };

  const shadowOf = (x: number, y: number, w: number, d: number, h: number) => {
    const b: Array<[number, number]> = [P(x, y, 0), P(x + w, y, 0), P(x + w, y + d, 0), P(x, y + d, 0)];
    const k = h * 0.45;
    return pts(hull(b.concat(b.map((p) => [p[0] + k, p[1] + k * 0.4]))));
  };

  const roofAC = (x: number, y: number, w: number, d: number, h: number) => {
    if (R() < 0.45) return { act: '', acl: '', acr: '' };
    const ax = x + w * 0.2, ay = y + d * 0.2, aw = 0.28, ad = 0.22, ah = 6;
    return {
      act: pts([P(ax, ay, h + ah), P(ax + aw, ay, h + ah), P(ax + aw, ay + ad, h + ah), P(ax, ay + ad, h + ah)]),
      acl: pts([P(ax, ay + ad, h), P(ax + aw, ay + ad, h), P(ax + aw, ay + ad, h + ah), P(ax, ay + ad, h + ah)]),
      acr: pts([P(ax + aw, ay, h), P(ax + aw, ay + ad, h), P(ax + aw, ay + ad, h + ah), P(ax + aw, ay, h + ah)])
    };
  };

  const roofTank = (x: number, y: number, w: number, d: number, h: number) => {
    if (R() > 0.3) return { tkx: 0, tky: 0, tkw: 0, tkcx: 0, tkr: 0 };
    const b = P(x + w * 0.62, y + d * 0.55, h);
    return { tkx: b[0] - 4.5, tky: b[1] - 9, tkw: 9, tkcx: b[0], tkr: 4.5 };
  };

  const wins = (x: number, y: number, w: number, d: number, h: number, face: 'L' | 'R', rows: number, z0: number) => {
    const len = face === 'L' ? w : d;
    const nc = Math.max(1, Math.floor(len / 0.36));
    let on = '', off = '';
    for (let j = 0; j < rows; j++) {
      const za = z0 + j * 15, zb = za + 8;
      if (zb > h - 5) break;
      for (let i = 0; i < nc; i++) {
        const ua = ((i + 0.2) / nc) * len, ub = ((i + 0.8) / nc) * len;
        const q: Array<[number, number]> = face === 'L'
          ? [P(x + ua, y + d, za), P(x + ub, y + d, za), P(x + ub, y + d, zb), P(x + ua, y + d, zb)]
          : [P(x + w, y + ua, za), P(x + w, y + ub, za), P(x + w, y + ub, zb), P(x + w, y + ua, zb)];
        const sq = pd(q);
        on += sq;
        if (R() < 0.4) off += sq;
      }
    }
    return [on, off];
  };

  const mk = (o: any) => Object.assign({
    isPW: false, id: '', isBldg: false, isHouse: false, isTree: false, isFountain: false, isWalker: false, isLamp: false, isLight: false, depth: 0,
    left: '', right: '', top: '', topIn: '', gable: '', roof: '', winL: '', winR: '', winLo: '', winRo: '',
    cl: '', cr: '', ct: '', ctIn: '', roofC: '',
    cx: 0, cy: 0, by: 0, tx: 0, ty: 0, r: 0, hx: 0, hy: 0, hr: 0, px: 0, py: 0, sp: 0, sx: 0, sy: 0, sr: 0, r1: 0, r2: 0, r3: 0,
    canopyC: '', canopyC2: '', sw: '', swd: '4', swb: '0', fd: '3', fb: '0',
    tf: '', vals: '', dur: '10', begin: '0', bb: '0', shirt: '', legC: '', skin: '', hat: '',
    shadow: '', cornL: '', cornR: '', door: '', act: '', acl: '', acr: '', shop: '', awnA: '', awnB: '', awnC: '#c9503f', edge: '',
    tkx: 0, tky: 0, tkw: 0, tkcx: 0, tkr: 0,
    sc: '1.3', fl: '1 1;-1 1', pants: '', hair: '', bag: 'none', vest: 'none', apron: 'none', brim: 'none', ld: '16'
  }, o);

  const scene: Array<any> = [];
  const blocks: Array<{ p: string }> = [];
  const grass: Array<{ p: string; c: string }> = [];
  const plazas: Array<{ p: string }> = [];
  const glows: Array<{ cx: string; cy: string }> = [];

  const tree = (x: number, y: number) => {
    const b = P(x, y, 0), r = 8 + R() * 4;
    const cy = b[1] - 18;
    const sw = '-2 ' + f(b[0]) + ' ' + f(cy) + ';2 ' + f(b[0]) + ' ' + f(cy) + ';-2 ' + f(b[0]) + ' ' + f(cy);
    scene.push(mk({
      isTree: true, depth: x + y, cx: b[0], by: b[1], tx: b[0] - 2, ty: b[1] - 20, cy: b[1] - 26, r,
      hx: b[0] - r * 0.3, hy: b[1] - 26 - r * 0.3, hr: r * 0.55,
      sx: b[0] + r * 0.35, sy: b[1] - 26 + r * 0.4, sr: r * 0.6,
      canopyC: pick(['#3f9a3f', '#4aa845', '#378a3a']), canopyC2: pick(['#63bb52', '#6cc457']),
      sw, swd: (3 + R() * 2).toFixed(1), swb: (-R() * 4).toFixed(1)
    }));
  };

  const lamp = (x: number, y: number) => {
    const b = P(x, y, 0);
    scene.push(mk({ isLamp: true, depth: x + y, cx: b[0], by: b[1], tx: b[0] - 1, ty: b[1] - 30, cy: b[1] - 31 }));
    glows.push({ cx: f(b[0]), cy: f(b[1] - 31) });
  };

  const light = (x: number, y: number) => {
    const b = P(x, y, 0);
    scene.push(mk({
      isLight: true, depth: x + y, cx: b[0], by: b[1], tx: b[0] - 1, ty: b[1] - 30,
      hx: b[0] - 3.5, hy: b[1] - 46, r1: b[1] - 42, r2: b[1] - 37.5, r3: b[1] - 33, fb: (-R() * 14).toFixed(1)
    }));
  };

  const skins = ['#f1c8a5', '#d9a27a', '#b57a52'];
  const hairs = ['#2a2320', '#5a3a22', '#1c1c24'];
  const shirts = ['#d95a4a', '#3d6fb5', '#f2c230', '#f4f4f0', '#2f9e6d', '#8a5bc4'];

  const walker = (gx0: number, gy0: number, gx1: number, gy1: number) => {
    const a = P(gx0, gy0), b = P(gx1, gy1);
    const r = R();
    const kind = r < 0.28 ? 1 : r > 0.9 ? 2 : 0;
    const dur = 2 * (11 + R() * 10);
    const dxs = b[0] - a[0];
    scene.push(mk({
      isWalker: true, depth: Math.max(gx0 + gy0, gx1 + gy1) + 0.5,
      tf: 'translate(' + f(a[0]) + ',' + f(a[1]) + ')',
      vals: '0 0;' + f(b[0] - a[0]) + ' ' + f(b[1] - a[1]) + ';0 0',
      dur: dur.toFixed(1), begin: (-R() * dur).toFixed(1), bb: (-R() * 0.5).toFixed(2),
      sc: (1.18 + R() * 0.3).toFixed(2), fl: dxs < 0 ? '-1 1;1 1' : '1 1;-1 1',
      shirt: kind === 1 ? '#3d6fb5' : kind === 2 ? '#2b2f3a' : pick(shirts),
      pants: kind === 2 ? '#2b2f3a' : pick(['#2c3350', '#3a3f4a', '#5b4a3a', '#1f2a44']),
      skin: pick(skins), hair: pick(hairs),
      hat: kind === 1 ? '#f2c230' : kind === 2 ? '#ffffff' : pick(hairs),
      brim: kind === 1 ? '#f2c230' : 'none',
      bag: kind === 0 && R() < 0.4 ? pick(['#8a5bc4', '#d95a4a', '#2f9e6d', '#222a3a']) : 'none',
      vest: kind === 1 ? '#d6f03a' : 'none', apron: kind === 2 ? '#f4f4f0' : 'none'
    }));
  };

  const PIN_DEF = [
    { name: 'PLUMBER', bi: 0, bj: 3, speed: 12, off: 0.05 },
    { name: 'MAID', bi: 2, bj: -1, speed: 11, off: 0.4 },
    { name: 'ELECTRICIAN', bi: 2, bj: 0, speed: 13, off: 0.7 },
    { name: 'MECHANIC', bi: 1, bj: 4, speed: 11.5, off: 0.2 },
    { name: 'CARPENTER', bi: 4, bj: 1, speed: 12.5, off: 0.55 }
  ];

  const pinBlocks: Record<string, number> = {};
  PIN_DEF.forEach((d, i) => {
    pinBlocks[d.bi + ',' + d.bj] = i;
  });

  let savedS = 0;
  for (let pass = 0; pass < 2; pass++) {
    if (pass === 1) {
      savedS = s;
      s = 77777;
    }
    for (let bi = KMIN; bi <= KMAX; bi++) {
      for (let bj = KMIN; bj <= KMAX; bj++) {
        const x0 = 5 * bi + 1, y0 = 5 * bj + 1;
        const c = P(x0 + 2, y0 + 2);
        if (pass === 0 ? !visOld(c[0], c[1], 150, 90) : (visOld(c[0], c[1], 150, 90) || !visible(c[0], c[1], 150, 90))) continue;
        const pinIdx = pinBlocks[bi + ',' + bj];
        blocks.push({ p: pts([P(x0 - 0.05, y0 - 0.05), P(x0 + 4.05, y0 - 0.05), P(x0 + 4.05, y0 + 4.05), P(x0 - 0.05, y0 + 4.05)]) });
        grass.push({
          p: pts([P(x0 + 0.3, y0 + 0.3), P(x0 + 3.7, y0 + 0.3), P(x0 + 3.7, y0 + 3.7), P(x0 + 0.3, y0 + 3.7)]),
          c: (bi + bj) % 2 ? '#86c45a' : '#7fbe55'
        });

        lamp(x0 + 3.9, y0 + 2);
        lamp(x0 + 2, y0 + 3.9);
        if (R() < 0.5) light(x0 + 3.9, y0 + 0.1);

        if (bi === 2 && bj === 2) {
          plazas.push({ p: pts([P(x0 + 0.65, y0 + 0.65), P(x0 + 3.35, y0 + 0.65), P(x0 + 3.35, y0 + 3.35), P(x0 + 0.65, y0 + 3.35)]) });
          const fc = P(x0 + 2, y0 + 2, 0);
          scene.push(mk({ isFountain: true, depth: x0 + y0 + 4, cx: fc[0], by: fc[1], px: fc[0] - 3, py: fc[1] - 20, sp: fc[1] - 26 }));
          tree(x0 + 0.5, y0 + 0.5);
          tree(x0 + 3.5, y0 + 0.5);
          tree(x0 + 0.5, y0 + 3.5);
          tree(x0 + 3.5, y0 + 3.5);
          tree(x0 + 2, y0 + 0.45);
          tree(x0 + 0.45, y0 + 2);
          walker(x0 + 1, y0 + 1, x0 + 3, y0 + 1.2);
          continue;
        }

        for (let li = 0; li < 2; li++) {
          for (let lj = 0; lj < 2; lj++) {
            const lx = x0 + li * 2, ly = y0 + lj * 2, t = R();
            if (t < 0.22) {
              tree(lx + 0.6, ly + 0.6);
              tree(lx + 1.4, ly + 1.2);
              if (R() < 0.5) tree(lx + 1.1, ly + 0.5);
              continue;
            }
            const house = t > 0.6;
            const w = 1.0 + R() * 0.3, d = 1.0 + R() * 0.3;
            const x = lx + (2 - w) / 2, y = ly + (2 - d) / 2;
            const cp = pick(pal);
            if (!house) {
              const h = 40 + R() * 50, m = 0.14;
              const rows = Math.max(0, Math.floor((h - 21) / 15));
              const wl = wins(x, y, w, d, h, 'L', rows, 16), wr = wins(x, y, w, d, h, 'R', rows, 16);
              let awnA = '', awnB = '';
              for (let i = 0; i < 6; i++) {
                const u0 = w * 0.08 + (w * 0.84 * i) / 6, u1 = w * 0.08 + (w * 0.84 * (i + 1)) / 6;
                const q = pd([P(x + u0, y + d, 14), P(x + u1, y + d, 14), P(x + u1, y + d + 0.16, 10), P(x + u0, y + d + 0.16, 10)]);
                if (i % 2) awnB += q; else awnA += q;
              }
              scene.push(mk({
                isBldg: true, depth: x + w / 2 + y + d / 2,
                left: pts([P(x, y + d, 0), P(x + w, y + d, 0), P(x + w, y + d, h), P(x, y + d, h)]),
                right: pts([P(x + w, y, 0), P(x + w, y + d, 0), P(x + w, y + d, h), P(x + w, y, h)]),
                top: pts([P(x, y, h), P(x + w, y, h), P(x + w, y + d, h), P(x, y + d, h)]),
                topIn: pts([P(x + m, y + m, h), P(x + w - m, y + m, h), P(x + w - m, y + d - m, h), P(x + m, y + d - m, h)]),
                cl: cp.l, cr: cp.r, ct: cp.t, ctIn: shade(cp.t, 0.92),
                winL: wl[0], winLo: wl[1], winR: wr[0], winRo: wr[1],
                shadow: shadowOf(x, y, w, d, h),
                cornL: pts([P(x, y + d, h - 4), P(x + w, y + d, h - 4), P(x + w, y + d, h), P(x, y + d, h)]),
                cornR: pts([P(x + w, y, h - 4), P(x + w, y + d, h - 4), P(x + w, y + d, h), P(x + w, y, h)]),
                shop: pd([P(x + w * 0.08, y + d, 1), P(x + w * 0.38, y + d, 1), P(x + w * 0.38, y + d, 10), P(x + w * 0.08, y + d, 10)]) + pd([P(x + w * 0.62, y + d, 1), P(x + w * 0.92, y + d, 1), P(x + w * 0.92, y + d, 10), P(x + w * 0.62, y + d, 10)]),
                awnA, awnB, awnC: pick(awns),
                door: pts([P(x + w * 0.42, y + d, 0), P(x + w * 0.58, y + d, 0), P(x + w * 0.58, y + d, 10), P(x + w * 0.42, y + d, 10)]),
                edge: ln(P(x + w, y + d, 2), P(x + w, y + d, h - 2)),
                ...roofTank(x, y, w, d, h),
                ...roofAC(x, y, w, d, h),
                fd: (2.5 + R() * 3).toFixed(1), fb: (-R() * 5).toFixed(1)
              }));
            } else {
              const h = 24 + R() * 8, rh = 14 + R() * 7, mid = y + d / 2;
              const B = P(x + w, mid, h + rh);
              const wl = wins(x, y, w, d, h, 'L', 1, 8), wr = wins(x, y, w, d, h, 'R', 1, 8);
              scene.push(mk({
                isHouse: true, depth: x + w / 2 + y + d / 2,
                left: pts([P(x, y + d, 0), P(x + w, y + d, 0), P(x + w, y + d, h), P(x, y + d, h)]),
                right: pts([P(x + w, y, 0), P(x + w, y + d, 0), P(x + w, y + d, h), P(x + w, y, h)]),
                gable: pts([P(x + w, y, h), P(x + w, y + d, h), B]),
                roof: pts([P(x - 0.08, y + d + 0.08, h - 1), P(x + w + 0.08, y + d + 0.08, h - 1), P(x + w + 0.08, mid, h + rh), P(x - 0.08, mid, h + rh)]),
                cl: cp.l, cr: cp.r, roofC: pick(roofs), shadow: shadowOf(x, y, w, d, h + rh * 0.6),
                winL: wl[0], winLo: wl[1], winR: wr[0], winRo: wr[1],
                door: pts([P(x + w * 0.42, y + d, 0), P(x + w * 0.58, y + d, 0), P(x + w * 0.58, y + d, 12), P(x + w * 0.42, y + d, 12)]),
                edge: ln(P(x - 0.08, mid, h + rh), P(x + w + 0.08, mid, h + rh))
              }));
            }
            if (R() < 0.35) tree(lx + 0.18, ly + 1.85);
          }
        }

        const wr = R();
        const nPre = scene.length;
        if (wr < 0.35) walker(x0 + 3.88, y0 + 1.6, x0 + 3.88, y0 + 3.8);
        else if (wr < 0.6) walker(x0 + 1.6, y0 + 3.88, x0 + 3.8, y0 + 3.88);
        if (pinIdx !== undefined) scene.length = nPre;
      }
    }
    if (pass === 1) s = savedS;
  }

  const PIN_LOOKS = [
    { shirt: '#3d6fb5', pants: '#2c3350', hat: '#2b3a66', brim: 'none', bag: '#d95a4a', vest: 'none', apron: 'none', ring: '#2fbf71' },
    { shirt: '#2b2f3a', pants: '#2b2f3a', hat: '#ffffff', brim: 'none', bag: 'none', vest: 'none', apron: '#f4f4f0', ring: '#ffffff' },
    { shirt: '#3d6fb5', pants: '#2c3350', hat: '#f2c230', brim: '#f2c230', bag: 'none', vest: '#d6f03a', apron: 'none', ring: '#fbb43c' },
    { shirt: '#4a5568', pants: '#2c3350', hat: '#d9483b', brim: '#d9483b', bag: '#222a3a', vest: 'none', apron: 'none', ring: '#e5484d' },
    { shirt: '#b07a3a', pants: '#5b4a3a', hat: '#5a3a22', brim: 'none', bag: 'none', vest: 'none', apron: '#c9a56a', ring: '#ffffff' }
  ];

  const pinWalkers: PinWalker[] = [];
  const pinData: PinData[] = [];
  PIN_DEF.forEach((d, i) => {
    const px0 = 5 * d.bi + 1, py0 = 5 * d.bj + 1, pm = 0.14, pe = 4 - pm;
    const rt: Array<[number, number]> = [
      P(px0 + 1.6, py0 + pe),
      P(px0 + pe, py0 + pe),
      P(px0 + pe, py0 + 1.6),
      P(px0 + pe, py0 + pe),
      P(px0 + 1.6, py0 + pe)
    ];
    const cum = [0];
    for (let k = 1; k < rt.length; k++) {
      cum.push(cum[k - 1] + Math.hypot(rt[k][0] - rt[k - 1][0], rt[k][1] - rt[k - 1][1]));
    }
    const len = cum[cum.length - 1];
    pinData.push({ route: rt, cum, len, speed: d.speed, off: d.off * len });
    const pwDef = {
      isPW: true,
      depth: px0 + py0 + 7.9,
      id: 'pw' + i,
      bb: (-0.13 * i).toFixed(2),
      skin: skins[i % 3],
      hair: hairs[i % 3],
      ...PIN_LOOKS[i]
    };
    scene.push(mk(pwDef));
    pinWalkers.push(pwDef);
  });

  scene.sort((a, b) => a.depth - b.depth);

  const cars: CityCar[] = [];
  const carCols = ['#d9483b', '#f2b134', '#3b78c4', '#f4f4f0', '#2f9e6d', '#7a4fb5', '#222a3a'];
  const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => ({
    t: pts([Lc(x0, y0, z1), Lc(x1, y0, z1), Lc(x1, y1, z1), Lc(x0, y1, z1)]),
    l: pts([Lc(x0, y1, z0), Lc(x1, y1, z0), Lc(x1, y1, z1), Lc(x0, y1, z1)]),
    r: pts([Lc(x1, y0, z0), Lc(x1, y1, z0), Lc(x1, y1, z1), Lc(x1, y0, z1)])
  });

  let labeled = false;
  const T = 16, GX = [0, 6.5], GY = [8, 14.5];

  // one-way streets: only the far lane (away from sidewalk walkers) is used, so cars never share a lane with an opposite car
  for (const axis of ['x', 'y'] as const) {
    for (let k = KMIN; k <= KMAX; k++) {
      for (let lane = 1; lane < 2; lane++) {
        const off = 0.72;
        let aMin: number | null = null, aMax: number | null = null;
        for (let a = A0; a <= A1; a += 0.5) {
          const q = axis === 'x' ? P(a, 5 * k + off) : P(5 * k + off, a);
          if (visible(q[0], q[1], 40, 40)) {
            if (aMin === null) aMin = a;
            aMax = a;
          }
        }
        const vanLane = axis === 'x' && k === 3;
        if (aMin === null || (!vanLane && R() < 0.05)) continue;
        const v = 1.0 + R() * 0.5;
        const sA = aMax!, eA = aMin;
        const win = axis === 'x' ? GX : GY;
        const stops: number[] = [];
        for (let j = KMIN - 1; j <= KMAX + 1; j++) {
          const stp = 5 * j + 1.5;
          if (stp < sA && stp > eA) stops.push(stp);
        }
        stops.sort((a, b) => b - a);
        let t = 0, p = sA;
        const kf: Array<[number, number]> = [[0, sA]];
        for (const stp of stops) {
          t += Math.abs(stp - p) / v;
          p = stp;
          const ph = t % T;
          if (!(ph >= win[0] && ph + 2.2 / v <= win[1])) {
            let tk = Math.floor(t / T) * T + win[0];
            if (tk < t) tk += T;
            kf.push([t, p]);
            kf.push([tk, p]);
            t = tk;
          }
        }
        t += Math.abs(eA - p) / v;
        const draw = t, D = Math.ceil(draw / T) * T;
        kf.push([draw, eA]);
        if (D > draw + 0.01) kf.push([D, eA]);
        const Dd = kf[kf.length - 1][0];
        const p0 = axis === 'x' ? P(sA, 5 * k + off) : P(5 * k + off, sA);
        const vals = kf.map((e) => {
          const q = axis === 'x' ? P(e[1], 5 * k + off) : P(5 * k + off, e[1]);
          return f(q[0] - p0[0]) + ' ' + f(q[1] - p0[1]);
        }).join(';');
        const kt = kf.map((e) => (e[0] / Dd).toFixed(4)).join(';');
        
        // 2 cars per loop, spaced half a loop apart (rounded to whole signal cycles) so they never bunch up
        const n = Math.max(1, Math.min(3, Math.floor(Dd / T)));
        const delta = T * Math.max(1, Math.round(Dd / T / n));
        const baseBegin = -T * Math.floor(R() * (Dd / T));

        for (let i = 0; i < n; i++) {
          const van = !labeled && vanLane && i === 0;
          if (van) labeled = true;
          const type = van ? 2 : (R() < 0.3 ? 1 : 0); // 0 sedan, 1 SUV, 2 van
          const col = van ? '#243b6b' : pick(carCols);
          const hlen = type === 2 ? 0.46 : type === 1 ? 0.42 : 0.4, hw = 0.19;
          const clen = type === 2 ? 0.34 : type === 1 ? 0.27 : 0.17;
          const cz0 = type === 2 ? 12 : 10, cz1 = type === 2 ? 18 : type === 1 ? 16.5 : 15.5;
          const hl = axis === 'x' ? [-hlen, hlen, -hw, hw] : [-hw, hw, -hlen, hlen];
          const cb = axis === 'x' ? [-clen, clen * 0.85, -0.15, 0.15] : [-0.15, 0.15, -clen, clen * 0.85];
          const gi = 0.035;
          const gb = axis === 'x' ? [cb[0] + gi, cb[1] - gi, cb[2], cb[3]] : [cb[0], cb[1], cb[2] + gi, cb[3] - gi];
          const bd = box(hl[0], hl[1], hl[2], hl[3], 3, cz0);
          const kb = box(cb[0], cb[1], cb[2], cb[3], cz0, cz1);
          const gk = box(gb[0], gb[1], gb[2], gb[3], cz0 + 0.9, cz1 - 0.8);

          // wheels: near side (visible) at +y / +x; far side peeks under the body
          const wl = hlen * 0.62;
          const wa = axis === 'x' ? Lc(-wl, hl[3], 3) : Lc(hl[1], -wl, 3);
          const wb = axis === 'x' ? Lc(wl, hl[3], 3) : Lc(hl[1], wl, 3);
          const wc = axis === 'x' ? Lc(-wl, hl[2], 3) : Lc(hl[0], -wl, 3);
          const fr = axis === 'x' ? Lc(hl[0], 0, 7) : Lc(0, hl[2], 7);
          const F = axis === 'x' ? hl[0] : hl[2];
          const far = F - 1.7;
          const cone = axis === 'x'
            ? pts([Lc(F, -0.12, 2), Lc(F, 0.12, 2), Lc(far, 0.5, 0), Lc(far, -0.5, 0)])
            : pts([Lc(-0.12, F, 2), Lc(0.12, F, 2), Lc(0.5, far, 0), Lc(-0.5, far, 0)]);

          // rear face is the visible one (cars drive toward -x / -y): tail-light bar, plate
          const rear = (u0: number, u1: number, z0: number, z1: number) => axis === 'x'
            ? pts([Lc(hl[1], u0, z0), Lc(hl[1], u1, z0), Lc(hl[1], u1, z1), Lc(hl[1], u0, z1)])
            : pts([Lc(u0, hl[3], z0), Lc(u1, hl[3], z0), Lc(u1, hl[3], z1), Lc(u0, hl[3], z1)]);
          const sideP = (u0: number, u1: number, z0: number, z1: number) => axis === 'x'
            ? pts([Lc(u0, hl[3], z0), Lc(u1, hl[3], z0), Lc(u1, hl[3], z1), Lc(u0, hl[3], z1)])
            : pts([Lc(hl[1], u0, z0), Lc(hl[1], u1, z0), Lc(hl[1], u1, z1), Lc(hl[1], u0, z1)]);
          const yc = col === '#f2b134' && type === 0;
          const dl = [-hlen * 0.05, hlen * 0.55];
          const dr = (u: number) => {
            const a = axis === 'x' ? Lc(u, hl[3], 4) : Lc(hl[1], u, 4);
            const b2 = axis === 'x' ? Lc(u, hl[3], cz0) : Lc(hl[1], u, cz0);
            return 'M' + f(a[0]) + ' ' + f(a[1]) + 'L' + f(b2[0]) + ' ' + f(b2[1]);
          };

          cars.push({
            tf: 'translate(' + f(p0[0]) + ',' + f(p0[1]) + ')',
            vals, kt, dur: Dd, begin: baseBegin - i * delta, isVan: van,
            w1x: f(wc[0]), w1y: f(wc[1]), w2x: f(wa[0]), w2y: f(wa[1]), w3x: f(wb[0]), w3y: f(wb[1]),
            hx: f(fr[0]), hy: f(fr[1]), cone,
            bl: bd.l, br: bd.r, bt: bd.t, cl: shade(col, 1.0), cr: shade(col, 0.78), ct: shade(col, 1.12),
            kl: kb.l, kr: kb.r, kt2: kb.t, gl: gk.l, gr: gk.r,
            skirtL: sideP(-hlen, hlen, 3, 4.6), skirtR: rear(-hw, hw, 3, 4.6),
            doors: dr(dl[0]) + dr(dl[1] - 0.25),
            tl: rear(-hw + 0.03, hw - 0.03, 6.4, 8.2), plate: rear(-0.06, 0.06, 4.2, 5.4),
            sign: yc ? box(-0.04, 0.04, -0.05, 0.05, cz1, cz1 + 2.2).t : ''
          });
        }
      }
    }
  }

  const vanLabels = cars.filter(c => c.isVan);

  cachedCityData = { roads, dashes, zebras, blocks, grass, plazas, scene, cars, vanLabels, glows, pinWalkers, pinData };
  return cachedCityData;
}
