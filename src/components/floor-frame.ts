import type { FloorGeometry } from '../runtime/scene-contract';

/** Shared estimated plan frame, preserving the relative extent of every source. */
export function sharedFloorBounds(floors:readonly FloorGeometry[]):[number,number,number,number] {
  const points=floors.flatMap(f=>f.presentation?.outline??[]);
  return [Math.min(...floors.map(f=>f.bounds[0]),...points.map(p=>p[0]-.2)),Math.min(...floors.map(f=>f.bounds[1]),...points.map(p=>p[1]-.2)),Math.max(...floors.map(f=>f.bounds[2]),...points.map(p=>p[0]+.2)),Math.max(...floors.map(f=>f.bounds[3]),...points.map(p=>p[1]+1.6))];
}
