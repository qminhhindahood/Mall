import { useEffect, useRef, useState } from 'react';
import type { SiteData, Destination } from '../data/site';
import type { Locale, SceneKind, SceneRuntime, FloorDataset } from '../runtime/scene-contract';
import { copy } from './copy';
import FloorMap from './FloorMap';

export type ExplorerSelection = { locale: Locale; floorId: string; kind: SceneKind; destinationId?: string };
function selectionFromUrl(url: URL, site: SiteData, fallback: ExplorerSelection): ExplorerSelection {
  const segments = url.pathname.split('/').filter(Boolean);
  const locale = segments[0] === 'en' ? 'en' : 'vi';
  const destination = segments[1] === 'stores' ? site.destinations.find(d => d.id === segments[2]) : undefined;
  const candidate = url.searchParams.get('floor') ?? (segments[1] === 'floors' ? segments[2] : destination?.primaryFloor) ?? site.defaultFloor;
  const floorId = site.geometry.floors.some(f => f.id === candidate) && (!destination || destination.floors.includes(candidate)) ? candidate : destination?.primaryFloor ?? site.defaultFloor;
  const view = url.searchParams.get('view');
  const kind = ['exterior','overview','map','discovery'].includes(view ?? '') ? view as SceneKind : segments[1] ? 'map' : fallback.kind;
  return { locale, floorId, kind, destinationId: destination?.id };
}
function href(selection: ExplorerSelection) {
  const path = selection.destinationId ? `/${selection.locale}/stores/${selection.destinationId}/` : selection.kind === 'map' ? `/${selection.locale}/floors/${selection.floorId}/` : `/${selection.locale}/`;
  const query = new URLSearchParams({ floor: selection.floorId, view: selection.kind });
  return `${path}?${query}`;
}

