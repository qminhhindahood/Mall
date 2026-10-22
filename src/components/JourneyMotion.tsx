import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import type { FloorGeometry, SceneRuntime } from '../runtime/scene-contract';
import FloorMap from './FloorMap';
import { sharedFloorBounds } from './floor-frame';
import { homeMotion } from '../data/home-motion';

const clamp=(value:number)=>Math.max(0,Math.min(1,value));
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;

/** The source plan retains its coordinate frame from the raised stack to the map.
 * Native scrolling is the clock: reversing or interrupting it needs no timeline reset.
 */
export default function JourneyMotion({stage,mapJourney,floor,floors,title,reducedMotion,paused,runtime}: {
  stage:RefObject<HTMLDivElement|null>;mapJourney:RefObject<HTMLDivElement|null>;
  floor:FloorGeometry;floors:FloorGeometry[];title:string;reducedMotion:boolean;paused:boolean;
  runtime:RefObject<SceneRuntime|null>;
}) {
  const travelling=useRef<HTMLDivElement>(null);
  const yaw=useRef(0);
  const previewFloor=useRef<string|undefined>(undefined);
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
      // A sticky element's offsetTop changes as it sticks. Derive the phone's
      // native-flow anchor from the preceding hero, never the moving visual.
      const visualTop=parseFloat(getComputedStyle(visual).top)||0;
      const startApproach=container.offsetTop+(phone?hero.offsetTop+hero.offsetHeight+(parseFloat(getComputedStyle(visual).marginTop)||0)-visualTop:0);
      const approach=clamp((scrollY-startApproach)/innerHeight);
      const fade=clamp((approach-.55)/.4);
      const reveal=fade*fade*(3-2*fade);
      const revealed=reducedMotion?(approach>.5?1:0):reveal;
      container.style.setProperty('--floor-reveal',String(revealed));
      container.style.setProperty('--caption-scale',String(reducedMotion?1:1.25-.25*revealed));
      const copy=container.querySelector<HTMLElement>('.introduction-copy');
      if(copy)copy.inert=revealed===1;
      const cue=container.querySelector<HTMLElement>('.introduction-bottom');
      if(cue){const past=approach>.2;cue.dataset.past=String(past);cue.inert=past;cue.style.opacity=String(1-clamp(approach/.2));}
      visual.dataset.revealed=String(revealed>.08);
      // The real floors assemble once as the overview first enters view; selection or a later visit never replays it.
      if(homeMotion.floorStack&&!reducedMotion&&revealed>.35&&!stack.dataset.assemble){
        stack.dataset.assemble='play';
        const finish=()=>{if(stack.dataset.assemble==='play')stack.dataset.assemble='done';};
        stack.addEventListener('pointerdown',finish,{once:true});stack.addEventListener('focusin',finish,{once:true});
        setTimeout(finish,1400);
      }
      visual.querySelector<HTMLElement>('.registered-floors')!.inert=revealed<1;
      runtime.current?.setJourneyProgress(approach,reducedMotion);
      const stackBox=stack.getBoundingClientRect();
      for(const callout of container.querySelectorAll<HTMLElement>('.floor-rail a')){
        const plan=stack.querySelector<HTMLElement>(`a[data-floor-id="${callout.dataset.floorId}"]`);
        const line=callout.querySelector<HTMLElement>('.floor-callout-line');
        if(!plan||!line)continue;
        const label=callout.getBoundingClientRect();
        const width=Math.max(24,label.left-(stackBox.left+(stack.clientWidth+plan.clientWidth)*.5));
        const dy=stackBox.top+plan.offsetTop+plan.clientHeight*.5-label.top-label.height*.5;
        line.style.width=`${Math.hypot(width,dy)}px`;
        line.style.transform=`rotate(${-Math.atan2(dy,width)*180/Math.PI}deg)`;
      }
      const start=container.offsetTop+container.offsetHeight-innerHeight;
      const end=destination.offsetTop-(parseFloat(getComputedStyle(destination.querySelector<HTMLElement>('.persistent-map')!).top)||0);
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
      const sourceLeft=stackRect.left+(stack.clientWidth-source.clientWidth)*.5;
      const visualStyle=getComputedStyle(visual), targetStyle=getComputedStyle(target), sourceStyle=getComputedStyle(source);
      const stickyTop=parseFloat(visualStyle.top)||0;
      const sourceTop=Math.max(stackRect.top,stickyTop+stack.offsetTop)+source.offsetTop;
      const paddingLeft=parseFloat(targetStyle.paddingLeft), paddingTop=parseFloat(targetStyle.paddingTop);
      const left=mix(sourceLeft,targetRect.left+paddingLeft,progress);
      const persistent=destination.querySelector<HTMLElement>('.persistent-map')!;
      const persistentStyle=getComputedStyle(persistent);
      const settledTop=persistentStyle.position==='sticky'
        ? (parseFloat(persistentStyle.top)||0)+targetRect.top-persistent.getBoundingClientRect().top
        : targetRect.top;
      const top=mix(sourceTop,settledTop+paddingTop,progress);
      const width=mix(source.clientWidth,targetRect.width-paddingLeft-parseFloat(targetStyle.paddingRight),progress);
      const height=mix(source.clientHeight,targetRect.height-paddingTop-parseFloat(targetStyle.paddingBottom),progress);
      const angleX=parseFloat(sourceStyle.getPropertyValue('--floor-angle-x')), angleZ=(phone?-12:-18)+yaw.current*180/Math.PI;
      Object.assign(layer.style,{left:`${left}px`,top:`${top}px`,width:`${width}px`,height:`${height}px`,transform:`perspective(1500px) rotateX(${angleX*(1-progress)}deg) rotateZ(${angleZ*(1-progress)}deg)`,filter:`drop-shadow(0 ${4*(1-progress)}px 0 var(--edge))`});
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
    update();window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);const source=stage.current?.querySelector<HTMLElement>(`a[data-floor-id="${floor.id}"]`);if(source)source.style.opacity='';const target=mapJourney.current?.querySelector<HTMLElement>('.map-transform');if(target)target.style.visibility='';const persistent=mapJourney.current?.querySelector<HTMLElement>('.persistent-map');if(persistent)delete persistent.dataset.travelling;};
  },[floor.id,floors,reducedMotion]);
  useEffect(()=>{
    const container=stage.current,stack=container?.querySelector<HTMLElement>('.overview-stack');
    const visual=container?.querySelector<HTMLElement>('.registered-scene');
    if(!container||!stack||!visual)return;
    let frame=0,last=0;
    const paintPreview=(id:string|undefined)=>{
      previewFloor.current=id;
      for(const item of container.querySelectorAll<HTMLElement>('.registered-floors a[data-floor-id]')){
        item.dataset.preview=String(item.dataset.floorId===id);
        item.dataset.dim=String(!!id&&item.dataset.floorId!==id);
      }
      refresh();
    };
    const enter=(event:Event)=>{const link=event.target instanceof Element?event.target.closest<HTMLElement>('a[data-floor-id]'):null;if(link)paintPreview(link.dataset.floorId);};
    const leave=(event:Event)=>{const next=(event as MouseEvent|FocusEvent).relatedTarget;if(!(next instanceof Element)||!next.closest('.registered-floors a[data-floor-id]'))paintPreview(undefined);};
    const playing=()=>{
      const rect=visual.getBoundingClientRect();
      return !paused&&!reducedMotion&&!document.hidden&&!previewFloor.current&&rect.bottom>0&&rect.top<innerHeight&&Number(container.style.getPropertyValue('--floor-reveal'))===1&&Number(container.style.getPropertyValue('--floor-travel'))===0;
    };
    const tick=(time:number)=>{
      frame=0;if(!playing()){last=0;stack.dataset.rotating='false';return;}
      if(last){yaw.current=(yaw.current+(time-last)/1000*.16)%(Math.PI*2);stack.style.setProperty('--floor-yaw',`${yaw.current}rad`);}
      stack.dataset.rotating='true';last=time;frame=requestAnimationFrame(tick);
    };
    function refresh(){if(!frame){last=0;frame=requestAnimationFrame(tick);}}
    container.addEventListener('pointerover',enter);container.addEventListener('pointerout',leave);container.addEventListener('focusin',enter);container.addEventListener('focusout',leave);
    window.addEventListener('scroll',refresh,{passive:true});document.addEventListener('visibilitychange',refresh);paintPreview(previewFloor.current);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',refresh);document.removeEventListener('visibilitychange',refresh);container.removeEventListener('pointerover',enter);container.removeEventListener('pointerout',leave);container.removeEventListener('focusin',enter);container.removeEventListener('focusout',leave);};
  },[floors,paused,reducedMotion]);
  return <div className="travelling-floor" ref={travelling} hidden aria-hidden="true"><FloorMap floor={floor} viewBounds={bounds} title={title}/></div>;
}
