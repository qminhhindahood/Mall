import { memo, type ReactNode } from 'react';
import type { FloorGeometry, Locale } from '../runtime/scene-contract';
import type { DirectorySnapshot } from '../data/content';
import { areaLabelPoint } from './discovery-map';
import PublicEntranceMarkers from './PublicEntranceMarkers';
import { PlanIconLayer } from './PlanIcons';
import type { PlanIcon } from '../data/plan-icons';
const ringArea=(ring:[number,number][])=>{let sum=0;for(let i=0;i<ring.length;i++){const [x1,y1]=ring[i],[x2,y2]=ring[(i+1)%ring.length];sum+=x1*y2-x2*y1;}return Math.abs(sum)/2;};
export default memo(function FloorMap({ floor, title, viewBounds, content, locale='vi', selectedDestination, selectedArea, onArea, areaNumbers, children, selectedEntrance, onEntrance, decorative, icons, showNames }: {
  floor:FloorGeometry; title:string; content?:DirectorySnapshot; locale?:Locale;
  selectedDestination?:string; selectedArea?:string; onArea?:(id:string)=>void;
  viewBounds?:[number,number,number,number];
  areaNumbers?:Record<string,number>;
  children?:ReactNode;
  selectedEntrance?:string; onEntrance?:(id:string)=>void;
  /** Decorative copies sit inside a labelled control and add no name of their own. */
  decorative?:boolean;
  /** Facility icons for this floor (escalators, lifts, restrooms, exits, ATM, information). */
  icons?:PlanIcon[];
  /** Print each mapped area's name on its unit when it fits; numbers remain where it does not. */
  showNames?:boolean;
}) {
  const frame=viewBounds??floor.bounds;
  const outline=floor.presentation?.outline??[];
  // Include the translated side face and stroke so the complete plate stays visible.
  const [x,y,right,bottom]=[Math.min(frame[0],...outline.map(p=>p[0]-.2)),Math.min(frame[1],...outline.map(p=>p[1]-.2)),Math.max(frame[2],...outline.map(p=>p[0]+.2)),Math.max(frame[3],...outline.map(p=>p[1]+1.6))];
  const selected=content?.destinations.find(d=>d.id===selectedDestination)?.locations.find(l=>l.floorId===floor.id)?.areaIds??[];
  const slab=floor.presentation;
  const interactive=!!(onArea||onEntrance||areaNumbers);
  const frameMax=Math.max(1,right-x,bottom-y);
  // Escalator slats, icons and fixtures traced from the plan are noise on a map people use to choose a shop.
  const minBlock=interactive&&!decorative?0.002*Math.max(1,(frame[2]-frame[0])*(frame[3]-frame[1])):0;
  const slabPath=slab?`M${slab.outline.map(point=>point.join(',')).join(' L')} Z`:undefined;
  return <svg viewBox={`${x} ${y} ${Math.max(1,right-x)} ${Math.max(1,bottom-y)}`} role={decorative?undefined:onArea||onEntrance?'group':'img'} aria-hidden={decorative||undefined} aria-label={decorative?undefined:`${title} ${floor.label}`}>
    {!decorative&&<title>{`${title} ${floor.label}`}</title>}
    {slabPath&&<g className="floor-slab" aria-hidden="true"><path className="slab-side" transform="translate(0,1.4)" d={slabPath}/><path className="slab-top" d={slabPath}/>{slab?.referenceZonePaths.map((path,index)=><path key={index} className="slab-reference-zone" fillRule="evenodd" d={path}/>)}</g>}
    {floor.regions.map(region=>{
      const area=content?.areas.find(a=>a.floorId===floor.id&&a.regionIds.includes(region.id));
      const active=!!area&&(selected.includes(area.id)||selectedArea===area.id);
      // The r5 complete Vincom zones replace the older cropped visual backdrop;
      // reviewed interactive areas still use their unchanged original IDs.
      if(slab?.referenceZonePaths.length&&!area)return null;
      if(!area&&minBlock&&ringArea(region.outer)<minBlock)return null;
      const number=area&&areaNumbers?.[area.id];
      const label=area?[number,area.name[locale],...(content?.destinations.filter(d=>d.locations.some(l=>l.floorId===floor.id&&l.areaIds.includes(area.id))).map(d=>d.name[locale])??[])].filter(Boolean).join(' · '):undefined;
      return <path key={region.id} fillRule="evenodd" data-selected={active} data-discovery-area={!!number} role={area&&onArea?'button':undefined} tabIndex={area&&onArea?0:undefined} aria-label={label} aria-pressed={area&&onArea?active:undefined} onClick={area&&onArea?event=>{event.currentTarget.focus({preventScroll:true});onArea(area.id);}:undefined} onKeyDown={area&&onArea?event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onArea(area.id);}}:undefined} d={[region.outer,...region.holes].map(ring=>`M${ring.map(point=>point.join(',')).join(' L')} Z`).join(' ')} />;
    })}
    {content?.areas.filter(area=>area.floorId===floor.id&&((areaNumbers&&areaNumbers[area.id])||showNames)).map(area=>{
      const point=areaLabelPoint(floor,area.regionIds);
      if(!point)return null;
      const active=selected.includes(area.id)||selectedArea===area.id;
      const number=areaNumbers?.[area.id];
      // Name the unit when the text fits inside its largest block; otherwise fall back to its number.
      const block=floor.regions.filter(region=>area.regionIds.includes(region.id)).sort((a,b)=>b.outer.length-a.outer.length)[0];
      if(showNames&&block){
        const xs=block.outer.map(p=>p[0]),ys=block.outer.map(p=>p[1]);
        const width=Math.max(...xs)-Math.min(...xs),height=Math.max(...ys)-Math.min(...ys);
        const minFont=frameMax*.0135,maxFont=frameMax*.019;
        // Areas carry a generic name; the shop on the unit is what a visitor looks for.
        const owners=content.destinations.filter(d=>d.locations.some(l=>l.floorId===floor.id&&l.areaIds.includes(area.id)));
        const name=owners.length>1?`${owners[0].name[locale]} +${owners.length-1}`:owners[0]?.name[locale]??'';
        const chars=Math.min(name.length,Math.floor(width*.9/(minFont*.56)));
        if(chars>=4){
          const label=chars<name.length?name.slice(0,chars-1).trimEnd()+'…':name;
          const size=Math.min(maxFont,width*.9/(label.length*.56),height*.4);
          if(size>=minFont)return <g key={area.id} className="area-name" aria-hidden="true" pointerEvents="none" data-active={active}><text x={point[0]} y={point[1]} fontSize={size} style={{strokeWidth:size*.2}}>{label}</text></g>;
        }
      }
      if(!number)return null;
      const radius=frameMax*.02;
      return <g key={area.id} className="discovery-map-number" aria-hidden="true" pointerEvents="none" data-active={active}><circle cx={point[0]} cy={point[1]} r={radius}/><text x={point[0]} y={point[1]} fontSize={radius*1.2}>{number}</text></g>;
    })}
    {icons?.length?<PlanIconLayer icons={icons} locale={locale} radius={frameMax*.0135}/>:null}
    {children}
    {onEntrance&&<PublicEntranceMarkers floor={floor} locale={locale} selected={selectedEntrance} onSelect={onEntrance}/>}
  </svg>;
});
