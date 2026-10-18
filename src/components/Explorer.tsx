import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { SiteData } from '../data/site';
import type { Locale, SceneKind, SceneRuntime, FloorDataset } from '../runtime/scene-contract';
import { copy } from './copy';
import FloorMap from './FloorMap';
import { floorRoute, selectionHref as href } from '../data/routes';
import { validateGeometry } from '../runtime/validate-geometry';
import Directory from './Directory';
import MapControlIcon from './MapControlIcon';
import OverviewStack from './OverviewStack';
import JourneyMotion from './JourneyMotion';
import { sharedFloorBounds } from './floor-frame';
import { journeyCopy } from './journey-copy';
import { discoveryFloor, defaultDiscoveryCategory } from '../data/discovery';
import Discovery from './Discovery';
import { discoveryAreaNumbers } from './discovery-map';
import { timing } from '../runtime/loading-timing';

export type ExplorerSelection = { locale: Locale; floorId: string; kind: SceneKind; destinationId?: string; query?: string; categoryId?: string; discoveryCategoryId?: string; discoveryFloorId?: string; discoveryQuery?: string; areaId?: string };
function defaultFloorId(site: SiteData, floors = site.geometry.floors) {
  if (floors.some(floor => floor.id === site.defaultFloor)) return site.defaultFloor;
  return floors.find(floor => floor.id === 'L1')?.id ?? floors[0]?.id ?? 'L1';
}
function selectionFromUrl(url: URL, site: SiteData, fallback: ExplorerSelection): ExplorerSelection {
  const segments = url.pathname.split('/').filter(Boolean);
  const locale = segments[0] === 'en' ? 'en' : 'vi';
  const destination = ['stores','cua-hang'].includes(segments[1]) ? site.destinations.find(d => d.id === segments[2]) : undefined;
  const fallbackFloor = defaultFloorId(site);
  const candidate = url.searchParams.get('floor') ?? (['floors','tang'].includes(segments[1]) ? segments[2] : destination?.primaryFloor) ?? fallbackFloor;
  const floorId = site.geometry.floors.some(f => f.id === candidate) && (!destination || destination.floors.includes(candidate)) ? candidate : destination?.primaryFloor && site.geometry.floors.some(f => f.id === destination.primaryFloor) ? destination.primaryFloor : fallbackFloor;
  const view = url.searchParams.get('view');
  const kind = ['exterior','overview','map','discovery'].includes(view ?? '') ? view as SceneKind : segments[1] ? 'map' : fallback.kind;
  const category=(key:string)=>site.content.categories.find(c=>c.id===url.searchParams.get(key))?.id;
  return { locale, floorId, kind, destinationId: destination?.id, query:url.searchParams.get('q')?.slice(0,160)||undefined, categoryId:category('category'), discoveryCategoryId:category('collection'), discoveryFloorId:site.geometry.floors.find(f=>f.id===url.searchParams.get('collectionFloor'))?.id, discoveryQuery:url.searchParams.get('collectionQ')?.slice(0,160)||undefined, areaId:site.content.areas.find(a=>a.id===url.searchParams.get('area')&&a.floorId===floorId)?.id };
}

