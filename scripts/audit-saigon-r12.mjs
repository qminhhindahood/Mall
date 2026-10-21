import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import ts from 'typescript';import {pathToFileURL} from 'node:url';import {approvedGeometry} from './approved-overlay.mjs';import {derivedDirectory} from './vincom-segmentation-overlay.mjs';
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'midterm-r12-')),cache=new Map();
function emit(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const dest=path.join(temp,cache.size+'.mjs'),url=pathToFileURL(dest).href;cache.set(file,url);let code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ESNext,module:ts.ModuleKind.ESNext}}).outputText;code=code.replace(/(from\s+|import\s*\()(['"])(\.[^'"]+)\2/g,(_,prefix,q,s)=>{let f=path.resolve(path.dirname(file),s);if(!path.extname(f))f+='.ts';return prefix+q+emit(f)+q});fs.writeFileSync(dest,code);return url}
const load=f=>import(emit(f));const [{applyPrecisionHolds},{applyAssociationSupplement},{applySharedComponents},{createReviewedRoutingNetwork},{routingCoverage}]=await Promise.all([load('src/data/precision-holds.ts'),load('src/data/association-supplement.ts'),load('src/data/shared-components.ts'),load('src/data/routing/reviewed-network.ts'),load('src/data/routing/coverage.ts')]);
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),clone=x=>structuredClone(x),checks=[],check=(n,f)=>{f();checks.push(n)},packet=read('data/research/saigon-department-partials-2026-10-21-r12.json'),review=read(packet.reviewEvidence.path),summary=[];
for(const mallId of ['saigon-centre','vincom-dong-khoi']){
 const geometry=approvedGeometry(process.cwd(),mallId,read('data/malls/'+mallId+'/floor-geometry.json'));
 let content=applyPrecisionHolds(read('data/malls/'+mallId+'/directory.json'),read('data/research/vincom-precision-holds-2026-10-21-r1.json'));
 const apply=name=>{const p=read('data/research/'+name+'.json');content=applyAssociationSupplement(content,geometry,p,read(p.reviewEvidence.path))};
 apply('vincom-source-associations-2026-10-21-r1');content=derivedDirectory(process.cwd(),content,geometry);apply('vincom-source-associations-2026-10-21-r9');apply('saigon-source-associations-2026-10-21-r10');apply('saigon-source-associations-2026-10-21-r11');
 content=applySharedComponents(process.cwd(),content,geometry,read('data/research/saigon-shared-components-2026-10-21-r11.json'));apply('saigon-asian-band-2026-10-21-r11');
 const before=content,after=applyAssociationSupplement(before,geometry,packet,review);
 if(mallId==='saigon-centre'){
  check('Only Takashimaya changes',()=>assert.deepEqual(after.destinations.filter((d,i)=>JSON.stringify(d)!==JSON.stringify(before.destinations[i])).map(d=>d.id),['saigon-prototype-takashimaya']));
  check('All five previous areas and original geometry preserved',()=>{assert.equal(after.areas.length,before.areas.length+5);assert.deepEqual(after.areas.slice(0,before.areas.length),before.areas)});
  for(const row of packet.associations)check(row.floorId+': unchanged named counter only, explicit partial scope',()=>{const loc=after.destinations.find(d=>d.id===row.destinationId).locations.find(l=>l.floorId===row.floorId);assert.equal(loc.certainty,'area-confirmed');assert.deepEqual(loc.areaIds,[row.areaId]);assert.equal(loc.associationDetail.kind,'partial-source-layout');assert.match(loc.associationDetail.note.en,/not the department-store perimeter/);assert.deepEqual(geometry.floors.find(f=>f.id===row.floorId).regions.find(r=>r.id===row.regionIds[0]),row.geometryRegions[0])});
  check('Matin Kim and Miana unchanged',()=>{for(const id of ['saigon-prototype-matinkimvietnam','saigon-prototype-miana'])assert.deepEqual(after.destinations.find(d=>d.id===id),before.destinations.find(d=>d.id===id))});
  check('Matin Kim remains floor-only',()=>assert.equal(after.destinations.find(d=>d.id==='saigon-prototype-matinkimvietnam').locations[0].areaIds.length,0));
  check('Wrong-floor receipt rejected',()=>{const r=clone(review);r.decisions[0].floor='L6';assert.throws(()=>applyAssociationSupplement(before,geometry,packet,r),/differs from independent review/)});
  check('Duplicate floor decision rejected',()=>{const r=clone(review);r.decisions.push(r.decisions[0]);assert.throws(()=>applyAssociationSupplement(before,geometry,packet,r),/differs from independent review/)});
  check('Duplicate floor association rejected',()=>{const p=clone(packet);p.associations.push(p.associations[0]);assert.throws(()=>applyAssociationSupplement(before,geometry,p,review),/duplicate association/)});
  check('Geometry drift rejected',()=>{const g=clone(geometry);g.floors[0].regions.find(r=>r.id===packet.associations[0].regionIds[0]).outer[0][0]+=.1;assert.throws(()=>applyAssociationSupplement(before,g,packet,review),/polygon drift/)});
 }else check('Vincom exactly unchanged',()=>assert.deepEqual(after,before));
 const site={mallId,geometry,content:after,destinations:after.destinations},graph=createReviewedRoutingNetwork(site);
 check(mallId+': graph exactly unchanged',()=>assert.deepEqual(graph,createReviewedRoutingNetwork({...site,content:before,destinations:before.destinations})));
 const coverage=routingCoverage(site,graph),linked=after.destinations.filter(d=>d.locations.some(l=>l.areaIds.length)).length;
 summary.push({mallId,listings:after.destinations.length,areaLinked:linked,floorOnly:after.destinations.length-linked,directedJourneys:coverage.directedJourneys,approaches:graph.anchors.filter(a=>a.kind==='destination').length,connectedEntrances:coverage.publicEntranceNodes});
}
check('202 total area-linked; 41 directed journeys',()=>{assert.equal(summary.reduce((n,s)=>n+s.areaLinked,0),202);assert.equal(summary.reduce((n,s)=>n+s.directedJourneys,0),41)});
const result={checksPassed:checks.length,checks,summary};fs.writeFileSync('evidence/saigon-last-two-r12/checks.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));

