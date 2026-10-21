import type { SiteData } from '../data/site';
import type { Destination } from '../data/content';
import type { Locale } from '../runtime/scene-contract';
import { destinationEnrichment, safeOfficialUrl } from '../data/enrichment';
import { selectionHref } from '../data/routes';
import { journeyCopy } from './journey-copy';
import '../styles/destination-details.css';

const labels = {
  vi: { floor:'Tầng', website:'Trang web', phone:'Điện thoại', hours:'Giờ mở cửa', directions:'Chỉ đường', map:'Xem sơ đồ', plan:'Chuẩn bị ghé thăm', newTab:'mở trong thẻ mới' },
  en: { floor:'Floor', website:'Website', phone:'Telephone', hours:'Opening hours', directions:'Directions', map:'View map', plan:'Plan your visit', newTab:'opens in a new tab' }
} as const;
const siteName=(url:string)=>{try{return new URL(url).hostname.replace(/^www\./,'');}catch{return url;}};
/** Identical essential information in Discovery, map details, and Astro/no-JS HTML. Only owner-accepted facts are shown. */
export default function DestinationDetails({site,destination,locale,floorId,descriptionId,returnTo}:{site:SiteData;destination:Destination;locale:Locale;floorId:string;descriptionId?:string;returnTo?:string}) {
  const c=labels[locale],j=journeyCopy[locale];
  const accepted=destinationEnrichment(site.mallId,destination).filter(item=>item.state==='verified-agent');
  const phone=accepted.find(item=>item.field==='phone');
  const hours=accepted.find(item=>item.field==='hours');
  const acceptedSite=accepted.find(item=>item.field==='website');
  const website=acceptedSite?.url??(destination.website&&safeOfficialUrl(destination.website)?destination.website:undefined);
  const description=destination.description[locale];
  const activeFloor=destination.floors.includes(floorId)?floorId:destination.primaryFloor;
  const back=returnTo??selectionHref({locale,floorId:activeFloor,kind:'discovery',destinationId:destination.id});
  const directionsUrl=`/${locale}/${locale==='vi'?'chi-duong':'directions'}?${new URLSearchParams({to:destination.id,floor:activeFloor,returnTo:back})}`;
  return <div className="destination-details" data-destination-details={destination.id}>
    <p className="detail-floor">{c.floor} {destination.floors.join(' · ')}</p>
    {destination.openingSoon&&<p className="detail-opening-soon">{j.openingSoon}</p>}
    {description&&<p className="detail-description" id={descriptionId}>{description}</p>}
    {(phone||website||hours)&&<ul className="detail-facts">
      {phone&&<li data-detail-field="phone"><span>{c.phone}</span><a href={`tel:${phone.value!.en.replace(/[ ()-]/g,'')}`}>{phone.value![locale]}</a></li>}
      {website&&<li data-detail-field="website"><span>{c.website}</span><a href={website} target="_blank" rel="noopener noreferrer">{siteName(website)}<span className="visually-hidden"> · {c.newTab}</span></a></li>}
      {hours&&<li data-detail-field="hours"><span>{c.hours}</span><span>{hours.value![locale]}</span></li>}
    </ul>}
    <nav className="detail-primary-actions" aria-label={c.plan}><a className="detail-directions" data-directions-handoff href={directionsUrl}>{c.directions} <span aria-hidden="true">↗</span></a><a href={selectionHref({locale,floorId:activeFloor,kind:'map',destinationId:destination.id})}>{c.map}</a></nav>
  </div>;
}
