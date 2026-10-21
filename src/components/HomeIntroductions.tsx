import type { SiteData } from '../data/site';
import type { Locale } from '../runtime/scene-contract';
import { visitorHighlightIds } from '../data/visitor-highlights';
import { selectionHref } from '../data/routes';
import FloorMap from './FloorMap';

/** Introductions use real directory records and source geometry, never invented previews. */
export default function HomeIntroductions({site,locale}:{site:SiteData;locale:Locale}){
 const vi=locale==='vi';
 const picks=visitorHighlightIds[site.mallId].flatMap(id=>{const d=site.destinations.find(d=>d.id===id);return d?[d]:[]}).slice(0,3);
 const floor=site.geometry.floors.find(f=>f.id===site.defaultFloor)??site.geometry.floors[0];
 const discovery=`/${locale}/${vi?'kham-pha':'discovery'}`;
 return <div className="home-introductions" id="explore">
  <section className="home-discovery-intro">
   <div className="home-section-copy"><h2>{vi?'Một nơi, nhiều lựa chọn.':'A place for every plan.'}</h2><p>{vi?'Tìm một bàn ăn, thương hiệu yêu thích hay điểm dừng tiếp theo. Bắt đầu từ những gợi ý trong Khám phá.':'Find a table, a favourite brand or your next stop. Start with a few ideas in Discovery.'}</p><a className="section-link" href={discovery}>{vi?'Mở Khám phá':'Explore Discovery'}<Arrow/></a></div>
   <ul className="home-picks">{picks.map(d=><li key={d.id}><a href={selectionHref({locale,kind:'discovery',floorId:d.primaryFloor,destinationId:d.id})}><span>{site.content.categories.find(c=>d.categories.includes(c.id))?.name[locale]}</span><strong>{d.name[locale]}</strong><span>{vi?'Tầng':'Floor'} {d.floors.join(' · ')}<Arrow/></span></a></li>)}</ul>
  </section>
  <section className="home-directions-intro">
   <div className="home-map-preview" aria-label={vi?'Xem trước sơ đồ tầng':'Floor plan preview'}>{floor&&<FloorMap floor={floor} title={`${vi?'Tầng':'Floor'} ${floor.id}`}/>}<span>{vi?'Sơ đồ tầng':'Floor plan'} {floor?.id}</span></div>
   <div className="home-section-copy"><h2>{vi?'Biết nơi đến. Tìm lối đi.':'Your next stop, in view.'}</h2><p>{vi?'Chọn điểm bắt đầu và điểm đến. Xem sơ đồ tầng cùng hướng dẫn cho những kết nối đã được đối chiếu.':'Choose a starting place and destination. See the floor plan and walking guidance for reviewed connections.'}</p><a className="section-link" href={`/${locale}/${vi?'chi-duong':'directions'}`}>{vi?'Mở Chỉ đường':'Open Directions'}<Arrow/></a></div>
  </section>
 </div>;
}
export function Arrow(){return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>}
