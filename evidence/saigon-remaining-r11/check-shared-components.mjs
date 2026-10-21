import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {approvedGeometry} from '../../scripts/approved-overlay.mjs';
import {applyAssociationSupplement} from '../../src/data/association-supplement.ts';
import {applySharedComponents} from '../../src/data/shared-components.ts';

const root=process.cwd();
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const clone=x=>structuredClone(x);
const geometry=approvedGeometry(root,'saigon-centre',read('data/malls/saigon-centre/floor-geometry.json'));
let snapshot=read('data/malls/saigon-centre/directory.json');
for (const rev of ['r10','r11']) {
  const packet=read(`data/research/saigon-source-associations-2026-10-21-${rev}.json`);
  snapshot=applyAssociationSupplement(snapshot,geometry,packet,read(packet.reviewEvidence.path));
}
const packet=read('data/research/saigon-shared-components-2026-10-21-r11.json');
const checks=[];
const check=(name,fn)=>{fn();checks.push({name,passed:true});};
const apply=(s=snapshot,g=geometry,p=packet)=>applySharedComponents(root,s,g,p);
const bad=(name,edit,expected)=>check(name,()=>{const s=clone(snapshot),g=clone(geometry),p=clone(packet);edit(s,g,p);assert.throws(()=>apply(s,g,p),expected);});
check('wrong mall returns original',()=>{const s={...snapshot,mallId:'vincom-dong-khoi'};assert.equal(apply(s),s);});
check('pending snapshot returns original',()=>{const s={...snapshot,approval:'pending'};assert.equal(apply(s),s);});
check('pending packet returns original',()=>assert.equal(apply(snapshot,geometry,{...packet,activation:'pending'}),snapshot));
bad('directory revision guard',s=>s.revision+='-drift',/revision drift/);
bad('review hash guard',(s,g,p)=>p.reviewEvidence.sha256='0'.repeat(64),/review hash drift/);
bad('review decision guard',(s,g,p)=>p.decision.associationDetail.note.en='changed',/decision differs/);
bad('target record guard',s=>s.destinations.find(d=>d.id===packet.decision.destinationId).status='closed',/target destination drift/);
bad('member record guard',s=>s.destinations.find(d=>d.id===packet.decision.members[0].expectedDestination.id).locations[0].areaIds=[],/member destination drift/);
bad('area guard',s=>s.areas.find(a=>a.id===packet.decision.members[0].expectedArea.id).name.en='changed',/area drift/);
bad('frame guard',(s,g)=>g.frame.version='changed',/frame or source drift/);
bad('floor source guard',(s,g)=>g.floors.find(f=>f.id==='L5').sources[0].transform[0]=99,/frame or source drift/);
bad('region guard',(s,g)=>g.floors.find(f=>f.id==='L5').regions.find(r=>r.id===packet.decision.members[0].geometryRegions[0].id).outer[0][0]+=1,/geometry drift/);
bad('one area owner guard',s=>s.areas.push({...packet.decision.members[0].expectedArea,id:'duplicate-test-area'}),/ownership drift/);
check('source input hash guard',()=>{
  const temp='evidence/saigon-remaining-r11/.shared-guard-review.json';
  const review=read(packet.reviewEvidence.path);
  review.sourceSha256['data/malls/saigon-centre/directory.json']='0'.repeat(64);
  const bytes=JSON.stringify(review);
  fs.writeFileSync(temp,bytes);
  try {
    const p={...packet,reviewEvidence:{path:temp,sha256:createHash('sha256').update(bytes).digest('hex')}};
    assert.throws(()=>apply(snapshot,geometry,p),/source hash drift/);
  } finally {fs.unlinkSync(temp);}
});
check('only target location and revision change; areas/children/geometry preserved',()=>{
  const before=JSON.stringify(snapshot),beforeGeometry=JSON.stringify(geometry),result=apply();
  assert.equal(JSON.stringify(snapshot),before); assert.equal(JSON.stringify(geometry),beforeGeometry);
  assert.equal(result.areas,snapshot.areas); assert.equal(result.facilities,snapshot.facilities);
  for(const d of snapshot.destinations) if(d.id!==packet.decision.destinationId) assert.equal(result.destinations.find(x=>x.id===d.id),d);
  const location=result.destinations.find(d=>d.id===packet.decision.destinationId).locations.find(l=>l.floorId==='L5');
  assert.deepEqual(location.areaIds,packet.decision.members.map(m=>m.expectedArea.id));
  assert.equal(location.associationDetail.kind,'partial-source-layout');
  assert.equal(result.destinations.filter(d=>d.locations.some(l=>l.areaIds.length)).length,162);
});
fs.writeFileSync('evidence/saigon-remaining-r11/oedo-helper-validation.json',JSON.stringify({passed:true,total:checks.length,checks,saigonAreaLinked:162,saigonFloorOnly:3,buildRun:false,browserRun:false},null,2)+'\n');
console.log(JSON.stringify({passed:true,total:checks.length,saigonAreaLinked:162,saigonFloorOnly:3}));
