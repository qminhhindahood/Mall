import { memo } from 'react';
import type { FloorGeometry, Locale } from '../runtime/scene-contract';
import type { DirectorySnapshot } from '../data/content';
import { areaLabelPoint } from './discovery-map';
export default memo(function FloorMap({ floor, title, viewBounds, content, locale='vi', selectedDestination, selectedArea, onArea, areaNumbers }: {
  floor:FloorGeometry; title:string; content?:DirectorySnapshot; locale?:Locale;
  selectedDestination?:string; selectedArea?:string; onArea?:(id:string)=>void;
  viewBounds?:[number,number,number,number];
  areaNumbers?:Record<string,number>;
}) {
  const [x,y,right,bottom]=viewBounds??floor.bounds;
  const selected=content?.destinations.find(d=>d.id===selectedDestination)?.locations.find(l=>l.floorId===floor.id)?.areaIds??[];
  return <svg viewBox={`${x} ${y} ${Math.max(1,right-x)} ${Math.max(1,bottom-y)}`} role={onArea?'group':'img'} aria-label={`${title} ${floor.label}`}>
    <title>{`${title} ${floor.label}`}</title>
    {floor.regions.map(region=>{
      const area=content?.areas.find(a=>a.floorId===floor.id&&a.regionIds.includes(region.id));
      const active=!!area&&(selected.includes(area.id)||selectedArea===area.id);
      const number=area&&areaNumbers?.[area.id];
      const label=area?[number,area.name[locale],...(content?.destinations.filter(d=>d.locations.some(l=>l.floorId===floor.id&&l.areaIds.includes(area.id))).map(d=>d.name[locale])??[])].filter(Boolean).join(' · '):undefined;
      return <path key={region.id} fillRule="evenodd" data-selected={active} data-discovery-area={!!number} role={area&&onArea?'button':undefined} tabIndex={area&&onArea?0:undefined} aria-label={label} aria-pressed={area&&onArea?active:undefined} onClick={area&&onArea?event=>{event.currentTarget.focus();onArea(area.id);}:undefined} onKeyDown={area&&onArea?event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onArea(area.id);}}:undefined} d={[region.outer,...region.holes].map(ring=>`M${ring.map(point=>point.join(',')).join(' L')} Z`).join(' ')} />;
    })}
    {areaNumbers&&content?.areas.filter(area=>area.floorId===floor.id&&areaNumbers[area.id]).map(area=>{
      const point=areaLabelPoint(floor,area.regionIds);
      if(!point)return null;
      const radius=Math.max(right-x,bottom-y)*.02;
      return <g key={area.id} className="discovery-map-number" aria-hidden="true" pointerEvents="none" data-active={selected.includes(area.id)||selectedArea===area.id}><circle cx={point[0]} cy={point[1]} r={radius}/><text x={point[0]} y={point[1]} fontSize={radius*1.2}>{areaNumbers[area.id]}</text></g>;
    })}
  </svg>;
});
