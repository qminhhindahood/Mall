import { useState } from 'react';
import type { RefObject, MouseEvent } from 'react';
import type { SiteData } from '../data/site';
import { searchDirectory, normalize } from '../data/content';
import type { ExplorerSelection } from './Explorer';
import { selectionHref } from '../data/routes';
import { journeyCopy } from './journey-copy';
export type JourneySelection = ExplorerSelection;
export default function Directory({site,selection,navigate,detailRef,closeDetail}: {
  site:SiteData; selection:JourneySelection;
  navigate:(next:JourneySelection,event?:MouseEvent<HTMLAnchorElement>)=>void;
  detailRef:RefObject<HTMLElement|null>; closeDetail:()=>void;
}) {
  const c=journeyCopy[selection.locale];
  const [shareStatus,setShareStatus]=useState('');
  const [facilityQuery,setFacilityQuery]=useState('');
  const query=selection.query??'', categoryId=selection.categoryId??'';
  const {results,suggestions}=searchDirectory(site.destinations,site.content.categories,query,categoryId,selection.floorId);
  const selected=site.destinations.find(d=>d.id===selection.destinationId);
  const update=(query:string,categoryId:string)=>({...selection,kind:'map' as const,query,categoryId});
  const link=(d:typeof site.destinations[number],floorId=selection.floorId)=>({...selection,kind:'map' as const,destinationId:d.id,floorId:d.floors.includes(floorId)?floorId:d.primaryFloor,areaId:undefined});
  const groups=query||categoryId?site.geometry.floors.map(f=>f.id):[selection.floorId];
  const list=(rows:typeof results,floorId:string)=><ul className="directory-results">{rows.map(d=><li key={d.id}><a href={selectionHref(link(d,floorId))} onClick={event=>{setShareStatus('');navigate(link(d,floorId),event);}}><span>{d.name[selection.locale]}</span><span>{d.floors.join(' · ')}{d.status!=='open'?` · ${c[d.status]}`:''}</span></a></li>)}</ul>;
  return <div className="directory-panel">
    <h3>{c.directory}</h3>
    {site.content.approval==='fixture'&&<p className="fixture-notice" role="note">{c.fixture}</p>}
    {site.content.approval==='pending'&&<p>{c.pending}</p>}
    {site.content.reviewedAt&&<p>{c.reviewed}: <time>{site.content.reviewedAt}</time></p>}
    <form className="directory-search" onSubmit={event=>{event.preventDefault();const values=new FormData(event.currentTarget);const next=update(String(values.get('q')??''),String(values.get('category')??''));navigate(next);}}>
      <label>{c.search}<input key={query} type="search" name="q" defaultValue={query} maxLength={160}/></label>
      <label>{c.categories}<select key={categoryId} name="category" defaultValue={categoryId}><option value="">{c.allCategories}</option>{site.content.categories.map(cat=><option key={cat.id} value={cat.id}>{cat.name[selection.locale]}</option>)}</select></label>
      <button type="submit">{selection.locale==='vi'?'Tìm kiếm':'Search'}</button>
      {(query||categoryId)&&<a href={selectionHref(update('',''))} onClick={event=>navigate(update('',''),event)}>{c.clear}</a>}
    </form>
    <p role="status">{query||categoryId?c.allMall:`${c.onFloor} ${selection.floorId}`} · {results.length}</p>
    {!results.length&&<p>{c.empty}</p>}
    {groups.map(floorId=>{const rows=results.filter(d=>d.floors.includes(floorId));return rows.length?<div key={floorId}><h4>{floorId}</h4>{list(rows,floorId)}</div>:null;})}
    {suggestions.length>0&&<div><h4>{c.suggestions}</h4>{list(suggestions,selection.floorId)}</div>}
    {selected&&<article key={selected.id} ref={detailRef} tabIndex={-1} className="destination" aria-label={selected.name[selection.locale]}>
      <h3>{selected.name[selection.locale]}</h3><button onClick={()=>{setShareStatus('');closeDetail();}}>{c.close}</button>
      <p>{selected.description[selection.locale]||c.descriptionPending}</p><p>{c.status}: {c[selected.status]}</p>
      <nav className="floors" aria-label={selection.locale==='vi'?'Tầng của địa điểm':'Destination floors'}>{selected.floors.map(floorId=><a key={floorId} href={selectionHref(link(selected,floorId))} aria-current={floorId===selection.floorId?'page':undefined} onClick={event=>navigate(link(selected,floorId),event)}>{floorId}</a>)}</nav>
      <p>{selected.locations.find(l=>l.floorId===selection.floorId)?.certainty==='area-confirmed'?c.mapped:c.floorOnly}</p>
      <p>{c.recordReviewed}: <time>{selected.reviewedAt}</time></p><p>{c.source}: {selected.review.source}</p>
      <button onClick={async()=>{const url=new URL(selectionHref({...selection,query:undefined,categoryId:undefined,areaId:undefined}),location.origin).href;try{await navigator.clipboard.writeText(url);setShareStatus(c.copied);}catch{setShareStatus(`${c.copyError} ${url}`);}}}>{c.share}</button><p role="status" className="share-status">{shareStatus}</p>
    </article>}
    <details><summary>{c.facilities}</summary><label>{c.facilities}<input type="search" value={facilityQuery} onChange={event=>setFacilityQuery(event.target.value)} /></label>{site.content.facilities.filter(f=>(facilityQuery||f.floorId===selection.floorId)&&normalize(f.name[selection.locale]).includes(normalize(facilityQuery))).map(f=><p key={f.id}>{f.areaId?<a href={selectionHref({...selection,kind:'map',floorId:f.floorId,areaId:f.areaId,destinationId:undefined})} onClick={event=>navigate({...selection,kind:'map',floorId:f.floorId,areaId:f.areaId,destinationId:undefined},event)}>{f.name[selection.locale]}</a>:f.name[selection.locale]} · {f.floorId}{!f.areaId?` · ${c.floorOnly}`:''}</p>)}{!site.content.facilities.some(f=>f.floorId===selection.floorId)&&<p>{c.noFacilities}</p>}</details>
  </div>;
}
