import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';

const packetPath='data/research/vincom-literal-plan-references-2026-10-22-r1.json';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const hash=b=>createHash('sha256').update(b).digest('hex');
const fail=message=>{throw Error(`Vincom printed-plan references: ${message}`);};

function loadPacket(root) {
 const bytes=readFileSync(resolve(root,packetPath));
 if(hash(bytes)!=='e64fad64b3eea6ac06a44d8f1b7512628915521f3a6429b9f219a075b280df82')fail('packet drift');
 const packet=JSON.parse(bytes);
 for(const source of packet.sourceRasters)if(hash(readFileSync(resolve(root,source.path)))!==source.sha256)fail('source raster drift');
 return packet;
}

export function literalPlanGeometry(root,source) {
 const packet=loadPacket(root);
 if(source.revision!==packet.baseGeometryRevision)fail('geometry revision drift');
 const floors=source.floors.map(f=>{
  const cuts=packet.neutralCuts.filter(c=>c.floorId===f.id);
  const additions=packet.newGeometry.filter(g=>g.floorId===f.id);
  if(!cuts.length&&!additions.length)return f;
  for(const c of cuts)if(!same(f.regions.find(r=>r.id===c.original.id),c.original))fail('neutral parent drift');
  const removed=new Set(cuts.map(c=>c.original.id));
  const regions=f.regions.filter(r=>!removed.has(r.id)).concat(cuts.flatMap(c=>c.residuals),additions.map(g=>g.region));
  if(new Set(regions.map(r=>r.id)).size!==regions.length)fail('duplicate geometry region');
  return {...f,regions};
 });
 return {...source,revision:`${source.revision}+${packet.revision}`,floors};
}

export function literalPlanDirectory(root,snapshot,geometry) {
 const packet=loadPacket(root);
 if(snapshot.revision!==packet.baseDirectoryRevision||geometry.revision!==packet.baseGeometryRevision)fail('base revision drift');
 if(new Set(packet.rows.map(r=>r.destinationId)).size!==packet.rows.length)fail('duplicate destination');
 for(const row of packet.rows) {
  if(packet.protectedHolds.some(h=>h.destinationId===row.destinationId))fail('protected destination');
  if(!same(snapshot.destinations.find(d=>d.id===row.destinationId),row.originalDestination)||row.originalDestination.locations.some(l=>l.areaIds.length))fail('target drift');
  if(row.newArea) {
   if(snapshot.areas.some(a=>a.id===row.areaId)||packet.neutralCuts.some(c=>snapshot.areas.some(a=>a.floorId===c.floorId&&a.regionIds.includes(c.original.id))))fail('new area already owned');
  } else if(!same(snapshot.areas.find(a=>a.id===row.areaId),row.originalArea)||!same(snapshot.destinations.find(d=>d.id===row.anchorDestinationId)?.locations,row.originalAnchorLocations))fail('shared anchor drift');
  const area=row.newArea??row.originalArea;
  if(area.floorId!==row.floorId||!same(area.regionIds,row.regionIds)||row.associationDetail.referenceStatus!=='source-plan-only')fail('reference scope drift');
 }
 const destinations=snapshot.destinations.map(d=>{
  const row=packet.rows.find(r=>r.destinationId===d.id);
  return row?{...d,locations:d.locations.map(l=>l.floorId!==row.floorId?l:{...l,certainty:'area-confirmed',areaIds:[row.areaId],associationDetail:row.associationDetail,source:`${l.source}; ${packetPath}; literal printed-plan reference only; current location and occupancy unconfirmed`})}:d;
 });
 const areas=snapshot.areas.map(a=>{
  const row=packet.rows.find(r=>!r.newArea&&r.areaId===a.id);
  return row?{...a,name:row.areaName,review:{...a.review,source:`${a.review.source}; ${packetPath}; shared source-plan reference`,reviewedAt:packet.reviewedAt,reviewedBy:packet.reviewedBy}}:a;
 });
 return {...snapshot,revision:`${snapshot.revision}+${packet.revision}`,destinations,areas:areas.concat(packet.rows.filter(r=>r.newArea).map(r=>r.newArea))};
}
