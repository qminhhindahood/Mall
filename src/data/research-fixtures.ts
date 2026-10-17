import type { DirectorySnapshot, Destination, Review } from './content';
import type { FloorDataset, MallId } from '../runtime/scene-contract';

export type ResearchInput = {
  mallId: MallId;
  categories: {id:string;label:string}[];
  records: {id:string;name:string;floors:string[];categories:string[];description:string;cuisine?:string;website?:string;openingSoon?:boolean;locations:Record<string,{region:string;code:string}[]>}[];
};
const english: Record<string,string> = {
  'Thời trang':'Fashion','Ẩm thực':'Dining','Vui chơi giải trí':'Entertainment','Rạp chiếu phim':'Cinema','Mẹ & bé':'Parent & baby',
  'Nội thất, gia dụng & điện máy':'Home & appliances','Giày dép & túi xách':'Shoes & bags','Trang sức, đồng hồ & mắt kính':'Jewellery, watches & eyewear',
  'Mỹ phẩm & làm đẹp':'Beauty','Đồ dùng & quà tặng':'Gifts & essentials','Siêu thị':'Supermarket','Thể thao & wellness':'Sports & wellness',
  'Thương hiệu cao cấp':'Luxury brands','Mỹ phẩm':'Beauty','Trang sức & đồng hồ':'Jewellery & watches','Nhà sách':'Bookshop','Sức khỏe':'Health',
  'Điện tử':'Electronics','Thể thao':'Sports','Trang trí nội thất':'Home decor','Phong cách sống':'Lifestyle',
};
const cuisines: Record<string,string> = {Chinese:'Trung Hoa',Japanese:'Nhật Bản',Korean:'Hàn Quốc',Thai:'Thái Lan',Vietnamese:'Việt Nam',Italian:'Ý',Western:'Âu',International:'Quốc tế'};

// Fixture review is a software check, explicitly NOT editorial/current-occupancy approval.
// This importer is only called under the opt-in research fixture build gate.
export function createResearchFixtures(input: ResearchInput, mallId: MallId, geometry: FloorDataset): DirectorySnapshot {
  if (process.env.INCLUDE_TEST_FIXTURES !== 'research' || input.mallId !== mallId) throw new Error('Research preview must be explicitly enabled for its mall');
  const review: Review = {source:'Research preview — source-layout associations; not editorial or current-occupancy approval',reviewedAt:'2026-10-17',reviewedBy:'Software fixture import check',languages:{vi:true,en:true}};
  const areaMap = new Map<string,DirectorySnapshot['areas'][number]>();
  const destinations:Destination[] = input.records.map(row => {
    const locations = row.floors.map(floorId => {
      const areaIds = new Set<string>();
      for (const link of row.locations[floorId] ?? []) {
        if (!geometry.floors.find(f=>f.id===floorId)?.regions.some(r=>r.id===link.region)) throw new Error('Research association references unknown geometry');
        const id = `research-${floorId.toLowerCase()}-${link.code.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'')}`;
        let area=areaMap.get(id);
        if (!area) {area={id,floorId,regionIds:[],name:{vi:link.code,en:link.code},review};areaMap.set(id,area);}
        if (!area.regionIds.includes(link.region)) area.regionIds.push(link.region);
        areaIds.add(id);
      }
      return {floorId,areaIds:[...areaIds],certainty:areaIds.size?'area-confirmed' as const:'floor-confirmed' as const,source:review.source};
    });
    return {id:row.id,name:{vi:row.name,en:row.name},floors:row.floors,primaryFloor:row.floors[0],categories:row.categories,aliases:[],description:{vi:row.description,en:''},status:'open',locations,review,reviewedAt:review.reviewedAt,fixture:true,website:row.website,openingSoon:row.openingSoon,cuisine:row.cuisine?{vi:cuisines[row.cuisine]??row.cuisine,en:row.cuisine}:undefined};
  });
  return {mallId,revision:'discovery-research-preview-2026-10-17-r1',approval:'fixture',researchPreview:true,reviewedAt:review.reviewedAt,destinations,categories:input.categories.map(c=>({id:c.id,name:{vi:c.label,en:english[c.label]??c.label},review})),areas:[...areaMap.values()],facilities:[],highlights:[]};
}