export default function Explorer({ site, initial }: { site: SiteData; initial: ExplorerSelection }) {
  const [selection,setSelection] = useState(initial);
  const [load,setLoad] = useState<'static'|'loading'|'ready'|'failed'>('static');
  const [phase,setPhase] = useState('');
  const [attempt,setAttempt] = useState(0);
  const [paused,setPaused] = useState(false);
  const [geometry,setGeometry] = useState(site.geometry);
  const canvas = useRef<HTMLCanvasElement>(null);
  const runtime = useRef<SceneRuntime|null>(null);
  const latest = useRef(selection);
  const content = useRef<HTMLElement>(null);
  const requestSerial = useRef(0);
  latest.current = selection;
  const c = copy[selection.locale];
  const floor = geometry.floors.find(f => f.id === selection.floorId)!;
  const destination: Destination|undefined = site.destinations.find(d => d.id === selection.destinationId);

  useEffect(() => {
    setSelection(selectionFromUrl(new URL(location.href), site, initial));
    const pop = () => setSelection(selectionFromUrl(new URL(location.href), site, initial));
    window.addEventListener('popstate',pop);
    return () => window.removeEventListener('popstate',pop);
  }, []);
  useEffect(() => {
    document.documentElement.lang = selection.locale;
    document.title = `${site.name} · ${copy[selection.locale].guide}`;
  }, [selection.locale]);
  useEffect(() => {
    let alive = true;
    setLoad('loading');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPaused(reducedMotion);
    const data = fetch(site.geometryUrl).then(async response => {
      if (!response.ok) throw new Error('Floor geometry unavailable');
      const result: FloorDataset = await response.json();
      if (alive) {
        setGeometry(result);
        document.querySelector<HTMLElement>('.static-guide')?.setAttribute('hidden','');
      }
      return result;
    });
    Promise.all([import('../runtime/create-scene-runtime'),data]).then(([{createSceneRuntime},geometry]) => createSceneRuntime({
      canvas: canvas.current!, mallId: site.mallId, data: geometry,
      assetRevision: site.assetRevision, exteriorUrl: site.exteriorUrl, reducedMotion,
      onStatus: status => { if (alive) setPhase(status.phase); },
    })).then(async instance => {
      if (!alive) { instance.dispose(); return; }
      runtime.current = instance;
      await Promise.all(['exterior','overview'].map(kind => instance.prepare({kind: kind as SceneKind, floorId: site.defaultFloor})));
      if (!alive) return;
      await instance.show(latest.current);
      if (alive) setLoad('ready');
    }).catch(() => { if (alive) setLoad('failed'); });
    const visibility = () => runtime.current?.setActive(!document.hidden);
    document.addEventListener('visibilitychange',visibility);
    return () => { alive=false; requestSerial.current++; runtime.current?.dispose(); runtime.current=null; document.removeEventListener('visibilitychange',visibility); };
  }, [attempt]);
  useEffect(() => {
    const instance = runtime.current;
    if (!instance) return;
    const serial = ++requestSerial.current;
    setLoad('loading');
    instance.show(selection).then(() => { if (serial === requestSerial.current) setLoad('ready'); }).catch(() => { if (serial === requestSerial.current) setLoad('failed'); });
  }, [selection.kind, selection.floorId]);
  function navigate(next: ExplorerSelection, event: React.MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    history.pushState(null,'',href(next));
    setSelection(next);
    // Locale switches preserve focus on the same language control. View changes go to the new content.
    if (next.locale === selection.locale) requestAnimationFrame(() => content.current?.focus({preventScroll:true}));
  }
  const change = (kind: SceneKind, floorId=selection.floorId): ExplorerSelection => ({...selection,kind,floorId,destinationId:undefined});
  return <>
    <div inert={load==='loading'}><header>
      <a className="wordmark" href={`/${selection.locale}/`} onClick={event => navigate({...initial,locale:selection.locale},event)}>{site.name}</a>
      <nav aria-label="Language"><a href={href({...selection,locale:selection.locale==='vi'?'en':'vi'})} lang={selection.locale==='vi'?'en':'vi'} onClick={event => navigate({...selection,locale:selection.locale==='vi'?'en':'vi'},event)}>{selection.locale==='vi'?'English':'Tiếng Việt'}</a></nav>
    </header>
    <main>
      <p className="eyebrow">{c.guide}</p><h1>{site.name}</h1>
      <nav className="views" aria-label={c.guide}>{(['exterior','overview','map','discovery'] as SceneKind[]).map(kind => <a key={kind} href={href(change(kind))} aria-current={selection.kind===kind?'page':undefined} onClick={event => navigate(change(kind),event)}>{c[kind]}</a>)}</nav>
      <a href="#shopping-levels">{c.skip}</a>
      {load==='failed' && <aside className="error" role="alert"><p>{c.error}</p><button onClick={() => setAttempt(attempt+1)}>{c.retry}</button></aside>}
      <section ref={content} tabIndex={-1} className="scene-section" aria-label={c[selection.kind]}>
        <h2>{c[selection.kind]} · {floor.label}</h2>
        <div className="scene-host" data-scene-kind={selection.kind} data-floor={floor.id}>
          <canvas ref={canvas} hidden={load!=='ready'} aria-label={`${c[selection.kind]} ${floor.label}`} />
          {load!=='ready' && (selection.kind==='exterior' ? <img src="/previews/exterior.webp" alt={`${site.name} · ${c.exterior}`} width="1200" height="1200" /> : floor.regions.length ? <FloorMap floor={floor} title={c.map} /> : floor.preview ? <img src={floor.preview.path} width={floor.preview.width} height={floor.preview.height} alt={`${c.preview} ${floor.label}`} /> : <FloorMap floor={floor} title={c.map} />)}
        </div>
        <button disabled={load!=='ready'} onClick={() => { runtime.current?.setPaused(!paused); setPaused(!paused); }}>{paused?c.resume:c.pause}</button>
        <p className="disclosure">{c.uncertainty}</p>
        {geometry.revision==='foundation-unavailable' && <p>{c.unavailableGeometry}</p>}
        {selection.kind==='discovery' && <p>{c.discoveryPending}</p>}
      </section>
      <section id="shopping-levels" aria-labelledby="levels-heading">
        <h2 id="levels-heading">{c.floors}</h2>
        <nav className="floors" aria-label={c.floors}>{site.geometry.floors.map(item => <a key={item.id} href={`/${selection.locale}/floors/${item.id}/`} aria-current={selection.floorId===item.id?'page':undefined} onClick={event => navigate(change('map',item.id),event)}>{item.label}</a>)}</nav>
        <h3>{c.heading} {floor.label}</h3>
        <FloorMap floor={floor} title={c.map} />
        {floor.preview && <details><summary>{c.preview}</summary><img src={floor.preview.path} width={floor.preview.width} height={floor.preview.height} alt={`${c.preview} ${floor.label}`} loading="lazy" /></details>}
        <p>{c.directory}</p>
        {destination && <article className="destination"><h2>{destination.name[selection.locale]}</h2><p>{destination.description[selection.locale]}</p><p>{c.heading} {destination.primaryFloor}</p></article>}
        {site.destinations.length>0 && <ul>{site.destinations.filter(d=>d.floors.includes(floor.id)).map(d=><li key={d.id}><a href={href({...selection,kind:'map',destinationId:d.id})} onClick={event=>navigate({...selection,kind:'map',destinationId:d.id},event)}>{d.name[selection.locale]}</a></li>)}</ul>}
      </section>
    </main>
    <footer>{site.name} · {c.guide}</footer>
    </div>
    {load==='loading' && <div className="loading-screen" role="dialog" aria-modal="true" aria-label={c.preparing} tabIndex={-1}><p className="eyebrow">{site.name}</p><h2>{c.preparing}</h2><p role="status">{phase==='fetching'?c.preparing:c.wait}</p></div>}
  </>;
}
