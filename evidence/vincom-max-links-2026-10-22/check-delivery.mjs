import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {brotliDecompressSync,gunzipSync} from 'node:zlib';
import {createServer} from 'vite';
const out='evidence/vincom-max-links-2026-10-22';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const packet=read('data/research/vincom-max-source-units-2026-10-22-r1.json');
const changed=new Set([...packet.associations,...packet.sharedAssociations].map(r=>r.destinationId));
const renamed=new Set(packet.sharedAssociations.filter(r=>r.originalArea).map(r=>r.areaId));
const rows=[];
for(const mall of ['vincom-dong-khoi','saigon-centre']) {
 process.env.MALL_ID=mall;
 const server=await createServer({configFile:false,optimizeDeps:{entries:[],noDiscovery:true},server:{middlewareMode:true}});
 try {
  const {site}=await server.ssrLoadModule('/src/data/site.ts');
  const baseline=read(mall==='vincom-dong-khoi'?`${out}/baseline-runtime.json`:`evidence/vincom-integration/runtime-${mall}.json`);
  assert.equal(site.destinations.length,mall==='vincom-dong-khoi'?203:165);
  const mapped=site.destinations.filter(d=>d.locations.some(l=>l.areaIds.length)).length;
  assert.equal(mapped,mall==='vincom-dong-khoi'?114+changed.size:164);
  for(const d of baseline.destinations) if(mall!=='vincom-dong-khoi'||!changed.has(d.id)) assert.deepEqual(site.destinations.find(x=>x.id===d.id),d);
  for(const area of baseline.content.areas) {
   const current=site.content.areas.find(a=>a.id===area.id);
   if(mall==='vincom-dong-khoi'&&renamed.has(area.id)) {assert.deepEqual(current.regionIds,area.regionIds);assert.equal(current.floorId,area.floorId);}
   else assert.deepEqual(current,area);
  }
  for(const f of baseline.geometry.floors) for(const region of f.regions) {
   if(mall==='vincom-dong-khoi'&&packet.neutralCuts.some(c=>c.floorId===f.id&&c.original.id===region.id))continue;
   assert.deepEqual(site.geometry.floors.find(x=>x.id===f.id).regions.find(r=>r.id===region.id),region);
  }
  if(mall==='vincom-dong-khoi') {
   for(const row of [...packet.associations,...packet.sharedAssociations]) {
    const dest=site.destinations.find(d=>d.id===row.destinationId);const loc=dest.locations.find(l=>l.floorId===row.floorId);
    assert.deepEqual(loc.areaIds,[row.areaId]);assert.deepEqual(loc.associationDetail,row.associationDetail);
    assert.deepEqual(site.content.areas.find(a=>a.id===row.areaId).regionIds,row.regionIds);
    assert.match(loc.associationDetail.note.en,/unconfirmed|unverified/);assert.match(loc.associationDetail.note.vi,/chưa/i);
   }
   for(const hold of packet.protectedHolds) assert.equal(site.destinations.find(d=>d.id===hold.destinationId).locations.find(l=>l.floorId===hold.floorId).areaIds.length,0);
   writeFileSync(`${out}/runtime-after.json`,JSON.stringify(site));
  }
  const transport=`dist/${mall}/data/floor-geometry.json`,bytes=readFileSync(transport);
  assert.deepEqual(read(transport).floors.map(f=>({id:f.id,sources:f.sources,regions:f.regions})),site.geometry.floors.map(f=>({id:f.id,sources:f.sources,regions:f.regions})));
  assert.deepEqual(brotliDecompressSync(readFileSync(transport+'.br')),bytes);assert.deepEqual(gunzipSync(readFileSync(transport+'.gz')),bytes);
  rows.push({mall,total:site.destinations.length,mapped,floorOnly:site.destinations.length-mapped,allOtherDestinationsUnchanged:true,acceptedContoursPreserved:true,transportRoundtrip:true});
 } finally {await server.close();}
}
const dirty=read('evidence/vincom-remaining-2026-10-21/initial-worktree.json').dirtyPaths;
for(const [p,expected] of Object.entries(dirty))assert.equal(hash(readFileSync(p)),expected,`Pre-existing dirty bytes: ${p}`);
const result={malls:rows,newLinks:changed.size,protectedDirtyFiles:Object.keys(dirty).length,protectedPrecisionHolds:packet.protectedHolds.length,assetRevision:'photo-polish-2026-10-12-delivery-r2',completeMapping:false};
writeFileSync(`${out}/delivery-checks.json`,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
