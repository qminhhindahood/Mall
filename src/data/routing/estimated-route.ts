import type { FloorDataset, FloorGeometry } from '../../runtime/scene-contract';
import type { Bilingual } from '../content';
import type { PlanIcon } from '../plan-icons';

/**
 * Estimated walking guidance for any pair of places.
 *
 * The walkway is the schematic floor outline minus every traced unit block, so a route can only run along
 * corridors visible on the supplied plan. Floors connect only through escalator and lift icons taken from the
 * mall's own floor-plan features. Doorways are not known: a route ends on the corridor in front of the unit.
 * This is guidance, not a surveyed path: no distances or times are claimed.
 */
const CELL = 0.5;
type Pt = [number, number];

export type Endpoint =
  | { kind: 'area'; floorId: string; regionIds: string[]; name: string; label?: Pt }
  | { kind: 'point'; floorId: string; point: Pt; name: string }
  | { kind: 'floor'; floorId: string; name: string };

export type EstimatedStep = { floorId: string; instruction: Bilingual; transferTo?: string };
export type EstimatedRoute =
  | { status: 'unavailable'; reason: 'no-map' | 'no-start' | 'no-destination' | 'no-path' | 'no-floor-connection' | 'same-place' }
  | { status: 'ready'; basis: 'estimated'; legs: { floorId: string; points: Pt[] }[]; steps: EstimatedStep[]; crossFloor: boolean; limitations: Bilingual[] };

export type RouteContext = {
  mallId: string;
  geometry: FloorDataset;
  icons: (floorId: string) => PlanIcon[];
  /** Named units on a floor, for "near X" hints. */
  landmarks: (floorId: string) => { name: string; point: Pt }[];
};

type Grid = { floor: FloorGeometry; x0: number; y0: number; w: number; h: number; main: Uint8Array; near: Uint8Array };
const gridCache = new Map<string, Grid | null>();

const cellOf = (g: Grid, [x, y]: Pt) => {
  const cx = Math.floor((x - g.x0) / CELL), cy = Math.floor((y - g.y0) / CELL);
  return cx < 0 || cy < 0 || cx >= g.w || cy >= g.h ? -1 : cy * g.w + cx;
};
const centre = (g: Grid, i: number): Pt => [g.x0 + ((i % g.w) + 0.5) * CELL, g.y0 + (Math.floor(i / g.w) + 0.5) * CELL];

function draw(ctx: CanvasRenderingContext2D, g: { x0: number; y0: number }, rings: Pt[][]) {
  const path = new Path2D();
  for (const ring of rings) { ring.forEach((p, i) => i ? path.lineTo(p[0], p[1]) : path.moveTo(p[0], p[1])); path.closePath(); }
  ctx.fill(path, 'evenodd');
}

