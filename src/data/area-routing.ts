const saigonPlan = '/routing/saigon-L5.png';
const vincomPlan = '/routing/vincom-B3.webp';
import type { Bilingual, Destination } from './content';

type Node = { id: string; x: number; y: number; label: Bilingual };
type Edge = { from: string; to: string; instruction: Bilingual };
type Endpoint = { destinationId: string; areaId: string; node: string };
export type AreaNetwork = { mall: string; floor: string; image: string; size: [number,number]; view: string; starts: string[]; nodes: Node[]; edges: Edge[]; endpoints: Endpoint[]; source: string };
const label = (en:string,vi:string) => ({en,vi});
export const areaNetworks: AreaNetwork[] = [
  { mall:'saigon-centre',floor:'L5',image:saigonPlan,size:[1632,1522],view:'530 340 670 370',starts:['zone-a'],source:'saigon-centre-so-do-tang-L5-2026-10-01.png',
    nodes:[
      {id:'zone-a',x:875,y:645,label:label('Public concourse beside Zone A lifts','Lối đi chung cạnh thang máy Zone A')},
      {id:'west',x:805,y:625,label:label('Concourse below Dim Tu Tac','Lối đi phía dưới khu Dim Tu Tac trên sơ đồ')},
      {id:'dim',x:790,y:609,label:label('Dim Tu Tac area frontage','Phía trước khu Dim Tu Tac')},
      {id:'longjing',x:650,y:589,label:label('LONGJING area frontage','Phía trước khu LONGJING')},
      {id:'chang',x:1060,y:591,label:label('Chang Kang Kung area frontage','Phía trước khu Chang Kang Kung')},
    ],
    edges:[
      {from:'zone-a',to:'west',instruction:label('Follow the open concourse to the left on the plan, toward Dim Tu Tac.','Theo lối đi chung sang trái trên sơ đồ, về phía Dim Tu Tac.')},
      {from:'west',to:'dim',instruction:label('Approach the edge of the labelled Dim Tu Tac area. Stop in the public concourse.','Đến cạnh khu Dim Tu Tac được ghi tên. Dừng tại lối đi chung.')},
      {from:'west',to:'longjing',instruction:label('Continue left along the open concourse to the frontage below LONGJING on the plan.','Đi tiếp sang trái theo lối đi chung đến phía trước LONGJING, bên dưới khu này trên sơ đồ.')},
      {from:'zone-a',to:'chang',instruction:label('Follow the open concourse to the right on the plan, along the frontage of Chang Kang Kung.','Theo lối đi chung sang phải trên sơ đồ đến phía trước khu Chang Kang Kung.')},
    ],endpoints:[
      {destinationId:'saigon-prototype-dimtutac',areaId:'research-l5-l5-14',node:'dim'},
      {destinationId:'saigon-prototype-longjing',areaId:'research-l5-r4-l5-region-004',node:'longjing'},
      {destinationId:'saigon-prototype-changkangkung',areaId:'research-l5-l5-01',node:'chang'},
    ]},
  {mall:'vincom-dong-khoi',floor:'B3',image:vincomPlan,size:[1320,1077],view:'270 440 390 405',starts:['escalator'],source:'tang-b3.webp',
    nodes:[
      {id:'escalator',x:405,y:507,label:label('Public aisle to the right of the escalator beside B3-13 on the plan','Lối đi chung bên phải thang cuốn cạnh B3-13 trên sơ đồ')},
      {id:'siam',x:405,y:480,label:label('Siam Sugar area, B3-13 frontage','Phía trước khu Siam Sugar, B3-13')},
      {id:'aisle-beside-b3-11',x:405,y:545,label:label('Public aisle beside B3-11 frontage','Lối đi chung phía trước B3-11')},
      {id:'south',x:405,y:620,label:label('Aisle junction below B3-15B','Giao lối đi phía dưới B3-15B trên sơ đồ')},
      {id:'bottom',x:405,y:758,label:label('Aisle above B3-01','Lối đi phía trên B3-01 trên sơ đồ')},
      {id:'chang',x:430,y:758,label:label('Chang Kang Kung area, B3-01 frontage','Phía trước khu Chang Kang Kung, B3-01')},
      {id:'corner',x:510,y:758,label:label('Aisle beside B3-01','Lối đi cạnh B3-01')},
      {id:'turn',x:510,y:738,label:label('Aisle below B3-04','Lối đi phía dưới B3-04 trên sơ đồ')},
      {id:'chilli',x:570,y:738,label:label('Chilli Thai area, B3-01A frontage','Phía trước khu Chilli Thai, B3-01A')},
    ],edges:[
      {from:'escalator',to:'siam',instruction:label('Follow the aisle upward on the plan to the side of B3-13, the Siam Sugar area.','Theo lối đi lên phía trên sơ đồ đến cạnh B3-13, khu Siam Sugar.')},
      {from:'escalator',to:'aisle-beside-b3-11',instruction:label('Follow the public aisle downward on the plan to the frontage beside B3-11.','Theo lối đi chung xuống phía dưới sơ đồ đến phía trước B3-11.')},
      {from:'aisle-beside-b3-11',to:'south',instruction:label('Continue down the public aisle on the plan, passing B3-15A and B3-15B on the right side of the plan.','Đi tiếp xuống phía dưới theo lối đi chung trên sơ đồ, qua B3-15A và B3-15B ở phía bên phải sơ đồ.')},
      {from:'south',to:'bottom',instruction:label('Continue straight between B3-06 and B3-05 to the aisle above B3-01.','Đi thẳng giữa B3-06 và B3-05 đến lối đi phía trên B3-01 trên sơ đồ.')},
      {from:'bottom',to:'chang',instruction:label('Turn left as you walk (right on the plan) to the frontage of B3-01, Chang Kang Kung.','Rẽ trái theo hướng đang đi (sang phải trên sơ đồ) đến phía trước B3-01, Chang Kang Kung.')},
      {from:'bottom',to:'corner',instruction:label('Turn toward the right on the plan, following the aisle above B3-01.','Rẽ sang phải trên sơ đồ, theo lối đi phía trên B3-01.')},
      {from:'corner',to:'turn',instruction:label('Bend upward on the plan into the aisle below B3-04.','Rẽ lên phía trên sơ đồ vào lối đi phía dưới B3-04.')},
      {from:'turn',to:'chilli',instruction:label('Follow the aisle rightward on the plan to the frontage above B3-01A, Chilli Thai.','Theo lối đi sang phải trên sơ đồ đến phía trước B3-01A, Chilli Thai.')},
    ],endpoints:[
      {destinationId:'vincom-prototype-siamsugar',areaId:'research-b3-b3-13',node:'siam'},
      {destinationId:'vincom-prototype-changkangkung',areaId:'research-b3-b3-01',node:'chang'},
      {destinationId:'vincom-prototype-chillithai',areaId:'research-b3-b3-01a',node:'chilli'},
      // Inert until the separately reviewed association supplement is accepted.
      {destinationId:'vincom-prototype-highlandscoffee',areaId:'supplement-20261021-prototype-highlandscoffee',node:'aisle-beside-b3-11'},
    ]},
];

export function supportedNetwork(mall:string,destination:Destination,floor:string) {
  return areaNetworks.find(n=>n.mall===mall&&n.floor===floor&&destination.status==='open'&&n.endpoints.some(e=>e.destinationId===destination.id&&destination.locations.some(l=>l.floorId===floor&&l.certainty==='area-confirmed'&&l.areaIds.includes(e.areaId))));
}
// Directed, source-reviewed segments only. No geometric inference or distance weighting.
export function areaPath(network:AreaNetwork,destinationId:string,start:string) {
  if(!network.starts.includes(start))return null;
  const end=network.endpoints.find(e=>e.destinationId===destinationId)?.node;
  const queue:{id:string;edges:Edge[]}[]=[{id:start,edges:[]}];const seen=new Set<string>();
  while(queue.length){const item=queue.shift()!;if(seen.has(item.id))continue;seen.add(item.id);
    if(item.id===end)return {nodes:[network.nodes.find(n=>n.id===start)!,...item.edges.map(e=>network.nodes.find(n=>n.id===e.to)!)],edges:item.edges};
    for(const edge of network.edges.filter(e=>e.from===item.id))queue.push({id:edge.to,edges:[...item.edges,edge]});
  }return null;
}
