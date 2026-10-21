import type { SiteData } from '../site';
import type { EndpointRef, Point, RouteAnchor, RouteArc, RouteLeg, RouteResult, RoutingNetwork } from './contracts';

/** Reject structural/source drift; callers retain their static guide when validation fails. */
export function validateRoutingNetwork(network:RoutingNetwork,site?:Pick<SiteData,'mallId'|'geometry'|'destinations'|'content'>):void {
 const fail=(why:string):never=>{throw new Error(`Routing network: ${why}`)};
 const unique=(rows:{id:string}[],kind:string)=>{if(new Set(rows.map(r=>r.id)).size!==rows.length)fail(`duplicate ${kind}`)};
 unique(network.sources,'source');unique(network.nodes,'node');unique(network.arcs,'arc');unique(network.anchors,'anchor');unique(network.connectors,'connector');
 if(site&&site.mallId!==network.mallId)fail('mall mismatch');
 if(new Set(network.floorIds).size!==network.floorIds.length)fail('duplicate floor');
 for(const source of network.sources){
  if(source.mallId!==network.mallId||!network.floorIds.includes(source.floorId)||!source.reviewId||!/^[a-f0-9]{64}$/.test(source.sha256)||source.transform.length!==6||!source.transform.every(Number.isFinite)||source.width<=0||source.height<=0)fail('invalid source');
  if(site){const floor=site.geometry.floors.find(f=>f.id===source.floorId);if(!floor?.sources.some(s=>s.sha256===source.sha256&&s.width===source.width&&s.height===source.height&&JSON.stringify(s.transform)===JSON.stringify(source.transform)))fail(`source identity drift: ${source.id}`)}
 }
 const sourceFor=(id:string)=>network.sources.find(s=>s.id===id)??fail(`unknown source: ${id}`);
 const nodeFor=(id:string)=>network.nodes.find(n=>n.id===id)??fail(`unknown node: ${id}`);
 const pointValid=(p:Point,id:string)=>{const s=sourceFor(id);return p.length===2&&p.every(Number.isFinite)&&p[0]>=0&&p[1]>=0&&p[0]<=s.width&&p[1]<=s.height};
 for(const node of network.nodes)if(node.reviewId!==sourceFor(node.sourceId).reviewId||!pointValid(node.point,node.sourceId))fail(`invalid node review/position: ${node.id}`);
 for(const connector of network.connectors){
  if(connector.mallId!==network.mallId||!connector.reviewId||new Set(connector.landings).size!==connector.landings.length||connector.landings.length<2||!connector.transfers.length)fail(`invalid connector: ${connector.id}`);
  for(const landingId of connector.landings){const landing=nodeFor(landingId);if(landing.kind!=='landing'||sourceFor(landing.sourceId).reviewId!==connector.reviewId)fail(`connector landing review mismatch: ${connector.id}`)}
  const transfers=new Set<string>();for(const transfer of connector.transfers){const a=nodeFor(transfer.from),b=nodeFor(transfer.to),key=`${a.id} -> ${b.id}`;if(transfers.has(key)||!connector.landings.includes(a.id)||!connector.landings.includes(b.id)||sourceFor(a.sourceId).floorId===sourceFor(b.sourceId).floorId)fail(`invalid connector transfer tuple: ${connector.id}`);transfers.add(key)}
 }
 for(const arc of network.arcs){
  const a=nodeFor(arc.from),b=nodeFor(arc.to),sa=sourceFor(a.sourceId),sb=sourceFor(b.sourceId);
  if(!arc.reviewId||!arc.steps.length||!['plan-based','closed'].includes(arc.availability)||arc.steps.some(s=>!s.instruction.en.trim()||!s.instruction.vi.trim()||!network.floorIds.includes(s.floorId)))fail(`unreviewed arc: ${arc.id}`);
  if(arc.kind==='walk'){
   if(arc.reviewId!==sa.reviewId||a.sourceId!==b.sourceId||arc.sourceId!==a.sourceId||!arc.polyline||arc.polyline.length<2||arc.polyline.some(p=>!pointValid(p,arc.sourceId!))||JSON.stringify(arc.polyline[0])!==JSON.stringify(a.point)||JSON.stringify(arc.polyline.at(-1))!==JSON.stringify(b.point)||arc.steps.some(s=>s.floorId!==sa.floorId||s.transferTo))fail(`invalid walk/review: ${arc.id}`);
  }else if(arc.kind==='transfer'){
   const connector=network.connectors.find(c=>c.id===arc.connectorId);
   if(!connector||connector.reviewId!==arc.reviewId||arc.reviewId!==sa.reviewId||arc.reviewId!==sb.reviewId||!connector.transfers.some(t=>t.from===a.id&&t.to===b.id)||sa.floorId===sb.floorId||a.kind!=='landing'||b.kind!=='landing'||arc.polyline?.length||arc.steps.length!==1||arc.steps[0].floorId!==sa.floorId||arc.steps[0].transferTo!==sb.floorId)fail(`invalid transfer identity/review: ${arc.id}`);
  }else fail(`invalid arc kind: ${arc.id}`);
 }
 for(const anchor of network.anchors){
  const source=sourceFor(nodeFor(anchor.nodeId).sourceId);
  if(anchor.mallId!==network.mallId||anchor.floorId!==source.floorId||anchor.reviewId!==source.reviewId||(!anchor.mayStart&&!anchor.mayFinish))fail(`invalid anchor/review: ${anchor.id}`);
  if(anchor.kind==='destination'){
   if(!anchor.destinationId)fail(`destination ID missing: ${anchor.id}`);
   if(site){const destination=site.destinations.find(d=>d.id===anchor.destinationId),location=destination?.locations.find(l=>l.floorId===anchor.floorId);if(destination?.status!=='open'||!location||location.certainty!=='area-confirmed'||(anchor.areaId&&!location.areaIds.includes(anchor.areaId)))fail(`endpoint association drift: ${anchor.id}`)}
  }else if(anchor.kind==='public-entrance'&&nodeFor(anchor.nodeId).kind!=='public-entrance')fail(`entrance node mismatch: ${anchor.id}`);
 }
}

