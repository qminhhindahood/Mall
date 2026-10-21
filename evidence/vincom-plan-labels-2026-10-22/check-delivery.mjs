import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
const out='evidence/vincom-plan-labels-2026-10-22';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const before=read('evidence/vincom-valiram-area-2026-10-22/runtime-after.json');
const packet=read('data/research/vincom-literal-plan-references-2026-10-22-r1.json');
const rows=[];
for(const mall of ['vincom-dong-khoi','saigon-centre']) {
 process.env.MALL_ID=mall;
 const server=await createServer({configFile:false,optimizeDeps:{entries:[],noDiscovery:true},server:{middlewareMode:true}});
 try {
  const {site}=await server.ssrLoadModule('/src/data/site.ts');
  const baseline=mall==='vincom-dong-khoi'?before:read('evidence/vincom-integration/runtime-saigon-centre.json');
  if(mall==='saigon-centre')assert.deepEqual(site.geometry,baseline.geometry);
  else for(const floor of baseline.geometry.floors) {
   const actual=site.geometry.floors.find(f=>f.id===floor.id);
   for(const region of floor.regions) {
    if(packet.neutralCuts.some(c=>c.floorId===floor.id&&c.original.id===region.id))continue;
    assert.deepEqual(actual.regions.find(r=>r.id===region.id),region);
   }
   assert.deepEqual(actual.sources,floor.sources);
  }
  for(const key of ['facilities','highlights','categories']) assert.deepEqual(site.content[key],baseline.content[key]);
  for(const area of baseline.content.areas) {
   const actual=site.content.areas.find(a=>a.id===area.id);
   if(mall==='vincom-dong-khoi'&&packet.rows.some(r=>!r.newArea&&r.areaId===area.id)){assert.equal(actual.floorId,area.floorId);assert.deepEqual(actual.regionIds,area.regionIds);assert.deepEqual(actual.name,packet.rows.find(r=>r.areaId===area.id).areaName);}
   else assert.deepEqual(actual,area);
  }
  assert.equal(site.content.areas.length,baseline.content.areas.length+(mall==='vincom-dong-khoi'?1:0));
  for(const d of baseline.destinations) {
   const actual=site.destinations.find(x=>x.id===d.id);
   const row=mall==='vincom-dong-khoi'?packet.rows.find(r=>r.destinationId===d.id):undefined;
   if(row) {
    for(const key of Object.keys(d).filter(k=>k!=='locations'))assert.deepEqual(actual[key],d[key]);
    assert.equal(actual.locations[0].floorId,row.floorId);assert.deepEqual(actual.locations[0].areaIds,[row.area?.id??row.areaId]);
    assert.deepEqual(actual.locations[0].associationDetail,row.associationDetail);
   } else assert.deepEqual(actual,d);
  }
  const mapped=site.destinations.filter(d=>d.locations.some(l=>l.areaIds.length)).length;
  assert.equal(mapped,mall==='vincom-dong-khoi'?163:164);
  assert.equal(site.destinations.length,baseline.destinations.length);
  assert.equal(site.assetRevision,baseline.assetRevision);
  if(mall==='vincom-dong-khoi') {
   assert.equal(site.destinations.filter(d=>d.locations.some(l=>l.associationDetail?.referenceStatus==='source-plan-only')).length,17);
   for(const h of packet.protectedHolds)assert.equal(site.destinations.find(d=>d.id===h.destinationId).locations.find(l=>l.floorId===h.floorId).areaIds.length,0);
   const transport=read('dist/vincom-dong-khoi/data/floor-geometry.json');
   assert.deepEqual(transport.floors.map(f=>({id:f.id,regions:f.regions,sources:f.sources})),site.geometry.floors.map(f=>({id:f.id,regions:f.regions,sources:f.sources})));
   assert.equal(transport.revision,site.geometry.revision);
  }
  if(mall==='vincom-dong-khoi') writeFileSync(`${out}/runtime-after.json`,JSON.stringify(site));
  rows.push({mall,mapped,total:site.destinations.length,floorOnly:site.destinations.length-mapped,acceptedGeometryAndOtherDestinationsUnchanged:true});
 }finally{await server.close();}
}
const dirty=read('evidence/vincom-remaining-2026-10-21/initial-worktree.json').dirtyPaths;
for(const [path,expected] of Object.entries(dirty))assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'),expected,path);
const result={rows,newAreaLinks:17,sourcePlanOnlyReferences:17,floorCorrections:0,preservedRawHashes:Object.keys(dirty).length,completeMapping:false};
writeFileSync(`${out}/delivery-checks.json`,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
