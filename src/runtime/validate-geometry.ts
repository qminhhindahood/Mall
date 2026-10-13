import type { FloorDataset } from './scene-contract';
// Validate before replacing the independently rendered static guide.
export function validateGeometry(value: unknown, expected: string[]): FloorDataset {
  const data = value as FloorDataset;
  if (!data || typeof data.revision !== 'string' || !data.frame?.version || !Array.isArray(data.floors) || data.floors.length !== expected.length) throw new Error('Invalid floor geometry');
  const seen = new Set<string>();
  const point = (p: number[]) => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite);
  for (const floor of data.floors) {
    if (typeof floor.label!=='string' || !expected.includes(floor.id) || seen.has(floor.id) || !Number.isFinite(floor.elevation) || !Array.isArray(floor.bounds) || floor.bounds.length !== 4 || !floor.bounds.every(Number.isFinite) || floor.bounds[2] <= floor.bounds[0] || floor.bounds[3] <= floor.bounds[1] || !Array.isArray(floor.regions) || !floor.regions.length) throw new Error('Invalid floor');
    seen.add(floor.id);
    for (const region of floor.regions) if (!Array.isArray(region.outer) || region.outer.length < 3 || !region.outer.every(point) || !Array.isArray(region.holes) || !region.holes.every(ring => Array.isArray(ring) && ring.length >= 3 && ring.every(point))) throw new Error('Invalid region');
  }
  return data;
}
