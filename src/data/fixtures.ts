import type { DirectorySnapshot, Review, Destination } from './content';
import type { MallId, FloorDataset } from '../runtime/scene-contract';
export function createFixtures(mallId: MallId, geometry: FloorDataset): DirectorySnapshot {
  const review: Review={source:'Synthetic browser fixture; never current tenant evidence',reviewedAt:'2026-10-14',reviewedBy:'Browser fixture author',languages:{vi:true,en:true}};
  const location=(floorId:string,areaIds:string[]=[])=>({floorId,areaIds,certainty:areaIds.length?'area-confirmed' as const:'floor-confirmed' as const,source:review.source});
  const make=(id:string,vi:string,en:string,floors:string[],categories:string[],area=false):Destination=>({id,name:{vi,en},primaryFloor:floors[0],floors,categories,aliases:[],status:'open',locations:floors.map((f,i)=>location(f,area&&i===0?['shared-test-area']:[])),description:{vi:'',en:''},reviewedAt:review.reviewedAt,review,fixture:true});
  return {mallId,revision:'journey-browser-fixtures-r1',approval:'fixture',reviewedAt:review.reviewedAt,
    categories:[['cafes','Cà phê','Cafés'],['fashion','Thời trang','Fashion'],['empty','Bánh ngọt','Bakeries']].map(([id,vi,en])=>({id,name:{vi,en},review})),
    areas:[{id:'shared-test-area',floorId:'L1',regionIds:[geometry.floors.find(f=>f.id==='L1')!.regions[0].id],name:{vi:'Khu vực dùng chung thử nghiệm',en:'Test shared area'},review}],
    destinations:[make('loading-test-store','Cửa hàng thử nghiệm','Test-only store',['L1','L2'],['fashion'],true),make('test-cafe','Cà phê Đồng thử nghiệm','Dong test café',['L1'],['cafes'],true),make('test-coffee','Cà phê trên tầng hai thử nghiệm','Second-floor test café',['L2'],['cafes']),make('test-unknown','Cà phê chưa có vị trí chính xác thử nghiệm','Unmapped test café',['L2'],['cafes'])],
    facilities:[{id:'test-lift',name:{vi:'Thang máy thử nghiệm — chỉ xác minh tầng',en:'Test lift — floor confirmed only'},floorId:'L1',review}],
    highlights:[{destinationId:'test-coffee',categoryId:'cafes',floorId:'L2',review}]};
}
