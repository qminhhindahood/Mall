import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { MouseEvent, RefObject } from 'react';
import type { SiteData } from '../data/site';
import type { Destination } from '../data/content';
import { normalize } from '../data/content';
import { selectionHref } from '../data/routes';
import { defaultDiscoveryCategory } from '../data/discovery';
import type { ExplorerSelection } from './Explorer';
import { journeyCopy } from './journey-copy';

export const discoveryCopy = {
  vi: {hide:'Ẩn danh mục',show:'Hiện danh mục',search:'Tìm trong toàn bộ danh mục',all:'Tất cả các tầng',only:'Chỉ tầng',places:'địa điểm',allScope:'tất cả các tầng',location:'Có vị trí trên sơ đồ',pending:'Đang đối chiếu vị trí',details:'Xem thông tin',empty:'Chưa tìm thấy địa điểm',clear:'Xóa tìm kiếm',intro:'Tìm nơi bạn muốn ghé, xem ngay trên bản đồ.',website:'Website thương hiệu',newTab:'mở trong thẻ mới',cuisine:'Ẩm thực',floor:'Tầng',unit:'Vị trí',soon:'Sắp mở cửa',research:'Bản xem riêng — chưa duyệt để xuất bản. Đã duyệt hình học r4; không dùng ảnh hoặc đánh dấu vị trí chưa rõ. Danh sách và nội dung VI/EN vẫn chờ duyệt.',association:'Vị trí theo sơ đồ nguồn; chưa xác nhận vị trí cửa hàng hiện tại.',number:'Số trên bản đồ khớp với số trong danh sách.',other:'Có kết quả ở tầng khác.',openOthers:'Xem các tầng khác'},
  en: {hide:'Hide categories',show:'Show categories',search:'Search the whole category',all:'All floors',only:'Only floor',places:'places',allScope:'all floors',location:'Located on the map',pending:'Precise location pending',details:'View details',empty:'No destinations found',clear:'Clear search',intro:'Find somewhere to visit and see it on the map.',website:'Brand website',newTab:'opens in a new tab',cuisine:'Cuisine',floor:'Floor',unit:'Location',soon:'Opening soon',research:'Private research preview — not approved for publication. R4 geometry accepted; unresolved photos and precise markers omitted. Roster and VI/EN copy await approval.',association:'Source-layout association; current store placement is not verified.',number:'Map numbers match the list.',other:'Matching destinations are on another floor.',openOthers:'Show other floors'},
};

