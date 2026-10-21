import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const root='D:/Midterm/.scratch/redesign-readiness-2026-10-21',out='D:/Midterm/.scratch/routing-guard-final-2026-10-21';
let script=fs.readFileSync(root+'/scripts/audit-shared-routing.mjs','utf8');
for(const [from,to] of [['typescript',root+'/node_modules/typescript/lib/typescript.js'],['./approved-overlay.mjs',root+'/scripts/approved-overlay.mjs'],['./vincom-segmentation-overlay.mjs',root+'/scripts/vincom-segmentation-overlay.mjs']])script=script.replace("from '"+from+"'","from '"+pathToFileURL(to).href+"'");
script=script.replace("path.resolve('evidence/shared-routing-r1')",JSON.stringify(out));
const extra=`
 if(mallId==='saigon-centre'){
  const ck=network.anchors.find(a=>a.destinationId==='saigon-prototype-calvinklein'),mlb=network.anchors.find(a=>a.destinationId==='saigon-prototype-mlb');
  check('Independent exact CK area identity',()=>assert.equal(ck.areaId,'research-l2-l2-02-03'));
  check('Independent exact MLB area identity',()=>assert.equal(mlb.areaId,'research-l3-l3-31'));
  for(const anchor of [ck,mlb])check('Independent real same-floor replacement '+anchor.id,()=>{
   const changed=clone(site),d=changed.destinations.find(d=>d.id===anchor.destinationId),loc=d.locations.find(l=>l.floorId===anchor.floorId),replacement=changed.content.areas.find(a=>a.floorId===anchor.floorId&&a.id!==anchor.areaId);
   assert.ok(replacement);loc.areaIds=[replacement.id];assert.throws(()=>validateRoutingNetwork(network,changed),/endpoint association drift/);
   const safe=createReviewedRoutingNetwork(changed);assert.equal(planSharedRoute(safe,{from:anchorRef(ck),to:anchorRef(mlb)}).status,'unavailable');assert.equal(planSharedRoute(safe,{from:anchorRef(mlb),to:anchorRef(ck)}).status,'unavailable');
   fs.writeFileSync(path.join(output,anchor.floorId+'-area-mutation.json'),JSON.stringify({original:anchor.areaId,replacement:replacement.id,floor:replacement.floorId,rejected:true,bothDirectionsUnavailable:true},null,2));
  });
  const mutations=[
   ['missing connector registry',g=>g.connectors=[]],
   ['connector wrong mall',g=>g.connectors[0].mallId='vincom-dong-khoi'],
   ['nonlanding registry member',g=>g.connectors[0].landings[0]=ck.nodeId],
   ['same-floor transfer tuple',g=>g.connectors[0].transfers[0].to=g.connectors[0].transfers[0].from],
   ['node review incoherence',g=>g.nodes[0].reviewId='other-review'],
   ['source floor drift',g=>g.sources.find(s=>s.floorId==='L2').floorId='B2'],
   ['transfer target floor drift',g=>g.arcs.find(a=>a.kind==='transfer').steps[0].transferTo='L5'],
   ['reverse tuple cannot approve forward arc',g=>{const a=g.arcs.find(a=>a.kind==='transfer');g.connectors[0].transfers=g.connectors[0].transfers.filter(t=>!(t.from===a.from&&t.to===a.to))}],
  ];
  for(const [name,mutate] of mutations)check('Independent '+name,()=>{const g=clone(network);mutate(g);assert.throws(()=>validateRoutingNetwork(g,site))});
  check('Independent both directed transfers removed creates no reverse',()=>{const g=clone(network);g.arcs=g.arcs.filter(a=>a.kind!=='transfer');assert.equal(planSharedRoute(g,{from:anchorRef(ck),to:anchorRef(mlb)}).status,'unavailable');assert.equal(planSharedRoute(g,{from:anchorRef(mlb),to:anchorRef(ck)}).status,'unavailable')});
 }
`;
script=script.replace(' reports.push({...coverage',extra+'\n reports.push({...coverage');
fs.writeFileSync(out+'/independent-audit.mjs',script);