function buildGrid(mallId: string, floor: FloorGeometry): Grid | null {
  const key = `${mallId}:${floor.id}:${floor.regions.length}`;
  if (gridCache.has(key)) return gridCache.get(key)!;
  let grid: Grid | null = null;
  const outline = floor.presentation?.outline;
  if (typeof document !== 'undefined' && outline?.length) {
    const xs = outline.map(p => p[0]), ys = outline.map(p => p[1]);
    const x0 = Math.min(...xs) - 1, y0 = Math.min(...ys) - 1;
    const w = Math.ceil((Math.max(...xs) - x0 + 1) / CELL), h = Math.ceil((Math.max(...ys) - y0 + 1) / CELL);
    const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.setTransform(1 / CELL, 0, 0, 1 / CELL, -x0 / CELL, -y0 / CELL);
      ctx.fillStyle = '#fff'; draw(ctx, { x0, y0 }, [outline as Pt[]]);
      ctx.fillStyle = '#000';
      for (const region of floor.regions) draw(ctx, { x0, y0 }, [region.outer, ...region.holes]);
      const data = ctx.getImageData(0, 0, w, h).data;
      const walk = new Uint8Array(w * h);
      for (let i = 0; i < w * h; i++) walk[i] = data[i * 4] > 200 && data[i * 4 + 3] > 200 ? 1 : 0;
      // Keep only the largest connected corridor; isolated pockets cannot be reached.
      const label = new Int32Array(w * h); let best = 0, bestSize = 0, count = 0;
      for (let s = 0; s < w * h; s++) {
        if (!walk[s] || label[s]) continue;
        count++; let size = 0; const stack = [s]; label[s] = count;
        while (stack.length) {
          const c = stack.pop()!; size++; const cx = c % w, cy = (c - cx) / w;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            const n = ny * w + nx; if (walk[n] && !label[n]) { label[n] = count; stack.push(n); }
          }
        }
        if (size > bestSize) { bestSize = size; best = count; }
      }
      const main = new Uint8Array(w * h), near = new Uint8Array(w * h);
      for (let i = 0; i < w * h; i++) main[i] = label[i] === best ? 1 : 0;
      for (let i = 0; i < w * h; i++) {
        if (!main[i]) continue; const cx = i % w, cy = (i - cx) / w;
        for (let dy = -1; dy <= 1 && !near[i]; dy++) for (let dx = -1; dx <= 1; dx++) {
          const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h || !main[ny * w + nx]) { near[i] = 1; break; }
        }
      }
      grid = { floor, x0, y0, w, h, main, near };
    }
  }
  gridCache.set(key, grid);
  return grid;
}

function nearestMain(g: Grid, p: Pt, radius = 24): number {
  const c = cellOf(g, p); if (c < 0) return -1;
  const cx = c % g.w, cy = (c - cx) / g.w; let best = -1, bestD = Infinity;
  for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
    const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= g.w || ny >= g.h) continue;
    const i = ny * g.w + nx; if (!g.main[i]) continue; const d = dx * dx + dy * dy; if (d < bestD) { bestD = d; best = i; }
  }
  return best;
}

/** Corridor cells touching or close to a unit's blocks. */
function frontage(g: Grid, regionIds: string[]): number[] {
  const regions = g.floor.regions.filter(r => regionIds.includes(r.id)); if (!regions.length) return [];
  const mask = document.createElement('canvas'); mask.width = g.w; mask.height = g.h;
  const ctx = mask.getContext('2d', { willReadFrequently: true })!;
  ctx.setTransform(1 / CELL, 0, 0, 1 / CELL, -g.x0 / CELL, -g.y0 / CELL); ctx.fillStyle = '#fff';
  for (const region of regions) draw(ctx, g, [region.outer, ...region.holes]);
  const data = ctx.getImageData(0, 0, g.w, g.h).data;
  let reach = new Uint8Array(g.w * g.h); for (let i = 0; i < g.w * g.h; i++) reach[i] = data[i * 4] > 100 ? 1 : 0;
  for (let ring = 1; ring <= 10; ring++) {
    const next = reach.slice();
    for (let i = 0; i < g.w * g.h; i++) {
      if (!reach[i]) continue; const cx = i % g.w, cy = (i - cx) / g.w;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = cx + dx, ny = cy + dy; if (nx >= 0 && ny >= 0 && nx < g.w && ny < g.h) next[ny * g.w + nx] = 1; }
    }
    reach = next;
    const hits: number[] = []; for (let i = 0; i < g.w * g.h; i++) if (reach[i] && g.main[i]) hits.push(i);
    if (hits.length) return hits;
  }
  return [];
}

class Heap {
  private a: [number, number][] = [];
  push(c: number, n: number) { const a = this.a; a.push([c, n]); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (a[p][0] <= a[i][0]) break; [a[p], a[i]] = [a[i], a[p]]; i = p; } }
  pop(): [number, number] | undefined { const a = this.a; if (!a.length) return; const top = a[0], last = a.pop()!; if (a.length) { a[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < a.length && a[l][0] < a[m][0]) m = l; if (r < a.length && a[r][0] < a[m][0]) m = r; if (m === i) break; [a[m], a[i]] = [a[i], a[m]]; i = m; } } return top; }
  get size() { return this.a.length; }
}

