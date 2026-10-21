import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {prompt1PriorGeometryRevision} from './vincom-prompt1-overlay.mjs';

const packetPath = 'data/research/vincom-derived-segmentation-2026-10-21-r7.json';
// Changing activation or any derived geometry requires a new reviewed identity.
const packetHash = '940213f6c26b9f007263ac46e93979ab5638ef3812e40fa2f3c9f28751779a30';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const fail = message => {throw new Error(`Derived segmentation: ${message}`);};

export function loadDerivedSegmentation(root) {
  const bytes = readFileSync(resolve(root,packetPath));
  if (hash(bytes) !== packetHash) fail('packet identity drift');
  const packet = JSON.parse(bytes);
  const receiptBytes = readFileSync(resolve(root,packet.residualReview.path));
  if (hash(receiptBytes) !== packet.residualReview.sha256) fail('residual review identity drift');
  const receipt = JSON.parse(receiptBytes);
  const derivationSha256 = hash(JSON.stringify({source:packet.source,parents:packet.parents,children:packet.children}));
  if (receipt.derivationSha256 !== derivationSha256) fail('residual review derivation drift');
  if (!['pending-independent-residual-review','accepted-independent-residual-review'].includes(packet.activation)) fail('unknown activation state');
  if (packet.activation === 'accepted-independent-residual-review' && (receipt.status !== 'accepted' || !receipt.reviewedBy || !receipt.reviewedAt)) fail('independent residual acceptance required');
  for (const [path,expected] of [[packet.review.path,packet.review.sha256],[packet.review.proposalPath,packet.review.proposalSha256],['data/malls/vincom-dong-khoi/floor-geometry.json',packet.baseGeometrySha256]]) {
    if (hash(readFileSync(resolve(root,path))) !== expected) fail(`evidence identity drift: ${path}`);
  }
  const proposals = JSON.parse(readFileSync(resolve(root,packet.review.proposalPath),'utf8'));
  if (packet.children.length !== proposals.proposals.length || packet.children.length !== 4) fail('reviewed child count drift');
  if (packet.source.sha256 !== proposals.source.sha256 || !same(packet.source.transform,proposals.source.transform)) fail('reviewed source drift');
  const ids = new Set();
  for (const child of packet.children) {
    const reviewed = proposals.proposals.filter(row => row.destinationId === child.destinationId);
    if (reviewed.length !== 1 || !same(child.sourcePixels,reviewed[0].outer) || child.parentRegionId !== reviewed[0].parentRegionId || child.printedUnits !== reviewed[0].printedUnits) fail('reviewed vertex/identity tuple drift');
    const [a,b,c,d,e,f] = packet.source.transform;
    const transformed = child.sourcePixels.map(([x,y]) => [Number((a*x+c*y+e).toFixed(4)),Number((b*x+d*y+f).toFixed(4))]);
    if (!same(child.region.outer,transformed) || child.region.holes.length) fail('child transform drift');
    if (ids.has(child.destinationId)) fail('duplicate reviewed destination');
    ids.add(child.destinationId);
  }
  return packet;
}

/** Pure derivation also used by invariant checks before activation. */
export function deriveSegmentedGeometry(source,packet) {
  if (source.revision !== packet.approvedGeometryRevision) fail('approved geometry revision drift');
  const floor = source.floors.find(row => row.id === packet.floorId);
  if (!floor || !floor.sources.some(s => s.sha256 === packet.source.sha256 && same(s.transform,packet.source.transform))) fail('floor source/transform drift');
  const sourceIds = new Set(floor.regions.map(region => region.id));
  const emittedIds = new Set();
  const parents = new Map(packet.parents.map(parent => [parent.original.id,parent]));
  if (parents.size !== packet.parents.length) fail('duplicate parent');
  for (const parent of packet.parents) {
    if (!same(floor.regions.find(region => region.id === parent.original.id),parent.original)) fail(`parent payload drift: ${parent.original.id}`);
    if (!parent.residual.length || parent.residual[0].id !== parent.original.id) fail('neutral parent residual must remain');
    for (const region of parent.residual) {
      if (region.role !== 'neutral-source-residual' || region.derivedFrom !== parent.original.id) fail('invalid residual provenance');
      if (emittedIds.has(region.id) || (sourceIds.has(region.id) && region.id !== parent.original.id)) fail('residual ID collision');
      emittedIds.add(region.id);
    }
  }
  for (const child of packet.children) {
    if (!parents.has(child.parentRegionId) || sourceIds.has(child.region.id) || emittedIds.has(child.region.id)) fail('child ID/parent collision');
    emittedIds.add(child.region.id);
  }
  const regions = floor.regions.flatMap(region => parents.get(region.id)?.residual ?? [region]).concat(packet.children.map(child => child.region));
  return {...source,revision:`${source.revision}+${packet.revision}`,floors:source.floors.map(row => row.id === floor.id ? {...row,regions} : row)};
}

