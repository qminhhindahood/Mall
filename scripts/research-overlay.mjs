import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';

const packet = 'docs/content-preparation/integration-candidate-2026-10-18-r2';
const read = path => JSON.parse(readFileSync(path, 'utf8'));
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');

/** Draft wording is opt-in research data, never an approved directory snapshot. */
export function researchDescriptions(root, mallId) {
  if (process.env.INCLUDE_TEST_FIXTURES !== 'research') throw new Error('Draft descriptions are research-only');
  const draft=read(resolve(root,'docs/content-preparation/finish-review-2026-10-18/revision-2/roster-proposals.json'));
  if (draft.revision!=='finish-review-descriptions-r2' || draft.fullWordingApproval!==false || draft.publicImportAllowed!==false) throw new Error('Unexpected draft description approval scope');
  const descriptions=new Map();
  for (const row of draft.records.filter(row=>row.mall===mallId)) {
    if (descriptions.has(row.id)) throw new Error('Duplicate draft description identity');
    const description=row.proposedDescription;
    const held=description===null || (description?.vi===null && description?.en===null);
    if (!held && (typeof description?.vi!=='string' || !description.vi.trim() || typeof description?.en!=='string' || !description.en.trim())) throw new Error('Draft requires both languages or an explicit hold');
    descriptions.set(row.id,held?{vi:'',en:''}:description);
  }
  return descriptions;
}

/** @param {string} root @param {string} mallId */
export function researchDecisionPacket(root, mallId) {
  if (process.env.INCLUDE_TEST_FIXTURES !== 'research') throw new Error('Owner decision overlay is research-only');
  const manifest = read(resolve(root, packet, 'manifest.json'));
  const sources = read(resolve(root, packet, 'source-hashes.json'));
  if (manifest.outputs[`${mallId}.private.json`] !== hash(resolve(root,packet,`${mallId}.private.json`))) throw new Error('Private candidate hash drift');
  for (const name of ['owner-decisions.json']) {
    const relative=`implementation/mall-visitor/${packet}/${name}`;
    if (sources.files[relative] !== hash(resolve(root,packet,name))) throw new Error('Owner decision hash drift');
  }
  const decisions = read(resolve(root, packet, 'owner-decisions.json'));
  if (!decisions.geometry.ownerApproval || !decisions.unresolvedTreatment.ownerApproval || decisions.releaseApproval) throw new Error('Unexpected research owner-decision scope');
  const candidate = read(resolve(root, packet, `${mallId}.private.json`));
  if (candidate.mallId !== mallId || candidate.publicationApproval || candidate.importableDirectorySnapshot) throw new Error('Private candidate cannot be published');
  return candidate;
}

/** Latest display holds override older accepted shape packets without rewriting them. */
export function researchLocationHolds(root, mallId) {
  if (process.env.INCLUDE_TEST_FIXTURES !== 'research') throw new Error('Location holds are research-only');
  const policy=read(resolve(root,'data/research/location-holds-2026-10-18-r1.json'));
  return policy.unitHolds.filter(hold=>hold.mallId===mallId);
}

/** @param {string} root @param {string} mallId @param {import('../src/runtime/scene-contract').FloorDataset} source */
export function researchGeometry(root, mallId, source) {
  const candidate=researchDecisionPacket(root, mallId);
  if (mallId !== 'saigon-centre') return source;
  const geometryPath='docs/polygon-review/result-2026-10-18-r4/floor-geometry-candidate.json';
  const sources=read(resolve(root,packet,'source-hashes.json'));
  const packagedPath=resolve(root,packet,'accepted-r4-geometry.json.gz');
  const bytes=gunzipSync(readFileSync(packagedPath));
  if (sources.files[geometryPath] !== createHash('sha256').update(bytes).digest('hex')) throw new Error('Accepted r4 geometry hash drift');
  const r4 = JSON.parse(bytes.toString('utf8'));
  const sharedParents=new Set(candidate.records.flatMap(record=>record.geometryCandidates.filter(area=>area.sharedAreaRole==='shared-parent-area').map(area=>area.regionId)));
  const floors = source.floors.map(floor => {
    const reviewed = r4.floors.find(item => item.id === floor.id);
    if (!reviewed || JSON.stringify(reviewed.regions) !== JSON.stringify(floor.regions)) throw new Error('Research geometry baseline drift');
    return {...floor, regions:[...floor.regions, ...reviewed.candidateRegions.filter(region=>!sharedParents.has(region.id))]};
  });
  return {...source, revision:`${source.revision}+owner-location-holds-r1-private`, floors};
}
