import type {FloorGeometry} from '../runtime/scene-contract';

export type PublicEntrance={id:string;floor:'L1';name:{en:string;vi:string};pixel:[number,number];interior:[number,number];point:[number,number]};
const sourceHash='d7c4697eb9399e8d768586b01139295cf90c3607ba44e690a031c0aaf5eba89b';
// Accepted source-marker anchors, not surveyed doors or established graph connections.
// Review: entrance-network-review-2026-10-21/entrance-independent-review.md.
// Door 2 is deliberately withheld: exterior walking access through the taxi lane is unreviewed.
const markers=[
 {id:'saigon-entrance-door-1',name:{en:'Nam Kỳ Khởi Nghĩa entrance',vi:'Cửa vào Nam Kỳ Khởi Nghĩa'},pixel:[690,2760],interior:[800,2767]},
 {id:'saigon-entrance-door-3',name:{en:'Lê Lợi entrance',vi:'Cửa vào Lê Lợi'},pixel:[1615,1522],interior:[1740,1582]},
 {id:'saigon-entrance-door-4',name:{en:'Pasteur–Lê Lợi entrance',vi:'Cửa vào Pasteur–Lê Lợi'},pixel:[2640,644],interior:[2635,699]},
] as const;
export function publicEntrances(floor:FloorGeometry):PublicEntrance[]{
 const source=floor.id==='L1'&&floor.sources.find(s=>s.sha256===sourceHash&&s.width===4782&&s.height===5304);
 if(!source)return [];
 const [a,b,c,d,e,f]=source.transform;
 return markers.map(m=>({...m,floor:'L1',pixel:[...m.pixel],interior:[...m.interior],point:[a*m.pixel[0]+c*m.pixel[1]+e,b*m.pixel[0]+d*m.pixel[1]+f]}));
}
