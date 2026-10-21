import type { DirectorySnapshot, Destination } from './content';

export type PrecisionHolds = {
  revision: string; mallId: string; baseDirectoryRevision: string;
  holds: { destinationId: string; floorId: string; originalLocations: Destination['locations']; reason: string }[];
};

/** Reduce display precision without rewriting the approved source or its geometry. */
export function applyPrecisionHolds(snapshot: DirectorySnapshot, evidence: PrecisionHolds): DirectorySnapshot {
  if (snapshot.mallId !== evidence.mallId || snapshot.approval !== 'approved') return snapshot;
  if (snapshot.revision !== evidence.baseDirectoryRevision) throw new Error('Precision holds require reconciliation with the new directory revision');
  const heldAreas = new Set<string>();
  for (const hold of evidence.holds) {
    const destination = snapshot.destinations.find(row => row.id === hold.destinationId);
    if (!destination || JSON.stringify(destination.locations) !== JSON.stringify(hold.originalLocations)) throw new Error(`Precision hold source drift: ${hold.destinationId}`);
    const location = destination.locations.find(row => row.floorId === hold.floorId);
    if (!location?.areaIds.length) throw new Error(`Precision hold has no original area: ${hold.destinationId}`);
    location.areaIds.forEach(id => heldAreas.add(id));
  }
  const destinations = snapshot.destinations.map(destination => ({...destination, locations: destination.locations.map(location => {
    const hold = evidence.holds.find(row => row.destinationId === destination.id && row.floorId === location.floorId);
    return hold ? {...location, certainty: 'floor-confirmed' as const, areaIds: [], source: `${location.source}; display precision held by data/research/${evidence.revision}.json: ${hold.reason}`} : location;
  })}));
  // Remove only unoccupied held selection areas; retain every original polygon.
  const referenced = new Set(destinations.flatMap(row => row.locations.flatMap(location => location.areaIds)));
  const areas = snapshot.areas.filter(area => !heldAreas.has(area.id) || referenced.has(area.id));
  return {...snapshot, revision: `${snapshot.revision}+${evidence.revision}`, destinations, areas};
}
