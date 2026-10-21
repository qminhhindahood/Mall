import type { SiteData } from '../site';
import type { EndpointRef, RoutingNetwork } from './contracts';
import {anchorRef,planSharedRoute} from './graph';

/** Derive ordered reachability from eligible anchors; pair totals are outputs, never planner rules. */
export function routingCoverage(site:Pick<SiteData,'mallId'|'destinations'|'content'>,network:RoutingNetwork){
 if(site.mallId!==network.mallId)throw new Error('Routing coverage: mall mismatch');
 const origins=network.anchors.filter(a=>a.mayStart),targets=network.anchors.filter(a=>a.mayFinish);
 const pairs=origins.flatMap(origin=>targets.flatMap(destination=>{const result=planSharedRoute(network,{from:anchorRef(origin),to:anchorRef(destination)});return result.status==='ready'?[{from:origin.id,to:destination.id,fromFloor:origin.floorId,toFloor:destination.floorId,arcIds:result.arcs.map(a=>a.id),crossFloor:origin.floorId!==destination.floorId}]:[]}));
 const rows=site.destinations.map(destination=>({destinationId:destination.id,status:destination.status,locations:destination.locations.map(location=>{
  const anchors=network.anchors.filter(a=>a.destinationId===destination.id&&a.floorId===location.floorId);
  const incoming=pairs.filter(p=>anchors.some(a=>a.id===p.to)),outgoing=pairs.filter(p=>anchors.some(a=>a.id===p.from));
  return {floorId:location.floorId,location:location.certainty==='floor-confirmed'?'floor-only':location.associationDetail?.kind==='partial-source-layout'?'partial-source-area':'source-area',areaIds:[...location.areaIds],approach:{inbound:anchors.filter(a=>a.mayFinish).map(a=>a.id),outbound:anchors.filter(a=>a.mayStart).map(a=>a.id)},connectivity:{incoming:incoming.map(p=>p.from),outgoing:outgoing.map(p=>p.to),sameFloor:incoming.some(p=>!p.crossFloor)||outgoing.some(p=>!p.crossFloor),crossFloor:incoming.some(p=>p.crossFloor)||outgoing.some(p=>p.crossFloor)},availability:{basis:'source-plan',operationalStatus:'not-observed',incoming:incoming.length,outgoing:outgoing.length,reason:!anchors.length?'no-reviewed-approach':!incoming.length&&!outgoing.length?'disconnected':'reviewed-pairs-only'}};
 })}));
 return {mallId:site.mallId,networkRevision:network.revision,directoryRevision:site.content.revision,listings:rows.length,publicEntranceNodes:network.anchors.filter(a=>a.kind==='public-entrance').length,eligibleOrigins:origins.map(a=>a.id),eligibleTargets:targets.map(a=>a.id),directedJourneys:pairs.length,pairs,rows};
}

/** Generate requests for every listing-floor, including unsupported endpoints, for browser/authoring audits. */
export function allListingTargets(site:Pick<SiteData,'mallId'|'destinations'>):EndpointRef[]{return site.destinations.flatMap(d=>d.locations.map(l=>({kind:'destination' as const,mallId:site.mallId,destinationId:d.id,floorId:l.floorId})))}
