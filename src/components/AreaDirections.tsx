import {useEffect,useId,useState} from 'react';
import {areaPath,type AreaNetwork} from '../data/area-routing';
import type {Locale} from '../runtime/scene-contract';

export default function AreaDirections({network,destinationId,locale}:{network:AreaNetwork;destinationId:string;locale:Locale}) {
 const id=useId(); const [start,setStart]=useState(''); const path=areaPath(network,destinationId,start);
 const [interactive,setInteractive]=useState(false);useEffect(()=>setInteractive(true),[]);
 const vi=locale==='vi';
 return <section className="area-directions" aria-labelledby={`${id}-title`}>
  <h3 id={`${id}-title`}>{vi?'Đường đi đến khu vực':'Directions to the area'} · {network.floor}</h3>
  <p>{vi?'Tuyến sơ đồ đến phía trước khu vực được ghi tên, không chỉ cửa vào chính xác. Chọn điểm bắt đầu khi bạn đã đứng tại đó; vị trí không được tự động xác định.':'A schematic route to the labelled area frontage, not an exact entrance. Select the starting landmark only when you are there; your position is not detected.'}</p>
  <noscript><p>{vi?'Bật JavaScript để chọn điểm bắt đầu và xem tuyến. Bạn vẫn có thể mở sơ đồ nguồn bên dưới.':'Enable JavaScript to select a start and display the route. The source plan below remains available.'}</p></noscript>
  {interactive&&<><label htmlFor={id}>{vi?'Điểm bắt đầu trên cùng tầng':'Starting landmark on this floor'}</label><select id={id} value={start} onChange={e=>setStart(e.target.value)}>
   <option value="">{vi?'Chọn điểm bắt đầu':'Choose a starting landmark'}</option>
   {network.starts.map(s=><option key={s} value={s}>{network.nodes.find(n=>n.id===s)!.label[locale]}</option>)}
  </select></>}
  {path&&<div role="status">
   <p><strong>{vi?'Bắt đầu':'Start'}: {path.nodes[0].label[locale]}</strong></p>
   <figure>
    <svg viewBox={network.view} role="img" aria-label={`${vi?'Tuyến sơ đồ đến':'Schematic route to'} ${path.nodes.at(-1)!.label[locale]}`}>
     <image href={network.image} width={network.size[0]} height={network.size[1]} />
     <polyline points={path.nodes.map(n=>`${n.x},${n.y}`).join(' ')} fill="none" stroke="white" strokeWidth="9" strokeLinejoin="round"/>
     <polyline points={path.nodes.map(n=>`${n.x},${n.y}`).join(' ')} fill="none" stroke="#833724" strokeWidth="4" strokeLinejoin="round"/>
     <circle cx={path.nodes[0].x} cy={path.nodes[0].y} r="7" fill="white" stroke="#833724" strokeWidth="3"/>
     <circle cx={path.nodes.at(-1)!.x} cy={path.nodes.at(-1)!.y} r="7" fill="#833724" stroke="white" strokeWidth="2"/>
    </svg>
    <figcaption>{vi?'Vòng tròn rỗng: điểm bắt đầu · Chấm đặc: phía trước khu vực':'Open circle: start · Filled circle: area frontage'}</figcaption>
   </figure>
   <ol>{path.edges.map((edge,i)=><li key={`${edge.from}-${edge.to}`}>{edge.instruction[locale]}{i===path.edges.length-1&&` ${vi?'Dừng ở lối đi chung; kiểm tra biển hiệu để tìm cửa vào.':'Stop in the public aisle; check signs for the entrance.'}`}</li>)}</ol>
   <p><strong>{vi?'Điểm đến':'Finish'}: {path.nodes.at(-1)!.label[locale]}</strong></p>
  </div>}
  <p className="indoor-guidance-limit">{vi?'Chỉ áp dụng cho tuyến cùng tầng này. Không có khoảng cách, thời gian hoặc xác nhận lối đi không bậc thang. Kiểm tra biển chỉ dẫn và hỏi nhân viên nếu lối đi thay đổi.':'Applies only to this same-floor path. No distance, time or step-free access is established. Check mall signs and ask staff if the aisle has changed.'}</p>
  <p><a href={network.image} target="_blank" rel="noopener noreferrer">{vi?'Mở toàn bộ sơ đồ nguồn (thẻ mới)':'Open full source plan (new tab)'}</a></p>
 </section>;
}
