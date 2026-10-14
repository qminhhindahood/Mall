import { useLayoutEffect, useRef, type RefObject } from 'react';
import type { FloorGeometry, SceneRuntime } from '../runtime/scene-contract';
import FloorMap from './FloorMap';
import { sharedFloorBounds } from './floor-frame';

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
  const bounds=sharedFloorBounds(floors);
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
      runtime.current?.setJourneyProgress(revealed,reducedMotion);
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
      destination.querySelector<HTMLElement>('.persistent-map')!.dataset.travelling=String(inFlight);
      if(!inFlight)return;
      layer.style.setProperty('--travel-progress',String(progress));
      const stackRect=stack.getBoundingClientRect(), targetRect=target.getBoundingClientRect();
      // Correct the source's departure from its sticky anchor. Both source and
      // target use the union of source bounds, including sparse/smaller plans.
      const sourceLeft=stackRect.left+source.offsetLeft;
      const visualStyle=getComputedStyle(visual), targetStyle=getComputedStyle(target), sourceStyle=getComputedStyle(source);
      const stickyTop=parseFloat(visualStyle.top)||0;
      const sourceTop=phone?stackRect.top+source.offsetTop+Math.max(0,scrollY-start):Math.max(stackRect.top,stickyTop+(visual.clientHeight-stack.clientHeight)*.5)+source.offsetTop;
      const paddingLeft=parseFloat(targetStyle.paddingLeft), paddingTop=parseFloat(targetStyle.paddingTop);
      const left=mix(sourceLeft,targetRect.left+paddingLeft,progress);
      const top=mix(sourceTop,targetRect.top+paddingTop,progress);
      const width=mix(source.clientWidth,targetRect.width-paddingLeft-parseFloat(targetStyle.paddingRight),progress);
      const height=mix(source.clientHeight,targetRect.height-paddingTop-parseFloat(targetStyle.paddingBottom),progress);
      const angleX=parseFloat(sourceStyle.getPropertyValue('--floor-angle-x')), angleZ=parseFloat(sourceStyle.getPropertyValue('--floor-angle-z'));
      Object.assign(layer.style,{left:`${left}px`,top:`${top}px`,width:`${width}px`,height:`${height}px`,transform:`perspective(1500px) rotateX(${angleX*(1-progress)}deg) rotateZ(${angleZ*(1-progress)}deg)`,filter:`drop-shadow(0 ${4*(1-progress)}px 0 var(--edge))`});
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
    update();window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);const source=stage.current?.querySelector<HTMLElement>(`a[data-floor-id="${floor.id}"]`);if(source)source.style.opacity='';const target=mapJourney.current?.querySelector<HTMLElement>('.map-transform');if(target)target.style.visibility='';const persistent=mapJourney.current?.querySelector<HTMLElement>('.persistent-map');if(persistent)delete persistent.dataset.travelling;};
  },[floor.id,floors,reducedMotion]);
  return <div className="travelling-floor" ref={travelling} hidden aria-hidden="true"><FloorMap floor={floor} viewBounds={bounds} title={title}/></div>;
}
