import type { SiteData } from '../data/site';
import type { Destination } from '../data/content';
import type { Locale } from '../runtime/scene-contract';
import { destinationCuisine, destinationEnrichment, safeOfficialUrl } from '../data/enrichment';
import { selectionHref } from '../data/routes';
import { journeyCopy } from './journey-copy';
import IndoorGuidance from './IndoorGuidance';
import '../styles/destination-details.css';

const labels = {
  vi: { floor:'Tầng', category:'Danh mục', cuisine:'Ẩm thực', website:'Thông tin chính thức', phone:'Điện thoại', hours:'Giờ hoạt động', menu:'Thực đơn', catalog:'Danh mục sản phẩm', programme:'Lịch chiếu / vé chính thức', booking:'Thông tin đặt bàn', services:'Sản phẩm / dịch vụ', branch:'Chi nhánh tại trung tâm này', brand:'Toàn thương hiệu; xác nhận thông tin chi nhánh', proposal:'Thông tin bổ sung để duyệt — chưa được chủ dự án chấp thuận', checked:'Kiểm tra nguồn', source:'Nguồn', missing:'Chưa có điện thoại hoặc giờ hoạt động đã được duyệt. Xem nguồn chính thức trước khi ghé.', held:'Thông tin đang chờ đối chiếu nguồn', unavailable:'Không tìm thấy trong nguồn đã kiểm tra', reviewed:'Duyệt danh sách / giới thiệu', newTab:'mở trong thẻ mới' },
  en: { floor:'Floor', category:'Category', cuisine:'Cuisine', website:'Official information', phone:'Telephone', hours:'Opening hours', menu:'Menu', catalog:'Product catalog', programme:'Official programme / tickets', booking:'Booking information', services:'Products / services', branch:'This mall branch', brand:'Brand-wide; confirm branch information', proposal:'Additions for review — not owner approved', checked:'Source checked', source:'Source', missing:'Approved telephone and opening hours are not yet available. Check official information before visiting.', held:'Source evidence needs clarification', unavailable:'Not found in the checked source', reviewed:'Roster / introduction reviewed', newTab:'opens in a new tab' },
};
/** Identical essential information in Discovery, map details, and Astro/no-JS HTML. */
export default function DestinationDetails({site,destination,locale,floorId,descriptionId,returnTo}:{site:SiteData;destination:Destination;locale:Locale;floorId:string;descriptionId?:string;returnTo?:string}) {
  const c=labels[locale],j=journeyCopy[locale];
  const priority=['phone','hours','menu','booking','programme','catalog','services','website','cuisine'];
  const fields=[...destinationEnrichment(site.mallId,destination)].sort((a,b)=>priority.indexOf(a.field)-priority.indexOf(b.field));
  const cuisine=destinationCuisine(site.content,destination);
  const enrichedCuisine=fields.some(item=>item.field==='cuisine'&&(item.state==='verified-agent'||item.state==='newly-sourced-proposal'));
  const accepted=fields.some(item=>item.state==='verified-agent');
  const heading=accepted?(locale==='vi'?'Thông tin khách tham quan đã xác minh':'Verified visitor information'):c.proposal;
  const missingContact=!fields.some(item=>item.field==='phone'&&item.state==='verified-agent')||!fields.some(item=>item.field==='hours'&&item.state==='verified-agent');
  const location=destination.locations.find(l=>l.floorId===floorId);
  const mapped=location?.certainty==='area-confirmed';
  const website=!fields.some(item=>item.field==='website'&&item.state==='verified-agent')&&destination.website&&safeOfficialUrl(destination.website)?destination.website:undefined;
  const activeFloor=destination.floors.includes(floorId)?floorId:destination.primaryFloor;
  const back=returnTo??selectionHref({locale,floorId:activeFloor,kind:'discovery',destinationId:destination.id});
  const directionsUrl=`/${locale}/${locale==='vi'?'chi-duong':'directions'}?${new URLSearchParams({to:destination.id,floor:activeFloor,returnTo:back})}`;
  return <div className="destination-details" data-destination-details={destination.id}>
    <div className="detail-location-summary"><strong>{c.floor} {destination.floors.join(' · ')}</strong><p>{locale==='vi'?(mapped?'Khu vực trên sơ đồ · chưa xác định cửa vào chính xác':'Đã biết tầng · chưa định vị khu vực cửa hàng'):(mapped?'Mapped area · exact doorway not identified':'Floor known · store area not mapped')}</p></div>
    {location?.associationDetail&&<p className="detail-association-note" data-association-kind={location.associationDetail.kind}>{location.associationDetail.note[locale]}</p>}
    <nav className="detail-primary-actions" aria-label={locale==='vi'?'Chuẩn bị ghé thăm':'Plan your visit'}><a className="detail-directions" data-directions-handoff href={directionsUrl}>{locale==='vi'?'Chỉ đường':'Directions'} <span aria-hidden="true">↗</span></a><a href={selectionHref({locale,floorId:activeFloor,kind:'map',destinationId:destination.id})}>{locale==='vi'?'Xem sơ đồ':'View map'}</a></nav>
    <p className="detail-route-help">{locale==='vi'?'Tiếp theo, chọn nơi bắt đầu. Chỉ hiển thị đường đi cho các kết nối đã được đối chiếu.':'Choose your starting place next. Walking guidance is available only for reviewed connections.'}</p>
    {fields.length>0&&<section className="detail-proposals" aria-label={heading}><h4>{heading}</h4>{fields.map(item=><div className="detail-field" key={item.field} data-detail-field={item.field}>
      <strong>{c[item.field]}</strong>
      {(item.state==='newly-sourced-proposal'||item.state==='verified-agent')?<>
        <p>{item.url?<a href={item.url} target="_blank" rel="noopener noreferrer">{c[item.field]}<span className="visually-hidden"> · {c.newTab}</span></a>:item.field==='phone'?<a href={`tel:${item.value!.en.replace(/[ ()-]/g,'')}`}>{item.value![locale]}</a>:item.value![locale]}</p>
        <p>{item.applicability==='branch'?c.branch:c.brand}</p>
      </>:<p>{item.state==='unavailable-after-research'?c.unavailable:c.held}</p>}
      <details className="detail-source-disclosure"><summary>{c.source} · {item.checkedAt}</summary><p className="detail-provenance">{c.checked}: <time dateTime={item.checkedAt}>{item.checkedAt}</time> · <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">{c.source}<span className="visually-hidden"> · {c.newTab}</span></a></p><p className="detail-provenance">{item.uncertainty[locale]}</p></details>
    </div>)}</section>}
    <h4>{locale==='vi'?'Giới thiệu':'About this place'}</h4>
    <p id={descriptionId}>{destination.description[locale]||j.descriptionPending}</p>
    <dl><dt>{c.floor}</dt><dd>{destination.floors.join(', ')}</dd><dt>{c.category}</dt><dd>{site.content.categories.filter(row=>destination.categories.includes(row.id)).map(row=>row.name[locale]).join(' · ')}</dd>{cuisine&&!enrichedCuisine&&<><dt>{c.cuisine}</dt><dd>{cuisine[locale]}</dd></>}</dl>
    <p className="detail-location">{mapped?(site.content.researchPreview?j.researchMapped:j.mapped):j.floorOnly}</p>
    {destination.openingSoon&&<p>{j.openingSoon}</p>}
    <details className="detail-source-disclosure"><summary>{locale==='vi'?'Hướng dẫn theo tầng':'Floor guidance'}</summary><IndoorGuidance site={site} destination={destination} locale={locale} floorId={floorId}/></details>
    {website&&<p><a href={website} target="_blank" rel="noopener noreferrer">{c.website}<span className="visually-hidden"> · {c.newTab}</span></a></p>}
    <p><a href={selectionHref({locale,floorId:destination.floors.includes(floorId)?floorId:destination.primaryFloor,kind:'map',destinationId:destination.id})}>{locale==='vi'?(mapped?'Xem trên sơ đồ':'Xem tầng'):(mapped?'View on map':'View floor')}</a></p>
    {missingContact&&<p className="detail-missing">{locale==='vi'?'Một số thông tin liên hệ hoặc giờ hoạt động chưa được xác minh. Hãy kiểm tra nguồn chính thức trước khi ghé.':'Some contact or opening-hour information is not yet verified. Check the official source before visiting.'}</p>}
    {!site.content.researchPreview&&<p className="detail-provenance">{c.reviewed}: <time dateTime={destination.reviewedAt}>{destination.reviewedAt}</time></p>}
  </div>;
}
