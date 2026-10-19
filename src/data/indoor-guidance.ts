import type { Destination } from './content';
import type { Locale, MallId } from '../runtime/scene-contract';

/** Official visitor resources checked 2026-10-19; neither establishes a routing graph. */
export function officialIndoorResource(mallId: MallId, locale: Locale) {
  return mallId === 'saigon-centre'
    ? `https://shopping.saigoncentre.com.vn/${locale}/floorplan`
    : 'https://vincom.com.vn/vincom-center-dong-khoi';
}

/** Floor comparison only. No circulation graph or position is inferred from map areas. */
export function destinationFloorGuidance(destination: Destination, requestedFloor: string, currentFloor: string, floorIds: readonly string[]) {
  const targetFloor = destination.floors.includes(requestedFloor) ? requestedFloor : destination.primaryFloor;
  const startFloor = floorIds.includes(currentFloor) ? currentFloor : null;
  const location = destination.locations.find(item => item.floorId === targetFloor);
  return {
    targetFloor,
    startFloor,
    relation: startFloor === null ? 'unknown' : startFloor === targetFloor ? 'same-floor' : 'different-floor',
    mapped: location?.certainty === 'area-confirmed' && location.areaIds.length > 0,
  } as const;
}
