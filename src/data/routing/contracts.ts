import type { Bilingual } from '../content';
export type Point = [number, number];
export type EndpointRef = {mallId:string;floorId:string} & (
  {kind:'destination';destinationId:string;approachId?:string} |
  {kind:'landmark'|'public-entrance';endpointId:string});
export type RoutingSource = {id:string;mallId:string;floorId:string;sha256:string;width:number;height:number;transform:number[];reviewId:string};
export type RouteNode = {id:string;sourceId:string;point:Point;kind:'junction'|'frontage'|'landing'|'public-entrance';reviewId:string};
export type RouteStep = {floorId:string;instruction:Bilingual;transferTo?:string};
export type RouteArc = {id:string;from:string;to:string;kind:'walk'|'transfer';sourceId?:string;polyline?:Point[];steps:RouteStep[];reviewId:string;availability:'plan-based'|'closed';connectorId?:string};
export type RouteAnchor = {id:string;mallId:string;floorId:string;nodeId:string;kind:'destination'|'landmark'|'public-entrance';destinationId?:string;areaId?:string;mayStart:boolean;mayFinish:boolean;scope:'area-frontage'|'partial-area-frontage'|'public-area'|'exact-threshold';reviewId:string};
export type RouteConnector = {id:string;mallId:string;reviewId:string;landings:string[];transfers:{from:string;to:string}[]};
export type RoutingNetwork = {revision:string;mallId:string;floorIds:string[];sources:RoutingSource[];nodes:RouteNode[];arcs:RouteArc[];anchors:RouteAnchor[];connectors:RouteConnector[]};
export type RouteLeg = {floorId:string;sourceId:string;arcIds:string[];points:Point[]};
export type RouteFailure = 'origin-required'|'different-mall'|'unknown-floor'|'unknown-endpoint'|'ambiguous-approach'|'origin-approach-unreviewed'|'destination-approach-unreviewed'|'same-place'|'disconnected';
export type RouteResult = {status:'unavailable';reason:RouteFailure} | {status:'ready';basis:'source-plan';origin:RouteAnchor;destination:RouteAnchor;arcs:RouteArc[];legs:RouteLeg[];steps:(RouteStep&{arcId:string})[];limitations:Bilingual[]};
