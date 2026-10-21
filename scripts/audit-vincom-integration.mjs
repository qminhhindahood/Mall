import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {gunzipSync,brotliDecompressSync} from 'node:zlib';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const E='evidence/vincom-integration';
const site=read(`${E}/runtime-vincom-dong-khoi.json`),saigon=read(`${E}/runtime-saigon-centre.json`),baseline=read(`${E}/baseline-vincom.json`);
const packets=['vincom-mapping-prompt1-2026-10-21-r2','vincom-completion-b3-b2-2026-10-21-r2'].map(n=>read(`data/research/${n}.json`));
const checks=[];const check=(n,f)=>{f();checks.push(n);};
check('203 unique Vincom records, 113 area-linked, 90 floor-only',()=>{assert.equal(site.destinations.length,203);assert.equal(new Set(site.destinations.map(d=>d.id)).size,203);assert.equal(site.destinations.filter(d=>d.locations.some(l=>l.areaIds.length)).length,113);});
check('Saigon retains 164 of 165 listings mapped',()=>{assert.equal(saigon.destinations.length,165);assert.equal(saigon.destinations.filter(d=>d.locations.some(l=>l.areaIds.length)).length,164);});
for(const a of packets.flatMap(p=>p.associations))check('accepted destination/floor/regions: '+a.destinationId,()=>{
 const d=site.destinations.find(d=>d.id===a.destinationId),l=d.locations.find(l=>l.floorId===a.floorId),area=site.content.areas.find(x=>x.id===l.areaIds[0]);
 assert.equal(l.certainty,'area-confirmed');assert.deepEqual(l.areaIds,[a.areaId]);assert.deepEqual(area.regionIds,a.regionIds);assert.ok(l.associationDetail.note.en.trim()&&l.associationDetail.note.vi.trim());
 if(a.associationDetail.kind==='partial-source-layout')assert.equal(l.associationDetail.kind,'partial-source-layout');
 for(const rid of area.regionIds)assert.ok(site.geometry.floors.find(f=>f.id===a.floorId).regions.some(r=>r.id===rid));
});
const changed=new Set(packets.flatMap(p=>p.associations.map(a=>a.destinationId)));
for(const d of baseline.destinations)if(!changed.has(d.id))check('unchanged destination: '+d.id,()=>assert.deepEqual(site.destinations.find(x=>x.id===d.id),d));
for(const a of baseline.content.areas)check('existing area preserved: '+a.id,()=>assert.deepEqual(site.content.areas.find(x=>x.id===a.id),a));
const activeRegions=new Set(baseline.content.areas.flatMap(a=>a.regionIds));
for(const f of baseline.geometry.floors)for(const r of f.regions.filter(r=>activeRegions.has(r.id)))check('active polygon preserved: '+f.id+':'+r.id,()=>assert.deepEqual(site.geometry.floors.find(x=>x.id===f.id).regions.find(x=>x.id===r.id),r));
for(const h of packets[0].protectedHolds)check('precision hold remains: '+h.destinationId,()=>assert.equal(site.destinations.find(d=>d.id===h.destinationId).locations.find(l=>l.floorId===h.floorId).areaIds.length,0));
check('ZARA and H&M M-floor caveats retained',()=>{for(const id of ['vincom-prototype-zara','vincom-prototype-hm'])assert.equal(site.destinations.find(d=>d.id===id).locations.find(l=>l.floorId==='M').areaIds.length,0);});
check('Boat Noodle and BKK deliberately share one area',()=>assert.deepEqual(site.destinations.find(d=>d.id==='vincom-prototype-boatnoodle').locations[0].areaIds,site.destinations.find(d=>d.id==='vincom-prototype-bkkstreetdessert').locations[0].areaIds));
for(const mall of ['vincom-dong-khoi','saigon-centre']){
 const g=read(`dist/${mall}/data/floor-geometry.json`),expected=mall==='vincom-dong-khoi'?site.geometry:saigon.geometry;
 check(mall+': built geometry floor sources and regions exactly match runtime',()=>assert.deepEqual(g.floors.map(f=>({id:f.id,sources:f.sources,regions:f.regions})),expected.floors.map(f=>({id:f.id,sources:f.sources,regions:f.regions}))));
 const b=fs.readFileSync(`dist/${mall}/data/floor-geometry.json`);
 for(const ext of ['gz','br'])check(mall+': '+ext+' geometry roundtrip exact',()=>assert.deepEqual(ext==='gz'?gunzipSync(fs.readFileSync(`dist/${mall}/data/floor-geometry.json.gz`)):brotliDecompressSync(fs.readFileSync(`dist/${mall}/data/floor-geometry.json.br`)),b));
}
const restore=read(`${E}/restore.json`);const protectedPaths=Object.keys(restore.finalHashes).filter(n=>(n.startsWith('assets/')||n.startsWith('src/data/routing/')||n.startsWith('src/components/')||n.startsWith('src/styles/')||n.startsWith('data/malls/')||n.startsWith('data/research/saigon-'))&&n!=='data/malls/vincom-dong-khoi/asset-manifest.json');
check('Only generated Vincom geometry transport metadata changes in asset manifest',()=>{const n='data/malls/vincom-dong-khoi/asset-manifest.json',old=JSON.parse(execFileSync('git',['show','HEAD:'+n],{encoding:'utf8'})),now=read(n);delete old.floorGeometry;const metadata=now.floorGeometry;delete now.floorGeometry;assert.deepEqual(now,old);assert.equal(metadata.sha256,hash(fs.readFileSync('dist/vincom-dong-khoi/data/floor-geometry.json')));});
for(const n of protectedPaths)check('checkpoint bytes unchanged: '+n,()=>assert.equal(hash(fs.readFileSync(n)),restore.finalHashes[n]));
check('Saigon association helper remains checkpoint bytes',()=>assert.equal(hash(fs.readFileSync('src/data/association-supplement.ts')),restore.finalHashes['src/data/association-supplement.ts']));
const result={checksPassed:checks.length,checks,coverage:{vincom:{mapped:113,total:203,floorOnly:90},saigon:{mapped:164,total:165},combined:{mapped:277,total:368}},assetRevision:'photo-polish-2026-10-12-delivery-r2',mappingComplete:false};
fs.writeFileSync(`${E}/source-guards.json`,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({checksPassed:checks.length,coverage:result.coverage}));
