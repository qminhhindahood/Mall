import type { FloorGeometry } from '../runtime/scene-contract';

/** Shared estimated plan frame, preserving the relative extent of every source. */
export function sharedFloorBounds(floors:readonly FloorGeometry[]):[number,number,number,number] {
  return [Math.min(...floors.map(f=>f.bounds[0])),Math.min(...floors.map(f=>f.bounds[1])),Math.max(...floors.map(f=>f.bounds[2])),Math.max(...floors.map(f=>f.bounds[3]))];
}
