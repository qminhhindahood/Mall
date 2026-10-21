import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { derivedGeometry } from './vincom-segmentation-overlay.mjs';
import { prompt1Geometry } from './vincom-prompt1-overlay.mjs';

const revision = 'owner-approved-directory-2026-10-18-r1';
const approvedWordingHash = 'dddf720a429e6028817a3c19b3fd18c58c3704b45620e0790a7b0e3788aa823a';
const packet = 'docs/content-preparation/approved-directory-2026-10-18-r1';
const read = path => JSON.parse(readFileSync(path, 'utf8'));
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');

/** The same reviewed floor payload feeds static HTML and compressed scene transport. */
export function approvedGeometry(root, mallId, source) {
  const directoryPath = `data/malls/${mallId}/directory.json`;
  const directory = read(resolve(root,directoryPath));
  if (directory.approval !== 'approved') return source;
  if (directory.revision !== revision) throw new Error('Unknown approved directory revision');
  const validation = read(resolve(root,packet,'validation.json'));
  const decision = read(resolve(root,packet,'owner-decision.json'));
  if (!decision.rosterApproval || !decision.wordingApprovals.vi || !decision.wordingApprovals.en || decision.releaseApproval !== false || decision.sourceSha256 !== approvedWordingHash || decision.sourceSha256 !== validation.sourceSha256) throw new Error('Approved content decision scope drift');
  if (hash(resolve(root,decision.source)) !== decision.sourceSha256) throw new Error('Approved wording source drift');
  const regionsPath = `data/malls/${mallId}/approved-regions.json`;
  for (const path of [directoryPath,regionsPath]) {
    if (hash(resolve(root,path)) !== validation.outputs[path]) throw new Error(`Approved content output drift: ${path}`);
  }
  const overlay = read(resolve(root,regionsPath));
  const baselinePath = `data/malls/${mallId}/floor-geometry.json`;
  if (hash(resolve(root,baselinePath)) !== validation.inputs[baselinePath]) throw new Error('Approved geometry source hash drift');
  if (overlay.baseRevision !== source.revision) throw new Error('Approved geometry baseline drift');
  const floors = source.floors.map(floor => {
    const extra = overlay.floors.find(row=>row.floorId===floor.id)?.regions ?? [];
    if (extra.some(region=>floor.regions.some(base=>base.id===region.id))) throw new Error('Approved geometry duplicate region');
    return {...floor, regions:[...floor.regions,...extra]};
  });
  return prompt1Geometry(root,mallId,derivedGeometry(root,mallId,{...source, revision:`${source.revision}+${overlay.revision}`, floors}));
}
