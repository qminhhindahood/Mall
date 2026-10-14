import { useLayoutEffect, useRef, type RefObject } from 'react';
import type { FloorGeometry, SceneRuntime } from '../runtime/scene-contract';
import FloorMap from './FloorMap';

const clamp=(value:number)=>Math.max(0,Math.min(1,value));
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;

/** The source plan retains its coordinate frame from the raised stack to the map.
 * Native scrolling is the clock: reversing or interrupting it needs no timeline reset.
 */
export default function JourneyMotion({stage,mapJourney,floor,floors,title,reducedMotion,runtime}: {
  stage:RefObject<HTMLDivElement|null>;mapJourney:RefObject<HTMLDivElement|null>;
  floor:FloorGeometry;floors:FloorGeometry[];title:string;reducedMotion:boolean;
  runtime:RefObject<SceneRuntime|null>;
}) {
  const travelling=useRef<HTMLDivElement>(null);
  const bounds:[number,number,number,number]=[Math.min(...floors.map(f=>f.bounds[0])),Math.min(...floors.map(f=>f.bounds[1])),Math.max(...floors.map(f=>f.bounds[2])),Math.max(...floors.map(f=>f.bounds[3]))];
  useLayoutEffect(()=>{
    let frame=0;
    const update=()=>{
      frame=0;
      const container=stage.current, destination=mapJourney.current, layer=travelling.current;
      if(!container||!destination||!layer)return;
      const hero=container.querySelector<HTMLElement>('#scene-exterior');
      const visual=container.querySelector<HTMLElement>('.registered-scene');
      const stack=container.querySelector<HTMLElement>('.overview-stack');
      const source=stack?.querySelector<HTMLElement>(`a[data-floor-id="${floor.id}"]`);
      const target=destination.querySelector<HTMLElement>('.map-transform');
      if(!hero||!visual||!stack||!source||!target)return;
      const phone=innerWidth<=700;
      const reveal=phone?clamp((scrollY-container.offsetTop)/Math.max(1,hero.offsetHeight*.6)):clamp((innerHeight*.7-hero.getBoundingClientRect().bottom)/(innerHeight*.65));
      const revealed=reducedMotion?(reveal>.5?1:0):reveal;
      container.style.setProperty('--floor-reveal',String(revealed));
      visual.dataset.revealed=String(revealed>.08);
      visual.querySelector<HTMLElement>('.registered-floors')!.inert=revealed<.08;
      runtime.current?.setJourneyProgress(revealed);
      const stackBox=stack.getBoundingClientRect();
      for(const callout of container.querySelectorAll<HTMLElement>('.floor-rail a')){
        const plan=stack.querySelector<HTMLElement>(`a[data-floor-id="${callout.textContent?.trim()}"]`);
        const line=callout.querySelector<HTMLElement>('.floor-callout-line');
        if(!plan||!line)continue;
        const label=callout.getBoundingClientRect();
        const width=Math.max(24,label.left-(stackBox.left+stackBox.width*.78));
        const dy=stackBox.top+plan.offsetTop+plan.clientHeight*.5-label.top-label.height*.5;
        line.style.width=`${Math.hypot(width,dy)}px`;
        line.style.transform=`rotate(${-Math.atan2(dy,width)*180/Math.PI}deg)`;
      }
      const start=phone?container.offsetTop+visual.offsetTop+visual.offsetHeight-innerHeight*.6:container.offsetTop+container.offsetHeight-innerHeight;
      const end=destination.offsetTop-(phone?116:120);
      const progress=reducedMotion?0:clamp((scrollY-start)/Math.max(innerHeight*.45,end-start));
      container.style.setProperty('--floor-travel',String(progress));
      const inFlight=progress>0&&progress<1;
      layer.hidden=!inFlight;
      source.style.opacity=inFlight?'0':'';
      target.style.visibility=inFlight?'hidden':'';
      if(!inFlight)return;
      layer.style.setProperty('--travel-progress',String(progress));
      const stackRect=stack.getBoundingClientRect(), targetRect=target.getBoundingClientRect();
      // Correct the source's departure from its sticky anchor. Both source and
      // target use the union of source bounds, including sparse/smaller plans.
      const sourceLeft=stackRect.left+source.offsetLeft;
      const sourceTop=phone?stackRect.top+source.offsetTop+Math.max(0,scrollY-start):Math.max(stackRect.top,120+(visual.clientHeight-stack.clientHeight)*.5)+source.offsetTop;
      const padding=phone?12:24;
      const left=mix(sourceLeft,targetRect.left+padding,progress);
      const top=mix(sourceTop,targetRect.top+padding,progress);
      const width=mix(source.clientWidth,targetRect.width-padding*2,progress);
      const height=mix(source.clientHeight,targetRect.height-padding-(phone?52:76),progress);
      Object.assign(layer.style,{left:`${left}px`,top:`${top}px`,width:`${width}px`,height:`${height}px`,transform:`perspective(1500px) rotateX(${(phone?38:50)*(1-progress)}deg) rotateZ(${(phone?-12:-18)*(1-progress)}deg)`,filter:`drop-shadow(0 ${5*(1-progress)}px 0 var(--edge))`});
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
    update();window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);const source=stage.current?.querySelector<HTMLElement>(`a[data-floor-id="${floor.id}"]`);if(source)source.style.opacity='';const target=mapJourney.current?.querySelector<HTMLElement>('.map-transform');if(target)target.style.visibility='';};
  },[floor.id,floors,reducedMotion]);
  return <div className="travelling-floor" ref={travelling} hidden aria-hidden="true"><FloorMap floor={floor} viewBounds={bounds} title={title}/></div>;
}
