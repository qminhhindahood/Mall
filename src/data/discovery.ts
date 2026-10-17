import type { SiteData } from './site';
import type { ExplorerSelection } from '../components/Explorer';
import type { FloorDataset } from '../runtime/scene-contract';
import { categoryFloor } from './content';

export function defaultDiscoveryCategory(site:SiteData) {
  return site.content.categories.find(row=>row.name.vi==='Ẩm thực')?.id??site.content.categories[0]?.id??'';
}

export function discoveryFloor(site: SiteData, selection: ExplorerSelection, geometry: FloorDataset) {
  const destination = site.destinations.find(row => row.id === selection.destinationId);
  if (destination?.floors.includes(selection.floorId)) return selection.floorId;
  if (selection.areaId) {
    const area = site.content.areas.find(row => row.id === selection.areaId);
    if (area) return area.floorId;
  }
  if (geometry.floors.some(row => row.id === selection.discoveryFloorId)) return selection.discoveryFloorId!;
  return categoryFloor(site.destinations, selection.discoveryCategoryId ?? defaultDiscoveryCategory(site), geometry, selection.floorId);
}
