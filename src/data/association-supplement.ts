import type { DirectorySnapshot, Destination } from './content';
import type { FloorDataset } from '../runtime/scene-contract';

export type AssociationSupplement = {
  revision: string; mallId: string; baseDirectoryRevision: string; activation: string;
  reviewEvidence: {path: string; sha256: string};
  protectedHolds: {destinationId: string; floorId: string; regionIds: string[]}[];
  associations: {
    destinationId: string; floorId: string; areaId: string; printedUnits: string; regionIds: string[];
    originalLocations: Destination['locations'];
    source: {sha256: string; transform: number[]; path: string};
    geometryRegions: FloorDataset['floors'][number]['regions'];
    associationDetail: NonNullable<Destination['locations'][number]['associationDetail']>;
    review: {status: string; reviewedBy: string|null; reviewedAt: string|null; decision: string};
  }[];
};
export type AssociationReviewReceipt = { decisions: {destinationId: string; floor: string; regionIds: string[]; printedUnits: string; reviewDecision: string}[] };

/** Add independently reviewed source-layout links; never create or edit polygons. */
export function applyAssociationSupplement(snapshot: DirectorySnapshot, geometry: FloorDataset, supplement: AssociationSupplement, receipt?: AssociationReviewReceipt): DirectorySnapshot {
  if (snapshot.mallId !== supplement.mallId || snapshot.approval !== 'approved' || supplement.activation !== 'accepted-independent-review') return snapshot;
  const fail = (message: string): never => { throw new Error(`Association supplement: ${message}`); };
  if (snapshot.revision !== supplement.baseDirectoryRevision) fail('directory revision drift');
  const protectedRegions = new Set(supplement.protectedHolds.flatMap(hold => hold.regionIds));
  for (const hold of supplement.protectedHolds) {
    const location = snapshot.destinations.find(d => d.id === hold.destinationId)?.locations.find(l => l.floorId === hold.floorId);
    if (!location || location.certainty !== 'floor-confirmed' || location.areaIds.length) fail(`precision hold must remain: ${hold.destinationId}`);
  }
  const occupied = new Set(snapshot.areas.flatMap(area => area.regionIds.map(id => `${area.floorId}:${id}`)));
  const areaIds = new Set(snapshot.areas.map(area => area.id));
  const selected = new Set<string>();
  const accepted = supplement.associations.filter(row => row.review.status === 'accepted');
  for (const row of accepted) {
    const decisions = receipt?.decisions.filter(decision => decision.destinationId === row.destinationId) ?? [];
    if (decisions.length !== 1 || decisions[0].floor !== row.floorId || JSON.stringify(decisions[0].regionIds) !== JSON.stringify(row.regionIds) || decisions[0].printedUnits !== row.printedUnits || decisions[0].reviewDecision !== row.review.decision) fail(`association differs from independent review: ${row.destinationId}`);
    if (!row.review.reviewedBy || !row.review.reviewedAt || !/^\d{4}-\d{2}-\d{2}$/.test(row.review.reviewedAt)) fail('missing independent review');
    if (!['accept-source-layout-area-only','accept-partial-area-only'].includes(row.review.decision)) fail('unaccepted review decision');
    if ((row.review.decision === 'accept-partial-area-only') !== (row.associationDetail.kind === 'partial-source-layout') || !row.associationDetail.note.en.trim() || !row.associationDetail.note.vi.trim()) fail('missing partial-area or bilingual limitation');
    const destination = snapshot.destinations.find(d => d.id === row.destinationId);
    if (!destination || JSON.stringify(destination.locations) !== JSON.stringify(row.originalLocations)) fail(`destination drift: ${row.destinationId}`);
    const location = destination!.locations.find(l => l.floorId === row.floorId);
    if (!location || location.certainty !== 'floor-confirmed' || location.areaIds.length) fail(`expected floor-only location: ${row.destinationId}`);
    const key = `${row.destinationId}:${row.floorId}`;
    if (selected.has(key) || areaIds.has(row.areaId)) fail('duplicate association');
    selected.add(key); areaIds.add(row.areaId);
    const floor = geometry.floors.find(f => f.id === row.floorId);
    if (!floor?.sources.some(s => s.sha256 === row.source.sha256 && JSON.stringify(s.transform) === JSON.stringify(row.source.transform))) fail(`source identity drift: ${row.destinationId}`);
    if (!row.regionIds.length || JSON.stringify(row.regionIds) !== JSON.stringify(row.geometryRegions.map(r => r.id))) fail('region evidence mismatch');
    for (const region of row.geometryRegions) {
      if (protectedRegions.has(region.id) || occupied.has(`${row.floorId}:${region.id}`)) fail(`occupied or held region: ${region.id}`);
      if (JSON.stringify(floor!.regions.find(r => r.id === region.id)) !== JSON.stringify(region)) fail(`polygon drift: ${region.id}`);
      occupied.add(`${row.floorId}:${region.id}`);
    }
  }
  const source = `data/research/${supplement.revision}.json; independently reviewed supplied-plan association only; current occupancy, exact doorway and walking connection not established`;
  const destinations = snapshot.destinations.map(destination => ({...destination, locations: destination.locations.map(location => {
    const row = accepted.find(a => a.destinationId === destination.id && a.floorId === location.floorId);
    return row ? {...location, certainty: 'area-confirmed' as const, areaIds: [row.areaId], associationDetail: row.associationDetail, source: `${location.source}; ${source}; printed units ${row.printedUnits}`} : location;
  })}));
  const areas = [...snapshot.areas, ...accepted.map(row => {
    const destination = snapshot.destinations.find(d => d.id === row.destinationId)!;
    return {id: row.areaId, floorId: row.floorId, regionIds: [...row.regionIds], name: {...destination.name}, review: {...destination.review, source, reviewedBy: row.review.reviewedBy!, reviewedAt: row.review.reviewedAt!}};
  })];
  return {...snapshot, revision: `${snapshot.revision}+${supplement.revision}`, destinations, areas};
}