type Props = {
  site: SiteData; selection: ExplorerSelection; previewFloor: string;
  areaNumbers: Record<string,number>; active: boolean;
  navigate: (next:ExplorerSelection,event?:MouseEvent<HTMLAnchorElement>)=>void;
  detailRef: RefObject<HTMLElement|null>; closeDetail:(restoreFocus?:boolean)=>void;
};
function DetailIcon({close=false}:{close?:boolean}) {
  return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">{close?<path d="m6 6 12 12M18 6 6 18"/>:<><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v1"/></>}</svg>;
}
export default function Discovery({site,selection,previewFloor,areaNumbers,active,navigate,detailRef,closeDetail}:Props) {
  const locale=selection.locale,c=discoveryCopy[locale],j=journeyCopy[locale];
  const [categoriesOpen,setCategoriesOpen]=useState(true);
  const [portal,setPortal]=useState<Element|null>(null);
  const [share,setShare]=useState('');
  const [cardStyle,setCardStyle]=useState<{left?:number;top?:number;width?:number}>({});
  const anchor=useRef<HTMLElement|null>(null);
  const category=site.content.categories.find(row=>row.id===(selection.discoveryCategoryId??defaultDiscoveryCategory(site)));
  const categoryRows=site.destinations.filter(row=>row.status==='open'&&row.categories.includes(category?.id??''));
  const matches=categoryRows.filter(row=>normalize([row.name.vi,row.name.en,...row.aliases].join(' ')).includes(normalize(selection.discoveryQuery??''))).sort((a,b)=>a.name[locale].localeCompare(b.name[locale],locale));
  const rows=selection.discoveryFloorId?matches.filter(row=>row.floors.includes(selection.discoveryFloorId!)):matches;
  const selected=active?site.destinations.find(row=>row.id===selection.destinationId):undefined;
  const area=active?site.content.areas.find(row=>row.id===selection.areaId):undefined;
  const shared=area?site.destinations.filter(row=>row.locations.some(location=>location.floorId===area.floorId&&location.areaIds.includes(area.id))):[];
  const visible=!!(selected||area);
  const base:ExplorerSelection={...selection,kind:'discovery',destinationId:undefined,areaId:undefined};
  useEffect(()=>setPortal(document.querySelector('.visitor-guide')),[]);
  useEffect(()=>{
    if(!visible)return;
    const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();closeDetail();}};
    const pointer=(event:PointerEvent)=>{const target=event.target;if(target instanceof Element&&!target.closest('.discovery-glass,[data-discovery-result],.map-transform,a[lang]'))closeDetail(false);};
    window.addEventListener('keydown',key);document.addEventListener('pointerdown',pointer);
    return()=>{window.removeEventListener('keydown',key);document.removeEventListener('pointerdown',pointer);};
  },[visible,closeDetail]);
  useLayoutEffect(()=>{
    if(!visible||!portal)return;
    const place=()=>{
      if(innerWidth<=700){setCardStyle({});return;}
      const list=document.querySelector('[data-discovery-results]');
      const rect=(anchor.current?.isConnected?anchor.current:list)?.getBoundingClientRect();
      if(!rect)return;
      const width=Math.min(450,list?.getBoundingClientRect().width??450);
      setCardStyle({width,left:Math.max(18,Math.min(innerWidth-width-18,rect.left)),top:Math.max(136,Math.min(rect.top,innerHeight-(detailRef.current?.offsetHeight??360)-18))});
    };
    place();window.addEventListener('resize',place);window.addEventListener('scroll',place,{passive:true});
    return()=>{window.removeEventListener('resize',place);window.removeEventListener('scroll',place);};
  },[visible,selected?.id,area?.id,portal,detailRef]);
  const select=(destination:Destination,floorId:string,event:MouseEvent<HTMLAnchorElement>)=>{
    anchor.current=event.currentTarget;setShare('');
    navigate({...selection,kind:'discovery',destinationId:destination.id,areaId:undefined,floorId},event);
  };
  const destinationLink=(destination:Destination,floorId:string)=>({...selection,kind:'discovery' as const,destinationId:destination.id,areaId:undefined,floorId});
  const number=(destination:Destination,floorId:string)=>floorId===previewFloor?destination.locations.find(location=>location.floorId===floorId)?.areaIds.map(id=>areaNumbers[id]).find(Boolean):undefined;
  const listing=(destination:Destination,floorId:string)=>{
    const location=destination.locations.find(row=>row.floorId===floorId);
    return <li key={`${floorId}:${destination.id}`}><a data-discovery-result data-destination-id={destination.id} href={selectionHref(destinationLink(destination,floorId))} aria-current={selected?.id===destination.id?'true':undefined} onClick={event=>select(destination,floorId,event)}>
      <span className="discovery-number" aria-hidden="true">{number(destination,floorId)??'·'}</span><span><strong>{destination.name[locale]}</strong><span className="discovery-type">{destination.cuisine?.[locale]??category?.name[locale]}{destination.openingSoon?` · ${c.soon}`:''}</span><span className="discovery-meta">{c.floor} {floorId} · {location?.areaIds.length?c.location:c.pending}</span></span><DetailIcon/>
    </a></li>;
  };
  return <>
    <div className="discovery-intro"><h2>{locale==='vi'?'Khám phá':'Discover'}</h2><p>{c.intro}</p></div>
    {site.content.approval==='pending'&&<p className="discovery-notice">{j.pending}</p>}
    {site.content.approval==='fixture'&&<p className="discovery-notice" role="note">{site.content.researchPreview?c.research:j.fixture}</p>}
    <div className="discovery-layout" data-categories-open={categoriesOpen} data-selected={visible}>
      <nav className="discovery-categories" aria-label={j.categories} onKeyDown={event=>{if(event.key==='Escape'&&categoriesOpen){event.preventDefault();setCategoriesOpen(false);event.currentTarget.querySelector<HTMLButtonElement>('[data-category-toggle]')?.focus();}}}>
        <div className="discovery-category-heading"><h3>{j.categories}</h3><button type="button" className="discovery-circle" data-category-toggle aria-label={categoriesOpen?c.hide:c.show} aria-expanded={categoriesOpen} aria-controls="discovery-category-list" onClick={()=>setCategoriesOpen(!categoriesOpen)}><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M8 6h12M8 12h12M8 18h12M3 6h.1M3 12h.1M3 18h.1"/></svg></button></div>
        <div id="discovery-category-list" hidden={!categoriesOpen}>{site.content.categories.map(row=>{const next={...base,discoveryCategoryId:row.id,discoveryFloorId:undefined,discoveryQuery:undefined};return <a key={row.id} href={selectionHref(next)} aria-current={category?.id===row.id?'true':undefined} onClick={event=>navigate(next,event)}><span>{row.name[locale]}</span><small>{site.destinations.filter(d=>d.status==='open'&&d.categories.includes(row.id)).length}</small></a>;})}</div>
      </nav>
      <div className="discovery-collection">
        <div className="discovery-collection-heading"><h3>{category?.name[locale]??j.categories}</h3><p>{categoryRows.length} {c.places}</p></div>
        <form className="discovery-search" onSubmit={event=>{event.preventDefault();const query=String(new FormData(event.currentTarget).get('collection-q')??'');navigate({...base,discoveryQuery:query||undefined});}}>
          <label htmlFor="discovery-search">{c.search}{category?` · ${category.name[locale]}`:''}</label><div><input id="discovery-search" name="collection-q" type="search" maxLength={160} key={selection.discoveryQuery??''} defaultValue={selection.discoveryQuery??''}/><button type="submit">{locale==='vi'?'Tìm':'Search'}</button></div>
        </form>
        <nav className="discovery-floors" aria-label={locale==='vi'?'Lọc danh mục theo tầng':'Filter collection by floor'}>{site.geometry.floors.filter(f=>categoryRows.some(row=>row.floors.includes(f.id))).map(f=>{const next={...base,discoveryFloorId:f.id};return <a key={f.id} href={selectionHref(next)} aria-current={selection.discoveryFloorId===f.id?'true':undefined} onClick={event=>navigate(next,event)}>{f.id} · {categoryRows.filter(row=>row.floors.includes(f.id)).length}</a>;})}</nav>
        <div className="discovery-scope"><p role="status">{rows.length} {c.places} · {selection.discoveryFloorId?`${c.floor} ${selection.discoveryFloorId}`:c.allScope}</p>{category&&<a href={selectionHref({...base,discoveryFloorId:selection.discoveryFloorId?undefined:previewFloor})} onClick={event=>navigate({...base,discoveryFloorId:selection.discoveryFloorId?undefined:previewFloor},event)}>{selection.discoveryFloorId?c.all:`${c.only} ${previewFloor}`}</a>}</div>
        <div data-discovery-results>{site.geometry.floors.filter(f=>!selection.discoveryFloorId||f.id===selection.discoveryFloorId).map(f=>{const onFloor=rows.filter(row=>row.floors.includes(f.id));return onFloor.length?<div key={f.id}><h4>{c.floor} {f.label}</h4><ul>{onFloor.map(row=>listing(row,f.id))}</ul></div>:null;})}</div>
        {!rows.length&&<div className="discovery-empty"><h4>{c.empty}</h4><p>{matches.length?c.other:j.empty}</p><a href={selectionHref({...base,discoveryFloorId:undefined,discoveryQuery:matches.length?selection.discoveryQuery:undefined})} onClick={event=>navigate({...base,discoveryFloorId:undefined,discoveryQuery:matches.length?selection.discoveryQuery:undefined},event)}>{matches.length?c.openOthers:c.clear}</a></div>}
      </div>
    </div>
    {portal&&visible&&createPortal(<article className="discovery-glass" ref={detailRef} style={cardStyle} tabIndex={-1} aria-labelledby="discovery-glass-title" aria-describedby="discovery-glass-description">
      <button className="discovery-circle discovery-close" data-close-discovery aria-label={j.close} onClick={()=>closeDetail()}><DetailIcon close/></button>
      <div className="discovery-glass-content"><h3 id="discovery-glass-title">{selected?.name[locale]??`${j.shared} · ${area?.name[locale]}`}</h3>
        {selected?<><p id="discovery-glass-description">{selected.description[locale]||j.descriptionPending}</p><dl><dt>{c.floor}</dt><dd>{selected.floors.join(', ')}</dd>{selected.cuisine&&<><dt>{c.cuisine}</dt><dd>{selected.cuisine[locale]}</dd></>}{selected.locations.find(row=>row.floorId===previewFloor)?.areaIds.length?<><dt>{c.unit}</dt><dd>{selected.locations.find(row=>row.floorId===previewFloor)?.areaIds.map(id=>site.content.areas.find(a=>a.id===id)?.name[locale]).filter(Boolean).join(', ')}</dd></>:null}</dl>
          <nav aria-label={locale==='vi'?'Tầng của địa điểm':'Destination floors'}>{selected.floors.length>1&&selected.floors.map(floorId=><a key={floorId} href={selectionHref(destinationLink(selected,floorId))} onClick={event=>select(selected,floorId,event)} aria-current={previewFloor===floorId?'true':undefined}>{floorId}</a>)}</nav>
          {selected.openingSoon&&<p>{c.soon}</p>}{selected.website&&<p><a href={selected.website} target="_blank" rel="noopener noreferrer">{c.website}<span className="visually-hidden"> · {c.newTab}</span></a></p>}
          <p className="discovery-location-note">{site.content.researchPreview?c.association:selected.locations.find(row=>row.floorId===previewFloor)?.areaIds.length?c.number:j.floorOnly}</p>
          <button onClick={async()=>{const url=new URL(selectionHref(selection),location.origin).href;try{await navigator.clipboard.writeText(url);setShare(j.copied);}catch{setShare(`${j.copyError} ${url}`);}}}>{j.share}</button><p role="status">{share}</p>
        </>:<><p id="discovery-glass-description">{j.shared}</p><ul>{shared.map(destination=><li key={destination.id}><a href={selectionHref(destinationLink(destination,area!.floorId))} onClick={event=>select(destination,area!.floorId,event)}>{destination.name[locale]}</a></li>)}</ul></>}
      </div>
    </article>,portal)}

  </>;
}