type Link = { to: number; cost: number; kind: 'lift' | 'escalator'; label: string };
const zoneOf = (icon: PlanIcon) => /Zone\s*([A-Z])/i.exec(icon.label.en)?.[1]?.toUpperCase();

function simplify(points: Pt[], tolerance: number): Pt[] {
  if (points.length < 3) return points;
  const [a, b] = [points[0], points[points.length - 1]]; let index = 0, far = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    const d = Math.abs(dy * x - dx * y + b[0] * a[1] - b[1] * a[0]) / len; if (d > far) { far = d; index = i; }
  }
  if (far <= tolerance) return [a, b];
  return [...simplify(points.slice(0, index + 1), tolerance).slice(0, -1), ...simplify(points.slice(index), tolerance)];
}

const t = (en: string, vi: string): Bilingual => ({ en, vi });

export function planEstimatedRoute(ctx: RouteContext, from: Endpoint | null, to: Endpoint): EstimatedRoute {
  const unavailable = (reason: Extract<EstimatedRoute, { status: 'unavailable' }>['reason']): EstimatedRoute => ({ status: 'unavailable', reason });
  if (!from) return unavailable('no-start');
  if (typeof document === 'undefined') return unavailable('no-map');
  const floors = ctx.geometry.floors.slice().sort((a, b) => a.order - b.order);
  const grids = floors.map(f => buildGrid(ctx.mallId, f));
  const index = (id: string) => floors.findIndex(f => f.id === id);
  const stride = Math.max(...grids.map(g => (g ? g.w * g.h : 0))) + 1;
  const node = (fi: number, cell: number) => fi * stride + cell;

  // Vertical links from escalator and lift icons.
  const links = new Map<number, Link[]>();
  const add = (a: number, l: Link) => links.set(a, [...(links.get(a) ?? []), l]);
  const connectors = floors.map((f, fi) => ({ fi, icons: ctx.icons(f.id).filter(i => i.kind === 'lift' || i.kind === 'escalator').map(icon => ({ icon, cell: grids[fi] ? nearestMain(grids[fi]!, [icon.x, icon.y], 20) : -1 })).filter(c => c.cell >= 0) }));
  for (let i = 0; i < connectors.length; i++) for (let j = i + 1; j < connectors.length; j++) {
    for (const a of connectors[i].icons.filter(c => c.icon.kind === 'lift')) for (const b of connectors[j].icons.filter(c => c.icon.kind === 'lift')) {
      const za = zoneOf(a.icon), zb = zoneOf(b.icon); if (!za || za !== zb) continue;
      const cost = 30 + 6 * (j - i), label = `Zone ${za}`;
      add(node(i, a.cell), { to: node(j, b.cell), cost, kind: 'lift', label }); add(node(j, b.cell), { to: node(i, a.cell), cost, kind: 'lift', label });
    }
  }
  for (let i = 0; i + 1 < connectors.length; i++) for (const a of connectors[i].icons.filter(c => c.icon.kind === 'escalator')) {
    let best: (typeof a) | undefined, bestD = 14;
    for (const b of connectors[i + 1].icons.filter(c => c.icon.kind === 'escalator')) { const d = Math.hypot(a.icon.x - b.icon.x, a.icon.y - b.icon.y); if (d < bestD) { bestD = d; best = b; } }
    if (best) { add(node(i, a.cell), { to: node(i + 1, best.cell), cost: 20, kind: 'escalator', label: '' }); add(node(i + 1, best.cell), { to: node(i, a.cell), cost: 20, kind: 'escalator', label: '' }); }
  }

  const arrival = (fi: number): number[] => {
    const g = grids[fi]; if (!g) return [];
    const list = connectors[fi].icons.slice().sort((a, b) => (a.icon.kind === 'lift' ? 0 : 1) - (b.icon.kind === 'lift' ? 0 : 1));
    return list.length ? [list[0].cell] : [];
  };
  const resolve = (e: Endpoint): { fi: number; cells: number[] } | null => {
    const fi = index(e.floorId), g = fi >= 0 ? grids[fi] : null; if (!g) return null;
    if (e.kind === 'point') { const c = nearestMain(g, e.point); return c >= 0 ? { fi, cells: [c] } : null; }
    if (e.kind === 'area') { const cells = frontage(g, e.regionIds); return cells.length ? { fi, cells } : null; }
    const cells = arrival(fi); return cells.length ? { fi, cells } : null;
  };
  const origin = resolve(from), target = resolve(to);
  if (!origin) return unavailable('no-start');
  if (!target) return unavailable('no-destination');
  if (from.kind === 'area' && to.kind === 'area' && from.floorId === to.floorId && from.regionIds.some(id => to.regionIds.includes(id))) return unavailable('same-place');

  const total = floors.length * stride;
  const dist = new Float64Array(total).fill(Infinity), prev = new Int32Array(total).fill(-1), via = new Map<number, Link>();
  const goal = new Set(target.cells.map(c => node(target.fi, c)));
  const heap = new Heap(); for (const c of origin.cells) { const n = node(origin.fi, c); dist[n] = 0; heap.push(0, n); }
  let end = -1;
  for (let top = heap.pop(); top; top = heap.pop()) {
    const [d, n] = top; if (d > dist[n]) continue;
    if (goal.has(n)) { end = n; break; }
    const fi = Math.floor(n / stride), cell = n % stride, g = grids[fi]!, cx = cell % g.w, cy = (cell - cx) / g.w;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue; const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= g.w || ny >= g.h) continue;
      const c2 = ny * g.w + nx; if (!g.main[c2]) continue;
      if (dx && dy && (!g.main[cy * g.w + nx] || !g.main[ny * g.w + cx])) continue;
      const m = node(fi, c2), step = (dx && dy ? 1.414 : 1) * CELL * (1 + 0.8 * g.near[c2]), nd = d + step;
      if (nd < dist[m]) { dist[m] = nd; prev[m] = n; via.delete(m); heap.push(nd, m); }
    }
    for (const link of links.get(n) ?? []) { const nd = d + link.cost; if (nd < dist[link.to]) { dist[link.to] = nd; prev[link.to] = n; via.set(link.to, link); heap.push(nd, link.to); } }
  }
  if (end < 0) return unavailable(origin.fi !== target.fi && !links.size ? 'no-floor-connection' : 'no-path');

  const chain: number[] = []; for (let n = end; n >= 0; n = prev[n]) chain.push(n); chain.reverse();
  const legs: { floorId: string; cells: number[]; arrivedBy?: Link }[] = [];
  for (const n of chain) {
    const fi = Math.floor(n / stride), cell = n % stride, last = legs.at(-1);
    if (!last || last.floorId !== floors[fi].id) legs.push({ floorId: floors[fi].id, cells: [cell], arrivedBy: via.get(n) });
    else last.cells.push(cell);
  }
  const legPoints = legs.map(leg => simplify(leg.cells.map(c => centre(grids[index(leg.floorId)]!, c)), 0.6));

  // Plain-language steps.
  const steps: EstimatedStep[] = [];
  const turnWord = (delta: number) => (delta > 0 ? t('right', 'phải') : t('left', 'trái'));
  legs.forEach((leg, li) => {
    const pts = legPoints[li], floorId = leg.floorId, marks = ctx.landmarks(floorId);
    const nearName = (p: Pt) => { let best = '', bestD = 7; for (const m of marks) { const d = Math.hypot(m.point[0] - p[0], m.point[1] - p[1]); if (d < bestD) { bestD = d; best = m.name; } } return best; };
    if (li === 0) steps.push({ floorId, instruction: from.kind === 'area' ? t(`Leave ${from.name} and join the main walkway.`, `Rời ${from.name} và đi ra lối đi chính.`) : from.kind === 'floor' ? t(`${from.name} is on ${floorId}. Start from the lift and escalator landing.`, `${from.name} ở tầng ${floorId}. Hãy bắt đầu từ khu thang máy và thang cuốn.`) : t(`Start at ${from.name}.`, `Bắt đầu tại ${from.name}.`) });
    else { const link = leg.arrivedBy!; steps.push({ floorId, instruction: link.kind === 'lift' ? t(`Leave the ${link.label} lift on ${floorId} and follow the walkway.`, `Ra khỏi thang máy ${link.label} ở tầng ${floorId} và đi theo lối đi.`) : t(`Step off the escalator on ${floorId} and follow the walkway.`, `Bước xuống thang cuốn ở tầng ${floorId} và đi theo lối đi.`) }); }
    let walked = 0, lastTurn: Pt | null = null;
    for (let k = 1; k < pts.length - 1; k++) {
      const a = Math.atan2(pts[k][1] - pts[k - 1][1], pts[k][0] - pts[k - 1][0]), b = Math.atan2(pts[k + 1][1] - pts[k][1], pts[k + 1][0] - pts[k][0]);
      let delta = ((b - a) * 180) / Math.PI; while (delta > 180) delta -= 360; while (delta <= -180) delta += 360;
      walked += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
      if (Math.abs(delta) < 40 || walked < 4) continue;
      if (lastTurn && Math.hypot(lastTurn[0] - pts[k][0], lastTurn[1] - pts[k][1]) < 6 && Math.abs(delta) < 75) continue;
      walked = 0; lastTurn = pts[k]; const where = nearName(pts[k]), side = turnWord(delta);
      steps.push({ floorId, instruction: where ? t(`Turn ${side.en} near ${where}.`, `Rẽ ${side.vi} gần ${where}.`) : t(`Turn ${side.en} at the junction.`, `Rẽ ${side.vi} tại ngã rẽ.`) });
    }
    const endPoint = pts[pts.length - 1], endName = nearName(endPoint);
    if (li < legs.length - 1) {
      const next = legs[li + 1].arrivedBy!, up = index(legs[li + 1].floorId) > index(floorId);
      steps.push({ floorId, transferTo: legs[li + 1].floorId, instruction: next.kind === 'lift' ? t(`Take the ${next.label} lift to ${legs[li + 1].floorId}.`, `Đi thang máy ${next.label} đến tầng ${legs[li + 1].floorId}.`) : t(`Take the escalator ${up ? 'up' : 'down'} to ${legs[li + 1].floorId}.`, `Đi thang cuốn ${up ? 'lên' : 'xuống'} tầng ${legs[li + 1].floorId}.`) });
    } else if (to.kind === 'area') {
      let side = '';
      if (to.label && pts.length > 1) { const [p, q] = [pts[pts.length - 2], endPoint]; const cross = (q[0] - p[0]) * (to.label[1] - q[1]) - (q[1] - p[1]) * (to.label[0] - q[0]); side = cross > 0 ? 'right' : 'left'; }
      steps.push({ floorId, instruction: side ? t(`${to.name} is on your ${side}${endName && endName !== to.name ? `, near ${endName}` : ''}.`, `${to.name} ở bên ${side === 'right' ? 'phải' : 'trái'}${endName && endName !== to.name ? `, gần ${endName}` : ''}.`) : t(`${to.name} is just ahead.`, `${to.name} ở ngay phía trước.`) });
    } else if (to.kind === 'floor') {
      steps.push({ floorId, instruction: t(`${to.name} is on ${floorId}. Look around this landing and follow the in-mall signs.`, `${to.name} ở tầng ${floorId}. Hãy quan sát quanh khu vực này và đi theo biển chỉ dẫn trong trung tâm.`) });
    } else {
      steps.push({ floorId, instruction: t(`You have reached ${to.name}.`, `Bạn đã đến ${to.name}.`) });
    }
  });

  return {
    status: 'ready', basis: 'estimated', crossFloor: legs.length > 1,
    legs: legs.map((leg, li) => ({ floorId: leg.floorId, points: legPoints[li] })), steps,
    limitations: [t('Estimated from the floor plan. Follow the corridors and in-mall signs.', 'Ước tính từ sơ đồ tầng. Hãy đi theo lối đi và biển chỉ dẫn trong trung tâm.')],
  };
}
