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
const [{createReviewedRoutingNetwork},{validateRoutingNetwork,planSharedRoute,anchorRef,routePointToMap},{routingCoverage,allListingTargets},{applyPrecisionHolds},{applyAssociationSupplement},{reviewedFixtures},legacy,legacyPlan,legacyCopy]=await Promise.all([
 load('src/data/routing/reviewed-network.ts'),load('src/data/routing/graph.ts'),load('src/data/routing/coverage.ts'),load('src/data/precision-holds.ts'),load('src/data/association-supplement.ts'),load('src/data/routing/reviewed-fixtures.ts'),load('src/data/area-routing.ts'),load('src/data/plan-routes.ts'),load('src/components/atlas-handoff.ts'),
]);
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),clone=v=>structuredClone(v),checks=[];
function check(name,fn){fn();checks.push({name,pass:true})}
const output=path.resolve('evidence/shared-routing-r8');fs.mkdirSync(output,{recursive:true});
check('Frozen same-floor review data matches unchanged legacy data',()=>assert.deepEqual(reviewedFixtures.areaNetworks,legacy.areaNetworks));
// Compare separately authored cross-floor payloads and exact localized text, not only pair count.
for(const frozen of reviewedFixtures.plans){const {from,to,...plan}=frozen;check(`Legacy plan instruction/geometry parity ${from}`,()=>assert.deepEqual(plan,legacyPlan.planRoute('saigon-centre',from,to)));for(const step of plan.steps)assert.equal(reviewedFixtures.planInstructionVi[step.text],legacyCopy.planInstructionVi[step.text])}
const holds=read('data/research/vincom-precision-holds-2026-10-21-r1.json'),supplement=read('data/research/vincom-source-associations-2026-10-21-r1.json'),receipt=read(supplement.reviewEvidence.path),reports=[];
const expected={
 'saigon-centre':[
  ['landmark:zone-a@L5','saigon-prototype-dimtutac@L5'],['landmark:zone-a@L5','saigon-prototype-longjing@L5'],['landmark:zone-a@L5','saigon-prototype-changkangkung@L5'],
  ['saigon-prototype-calvinklein@L2','saigon-prototype-mlb@L3'],['saigon-prototype-mlb@L3','saigon-prototype-calvinklein@L2'],
 ],
 'vincom-dong-khoi':[['landmark:escalator@B3','vincom-prototype-siamsugar@B3'],['landmark:escalator@B3','vincom-prototype-changkangkung@B3'],['landmark:escalator@B3','vincom-prototype-chillithai@B3'],['landmark:escalator@B3','vincom-prototype-highlandscoffee@B3']],
};
const additions=['gogihouse','manwah','sanfulou','kichikichi'].map(n=>'vincom-prototype-'+n+'@B3');
const oldTargets=expected['vincom-dong-khoi'].map(p=>p[1]);
for(const target of additions)expected['vincom-dong-khoi'].push(['landmark:escalator@B3',target]);
for(const origin of additions)for(const target of [...additions,...oldTargets])if(origin!==target)expected['vincom-dong-khoi'].push([origin,target]);
const key=(from,to)=>`${from} -> ${to}`;
for(const mallId of['saigon-centre','vincom-dong-khoi']){
 const geometry=approvedGeometry(process.cwd(),mallId,read(`data/malls/${mallId}/floor-geometry.json`));
 const raw=read(`data/malls/${mallId}/directory.json`),content=derivedDirectory(process.cwd(),applyAssociationSupplement(applyPrecisionHolds(raw,holds),geometry,supplement,receipt),geometry),site={mallId,geometry,content,destinations:content.destinations};
 const network=createReviewedRoutingNetwork(site),coverage=routingCoverage(site,network);
 check(`${mallId}: exact expected ordered pair SET`,()=>assert.deepEqual(coverage.pairs.map(p=>key(p.from,p.to)).sort(),expected[mallId].map(p=>key(...p)).sort()));
 check(`${mallId}: no actual public entrance invented`,()=>assert.equal(coverage.publicEntranceNodes,0));
 const origins=[...network.anchors.filter(a=>a.kind!=='destination').map(anchorRef),...allListingTargets(site)],targets=allListingTargets(site),reachable=new Set(),reasons={};let evaluated=0;
 for(const from of origins)for(const to of targets){const result=planSharedRoute(network,{from,to});evaluated++;if(result.status==='ready'){reachable.add(key(result.origin.id,result.destination.id));assert.equal(result.arcs[0].from,result.origin.nodeId);assert.equal(result.arcs.at(-1).to,result.destination.nodeId);result.arcs.forEach((a,i)=>{assert.equal(a.availability,'plan-based');if(i)assert.equal(result.arcs[i-1].to,a.from)});}else reasons[result.reason]=(reasons[result.reason]??0)+1}
 check(`${mallId}: exhaustive every-listing-floor origin and target reachability`,()=>assert.deepEqual([...reachable].sort(),expected[mallId].map(p=>key(...p)).sort()));
 check(`${mallId}: null origin fails closed`,()=>assert.equal(planSharedRoute(network,{from:null,to:targets[0]}).reason,'origin-required'));
 const origin=anchorRef(network.anchors.find(a=>a.mayStart)),target=anchorRef(network.anchors.find(a=>a.mayFinish));
 check(`${mallId}: cross-mall request rejected`,()=>assert.equal(planSharedRoute(network,{from:{...origin,mallId:'another-mall'},to:target}).reason,'different-mall'));
 check(`${mallId}: unknown floor rejected`,()=>assert.equal(planSharedRoute(network,{from:origin,to:{...target,floorId:'NO-FLOOR'}}).reason,'unknown-floor'));
 check(`${mallId}: unknown endpoint rejected`,()=>assert.equal(planSharedRoute(network,{from:origin,to:{kind:'destination',mallId,floorId:target.floorId,destinationId:'missing-destination'}}).reason,'unknown-endpoint'));
 check(`${mallId}: unreviewed public entrance rejected`,()=>assert.equal(planSharedRoute(network,{from:{kind:'public-entrance',mallId,floorId:origin.floorId,endpointId:'unreviewed-entrance'},to:target}).reason,'unknown-endpoint'));
 for(const field of['sha256','transform'])check(`${mallId}: ${field} drift rejected`,()=>{const changed=clone(site);const s=changed.geometry.floors.find(f=>f.id===network.sources[0].floorId).sources[0];if(field==='sha256')s.sha256='0'.repeat(64);else s.transform[4]+=1;assert.throws(()=>createReviewedRoutingNetwork(changed),/source identity drift/)});
 check(`${mallId}: wrong graph mall rejected`,()=>assert.throws(()=>validateRoutingNetwork({...network,mallId:'wrong-mall'},site),/mall mismatch/));
 check(`${mallId}: missing graph node rejected`,()=>{const changed=clone(network);changed.arcs[0].to='missing-node';assert.throws(()=>validateRoutingNetwork(changed,site),/unknown node/)});
 check(`${mallId}: source-to-map transform exact`,()=>{const s=network.sources[0],p=[100,200],[a,b,c,d,e,f]=s.transform;assert.deepEqual(routePointToMap(network,s.id,p),[a*100+c*200+e,b*100+d*200+f])});
 // Compare same-floor ordered instructions and source-space leg endpoints to the existing planner.
 for(const old of legacy.areaNetworks.filter(n=>n.mall===mallId))for(const endpoint of old.endpoints){const result=planSharedRoute(network,{from:{kind:'landmark',mallId,floorId:old.floor,endpointId:`landmark:${old.starts[0]}@${old.floor}`},to:{kind:'destination',mallId,floorId:old.floor,destinationId:endpoint.destinationId}}),before=legacy.areaPath(old,endpoint.destinationId,old.starts[0]);check(`${mallId}: ${endpoint.destinationId} step parity`,()=>{assert.equal(result.status,'ready');assert.deepEqual(result.steps.map(s=>s.instruction),before.edges.map(e=>e.instruction))})}
 if(mallId==='saigon-centre'){
  for(const destinationId of['saigon-prototype-calvinklein','saigon-prototype-mlb'])check(`${destinationId}: another valid same-floor area cannot retain old frontage route`,()=>{
   const changed=clone(site),d=changed.destinations.find(d=>d.id===destinationId),location=d.locations[0];location.areaIds=[changed.content.areas.find(a=>a.floorId===location.floorId&&!location.areaIds.includes(a.id)).id];
   assert.throws(()=>validateRoutingNetwork(network,changed),/endpoint association drift/);
   const safe=createReviewedRoutingNetwork(changed),from={kind:'destination',mallId,floorId:'L2',destinationId:'saigon-prototype-calvinklein'},to={kind:'destination',mallId,floorId:'L3',destinationId:'saigon-prototype-mlb'};
   assert.equal(planSharedRoute(safe,{from,to}).status,'unavailable');assert.equal(planSharedRoute(safe,{from:to,to:from}).status,'unavailable');
  });
  check('Unknown transfer connector identity rejected',()=>{const changed=clone(network);changed.arcs.find(a=>a.kind==='transfer').connectorId='invented-connector';assert.throws(()=>validateRoutingNetwork(changed,site),/transfer identity/)});
  check('Transfer outside accepted connector landing tuple rejected',()=>{const changed=clone(network);changed.connectors[0].transfers=changed.connectors[0].transfers.slice(1);assert.throws(()=>validateRoutingNetwork(changed,site),/transfer identity/)});
  check('Connector registry review identity rejected',()=>{const changed=clone(network);changed.connectors[0].reviewId='unreviewed';assert.throws(()=>validateRoutingNetwork(changed,site),/connector landing review/)});
  check('Walk arc review identity rejected',()=>{const changed=clone(network);changed.arcs[0].reviewId='unreviewed';assert.throws(()=>validateRoutingNetwork(changed,site),/walk\/review/)});
  check('Transfer arc review identity rejected',()=>{const changed=clone(network);changed.arcs.find(a=>a.kind==='transfer').reviewId='unreviewed';assert.throws(()=>validateRoutingNetwork(changed,site),/transfer identity\/review/)});
  check('Anchor review identity rejected',()=>{const changed=clone(network);changed.anchors[0].reviewId='unreviewed';assert.throws(()=>validateRoutingNetwork(changed,site),/anchor\/review/)});
  for(const before of reviewedFixtures.plans){const result=planSharedRoute(network,{from:{kind:'destination',mallId,floorId:before.legs[0].floor,destinationId:before.from},to:{kind:'destination',mallId,floorId:before.legs[1].floor,destinationId:before.to}});check(`${before.from}: floor legs and manual transfer parity`,()=>{assert.equal(result.status,'ready');assert.deepEqual(result.legs.map(l=>({floor:l.floorId,points:l.points})),before.legs.map(l=>({floor:l.floor,points:l.points})));assert.deepEqual(result.steps.map(s=>({floor:s.floorId,text:s.instruction.en,...(s.transferTo?{transferTo:s.transferTo}:{})})),before.steps)})}
  check('Removing a transfer arc removes that journey, keeps independent reverse',()=>{const changed=clone(network);const ck=changed.anchors.find(a=>a.destinationId==='saigon-prototype-calvinklein'),mlb=changed.anchors.find(a=>a.destinationId==='saigon-prototype-mlb');changed.arcs=changed.arcs.filter(a=>!(a.kind==='transfer'&&a.steps[0].transferTo==='L3'));assert.equal(planSharedRoute(changed,{from:anchorRef(ck),to:anchorRef(mlb)}).status,'unavailable');assert.equal(planSharedRoute(changed,{from:anchorRef(mlb),to:anchorRef(ck)}).status,'ready')});
 }
 if(mallId==='vincom-dong-khoi'){
  for(const id of additions)check(id+': exact derived area required',()=>{
   const changed=clone(site),d=changed.destinations.find(d=>d.id===id.split('@')[0]);d.locations.find(l=>l.floorId==='B3').areaIds=['research-b3-b3-13'];
   assert.throws(()=>validateRoutingNetwork(network,changed),/endpoint association drift/);
   const safe=createReviewedRoutingNetwork(changed);assert.ok(!safe.anchors.some(a=>a.id===id));
  });
  check('Only four newly reviewed shop origins; Siam/southbound remain destination-only',()=>assert.deepEqual(network.anchors.filter(a=>a.kind==='destination'&&a.mayStart).map(a=>a.id).sort(),additions.slice().sort()));
  check('Landmark is not a selectable route destination',()=>assert.equal(network.anchors.find(a=>a.kind==='landmark').mayFinish,false));
  const accepted=read('evidence/integrated-mapping-r7/pending-b3-network/instruction-review.json');
  check('Seventeen added arcs use exact accepted bilingual directional text; E1 forward keeps old text',()=>{
   const arcs=network.arcs.filter(a=>a.id.includes(':r7:'));assert.equal(arcs.length,17);
   for(const arc of arcs){const r=accepted.rows.find(r=>arc.id.endsWith(':r7:'+r.edge+':'+r.direction));assert.equal(r.decision,'accept');assert.deepEqual(arc.steps[0].instruction,r.text)}
  });
 }
 reports.push({...coverage,evaluatedRequests:evaluated,unavailableReasonCounts:reasons});
}
check('All368 listings appear in coverage',()=>assert.equal(reports.reduce((sum,r)=>sum+r.listings,0),368));
const summary={scope:'Atlas shared planner integration with accepted B3 extension; authoring checks only, builds/browser owned by coordinator.',checks,checksPassed:checks.length,totalListings:reports.reduce((n,r)=>n+r.listings,0),directedJourneys:reports.reduce((n,r)=>n+r.directedJourneys,0),evaluatedRequests:reports.reduce((n,r)=>n+r.evaluatedRequests,0),malls:reports.map(r=>({mallId:r.mallId,listings:r.listings,directedJourneys:r.directedJourneys,evaluatedRequests:r.evaluatedRequests}))};
fs.writeFileSync(path.join(output,'coverage.json'),JSON.stringify({scope:summary.scope,malls:reports},null,2)+'\n');fs.writeFileSync(path.join(output,'checks.json'),JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary,null,2));
