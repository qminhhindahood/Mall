import { useEffect, useRef, useState } from 'react';
import type { SiteData, Destination } from '../data/site';
import type { Locale, SceneKind, SceneRuntime, FloorDataset } from '../runtime/scene-contract';
import { copy } from './copy';
import FloorMap from './FloorMap';
import { floorRoute, selectionHref as href } from '../data/routes';
import { validateGeometry } from '../runtime/validate-geometry';
import { timing } from '../runtime/loading-timing';

export type ExplorerSelection = { locale: Locale; floorId: string; kind: SceneKind; destinationId?: string };
function selectionFromUrl(url: URL, site: SiteData, fallback: ExplorerSelection): ExplorerSelection {
  const segments = url.pathname.split('/').filter(Boolean);
  const locale = segments[0] === 'en' ? 'en' : 'vi';
  const destination = ['stores','cua-hang'].includes(segments[1]) ? site.destinations.find(d => d.id === segments[2]) : undefined;
  const candidate = url.searchParams.get('floor') ?? (['floors','tang'].includes(segments[1]) ? segments[2] : destination?.primaryFloor) ?? site.defaultFloor;
  const floorId = site.geometry.floors.some(f => f.id === candidate) && (!destination || destination.floors.includes(candidate)) ? candidate : destination?.primaryFloor ?? site.defaultFloor;
  const view = url.searchParams.get('view');
  const kind = ['exterior','overview','map','discovery'].includes(view ?? '') ? view as SceneKind : segments[1] ? 'map' : fallback.kind;
  return { locale, floorId, kind, destinationId: destination?.id };
}

