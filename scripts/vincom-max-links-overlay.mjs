import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

const packetPath = 'data/research/vincom-max-source-units-2026-10-22-r1.json';
const packetHash = 'f0b09b0745a5ea6455e157e7265e11f3c8aa6853e5c3d69315732ebbaae305dc';
const originals = new WeakMap();
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const fail = message => { throw Error(`Vincom source-unit references: ${message}`); };

function load(root) {
  const bytes = readFileSync(resolve(root,packetPath));
  if (hash(bytes) !== packetHash) fail('packet drift');
  const packet = JSON.parse(bytes);
  const reviewBytes = readFileSync(resolve(root,packet.reviewEvidence.path));
  if (hash(reviewBytes) !== packet.reviewEvidence.sha256) fail('review drift');
  const review = JSON.parse(reviewBytes);
  for (const input of review.supportingInputs) if (hash(readFileSync(resolve(root,input.path))) !== input.sha256) fail('supporting source drift');
  const rows = [...packet.associations,...packet.sharedAssociations];
  if (review.decision !== 'accept-approximate-and-shared-source-unit-references' || review.decisions.length !== rows.length) fail('review scope');
  for (const row of rows) {
    const decisions = review.decisions.filter(d => d.destinationId === row.destinationId && d.floor === row.floorId && d.unit === row.printedUnits);
    if (decisions.length !== 1 || decisions[0].exclusiveCurrentBoundaryVerified !== false) fail('review tuple drift');
  }
  for (const g of packet.newGeometry) if (hash(readFileSync(resolve(root,g.source.path))) !== g.source.sha256) fail('source raster drift');
  return packet;
}

export function maxLinksGeometry(root,source) {
  const packet = load(root);
  if (source.revision !== packet.baseGeometryRevision) fail('geometry revision drift');
  const floors = source.floors.map(floor => {
    const cuts = packet.neutralCuts.filter(c => c.floorId === floor.id);
    const additions = packet.newGeometry.filter(g => g.floorId === floor.id);
    for (const cut of cuts) if (!same(floor.regions.find(r => r.id === cut.original.id),cut.original)) fail('neutral parent drift');
    for (const g of additions) if (!floor.sources.some(s => s.sha256 === g.source.sha256 && same(s.transform,g.source.transform))) fail('source transform drift');
    const removed = new Set(cuts.map(c => c.original.id));
    const regions = floor.regions.filter(r => !removed.has(r.id)).concat(cuts.flatMap(c => c.residuals),additions.map(g => g.region));
    if (new Set(regions.map(r => r.id)).size !== regions.length) fail('duplicate region');
    return additions.length ? {...floor,regions} : floor;
  });
  const result = {...source,revision:`${source.revision}+${packet.revision}`,floors};
  originals.set(result,source);
  return result;
}

// Preserve the earlier packet's exact revision validation without weakening it.
export function beforeMaxLinksGeometry(geometry) {
  const original = originals.get(geometry);
  if (!original) fail('geometry pipeline identity drift');
  return original;
}

export function maxLinksSupplement(root,snapshot,geometry) {
  const packet = load(root);
  if (!originals.has(geometry) || snapshot.revision !== packet.baseDirectoryRevision || geometry.revision !== `${packet.baseGeometryRevision}+${packet.revision}`) fail('directory pipeline drift');
  return {supplement:packet,receipt:{decisions:packet.associations.map(row => ({destinationId:row.destinationId,floor:row.floorId,regionIds:row.regionIds,printedUnits:row.printedUnits,reviewDecision:row.review.decision}))}};
}

export function maxLinksSharedDirectory(root,snapshot,geometry) {
  const packet = load(root);
  if (!originals.has(geometry) || snapshot.revision !== `${packet.baseDirectoryRevision}+${packet.revision}`) fail('shared pipeline drift');
  for (const row of packet.sharedAssociations) {
    const target = snapshot.destinations.find(d => d.id === row.destinationId);
    const area = snapshot.areas.find(a => a.id === row.areaId);
    if (!same(target?.locations,row.originalLocations) || !same(area?.regionIds,row.regionIds) || area.floorId !== row.floorId) fail('shared source area drift');
    if (row.originalArea && (!same(area,row.originalArea) || !same(snapshot.destinations.find(d => d.id === row.anchorDestinationId)?.locations,row.originalAnchorLocations))) fail('existing shared anchor drift');
    if (row.originalLocations.some(l => l.areaIds.length) || packet.protectedHolds.some(h => h.destinationId === row.destinationId)) fail('shared target is mapped or held');
  }
  const destinations = snapshot.destinations.map(destination => {
    const row = packet.sharedAssociations.find(r => r.destinationId === destination.id);
    return row ? {...destination,locations:destination.locations.map(location => location.floorId === row.floorId ? {...location,certainty:'area-confirmed',areaIds:[row.areaId],associationDetail:row.associationDetail,source:`${location.source}; ${packetPath}; shared source-unit reference; individual premises and current occupancy unverified`} : location)} : destination;
  });
  const areas = snapshot.areas.map(area => {
    const row = packet.sharedAssociations.find(r => r.areaId === area.id);
    if (!row) return area;
    return {...area,name:row.areaName,review:{...area.review,source:`${area.review.source}; ${packetPath}; shared source-unit reference only`,reviewedBy:'Codex source review (single session)',reviewedAt:'2026-10-22'}};
  });
  return {...snapshot,destinations,areas};
}

