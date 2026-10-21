import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {reopenedGeometry} from './vincom-reopened-overlay.mjs';
import {maxLinksGeometry} from './vincom-max-links-overlay.mjs';

const packetPath='data/research/vincom-completion-b3-b2-2026-10-21-r2.json';
const reviewPath='evidence/vincom-integration/completion-review.json';
const packetHash='ff5a7e0270bb9fd2f50b40b94eed62a19a164b4dc28f4a04696d7673d105869a', reviewHash='cb2d0f93620ff91fc30881aadf8d6bfbcb0d0a21bd266be1fdc71d5737f698c1';
const hash=b=>createHash('sha256').update(b).digest('hex');
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const fail=s=>{throw new Error(`Vincom completion: ${s}`);};
const produced=new WeakSet();
function load(root){
 const p=readFileSync(resolve(root,packetPath)),r=readFileSync(resolve(root,reviewPath));
 if(hash(p)!==packetHash||hash(r)!==reviewHash)fail('packet/review drift');
 const packet=JSON.parse(p),review=JSON.parse(r);
 if(review.status!=='accepted-source-review'||packet.associations.length!==4||review.decisions.length!==4)fail('review scope');
 for(const [floor,expected] of Object.entries(packet.sourceRasterHashes))if(hash(readFileSync(resolve(root,`assets/vincom-dong-khoi/maps/${floor}.webp`)))!==expected)fail('source drift');
 return {packet,review};
}
export function completionGeometry(root,source){
 const {packet}=load(root);
 const floors=source.floors.map(f=>{
  const cuts=packet.incrementalNeutralResiduals.filter(c=>c.floorId===f.id);
  for(const c of cuts)for(const r of c.originalAfterPrompt1)if(!same(f.regions.find(x=>x.id===r.id),r))fail('neutral parent drift');
  const remove=new Set(cuts.flatMap(c=>c.replaceAfterPrompt1RegionIds));
  const additions=packet.newGeometry.filter(c=>c.floorId===f.id);
  for(const c of additions)if(!f.sources.some(s=>s.sha256===c.originalSourceTrace.sourceSha256&&same(s.transform,c.originalSourceTrace.transform)))fail('transform drift');
  const regions=f.regions.filter(r=>!remove.has(r.id)).concat(cuts.flatMap(c=>c.residual),additions.map(c=>c.proposedRegion));
  if(new Set(regions.map(r=>r.id)).size!==regions.length)fail('duplicate region');
  return {...f,regions};
 });
 const result=maxLinksGeometry(root,reopenedGeometry(root,{...source,revision:`${source.revision}+${packet.revision}`,floors}));produced.add(result);return result;
}
export function completionSupplement(root,snapshot,geometry){
 const {packet,review}=load(root);
 if(!produced.has(geometry)||snapshot.revision!==review.baseDirectoryRevision)fail('pipeline/revision drift');
 const associations=packet.associations.filter(a=>a.destinationId!=='vincom-prototype-bkkstreetdessert').map(a=>{
  const c=packet.newGeometry.find(c=>c.destinationIds.includes(a.destinationId));
  const decision=review.decisions.find(d=>d.destinationId===a.destinationId);
  if(!same(decision.regionIds,a.regionIds)||decision.floor!==a.floorId)fail('review tuple drift');
  return {...a,printedUnits:a.printedUnits.join(', '),source:{path:c.originalSourceTrace.sourcePath,sha256:c.originalSourceTrace.sourceSha256,transform:c.originalSourceTrace.transform},geometryRegions:[c.proposedRegion],associationDetail:{kind:a.associationDetail.partial?'partial-source-layout':'source-layout',note:a.associationDetail.note},review:{status:'accepted',reviewedBy:review.reviewedBy,reviewedAt:review.reviewedAt,decision:decision.reviewDecision}};
 });
 const supplement={...packet,baseDirectoryRevision:review.baseDirectoryRevision,activation:'accepted-source-review',reviewEvidence:{path:reviewPath,sha256:reviewHash},associations};
 return {supplement,receipt:{decisions:review.decisions.filter(d=>d.destinationId!=='vincom-prototype-bkkstreetdessert')}};
}
export function completionSharedDirectory(root,snapshot,geometry){
 const {packet,review}=load(root);
 if(!produced.has(geometry)||snapshot.revision!==`${review.baseDirectoryRevision}+${packet.revision}`)fail('shared pipeline drift');
 const row=packet.associations.find(a=>a.destinationId==='vincom-prototype-bkkstreetdessert');
 const anchor=packet.associations.find(a=>a.destinationId==='vincom-prototype-boatnoodle');
 const target=snapshot.destinations.find(d=>d.id===row.destinationId);
 const owner=snapshot.destinations.find(d=>d.id===anchor.destinationId);
 const area=snapshot.areas.find(a=>a.id===row.areaId);
 const decision=review.decisions.find(d=>d.destinationId===row.destinationId);
 if(!same(target?.locations,row.originalLocations)||!same(area?.regionIds,row.regionIds)||area.floorId!==row.floorId||!same(owner?.locations.find(l=>l.floorId===row.floorId)?.areaIds,[row.areaId])||!same(decision.regionIds,row.regionIds)||decision.floor!==row.floorId)fail('shared ownership drift');
 const source=`${packetPath}; reviewed shared B3-20 source area; individual premises, current occupancy, exact doors and routes unverified`;
 return {...snapshot,destinations:snapshot.destinations.map(d=>d.id===row.destinationId?{...d,locations:d.locations.map(l=>l.floorId===row.floorId?{...l,certainty:'area-confirmed',areaIds:[row.areaId],associationDetail:{kind:'source-layout',note:row.associationDetail.note},source:`${l.source}; ${source}`}:l)}:d),areas:snapshot.areas.map(a=>a.id===row.areaId?{...a,name:{en:'Boat Noodle & BKK Street Dessert',vi:'Boat Noodle & BKK Street Dessert'}}:a)};
}
