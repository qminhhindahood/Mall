import type {CSSProperties, MouseEvent} from 'react';
import type {FloorGeometry, Locale} from '../runtime/scene-contract';
import {floorRoute} from '../data/routes';
import FloorMap from './FloorMap';

/** Presentation of the unchanged source polygons in their shared schematic frame. */
export default function OverviewStack({floors,locale,heading,mapTitle,selectedFloor,onSelect}: {
  floors:FloorGeometry[];locale:Locale;heading:string;mapTitle:string;selectedFloor:string;
  onSelect:(floorId:string,event:MouseEvent<HTMLAnchorElement>)=>void;
}) {
  const bounds:[number,number,number,number]=[
    Math.min(...floors.map(f=>f.bounds[0])),Math.min(...floors.map(f=>f.bounds[1])),
    Math.max(...floors.map(f=>f.bounds[2])),Math.max(...floors.map(f=>f.bounds[3])),
  ];
  return <div className="overview-stack">
    {floors.slice().sort((a,b)=>b.order-a.order).map((floor,index)=><a key={floor.id}
      data-floor-id={floor.id} className={floor.id===selectedFloor?'selected':''} href={floorRoute(locale,floor.id)}
      aria-label={`${heading} ${floor.label}`} aria-current={floor.id===selectedFloor?'page':undefined}
      style={{'--floor-index':index,'--floor-count':floors.length} as CSSProperties}
      onClick={event=>onSelect(floor.id,event)}>
      <span className="overview-card-label">{heading} {floor.label}</span>
      <span className="overview-card-map"><FloorMap floor={floor} viewBounds={bounds} title={`${mapTitle} ${floor.label}`}/></span>
    </a>)}
  </div>;
}
