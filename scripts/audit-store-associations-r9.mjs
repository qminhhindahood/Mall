import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
import {approvedGeometry} from './approved-overlay.mjs';
import {derivedDirectory} from './vincom-segmentation-overlay.mjs';

// Authoring/reachability guard checks explicitly authorized for this migration.
// Transpile only these data modules to an isolated temp directory; no Astro/build output changes.
const compiled=fs.mkdtempSync(path.join(os.tmpdir(),'midterm-routing-')),cache=new Map();
function emit(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const target=path.join(compiled,`${cache.size}.mjs`),url=pathToFileURL(target).href;cache.set(file,url);const output=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{target:ts.ScriptTarget.ESNext,module:ts.ModuleKind.ESNext}}).outputText.replace(/(from\s+|import\s*\()(['"])(\.[^'"]+)\2/g,(all,prefix,quote,spec)=>{let dependency=path.resolve(path.dirname(file),spec);if(!path.extname(dependency))dependency+='.ts';return `${prefix}${quote}${emit(dependency)}${quote}`});fs.writeFileSync(target,output);return url}
const load=file=>import(emit(file));
const [{applyPrecisionHolds},{applyAssociationSupplement},{createReviewedRoutingNetwork},{routingCoverage}]=await Promise.all([load('src/data/precision-holds.ts'),load('src/data/association-supplement.ts'),load('src/data/routing/reviewed-network.ts'),load('src/data/routing/coverage.ts')]);
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),clone=v=>structuredClone(v),checks=[];const check=(name,fn)=>{fn();checks.push(name)};
const holds=read('data/research/vincom-precision-holds-2026-10-21-r1.json'),old=read('data/research/vincom-source-associations-2026-10-21-r1.json'),packet=read('data/research/vincom-source-associations-2026-10-21-r9.json'),receipt=read(packet.reviewEvidence.path),summary=[];
for(const mallId of ['saigon-centre','vincom-dong-khoi']){
 const geometry=approvedGeometry(process.cwd(),mallId,read('data/malls/'+mallId+'/floor-geometry.json'));
 const held=applyPrecisionHolds(read('data/malls/'+mallId+'/directory.json'),holds);
 const before=derivedDirectory(process.cwd(),applyAssociationSupplement(held,geometry,old,read(old.reviewEvidence.path)),geometry);
 const after=applyAssociationSupplement(before,geometry,packet,receipt);
 if(mallId==='saigon-centre')check('Saigon content unchanged at authoring boundary',()=>assert.deepEqual(after,before));
 else {
  check('Exactly three listed destinations change',()=>assert.deepEqual(after.destinations.filter((d,i)=>JSON.stringify(d)!==JSON.stringify(before.destinations[i])).map(d=>d.id).sort(),packet.associations.map(a=>a.destinationId).sort()));
  check('Exactly three new areas; prior areas preserved',()=>{assert.deepEqual(after.areas.slice(0,before.areas.length),before.areas);assert.equal(after.areas.length-before.areas.length,3)});
  for(const row of packet.associations){
   check(row.destinationId+': exact unchanged contour and full source-area provenance',()=>{assert.deepEqual(geometry.floors.find(f=>f.id===row.floorId).regions.find(r=>r.id===row.regionIds[0]),row.geometryRegions[0]);const l=after.destinations.find(d=>d.id===row.destinationId).locations[0];assert.deepEqual(l.areaIds,[row.areaId]);assert.equal(l.associationDetail.kind,'source-layout');assert.ok(l.associationDetail.note.en&&l.associationDetail.note.vi)});
   check(row.destinationId+': source hash drift rejected',()=>{const g=clone(geometry);g.floors.find(f=>f.id===row.floorId).sources[0].sha256='0'.repeat(64);assert.throws(()=>applyAssociationSupplement(before,g,packet,receipt),/source identity drift/)});
   check(row.destinationId+': contour drift rejected',()=>{const g=clone(geometry);g.floors.find(f=>f.id===row.floorId).regions.find(r=>r.id===row.regionIds[0]).outer[0][0]+=.1;assert.throws(()=>applyAssociationSupplement(before,g,packet,receipt),/polygon drift/)});
  }
  check('All five precision holds remain floor-only',()=>{for(const h of packet.protectedHolds){const l=after.destinations.find(d=>d.id===h.destinationId).locations.find(l=>l.floorId===h.floorId);assert.equal(l.certainty,'floor-confirmed');assert.deepEqual(l.areaIds,[])}});
  check('Unaccepted activation remains inert',()=>assert.deepEqual(applyAssociationSupplement(before,geometry,{...packet,activation:'pending'},receipt),before));
  check('Wrong review decision rejected',()=>{const r=clone(receipt);r.decisions[0].printedUnits='OTHER';assert.throws(()=>applyAssociationSupplement(before,geometry,packet,r),/differs from independent review/)});
  check('Duplicate association rejected',()=>{const p=clone(packet);p.associations.push(p.associations[0]);assert.throws(()=>applyAssociationSupplement(before,geometry,p,receipt),/duplicate association/)});
  check('Source transform drift rejected',()=>{const g=clone(geometry);g.floors.find(f=>f.id==='B2').sources[0].transform[4]+=.1;assert.throws(()=>applyAssociationSupplement(before,g,packet,receipt),/source identity drift/)});
  check('Directory revision drift rejected',()=>assert.throws(()=>applyAssociationSupplement({...before,revision:'wrong'},geometry,packet,receipt),/directory revision drift/));
 }
 const oldSite={mallId,geometry,content:before,destinations:before.destinations},site={mallId,geometry,content:after,destinations:after.destinations},graph=createReviewedRoutingNetwork(site);
 check(mallId+': routing network exactly unchanged',()=>assert.deepEqual(graph,createReviewedRoutingNetwork(oldSite)));
 const coverage=routingCoverage(site,graph),mapped=after.destinations.filter(d=>d.locations.some(l=>l.areaIds.length)).length;
 summary.push({mallId,listings:after.destinations.length,mapped,floorOnly:after.destinations.length-mapped,directedJourneys:coverage.directedJourneys,approaches:graph.anchors.filter(a=>a.kind==='destination').length,connectedEntrances:coverage.publicEntranceNodes});
}
check('194 area-linked listings total',()=>assert.equal(summary.reduce((n,m)=>n+m.mapped,0),194));
check('41 directed journeys unchanged',()=>assert.equal(summary.reduce((n,m)=>n+m.directedJourneys,0),41));
const result={checksPassed:checks.length,checks,summary};fs.writeFileSync('evidence/store-associations-r9/checks.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
