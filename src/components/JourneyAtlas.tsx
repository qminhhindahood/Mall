import {useEffect,useRef,useState} from 'react';
import type {SiteData} from '../data/site';
import FloorMap from './FloorMap';
import {publicEntrances} from '../data/public-entrances';
import {areaLabelPoint,discoveryAreaNumbers} from './discovery-map';
import {areaNetworks,areaPath,supportedNetwork} from '../data/area-routing';
import '../styles/journey-atlas.css';
import {planRoute} from '../data/plan-routes';
import {discoveryReturn,planInstructionVi,type AtlasLocale} from './atlas-handoff';

type Place={id:string;name:string;floor:string;areaIds:string[];destinationId?:string;start?:string;entranceId?:string;associationNote?:string;partial?:boolean};
export default function JourneyAtlas({site,locale='en',publicDirections=false}:{site:SiteData;locale?:AtlasLocale;publicDirections?:boolean}){
 const t=(en:string,vi:string)=>locale==='vi'?vi:en;
 const network=areaNetworks.find(n=>n.mall===site.mallId)!;
 const shops:Place[]=site.destinations.filter(d=>d.status==='open').flatMap(d=>d.locations.map(l=>({id:d.id+'@'+l.floorId,name:d.name[locale],floor:l.floorId,areaIds:l.areaIds,destinationId:d.id,associationNote:l.associationDetail?.note[locale],partial:l.associationDetail?.kind==='partial-source-layout'})));
 const landmarks:Place[]=network.starts.map(id=>({id:'landmark:'+id,name:site.mallId==='saigon-centre'?t('Zone A lifts · public concourse','Thang máy Zone A · lối đi chung'):t('Escalator beside B3-13 · public aisle','Thang cuốn cạnh B3-13 · lối đi chung'),floor:network.floor,areaIds:[],start:id}));
 const entrances:Place[]=site.geometry.floors.flatMap(f=>publicEntrances(f).map(e=>({id:e.id,name:e.name[locale],floor:e.floor,areaIds:[],entranceId:e.id})));
 const [entrance,setEntrance]=useState<string>();
 const defaults=shops.find(p=>p.destinationId===(site.mallId==='saigon-centre'?'saigon-prototype-mlb':network.endpoints[1].destinationId))??shops[0];
 const initialFrom=publicDirections?null:site.mallId==='saigon-centre'?shops.find(p=>p.destinationId==='saigon-prototype-calvinklein')??null:landmarks[0];
 const [discoveryUrl,setDiscoveryUrl]=useState(`/${locale}?view=discovery`);
 const [languageUrl,setLanguageUrl]=useState(locale==='en'?'/vi/chi-duong':'/en/directions');
 const [handoffError,setHandoffError]=useState('');
 const [handoffReady,setHandoffReady]=useState(false);
 const [from,setFrom]=useState<Place|null>(initialFrom),[to,setTo]=useState<Place>(defaults),[floorId,setFloorId]=useState(initialFrom?.floor??defaults.floor),[zoom,setZoom]=useState(1),[mode,setMode]=useState('inside');
 const [editing,setEditing]=useState<'from'|'to'|null>(null),[query,setQuery]=useState(''),[area,setArea]=useState<string>(),[step,setStep]=useState(-1),[expanded,setExpanded]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null),search=useRef<HTMLInputElement>(null),lastFocus=useRef<HTMLElement|null>(null),scroll=useRef<HTMLDivElement>(null);
 const floor=site.geometry.floors.find(f=>f.id===floorId)!;
 const destination=site.destinations.find(d=>d.id===to.destinationId)!;
 const supported=destination&&supportedNetwork(site.mallId,destination,to.floor);
 const legacyPath=from?.floor===to.floor&&supported&&from?.start?areaPath(supported,to.destinationId!,from.start):null;
 const proposedPlan=planRoute(site.mallId,from?.destinationId,to.destinationId);
 const plan=proposedPlan?.legs.every(l=>site.geometry.floors.find(f=>f.id===l.floor)?.sources.some(s=>s.sha256===l.hash))&&proposedPlan.legs.some(l=>l.floor===from?.floor)&&proposedPlan.legs.some(l=>l.floor===to.floor)?proposedPlan:null;
 const path=plan?{edges:plan.steps.map(s=>({instruction:{en:s.text,vi:planInstructionVi[s.text]??s.text}})),nodes:[]}:legacyPath;
 const same=from?.id===to.id,cross=!!from&&from.floor!==to.floor;
 const notedPlaces=[...(from?.associationNote?[from]:[]),...(to.associationNote?[to]:[])].filter((p,i,places)=>places.findIndex(other=>other.id===p.id)===i);
 const compactAssociation=(p:Place)=>p.partial?t('Only part of this shop is mapped; exact doorway unverified.','Chỉ một phần cửa hàng được thể hiện trên sơ đồ; chưa xác minh cửa ra vào chính xác.'):t('Approximate mapped area; exact doorway unverified.','Khu vực gần đúng; chưa xác minh cửa ra vào chính xác.');
 const reason=!from?t('Choose where you will start. Your location is not detected.','Chọn điểm bắt đầu. Ứng dụng không xác định vị trí của bạn.'):from.entranceId?t('Public entrance selected manually. Its walking connection to this destination has not been reviewed.','Đã tự chọn cửa vào công cộng. Kết nối đi bộ từ cửa này đến điểm đến chưa được kiểm tra.'):same?t('You selected the same place. Choose a different destination.','Bạn đã chọn cùng một địa điểm. Hãy chọn điểm đến khác.'):cross?t('The connection between these floors has not been verified. Preview each floor below; a walking route cannot start yet.','Kết nối giữa các tầng này chưa được xác minh. Bạn có thể xem từng tầng; chưa có lộ trình đi bộ.'):!from.start?t('This shop is mapped, but a walking connection from its public frontage has not been verified. You can inspect both areas on the map.','Cửa hàng đã được định vị theo khu vực, nhưng lối đi từ phía trước cửa hàng chưa được xác minh. Bạn có thể xem cả hai khu trên sơ đồ.'):t('The destination has no reviewed walking path from this start. Its mapped area or confirmed floor remains available.','Chưa có lộ trình được kiểm tra từ điểm bắt đầu này. Bạn vẫn có thể xem khu vực hoặc tầng đã xác nhận của điểm đến.');
 const numbers=discoveryAreaNumbers(site.content,'','',floor.id);
 const matches=(editing==='from'?[...entrances,...landmarks,...shops.filter(p=>p.areaIds.length)]:shops).filter(p=>(p.name+' '+p.floor).toLocaleLowerCase().includes(query.toLocaleLowerCase()));
 const pickedEntrance=entrances.find(p=>p.entranceId===entrance&&p.floor===floorId);
 const picked=area?shops.filter(p=>p.floor===floorId&&p.areaIds.includes(area)):[];
 const frame=floor.sources[0];
 const mapPoint=(x:number,y:number):[number,number]=>{const [a,b,c,d,e,f]=frame.transform;const sx=x*frame.width/network.size[0],sy=y*frame.height/network.size[1];return [a*sx+c*sy+e,b*sx+d*sy+f]};
 const planLeg=plan?.legs.find(l=>l.floor===floorId);
 const routePoints=planLeg?planLeg.points.map(([x,y])=>{const [a,b,c,d,e,f]=frame.transform;return [a*x+c*y+e,b*x+d*y+f]}):legacyPath&&floorId===network.floor?legacyPath.nodes.map(n=>mapPoint(n.x,n.y)):[];
 useEffect(()=>{const url=new URL(location.href),id=url.searchParams.get('to'),requestedFloor=url.searchParams.get('floor');
  const p=shops.find(p=>p.destinationId===id&&(!requestedFloor||p.floor===requestedFloor));
  if(p){setTo(p);setFloorId(p.floor)}else if(id){setHandoffError(t('This destination and floor could not be found. Choose a destination below.','Không tìm thấy điểm đến và tầng này. Hãy chọn điểm đến bên dưới.'))}
  if(publicDirections){
   const fromId=url.searchParams.get('from'),fromFloor=url.searchParams.get('fromFloor');
   const origin=[...entrances,...landmarks,...shops.filter(p=>p.areaIds.length)].find(p=>(p.id===fromId||p.destinationId===fromId)&&(!fromFloor||p.floor===fromFloor));
   if(origin)setFrom(origin);
   setDiscoveryUrl(discoveryReturn(url.searchParams.get('returnTo'),locale,url.origin));
   setHandoffReady(true);
  }
 },[]);
 useEffect(()=>{
  if(!publicDirections||!handoffReady)return;
  const params=new URLSearchParams(location.search);
  params.set('to',to.destinationId!);params.set('floor',to.floor);
  if(from){params.set('from',from.id);params.set('fromFloor',from.floor)}else{params.delete('from');params.delete('fromFloor')}
  const other=locale==='en'?'vi':'en';
  const back=new URL(discoveryUrl,location.origin);
  back.pathname=back.pathname.replace(/^\/(en|vi)/,`/${other}`).replace('/stores/','/cua-hang/');
  if(other==='en')back.pathname=back.pathname.replace('/cua-hang/','/stores/');
  params.set('returnTo',back.pathname+back.search+back.hash);
  setLanguageUrl((other==='vi'?'/vi/chi-duong':'/en/directions')+'?'+params);
 },[from,to,discoveryUrl,handoffReady,publicDirections,locale]);
 useEffect(()=>{setZoom(1);scroll.current?.scrollTo(0,0)},[floorId]);
 function optionCoverage(p:Place){const a=editing==='from'?p:from,b=editing==='to'?p:to;if(!a)return t('Choose a start to check route coverage','Chọn điểm bắt đầu để kiểm tra lộ trình');if(a.id===b.id)return t('Same place','Cùng địa điểm');if(planRoute(site.mallId,a.destinationId,b.destinationId))return t('Plan-based route available','Có lộ trình đối chiếu theo sơ đồ');const dest=site.destinations.find(d=>d.id===b.destinationId);const n=dest&&supportedNetwork(site.mallId,dest,b.floor);if(a.floor===b.floor&&a.start&&n&&areaPath(n,b.destinationId!,a.start))return t('Reviewed area route available','Có lộ trình theo khu vực đã kiểm tra');return t('Map only · walking connection not reviewed','Chỉ xem sơ đồ · lối đi chưa được kiểm tra')}
 function open(which:'from'|'to'){lastFocus.current=document.activeElement as HTMLElement;setEditing(which);setQuery('');dialog.current?.showModal();setTimeout(()=>search.current?.focus(),0)}
 function close(){dialog.current?.close();setEditing(null);lastFocus.current?.focus()}
 function choose(p:Place,which:'from'|'to'){which==='from'?setFrom(p):setTo(p);if(which==='to')setHandoffError('');setFloorId(p.floor);setStep(-1);setArea(undefined);setEntrance(undefined);close()}
 function focusPlace(p:Place){setFloorId(p.floor);setArea(p.areaIds[0]);setEntrance(p.entranceId);setZoom(1)}
 function routeAdvance(){if(!path)return;const next=step>=path.edges.length?-1:step+1;setStep(next);setFloorId(plan?plan.steps[Math.max(0,Math.min(next,plan.steps.length-1))].floor:network.floor)}
 const selected=area??(to.floor===floorId?to.areaIds[0]:from?.floor===floorId?from.areaIds[0]:undefined);
 const pointFor=(p:Place)=>{if(p.floor!==floorId)return;const a=site.content.areas.find(a=>p.areaIds.includes(a.id));return a&&areaLabelPoint(floor,a.regionIds)};
 const pin=(p:Place,label:string)=>{const point=pointFor(p);return point&&<g className={'atlas-pin '+label} pointerEvents="none"><circle cx={point[0]} cy={point[1]} r={1.4}/><text x={point[0]} y={point[1]}>{label}</text></g>};
 if(publicDirections&&!handoffReady)return <main className="atlas-app" aria-busy="true"><p role="status">{t('Preparing your destination…','Đang chuẩn bị điểm đến…')}</p><a href={`/${locale}?view=discovery`}>{t('Back to Discovery','Quay lại Khám phá')}</a></main>;
 return <main className="atlas-app">
  <header className="atlas-header"><a href={discoveryUrl} className="atlas-brand">{site.mallId==='saigon-centre'?'SAIGON CENTRE':'VINCOM ĐỒNG KHỞI'}<span>JOURNEY ATLAS</span></a><div className="atlas-preview">{t('Interactive floor maps · manually chosen start','Sơ đồ tầng tương tác · tự chọn điểm bắt đầu')}</div><a className="atlas-back" href={discoveryUrl}>{t('Back to Discovery ↗','Về Khám phá ↗')}</a>{publicDirections&&<a className="atlas-back" href={languageUrl} lang={locale==='en'?'vi':'en'}>{locale==='en'?'VI':'EN'}</a>}</header>
  <div className="atlas-heading"><div><p className="atlas-kicker">{t('A familiar place. A clear next step.','Điểm quen thuộc. Hành trình rõ ràng.')}</p><h1>{t('Plan your journey.','Lên kế hoạch di chuyển.')}</h1></div><p>{t('Choose a shop, explore its floor, and see what guidance is available.','Chọn cửa hàng, xem tầng và hướng dẫn hiện có.')}</p></div>
  {handoffError&&<p role="alert">{handoffError}</p>}
  <div className="atlas-layout">
   <section className="atlas-card glass" aria-label={t('Plan your journey','Lên kế hoạch di chuyển')}>
    <div className="atlas-card-title"><span>{t('YOUR JOURNEY','HÀNH TRÌNH')}</span><span>01 — 03</span></div>
    <div className="atlas-mode"><button aria-pressed={mode==='inside'} onClick={()=>setMode('inside')}>{t("I’m inside",'Tôi đang ở trong')}</button><button aria-pressed={mode==='plan'} onClick={()=>setMode('plan')}>{t('Plan a visit','Lên kế hoạch')}</button></div>
    <div className="atlas-places"><button className="atlas-place" onClick={()=>open('from')}><span className="place-marker">A</span><span><small>{mode==='plan'?t('Planned starting point','Điểm bắt đầu dự kiến'):t('From — choose a start','Từ — chọn điểm bắt đầu')}</small><strong>{from?.name??t('Choose your start','Chọn điểm bắt đầu')}</strong><em>{from?`${from?.floor??'—'} · ${from.entranceId?t('Public entrance · connection not reviewed','Cửa vào công cộng · kết nối chưa được kiểm tra'):from.start?t('Reviewed public-area start','Điểm bắt đầu chung đã kiểm tra'):t('Mapped shop area','Khu cửa hàng trên sơ đồ')}`:t('Choose manually · no live location','Tự chọn · không định vị trực tiếp')}</em></span><span>⌕</span></button><button className="atlas-swap" aria-label={t('Swap origin and destination','Đổi điểm đầu và điểm đến')} disabled={!from?.destinationId||!to.areaIds.length} onClick={()=>{if(!from||!to.areaIds.length)return;setFrom(to);setTo(from);setFloorId(to.floor);setStep(-1);setArea(undefined)}}>⇅</button><button className="atlas-place" onClick={()=>open('to')}><span className="place-marker end">B</span><span><small>{t('Where to?','Điểm đến?')}</small><strong>{to.name}</strong><em>{to.floor} · {to.areaIds.length?t('Mapped area','Khu trên sơ đồ'):t('Floor confirmed only','Chỉ xác nhận tầng')}</em></span><span>⌕</span></button></div>
    {notedPlaces.length>0&&<div className="atlas-association-notes">{notedPlaces.filter(p=>p.partial).map(p=><p key={p.id} data-association-kind="partial-source-layout"><strong>{p.name}: </strong>{t('Only part of this shop is mapped.','Chỉ một phần cửa hàng được thể hiện trên sơ đồ.')}</p>)}<p>{t('Approximate mapped areas; exact doorways unverified.','Các khu vực gần đúng; chưa xác minh cửa ra vào chính xác.')}</p></div>}
    <div className="atlas-status" role="status"><span className={path?'status-dot ready':'status-dot'}/><strong>{path?(plan?t('Plan-based cross-floor route','Lộ trình khác tầng theo sơ đồ'):t('Reviewed same-floor area route','Lộ trình cùng tầng đã kiểm tra')):!from?t('Choose your start','Chọn điểm bắt đầu'):from.entranceId?t('Entrance connection not reviewed','Kết nối từ cửa vào chưa được kiểm tra'):same?t('Already the same place','Cùng một địa điểm'):cross?t('Floor connection unavailable','Chưa có kết nối giữa các tầng'):t('Walking route unavailable','Chưa có lộ trình đi bộ')}</strong></div>
    <div className="atlas-floor-legs"><button disabled={!from} onClick={()=>from&&focusPlace(from)}><small>{t('START','BẮT ĐẦU')}</small><b>{from?.floor??'—'}</b><span>{t('View start','Xem điểm đầu')}</span></button><span aria-hidden="true">{cross?'⇢':'→'}</span><button onClick={()=>focusPlace(to)}><small>{t('DESTINATION','ĐIỂM ĐẾN')}</small><b>{to.floor}</b><span>{t('View destination','Xem điểm đến')}</span></button></div>
    <button className="atlas-primary" disabled={!path} onClick={routeAdvance}>{!path?(!from?t('Choose a start to see directions','Chọn điểm bắt đầu để xem chỉ đường'):t('Route not available','Chưa có lộ trình')):step<0?t('Show route steps →','Xem các bước →'):step>=path.edges.length?t('Finish & reset ✓','Kết thúc & đặt lại ✓'):plan?.steps[step]?.transferTo?t(`I’m on ${plan.steps[step].transferTo} →`,`Tôi đã đến ${plan.steps[step].transferTo} →`):t('Next step →','Bước tiếp theo →')}</button>
    {path&&step>=0&&<div className="atlas-current-step"><small>{t('MANUAL PROGRESS · ','TIẾN ĐỘ TỰ CHỌN · ')}{Math.min(step+1,path.edges.length)} / {path.edges.length}</small><strong>{step>=path.edges.length?t('You marked the destination area reached.','Bạn đã đánh dấu đến khu vực đích.'):path.edges[step].instruction[locale]}</strong></div>}
    <button className="atlas-disclosure" onClick={()=>setExpanded(!expanded)} aria-expanded={expanded}>{expanded?t('Hide journey details','Ẩn chi tiết'):t('Show journey details','Xem chi tiết')} <span>{expanded?'−':'+'}</span></button>
    <div className={'atlas-details '+(expanded?'expanded':'')}>
     {notedPlaces.map(p=><p key={p.id} className="atlas-association-note" data-association-kind={p.partial?'partial-source-layout':'source-layout'}><strong>{p.name}: </strong>{p.associationNote}</p>)}
     {path?<><p>{plan?t('Zone A is paired from the supplied L2/L3 plans. Confirm the destination floor at the lift; current operation is not verified.','Zone A được đối chiếu từ sơ đồ L2/L3. Kiểm tra tầng đến tại thang máy; hoạt động hiện tại chưa được xác minh.'):t('Public-area guidance to the destination frontage.','Hướng dẫn theo lối chung đến phía trước khu vực đích.')} {t('No exact doorway, live location, distance or arrival time is claimed.','Không xác định cửa chính xác, vị trí trực tiếp, khoảng cách hoặc thời gian đến.')}</p><ol>{path.edges.map((e,i)=><li key={i}><button aria-current={step===i?'step':undefined} onClick={()=>{setStep(i);setFloorId(plan?plan.steps[i].floor:network.floor)}}>{e.instruction[locale]}</button></li>)}</ol></>:<p>{reason}</p>}
     {mode==='plan'&&<p>{t('Choose a planned shop or reviewed public-area start. Entrance-to-shop routing is not yet verified.','Chọn cửa hàng dự kiến hoặc điểm bắt đầu chung đã kiểm tra. Lộ trình từ cửa vào đến cửa hàng chưa được xác minh.')}</p>}
     <p className="atlas-evidence">{t('Coverage: ','Phạm vi: ')}{site.mallId==='saigon-centre'?t('CALVIN KLEIN L2 ↔ MLB L3 via plan-paired Zone A, plus 3 areas on L5','CALVIN KLEIN L2 ↔ MLB L3 qua Zone A đối chiếu theo sơ đồ, và 3 khu tại L5'):t(`${network.endpoints.length} areas on B3`,`${network.endpoints.length} khu tại B3`)}{t(' from one reviewed start. Other mapped shops remain selectable, but are not automatically routable. Other floor connections remain unreviewed. Zone A L2/L3 has plan-based pairing only.',' từ một điểm bắt đầu đã kiểm tra. Các cửa hàng khác có thể chọn để xem sơ đồ, nhưng chưa có lộ trình tự động. Các kết nối tầng khác chưa được kiểm tra. Zone A L2/L3 chỉ được đối chiếu theo sơ đồ.')}</p>
    </div>
   </section>
   <section className="atlas-map-stage" aria-label={t('Interactive floor map','Sơ đồ tầng tương tác')}>
    <div className="atlas-map-header"><div><small>{t('EXPLORE THE FLOOR','KHÁM PHÁ TẦNG')}</small><h2>{floor.label}<span> / {site.mallId==='saigon-centre'?'Saigon Centre':'Vincom Đồng Khởi'}</span></h2></div><div className="atlas-map-controls glass"><button aria-label={t('Zoom out','Thu nhỏ')} disabled={zoom<=1} onClick={()=>setZoom(Math.max(1,zoom-.5))}>−</button><span>{Math.round(zoom*100)}%</span><button aria-label={t('Zoom in','Phóng to')} disabled={zoom>=3} onClick={()=>setZoom(Math.min(3,zoom+.5))}>+</button><button aria-label={t('Reset map view','Đặt lại sơ đồ')} onClick={()=>{setZoom(1);scroll.current?.scrollTo(0,0)}}>↺</button></div></div>
    <nav className="atlas-floors" aria-label={t('Map floor','Tầng trên sơ đồ')}>{site.geometry.floors.slice().reverse().map(f=><button key={f.id} aria-pressed={f.id===floorId} onClick={()=>{setFloorId(f.id);setArea(undefined);setEntrance(undefined)}}>{f.id}</button>)}</nav>
    <div className="atlas-map-scroll" ref={scroll}><div className="atlas-map-scale" style={{width:`${zoom*100}%`,height:`${zoom*100}%`}}><FloorMap floor={floor} title={t('Interactive mall map','Sơ đồ trung tâm tương tác')} content={site.content} locale={locale} areaNumbers={numbers} selectedArea={selected} onArea={id=>{setArea(id);setEntrance(undefined)}} selectedEntrance={entrance??(from?.floor===floorId?from.entranceId:undefined)} onEntrance={id=>{setEntrance(id);setArea(undefined)}}>
     {routePoints.length>0&&<g className="atlas-route" pointerEvents="none"><polyline className="route-border" points={routePoints.map(p=>p.join(',')).join(' ')}/><polyline className="route-line" points={routePoints.map(p=>p.join(',')).join(' ')}/>{routePoints.map((p,i)=><circle key={i} className={!plan&&step===i?'current-node':''} cx={p[0]} cy={p[1]} r={.7}/> )}</g>}{from&&pin(from,'A')}{pin(to,'B')}
    </FloorMap></div></div>
    <div className="atlas-map-caption"><span><i className="caption-key"/> {t('Select a numbered area to choose a shop','Chọn khu có số để chọn cửa hàng')}</span><span>{Object.keys(numbers).length} {t('mapped areas · 2D','khu trên sơ đồ · 2D')}</span></div>
    {publicEntrances(floor).length>0&&<p className="atlas-entrance-key">{t('E1, E3, E4: public entrances shown on the source plan. Select an entrance to start here; walking connections are not reviewed.','E1, E3, E4: cửa vào công cộng trên sơ đồ nguồn. Chọn cửa vào làm điểm bắt đầu; kết nối đi bộ chưa được kiểm tra.')}</p>}
    {pickedEntrance&&<div className="atlas-area-selection glass" data-entrance-popup><button className="atlas-area-close" aria-label={t('Close selected entrance','Đóng cửa vào đã chọn')} onClick={()=>setEntrance(undefined)}>×</button><small>{t('PUBLIC ENTRANCE · L1','CỬA VÀO CÔNG CỘNG · L1')}</small><div><strong>{pickedEntrance.name}</strong><p className="atlas-association-note">{t('Approximate source-plan marker. Walking connection not reviewed.','Ký hiệu gần đúng trên sơ đồ nguồn. Kết nối đi bộ chưa được kiểm tra.')}</p><div><button onClick={()=>choose(pickedEntrance,'from')}>{t('Start here','Bắt đầu tại đây')}</button></div></div></div>}
    {picked.length>0&&<div className="atlas-area-selection glass"><button className="atlas-area-close" aria-label={t('Close selected area','Đóng khu đã chọn')} onClick={()=>setArea(undefined)}>×</button><small>{t('SELECTED MAP AREA · ','KHU ĐÃ CHỌN · ')}{floorId}</small>{picked.map(p=><div key={p.id}><strong>{p.name}</strong>{p.associationNote&&<p className="atlas-association-note" data-association-kind={p.partial?'partial-source-layout':'source-layout'}>{compactAssociation(p)}</p>}<div><button onClick={()=>choose(p,'from')}>{t('Start here','Bắt đầu tại đây')}</button><button onClick={()=>choose(p,'to')}>{t('Go here','Đến đây')}</button></div></div>)}</div>}
   </section>
  </div>
  <footer className="atlas-footer"><span>{t('Interactive map & directory reused from the existing project.','Sơ đồ và danh bạ tương tác từ dữ liệu hiện có.')}</span><span>{t('No simulated paths. No live indoor positioning.','Không mô phỏng đường đi. Không định vị trong nhà trực tiếp.')}</span></footer>
  <dialog ref={dialog} className="atlas-search-dialog" onCancel={()=>{setEditing(null);lastFocus.current?.focus()}}><div className="atlas-search-title"><h2>{editing==='from'?t('Choose your start','Chọn điểm bắt đầu'):t('Choose your destination','Chọn điểm đến')}</h2><button aria-label={t('Close search','Đóng tìm kiếm')} onClick={close}>×</button></div><p>{editing==='from'?t('Search mapped shops, public entrances or a reviewed public-area start.','Tìm cửa hàng trên sơ đồ, cửa vào công cộng hoặc điểm bắt đầu chung đã kiểm tra.'):t('Search the mall directory. Unmapped destinations show their floor only.','Tìm trong danh bạ. Điểm chưa định vị chỉ hiển thị tầng.')}</p><input ref={search} aria-label={t('Search shops','Tìm cửa hàng')} placeholder="Shop name or floor…" value={query} onChange={e=>setQuery(e.target.value)}/><div className="atlas-search-results">{matches.length?matches.map(p=><button key={p.id} onClick={()=>choose(p,editing!)}><strong>{p.name}</strong><span>{p.floor} · {p.entranceId?t('Public entrance','Cửa vào công cộng'):p.start?t('Reviewed route start','Điểm bắt đầu đã kiểm tra'):p.areaIds.length?t('Mapped area','Khu trên sơ đồ'):t('Floor only','Chỉ có tầng')}{p.associationNote&&<em className="atlas-association-note" data-association-kind={p.partial?'partial-source-layout':'source-layout'}>{compactAssociation(p)}</em>}<em className="atlas-option-coverage">{optionCoverage(p)}</em></span></button>):<p>{t('No matching places. Try another name or floor.','Không tìm thấy. Thử tên hoặc tầng khác.')}</p>}</div><small>{matches.length} {t('places · mapped does not mean route verified','địa điểm · có trên sơ đồ không có nghĩa lộ trình đã xác minh')}</small></dialog>
 </main>
}

