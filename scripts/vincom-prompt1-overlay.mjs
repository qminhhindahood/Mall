import {completionGeometry} from './vincom-completion-overlay.mjs';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';

const packetPath = 'data/research/vincom-mapping-prompt1-2026-10-21-r2.json';
const reviewPath = 'evidence/vincom-prompt1-review-r2/association-decisions-r2.json';
const packetHash = 'f3e3403c00fe786a62b1bf4c7b90cc729f7c9169822287de35d8608aea59a707';
const reviewHash = 'dfd39778c34cd3d50787e99d7b5904b68af440d436547a702ad31712f46ad62b';
const baseGeometryHash = 'd8c8384d182058df02dc126168cd43a6f1293b1c9086f0db0eef7e9adc60052c';
const priorRevisions = new WeakMap();
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const canonical = value => JSON.stringify(sort(value));
function sort(value) {
  if (Array.isArray(value)) return value.map(sort);
  return value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key=>[key,sort(value[key])])) : value;
}
const same = (a,b) => canonical(a) === canonical(b);
const geometryIdentity = source => ({revision:source.revision,floors:source.floors.map(f=>({id:f.id,sources:f.sources,regions:f.regions}))});
const fail = message => {throw new Error(`Vincom prompt1 r2: ${message}`);};
export function loadPrompt1(root) {
  const bytes = readFileSync(resolve(root,packetPath));
  const reviewBytes = readFileSync(resolve(root,reviewPath));
  if (hash(bytes)!==packetHash || hash(reviewBytes)!==reviewHash) fail('packet/review identity drift');
  const packet=JSON.parse(bytes), review=JSON.parse(reviewBytes);
  if (packet.activation!=='independently-reviewed-pending-owner-handover' || packet.associations.length!==71 || review.decisions.length!==71) fail('review scope drift');
  for (const [name,expected] of [['floor-geometry.json',packet.baseGeometrySha256],['approved-regions.json',packet.approvedRegionsSha256]]) {
    if (hash(readFileSync(resolve(root,'data/malls/vincom-dong-khoi',name)))!==expected) fail(`immutable source drift: ${name}`);
  }
  for (const [floor,expected] of Object.entries(packet.sourceRasterHashes)) {
    if (hash(readFileSync(resolve(root,`assets/vincom-dong-khoi/maps/${floor}.webp`)))!==expected) fail(`raster drift: ${floor}`);
  }
  return {packet,review};
}

// Activated in the isolated integration after owner handover; immutable inputs remain hash-guarded.
export function prompt1Geometry(root,mallId,source) {
  if (mallId!=='vincom-dong-khoi') return source;
  const {packet}=loadPrompt1(root);
  if (hash(canonical(geometryIdentity(source)))!==baseGeometryHash) fail('exact pre-r2 runtime geometry drift');
  const used=new Set(packet.associations.flatMap(a=>a.traceIds));
  if (used.size!==73) fail('accepted trace allowlist drift');
  const floors=source.floors.map(floor=>{
    const parents=new Map(packet.proposedNeutralResiduals.filter(p=>p.floorId===floor.id).map(p=>[p.original.id,p]));
    const children=packet.traces.filter(t=>t.floorId===floor.id && used.has(t.id));
    for (const parent of parents.values()) {
      if (!same(floor.regions.find(r=>r.id===parent.original.id),parent.original)) fail(`parent drift: ${parent.original.id}`);
    }
    for (const t of children) {
      if (!floor.sources.some(s=>s.sha256===t.sourceSha256 && same(s.transform,t.transform))) fail(`source transform drift: ${t.id}`);
    }
    const regions=floor.regions.flatMap(r=>parents.has(r.id)?parents.get(r.id).residual:[r]).concat(children.map(t=>t.region));
    if (new Set(regions.map(r=>r.id)).size!==regions.length) fail('geometry ID collision');
    return {...floor,regions};
  });
  const result=completionGeometry(root,{...source,revision:`${source.revision}+${packet.revision}`,floors});
  priorRevisions.set(result,source.revision);
  return result;
}

// Only exact objects produced by the hash-guarded derivation can satisfy the
// existing r7 directory stage with its original geometry revision. Its child,
// source, parent association and precision guards continue to execute unchanged.
export function prompt1PriorGeometryRevision(geometry) {
  return priorRevisions.get(geometry) ?? geometry.revision;
}

export function prompt1Supplement(root,snapshot,geometry) {
  const {packet,review}=loadPrompt1(root);
  if (snapshot.mallId!=='vincom-dong-khoi' || snapshot.revision!==packet.baseDirectoryRevision) fail('directory revision drift');
  if (!priorRevisions.has(geometry)) fail('geometry pipeline mismatch');
  const associations=packet.associations.map(a=>{
    const decisions=review.decisions.filter(d=>d.destinationId===a.destinationId && d.floor===a.floorId);
    if (decisions.length!==1 || !same(decisions[0].regionIds,a.regionIds) || !same(decisions[0].tracedUnits,a.tracedUnits)) fail('association review tuple drift');
    const decision=decisions[0];
    const ts=a.traceIds.map(id=>packet.traces.find(t=>t.id===id));
    return {...a,printedUnits:a.printedUnits.join(', '),source:{path:ts[0].sourcePath,sha256:ts[0].sourceSha256,transform:ts[0].transform},geometryRegions:ts.map(t=>t.region),review:{status:'accepted',reviewedBy:packet.reviewedBy,reviewedAt:packet.reviewedAt,decision:decision.decision}};
  });
  const supplement={...packet,activation:'accepted-independent-review',reviewEvidence:{path:reviewPath,sha256:reviewHash},associations};
  const receipt={decisions:associations.map(a=>({destinationId:a.destinationId,floor:a.floorId,regionIds:a.regionIds,printedUnits:a.printedUnits,reviewDecision:a.review.decision}))};
  return {supplement,receipt};
}
