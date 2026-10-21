import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

const packetPath = 'data/research/vincom-reopened-source-unit-2026-10-21-r1.json';
const packetHash = 'cd8c40586bf7e6e5908293708ccf51d8b8da335b33cd888bcc716966456a4f2a';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const fail = message => { throw Error(`Vincom reopened mapping: ${message}`); };

function load(root) {
  const bytes = readFileSync(resolve(root,packetPath));
  if (hash(bytes) !== packetHash) fail('packet drift');
  const packet = JSON.parse(bytes);
  const reviewBytes = readFileSync(resolve(root,packet.reviewEvidence.path));
  if (hash(reviewBytes) !== packet.reviewEvidence.sha256) fail('source review drift');
  const review = JSON.parse(reviewBytes);
  if (review.decision !== 'accept-unit-number-reference-area-only' || packet.associations.length !== 1 || packet.associations[0].destinationId !== 'vincom-prototype-nike') fail('review scope drift');
  if (hash(readFileSync(resolve(root,packet.sourcePath))) !== packet.source.sha256) fail('source raster drift');
  return packet;
}

// Append only the reviewed source-unit contour; keep immutable raster/geometry files intact.
export function reopenedGeometry(root,source) {
  const packet = load(root);
  if (source.revision !== packet.baseGeometryRevision) fail('geometry revision drift');
  const floors = source.floors.map(floor => {
    if (floor.id !== 'B1') return floor;
    if (!floor.sources.some(s => s.sha256 === packet.source.sha256 && same(s.transform,packet.source.transform))) fail('source transform drift');
    const original = packet.originalNeutralRegion;
    if (!same(floor.regions.find(r => r.id === original.id),original) || original.role !== 'neutral-source-residual') fail('neutral parent drift');
    const regions = floor.regions.filter(r => r.id !== original.id).concat(packet.neutralResiduals,packet.newRegion);
    if (new Set(regions.map(r => r.id)).size !== regions.length) fail('duplicate region');
    return {...floor,regions};
  });
  return {...source,revision:`${source.revision}+${packet.revision}`,floors};
}

export function reopenedSupplement(root,snapshot,geometry) {
  const packet = load(root);
  if (snapshot.mallId !== packet.mallId || snapshot.revision !== packet.baseDirectoryRevision || geometry.revision !== `${packet.baseGeometryRevision}+${packet.revision}`) fail('directory/geometry pipeline drift');
  return {
    supplement:packet,
    receipt:{decisions:packet.associations.map(row => ({destinationId:row.destinationId,floor:row.floorId,regionIds:row.regionIds,printedUnits:row.printedUnits,reviewDecision:row.review.decision}))},
  };
}