export const anchorRef=(a:RouteAnchor):EndpointRef=>a.kind==='destination'?{kind:a.kind,mallId:a.mallId,floorId:a.floorId,destinationId:a.destinationId!,approachId:a.id}:{kind:a.kind,mallId:a.mallId,floorId:a.floorId,endpointId:a.id};

/** Deterministic directed search. No reversal, nearest-node guess, metric or live-location claim. */
export function planSharedRoute(network:RoutingNetwork,request:{from:EndpointRef|null;to:EndpointRef}):RouteResult {
 const unavailable=(reason:Extract<RouteResult,{status:'unavailable'}>['reason']):RouteResult=>({status:'unavailable',reason});
 if(!request.from)return unavailable('origin-required');
 if(request.from.mallId!==network.mallId||request.to.mallId!==network.mallId)return unavailable('different-mall');
 if(!network.floorIds.includes(request.from.floorId)||!network.floorIds.includes(request.to.floorId))return unavailable('unknown-floor');
 const resolve=(ref:EndpointRef)=>network.anchors.filter(a=>a.mallId===ref.mallId&&a.floorId===ref.floorId&&a.kind===ref.kind&&(ref.kind==='destination'?a.destinationId===ref.destinationId&&(!ref.approachId||ref.approachId===a.id):a.id===ref.endpointId));
 const origins=resolve(request.from),targets=resolve(request.to);
 if(!origins.length||!targets.length)return unavailable('unknown-endpoint');
 if(origins.length!==1||targets.length!==1)return unavailable('ambiguous-approach');
 const origin=origins[0],destination=targets[0];
 if(origin.id===destination.id)return unavailable('same-place');
 if(!origin.mayStart)return unavailable('origin-approach-unreviewed');
 if(!destination.mayFinish)return unavailable('destination-approach-unreviewed');
 const queue:{nodeId:string;arcs:RouteArc[]}[]=[{nodeId:origin.nodeId,arcs:[]}],seen=new Set<string>();
 while(queue.length){
  const next=queue.shift()!;if(seen.has(next.nodeId))continue;seen.add(next.nodeId);
  if(next.nodeId===destination.nodeId){
   const legs:RouteLeg[]=[];
   for(const arc of next.arcs){if(arc.kind!=='walk')continue;const source=network.sources.find(s=>s.id===arc.sourceId)!;const last=legs.at(-1);if(last?.sourceId===source.id&&JSON.stringify(last.points.at(-1))===JSON.stringify(arc.polyline![0])){last.points.push(...arc.polyline!.slice(1));last.arcIds.push(arc.id)}else legs.push({floorId:source.floorId,sourceId:source.id,arcIds:[arc.id],points:arc.polyline!.map(p=>[...p])})}
   return {status:'ready',basis:'source-plan',origin,destination,arcs:next.arcs,legs,steps:next.arcs.flatMap(a=>a.steps.map(s=>({...s,arcId:a.id}))),limitations:[{en:'Reviewed public-area guidance only; exact doorway, live location, distance and arrival time are not established.',vi:'Chỉ hướng dẫn theo khu vực chung đã kiểm tra; chưa xác định cửa chính xác, vị trí trực tiếp, khoảng cách hoặc thời gian đến.'},...(next.arcs.some(a=>a.kind==='transfer')?[{en:'Floor transfer is paired from supplied plans; current operation is not verified. Confirm the floor manually.',vi:'Kết nối tầng được đối chiếu theo sơ đồ; hoạt động hiện tại chưa được xác minh. Tự xác nhận tầng đã đến.'}]:[])]};
  }
  for(const arc of network.arcs.filter(a=>a.from===next.nodeId&&a.availability==='plan-based').sort((a,b)=>a.id.localeCompare(b.id)))queue.push({nodeId:arc.to,arcs:[...next.arcs,arc]});
 }
 return unavailable('disconnected');
}

export function routePointToMap(network:RoutingNetwork,sourceId:string,[x,y]:Point):Point {
 const source=network.sources.find(s=>s.id===sourceId);if(!source)throw new Error('Routing network: unknown source');const [a,b,c,d,e,f]=source.transform;return [a*x+c*y+e,b*x+d*y+f];
}
