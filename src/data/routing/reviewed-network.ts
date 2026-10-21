import type { SiteData } from '../site';
import type { Point, RouteAnchor, RoutingNetwork, RoutingSource } from './contracts';
import {validateRoutingNetwork} from './graph';
import {reviewedFixtures} from './reviewed-fixtures';

// These frames are part of the reviewed fixture identity, never inferred from a new raster.
const sources:RoutingSource[]=[
 {id:'saigon-centre:L5:plan',mallId:'saigon-centre',floorId:'L5',sha256:'4abefc8f9c34f1fa3c0f9076e5b4b9c5689505d783d6a843a37078f2a6b712c5',width:4732,height:4416,transform:[.02,0,0,.02,-47.32,-44.160000000000004],reviewId:'area-routing-2026-10-21'},
 {id:'vincom-dong-khoi:B3:plan',mallId:'vincom-dong-khoi',floorId:'B3',sha256:'ccf11fc15fc9f6efa32ca8a23b395caba1a0e2f248740c0ee0d9c2c6c5e12e89',width:1320,height:1077,transform:[.1,0,0,.1,-66,-53.85],reviewId:'integrated-mapping-r6'},
 {id:'saigon-centre:L2:plan',mallId:'saigon-centre',floorId:'L2',sha256:'4749dd738ea148407c334396183ef917711f4ff10fbfaa796a7ff6f31ede4fd5',width:4608,height:5082,transform:[.02,0,0,.02,-46.08,-50.82],reviewId:'crossfloor-3c7eee2'},
 {id:'saigon-centre:L3:plan',mallId:'saigon-centre',floorId:'L3',sha256:'905e5de4c90debbabddd8a7fadf9e47b5084bf6b01703ba5450b9e8603763ab8',width:4712,height:5142,transform:[.02,0,0,.02,-47.12,-51.42],reviewId:'crossfloor-3c7eee2'},
];