// A floor correction is not an area association. Keep the frozen unit packet intact.
export function verifiedVincomFloor(root,snapshot) {
  const correctionPath = 'data/research/vincom-verified-floor-2026-10-22-r1.json';
  const bytes = readFileSync(resolve(root,correctionPath));
  if (hash(bytes) !== 'e4122c62f52cc95ea3922eab1e5d7bbbb67d983cfff8d340447000146473fa50') fail('floor correction drift');
  const correction = JSON.parse(bytes);
  if (snapshot.revision !== correction.baseDirectoryRevision) fail('floor correction revision drift');
  for (const input of correction.sources) if (hash(readFileSync(resolve(root,input.path))) !== input.sha256) fail('floor correction source drift');
  const original = correction.originalDestination;
  if (!same(snapshot.destinations.find(d => d.id === original.id),original) || original.locations.some(l => l.areaIds.length)) fail('floor correction target drift');
  if (snapshot.highlights.some(h => h.destinationId === original.id)) fail('floor correction requires highlight review');
  const source = `${original.locations[0].source}; ${correctionPath}; official locator B1-23; floor only, A/B subdivision and current perimeter unverified`;
  const destinations = snapshot.destinations.map(d => d.id !== original.id ? d : {
    ...d,primaryFloor:correction.floorId,floors:[correction.floorId],
    locations:[{floorId:correction.floorId,certainty:'floor-confirmed',areaIds:[],source}],
    reviewedAt:correction.reviewedAt,
    review:{...d.review,source:`${d.review.source}; ${correctionPath}`,reviewedAt:correction.reviewedAt,reviewedBy:correction.reviewedBy},
  });
  return {...snapshot,revision:`${snapshot.revision}+${correction.revision}`,destinations};
}

export function valiramSourceArea(root,snapshot,geometry) {
  const sourcePath = 'data/research/vincom-valiram-area-2026-10-22-r1.json';
  const bytes = readFileSync(resolve(root,sourcePath));
  if (hash(bytes) !== '5d1072e5e0c57eb303dd530cdc24449761c74414fb072fb31555beb8d1094146') fail('Valiram packet drift');
  const packet = JSON.parse(bytes);
  if (snapshot.revision !== packet.baseDirectoryRevision || geometry.revision !== packet.baseGeometryRevision) fail('Valiram base revision drift');
  for (const source of [packet.locator,packet.sourceRaster]) if (hash(readFileSync(resolve(root,source.path))) !== source.sha256) fail('Valiram source drift');
  const records = JSON.parse(readFileSync(resolve(root,packet.locator.path),'utf8'));
  const matches = records.filter(r => r.id === packet.locator.recordId);
  if (matches.length !== 1 || matches[0].title !== packet.locator.title || matches[0].street !== packet.locator.street || matches[0].country !== 'Vietnam') fail('Valiram branch tuple drift');
  if (!same(snapshot.destinations.find(d => d.id === packet.destinationId),packet.originalDestination) || packet.originalDestination.locations.some(l => l.areaIds.length)) fail('Valiram target drift');
  const floor = geometry.floors.find(f => f.id === packet.floorId);
  if (!same(floor?.regions.find(r => r.id === packet.region.id),packet.region)) fail('Valiram contour drift');
  if (snapshot.areas.some(a => a.id === packet.area.id || a.floorId === packet.floorId && a.regionIds.includes(packet.region.id))) fail('Valiram area already owned');
  const destinations = snapshot.destinations.map(d => d.id !== packet.destinationId ? d : {
    ...d,locations:d.locations.map(l => l.floorId !== packet.floorId ? l : {
      ...l,certainty:'area-confirmed',areaIds:[packet.area.id],associationDetail:packet.associationDetail,
      source:`${l.source}; ${sourcePath}; approximate source-unit correspondence only; current fit-out and doorway unverified`,
    }),
  });
  return {...snapshot,revision:`${snapshot.revision}+${packet.revision}`,destinations,areas:[...snapshot.areas,packet.area]};
}

export function yamazakiSharedArea(root,snapshot) {
  const sourcePath = 'data/research/vincom-yamazaki-area-2026-10-22-r1.json';
  const bytes = readFileSync(resolve(root,sourcePath));
  if (hash(bytes) !== '19a92627de79f73b4c8ec18e6874bc85181507a74f7b0e740a29e96d9c70c76c') fail('Yamazaki packet drift');
  const packet = JSON.parse(bytes);
  if (snapshot.revision !== packet.baseDirectoryRevision) fail('Yamazaki base revision drift');
  if (hash(readFileSync(resolve(root,packet.source.path))) !== packet.source.sha256) fail('Yamazaki employer source drift');
  if (!same(snapshot.destinations.find(d => d.id === packet.destinationId),packet.originalDestination) || packet.originalDestination.locations.some(l => l.areaIds.length)) fail('Yamazaki target drift');
  if (!same(snapshot.areas.find(a => a.id === packet.areaId),packet.originalArea) || !same(snapshot.destinations.find(d => d.id === packet.anchorDestinationId)?.locations,packet.originalAnchorLocations)) fail('Yamazaki shared anchor drift');
  const destinations = snapshot.destinations.map(d => d.id !== packet.destinationId ? d : {
    ...d,locations:d.locations.map(l => l.floorId !== packet.floorId ? l : {
      ...l,certainty:'area-confirmed',areaIds:[packet.areaId],associationDetail:packet.associationDetail,
      source:`${l.source}; ${sourcePath}; employer-claimed B3-21 shared source reference; current occupancy and doorway unverified`,
    }),
  });
  const areas = snapshot.areas.map(a => a.id !== packet.areaId ? a : {
    ...a,name:packet.areaName,review:{...a.review,source:`${a.review.source}; ${sourcePath}; shared source-unit reference`,reviewedAt:packet.reviewedAt,reviewedBy:packet.reviewedBy},
  });
  return {...snapshot,revision:`${snapshot.revision}+${packet.revision}`,destinations,areas};
}
