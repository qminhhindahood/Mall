import {useLayoutEffect,useRef,useState} from 'react';
import type {FloorGeometry,Locale} from '../runtime/scene-contract';
import {publicEntrances} from '../data/public-entrances';
import '../styles/public-entrances.css';

export default function PublicEntranceMarkers({floor,locale,selected,onSelect}:{floor:FloorGeometry;locale:Locale;selected?:string;onSelect?:(id:string)=>void}){
 const root=useRef<SVGGElement>(null);
 const [screenFrame,setScreenFrame]=useState<string>();
 useLayoutEffect(()=>{
  const group=root.current,svg=group?.ownerSVGElement;
  if(!group||!svg)return;
  // Cancel the SVG's linear screen transform, keeping each source anchor fixed.
  // Local marker units then represent CSS pixels at every map zoom and width.
  const measure=()=>{
   const m=group.getScreenCTM();if(!m)return;
   const determinant=m.a*m.d-m.b*m.c;
   if(!Number.isFinite(determinant)||Math.abs(determinant)<1e-8)return;
   const next=`matrix(${m.d/determinant} ${-m.b/determinant} ${-m.c/determinant} ${m.a/determinant} 0 0)`;
   setScreenFrame(previous=>previous===next?previous:next);
  };
  measure();
  const resize=new ResizeObserver(measure);resize.observe(svg);
  const attributes=new MutationObserver(measure);attributes.observe(svg,{attributes:true,attributeFilter:['viewBox','style','class']});
  window.addEventListener('resize',measure);
  return()=>{resize.disconnect();attributes.disconnect();window.removeEventListener('resize',measure)};
 },[floor.id]);
 return <g ref={root} className="public-entrances" visibility={screenFrame?undefined:'hidden'}>{publicEntrances(floor).map(entrance=>{
 const [x,y]=entrance.point;
 const label=`${locale==='vi'?'Cửa vào công cộng':'Public entrance'}: ${entrance.name[locale]}`;
 return <g key={entrance.id} className="public-entrance" transform={`translate(${x} ${y})`} data-entrance-id={entrance.id} data-active={selected===entrance.id} role={onSelect?'button':'img'} tabIndex={onSelect?0:undefined} aria-label={label} aria-pressed={onSelect?selected===entrance.id:undefined} onClick={onSelect?event=>{event.stopPropagation();event.currentTarget.focus({preventScroll:true});onSelect(entrance.id)}:undefined} onKeyDown={onSelect?event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();onSelect(entrance.id)}}:undefined}>
  <title>{label}</title><g transform={screenFrame}><circle className="entrance-hit" r={22.5}/><circle className="entrance-disc" r={12}/><text textAnchor="middle" dominantBaseline="central">E{entrance.id.slice(-1)}</text></g>
 </g>;
 })}</g>;
}