export default function Explorer({ site, initial }: { site: SiteData; initial: ExplorerSelection }) {
  const [selection,setSelection] = useState(initial);
  const [zoom,setZoom] = useState(1);
  const [angled,setAngled] = useState(false);
  const [mapExpanded,setMapExpanded] = useState(false);
  const mapJourney=useRef<HTMLDivElement>(null);
  const exteriorJourney=useRef<HTMLDivElement>(null);
  const travelRequest=useRef(false);
  const returnFocus=useRef<HTMLElement|null>(null);
  const restoreScroll=useRef<number|null>(null);
  const discoveryReturn=useRef<{selection:ExplorerSelection;scrollY:number}|null>(null);
  const closingDiscovery=useRef(false);
  const localeScroll=useRef<number|null>(null);
  const [load,setLoad] = useState<'static'|'loading'|'ready'|'failed'>('static');
  // Cached shows can finish in one React batch without changing `load`.
  // Each accepted presentation must still commit its requested keyboard focus.
  const [presentation,setPresentation] = useState(0);
  const [phase,setPhase] = useState('');
  const [attempt,setAttempt] = useState(0);
  const [paused,setPaused] = useState(false);
  const [reducedMotion,setReducedMotion] = useState(false);
  const [headerVisible,setHeaderVisible] = useState(initial.kind !== 'exterior');
  const [geometry,setGeometry] = useState(site.geometry);
  const [routeResolved,setRouteResolved] = useState(!initial.destinationId);
  const [floorCorrected,setFloorCorrected] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const parking = useRef<HTMLDivElement>(null);
  const runtime = useRef<SceneRuntime|null>(null);
  const latest = useRef(selection);
  const sceneHosts = useRef<Partial<Record<SceneKind,HTMLDivElement>>>({});
  const sections = useRef<Partial<Record<SceneKind,HTMLElement>>>({});
  const requestSerial = useRef(0);
  const focusRequest = useRef<ExplorerSelection|null>(null);
  const entered = useRef(false);
  const overlay = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<HTMLElement|null>(null);
  const destinationContent = useRef<HTMLElement|null>(null);
  const requestTiming = useRef<ReturnType<typeof timing>|null>(null);
  const pausedRef = useRef(false);
  const pauseChoice = useRef(false);
  const moduleFailed = useRef(false);
  latest.current = selection;
  const c = copy[selection.locale];
  const j = journeyCopy[selection.locale];
  const discoveryCategory=selection.discoveryCategoryId??defaultDiscoveryCategory(site);
  const previewFloor=discoveryFloor(site,selection,geometry);
  const areaNumbers=discoveryAreaNumbers(site.content,discoveryCategory,selection.discoveryQuery??'',previewFloor);
  const displayedFloor=selection.kind==='discovery'?previewFloor:selection.floorId;
  const floor = geometry.floors.find(f => f.id === displayedFloor) ?? geometry.floors.find(f => f.id === defaultFloorId(site, geometry.floors)) ?? geometry.floors[0]!;

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    try { pauseChoice.current = localStorage.getItem('mall-introduction-paused') === 'true'; } catch {}
    const update = () => {
      const value = pauseChoice.current || preference.matches;
      pausedRef.current = value;
      setPaused(value);
      setReducedMotion(preference.matches);
      runtime.current?.setPaused(value);
    };
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    let frame=0;
    const update = () => {
      frame=0;
      const hero=sections.current.exterior, overview=sections.current.overview;
      if(!hero||!overview)return;
      const pastHero=hero.getBoundingClientRect().bottom<=120;
      setHeaderVisible(pastHero);
      if((load!=='ready'&&load!=='failed')||focusRequest.current)return;
      const stageBottom=exteriorJourney.current?.getBoundingClientRect().bottom??Infinity;
      const kind=hero.getBoundingClientRect().bottom>innerHeight*.45?'exterior':stageBottom>innerHeight*.45?'overview':null;
      if(kind&&kind!==latest.current.kind){
        const next={...latest.current,kind:kind as SceneKind,destinationId:undefined,areaId:undefined};
        beginRequest(next);history.replaceState({...history.state,scrollY},'',href(next));setSelection(next);
      }
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
    update();window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);};
  }, [load]);

  useEffect(()=>{
    const update=()=>{
      const section=sections.current.discovery, journey=mapJourney.current;
      if(!section||!journey)return;
      const clamp=(value:number)=>Math.max(0,Math.min(1,value));
      const top=section.getBoundingClientRect().top;
      // Settle the Discovery composition while the map is hidden. Returning it
      // on the same clock exposes the old full-size plan and floor rail.
      const progress=clamp((innerHeight*1.2-top)/(innerHeight*.4));
      journey.style.setProperty('--discovery-progress',String(reducedMotion?(progress>.5?1:0):progress));
      const invitation=journey.querySelector<HTMLElement>('.discovery-introduction');
      if(invitation){
        const invitationTop=(reducedMotion?invitation:invitation.querySelector('h2')??invitation).getBoundingClientRect().top;
        const exit=reducedMotion?clamp((innerHeight*1.25-invitationTop)/(innerHeight*.4)):clamp((innerHeight*.95-invitationTop)/(innerHeight*.3));
        const start=reducedMotion?(innerWidth<=700?160:innerHeight*.45):innerHeight*.75;
        const end=innerWidth<=700?(reducedMotion?120:innerHeight*.4):184;
        const returning=clamp((start-top)/Math.max(40,start-end));
        const presence=Math.max(1-exit,reducedMotion?Number(returning===1):returning*returning*(3-2*returning));
        journey.style.setProperty('--map-presence',String(presence));
        const map=journey.querySelector<HTMLElement>('.persistent-map');
        if(map){map.inert=presence<.01;map.dataset.controlsHidden=String(!reducedMotion&&presence<.99);}
      }
      if((load!=='ready'&&load!=='failed')||focusRequest.current)return;
      const mapTop=sections.current.map?.getBoundingClientRect().top??Infinity;
      const readingLine=innerWidth<=700?160:innerHeight*.55;
      const stageBottom=exteriorJourney.current?.getBoundingClientRect().bottom??Infinity;
      const discoveryLine=reducedMotion?readingLine:innerHeight*.8;
      const kind=stageBottom>innerHeight*.45?null:section.getBoundingClientRect().top<discoveryLine?'discovery':mapTop<readingLine?'map':null;
      if(kind&&kind!==latest.current.kind){const next: ExplorerSelection={...latest.current,kind};beginRequest(next);history.replaceState({...history.state,scrollY:scrollY},'',href(next));setSelection(next);}
    };
    window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);
    update();
    return()=>{window.removeEventListener('scroll',update);window.removeEventListener('resize',update);};
  },[load,reducedMotion]);

  function togglePause() {
    if (reducedMotion) return;
    const value = !pauseChoice.current;
    pauseChoice.current = value;
    pausedRef.current = value;
    setPaused(value);
    runtime.current?.setPaused(value);
    try { localStorage.setItem('mall-introduction-paused', String(value)); } catch {}
  }

  useEffect(() => {
    const resolveRoute = () => {
      const url=new URL(location.href);
      const next=selectionFromUrl(url, site, initial);
      const invalid=!!next.destinationId && url.searchParams.has('floor') && url.searchParams.get('floor')!==next.floorId;
      setFloorCorrected(invalid);
      if(invalid){url.searchParams.set('floor',next.floorId);history.replaceState(null,'',url);}
      return next;
    };
    const initialRoute=resolveRoute();
    if(initialRoute.kind!=='exterior')focusRequest.current=initialRoute;
    setSelection(initialRoute);
    setRouteResolved(true);
    history.scrollRestoration='manual';
    const savePosition=()=>{if(!focusRequest.current)history.replaceState({...history.state,scrollY:window.scrollY},'');};
    window.addEventListener('scroll',savePosition,{passive:true});
    const pop = () => {
      const next=resolveRoute();
      beginRequest(next);
      restoreScroll.current=typeof history.state?.scrollY==='number'?history.state.scrollY:null;
      focusRequest.current=next;
      setSelection(next);
    };
    window.addEventListener('popstate',pop);
    return () => {window.removeEventListener('popstate',pop);window.removeEventListener('scroll',savePosition);history.scrollRestoration='auto';};
  }, []);
  useLayoutEffect(()=>{
    if(localeScroll.current===null)return;
    const top=localeScroll.current;localeScroll.current=null;
    window.scrollTo({top,behavior:'instant'});
    const frame=requestAnimationFrame(()=>window.scrollTo({top,behavior:'instant'}));
    return()=>cancelAnimationFrame(frame);
  },[selection.locale]);
  useEffect(() => {
    document.documentElement.lang = selection.locale;
    document.title = `${site.name} · ${copy[selection.locale].guide}`;
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href',new URL(href(selection).split('?')[0],location.origin).href);
    const alternate=document.querySelector<HTMLLinkElement>('link[rel="alternate"]');
    if(alternate){const other=selection.locale==='vi'?'en':'vi';alternate.hreflang=other;alternate.href=new URL(href({...selection,locale:other}),location.origin).href;}
    const guide = document.querySelector<HTMLElement>('.static-guide');
    if (guide) {
      guide.lang = selection.locale;
      for (const anchor of guide.querySelectorAll<HTMLAnchorElement>('h2 a')) {
        const id = anchor.getAttribute('href')?.split('/').pop();
        if (id) { anchor.href = floorRoute(selection.locale,id); anchor.textContent = `${copy[selection.locale].map} · ${id}`; }
      }
      const disclosure = guide.querySelector('p');
      if (disclosure) disclosure.textContent = copy[selection.locale].uncertainty;
    }
  }, [selection]);
  useEffect(() => {
    let alive = true;
    entered.current=false;
    moduleFailed.current=false;
    const controller = new AbortController();
    const geometryController = new AbortController();
    // The shell owns one canvas per runtime attempt. React never reparents/remounts it.
    const ownedCanvas = document.createElement('canvas');
    ownedCanvas.style.visibility = 'hidden';
    ownedCanvas.setAttribute('aria-hidden','true');
    parking.current!.append(ownedCanvas);
    canvas.current = ownedCanvas;
    setLoad('loading');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    pausedRef.current = pausedRef.current || reducedMotion;
    setPaused(pausedRef.current);
    performance.mark('mall-loading:entry-start');
    const detail = { mallId: site.mallId, assetRevision: site.assetRevision, attempt };
    const entryDone = timing('entry-to-frame', detail);
    const navigationDone = attempt === 0 ? timing('navigation-to-frame', detail, 0) : null;
    const fetchModel = async (url:string) => {
      const done = timing('model-transfer', { ...detail, url });
      try {
        const response=await fetch(url,{signal:controller.signal});
        if(!response.ok)throw new Error('Exterior unavailable');
        const bytes = await response.arrayBuffer();
        done('ready', { decodedBytes: bytes.byteLength });
        return bytes;
      } catch (error) { done('failed'); throw error; }
    };
    // Start bytes before module evaluation and data construction, not in Canvas.
    const modelBytes=fetchModel(site.exteriorUrl).catch(error=>{
      if(controller.signal.aborted||site.exteriorUrl===site.exteriorIdentityUrl)throw error;
      return fetchModel(site.exteriorIdentityUrl);
    });
    void modelBytes.catch(()=>{});
    const fetchGeometry = async (url:string): Promise<FloorDataset> => {
      const done = timing('geometry-transfer', { ...detail, url });
      try {
      const response = await fetch(url,{signal:geometryController.signal});
      if (!response.ok) throw new Error('Floor geometry unavailable');
      const text = await response.text();
      done('ready');
      const decoded = timing('geometry-decode', detail);
      try { const result = validateGeometry(JSON.parse(text),site.geometry.floors.map(floor=>floor.id)); decoded(); return result; }
      catch (error) { decoded('failed'); throw error; }
      } catch (error) { done('failed'); throw error; }
    };
    const data = fetchGeometry(site.geometryUrl).catch(error=>{
      if (geometryController.signal.aborted||site.geometryUrl===site.geometryIdentityUrl) throw error;
      return fetchGeometry(site.geometryIdentityUrl);
    }).then(result=>{
      if (alive) {
        setGeometry({...result,floors:result.floors.map(floor=>({...floor,presentation:site.geometry.floors.find(item=>item.id===floor.id)?.presentation}))});
      }
      return result;
    });
    const moduleDone = timing('module', detail);
    const module = import('../runtime/create-scene-runtime').then(value => { moduleDone(); return value; }, error => { moduleDone('failed'); if(alive)moduleFailed.current=true;throw error; });
    Promise.all([module,data]).then(([{createSceneRuntime},geometry]) => {
      if (!alive) throw new Error('Attempt cancelled');
      return createSceneRuntime({
      canvas: ownedCanvas, mallId: site.mallId, data: geometry,
      assetRevision: site.assetRevision, exteriorUrl: site.exteriorUrl, reducedMotion,
      exteriorIdentityUrl: site.exteriorIdentityUrl,
      modelBytes,
      sceneHosts: sceneHosts.current as Record<SceneKind,HTMLElement>,
      onStatus: status => { if (alive) {setPhase(status.phase);if((status.key==='context'||status.key==='runtime')&&status.phase==='failed'){entered.current=false;runtime.current?.dispose();runtime.current=null;setLoad('failed');}} },
    }); }).then(async instance => {
      if (!alive) { instance.dispose(); return; }
      runtime.current = instance;
      instance.setPaused(pausedRef.current);
      await Promise.all(['exterior','overview'].map(kind => instance.prepare({kind: kind as SceneKind, floorId: site.defaultFloor})));
      if (!alive) return;
      let requested;
      const effectiveFloor=(value:ExplorerSelection)=>value.kind==='discovery'?discoveryFloor(site,value,geometry):value.floorId;
      do {requested=latest.current;await instance.show({...requested,floorId:effectiveFloor(requested)});if(!alive)return;} while(requested.kind!==latest.current.kind || effectiveFloor(requested)!==effectiveFloor(latest.current));
      if (alive) {
        entered.current=true;
        document.querySelector<HTMLElement>('.static-guide')?.setAttribute('hidden','');
        setLoad('ready');
        setPresentation(value=>value+1);
        pendingFocus.current=focusTarget(latest.current);focusRequest.current=latest.current;
        performance.mark('mall-loading:entry-ready');
        entryDone('ready', { ...latest.current, completeFrame: ownedCanvas.dataset.completeFrame });
        navigationDone?.('ready', { ...latest.current, completeFrame: ownedCanvas.dataset.completeFrame });
      }
    }).catch(() => { entryDone(alive ? 'failed' : 'cancelled'); navigationDone?.(alive ? 'failed' : 'cancelled'); if (alive) {controller.abort();runtime.current?.dispose();runtime.current=null;setLoad('failed');} });
    return () => { alive=false; entryDone('cancelled'); navigationDone?.('cancelled'); controller.abort(); geometryController.abort(); requestSerial.current++; runtime.current?.dispose(); runtime.current=null; ownedCanvas.remove(); if(canvas.current===ownedCanvas) canvas.current=null; };
  }, [attempt]);
  useEffect(()=>{
    if (!canvas.current) return;
    canvas.current.style.visibility = load==='ready'?'visible':'hidden';
    canvas.current.setAttribute('aria-hidden',String(load!=='ready'));
    canvas.current.setAttribute('aria-label',c[selection.kind]);
  },[load,selection.locale,selection.kind]);
  useEffect(()=>{
    const guide=document.querySelector<HTMLElement>('.static-guide');
    if (!guide) return;
    if (load==='ready') guide.setAttribute('hidden','');
    if (load==='failed') guide.removeAttribute('hidden');
  },[load]);
  useLayoutEffect(() => {
    const instance = runtime.current;
    if (!instance || !entered.current) return;
    const serial = ++requestSerial.current;
    const done = requestTiming.current ?? timing('request-to-frame', { mallId: site.mallId, attempt, ...selection });
    requestTiming.current=null;
    if(!instance.isPrepared({...selection,floorId:selection.kind==='discovery'?previewFloor:selection.floorId}))setLoad('loading');
    instance.show({...selection,floorId:selection.kind==='discovery'?previewFloor:selection.floorId}).then(() => { done(serial === requestSerial.current ? 'ready' : 'stale'); if (serial === requestSerial.current) {setLoad('ready');setPresentation(value=>value+1);} }).catch(() => { done('failed'); if (serial === requestSerial.current) {entered.current=false;instance.dispose();runtime.current=null;setLoad('failed');} });
  }, [selection.kind, selection.floorId, previewFloor]);
  useEffect(()=>{
    const host=sceneHosts.current[selection.kind];if(!host)return;
    let visible=false;
    const update=()=>runtime.current?.setActive(visible&&!document.hidden&&load==='ready');
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();});
    observer.observe(host);document.addEventListener('visibilitychange',update);update();
    return()=>{observer.disconnect();document.removeEventListener('visibilitychange',update);};
  },[selection.kind,load]);
  useLayoutEffect(()=>{
    if(load!=='loading'||!overlay.current)return;
    const prior=document.activeElement instanceof HTMLElement?document.activeElement:null;
    const changed:Array<[HTMLElement,boolean]>=[];
    // Inert every sibling on the dialog's ancestor path, including SSR guide.
    let node:HTMLElement=overlay.current;
    while(node.parentElement){for(const sibling of node.parentElement.children)if(sibling!==node && sibling instanceof HTMLElement){changed.push([sibling,sibling.inert]);sibling.inert=true;}node=node.parentElement;if(node===document.body)break;}
    const overflow=document.body.style.overflow;document.body.style.overflow='hidden';overlay.current.focus({preventScroll:true});
    return()=>{for(const [element,value]of changed)element.inert=value;document.body.style.overflow=overflow;const requested=pendingFocus.current;const target=requested??prior;pendingFocus.current=null;if(target?.isConnected){target.focus({preventScroll:true});if(requested&&!travelRequest.current)target.scrollIntoView({behavior:'instant',block:'start'});}};
  },[load]);
  useEffect(()=>{
    if(load!=='ready' && load!=='failed')return;
    const requested=focusRequest.current;
    if(!requested)return;
    const floorKey=requested.kind==='exterior'||requested.kind==='overview'?'all':requested.kind==='discovery'?previewFloor:requested.floorId;
    if(load==='ready'&&!canvas.current?.dataset.sceneKey?.endsWith(`:${requested.kind}:${floorKey}`))return;
    const target=focusTarget(requested);
    if(target?.isConnected){target.focus({preventScroll:true});if(restoreScroll.current!==null){window.scrollTo({top:restoreScroll.current,behavior:'instant'});restoreScroll.current=null;}else {
      // A fixed Discovery detail card has no document scroll position. Direct
      // detail links must enter its section before the scroll observer resumes.
      const scrollTarget=requested.kind==='discovery'&&(requested.destinationId||requested.areaId)?sections.current.discovery:target;
      scrollTarget?.scrollIntoView({behavior:travelRequest.current&&!reducedMotion?'smooth':'instant',block:'start'});
    }travelRequest.current=false;focusRequest.current=null;pendingFocus.current=null;closingDiscovery.current=false;}
  },[load,selection,presentation]);
  function focusTarget(next: ExplorerSelection) { if(closingDiscovery.current&&returnFocus.current?.isConnected)return returnFocus.current; return next.destinationId || next.kind==='discovery'&&next.areaId ? destinationContent.current : next.kind==='map'&&(next.query||next.categoryId)?sections.current.map??null:sections.current[next.kind] ?? null; }
  function beginRequest(next: ExplorerSelection) {
    const effective=(value:ExplorerSelection)=>value.kind==='discovery'?discoveryFloor(site,value,geometry):value.floorId;
    if (!entered.current || next.kind===latest.current.kind && effective(next)===effective(latest.current)) return;
    // Commit the gate with selection, before an unprepared view can paint.
    if(!runtime.current?.isPrepared({...next,floorId:effective(next)}))setLoad('loading');
    requestTiming.current?.('stale');
    requestTiming.current=timing('request-to-frame',{mallId:site.mallId,attempt,...next});
  }
  function navigate(next: ExplorerSelection, event?: React.MouseEvent<HTMLAnchorElement>) {
    if (event && (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)) return;
    event?.preventDefault();
    travelRequest.current=next.kind==='map'&&selection.kind==='overview'&&!next.destinationId;
    if(next.locale!==selection.locale)localeScroll.current=window.scrollY;
    if(next.kind==='discovery'&&(next.destinationId||next.areaId)&&!selection.destinationId&&!selection.areaId) {
      discoveryReturn.current={selection:{...selection},scrollY:window.scrollY};
      returnFocus.current=event?.currentTarget??document.activeElement as HTMLElement;
    } else if(next.destinationId && !selection.destinationId)returnFocus.current=event?.currentTarget??document.activeElement as HTMLElement;
    if(next.kind==='discovery'&&selection.kind==='discovery')restoreScroll.current=window.scrollY;
    setFloorCorrected(false);
    beginRequest(next);
    if(!focusRequest.current)history.replaceState({...history.state,scrollY:window.scrollY},'');
    // A requested section has no destination scroll position until presented.
    // Saving the departure position here sends pending Back/forward back to
    // the exterior; the ordinary scroll observer records the actual arrival.
    history.pushState(next.locale!==selection.locale&&load==='ready'&&!focusRequest.current?{scrollY:window.scrollY}:{},'',href(next));
    if (next.locale === selection.locale) {pendingFocus.current=focusTarget(next);focusRequest.current=next;}
    setSelection(next);
    // Locale switches preserve the language-control focus; content focus follows
    // the committed ready/error state, including already-prepared fast views.
  }
  function closeDiscovery(restoreFocus=true) {
    const prior=discoveryReturn.current;
    const next={...(prior?.selection??selection),locale:selection.locale,destinationId:undefined,areaId:undefined,kind:'discovery' as const};
    discoveryReturn.current=null;
    beginRequest(next);
    history.pushState({scrollY:prior?.scrollY??window.scrollY},'',href(next));
    if(restoreFocus){closingDiscovery.current=true;restoreScroll.current=prior?.scrollY??window.scrollY;focusRequest.current=next;}
    setSelection(next);
  }
  const change = (kind: SceneKind, floorId=selection.floorId): ExplorerSelection => ({...selection,kind,floorId,destinationId:undefined,areaId:undefined});
  return <>
    <div className="visitor-guide" data-mall={site.mallId} data-paused={paused} data-view={selection.kind}>
    <a className="skip-introduction" href={href(change('map'))} onClick={event=>navigate(change('map'),event)}>{c.skip}</a>
    <header className="journey-header" inert={!headerVisible} data-visible={headerVisible}>
      <a className="wordmark" href={`/${selection.locale}`} onClick={event => navigate({locale:selection.locale,kind:'exterior',floorId:site.defaultFloor},event)}>{site.name}</a>
      <nav aria-label={c.guide}>
        <a href={href(change('map'))} onClick={event=>navigate(change('map'),event)}>{c.map}</a>
        <a href={href(change('discovery'))} onClick={event=>navigate(change('discovery'),event)}>{c.discovery}</a>
        <a className="skip-discovery" href={href(change('discovery'))} onClick={event=>{travelRequest.current=false;navigate(change('discovery'),event);}}>{j.skipDiscovery}</a>
        <button className="overview-pause" disabled={load!=='ready'||reducedMotion} aria-label={reducedMotion?c.motionOff:paused?c.resume:c.pause} title={reducedMotion?c.motionOff:paused?c.resume:c.pause} aria-pressed={paused} onClick={togglePause}><svg viewBox="0 0 24 24" aria-hidden="true"><path d={paused?'M8 5 19 12 8 19Z':'M7 5v14M17 5v14'}/></svg></button>
        <a href={href({...selection,locale:selection.locale==='vi'?'en':'vi'})} lang={selection.locale==='vi'?'en':'vi'} onClick={event => navigate({...selection,locale:selection.locale==='vi'?'en':'vi'},event)}>{selection.locale==='vi'?'EN':'VI'}</a>
      </nav>
    </header>
    <main>
      {load==='failed' && <aside className="error" role="alert"><p>{c.error}</p><button onClick={() => {if(moduleFailed.current)location.assign(href(latest.current));else setAttempt(attempt+1);}}>{c.retry}</button></aside>}
      <div ref={parking} className="canvas-parking" />
      <div className="exterior-floor-journey" ref={exteriorJourney}>
        <div className="journey-introduction-reading">
          <section id="scene-exterior" ref={element=>{if(element)sections.current.exterior=element;}} tabIndex={-1} className="introduction" aria-label={c.exterior}>
            <div className="introduction-controls">
              <button className="pause-control" disabled={load!=='ready'||reducedMotion} aria-pressed={paused} onClick={togglePause}>{reducedMotion?c.motionOff:paused?c.resume:c.pause}</button>
              <nav aria-label={c.language}>{(['vi','en'] as Locale[]).map(locale=><a key={locale} href={href({...selection,locale})} lang={locale} aria-current={selection.locale===locale?'true':undefined} onClick={event=>navigate({...selection,locale},event)}>{locale.toUpperCase()}</a>)}</nav>
            </div>
            <div className="introduction-copy"><h1>{c.introduce}<span>{site.name}</span></h1><p>{site.mallId==='saigon-centre'?c.saigonIntroduction:c.vincomIntroduction}</p><p className="guide-identity">{c.independent}</p></div>
            <div className="introduction-bottom"><a className="scroll-guide" href="#scene-overview" onClick={event=>navigate(change('overview'),event)}><span className="scroll-cue" aria-hidden="true"/><span>{c.scrollInstruction}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16m-6-6 6 6 6-6"/></svg></a></div>
          </section>
          <section id="scene-overview" ref={element=>{if(element)sections.current.overview=element;}} tabIndex={-1} className="overview-reading" aria-label={c.overview}/>
        </div>
        <div className="registered-scene">
          <div className="scene-host scene-host-exterior" ref={element=>{if(element){sceneHosts.current.exterior=element;sceneHosts.current.overview=element;}}} data-scene-kind={selection.kind==='exterior'?'exterior':'overview'}>
            <img src="/previews/exterior.webp" alt={`${site.name} · ${c.exterior}`} width="1200" height="1200" />
          </div>
          <div className="registered-floors">
            <div className="overview-caption"><h2>{c.overview}</h2><p>{j.chooseFloor}</p>{geometry.revision==='foundation-unavailable'&&<p>{c.unavailableGeometry}</p>}</div>
            <OverviewStack floors={geometry.floors} locale={selection.locale} heading={c.heading} mapTitle={c.map} selectedFloor={selection.floorId} onSelect={(floorId,event)=>navigate(change('map',floorId),event)}/>
            <nav className="floor-rail" aria-label={c.floors}>{geometry.floors.slice().sort((a,b)=>b.order-a.order).map((item,index)=><a key={item.id} data-floor-id={item.id} style={{'--floor-index':index} as React.CSSProperties} href={floorRoute(selection.locale,item.id)} aria-current={selection.floorId===item.id?'page':undefined} onClick={event=>navigate(change('map',item.id),event)}><span className="floor-callout-line" aria-hidden="true"/>{item.label}</a>)}</nav>
          </div>
        </div>
      </div>
      <JourneyMotion stage={exteriorJourney} mapJourney={mapJourney} floor={floor} floors={geometry.floors} title={c.map} reducedMotion={reducedMotion} paused={paused} runtime={runtime}/>
      <div className="map-discovery-journey" data-discovery={selection.kind==='discovery'} ref={mapJourney}>
        <div className="persistent-map" data-expanded={mapExpanded}>
          <div className="scene-host scene-host-map" ref={element=>{if(element){sceneHosts.current.map=element;sceneHosts.current.discovery=element;}}} data-scene-kind={selection.kind==='discovery'?'discovery':'map'} data-floor={routeResolved?floor.id:undefined}>
            <div className="map-transform" style={{transform:`scale(${zoom}) rotateX(${angled?25:0}deg)`}}>{!routeResolved?<p>{c.preparing}</p>:!floor.regions.length&&floor.preview?<img src={floor.preview.path} width={floor.preview.width} height={floor.preview.height} alt={`${c.preview} ${floor.label}`}/>:<FloorMap floor={floor} viewBounds={selection.kind==='discovery'?floor.bounds:sharedFloorBounds(geometry.floors)} title={c.map} content={site.content} locale={selection.locale} selectedDestination={selection.destinationId} selectedArea={selection.areaId} areaNumbers={selection.kind==='discovery'?areaNumbers:undefined} onArea={areaId=>{if(selection.kind!=='discovery'){navigate({...change('map',floor.id),areaId});return;}const destinations=site.destinations.filter(d=>d.locations.some(l=>l.floorId===floor.id&&l.areaIds.includes(areaId)));navigate({...selection,kind:'discovery',floorId:floor.id,areaId:destinations.length===1?undefined:areaId,destinationId:destinations.length===1?destinations[0].id:undefined});}}/>}</div>
          </div>
          <div className="map-controls glass" role="group" aria-label={c.map}>
            <span>{selection.kind==='discovery'?j.preview:c.heading} {routeResolved?floor.id:''}</span>
            <button aria-label={j.zoomOut} title={j.zoomOut} disabled={zoom<=1} onClick={()=>setZoom(Math.max(1,zoom-.25))}><MapControlIcon kind="out"/></button>
            <button aria-label={j.zoomIn} title={j.zoomIn} disabled={zoom>=2} onClick={()=>setZoom(Math.min(2,zoom+.25))}><MapControlIcon kind="in"/></button>
            <button aria-pressed={angled} title={j.angle} onClick={()=>setAngled(!angled)}><MapControlIcon kind="angle"/><span className="visually-hidden">{j.angle}</span></button>
            <button title={j.reset} onClick={()=>{setZoom(1);setAngled(false);}}><MapControlIcon kind="reset"/><span className="visually-hidden">{j.reset}</span></button>
          </div>
          <nav className="floor-rail map-floor-rail" aria-label={c.floors}>{geometry.floors.slice().sort((a,b)=>b.order-a.order).map((item,index)=><a key={item.id} data-floor-id={item.id} style={{'--floor-index':index} as React.CSSProperties} href={floorRoute(selection.locale,item.id)} aria-current={routeResolved&&selection.floorId===item.id?'page':undefined} onClick={event=>navigate(change('map',item.id),event)}><span className="floor-callout-line" aria-hidden="true"/>{item.label}</a>)}</nav>
          {selection.kind==='discovery'&&<div className="discovery-map-context"><p>{Object.keys(areaNumbers).length} {j.areas} · {floor.id}</p><button type="button" aria-expanded={mapExpanded} onClick={()=>setMapExpanded(!mapExpanded)}>{selection.locale==='vi'?(mapExpanded?'Thu gọn sơ đồ':'Phóng lớn sơ đồ'):(mapExpanded?'Collapse map':'Expand map')}</button></div>}
        </div>
        <div className="journey-reading">
          <section id="scene-map" ref={element=>{if(element)sections.current.map=element;}} tabIndex={-1} className="map-reading" aria-label={c.map}>
            <h2>{c.map}{routeResolved?` · ${selection.floorId}`:''}</h2>
            {floorCorrected&&<p role="status">{c.floorCorrected}</p>}
            {selection.kind==='map'&&selection.areaId&&<aside className="shared-area" aria-label={j.shared}><h3>{j.shared}</h3><ul>{site.destinations.filter(d=>d.locations.some(l=>l.floorId===selection.floorId&&l.areaIds.includes(selection.areaId!))).map(d=><li key={d.id}><a href={href({...selection,destinationId:d.id,areaId:undefined})} onClick={event=>navigate({...selection,destinationId:d.id,areaId:undefined},event)}>{d.name[selection.locale]}</a></li>)}</ul><a href={href({...selection,areaId:undefined})} onClick={event=>navigate({...selection,areaId:undefined},event)}>{j.close}</a></aside>}
            {routeResolved&&selection.kind==='map'&&<Directory detailsOnly site={site} selection={selection} navigate={navigate} detailRef={destinationContent} closeDetail={()=>{const next={...selection,destinationId:undefined};history.pushState({scrollY:window.scrollY},'',href(next));setSelection(next);requestAnimationFrame(()=>{const target=returnFocus.current?.isConnected?returnFocus.current:sections.current.map;target?.focus({preventScroll:true});});}}/>}
          </section>
          <section className="discovery-introduction" aria-labelledby="discovery-invitation">
            <h2 id="discovery-invitation">{j.exploreMore}</h2>
            <p>{j.discoveryInvitation}</p>
            <a className="discovery-entry" href={href(change('discovery'))} onClick={event=>navigate(change('discovery'),event)}>{j.enterDiscovery}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></a>
          </section>
          <section id="scene-discovery" ref={element=>{if(element)sections.current.discovery=element;}} tabIndex={-1} className="discovery-reading" aria-label={c.discovery}>
            <Discovery site={site} selection={selection} previewFloor={previewFloor} areaNumbers={areaNumbers} active={selection.kind==='discovery'} navigate={navigate} detailRef={destinationContent} closeDetail={closeDiscovery}/>
          </section>
        </div>
      </div>
    </main>
    <footer>{site.name} · {c.guide}</footer>
    </div>
    {load==='loading' && <div ref={overlay} className="loading-screen" role="dialog" aria-modal="true" aria-label={c.preparing} tabIndex={-1}><p className="eyebrow">{site.name}</p><h2>{c.preparing}</h2><p role="status">{phase==='decoding'?c.decoding:phase==='preparing'?c.gpu:phase==='fetching'?c.preparing:c.wait}</p></div>}
  </>;
}
