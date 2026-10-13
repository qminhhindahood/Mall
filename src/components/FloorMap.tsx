import { memo } from 'react';
import type { FloorGeometry, Locale } from '../runtime/scene-contract';
import type { DirectorySnapshot } from '../data/content';
export default memo(function FloorMap({ floor, title, content, locale='vi', selectedDestination, selectedArea, onArea }: {
  floor:FloorGeometry; title:string; content?:DirectorySnapshot; locale?:Locale;
  selectedDestination?:string; selectedArea?:string; onArea?:(id:string)=>void;
}) {
  const [x,y,right,bottom]=floor.bounds;
  const selected=content?.destinations.find(d=>d.id===selectedDestination)?.locations.find(l=>l.floorId===floor.id)?.areaIds??[];
  return <svg viewBox={`${x} ${y} ${Math.max(1,right-x)} ${Math.max(1,bottom-y)}`} role={onArea?'group':'img'} aria-label={`${title} ${floor.label}`}>
    <title>{`${title} ${floor.label}`}</title>
    {floor.regions.map(region=>{
      const area=content?.areas.find(a=>a.floorId===floor.id&&a.regionIds.includes(region.id));
      const active=!!area&&(selected.includes(area.id)||selectedArea===area.id);
      return <path key={region.id} fillRule="evenodd" data-selected={active} role={area&&onArea?'button':undefined} tabIndex={area&&onArea?0:undefined} aria-label={area?.name[locale]} aria-pressed={area&&onArea?active:undefined} onClick={area&&onArea?()=>onArea(area.id):undefined} onKeyDown={area&&onArea?event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onArea(area.id);}}:undefined} d={[region.outer,...region.holes].map(ring=>`M${ring.map(point=>point.join(',')).join(' L')} Z`).join(' ')} />;
    })}
  </svg>;
});