/** Shared by approvedGeometry, hence static HTML, public transports and 3D. */
export function derivedGeometry(root,mallId,source) {
  if (mallId !== 'vincom-dong-khoi') return source;
  const packet = loadDerivedSegmentation(root);
  return packet.activation === 'accepted-independent-residual-review' ? deriveSegmentedGeometry(source,packet) : source;
}

export function deriveSegmentedDirectory(snapshot,geometry,packet) {
  if (snapshot.revision !== packet.baseDirectoryRevision) fail('directory revision drift');
  if (prompt1PriorGeometryRevision(geometry) !== `${packet.approvedGeometryRevision}+${packet.revision}`) fail('directory/geometry pipeline mismatch');
  for (const id of packet.protectedDestinationIds) {
    const destination = snapshot.destinations.find(row => row.id === id);
    if (!destination || destination.locations.some(location => location.areaIds.length || location.certainty !== 'floor-confirmed')) fail(`precision hold drift: ${id}`);
  }
  const floor = geometry.floors.find(row => row.id === packet.floorId);
  const parentIds = new Set(packet.parents.flatMap(parent => parent.residual.map(region => region.id)));
  if (snapshot.areas.some(area => area.floorId === packet.floorId && area.regionIds.some(id => parentIds.has(id)))) fail('parent/residual already associated; cannot shadow active areas');
  const newAreas = [], areaIds = new Set(snapshot.areas.map(area => area.id));
  const occupied = new Set(snapshot.areas.filter(area => area.floorId === packet.floorId).flatMap(area => area.regionIds));
  const provenance = `${packetPath}; ${packet.review.path}; independently reviewed source-layout trace only, not current occupancy, exact doorway or routing`;
  const associationDetail = {kind:'source-layout',note:{en:'Approximate area traced from the supplied plan (about 1–3 source pixels of uncertainty). Current occupancy and exact doorway are not verified.',vi:'Khu vực ước lượng theo sơ đồ được cung cấp (sai số khoảng 1–3 điểm ảnh nguồn). Chưa xác minh đơn vị đang hoạt động và cửa ra vào chính xác.'}};
  for (const child of packet.children) {
    const destination = snapshot.destinations.find(row => row.id === child.destinationId);
    if (!destination || !same(destination.locations,child.originalLocations)) fail(`destination location drift: ${child.destinationId}`);
    const location = destination.locations.find(row => row.floorId === packet.floorId);
    if (!location || location.certainty !== 'floor-confirmed' || location.areaIds.length) fail('expected floor-only child');
    if (!same(floor.regions.find(region => region.id === child.region.id),child.region) || occupied.has(child.region.id) || areaIds.has(child.areaId)) fail('child geometry/area collision');
    occupied.add(child.region.id); areaIds.add(child.areaId);
    newAreas.push({id:child.areaId,floorId:packet.floorId,regionIds:[child.region.id],name:{...destination.name},review:{...destination.review,source:provenance,reviewedBy:packet.review.reviewedBy,reviewedAt:packet.review.reviewedAt}});
  }
  const destinations = snapshot.destinations.map(destination => ({...destination,locations:destination.locations.map(location => {
    const child = packet.children.find(row => row.destinationId === destination.id && location.floorId === packet.floorId);
    return child ? {...location,certainty:'area-confirmed',areaIds:[child.areaId],associationDetail,source:`${location.source}; ${provenance}; units ${child.printedUnits}`} : location;
  })}));
  return {...snapshot,revision:`${snapshot.revision}+${packet.revision}`,destinations,areas:[...snapshot.areas,...newAreas]};
}

export function derivedDirectory(root,snapshot,geometry) {
  if (snapshot.mallId !== 'vincom-dong-khoi' || snapshot.approval !== 'approved') return snapshot;
  const packet = loadDerivedSegmentation(root);
  return packet.activation === 'accepted-independent-residual-review' ? deriveSegmentedDirectory(snapshot,geometry,packet) : snapshot;
}
