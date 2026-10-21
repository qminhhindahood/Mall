import {useEffect,useRef,useState} from 'react';
import type {SiteData} from '../data/site';
import FloorMap from './FloorMap';
import {areaLabelPoint,discoveryAreaNumbers} from './discovery-map';
import {areaNetworks,areaPath,supportedNetwork} from '../data/area-routing';
import '../styles/journey-atlas.css';

type Place={id:string;name:string;floor:string;areaIds:string[];destinationId?:string;start?:string};
export default function JourneyAtlas({site}:{site:SiteData}){
 const network=areaNetworks.find(n=>n.mall===site.mallId)!;
 const shops:Place[]=site.destinations.filter(d=>d.status==='open').flatMap(d=>d.locations.map(l=>({id:d.id+'@'+l.floorId,name:d.name.en,floor:l.floorId,areaIds:l.areaIds,destinationId:d.id})));
 const landmarks:Place[]=network.starts.map(id=>({id:'landmark:'+id,name:site.mallId==='saigon-centre'?'Zone A lifts · public concourse':'Escalator beside B3-13 · public aisle',floor:network.floor,areaIds:[],start:id}));
 const defaults=shops.find(p=>p.destinationId===network.endpoints[1].destinationId)!;
 const discoveryUrl=`http://127.0.0.1:${site.mallId==='saigon-centre'?4461:4462}/en?view=discovery`;
 const [from,setFrom]=useState<Place>(landmarks[0]),[to,setTo]=useState<Place>(defaults),[floorId,setFloorId]=useState(network.floor),[zoom,setZoom]=useState(1),[mode,setMode]=useState('inside');
 const [editing,setEditing]=useState<'from'|'to'|null>(null),[query,setQuery]=useState(''),[area,setArea]=useState<string>(),[step,setStep]=useState(-1),[expanded,setExpanded]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null),search=useRef<HTMLInputElement>(null),lastFocus=useRef<HTMLElement|null>(null),scroll=useRef<HTMLDivElement>(null);
 const floor=site.geometry.floors.find(f=>f.id===floorId)!;
 const destination=site.destinations.find(d=>d.id===to.destinationId)!;
 const supported=destination&&supportedNetwork(site.mallId,destination,to.floor);
 const path=from.floor===to.floor&&supported&&from.start?areaPath(supported,to.destinationId!,from.start):null;
 const same=from.id===to.id,cross=from.floor!==to.floor;
 const reason=same?'You selected the same place. Choose a different destination.':cross?'The connection between these floors has not been verified. Preview each floor below; a walking route cannot start yet.':!from.start?'This shop is mapped, but a walking connection from its public frontage has not been verified. You can inspect both areas on the map.':'The destination has no reviewed walking path from this start. Its mapped area or confirmed floor remains available.';
 const numbers=discoveryAreaNumbers(site.content,'','',floor.id);
 const matches=(editing==='from'?[...landmarks,...shops.filter(p=>p.areaIds.length)]:shops).filter(p=>(p.name+' '+p.floor).toLocaleLowerCase().includes(query.toLocaleLowerCase()));
 const picked=area?shops.filter(p=>p.floor===floorId&&p.areaIds.includes(area)):[];
 const frame=floor.sources[0];
 const mapPoint=(x:number,y:number):[number,number]=>{const [a,b,c,d,e,f]=frame.transform;const sx=x*frame.width/network.size[0],sy=y*frame.height/network.size[1];return [a*sx+c*sy+e,b*sx+d*sy+f]};
 const routePoints=path&&floorId===network.floor?path.nodes.map(n=>mapPoint(n.x,n.y)):[];
 useEffect(()=>{const url=new URL(location.href),id=url.searchParams.get('to');const p=shops.find(p=>p.destinationId===id&&(!url.searchParams.get('floor')||p.floor===url.searchParams.get('floor')));if(p){setTo(p);setFloorId(p.floor)}},[]);
 useEffect(()=>{setZoom(1);scroll.current?.scrollTo(0,0)},[floorId]);
 function open(which:'from'|'to'){lastFocus.current=document.activeElement as HTMLElement;setEditing(which);setQuery('');dialog.current?.showModal();setTimeout(()=>search.current?.focus(),0)}
 function close(){dialog.current?.close();setEditing(null);lastFocus.current?.focus()}
 function choose(p:Place,which:'from'|'to'){which==='from'?setFrom(p):setTo(p);setFloorId(p.floor);setStep(-1);setArea(undefined);close()}
 function focusPlace(p:Place){setFloorId(p.floor);setArea(p.areaIds[0]);setZoom(1)}
 function routeAdvance(){if(!path)return;setExpanded(true);setFloorId(network.floor);setStep(s=>s>=path.edges.length?-1:s+1)}
 const selected=area??(to.floor===floorId?to.areaIds[0]:from.floor===floorId?from.areaIds[0]:undefined);
 const pointFor=(p:Place)=>{if(p.floor!==floorId)return;const a=site.content.areas.find(a=>p.areaIds.includes(a.id));return a&&areaLabelPoint(floor,a.regionIds)};
 const pin=(p:Place,label:string)=>{const point=pointFor(p);return point&&<g className={'atlas-pin '+label} pointerEvents="none"><circle cx={point[0]} cy={point[1]} r={1.4}/><text x={point[0]} y={point[1]}>{label}</text></g>};
 return <main className="atlas-app">
  <header className="atlas-header"><a href={discoveryUrl} className="atlas-brand">{site.mallId==='saigon-centre'?'SAIGON CENTRE':'VINCOM ĐỒNG KHỞI'}<span>JOURNEY ATLAS</span></a><div className="atlas-preview">Local design preview · real interactive maps</div><a className="atlas-back" href={discoveryUrl}>Back to Discovery ↗</a></header>
  <div className="atlas-heading"><div><p className="atlas-kicker">A familiar place. A clear next step.</p><h1>Your visit,<br className="desktop-only"/> all together.</h1></div><p>Choose a shop, explore its floor,<br/> and see what guidance is available.</p></div>
  <div className="atlas-layout">
   <section className="atlas-card glass" aria-label="Plan your journey">
    <div className="atlas-card-title"><span>YOUR JOURNEY</span><span>01 — 03</span></div>
    <div className="atlas-mode"><button aria-pressed={mode==='inside'} onClick={()=>setMode('inside')}>I’m inside</button><button aria-pressed={mode==='plan'} onClick={()=>setMode('plan')}>Plan a visit</button></div>
    <div className="atlas-places"><button className="atlas-place" onClick={()=>open('from')}><span className="place-marker">A</span><span><small>{mode==='plan'?'Planned starting point':'Start near a shop'}</small><strong>{from.name}</strong><em>{from.floor} · {from.start?'Reviewed public-area start':'Mapped shop area'}</em></span><span>⌕</span></button><button className="atlas-swap" aria-label="Swap origin and destination" disabled={!from.destinationId} onClick={()=>{setFrom(to);setTo(from);setStep(-1);setArea(undefined)}}>⇅</button><button className="atlas-place" onClick={()=>open('to')}><span className="place-marker end">B</span><span><small>Where to?</small><strong>{to.name}</strong><em>{to.floor} · {to.areaIds.length?'Mapped area':'Floor confirmed only'}</em></span><span>⌕</span></button></div>
    <div className="atlas-status" role="status"><span className={path?'status-dot ready':'status-dot'}/><strong>{path?'Reviewed same-floor area route':same?'Already the same place':cross?'Floor connection unavailable':'Walking route unavailable'}</strong></div>
    <div className="atlas-floor-legs"><button onClick={()=>focusPlace(from)}><small>START</small><b>{from.floor}</b><span>View start</span></button><span aria-hidden="true">{cross?'⇢':'→'}</span><button onClick={()=>focusPlace(to)}><small>DESTINATION</small><b>{to.floor}</b><span>View destination</span></button></div>
    <button className="atlas-primary" disabled={!path} onClick={routeAdvance}>{!path?'Route not available':step<0?'Show route steps →':step>=path.edges.length?'Finish & reset ✓':'Next step →'}</button>
    <button className="atlas-disclosure" onClick={()=>setExpanded(!expanded)} aria-expanded={expanded}>{expanded?'Hide':'Show'} journey details <span>{expanded?'−':'+'}</span></button>
    <div className={'atlas-details '+(expanded?'expanded':'')}>
     {path?<><p>Public-area guidance to the destination frontage. No exact doorway, live location, distance or arrival time is claimed.</p>{step>=0&&<div className="atlas-current-step"><small>MANUAL PROGRESS · {Math.min(step+1,path.edges.length)} / {path.edges.length}</small><strong>{step>=path.edges.length?'You marked the destination area reached.':path.edges[step].instruction.en}</strong></div>}<ol>{path.edges.map((e,i)=><li key={i}><button aria-current={step===i?'step':undefined} onClick={()=>{setStep(i);setFloorId(network.floor)}}>{e.instruction.en}</button></li>)}</ol></>:<p>{reason}</p>}
     {mode==='plan'&&<p>Choose a planned shop or reviewed public-area start. Entrance-to-shop routing is not yet verified.</p>}
     <p className="atlas-evidence">Coverage: {site.mallId==='saigon-centre'?'3 areas on L5':'3 areas on B3'} from one reviewed start. Other mapped shops remain selectable, but are not automatically routable. Cross-floor connector pairings remain unverified.</p>
    </div>
   </section>
   <section className="atlas-map-stage" aria-label="Interactive floor map">
    <div className="atlas-map-header"><div><small>EXPLORE THE FLOOR</small><h2>{floor.label}<span> / {site.mallId==='saigon-centre'?'Saigon Centre':'Vincom Đồng Khởi'}</span></h2></div><div className="atlas-map-controls glass"><button aria-label="Zoom out" disabled={zoom<=1} onClick={()=>setZoom(Math.max(1,zoom-.5))}>−</button><span>{Math.round(zoom*100)}%</span><button aria-label="Zoom in" disabled={zoom>=3} onClick={()=>setZoom(Math.min(3,zoom+.5))}>+</button><button aria-label="Reset map view" onClick={()=>{setZoom(1);scroll.current?.scrollTo(0,0)}}>↺</button></div></div>
    <nav className="atlas-floors" aria-label="Map floor">{site.geometry.floors.slice().reverse().map(f=><button key={f.id} aria-pressed={f.id===floorId} onClick={()=>{setFloorId(f.id);setArea(undefined)}}>{f.id}</button>)}</nav>
    <div className="atlas-map-scroll" ref={scroll}><div className="atlas-map-scale" style={{width:`${zoom*100}%`,height:`${zoom*100}%`}}><FloorMap floor={floor} title="Interactive mall map" content={site.content} locale="en" areaNumbers={numbers} selectedArea={selected} onArea={setArea}>
     {routePoints.length>0&&<g className="atlas-route" pointerEvents="none"><polyline className="route-border" points={routePoints.map(p=>p.join(',')).join(' ')}/><polyline className="route-line" points={routePoints.map(p=>p.join(',')).join(' ')}/>{routePoints.map((p,i)=><circle key={i} className={step===i?'current-node':''} cx={p[0]} cy={p[1]} r={.7}/> )}</g>}{pin(from,'A')}{pin(to,'B')}
    </FloorMap></div></div>
    <div className="atlas-map-caption"><span><i className="caption-key"/> Select a numbered area to choose a shop</span><span>{Object.keys(numbers).length} mapped areas · 2D</span></div>
    {picked.length>0&&<div className="atlas-area-selection glass"><button className="atlas-area-close" aria-label="Close selected area" onClick={()=>setArea(undefined)}>×</button><small>SELECTED MAP AREA · {floorId}</small>{picked.map(p=><div key={p.id}><strong>{p.name}</strong><div><button onClick={()=>choose(p,'from')}>Start here</button><button onClick={()=>choose(p,'to')}>Go here</button></div></div>)}</div>}
   </section>
  </div>
  <footer className="atlas-footer"><span>Interactive map & directory reused from the existing project.</span><span>No simulated paths. No live indoor positioning.</span></footer>
  <dialog ref={dialog} className="atlas-search-dialog" onCancel={()=>{setEditing(null);lastFocus.current?.focus()}}><div className="atlas-search-title"><h2>{editing==='from'?'Choose your start':'Choose your destination'}</h2><button aria-label="Close search" onClick={close}>×</button></div><p>{editing==='from'?'Search mapped shops or a reviewed public-area start.':'Search the mall directory. Unmapped destinations show their floor only.'}</p><input ref={search} aria-label="Search shops" placeholder="Shop name or floor…" value={query} onChange={e=>setQuery(e.target.value)}/><div className="atlas-search-results">{matches.length?matches.map(p=><button key={p.id} onClick={()=>choose(p,editing!)}><strong>{p.name}</strong><span>{p.floor} · {p.start?'Reviewed route start':p.areaIds.length?'Mapped area':'Floor only'}</span></button>):<p>No matching places. Try another name or floor.</p>}</div><small>{matches.length} places · mapped does not mean route verified</small></dialog>
 </main>
}