export default function Explorer({ site, initial }: { site: SiteData; initial: ExplorerSelection }) {
  const [selection,setSelection] = useState(initial);
  const [load,setLoad] = useState<'static'|'loading'|'ready'|'failed'>('static');
  const [phase,setPhase] = useState('');
  const [attempt,setAttempt] = useState(0);
  const [paused,setPaused] = useState(false);
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
  const moduleFailed = useRef(false);
  latest.current = selection;
  const c = copy[selection.locale];
  const floor = geometry.floors.find(f => f.id === selection.floorId)!;
  const destination: Destination|undefined = site.destinations.find(d => d.id === selection.destinationId);

  useEffect(() => {
    const resolveRoute = () => {
      const url=new URL(location.href);
      const next=selectionFromUrl(url, site, initial);
      const invalid=!!next.destinationId && url.searchParams.has('floor') && url.searchParams.get('floor')!==next.floorId;
      setFloorCorrected(invalid);
      if(invalid){url.searchParams.set('floor',next.floorId);history.replaceState(null,'',url);}
      return next;
    };
    setSelection(resolveRoute());
    setRouteResolved(true);
    const pop = () => {
      const next=resolveRoute();
      beginRequest(next);
      focusRequest.current=next;
      setSelection(next);
    };
    window.addEventListener('popstate',pop);
    return () => window.removeEventListener('popstate',pop);
  }, []);
  useEffect(() => {
    document.documentElement.lang = selection.locale;
    document.title = `${site.name} · ${copy[selection.locale].guide}`;
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href',href(selection).split('?')[0]);
  }, [selection]);
  useEffect(() => {
    let alive = true;
    entered.current=false;
    moduleFailed.current=false;
    const controller = new AbortController();
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
      const response = await fetch(url,{signal:controller.signal});
      if (!response.ok) throw new Error('Floor geometry unavailable');
      const text = await response.text();
      done('ready');
      const decoded = timing('geometry-decode', detail);
      try { const result = validateGeometry(JSON.parse(text),site.geometry.floors.map(floor=>floor.id)); decoded(); return result; }
      catch (error) { decoded('failed'); throw error; }
      } catch (error) { done('failed'); throw error; }
    };
    const data = fetchGeometry(site.geometryUrl).catch(error=>{
      if (controller.signal.aborted||site.geometryUrl===site.geometryIdentityUrl) throw error;
      return fetchGeometry(site.geometryIdentityUrl);
    }).then(result=>{
      if (alive) {
        setGeometry(result);
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
      onStatus: status => { if (alive) {setPhase(status.phase);if(status.key==='context'&&status.phase==='failed'){entered.current=false;runtime.current?.dispose();runtime.current=null;setLoad('failed');}} },
    }); }).then(async instance => {
      if (!alive) { instance.dispose(); return; }
      runtime.current = instance;
      instance.setPaused(pausedRef.current);
      await Promise.all(['exterior','overview'].map(kind => instance.prepare({kind: kind as SceneKind, floorId: site.defaultFloor})));
      if (!alive) return;
      let requested;
      do {requested=latest.current;await instance.show(requested);if(!alive)return;} while(requested.kind!==latest.current.kind || requested.floorId!==latest.current.floorId);
      if (alive) {
        entered.current=true;
        document.querySelector<HTMLElement>('.static-guide')?.setAttribute('hidden','');
        setLoad('ready');
        pendingFocus.current=focusTarget(latest.current);focusRequest.current=latest.current;
        performance.mark('mall-loading:entry-ready');
        entryDone('ready', { ...latest.current, completeFrame: ownedCanvas.dataset.completeFrame });
        navigationDone?.('ready', { ...latest.current, completeFrame: ownedCanvas.dataset.completeFrame });
      }
    }).catch(() => { entryDone(alive ? 'failed' : 'cancelled'); navigationDone?.(alive ? 'failed' : 'cancelled'); if (alive) {controller.abort();runtime.current?.dispose();runtime.current=null;setLoad('failed');} });
    return () => { alive=false; entryDone('cancelled'); navigationDone?.('cancelled'); controller.abort(); requestSerial.current++; runtime.current?.dispose(); runtime.current=null; ownedCanvas.remove(); if(canvas.current===ownedCanvas) canvas.current=null; };
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
  useEffect(() => {
    const instance = runtime.current;
    if (!instance || !entered.current) return;
    const serial = ++requestSerial.current;
    const done = requestTiming.current ?? timing('request-to-frame', { mallId: site.mallId, attempt, ...selection });
    requestTiming.current=null;
    setLoad('loading');
    instance.show(selection).then(() => { done(serial === requestSerial.current ? 'ready' : 'stale'); if (serial === requestSerial.current) setLoad('ready'); }).catch(() => { done('failed'); if (serial === requestSerial.current) {entered.current=false;instance.dispose();runtime.current=null;setLoad('failed');} });
  }, [selection.kind, selection.floorId]);
  useEffect(()=>{
    const host=sceneHosts.current[selection.kind];if(!host)return;
    let visible=false;
    const update=()=>runtime.current?.setActive(visible&&!document.hidden&&load==='ready');
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();});
    observer.observe(host);document.addEventListener('visibilitychange',update);update();
    return()=>{observer.disconnect();document.removeEventListener('visibilitychange',update);};
  },[selection.kind,load]);
  useEffect(()=>{
    if(load!=='loading'||!overlay.current)return;
    const prior=document.activeElement instanceof HTMLElement?document.activeElement:null;
    const changed:Array<[HTMLElement,boolean]>=[];
    // Inert every sibling on the dialog's ancestor path, including SSR guide.
    let node:HTMLElement=overlay.current;
    while(node.parentElement){for(const sibling of node.parentElement.children)if(sibling!==node && sibling instanceof HTMLElement){changed.push([sibling,sibling.inert]);sibling.inert=true;}node=node.parentElement;if(node===document.body)break;}
    const overflow=document.body.style.overflow;document.body.style.overflow='hidden';overlay.current.focus({preventScroll:true});
    return()=>{for(const [element,value]of changed)element.inert=value;document.body.style.overflow=overflow;const requested=pendingFocus.current;const target=requested??prior;pendingFocus.current=null;if(target?.isConnected){target.focus({preventScroll:true});if(requested)target.scrollIntoView({behavior:'instant',block:'start'});}};
  },[load]);
  useEffect(()=>{
    if(load!=='ready' && load!=='failed')return;
    const requested=focusRequest.current;
    if(!requested)return;
    const floorKey=requested.kind==='exterior'||requested.kind==='overview'?'all':requested.floorId;
    if(load==='ready'&&!canvas.current?.dataset.sceneKey?.endsWith(`:${requested.kind}:${floorKey}`))return;
    const target=focusTarget(requested);
    if(target?.isConnected){target.focus({preventScroll:true});target.scrollIntoView({behavior:'instant',block:'start'});focusRequest.current=null;pendingFocus.current=null;}
  },[load,selection]);
  function focusTarget(next: ExplorerSelection) { return next.destinationId ? destinationContent.current : sections.current[next.kind] ?? null; }
  function beginRequest(next: ExplorerSelection) {
    if (!entered.current || next.kind===latest.current.kind && next.floorId===latest.current.floorId) return;
    requestTiming.current?.('stale');
    requestTiming.current=timing('request-to-frame',{mallId:site.mallId,attempt,...next});
  }
  function navigate(next: ExplorerSelection, event: React.MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setFloorCorrected(false);
    beginRequest(next);
    history.pushState(null,'',href(next));
    if (next.locale === selection.locale) {pendingFocus.current=focusTarget(next);focusRequest.current=next;}
    setSelection(next);
    // Locale switches preserve the language-control focus; content focus follows
    // the committed ready/error state, including already-prepared fast views.
  }
  const change = (kind: SceneKind, floorId=selection.floorId): ExplorerSelection => ({...selection,kind,floorId,destinationId:undefined});
  return <>
    <div><header>
      <a className="wordmark" href={`/${selection.locale}`} onClick={event => navigate({locale:selection.locale,kind:'exterior',floorId:site.defaultFloor},event)}>{site.name}</a>
      <nav aria-label="Language"><a href={href({...selection,locale:selection.locale==='vi'?'en':'vi'})} lang={selection.locale==='vi'?'en':'vi'} onClick={event => navigate({...selection,locale:selection.locale==='vi'?'en':'vi'},event)}>{selection.locale==='vi'?'English':'Tiếng Việt'}</a></nav>
    </header>
    <main>
      <p className="eyebrow">{c.guide}</p><h1>{site.name}</h1>
      <nav className="views" aria-label={c.guide}>{(['exterior','overview','map','discovery'] as SceneKind[]).map(kind => <a key={kind} href={`#scene-${kind}`} aria-current={selection.kind===kind?'page':undefined} onClick={event => navigate(change(kind),event)}>{c[kind]}</a>)}</nav>
      <a href="#shopping-levels">{c.skip}</a>
      {load==='failed' && <aside className="error" role="alert"><p>{c.error}</p><button onClick={() => {if(moduleFailed.current)location.assign(href(latest.current));else setAttempt(attempt+1);}}>{c.retry}</button></aside>}
      <div ref={parking} className="canvas-parking" />
      {(['exterior','overview','map','discovery'] as SceneKind[]).map(kind=><section key={kind} id={`scene-${kind}`} ref={element=>{if(element) sections.current[kind]=element;}} tabIndex={-1} className="scene-section" aria-label={c[kind]} data-active={selection.kind===kind}>
        <h2>{c[kind]}{routeResolved && (kind==='map'||kind==='discovery') ? ` · ${floor.label}` : ''}</h2>
        <div ref={element=>{if(element) sceneHosts.current[kind]=element;}} className="scene-host" data-scene-kind={kind} data-active={selection.kind===kind} data-floor={routeResolved?floor.id:undefined}>
          {kind==='exterior' ? <img src="/previews/exterior.webp" alt={`${site.name} · ${c.exterior}`} width="1200" height="1200" /> : kind==='overview' ? <div className="overview-stack">{site.geometry.floors.map(item=><a key={item.id} href={floorRoute(selection.locale,item.id)} onClick={event=>navigate(change('map',item.id),event)}>{c.heading} {item.label}</a>)}</div> : routeResolved && (floor.regions.length ? <FloorMap floor={floor} title={c.map} /> : floor.preview ? <img src={floor.preview.path} width={floor.preview.width} height={floor.preview.height} alt={`${c.preview} ${floor.label}`} loading="lazy" /> : <FloorMap floor={floor} title={c.map} />)}
        </div>
        {kind==='exterior' && <button disabled={load!=='ready'} onClick={() => { pausedRef.current=!paused;runtime.current?.setPaused(!paused); setPaused(!paused); }}>{paused?c.resume:c.pause}</button>}
        <p className="disclosure">{c.uncertainty}</p>
        {geometry.revision==='foundation-unavailable' && <p>{c.unavailableGeometry}</p>}
        {kind==='discovery' && <p>{c.discoveryPending}</p>}
      </section>)}
      <section id="shopping-levels" aria-labelledby="levels-heading">
        {floorCorrected && <p role="status">{c.floorCorrected}</p>}
        <h2 id="levels-heading">{c.floors}</h2>
        <nav className="floors" aria-label={c.floors}>{site.geometry.floors.map(item => <a key={item.id} href={floorRoute(selection.locale,item.id)} aria-current={routeResolved && selection.floorId===item.id?'page':undefined} onClick={event => navigate(change('map',item.id),event)}>{item.label}</a>)}</nav>
        {routeResolved && <><h3>{c.heading} {floor.label}</h3><FloorMap floor={floor} title={c.map} />
        {floor.preview && <details><summary>{c.preview}</summary><img src={floor.preview.path} width={floor.preview.width} height={floor.preview.height} alt={`${c.preview} ${floor.label}`} loading="lazy" /></details>}</>}
        <p>{c.directory}</p>
        {destination && <article ref={destinationContent} tabIndex={-1} className="destination"><h2>{destination.name[selection.locale]}</h2><p>{destination.description[selection.locale]}</p><p>{c.floors}: {destination.floors.join(', ')}</p></article>}
        {routeResolved && site.destinations.length>0 && <ul>{site.destinations.filter(d=>d.floors.includes(floor.id)).map(d=><li key={d.id}><a href={href({...selection,kind:'map',destinationId:d.id})} onClick={event=>navigate({...selection,kind:'map',destinationId:d.id},event)}>{d.name[selection.locale]}</a></li>)}</ul>}
      </section>
    </main>
    <footer>{site.name} · {c.guide}</footer>
    </div>
    {load==='loading' && <div ref={overlay} className="loading-screen" role="dialog" aria-modal="true" aria-label={c.preparing} tabIndex={-1}><p className="eyebrow">{site.name}</p><h2>{c.preparing}</h2><p role="status">{phase==='decoding'?c.decoding:phase==='preparing'?c.gpu:phase==='fetching'?c.preparing:c.wait}</p></div>}
  </>;
}
