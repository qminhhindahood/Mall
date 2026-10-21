import { useEffect, useId, useState } from 'react';
import type { Destination } from '../data/content';
import type { SiteData } from '../data/site';
import type { Locale } from '../runtime/scene-contract';
import { destinationFloorGuidance, officialIndoorResource } from '../data/indoor-guidance';
import { selectionHref } from '../data/routes';
import '../styles/indoor-guidance.css';
import AreaDirections from './AreaDirections';
import {supportedNetwork} from '../data/area-routing';

const copy = {
  en: {
    title: 'Find this destination', current: 'Starting floor you selected', unknown: 'Choose starting floor',
    manual: 'Choose your starting floor using mall signs. This manual choice is kept for this tab when browser storage is available; update it if you move. Your position is not detected.',
    target: 'Selected destination floor', same: 'Your selected starting floor matches the selected destination floor.',
    different: 'The selected destination floor differs from your selected starting floor. Check mall signs for a connection to',
    unselected: 'Check your starting floor on mall signs, then compare it with the selected destination floor.',
    map: 'View destination map', floor: 'View destination floor',
    limitation: 'Walking routes are not available: corridors and floor connections have not been verified. Ask mall staff for directions or step-free access.',
    floorOnly: 'Only the floor is confirmed; an exact storefront is not marked.',
    officialPlan: 'Official mall floor plan', officialInfo: 'Official mall visitor information', newTab: 'opens in a new tab',
  },
  vi: {
    title: 'Tìm địa điểm này', current: 'Tầng bắt đầu đã chọn', unknown: 'Chọn tầng bắt đầu',
    manual: 'Chọn tầng bắt đầu theo biển chỉ dẫn. Lựa chọn thủ công này được giữ trong thẻ hiện tại khi bộ nhớ trình duyệt khả dụng; hãy cập nhật nếu bạn di chuyển. Vị trí của bạn không được tự động xác định.',
    target: 'Tầng đã chọn của địa điểm', same: 'Tầng bắt đầu đã chọn trùng với tầng đã chọn của địa điểm.',
    different: 'Tầng đã chọn của địa điểm khác với tầng bắt đầu đã chọn. Xem biển chỉ dẫn để tìm lối lên hoặc xuống tầng',
    unselected: 'Xem tầng bắt đầu trên biển chỉ dẫn, rồi đối chiếu với tầng đã chọn của địa điểm.',
    map: 'Xem địa điểm trên sơ đồ', floor: 'Xem tầng của địa điểm',
    limitation: 'Chưa có chỉ đường đi bộ: hành lang và lối kết nối giữa các tầng chưa được xác minh. Hãy hỏi nhân viên trung tâm về đường đi hoặc lối đi không có bậc thang.',
    floorOnly: 'Chỉ xác nhận được tầng; chưa đánh dấu vị trí cửa hàng chính xác.',
    officialPlan: 'Sơ đồ tầng chính thức của trung tâm', officialInfo: 'Thông tin khách tham quan chính thức của trung tâm', newTab: 'mở trong thẻ mới',
  },
};

/** Native disclosure works without JS; manual comparison appears after hydration. */
export default function IndoorGuidance({ site, destination, locale, floorId }: {
  site: SiteData; destination: Destination; locale: Locale; floorId: string;
}) {
  const c = copy[locale];
  const id = useId();
  const [interactive, setInteractive] = useState(false);
  const [currentFloor, setCurrentFloor] = useState('');
  const storageKey = `mall-guide:starting-floor:${site.mallId}`;
  const floorIds = site.geometry.floors.map(floor => floor.id);
  const floorIdsKey = floorIds.join('|');
  useEffect(() => {
    let saved = '';
    try {
      const value = sessionStorage.getItem(storageKey);
      if (value && floorIdsKey.split('|').includes(value)) saved = value;
      else if (value) sessionStorage.removeItem(storageKey);
    } catch { /* Storage can be unavailable; manual comparison still works. */ }
    setCurrentFloor(saved);
    setInteractive(true);
  }, [storageKey, floorIdsKey]);
  function selectStartingFloor(value: string) {
    const selected = floorIds.includes(value) ? value : '';
    setCurrentFloor(selected);
    try {
      if (selected) sessionStorage.setItem(storageKey, selected);
      else sessionStorage.removeItem(storageKey);
    } catch { /* Keep the manual choice for this mounted detail view. */ }
  }
  const guidance = destinationFloorGuidance(destination, floorId, currentFloor, site.geometry.floors.map(floor => floor.id));
  const network = supportedNetwork(site.mallId,destination,guidance.targetFloor);
  return <details className="indoor-guidance" data-indoor-guidance={destination.id} open={network ? true : undefined}>
    <summary>{network ? (locale==='vi'?'Chỉ đường đến khu vực này':'Directions to this area') : c.title}</summary>
    <p><strong>{c.target}: {guidance.targetFloor}</strong></p>
    {interactive && <div className="indoor-guidance-start">
      <label htmlFor={id}>{c.current}</label>
      <select id={id} value={currentFloor} onChange={event => selectStartingFloor(event.target.value)} aria-describedby={`${id}-help`}>
        <option value="">{c.unknown}</option>
        {site.geometry.floors.map(floor => <option key={floor.id} value={floor.id}>{floor.label}</option>)}
      </select>
      <p id={`${id}-help`}>{c.manual}</p>
    </div>}
    <p role="status" data-floor-relation={guidance.relation}>{guidance.relation === 'same-floor' ? c.same : guidance.relation === 'different-floor' ? `${c.different} ${guidance.targetFloor}.` : c.unselected}</p>
    {!guidance.mapped && <p>{c.floorOnly}</p>}
    <p><a href={selectionHref({locale, floorId: guidance.targetFloor, kind: 'map', destinationId: destination.id})}>{guidance.mapped ? c.map : c.floor}</a></p>
    {network ? (guidance.relation!=='different-floor' ? <AreaDirections key={`${site.mallId}:${destination.id}:${guidance.targetFloor}`} network={network} destinationId={destination.id} locale={locale}/> : <p className="indoor-guidance-limit">{locale==='vi'?'Tuyến đến khu vực chỉ có trên tầng đích. Chưa có tuyến kết nối giữa các tầng.':'The area route starts on the destination floor only. No cross-floor route is available.'}</p>) : <p className="indoor-guidance-limit">{c.limitation}</p>}
    <p><a data-indoor-official-link href={officialIndoorResource(site.mallId, locale)} target="_blank" rel="noopener noreferrer">{site.mallId === 'saigon-centre' ? c.officialPlan : c.officialInfo}<span className="visually-hidden"> — {c.newTab}</span></a></p>
  </details>;
}