/** Frozen r6 adapter only. Search is generic; adding coverage requires a reviewed data revision. */
export function createReviewedRoutingNetwork(site:Pick<SiteData,'mallId'|'geometry'|'destinations'|'content'>):RoutingNetwork {
 const graph:RoutingNetwork={revision:reviewedFixtures.revision,mallId:site.mallId,floorIds:site.geometry.floors.map(f=>f.id),sources:sources.filter(s=>s.mallId===site.mallId).map(s=>({...s,transform:[...s.transform]})),nodes:[],arcs:[],anchors:[],connectors:[]};
 const sourceFor=(floor:string)=>graph.sources.find(s=>s.floorId===floor)!;
 const hasLocation=(destinationId:string,floorId:string,areaId?:string)=>site.destinations.some(d=>d.id===destinationId&&d.status==='open'&&d.locations.some(l=>l.floorId===floorId&&l.certainty==='area-confirmed'&&(!areaId||l.areaIds.includes(areaId))));
 const addAnchor=(anchor:RouteAnchor)=>{if(!graph.anchors.some(a=>a.id===anchor.id))graph.anchors.push(anchor)};
 for(const network of reviewedFixtures.areaNetworks.filter(n=>n.mall===site.mallId)){
  const source=sourceFor(network.floor),nodeId=(id:string)=>`${site.mallId}:${network.floor}:${id}`;
  const point=(id:string):Point=>{const node=network.nodes.find(n=>n.id===id)!;return [node.x*source.width/network.size[0],node.y*source.height/network.size[1]]};
  graph.nodes.push(...network.nodes.map(n=>({id:nodeId(n.id),sourceId:source.id,point:point(n.id),kind:'junction' as const,reviewId:source.reviewId})));
  graph.arcs.push(...network.edges.map((edge,i)=>({id:`${source.id}:walk:${i}`,from:nodeId(edge.from),to:nodeId(edge.to),kind:'walk' as const,sourceId:source.id,polyline:[point(edge.from),point(edge.to)],steps:[{floorId:network.floor,instruction:{...edge.instruction}}],reviewId:source.reviewId,availability:'plan-based' as const})));
  for(const start of network.starts)addAnchor({id:`landmark:${start}@${network.floor}`,mallId:site.mallId,floorId:network.floor,nodeId:nodeId(start),kind:'landmark',mayStart:true,mayFinish:false,scope:'public-area',reviewId:source.reviewId});
  for(const endpoint of network.endpoints){if(!hasLocation(endpoint.destinationId,network.floor,endpoint.areaId))continue;addAnchor({id:`${endpoint.destinationId}@${network.floor}`,mallId:site.mallId,floorId:network.floor,nodeId:nodeId(endpoint.node),kind:'destination',destinationId:endpoint.destinationId,areaId:endpoint.areaId,mayStart:false,mayFinish:true,scope:'area-frontage',reviewId:source.reviewId})}
 }
 // Both directions below are imported independently, including their separately authored text.
 // This loop does not synthesize reverse arcs or dispatch on a requested destination pair.
 const crossAreas:Record<string,string>={'saigon-prototype-calvinklein':'research-l2-l2-02-03','saigon-prototype-mlb':'research-l3-l3-31'};
 for(const plan of reviewedFixtures.plans.filter(p=>p.connection.mall===site.mallId)){
  const first=plan.legs[0],last=plan.legs[1],reviewId='crossfloor-3c7eee2';
  if(!hasLocation(plan.from,first.floor,crossAreas[plan.from])||!hasLocation(plan.to,last.floor,crossAreas[plan.to]))continue;
  const sourceA=sourceFor(first.floor),sourceB=sourceFor(last.floor);
  const nodeA=`${site.mallId}:${first.floor}:${plan.from}:frontage`,landingA=`${site.mallId}:${first.floor}:zone-a:landing`,landingB=`${site.mallId}:${last.floor}:zone-a:landing`,nodeB=`${site.mallId}:${last.floor}:${plan.to}:frontage`;
  for(const [id,sourceId,point,kind] of [[nodeA,sourceA.id,first.points[0],'frontage'],[landingA,sourceA.id,first.points.at(-1)!,'landing'],[landingB,sourceB.id,last.points[0],'landing'],[nodeB,sourceB.id,last.points.at(-1)!,'frontage']] as const){if(!graph.nodes.some(n=>n.id===id))graph.nodes.push({id,sourceId,point:[...point],kind,reviewId})}
  for(const [destinationId,floorId,nodeId]of[[plan.from,first.floor,nodeA],[plan.to,last.floor,nodeB]])addAnchor({id:`${destinationId}@${floorId}`,mallId:site.mallId,floorId,nodeId,kind:'destination',destinationId,areaId:crossAreas[destinationId],mayStart:true,mayFinish:true,scope:'area-frontage',reviewId});
  let connector=graph.connectors.find(c=>c.id===plan.connection.id);if(!connector){connector={id:plan.connection.id,mallId:site.mallId,reviewId,landings:[landingA,landingB],transfers:[]};graph.connectors.push(connector)}connector.transfers.push({from:landingA,to:landingB});
  const transfer=plan.steps.findIndex(s=>'transferTo' in s),steps=plan.steps.map(s=>({floorId:s.floor,instruction:{en:s.text,vi:reviewedFixtures.planInstructionVi[s.text]},...('transferTo'in s?{transferTo:s.transferTo}:{})}));
  if(transfer<0||steps.some(s=>!s.instruction.vi))throw new Error('Routing network: incomplete frozen plan instructions');
  const prefix=`${site.mallId}:${plan.from}:${plan.to}`;
  graph.arcs.push(
   {id:`${prefix}:depart`,from:nodeA,to:landingA,kind:'walk',sourceId:sourceA.id,polyline:first.points.map(p=>[...p]),steps:steps.slice(0,transfer),reviewId,availability:'plan-based'},
   {id:`${prefix}:transfer`,from:landingA,to:landingB,kind:'transfer',connectorId:plan.connection.id,steps:[steps[transfer]],reviewId,availability:'plan-based'},
   {id:`${prefix}:arrive`,from:landingB,to:nodeB,kind:'walk',sourceId:sourceB.id,polyline:last.points.map(p=>[...p]),steps:steps.slice(transfer+1),reviewId,availability:'plan-based'},
  );
 }
 validateRoutingNetwork(graph,site);
 return graph;
}
